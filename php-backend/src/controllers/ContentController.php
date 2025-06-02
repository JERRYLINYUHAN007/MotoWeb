<?php
/**
 * 內容管理控制器
 * 處理文章、分類等內容管理功能
 */

class ContentController extends BaseController {
    
    /**
     * 獲取文章列表
     */
    public function getPosts($params = []) {
        $query_params = Router::getQueryParams();
        $pagination = $this->paginate($query_params);
        
        // 構建查詢條件
        $filter = [];
        
        if (!empty($query_params['category'])) {
            $filter['category'] = $query_params['category'];
        }
        
        if (!empty($query_params['status'])) {
            $filter['status'] = $query_params['status'];
        } else {
            $filter['status'] = 'published';
        }
        
        if (!empty($query_params['author'])) {
            $filter['author'] = $query_params['author'];
        }
        
        $options = [
            'limit' => $pagination['limit'],
            'skip' => $pagination['offset'],
            'sort' => ['created_at' => -1]
        ];
        
        $posts = $this->db->posts->find($filter, $options)->toArray();
        $total = $this->db->posts->countDocuments($filter);
        
        $this->jsonSuccess([
            'posts' => $posts,
            'pagination' => [
                'page' => $pagination['page'],
                'limit' => $pagination['limit'],
                'total' => $total,
                'pages' => ceil($total / $pagination['limit'])
            ]
        ]);
    }
    
    /**
     * 創建文章
     */
    public function createPost($params = []) {
        $user = $this->getCurrentUser();
        $data = Router::getRequestBody();
        
        $this->validateRequired($data, ['title', 'content', 'category']);
        
        $post = [
            '_id' => new MongoDB\BSON\ObjectId(),
            'title' => $this->sanitizeInput($data['title']),
            'content' => $data['content'], // 保留 HTML 格式
            'summary' => $this->sanitizeInput($data['summary'] ?? ''),
            'category' => $this->sanitizeInput($data['category']),
            'tags' => array_map([$this, 'sanitizeInput'], $data['tags'] ?? []),
            'author' => $user['user_id'],
            'author_name' => $user['username'],
            'status' => $data['status'] ?? 'draft',
            'featured_image' => $data['featured_image'] ?? null,
            'meta_description' => $this->sanitizeInput($data['meta_description'] ?? ''),
            'views' => 0,
            'likes' => 0,
            'comments_count' => 0,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];
        
        $result = $this->db->posts->insertOne($post);
        
        if ($result->getInsertedCount()) {
            // 記錄活動
            $this->logActivity($user['user_id'], 'post_create', 'post', (string)$post['_id'], [
                'title' => $post['title'],
                'category' => $post['category']
            ]);
            
            $this->jsonSuccess([
                'post_id' => (string)$post['_id'],
                'title' => $post['title'],
                'status' => $post['status']
            ], 'Post created successfully', 201);
        } else {
            $this->jsonError('Failed to create post', 500);
        }
    }
    
    /**
     * 更新文章
     */
    public function updatePost($params = []) {
        $user = $this->getCurrentUser();
        $data = Router::getRequestBody();
        
        if (!isset($params['id'])) {
            $this->jsonError('Post ID required', 400);
        }
        
        try {
            $post_id = new MongoDB\BSON\ObjectId($params['id']);
        } catch (Exception $e) {
            $this->jsonError('Invalid post ID', 400);
        }
        
        // 檢查文章是否存在
        $existing_post = $this->db->posts->findOne(['_id' => $post_id]);
        
        if (!$existing_post) {
            $this->jsonError('Post not found', 404);
        }
        
        // 檢查權限
        if ($existing_post['author'] !== $user['user_id'] && $user['role'] !== 'admin') {
            $this->jsonError('Permission denied', 403);
        }
        
        $update_data = [];
        
        if (isset($data['title'])) {
            $update_data['title'] = $this->sanitizeInput($data['title']);
        }
        
        if (isset($data['content'])) {
            $update_data['content'] = $data['content'];
        }
        
        if (isset($data['summary'])) {
            $update_data['summary'] = $this->sanitizeInput($data['summary']);
        }
        
        if (isset($data['category'])) {
            $update_data['category'] = $this->sanitizeInput($data['category']);
        }
        
        if (isset($data['tags'])) {
            $update_data['tags'] = array_map([$this, 'sanitizeInput'], $data['tags']);
        }
        
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }
        
