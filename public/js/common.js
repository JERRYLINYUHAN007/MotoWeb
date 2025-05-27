// 插入導航欄（僅在沒有導航欄的頁面使用）
function insertNavbar() {
    // 檢查頁面是否已有導航欄，如果有則不插入
    if (document.querySelector('.navbar')) {
        console.log('頁面已有導航欄，跳過動態插入');
        return;
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    
    if (isLoggedIn) {
        // 登入後的導航欄結構
        navbar.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="logo">
                    <img src="/MOTOWEB.png" alt="MotoWeb Logo">
                    <span>MotoWeb</span>
                </a>
                
                <div class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                
                <div class="nav-links">
                    <a href="/">首頁</a>
                    <a href="/products.html">改裝零件</a>
                    <a href="/community.html">社群討論</a>
                    <a href="/showcase.html">作品展示</a>
                    <a href="/events.html">改裝活動</a>
                </div>

                <div class="user-actions"> 
                    <div class="user-menu">
                        <img src="/images/default-avatar.svg" alt="用戶頭像" class="avatar">
                        <div class="dropdown-menu">
                            <a href="/profile.html">個人資料</a>
                            <a href="/garage.html">我的車庫</a>
                            <a href="/settings.html">帳號設定</a>
                            <a href="#" id="logout">登出</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // 未登入狀態的導航欄
        navbar.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="logo">
                    <img src="/MOTOWEB.png" alt="MotoWeb Logo">
                    <span>MotoWeb</span>
                </a>
                
                <div class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                
                <div class="nav-links">
                    <a href="/" class="active">首頁</a>
                    <a href="/showcase.html">改裝展示</a>
                    <a href="/products.html">零件商城</a>
                    <a href="/community.html">討論區</a>
                    <a href="/bikes-gallery.html">車輛圖庫</a>
                    <a href="/garage.html">車庫</a>
                </div>
                
                <div class="user-actions">
                    <a href="/login.html" class="login-btn">登入</a>
                    <a href="/register.html" class="signup-btn">註冊</a>
                </div>
            </div>
        `;
    }
    
    document.body.insertBefore(navbar, document.body.firstChild);
    
    // 如果用戶已登入，設置登出功能
    if (isLoggedIn) {
        setupLogout();
    }
}

// 設置登出功能
function setupLogout() {
    const logoutButton = document.getElementById('logout');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清除登入狀態
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            
            // 顯示登出成功提示
            alert('登出成功！');
            
            // 重新導向到首頁
            setTimeout(function() {
                window.location.href = '/';
            }, 500);
        });
    }
}

// 插入頁尾
function insertFooter() {
    // 檢查頁面是否已有頁尾
    if (document.querySelector('.footer')) {
        return;
    }
    
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h3>關於我們</h3>
                <ul>
                    <li><a href="/about.html">公司介紹</a></li>
                    <li><a href="/contact.html">聯絡我們</a></li>
                    <li><a href="/careers.html">工作機會</a></li>
                    <li><a href="/press.html">媒體中心</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>服務項目</h3>
                <ul>
                    <li><a href="/showcase.html">改裝展示</a></li>
                    <li><a href="/products.html">零件商城</a></li>
                    <li><a href="/community.html">討論區</a></li>
                    <li><a href="/garage.html">車庫</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>幫助中心</h3>
                <ul>
                    <li><a href="/faq.html">常見問題</a></li>
                    <li><a href="/shipping.html">運送說明</a></li>
                    <li><a href="/returns.html">退換貨政策</a></li>
                    <li><a href="/privacy.html">隱私權政策</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>關注我們</h3>
                <ul>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">YouTube</a></li>
                    <li><a href="#">Line</a></li>
                </ul>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2024 MotoWeb. All rights reserved.</p>
        </div>
    `;
    document.body.appendChild(footer);
}

// 初始化導航欄功能
function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // 設置當前頁面的導航鏈接為活動狀態
    const currentPath = window.location.pathname;
    const navAnchors = document.querySelectorAll('.nav-links a');
    
    navAnchors.forEach(anchor => {
        if (anchor.getAttribute('href') === currentPath) {
            anchor.classList.add('active');
        } else {
            anchor.classList.remove('active');
        }
    });
}

/**
 * 初始化頁面過渡效果
 */
function initPageTransitions() {
    const body = document.body;

    // 進入頁面時添加動畫
    body.classList.add('fade-in');

    // 點擊連結時的處理 - 這部分邏輯已證明會導致導航問題，因此移除其內部操作，僅保留函數結構以備未來可能重新設計轉場效果
    // document.addEventListener('click', function(e) {
    //     const targetLink = e.target.closest('a');

    //     if (targetLink && targetLink.href && 
    //         targetLink.hostname === window.location.hostname && // 確保是同站連結
    //         targetLink.getAttribute('target') !== '_blank' && // 不是在新分頁開啟
    //         !targetLink.href.includes('#') && // 不是錨點連結
    //         !targetLink.hasAttribute('download') && // 不是下載連結
    //         !targetLink.classList.contains('no-transition')) { // 避免特定連結的轉場
            
    //         // 原本的淡出動畫和延遲導航邏輯已註解
    //         // e.preventDefault();
    //         // body.classList.add('fade-out');
    //         // setTimeout(function() {
    //         //     window.location.href = targetLink.href;
    //         // }, 300); // 動畫時間
    //     }
    // });
}

// 當 DOM 加載完成時執行
document.addEventListener('DOMContentLoaded', () => {
    insertNavbar();
    insertFooter();
    initializeNavigation();
    initPageTransitions();
}); 