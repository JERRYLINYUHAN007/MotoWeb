// 產品資料 - 實際應用中這可能來自API或後端
const products = [
    {
        id: 1,
        name: "Yoshimura R11 排氣管",
        category: "exhaust",
        brand: "yoshimura",
        price: 28000,
        bikeType: ["sport", "naked"],
        rating: 4.8,
        reviews: 124,
        image: "images/products/yoshimura-exhaust.jpg",
        description: "高性能賽車級鈦合金排氣管，提升馬力並減輕重量"
    },
    {
        id: 2,
        name: "Akrapovic 鈦合金全段排氣系統",
        category: "exhaust",
        brand: "akrapovic",
        price: 45000,
        bikeType: ["sport", "naked", "adventure"],
        rating: 4.9,
        reviews: 98,
        image: "images/products/akrapovic-exhaust.jpg",
        description: "頂級鈦合金全段排氣系統，提供卓越性能和獨特聲浪"
    },
    {
        id: 3,
        name: "Öhlins TTX GP 後避震",
        category: "suspension",
        brand: "ohlins",
        price: 65000,
        bikeType: ["sport"],
        rating: 4.7,
        reviews: 76,
        image: "images/products/ohlins-shock.jpg",
        description: "專業賽事等級後避震器，提供最佳操控性和穩定性"
    },
    {
        id: 4,
        name: "Brembo M50 卡鉗套件",
        category: "brakes",
        brand: "brembo",
        price: 38000,
        bikeType: ["sport", "naked"],
        rating: 4.8,
        reviews: 112,
        image: "images/products/brembo-caliper.jpg",
        description: "頂級單體鑄造卡鉗，提供卓越制動力與手感"
    },
    {
        id: 5,
        name: "K&N 高流量空氣濾清器",
        category: "engine",
        brand: "other",
        price: 3500,
        bikeType: ["sport", "naked", "cruiser", "adventure"],
        rating: 4.5,
        reviews: 203,
        image: "images/products/kn-filter.jpg",
        description: "提升進氣效率，增加引擎響應性和馬力輸出"
    },
    {
        id: 6,
        name: "SC Project CRT 碳纖維排氣管",
        category: "exhaust",
        brand: "other",
        price: 32000,
        bikeType: ["sport", "naked"],
        rating: 4.6,
        reviews: 87,
        image: "images/products/sc-project-exhaust.jpg",
        description: "輕量化碳纖維設計，提供激越聲浪和性能提升"
    },
    {
        id: 7,
        name: "Öhlins NIX 30 前叉套件",
        category: "suspension",
        brand: "ohlins",
        price: 58000,
        bikeType: ["sport", "naked"],
        rating: 4.7,
        reviews: 65,
        image: "images/products/ohlins-fork.jpg",
        description: "賽道級前叉套件，提供精準操控和優異的回饋感"
    },
    {
        id: 8,
        name: "Power Commander V",
        category: "engine",
        brand: "other",
        price: 15000,
        bikeType: ["sport", "naked", "cruiser", "adventure"],
        rating: 4.6,
        reviews: 175,
        image: "images/products/power-commander.jpg",
        description: "精準燃油控制模組，可自訂引擎動力輸出曲線"
    }
];

// DOM 元素
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-btn');
const productsGrid = document.querySelector('.products-grid');
const priceRangeInput = document.querySelector('.range-slider input');
const priceRangeValue = document.querySelector('.range-value');
const brandCheckboxes = document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]');
const bikeTypeCheckboxes = document.querySelectorAll('.filter-group:nth-child(3) input[type="checkbox"]');

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    // 渲染所有產品
    renderProducts(products);
    
    // 設置價格滑桿事件
    setupPriceRangeSlider();
    
    // 設置搜尋事件
    setupSearch();
    
    // 設置篩選器事件
    setupFilters();
    
    // 設置分類導航事件
    setupCategoryNavigation();
});

