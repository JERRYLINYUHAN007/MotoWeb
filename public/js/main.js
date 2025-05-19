/**
 * MotoMod 主要JavaScript功能
 * 處理導航、滾動效果、動態載入內容等功能
 */

// DOM準備完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initMobileNav();
    initBackToTop();
    initSmoothScrolling();
    initCardAnimations();
    loadDiscussions();
    initNewsletterForm();
    initPageTransitions();
});

/**
 * 初始化手機版導航選單
 */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // 設定ARIA屬性
            const isExpanded = menuToggle.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // 切換漢堡選單動畫
            const bars = menuToggle.querySelectorAll('.bar');
            bars[0].style.transform = isExpanded ? 'rotate(45deg) translate(5px, 5px)' : '';
            bars[1].style.opacity = isExpanded ? '0' : '1';
            bars[2].style.transform = isExpanded ? 'rotate(-45deg) translate(7px, -6px)' : '';
            
            // 防止滾動背景
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
        
        // 點擊導航連結時關閉選單
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', false);
                    document.body.style.overflow = '';
                    
                    // 重置漢堡選單動畫
                    const bars = menuToggle.querySelectorAll('.bar');
                    bars.forEach(bar => bar.style.transform = '');
                    bars[1].style.opacity = '1';
                }
            });
        });
        
        // 點擊外部時關閉選單
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
                document.body.style.overflow = '';
                
                // 重置漢堡選單動畫
                const bars = menuToggle.querySelectorAll('.bar');
                bars.forEach(bar => bar.style.transform = '');
                bars[1].style.opacity = '1';
            }
        });
    }
}

/**
 * 初始化返回頂部按鈕
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // 使用節流函數優化滾動事件
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 300) {
                        backToTopButton.classList.add('visible');
                    } else {
                        backToTopButton.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 添加鍵盤支持
        backToTopButton.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * 初始化平滑滾動
 */
function initSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 更新 URL 但不滾動
                history.pushState(null, '', targetId);
                
                // 設定焦點
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * 初始化卡片動畫效果
 */
function initCardAnimations() {
    if ('IntersectionObserver' in window) {
        const cards = document.querySelectorAll('.featured-card, .discussion-card, .category-card');
        
        if (cards.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            cards.forEach(card => {
                card.classList.add('fade-in');
                observer.observe(card);
            });
        }
    }
}

/**
 * 從API載入最新討論
 */
function loadDiscussions() {
    const discussionList = document.querySelector('.discussion-list');
    
    if (!discussionList || window.location.pathname !== '/index.html') {
        return;
    }
    
    // 添加載入中狀態
    discussionList.innerHTML = '<div class="loading">載入中...</div>';
    
    // 模擬API請求
    setTimeout(() => {
        const mockDiscussions = [
            {
                id: 1,
                title: '各位車友如何看待電子懸吊的調校？',
                excerpt: '最近打算替換我的 Ducati 懸吊系統，考慮電子懸吊但擔心可靠性問題...',
                user: {
                    name: 'RideMaster',
                    avatar: 'images/user-avatar1.webp'
                },
                stats: {
                    replies: 32,
                    views: 256
                },
                timestamp: '3 小時前'
            },
            {
                id: 2,
                title: '2025 年值得期待的改裝零件與新技術',
                excerpt: '整理了今年將推出的頂級改裝零件與革新技術，歡迎一起討論...',
                user: {
                    name: 'SpeedHunter',
                    avatar: 'images/user-avatar2.webp'
                },
                stats: {
                    replies: 47,
                    views: 378
                },
                timestamp: '昨天'
            }
        ];
        
        // 清除載入中狀態
        discussionList.innerHTML = '';
        
        // 渲染討論卡片
        mockDiscussions.forEach(discussion => {
            const discussionCard = document.createElement('article');
            discussionCard.className = 'discussion-card fade-in';
            
            discussionCard.innerHTML = `
                <div class="user-info">
                    <img src="${discussion.user.avatar}" alt="${discussion.user.name} 的頭像" class="user-avatar" loading="lazy">
                    <div class="user-meta">
                        <h4>${discussion.user.name}</h4>
                        <span>${discussion.timestamp}</span>
                    </div>
                </div>
                <h3 class="discussion-title">${discussion.title}</h3>
                <p class="discussion-excerpt">${discussion.excerpt}</p>
                <div class="discussion-meta">
                    <span><i class="fas fa-comment"></i> ${discussion.stats.replies} 回覆</span>
                    <span><i class="fas fa-eye"></i> ${discussion.stats.views} 瀏覽</span>
                    <a href="discussion.html?id=${discussion.id}" class="discussion-link">參與討論</a>
                </div>
            `;
            
            discussionList.appendChild(discussionCard);
        });
        
        // 初始化新加入卡片的動畫
        initCardAnimations();
        
    }, 1000); // 模擬網路延遲
}

/**
 * 初始化電子報訂閱表單
 */
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (emailInput && emailInput.value) {
                // 禁用表單元素
                emailInput.disabled = true;
                submitButton.disabled = true;
                submitButton.innerHTML = '訂閱中...';
                
                // 模擬API請求
                setTimeout(() => {
                    // 顯示成功訊息
                    const successMessage = document.createElement('div');
                    successMessage.className = 'newsletter-success';
                    successMessage.innerHTML = '感謝您的訂閱！';
                    form.appendChild(successMessage);
                    
                    // 重置表單
                    emailInput.value = '';
                    emailInput.disabled = false;
                    submitButton.disabled = false;
                    submitButton.innerHTML = '訂閱';
                    
                    // 3秒後移除成功訊息
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
                }, 1500);
            }
        });
    }
}

/**
 * 初始化頁面過渡效果
 */
function initPageTransitions() {
    const body = document.body;
    
    // 進入頁面時添加動畫
    body.classList.add('fade-in');
    
    // 離開頁面時添加動畫
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a'); // 使用 closest 來處理點擊到 a 標籤內的元素
        
        if (target && 
            target.hostname === window.location.hostname && 
            target.getAttribute('target') !== '_blank' &&
            !target.hasAttribute('download')) {
            
            e.preventDefault();
            const href = target.getAttribute('href');
            
            // 添加淡出動畫
            body.classList.add('fade-out');
            
            // 動畫結束後導航到新頁面
            setTimeout(function() {
                window.location.href = href;
            }, 300);
        }
    });
} 