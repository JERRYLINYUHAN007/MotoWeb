/**
 * MotoWeb 登入頁面 JavaScript
 * 處理表單驗證、顯示密碼切換等功能
 */

// DOM 準備完成後執行
document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initPasswordToggle();
    initFormSubmission();
    initLoginAnimations();
    initSocialLogin();
});

/**
 * 初始化表單驗證
 */
function initFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    if (!loginForm || !emailInput || !passwordInput) return;

    // 電子郵件驗證
    emailInput.addEventListener('blur', function() {
        validateEmail(emailInput, emailError);
    });

    // 即時輸入時清除錯誤
    emailInput.addEventListener('input', function() {
        emailInput.parentElement.classList.remove('error', 'success');
        if (emailError) emailError.textContent = '';
    });

    // 密碼驗證
    passwordInput.addEventListener('blur', function() {
        validatePassword(passwordInput, passwordError);
    });

    // 即時輸入時清除錯誤
    passwordInput.addEventListener('input', function() {
        passwordInput.parentElement.classList.remove('error', 'success');
        if (passwordError) passwordError.textContent = '';
    });
}

/**
 * 驗證電子郵件
 */
function validateEmail(input, errorElement) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === '') {
        showError(input, errorElement, '請輸入電子郵件或用戶名稱');
        return false;
    } else if (value.includes('@') && !emailRegex.test(value)) {
        showError(input, errorElement, '請輸入有效的電子郵件格式');
        return false;
    } else {
        input.parentElement.classList.remove('error');
        input.parentElement.classList.add('success');
        if (errorElement) errorElement.textContent = '';
        return true;
    }
}

/**
 * 驗證密碼
 */
function validatePassword(input, errorElement) {
    const value = input.value.trim();

    if (value === '') {
        showError(input, errorElement, '請輸入密碼');
        return false;
    } else if (value.length < 6) {
        showError(input, errorElement, '密碼長度至少需要6個字元');
        return false;
    } else {
        input.parentElement.classList.remove('error');
        input.parentElement.classList.add('success');
        if (errorElement) errorElement.textContent = '';
        return true;
    }
}

/**
 * 顯示錯誤訊息
 */
function showError(input, errorElement, message) {
    input.parentElement.classList.add('error');
    input.parentElement.classList.remove('success');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // 添加震動效果
    input.parentElement.classList.add('shake');
    setTimeout(() => {
        input.parentElement.classList.remove('shake');
    }, 500);
}

/**
 * 初始化密碼顯示/隱藏功能
 */
function initPasswordToggle() {
    const togglePasswordButton = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (!togglePasswordButton || !passwordInput) return;

    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // 切換眼睛圖示
        const icon = this.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            this.setAttribute('aria-label', '隱藏密碼');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            this.setAttribute('aria-label', '顯示密碼');
        }
    });
}

/**
 * 初始化表單提交
 */
function initFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 執行表單驗證
        const isEmailValid = validateEmail(emailInput, emailError);
        const isPasswordValid = validatePassword(passwordInput, passwordError);

        // 如果表單驗證通過，則提交表單
        if (isEmailValid && isPasswordValid) {
            // 顯示載入狀態
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登入中...';
            loginForm.classList.add('loading');
            
            try {
                // 準備登入資料
                const loginData = {
                    username: emailInput.value.trim(), // 後端支援用戶名或email登入
                    password: passwordInput.value,
                    remember: document.getElementById('remember')?.checked || false
                };

                console.log('發送登入請求...', { username: loginData.username, remember: loginData.remember });

                // 向後端發送登入請求
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                });

                const data = await response.json();
                console.log('登入回應:', { success: response.ok, status: response.status });

                if (response.ok) {
                    // 登入成功
                    console.log('登入成功，設置認證狀態...');

                    // 設置認證狀態
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userId', data.user.id);
                    
                    // 如果選擇記住我，設置較長的過期時間
                    if (loginData.remember) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    // 使用auth-state.js設置認證狀態
                    if (typeof window.authState !== 'undefined' && window.authState.setAuthState) {
                        window.authState.setAuthState(data.user);
                    }

                    // 顯示成功訊息
                    showNotification('登入成功！歡迎回到 MotoWeb', 'success');
                    
                    // 1.5秒後重定向到首頁
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1500);

                } else {
                    // 登入失敗
                    console.error('登入失敗:', data.error);
                    
                    // 根據錯誤類型顯示不同的錯誤訊息
                    let errorMessage = data.error || '登入失敗，請檢查您的憑證';
                    
                    if (data.error.includes('用戶名或密碼不正確')) {
                        // 顯示在密碼欄位
                        showError(passwordInput, passwordError, '用戶名或密碼不正確');
                        passwordInput.value = ''; // 清空密碼欄位
                        passwordInput.focus();
                    } else if (data.error.includes('用戶名和密碼為必填項')) {
                        showError(emailInput, emailError, '請輸入用戶名或電子郵件');
                        showError(passwordInput, passwordError, '請輸入密碼');
                    } else {
                        showNotification(errorMessage, 'error');
                    }
                }

            } catch (error) {
                console.error('登入過程中發生網路錯誤:', error);
                
                // 網路錯誤處理
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showNotification('無法連接到伺服器，請檢查網路連線', 'error');
                } else {
                    showNotification('登入過程中發生錯誤，請稍後再試', 'error');
                }
                
            } finally {
                // 恢復按鈕狀態
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                loginForm.classList.remove('loading');
            }
        }
    });
}

/**
 * 初始化登入動畫
 */
function initLoginAnimations() {
    // 添加表單載入動畫
    const containers = document.querySelectorAll('.login-form-container, .login-image-container');
    
    containers.forEach(element => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
        }
    });

    // 使用 setTimeout 確保 CSS 轉換生效
    setTimeout(() => {
        containers.forEach(element => {
            if (element) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'all 0.5s ease-out';
            }
        });
    }, 100);
}

/**
 * 初始化社交登入
 */
function initSocialLogin() {
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            // TODO: 實現 Google 登入邏輯
            showNotification('Google 登入功能即將推出', 'info');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            // TODO: 實現 Facebook 登入邏輯
            showNotification('Facebook 登入功能即將推出', 'info');
        });
    }
}

/**
 * 顯示通知訊息
 */
function showNotification(message, type = 'info') {
    // 檢查是否有全域的showNotification函數
    if (typeof window.authState !== 'undefined' && window.authState.showNotification) {
        window.authState.showNotification(message, type);
        return;
    }
    
    // 檢查是否已存在通知元素
    let notification = document.querySelector('.notification');
    
    if (notification) {
        notification.remove();
    }
    
    notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // 設置樣式
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: 'Noto Sans TC', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 觸發進入動畫
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // 自動移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// 檢查是否已登入，如果是則重定向
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        console.log('用戶已登入，重定向到首頁...');
        showNotification('您已登入，正在跳轉到首頁...', 'info');
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
    }
}); 