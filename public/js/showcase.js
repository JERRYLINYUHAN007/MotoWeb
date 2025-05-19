document.addEventListener('DOMContentLoaded', () => {
    // 初始化改裝前後對比滑塊
    initializeComparisonSliders();
    
    // 初始化高級搜尋面板
    initializeAdvancedSearch();
    
    // 初始化展示卡片點擊事件
    initializeShowcaseCards();
    
    // 初始化載入更多功能
    initializeLoadMore();
    
    // 初始化篩選功能
    initializeFilters();
});

// 改裝前後對比滑塊功能
function initializeComparisonSliders() {
    document.querySelectorAll('.comparison-slider').forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('img:last-child');
        let isDragging = false;

        const moveSlider = (e) => {
            if (!isDragging) return;
            
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            handle.style.left = `${percentage}%`;
            afterImage.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        };

        handle.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mousemove', moveSlider);
        window.addEventListener('mouseup', () => isDragging = false);
        
        // 觸控支援
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            handle.style.left = `${percentage}%`;
            afterImage.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        });
        
        window.addEventListener('touchend', () => isDragging = false);
    });
}

// 高級搜尋面板功能
function initializeAdvancedSearch() {
    const advancedSearchBtn = document.querySelector('.advanced-search-btn');
    const advancedSearchPanel = document.querySelector('.advanced-search-panel');
    
    if (advancedSearchBtn && advancedSearchPanel) {
        advancedSearchBtn.addEventListener('click', () => {
            advancedSearchPanel.style.display = 
                advancedSearchPanel.style.display === 'none' ? 'block' : 'none';
            advancedSearchBtn.textContent = 
                advancedSearchPanel.style.display === 'none' ? '高級搜尋' : '收起高級搜尋';
        });
    }
}

// 展示卡片點擊事件
function initializeShowcaseCards() {
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.close-modal');
    
    document.querySelectorAll('.showcase-card').forEach(card => {
        card.addEventListener('click', () => {
            const showcaseId = card.dataset.showcaseId;
            loadShowcaseDetails(showcaseId);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// 載入展示詳細資訊
async function loadShowcaseDetails(showcaseId) {
    try {
        const response = await fetch(`/api/showcase/${showcaseId}`);
        const data = await response.json();
        
        updateModalContent(data);
        initializeGallery(data.images);
    } catch (error) {
        console.error('Error loading showcase details:', error);
    }
}

// 更新模態框內容
function updateModalContent(data) {
    const modalContent = document.querySelector('.modal-content');
    
    // 更新展示詳細資訊
    // 這裡需要根據實際API返回的數據結構進行調整
    modalContent.querySelector('.showcase-title').textContent = data.title;
    modalContent.querySelector('.author-name').textContent = data.author;
    modalContent.querySelector('.project-description').textContent = data.description;
    
    // 更新零件列表
    const partsList = modalContent.querySelector('.parts-list');
    partsList.innerHTML = data.parts.map(part => `
        <div class="part-item">
            <span>${part.name}</span>
            <span>${part.price}</span>
        </div>
    `).join('');
    
    // 更新規格資訊
    const specs = modalContent.querySelector('.specs');
    specs.innerHTML = Object.entries(data.specifications).map(([key, value]) => `
        <div class="spec-item">
            <label>${key}</label>
            <span>${value}</span>
        </div>
    `).join('');
}

// 初始化圖片庫
function initializeGallery(images) {
    const mainImage = document.querySelector('.main-image img');
    const thumbnailStrip = document.querySelector('.thumbnail-strip');
    const prevBtn = document.querySelector('.gallery-nav .prev');
    const nextBtn = document.querySelector('.gallery-nav .next');
    
    let currentImageIndex = 0;
    
    // 更新縮圖列表
    thumbnailStrip.innerHTML = images.map((image, index) => `
        <img src="${image}" alt="Gallery thumbnail ${index + 1}"
             class="${index === 0 ? 'active' : ''}"
             onclick="changeMainImage(${index})">
    `).join('');
    
    // 更新主圖片
    function updateMainImage() {
        mainImage.src = images[currentImageIndex];
        thumbnailStrip.querySelectorAll('img').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // 切換圖片事件
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateMainImage();
    });
    
    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateMainImage();
    });
    
    // 縮圖點擊事件
    window.changeMainImage = (index) => {
        currentImageIndex = index;
        updateMainImage();
    };
}

// 載入更多功能
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let page = 1;
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/showcase?page=${++page}`);
                const data = await response.json();
                
                if (data.showcases.length > 0) {
                    appendShowcases(data.showcases);
                    initializeComparisonSliders();
                    initializeShowcaseCards();
                }
                
                if (data.isLastPage) {
                    loadMoreBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error loading more showcases:', error);
            }
        });
    }
}

// 添加新的展示卡片
function appendShowcases(showcases) {
    const showcaseGrid = document.querySelector('.showcase-grid');
    
    showcases.forEach(showcase => {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.dataset.showcaseId = showcase.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="comparison-slider">
                    <img src="${showcase.beforeImage}" alt="Before modification">
                    <img src="${showcase.afterImage}" alt="After modification">
                    <div class="slider-handle"></div>
                </div>
            </div>
            <div class="card-body">
                <h3>${showcase.title}</h3>
                <div class="card-meta">
                    <span>${showcase.author}</span>
                    <span>${showcase.date}</span>
                </div>
                <p class="card-description">${showcase.description}</p>
                <div class="card-stats">
                    <span>👍 ${showcase.likes}</span>
                    <span>💬 ${showcase.comments}</span>
                    <span>⭐ ${showcase.rating}</span>
                </div>
            </div>
        `;
        
        showcaseGrid.appendChild(card);
    });
}

