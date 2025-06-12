/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
class EventsAPI {
    constructor() {
        this.baseURL = '/api';
    }

    // 獲取活動列表
    async getEvents(options = {}) {
        try {
            const params = new URLSearchParams();
            
            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);
            if (options.type) params.append('type', options.type);
            if (options.search) params.append('search', options.search);
            if (options.startDate) params.append('startDate', options.startDate);
            if (options.endDate) params.append('endDate', options.endDate);
            
            const response = await fetch(`${this.baseURL}/events?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取活動列表失敗:', error);
            throw error;
        }
    }

    // 獲取單個活動詳情
    async getEventById(eventId) {
        try {
            const response = await fetch(`${this.baseURL}/events/${eventId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('活動不存在');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取活動詳情失敗:', error);
            throw error;
        }
    }

    // 創建新活動
    async createEvent(eventData, imageFile = null) {
        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            Object.keys(eventData).forEach(key => {
                formData.append(key, eventData[key]);
            });
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await fetch(`${this.baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '創建活動失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('創建活動失敗:', error);
            throw error;
        }
    }

    // 報名參加活動
    async registerForEvent(eventId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${this.baseURL}/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '報名失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('報名活動失敗:', error);
            throw error;
        }
    }

    // 更新活動資訊
    async updateEvent(eventId, eventData, imageFile = null) {
        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            Object.keys(eventData).forEach(key => {
                formData.append(key, eventData[key]);
            });
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await fetch(`${this.baseURL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '更新活動失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('更新活動失敗:', error);
            throw error;
        }
    }

    // 獲取即將舉行的活動
    async getUpcomingEvents(limit = 10) {
        const today = new Date().toISOString().split('T')[0];
        return this.getEvents({
            limit,
            startDate: today
        });
    }

    // 獲取特定類型的活動
    async getEventsByType(type, options = {}) {
        return this.getEvents({
            ...options,
            type: type
        });
    }

    // 搜尋活動
    async searchEvents(searchTerm, options = {}) {
        return this.getEvents({
            ...options,
            search: searchTerm
        });
    }

    // 獲取活動統計資料
    async getEventStats() {
        try {
            // 如果後端沒有統計API，我們可以從活動列表計算
            const allEvents = await this.getEvents({ limit: 1000 });
            const stats = {
                total: allEvents.total || 0,
                upcoming: 0,
                byType: {}
            };
            
            const today = new Date();
            allEvents.events?.forEach(event => {
                const eventDate = new Date(event.eventDate);
                if (eventDate > today) {
                    stats.upcoming++;
                }
                
                if (!stats.byType[event.category]) {
                    stats.byType[event.category] = 0;
                }
                stats.byType[event.category]++;
            });
            
            return stats;
        } catch (error) {
            console.error('獲取活動統計失敗:', error);
            return { total: 0, upcoming: 0, byType: {} };
        }
    }

    // 格式化活動資料為前端需要的格式
    formatEventForDisplay(event) {
        const eventDate = new Date(event.eventDate);
        
        return {
            id: event._id,
            title: event.title,
            description: event.description,
            category: event.category,
            type: event.category, // 別名，保持與前端相容
            location: event.location,
            address: event.address,
            date: eventDate.toISOString().split('T')[0],
            time: this.formatTime(eventDate, event.endDate),
            eventDate: event.eventDate,
            endDate: event.endDate,
            organizer: event.organizer,
            organizerId: event.organizerId,
            image: event.imageUrl || '/images/events/default-event.jpg',
            imageUrl: event.imageUrl,
            attendees: event.attendees || [],
            maxAttendees: event.maxAttendees || 0,
            capacity: event.maxAttendees || 0, // 別名
            registered: event.registeredCount || 0,
            registeredCount: event.registeredCount || 0,
            fee: event.fee || 0,
            deadline: event.deadline,
            status: event.status || 'open',
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        };
    }

    // 格式化時間顯示
    formatTime(startDate, endDate) {
        const start = new Date(startDate);
        let timeStr = start.toTimeString().substring(0, 5);
        
        if (endDate) {
            const end = new Date(endDate);
            const endTime = end.toTimeString().substring(0, 5);
            timeStr += `-${endTime}`;
        }
        
        return timeStr;
    }

    // 獲取活動類型的中文名稱
    getTypeDisplayName(type) {
        const typeNames = {
            'workshop': '改裝工作坊',
            'competition': '改裝比賽',
            'meetup': '車友聚會',
            'seminar': '技術講座',
            'exhibition': '展覽活動'
        };
        return typeNames[type] || type;
    }
}

// 建立全域API實例
window.eventsAPI = new EventsAPI(); 