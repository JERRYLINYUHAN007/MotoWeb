/**
 * 認證狀態管理 - 統一處理用戶登入/登出狀態
 * 此檔案負責管理所有頁面的認證狀態和UI更新
 */

console.log('auth-state.js 開始載入...');

// 防止重複初始化
let authStateInitialized = false;

/**
 * 當DOM載入完成時初始化認證狀態
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth-state.js DOM載入完成，開始初始化...');
    if (!authStateInitialized) {
        initializeAuthState();
        authStateInitialized = true;
    }
});

/**
 * 初始化認證狀態管理
 */
function initializeAuthState() {
    console.log('初始化認證狀態管理...');
    
    // 檢查是否存在認證狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    console.log('當前認證狀態:', isLoggedIn);
    
    updateAuthUI();
    
    // 設置用戶菜單交互
    setupUserMenu();
    
    // 設置登出按鈕 - 延遲執行確保DOM完全載入
    setTimeout(setupLogoutButton, 100);
    
    // 監聽 localStorage 變化（如果其他標籤頁修改了狀態）
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn') {
            console.log('登入狀態已更改:', e.newValue);
            updateAuthUI();
        }
    });
    
    console.log('認證狀態管理初始化完成');
}

/**
 * 檢查用戶登入狀態並更新UI
 */
function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || '用戶';
    
    console.log('更新UI - 用戶登入狀態:', isLoggedIn, '頁面:', window.location.pathname);
    console.log('用戶名稱:', username);
    
    // 查找認證相關元素 - 修正選擇器名稱
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const usernameElement = document.querySelector('.user-menu .username');
    
    console.log('找到的元素:', {
        authButtons: !!authButtons,
        userMenu: !!userMenu,
        usernameElement: !!usernameElement
    });
    
    if (isLoggedIn) {
        // 用戶已登入 - 隱藏登入/註冊按鈕，顯示用戶菜單
        if (authButtons) {
            authButtons.style.display = 'none';
            console.log('隱藏登入/註冊按鈕');
        }
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            console.log('顯示用戶菜單');
            
            // 更新用戶名稱
            if (usernameElement) {
                usernameElement.textContent = username;
                console.log('更新用戶名稱為:', username);
            }
        }
        
        console.log('✅ 已登入狀態：顯示用戶菜單，隱藏登入按鈕');
    } else {
        // 用戶未登入 - 隱藏用戶菜單，顯示登入/註冊按鈕
        if (userMenu) {
            userMenu.style.display = 'none';
            console.log('隱藏用戶菜單');
        }
        
        if (authButtons) {
            // 強制顯示登入/註冊按鈕
            authButtons.style.display = 'flex';
            authButtons.style.visibility = 'visible';
            authButtons.style.opacity = '1';
            console.log('顯示登入/註冊按鈕');
        }
        
        console.log('✅ 未登入狀態：顯示登入按鈕，隱藏用戶菜單');
    }
    
    // 確保兩者不會同時顯示（強化版）
    if (authButtons && userMenu) {
        const authVisible = authButtons.style.display !== 'none';
        const userVisible = userMenu.style.display !== 'none';
        
        if (authVisible && userVisible) {
            console.warn('⚠️ 檢測到登入按鈕和用戶菜單同時顯示，強制修正...');
            if (isLoggedIn) {
                authButtons.style.display = 'none';
            } else {
                userMenu.style.display = 'none';
                // 確保登入按鈕完全顯示
                authButtons.style.display = 'flex';
                authButtons.style.visibility = 'visible';
                authButtons.style.opacity = '1';
            }
        }
        
        // 最終狀態驗證
        setTimeout(() => {
            const finalAuthVisible = authButtons.style.display !== 'none';
            const finalUserVisible = userMenu.style.display !== 'none';
            
            console.log('🔍 最終狀態驗證:', {
                isLoggedIn,
                authButtonsVisible: finalAuthVisible,
                userMenuVisible: finalUserVisible,
                shouldShowAuth: !isLoggedIn,
                shouldShowUser: isLoggedIn
            });
            
            // 如果狀態不正確，強制修正
            if ((!isLoggedIn && !finalAuthVisible) || (isLoggedIn && !finalUserVisible)) {
                console.warn('⚠️ 檢測到狀態不正確，執行強制修正...');
                if (isLoggedIn) {
                    if (authButtons) authButtons.style.display = 'none';
                    if (userMenu) userMenu.style.display = 'flex';
                } else {
                    if (userMenu) userMenu.style.display = 'none';
                    if (authButtons) {
                        authButtons.style.display = 'flex';
                        authButtons.style.visibility = 'visible';
                        authButtons.style.opacity = '1';
                    }
                }
                console.log('✅ 強制修正完成');
            }
        }, 10);
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
            if (e.target.id !== 'logout' && !e.target.classList.contains('logout-btn')) {
                e.stopPropagation();
            }
        });
    }
}

