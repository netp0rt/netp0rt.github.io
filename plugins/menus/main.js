/**
 * RTCMenu - 右键菜单插件精简版
 * @version 1.0.0-FF
 */

/* ====================== 工具类 ====================== */
class Tools {
    constructor() {
        // 初始化消息提示系统
        this._initToastSystem();
    }

    /* ---------- 消息提示系统 ---------- */
    _initToastSystem() {
        this._initToastStyles();
        this._createToastContainer();
        this.tst = {
            // 成功提示（多种调用方式）
            s: (m,d,c) => this.show(m,'success',c,d),
            suc: (m,d,c) => this.show(m,'success',c,d),
            success: (m,d,c) => this.show(m,'success',c,d),
            
            // 错误提示（多种调用方式）
            e: (m,c,d) => this.show(m,'error',c,d),
            err: (m,c,d) => this.show(m,'error',c,d),
            error: (m,c,d) => this.show(m,'error',c,d),
            
            // 警告提示（多种调用方式）
            w: (m,c,d) => this.show(m,'warn',c,d),
            warn: (m,c,d) => this.show(m,'warn',c,d),
            warning: (m,c,d) => this.show(m,'warn',c,d),
            
            // 信息提示（多种调用方式）
            i: (m,c,d) => this.show(m,'info',c,d),
            info: (m,c,d) => this.show(m,'info',c,d),
            
            // 原始方法
            _: this.show.bind(this)
        };
    }

