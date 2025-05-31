/**
 * Authentication State Management - Unified handling of user login/logout states
 * This file is responsible for managing authentication states and UI updates across all pages
 */

console.log('auth-state.js loading...');

// Prevent multiple initializations
let authStateInitialized = false;

/**
 * Initialize authentication state when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth-state.js DOM loaded, starting initialization...');
    if (!authStateInitialized) {
        initializeAuthState();
        authStateInitialized = true;
    }
});

/**
 * Initialize authentication state management
 */
function initializeAuthState() {
    console.log('Initializing authentication state management...');
    
    // Check if authentication state exists
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    console.log('Current authentication state:', isLoggedIn);
    
    updateAuthUI();
    
    // Setup user menu interactions
    setupUserMenu();
    
    // Setup logout button - delayed execution to ensure DOM is fully loaded
    setTimeout(setupLogoutButton, 100);
    
    // Listen for localStorage changes (if state is modified in other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn') {
            console.log('Login state changed:', e.newValue);
            updateAuthUI();
        }
    });
    
    console.log('Authentication state management initialization complete');
}

/**
 * Check user login status and update UI
 */
function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'User';
    
    console.log('Updating UI - User login status:', isLoggedIn, 'Page:', window.location.pathname);
    console.log('Username:', username);
    
    // Find authentication-related elements - corrected selector names
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const usernameElement = document.querySelector('.user-menu .username');
    
    console.log('Found elements:', {
        authButtons: !!authButtons,
        userMenu: !!userMenu,
        usernameElement: !!usernameElement
    });
    
    if (isLoggedIn) {
        // User is logged in - hide login/register buttons, show user menu
        if (authButtons) {
            authButtons.style.display = 'none';
            console.log('Hiding login/register buttons');
        }
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            console.log('Showing user menu');
            
            // Update username
            if (usernameElement) {
                usernameElement.textContent = username;
                console.log('Updated username to:', username);
            }
        }
        
        console.log('✅ Logged in state: showing user menu, hiding login buttons');
    } else {
        // User is not logged in - hide user menu, show login/register buttons
        if (userMenu) {
            userMenu.style.display = 'none';
            console.log('Hiding user menu');
        }
        
        if (authButtons) {
            // Force show login/register buttons
            authButtons.style.display = 'flex';
            authButtons.style.visibility = 'visible';
            authButtons.style.opacity = '1';
            console.log('Showing login/register buttons');
        }
        
        console.log('✅ Not logged in state: showing login buttons, hiding user menu');
    }
    
    // Ensure both are not shown simultaneously (enhanced version)
    if (authButtons && userMenu) {
        const authVisible = authButtons.style.display !== 'none';
        const userVisible = userMenu.style.display !== 'none';
        
        if (authVisible && userVisible) {
            console.warn('⚠️ Detected login buttons and user menu shown simultaneously, forcing correction...');
            if (isLoggedIn) {
                authButtons.style.display = 'none';
            } else {
                userMenu.style.display = 'none';
                // Ensure login buttons are fully visible
                authButtons.style.display = 'flex';
                authButtons.style.visibility = 'visible';
                authButtons.style.opacity = '1';
            }
        }
        
        // Final state verification
        setTimeout(() => {
            const finalAuthVisible = authButtons.style.display !== 'none';
            const finalUserVisible = userMenu.style.display !== 'none';
            
            console.log('🔍 Final state verification:', {
                isLoggedIn,
                authButtonsVisible: finalAuthVisible,
                userMenuVisible: finalUserVisible,
                shouldShowAuth: !isLoggedIn,
                shouldShowUser: isLoggedIn
            });
            
            // Force correction if state is incorrect
            if ((!isLoggedIn && !finalAuthVisible) || (isLoggedIn && !finalUserVisible)) {
                console.warn('⚠️ Detected incorrect state, executing forced correction...');
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
                console.log('✅ Forced correction complete');
            }
        }, 10);
    }
}

/**
 * Setup user menu interaction functionality
 */
