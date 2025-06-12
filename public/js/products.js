/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
// 產品頁面JavaScript - 從API獲取產品資料
let products = [];
let allProducts = [];
let currentFilters = {};
let isLoading = false;

// DOM elements
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-btn');
const productsGrid = document.querySelector('.products-grid');
const priceRangeInput = document.querySelector('.price-slider');
const minPriceInput = document.querySelector('.min-price');
const maxPriceInput = document.querySelector('.max-price');
const brandCheckboxes = document.querySelectorAll('input[name="brand"]');
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
const bikeTypeCheckboxes = document.querySelectorAll('input[name="bikeType"]');
const applyFiltersBtn = document.querySelector('.apply-filters');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // 初始化過濾器功能
    setupPriceRangeSlider();
    setupSearch();
    setupFilters();
    setupCategoryNavigation();
    
    // 載入所有產品
    loadProducts();
    
    // 載入分類資料
    loadCategories();
});

// 從API載入產品資料
async function loadProducts(filters = {}) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    
    try {
        const params = new URLSearchParams();
        
        // 添加過濾參數
        if (filters.category) params.append('category', filters.category);
        if (filters.mainCategory) params.append('mainCategory', filters.mainCategory);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.bikeType) params.append('bikeType', filters.bikeType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('載入產品失敗');
        }
        
        const result = await response.json();
        
        if (result.success) {
            products = result.data.products;
            if (!filters.page || filters.page === 1) {
                allProducts = [...products];
            }
            
            renderProducts(products);
            updateProductCount(result.data.pagination);
        } else {
            throw new Error(result.error || '載入產品失敗');
        }
        
    } catch (error) {
        console.error('載入產品錯誤:', error);
        showError('載入產品失敗，請稍後再試');
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// 從API載入分類資料
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
            throw new Error('載入分類失敗');
        }
        
        const result = await response.json();
        
        if (result.success) {
            updateCategoryFilters(result.data);
        }
        
    } catch (error) {
        console.error('載入分類錯誤:', error);
    }
}

// 更新分類過濾器
function updateCategoryFilters(categories) {
    // 更新品牌過濾器
    const brandContainer = document.querySelector('input[name="brand"]').closest('.filter-options');
    if (brandContainer && categories.brands) {
        brandContainer.innerHTML = '';
        categories.brands.forEach(brand => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="checkbox" name="brand" value="${brand.id}">
                ${brand.name}
            `;
            brandContainer.appendChild(label);
        });
    }
    
    // 重新綁定事件
    setupFilters();
}

// Render product cards
function renderProducts(productsToRender) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="color: white; margin-bottom: 0.5rem;">沒有找到符合條件的產品</h3>
                <p>請嘗試調整搜尋條件或過濾器</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // 添加產品卡片點擊事件
    addProductCardEvents();
}

// 創建產品卡片
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-product-id', product.id);
    
    // 處理圖片路徑
    const imagePath = product.image || '/images/parts/placeholder-product.png';
    
    // 生成星級評分
    const starRating = generateStarRating(product.rating);
    
    // 處理價格顯示
    const priceHTML = product.originalPrice 
        ? `<span class="original-price">NT$ ${product.originalPrice.toLocaleString()}</span>
           <span class="sale-price">NT$ ${product.price.toLocaleString()}</span>`
        : `<span class="current-price">NT$ ${product.price.toLocaleString()}</span>`;
    
    // 產品標籤
    const badges = [];
    if (product.isHot) badges.push('<span class="product-badge hot">熱門</span>');
    if (product.isNew) badges.push('<span class="product-badge new">新品</span>');
    if (product.originalPrice) badges.push('<span class="product-badge sale">特價</span>');
    
    productCard.innerHTML = `
        <div class="product-image">
            ${badges.join('')}
            <img src="${imagePath}" alt="${product.name}" loading="lazy" onerror="this.src='/images/parts/placeholder-product.png'">
            <div class="product-actions">
                <button class="action-btn" aria-label="加入最愛" data-action="favorite">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn" aria-label="加入購物車" data-action="cart">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="action-btn" aria-label="查看詳情" data-action="view">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${starRating}
                <span class="review-count">(${product.reviews})</span>
            </div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">${priceHTML}</div>
            <div class="product-actions">
                <button class="btn btn-primary" data-action="detail">查看詳情</button>
                <button class="btn btn-outline" data-action="cart">
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    return productCard;
}

// 添加產品卡片事件
function addProductCardEvents() {
    document.querySelectorAll('.product-card').forEach(card => {
        // 主要點擊事件
        card.addEventListener('click', function(e) {
            // 排除按鈕點擊
            if (e.target.closest('.action-btn, .btn')) return;
            
            const productId = this.getAttribute('data-product-id');
            viewProductDetail(productId);
        });
        
        // 按鈕事件
        card.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.getAttribute('data-action');
                const productId = card.getAttribute('data-product-id');
                const product = products.find(p => p.id === productId);
                
                handleProductAction(action, product);
            });
        });
    });
}

// 處理產品動作
function handleProductAction(action, product) {
    switch (action) {
        case 'favorite':
            toggleFavorite(product);
            break;
        case 'cart':
            addToCart(product);
            break;
        case 'view':
        case 'detail':
            viewProductDetail(product.id);
            break;
    }
}