    _initToastStyles() {
        if (document.getElementById('toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `.toast{min-width:120px;padding:15px 20px;border-radius:4px;color:white;box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateX(100%);opacity:0;transition:all 0.25s cubic-bezier(0.21,1.02,0.73,1)}.toast-success{background-color:#4CAF50}.toast-error{background-color:#F44336}.toast-warn{background-color:#FF9800}.toast-info{background-color:#2196F3}.toast-code{font-size:0.8em;opacity:0.8;margin-top:5px}`;
        document.head.appendChild(style);
    }

    _createToastContainer() {
        if (document.getElementById('toast-container')) return;
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:40%;word-break:break-all';
        document.body.appendChild(this.toastContainer);
    }

    show(message, type = 'info', code = '', duration = 2000) {
        if (!this.toastContainer) this._createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const autoDuration = message.length < 20 ? duration : message.length < 30 ? 3000 : message.length < 40 ? 4000 : 5000;
        toast.innerHTML = `<div class="toast-message">${message}</div>${code ? `<div class="toast-code">${code}</div>` : ''}`;
        
        this.toastContainer.appendChild(toast);
        setTimeout(() => (toast.style.transform = 'translateX(0)', toast.style.opacity = '1'), 10);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 250);
        }, autoDuration);
    }

    /* ---------- XML处理工具 ---------- */
    convertXmlToJson(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) throw new Error(`XML解析错误: ${parseError.textContent.trim()}`);
            
            try {
                return this.parseAsMenuConfig(xmlDoc.documentElement);
            } catch (e) {
                return this.parseGenericXml(xmlDoc.documentElement);
            }
        } catch (error) {
            console.error('XML转JSON失败:', error);
            throw error;
        }
    }

    parseAsMenuConfig(rootNode) {
        const result = {};
        if (rootNode.querySelector('opts')) result.opts = this.parseOptsNode(rootNode.querySelector('opts'));
        if (rootNode.querySelector('styles')) result.styles = rootNode.querySelector('styles').textContent.trim();
        if (rootNode.querySelector('menus')) result.menus = this.parseMenusNode(rootNode.querySelector('menus'));
        if (rootNode.querySelector('trigger')) result.trigger = this.parseTriggerNode(rootNode.querySelector('trigger'));
        return result;
    }

    parseOptsNode(optsNode) {
        const opts = {};
        Array.from(optsNode.children).forEach(child => {
            opts[child.nodeName] = child.nodeName === 'defaultSet' 
                ? child.textContent.trim().toLowerCase() === 'true'
                : child.textContent.trim();
        });
        return opts;
    }

    parseMenusNode(menusNode) {
        const menus = {};
        Array.from(menusNode.children).forEach(group => {
            const groupName = group.getAttribute('name');
            menus[groupName] = Array.from(group.children).map(item => this.parseMenuItem(item));
        });
        return menus;
    }

    parseMenuItem(menuItemNode) {
        const item = {};
        Array.from(menuItemNode.children).forEach(child => {
            const childName = child.nodeName;
            if (childName === 'exc') {
                item[childName] = Array.from(child.children).map(excItem => excItem.textContent.trim());
            } else if (childName === 'submenus') {
                item[childName] = Array.from(child.children).map(subItem => this.parseMenuItem(subItem));
            } else {
                item[childName] = child.textContent.trim();
            }
        });
        return item;
    }

    parseTriggerNode(triggerNode) {
        const trigger = {};
        Array.from(triggerNode.children).forEach(item => {
            const selector = item.getAttribute('selector');
            trigger[selector] = item.textContent.trim();
        });
        return trigger;
    }

    parseGenericXml(node) {
        if (node.nodeType === 3) {
            const text = node.textContent.trim();
            return text === '' ? null : text;
        }
        
        if (node.nodeType === 1) {
            const result = {};
            if (node.attributes && node.attributes.length > 0) {
                Array.from(node.attributes).forEach(attr => {
                    result[`@${attr.name}`] = attr.value;
                });
            }
            
            const childNodes = Array.from(node.childNodes).filter(n => 
                n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim() !== '')
            );
            
            if (childNodes.length === 0) return Object.keys(result).length > 0 ? result : null;
            if (childNodes.length === 1 && childNodes[0].nodeType === 3) {
                const text = childNodes[0].textContent.trim();
                return Object.keys(result).length > 0 ? { ...result, '#text': text } : text;
            }
            
            const childElements = childNodes.filter(n => n.nodeType === 1);
            const childGroups = this.groupBy(childElements, 'nodeName');
            
            Object.keys(childGroups).forEach(tagName => {
                const group = childGroups[tagName];
                result[tagName] = group.length === 1 
                    ? this.parseGenericXml(group[0]) 
                    : group.map(child => this.parseGenericXml(child));
            });
            
            return result;
        }
        return null;
    }

    groupBy(array, key) {
        return array.reduce((acc, obj) => {
            const property = typeof key === 'function' ? key(obj) : obj[key];
            acc[property] = acc[property] || [];
            acc[property].push(obj);
            return acc;
        }, {});
    }

    /* ---------- 路径处理工具 ---------- */
    resolvePath(baseRunpath, userPath) {
        baseRunpath = baseRunpath.replace(/\/+$/, '');
        if (!userPath) return baseRunpath + '/';

        if (userPath.startsWith('/')) return '/' + userPath.replace(/^\//, '');
        if (userPath.startsWith('../')) {
            const baseParts = baseRunpath.split('/').filter(Boolean);
            const userParts = userPath.split('/').filter(Boolean);
            const resolvedParts = [...baseParts];

            for (const part of userParts) {
                if (part === '..') {
                    if (resolvedParts.length > 0) resolvedParts.pop();
                } else {
                    resolvedParts.push(part);
                }
            }
            return '/' + resolvedParts.join('/');
        }
        const cleanUserPath = userPath.startsWith('./') ? userPath.slice(2) : userPath;
        return baseRunpath + (cleanUserPath ? '/' + cleanUserPath : '');
    }

    /* ---------- 图标处理工具 ---------- */
    resolveIconUrl(basePath, icon, defaultSetting) {
        if (icon === "&") return null;
        const fallback = { type: 'icon-url', value: `url('${basePath}empty.svg')` };
        if (!icon) return defaultSetting ? fallback : null;
        
        if (icon.startsWith('^http')) return { type: 'icon-url', value: `url('${icon.substring(1)}')` };
        if (icon.startsWith('#') && icon.length > 1) return { type: 'css-variable', value: icon.substring(1) };
        
        if (icon.startsWith('@')) {
            const [prefix, iconValue] = icon.split(':', 2);
            if (iconValue && iconValue.includes('fa-')) {
                let fontWeight = defaultSetting?.fontWeight || 'inherit';
                if (iconValue.includes('fa-solid')) fontWeight = '900';
                else if (iconValue.includes('fa-regular')) fontWeight = '400';
                else if (iconValue.includes('fa-light')) fontWeight = '300';
                else if (iconValue.includes('fa-thin')) fontWeight = '100';
                
                return { type: 'fa-class', value: iconValue, fontFamily: 'Font Awesome 6 Free', fontWeight };
            }
            
            const fontMap = {
                '@fa': 'Font Awesome 6 Free',
                '@fas': 'Font Awesome 6 Free',
                '@far': 'Font Awesome 6 Free',
                '@fab': 'Font Awesome 6 Brands',
                '@bi': 'Bootstrap Icons',
                '@mdi': 'Material Icons',
                '@ti': 'themify',
            };
            
            return {
                type: 'font-icon',
                value: iconValue || icon.substring(1),
                fontFamily: fontMap[prefix] || 'inherit',
                fontWeight: defaultSetting?.fontWeight || 'inherit'
            };
        }
        
        if (icon.startsWith('$')) {
            const path = icon.substring(1);
            return { type: 'icon-url', value: `url('${path.startsWith('/') ? path : '/' + path}')` };
        }
        
        if (icon.startsWith('./') || icon.startsWith('../') || !icon.startsWith('/')) {
            return { type: 'icon-url', value: `url('${basePath}${icon}')` };
        }
        
        return { type: 'icon-url', value: `url('${icon}')` };
    }
}

