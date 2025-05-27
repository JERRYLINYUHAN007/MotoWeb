/**
 * auth-state.js
 * 統一處理所有頁面的用戶登入狀態和導航欄顯示
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthState();
});

/**
 * 初始化認證狀態管理
 */
function initializeAuthState() {
    console.log('初始化認證狀態管理...');
    updateAuthUI();
    setupLogoutButton();
    setupUserMenu();
}

/**
 * 檢查用戶登入狀態並更新UI
 */
function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || '用戶';
    
    console.log('用戶登入狀態:', isLoggedIn);
    console.log('用戶名稱:', username);
    
    // 查找認證相關元素
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const usernameElement = document.querySelector('.user-menu .username');
    
    if (isLoggedIn) {
        // 用戶已登入
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        if (userMenu) {
            userMenu.style.display = 'block';
            
            // 更新用戶名稱
            if (usernameElement) {
                usernameElement.textContent = username;
            }
        }
        
        console.log('顯示用戶菜單，隱藏登入按鈕');
    } else {
        // 用戶未登入
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        
        console.log('顯示登入按鈕，隱藏用戶菜單');
    }
}

/**
 * 設置用戶菜單交互功能
 */
function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const userAvatar = document.querySelector('.user-avatar');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userMenu && userAvatar && dropdownMenu) {
        // 點擊用戶頭像顯示/隱藏下拉菜單
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            console.log('用戶菜單切換:', dropdownMenu.classList.contains('show'));
        });
        
        // 點擊其他地方關閉下拉菜單
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // 防止菜單項目點擊時關閉菜單（除了登出）
        dropdownMenu.addEventListener('click', function(e) {
            if (e.target.id !== 'logout') {
                e.stopPropagation();
            }
        });
    }
}

/**
 * 設置登出按鈕功能
 */
function setupLogoutButton() {
    // 監聽所有可能的登出按鈕
    const logoutButtons = document.querySelectorAll('#logout, .logout-btn, [data-action="logout"]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
}

/**
 * 處理登出操作
 */
function handleLogout() {
    console.log('執行登出操作...');
    
    // 清除所有認證相關的localStorage
    const authKeys = ['isLoggedIn', 'token', 'username', 'userEmail', 'userId'];
    authKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // 顯示登出成功提示
    if (typeof showNotification === 'function') {
        showNotification('登出成功！', 'success');
    } else {
        alert('登出成功！');
    }
    
    // 更新UI狀態
    updateAuthUI();
    
    // 重新導向到首頁（延遲以顯示提示）
    setTimeout(function() {
        window.location.href = '/index.html';
    }, 1000);
}

/**
 * 設置登入成功後的狀態
 * @param {Object} userData - 用戶資料
 */
function setAuthState(userData) {
    console.log('設置認證狀態:', userData);
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', userData.username || userData.name || '用戶');
    
    if (userData.token) {
        localStorage.setItem('token', userData.token);
    }
    if (userData.email) {
        localStorage.setItem('userEmail', userData.email);
    }
    if (userData.id) {
        localStorage.setItem('userId', userData.id);
    }
    
    // 更新UI
    updateAuthUI();
}

/**
 * 檢查用戶是否已登入
 * @return {boolean} 登入狀態
 */
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * 獲取當前用戶資訊
 * @return {Object|null} 用戶資訊
 */
function getCurrentUser() {
    if (!isUserLoggedIn()) {
        return null;
    }
    
    return {
        username: localStorage.getItem('username'),
        email: localStorage.getItem('userEmail'),
        token: localStorage.getItem('token'),
        id: localStorage.getItem('userId')
    };
}

/**
 * 顯示通知消息（如果頁面有實現）
 * @param {string} message - 消息內容
 * @param {string} type - 消息類型 ('success', 'error', 'warning', 'info')
 */
function showNotification(message, type = 'info') {
    // 如果頁面有實現showNotification函數，使用它
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // 否則創建簡單的通知
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後自動移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 暴露給全域使用
window.authState = {
    updateAuthUI,
    setAuthState,
    handleLogout,
    isUserLoggedIn,
    getCurrentUser,
    showNotification
}; 