// 查看產品詳情
function viewProductDetail(productId) {
    // 導航到產品詳情頁
    window.location.href = `product-detail.html?id=${productId}`;
}

// 切換最愛
function toggleFavorite(product) {
    console.log('切換最愛:', product.name);
    showNotification(`${product.name} 已加入最愛`, 'success');
}

// 加入購物車
function addToCart(product) {
    console.log('加入購物車:', product.name);
    showNotification(`${product.name} 已加入購物車`, 'success');
}

// Get category name (中文化)
function getCategoryName(categoryKey) {
    const categories = {
        'engine': '動力系統',
        'exhaust': '排氣系統',
        'suspension': '避震系統',
        'brakes': '煞車系統',
        'appearance': '外觀改裝',
        'electronics': '電子系統'
    };
    return categories[categoryKey] || categoryKey;
}

// Generate star rating
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Setup price range slider
function setupPriceRangeSlider() {
    if (priceRangeInput && minPriceInput && maxPriceInput) {
        // 設定價格範圍
        priceRangeInput.min = 0;
        priceRangeInput.max = 50000;
        priceRangeInput.value = 50000;
        
        minPriceInput.value = 0;
        maxPriceInput.value = 50000;
        
        priceRangeInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            maxPriceInput.value = value;
            minPriceInput.value = Math.floor(value * 0.1); // 最小值為最大值的10%
        });
        
        [minPriceInput, maxPriceInput].forEach(input => {
            input.addEventListener('change', function() {
                const min = parseInt(minPriceInput.value) || 0;
                const max = parseInt(maxPriceInput.value) || 50000;
                
                if (min > max) {
                    minPriceInput.value = max;
                    maxPriceInput.value = min;
                }
                
                priceRangeInput.value = Math.max(parseInt(maxPriceInput.value), parseInt(minPriceInput.value));
            });
        });
    }
}

// Setup search functionality
function setupSearch() {
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 搜尋建議功能
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2) {
                    loadSearchSuggestions(this.value);
                }
            }, 300);
        });
    }
}

// 載入搜尋建議
async function loadSearchSuggestions(query) {
    try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            showSearchSuggestions(result.data);
        }
    } catch (error) {
        console.error('載入搜尋建議失敗:', error);
    }
}

// 顯示搜尋建議
function showSearchSuggestions(suggestions) {
    // 實作搜尋建議下拉選單
    console.log('搜尋建議:', suggestions);
}

function performSearch() {
    const searchTerm = searchInput?.value.trim();
    currentFilters.search = searchTerm;
    loadProducts(currentFilters);
}

// Setup filter functionality
function setupFilters() {
    // 品牌過濾器
    document.querySelectorAll('input[name="brand"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
    
    // 分類過濾器
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
    
    // 車系過濾器
    document.querySelectorAll('input[name="bikeType"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
    
    // 應用過濾器按鈕
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
}

// 更新過濾器
function updateFilters() {
    // 收集選中的品牌
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
        .map(cb => cb.value);
    
    // 收集選中的分類
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);
    
    // 收集車系
    const selectedBikeTypes = Array.from(document.querySelectorAll('input[name="bikeType"]:checked'))
        .map(cb => cb.value);
    
    // 收集價格範圍
    const minPrice = parseInt(minPriceInput?.value) || 0;
    const maxPrice = parseInt(maxPriceInput?.value) || 50000;
    
    // 更新當前過濾器
    currentFilters = {
        ...currentFilters,
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        bikeType: selectedBikeTypes.length > 0 ? selectedBikeTypes.join(',') : undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 50000 ? maxPrice : undefined
    };
}

// Apply all filters
function applyFilters() {
    updateFilters();
    loadProducts(currentFilters);
}

// Setup category navigation
function setupCategoryNavigation() {
    const categoryLinks = document.querySelectorAll('.categories-nav a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            categoryLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            currentFilters = {
                mainCategory: category === 'all' ? undefined : category
            };
            
            loadProducts(currentFilters);
        });
    });
}

// 更新產品數量顯示
function updateProductCount(pagination) {
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount && pagination) {
        resultsCount.innerHTML = `顯示 <span>${pagination.count}</span> 項產品`;
    }
}

// 顯示載入中
function showLoading() {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
                <p style="color: var(--metallic-silver); margin-top: 1rem;">載入產品中...</p>
            </div>
        `;
    }
}

// 隱藏載入中
function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

// 顯示錯誤訊息
function showError(message) {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 0.5rem;">載入失敗</h3>
                <p style="color: var(--metallic-silver);">${message}</p>
                <button class="btn btn-primary" onclick="loadProducts()" style="margin-top: 1rem;">重新載入</button>
            </div>
        `;
    }
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
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
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s ease;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // 觸發動畫
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // 自動移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Reset all filters
function resetFilters() {
    // Clear search
    if (searchInput) searchInput.value = '';
    
    // Reset price range
    if (priceRangeInput && minPriceInput && maxPriceInput) {
        priceRangeInput.value = priceRangeInput.max;
        minPriceInput.value = 0;
        maxPriceInput.value = 50000;
    }
    
    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset filters and reload
    currentFilters = {};
    loadProducts();
}

// Sort products
function sortProducts(sortBy) {
    currentFilters.sort = sortBy;
    loadProducts(currentFilters);
}