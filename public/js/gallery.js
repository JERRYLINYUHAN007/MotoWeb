function renderGalleryItems(items) {
    const galleryContainer = document.getElementById('galleryItems');
    
    // 如果沒有作品
    if (items.length === 0) {
        galleryContainer.innerHTML = '<div class="no-results">目前沒有符合條件的作品</div>';
        return;
    }
    
    // 為每個作品建立卡片
    items.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.id = item.id;
        galleryItem.dataset.category = item.category;
        galleryItem.dataset.style = item.style;
        
        // 格式化日期
        const date = new Date(item.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // 創建作品卡片HTML
        galleryItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-overlay">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-author">
                        <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar">
                        <span>${item.author.name}</span>
                    </div>
                </div>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <span class="item-type">${getCategoryName(item.category)}</span>
                </div>
                <div class="item-author">
                    <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar">
                    <span>${item.author.name} · ${formattedDate}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-stats">
                    <span class="stat-item"><i class="far fa-heart"></i> ${item.stats.likes}</span>
                    <span class="stat-item"><i class="far fa-comment"></i> ${item.stats.comments}</span>
                    <span class="stat-item"><i class="far fa-eye"></i> ${item.stats.views}</span>
                </div>
            </div>
        `;
        
        // 點擊作品打開預覽
        galleryItem.addEventListener('click', function() {
            openImagePreview(item);
        });
        
        galleryContainer.appendChild(galleryItem);
    });
}

/**
 * 根據分類代碼獲取分類名稱
 * @param {string} category - 分類代碼
 * @return {string} 分類名稱
 */
function getCategoryName(category) {
    const categories = {
        'sport': '運動車系',
        'naked': '街車系',
        'cruiser': '巡航車系',
        'adventure': '冒險車系',
        'touring': '旅行車系',
        'custom': '客製化'
    };
    
    return categories[category] || category;
}

/**
 * 根據風格代碼獲取風格名稱
 * @param {string} style - 風格代碼
 * @return {string} 風格名稱
 */
function getStyleName(style) {
    const styles = {
        'racing': '競技風格',
        'street': '街頭風格',
        'cafe': '咖啡風格',
        'touring': '旅行風格',
        'scrambler': '越野風格',
        'bobber': '短尾風格'
    };
    
    return styles[style] || style;
}

/**
 * 初始化篩選功能
 */
function initFilters() {
    const categorySelect = document.getElementById('category');
    const styleSelect = document.getElementById('style');
    const sortSelect = document.getElementById('sort');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const filterTagsContainer = document.getElementById('filterTags');
    
    // 篩選條件變更事件
    const filters = [categorySelect, styleSelect, sortSelect];
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // 清除篩選按鈕
    clearFiltersBtn.addEventListener('click', function() {
        resetFilters();
    });
    
    /**
     * 應用篩選條件
     */
    function applyFilters() {
        // 在實際應用中，應該向API發送請求獲取篩選後的資料
        // 這裡模擬篩選操作
        
        // 顯示載入中狀態
        const galleryContainer = document.getElementById('galleryItems');
        galleryContainer.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <span>篩選中...</span>
            </div>
        `;
        
        // 更新已套用的篩選標籤
        updateFilterTags();
        
        // 模擬載入延遲
        setTimeout(() => {
            // 重新載入作品集
            loadGalleryItems();
        }, 800);
    }
    
    /**
     * 重置所有篩選條件
     */
    function resetFilters() {
        categorySelect.value = 'all';
        styleSelect.value = 'all';
        sortSelect.value = 'latest';
        
        // 清空篩選標籤
        filterTagsContainer.innerHTML = '';
        
        // 重新應用篩選
        applyFilters();
    }
    
    /**
     * 更新已套用的篩選標籤
     */
    function updateFilterTags() {
        // 清空現有標籤
        filterTagsContainer.innerHTML = '';
        
        // 檢查分類篩選
        if (categorySelect.value !== 'all') {
            addFilterTag('分類', getCategoryName(categorySelect.value), function() {
                categorySelect.value = 'all';
                applyFilters();
            });
        }
        
        // 檢查風格篩選
        if (styleSelect.value !== 'all') {
            addFilterTag('風格', getStyleName(styleSelect.value), function() {
                styleSelect.value = 'all';
                applyFilters();
            });
        }
        
        // 檢查排序篩選
        const sortLabels = {
            'latest': '最新上傳',
            'popular': '最受歡迎',
            'views': '最多瀏覽',
            'comments': '最多評論'
        };
        
        if (sortSelect.value !== 'latest') {
            addFilterTag('排序', sortLabels[sortSelect.value], function() {
                sortSelect.value = 'latest';
                applyFilters();
            });
        }
    }
    
    /**
     * 添加篩選標籤
     * @param {string} type - 篩選類型
     * @param {string} value - 篩選值
     * @param {Function} removeCallback - 移除標籤的回調函數
     */
    function addFilterTag(type, value, removeCallback) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${type}: ${value}</span>
            <button class="remove-tag" aria-label="移除篩選">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 綁定移除按鈕事件
        const removeBtn = tag.querySelector('.remove-tag');
        removeBtn.addEventListener('click', removeCallback);
        
        filterTagsContainer.appendChild(tag);
    }
}

