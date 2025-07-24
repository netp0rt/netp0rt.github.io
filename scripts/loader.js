// 配置部分
import CONFIG from '/scripts/config.js';

// 状态跟踪
const loadState = {
    loadedCount: 0,
    cacheHits: 0,
    networkLoads: 0,
    startTime: 0, // 新增：记录加载开始时间
    endTime: 0 // 新增：记录所有文件下载完成时间
};

// DOM元素缓存
const elements = {
    progress: document.querySelector('.loader-progress'),
    text: document.querySelector('.loader-text'),
    status: document.querySelector('.loader-status'),
    container: document.getElementById('loadBack')
};

// 禁止操作的处理函数
function disableContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function disableScroll(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 启用限制（禁止右键和滚动）
function enableRestrictions() {
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('wheel', disableScroll, { passive: false });
    document.addEventListener('touchmove', disableScroll, { passive: false });
    document.body.style.overflow = 'hidden';
}

// 解除限制
function disableRestrictions() {
    document.removeEventListener('contextmenu', disableContextMenu);
    document.removeEventListener('wheel', disableScroll);
    document.removeEventListener('touchmove', disableScroll);
    document.body.style.overflow = '';
}

// 直接更新进度（无动画）
function updateProgress() {
    const percentage = Math.round((loadState.loadedCount / CONFIG.jsFiles.length) * 100);
    
    elements.progress.style.setProperty('--load-percentage', `${100 - percentage}%`);
    elements.text.textContent = `${percentage}%`;
    elements.status.textContent = `${loadState.loadedCount}/${CONFIG.jsFiles.length}个文件加载`;
}

// 检查资源加载方式
function checkResourceCache(url) {
    const resources = performance.getEntriesByType("resource");
    const resource = resources.find(r => r.name.includes(url.split('/').pop()));
    
    if (resource) {
        if (CONFIG.showCacheInfo) {
            console.log(`[${url}] 传输大小:`, resource.transferSize);
            console.log(resource.transferSize === 0 ? 
                `[${url}] 来自缓存` : `[${url}] 从网络下载`);
        }
        resource.transferSize === 0 ? loadState.cacheHits++ : loadState.networkLoads++;
    }
}

// 动态加载单个JS文件
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        
        script.onload = () => {
            checkResourceCache(url);
            loadState.loadedCount++;
            updateProgress();
            console.log(`[加载成功] ${url}`);
            resolve();
        };
        
        script.onerror = () => {
            console.error(`[加载失败] ${url}`);
            loadState.loadedCount++;
            updateProgress();
            reject(new Error(`Failed to load: ${url}`));
        };
        
        document.body.appendChild(script);
    });
}

// 顺序加载所有JS文件
// 在loadAllScripts函数中，加载完所有脚本后添加检测
async function loadAllScripts() {
    enableRestrictions();
    loadState.startTime = performance.now();
    
    try {
        updateProgress();
        
        for (const file of CONFIG.jsFiles) {
            await loadScript(file).catch(() => {});
        }

        // 二次检测：用featuredetector验证ES2017+支持
        if (window.ft) {
            const compatResult = ft.test({ mode: 'j', minver: 8 }); // ES2017对应版本号8
            if (!compatResult.isPass) {
                throw new Error('浏览器不支持ES2017+特性');
            }
        }

        // 后续加载耗时计算和状态更新...
        loadState.endTime = performance.now();
        const loadTime = ((loadState.endTime - loadState.startTime) / 1000).toFixed(2);
        elements.status.textContent = `加载 ${loadTime}s`;
        
        setTimeout(() => {
            elements.status.textContent = '加载完成';
            setTimeout(() => {
                elements.container.style.opacity = '0';
                setTimeout(() => {
                    elements.container.remove();
                    disableRestrictions();
                }, 500);
            }, 1000);
        }, 1500);
        
    } catch (error) {
        console.error('加载失败:', error);
        elements.status.textContent = '浏览器不支持，请升级';
        disableRestrictions();
    }
}

// 启动加载流程
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    loadAllScripts();
} else {
    document.addEventListener('DOMContentLoaded', loadAllScripts);
}