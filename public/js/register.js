/**
 * MotoWeb Registration Page Functionality
 * Handles form validation, password strength checking, and actual registration API connection
 */
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    console.log('Registration page JavaScript loaded');
    console.log('Found elements:', {
        registerForm: !!registerForm,
        passwordInput: !!passwordInput,
        confirmPasswordInput: !!confirmPasswordInput,
        togglePasswordBtns: togglePasswordBtns.length
    });
    
    // Check if already logged in, redirect if so
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        console.log('User already logged in, redirecting to homepage...');
        showNotification('You are already logged in, redirecting to homepage...', 'info');
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
        return;
    }
    
    // Password toggle functionality
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Update icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
            
            // Update accessibility label
            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    });
    
    // Password strength checking
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            updatePasswordStrength(strength);
        });
    }
    
    // Real-time form validation
    initRealTimeValidation();
    
    // Form submission handling
    if (registerForm) {
        console.log('Setting up form submit event listener...');
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submit event triggered');
            
            // Remove all error messages
            clearErrors();
            
            // Get form data
            const formData = new FormData(this);
            const firstName = formData.get('firstName')?.trim() || '';
            const lastName = formData.get('lastName')?.trim() || '';
            const username = formData.get('username')?.trim() || '';
            const email = formData.get('email')?.trim() || '';
            const password = formData.get('password')?.trim() || '';
            const confirmPassword = formData.get('confirmPassword')?.trim() || '';
            const terms = formData.get('terms') === 'on';
            
            console.log('Form data:', { firstName, lastName, username, email, password: '***', confirmPassword: '***', terms });
            
            // Validate form
            let isValid = true;
            
            // Validate first name
            if (!firstName) {
                showError('firstName', 'Please enter your first name');
                isValid = false;
            } else if (firstName.length < 1) {
                showError('firstName', 'First name cannot be empty');
                isValid = false;
            }
            
            // Validate last name
            if (!lastName) {
                showError('lastName', 'Please enter your last name');
                isValid = false;
            } else if (lastName.length < 1) {
                showError('lastName', 'Last name cannot be empty');
                isValid = false;
            }
            
            // Validate username
            if (!username) {
                showError('username', 'Please enter a username');
                isValid = false;
            } else if (username.length < 3) {
                showError('username', 'Username must be at least 3 characters long');
                isValid = false;
            } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                showError('username', 'Username can only contain letters, numbers, underscores and hyphens');
                isValid = false;
            }
            
            // Validate email
            if (!email) {
                showError('email', 'Please enter your email address');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate password
            if (!password) {
                showError('password', 'Please set a password');
                isValid = false;
            } else if (password.length < 8) {
                showError('password', 'Password must be at least 8 characters long');
                isValid = false;
            } else {
                const passwordStrength = checkPasswordStrength(password);
                if (passwordStrength.score < 2) {
                    showError('password', 'Password strength insufficient, please include uppercase, lowercase, numbers and special characters');
                    isValid = false;
                }
            }
            
            // Validate confirm password
            if (!confirmPassword) {
                showError('confirmPassword', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }
            
            // Validate terms agreement
            if (!terms) {
                showError('terms', 'Please agree to the Terms of Service and Privacy Policy to register');
                isValid = false;
            }
            
            console.log('Form validation result:', isValid);
            
            if (!isValid) {
                // Scroll to first error field
                const firstError = document.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            
            try {
                console.log('Sending registration request...', { username, email, firstName, lastName });

                // Send registration request to backend
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
                console.log('Registration response:', { success: response.ok, status: response.status });
                
                if (response.ok) {
                    // Registration successful
                    console.log('Registration successful, setting authentication state...');
                    
                    // Set authentication state
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userId', data.user.id);
                    
                    // Use auth-state.js to set authentication state
                    if (typeof window.authState !== 'undefined' && window.authState.setAuthState) {
                        window.authState.setAuthState(data.user);
                    }
                    
                    // Show success message
                    showNotification('Registration successful! Welcome to MotoWeb', 'success');
                    
                    // Redirect to homepage after 1.5 seconds
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1500);

                } else {
                    // Registration failed
                    console.error('Registration failed:', data.error);
                    
                    // Show different error messages based on error type
                    if (data.error.includes('username')) {
                        showError('username', data.error || 'Username is already taken');
                    } else if (data.error.includes('email')) {
                        showError('email', data.error || 'Email address is already registered');
                    } else {
                        showNotification(data.error || 'Registration failed, please check your information', 'error');
                    }
                }

            } catch (error) {
                console.error('Network error during registration:', error);
                
                // Network error handling
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showNotification('Cannot connect to server, please check your internet connection', 'error');
                } else {
                    showNotification('An error occurred during registration, please try again later', 'error');
                }
                
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Initialize social registration
    initSocialRegistration();
});

