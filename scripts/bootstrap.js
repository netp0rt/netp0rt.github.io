// bootstrap.js（添加调试输出，4空格缩进）
(function() {
    // 打印初始加载日志
    console.log('引导脚本开始执行');
    
    // 等待DOM加载完成的工具函数
    function onDOMReady(callback) {
        console.log('检查DOM状态:', document.readyState);
        
        // 如果DOM仍在加载，则监听加载完成事件
        if (document.readyState === 'loading') {
            console.log('等待DOM加载完成...');
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM加载完成');
                callback();
            });
        } else {
            // 如果DOM已经加载完成，则直接执行回调
            console.log('DOM已加载，直接执行');
            callback();
        }
    }
    
    // 检测浏览器是否支持ES6模块（import/export语法）
    function supportsES6Modules() {
        try {
            // 尝试解析包含import语法的代码（不执行）
            new Function('import("")');
            console.log('支持ES6模块');
            return true;
        } catch (e) {
            console.log('不支持ES6模块:', e.message);
            return false;
        }
    }
    
    // 检测浏览器是否支持ES2017+特性（async/await等）
    function supportsES2017() {
        try {
            // 尝试解析包含async函数和Object.values的代码
            new Function('async function test() {}; return typeof Object.values === "function"')();
            console.log('支持ES2017');
            return true;
        } catch (e) {
            console.log('不支持ES2017:', e.message);
            return false;
        }
    }
    
    // 在DOM加载完成后执行兼容性检测
    onDOMReady(function() {
        console.log('开始兼容性检测...');
        
        // 检查浏览器是否同时支持ES6模块和ES2017+
        if (supportsES6Modules() && supportsES2017()) {
            console.log('浏览器支持所有要求，加载loader.js');
            
            try {
                // 创建并添加模块脚本
                var script = document.createElement('script');
                script.type = 'module';
                script.src = 'scripts/loader.js';
                document.body.appendChild(script);
                
                // 添加脚本加载成功/失败的监听
                script.onload = function() {
                    console.log('loader.js加载成功');
                };
                script.onerror = function() {
                    console.error('loader.js加载失败');
                    alert('核心脚本加载失败，请刷新页面或检查网络连接');
                };
            } catch (error) {
                console.error('创建模块脚本时出错:', error);
                alert('初始化失败，请刷新页面');
            }
        } else {
            console.log('浏览器不支持，显示提示');
            
            // 显示兼容性警告并隐藏加载动画
            alert('您的浏览器版本过低，不支持本功能，请升级到以下浏览器：\nChrome 60+ / Firefox 55+ / Edge 79+');
            var loadBack = document.getElementById('loadBack');
            if (loadBack) {
                loadBack.style.display = 'none';
            }
        }
    });
})();