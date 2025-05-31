/**
 * profile.js
 * Handles various interaction functions on the profile page
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
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const userData = {
                displayName: formData.get('displayName'),
                bio: formData.get('bio'),
                location: formData.get('location'),
                privacy: {
                    showEmail: formData.get('showEmail') === 'on',
                    showLocation: formData.get('showLocation') === 'on',
                    publicProfile: formData.get('publicProfile') === 'on'
                }
            };
            
            // Update profile display on page
            updateProfileDisplay(userData);
            
            // Simulate API request to save data
            console.log('Saved profile data:', userData);
            
            // Show success notification and close modal
            showNotification('Profile updated successfully', 'success');
            closeEditModal();
        });
    }
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
 * Load user profile data
 */
function loadUserProfile() {
    // Mock user data
    const mockUserData = {
        username: "JohnRider",
        bio: "Passionate motorcycle enthusiast with 5+ years of modification experience. Love sharing knowledge and helping fellow riders.",
        memberSince: "2024-01-15",
        location: "Taipei City",
        email: "john.rider@email.com",
        stats: {
            bikes: 2,
            mods: 15,
            photos: 24,
            posts: 8
        },
        tags: ["Sport Bikes", "Performance", "LED Lighting", "Suspension", "Exhaust"],
        activities: [
            "Added new Monster Factory Z2 PRO Fork - 2024-06-20",
            "Posted photos of JET modification - 2024-06-18", 
            "Shared brake system upgrade experience - 2024-06-15",
            "Liked KOSO LED Tail Light review - 2024-06-12",
            "Commented on suspension setup guide - 2024-06-10"
        ],
        achievements: [
            {
                icon: "fa-wrench",
                title: "Modification Master",
                description: "Completed 10+ modifications"
            },
            {
                icon: "fa-users", 
                title: "Community Contributor",
                description: "Made 50+ helpful comments"
            },
            {
                icon: "fa-camera",
                title: "Photo Enthusiast", 
                description: "Shared 20+ photos"
            }
        ],
        bikes: [
            {
                name: "SYM JET SL 125",
                year: "2023",
                mods: "8 modifications"
            },
            {
                name: "YAMAHA FORCE 2.0",
                year: "2024", 
                mods: "7 modifications"
            }
        ],
        posts: [
            {
                title: "Monster Factory Z2 PRO Fork Review",
                date: "2024-06-21",
                excerpt: "After installing the new fork, the handling has improved significantly...",
                comments: 8,
                likes: 25
            },
            {
                title: "LED Tail Light Installation Guide", 
                date: "2024-06-16",
                excerpt: "Step-by-step guide for installing the KOSO LED tail light...",
                comments: 12,
                likes: 34
            }
        ]
    };

    // Fill basic profile info
    document.getElementById('profileUsername').firstChild.textContent = mockUserData.username;
    document.getElementById('userBio').textContent = mockUserData.bio;
    document.getElementById('memberSince').textContent = mockUserData.memberSince;
    document.getElementById('userLocation').textContent = mockUserData.location;
    document.getElementById('userEmail').textContent = mockUserData.email;
    
    // Fill stats
    document.getElementById('bikeCount').textContent = mockUserData.stats.bikes;
    document.getElementById('modCount').textContent = mockUserData.stats.mods;
    document.getElementById('photoCount').textContent = mockUserData.stats.photos;
    document.getElementById('postCount').textContent = mockUserData.stats.posts;

    // Fill tags
    const tagsContainer = document.getElementById('userTags');
    tagsContainer.innerHTML = mockUserData.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    // Fill recent activities
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = mockUserData.activities.map(activity => 
        `<li>${activity}</li>`
    ).join('');

    // Fill achievements
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = mockUserData.achievements.map(achievement => `
        <div class="achievement">
            <i class="fas ${achievement.icon}" style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${achievement.title}</h4>
            <p style="color: var(--metallic-silver); font-size: 0.9rem;">${achievement.description}</p>
        </div>
    `).join('');

    // Fill bikes grid
    const bikesGrid = document.getElementById('bikesGrid');
    const addBikeCard = bikesGrid.querySelector('.add-bike-card');
    const bikeCards = mockUserData.bikes.map(bike => `
        <div class="bike-card" style="
            background: linear-gradient(145deg, var(--mid-surface), var(--dark-surface));
            border-radius: var(--border-radius-md);
            border: 1px solid var(--carbon-gray);
            padding: 1.5rem;
            transition: all 0.3s ease;
        ">
            <div style="margin-bottom: 1rem;">
                <div style="
                    height: 120px;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    border-radius: var(--border-radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                ">
                    <i class="fas fa-motorcycle"></i>
                </div>
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${bike.name}</h3>
                <p style="color: var(--metallic-silver); margin-bottom: 0.5rem;">Year: ${bike.year}</p>
                <p style="color: var(--metallic-silver);">${bike.mods}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" style="flex: 1; font-size: 0.9rem;">Edit</button>
                <button class="btn btn-primary" style="flex: 1; font-size: 0.9rem;">View Details</button>
            </div>
        </div>
    `).join('');
    
    // Insert bike cards before the add button
    addBikeCard.insertAdjacentHTML('beforebegin', bikeCards);

    // Fill posts list
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = mockUserData.posts.map(post => `
        <div class="post-item" style="
            background: linear-gradient(145deg, var(--mid-surface), var(--dark-surface));
            border-radius: var(--border-radius-md);
            border: 1px solid var(--carbon-gray);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
        ">
            <div class="post-header" style="margin-bottom: 1rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${post.title}</h3>
                <p class="post-date" style="color: var(--metallic-silver); font-size: 0.9rem;">${post.date}</p>
            </div>
            <div class="post-content" style="color: var(--text-color); margin-bottom: 1rem; line-height: 1.6;">
                ${post.excerpt}
            </div>
            <div class="post-stats" style="
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                color: var(--metallic-silver);
                font-size: 0.9rem;
            ">
                <span><i class="fas fa-comment" style="color: var(--primary-color); margin-right: 0.5rem;"></i>${post.comments} comments</span>
                <span><i class="fas fa-heart" style="color: var(--primary-color); margin-right: 0.5rem;"></i>${post.likes} likes</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary preview-btn" data-post-id="${post.title}" style="flex: 1; font-size: 0.9rem;">Preview</button>
                <button class="btn btn-primary" style="flex: 1; font-size: 0.9rem;">View Full Post</button>
            </div>
        </div>
    `).join('');

    // Fill form with user data
    document.getElementById('displayName').value = mockUserData.username;
    document.getElementById('bio').value = mockUserData.bio;
    document.getElementById('location').value = mockUserData.location;
}

