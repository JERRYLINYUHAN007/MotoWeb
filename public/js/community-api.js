class CommunityAPI {
    constructor() {
        this.baseURL = '/api';
    }

    // 獲取貼文列表
    async getPosts(options = {}) {
        try {
            const params = new URLSearchParams();
            
            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);
            if (options.category) params.append('category', options.category);
            if (options.search) params.append('search', options.search);
            if (options.tag) params.append('tag', options.tag);
            
            const response = await fetch(`${this.baseURL}/posts?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取貼文失敗:', error);
            throw error;
        }
    }

    // 創建新貼文
    async createPost(postData) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${this.baseURL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(postData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '創建貼文失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('創建貼文失敗:', error);
            throw error;
        }
    }

    // 獲取分類統計
    async getCategoryStats() {
        try {
            const allPosts = await this.getPosts({ limit: 1000 }); // 獲取所有貼文來統計
            const categoryCounts = { all: allPosts.total };
            
            allPosts.posts.forEach(post => {
                if (!categoryCounts[post.category]) {
                    categoryCounts[post.category] = 0;
                }
                categoryCounts[post.category]++;
            });
            
            return categoryCounts;
        } catch (error) {
            console.error('獲取分類統計失敗:', error);
            return { all: 0 };
        }
    }

    // 搜尋貼文
    async searchPosts(searchTerm, options = {}) {
        return this.getPosts({
            ...options,
            search: searchTerm
        });
    }

    // 按分類過濾貼文
    async getPostsByCategory(category, options = {}) {
        return this.getPosts({
            ...options,
            category: category
        });
    }

    // 按標籤過濾貼文
    async getPostsByTag(tag, options = {}) {
        return this.getPosts({
            ...options,
            tag: tag
        });
    }

    // 獲取單篇貼文詳情
    async getPostById(postId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${postId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('文章不存在');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取貼文詳情失敗:', error);
            throw error;
        }
    }

    // 添加留言
    async addComment(postId, content) {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('請先登錄再留言');
            }
            
            const response = await fetch(`${this.baseURL}/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '添加留言失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('添加留言失敗:', error);
            throw error;
        }
    }

    // 點讚/取消點讚
    async toggleLike(postId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${this.baseURL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '點讚失敗');
            }
            
            return await response.json();
        } catch (error) {
            console.error('點讚失敗:', error);
            throw error;
        }
    }
} 