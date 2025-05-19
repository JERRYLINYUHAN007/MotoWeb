/**
 * auth-state.js
 * 處理用戶登入狀態和導航欄顯示
 */

document.addEventListener('DOMContentLoaded', function() {
    // 檢查用戶登入狀態並更新導航欄
    updateAuthUI();

    // 監聽登出按鈕
    setupLogoutButton();
});

/**
 * 檢查用戶登入狀態並更新UI
 */
function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authButtonsContainer = document.querySelector('.auth-buttons');
    
    if (!authButtonsContainer) return;
    
    if (isLoggedIn) {
        // 用戶已登入，顯示用戶選單
        authButtonsContainer.innerHTML = `
            <div class="user-menu">
                <img src="images/default-avatar.svg" alt="用戶頭像" class="avatar">
                <div class="dropdown-menu">
                    <a href="profile.html">個人資料</a>
                    <a href="garage.html">我的車庫</a>
                    <a href="settings.html">帳號設定</a>
                    <a href="#" id="logout">登出</a>
                </div>
            </div>
        `;
        
        // 設置用戶選單的交互效果
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });
            
            // 點擊其他地方關閉下拉選單
            document.addEventListener('click', function(e) {
                if (!userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });
        }
        
        // 設置登出按鈕功能
        setupLogoutButton();
    } else {
        // 用戶未登入，顯示登入和註冊按鈕
        authButtonsContainer.innerHTML = `
            <a href="login.html" class="btn btn-secondary">登入</a>
            <a href="register.html" class="btn btn-primary">註冊</a>
        `;
    }
}

/**
 * 設置登出按鈕功能
 */
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清除登入狀態
            localStorage.removeItem('isLoggedIn');
            
            // 顯示登出成功提示
            if (typeof showNotification === 'function') {
                showNotification('登出成功！', 'success');
            } else {
                alert('登出成功！');
            }
            
            // 重新導向到首頁
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
} 