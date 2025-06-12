/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
/**
 * Settings Page Functionality and Interactions
 * Now using MongoDB API instead of mock data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!isUserLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Initialize all functions
    initSettingsNavigation();
    loadUserSettings();
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
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('token');
}

/**
 * Load user settings from MongoDB API
 */
async function loadUserSettings() {
    try {
        const userData = await fetchUserProfile();
        populateSettingsForm(userData);
    } catch (error) {
        console.error('Error loading user settings:', error);
        showNotification('Failed to load user settings', 'error');
        
        // Fallback to localStorage data
        populateWithLocalStorageData();
    }
}

/**
 * Fetch user profile from MongoDB API
 */
async function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token');
    }
    
    const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired, redirect to login
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }
        throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
}

/**
 * Populate settings form with user data
 */
function populateSettingsForm(userData) {
    // Account Settings
    const displayNameInput = document.getElementById('displayName');
    if (displayNameInput) {
        displayNameInput.value = userData.profile?.displayName || userData.username || '';
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = userData.email || '';
    }
    
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.value = userData.profile?.bio || '';
    }
    
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.value = userData.profile?.location || '';
    }
    
    // Privacy Settings
    const publicProfileCheckbox = document.getElementById('publicProfile');
    if (publicProfileCheckbox) {
        publicProfileCheckbox.checked = userData.profile?.privacy?.publicProfile !== false;
    }
    
    const showEmailCheckbox = document.getElementById('showEmail');
    if (showEmailCheckbox) {
        showEmailCheckbox.checked = userData.profile?.privacy?.showEmail === true;
    }
    
    const showLocationCheckbox = document.getElementById('showLocation');
    if (showLocationCheckbox) {
        showLocationCheckbox.checked = userData.profile?.privacy?.showLocation !== false;
    }
    
    // Notification Settings (use defaults if not set)
    const emailNotificationsCheckbox = document.getElementById('emailNotifications');
    if (emailNotificationsCheckbox) {
        emailNotificationsCheckbox.checked = userData.preferences?.emailNotifications !== false;
    }
    
    const commentNotificationsCheckbox = document.getElementById('commentNotifications');
    if (commentNotificationsCheckbox) {
        commentNotificationsCheckbox.checked = userData.preferences?.commentNotifications !== false;
    }
    
    const likeNotificationsCheckbox = document.getElementById('likeNotifications');
    if (likeNotificationsCheckbox) {
        likeNotificationsCheckbox.checked = userData.preferences?.likeNotifications !== false;
    }
    
    const eventNotificationsCheckbox = document.getElementById('eventNotifications');
    if (eventNotificationsCheckbox) {
        eventNotificationsCheckbox.checked = userData.preferences?.eventNotifications !== false;
    }
}

/**
 * Fallback to localStorage data if API fails
 */
function populateWithLocalStorageData() {
    const username = localStorage.getItem('username') || '';
    const email = localStorage.getItem('userEmail') || '';
    
    const displayNameInput = document.getElementById('displayName');
    if (displayNameInput) {
        displayNameInput.value = username;
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = email;
    }
}

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
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {
            profile: {
                displayName: formData.get('displayName'),
                bio: formData.get('bio'),
                location: formData.get('location')
            }
        };
        
        // If email changed, include it in the update
        const emailInput = document.getElementById('email');
        const originalEmail = localStorage.getItem('userEmail');
        if (emailInput && emailInput.value !== originalEmail) {
            data.email = emailInput.value;
        }
        
        try {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Update profile via API
            await updateProfileData(data);
            
            // Update localStorage if email changed
            if (data.email) {
                localStorage.setItem('userEmail', data.email);
            }
            
            // Show success message
            showNotification('Profile updated successfully', 'success');
            
        } catch (error) {
            console.error('Update account error:', error);
            showNotification(error.message || 'Failed to update profile', 'error');
            
        } finally {
            // Restore button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    });
}

/**
 * Update profile data via API
 */
async function updateProfileData(userData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token');
    }
    
    const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
    }
    
    return await response.json();
}

/**
 * Initialize password form
 */
function initPasswordForm() {
    const form = document.getElementById('passwordSettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
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
        
        try {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Changing...';
            
            // Update password via API
            await updatePassword(currentPassword, newPassword);
            
            // Clear form
            this.reset();
            
            // Show success message
            showNotification('Password updated successfully', 'success');
            
        } catch (error) {
            console.error('Update password error:', error);
            showNotification(error.message || 'Failed to update password', 'error');
            
        } finally {
            // Restore button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Change Password';
        }
    });
}

/**
 * Update password via API
 */
async function updatePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token');
    }
    
    const response = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
    }
    
    return await response.json();
}

/**
 * Initialize notification settings
 */
function initNotificationSettings() {
    const form = document.getElementById('notificationSettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const preferences = {
            emailNotifications: formData.has('emailNotifications'),
            commentNotifications: formData.has('commentNotifications'),
            likeNotifications: formData.has('likeNotifications'),
            eventNotifications: formData.has('eventNotifications')
        };
        
        try {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Update preferences via API
            await updateProfileData({ preferences });
            
            // Show success message
            showNotification('Notification settings updated', 'success');
            
        } catch (error) {
            console.error('Update notification settings error:', error);
            showNotification(error.message || 'Failed to update notification settings', 'error');
            
        } finally {
            // Restore button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Initialize privacy settings
 */
function initPrivacySettings() {
    const form = document.getElementById('privacySettingsForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const privacy = {
            publicProfile: formData.has('publicProfile'),
            showEmail: formData.has('showEmail'),
            showLocation: formData.has('showLocation')
        };
        
        try {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Update privacy settings via API
            await updateProfileData({ profile: { privacy } });
            
            // Show success message
            showNotification('Privacy settings updated', 'success');
            
        } catch (error) {
            console.error('Update privacy settings error:', error);
            showNotification(error.message || 'Failed to update privacy settings', 'error');
            
        } finally {
            // Restore button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
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