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
    
    if (isLoggedIn) {
        // 用戶已登入，common.js 應該已經顯示了用戶選單
        // const authButtonsContainer = document.querySelector('.auth-buttons'); // 這個選擇器在登入時可能不適用
        // if (!authButtonsContainer) return; // 如果由 common.js 的 user-actions 包裹 user-menu，則不需要這個

        // authButtonsContainer.innerHTML = ` ... `; // <--- 移除這段及類似的 innerHTML 修改
        
        // 直接查找由 common.js 生成的 .user-menu 並設置交互
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });
            
            document.addEventListener('click', function(e) {
                if (userMenu.classList.contains('active') && !userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });
        }
        
        // setupLogoutButton(); // 這個的調用位置在 DOMContentLoaded 中，是OK的
    } else {
        // 用戶未登入，common.js 應該已經顯示了登入和註冊按鈕
        // const authButtonsContainer = document.querySelector('.auth-buttons');
        // if (!authButtonsContainer) return;
        // authButtonsContainer.innerHTML = ` ... `; // <--- 移除這段及類似的 innerHTML 修改
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