// 渲染產品卡片
function renderProducts(productsToRender) {
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<div class="no-results"><h3>沒有符合條件的產品</h3><p>請嘗試調整搜尋條件</p></div>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.category);
        
        // 假設性產品圖片路徑，實際應用中應替換為真實路徑
        const imagePlaceholder = product.image || 'images/product-placeholder.jpg';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imagePlaceholder}" alt="${product.name}" loading="lazy">
                <div class="product-actions">
                    <button class="action-btn" aria-label="加入收藏"><i class="far fa-heart"></i></button>
                    <button class="action-btn" aria-label="加入購物車"><i class="fas fa-shopping-cart"></i></button>
                    <button class="action-btn" aria-label="查看詳情"><i class="fas fa-eye"></i></button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span class="review-count">(${product.reviews})</span>
                </div>
                <div class="product-price">NT$ ${product.price.toLocaleString()}</div>
                <button class="btn btn-primary product-btn">查看詳情</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // 添加點擊事件到產品卡片
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 排除點擊按鈕的情況
            if (!e.target.closest('.action-btn') && !e.target.closest('.product-btn')) {
                // 在這裡可以導向到產品詳情頁面
                const productName = this.querySelector('.product-name').textContent;
                console.log(`查看產品: ${productName}`);
                // 實際應用中應該導向到對應的產品詳情頁面
                // window.location.href = `product-details.html?id=${this.dataset.id}`;
            }
        });
    });
}

// 獲取分類名稱
function getCategoryName(categoryKey) {
    const categories = {
        'engine': '引擎系統',
        'exhaust': '排氣系統',
        'suspension': '懸吊系統',
        'brakes': '煞車系統'
    };
    return categories[categoryKey] || categoryKey;
}

// 生成星級評分
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // 添加實心星星
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // 添加半顆星星
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // 添加空心星星
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// 設置價格範圍滑桿
function setupPriceRangeSlider() {
    // 更新價格顯示
    priceRangeInput.addEventListener('input', function() {
        priceRangeValue.textContent = `NT$ ${parseInt(this.value).toLocaleString()}`;
    });
    
    // 價格篩選
    priceRangeInput.addEventListener('change', function() {
        applyFilters();
    });
}

// 設置搜尋功能
function setupSearch() {
    // 點擊搜尋按鈕
    searchButton.addEventListener('click', () => {
        applyFilters();
    });
    
    // 按下 Enter 鍵進行搜尋
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

// 設置篩選器
function setupFilters() {
    // 品牌篩選
    brandCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // 車型篩選
    bikeTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// 應用所有篩選條件
function applyFilters() {
    // 獲取搜尋關鍵字
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // 獲取價格範圍
    const maxPrice = parseInt(priceRangeInput.value);
    
    // 獲取選取的品牌
    const selectedBrands = Array.from(brandCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    // 獲取選取的車型
    const selectedBikeTypes = Array.from(bikeTypeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    // 篩選產品
    const filteredProducts = products.filter(product => {
        // 搜尋關鍵字篩選
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm);
        
        // 價格篩選
        const matchesPrice = product.price <= maxPrice;
        
        // 品牌篩選
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        
        // 車型篩選
        const matchesBikeType = selectedBikeTypes.length === 0 || 
            selectedBikeTypes.some(type => product.bikeType.includes(type));
        
        return matchesSearch && matchesPrice && matchesBrand && matchesBikeType;
    });
    
    // 渲染篩選後的產品
    renderProducts(filteredProducts);
}

// 設置分類導航
function setupCategoryNavigation() {
    const categoryLinks = document.querySelectorAll('.category-card');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 獲取分類ID
            const categoryId = this.getAttribute('href').substring(1);
            
            // 重設所有篩選條件
            resetFilters();
            
            // 根據分類篩選產品
            const filteredProducts = products.filter(product => product.category === categoryId);
            
            // 渲染篩選後的產品
            renderProducts(filteredProducts);
            
            // 滾動到產品列表
            document.querySelector('.products-list').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// 重設所有篩選條件
function resetFilters() {
    // 清空搜尋欄
    searchInput.value = '';
    
    // 重設價格範圍
    priceRangeInput.value = priceRangeInput.max;
    priceRangeValue.textContent = `NT$ ${parseInt(priceRangeInput.value).toLocaleString()}`;
    
    // 取消選取所有品牌
    brandCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 取消選取所有車型
    bikeTypeCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// 可選功能：處理排序功能
function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'popularity':
            sortedProducts.sort((a, b) => b.reviews - a.reviews);
            break;
        default:
            // 默認不做任何排序
            break;
    }
    
    return sortedProducts;
}