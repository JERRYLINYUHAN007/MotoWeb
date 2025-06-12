/**
 * gallery.js - MotoWeb Gallery Page Functionality
 */

// Current previewing gallery item
let currentGalleryItem = null;

/**
 * Initialize gallery page
 */
function initGalleryPage() {
    console.log('Starting gallery page initialization');
    
    // Initialize upload functionality first
    initUploadFeature();
    
    // Initialize other features
    initImagePreview();
    initFilters();
    initViewToggle();
    initSearchFunction();
    
    // Load mock gallery data
    loadGalleryItems();
    
    console.log('All gallery features initialized');
}

/**
 * Initialize upload functionality
 */
function initUploadFeature() {
    console.log('Starting upload feature initialization');
    
    // Find all upload buttons
    const uploadBtns = document.querySelectorAll('.upload-btn, .upload-btn-large, #uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    
    console.log('Found upload buttons:', uploadBtns.length);
    console.log('Upload modal:', uploadModal);
    
    if (!uploadModal) {
        console.error('Upload modal not found!');
        return;
    }
    
    // Bind events for each upload button
    uploadBtns.forEach((btn, index) => {
        console.log(`Binding button ${index + 1}:`, btn.id, btn.className);
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Upload button clicked:', this.id || this.className);
            
            // Check login status
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!isLoggedIn) {
                console.log('User not logged in, showing login prompt');
                showLoginPromptModal();
                return;
            }
            
            console.log('User logged in, opening upload modal');
            openModal(uploadModal);
        });
    });
    
    // Bind modal close events
    const closeBtn = uploadModal.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelUpload');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(uploadModal));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(uploadModal));
    }
    
    // Click outside modal to close
    uploadModal.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            closeModal(uploadModal);
        }
    });
    
    // Bind form submit event
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Simulate upload
            alert('Upload functionality is working! (This is a mock version)');
            closeModal(uploadModal);
        });
    }
    
    console.log('Upload feature initialization completed');
}

/**
 * Show login prompt modal
 */