/**
 * 初始化檢視切換功能
 */
function initViewToggle() {
    const viewToggles = document.querySelectorAll('.view-toggle');
    const galleryContainer = document.getElementById('galleryItems').parentElement;
    
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // 移除其他按鈕的活動狀態
            viewToggles.forEach(btn => btn.classList.remove('active'));
            // 設置當前按鈕為活動狀態
            this.classList.add('active');
            
            // 獲取檢視類型
            const viewType = this.dataset.view;
            
            // 應用檢視類型
            if (viewType === 'list') {
                galleryContainer.classList.add('list-view');
            } else {
                galleryContainer.classList.remove('list-view');
            }
        });
    });
}

/**
 * 初始化載入更多功能
 */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    loadMoreBtn.addEventListener('click', function() {
        // 顯示載入中狀態
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 載入中...';
        this.disabled = true;
        
        // 模擬載入延遲
        setTimeout(() => {
            // 在實際應用中，這裡應該向API請求更多作品
            // 這裡僅模擬載入更多作品
            
            // 恢復按鈕狀態
            this.innerHTML = '<i class="fas fa-sync"></i> 載入更多作品';
            this.disabled = false;
            
            // 模擬已載入全部作品
            const randomNum = Math.floor(Math.random() * 3);
            if (randomNum === 0) {
                this.innerHTML = '已載入全部作品';
                this.disabled = true;
            }
        }, 1500);
    });
}

/**
 * 初始化作品預覽功能
 */
