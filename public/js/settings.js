/**
 * Settings Page Functionality and Interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initSettingsNavigation();
    initAccountForm();
    initPasswordForm();
    initNotificationSettings();
    initPrivacySettings();
    initDeviceManagement();
    initDataManagement();
    initImageUploads();
    
    // Loading animation
    const settings = document.querySelector('.settings-container');
    if (settings) {
        settings.style.opacity = '0';
        settings.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            settings.style.opacity = '1';
            settings.style.transform = 'translateY(0)';
            settings.style.transition = 'all 0.5s ease-out';
        }, 100);
    }
});

/**
 * Initialize settings navigation
 */
function initSettingsNavigation() {
    const navLinks = document.querySelectorAll('.settings-nav a');
    const sections = document.querySelectorAll('.settings-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update URL hash
            history.pushState(null, '', `#${sectionId}`);
        });
    });
    
    // Handle URL hash on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetLink = document.querySelector(`[data-section="${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
}

/**
 * Initialize account form
 */
function initAccountForm() {
    const form = document.getElementById('profileSettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API request
        console.log('Update account information:', data);
        
        // Show success message
        showNotification('Profile updated successfully', 'success');
    });
}

/**
 * Initialize password form
 */
function initPasswordForm() {
    const form = document.getElementById('passwordSettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        
        // Basic validation
        if (!currentPassword) {
            showNotification('Please enter current password', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('New password and confirm password do not match', 'error');
            return;
        }
        
        // Password complexity check
        if (newPassword.length < 8) {
            showNotification('New password must be at least 8 characters', 'error');
            return;
        }
        
        // Simulate API request
        console.log('Update password');
        
        // Clear form
        this.reset();
        
        // Show success message
        showNotification('Password updated successfully', 'success');
    });
}

/**
 * Initialize notification settings
 */
function initNotificationSettings() {
    const form = document.getElementById('notificationSettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const settings = Object.fromEntries(formData.entries());
        
        // Simulate API request
        console.log('Update notification settings:', settings);
        
        // Show success message
        showNotification('Notification settings updated', 'success');
    });
}

/**
 * Initialize privacy settings
 */
function initPrivacySettings() {
    const form = document.getElementById('privacySettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const settings = Object.fromEntries(formData.entries());
        
        // Simulate API request
        console.log('Update privacy settings:', settings);
        
        // Show success message
        showNotification('Privacy settings updated', 'success');
    });
}

/**
 * Initialize device management
 */
function initDeviceManagement() {
    // Handle device removal
    const removeButtons = document.querySelectorAll('.device-item .btn-danger:not([disabled])');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const deviceItem = this.closest('.device-item');
            const deviceName = deviceItem.querySelector('h4').textContent;
            
            if (confirm(`Remove ${deviceName}?`)) {
                deviceItem.remove();
                showNotification('Device removed successfully', 'success');
            }
        });
    });
    
    // Handle logout all devices
    const logoutAllBtn = document.getElementById('logoutAllDevices');
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', function() {
            if (confirm('Logout from all devices? You will need to login again on all devices.')) {
                // Simulate API request
                console.log('Logout all devices');
                showNotification('Logged out from all devices', 'success');
            }
        });
    }
}

/**
 * Initialize data management
 */
function initDataManagement() {
    // Download data button
    const downloadBtn = document.querySelector('[data-action="download"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            showNotification('Data download request submitted. You will receive an email when ready.', 'info');
        });
    }
    
    // Manage data button
    const manageBtn = document.querySelector('[data-action="manage"]');
    if (manageBtn) {
        manageBtn.addEventListener('click', function() {
            showNotification('Data usage settings opened', 'info');
        });
    }
    
    // Delete account button
    const deleteBtn = document.querySelector('[data-action="delete"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const modal = document.getElementById('confirmationModal');
            if (modal) {
                document.getElementById('modalTitle').textContent = 'Delete Account';
                document.getElementById('modalMessage').textContent = 
                    'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost forever.';
                
                modal.classList.add('show');
                
                // Handle confirmation
                const confirmBtn = document.getElementById('confirmActionBtn');
                const cancelBtn = document.getElementById('cancelActionBtn');
                
                const handleConfirm = () => {
                    modal.classList.remove('show');
                    showNotification('Account deletion request submitted. Please check your email to confirm.', 'warning');
                    confirmBtn.removeEventListener('click', handleConfirm);
                    cancelBtn.removeEventListener('click', handleCancel);
                };
                
                const handleCancel = () => {
                    modal.classList.remove('show');
                    confirmBtn.removeEventListener('click', handleConfirm);
                    cancelBtn.removeEventListener('click', handleCancel);
                };
                
                confirmBtn.addEventListener('click', handleConfirm);
                cancelBtn.addEventListener('click', handleCancel);
                
                // Close modal when clicking outside
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        handleCancel();
                    }
                });
            } else {
                // Fallback if modal doesn't exist
                if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                    if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                        showNotification('Account deletion request submitted. Please check your email to confirm.', 'warning');
                    }
                }
            }
        });
    }
}

/**
 * Initialize image upload functionality
 */
function initImageUploads() {
    const avatarUpload = document.getElementById('avatarUpload');
    const coverUpload = document.getElementById('coverUpload');
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, 'avatar');
            }
        });
    }
    
    if (coverUpload) {
        coverUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, 'cover');
            }
        });
    }
}

/**
 * Handle image upload
 */
function handleImageUpload(file, type) {
    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, WEBP)', 'error');
        return;
    }
    
    // Simulate API request
    console.log(`Uploading ${type} image:`, file.name);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.querySelector(`.${type}-preview img`);
        if (preview) {
            preview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
    
    showNotification(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated successfully`, 'success');
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    let notification = document.querySelector('.notification');
    if (notification) {
        notification.remove();
    }
    
    notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set styles using CSS variables
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        max-width: 400px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success-color)' : 
                    type === 'error' ? 'var(--error-color)' :
                    type === 'warning' ? 'var(--warning-color)' :
                    'var(--primary-color)'};
        color: var(--dark-surface);
        border-radius: var(--border-radius-md);
        z-index: 3000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        font-family: var(--font-primary);
        font-size: 0.9rem;
        font-weight: 600;
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