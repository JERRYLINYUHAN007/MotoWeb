/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
// API 基礎 URL
const API_BASE_URL = '/api';

// API 請求工具
const api = {
    // 通用請求方法
    async request(endpoint, options = {}) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '請求失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('API 請求錯誤:', error);
            throw error;
        }
    },

    // 認證相關
    auth: {
        async login(username, password) {
            return api.request('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        async register(userData) {
            return api.request('/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },

        async forgotPassword(email) {
            return api.request('/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
        },

        async resetPassword(token, password) {
            return api.request('/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });
        }
    },

    // 用戶相關
    user: {
        async getProfile() {
            return api.request('/user/profile');
        },

        async updateProfile(data) {
            return api.request('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        }
    },

    // 畫廊相關
    gallery: {
        async getFeatured() {
            return api.request('/gallery/featured');
        },

        async getAll(page = 1, limit = 10) {
            return api.request(`/gallery?page=${page}&limit=${limit}`);
        },

        async create(postData) {
            return api.request('/gallery', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        },

        async update(id, postData) {
            return api.request(`/gallery/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
        },

        async delete(id) {
            return api.request(`/gallery/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 車庫相關
    garage: {
        async getBikes() {
            return api.request('/garage');
        },

        async addBike(bikeData) {
            return api.request('/garage', {
                method: 'POST',
                body: JSON.stringify(bikeData)
            });
        },

        async updateBike(id, bikeData) {
            return api.request(`/garage/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bikeData)
            });
        },

        async deleteBike(id) {
            return api.request(`/garage/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 社群相關
    community: {
        async getPosts(page = 1, limit = 10) {
            return api.request(`/posts?page=${page}&limit=${limit}`);
        },

        async createPost(postData) {
            return api.request('/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        },

        async updatePost(id, postData) {
            return api.request(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
        },

        async deletePost(id) {
            return api.request(`/posts/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 圖片上傳
    async uploadImage(file, type = 'gallery') {
        const formData = new FormData();
        formData.append('image', file);

        return api.request(`/upload/${type}`, {
            method: 'POST',
            headers: {
                // 不設置 Content-Type，讓瀏覽器自動設置
            },
            body: formData
        });
    }
}; 