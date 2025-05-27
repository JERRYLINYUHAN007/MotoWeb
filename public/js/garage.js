// Garage Page JavaScript

// DOM Elements
const addVehicleBtn = document.getElementById('addBikeBtn');
const addVehicleModal = document.getElementById('addBikeModal');
const editVehicleModal = document.getElementById('editBikeModal');
const shareVehicleModal = document.getElementById('shareBikeModal');
const closeModalBtn = document.querySelector('.close-modal');
const fileUpload = document.getElementById('bikeImage');
const editFileUpload = document.getElementById('editBikeImage');
const filePreview = document.querySelector('.file-preview');
const editFilePreview = document.getElementById('editFilePreview');
const vehicleForm = document.getElementById('addBikeForm');
const editVehicleForm = document.getElementById('editBikeForm');
const filterBrand = document.getElementById('bikeFilter');
const filterCategory = document.getElementById('sortOrder');
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-btn');
const bikesGrid = document.querySelector('.bikes-grid');

// 車庫頁面主要功能
let userBikes = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // 首先檢查登入狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasToken = localStorage.getItem('token');
    
    if (!isLoggedIn || !hasToken) {
        // 如果未登入，顯示提示並跳轉到登入頁面
        alert('請先登入以使用車庫功能');
        window.location.href = 'login.html';
        return;
    }
    
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

    // Edit File Upload Preview
    if (editFileUpload) {
        editFileUpload.addEventListener('change', handleEditFileUpload);
    }

    // Form Submission
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Edit Form Submission
    if (editVehicleForm) {
        editVehicleForm.addEventListener('submit', handleEditFormSubmit);
    }

    // Edit Modal Close
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBike = document.getElementById('cancelEditBike');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    if (cancelEditBike) {
        cancelEditBike.addEventListener('click', () => {
            editVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Share Modal Close
    const closeShareModal = document.getElementById('closeShareModal');
    const closeShareBtn = document.getElementById('closeShareBtn');
    if (closeShareModal) {
        closeShareModal.addEventListener('click', () => {
            shareVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', () => {
            shareVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addVehicleModal) {
            addVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === editVehicleModal) {
            editVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === shareVehicleModal) {
            shareVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

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
    loadUserBikes();
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

// Edit File Upload Handler
function handleEditFileUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showToast('請上傳圖片檔案！', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('檔案大小不能超過5MB！', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        editFilePreview.innerHTML = `
            <div class="preview-image">
                <img src="${e.target.result}" alt="Vehicle Preview" style="max-width: 100%; max-height: 200px; display: block; margin: 0 auto;">
                <p class="text-center mt-2">${file.name}</p>
            </div>
        `;
        editFilePreview.classList.add('has-preview');
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
    
    // 模擬服務器響應而不是實際發送請求
    setTimeout(() => {
        try {
            // 創建模擬的車輛數據
            const newBike = {
                _id: Date.now().toString(),
                brand: formData.get('brand'),
                model: formData.get('model'),
                year: parseInt(formData.get('year')),
                cc: parseInt(formData.get('cc')) || 0,
                category: formData.get('category'),
                imagePath: 'images/bikes/JET.jpg', // 使用現有的預設圖片
                isMainBike: formData.get('isMainBike') === 'on',
                mileage: 0,
                updatedAt: new Date().toISOString(),
                modifications: []
            };
            
            alert('車輛資料新增成功！');
        
        // Reset form and close modal
        vehicleForm.reset();
        filePreview.innerHTML = '';
        filePreview.classList.remove('has-preview');
        addVehicleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Add new bike to grid
            const bikeCard = addNewBikeToGrid(newBike);
        
        // If this is the main bike, update all other bikes' status
            if (newBike.isMainBike) {
            document.querySelectorAll('.bike-card').forEach(card => {
                    if (card.dataset.id !== newBike._id.toString()) {
                    const mainBadge = card.querySelector('.main-badge');
                    if (mainBadge) mainBadge.remove();
                }
            });
        }
            
            // 只為新添加的卡片設置事件
            attachBikeCardEvents(bikeCard);
            
        } catch (error) {
        console.error('Error:', error);
            alert('新增車輛失敗，請稍後再試');
        } finally {
        // Restore submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        }
    }, 1500); // 模擬網路延遲
}

// Edit Form Submit Handler
function handleEditFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(editVehicleForm);
    
    // Validate form
    const brand = formData.get('brand');
    const model = formData.get('model');
    const year = formData.get('year');
    
    if (!brand || !model || !year) {
        showToast('請填寫必填欄位！', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = editVehicleForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '更新中...';
    
    // 模擬服務器響應
    setTimeout(() => {
        try {
            // 找到要編輯的車輛
            const bikeIndex = userBikes.findIndex(bike => bike._id === editingBikeId);
            if (bikeIndex === -1) {
                throw new Error('找不到要編輯的車輛');
            }
            
            // 更新車輛數據
            const updatedBike = {
                ...userBikes[bikeIndex],
                brand: formData.get('brand'),
                model: formData.get('model'),
                year: parseInt(formData.get('year')),
                cc: parseInt(formData.get('cc')) || 0,
                category: formData.get('category'),
                mileage: parseInt(formData.get('mileage')) || 0,
                isMainBike: formData.get('isMainBike') === 'on',
                updatedAt: new Date().toISOString()
            };
            
            // 如果上傳了新圖片，更新圖片路徑
            if (formData.get('image') && formData.get('image').size > 0) {
                // 在實際應用中，這裡會上傳圖片到服務器
                // 現在使用現有的圖片作為示例
                updatedBike.imagePath = userBikes[bikeIndex].imagePath;
            }
            
            // 更新數組中的車輛數據
            userBikes[bikeIndex] = updatedBike;
            
            // 如果設為主要車輛，更新其他車輛狀態
            if (updatedBike.isMainBike) {
                userBikes.forEach((bike, index) => {
                    if (index !== bikeIndex) {
                        bike.isMainBike = false;
                    }
                });
            }
            
            // 更新車輛卡片
            updateBikeCard(editingBikeId, updatedBike);
            
            showToast('車輛資料更新成功！', 'success');
            
            // Reset form and close modal
            editVehicleForm.reset();
            editFilePreview.innerHTML = '';
            editFilePreview.classList.remove('has-preview');
            editVehicleModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
        } catch (error) {
            console.error('Error:', error);
            showToast('更新車輛失敗，請稍後再試', 'error');
        } finally {
            // Restore submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }, 1500); // 模擬網路延遲
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
    
    // 返回新創建的卡片，由調用方決定是否需要綁定事件
    return bikeCard;
}

// Load garage
async function loadUserBikes() {
    const garageContainer = document.getElementById('garageContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    try {
        loadingIndicator.style.display = 'block';
        
        const response = await api.garage.getBikes();
        userBikes = response.bikes || [];
        
        if (userBikes.length === 0) {
            garageContainer.innerHTML = `
                <div class="no-bikes">
                    <i class="fas fa-motorcycle"></i>
                    <p>您的車庫目前是空的</p>
                    <button onclick="showAddBikeModal()" class="btn-add">
                        <i class="fas fa-plus"></i> 新增車輛
                    </button>
                </div>
            `;
            return;
        }
        
        // 渲染車輛列表
        renderBikesList();
        
    } catch (error) {
        console.error('載入車輛失敗:', error);
        garageContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>載入車輛時發生錯誤</p>
                <button onclick="loadUserBikes()">重試</button>
            </div>
        `;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// 渲染車輛列表
function renderBikesList() {
    const garageContainer = document.getElementById('garageContainer');
    
    garageContainer.innerHTML = `
        <div class="garage-header">
            <h2>我的車庫</h2>
            <button onclick="showAddBikeModal()" class="btn-add">
                <i class="fas fa-plus"></i> 新增車輛
            </button>
        </div>
        <div class="bikes-grid">
            ${userBikes.map(bike => createBikeCard(bike)).join('')}
        </div>
    `;
}

// 創建車輛卡片
function createBikeCard(bike) {
    return `
        <div class="bike-card ${bike.isMainBike ? 'main-bike' : ''}" data-id="${bike._id}">
            <div class="bike-image">
                <img src="${bike.imagePath || '/images/default-bike.svg'}" 
                     alt="${bike.brand} ${bike.model}" 
                     onerror="this.src='/images/default-bike.svg'">
                ${bike.isMainBike ? '<span class="main-badge">主力車</span>' : ''}
            </div>
            <div class="bike-info">
                <h3>${bike.brand} ${bike.model}</h3>
                <div class="bike-meta">
                    <span class="year">${bike.year}</span>
                    ${bike.cc ? `<span class="cc">${bike.cc}cc</span>` : ''}
                    ${bike.category ? `<span class="category">${bike.category}</span>` : ''}
                </div>
                <p class="description">${bike.description || '暫無描述'}</p>
                <div class="bike-stats">
                    <span class="mileage">
                        <i class="fas fa-road"></i> ${formatMileage(bike.mileage)}
                    </span>
                    <span class="modifications">
                        <i class="fas fa-wrench"></i> ${bike.modifications?.length || 0} 改裝
                    </span>
                </div>
            </div>
            <div class="bike-actions">
                <button onclick="editBike('${bike._id}')" class="btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBike('${bike._id}')" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
                ${!bike.isMainBike ? `
                    <button onclick="setMainBike('${bike._id}')" class="btn-set-main">
                        <i class="fas fa-star"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// 新增車輛
async function addBike(formData) {
    try {
        const response = await api.garage.addBike(formData);
        userBikes.push(response.bike);
        renderBikesList();
        return response;
    } catch (error) {
        console.error('新增車輛失敗:', error);
        throw error;
    }
}

// 編輯車輛
async function editBike(bikeId) {
    const bike = userBikes.find(b => b._id === bikeId);
    if (!bike) return;
    
    // 顯示編輯表單
    showEditBikeModal(bike);
}

// 更新車輛
async function updateBike(bikeId, formData) {
    try {
        const response = await api.garage.updateBike(bikeId, formData);
        const index = userBikes.findIndex(b => b._id === bikeId);
        if (index !== -1) {
            userBikes[index] = response.bike;
        }
        renderBikesList();
        return response;
    } catch (error) {
        console.error('更新車輛失敗:', error);
        throw error;
    }
}

// 刪除車輛
async function deleteBike(bikeId) {
    if (!confirm('確定要刪除這輛車嗎？')) return;
    
    try {
        await api.garage.deleteBike(bikeId);
        userBikes = userBikes.filter(b => b._id !== bikeId);
        renderBikesList();
    } catch (error) {
        console.error('刪除車輛失敗:', error);
        alert('刪除車輛失敗，請稍後再試');
    }
}

// 設為主力車
async function setMainBike(bikeId) {
    try {
        await api.request(`/garage/${bikeId}/set-main`, {
            method: 'POST'
        });
        
        userBikes = userBikes.map(bike => ({
            ...bike,
            isMainBike: bike._id === bikeId
        }));
        
        renderBikesList();
    } catch (error) {
        console.error('設定主力車失敗:', error);
        alert('設定主力車失敗，請稍後再試');
    }
}

// 格式化里程數
function formatMileage(mileage) {
    return `${mileage.toLocaleString()} km`;
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
            const bikeId = bikeCard.dataset.id;
            
            // 找到要編輯的車輛數據
            const bike = userBikes.find(b => b._id === bikeId);
            if (!bike) {
                showToast('找不到車輛資料', 'error');
                return;
            }
            
            // 打開編輯模態框
            openEditModal(bike);
        });
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-bike');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bikeCard = btn.closest('.bike-card');
            const bikeId = bikeCard.dataset.id;
            
            // 找到要分享的車輛數據
            const bike = userBikes.find(b => b._id === bikeId);
            if (!bike) {
                showToast('找不到車輛資料', 'error');
                return;
            }
            
            // 打開分享模態框
            openShareModal(bike);
        });
    });
    
    // View details links
    const viewDetailsLinks = document.querySelectorAll('.view-details');
    viewDetailsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const bikeCard = link.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            showToast(`查看車輛詳情: ${bikeName}`, 'info');
            // In a real app, this would navigate to the bike details page
        });
    });
    
    // Add modification buttons
    const addModButtons = document.querySelectorAll('.add-mod-btn');
    addModButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bikeCard = btn.closest('.bike-card');
            const bikeName = bikeCard.querySelector('.bike-title h3').textContent;
            showToast(`為 ${bikeName} 新增改裝項目`, 'info');
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

// 打開編輯模態框
function openEditModal(bike) {
    editingBikeId = bike._id;
    
    // 填入表單數據
    document.getElementById('editBikeId').value = bike._id;
    document.getElementById('editBikeBrand').value = bike.brand;
    document.getElementById('editBikeModel').value = bike.model;
    document.getElementById('editBikeYear').value = bike.year;
    document.getElementById('editBikeCC').value = bike.cc;
    document.getElementById('editBikeMileage').value = bike.mileage || 0;
    document.getElementById('editBikeCategory').value = bike.category;
    document.getElementById('editBikeDescription').value = bike.description || '';
    document.getElementById('editIsMainBike').checked = bike.isMainBike;
    
    // 顯示目前圖片
    const currentImage = document.getElementById('currentBikeImage');
    currentImage.src = bike.imagePath;
    
    // 清空預覽
    editFilePreview.innerHTML = '';
    editFilePreview.classList.remove('has-preview');
    
    // 顯示模態框
    editVehicleModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 打開分享模態框
function openShareModal(bike) {
    // 填入分享預覽數據
    document.getElementById('shareBikeImage').src = bike.imagePath;
    document.getElementById('shareBikeName').textContent = `${bike.brand} ${bike.model}`;
    document.getElementById('shareBikeSpecs').textContent = `${bike.year} 年 · ${bike.cc}cc`;
    document.getElementById('shareModCount').textContent = `改裝零件: ${bike.modifications ? bike.modifications.length : 0} 項`;
    
    // 生成分享連結
    const shareUrl = `${window.location.origin}/garage.html?bike=${bike._id}`;
    document.getElementById('shareLink').value = shareUrl;
    
    // 生成分享文字
    const shareText = `🏍️ 我的愛車 ${bike.brand} ${bike.model}

📅 年份: ${bike.year} 年
⚡ 排量: ${bike.cc}cc
🛠️ 改裝零件: ${bike.modifications ? bike.modifications.length : 0} 項
📍 來自 MotoWeb 摩托車改裝社群

${shareUrl}

#MotoWeb #摩托車改裝 #${bike.brand}`;
    
    document.getElementById('shareText').value = shareText;
    
    // 設置分享按鈕事件
    setupShareButtons(bike, shareUrl, shareText);
    
    // 顯示模態框
    shareVehicleModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 設置分享按鈕功能
function setupShareButtons(bike, shareUrl, shareText) {
    // Facebook 分享
    document.getElementById('shareFacebook').onclick = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
    };
    
    // Twitter 分享
    document.getElementById('shareTwitter').onclick = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };
    
    // Line 分享
    document.getElementById('shareLine').onclick = () => {
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(lineUrl, '_blank', 'width=600,height=400');
    };
    
    // 複製連結
    document.getElementById('copyShareLink').onclick = () => {
        copyToClipboard(shareUrl);
        showToast('連結已複製到剪貼簿！', 'success');
    };
    
    // 複製連結按鈕
    document.getElementById('copyLinkBtn').onclick = () => {
        copyToClipboard(shareUrl);
        showToast('連結已複製到剪貼簿！', 'success');
    };
}

// 複製到剪貼簿
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('複製失敗:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 備用複製方法
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: 複製失敗', err);
    }
    
    document.body.removeChild(textArea);
}

// 更新車輛卡片
function updateBikeCard(bikeId, updatedBike) {
    const bikeCard = document.querySelector(`[data-id="${bikeId}"]`);
    if (!bikeCard) return;
    
    // 更新卡片內容
    const bikeTitle = bikeCard.querySelector('.bike-title h3');
    bikeTitle.textContent = `${updatedBike.brand} ${updatedBike.model}`;
    
    // 更新主要車輛標記
    let mainBadge = bikeCard.querySelector('.main-badge');
    if (updatedBike.isMainBike) {
        if (!mainBadge) {
            mainBadge = document.createElement('span');
            mainBadge.className = 'main-badge';
            mainBadge.textContent = '主要車輛';
            bikeCard.querySelector('.bike-title').appendChild(mainBadge);
        }
    } else {
        if (mainBadge) {
            mainBadge.remove();
        }
    }
    
    // 更新規格數據
    const specValues = bikeCard.querySelectorAll('.spec-value');
    specValues[0].textContent = updatedBike.year;
    specValues[1].textContent = `${updatedBike.cc} cc`;
    specValues[2].textContent = `${updatedBike.mileage || 0} km`;
    specValues[3].textContent = new Date(updatedBike.updatedAt).toLocaleDateString();
    
    // 更新卡片屬性
    bikeCard.setAttribute('data-brand', updatedBike.brand);
    bikeCard.setAttribute('data-category', updatedBike.category);
    
    // 如果這是新的主要車輛，移除其他車輛的主要標記
    if (updatedBike.isMainBike) {
        document.querySelectorAll('.bike-card').forEach(card => {
            if (card !== bikeCard) {
                const badge = card.querySelector('.main-badge');
                if (badge) badge.remove();
            }
        });
        
        // 更新側邊欄主要車輛資訊
        const mainBikeImg = document.querySelector('.main-bike img');
        const mainBikeName = document.querySelector('.main-bike-info h3');
        const mainBikeSpecs = document.querySelector('.main-bike-info p');
        
        if (mainBikeImg) mainBikeImg.src = updatedBike.imagePath;
        if (mainBikeName) mainBikeName.textContent = `${updatedBike.brand} ${updatedBike.model}`;
        if (mainBikeSpecs) mainBikeSpecs.textContent = `${updatedBike.year} 年 · ${updatedBike.cc}cc`;
    }
}

// Toast 通知功能
function showToast(message, type = 'info') {
    // 移除現有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 創建新的toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 顯示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 隱藏toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
} 