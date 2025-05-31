// 渲染活動網格
function renderEventsGrid(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    // 清空容器
    eventsGrid.innerHTML = '';
    
    // 檢查是否有活動
    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="far fa-calendar-times"></i>
                <p>目前沒有符合條件的活動</p>
                <button class="btn btn-outline" id="resetFiltersBtn">清除篩選條件</button>
            </div>
        `;
        
        // 綁定重置篩選按鈕
        document.getElementById('resetFiltersBtn').addEventListener('click', function() {
            document.getElementById('clearFilterBtn').click();
        });
        
        return;
    }
    
    // 渲染活動卡片
    events.forEach(event => {
        const eventCard = document.createElement('article');
        eventCard.className = 'event-card';
        eventCard.dataset.id = event.id;
        
        // 格式化日期
        const date = new Date(event.date);
        const day = date.getDate();
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const month = monthNames[date.getMonth()];
        
        // 翻譯活動類型
        const typeNames = {
            'workshop': '改裝工作坊',
            'competition': '改裝比賽',
            'meetup': '車友聚會',
            'seminar': '技術講座',
            'exhibition': '展覽活動'
        };
        
        // 創建卡片HTML
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
                <div class="event-date">
                    <span class="date">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-badge ${event.type}">${typeNames[event.type]}</div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <div class="event-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    <span><i class="fas fa-clock"></i> ${event.time}</span>
                </div>
                <p>${event.description.length > 150 ? event.description.substring(0, 150) + '...' : event.description}</p>
                <div class="event-footer">
                    <button class="btn btn-primary view-event-btn" data-id="${event.id}">查看詳情</button>
                    <div class="event-stats">
                        <span><i class="fas fa-user"></i> ${event.registered}/${event.capacity}</span>
                        <span><i class="fas fa-heart"></i> ${Math.floor(Math.random() * 100) + 50}</span>
                    </div>
                </div>
            </div>
        `;
        
        // 綁定查看詳情按鈕
        const viewBtn = eventCard.querySelector('.view-event-btn');
        viewBtn.addEventListener('click', function() {
            openEventDetails(this.dataset.id);
        });
        
        eventsGrid.appendChild(eventCard);
    });
}

/**
 * 渲染活動列表
 * @param {Array} events - 活動資料陣列
 */
