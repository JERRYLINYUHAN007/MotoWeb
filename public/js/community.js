/**
 * community.js - MotoMod社群討論頁面功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initCommunityPage();
});

/**
 * 初始化社群頁面
 */
function initCommunityPage() {
    // 載入討論主題
    loadDiscussions();
    
    // 初始化發表新主題功能
    initNewPostModal();
    
    // 初始化分類篩選功能
    initCategoryFilter();
    
    // 初始化排序功能
    initSortOptions();
    
    // 初始化標籤點擊功能
    initTagClickEvents();
    
    // 初始化分頁功能
    initPagination();
    
    // 初始化搜尋功能
    initSearchFunction();
}

/**
 * 載入討論主題資料
 * 在實際應用中，這裡應該是從後端API獲取資料
 */
function loadDiscussions() {
    // 模擬從API獲取的討論主題資料
    const discussions = [
        {
            id: 1,
            title: '有人嘗試過Akrapovic排氣管嗎？值得裝嗎？',
            author: '摩托車小子',
            avatar: 'images/avatars/user1.svg',
            category: '排氣系統',
            tags: ['排氣管', '動力提升', 'Akrapovic'],
            date: '2025-04-20',
            replies: 24,
            views: 432,
            content: '我最近在考慮替我的Yamaha MT-09安裝Akrapovic排氣管...'
        },
        {
            id: 2,
            title: '懸吊系統調校經驗分享 - Öhlins避震器',
            author: '改裝達人',
            avatar: 'images/avatars/user2.svg',
            category: '懸吊系統',
            tags: ['避震器', '懸吊', 'Öhlins'],
            date: '2025-04-18',
            replies: 18,
            views: 356,
            content: '使用Öhlins避震器半年後，我想分享一些調校心得...'
        },
        {
            id: 3,
            title: '【討論】最省油的機車改裝方式？',
            author: '省油達人',
            avatar: 'images/avatars/user3.svg',
            category: '引擎改裝',
            tags: ['引擎調教', '省油', '效能'],
            date: '2025-04-17',
            replies: 32,
            views: 528,
            content: '想請問大家有什麼省油的改裝方式推薦？'
        },
        {
            id: 4,
            title: 'LED大燈改裝 - 增加夜間視野安全',
            author: '夜行俠',
            avatar: 'images/avatars/user4.svg',
            category: '電子系統',
            tags: ['車燈', 'LED', '安全'],
            date: '2025-04-15',
            replies: 15,
            views: 267,
            content: '最近替車子換上新的LED大燈，效果超乎預期...'
        },
        {
            id: 5,
            title: '新手必學的基礎保養技巧',
            author: '技師長',
            avatar: 'images/avatars/speaker1.svg',
            category: '保養維護',
            tags: ['保養', '機油', '新手'],
            date: '2025-04-14',
            replies: 47,
            views: 823,
            content: '分享給新手車友的基礎保養指南...'
        }
    ];
    
    renderDiscussions(discussions);
}

/**
 * 渲染討論主題列表
 * @param {Array} discussions - 討論主題資料陣列
 */
