document.addEventListener('DOMContentLoaded', () => {
    // 登入表單處理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            try {
                // 這裡應該是實際的 API 調用
                // const response = await fetch('/api/login', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({ email, password, remember })
                // });

                // 模擬登入成功
                console.log('登入資訊：', { email, password, remember });
                alert('登入成功！');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('登入失敗：', error);
                alert('登入失敗，請檢查您的帳號密碼。');
            }
        });
    }

    // 註冊表單處理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const motorcycle = document.getElementById('motorcycle').value;
            const terms = document.getElementById('terms').checked;

            // 表單驗證
            if (!validateUsername(username)) {
                alert('用戶名稱必須至少包含 3 個字符');
                return;
            }

            if (!validateEmail(email)) {
                alert('請輸入有效的電子郵件地址');
                return;
            }

            if (!validatePassword(password)) {
                alert('密碼必須至少包含 6 個字符');
                return;
            }

            if (password !== confirmPassword) {
                alert('兩次輸入的密碼不一致');
                return;
            }

            if (!terms) {
                alert('請同意服務條款和隱私政策');
                return;
            }

            try {
                // 這裡應該是實際的 API 調用
                // const response = await fetch('/api/register', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({
                //         username,
                //         email,
                //         password,
                //         motorcycle
                //     })
                // });

                // 模擬註冊成功
                console.log('註冊資訊：', { username, email, password, motorcycle });
                alert('註冊成功！');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('註冊失敗：', error);
                alert('註冊失敗，請稍後再試。');
            }
        });
    }

    // 社交媒體登入按鈕
    const facebookBtn = document.querySelector('.social-button.facebook');
    const googleBtn = document.querySelector('.social-button.google');

    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            // 實作 Facebook 登入/註冊
            console.log('Facebook 登入/註冊');
            alert('Facebook 登入/註冊功能開發中...');
        });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            // 實作 Google 登入/註冊
            console.log('Google 登入/註冊');
            alert('Google 登入/註冊功能開發中...');
        });
    }

    // 密碼顯示切換
    const setupPasswordToggle = (passwordInput) => {
        if (passwordInput) {
            const togglePassword = document.createElement('button');
            togglePassword.type = 'button';
            togglePassword.className = 'toggle-password';
            togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
            
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });

            // 將按鈕加入到密碼輸入框後面
            passwordInput.parentNode.style.position = 'relative';
            togglePassword.style.position = 'absolute';
            togglePassword.style.right = '10px';
            togglePassword.style.top = '50%';
            togglePassword.style.transform = 'translateY(-50%)';
            togglePassword.style.border = 'none';
            togglePassword.style.background = 'none';
            togglePassword.style.cursor = 'pointer';
            togglePassword.style.color = '#666';
            passwordInput.parentNode.appendChild(togglePassword);
        }
    };

    // 設置所有密碼輸入框的顯示切換
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(setupPasswordToggle);

    // 表單驗證函數
    const validateUsername = (username) => {
        return username.length >= 3;
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // 即時表單驗證
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (!validateEmail(emailInput.value)) {
                emailInput.style.borderColor = '#e63946';
                // 可以添加錯誤提示
            } else {
                emailInput.style.borderColor = '#28a745';
            }
        });
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            if (!validatePassword(passwordInput.value)) {
                passwordInput.style.borderColor = '#e63946';
                // 可以添加錯誤提示
            } else {
                passwordInput.style.borderColor = '#28a745';
            }
        });
    }

    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('blur', () => {
            if (confirmPasswordInput.value !== passwordInput.value) {
                confirmPasswordInput.style.borderColor = '#e63946';
                // 可以添加錯誤提示
            } else {
                confirmPasswordInput.style.borderColor = '#28a745';
            }
        });
    }

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', () => {
            if (!validateUsername(usernameInput.value)) {
                usernameInput.style.borderColor = '#e63946';
                // 可以添加錯誤提示
            } else {
                usernameInput.style.borderColor = '#28a745';
            }
        });
    }
}); 