function showLoginPromptModal() {
    // Create login prompt modal
    let loginPromptModal = document.getElementById('loginPromptModal');
    
    if (!loginPromptModal) {
        loginPromptModal = document.createElement('div');
        loginPromptModal.id = 'loginPromptModal';
        loginPromptModal.className = 'modal';
        loginPromptModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center; padding: 3rem 2rem;">
                <button class="modal-close" id="closeLoginPrompt">&times;</button>
                <div class="login-prompt-content">
                    <div class="login-icon" style="margin-bottom: 2rem;">
                        <i class="fas fa-user-lock" style="font-size: 4rem; color: var(--primary-color); text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);"></i>
                    </div>
                    <h2 style="color: white; margin-bottom: 1.5rem; text-shadow: 0 0 10px var(--primary-color);">Login Required to Upload</h2>
                    <p style="color: var(--metallic-silver); margin-bottom: 2rem; line-height: 1.6;">
                        You need to log in to your account to upload and share your motorcycle modification works.<br>
                        Log in to enjoy the full community features.
                    </p>
                    <div class="login-actions" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="login.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                            <i class="fas fa-sign-in-alt"></i> Login Now
                        </a>
                        <a href="register.html" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; color: var(--primary-color); border-color: var(--primary-color);">
                            <i class="fas fa-user-plus"></i> Register Account
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loginPromptModal);
        
        // Bind close events
        const closeLoginPrompt = loginPromptModal.querySelector('#closeLoginPrompt');
        closeLoginPrompt.addEventListener('click', function() {
            loginPromptModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Click outside modal to close
        loginPromptModal.addEventListener('click', function(e) {
            if (e.target === loginPromptModal) {
                loginPromptModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Show modal
    loginPromptModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Open modal
 */
function openModal(modal) {
    console.log('Opening modal:', modal.id);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal(modal) {
    console.log('Closing modal:', modal.id);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Load gallery items data from API
 */
async function loadGalleryItems() {
    const galleryContainer = document.getElementById('galleryItems');
    const galleryCount = document.getElementById('gallery-count');
    
    if (!galleryContainer) {
        console.error('Gallery items container not found');
        return;
    }
    
    try {
        console.log('Loading gallery items from API...');
        
        // 顯示載入中
        galleryContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading works...</p>
            </div>
        `;
        
        // 直接使用 fetch 從 API 獲取數據
        const response = await fetch('/api/gallery?limit=20');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (!data || !data.items || data.items.length === 0) {
            // 顯示空狀態
            galleryContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>No Works to Display Yet</h3>
                    <p>Currently no modification works available. Come share your creations!</p>
                    <button class="btn btn-primary upload-btn" onclick="checkLoginAndUpload()">
                        <i class="fas fa-cloud-upload-alt"></i> Upload Your Work
                    </button>
                </div>
            `;
            
            if (galleryCount) {
                galleryCount.textContent = '0 results';
            }
            return;
        }
        
        // 生成作品 HTML
        const galleryHTML = data.items.map(work => {
            // 確保統計數據存在
            const stats = work.stats || { likes: 0, views: 0, comments: 0 };
            const author = work.author || { name: 'Unknown', avatar: '/images/default-avatar.svg' };
            
            // 處理圖片路徑
            const imageSrc = work.image || work.images?.[0] || 'https://via.placeholder.com/400x300/333/fff?text=No+Image';
            
            // 處理分類顯示
            const categoryDisplay = {
                'performance': 'Performance',
                'visual': 'Visual',
                'suspension': 'Suspension',
                'exhaust': 'Exhaust'
            }[work.category] || work.category;
            
            return `
                <div class="gallery-item" 
                     data-category="${work.category}" 
                     data-brand="${extractBrand(work.model)}" 
                     data-style="${work.style}">
                    <div class="item-image">
                        <img src="${imageSrc}" 
                             alt="${work.title}" 
                             onerror="this.src='https://via.placeholder.com/400x300/333/fff?text=No+Image'">
                        <div class="item-overlay">
                            <h3 class="item-title">${work.title}</h3>
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3 class="item-title">${work.title}</h3>
                            <span class="item-type">${categoryDisplay}</span>
                        </div>
                        <div class="item-author">
                            <img src="${author.avatar}" 
                                 alt="${author.name}" 
                                 class="author-avatar"
                                 onerror="this.src='/images/default-avatar.svg'">
                            <span>by ${author.name}</span>
                        </div>
                        <p class="item-description">
                            ${work.description ? work.description.substring(0, 120) : 'No description available'}${work.description && work.description.length > 120 ? '...' : ''}
                        </p>
                        <div class="item-stats">
                            <span class="stat-item">
                                <i class="fas fa-heart"></i> ${stats.likes}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-eye"></i> ${stats.views}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-comment"></i> ${stats.comments}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        galleryContainer.innerHTML = galleryHTML;
        
        // 更新結果計數
        if (galleryCount) {
            galleryCount.textContent = `${data.items.length} results`;
        }
        
        console.log(`Gallery items loaded: ${data.items.length} items`);
        
    } catch (error) {
        console.error('Failed to load gallery items:', error);
        
        // 顯示錯誤狀態
        galleryContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Works</h3>
                <p>Error: ${error.message}. Please check if the server is running and try again.</p>
                <button class="btn btn-primary" onclick="loadGalleryItems()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
        
        if (galleryCount) {
            galleryCount.textContent = '0 results';
        }
    }
}

/**
 * Extract brand from model string
 */
function extractBrand(model) {
    if (!model) return 'unknown';
    
    const brandMap = {
        'yamaha': 'YAMAHA',
        'sym': 'SYM',
        'kymco': 'KYMCO',
        'augur': 'AUGUR'
    };
    
    const modelLower = model.toLowerCase();
    for (const [key, value] of Object.entries(brandMap)) {
        if (modelLower.includes(key)) {
            return value;
        }
    }
    
    return 'OTHER';
}

/**
 * Check login status and execute upload operation
 */
function checkLoginAndUpload() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showLoginPromptModal();
        return;
    }
    
    // If logged in, trigger upload button
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.click();
    }
}

/**
 * Initialize image preview functionality
 */
function initImagePreview() {
    // Basic image preview functionality
    console.log('Initializing image preview functionality');
}

/**
 * Initialize filter functionality
 */
function initFilters() {
    console.log('Initializing filter functionality');
}

/**
 * Initialize view toggle functionality
 */
function initViewToggle() {
    console.log('Initializing view toggle functionality');
}

/**
 * Initialize search functionality
 */
function initSearchFunction() {
    console.log('Initializing search functionality');
}

/**
 * Toggle filter group display
 */
function toggleFilterGroup(element) {
    console.log('Toggling filter group');
    
    const filterGroup = element.closest('.filter-group');
    const filterList = filterGroup.querySelector('.filter-list');
    const chevronIcon = element.querySelector('i');
    
    if (!filterList) {
        console.log('No filter list found');
        return;
    }
    
    // Toggle the open class
    if (filterList.classList.contains('open')) {
        // Close the group
        filterList.classList.remove('open');
        element.classList.remove('open');
        if (chevronIcon) {
            chevronIcon.classList.remove('fa-chevron-down');
            chevronIcon.classList.add('fa-chevron-right');
        }
        console.log('Filter group closed');
    } else {
        // Open the group
        filterList.classList.add('open');
        element.classList.add('open');
        if (chevronIcon) {
            chevronIcon.classList.remove('fa-chevron-right');
            chevronIcon.classList.add('fa-chevron-down');
        }
        console.log('Filter group opened');
    }
}

/**
 * Filter by category
 */
function filterByCategory(category) {
    console.log('Filtering by category:', category);
    
    // Update active state
    const categoryLinks = document.querySelectorAll('.filter-list a');
    categoryLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(category) || category === 'all') {
            if (category === 'all' && link.textContent.toLowerCase().includes('all')) {
                link.classList.add('active');
            } else if (category !== 'all' && !link.textContent.toLowerCase().includes('all')) {
                link.classList.add('active');
            }
        }
    });
    
    // Add filter tag
    if (category !== 'all') {
        addFilterTag('Category', category);
    }
    
    // Update gallery display (mock)
    updateGalleryDisplay();
}

/**
 * Filter by brand
 */
function filterByBrand(brand) {
    console.log('Filtering by brand:', brand);
    
    // Add filter tag
    if (brand !== 'all') {
        addFilterTag('Brand', brand);
    }
    
    // Update gallery display (mock)
    updateGalleryDisplay();
}

/**
 * Filter by style
 */
function filterByStyle(style) {
    console.log('Filtering by style:', style);
    
    // Add filter tag
    if (style !== 'all') {
        addFilterTag('Style', style);
    }
    
    // Update gallery display (mock)
    updateGalleryDisplay();
}

/**
 * Add filter tag
 */
function addFilterTag(type, value) {
    const appliedFilters = document.getElementById('appliedFilters');
    if (!appliedFilters) return;
    
    // Check if tag already exists
    const existingTag = appliedFilters.querySelector(`[data-filter="${type}:${value}"]`);
    if (existingTag) return;
    
    // Create filter tag
    const filterTag = document.createElement('div');
    filterTag.className = 'filter-tag';
    filterTag.dataset.filter = `${type}:${value}`;
    filterTag.innerHTML = `
        ${type}: ${value}
        <button class="remove-tag" onclick="removeFilterTag(this)">×</button>
    `;
    
    appliedFilters.appendChild(filterTag);
    
    // Show clear all button if not exists
    if (!appliedFilters.querySelector('.clear-all-filters')) {
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clear-all-filters';
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.onclick = clearAllFilters;
        appliedFilters.appendChild(clearAllBtn);
    }
    
    // Apply filters after adding tag
    applyFilters();
}

/**
 * Remove filter tag
 */
function removeFilterTag(button) {
    const filterTag = button.parentElement;
    filterTag.remove();
    
    // Hide clear all button if no tags remain
    const appliedFilters = document.getElementById('appliedFilters');
    const remainingTags = appliedFilters.querySelectorAll('.filter-tag');
    const clearAllBtn = appliedFilters.querySelector('.clear-all-filters');
    
    if (remainingTags.length === 0 && clearAllBtn) {
        clearAllBtn.remove();
    }
    
    // Apply filters after removing tag
    applyFilters();
}

/**
 * Clear all filters and reload all data
 */
function clearAllFilters() {
    const appliedFilters = document.getElementById('appliedFilters');
    if (appliedFilters) {
        appliedFilters.innerHTML = '';
    }
    
    // Reset all active filter links
    const filterLinks = document.querySelectorAll('.filter-list a');
    filterLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes('all')) {
            link.classList.add('active');
        }
    });
    
    // Reset sort select to default
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.value = 'latest';
    }
    
    // Reload all gallery items
    loadGalleryItems();
}

/**
 * Switch view between grid and list
 */
function switchView(viewType) {
    console.log('Switching to view:', viewType);
    
    const viewToggles = document.querySelectorAll('.view-toggle');
    const galleryItems = document.getElementById('galleryItems');
    
    // Update active toggle
    viewToggles.forEach(toggle => {
        toggle.classList.remove('active');
        if (toggle.dataset.view === viewType) {
            toggle.classList.add('active');
        }
    });
    
    // Update gallery layout class
    if (galleryItems) {
        galleryItems.className = viewType === 'list' ? 'gallery-items list-view' : 'gallery-items';
    }
}

/**
 * Update gallery display (mock function)
 */
function updateGalleryDisplay() {
    console.log('Updating gallery display with current filters');
    
    // This is a mock function - in a real application, 
    // this would filter the actual gallery items based on applied filters
    const galleryCount = document.getElementById('gallery-count');
    if (galleryCount) {
        const filterTags = document.querySelectorAll('.filter-tag');
        const mockCount = Math.max(0, 150 - (filterTags.length * 20));
        galleryCount.textContent = `${mockCount} results`;
    }
}

/**
 * Handle sort change - fetch data from API with new sort order
 */
async function handleSortChange(sortValue) {
    console.log('Sorting by:', sortValue);
    
    const galleryContainer = document.getElementById('galleryItems');
    const galleryCount = document.getElementById('gallery-count');
    
    if (!galleryContainer) return;
    
    try {
        // 顯示載入中
        galleryContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Sorting works...</p>
            </div>
        `;
        
        // 從 API 獲取排序後的數據
        const response = await fetch(`/api/gallery?sort=${sortValue}&limit=20`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Sort API response:', data);
        
        if (!data.items || data.items.length === 0) {
            galleryContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>No Works Found</h3>
                    <p>No works match the current sorting criteria.</p>
                </div>
            `;
            
            if (galleryCount) {
                galleryCount.textContent = '0 results';
            }
            return;
        }
        
        // 生成作品 HTML
        const galleryHTML = data.items.map(work => {
            const stats = work.stats || { likes: 0, views: 0, comments: 0 };
            const author = work.author || { name: 'Unknown', avatar: '/images/default-avatar.svg' };
            const imageSrc = work.image || work.images?.[0] || 'https://via.placeholder.com/400x300/333/fff?text=No+Image';
            
            const categoryDisplay = {
                'performance': 'Performance',
                'visual': 'Visual',
                'suspension': 'Suspension',
                'exhaust': 'Exhaust'
            }[work.category] || work.category;
            
            return `
                <div class="gallery-item" 
                     data-category="${work.category}" 
                     data-brand="${extractBrand(work.model)}" 
                     data-style="${work.style}">
                    <div class="item-image">
                        <img src="${imageSrc}" 
                             alt="${work.title}" 
                             onerror="this.src='https://via.placeholder.com/400x300/333/fff?text=No+Image'">
                        <div class="item-overlay">
                            <h3 class="item-title">${work.title}</h3>
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3 class="item-title">${work.title}</h3>
                            <span class="item-type">${categoryDisplay}</span>
                        </div>
                        <div class="item-author">
                            <img src="${author.avatar}" 
                                 alt="${author.name}" 
                                 class="author-avatar"
                                 onerror="this.src='/images/default-avatar.svg'">
                            <span>by ${author.name}</span>
                        </div>
                        <p class="item-description">
                            ${work.description ? work.description.substring(0, 120) : 'No description available'}${work.description && work.description.length > 120 ? '...' : ''}
                        </p>
                        <div class="item-stats">
                            <span class="stat-item">
                                <i class="fas fa-heart"></i> ${stats.likes}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-eye"></i> ${stats.views}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-comment"></i> ${stats.comments}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        galleryContainer.innerHTML = galleryHTML;
        
        // 更新結果計數
        if (galleryCount) {
            galleryCount.textContent = `${data.items.length} results`;
        }
        
        console.log(`Gallery sorted by ${sortValue}, ${data.items.length} items displayed`);
        
    } catch (error) {
        console.error('Failed to sort gallery:', error);
        
        // 顯示錯誤狀態
        galleryContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Sorting Failed</h3>
                <p>Error: ${error.message}. Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="loadGalleryItems()">
                    <i class="fas fa-redo"></i> Reload Gallery
                </button>
            </div>
        `;
    }
}

/**
 * Apply current filters using API
 */
async function applyFilters() {
    const galleryContainer = document.getElementById('galleryItems');
    const galleryCount = document.getElementById('gallery-count');
    const filterTags = document.querySelectorAll('.filter-tag');
    
    if (!galleryContainer) return;
    
    // 獲取當前篩選條件
    const filters = {
        category: null,
        brand: null,
        style: null
    };
    
    filterTags.forEach(tag => {
        const filterData = tag.dataset.filter.split(':');
        const filterType = filterData[0].toLowerCase();
        const filterValue = filterData[1].toLowerCase();
        
        if (filterType === 'category') filters.category = filterValue;
        if (filterType === 'brand') filters.brand = filterValue;
        if (filterType === 'style') filters.style = filterValue;
    });
    
    try {
        // 顯示載入中
        galleryContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Filtering works...</p>
            </div>
        `;
        
        // 建立 API 查詢參數
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '20');
        
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.brand) queryParams.append('brand', filters.brand);
        if (filters.style) queryParams.append('style', filters.style);
        
        // 獲取當前排序設定
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            queryParams.append('sort', sortSelect.value);
        }
        
        console.log('Applying filters:', filters);
        console.log('API query:', `/api/gallery?${queryParams.toString()}`);
        
        // 從 API 獲取篩選後的數據
        const response = await fetch(`/api/gallery?${queryParams.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Filter API response:', data);
        
        if (!data.items || data.items.length === 0) {
            galleryContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Matching Works</h3>
                    <p>No works found matching your filter criteria. Try adjusting your filters.</p>
                    <button class="btn btn-outline" onclick="clearAllFilters()">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `;
            
            if (galleryCount) {
                galleryCount.textContent = '0 results';
            }
            return;
        }
        
        // 生成作品 HTML
        const galleryHTML = data.items.map(work => {
            const stats = work.stats || { likes: 0, views: 0, comments: 0 };
            const author = work.author || { name: 'Unknown', avatar: '/images/default-avatar.svg' };
            const imageSrc = work.image || work.images?.[0] || 'https://via.placeholder.com/400x300/333/fff?text=No+Image';
            
            const categoryDisplay = {
                'performance': 'Performance',
                'visual': 'Visual',
                'suspension': 'Suspension',
                'exhaust': 'Exhaust'
            }[work.category] || work.category;
            
            return `
                <div class="gallery-item" 
                     data-category="${work.category}" 
                     data-brand="${extractBrand(work.model)}" 
                     data-style="${work.style}">
                    <div class="item-image">
                        <img src="${imageSrc}" 
                             alt="${work.title}" 
                             onerror="this.src='https://via.placeholder.com/400x300/333/fff?text=No+Image'">
                        <div class="item-overlay">
                            <h3 class="item-title">${work.title}</h3>
                        </div>
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3 class="item-title">${work.title}</h3>
                            <span class="item-type">${categoryDisplay}</span>
                        </div>
                        <div class="item-author">
                            <img src="${author.avatar}" 
                                 alt="${author.name}" 
                                 class="author-avatar"
                                 onerror="this.src='/images/default-avatar.svg'">
                            <span>by ${author.name}</span>
                        </div>
                        <p class="item-description">
                            ${work.description ? work.description.substring(0, 120) : 'No description available'}${work.description && work.description.length > 120 ? '...' : ''}
                        </p>
                        <div class="item-stats">
                            <span class="stat-item">
                                <i class="fas fa-heart"></i> ${stats.likes}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-eye"></i> ${stats.views}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-comment"></i> ${stats.comments}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        galleryContainer.innerHTML = galleryHTML;
        
        // 更新結果計數
        if (galleryCount) {
            galleryCount.textContent = `${data.items.length} results`;
        }
        
        console.log(`Applied filters, showing ${data.items.length} items`);
        
    } catch (error) {
        console.error('Failed to apply filters:', error);
        
        // 顯示錯誤狀態
        galleryContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Filter Error</h3>
                <p>Error: ${error.message}. Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="loadGalleryItems()">
                    <i class="fas fa-redo"></i> Reload Gallery
                </button>
            </div>
        `;
    }
}

/**
 * Initialize gallery item click events
 */
function initGalleryItemEvents() {
    console.log('Initializing gallery item click events');
    
    // Use event delegation to handle gallery item clicks
    document.addEventListener('click', function(e) {
        const galleryItem = e.target.closest('.gallery-item');
        
        if (galleryItem) {
            e.preventDefault();
            console.log('Gallery item clicked:', galleryItem);
            
            // Extract data from the gallery item
            const itemData = extractGalleryItemData(galleryItem);
            
            if (itemData) {
                openGalleryItemModal(itemData);
            }
        }
    });
    
    // Initialize modal close events
    initModalCloseEvents();
}

/**
 * Extract data from gallery item element
 */
function extractGalleryItemData(galleryItem) {
    try {
        const img = galleryItem.querySelector('.item-image img');
        const title = galleryItem.querySelector('.item-title');
        const description = galleryItem.querySelector('.item-description');
        const author = galleryItem.querySelector('.item-author span');
        const authorAvatar = galleryItem.querySelector('.author-avatar');
        const stats = galleryItem.querySelectorAll('.stat-item');
        
        return {
            title: title ? title.textContent.trim() : 'Untitled',
            description: description ? description.textContent.trim() : 'No description available',
            image: img ? img.src : '',
            author: {
                name: author ? author.textContent.replace('by ', '').trim() : 'Unknown',
                avatar: authorAvatar ? authorAvatar.src : '/images/default-avatar.svg'
            },
            stats: {
                likes: stats[0] ? stats[0].textContent.trim() : '0',
                views: stats[1] ? stats[1].textContent.trim() : '0',
                comments: stats[2] ? stats[2].textContent.trim() : '0'
            },
            category: galleryItem.dataset.category || 'general',
            brand: galleryItem.dataset.brand || '',
            style: galleryItem.dataset.style || ''
        };
    } catch (error) {
        console.error('Error extracting gallery item data:', error);
        return null;
    }
}

/**
 * Open gallery item modal with data
 */
function openGalleryItemModal(itemData) {
    console.log('Opening gallery item modal with data:', itemData);
    
    const modal = document.getElementById('imagePreview');
    
    if (!modal) {
        console.error('Image preview modal not found!');
        return;
    }
    
    // Update modal structure if needed
    updateModalStructure(modal);
    
    // Fill modal content
    const previewImage = modal.querySelector('#previewImage');
    const previewTitle = modal.querySelector('.preview-title');
    const previewDescription = modal.querySelector('.preview-description');
    const authorAvatar = modal.querySelector('.author-avatar');
    const authorName = modal.querySelector('.author-name');
    const likesCount = modal.querySelector('#likesCount');
    const commentsCount = modal.querySelector('#commentsCount');
    
    if (previewImage) {
        previewImage.src = itemData.image;
        previewImage.alt = itemData.title;
    }
    if (previewTitle) previewTitle.textContent = itemData.title;
    if (previewDescription) previewDescription.textContent = itemData.description;
    if (authorAvatar) {
        authorAvatar.src = itemData.author.avatar;
        authorAvatar.alt = itemData.author.name;
        authorAvatar.onerror = function() {
            this.src = '/images/default-avatar.svg';
        };
    }
    if (authorName) authorName.textContent = itemData.author.name;
    if (likesCount) likesCount.textContent = itemData.stats.likes;
    if (commentsCount) commentsCount.textContent = itemData.stats.comments;
    
    // Set post date (mock data for now)
    const postDate = modal.querySelector('.post-date');
    if (postDate) postDate.textContent = 'Posted today';
    
    // Create tags display
    const previewTags = modal.querySelector('.preview-tags');
    if (previewTags) {
        const tags = [];
        if (itemData.category) tags.push(itemData.category);
        if (itemData.brand) tags.push(itemData.brand);
        if (itemData.style) tags.push(itemData.style);
        
        previewTags.innerHTML = tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
    
    // Initialize modal interactive elements
    initModalInteractions(modal, itemData);
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('Gallery item modal opened successfully');
}

/**
 * Initialize modal close events
 */
function initModalCloseEvents() {
    const modal = document.getElementById('imagePreview');
    
    if (!modal) return;
    
    // Close button
    const closeBtn = modal.querySelector('.close-preview');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeGalleryModal();
        });
    }
    
    // Click outside modal to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeGalleryModal();
        }
    });
    
    // Initialize share modal close events
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        const closeShareBtn = shareModal.querySelector('.close-share');
        if (closeShareBtn) {
            closeShareBtn.addEventListener('click', function() {
                shareModal.style.display = 'none';
            });
        }
        
        shareModal.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
        
        // Copy link functionality
        const copyBtn = shareModal.querySelector('#copyLink');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const shareLink = shareModal.querySelector('#shareLink');
                if (shareLink) {
                    shareLink.select();
                    document.execCommand('copy');
                    this.textContent = '已複製！';
                    setTimeout(() => {
                        this.textContent = 'Copy Link';
                    }, 2000);
                }
            });
        }
    }
}

/**
 * Initialize modal interactions (like, comment, share)
 */
function initModalInteractions(modal, itemData) {
    // Like button functionality
    const likeBtn = modal.querySelector('#likeBtn');
    if (likeBtn) {
        likeBtn.onclick = function() {
            const heartIcon = this.querySelector('i');
            const likeCount = this.querySelector('#likesCount');
            
            if (heartIcon.classList.contains('far')) {
                // Like the post
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                heartIcon.style.color = '#ff6b6b';
                
                let currentLikes = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = currentLikes + 1;
                
                console.log('Post liked');
            } else {
                // Unlike the post
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                heartIcon.style.color = '';
                
                let currentLikes = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = Math.max(0, currentLikes - 1);
                
                console.log('Post unliked');
            }
        };
    }
    
    // Comment button functionality
    const commentBtn = modal.querySelector('#commentBtn');
    if (commentBtn) {
        commentBtn.onclick = function() {
            const commentsSection = modal.querySelector('#commentsSection');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
                
                // Create a simple comment input if not exists
                let commentInput = commentsSection.querySelector('.comment-input');
                if (!commentInput) {
                    const commentInputHtml = `
                        <div class="comment-input" style="margin-top: 1rem; padding: 1rem; background: var(--dark-surface); border-radius: 8px;">
                            <textarea placeholder="寫下你的留言..." style="width: 100%; background: var(--mid-surface); border: 1px solid var(--carbon-gray); border-radius: 4px; padding: 0.5rem; color: white; resize: vertical; min-height: 80px;"></textarea>
                            <div style="margin-top: 0.5rem; text-align: right;">
                                <button class="btn btn-primary btn-small" onclick="submitComment(this)">發送留言</button>
                            </div>
                        </div>
                    `;
                    commentsSection.insertAdjacentHTML('beforeend', commentInputHtml);
                }
            }
            console.log('Comment button clicked');
        };
    }
    
    // Share button functionality
    const shareBtn = modal.querySelector('#shareBtn');
    if (shareBtn) {
        shareBtn.onclick = function() {
            // Create share modal or use existing share functionality
            const shareModal = document.getElementById('shareModal');
            if (shareModal) {
                // Update share link with current post data
                const shareLink = shareModal.querySelector('#shareLink');
                if (shareLink) {
                    shareLink.value = `${window.location.origin}/gallery?post=${encodeURIComponent(itemData.title)}`;
                }
                
                shareModal.style.display = 'block';
                console.log('Share modal opened');
            } else {
                // Fallback: copy to clipboard
                const shareUrl = `${window.location.origin}/gallery?post=${encodeURIComponent(itemData.title)}`;
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('分享連結已複製到剪貼板！');
                }).catch(() => {
                    alert('無法複製連結，請手動複製：' + shareUrl);
                });
            }
        };
    }
}