function setupUserMenu() {
    console.log('Setting up user menu interactions...');
    
    // 嘗試所有可能的選擇器
    const userMenuSelectors = [
        '.user-menu',
        '.nav-links .user-menu',
        '#userMenu'
    ];
    
    const userAvatarSelectors = [
        '.user-avatar',
        '.nav-links .user-avatar',
        '.user-menu .user-avatar'
    ];
    
    const dropdownSelectors = [
        '.dropdown-menu',
        '.nav-links .dropdown-menu',
        '.user-menu .dropdown-menu'
    ];
    
    let userMenu = null;
    let userAvatar = null;
    let dropdownMenu = null;
    
    // 尋找用戶選單元素
    for (const selector of userMenuSelectors) {
        userMenu = document.querySelector(selector);
        if (userMenu) {
            console.log('Found user menu with selector:', selector);
            break;
        }
    }
    
    // 尋找用戶頭像元素
    for (const selector of userAvatarSelectors) {
        userAvatar = document.querySelector(selector);
        if (userAvatar) {
            console.log('Found user avatar with selector:', selector);
            break;
        }
    }
    
    // 尋找下拉選單元素
    for (const selector of dropdownSelectors) {
        dropdownMenu = document.querySelector(selector);
        if (dropdownMenu) {
            console.log('Found dropdown menu with selector:', selector);
            break;
        }
    }
    
    console.log('User menu elements found:', {
        userMenu: !!userMenu,
        userAvatar: !!userAvatar,
        dropdownMenu: !!dropdownMenu
    });
    
    if (userMenu && userAvatar && dropdownMenu) {
        console.log('All elements found, setting up event listeners...');
        
        // 移除可能存在的舊事件監聽器
        const newUserAvatar = userAvatar.cloneNode(true);
        userAvatar.parentNode.replaceChild(newUserAvatar, userAvatar);
        userAvatar = newUserAvatar;
        
        // 更新dropdownMenu引用
        dropdownMenu = userMenu.querySelector('.dropdown-menu');
        
        // 為用戶頭像添加點擊事件
        userAvatar.addEventListener('click', function(e) {
            console.log('User avatar clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = dropdownMenu.classList.contains('show');
            console.log('Dropdown currently visible:', isVisible);
            
            if (isVisible) {
                dropdownMenu.classList.remove('show');
                console.log('Dropdown hidden');
            } else {
                dropdownMenu.classList.add('show');
                console.log('Dropdown shown');
            }
        });
        
        // 為整個用戶選單添加點擊事件（備用）
        userMenu.addEventListener('click', function(e) {
            console.log('User menu clicked!');
            
            // 如果點擊的是頭像區域，切換下拉選單
            if (e.target.closest('.user-avatar')) {
                e.preventDefault();
                e.stopPropagation();
                
                const isVisible = dropdownMenu.classList.contains('show');
                console.log('Dropdown currently visible (menu click):', isVisible);
                
                if (isVisible) {
                    dropdownMenu.classList.remove('show');
                    console.log('Dropdown hidden (menu click)');
                } else {
                    dropdownMenu.classList.add('show');
                    console.log('Dropdown shown (menu click)');
                }
            }
        });
        
        // 點擊外部關閉下拉選單
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                if (dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                    console.log('Dropdown closed by outside click');
                }
            }
        });
        
        // 阻止下拉選單內的點擊事件冒泡（除了登出按鈕）
        dropdownMenu.addEventListener('click', function(e) {
            if (e.target.id !== 'logout' && !e.target.classList.contains('logout-btn')) {
                e.stopPropagation();
                console.log('Dropdown click prevented from bubbling');
            } else {
                console.log('Logout button clicked in dropdown');
            }
        });
        
        // 為下拉選單項目添加hover效果
        const menuItems = dropdownMenu.querySelectorAll('a');
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
        
        console.log('✅ User menu setup complete');
    } else {
        console.warn('⚠️ Could not find all required user menu elements');
        console.log('Missing elements:', {
            userMenu: !userMenu,
            userAvatar: !userAvatar,
            dropdownMenu: !dropdownMenu
        });
        
        // 重試設置
        setTimeout(() => {
            console.log('Retrying user menu setup...');
            setupUserMenu();
        }, 1000);
    }
}

/**
 * Setup logout button functionality
 */
function setupLogoutButton() {
    console.log('Setting up logout button functionality...');
    
    // Find all possible logout buttons
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
    
    console.log('Found logout buttons:', logoutButtons.length, logoutButtons);
    
    logoutButtons.forEach((button, index) => {
        // Remove old event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener
        newButton.addEventListener('click', handleLogoutClick);
        console.log(`Logout button ${index + 1} event binding complete:`, newButton);
    });
    
    // If no logout buttons found, retry after delay
    if (logoutButtons.length === 0) {
        console.log('No logout buttons found, retrying in 1 second...');
        setTimeout(setupLogoutButton, 1000);
    }
}

/**
 * Logout button click handler
 */
function handleLogoutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Logout button clicked, processing logout...');
    
    // Confirm logout
    if (confirm('Are you sure you want to log out?')) {
        handleLogout();
    } else {
        console.log('Logout cancelled by user');
    }
}

/**
 * Handle logout process
 */
function handleLogout() {
    console.log('Processing logout...');
    
    try {
        // Clear authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        
        // Update UI
        updateAuthUI();
        
        // Show success message
        showNotification('Successfully logged out', 'success');
        
        // Redirect to home page after short delay
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        
        console.log('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error during logout. Please try again.', 'error');
    }
}

/**
 * Set authentication state with user data
 */
function setAuthState(userData) {
    try {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', userData.username || 'User');
        if (userData.token) localStorage.setItem('userToken', userData.token);
        if (userData.role) localStorage.setItem('userRole', userData.role);
        
        updateAuthUI();
        console.log('Authentication state updated successfully');
    } catch (error) {
        console.error('Error setting auth state:', error);
    }
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isUserLoggedIn()) return null;
    
    return {
        username: localStorage.getItem('username'),
        token: localStorage.getItem('userToken'),
        role: localStorage.getItem('userRole')
    };
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Expose to global scope
window.authState = {
    updateAuthUI,
    setAuthState,
    handleLogout,
    isUserLoggedIn,
    getCurrentUser,
    showNotification,
    setupLogoutButton  // Expose this method for other scripts to call
};

console.log('auth-state.js loading complete, global object set up'); 