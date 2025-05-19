/**
 * MotoMod 登入頁面 JavaScript
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
        emailError.textContent = '';
    });

    // 密碼驗證
    passwordInput.addEventListener('blur', function() {
        validatePassword(passwordInput, passwordError);
    });

    // 即時輸入時清除錯誤
    passwordInput.addEventListener('input', function() {
        passwordInput.parentElement.classList.remove('error', 'success');
        passwordError.textContent = '';
    });
}

/**
 * 驗證電子郵件
 */
function validateEmail(input, errorElement) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === '') {
        showError(input, errorElement, '請輸入電子郵件');
        return false;
    } else if (!emailRegex.test(value)) {
        showError(input, errorElement, '請輸入有效的電子郵件格式');
        return false;
    } else {
        input.parentElement.classList.remove('error');
        input.parentElement.classList.add('success');
        errorElement.textContent = '';
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
        errorElement.textContent = '';
        return true;
    }
}

/**
 * 顯示錯誤訊息
 */
function showError(input, errorElement, message) {
    input.parentElement.classList.add('error');
    input.parentElement.classList.remove('success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
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
            loginForm.classList.add('loading');
            
            try {
                // 模擬API請求
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // 這裡可以添加實際的API請求
                // const response = await fetch('/api/login', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({
                //         email: emailInput.value,
                //         password: passwordInput.value,
                //         remember: document.getElementById('remember').checked
                //     })
                // });
                
                // 設置用戶登入狀態
                localStorage.setItem('isLoggedIn', 'true');
                
                // 儲存用戶資訊
                const username = emailInput.value.split('@')[0]; // 從電子郵件擷取用戶名
                localStorage.setItem('username', username);
                
                // 模擬登入成功
                showNotification('登入成功！即將跳轉到首頁...', 'success');
                
                // 假設登入成功後重定向到首頁
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 1500);
            } catch (error) {
                showNotification('登入失敗，請稍後再試', 'error');
            } finally {
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
    document.querySelectorAll('.login-form-container, .login-image-container').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });

    // 使用 setTimeout 確保 CSS 轉換生效
    setTimeout(() => {
        document.querySelectorAll('.login-form-container, .login-image-container').forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = 'all 0.5s ease-out';
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
            // 實現 Google 登入邏輯
            showNotification('Google 登入功能即將推出', 'info');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            // 實現 Facebook 登入邏輯
            showNotification('Facebook 登入功能即將推出', 'info');
        });
    }
}

/**
 * 顯示通知訊息
 */
function showNotification(message, type = 'info') {
    // 檢查是否已存在通知元素
    let notification = document.querySelector('.notification');
    
    // 如果不存在，創建新的通知元素
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // 設置通知類型和訊息
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加顯示類別
    notification.classList.add('show');

    // 設定自動消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 添加自定義動畫
document.addEventListener('DOMContentLoaded', function() {
    // 為表單添加載入動畫
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.style.opacity = '0';
        loginForm.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateY(0)';
            loginForm.style.transition = 'all 0.5s ease-out';
        }, 100);
    }
}); 