document.addEventListener('DOMContentLoaded', function() {
    // 为每个代码块添加折叠按钮
    document.querySelectorAll('pre').forEach(pre => {
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
});

// 平滑滚动到顶部函数
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 初始化滚动导航菜单
document.addEventListener('DOMContentLoaded', function() {
    const scrollNav = document.querySelector('.scroll-nav');
    const scrollLinks = document.querySelectorAll('.scroll-nav-link');
    
    // 为每个链接添加点击事件
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('scroll-top-btn')) {
                e.preventDefault();
                smoothScrollToTop();
            } else {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // 滚动时显示/隐藏导航菜单
    window.addEventListener('scroll', async function() {
        if (window.scrollY > 300) {
            scrollNav.classList.add('show');
        } else {
            scrollNav.classList.remove('show');
        }
    });
});