/**
 * Submit comment function
 */
function submitComment(button) {
    const commentInput = button.closest('.comment-input').querySelector('textarea');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('請輸入留言內容');
        return;
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入才能留言');
        return;
    }
    
    // Create comment element
    const commentHtml = `
        <div class="comment-item" style="padding: 1rem; background: var(--mid-surface); border-radius: 8px; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <img src="/images/default-avatar.svg" alt="User" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 0.5rem;">
                <div>
                    <span style="color: white; font-weight: 500;">當前用戶</span>
                    <span style="color: var(--metallic-silver); font-size: 0.8rem; margin-left: 0.5rem;">剛剛</span>
                </div>
            </div>
            <p style="color: var(--metallic-silver); margin: 0;">${commentText}</p>
        </div>
    `;
    
    // Add comment to comments list
    const commentsList = button.closest('#commentsSection').querySelector('.comments-list');
    if (commentsList) {
        commentsList.insertAdjacentHTML('afterbegin', commentHtml);
    }
    
    // Clear input
    commentInput.value = '';
    
    // Update comment count
    const commentsCount = document.querySelector('#commentsCount');
    if (commentsCount) {
        let currentCount = parseInt(commentsCount.textContent) || 0;
        commentsCount.textContent = currentCount + 1;
    }
    
    console.log('Comment submitted:', commentText);
}

