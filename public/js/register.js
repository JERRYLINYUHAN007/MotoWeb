/**
 * MotoWeb 註冊頁面功能
 * 處理表單驗證、密碼強度檢查、實際註冊API連接
 */
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    console.log('註冊頁面JavaScript已載入');
    console.log('找到的元素:', {
        registerForm: !!registerForm,
        passwordInput: !!passwordInput,
        confirmPasswordInput: !!confirmPasswordInput,
        togglePasswordBtns: togglePasswordBtns.length
    });
    
    // 檢查是否已登入，如果是則重定向
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        console.log('用戶已登入，重定向到首頁...');
        showNotification('您已登入，正在跳轉到首頁...', 'info');
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
        return;
    }
    
    // 密碼顯示切換
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // 更新圖標
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
            
            // 更新無障礙標籤
            this.setAttribute('aria-label', type === 'password' ? '顯示密碼' : '隱藏密碼');
        });
    });
    
    // 密碼強度檢查
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            updatePasswordStrength(strength);
        });
    }
    
    // 即時表單驗證
    initRealTimeValidation();
    
    // 表單提交處理
    if (registerForm) {
        console.log('設置表單提交事件監聽器...');
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('表單提交事件觸發');
            
            // 移除所有錯誤提示
            clearErrors();
            
            // 獲取表單數據
            const formData = new FormData(this);
            const firstName = formData.get('firstName')?.trim() || '';
            const lastName = formData.get('lastName')?.trim() || '';
            const username = formData.get('username')?.trim() || '';
            const email = formData.get('email')?.trim() || '';
            const password = formData.get('password')?.trim() || '';
            const confirmPassword = formData.get('confirmPassword')?.trim() || '';
            const terms = formData.get('terms') === 'on';
            
            console.log('表單數據:', { firstName, lastName, username, email, password: '***', confirmPassword: '***', terms });
            
            // 驗證表單
            let isValid = true;
            
            // 驗證名字
            if (!firstName) {
                showError('firstName', '請輸入您的名字');
                isValid = false;
            } else if (firstName.length < 1) {
                showError('firstName', '名字不能為空');
                isValid = false;
            }
            
            // 驗證姓氏
            if (!lastName) {
                showError('lastName', '請輸入您的姓氏');
                isValid = false;
            } else if (lastName.length < 1) {
                showError('lastName', '姓氏不能為空');
                isValid = false;
            }
            
            // 驗證用戶名
            if (!username) {
                showError('username', '請輸入用戶名稱');
                isValid = false;
            } else if (username.length < 3) {
                showError('username', '用戶名稱必須至少包含 3 個字符');
                isValid = false;
            } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                showError('username', '用戶名稱只能包含字母、數字、底線和破折號');
                isValid = false;
            }
            
            // 驗證電子郵件
            if (!email) {
                showError('email', '請輸入電子郵件地址');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('email', '請輸入有效的電子郵件地址');
                isValid = false;
            }
            
            // 驗證密碼
            if (!password) {
                showError('password', '請設置密碼');
                isValid = false;
            } else if (password.length < 8) {
                showError('password', '密碼長度必須至少為 8 個字符');
                isValid = false;
            } else {
                const passwordStrength = checkPasswordStrength(password);
                if (passwordStrength.score < 2) {
                    showError('password', '密碼強度不足，請包含大小寫字母、數字和特殊符號');
                    isValid = false;
                }
            }
            
            // 驗證確認密碼
            if (!confirmPassword) {
                showError('confirmPassword', '請確認您的密碼');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPassword', '兩次輸入的密碼不一致');
                isValid = false;
            }
            
            // 驗證條款同意
            if (!terms) {
                showError('terms', '請同意使用條款和隱私政策才能註冊');
                isValid = false;
            }
            
            console.log('表單驗證結果:', isValid);
            
            if (!isValid) {
                // 滾動到第一個錯誤欄位
                const firstError = document.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // 顯示載入狀態
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 註冊中...';
            
            try {
                console.log('發送註冊請求...', { username, email, firstName, lastName });

                // 向後端發送註冊請求
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        firstName,
                        lastName
                    })
                });
                
                const data = await response.json();
                console.log('註冊回應:', { success: response.ok, status: response.status });
                
                if (response.ok) {
                    // 註冊成功
                    console.log('註冊成功，設置認證狀態...');
                    
                    // 設置認證狀態
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userId', data.user.id);
                    
                    // 使用auth-state.js設置認證狀態
                    if (typeof window.authState !== 'undefined' && window.authState.setAuthState) {
                        window.authState.setAuthState(data.user);
                    }
                    
                    // 顯示成功訊息
                    showNotification('註冊成功！歡迎加入 MotoWeb 大家庭', 'success');
                    
                    console.log('準備跳轉到首頁...');
                    
                    // 2秒後重定向到首頁
                    setTimeout(function() {
                        console.log('執行頁面跳轉...');
                        window.location.href = 'index.html';
                    }, 2000);
                    
                } else {
                    // 註冊失敗
                    console.error('註冊失敗:', data.error);
                    
                    // 根據錯誤類型顯示不同的錯誤訊息
                    if (data.error.includes('用戶名') && data.error.includes('已被使用')) {
                        showError('username', '用戶名稱已被其他人使用，請選擇其他名稱');
                        document.getElementById('username').focus();
                    } else if (data.error.includes('電子郵件') && data.error.includes('已被使用')) {
                        showError('email', '此電子郵件地址已被註冊，請使用其他郵件地址或嘗試登入');
                        document.getElementById('email').focus();
                    } else if (data.error.includes('用戶名或電子郵件已被使用')) {
                        showError('username', '用戶名稱已被使用');
                        showError('email', '電子郵件地址已被註冊');
                    } else if (data.error.includes('所有欄位為必填')) {
                        showNotification('請填寫所有必填欄位', 'error');
                    } else {
                        showNotification(data.error || '註冊失敗，請稍後再試', 'error');
                    }
                }
                
            } catch (error) {
                console.error('註冊過程中發生網路錯誤:', error);
                
                // 網路錯誤處理
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showNotification('無法連接到伺服器，請檢查網路連線', 'error');
                } else {
                    showNotification('註冊過程中發生錯誤，請稍後再試', 'error');
                }
                
            } finally {
                // 恢復按鈕狀態
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    } else {
        console.error('未找到註冊表單元素 #registerForm');
    }
    
    // 社群註冊按鈕處理
    initSocialRegistration();
});

