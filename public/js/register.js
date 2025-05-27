/**
 * 註冊頁面功能
 */
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
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
    
    // 表單提交處理
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 移除所有錯誤提示
            clearErrors();
            
            // 獲取表單數據
            const formData = new FormData(this);
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const terms = formData.get('terms') === 'on';
            
            // 驗證表單
            let isValid = true;
            
            // 驗證用戶名
            if (!username || username.length < 3) {
                showError('username', '用戶名稱必須至少包含 3 個字符');
                isValid = false;
            }
            
            // 驗證電子郵件
            if (!validateEmail(email)) {
                showError('email', '請輸入有效的電子郵件地址');
                isValid = false;
            }
            
            // 驗證密碼
            if (!password || password.length < 8) {
                showError('password', '密碼長度必須至少為 8 個字符');
                isValid = false;
            } else if (checkPasswordStrength(password).score < 2) {
                showError('password', '密碼強度不足，請包含大小寫字母、數字和特殊符號');
                isValid = false;
            }
            
            // 驗證確認密碼
            if (password !== confirmPassword) {
                showError('confirmPassword', '兩次輸入的密碼不一致');
                isValid = false;
            }
            
            // 驗證條款同意
            if (!terms) {
                showError('terms', '請同意使用條款和隱私政策');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // 顯示載入狀態
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 註冊中...';
            
            try {
                // 這裡應該是實際的 API 請求
                // const response = await fetch('/api/register', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({
                //         username,
                //         email,
                //         password
                //     })
                // });
                
                // 模擬 API 請求
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // 模擬成功註冊
                // 實際應用中，這裡應該根據 API 響應來處理
                localStorage.setItem('isLoggedIn', 'true');
                
                // 儲存用戶資訊
                localStorage.setItem('username', username);
                
                // 設置模擬的認證token（實際應用中會從服務器獲取）
                const mockToken = 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('token', mockToken);
                
                // 重定向到首頁
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('註冊失敗:', error);
                showError('general', '註冊失敗，請稍後再試');
                
            } finally {
                // 恢復按鈕狀態
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // 社群註冊按鈕處理
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 這裡應該實現社群註冊邏輯
            alert('社群註冊功能開發中...');
        });
    });
});

/**
 * 檢查密碼強度
 */
function checkPasswordStrength(password) {
    let score = 0;
    let strength = {
        score: 0,
        text: '弱',
        class: 'weak'
    };
    
    // 長度檢查
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // 複雜度檢查
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // 設定強度等級
    if (score >= 5) {
        strength = {
            score: 3,
            text: '強',
            class: 'strong'
        };
    } else if (score >= 3) {
        strength = {
            score: 2,
            text: '中',
            class: 'medium'
        };
    }
    
    return strength;
}

/**
 * 更新密碼強度指示器
 */
function updatePasswordStrength(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (strengthBar && strengthText) {
        // 移除所有強度類別
        strengthBar.classList.remove('weak', 'medium', 'strong');
        // 添加當前強度類別
        strengthBar.classList.add(strength.class);
        // 更新強度文字
        strengthText.textContent = `密碼強度：${strength.text}`;
    }
}

/**
 * 驗證電子郵件格式
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * 顯示錯誤訊息
 */
function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    
    // 檢查是否已存在錯誤訊息元素
    let errorElement = formGroup.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

/**
 * 清除所有錯誤訊息
 */
function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        const errorElement = group.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
    });
} 