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
function openEventDetails(eventId) {
    // 在實際應用中，這裡應該從API獲取特定ID的活動詳情
    // 這裡模擬獲取活動詳情
    
    // 使用loadEvents中定義的事件數據（實際應該從API獲取）
    const events = [
        {
            id: 1,
            title: '2025春季改裝盛會',
            image: 'images/events/event1.jpg',
            date: '2025-04-15',
            time: '09:00 - 17:00',
            location: '台北南港展覽館',
            address: '台北市南港區研究院路一段1號',
            organizer: 'MotoMod官方',
            type: 'exhibition',
            description: '一年一度的春季改裝展即將登場，現場將展示最新改裝零件與成品車，並有多場專業講座與互動展示。適合所有摩托車愛好者參加，無論您是改裝新手還是老手，都能在活動中獲得寶貴的經驗與知識。<br><br>活動亮點：<ul><li>最新改裝零件展示區</li><li>成品車展示與評選</li><li>專業技師現場諮詢</li><li>改裝技術講座</li><li>互動體驗區</li><li>限量周邊商品</li></ul>',
            capacity: 500,
            registered: 128,
            fee: 300,
            deadline: '2025-04-10',
            status: 'open',
            schedule: [
                {
                    time: '09:00 - 10:00',
                    title: '開幕式',
                    description: '開幕致詞與活動介紹'
                },
                {
                    time: '10:00 - 12:00',
                    title: '零件展示區開放',
                    description: '各大廠商展示最新改裝零件'
                },
                {
                    time: '12:00 - 13:00',
                    title: '午餐時間',
                    description: '現場有多家美食攤位'
                },
                {
                    time: '13:00 - 15:00',
                    title: '改裝技術講座',
                    description: '由專業技師主講各類改裝技術'
                },
                {
                    time: '15:00 - 16:30',
                    title: '成品車評選',
                    description: '評選最佳改裝車輛'
                },
                {
                    time: '16:30 - 17:00',
                    title: '閉幕式與頒獎',
                    description: '頒發評選獎項與抽獎活動'
                }
            ],
            speakers: [
                {
                    name: '王大明',
                    title: '資深改裝技師',
                    avatar: 'images/avatars/speaker1.jpg',
                    description: '擁有15年改裝經驗，專精於排氣系統與動力提升。'
                },
                {
                    name: '李小華',
                    title: '懸吊系統專家',
                    avatar: 'images/avatars/speaker2.jpg',
                    description: '曾任職於多家國際知名懸吊品牌，現為獨立技術顧問。'
                },
                {
                    name: '張明德',
                    title: '電控系統工程師',
                    avatar: 'images/avatars/speaker3.jpg',
                    description: '專精於摩托車電子系統調校，擁有多項相關專利。'
                }
            ],
            organizer_info: {
                name: 'MotoMod官方',
                avatar: 'images/logo.svg',
                description: 'MotoMod是台灣最大的摩托車改裝社群平台，致力於推廣摩托車文化與技術交流。',
                website: 'https://www.motomod.com',
                email: 'event@motomod.com',
                phone: '(02) 1234-5678'
            },
            tickets: [
                {
                    id: 'early',
                    name: '早鳥票',
                    price: 200,
                    description: '限時優惠票種，提前報名享優惠',
                    remaining: 0,
                    soldOut: true
                },
                {
                    id: 'regular',
                    name: '一般票',
                    price: 300,
                    description: '標準票價，享有所有活動權益',
                    remaining: 372,
                    soldOut: false
                },
                {
                    id: 'vip',
                    name: 'VIP票',
                    price: 800,
                    description: '包含專屬休息區、限量贈品與講師會面機會',
                    remaining: 25,
                    soldOut: false
                }
            ]
        },
        // 若有更多事件，可以在此添加
    ];
    
    // 找到指定ID的活動
    const event = events.find(e => e.id == eventId) || events[0]; // 預設使用第一個活動
    
    // 更新模態框內容
    document.getElementById('eventBanner').src = event.image;
    document.getElementById('eventBanner').alt = event.title;
    document.getElementById('eventTitle').textContent = event.title;
    
    // 更新活動標籤
    const eventBadges = document.getElementById('eventBadges');
    eventBadges.innerHTML = '';
    
    // 翻譯活動類型
    const typeNames = {
        'workshop': '改裝工作坊',
        'competition': '改裝比賽',
        'meetup': '車友聚會',
        'seminar': '技術講座',
        'exhibition': '展覽活動'
    };
    
    const typeBadge = document.createElement('div');
    typeBadge.className = `event-badge-large ${event.type}`;
    typeBadge.textContent = typeNames[event.type];
    eventBadges.appendChild(typeBadge);
    
    // 更新活動元數據
    document.getElementById('eventDate').textContent = formatDate(event.date);
    document.getElementById('eventTime').textContent = event.time;
    document.getElementById('eventLocation').textContent = `${event.location} (${event.address})`;
    document.getElementById('eventOrganizer').textContent = event.organizer;
    
    // 更新活動描述
    document.getElementById('eventDescription').innerHTML = event.description;
    
    // 更新活動議程
    const eventSchedule = document.getElementById('eventSchedule');
    eventSchedule.innerHTML = '';
    
    if (event.schedule && event.schedule.length > 0) {
        event.schedule.forEach(item => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-content">
                    <div class="schedule-title">${item.title}</div>
                    <div class="schedule-description">${item.description}</div>
                </div>
            `;
            eventSchedule.appendChild(scheduleItem);
        });
    } else {
        eventSchedule.innerHTML = '<p>暫無詳細議程</p>';
    }
    
    // 更新講者資訊
    const eventSpeakers = document.getElementById('eventSpeakers');
    eventSpeakers.innerHTML = '';
    
    if (event.speakers && event.speakers.length > 0) {
        event.speakers.forEach(speaker => {
            const speakerCard = document.createElement('div');
            speakerCard.className = 'speaker-card';
            speakerCard.innerHTML = `
                <img src="${speaker.avatar}" alt="${speaker.name}" class="speaker-avatar">
                <div class="speaker-info">
                    <div class="speaker-name">${speaker.name}</div>
                    <div class="speaker-title">${speaker.title}</div>
                    <p>${speaker.description}</p>
                </div>
            `;
            eventSpeakers.appendChild(speakerCard);
        });
    } else {
        eventSpeakers.innerHTML = '<p>暫無講者資訊</p>';
    }
    
    // 更新地點資訊（假設使用靜態圖片替代地圖）
    const eventLocationMap = document.getElementById('eventLocationMap');
    eventLocationMap.innerHTML = `
        <div style="background-color: #f8f9fa; padding: 1rem; text-align: center;">
            <p><i class="fas fa-map-marked-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i></p>
            <p><strong>${event.location}</strong></p>
            <p>${event.address}</p>
            <p><small>在實際應用中，這裡應該顯示Google地圖或其他地圖服務</small></p>
        </div>
    `;
    
    // 更新報名資訊
    document.getElementById('registrationStatus').textContent = getStatusText(event.status);
    document.getElementById('registrationStatus').className = `registration-status ${event.status}`;
    
    document.getElementById('registrationDetails').innerHTML = `
        <p>請於截止日期前完成報名，名額有限，額滿為止。</p>
        <p>報名成功後，將收到確認電子郵件，請於活動當天出示QR碼報到。</p>
    `;
    
    document.getElementById('priceInfo').textContent = event.fee > 0 ? `NT$ ${event.fee}` : '免費';
    document.getElementById('priceInfo').className = event.fee > 0 ? 'price-info' : 'price-info free';
    
    document.getElementById('remainingSpots').innerHTML = `
        <div>剩餘名額：${event.capacity - event.registered}/${event.capacity}</div>
        <div class="spots-progress">
            <div class="spots-bar" style="width: ${(event.registered / event.capacity) * 100}%"></div>
        </div>
    `;
    
    document.getElementById('registrationDeadline').textContent = `報名截止日期：${formatDate(event.deadline)}`;
    
    // 更新按鈕狀態
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = event.status === 'closed';
    registerBtn.textContent = event.status === 'closed' ? '報名已截止' : '立即報名';
    registerBtn.dataset.eventId = event.id;
    
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    addCalendarBtn.dataset.eventId = event.id;
    
    const shareEventBtn = document.getElementById('shareEventBtn');
    shareEventBtn.dataset.eventId = event.id;
    
    // 更新主辦方資訊
    const organizerInfo = document.getElementById('organizerInfo');
    
    if (event.organizer_info) {
        organizerInfo.innerHTML = `
            <div class="organizer-info">
                <img src="${event.organizer_info.avatar}" alt="${event.organizer_info.name}" class="organizer-avatar">
                <div>
                    <div class="organizer-name">${event.organizer_info.name}</div>
                </div>
            </div>
            <p>${event.organizer_info.description}</p>
            <div class="organizer-meta">
                <a href="${event.organizer_info.website}" target="_blank"><i class="fas fa-globe"></i> 官方網站</a>
                <a href="mailto:${event.organizer_info.email}"><i class="fas fa-envelope"></i> ${event.organizer_info.email}</a>
                <a href="tel:${event.organizer_info.phone}"><i class="fas fa-phone"></i> ${event.organizer_info.phone}</a>
            </div>
        `;
    } else {
        organizerInfo.innerHTML = `
            <div class="organizer-info">
                <div class="organizer-avatar" style="background-color: #e9ecef; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 1.5rem; color: #6c757d;"></i>
                </div>
                <div>
                    <div class="organizer-name">${event.organizer}</div>
                </div>
            </div>
            <p>暫無詳細資訊</p>
        `;
    }
    
    // 激活第一個頁籤
    document.querySelectorAll('.event-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.event-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.event-tab[data-tab="description"]').classList.add('active');
    document.getElementById('tab-description').classList.add('active');
    
    // 打開模態框
    const eventModal = document.getElementById('eventModal');
    eventModal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
        // 模擬報名提交成功
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
function openRegistrationForm(eventId) {
    // 在實際應用中，這裡應該從API獲取活動和票種資訊
    // 這裡使用模擬資料
    
    // 使用前面定義的活動資料
    const event = {
        id: eventId,
        title: '2025春季改裝盛會',
        tickets: [
            {
                id: 'early',
                name: '早鳥票',
                price: 200,
                description: '限時優惠票種，提前報名享優惠',
                remaining: 0,
                soldOut: true
            },
            {
                id: 'regular',
                name: '一般票',
                price: 300,
                description: '標準票價，享有所有活動權益',
                remaining: 372,
                soldOut: false
            },
            {
                id: 'vip',
                name: 'VIP票',
                price: 800,
                description: '包含專屬休息區、限量贈品與講師會面機會',
                remaining: 25,
                soldOut: false
            }
        ]
    };
    
    // 更新表單標題
    document.getElementById('registrationEventTitle').textContent = event.title;
    
    // 更新票種選項
    const ticketOptions = document.getElementById('ticketOptions');
    const ticketSelectionGroup = document.getElementById('ticketSelectionGroup');
    
    // 清空票種容器
    ticketOptions.innerHTML = '';
    
    // 如果有票種，顯示票種選擇區域
    if (event.tickets && event.tickets.length > 0) {
        ticketSelectionGroup.style.display = 'block';
        
        // 加入票種選項
        event.tickets.forEach(ticket => {
            const ticketOption = document.createElement('div');
            ticketOption.className = `ticket-option ${ticket.soldOut ? 'sold-out' : ''}`;
            
            ticketOption.innerHTML = `
                <input type="radio" name="ticket" id="ticket-${ticket.id}" value="${ticket.id}" class="ticket-radio" ${ticket.soldOut ? 'disabled' : ''}>
                <div class="ticket-info">
                    <div class="ticket-name">${ticket.name}</div>
                    <div class="ticket-description">${ticket.description}</div>
                    <div class="ticket-meta">
                        <div class="ticket-price">NT$ ${ticket.price}</div>
                        <div class="ticket-remains">${ticket.soldOut ? '已售完' : `剩餘 ${ticket.remaining} 張`}</div>
                    </div>
                </div>
            `;
            
            ticketOptions.appendChild(ticketOption);
        });
    } else {
        // 如果沒有票種，隱藏票種選擇區域
        ticketSelectionGroup.style.display = 'none';
    }
    
    // 重置表單
    document.getElementById('registrationForm').reset();
    
    // 開啟模態框
    const registrationModal = document.getElementById('registrationModal');
    registrationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * 提交報名表單
 */
function submitRegistration() {
    // 在實際應用中，這裡應該向API發送報名資訊
    // 模擬資料處理延遲
    const submitBtn = document.getElementById('submitRegistrationBtn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
    
    setTimeout(() => {
        // 關閉報名模態框
        const registrationModal = document.getElementById('registrationModal');
        registrationModal.classList.remove('active');
        
        // 顯示成功模態框
        const successModal = document.getElementById('successModal');
        document.getElementById('successTitle').textContent = '報名成功';
        document.getElementById('successMessage').textContent = '您已成功報名活動，確認信將發送至您的電子郵件。';
        
        successModal.classList.add('active');
        
        // 重置按鈕狀態
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }, 1500);
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
            return;
        }
        
        // 顯示載入中狀態
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = `
            <div class="events-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>搜尋中...</span>
            </div>
        `;
        
        // 更新列表視圖
        const eventsTableBody = document.getElementById('eventsTableBody');
        eventsTableBody.innerHTML = '';
        
        // 模擬搜尋延遲
        setTimeout(() => {
            // 在實際應用中，這裡應該向API發送搜尋請求
            // 模擬搜尋結果
            if (Math.random() > 0.3) {
                // 有找到結果
                loadEvents();
            } else {
                // 沒有找到結果
                eventsGrid.innerHTML = `
                    <div class="no-events">
                        <i class="fas fa-search"></i>
                        <p>找不到符合「${searchTerm}」的活動</p>
                        <button class="btn btn-outline" id="clearSearchBtn">清除搜尋</button>
                    </div>
                `;
                
                eventsTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="no-events">
                                <p>找不到符合「${searchTerm}」的活動</p>
                            </div>
                        </td>
                    </tr>
                `;
                
                // 綁定清除搜尋按鈕
                document.getElementById('clearSearchBtn').addEventListener('click', function() {
                    searchInput.value = '';
                    loadEvents();
                });
            }
        }, 1000);
    }
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
            // 在實際應用中，這裡應該向API請求更多活動
            // 這裡僅模擬載入更多活動
            loadMoreEvents();
            
            // 恢復按鈕狀態
            this.innerHTML = '<i class="fas fa-sync"></i> 載入更多活動';
            this.disabled = false;
        }, 1500);
    });
    
    /**
     * 載入更多活動
     */
    function loadMoreEvents() {
        // 在實際應用中，這裡應該向API請求更多活動
        // 模擬新增3個活動
        const eventsGrid = document.getElementById('eventsGrid');
        const eventsTableBody = document.getElementById('eventsTableBody');
        
        // 模擬新活動資料
        for (let i = 0; i < 3; i++) {
            const eventCard = document.createElement('article');
            eventCard.className = 'event-card';
            eventCard.dataset.id = Math.floor(Math.random() * 100) + 10;
            
            // 隨機活動類型
            const types = ['workshop', 'competition', 'meetup', 'seminar', 'exhibition'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            // 翻譯活動類型
            const typeNames = {
                'workshop': '改裝工作坊',
                'competition': '改裝比賽',
                'meetup': '車友聚會',
                'seminar': '技術講座',
                'exhibition': '展覽活動'
            };
            
            // 隨機日期（未來30天內）
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
            const day = futureDate.getDate();
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            const month = monthNames[futureDate.getMonth()];
            
            // 隨機標題
            const titles = [
                '輪胎選擇與保養講座',
                '車身彩繪設計大賽',
                '引擎調校進階班',
                '東部車友交流會',
                '電子系統改裝展示會',
                '冒險車系改裝研討會'
            ];
            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            
            // 隨機地點
            const locations = [
                '台北技術學院',
                '高雄展覽中心',
                '台中車友俱樂部',
                '新竹科學園區',
                '花蓮海濱車場',
                '台南文創園區'
            ];
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            
            // 建立卡片HTML
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="images/events/event${Math.floor(Math.random() * 6) + 1}.jpg" alt="${randomTitle}">
                    <div class="event-date">
                        <span class="date">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="event-badge ${randomType}">${typeNames[randomType]}</div>
                </div>
                <div class="event-content">
                    <h3>${randomTitle}</h3>
                    <div class="event-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${randomLocation}</span>
                        <span><i class="fas fa-clock"></i> ${Math.floor(Math.random() * 12) + 8}:00 - ${Math.floor(Math.random() * 6) + 14}:00</span>
                    </div>
                    <p>這是一個模擬的活動描述，實際活動內容請參考詳情頁面...</p>
                    <div class="event-footer">
                        <button class="btn btn-primary view-event-btn" data-id="${eventCard.dataset.id}">查看詳情</button>
                        <div class="event-stats">
                            <span><i class="fas fa-user"></i> ${Math.floor(Math.random() * 50) + 10}/${Math.floor(Math.random() * 50) + 60}</span>
                            <span><i class="fas fa-heart"></i> ${Math.floor(Math.random() * 100) + 10}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // 綁定查看詳情按鈕
            const viewBtn = eventCard.querySelector('.view-event-btn');
            viewBtn.addEventListener('click', function() {
                openEventDetails(this.dataset.id);
            });
            
            // 添加到網格視圖
            eventsGrid.appendChild(eventCard);
            
            // 添加到列表視圖
            const formattedDate = `${futureDate.getFullYear()}-${(futureDate.getMonth() + 1).toString().padStart(2, '0')}-${futureDate.getDate().toString().padStart(2, '0')}`;
            const eventRow = document.createElement('tr');
            eventRow.innerHTML = `
                <td>${formattedDate}</td>
                <td>
                    <div class="table-event-title">
                        <span class="table-event-badge ${randomType}"></span>
                        ${randomTitle}
                    </div>
                </td>
                <td>${randomLocation}</td>
                <td>${typeNames[randomType]}</td>
                <td>${Math.floor(Math.random() * 50) + 10}/${Math.floor(Math.random() * 50) + 60}</td>
                <td>
                    <div class="table-actions">
                        <button class="view-btn" data-id="${eventCard.dataset.id}" aria-label="查看詳情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="register-btn" data-id="${eventCard.dataset.id}" aria-label="報名">
                            <i class="fas fa-user-plus"></i>
                        </button>
                        <button class="calendar-btn" data-id="${eventCard.dataset.id}" aria-label="加入行事曆">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // 綁定表格按鈕事件
            const tableViewBtn = eventRow.querySelector('.view-btn');
            tableViewBtn.addEventListener('click', function() {
                openEventDetails(this.dataset.id);
            });
            
            const tableRegisterBtn = eventRow.querySelector('.register-btn');
            tableRegisterBtn.addEventListener('click', function() {
                openRegistrationForm(this.dataset.id);
            });
            
            const tableCalendarBtn = eventRow.querySelector('.calendar-btn');
            tableCalendarBtn.addEventListener('click', function() {
                addToCalendar(this.dataset.id);
            });
            
            eventsTableBody.appendChild(eventRow);
        }
        
        // 模擬已載入全部
        if (Math.random() < 0.3) {
            loadMoreBtn.innerHTML = '已載入全部活動';
            loadMoreBtn.disabled = true;
        }
    }
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
        
        // 模擬載入延遲
        setTimeout(() => {
            // 重新載入活動
            loadEvents();
        }, 800);
    }
}

/**
 * 加入行事曆功能
 * @param {string} eventId - 活動ID
 */
function addToCalendar(eventId) {
    // 在實際應用中，這裡應該獲取活動詳情
    // 模擬加入Google行事曆的功能（實際應該使用API）
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

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initEventsPage();
});

/**
 * 初始化活動頁面
 */
function initEventsPage() {
    // 初始化視圖切換
    initViewToggle();
    
    // 初始化篩選功能
    initFilters();
    
    // 初始化日曆功能
    initCalendar();
    
    // 載入活動資料
    loadEvents();
    
    // 初始化活動詳情功能
    initEventDetails();
    
    // 初始化報名功能
    initRegistration();
    
    // 初始化活動創建功能
    initCreateEvent();
    
    // 初始化搜尋功能
    initSearchFunction();
    
    // 初始化載入更多功能
    initLoadMore();
    
    // 初始化分類卡片功能
    initCategoryCards();
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
        // 在實際應用中，應該向API發送請求獲取篩選後的資料
        // 這裡模擬篩選操作
        
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
        
        // 模擬載入延遲
        setTimeout(() => {
            // 重新載入活動
            loadEvents();
        }, 800);
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
        
        // 模擬載入延遲
        setTimeout(() => {
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
                        
                        // 新增該日期的活動（模擬數據）
                        if (dayCount % 3 === 0) {
                            const eventsContainer = document.createElement('div');
                            eventsContainer.className = 'calendar-events';
                            
                            // 添加1-3個活動
                            const eventCount = Math.floor(Math.random() * 3) + 1;
                            for (let i = 0; i < eventCount; i++) {
                                const eventType = getRandomEventType();
                                const eventElement = document.createElement('div');
                                eventElement.className = `calendar-event ${eventType}`;
                                eventElement.textContent = getEventName(eventType);
                                eventElement.dataset.eventId = Math.floor(Math.random() * 10) + 1;
                                
                                // 點擊活動打開詳情
                                eventElement.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    openEventDetails(this.dataset.eventId);
                                });
                                
                                eventsContainer.appendChild(eventElement);
                            }
                            
                            dayCell.appendChild(eventsContainer);
                        }
                        
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
        }, 500);
    }
    
    /**
     * 獲取隨機活動類型
     * @returns {string} 活動類型
     */
    function getRandomEventType() {
        const types = ['workshop', 'competition', 'meetup', 'seminar', 'exhibition'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * 根據活動類型獲取活動名稱
     * @param {string} type - 活動類型
     * @returns {string} 活動名稱
     */
    function getEventName(type) {
        switch (type) {
            case 'workshop':
                return '排氣管改裝工作坊';
            case 'competition':
                return '年度改裝大賽';
            case 'meetup':
                return '北區車友聚會';
            case 'seminar':
                return '懸吊調校講座';
            case 'exhibition':
                return '春季改裝展';
            default:
                return '摩托車活動';
        }
    }
}

/**
 * 載入活動資料
 */
function loadEvents() {
    // 顯示載入中
    const eventGrid = document.querySelector('.events-grid');
    const eventList = document.querySelector('.events-list');
    
    if (eventGrid) {
        eventGrid.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> 載入中...</div>';
    }
    
    if (eventList) {
        eventList.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> 載入中...</div>';
    }
    
    // 構建查詢參數
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;
    const type = urlParams.get('type') || '';
    const search = urlParams.get('search') || '';
    const startDate = urlParams.get('startDate') || '';
    const endDate = urlParams.get('endDate') || '';
    
    // 從 API 獲取活動列表
    fetch(`/api/events?page=${page}&type=${type}&search=${search}&startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || '獲取活動列表失敗');
                });
            }
            return response.json();
        })
        .then(data => {
            // 渲染活動到網格視圖和列表視圖
            if (data.events && data.events.length > 0) {
                renderEventsGrid(data.events);
                renderEventsList(data.events);
                renderPagination(data.page, data.totalPages);
            } else {
                if (eventGrid) {
                    eventGrid.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <h3>暫無活動</h3>
                            <p>目前沒有符合條件的活動</p>
                        </div>
                    `;
                }
                
                if (eventList) {
                    eventList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <h3>暫無活動</h3>
                            <p>目前沒有符合條件的活動</p>
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (eventGrid) {
                eventGrid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>載入失敗</h3>
                        <p>${error.message || '獲取活動列表失敗，請稍後再試'}</p>
                        <button class="btn btn-outline retry-btn">重試</button>
                    </div>
                `;
            }
            
            if (eventList) {
                eventList.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>載入失敗</h3>
                        <p>${error.message || '獲取活動列表失敗，請稍後再試'}</p>
                        <button class="btn btn-outline retry-btn">重試</button>
                    </div>
                `;
            }
            
            // 綁定重試按鈕
            document.querySelectorAll('.retry-btn').forEach(btn => {
                btn.addEventListener('click', loadEvents);
            });
        });
}

/**
 * 渲染活動網格
 * @param {Array} events - 活動資料陣列
 */
function renderEventsGrid(events)