/**
 * 設置登出按鈕功能
 */
function setupLogoutButton() {
    console.log('設置登出按鈕功能...');
    
    // 查找所有可能的登出按鈕
    const logoutSelectors = [
        '#logout',
        '#logoutBtn', 
        '.logout-btn',
        '[data-action="logout"]',
        'a[href="#"][id*="logout"]',
        'button[id*="logout"]'
    ];
    
    let logoutButtons = [];
    
    logoutSelectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
            if (!logoutButtons.includes(button)) {
                logoutButtons.push(button);
            }
        });
    });
    
    console.log('找到登出按鈕數量:', logoutButtons.length, logoutButtons);
    
    logoutButtons.forEach((button, index) => {
        // 移除舊的事件監聽器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 添加新的事件監聽器
        newButton.addEventListener('click', handleLogoutClick);
        console.log(`登出按鈕 ${index + 1} 事件綁定完成:`, newButton);
    });
    
    // 如果沒有找到登出按鈕，延遲再試一次
    if (logoutButtons.length === 0) {
        console.log('未找到登出按鈕，1秒後重試...');
        setTimeout(setupLogoutButton, 1000);
    }
}

/**
 * 登出按鈕點擊處理器
 */
function handleLogoutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('登出按鈕被點擊，開始處理登出...');
    
    // 確認登出
    if (confirm('確定要登出嗎？')) {
        handleLogout();
    } else {
        console.log('用戶取消登出');
    }
}

/**
 * 處理登出操作
 */
function handleLogout() {
    console.log('執行登出操作...', window.location.pathname);
    
    try {
        // 清除所有認證相關的localStorage
        const authKeys = ['isLoggedIn', 'token', 'username', 'userEmail', 'userId'];
        authKeys.forEach(key => {
            console.log('清除 localStorage:', key, localStorage.getItem(key));
            localStorage.removeItem(key);
        });
        
        // 先立即強制更新UI狀態
        console.log('🔄 立即更新UI狀態...');
        updateAuthUI();
        
        // 額外確保UI正確更新（雙重檢查）
        setTimeout(() => {
            console.log('🔄 再次確認UI狀態更新...');
            updateAuthUI();
            
            // 確保用戶菜單下拉選單關閉
            const dropdownMenu = document.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        }, 50);
        
        // 顯示登出成功提示
        showNotification('登出成功！', 'success');
        
        // 只在非首頁時重定向，首頁直接停留並更新UI
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/index.html' || currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '';
        
        if (!isHomePage) {
            console.log('非首頁，3秒後重定向到首頁...');
            setTimeout(function() {
                window.location.href = '/';
            }, 3000);
        } else {
            console.log('✅ 已在首頁，登出完成，UI已更新');
            // 在首頁時不重新載入，只確保UI完全更新
            setTimeout(() => {
                console.log('🔄 最終UI狀態確認...');
                updateAuthUI();
                console.log('✅ 登出流程完成');
            }, 100);
        }
        
    } catch (error) {
        console.error('登出過程中發生錯誤:', error);
        showNotification('登出過程中發生錯誤，請重試', 'error');
    }
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
    console.log('顯示通知:', message, type);
    
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    showNotification,
    setupLogoutButton  // 暴露此方法供其他腳本調用
};

console.log('auth-state.js 載入完成，全域物件已設置'); 