/**
 * Update modal structure for new layout
 */
function updateModalStructure(modal) {
    const previewMain = modal.querySelector('.preview-main');
    
    if (!previewMain) return;
    
    // Check if we already have the new structure
    if (previewMain.querySelector('.preview-image-section')) return;
    
    // Get existing elements
    const previewImage = modal.querySelector('#previewImage');
    const previewInfo = modal.querySelector('.preview-info');
    
    if (!previewImage || !previewInfo) return;
    
    // Create new structure
    const imageSection = document.createElement('div');
    imageSection.className = 'preview-image-section';
    imageSection.appendChild(previewImage);
    
    const infoSection = document.createElement('div');
    infoSection.className = 'preview-info-section';
    
    // Create info wrapper
    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'preview-info';
    
    // Create header section
    const headerSection = document.createElement('div');
    headerSection.className = 'preview-header';
    
    // Create content body section
    const contentBody = document.createElement('div');
    contentBody.className = 'preview-content-body';
    
    // Move existing content to appropriate sections
    const title = previewInfo.querySelector('.preview-title');
    const authorInfo = previewInfo.querySelector('.author-info') || previewInfo.querySelector('.preview-meta');
    const description = previewInfo.querySelector('.preview-description');
    const tags = previewInfo.querySelector('.preview-tags');
    const stats = previewInfo.querySelector('.preview-stats');
    
    if (title) headerSection.appendChild(title);
    if (authorInfo) headerSection.appendChild(authorInfo);
    if (description) contentBody.appendChild(description);
    if (tags) contentBody.appendChild(tags);
    
    infoWrapper.appendChild(headerSection);
    infoWrapper.appendChild(contentBody);
    if (stats) infoWrapper.appendChild(stats);
    
    infoSection.appendChild(infoWrapper);
    
    // Clear and rebuild preview-main
    previewMain.innerHTML = '';
    previewMain.appendChild(imageSection);
    previewMain.appendChild(infoSection);
}

/**
 * Close gallery modal
 */
function closeGalleryModal() {
    const modal = document.getElementById('imagePreview');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Gallery modal closed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting gallery page initialization');
    initGalleryPage();
    
    // Initialize gallery item click events
    initGalleryItemEvents();
    
    // Additional safety check to ensure upload button events are properly bound
    setTimeout(() => {
        console.log('Performing additional upload button check');
        
        const allUploadBtns = document.querySelectorAll('.upload-btn, #uploadBtn');
        console.log('Additional check found upload buttons:', allUploadBtns.length);
        
        allUploadBtns.forEach((btn, index) => {
            if (!btn._hasUploadListener) {
                console.log(`Adding backup event listener for button ${index + 1}`);
                
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Backup listener triggered:', this.id || this.className);
                    
                    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                    
                    if (!isLoggedIn) {
                        showLoginPromptModal();
                        return;
                    }
                    
                    const uploadModal = document.getElementById('uploadModal');
                    if (uploadModal) {
                        openModal(uploadModal);
                    }
                });
                
                btn._hasUploadListener = true;
            }
        });
    }, 1000);
});