/**
 * 初始化即時表單驗證
 */
function initRealTimeValidation() {
    // 用戶名即時驗證
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value) {
                if (value.length < 3) {
                    showError('username', '用戶名稱必須至少包含 3 個字符');
                } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    showError('username', '用戶名稱只能包含字母、數字、底線和破折號');
                } else {
                    clearFieldError('username');
                }
            }
        });
    }
    
    // 電子郵件即時驗證
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value) {
                if (!validateEmail(value)) {
                    showError('email', '請輸入有效的電子郵件地址');
                } else {
                    clearFieldError('email');
                }
            }
        });
    }
    
    // 密碼確認即時驗證
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordInput = document.getElementById('password');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            if (confirmPassword && password !== confirmPassword) {
                showError('confirmPassword', '兩次輸入的密碼不一致');
            } else if (confirmPassword && password === confirmPassword) {
                clearFieldError('confirmPassword');
            }
        });
    }
}

/**
 * 初始化社交註冊
 */
function initSocialRegistration() {
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');

    if (googleBtn) {
        googleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: 實現 Google 註冊邏輯
            showNotification('Google 註冊功能即將推出', 'info');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: 實現 Facebook 註冊邏輯
            showNotification('Facebook 註冊功能即將推出', 'info');
        });
    }
}

/**
 * 檢查密碼強度
 */
function checkPasswordStrength(password) {
    let score = 0;
    let strength = {
        score: 0,
        text: '極弱',
        class: 'strength-weak'
    };
    
    if (!password) {
        return strength;
    }
    
    // 長度檢查
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // 複雜度檢查
    if (/[A-Z]/.test(password)) score++; // 大寫字母
    if (/[a-z]/.test(password)) score++; // 小寫字母
    if (/[0-9]/.test(password)) score++; // 數字
    if (/[^A-Za-z0-9]/.test(password)) score++; // 特殊符號
    
    // 設定強度等級
    if (score >= 5) {
        strength = {
            score: 3,
            text: '非常強',
            class: 'strength-very-strong'
        };
    } else if (score >= 4) {
        strength = {
            score: 3,
            text: '強',
            class: 'strength-strong'
        };
    } else if (score >= 3) {
        strength = {
            score: 2,
            text: '中等',
            class: 'strength-medium'
        };
    } else if (score >= 1) {
        strength = {
            score: 1,
            text: '弱',
            class: 'strength-weak'
        };
    }
    
    return strength;
}

/**
 * 更新密碼強度指示器
 */
function updatePasswordStrength(strength) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (strengthFill && strengthText) {
        // 移除所有強度類別
        strengthFill.className = 'strength-fill';
        
        // 添加當前強度類別
        if (strength.class) {
            strengthFill.classList.add(strength.class);
        }
        
        // 更新強度文字
        strengthText.textContent = `密碼強度：${strength.text}`;
        
        // 如果密碼為空，顯示提示
        if (!strength.score) {
            strengthText.textContent = '請輸入至少8個字元的密碼';
        }
    }
}

/**
 * 驗證電子郵件格式
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

/**
 * 顯示錯誤訊息
 */
function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) {
        console.error('找不到欄位:', fieldName);
        return;
    }
    
    const formGroup = field.closest('.form-group') || field.closest('.terms-group');
    if (!formGroup) {
        console.error('找不到表單群組:', fieldName);
        return;
    }
    
    // 添加錯誤樣式
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    // 為輸入框添加錯誤樣式
    if (field.tagName === 'INPUT') {
        field.style.borderColor = '#ff6b6b';
    }
    
    // 檢查是否已存在錯誤訊息元素
    let errorElement = formGroup.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // 添加搖晃動畫
    formGroup.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        formGroup.style.animation = '';
    }, 500);
}

/**
 * 清除特定欄位的錯誤訊息
 */
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    const formGroup = field.closest('.form-group') || field.closest('.terms-group');
    if (!formGroup) return;
    
    // 移除錯誤樣式
    formGroup.classList.remove('error');
    
    // 恢復輸入框樣式
    if (field.tagName === 'INPUT') {
        field.style.borderColor = '';
    }
    
    // 移除錯誤訊息
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
}

/**
 * 清除所有錯誤訊息
 */
function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error, .terms-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        
        // 恢復輸入框樣式
        const input = group.querySelector('input');
        if (input) {
            input.style.borderColor = '';
        }
        
        // 移除錯誤訊息
        const errorElement = group.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    });
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

// 添加搖晃動畫CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style); 