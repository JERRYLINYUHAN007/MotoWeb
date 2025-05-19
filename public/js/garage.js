// Garage Page JavaScript

// DOM Elements
const addVehicleBtn = document.getElementById('addBikeBtn');
const addVehicleModal = document.getElementById('addBikeModal');
const closeModalBtn = document.querySelector('.close-modal');
const fileUpload = document.getElementById('bikeImage');
const filePreview = document.querySelector('.file-preview');
const vehicleForm = document.getElementById('addBikeForm');
const filterBrand = document.getElementById('bikeFilter');
const filterCategory = document.getElementById('sortOrder');
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-btn');
const bikesGrid = document.querySelector('.bikes-grid');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Modal Toggle
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            addVehicleModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            addVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addVehicleModal) {
            addVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // File Upload Preview
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }

    // Form Submission
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleFormSubmit);
    }

    // Filter and Search
    if (filterBrand) {
        filterBrand.addEventListener('change', filterVehicles);
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', filterVehicles);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchVehicles);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchVehicles();
            }
        });
    }

    // Setup cancel button for adding bike
    const cancelAddBike = document.getElementById('cancelAddBike');
    if (cancelAddBike) {
        cancelAddBike.addEventListener('click', () => {
            addVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Bike Action Buttons
    setupBikeActionButtons();

    // Load garage
    loadGarage();
});

// File Upload Handler
function handleFileUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('請上傳圖片檔案！');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過5MB！');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        filePreview.innerHTML = `
            <div class="preview-image">
                <img src="${e.target.result}" alt="Vehicle Preview" style="max-width: 100%; max-height: 200px; display: block; margin: 0 auto;">
                <p class="text-center mt-2">${file.name}</p>
            </div>
        `;
        filePreview.classList.add('has-preview');
    };
    
    reader.readAsDataURL(file);
}

// Form Submit Handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(vehicleForm);
    
    // Validate form
    const brand = formData.get('brand');
    const model = formData.get('model');
    const year = formData.get('year');
    
    if (!brand || !model || !year) {
        alert('請填寫必填欄位！');
        return;
    }
    
    // Disable submit button
    const submitBtn = vehicleForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '處理中...';
    
    // Send to server
    fetch('/api/garage', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || '新增車輛失敗');
            });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || '車輛資料新增成功！');
        
        // Reset form and close modal
        vehicleForm.reset();
        filePreview.innerHTML = '';
        filePreview.classList.remove('has-preview');
        addVehicleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Add new bike to grid
        addNewBikeToGrid(data.bike);
        
        // If this is the main bike, update all other bikes' status
        if (data.bike.isMainBike) {
            document.querySelectorAll('.bike-card').forEach(card => {
                if (card.dataset.id !== data.bike._id.toString()) {
                    const mainBadge = card.querySelector('.main-badge');
                    if (mainBadge) mainBadge.remove();
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message || '新增車輛失敗，請稍後再試');
    })
    .finally(() => {
        // Restore submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Add a new bike to the grid
function addNewBikeToGrid(bike) {
    // Create a new bike card
    const bikeCard = document.createElement('div');
    bikeCard.className = 'bike-card';
    bikeCard.setAttribute('data-brand', bike.brand);
    bikeCard.setAttribute('data-category', bike.category);
    bikeCard.setAttribute('data-id', bike._id);
    
    bikeCard.innerHTML = `
        <div class="bike-header">
            <div class="bike-image">
                <img src="${bike.imagePath}" alt="${bike.brand} ${bike.model}">
            </div>
            <div class="bike-actions">
                <button class="btn-icon edit-bike" title="編輯車輛資料" data-id="${bike._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon share-bike" title="分享車輛" data-id="${bike._id}">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="btn-icon delete-bike" title="刪除車輛" data-id="${bike._id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="bike-info">
            <div class="bike-title">
                <h3>${bike.brand} ${bike.model}</h3>
                ${bike.isMainBike ? '<span class="main-badge">主要車輛</span>' : ''}
            </div>
            <div class="bike-specs">
                <div class="spec-item">
                    <span class="spec-label">年份</span>
                    <span class="spec-value">${bike.year}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">排量</span>
                    <span class="spec-value">${bike.cc || 'N/A'} cc</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">里程</span>
                    <span class="spec-value">${bike.mileage || 0} km</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">最後更新</span>
                    <span class="spec-value">${new Date(bike.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="bike-mods">
                <h4>改裝零件 <span class="mod-count">${bike.modifications ? bike.modifications.length : 0}</span></h4>
                <div class="mod-tags">
                    ${bike.modifications && bike.modifications.length > 0 
                      ? bike.modifications.map(mod => `<span class="mod-tag">${mod.name}</span>`).join('')
                      : '<span class="mod-tag">尚無改裝項目</span>'}
                </div>
            </div>
            <div class="bike-footer">
                <a href="#" class="view-details" data-id="${bike._id}">查看詳情</a>
                <button class="btn btn-outline add-mod-btn" data-id="${bike._id}">添加改裝</button>
            </div>
        </div>
    `;
    
    // Add to grid
    bikesGrid.appendChild(bikeCard);
    
    // Attach events to the new bike card
    attachBikeCardEvents(bikeCard);
}

// Load garage
function loadGarage() {
    if (!localStorage.getItem('token')) {
        // Not logged in, show login prompt
        bikesGrid.innerHTML = `
            <div class="login-prompt">
                <i class="fas fa-lock"></i>
                <h3>請登入以查看您的車庫</h3>
                <p>登入後可以管理您的車輛與改裝記錄</p>
                <a href="/login.html" class="btn btn-primary">立即登入</a>
            </div>
        `;
        return;
    }
    
    // Show loading
    bikesGrid.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> 載入中...</div>';
    
    // Get garage list from server
    fetch('/api/garage', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || '獲取車庫列表失敗');
            });
        }
        return response.json();
    })
    .then(data => {
        // Clear and re-render garage
        bikesGrid.innerHTML = '';
        
        if (!data.bikes || data.bikes.length === 0) {
            bikesGrid.innerHTML = `
                <div class="empty-garage">
                    <i class="fas fa-motorcycle"></i>
                    <h3>您的車庫暫無車輛</h3>
                    <p>點擊「新增車輛」按鈕開始建立您的車庫</p>
                </div>
            `;
            return;
        }
        
        // Render all bikes
        data.bikes.forEach(bike => {
            addNewBikeToGrid(bike);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        bikesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>載入失敗</h3>
                <p>${error.message || '獲取車庫列表失敗，請稍後再試'}</p>
                <button class="btn btn-outline retry-btn">重試</button>
            </div>
        `;
        
        // Bind retry button
        document.querySelector('.retry-btn').addEventListener('click', loadGarage);
    });
}

