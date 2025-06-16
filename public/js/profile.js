/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
/**
 * profile.js
 * Handles various interaction functions on the profile page
 * Now using MongoDB API instead of mock data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initProfileTabs();
    initEditProfileModal();
    loadUserProfile();
    initPostPreview();
});

/**
 * Initialize profile page tab switching functionality
 */
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Switch active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Switch tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
        });
    });
}

/**
 * Initialize edit profile modal
 */
function initEditProfileModal() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeModal = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEdit');
    const profileForm = document.getElementById('profileForm');
    
    // Open modal
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Multiple ways to close modal
    function closeEditModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }
    
    // Close modal by clicking background
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // Form submission handling
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const userData = {
                profile: {
                    bio: formData.get('bio'),
                    location: formData.get('location'),
                    displayName: formData.get('displayName'),
                    privacy: {
                        showEmail: formData.get('showEmail') === 'on',
                        showLocation: formData.get('showLocation') === 'on',
                        publicProfile: formData.get('publicProfile') === 'on'
                    }
                }
            };
            
            try {
                // Update profile via API
                await updateProfileData(userData);
                
                // Update profile display on page
                updateProfileDisplay(userData.profile);
                
                // Show success notification and close modal
                showNotification('Profile updated successfully', 'success');
                closeEditModal();
                
            } catch (error) {
                console.error('Profile update error:', error);
                showNotification('Update failed, please try again later', 'error');
            }
        });
    }
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
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
        color: var(--dark-surface);
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-md);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Load user profile data from MongoDB API
 */
async function loadUserProfile() {
    const currentUser = getCurrentUser();
    const isLoggedIn = isUserLoggedIn();
    
    console.log('Loading profile for user:', currentUser);
    
    // If user is not logged in, redirect to login page
    if (!isLoggedIn || !currentUser) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = '/login.html';
        return;
    }
    
    try {
        // Get user data from MongoDB API
        const userData = await fetchUserProfile();
        
        // Fill basic profile info
        fillProfileInfo(userData);
        
        // Fill additional content (stats, activities, etc.)
        fillProfileContent(userData);
        
        // Populate edit form with current data
        populateEditForm(userData);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        
        // If API fails, show error message
        showNotification('Failed to load profile, please refresh the page', 'error');
        
        // Fill with basic info from localStorage as fallback
        fillBasicInfoFromLocalStorage();
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
 * Fill profile info from user data
 */
function fillProfileInfo(userData) {
    // Basic info
    const usernameElement = document.getElementById('profileUsername');
    if (usernameElement && usernameElement.firstChild) {
        usernameElement.firstChild.textContent = userData.username || 'User';
    }
    
    const bioElement = document.getElementById('userBio');
    if (bioElement) {
        bioElement.textContent = userData.profile?.bio || 'This user has not set up a personal bio yet...';
    }
    
    const memberSinceElement = document.getElementById('memberSince');
    if (memberSinceElement) {
        const joinDate = new Date(userData.createdAt || userData.profile?.joinDate);
        memberSinceElement.textContent = formatDate(joinDate);
    }
    
    const locationElement = document.getElementById('userLocation');
    if (locationElement) {
        locationElement.textContent = userData.profile?.location || 'Location not set';
    }
    
    const emailElement = document.getElementById('userEmail');
    if (emailElement) {
        // Show email based on privacy settings
        if (userData.profile?.privacy?.showEmail !== false) {
            emailElement.textContent = userData.email || '';
        } else {
            emailElement.textContent = 'Private';
        }
    }
}

/**
 * Fill profile content (stats, activities, etc.)
 */
function fillProfileContent(userData) {
    // Fill stats (default to 0 for now, can be enhanced later)
    const stats = userData.profile?.stats || { bikes: 0, mods: 0, photos: 0, posts: 0 };
    
    document.getElementById('bikeCount').textContent = stats.bikes || 0;
    document.getElementById('modCount').textContent = stats.mods || 0;
    document.getElementById('photoCount').textContent = stats.photos || 0;
    document.getElementById('postCount').textContent = stats.posts || 0;
    
    // Fill tags
    const tagsContainer = document.getElementById('userTags');
    const tags = userData.profile?.interests || ['Motorcycle Enthusiast', 'Beginner'];
    tagsContainer.innerHTML = tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // Fill recent activities
    const activityList = document.getElementById('activityList');
    const joinDate = formatDate(new Date(userData.createdAt || Date.now()));
    const activities = userData.profile?.activities || [
        `Joined MotoWeb community - ${joinDate}`,
        'Started exploring motorcycle modification world - ' + joinDate,
        'Welcome to MotoWeb! - ' + joinDate
    ];
    
    activityList.innerHTML = activities.map(activity => 
        `<li>${activity}</li>`
    ).join('');
    
    // Fill achievements
    const achievementsList = document.getElementById('achievementsList');
    const achievements = userData.profile?.achievements || [
        {
            icon: 'fa-user-plus',
            title: 'New Member',
            description: 'Welcome to MotoWeb community'
        },
        {
            icon: 'fa-star',
            title: 'Explorer',
            description: 'Started your motorcycle modification journey'
        }
    ];
    
    achievementsList.innerHTML = achievements.map(achievement => `
        <div class="achievement">
            <i class="fas ${achievement.icon}" style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${achievement.title}</h4>
            <p style="color: var(--metallic-silver); font-size: 0.9rem;">${achievement.description}</p>
        </div>
    `).join('');
    
    // Fill empty states for bikes, posts, photos, likes
    fillEmptyStates();
}

/**
 * Fill empty states for content tabs
 */
function fillEmptyStates() {
    // Bikes grid
    const bikesGrid = document.getElementById('bikesGrid');
    if (bikesGrid) {
        const addBikeCard = bikesGrid.querySelector('.add-bike-card');
        if (addBikeCard) {
            addBikeCard.innerHTML = `
                <button class="add-btn">
                    <i class="fas fa-plus"></i>
                    <span>Add New Bike</span>
                </button>
            `;
        }
    }
    
    // Posts list
    const postsList = document.getElementById('postsList');
    if (postsList) {
        postsList.innerHTML = '<p style="text-align: center; color: var(--metallic-silver); padding: 2rem;">No posts published yet</p>';
    }
    
    // Photos grid
    const photosGrid = document.getElementById('photosGrid');
    if (photosGrid) {
        const addPhotoCard = photosGrid.querySelector('.add-photo-card');
        if (addPhotoCard) {
            addPhotoCard.innerHTML = `
                <button class="add-btn">
                    <i class="fas fa-plus"></i>
                    <span>Add New Photo</span>
                </button>
            `;
        }
    }
    
    // Likes grid
    const likesGrid = document.getElementById('likesGrid');
    if (likesGrid) {
        likesGrid.innerHTML = '<p style="text-align: center; color: var(--metallic-silver); padding: 2rem;">No liked items yet</p>';
    }
}

/**
 * Populate edit form with current user data
 */
function populateEditForm(userData) {
    const displayNameInput = document.getElementById('displayName');
    if (displayNameInput) {
        displayNameInput.value = userData.profile?.displayName || userData.username || '';
    }
    
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.value = userData.profile?.bio || '';
    }
    
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.value = userData.profile?.location || '';
    }
    
    // Privacy settings
    const showEmailCheckbox = document.getElementById('showEmail');
    if (showEmailCheckbox) {
        showEmailCheckbox.checked = userData.profile?.privacy?.showEmail !== false;
    }
    
    const showLocationCheckbox = document.getElementById('showLocation');
    if (showLocationCheckbox) {
        showLocationCheckbox.checked = userData.profile?.privacy?.showLocation !== false;
    }
    
    const publicProfileCheckbox = document.getElementById('publicProfile');
    if (publicProfileCheckbox) {
        publicProfileCheckbox.checked = userData.profile?.privacy?.publicProfile !== false;
    }
}