function renderEventsList(events) {
    const eventsTableBody = document.getElementById('eventsTableBody');
    
    // 清空表格
    eventsTableBody.innerHTML = '';
    
    // 檢查是否有活動
    if (events.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">
                <div class="no-events">
                    <p>目前沒有符合條件的活動</p>
                </div>
            </td>
        `;
        eventsTableBody.appendChild(emptyRow);
        return;
    }
    
    // 翻譯活動類型
    const typeNames = {
        'workshop': '改裝工作坊',
        'competition': '改裝比賽',
        'meetup': '車友聚會',
        'seminar': '技術講座',
        'exhibition': '展覽活動'
    };
    
    // 渲染活動列表
    events.forEach(event => {
        const eventRow = document.createElement('tr');
        
        // 格式化日期
        const date = new Date(event.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // 創建行HTML
        eventRow.innerHTML = `
            <td>${formattedDate}</td>
            <td>
                <div class="table-event-title">
                    <span class="table-event-badge ${event.type}"></span>
                    ${event.title}
                </div>
            </td>
            <td>${event.location}</td>
            <td>${typeNames[event.type]}</td>
            <td>${event.registered}/${event.capacity}</td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-id="${event.id}" aria-label="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="register-btn" data-id="${event.id}" aria-label="報名">
                        <i class="fas fa-user-plus"></i>
                    </button>
                    <button class="calendar-btn" data-id="${event.id}" aria-label="加入行事曆">
                        <i class="fas fa-calendar-plus"></i>
                    </button>
                </div>
            </td>
        `;
        
        // 綁定按鈕事件
        const viewBtn = eventRow.querySelector('.view-btn');
        viewBtn.addEventListener('click', function() {
            openEventDetails(this.dataset.id);
        });
        
        const registerBtn = eventRow.querySelector('.register-btn');
        registerBtn.addEventListener('click', function() {
            openRegistrationForm(this.dataset.id);
        });
        
        const calendarBtn = eventRow.querySelector('.calendar-btn');
        calendarBtn.addEventListener('click', function() {
            addToCalendar(this.dataset.id);
        });
        
        eventsTableBody.appendChild(eventRow);
    });
}

/**
 * 初始化活動詳情功能
 */
function initEventDetails() {
    const eventModal = document.getElementById('eventModal');
    const closeEventModal = document.getElementById('closeEventModal');
    
    // 關閉按鈕
    closeEventModal.addEventListener('click', function() {
        eventModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 點擊模態框外部關閉
    eventModal.addEventListener('click', function(e) {
        if (e.target === eventModal) {
            eventModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // 切換頁籤
    const eventTabs = document.querySelectorAll('.event-tab');
    eventTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 更新頁籤狀態
            eventTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 獲取頁籤類型
            const tabType = this.dataset.tab;
            
            // 更新內容顯示
            const tabContents = document.querySelectorAll('.event-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabType}`).classList.add('active');
        });
    });
    
    // 註冊按鈕
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.addEventListener('click', function() {
        // 獲取活動ID
        const eventId = this.dataset.eventId;
        openRegistrationForm(eventId);
    });
    
    // 加入行事曆按鈕
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    addCalendarBtn.addEventListener('click', function() {
        // 獲取活動ID
        const eventId = this.dataset.eventId;
        addToCalendar(eventId);
    });
    
    // 分享按鈕
    const shareEventBtn = document.getElementById('shareEventBtn');
    shareEventBtn.addEventListener('click', function() {
        // 獲取活動標題和ID
        const eventTitle = document.getElementById('eventTitle').textContent;
        const eventId = this.dataset.eventId;
        
        // 在實際應用中，這裡應該打開分享選單
        // 這裡簡單地使用瀏覽器的分享API（如果支援）
        if (navigator.share) {
            navigator.share({
                title: eventTitle,
                text: '查看這個摩托車改裝活動',
                url: `https://www.motomod.com/events/event.html?id=${eventId}`
            })
            .catch(err => {
                console.error('分享失敗:', err);
            });
        } else {
            // 假設此網址是活動頁面
            const url = `https://www.motomod.com/events/event.html?id=${eventId}`;
            
            // 複製連結到剪貼簿
            navigator.clipboard.writeText(url)
                .then(() => {
                    alert('活動連結已複製到剪貼簿');
                })
                .catch(err => {
                    console.error('複製失敗:', err);
                });
        }
    });
}

/**
 * 開啟活動詳情
 * @param {string} eventId - 活動ID
 */