// Real-time validation
function initRealTimeValidation() {
    const inputs = document.querySelectorAll('#registerForm input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear errors on input
            clearFieldError(this.name);
        });
    });
}

function validateField(input) {
    const value = input.value.trim();
    const name = input.name;
    
    clearFieldError(name);
    
    switch(name) {
        case 'firstName':
            if (!value) {
                showError(name, 'Please enter your first name');
            }
            break;
        case 'lastName':
            if (!value) {
                showError(name, 'Please enter your last name');
            }
            break;
        case 'username':
            if (!value) {
                showError(name, 'Please enter a username');
            } else if (value.length < 3) {
                showError(name, 'Username must be at least 3 characters');
            } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                showError(name, 'Username can only contain letters, numbers, _ and -');
            }
            break;
        case 'email':
            if (!value) {
                showError(name, 'Please enter your email');
            } else if (!validateEmail(value)) {
                showError(name, 'Please enter a valid email address');
            }
            break;
        case 'password':
            if (!value) {
                showError(name, 'Please set a password');
            } else if (value.length < 8) {
                showError(name, 'Password must be at least 8 characters');
            }
            break;
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                showError(name, 'Please confirm your password');
            } else if (value !== password) {
                showError(name, 'Passwords do not match');
            }
            break;
    }
}

// Initialize social registration
function initSocialRegistration() {
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            // TODO: Implement Google registration logic
            showNotification('Google registration feature coming soon', 'info');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            // TODO: Implement Facebook registration logic
            showNotification('Facebook registration feature coming soon', 'info');
        });
    }
}

// Password strength checking
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length === 0) {
        return { score: 0, feedback: ['Please enter a password'], strength: 'none' };
    }
    
    // Length check
    if (password.length >= 8) {
        score += 1;
    } else {
        feedback.push('At least 8 characters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include lowercase letters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include uppercase letters');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include numbers');
    }
    
    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include special characters');
    }
    
    // Determine strength level
    let strength;
    if (score === 0) {
        strength = 'none';
    } else if (score <= 2) {
        strength = 'weak';
    } else if (score <= 3) {
        strength = 'medium';
    } else if (score <= 4) {
        strength = 'strong';
    } else {
        strength = 'very-strong';
    }
    
    return { score, feedback, strength };
}

// Update password strength display
function updatePasswordStrength(strength) {
    const strengthMeter = document.querySelector('.password-strength-meter');
    const strengthText = document.querySelector('.password-strength-text');
    const strengthBar = document.querySelector('.strength-bar');
    
    if (!strengthMeter || !strengthText || !strengthBar) return;
    
    // Clear previous classes
    strengthBar.className = 'strength-bar';
    strengthBar.classList.add(strength.strength);
    
    // Update text
    const strengthTexts = {
        'none': 'Password strength: None',
        'weak': 'Password strength: Weak',
        'medium': 'Password strength: Medium',
        'strong': 'Password strength: Strong',
        'very-strong': 'Password strength: Very Strong'
    };
    
    strengthText.textContent = strengthTexts[strength.strength] || '';
    
    // Show/hide strength meter
    strengthMeter.style.display = strength.score > 0 ? 'block' : 'none';
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error for specific field
function showError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Add error class
    formGroup.classList.add('error');
    
    // Create or update error element
    let errorElement = formGroup.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        
        // Insert after input wrapper
        const inputWrapper = formGroup.querySelector('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.parentNode.insertBefore(errorElement, inputWrapper.nextSibling);
        } else {
            formGroup.appendChild(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add shake animation
    formGroup.classList.add('shake');
    setTimeout(() => {
        formGroup.classList.remove('shake');
    }, 500);
    
    console.log('Error displayed for field:', fieldName, 'Message:', message);
}

// Clear error for specific field
function clearFieldError(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
}

// Clear all errors
function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        
        const errorElement = group.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    });
    
    console.log('All errors cleared');
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if global showNotification function exists
    if (typeof window.authState !== 'undefined' && window.authState.showNotification) {
        window.authState.showNotification(message, type);
        return;
    }
    
    // Remove existing notification if any
    let notification = document.querySelector('.notification');
    if (notification) {
        notification.remove();
    }
    
    notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set styles
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
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Trigger enter animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
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

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style); 