function initImagePreview() {
    const modal = document.getElementById('imageModal');
    const closeBtn = modal.querySelector('.close-modal');
    
    // 關閉按鈕
    closeBtn.addEventListener('click', function() {
        closeModal(modal);
    });
    
    // 點擊模態框外部關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // ESC鍵關閉
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
    
    // 喜歡按鈕
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        const likesCount = this.querySelector('.likes-count');
        const currentLikes = parseInt(likesCount.textContent);
        
        if (this.classList.contains('active')) {
            likesCount.textContent = currentLikes + 1;
            this.querySelector('i').className = 'fas fa-heart';
        } else {
            likesCount.textContent = currentLikes - 1;
            this.querySelector('i').className = 'far fa-heart';
        }
    });
    
    // 評論按鈕
    const commentBtn = document.getElementById('commentBtn');
    const commentsSection = document.getElementById('commentsSection');
    
    commentBtn.addEventListener('click', function() {
        // 切換評論區域顯示
        commentsSection.classList.toggle('active');
        
        // 滾動到評論區域
        if (commentsSection.classList.contains('active')) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // 提交評論
    const submitCommentBtn = document.getElementById('submitComment');
    const commentInput = document.getElementById('commentInput');
    const commentsList = document.getElementById('commentsList');
    const commentCountElem = document.getElementById('commentCount');
    
    submitCommentBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();
        
        if (commentText === '') {
            return;
        }
        
        // 創建新評論
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        
        // 在實際應用中，應該使用當前登入用戶的資料
        commentItem.innerHTML = `
            <img src="images/avatars/user-default.jpg" alt="您的頭像" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">您</span>
                    <span class="comment-date">剛剛</span>
                </div>
                <p class="comment-text">${commentText}</p>
            </div>
        `;
        
        // 添加評論到列表
        commentsList.prepend(commentItem);
        
        // 清空輸入框
        commentInput.value = '';
        
        // 更新評論數量
        const currentCount = parseInt(commentCountElem.textContent);
        commentCountElem.textContent = currentCount + 1;
        
        // 更新評論按鈕上的計數
        const commentsCount = document.getElementById('commentsCount');
        commentsCount.textContent = parseInt(commentsCount.textContent) + 1;
    });
    
    // 分享按鈕
    const shareBtn = document.getElementById('shareBtn');
    const shareModal = document.getElementById('shareModal');
    const shareCloseBtn = shareModal.querySelector('.close-modal');
    const shareLink = document.getElementById('shareLink');
    const copyLinkBtn = document.getElementById('copyLink');
    
    shareBtn.addEventListener('click', function() {
        // 設置分享連結 (在實際應用中，應該使用當前作品的URL)
        shareLink.value = window.location.origin + '/share-item.html?id=' + currentGalleryItem.id;
        
        // 開啟分享模態框
        openModal(shareModal);
    });
    
    // 關閉分享模態框
    shareCloseBtn.addEventListener('click', function() {
        closeModal(shareModal);
    });
    
    // 點擊分享模態框外部關閉
    shareModal.addEventListener('click', function(e) {
        if (e.target === shareModal) {
            closeModal(shareModal);
        }
    });
    
    // 複製連結
    copyLinkBtn.addEventListener('click', function() {
        shareLink.select();
        document.execCommand('copy');
        
        // 顯示已複製提示
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> 已複製';
        
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });
    
    // 社群分享
    const shareOptions = document.querySelectorAll('.share-option');
    
    shareOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.dataset.platform;
            const url = encodeURIComponent(shareLink.value);
            const title = encodeURIComponent(currentGalleryItem.title);
            
            let shareUrl = '';
            
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'pinterest':
                    const image = encodeURIComponent(currentGalleryItem.image);
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title} ${url}`;
                    break;
                case 'line':
                    shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
                    break;
            }
            
            // 開啟分享視窗
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// 儲存當前預覽的作品
let currentGalleryItem = null;

/**
 * 開啟作品預覽
 * @param {Object} item - 作品資料
 */
function openImagePreview(item) {
    // 儲存當前作品
    currentGalleryItem = item;
    
    // 取得模態框元素
    const modal = document.getElementById('imageModal');
    const previewImage = document.getElementById('previewImage');
    const imageTitle = document.getElementById('imageTitle');
    const authorAvatar = document.getElementById('authorAvatar');
    const authorName = document.getElementById('authorName');
    const postDate = document.getElementById('postDate');
    const imageDescription = document.getElementById('imageDescription');
    const bikeModel = document.getElementById('bikeModel');
    const modType = document.getElementById('modType');
    const imageTags = document.getElementById('imageTags');
    const likesCount = document.getElementById('likesCount');
    const commentsCount = document.getElementById('commentsCount');
    const viewsCount = document.getElementById('viewsCount');
    
    // 更新模態框內容
    previewImage.src = item.image;
    previewImage.alt = item.title;
    imageTitle.textContent = item.title;
    authorAvatar.src = item.author.avatar;
    authorAvatar.alt = item.author.name;
    authorName.textContent = item.author.name;
    
    // 格式化日期
    const date = new Date(item.date);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    postDate.textContent = formattedDate;
    
    imageDescription.textContent = item.description;
    bikeModel.textContent = item.model;
    modType.textContent = getStyleName(item.style);
    
    // 更新標籤
    imageTags.innerHTML = '';
    item.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'image-tag';
        tagElement.textContent = '#' + tag;
        imageTags.appendChild(tagElement);
    });
    
    // 更新統計資料
    likesCount.textContent = item.stats.likes;
    commentsCount.textContent = item.stats.comments;
    viewsCount.textContent = item.stats.views;
    
    // 重置喜歡按鈕狀態
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.classList.remove('active');
    likeBtn.querySelector('i').className = 'far fa-heart';
    
    // 重置評論區域
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.classList.remove('active');
    
    document.getElementById('commentCount').textContent = item.stats.comments;
    document.getElementById('commentsList').innerHTML = '';
    document.getElementById('commentInput').value = '';
    
    // 開啟模態框
    openModal(modal);
}

/**
 * 開啟模態框
 * @param {HTMLElement} modal - 模態框元素
 */
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * 關閉模態框
 * @param {HTMLElement} modal - 模態框元素
 */
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * 初始化上傳功能
 */
function initUploadFeature() {
    const uploadBtns = document.querySelectorAll('.upload-btn, .upload-btn-large');
    const uploadModal = document.getElementById('uploadModal');
    const closeBtn = uploadModal.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelUpload');
    const uploadForm = document.getElementById('uploadForm');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('uploadFiles');
    const uploadPreview = document.getElementById('uploadPreview');
    
    // 開啟上傳模態框
    uploadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(uploadModal);
        });
    });
    
    // 關閉上傳模態框
    closeBtn.addEventListener('click', function() {
        closeModal(uploadModal);
    });
    
    // 點擊上傳模態框外部關閉
    uploadModal.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            closeModal(uploadModal);
        }
    });
    
    // 取消按鈕
    cancelBtn.addEventListener('click', function() {
        closeModal(uploadModal);
    });
    
    // 拖放上傳功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        // 處理拖放的文件
        handleFiles(e.dataTransfer.files);
    });
    
    // 文件選擇
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // 處理選擇的文件
    function handleFiles(files) {
        // 清空預覽
        uploadPreview.innerHTML = '';
        
        // 檢查文件數量
        if (files.length > 5) {
            alert('最多只能上傳5張圖片');
            return;
        }
        
        // 檢查文件類型和大小
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert('請只上傳圖片文件');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('圖片大小不能超過5MB');
                return;
            }
            
            // 創建預覽
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="預覽圖片">
                    <button type="button" class="preview-remove" aria-label="移除圖片">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // 移除圖片按鈕
                const removeBtn = previewItem.querySelector('.preview-remove');
                removeBtn.addEventListener('click', function() {
                    previewItem.remove();
                });
                
                uploadPreview.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // 標籤輸入功能
    const tagInput = document.getElementById('tagInput');
    const tagContainer = document.getElementById('tagContainer');
    const maxTags = 5;
    
    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            e.preventDefault();
            
            // 檢查標籤數量是否已達上限
            const currentTags = tagContainer.querySelectorAll('.tag-item');
            if (currentTags.length >= maxTags) {
                alert('最多只能新增5個標籤');
                return;
            }
            
            const tagText = this.value.trim();
            
            // 確認標籤不重複
            const existingTags = Array.from(currentTags).map(tag => 
                tag.querySelector('span').textContent
            );
            
            if (existingTags.includes(tagText)) {
                alert('此標籤已存在');
                return;
            }
            
            // 創建新標籤
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span>${tagText}</span>
                <button type="button" class="tag-remove" aria-label="移除標籤">&times;</button>
            `;
            
            // 插入標籤到輸入框前面
            tagContainer.insertBefore(tagItem, this);
            
            // 清空輸入框
            this.value = '';
            
            // 綁定標籤刪除事件
            const removeBtn = tagItem.querySelector('.tag-remove');
            removeBtn.addEventListener('click', function() {
                tagContainer.removeChild(tagItem);
            });
        }
    });
    
    // 表單提交
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 簡單表單驗證
        const title = document.getElementById('uploadTitle').value;
        const description = document.getElementById('uploadDescription').value;
        const category = document.getElementById('uploadCategory').value;
        const style = document.getElementById('uploadStyle').value;
        const model = document.getElementById('uploadModel').value;
        const previewItems = uploadPreview.querySelectorAll('.preview-item');
        
        if (!title || !description || !category || !style || !model) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        if (previewItems.length === 0) {
            alert('請至少上傳一張圖片');
            return;
        }
        
        // 在實際應用中，這裡會將表單資料發送到後端
        // 模擬上傳過程
        const submitBtn = document.getElementById('submitUpload');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上傳中...';
        
        setTimeout(() => {
            alert('作品上傳成功！');
            closeModal(uploadModal);
            
            // 重置表單
            uploadForm.reset();
            uploadPreview.innerHTML = '';
            
            // 清除所有標籤
            const tagItems = tagContainer.querySelectorAll('.tag-item');
            tagItems.forEach(item => item.remove());
            
            // 恢復按鈕狀態
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // 重新載入作品集
            loadGalleryItems();
        }, 2000);
    });
}