        if (isset($data['featured_image'])) {
            $update_data['featured_image'] = $data['featured_image'];
        }
        
        if (isset($data['meta_description'])) {
            $update_data['meta_description'] = $this->sanitizeInput($data['meta_description']);
        }
        
        $update_data['updated_at'] = new MongoDB\BSON\UTCDateTime();
        
        $result = $this->db->posts->updateOne(
            ['_id' => $post_id],
            ['$set' => $update_data]
        );
        
        if ($result->getModifiedCount()) {
            // 記錄活動
            $this->logActivity($user['user_id'], 'post_update', 'post', $params['id'], [
                'updated_fields' => array_keys($update_data)
            ]);
            
            $this->jsonSuccess(null, 'Post updated successfully');
        } else {
            $this->jsonError('No changes made or update failed', 400);
        }
    }
    
    /**
     * 刪除文章
     */
    public function deletePost($params = []) {
        $user = $this->getCurrentUser();
        
        if (!isset($params['id'])) {
            $this->jsonError('Post ID required', 400);
        }
        
        try {
            $post_id = new MongoDB\BSON\ObjectId($params['id']);
        } catch (Exception $e) {
            $this->jsonError('Invalid post ID', 400);
        }
        
        // 檢查文章是否存在
        $existing_post = $this->db->posts->findOne(['_id' => $post_id]);
        
        if (!$existing_post) {
            $this->jsonError('Post not found', 404);
        }
        
        // 檢查權限
        if ($existing_post['author'] !== $user['user_id'] && $user['role'] !== 'admin') {
            $this->jsonError('Permission denied', 403);
        }
        
        $result = $this->db->posts->deleteOne(['_id' => $post_id]);
        
        if ($result->getDeletedCount()) {
            // 記錄活動
            $this->logActivity($user['user_id'], 'post_delete', 'post', $params['id'], [
                'title' => $existing_post['title']
            ]);
            
            $this->jsonSuccess(null, 'Post deleted successfully');
        } else {
            $this->jsonError('Failed to delete post', 500);
        }
    }
    
    /**
     * 獲取分類列表
     */
    public function getCategories($params = []) {
        $categories = $this->db->categories->find()->toArray();
        
        $this->jsonSuccess($categories);
    }
    
    /**
     * 創建分類
     */
    public function createCategory($params = []) {
        $user = $this->checkPermission('admin');
        $data = Router::getRequestBody();
        
        $this->validateRequired($data, ['name', 'slug']);
        
        // 檢查分類是否已存在
        $existing = $this->db->categories->findOne(['slug' => $data['slug']]);
        
        if ($existing) {
            $this->jsonError('Category with this slug already exists', 400);
        }
        
        $category = [
            '_id' => new MongoDB\BSON\ObjectId(),
            'name' => $this->sanitizeInput($data['name']),
            'slug' => $this->sanitizeInput($data['slug']),
            'description' => $this->sanitizeInput($data['description'] ?? ''),
            'parent_id' => $data['parent_id'] ?? null,
            'order' => intval($data['order'] ?? 0),
            'is_active' => $data['is_active'] ?? true,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'created_by' => $user['user_id']
        ];
        
        $result = $this->db->categories->insertOne($category);
        
        if ($result->getInsertedCount()) {
            $this->jsonSuccess([
                'category_id' => (string)$category['_id'],
                'name' => $category['name'],
                'slug' => $category['slug']
            ], 'Category created successfully', 201);
        } else {
            $this->jsonError('Failed to create category', 500);
        }
    }
}
?> 