/**
 * Update profile display
 */
function updateProfileDisplay(userData) {
    // Update username
    const usernameElement = document.getElementById('profileUsername');
    if (usernameElement && usernameElement.firstChild) {
        usernameElement.firstChild.textContent = userData.displayName;
    }
    
    // Update bio
    const bioElement = document.getElementById('userBio');
    if (bioElement) {
        bioElement.textContent = userData.bio;
    }
    
    // Update location
    const locationElement = document.getElementById('userLocation');
    if (locationElement) {
        locationElement.textContent = userData.location;
    }
}

/**
 * Initialize post preview functionality
 */
function initPostPreview() {
    // Handle preview buttons using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('preview-btn')) {
            e.preventDefault();
            
            const postTitle = e.target.getAttribute('data-post-id');
            const modal = document.getElementById('postPreviewModal');
            
            if (modal) {
                // Fill modal with mock data
                document.getElementById('previewPostTitle').textContent = postTitle;
                document.getElementById('previewPostDate').textContent = '2024-06-21';
                document.getElementById('previewPostCategory').textContent = 'Modification Experience';
                document.getElementById('previewPostContent').innerHTML = 'This is a preview of the post content...';
                document.getElementById('previewCommentCount').textContent = '8';
                document.getElementById('previewLikeCount').textContent = '25';
                document.getElementById('previewViewCount').textContent = '156';
                
                // Show modal
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    });
    
    // Close preview modal
    const closePreviewBtns = document.querySelectorAll('#closePreviewModal, #closePreview');
    closePreviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = document.getElementById('postPreviewModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modal by clicking background
    const previewModal = document.getElementById('postPreviewModal');
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
} 