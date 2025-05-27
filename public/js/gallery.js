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
        galleryItem.dataset.id = item._id;
        galleryItem.dataset.category = item.category;
        galleryItem.dataset.style = item.style;
        
        // 格式化日期
        const dateField = item.createdAt || item.date || new Date().toISOString();
        const date = new Date(dateField);
        const formattedDate = formatDate(dateField);
        
        // 處理預設圖片
        const defaultImage = '/images/default-bike.svg';
        const imageUrl = item.image || defaultImage;
        
        // 創建作品卡片HTML
        galleryItem.innerHTML = `
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.title}" onerror="this.src='${defaultImage}'">
                <div class="item-overlay">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-author">
                        <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar" onerror="this.src='/images/default-avatar.svg'">
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
                    <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar" onerror="this.src='/images/default-avatar.svg'">
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
        'scooter': '速克達車系',
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
        'custom': '客製化',
        'japanese': '日系風格',
        'adventure': '冒險風格',
        'retro': '復古風格',
        'maintenance': '保養升級',
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
    const galleryMain = document.querySelector('.gallery-main');
    const galleryContent = document.querySelector('.gallery-content');
    
    if (!viewToggles.length) {
        console.log('找不到檢視切換按鈕');
        return;
    }
    
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            console.log('檢視切換點擊:', this.dataset.view);
            
            // 移除其他按鈕的活動狀態
            viewToggles.forEach(btn => btn.classList.remove('active'));
            // 設置當前按鈕為活動狀態
            this.classList.add('active');
            
            // 獲取檢視類型
            const viewType = this.dataset.view;
            
            // 應用檢視類型到多個容器
            const containers = [galleryMain, galleryContent, document.body];
            
            containers.forEach(container => {
                if (container) {
                    if (viewType === 'list') {
                        container.classList.add('list-view');
                    } else {
                        container.classList.remove('list-view');
                    }
                }
            });
            
            console.log('檢視模式已切換到:', viewType);
        });
    });
}

/**
 * 初始化載入更多功能
 */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMore');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // 顯示載入中狀態
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 載入中...';
            this.disabled = true;
            
            // 模擬載入延遲
            setTimeout(() => {
                // 在實際應用中，這裡應該向API請求更多作品
                // 這裡僅模擬載入更多作品
                
                // 恢復按鈕狀態
                this.innerHTML = '載入更多';
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
}

/**
 * 初始化作品預覽功能
 */
function initImagePreview() {
    const previewModal = document.getElementById('imagePreview');
    if (!previewModal) return;

    // 點擊模態框背景關閉
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal(previewModal);
        }
    });

    // 點擊關閉按鈕關閉
    const closeButton = previewModal.querySelector('.close-preview');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeModal(previewModal);
        });
    }

    // 按ESC鍵關閉
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && previewModal.classList.contains('active')) {
            closeModal(previewModal);
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
    const modal = document.getElementById('imagePreview');
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
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

/**
 * 關閉模態框
 * @param {HTMLElement} modal - 模態框元素
 */
function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // 移除預覽內容
    const previewContent = modal.querySelector('.preview-content');
    if (previewContent) {
        previewContent.innerHTML = '';
    }
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
        
        // 檢查用戶是否已登入
        const token = localStorage.getItem('token');
        if (!token) {
            alert('請先登入後再上傳作品');
            return;
        }
        
        // 獲取所有標籤
        const tagItems = tagContainer.querySelectorAll('.tag-item span');
        const tags = Array.from(tagItems).map(item => item.textContent);
        
        // 建立 FormData 物件
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('style', style);
        formData.append('model', model);
        formData.append('tags', JSON.stringify(tags));
        
        // 添加圖片檔案
        const files = fileInput.files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        // 上傳狀態管理
        const submitBtn = document.getElementById('submitUpload');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上傳中...';
        
        // 向後端 API 發送請求
        fetch('/api/gallery', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || '上傳失敗');
                });
            }
            return response.json();
        })
        .then(data => {
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
        })
        .catch(error => {
            console.error('上傳失敗:', error);
            alert(error.message || '上傳失敗，請稍後再試');
            
            // 恢復按鈕狀態
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
}

/**
 * 載入精選作品
 */
async function loadFeaturedItems() {
    const featuredSlider = document.getElementById('featuredSlider');
    
    try {
        const featuredItems = await api.gallery.getFeatured();
        
        // 如果沒有精選作品，顯示預設內容
        if (!featuredItems || !Array.isArray(featuredItems) || featuredItems.length === 0) {
            featuredSlider.innerHTML = '<div class="no-featured">目前沒有精選作品</div>';
            return;
        }
        
        // 創建滑軌
        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';
        
        // 添加作品卡片
        featuredItems.forEach(item => {
            const card = createFeaturedCard(item);
            sliderTrack.appendChild(card);
        });
        
        // 清空並添加新內容
        featuredSlider.innerHTML = '';
        featuredSlider.appendChild(sliderTrack);
        
        // 初始化滑動功能
        initializeSlider();
    } catch (error) {
        console.error('載入精選作品失敗:', error);
        featuredSlider.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>載入精選作品時發生錯誤</p>
                <button onclick="loadFeaturedItems()">重試</button>
            </div>
        `;
    }
}

