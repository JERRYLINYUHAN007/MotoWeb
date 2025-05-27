// 產品 API 處理和搜尋功能
class ProductsAPI {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.currentFilters = {};
        this.searchTimeout = null;
        this.init();
    }

    init() {
        console.log('ProductsAPI 初始化開始');
        this.setupEventListeners();
        this.loadProducts();
        console.log('ProductsAPI 初始化完成');
    }

    setupEventListeners() {
        // 搜尋功能
        const searchInput = document.querySelector('.search-bar input');
        const searchButton = document.querySelector('.search-bar button');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 500); // 延遲500ms搜尋
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                const searchTerm = searchInput.value;
                this.handleSearch(searchTerm);
            });
        }

        // 分類篩選
        document.querySelectorAll('[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.handleCategoryFilter(category);
            });
        });

        // 排序功能
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // 側邊欄摺疊功能
        document.querySelectorAll('[data-toggle]').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const targetId = e.currentTarget.getAttribute('data-toggle');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.classList.toggle('open');
                    e.currentTarget.classList.toggle('open');
                }
            });
        });
    }

    async loadProducts(filters = {}) {
        try {
            console.log('開始載入產品，篩選條件:', filters);
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage,
                ...filters
            });

            console.log('API請求URL:', `/api/products?${params}`);
            const response = await fetch(`/api/products?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API回應數據:', data);
            
            this.displayProducts(data.products);
            this.updatePagination(data);
            this.updateProductCount(data);
            
        } catch (error) {
            console.error('載入產品失敗:', error);
            this.showError('載入產品失敗，請稍後再試');
        } finally {
            this.hideLoading();
        }
    }

    displayProducts(products) {
        const productGrid = document.getElementById('product-grid');
        
        if (!productGrid) {
            console.error('找不到產品網格元素');
            return;
        }

        console.log('顯示產品數量:', products.length);
        productGrid.innerHTML = '';
        
        if (products.length === 0) {
            console.log('沒有產品可顯示');
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>沒有找到符合條件的商品</h3>
                    <p>請嘗試調整搜尋條件或瀏覽其他分類</p>
                </div>
            `;
            return;
        }

        products.forEach((product, index) => {
            console.log(`創建產品卡片 ${index + 1}:`, product.name);
            const card = this.createProductCard(product);
            productGrid.appendChild(card);
        });
        console.log('所有產品卡片已添加到網格');
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        
        // 處理圖片路徑
        let productImage = product.image;
        if (!productImage || productImage.includes('placeholder')) {
            productImage = this.getDefaultImage(product.mainCategory);
        }

        // 處理價格顯示
        let priceDisplay = `NT$${product.price.toLocaleString()}`;
        if (product.priceRange) {
            priceDisplay = product.priceRange;
        }

        card.innerHTML = `
            <div class="product-card-link" data-product-id="${product.productId}">
                <div class="product-image-container">
                    <img src="${productImage}" alt="${product.name}" class="product-image" 
                         onerror="this.src='images/parts/placeholder-product.png'">
                    ${product.stock <= 5 ? '<div class="stock-badge low-stock">庫存不足</div>' : ''}
                    ${!product.isActive ? '<div class="stock-badge out-of-stock">暫停販售</div>' : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-brand">品牌: ${product.brand || 'N/A'}</p>
                    <div class="product-tags">
                        ${product.tags ? product.tags.slice(0, 3).map(tag => 
                            `<span class="tag">${tag}</span>`
                        ).join('') : ''}
                    </div>
                    <p class="product-price">${priceDisplay}</p>
                    ${product.stock ? `<p class="product-stock">庫存: ${product.stock}</p>` : ''}
                </div>
            </div>
        `;

        // 添加點擊事件
        card.addEventListener('click', () => {
            this.showProductDetail(product);
        });

        return card;
    }

    getDefaultImage(mainCategory) {
        const categoryImageMap = {
            'sym-jet': 'images/bikes/JET.jpg',
            'sym-drg': 'images/bikes/DRG.jpg',
            'sym-mmbcu': 'images/bikes/MMBCU.jpg',
            'yamaha-cygnus': 'images/bikes/CYGNUS GRYPHUS.jpg',
            'yamaha-force-smax': 'images/bikes/FORCE.jpg',
            'yamaha-force2': 'images/bikes/FORCE.jpg',
            'kymco-krv': 'images/bikes/KRV.jpg'
        };
        
        return categoryImageMap[mainCategory] || 'images/parts/placeholder-product.png';
    }

    updatePagination(data) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        if (data.totalPages <= 1) return;

        // 上一頁按鈕
        if (this.currentPage > 1) {
            const prevButton = this.createPaginationButton('上一頁', this.currentPage - 1);
            paginationContainer.appendChild(prevButton);
        }

        // 頁碼按鈕
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(data.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = this.createPaginationButton(i, i, i === this.currentPage);
            paginationContainer.appendChild(pageButton);
        }

        // 下一頁按鈕
        if (this.currentPage < data.totalPages) {
            const nextButton = this.createPaginationButton('下一頁', this.currentPage + 1);
            paginationContainer.appendChild(nextButton);
        }
    }

    createPaginationButton(text, page, isActive = false) {
        const button = document.createElement('a');
        button.href = '#';
        button.textContent = text;
        
        if (isActive) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentPage = page;
            this.loadProducts(this.currentFilters);
            this.scrollToTop();
        });
        
        return button;
    }

    updateProductCount(data) {
        const countElement = document.getElementById('product-count');
        if (!countElement) return;

        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, data.total);
        
        countElement.textContent = `顯示 ${start}-${end} 件商品，共 ${data.total} 件`;
    }

    handleSearch(searchTerm) {
        this.currentPage = 1;
        this.currentFilters = { ...this.currentFilters, search: searchTerm };
        
        if (!searchTerm.trim()) {
            delete this.currentFilters.search;
        }
        
        this.loadProducts(this.currentFilters);
        this.updateURL();
    }

    handleCategoryFilter(category) {
        this.currentPage = 1;
        this.currentFilters = { category };
        this.loadProducts(this.currentFilters);
        this.updateURL();
        
        // 更新活動狀態
        document.querySelectorAll('[data-category]').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
    }

    handleSort(sortBy) {
        this.currentFilters = { ...this.currentFilters, sort: sortBy };
        this.loadProducts(this.currentFilters);
    }

    showProductDetail(product) {
        // 創建產品詳情模態框
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-detail-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='images/parts/placeholder-product.png'">
                    </div>
                    <div class="product-detail-info">
                        <p><strong>品牌:</strong> ${product.brand}</p>
                        <p><strong>分類:</strong> ${product.category}</p>
                        <p><strong>價格:</strong> ${product.priceRange || `NT$${product.price.toLocaleString()}`}</p>
                        <p><strong>庫存:</strong> ${product.stock}</p>
                        <p><strong>描述:</strong> ${product.description}</p>
                        <div class="product-tags">
                            ${product.tags ? product.tags.map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 關閉模態框事件
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showLoading() {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>載入中...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading 會被 displayProducts 覆蓋
    }

    showError(message) {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>載入失敗</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">重新載入</button>
                </div>
            `;
        }
    }

    updateURL() {
        const params = new URLSearchParams(this.currentFilters);
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    scrollToTop() {
        const displayArea = document.querySelector('.products-display-area');
        if (displayArea) {
            window.scrollTo(0, displayArea.offsetTop - 80);
        }
    }
}

// 產品 API 類別定義完成，由頁面負責初始化

// 添加樣式
const style = document.createElement('style');
style.textContent = `
    .loading, .error, .no-products {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-color-light);
    }

    .loading i, .error i, .no-products i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--primary-color);
    }

    .error button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .stock-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
        color: white;
    }

    .low-stock {
        background-color: #ff9800;
    }

    .out-of-stock {
        background-color: #f44336;
    }

    .product-tags {
        margin: 0.5rem 0;
    }

    .tag {
        display: inline-block;
        background-color: #e0e0e0;
        color: #666;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-size: 0.75rem;
        margin-right: 0.25rem;
        margin-bottom: 0.25rem;
    }

    .product-stock {
        font-size: 0.85rem;
        color: var(--text-color-light);
        margin-top: 0.5rem;
    }

    .product-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        border-radius: 8px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .modal-body {
        padding: 1rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .product-detail-image img {
        width: 100%;
        height: auto;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        .modal-body {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style); 