/**
 * 載入精選作品
 */
function loadFeaturedItems() {
    const featuredSlider = document.getElementById('featuredSlider');
    
    // 在實際應用中，這裡應該從API獲取精選作品
    // 這裡使用已載入的一般作品
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // 創建滑軌
    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    
    // 將一般作品複製到精選輪播
    galleryItems.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        
        // 複製作品卡片
        const galleryItem = item.cloneNode(true);
        slide.appendChild(galleryItem);
        
        sliderTrack.appendChild(slide);
    });
    
    featuredSlider.appendChild(sliderTrack);
}

/**
 * 初始化精選作品輪播
 */
function initFeaturedSlider() {
    // 等待精選作品載入完成
    setTimeout(() => {
        const sliderTrack = document.querySelector('.slider-track');
        const slides = document.querySelectorAll('.slider-slide');
        const prevBtn = document.querySelector('.slider-control.prev');
        const nextBtn = document.querySelector('.slider-control.next');
        
        if (!sliderTrack || slides.length === 0) return;
        
        let currentIndex = 0;
        let slideWidth = slides[0].offsetWidth;
        const slidesPerView = getResponsiveSlidesCount();
        
        // 響應視窗大小變化
        window.addEventListener('resize', function() {
            slideWidth = slides[0].offsetWidth;
            updateSliderPosition();
        });
        
        // 上一張按鈕
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSliderPosition();
                updateButtonState();
            }
        });
        
        // 下一張按鈕
        nextBtn.addEventListener('click', function() {
            if (currentIndex < slides.length - slidesPerView) {
                currentIndex++;
                updateSliderPosition();
                updateButtonState();
            }
        });
        
        // 更新初始按鈕狀態
        updateButtonState();
        
        // 獲取響應式的每屏幻燈片數量
        function getResponsiveSlidesCount() {
            const viewportWidth = window.innerWidth;
            
            if (viewportWidth < 768) {
                return 1;
            } else if (viewportWidth < 992) {
                return 2;
            } else {
                return 3;
            }
        }
        
        // 更新輪播位置
        function updateSliderPosition() {
            sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        // 更新按鈕狀態
        function updateButtonState() {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= slides.length - slidesPerView;
        }
    }, 1000);
}