/**
 * Fill basic info from localStorage as fallback
 */
function fillBasicInfoFromLocalStorage() {
    const username = localStorage.getItem('username') || 'User';
    const email = localStorage.getItem('userEmail') || '';
    
    const usernameElement = document.getElementById('profileUsername');
    if (usernameElement && usernameElement.firstChild) {
        usernameElement.firstChild.textContent = username;
    }
    
    const emailElement = document.getElementById('userEmail');
    if (emailElement) {
        emailElement.textContent = email;
    }
    
    const bioElement = document.getElementById('userBio');
    if (bioElement) {
        bioElement.textContent = 'Welcome to MotoWeb! Please edit your profile to introduce yourself.';
    }
    
    const locationElement = document.getElementById('userLocation');
    if (locationElement) {
        locationElement.textContent = 'Please set your location';
    }
    
    const memberSinceElement = document.getElementById('memberSince');
    if (memberSinceElement) {
        memberSinceElement.textContent = 'Recently';
    }
    
    // Fill with default values
    fillEmptyStates();
}

/**
 * Update profile display after successful edit
 */
function updateProfileDisplay(profileData) {
    if (profileData.bio) {
        const bioElement = document.getElementById('userBio');
        if (bioElement) {
            bioElement.textContent = profileData.bio;
        }
    }
    
    if (profileData.location) {
        const locationElement = document.getElementById('userLocation');
        if (locationElement) {
            locationElement.textContent = profileData.location;
        }
    }
    
    if (profileData.displayName) {
        const usernameElement = document.getElementById('profileUsername');
        if (usernameElement && usernameElement.firstChild) {
            usernameElement.firstChild.textContent = profileData.displayName;
        }
    }
}

/**
 * Format date for display
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Get current user from auth state
 */
function getCurrentUser() {
    return {
        username: localStorage.getItem('username'),
        email: localStorage.getItem('userEmail'),
        id: localStorage.getItem('userId')
    };
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('token');
}

/**
 * Initialize post preview functionality
 */
function initPostPreview() {
    // Add event listeners for preview buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('preview-btn')) {
            const postId = e.target.getAttribute('data-post-id');
            showPostPreview(postId);
        }
    });
}

/**
 * Show post preview modal
 */
function showPostPreview(postId) {
    // This can be implemented later when we have actual posts
    showNotification('Post preview feature coming soon', 'info');
} 
