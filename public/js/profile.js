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
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    const isLoggedIn = isUserLoggedIn();
    
    console.log('Loading profile for user:', currentUser);
    
    // If user is not logged in, redirect to login page
    if (!isLoggedIn || !currentUser) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = '/login.html';
        return;
    }
    
    // Get user data based on current logged in user
    const userData = getUserData(currentUser.username);
    
    // Fill basic profile info
    document.getElementById('profileUsername').firstChild.textContent = userData.username;
    document.getElementById('userBio').textContent = userData.bio;
    document.getElementById('memberSince').textContent = userData.memberSince;
    document.getElementById('userLocation').textContent = userData.location;
    document.getElementById('userEmail').textContent = userData.email;
    
    // Fill stats
    document.getElementById('bikeCount').textContent = userData.stats.bikes;
    document.getElementById('modCount').textContent = userData.stats.mods;
    document.getElementById('photoCount').textContent = userData.stats.photos;
    document.getElementById('postCount').textContent = userData.stats.posts;

    // Fill tags
    const tagsContainer = document.getElementById('userTags');
    tagsContainer.innerHTML = userData.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    // Fill recent activities
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = userData.activities.map(activity => 
        `<li>${activity}</li>`
    ).join('');

    // Fill achievements
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = userData.achievements.map(achievement => `
        <div class="achievement">
            <i class="fas ${achievement.icon}" style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${achievement.title}</h4>
            <p style="color: var(--metallic-silver); font-size: 0.9rem;">${achievement.description}</p>
        </div>
    `).join('');

    // Fill bikes grid
    const bikesGrid = document.getElementById('bikesGrid');
    const addBikeCard = bikesGrid.querySelector('.add-bike-card');
    const bikeCards = userData.bikes.map(bike => `
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
    if (addBikeCard) {
        addBikeCard.insertAdjacentHTML('beforebegin', bikeCards);
    }

    // Fill posts list
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = userData.posts.map(post => `
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

    // Fill photos grid
    const photosGrid = document.getElementById('photosGrid');
    const addPhotoCard = photosGrid.querySelector('.add-photo-card');
    
    // Create photo cards and insert before the add button
    const photoCards = userData.photos.map(photo => `
        <div class="photo-card" style="
            background: linear-gradient(145deg, var(--mid-surface), var(--dark-surface));
            border-radius: var(--border-radius-md);
            border: 1px solid var(--carbon-gray);
            transition: all 0.3s ease;
            overflow: hidden;
        ">
            <div style="
                height: 200px;
                background: url('${photo.thumbnail}') center/cover;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    padding: 1rem;
                    color: white;
                ">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${photo.title}</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                        <span style="color: var(--metallic-silver);">${photo.uploadDate}</span>
                        <span style="color: var(--primary-color);"><i class="fas fa-heart"></i> ${photo.likes}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    if (addPhotoCard) {
        addPhotoCard.insertAdjacentHTML('beforebegin', photoCards);
    }

    // Fill likes grid
    const likesGrid = document.getElementById('likesGrid');
    
    // Create liked items cards
    const likedItemsHTML = userData.likedItems.map(item => `
        <div class="liked-item-card" style="
            background: linear-gradient(145deg, var(--mid-surface), var(--dark-surface));
            border-radius: var(--border-radius-md);
            border: 1px solid var(--carbon-gray);
            padding: 1.5rem;
            transition: all 0.3s ease;
        ">
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas ${item.type === 'modification' ? 'fa-wrench' : item.type === 'discussion' ? 'fa-comments' : 'fa-camera'}" style="color: var(--primary-color);"></i>
                    <span style="color: var(--metallic-silver); font-size: 0.9rem; text-transform: capitalize;">${item.type}</span>
                </div>
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1.1rem;">${item.title}</h4>
                <p style="color: var(--metallic-silver); margin-bottom: 1rem; font-size: 0.9rem;">by ${item.author} • ${item.date}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--primary-color); font-size: 0.9rem;">
                    <i class="fas fa-heart"></i> ${item.likes} likes
                </span>
                <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">View</button>
            </div>
        </div>
    `).join('');
    
    likesGrid.innerHTML = likedItemsHTML;

    // Fill form with user data
    document.getElementById('displayName').value = userData.username;
    document.getElementById('bio').value = userData.bio;
    document.getElementById('location').value = userData.location;
}

/**
 * Get user data based on username
 */
function getUserData(username) {
    // Define different user profiles
    const userProfiles = {
        'admin': {
            username: 'admin',
            bio: 'System Administrator - Managing MotoWeb community platform with extensive experience in motorcycle technology and system administration.',
            memberSince: '2024-01-01',
            location: 'System HQ',
            email: 'admin@motoweb.com',
            stats: {
                bikes: 5,
                mods: 50,
                photos: 100,
                posts: 25
            },
            tags: ['System Admin', 'All Categories', 'Platform Management', 'Technical Support', 'Community Moderation'],
            activities: [
                'System maintenance and updates - 2024-06-25',
                'Reviewed community guidelines - 2024-06-24',
                'Added new product categories - 2024-06-23',
                'Moderated community discussions - 2024-06-22',
                'Updated platform security features - 2024-06-21'
            ],
            achievements: [
                {
                    icon: 'fa-crown',
                    title: 'Platform Administrator',
                    description: 'System administrator and community manager'
                },
                {
                    icon: 'fa-shield-alt',
                    title: 'Security Expert',
                    description: 'Ensures platform security and user safety'
                },
                {
                    icon: 'fa-users-cog',
                    title: 'Community Manager',
                    description: 'Manages and supports the riding community'
                }
            ],
            bikes: [
                {
                    name: 'BMW S1000RR',
                    year: '2024',
                    mods: '15 modifications'
                },
                {
                    name: 'Ducati Panigale V4',
                    year: '2023',
                    mods: '12 modifications'
                },
                {
                    name: 'Kawasaki Ninja ZX-10R',
                    year: '2024',
                    mods: '10 modifications'
                }
            ],
            posts: [
                {
                    title: 'Community Guidelines Update',
                    date: '2024-06-25',
                    excerpt: 'Important updates to our community posting guidelines and moderation policies...',
                    comments: 15,
                    likes: 45
                },
                {
                    title: 'New Features Release Notes',
                    date: '2024-06-20',
                    excerpt: 'Exciting new features have been added to improve your MotoWeb experience...',
                    comments: 22,
                    likes: 67
                }
            ],
            photos: [
                {
                    id: 1,
                    title: 'BMW S1000RR - Track Configuration',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=BMW+S1000RR',
                    uploadDate: '2024-06-25',
                    likes: 89
                },
                {
                    id: 2,
                    title: 'Ducati Panigale V4 - Street Setup',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=Ducati+V4',
                    uploadDate: '2024-06-23',
                    likes: 76
                },
                {
                    id: 3,
                    title: 'Platform Features Overview',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=Platform+Guide',
                    uploadDate: '2024-06-20',
                    likes: 54
                }
            ],
            likedItems: [
                {
                    type: 'modification',
                    title: 'Advanced ECU Tuning Guide',
                    author: 'TechMaster',
                    likes: 156,
                    date: '2024-06-24'
                },
                {
                    type: 'discussion',
                    title: 'Best Practices for Track Days',
                    author: 'RaceProRider',
                    likes: 234,
                    date: '2024-06-22'
                },
                {
                    type: 'photo',
                    title: 'Stunning Sunset Ride Photography',
                    author: 'PhotoRider',
                    likes: 189,
                    date: '2024-06-21'
                }
            ]
        },
        'JohnRider': {
            username: 'JohnRider',
            bio: 'Passionate motorcycle enthusiast with 5+ years of modification experience. Love sharing knowledge and helping fellow riders.',
            memberSince: '2024-01-15',
            location: 'Taipei City',
            email: 'john.rider@email.com',
            stats: {
                bikes: 2,
                mods: 15,
                photos: 24,
                posts: 8
            },
            tags: ['Sport Bikes', 'Performance', 'LED Lighting', 'Suspension', 'Exhaust'],
            activities: [
                'Added new Monster Factory Z2 PRO Fork - 2024-06-20',
                'Posted photos of JET modification - 2024-06-18', 
                'Shared brake system upgrade experience - 2024-06-15',
                'Liked KOSO LED Tail Light review - 2024-06-12',
                'Commented on suspension setup guide - 2024-06-10'
            ],
            achievements: [
                {
                    icon: 'fa-wrench',
                    title: 'Modification Master',
                    description: 'Completed 10+ modifications'
                },
                {
                    icon: 'fa-users', 
                    title: 'Community Contributor',
                    description: 'Made 50+ helpful comments'
                },
                {
                    icon: 'fa-camera',
                    title: 'Photo Enthusiast', 
                    description: 'Shared 20+ photos'
                }
            ],
            bikes: [
                {
                    name: 'SYM JET SL 125',
                    year: '2023',
                    mods: '8 modifications'
                },
                {
                    name: 'YAMAHA FORCE 2.0',
                    year: '2024', 
                    mods: '7 modifications'
                }
            ],
            posts: [
                {
                    title: 'Monster Factory Z2 PRO Fork Review',
                    date: '2024-06-21',
                    excerpt: 'After installing the new fork, the handling has improved significantly...',
                    comments: 8,
                    likes: 25
                },
                {
                    title: 'LED Tail Light Installation Guide', 
                    date: '2024-06-16',
                    excerpt: 'Step-by-step guide for installing the KOSO LED tail light...',
                    comments: 12,
                    likes: 34
                }
            ],
            photos: [
                {
                    id: 1,
                    title: 'SYM JET SL 125 - LED Lighting Setup',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=LED+Lights',
                    uploadDate: '2024-06-20',
                    likes: 15
                },
                {
                    id: 2,
                    title: 'YAMAHA FORCE Exhaust Upgrade',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=Exhaust',
                    uploadDate: '2024-06-18',
                    likes: 23
                },
                {
                    id: 3,
                    title: 'Monster Factory Z2 PRO Installation',
                    thumbnail: 'https://via.placeholder.com/300x200/333/fff?text=Fork+Upgrade',
                    uploadDate: '2024-06-15',
                    likes: 31
                }
            ],
            likedItems: [
                {
                    type: 'modification',
                    title: 'KOSO LED Tail Light Review',
                    author: 'TechRider99',
                    likes: 45,
                    date: '2024-06-19'
                },
                {
                    type: 'discussion',
                    title: 'Best Exhaust Systems for Sport Bikes',
                    author: 'BikeExpert',
                    likes: 67,
                    date: '2024-06-17'
                },
                {
                    type: 'photo',
                    title: 'Honda CBR1000RR Track Build',
                    author: 'SpeedDemon',
                    likes: 89,
                    date: '2024-06-15'
                }
            ]
        }
    };
    
    // Return user data or default to JohnRider if user not found
    return userProfiles[username] || userProfiles['JohnRider'];
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