async function openEventDetails(eventId) {
    try {
        // 從API獲取活動詳情
        const event = await window.eventsAPI.getEventById(eventId);
        const formattedEvent = window.eventsAPI.formatEventForDisplay(event);
    
    // 更新模態框內容
        document.getElementById('eventBanner').src = formattedEvent.image;
        document.getElementById('eventBanner').alt = formattedEvent.title;
        document.getElementById('eventTitle').textContent = formattedEvent.title;
    
    // 更新活動標籤
    const eventBadges = document.getElementById('eventBadges');
    eventBadges.innerHTML = '';
    
    const typeBadge = document.createElement('div');
        typeBadge.className = `event-badge-large ${formattedEvent.type}`;
        typeBadge.textContent = window.eventsAPI.getTypeDisplayName(formattedEvent.type);
    eventBadges.appendChild(typeBadge);
    
    // 更新活動元數據
        document.getElementById('eventDate').textContent = formatDate(formattedEvent.date);
        document.getElementById('eventTime').textContent = formattedEvent.time;
        document.getElementById('eventLocation').textContent = `${formattedEvent.location}${formattedEvent.address ? ' (' + formattedEvent.address + ')' : ''}`;
        document.getElementById('eventOrganizer').textContent = formattedEvent.organizer;
    
    // 更新活動描述
        document.getElementById('eventDescription').innerHTML = formattedEvent.description;
    
        // 更新其他頁籤內容（簡化處理）
        document.getElementById('eventSchedule').innerHTML = '<p>暫無詳細議程</p>';
        document.getElementById('eventSpeakers').innerHTML = '<p>暫無講者資訊</p>';
        document.getElementById('eventLocationMap').innerHTML = `
        <div style="background-color: #f8f9fa; padding: 1rem; text-align: center;">
            <p><i class="fas fa-map-marked-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i></p>
                <p><strong>${formattedEvent.location}</strong></p>
                ${formattedEvent.address ? `<p>${formattedEvent.address}</p>` : ''}
        </div>
    `;
    
    // 更新報名資訊
        document.getElementById('registrationStatus').textContent = getStatusText(formattedEvent.status);
        document.getElementById('registrationStatus').className = `registration-status ${formattedEvent.status}`;
    
    document.getElementById('registrationDetails').innerHTML = `
        <p>請於截止日期前完成報名，名額有限，額滿為止。</p>
        <p>報名成功後，將收到確認電子郵件，請於活動當天出示QR碼報到。</p>
    `;
    
        document.getElementById('priceInfo').textContent = formattedEvent.fee > 0 ? `NT$ ${formattedEvent.fee}` : '免費';
        document.getElementById('priceInfo').className = formattedEvent.fee > 0 ? 'price-info' : 'price-info free';
    
        const remaining = formattedEvent.capacity - formattedEvent.registered;
    document.getElementById('remainingSpots').innerHTML = `
            <div>剩餘名額：${remaining}/${formattedEvent.capacity}</div>
        <div class="spots-progress">
                <div class="spots-bar" style="width: ${(formattedEvent.registered / formattedEvent.capacity) * 100}%"></div>
        </div>
    `;
    
        if (formattedEvent.deadline) {
            document.getElementById('registrationDeadline').textContent = `報名截止日期：${formatDate(formattedEvent.deadline)}`;
        }
    
    // 更新按鈕狀態
    const registerBtn = document.getElementById('registerBtn');
        registerBtn.disabled = formattedEvent.status === 'closed';
        registerBtn.textContent = formattedEvent.status === 'closed' ? '報名已截止' : '立即報名';
        registerBtn.dataset.eventId = formattedEvent.id;
    
        document.getElementById('addCalendarBtn').dataset.eventId = formattedEvent.id;
        document.getElementById('shareEventBtn').dataset.eventId = formattedEvent.id;
    
    // 更新主辦方資訊
    const organizerInfo = document.getElementById('organizerInfo');
        organizerInfo.innerHTML = `
            <div class="organizer-info">
                <div class="organizer-avatar" style="background-color: #e9ecef; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 1.5rem; color: #6c757d;"></i>
                </div>
                <div>
                    <div class="organizer-name">${formattedEvent.organizer}</div>
                </div>
            </div>
            <p>主辦方資訊</p>
        `;
    
    // 激活第一個頁籤
    document.querySelectorAll('.event-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.event-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.event-tab[data-tab="description"]').classList.add('active');
    document.getElementById('tab-description').classList.add('active');
    
    // 打開模態框
    const eventModal = document.getElementById('eventModal');
    eventModal.classList.add('active');
    document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('載入活動詳情失敗:', error);
        alert('載入活動詳情失敗：' + error.message);
    }
}

/**
 * 初始化報名功能
 */