/**
 * gallery.js - MotoMod作品展示頁面功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initGalleryPage();
});

/**
 * 初始化作品展示頁面
 */
function initGalleryPage() {
    // 載入作品集
    loadGalleryItems();
    
    // 初始化篩選功能
    initFilters();
    
    // 初始化檢視切換功能
    initViewToggle();
    
    // 初始化載入更多功能
    initLoadMore();
    
    // 初始化作品預覽功能
    initImagePreview();
    
    // 初始化上傳功能
    initUploadFeature();
    
    // 初始化精選作品輪播
    initFeaturedSlider();
    
    // 初始化搜尋功能
    initSearchFunction();
}

/**
 * 載入作品集資料
 * 在實際應用中，這裡應該是從後端API獲取資料
 */
function loadGalleryItems() {
    // 顯示載入中指示器
    const galleryContainer = document.getElementById('galleryItems');
    
    // 模擬從API獲取的作品集資料
    const galleryItems = [
        {
            id: 1,
            title: 'Yamaha MT-09 Street Fighter改裝',
            image: 'images/gallery/mt09-mod.jpg',
            author: {
                name: '改裝達人',
                avatar: 'images/avatars/user1.jpg'
            },
            category: 'naked',
            style: 'street',
            model: 'Yamaha MT-09',
            description: '全車改裝，包括Akrapovic排氣管、Öhlins懸吊系統、Rizoma把手和後視鏡。',
            date: '2025-04-10',
            tags: ['排氣管', '懸吊', '外觀', 'Yamaha'],
            stats: {
                likes: 247,
                comments: 42,
                views: 1356
            }
        },
        {
            id: 2,
            title: 'Ducati Monster 821 Café Racer',
            image: 'images/gallery/ducati-mod.jpg',
            author: {
                name: '咖啡騎士',
                avatar: 'images/avatars/user2.jpg'
            },
            category: 'naked',
            style: 'cafe',
            model: 'Ducati Monster 821',
            description: '經典咖啡風格改裝，改裝部件包括裁切後尾、café racer座墊、clip-on把手。',
            date: '2025-04-08',
            tags: ['把手', '座墊', '尾段', 'Ducati'],
            stats: {
                likes: 198,
                comments: 36,
                views: 1085
            }
        },
        {
            id: 3,
            title: 'Honda CBR1000RR 競技版',
            image: 'images/gallery/cbr-mod.jpg',
            author: {
                name: '賽道狂人',
                avatar: 'images/avatars/user3.jpg'
            },
            category: 'sport',
            style: 'racing',
            model: 'Honda CBR1000RR',
            description: '賽道專用改裝，包括全車碳纖維車殼、競技懸吊和電子系統優化。',
            date: '2025-04-05',
            tags: ['碳纖維', '懸吊', '電子系統', 'Honda'],
            stats: {
                likes: 312,
                comments: 58,
                views: 1892
            }
        },
        {
            id: 4,
            title: 'Harley-Davidson Sportster Bobber',
            image: 'images/gallery/harley-mod.jpg',
            author: {
                name: '美式車迷',
                avatar: 'images/avatars/user4.jpg'
            },
            category: 'cruiser',
            style: 'bobber',
            model: 'Harley-Davidson Sportster',
            description: 'Bobber風格改裝，包括短尾、單座椅、高把手和改裝化油器。',
            date: '2025-04-03',
            tags: ['座椅', '把手', '化油器', 'Harley'],
            stats: {
                likes: 274,
                comments: 45,
                views: 1432
            }
        },
        {
            id: 5,
            title: 'BMW R1250GS 長途旅行版',
            image: 'images/gallery/bmw-mod.jpg',
            author: {
                name: '環球騎士',
                avatar: 'images/avatars/user5.jpg'
            },
            category: 'adventure',
            style: 'touring',
            model: 'BMW R1250GS',
            description: '長途旅行改裝，包括加大油箱、側箱系統、加高擋風鏡和座椅加熱系統。',
            date: '2025-04-01',
            tags: ['油箱', '側箱', '擋風鏡', 'BMW'],
            stats: {
                likes: 186,
                comments: 32,
                views: 967
            }
        },
        {
            id: 6,
            title: 'Kawasaki Z900 街頭風格改裝',
            image: 'images/gallery/z900-mod.jpg',
            author: {
                name: '街頭騎士',
                avatar: 'images/avatars/user6.jpg'
            },
            category: 'naked',
            style: 'street',
            model: 'Kawasaki Z900',
            description: '個性化街頭風格改裝，包括LED燈組、短尾、特製塗裝和SC-Project排氣管。',
            date: '2025-03-28',
            tags: ['LED', '尾段', '塗裝', 'Kawasaki'],
            stats: {
                likes: 235,
                comments: 41,
                views: 1254
            }
        }
    ];
    
    // 清空載入指示器
    galleryContainer.innerHTML = '';
    
    // 渲染作品集
    renderGalleryItems(galleryItems);
    
    // 載入精選作品
    loadFeaturedItems();
}

