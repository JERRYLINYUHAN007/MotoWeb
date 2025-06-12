/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
/**
 * MotoWeb Login Page JavaScript
 * Handles form validation, password toggle, and login functionality
 */

// Execute when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initPasswordToggle();
    initFormSubmission();
    initLoginAnimations();
    initSocialLogin();
    initAdvancedAnimations();
    addErrorStyles();
});

/**
 * Initialize advanced animations and interactions
 */
function initAdvancedAnimations() {
    // Add floating animation to login container
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        // Subtle floating effect
        let floatDirection = 1;
        setInterval(() => {
            const currentTransform = loginContainer.style.transform || '';
            const baseTransform = currentTransform.replace(/translateY\([^)]*\)/, '');
            loginContainer.style.transform = `${baseTransform} translateY(${floatDirection * 2}px)`;
            floatDirection *= -1;
        }, 3000);
    }

    // Add parallax effect to background
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
        }
    });

    // Add ripple effect to buttons
    addRippleEffect();
    
    // Add typing animation to inputs
    addTypingAnimation();
}

/**
 * Add ripple effect to buttons
 */
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-social');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add typing animation to inputs
 */
function addTypingAnimation() {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.classList.add('typing');
                setTimeout(() => {
                    wrapper.classList.remove('typing');
                }, 300);
            }
        });
    });
    
    // Add typing animation CSS
    const style = document.createElement('style');
    style.textContent = `
        .input-wrapper.typing {
            animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    if (!loginForm || !emailInput || !passwordInput) return;

    // Email validation
    emailInput.addEventListener('blur', function() {
        validateEmail(emailInput, emailError);
    });

    // Clear error on input
    emailInput.addEventListener('input', function() {
        clearError(emailInput, emailError);
    });

    // Password validation
    passwordInput.addEventListener('blur', function() {
        validatePassword(passwordInput, passwordError);
    });

    // Clear error on input
    passwordInput.addEventListener('input', function() {
        clearError(passwordInput, passwordError);
    });

    // Add focus animations
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.classList.add('focused');
            }
        });

        input.addEventListener('blur', function() {
            const wrapper = this.closest('.input-wrapper');
            if (wrapper) {
                wrapper.classList.remove('focused');
            }
        });
    });
}

/**
 * Validate email
 */
function validateEmail(input, errorElement) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === '') {
        showError(input, errorElement, 'Please enter your email address');
        return false;
    } else if (value.includes('@') && !emailRegex.test(value)) {
        showError(input, errorElement, 'Please enter a valid email address');
        return false;
    } else {
        showSuccess(input, errorElement);
        return true;
    }
}

/**
 * Validate password
 */
function validatePassword(input, errorElement) {
    const value = input.value.trim();

    if (value === '') {
        showError(input, errorElement, 'Please enter your password');
        return false;
    } else if (value.length < 6) {
        showError(input, errorElement, 'Password must be at least 6 characters');
        return false;
    } else {
        showSuccess(input, errorElement);
        return true;
    }
}

/**
 * Show error message with animation
 */
function showError(input, errorElement, message) {
    const wrapper = input.closest('.input-wrapper') || input.parentElement;
    wrapper.classList.add('error');
    wrapper.classList.remove('success', 'focused');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    // Add enhanced shake effect
    wrapper.classList.add('shake');
    setTimeout(() => {
        wrapper.classList.remove('shake');
    }, 500);

    // Add error sound effect (visual feedback)
    const icon = wrapper.querySelector('.input-icon');
    if (icon) {
        icon.style.animation = 'errorPulse 0.5s ease-in-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
    }
}

/**
 * Show success state with animation
 */
function showSuccess(input, errorElement) {
    const wrapper = input.closest('.input-wrapper') || input.parentElement;
    wrapper.classList.add('success');
    wrapper.classList.remove('error');
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }

    // Add success animation to icon
    const icon = wrapper.querySelector('.input-icon');
    if (icon) {
        icon.style.animation = 'successPulse 0.5s ease-in-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
    }
}

/**
 * Clear error message
 */
function clearError(input, errorElement) {
    const wrapper = input.closest('.input-wrapper') || input.parentElement;
    wrapper.classList.remove('error');
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

/**
 * Initialize password show/hide functionality
 */
function initPasswordToggle() {
    const togglePasswordButton = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (!togglePasswordButton || !passwordInput) return;

    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Enhanced eye icon animation
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.setAttribute('aria-label', 'Hide password');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.setAttribute('aria-label', 'Show password');
            }
            icon.style.transform = 'scale(1)';
        }, 150);
    });
}

/**
 * Initialize form submission
 */
function initFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const submitButton = this.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput) {
            console.error('Required form elements not found');
            showNotification('Form error. Please refresh the page.', 'error');
            return;
        }

        // Clear previous errors
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);

        // Validate form
        const isEmailValid = validateEmail(emailInput, emailError);
        const isPasswordValid = validatePassword(passwordInput, passwordError);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        // Enhanced loading state with spinner
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loading-spinner"></div> Logging in...';
        submitButton.style.transform = 'translateY(-1px)';
        
        try {
            // Prepare login data
            const loginData = {
                username: emailInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                remember: document.getElementById('remember')?.checked || false
            };

            // Add form loading animation
            loginForm.classList.add('form-loading');

            // First try backend API
            let loginSuccess = false;
            let userData = null;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: loginData.username,
                        password: loginData.password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    userData = {
                        username: data.user.username,
                        email: data.user.email,
                        id: data.user.id,
                        token: data.token
                    };
                    
                    loginSuccess = true;
                } else if (response.status === 429) {
                    // Handle rate limiting
                    const errorData = await response.json();
                    if (errorData.lockedUntil) {
                        showLoginLockdown(errorData.lockedUntil, errorData.remainingMinutes);
                        return; // Exit early, don't try demo login
                    } else {
                        throw new Error(errorData.error || 'Too many attempts');
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Backend login failed');
                }
            } catch (backendError) {
                // Fallback to demo login
                const demoResult = await simulateLogin(loginData);
                
                if (demoResult.success) {
                    userData = {
                        username: loginData.email.split('@')[0],
                        email: loginData.email,
                        id: 'demo_user_' + Date.now(),
                        token: 'demo_token_' + Date.now()
                    };
                    loginSuccess = true;
                }
            }

            if (loginSuccess && userData) {
                // Set authentication state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', userData.username);
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userId', userData.id);
                
                // Set registration date if not already set (for existing users)
                if (!localStorage.getItem('registrationDate')) {
                    localStorage.setItem('registrationDate', new Date().toISOString().split('T')[0]);
                }
                
                if (userData.token) {
                    localStorage.setItem('token', userData.token);
                }
                
                if (loginData.remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Use auth-state.js if available
                if (typeof window.authState !== 'undefined' && window.authState.setAuthState) {
                    window.authState.setAuthState(userData);
                }

                // Enhanced success animation
                submitButton.innerHTML = '<i class="fas fa-check"></i> Success!';
                submitButton.style.background = 'linear-gradient(45deg, #4CAF50, #00C851)';
                loginForm.classList.add('form-success');

                // Show success message
                showNotification('Login successful! Welcome to MotoWeb', 'success');
                
                // Redirect with fade out effect
                setTimeout(function() {
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.5s ease-out';
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 500);
                }, 1500);
            } else {
                throw new Error('Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            
            loginForm.classList.add('form-error');
            setTimeout(() => {
                loginForm.classList.remove('form-error');
            }, 500);
            
            if (error.message === 'Invalid credentials' || error.message.includes('password') || error.message.includes('username')) {
                showError(passwordInput, passwordError, 'Invalid email or password. Please try the test accounts.');
                passwordInput.value = '';
                passwordInput.focus();
            } else {
                showNotification('Login failed. Please try again or use the test accounts.', 'error');
            }
            
        } finally {
            // Restore button state with animation (unless locked)
            loginForm.classList.remove('form-loading');
            
            // Only restore button if not locked
            if (!loginForm.classList.contains('form-locked')) {
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    submitButton.style.transform = '';
                    submitButton.style.background = '';
                }, 300);
            }
        }
    });
}

/**
 * Simulate login API call (demo mode)
 */
async function simulateLogin(loginData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Demo accounts - these will work even without backend
            const validCredentials = [
                { email: 'test@motoweb.com', password: 'password123' },
                { email: 'admin@motoweb.com', password: 'admin123' },
                { email: 'user@motoweb.com', password: 'user123' },
                { email: 'demo@motoweb.com', password: 'demo123' },
                { email: 'guest@motoweb.com', password: 'guest123' }
            ];
            
            const isValid = validCredentials.some(cred => 
                cred.email === loginData.email && cred.password === loginData.password
            );
            
            if (isValid) {
                resolve({ success: true, user: { email: loginData.email } });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 1000); // Simulate network delay
    });
}

/**
 * Initialize login animations
 */
function initLoginAnimations() {
    // Check if animations should be reduced for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Reduce animations for users who prefer less motion
        document.body.classList.add('reduced-motion');
        return;
    }

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize intersection observer for scroll animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.login-footer, .social-login').forEach(el => {
            observer.observe(el);
        });
    }
}

/**
 * Initialize social login
 */
function initSocialLogin() {
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            this.classList.add('loading');
            showNotification('Google login coming soon', 'info');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            this.classList.add('loading');
            showNotification('Facebook login coming soon', 'info');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        });
    }
}

/**
 * Add error styles
 */
function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .input-wrapper.focused input {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1) !important;
        }
        
        .form-loading {
            opacity: 0.8;
            pointer-events: none;
        }
        
        .form-success {
            animation: successPulse 0.5s ease-in-out;
        }
        
        .form-error {
            animation: errorShake 0.5s ease-in-out;
        }
        
        @keyframes successPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        @keyframes errorShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes errorPulse {
            0%, 100% { color: #ff4444; transform: scale(1); }
            50% { color: #ff6666; transform: scale(1.2); }
        }
        
        @keyframes successPulse {
            0%, 100% { color: #00C851; transform: scale(1); }
            50% { color: #00FF66; transform: scale(1.2); }
        }
        
        .btn-social.loading {
            opacity: 0.7;
            pointer-events: none;
        }
        
        .btn-social.loading i {
            animation: spin 1s linear infinite;
        }
        
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Show notification message with enhanced animations
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    let notification = document.querySelector('.notification');
    if (notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out forwards';
        setTimeout(() => notification.remove(), 300);
    }
    
    notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #00C851)',
        error: 'linear-gradient(135deg, #f44336, #ff6b6b)',
        warning: 'linear-gradient(135deg, #ff9800, #ffc107)',
        info: 'linear-gradient(135deg, #2196F3, #00d4ff)'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        z-index: 10000;
        box-shadow: 
            0 8px 32px rgba(0,0,0,0.3),
            0 0 20px rgba(0,212,255,0.2);
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%) scale(0.8);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0) scale(1)';
    });
    
    // Auto remove with slide out animation
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%) scale(0.8)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

/**
 * Show login lockdown with countdown timer
 */
function showLoginLockdown(lockedUntil, initialMinutes) {
    const loginForm = document.getElementById('loginForm');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    
    // Disable the form
    loginForm.classList.add('form-locked');
    submitButton.disabled = true;
    
    // Create lockdown overlay
    let lockdownOverlay = document.querySelector('.lockdown-overlay');
    if (!lockdownOverlay) {
        lockdownOverlay = document.createElement('div');
        lockdownOverlay.className = 'lockdown-overlay';
        loginForm.appendChild(lockdownOverlay);
    }
    
    // Calculate end time
    const endTime = new Date(lockedUntil).getTime();
    
    // Update countdown display
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endTime - now;
        
        if (distance < 0) {
            // Lockdown expired
            clearInterval(countdownInterval);
            removeLockdown();
            return;
        }
        
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        lockdownOverlay.innerHTML = `
            <div class="lockdown-content">
                <i class="fas fa-lock" style="font-size: 48px; color: #ff4444; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 12px 0; color: #ff4444;">Login Suspended</h3>
                <p style="margin: 0 0 16px 0; color: #666;">Too many failed attempts. Please try again later</p>
                <div class="countdown-timer">
                    <span class="countdown-time">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 12px;">Time Remaining</p>
            </div>
        `;
    }
    
    // Initial display
    updateCountdown();
    
    // Start countdown interval
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Store interval ID for cleanup
    lockdownOverlay.dataset.intervalId = countdownInterval;
    
    // Show notification
    const lockoutMinutes = Math.ceil((endTime - new Date().getTime()) / 1000 / 60);
    showNotification(`Login suspended for ${lockoutMinutes} minute${lockoutMinutes > 1 ? 's' : ''} due to too many failed attempts`, 'error');
}

/**
 * Remove login lockdown
 */
function removeLockdown() {
    const loginForm = document.getElementById('loginForm');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const lockdownOverlay = document.querySelector('.lockdown-overlay');
    
    // Re-enable the form
    loginForm.classList.remove('form-locked');
    submitButton.disabled = false;
    
    // Remove overlay
    if (lockdownOverlay) {
        // Clear interval if exists
        const intervalId = lockdownOverlay.dataset.intervalId;
        if (intervalId) {
            clearInterval(parseInt(intervalId));
        }
        
        lockdownOverlay.style.opacity = '0';
        setTimeout(() => {
            if (lockdownOverlay.parentNode) {
                lockdownOverlay.parentNode.removeChild(lockdownOverlay);
            }
        }, 300);
    }
    
    showNotification('You can now try logging in again', 'success');
}

// Add lockdown styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .form-locked {
            position: relative;
            pointer-events: none;
            opacity: 0.6;
        }
        
        .lockdown-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 16px;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .lockdown-content {
            text-align: center;
            padding: 20px;
        }
        
        .countdown-timer {
            background: linear-gradient(135deg, #ff4444, #cc0000);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            display: inline-block;
            margin: 8px 0;
            box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }
        
        .countdown-time {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .countdown-timer {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
});

// Check login status on page load
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/login-status');
        if (response.ok) {
            const data = await response.json();
            if (data.locked) {
                showLoginLockdown(data.lockedUntil, data.remainingMinutes);
            } else if (data.attempts > 0) {
                showNotification(`Warning: You have attempted to login ${data.attempts} time${data.attempts > 1 ? 's' : ''}. ${5 - data.attempts} more failed attempts will suspend login.`, 'warning');
            }
        }
    } catch (error) {
        console.log('Unable to check login status (possibly offline mode)');
    }
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        console.log('User already logged in, redirecting...');
        showNotification('You are already logged in, redirecting...', 'info');
        setTimeout(function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }, 1000);
    } else {
        // Check if login is locked
        checkLoginStatus();
    }
}); 