function initRegistration() {
    const registrationModal = document.getElementById('registrationModal');
    const closeRegistrationModal = document.getElementById('closeRegistrationModal');
    const cancelRegistrationBtn = document.getElementById('cancelRegistrationBtn');
    const registrationForm = document.getElementById('registrationForm');
    
    // 關閉按鈕
    closeRegistrationModal.addEventListener('click', function() {
        registrationModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 點擊模態框外部關閉
    registrationModal.addEventListener('click', function(e) {
        if (e.target === registrationModal) {
            registrationModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // 取消按鈕
    cancelRegistrationBtn.addEventListener('click', function() {
        registrationModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 表單提交
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 檢查必填欄位
        const name = document.getElementById('registrationName').value;
        const email = document.getElementById('registrationEmail').value;
        const phone = document.getElementById('registrationPhone').value;
        const terms = document.getElementById('registrationTerms').checked;
        
        if (!name || !email || !phone || !terms) {
            alert('請填寫所有必填欄位並同意活動條款');
            return;
        }
        
        // 獲取選擇的票種
        let selectedTicket = null;
        const ticketRadios = document.querySelectorAll('input[name="ticket"]:checked');
        if (ticketRadios.length > 0) {
            selectedTicket = ticketRadios[0].value;
        }
        
        // 檢查是否選擇票種（如果有票種選項）
        const ticketOptions = document.getElementById('ticketOptions');
        if (ticketOptions.children.length > 0 && !selectedTicket) {
            alert('請選擇票種');
            return;
        }
        
        // 在實際應用中，這裡應該向API發送報名資訊
        // 提交報名
        submitRegistration();
    });
    
    // 實現票種選擇功能
    document.addEventListener('click', function(e) {
        if (e.target.closest('.ticket-option')) {
            const ticketOption = e.target.closest('.ticket-option');
            const radio = ticketOption.querySelector('input[type="radio"]');
            
            // 避免已售完的票種被選擇
            if (ticketOption.classList.contains('sold-out')) {
                return;
            }
            
            // 更新選中狀態
            document.querySelectorAll('.ticket-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            ticketOption.classList.add('selected');
            radio.checked = true;
        }
    });
}

/**
 * 開啟報名表單
 * @param {string} eventId - 活動ID
 */
async function openRegistrationForm(eventId) {
    try {
        // 從API獲取活動資訊
        const event = await window.eventsAPI.getEventById(eventId);
        const formattedEvent = window.eventsAPI.formatEventForDisplay(event);
    
    // 更新表單標題
        document.getElementById('registrationEventTitle').textContent = formattedEvent.title;
    
        // 隱藏票種選擇區域（簡化處理）
    const ticketSelectionGroup = document.getElementById('ticketSelectionGroup');
        ticketSelectionGroup.style.display = 'none';
    
    // 重置表單
    document.getElementById('registrationForm').reset();
        
        // 儲存活動ID供表單提交使用
        document.getElementById('registrationForm').dataset.eventId = eventId;
    
    // 開啟模態框
    const registrationModal = document.getElementById('registrationModal');
    registrationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('載入報名表單失敗:', error);
        alert('載入報名表單失敗：' + error.message);
    }
}

/**
 * 提交報名表單
 */
async function submitRegistration() {
    const submitBtn = document.getElementById('submitRegistrationBtn');
    const originalText = submitBtn.textContent;
    
    try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
    
        // 獲取表單資料
        const form = document.getElementById('registrationForm');
        const eventId = form.dataset.eventId;
        
        // 使用API註冊活動
        await window.eventsAPI.registerForEvent(eventId);
        
        // 關閉報名模態框
        const registrationModal = document.getElementById('registrationModal');
        registrationModal.classList.remove('active');
        
        // 顯示成功模態框
        const successModal = document.getElementById('successModal');
        document.getElementById('successTitle').textContent = '報名成功';
        document.getElementById('successMessage').textContent = '您已成功報名活動，確認信將發送至您的電子郵件。';
        
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('報名失敗:', error);
        alert('報名失敗：' + error.message);
    } finally {
        // 重置按鈕狀態
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * 初始化活動創建功能
 */
function initCreateEvent() {
    const createEventBtns = document.querySelectorAll('.create-event-btn, .create-event-btn-large');
    const createEventModal = document.getElementById('createEventModal');
    const closeCreateEventModal = document.getElementById('closeCreateEventModal');
    const cancelCreateEventBtn = document.getElementById('cancelCreateEventBtn');
    const createEventForm = document.getElementById('createEventForm');
    const eventImageUpload = document.getElementById('eventImageUpload');
    const eventImageFile = document.getElementById('eventImageFile');
    const eventImagePreview = document.getElementById('eventImagePreview');
    
    // 開啟按鈕
    createEventBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            createEventModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // 關閉按鈕
    closeCreateEventModal.addEventListener('click', function() {
        createEventModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 點擊模態框外部關閉
    createEventModal.addEventListener('click', function(e) {
        if (e.target === createEventModal) {
            createEventModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // 取消按鈕
    cancelCreateEventBtn.addEventListener('click', function() {
        createEventModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 圖片上傳預覽
    eventImageFile.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                eventImagePreview.innerHTML = `<img src="${e.target.result}" alt="活動圖片預覽">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 拖放上傳功能
    eventImageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    eventImageUpload.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    eventImageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        
        if (file && file.type.startsWith('image/')) {
            eventImageFile.files = e.dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                eventImagePreview.innerHTML = `<img src="${e.target.result}" alt="活動圖片預覽">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 創建活動表單提交
    createEventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 獲取表單數據
        const formData = new FormData(createEventForm);
        
        // 驗證表單
        const title = formData.get('title');
        const location = formData.get('location');
        const eventDate = formData.get('eventDate');
        
        if (!title || !location || !eventDate) {
            alert('請填寫必填欄位（標題、地點、日期）');
            return;
        }
        
        // 禁用提交按鈕，顯示載入中
        const submitBtn = document.getElementById('submitCreateEventBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '處理中...';
        
        // 發送到服務器
        fetch('/api/events', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || '創建活動失敗');
                });
            }
            return response.json();
        })
        .then(data => {
            // 關閉創建活動模態框
            createEventModal.classList.remove('active');
            
            // 顯示成功模態框
            const successModal = document.getElementById('successModal');
            document.getElementById('successTitle').textContent = '活動創建成功';
            document.getElementById('successMessage').textContent = '您的活動已成功創建，可在「我的活動」中查看和管理。';
            
            successModal.classList.add('active');
            
            // 重置表單和按鈕狀態
            createEventForm.reset();
            eventImagePreview.innerHTML = '';
            
            // 重新載入活動列表，顯示新建的活動
            loadEvents();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || '創建活動失敗，請稍後再試');
        })
        .finally(() => {
            // 恢復按鈕狀態
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
}

/**
 * 初始化搜尋功能
 */
function initSearchFunction() {
    const searchInput = document.getElementById('eventSearchInput');
    const searchBtn = document.getElementById('eventSearchBtn');
    
    // 搜尋按鈕點擊
    searchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    // 按下Enter鍵
    searchInput.addEventListener('keydown', function(e) {
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
            // 如果搜尋框為空，載入所有活動
            loadEvents();
            return;
        }
        
        // 更新URL參數
        const url = new URL(window.location);
        url.searchParams.set('search', searchTerm);
        url.searchParams.delete('page'); // 重置到第一頁
        window.history.pushState({}, '', url);
        
        // 重新載入活動（會自動帶上搜尋參數）
                loadEvents();
    }
}

/**
 * 初始化載入更多功能
 */
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        // 獲取當前頁碼
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        const nextPage = currentPage + 1;
        
        // 更新URL到下一頁
        const url = new URL(window.location);
        url.searchParams.set('page', nextPage);
        window.history.pushState({}, '', url);
        
        // 載入下一頁的活動
        loadEvents();
            });
            
    // (移除模擬的 loadMoreEvents 函數，改用分頁系統)
}

/**
 * 初始化分類卡片功能
 */
function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 獲取分類類型
            const type = this.dataset.type;
            
            // 設置篩選選項
            if (type !== 'all') {
                document.getElementById('eventTypeFilter').value = type;
                applyFilters();
            } else {
                document.getElementById('eventTypeFilter').value = 'all';
                document.getElementById('eventLocationFilter').value = 'all';
                document.getElementById('eventDateFilter').value = 'all';
                applyFilters();
            }
            
            // 切換到網格視圖
            document.querySelector('.view-toggle[data-view="grid"]').click();
            
            // 滾動到活動列表
            document.getElementById('gridView').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    /**
     * 應用篩選條件
     */
    function applyFilters() {
        // 顯示載入中狀態
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = `
            <div class="events-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>篩選中...</span>
            </div>
        `;
        
        // 更新列表視圖
        const eventsTableBody = document.getElementById('eventsTableBody');
        eventsTableBody.innerHTML = '';
        
            // 重新載入活動
            loadEvents();
    }
}

/**
 * 加入行事曆功能
 * @param {string} eventId - 活動ID
 */
function addToCalendar(eventId) {
    // 在實際應用中，這裡應該獲取活動詳情
    // 加入行事曆功能（可串接Google Calendar等服務）
    alert('已將活動加入您的行事曆');
}

/**
 * 格式化日期
 * @param {string} dateString - 日期字串 (YYYY-MM-DD)
 * @returns {string} 格式化後的日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
}

/**
 * 取得活動狀態文字
 * @param {string} status - 活動狀態
 * @returns {string} 狀態文字
 */
function getStatusText(status) {
    switch (status) {
        case 'open':
            return '報名開放中';
        case 'closing':
            return '即將截止';
        case 'closed':
            return '報名已截止';
        default:
            return '報名狀態未知';
    }
}

/**
 * events.js - MotoMod改裝活動頁面功能
 */

// 頁面初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Events page initializing...');
    
    // 確保EventsAPI已經載入
    if (typeof window.eventsAPI === 'undefined') {
        console.error('EventsAPI not loaded');
        return;
    }
    
    // 初始化各種功能
    initEventDetails();
    initRegistration();
    initCreateEvent();
    initSearchFunction();
    initLoadMore();
    initCategoryCards();
    initViewToggle();
    initFilters();
    initCalendar();
    
    // 載入活動資料
    loadEvents();
    
    console.log('Events page initialized successfully');
});

/**
 * 初始化活動頁面
 */
function initEventsPage() {
    // 初始化所有功能模塊
    initViewToggle();
    initFilters();
    initCategoryCards();
    initLoadMore();
    initCalendar();
    initEventDetails();
    initRegistration();
    initCreateEvent();
    initSearchFunction();
    
    // 載入活動數據
    loadEvents();
    
    // 隱藏載入動畫
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const loadingElements = document.querySelectorAll('.events-loading');
            loadingElements.forEach(el => {
                el.style.display = 'none';
            });
            
            // 檢查是否有活動
            const eventsGrid = document.getElementById('eventsGrid');
            if (eventsGrid && eventsGrid.children.length === 0) {
                showEmptyState();
            } else {
                // 顯示載入更多按鈕
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = '';
                }
            }
        }, 1500);
    });
    
    // 幫助函數：顯示空狀態
    function showEmptyState() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (eventsGrid) {
            eventsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>暫無活動</h3>
                    <p>目前沒有符合條件的活動</p>
                </div>
            `;
        }
        
        // 隱藏載入更多按鈕
        const loadMoreContainer = document.querySelector('.load-more');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
}

/**
 * 初始化視圖切換
 */
function initViewToggle() {
    const viewToggles = document.querySelectorAll('.view-toggle');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const calendarView = document.getElementById('calendarView');
    
    // 視圖切換按鈕點擊事件
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // 更新按鈕狀態
            viewToggles.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 獲取視圖類型
            const viewType = this.dataset.view;
            
            // 切換視圖
            switch (viewType) {
                case 'grid':
                    gridView.classList.add('active');
                    listView.classList.remove('active');
                    calendarView.classList.remove('active');
                    break;
                case 'list':
                    gridView.classList.remove('active');
                    listView.classList.add('active');
                    calendarView.classList.remove('active');
                    break;
                case 'calendar':
                    gridView.classList.remove('active');
                    listView.classList.remove('active');
                    calendarView.classList.add('active');
                    break;
            }
        });
    });
}

/**
 * 初始化篩選功能
 */
function initFilters() {
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    const eventLocationFilter = document.getElementById('eventLocationFilter');
    const eventDateFilter = document.getElementById('eventDateFilter');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // 篩選條件變更事件
    const filters = [eventTypeFilter, eventLocationFilter, eventDateFilter];
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // 清除篩選按鈕
    clearFilterBtn.addEventListener('click', function() {
        resetFilters();
    });
    
    /**
     * 應用篩選條件
     */
    function applyFilters() {
        // 顯示載入中狀態
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = `
            <div class="events-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>篩選中...</span>
            </div>
        `;
        
        // 更新列表視圖
        const eventsTableBody = document.getElementById('eventsTableBody');
        eventsTableBody.innerHTML = '';
        
            // 重新載入活動
            loadEvents();
    }
    
    /**
     * 重置所有篩選條件
     */
    function resetFilters() {
        eventTypeFilter.value = 'all';
        eventLocationFilter.value = 'all';
        eventDateFilter.value = 'all';
        
        // 重新應用篩選
        applyFilters();
    }
}

/**
 * 初始化日曆功能
 */
function initCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    
    // 當前日期
    let currentDate = new Date();
    
    // 顯示當前月份
    updateCalendarMonth(currentDate);
    
    // 產生日曆
    generateCalendar(currentDate);
    
    // 上個月按鈕
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendarMonth(currentDate);
        generateCalendar(currentDate);
    });
    
    // 下個月按鈕
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendarMonth(currentDate);
        generateCalendar(currentDate);
    });
    
    /**
     * 更新日曆月份顯示
     * @param {Date} date - 日期
     */
    function updateCalendarMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        currentMonthElement.textContent = `${year}年${month}月`;
    }
    
    /**
     * 產生日曆
     * @param {Date} date - 日期
     */
    function generateCalendar(date) {
        // 顯示載入中狀態
        calendarGrid.innerHTML = `
            <div class="calendar-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>載入中...</span>
            </div>
        `;
        
            // 清空日曆
            calendarGrid.innerHTML = '';
            
            // 獲取當前月份的第一天
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            
            // 獲取當前月份的最後一天
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            // 獲取第一天是星期幾（0-6，0是星期日）
            const firstDayOfWeek = firstDay.getDay();
            
            // 創建星期標題
            const weekdayRow = document.createElement('div');
            weekdayRow.className = 'calendar-week';
            
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            weekdays.forEach(day => {
                const weekdayCell = document.createElement('div');
                weekdayCell.className = 'calendar-weekday';
                weekdayCell.textContent = day;
                weekdayRow.appendChild(weekdayCell);
            });
            
            calendarGrid.appendChild(weekdayRow);
            
            // 計算日曆需要的行數
            const totalDays = lastDay.getDate();
            const totalCells = firstDayOfWeek + totalDays;
            const totalRows = Math.ceil(totalCells / 7);
            
            // 創建行
            let dayCount = 1;
            let prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
            
            for (let row = 0; row < totalRows; row++) {
                const weekRow = document.createElement('div');
                weekRow.className = 'calendar-week';
                
                // 創建單元格
                for (let col = 0; col < 7; col++) {
                    const dayCell = document.createElement('div');
                    dayCell.className = 'calendar-day';
                    
                    const cellIndex = row * 7 + col;
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'day-number';
                    
                    // 填充上個月的日期
                    if (cellIndex < firstDayOfWeek) {
                        const prevMonthDay = prevMonthLastDay - (firstDayOfWeek - cellIndex - 1);
                        dayNumber.textContent = prevMonthDay;
                        dayCell.classList.add('other-month');
                    }
                    // 填充當前月的日期
                    else if (dayCount <= totalDays) {
                        dayNumber.textContent = dayCount;
                        
                        // 檢查是否為今天
                        const today = new Date();
                        if (date.getFullYear() === today.getFullYear() && 
                            date.getMonth() === today.getMonth() && 
                            dayCount === today.getDate()) {
                            dayCell.classList.add('today');
                        }
                        
                        // 活動顯示（簡化處理，實際應從API獲取該日期的活動）
                        
                        dayCount++;
                    }
                    // 填充下個月的日期
                    else {
                        const nextMonthDay = dayCount - totalDays;
                        dayNumber.textContent = nextMonthDay;
                        dayCell.classList.add('other-month');
                        dayCount++;
                    }
                    
                    dayCell.prepend(dayNumber);
                    weekRow.appendChild(dayCell);
                }
                
                calendarGrid.appendChild(weekRow);
            }
    }
    
    // (移除模擬活動相關的輔助函數)
}

/**
 * 載入活動資料
 */
async function loadEvents() {
    // 顯示載入中
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsTableBody = document.getElementById('eventsTableBody');
    
    if (eventsGrid) {
        eventsGrid.innerHTML = '<div class="events-loading"><i class="fas fa-spinner fa-spin"></i><span>載入活動中...</span></div>';
    }
    
    try {
    // 構建查詢參數
    const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;
    const type = urlParams.get('type') || '';
    const search = urlParams.get('search') || '';
    const startDate = urlParams.get('startDate') || '';
    const endDate = urlParams.get('endDate') || '';
    
        // 準備API查詢選項
        const queryOptions = {
            page,
            limit: 12
        };
        
        if (type && type !== 'all') {
            queryOptions.type = type;
        }
        
        if (search.trim()) {
            queryOptions.search = search.trim();
        }
        
        if (startDate) {
            queryOptions.startDate = startDate;
        }
        
        if (endDate) {
            queryOptions.endDate = endDate;
        }
        
        // 檢查是否為未來活動頁面，若是則只顯示未來的活動
        const isUpcoming = window.location.pathname.includes('upcoming') || document.querySelector('.upcoming-events');
        if (isUpcoming && !startDate) {
            queryOptions.startDate = new Date().toISOString().split('T')[0];
        }
        
        console.log('Loading events with options:', queryOptions);
        
        // 從API載入活動資料
        const response = await window.eventsAPI.getEvents(queryOptions);
        console.log('API response:', response);
        
        if (response && response.events) {
            // 格式化活動資料以符合前端顯示需求
            const formattedEvents = response.events.map(event => 
                window.eventsAPI.formatEventForDisplay(event)
            );
            
            console.log('Formatted events:', formattedEvents);
            
            // 渲染活動列表
            renderEventsGrid(formattedEvents);
            renderEventsList(formattedEvents);
            
            // 更新分頁資訊
            if (response.totalPages > 1) {
                renderPagination(response.page || 1, response.totalPages);
                }
            
            // 更新URL以反映當前篩選狀態
            updateURL(queryOptions);
            
            } else {
                showEmptyState();
            }
            
    } catch (error) {
        console.error('載入活動失敗:', error);
        showErrorState(error.message);
            }
}

// 顯示錯誤狀態
function showErrorState(message) {
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsTableBody = document.getElementById('eventsTableBody');
    
    const errorHTML = `
        <div class="no-events">
            <i class="fas fa-exclamation-triangle"></i>
            <p>載入活動時發生錯誤</p>
            <p class="error-message">${message}</p>
            <button class="btn btn-outline" onclick="loadEvents()">重新載入</button>
                </div>
            `;
    
    if (eventsGrid) {
        eventsGrid.innerHTML = errorHTML;
        }
        
        if (eventsTableBody) {
        eventsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">${errorHTML}</td>
            </tr>
        `;
    }
}