/**
 * 渲染作品集
 * @param {Array} items - 作品集資料陣列
 */
function renderGalleryItems(items) {
    const galleryContainer = document.getElementById('galleryItems');
    
    // 如果沒有作品
    if (items.length === 0) {
        galleryContainer.innerHTML = '<div class="no-results">目前沒有符合條件的作品</div>';
        return;
    }
    
    // 為每個作品建立卡片
    items.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.id = item.id;
        galleryItem.dataset.category = item.category;
        galleryItem.dataset.style = item.style;
        
        // 格式化日期
        const date = new Date(item.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // 創建作品卡片HTML
        galleryItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-overlay">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-author">
                        <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar">
                        <span>${item.author.name}</span>
                    </div>
                </div>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <span class="item-type">${getCategoryName(item.category)}</span>
                </div>
                <div class="item-author">
                    <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar">
                    <span>${item.author.name} · ${formattedDate}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-stats">
                    <span class="stat-item"><i class="far fa-heart"></i> ${item.stats.likes}</span>
                    <span class="stat-item"><i class="far fa-comment"></i> ${item.stats.comments}</span>
                    <span class="stat-item"><i class="far fa-eye"></i> ${item.stats.views}</span>
                </div>
            </div>
        `;
        
        // 點擊作品打開預覽
        galleryItem.addEventListener('click', function() {
            openImagePreview(item);
        });
        
        galleryContainer.appendChild(galleryItem);
    });
}