// 創建精選作品卡片
function createFeaturedCard(item) {
    const card = document.createElement('div');
    card.className = 'featured-card';
    
    // 使用預設圖片作為備用
    const imageUrl = item.image || '/images/default-bike.svg';
    
    card.innerHTML = `
        <div class="featured-image">
            <img src="${imageUrl}" alt="${item.title}" onerror="this.src='/images/default-bike.svg'">
        </div>
        <div class="featured-info">
            <h3>${item.title}</h3>
            <p>${item.description || '暫無描述'}</p>
            <div class="featured-meta">
                <span class="category">${item.category || '未分類'}</span>
                <span class="date">${formatDate(item.createdAt)}</span>
            </div>
            <div class="featured-stats">
                <span><i class="fas fa-heart"></i> ${item.stats?.likes || 0}</span>
                <span><i class="fas fa-comment"></i> ${item.stats?.comments || 0}</span>
                <span><i class="fas fa-eye"></i> ${item.stats?.views || 0}</span>
            </div>
        </div>
    `;
    
    // 添加點擊事件
    card.addEventListener('click', () => {
        window.location.href = `/gallery/${item._id}`;
    });
    
    return card;
}

// 初始化滑動功能
function initializeSlider() {
    const track = document.querySelector('.slider-track');
    const cards = track.getElementsByClassName('featured-card');
    
    if (cards.length <= 1) return;
    
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth;
    
    // 自動輪播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }, 5000);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 24小時內顯示相對時間
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours < 1) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} 分鐘前`;
        }
        return `${hours} 小時前`;
    }
    
    // 超過24小時顯示具體日期
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
    
    // 添加側邊欄初始化
    initSidebar();
}

/**
 * 載入作品集資料
 * 在實際應用中，這裡應該是從後端API獲取資料
 */
function loadGalleryItems() {
    // 顯示載入中指示器
    const galleryContainer = document.getElementById('galleryItems');
    galleryContainer.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <span>載入作品中...</span>
        </div>
    `;
    
    // 獲取當前篩選條件（從側邊欄的active鏈接）
    const activeCategoryLink = document.querySelector('[data-category].active');
    const activeStyleLink = document.querySelector('[data-style].active');
    const activeSortLink = document.querySelector('[data-sort].active');
    
    const params = new URLSearchParams();
    
    // 添加篩選條件
    if (activeCategoryLink && activeCategoryLink.dataset.category !== 'all') {
        params.append('category', activeCategoryLink.dataset.category);
    }
    if (activeStyleLink && activeStyleLink.dataset.style !== 'all') {
        params.append('style', activeStyleLink.dataset.style);
    }
    if (activeSortLink && activeSortLink.dataset.sort) {
        params.append('sort', activeSortLink.dataset.sort);
    }
    
    // 從 API 獲取作品數據
    fetch(`/api/gallery?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('獲取作品列表失敗');
            }
            return response.json();
        })
        .then(data => {
            // 清空載入指示器
            galleryContainer.innerHTML = '';
            
            // 更新作品計數
            updateGalleryCount(data);
            
            // 渲染作品集
            if (Array.isArray(data)) {
                renderGalleryItems(data);
            } else if (data.items && Array.isArray(data.items)) {
                renderGalleryItems(data.items);
                
                // 更新分頁信息
                if (data.pagination) {
                    updatePagination(data.pagination);
                }
            } else {
                renderGalleryItems([]);
            }
            
            // 載入精選作品
            loadFeaturedItems();
        })
        .catch(error => {
            console.error('載入作品時出錯:', error);
            galleryContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>載入作品時出現錯誤，請稍後再試</p>
                    <button class="btn btn-primary" onclick="loadGalleryItems()">重新載入</button>
                </div>
            `;
        });
}

/**
 * 更新畫廊作品計數
 */
function updateGalleryCount(data) {
    const countElement = document.getElementById('gallery-count');
    if (countElement) {
        let count = 0;
        if (Array.isArray(data)) {
            count = data.length;
        } else if (data.pagination) {
            count = data.pagination.total;
        } else if (data.items) {
            count = data.items.length;
        }
        
        countElement.textContent = `共 ${count} 個作品`;
    }
}

/**
 * 更新分頁信息
 */
function updatePagination(pagination) {
    // 如果需要分頁功能，可以在這裡實現
    console.log('分頁信息:', pagination);
}

/**
 * 從側邊欄應用篩選
 */
function applyFiltersFromSidebar(filterData) {
    console.log('側邊欄篩選被觸發:', filterData);
    
    // 更新篩選標籤顯示
    updateFilterTagsFromSidebar();
    
    // 重新載入作品
    loadGalleryItems();
}

/**
 * 從側邊欄更新篩選標籤
 */