// 更新URL狀態
function updateURL(options) {
    const url = new URL(window.location);
    
    // 清除舊的查詢參數
    url.searchParams.delete('page');
    url.searchParams.delete('type');
    url.searchParams.delete('search');
    url.searchParams.delete('startDate');
    url.searchParams.delete('endDate');
    
    // 添加新的查詢參數
    if (options.page && options.page > 1) {
        url.searchParams.set('page', options.page);
        }
    if (options.type) {
        url.searchParams.set('type', options.type);
    }
    if (options.search) {
        url.searchParams.set('search', options.search);
    }
    if (options.startDate) {
        url.searchParams.set('startDate', options.startDate);
    }
    if (options.endDate) {
        url.searchParams.set('endDate', options.endDate);
    }
    
    // 更新瀏覽器歷史記錄
    window.history.replaceState({}, '', url);
}

/**
 * 渲染分頁控制元素
 * @param {number} currentPage - 當前頁碼
 * @param {number} totalPages - 總頁數
 */
function renderPagination(currentPage, totalPages) {
    // 檢查是否需要分頁
    if (totalPages <= 1) return;
    
    // 查找或創建分頁容器
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        document.querySelector('.load-more').insertAdjacentElement('beforebegin', paginationContainer);
    }
    
    // 清空容器
    paginationContainer.innerHTML = '';
    
    // 創建分頁列表
    const pagination = document.createElement('ul');
    pagination.className = 'pagination';
    
    // 添加上一頁按鈕
    const prevLi = document.createElement('li');
    prevLi.className = currentPage === 1 ? 'page-item disabled' : 'page-item';
    prevLi.innerHTML = `
        <a href="#" class="page-link" data-page="${currentPage - 1}" aria-label="上一頁">
            <i class="fas fa-chevron-left"></i>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // 添加數字頁碼
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 第一頁
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a href="#" class="page-link" data-page="1">1</a>`;
        pagination.appendChild(firstLi);
        
        // 添加省略號
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(ellipsisLi);
        }
    }
    
    // 數字頁碼
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = i === currentPage ? 'page-item active' : 'page-item';
        pageLi.innerHTML = `<a href="#" class="page-link" data-page="${i}">${i}</a>`;
        pagination.appendChild(pageLi);
    }
    
    // 最後一頁
    if (endPage < totalPages) {
        // 添加省略號
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(ellipsisLi);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
        pagination.appendChild(lastLi);
    }
    
    // 添加下一頁按鈕
    const nextLi = document.createElement('li');
    nextLi.className = currentPage === totalPages ? 'page-item disabled' : 'page-item';
    nextLi.innerHTML = `
        <a href="#" class="page-link" data-page="${currentPage + 1}" aria-label="下一頁">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
    pagination.appendChild(nextLi);
    
    // 添加到容器
    paginationContainer.appendChild(pagination);
    
    // 綁定頁碼點擊事件
    const pageLinks = pagination.querySelectorAll('.page-link:not(.disabled)');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            if (page) {
                // 構建新的URL
                const url = new URL(window.location.href);
                url.searchParams.set('page', page);
                
                // 更新URL並重新加載
                window.history.pushState({}, '', url);
                loadEvents();
                
                // 滾動到頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// 查看我的活動
function viewMyEvents() {
    // 檢查登入狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入查看您的活動');
        window.location.href = 'login.html';
        return;
    }
    
    // 這裡可以實現篩選用戶相關活動的邏輯
    // 例如：用戶報名的活動、用戶創建的活動等
    const currentUser = localStorage.getItem('username') || '用戶';
    
    // 暫時顯示提示訊息
    alert(`${currentUser}，我的活動功能正在開發中，敬請期待！\n\n您可以：\n• 瀏覽全部活動\n• 搜尋感興趣的活動\n• 報名參加活動`);
    
    // 可以在這裡實現實際的篩選邏輯
    // 例如：filterByUser(currentUser);
}