// 初始化篩選功能
function initializeFilters() {
    const filterForm = document.querySelector('.search-filters form');
    const searchInput = document.querySelector('.search-bar input');
    let filterTimeout;
    
    // 搜尋輸入防抖
    searchInput.addEventListener('input', () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            filterForm.dispatchEvent(new Event('submit'));
        }, 500);
    });
    
    // 篩選表單提交
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const queryParams = new URLSearchParams(formData);
        
        try {
            const response = await fetch(`/api/showcase/filter?${queryParams}`);
            const data = await response.json();
            
            const showcaseGrid = document.querySelector('.showcase-grid');
            showcaseGrid.innerHTML = '';
            
            if (data.showcases.length > 0) {
                appendShowcases(data.showcases);
                initializeComparisonSliders();
                initializeShowcaseCards();
            } else {
                showcaseGrid.innerHTML = '<p class="no-results">沒有找到符合條件的改裝案例</p>';
            }
        } catch (error) {
            console.error('Error filtering showcases:', error);
        }
    });
    
    // 監聽篩選器變更
    document.querySelectorAll('.filter-group select').forEach(select => {
        select.addEventListener('change', () => {
            filterForm.dispatchEvent(new Event('submit'));
        });
    });
}

// 展示案例資料
const showcaseItems = [
    {
        id: 1,
        title: 'SYM DRG 運動改裝',
        image: 'images/bikes/drg.jpg',
        author: {
            name: '小志',
            avatar: 'images/avatars/user1.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM DRG',
        description: '升級LED大燈、運動型排氣管與懸吊，提升操控與外觀。',
        date: '2025-04-10',
        tags: ['LED大燈', '排氣管', '懸吊', 'SYM'],
        stats: {
            likes: 120,
            comments: 8,
            views: 500
        }
    },
    {
        id: 2,
        title: 'SYM MMBCU 日常通勤改裝',
        image: 'images/bikes/mmbcu.jpg',
        author: {
            name: '阿明',
            avatar: 'images/avatars/user2.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM MMBCU',
        description: '換裝LED方向燈與運動型後避震，兼顧安全與舒適。',
        date: '2025-04-09',
        tags: ['方向燈', '避震', 'SYM'],
        stats: {
            likes: 85,
            comments: 5,
            views: 320
        }
    },
    {
        id: 3,
        title: 'SYM SL 街頭風格改裝',
        image: 'images/bikes/sl.jpg',
        author: {
            name: '小美',
            avatar: 'images/avatars/user3.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM SL',
        description: '外觀升級與排氣管改裝，展現個人風格。',
        date: '2025-04-08',
        tags: ['外觀', '排氣管', 'SYM'],
        stats: {
            likes: 60,
            comments: 3,
            views: 210
        }
    },
    {
        id: 4,
        title: 'SYM SR 都會通勤改裝',
        image: 'images/bikes/sr.jpg',
        author: {
            name: '阿宏',
            avatar: 'images/avatars/user4.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM SR',
        description: '加裝LED大燈與避震，提升夜間安全與舒適性。',
        date: '2025-04-07',
        tags: ['LED大燈', '避震', 'SYM'],
        stats: {
            likes: 45,
            comments: 2,
            views: 150
        }
    }
]; 