function updateFilterTagsFromSidebar() {
    const filterTagsContainer = document.getElementById('filterTags');
    if (!filterTagsContainer) return;
    
    // 清空現有標籤
    filterTagsContainer.innerHTML = '';
    
    // 獲取當前選中的篩選條件
    const activeCategoryLink = document.querySelector('[data-category].active');
    const activeStyleLink = document.querySelector('[data-style].active');
    const activeSortLink = document.querySelector('[data-sort].active');
    
    // 添加分類標籤
    if (activeCategoryLink && activeCategoryLink.dataset.category !== 'all') {
        addFilterTagFromSidebar('分類', getCategoryName(activeCategoryLink.dataset.category), () => {
            activeCategoryLink.classList.remove('active');
            document.querySelector('[data-category="all"]').classList.add('active');
            applyFiltersFromSidebar();
        });
    }
    
    // 添加風格標籤
    if (activeStyleLink && activeStyleLink.dataset.style !== 'all') {
        addFilterTagFromSidebar('風格', getStyleName(activeStyleLink.dataset.style), () => {
            activeStyleLink.classList.remove('active');
            document.querySelector('[data-style="all"]').classList.add('active');
            applyFiltersFromSidebar();
        });
    }
    
    // 添加排序標籤
    if (activeSortLink && activeSortLink.dataset.sort !== 'latest') {
        const sortLabels = {
            'popular': '最受歡迎',
            'views': '最多瀏覽',
            'comments': '最多評論'
        };
        addFilterTagFromSidebar('排序', sortLabels[activeSortLink.dataset.sort], () => {
            activeSortLink.classList.remove('active');
            document.querySelector('[data-sort="latest"]').classList.add('active');
            applyFiltersFromSidebar();
        });
    }
}

/**
 * 添加側邊欄篩選標籤
 */
function addFilterTagFromSidebar(type, value, removeCallback) {
    const filterTagsContainer = document.getElementById('filterTags');
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

/**
 * 初始化搜尋功能
 */
function initSearchFunction() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    // 搜尋按鈕點擊事件
    searchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    // 輸入框 Enter 鍵事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 執行搜尋
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        // 顯示載入中指示器
        const galleryContainer = document.getElementById('galleryItems');
        galleryContainer.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <span>搜尋中...</span>
            </div>
        `;
        
        // 建立搜尋參數
        const params = new URLSearchParams();
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        
        // 添加其他篩選條件（從側邊欄的active鏈接）
        const activeCategoryLink = document.querySelector('[data-category].active');
        const activeStyleLink = document.querySelector('[data-style].active');
        const activeSortLink = document.querySelector('[data-sort].active');
        
        if (activeCategoryLink && activeCategoryLink.dataset.category !== 'all') {
            params.append('category', activeCategoryLink.dataset.category);
        }
        if (activeStyleLink && activeStyleLink.dataset.style !== 'all') {
            params.append('style', activeStyleLink.dataset.style);
        }
        if (activeSortLink && activeSortLink.dataset.sort) {
            params.append('sort', activeSortLink.dataset.sort);
        }
        
        // 向 API 發送搜尋請求
        fetch(`/api/gallery?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('搜尋失敗');
                }
                return response.json();
            })
            .then(data => {
                // 清空載入指示器
                galleryContainer.innerHTML = '';
                
                // 渲染搜尋結果
                if (data.items && data.items.length > 0) {
                    renderGalleryItems(data.items);
                } else {
                    galleryContainer.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <p>找不到符合 "${searchTerm}" 的作品</p>
                            <button class="btn btn-primary" onclick="loadGalleryItems()">檢視所有作品</button>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('搜尋時出錯:', error);
                galleryContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>搜尋時出現錯誤，請稍後再試</p>
                        <button class="btn btn-primary" onclick="loadGalleryItems()">回到作品列表</button>
                    </div>
                `;
            });
    }
}

async function loadDiscussions() {
    const discussionListEl = document.querySelector('.discussion-list');
    
    try {
        // 顯示載入中狀態
        discussionListEl.innerHTML = '<div class="loading">載入中...</div>';
        
        // 從 API 獲取資料
        const response = await api.gallery.getFeatured();
        
        if (!response || !Array.isArray(response)) {
            throw new Error('無效的資料格式');
        }
        
        if (response.length === 0) {
            discussionListEl.innerHTML = '<div class="no-discussions">目前沒有展示作品</div>';
            return;
        }
        
        // 渲染討論列表
        renderDiscussions(response);
        
    } catch (error) {
        console.error('載入展示作品失敗:', error);
        discussionListEl.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>載入展示作品時發生錯誤</p>
                <button onclick="loadDiscussions()">重試</button>
            </div>
        `;
    }
}

function initSidebar() {
    const filterGroups = document.querySelectorAll('.filter-group');
    
    filterGroups.forEach(group => {
        const title = group.querySelector('.group-title');
        const list = group.querySelector('.filter-list');
        
        if (title && list) {
            title.addEventListener('click', () => {
                // 切換展開/收合狀態
                const isOpen = title.classList.toggle('open');
                list.classList.toggle('open');
                
                // 更新箭頭圖標
                const icon = title.querySelector('i');
                if (icon) {
                    icon.className = isOpen ? 'fas fa-chevron-right rotate-90' : 'fas fa-chevron-right';
                }
            });
        }
    });
}