function renderDiscussions(discussions) {
    const discussionListEl = document.querySelector('.discussion-list');
    
    // 清空現有內容
    discussionListEl.innerHTML = '';
    
    if (discussions.length === 0) {
        discussionListEl.innerHTML = '<div class="no-discussions">目前沒有符合條件的討論主題</div>';
        return;
    }
    
    // 生成討論主題列表
    discussions.forEach(discussion => {
        const discussionEl = document.createElement('div');
        discussionEl.className = 'discussion-item';
        
        // 格式化日期
        const date = new Date(discussion.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // 標籤HTML
        const tagsHtml = discussion.tags.map(tag => 
            `<span class="discussion-tag">#${tag}</span>`
        ).join('');
        
        // 設置內容
        discussionEl.innerHTML = `
            <div class="discussion-avatar">
                <img src="${discussion.avatar}" alt="${discussion.author}">
            </div>
            <div class="discussion-content">
                <a href="discussion.html?id=${discussion.id}" class="discussion-title">${discussion.title}</a>
                <div class="discussion-meta">
                    <span class="discussion-author">${discussion.author}</span>
                    <span class="discussion-date">
                        <i class="far fa-clock"></i> ${formattedDate}
                    </span>
                    <span class="discussion-category">
                        <i class="fas fa-folder"></i> ${discussion.category}
                    </span>
                </div>
                <div class="discussion-tags">
                    ${tagsHtml}
                </div>
            </div>
            <div class="discussion-stats">
                <div class="stats-item">
                    <i class="far fa-comment"></i>
                    <span>${discussion.replies}</span>
                </div>
                <div class="stats-item">
                    <i class="far fa-eye"></i>
                    <span>${discussion.views}</span>
                </div>
            </div>
        `;
        
        discussionListEl.appendChild(discussionEl);
    });
}

/**
 * 初始化新主題發表功能
 */
function initNewPostModal() {
    // 創建發表新主題的彈窗
    const modalHtml = `
        <div class="modal" id="newPostModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">發表新主題</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="newPostForm">
                        <div class="form-group">
                            <label for="post-title" class="form-label">主題標題</label>
                            <input type="text" id="post-title" class="form-control" placeholder="請輸入主題標題" required>
                        </div>
                        <div class="form-group">
                            <label for="post-category" class="form-label">選擇分類</label>
                            <select id="post-category" class="form-select" required>
                                <option value="">請選擇分類</option>
                                <option value="引擎改裝">引擎改裝</option>
                                <option value="懸吊系統">懸吊系統</option>
                                <option value="外觀改造">外觀改造</option>
                                <option value="輪胎選擇">輪胎選擇</option>
                                <option value="電子系統">電子系統</option>
                                <option value="保養維護">保養維護</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">標籤</label>
                            <div class="tag-input-container" id="tag-container">
                                <input type="text" class="tag-input" id="tag-input" placeholder="輸入標籤後按Enter">
                            </div>
                            <small>最多5個標籤，每個標籤按Enter確認</small>
                        </div>
                        <div class="form-group">
                            <label for="post-content" class="form-label">內容</label>
                            <textarea id="post-content" class="form-control" placeholder="請輸入主題內容" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelPost">取消</button>
                    <button class="btn btn-primary" id="submitPost">發表</button>
                </div>
            </div>
        </div>
    `;
    
    // 將彈窗加入到DOM中
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 綁定彈窗開啟事件
    const createPostBtn = document.querySelector('.create-post-btn');
    createPostBtn.addEventListener('click', () => {
        const modal = document.getElementById('newPostModal');
        modal.classList.add('active');
    });
    
    // 綁定彈窗關閉事件
    const closeModalBtn = document.querySelector('.modal-close');
    closeModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('newPostModal');
        modal.classList.remove('active');
    });
    
    // 點擊彈窗外部關閉
    const modal = document.getElementById('newPostModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // 取消按鈕
    const cancelBtn = document.getElementById('cancelPost');
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // 標籤功能實現
    initTagInput();
    
    // 表單提交
    const submitBtn = document.getElementById('submitPost');
    submitBtn.addEventListener('click', () => {
        const form = document.getElementById('newPostForm');
        
        // 簡單表單驗證
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value;
        
        if (!title || !category || !content) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        // 在真實應用中，這裡會將資料提交到後端
        alert('主題發表成功！');
        modal.classList.remove('active');
        form.reset();
        
        // 清除標籤
        const tagContainer = document.getElementById('tag-container');
        const tagItems = tagContainer.querySelectorAll('.tag-item');
        tagItems.forEach(item => item.remove());
    });
}

/**
 * 初始化標籤輸入功能
 */