/* ====================== 主菜单类 ====================== */
class RTCMenu {
    constructor() {
        // 基础配置
        this.runpath = '/plugins/menus/';
        this.runconf = 'menu.json';

        // 菜单配置（自动读取并配置）
        this.defaultSetting = null;
        this.menus = new Map();
        this.trigger = new Map();
        this.isdev = false;
        
        // 状态管理
        this.activeSubmenu = null;
        this.lastActiveEditableElement = null;
        this.selectT = null;
        
        // 工具初始化
        this.tools = new Tools();
        this.tst = this.tools.tst;
        
        // 可执行脚本
        this.runScripts = Object.freeze({
            tools: this.tools,
            tst: this.tst,
            // 在这里绑定函数，例如 copy: this.copy.bind(this)
            debug: () => `可用方法:,${Object.keys(this.runScripts)}`
        });

        // 初始化菜单系统
        this.initMenuSystem();
    }

    /* ---------- 初始化系统 ---------- */
    initMenuSystem() {
        this.initMenu();
        this.setupSelectionListener();
        this.setupFocusListener();
    }

    setupFocusListener() {
        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (target.matches('input:not([readonly]), textarea:not([readonly]), [contenteditable="true"]')) {
                this.lastActiveEditableElement = target;
            }
        });
    }

    /* ---------- 选择文本处理 ---------- */
    select(t) { this.selectT = t; }

    setupSelectionListener() {
        let lastSelectionText = '', lastSelectionTime = 0, processingTimer = null;
        const THROTTLE_TIME = 300, DEBOUNCE_TIME = 200;
        
        document.addEventListener('selectionchange', () => {
            const now = Date.now();
            if (now - lastSelectionTime < THROTTLE_TIME) return;
            
            const selection = window.getSelection();
            const currentText = selection.toString().trim();
            if (!currentText || currentText === lastSelectionText) return;
            
            clearTimeout(processingTimer);
            processingTimer = setTimeout(() => {
                lastSelectionText = currentText;
                lastSelectionTime = Date.now();
                this.select(currentText);
                console.log('处理选中文本:', currentText);
            }, DEBOUNCE_TIME);
        });
    }

    /* ---------- 菜单初始化 ---------- */
    async initMenu() {
        try {
            const response = await fetch(this.runpath + this.runconf);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const contentType = response.headers.get('content-type') || '';
            const rawData = await response.text();
            let data = contentType.includes('xml') || rawData.trim().startsWith('<?xml') 
                ? this.tools.convertXmlToJson(rawData) 
                : JSON.parse(rawData);

            let opts = {
                name: data.opts?.name || 'Default Name',
                version: data.opts?.version || 'Default Version',
                readme: data.opts?.readme || '',
                description: data.opts?.description || 'Default Description',
                defaultSet: data.opts?.defaultSet,
                isdev: Boolean(data.opts?.isdev),
            };

            const resolvedPath = this.tools.resolvePath(this.runpath, data.opts?.rootOpt || '');
            this.tst.i(`解析路径: ${data.opts?.rootOpt} -> ${resolvedPath}`, 'PATH_RESOLVED');
            opts.rootOpt = resolvedPath.endsWith('/') ? resolvedPath : resolvedPath + '/';
            this.defaultSetting = opts.defaultSet;
            this.menus = data;
            this.menus.opts = opts;
            this.isdev = Boolean(opts.isdev);
            this.trigger = data.trigger || {};
            this.loadStyles(opts.rootOpt + data.styles);

            this.checkRequiredFiles(opts.rootOpt);
            this.renderMenu();
            this.setupContextMenu();
        } catch (error) {
            console.error('初始化失败:', error);
            this.tst.e(error, error.message || 'UNKNOWN_ERROR', 5000);
        }
    }

    async checkRequiredFiles(basePath) {
        const requiredFiles = ['empty.svg', 'featuredetector.js', 'main.js', 'menu.css'];
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            const fileUrl = `${basePath}${file}`;
            try {
                const fileResponse = await fetch(fileUrl, { method: 'HEAD' });
                if (!fileResponse.ok) missingFiles.push(file);
            } catch (error) {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            const errorMsg = `Menus配置文件错误：
[Error_MSG:Missing_File | 缺少以下必需文件]
${missingFiles.join(', ')}
如果你是网站管理员，请你检查${this.runconf}中opts.rootOpt是否配置正确。或者在this.runpath的路径里查看文件
如果不是网站所有者，请及时联系管理员。`;
            alert(errorMsg);
            this.tst.e(`Menus配置文件错误`, 'MENUS_READ_ERROR');
            console.error(errorMsg);
        }
    }

    /* ---------- 菜单渲染 ---------- */
    setupMenu(opt) {
        const menu = document.createElement('div');
        menu.id = 'rtc-menu';
        menu.innerHTML = `<ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul>`;
        menu.style.position = 'fixed';
        menu.style.display = 'none';
        document.body.appendChild(menu);
        console.log('===Menu setup complete===');
    }

    loadStyles(styles) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = styles;
        link.onerror = () => {
            this.tst.e(`样式加载失败: ${styles}`, 'STYLE_LOAD_ERROR');
            const style = document.createElement('style');
            style.textContent = `.rtc-menu{position:fixed;background:white;min-width:150px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}`;
            document.head.appendChild(style);
        };
        document.head.appendChild(link);
    }

    renderMenu() {
        if (!document.getElementById('rtc-menu')) this.setupMenu();
    }

    /* ---------- 菜单交互 ---------- */
    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const target = e.target;
            if (!target?.closest) return console.warn('无效的右键目标', target);

            let matchedSelector = null, matchedElement = null;
            for (const selector of Object.keys(this.trigger)) {
                const element = target.closest(selector);
                if (element) { matchedSelector = selector; matchedElement = element; break; }
            }

            if (!matchedElement) {
                if (this.menus.menus && this.menus.menus['#public']) {
                    const menucontext = this.generateMenuHtml(this.menus.menus['#public']);
                    this.showMenu(e, ['#public'], menucontext, target);
                    return;
                }
                this.tst.e('未找到#public公共菜单配置')
                return console.log('未找到#public菜单配置');
            }

            const menuType = this.trigger[matchedSelector];
            const menucontext = this.convertJsonToHtml([matchedSelector], menuType);
            this.showMenu(e, [matchedSelector], menucontext, matchedElement);
        });

        document.addEventListener('click', (e) => this.hideMenu());
    }

    convertJsonToHtml(selectors) {
        if (!Array.isArray(selectors) || selectors.length === 0) {
            return this.generateMenuHtml(this.menus.menus['#public']);
        }

        for (const selector of selectors) {
            for (const [cssSelector, menuKey] of Object.entries(this.menus.trigger)) {
                if (selector === cssSelector) {
                    const matchedMenu = this.menus.menus[menuKey];
                    if (matchedMenu) return this.generateMenuHtml(matchedMenu);
                }
            }
        }
        return this.generateMenuHtml(this.menus.menus['#public']);
    }

    generateMenuHtml(menuConfig) {
        if (!Array.isArray(menuConfig)) return '<div class="menu-error">菜单配置错误</div>';
        const basePath = this.menus?.opts?.rootOpt || this.runpath;
        
        const menuItems = menuConfig.map(item => {
            const hasSubmenu = !!item.submenus && item.submenus.length > 0;
            let submenu = '';
            
            if (hasSubmenu) {
                submenu = `
                <div class="rtc-submenu-container">
                    <ul class="rtc-submenu-items">${
                    item.submenus.map(sub => {
                        // 处理子菜单项的图标
                        let subAttributes = `data-id="${sub.id}" data-action="${sub.action}"`;
                        let subClasses = [];
                        let subStyles = [];
                        
                        // 处理子菜单图标
                        if (sub.icon === "&" || sub.icon === undefined) {
                            subClasses.push('rtc-icon-placeholder');
                            if (this.defaultSetting) {
                                subStyles.push(`--icon-url: url('${basePath}empty.svg')`);
                            }
                        } else {
                            const icon = this.tools.resolveIconUrl(basePath, sub.icon, this.defaultSetting);
                            let finalIcon = icon;
                            
                            // 如果启用了默认设置但返回的是默认图标，尝试不使用默认设置再次解析
                            if (this.defaultSetting && icon?.value?.includes('empty.svg')) {
                                const noDefaultIcon = this.tools.resolveIconUrl(basePath, sub.icon, false);
                                if (noDefaultIcon && !noDefaultIcon.value.includes('empty.svg')) {
                                    finalIcon = noDefaultIcon;
                                }
                            }
                            
                            if (finalIcon) {
                                if (finalIcon.type === 'fa-class') {
                                    subClasses.push(finalIcon.value);
                                    if (finalIcon.fontWeight !== 'inherit') {
                                        subStyles.push(`--fa-weight: ${finalIcon.fontWeight};`);
                                    }
                                } else if (finalIcon.type === 'css-variable') {
                                    subStyles.push(`--icon-url: var(${finalIcon.value});`);
                                } else {
                                    const style = finalIcon.type === 'import-url' 
                                        ? `--import-url: ${finalIcon.value};`
                                        : `--icon-url: ${finalIcon.value};`;
                                    subStyles.push(style);
                                }
                            } else {
                                subClasses.push('rtc-icon-placeholder');
                                if (this.defaultSetting) {
                                    subStyles.push(`--icon-url: url('${basePath}empty.svg')`);
                                }
                            }
                        }
                        
                        if (subClasses.length > 0) subAttributes += ` class="${subClasses.join(' ')}"`;
                        if (subStyles.length > 0) subAttributes += ` style="${subStyles.join(' ')}"`;
                        
                        return `<li ${subAttributes}><span class="menu-item-text">${sub.name}</span></li>`;
                    }).join('')
                }</ul>
                </div>`;
            }

            // 处理主菜单项的图标
            let attributes = `data-id="${item.id}" data-action="${item.action}"`;
            let itemClasses = [];
            let itemStyles = [];
            
            if (hasSubmenu) itemClasses.push('has-submenu');
            
            if (item.icon === "&" || item.icon === undefined) {
                itemClasses.push('rtc-icon-placeholder');
                if (this.defaultSetting) {
                    itemStyles.push(`--icon-url: url('${basePath}empty.svg')`);
                }
            } else {
                const icon = this.tools.resolveIconUrl(basePath, item.icon, this.defaultSetting);
                let finalIcon = icon;
                
                // 如果启用了默认设置但返回的是默认图标，尝试不使用默认设置再次解析
                if (this.defaultSetting && icon?.value?.includes('empty.svg')) {
                    const noDefaultIcon = this.tools.resolveIconUrl(basePath, item.icon, false);
                    if (noDefaultIcon && !noDefaultIcon.value.includes('empty.svg')) {
                        finalIcon = noDefaultIcon;
                    }
                }
                
                if (finalIcon) {
                    if (finalIcon.type === 'fa-class') {
                        itemClasses.push(finalIcon.value);
                        if (finalIcon.fontWeight !== 'inherit') {
                            itemStyles.push(`--fa-weight: ${finalIcon.fontWeight};`);
                        }
                    } else if (finalIcon.type === 'css-variable') {
                        itemStyles.push(`--icon-url: var(${finalIcon.value});`);
                    } else {
                        const style = finalIcon.type === 'import-url' 
                            ? `--import-url: ${finalIcon.value};`
                            : `--icon-url: ${finalIcon.value};`;
                        itemStyles.push(style);
                    }
                } else {
                    itemClasses.push('rtc-icon-placeholder');
                    if (this.defaultSetting) {
                        itemStyles.push(`--icon-url: url('${basePath}empty.svg')`);
                    }
                }
            }
            
            if (itemClasses.length > 0) attributes += ` class="${itemClasses.join(' ')}"`;
            if (itemStyles.length > 0) attributes += ` style="${itemStyles.join(' ')}"`;

            return `<li ${attributes}><span class="menu-item-text">${item.name}</span>${submenu}</li>`;
        }).join('');

        return `<div class="rtc-menu-container"><ul class="rtc-menu-list">${menuItems}</ul></div>`;
    }

    showMenu(e, selectors, menucontext, targetElement) {
        const menuEle = document.getElementById('rtc-menu');
        if (!menuEle) return this.setupMenu();
        
        menuEle.innerHTML = menucontext;
        this.initSubmenuEvents(menuEle);

        if (this.defaultSetting) {
            const icons = menuEle.querySelectorAll('[style*="--icon-url"]');
            icons.forEach(icon => {
                const iconUrlValue = icon.style.getPropertyValue('--icon-url').trim();
                if (iconUrlValue.startsWith('var(')) return;
                
                const img = new Image();
                img.src = iconUrlValue.replace(/^url\(["']?|["']?\)$/g, '');
                img.onerror = () => {
                    icon.style.setProperty('--icon-url', `url('${this.menus?.opts?.rootOpt || this.runpath}empty.svg')`);
                };
            });
        }

        menuEle.style.display = 'block';
        const menuWidth = menuEle.offsetWidth, menuHeight = menuEle.offsetHeight;
        let x = e.pageX, y = e.pageY;
        
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
        
        menuEle.style.left = `${x}px`;
        menuEle.style.top = `${y}px`;
        menuEle.dataset.triggerSelectors = selectors.join(',');
        menuEle.dataset.targetId = targetElement.id || Date.now();
    }

    hideMenu() {
        const menuEle = document.getElementById('rtc-menu');
        if (menuEle && menuEle.style.display === 'block') {
            menuEle.style.display = 'none';
        } else if (!menuEle) {
            console.error('菜单元素未找到，重新渲染菜单');
            this.setupMenu();
        }
    }

    initSubmenuEvents(menuEle) {
        const parentItems = menuEle.querySelectorAll('.has-submenu');
        const allMenuItems = menuEle.querySelectorAll('.rtc-menu-list li, .rtc-submenu-container li');
        let currentActiveSubmenu = null;
        
        allMenuItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const action = item.dataset.action, id = item.dataset.id;
                if (!action) return this.isdev && this.tst.e('Action为空', 'ACTION_EMPTY');
                
                try {
                    const isAsync = action.startsWith('*') || action.startsWith('await ');
                    const actionToEval = isAsync ? action.replace(/^(\*|await\s+)/, '').trim() : action;
                    const result = await (isAsync ? eval(actionToEval) : Promise.resolve(eval(actionToEval)));
                    
                    const logMessage = result?.runstat !== undefined 
                        ? `执行成功: ${result.runstat}` 
                        : `返回: ${typeof result === 'object' ? JSON.stringify(result) : result}`;
                    if (this.isdev) this.tst.i(logMessage, 'FUNC_RETURN');
                } catch (error) {
                    console.error('执行动作失败:', error);
                    if (this.isdev) this.tst.e(`执行失败: ${error.message}`, 'FUNC_ERROR');
                } finally {
                    this.hideMenu();
                }
            });
        });

        parentItems.forEach(item => {
            const submenu = item.querySelector('.rtc-submenu-container');
            if (submenu) {
                submenu.style.cssText = 'display:none;position:absolute;left:100%;top:0;min-width:150px;background:rgba(255,255,255,0.75);backdrop-filter: blur(10px);box-shadow:0 2px 10px rgba(0,0,0,0.1);z-index:1000;border-radius:4px;padding:5px 0';
            }
            
            item.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                if (currentActiveSubmenu && currentActiveSubmenu !== submenu) {
                    currentActiveSubmenu.style.display = 'none';
                }
                if (submenu) {
                    submenu.style.display = 'block';
                    currentActiveSubmenu = submenu;
                    this.adjustSubmenuPosition(item, submenu);
                }
            });
            
            if (submenu) {
                submenu.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    submenu.style.display = 'block';
                    currentActiveSubmenu = submenu;
                });
            }
        });
    }

    adjustSubmenuPosition(parentItem, submenu) {
        const parentRect = parentItem.getBoundingClientRect();
        const submenuRect = submenu.getBoundingClientRect();
        
        if (parentRect.right + submenuRect.width > window.innerWidth) {
            submenu.style.left = 'auto';
            submenu.style.right = '100%';
        } else {
            submenu.style.left = '100%';
            submenu.style.right = 'auto';
        }
        
        if (parentRect.bottom + submenuRect.height > window.innerHeight) {
            submenu.style.top = 'auto';
            submenu.style.bottom = '0';
        } else {
            submenu.style.top = '0';
            submenu.style.bottom = 'auto';
        }
    }

    /* ---------- 菜单动作 ---------- */
}

/* ====================== 初始化 ====================== */
document.addEventListener('DOMContentLoaded', () => {
    console.group('Compatibility Check');
    const compatResult = ft.test({ mode: 'j', impact: true, minver: 8 });
    console.log('Max Supported Version:', compatResult.maxVer);
    console.log('Feature Support:', compatResult.impact);
    console.groupEnd();

    if (!compatResult.isPass) {
        console.group('Compatibility Error');
        console.error('当前浏览器不支持所需功能');
        console.log('建议升级到支持ES2020+的浏览器');
        console.groupEnd();
        return;
    }

    new RTCMenu();
});
