document.addEventListener('DOMContentLoaded', async function() {
    // 常量定义
    const CACHE_EXPIRY = 3600000; // 1小时缓存有效期(ms)
    
    // DOM元素获取
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const contentMain = document.getElementById('content-main');
    const prevDocBtns = document.querySelectorAll('.prev-doc');
    const nextDocBtns = document.querySelectorAll('.next-doc'); 
    
    // 内容缓存对象
    const contentCache = {};

    // 页面导航状态（核心：用数组管理页面）
    const pageNavigation = {
        pages: [], // 格式: [{ xmlFile: 'xxx.xml', element: DOM元素, pageNum: 1 }, ...]
        currentIndex: -1 // 当前页面在数组中的索引
    };

    // 加载侧边栏
    const sidebarHtml = await fetchXml('sidebar.xml');
    sidebar.innerHTML = sidebarHtml;

    // 初始化页面导航数组（首次加载侧边栏后执行）
    initPageNavigationArray();

    // 侧边栏切换逻辑
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
    
    // 菜单项点击折叠/展开
    document.querySelectorAll('.menu-item > div:first-child').forEach(menuHeader => {
        menuHeader.addEventListener('click', function(e) {
            if (e.target === this || this.contains(e.target)) {
                const menuItem = this.parentElement;
                const hasSubmenu = menuItem.querySelector('.submenu');
                
                if (hasSubmenu) {
                    menuItem.classList.toggle('close');
                }
            }
        });
    });

    // 子菜单点击事件处理函数
    function handleSubmenuClick(e) {
        e.stopPropagation();
        
        // 更新选中状态
        document.querySelectorAll('.submenu div[data-xml]').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        this.classList.add('active');
        
        // 获取当前页面的xml文件路径
        let xmlFile = this.getAttribute('data-xml');
        if (!/\.xml$/i.test(xmlFile)) {
            xmlFile += '.xml';
        }
        
        // 更新当前索引（通过数组查找）
        pageNavigation.currentIndex = pageNavigation.pages.findIndex(
            page => page.xmlFile === xmlFile
        );
        
        // 更新URL
        const pageName = xmlFile.replace('.xml', '');
        window.history.pushState({ xmlFile: xmlFile }, '', `?page=${pageName}`);
        
        // 加载内容
        loadContent(xmlFile);
        
        // 移动端自动关闭侧边栏
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
        
        // 更新按钮状态
        updatePageButtons();
    }

    // 绑定子菜单点击事件
    document.querySelectorAll('.submenu div[data-xml]').forEach(item => {
        item.addEventListener('click', handleSubmenuClick);
    });
    
    // 初始化页面导航数组和按钮事件
    function initPageNavigationArray() {
        // 1. 构建页面数组（按data-page排序）
        pageNavigation.pages = Array.from(document.querySelectorAll('.submenu div[data-xml]'))
            .map(item => {
                let xmlFile = item.getAttribute('data-xml');
                if (!/\.xml$/i.test(xmlFile)) {
                    xmlFile += '.xml';
                }
                return {
                    xmlFile: xmlFile,
                    element: item,
                    pageNum: parseInt(item.getAttribute('data-page')) || 0 // 用于排序
                };
            })
            .sort((a, b) => a.pageNum - b.pageNum); // 按页码升序排列
        
        // 2. 绑定上一页/下一页按钮事件
        prevDocBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (pageNavigation.currentIndex > 0) {
                    const prevPage = pageNavigation.pages[pageNavigation.currentIndex - 1];
                    prevPage.element.click(); // 触发上一页点击
                }
            });
        });
        
        nextDocBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (pageNavigation.currentIndex < pageNavigation.pages.length - 1) {
                    const nextPage = pageNavigation.pages[pageNavigation.currentIndex + 1];
                    nextPage.element.click(); // 触发下一页点击
                }
            });
        });

        // 3. 处理URL参数或默认加载第一页
        handleInitialPageLoad();
    }

    // 处理初始页面加载（URL参数或默认页）
    function handleInitialPageLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        
        if (pageParam && pageNavigation.pages.length > 0) {
            // 尝试匹配URL参数对应的页面
            const targetXml = pageParam.endsWith('.xml') ? pageParam : `${pageParam}.xml`;
            const targetPage = pageNavigation.pages.find(page => page.xmlFile === targetXml);
            if (targetPage) {
                handleSubmenuClick.call(targetPage.element, new Event('click'));
                return;
            }
        }
        
        // 默认加载第一页
        if (pageNavigation.pages.length > 0) {
            handleSubmenuClick.call(pageNavigation.pages[0].element, new Event('click'));
        }
    }
    
    // 浏览器前进/后退处理
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.xmlFile) {
            const xmlFile = event.state.xmlFile;
            // 找到对应页面并更新索引
            const targetIndex = pageNavigation.pages.findIndex(page => page.xmlFile === xmlFile);
            if (targetIndex !== -1) {
                pageNavigation.currentIndex = targetIndex;
                // 更新选中状态
                document.querySelectorAll('.submenu div[data-xml]').forEach(item => {
                    item.classList.remove('active');
                });
                pageNavigation.pages[targetIndex].element.classList.add('active');
                // 加载内容并更新按钮
                loadContent(xmlFile);
                updatePageButtons();
            }
        }
    });

    /**********************
     * 功能函数定义
     **********************/
    
    // 获取XML内容
    async function fetchXml(xmlFile) {
        return fetch(xmlFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(xmlText => {
                // 更新缓存
                contentCache[xmlFile] = {
                    content: xmlText,
                    timestamp: Date.now()
                };
                return xmlText;
            });
    }

    // 加载内容函数
    function loadContent(xmlFile) {
        showLoading();

        // 检查缓存
        if (contentCache[xmlFile] && Date.now() - contentCache[xmlFile].timestamp < CACHE_EXPIRY) {
            contentMain.innerHTML = contentCache[xmlFile].content || '<div class="empty">暂无撰写xml数据</div>';
            initContent();
            initCodeCollapse();
            applyPrismHighlight(contentMain);
            updateLastModifiedTime(xmlFile); // 新增：更新时间显示
            return;
        }

        // 请求新内容
        fetchXml(xmlFile)
            .then(xmlText => {
                contentMain.innerHTML = xmlText || '<div class="empty">暂无数据</div>';
                initContent();
                initCodeCollapse();
                
                // 页面加载动画
                contentMain.classList.add('loaded');
                setTimeout(() => contentMain.classList.remove('loaded'), 300);

                applyPrismHighlight(contentMain);
                updateLastModifiedTime(xmlFile); // 新增：更新时间显示
            })
            .catch(error => {
                console.error('加载失败:', error);

                // 尝试使用缓存
                if (contentCache[xmlFile]) {
                    showError(`${error.message}<br>显示已缓存内容`, true);
                    contentMain.innerHTML = contentCache[xmlFile].content;
                    initContent();
                    initCodeCollapse();
                    applyPrismHighlight(contentMain);
                    updateLastModifiedTime(xmlFile); // 新增：更新时间显示
                } else {
                    showError(error.message);
                }
            });
    }

    // 新增函数：获取并显示最后修改时间
    function updateLastModifiedTime(xmlFile) {
        fetch(xmlFile, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    const lastModified = response.headers.get('Last-Modified');
                    if (lastModified) {
                        const updateTimeElement = document.getElementById('xmlUpdateTime');
                        if (updateTimeElement) {
                            const now = new Date();
                            const modifiedDate = new Date(lastModified);
                            const timeDiff = now - modifiedDate;
                            const timezoneOffset = -modifiedDate.getTimezoneOffset() / 60;
                            const timezoneSign = timezoneOffset >= 0 ? '+' : '-';
                            
                            // 智能格式化时间
                            let formattedDate;
                            if (timeDiff > 365 * 24 * 60 * 60 * 1000) { // 超过1年
                                formattedDate = modifiedDate.getFullYear() + '/' + 
                                    padZero(modifiedDate.getMonth() + 1) + '/' + 
                                    padZero(modifiedDate.getDate()) + ' ' +
                                    padZero(modifiedDate.getHours()) + ':' + 
                                    padZero(modifiedDate.getMinutes()) + ':' + 
                                    padZero(modifiedDate.getSeconds());
                            } else { // 1年以内（包含超过1个月和1个月内的情况）
                                formattedDate = 
                                    padZero(modifiedDate.getMonth() + 1) + '/' + 
                                    padZero(modifiedDate.getDate()) + ' ' +
                                    padZero(modifiedDate.getHours()) + ':' + 
                                    padZero(modifiedDate.getMinutes()) + ':' + 
                                    padZero(modifiedDate.getSeconds());
                            }
                            
                            // 添加时区信息
                            formattedDate += ` (UTC${timezoneSign}${Math.abs(timezoneOffset)})`;
                            
                            updateTimeElement.textContent = formattedDate;
                        } else {
                            console.warn('未找到 #xmlUpdateTime 元素');
                        }
                    }
                }
            })
            .catch(error => {
                console.error('获取最后修改时间失败:', error);
            });
    }

    // 辅助函数：补零
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    function initCodeCollapse() {
        // 为每个代码块添加折叠按钮
        document.querySelectorAll('pre').forEach(pre => {
            // 检查是否已经添加过按钮
            if (pre.querySelector('.code-toggle')) return;
            
            // 创建折叠按钮
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'code-toggle';
            toggleBtn.textContent = '点击展开';
            
            // 初始状态（默认折叠）
            toggleBtn.classList.add('collapsed');
            pre.classList.add('collapsed');
            
            // 点击事件
            toggleBtn.addEventListener('click', function() {
                this.classList.toggle('collapsed');
                pre.classList.toggle('collapsed');
                
                if (this.classList.contains('collapsed')) {
                    this.textContent = '点击展开';
                } else {
                    this.textContent = '点击收起';
                }
            });
            
            // 将按钮添加到代码块
            pre.prepend(toggleBtn);
        });
    }
    
    // 初始化内容交互
    function initContent() {
        // 初始化折叠功能
        document.querySelectorAll('.group-header').forEach(header => {
            header.classList.add('close');
        });

        document.querySelectorAll('.group-title').forEach(title => {
            title.addEventListener('click', function(e) {
                if (e.target === this || this.contains(e.target)) {
                    e.stopPropagation();
                    this.closest('.group-header').classList.toggle('close');
                }
            });
        });
    }
    
    // 显示加载状态
    function showLoading() {
        contentMain.innerHTML = `
            <div class="load">
                <div class="spinner"></div>
                <div>内容加载中，请稍候...</div>
            </div>
        `;
        contentMain.classList.remove('error-state');
    }
    
    // 显示错误信息
    function showError(message, isWarning = false) {
        contentMain.classList.add('error-state');
        contentMain.innerHTML = `
            <div class="${isWarning ? 'warning' : 'error'}">
                <i class="fas fa-${isWarning ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                <div>${message}</div>
                <button class="retry-btn">重试</button>
            </div>
        `;
        
        // 重试按钮事件
        const activeMenuItem = document.querySelector('.submenu div[data-xml].active');
        if (activeMenuItem) {
            contentMain.querySelector('.retry-btn').addEventListener('click', () => {
                let xmlFile = activeMenuItem.getAttribute('data-xml');
                if (!/\.xml$/i.test(xmlFile)) {
                    xmlFile += '.xml';
                }
                loadContent(xmlFile);
            });
        }
    }
    
    // 更新导航按钮状态
    function updatePageButtons() {
        // 上一页按钮状态
        const hasPrev = pageNavigation.currentIndex > 0;
        prevDocBtns.forEach(btn => {
            btn.style.visibility = hasPrev ? 'visible' : 'hidden';
            btn.disabled = !hasPrev;
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = hasPrev 
                    ? `上一页: ${pageNavigation.pages[pageNavigation.currentIndex - 1].element.textContent.trim()}`
                    : '上一页: --';
            }
        });
        
        // 下一页按钮状态
        const hasNext = pageNavigation.currentIndex < pageNavigation.pages.length - 1;
        nextDocBtns.forEach(btn => {
            btn.style.visibility = hasNext ? 'visible' : 'hidden';
            btn.disabled = !hasNext;
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = hasNext
                    ? `下一页: ${pageNavigation.pages[pageNavigation.currentIndex + 1].element.textContent.trim()}`
                    : '下一页: --';
            }
        });
    }
    
    // 应用Prism高亮
    function applyPrismHighlight(container) {
        if (window.Prism) {
            const codeBlocks = container.querySelectorAll('pre code');
            if (codeBlocks.length === 0) return;

            codeBlocks.forEach(block => {
                if (!block.className.match(/language-\w+/)) {
                    block.className = 'language-none';
                }
            });

            const highlight = () => Prism.highlightAllUnder(container);
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(highlight);
            } else {
                setTimeout(highlight, 100);
            }
        } else {
            console.error('Prism.js 未加载！');
        }
    }
});