function initTagInput() {
    const tagInput = document.getElementById('tag-input');
    const tagContainer = document.getElementById('tag-container');
    const maxTags = 5;
    
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && tagInput.value.trim() !== '') {
            e.preventDefault();
            
            // 檢查標籤數量是否已達上限
            const currentTags = tagContainer.querySelectorAll('.tag-item');
            if (currentTags.length >= maxTags) {
                alert('最多只能新增5個標籤');
                return;
            }
            
            const tagText = tagInput.value.trim();
            
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
                <button type="button" class="tag-remove">&times;</button>
            `;
            
            // 插入標籤到輸入框前面
            tagContainer.insertBefore(tagItem, tagInput);
            
            // 清空輸入框
            tagInput.value = '';
            
            // 綁定標籤刪除事件
            const removeBtn = tagItem.querySelector('.tag-remove');
            removeBtn.addEventListener('click', () => {
                tagContainer.removeChild(tagItem);
            });
        }
    });
}

/**
 * 初始化分類篩選功能
 */
function initCategoryFilter() {
    const categoryLinks = document.querySelectorAll('.category-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 更新活動狀態
            categoryLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            
            // 在實際應用中，這裡應該根據分類重新載入數據
            const category = link.textContent;
            console.log(`已選擇分類: ${category}`);
            
            // 模擬從API根據分類篩選數據
            filterDiscussionsByCategory(category);
        });
    });
}

/**
 * 根據分類篩選討論主題
 * @param {string} category - 選擇的分類
 */
function filterDiscussionsByCategory(category) {
    // 模擬API請求
    // 在實際應用中，應該發送AJAX請求到後端API
    
    // 顯示載入狀態
    const discussionListEl = document.querySelector('.discussion-list');
    discussionListEl.innerHTML = '<div class="loading">載入中...</div>';
    
    // 模擬載入延遲
    setTimeout(() => {
        // 重新載入討論數據
        loadDiscussions();
        
        // 顯示過濾結果
        if (category !== '所有主題') {
            // 這裡可以顯示過濾提示
            console.log(`顯示 ${category} 分類的討論`);
        }
    }, 500);
}

/**
 * 初始化排序功能
 */
function initSortOptions() {
    // 視圖切換按鈕
    const viewButtons = document.querySelectorAll('.view-options .btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按鈕的活動狀態
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // 設置當前按鈕為活動狀態
            button.classList.add('active');
            
            // 在實際應用中，這裡應該根據選擇的視圖類型重新載入或過濾數據
            const viewType = button.textContent;
            console.log(`已選擇視圖: ${viewType}`);
            
            // 模擬重新載入
            loadDiscussions();
        });
    });
    
    // 排序選擇
    const sortSelect = document.querySelector('.sort-options select');
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        console.log(`已選擇排序方式: ${sortValue}`);
        
        // 在實際應用中，這裡應該根據選擇的排序方式重新排序數據
        sortDiscussions(sortValue);
    });
}

/**
 * 根據選擇的方式排序討論主題
 * @param {string} sortBy - 排序方式
 */
function sortDiscussions(sortBy) {
    // 模擬API請求
    // 在實際應用中，可能會發送AJAX請求到後端API，或是在前端處理排序
    
    // 顯示載入狀態
    const discussionListEl = document.querySelector('.discussion-list');
    discussionListEl.innerHTML = '<div class="loading">重新排序中...</div>';
    
    // 模擬載入延遲
    setTimeout(() => {
        // 重新載入討論數據
        loadDiscussions();
    }, 500);
}

/**
 * 初始化標籤點擊功能
 */
function initTagClickEvents() {
    // 由於標籤是動態生成的，使用事件委派
    document.addEventListener('click', (e) => {
        // 檢查是否點擊了熱門標籤或討論標籤
        if (e.target.classList.contains('tag') || e.target.classList.contains('discussion-tag')) {
            e.preventDefault();
            
            // 獲取標籤文字
            let tagText = e.target.textContent;
            if (tagText.startsWith('#')) {
                tagText = tagText.substring(1);
            }
            
            console.log(`已選擇標籤: ${tagText}`);
            
            // 在實際應用中，這裡應該根據標籤篩選討論
            filterDiscussionsByTag(tagText);
        }
    });
}

/**
 * 根據標籤篩選討論主題
 * @param {string} tag - 選擇的標籤
 */
function filterDiscussionsByTag(tag) {
    // 模擬API請求
    // 在實際應用中，應該發送AJAX請求到後端API
    
    // 顯示載入狀態
    const discussionListEl = document.querySelector('.discussion-list');
    discussionListEl.innerHTML = '<div class="loading">載入中...</div>';
    
    // 模擬載入延遲
    setTimeout(() => {
        // 重新載入討論數據
        loadDiscussions();
        
        // 顯示過濾結果
        console.log(`顯示包含 ${tag} 標籤的討論`);
    }, 500);
}

/**
 * 初始化分頁功能
 */
function initPagination() {
    const pageButtons = document.querySelectorAll('.page-numbers .btn');
    const prevButton = document.querySelector('.page-prev');
    const nextButton = document.querySelector('.page-next');
    
    // 頁碼按鈕點擊
    pageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 更新活動狀態
            pageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 獲取頁碼
            const page = button.textContent;
            console.log(`跳轉到第 ${page} 頁`);
            
            // 模擬頁面變更
            changePage(page);
            
            // 更新上一頁/下一頁按鈕狀態
            updatePaginationButtons();
        });
    });
    
    // 上一頁按鈕
    prevButton.addEventListener('click', () => {
        if (prevButton.disabled) return;
        
        // 找出當前活動頁面
        const activePage = document.querySelector('.page-numbers .btn.active');
        const prevPage = activePage.previousElementSibling;
        
        if (prevPage && prevPage.classList.contains('btn')) {
            // 模擬點擊上一頁
            prevPage.click();
        }
    });
    
    // 下一頁按鈕
    nextButton.addEventListener('click', () => {
        if (nextButton.disabled) return;
        
        // 找出當前活動頁面
        const activePage = document.querySelector('.page-numbers .btn.active');
        const nextPage = activePage.nextElementSibling;
        
        if (nextPage && nextPage.classList.contains('btn')) {
            // 模擬點擊下一頁
            nextPage.click();
        }
    });
    
    // 初始化分頁按鈕狀態
    updatePaginationButtons();
}

/**
 * 更新分頁按鈕狀態
 */
function updatePaginationButtons() {
    const prevButton = document.querySelector('.page-prev');
    const nextButton = document.querySelector('.page-next');
    const activePage = document.querySelector('.page-numbers .btn.active');
    const firstPage = document.querySelector('.page-numbers .btn:first-child');
    const lastPage = document.querySelector('.page-numbers .btn:last-child');
    
    // 上一頁按鈕狀態
    prevButton.disabled = activePage === firstPage;
    
    // 下一頁按鈕狀態
    nextButton.disabled = activePage === lastPage;
}

/**
 * 變更頁面
 * @param {string} page - 頁碼
 */
function changePage(page) {
    // 模擬API請求
    // 在實際應用中，應該發送AJAX請求到後端API獲取特定頁面的數據
    
    // 顯示載入狀態
    const discussionListEl = document.querySelector('.discussion-list');
    discussionListEl.innerHTML = '<div class="loading">載入第 ' + page + ' 頁...</div>';
    
    // 模擬載入延遲
    setTimeout(() => {
        // 重新載入討論數據
        loadDiscussions();
    }, 500);
}

/**
 * 初始化搜尋功能
 */
function initSearchFunction() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar .search-btn');
    
    // 搜尋按鈕點擊
    searchBtn.addEventListener('click', () => {
        performSearch();
    });
    
    // 按下Enter鍵
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    /**
     * 執行搜尋
     */
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            return;
        }
        
        console.log(`搜尋: ${searchTerm}`);
        
        // 顯示載入狀態
        const discussionListEl = document.querySelector('.discussion-list');
        discussionListEl.innerHTML = '<div class="loading">搜尋中...</div>';
        
        // 模擬搜尋延遲
        setTimeout(() => {
            // 在實際應用中，這裡應該根據搜尋結果更新討論列表
            // 暫時直接重新載入所有討論
            loadDiscussions();
            
            // 顯示搜尋結果提示
            alert(`已搜尋 "${searchTerm}" 的相關討論`);
        }, 800);
    }
}