// Attach events to bike card
function attachBikeCardEvents(bikeCard) {
    // Delete bike
    const deleteBtn = bikeCard.querySelector('.delete-bike');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const bikeId = this.dataset.id;
            if (confirm('確定要刪除這輛車嗎？此操作無法恢復。')) {
                fetch(`/api/garage/${bikeId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.error || '刪除車輛失敗');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message || '車輛已成功刪除');
                    bikeCard.remove();
                    
                    // If garage is empty, show empty garage prompt
                    if (bikesGrid.children.length === 0) {
                        bikesGrid.innerHTML = `
                            <div class="empty-garage">
                                <i class="fas fa-motorcycle"></i>
                                <h3>您的車庫暫無車輛</h3>
                                <p>點擊「新增車輛」按鈕開始建立您的車庫</p>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(error.message || '刪除車輛失敗，請稍後再試');
                });
            }
        });
    }
    
    // Other button event handling can be added based on needs
}

// Filter vehicles by brand and category
function filterVehicles() {
    const brandFilter = filterBrand.value;
    const categoryFilter = filterCategory.value;
    const bikeCards = document.querySelectorAll('.bike-card');
    
    bikeCards.forEach(card => {
        const cardBrand = card.getAttribute('data-brand');
        const cardCategory = card.getAttribute('data-category');
        
        let showCard = true;
        
        if (brandFilter && brandFilter !== 'all' && cardBrand !== brandFilter) {
            showCard = false;
        }
        
        if (categoryFilter && categoryFilter !== 'newest' && cardCategory !== categoryFilter) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

// Search vehicles
function searchVehicles() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) return;
    
    const bikeCards = document.querySelectorAll('.bike-card');
    
    bikeCards.forEach(card => {
        const bikeInfo = card.querySelector('.bike-info').textContent.toLowerCase();
        if (bikeInfo.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Setup bike action buttons
function setupBikeActionButtons() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-bike');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bikeCard = btn.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            alert(`編輯車輛: ${bikeName}`);
            // In a real app, this would open the edit form with pre-filled data
        });
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-bike');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bikeCard = btn.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            
            // In a real app, this would implement Web Share API or a custom share dialog
            if (navigator.share) {
                navigator.share({
                    title: `我的摩托車: ${bikeName}`,
                    text: `看看我的愛車 ${bikeName} 在 MotoMod 上的改裝項目！`,
                    url: window.location.href,
                }).catch(err => {
                    console.log('分享失敗:', err);
                });
            } else {
                const shareUrl = window.location.href;
                alert(`分享此連結: ${shareUrl}`);
            }
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-bike');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bikeCard = btn.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            
            if (confirm(`確定要刪除 ${bikeName} 嗎？此操作無法復原。`)) {
                bikeCard.remove();
                updateBikeCounter();
                alert(`已刪除 ${bikeName}`);
            }
        });
    });
    
    // View details links
    const viewDetailsLinks = document.querySelectorAll('.view-details');
    viewDetailsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const bikeCard = link.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            alert(`查看車輛詳情: ${bikeName}`);
            // In a real app, this would navigate to the bike details page
        });
    });
    
    // Add modification buttons
    const addModButtons = document.querySelectorAll('.add-mod-btn');
    addModButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bikeCard = btn.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            alert(`為 ${bikeName} 新增改裝項目`);
            // In a real app, this would open the add modification form
        });
    });
}

// Update bike counter in the sidebar
function updateBikeCounter() {
    const bikeCounter = document.querySelector('.stat-number');
    if (bikeCounter) {
        const visibleBikes = document.querySelectorAll('.bike-card:not([style*="display: none"])').length;
        bikeCounter.textContent = visibleBikes;
    }
}

// Interactive bike card effects
function setupBikeCardInteraction() {
    const bikeCards = document.querySelectorAll('.bike-card');
    
    bikeCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const image = card.querySelector('.bike-image img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const image = card.querySelector('.bike-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
}

// Initialize all interactions
function initGaragePage() {
    setupBikeCardInteraction();
    updateBikeCounter();
}

// Run initialization when document is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaragePage);
} else {
    initGaragePage();
} 