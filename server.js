const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');
const config = require('./config');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const crypto = require('crypto');

// 加載環境變數
dotenv.config();

// 初始化Express應用
const app = express();
const PORT = config.server.port;
const JWT_SECRET = process.env.JWT_SECRET || 'motomod_secret_key';

// MongoDB 連接
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/motoweb?retryWrites=true&w=majority';
let db;

// 啟用CORS
if (config.enableCors) {
  app.use(cors());
}

// 中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 額外的靜態檔案路由，確保絕對路徑能正確工作
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 文件上傳配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'gallery';
    const dir = path.join(__dirname, 'public', 'uploads', type);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|png|gif|jpg)$/)) {
      return cb(new Error('只允許上傳 JPG, PNG, GIF 格式的圖片!'), false);
    }
    cb(null, true);
  }
});

// 認證中間件
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未提供認證令牌' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await db.collection('users').findOne({ _id: ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ error: '使用者不存在' });
    }
    
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: '無效的認證令牌' });
  }
};

// 增強錯誤處理的連接函數
async function connectToDatabase() {
  let client;
  try {
    console.log('嘗試連接到 MongoDB...');
    console.log(`連接 URI: ${MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@')}`);
    
    // 設置連接選項，增加超時時間
    const options = { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    client = new MongoClient(MONGO_URI, options);
    await client.connect();
    console.log('MongoDB 連接成功！');
    db = client.db('motoweb');
    
    // 確保索引 - 使用 try-catch 避免重複創建索引錯誤
    try {
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('用戶索引創建警告:', error.message);
      }
    }
    
    // 文字搜尋索引 - 使用與修復腳本一致的名稱和配置
    try {
      await db.collection('showcases').createIndex(
        { title: 'text', description: 'text' },
        { name: 'showcases_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Showcases 索引創建警告:', error.message);
      }
    }
    
    try {
      await db.collection('products').createIndex(
        { name: 'text', description: 'text', brand: 'text', tags: 'text' },
        { 
          name: 'products_text_search',
          default_language: 'none',
          weights: { name: 10, brand: 5, description: 1, tags: 3 }
        }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Products 索引創建警告:', error.message);
      }
    }
    
    try {
      await db.collection('posts').createIndex(
        { title: 'text', content: 'text' },
        { name: 'posts_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Posts 索引創建警告:', error.message);
      }
    }
    
    try {
      await db.collection('events').createIndex(
        { title: 'text', description: 'text' },
        { name: 'events_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Events 索引創建警告:', error.message);
      }
    }
    
    // 畫廊集合索引
    try {
      await db.collection('galleries').createIndex({ 
        title: 'text', 
        description: 'text',
        model: 'text',
        tags: 'text'
      }, { name: 'galleries_text_search', default_language: 'none' });
      
      await db.collection('galleries').createIndex({ createdAt: -1 });
      await db.collection('galleries').createIndex({ 'stats.likes': -1 });
      await db.collection('galleries').createIndex({ category: 1 });
      await db.collection('galleries').createIndex({ style: 1 });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Galleries 索引創建警告:', error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('MongoDB 連接失敗!');
    console.error(`錯誤類型: ${error.name}`);
    console.error(`錯誤消息: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('無法連接到 MongoDB 服務器。請確保 MongoDB 服務正在運行。');
    } else if (error.message.includes('authentication failed')) {
      console.error('MongoDB 認證失敗。請檢查用戶名和密碼。');
    } else if (error.message.includes('TLSV1_ALERT_INTERNAL_ERROR') || error.message.includes('SSL')) {
      console.error('SSL/TLS 連接問題。如果使用 MongoDB Atlas，請確保您的 IP 已添加到 Network Access 白名單。');
      console.error('1. 登入 MongoDB Atlas');
      console.error('2. 點擊 Network Access');
      console.error('3. 點擊 Add IP Address');
      console.error('4. 添加您當前的 IP 地址，或暫時選擇 Allow Access from Anywhere (0.0.0.0/0)');
    }
    
    // 嘗試使用本地 MongoDB 作為備選
    if (MONGO_URI.includes('mongodb+srv')) {
      console.log('嘗試連接到本地 MongoDB 作為備選...');
      try {
        const localUri = 'mongodb://localhost:27017/motoweb';
        client = new MongoClient(localUri);
        await client.connect();
        console.log('成功連接到本地 MongoDB!');
        db = client.db('motoweb');
        return true;
      } catch (localError) {
        console.error('本地 MongoDB 連接也失敗:', localError.message);
        return false;
      }
    }
    
    return false;
  }
}

// 用戶相關 API
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: '所有欄位為必填' });
    }
    
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用戶名或電子郵件已被使用' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      profile: {
        avatar: '/images/default-avatar.png',
        bio: '',
        location: '',
        favoriteModels: [],
        social: {}
      }
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    const token = jwt.sign(
      { userId: result.insertedId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: result.insertedId,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用戶名和密碼為必填項' });
    }
    
    const user = await db.collection('users').findOne({
      $or: [
        { username },
        { email: username } // 允許使用電子郵件登入
      ]
    });
    
    if (!user) {
      return res.status(401).json({ error: '用戶名或密碼不正確' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用戶名或密碼不正確' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: '登入成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { password: 0 } }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { username, email, profile } = req.body;
    const updateData = {};
    
    if (username) {
      const existingUser = await db.collection('users').findOne({
        username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: '用戶名已被使用' });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      const existingUser = await db.collection('users').findOne({
        email,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: '電子郵件已被使用' });
      }
      
      updateData.email = email;
    }
    
    if (profile) {
      updateData.profile = profile;
    }
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updateData }
    );
    
    res.json({ message: '個人資料更新成功' });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const avatarPath = '/uploads/avatars/' + req.file.filename;
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { 'profile.avatar': avatarPath } }
    );
    
    res.json({
      message: '頭像更新成功',
      avatarPath
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 上傳個人資料封面圖片
app.post('/api/profile/cover', authenticate, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳文件' });
    }

    const coverPath = '/uploads/covers/' + req.file.filename;
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { 'profile.coverImage': coverPath } }
    );
    
    res.json({
      message: '封面圖片更新成功',
      coverPath
    });
  } catch (error) {
    console.error('更新封面圖片時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 改裝案例 API
app.get('/api/showcase', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    
    const query = search
      ? { $text: { $search: search } }
      : {};
    
    const total = await db.collection('showcases').countDocuments(query);
    const showcases = await db.collection('showcases')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    res.json({
      showcases,
      isLastPage: (page * perPage) >= total,
      total,
      page,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.get('/api/showcase/:id', async (req, res) => {
  try {
    const showcase = await db.collection('showcases').findOne({
      _id: ObjectId(req.params.id)
    });
    
    if (!showcase) {
      return res.status(404).json({ error: '找不到該改裝案例' });
    }
    
    res.json(showcase);
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/showcase', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, parts, specifications } = req.body;
    
    const images = req.files.map(file => '/uploads/showcase/' + file.filename);
    
    const newShowcase = {
      title,
      description,
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      parts: JSON.parse(parts || '[]'),
      specifications: JSON.parse(specifications || '{}'),
      images,
      beforeImage: images[0] || '',
      afterImage: images[1] || ''
    };
    
    const result = await db.collection('showcases').insertOne(newShowcase);
    
    res.status(201).json({
      message: '改裝案例創建成功',
      showcaseId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/showcase/:id/like', authenticate, async (req, res) => {
  try {
    const showcaseId = req.params.id;
    
    // 檢查用戶是否已經點讚
    const liked = await db.collection('likes').findOne({
      userId: req.user._id,
      showcaseId: ObjectId(showcaseId),
      type: 'showcase'
    });
    
    if (liked) {
      return res.status(400).json({ error: '您已經點讚過了' });
    }
    
    // 添加點讚記錄
    await db.collection('likes').insertOne({
      userId: req.user._id,
      showcaseId: ObjectId(showcaseId),
      type: 'showcase',
      createdAt: new Date()
    });
    
    // 更新點讚計數
    await db.collection('showcases').updateOne(
      { _id: ObjectId(showcaseId) },
      { $inc: { likes: 1 } }
    );
    
    res.json({ message: '點讚成功' });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/showcase/:id/comment', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '評論內容不能為空' });
    }
    
    const comment = {
      _id: new ObjectId(),
      content,
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date()
    };
    
    await db.collection('showcases').updateOne(
      { _id: ObjectId(req.params.id) },
      { 
        $push: { comments: comment },
        $inc: { commentCount: 1 }
      }
    );
    
    res.status(201).json({
      message: '評論發布成功',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 產品相關 API
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null;
    const brand = req.query.brand;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      
      if (minPrice !== null) {
        query.price.$gte = minPrice;
      }
      
      if (maxPrice !== null) {
        query.price.$lte = maxPrice;
      }
    }
    
    const total = await db.collection('products').countDocuments(query);
    const products = await db.collection('products')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    res.json({
      products,
      isLastPage: (page * perPage) >= total,
      total,
      page,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 社群文章相關 API
app.get('/api/posts', async (req, res) => {
  try {
    console.log('API /api/posts 被調用');
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const tag = req.query.tag;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    console.log('查詢條件:', query);
    
    const total = await db.collection('posts').countDocuments(query);
    console.log('總文章數:', total);
    
    const posts = await db.collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    console.log('找到的文章數:', posts.length);
    
    res.json({
      posts,
      isLastPage: (page * perPage) >= total,
      total,
      page,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    console.error('API錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: '標題、內容和分類為必填項' });
    }
    
    const newPost = {
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      commentCount: 0,
      views: 0
    };
    
    const result = await db.collection('posts').insertOne(newPost);
    
    res.status(201).json({
      message: '文章發布成功',
      postId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取單篇社群文章詳情
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: '無效的文章ID' });
    }
    
    const post = await db.collection('posts').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加瀏覽次數
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    // 生成摘要（如果沒有的話）
    if (!post.excerpt) {
      const textContent = post.content.replace(/<[^>]*>/g, ''); // 移除HTML標籤
      post.excerpt = textContent.length > 150 
        ? textContent.substring(0, 150) + '...' 
        : textContent;
    }
    
    // 設置默認頭像
    if (!post.avatar) {
      post.avatar = 'images/avatars/default-user.svg';
    }
    
    res.json(post);
  } catch (error) {
    console.error('獲取文章詳情時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 活動相關 API
app.post('/api/events', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      address, 
      eventDate, 
      eventTime, 
      eventEndDate, 
      eventEndTime, 
      capacity, 
      fee, 
      deadline, 
      type 
    } = req.body;
    
    // 驗證必要字段
    if (!title || !location || !eventDate) {
      return res.status(400).json({ error: '標題、地點與活動日期為必填項' });
    }
    
    // 處理圖片路徑
    let imageUrl = '/images/events/default-event.jpg'; // 默認圖片
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }
    
    // 處理時間
    const startDateTime = eventTime 
      ? new Date(`${eventDate}T${eventTime}`) 
      : new Date(`${eventDate}T00:00:00`);
      
    const endDateTime = eventEndDate 
      ? (eventEndTime 
        ? new Date(`${eventEndDate}T${eventEndTime}`) 
        : new Date(`${eventEndDate}T23:59:59`))
      : (eventTime 
        ? new Date(`${eventDate}T${eventTime}`) 
        : new Date(`${eventDate}T23:59:59`));
    
    // 創建活動資料
    const event = {
      title,
      description,
      category: type,
      location,
      address: address || location,
      eventDate: startDateTime,
      endDate: endDateTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizer: req.user.username,
      organizerId: req.user._id,
      imageUrl,
      attendees: [],
      maxAttendees: capacity ? parseInt(capacity) : 0,
      registeredCount: 0,
      fee: fee ? parseFloat(fee) : 0,
      deadline: deadline ? new Date(deadline) : new Date(startDateTime),
      status: new Date() < new Date(deadline || startDateTime) ? 'open' : 'closed'
    };
    
    // 保存到數據庫
    const result = await db.collection('events').insertOne(event);
    
    res.status(201).json({
      message: '活動創建成功',
      eventId: result.insertedId,
      event: {
        ...event,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('創建活動時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取活動列表
app.get('/api/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';
    const search = req.query.search || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // 構建查詢條件
    let query = {};
    
    if (type) {
      query.category = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate && endDate) {
      query.eventDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.eventDate = { $gte: startDate };
    } else if (endDate) {
      query.eventDate = { $lte: endDate };
    }
    
    // 計算總數
    const total = await db.collection('events').countDocuments(query);
    
    // 獲取數據
    const events = await db.collection('events')
      .find(query)
      .sort({ eventDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    res.json({
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('獲取活動列表時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取單個活動詳情
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('獲取活動詳情時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 報名參加活動
app.post('/api/events/:id/register', authenticate, async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    // 檢查活動是否已結束
    if (new Date() > new Date(event.deadline)) {
      return res.status(400).json({ error: '活動報名已截止' });
    }
    
    // 檢查名額是否已滿
    if (event.registeredCount >= event.maxAttendees && event.maxAttendees > 0) {
      return res.status(400).json({ error: '活動名額已滿' });
    }
    
    // 檢查用戶是否已報名
    const isRegistered = event.attendees.some(
      attendee => attendee.userId.toString() === req.user._id.toString()
    );
    
    if (isRegistered) {
      return res.status(400).json({ error: '您已報名此活動' });
    }
    
    // 添加到參與者名單
    const attendee = {
      userId: req.user._id,
      username: req.user.username,
      registerDate: new Date()
    };
    
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { attendees: attendee },
        $inc: { registeredCount: 1 }
      }
    );
    
    res.json({ 
      message: '活動報名成功',
      attendee
    });
  } catch (error) {
    console.error('報名活動時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 更新活動資訊
app.put('/api/events/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    // 檢查權限，只有活動創建者或管理員可以編輯
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '您沒有權限編輯此活動' });
    }
    
    const { 
      title, 
      description, 
      location, 
      address, 
      eventDate, 
      eventTime, 
      eventEndDate, 
      eventEndTime, 
      capacity, 
      fee, 
      deadline, 
      type 
    } = req.body;
    
    // 處理圖片路徑
    let imageUrl = event.imageUrl; // 保持原圖片
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }
    
    // 處理時間
    const startDateTime = eventDate 
      ? (eventTime 
        ? new Date(`${eventDate}T${eventTime}`) 
        : new Date(`${eventDate}T00:00:00`))
      : event.eventDate;
      
    const endDateTime = eventEndDate 
      ? (eventEndTime 
        ? new Date(`${eventEndDate}T${eventEndTime}`) 
        : new Date(`${eventEndDate}T23:59:59`))
      : (eventEndDate === '' ? startDateTime : event.endDate);
    
    // 更新活動資料
    const updateData = {
      title: title || event.title,
      description: description || event.description,
      category: type || event.category,
      location: location || event.location,
      address: address || event.address,
      eventDate: startDateTime,
      endDate: endDateTime,
      updatedAt: new Date(),
      imageUrl,
      maxAttendees: capacity ? parseInt(capacity) : event.maxAttendees,
      fee: fee ? parseFloat(fee) : event.fee,
      deadline: deadline ? new Date(deadline) : event.deadline,
      status: new Date() < (deadline ? new Date(deadline) : event.deadline) ? 'open' : 'closed'
    };
    
    // 更新數據庫
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    res.json({
      message: '活動更新成功',
      event: {
        ...event,
        ...updateData
      }
    });
  } catch (error) {
    console.error('更新活動時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 圖片上傳 API
app.post('/api/upload/:type', authenticate, upload.single('image'), (req, res) => {
  try {
    const imagePath = `/uploads/${req.params.type}/${req.file.filename}`;
    
    res.json({
      message: '上傳成功',
      imagePath
    });
  } catch (error) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// =============== 畫廊相關 API ===============

// 獲取畫廊作品列表 API
app.get('/api/gallery', async (req, res) => {
  try {
    const { category, style, sort, search, page = 1, limit = 12 } = req.query;
    
    // 建立查詢條件
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (style && style !== 'all') {
      query.style = style;
    }
    
    // 新增搜尋功能
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { model: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    // 建立排序條件
    let sortOption = { createdAt: -1 }; // 預設按建立時間倒序
    switch (sort) {
      case 'popular':
        sortOption = { 'stats.likes': -1 };
        break;
      case 'views':
        sortOption = { 'stats.views': -1 };
        break;
      case 'comments':
        sortOption = { 'stats.comments': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    // 計算跳過的項目數
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 獲取總數和作品列表
    const total = await db.collection('galleries').countDocuments(query);
    const items = await db.collection('galleries')
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('獲取畫廊作品時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 創建新的畫廊作品 API
app.post('/api/gallery', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, style, model, tags } = req.body;
    
    // 驗證必填欄位
    if (!title || !description || !category || !style || !model) {
      return res.status(400).json({ error: '請填寫所有必填欄位' });
    }
    
    // 檢查是否有上傳圖片
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '請至少上傳一張圖片' });
    }
    
    // 處理圖片路徑
    const images = req.files.map(file => `/uploads/gallery/${file.filename}`);
    
    // 處理標籤
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = [];
      }
    }
    
    // 建立作品資料
    const newGalleryItem = {
      title,
      description,
      category,
      style,
      model,
      tags: tagsArray,
      images,
      image: images[0], // 主要圖片
      author: {
        _id: req.user._id,
        name: req.user.username,
        avatar: req.user.profile?.avatar || '/images/default-avatar.svg'
      },
      stats: {
        likes: 0,
        comments: 0,
        views: 0
      },
      likes: [], // 點讚用戶ID列表
      comments: [], // 評論列表
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 儲存到資料庫
    const result = await db.collection('galleries').insertOne(newGalleryItem);
    
    res.status(201).json({
      message: '作品上傳成功',
      itemId: result.insertedId,
      item: {
        ...newGalleryItem,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('創建畫廊作品時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取單個畫廊作品詳情 API
app.get('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    // 增加瀏覽次數
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      { $inc: { 'stats.views': 1 } }
    );
    
    // 獲取作品詳情
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('獲取作品詳情時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 點讚/取消點讚作品 API
app.post('/api/gallery/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    // 檢查用戶是否已經點讚
    const hasLiked = item.likes && item.likes.includes(userId.toString());
    
    let updateOperation;
    let message;
    
    if (hasLiked) {
      // 取消點讚
      updateOperation = {
        $pull: { likes: userId.toString() },
        $inc: { 'stats.likes': -1 }
      };
      message = '已取消點讚';
    } else {
      // 點讚
      updateOperation = {
        $addToSet: { likes: userId.toString() },
        $inc: { 'stats.likes': 1 }
      };
      message = '點讚成功';
    }
    
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      updateOperation
    );
    
    // 獲取更新後的點讚數
    const updatedItem = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    res.json({
      message,
      liked: !hasLiked,
      likesCount: updatedItem.stats.likes
    });
  } catch (error) {
    console.error('點讚操作時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 添加評論 API
app.post('/api/gallery/:id/comment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: '評論內容不能為空' });
    }
    
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    // 建立新評論
    const newComment = {
      _id: new ObjectId(),
      content: content.trim(),
      author: {
        _id: req.user._id,
        name: req.user.username,
        avatar: req.user.profile?.avatar || '/images/default-avatar.svg'
      },
      createdAt: new Date()
    };
    
    // 添加評論並增加評論數
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      {
        $push: { comments: newComment },
        $inc: { 'stats.comments': 1 }
      }
    );
    
    res.status(201).json({
      message: '評論添加成功',
      comment: newComment
    });
  } catch (error) {
    console.error('添加評論時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取精選作品 API
app.get('/api/gallery/featured', async (req, res) => {
  try {
    // 檢查資料庫連接
    if (!db) {
      throw new Error('資料庫未連接');
    }

    // 獲取點讚數最多的6個作品作為精選
    const featuredItems = await db.collection('galleries')
      .find({
        // 確保必要欄位存在
        title: { $exists: true },
        description: { $exists: true },
        category: { $exists: true }
      })
      .sort({ 
        'stats.likes': -1,  // 首選按讚數排序
        'stats.views': -1,  // 其次按觀看數
        createdAt: -1       // 最後按創建時間
      })
      .limit(6)
      .toArray();

    // 如果沒有找到任何作品，返回空數組而不是錯誤
    if (!featuredItems || featuredItems.length === 0) {
      return res.json([]);
    }

    // 處理每個作品的資料，確保必要欄位存在
    const processedItems = featuredItems.map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      image: item.image || null,
      createdAt: item.createdAt || new Date(),
      author: {
        name: item.author?.name || '匿名用戶',
        avatar: item.author?.avatar || '/images/default-avatar.jpg'
      },
      stats: {
        likes: item.stats?.likes || 0,
        comments: item.stats?.comments || 0,
        views: item.stats?.views || 0
      }
    }));

    res.json(processedItems);
  } catch (error) {
    console.error('獲取精選作品時出錯:', error);
    res.status(500).json({ 
      error: '獲取精選作品失敗',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// =============== 畫廊相關 API 結束 ===============

// 忘記密碼 API
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: '電子郵件為必填項' });
    }
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      // 為了安全，即使用戶不存在也返回相同的成功訊息
      return res.status(200).json({ message: '如果該電子郵件已註冊，您將收到重置密碼的信件' });
    }
    
    // 生成重置令牌和過期時間
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1小時後過期
    
    // 更新用戶資料
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires
        } 
      }
    );
    
    // 在實際應用中，這裡應發送電子郵件
    // 現在只是模擬成功
    console.log(`重置密碼連結: http://localhost:3001/reset-password.html?token=${resetToken}`);
    
    res.json({ message: '重置密碼的郵件已發送，請檢查您的收件箱' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 重置密碼 API
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: '令牌和密碼為必填項' });
    }
    
    // 查找有效的重置令牌
    const user = await db.collection('users').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ error: '無效或過期的密碼重置令牌' });
    }
    
    // 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新用戶密碼並移除重置令牌
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
      }
    );
    
    res.json({ message: '密碼已成功重置，請使用新密碼登入' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 健康檢查 API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// 資料庫初始化API（僅限開發環境或首次部署）
app.post('/api/init-db', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: '資料庫未連接' });
    }

    // 檢查是否已經初始化過
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      return res.json({ 
        message: '資料庫已經初始化過，無需重複操作',
        userCount: userCount
      });
    }

    // 執行初始化腳本
    const { exec } = require('child_process');
    exec('node initDB.js', (error, stdout, stderr) => {
      if (error) {
        console.error('初始化資料庫失敗:', error);
        return res.status(500).json({ error: '初始化資料庫失敗', details: error.message });
      }
      
      console.log('資料庫初始化成功:', stdout);
      res.json({ 
        message: '資料庫初始化成功',
        details: stdout
      });
    });
  } catch (error) {
    console.error('資料庫初始化API錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 重新初始化活動資料API（僅限開發環境）
app.post('/api/reset-events', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: '資料庫未連接' });
    }

    // 清除現有活動資料
    await db.collection('events').deleteMany({});
    console.log('已清除現有活動資料');

    // 重新初始化活動資料
    await initializeSampleEvents();

    res.json({ 
      message: '活動資料重新初始化成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('重新初始化活動資料失敗:', error);
    res.status(500).json({ error: '服務器錯誤', details: error.message });
  }
});

// 前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'community.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'showcase.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

app.get('/bikes-gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bikes-gallery.html'));
});

// API 獲取爬取的車輛圖片
app.get('/api/bike-images', async (req, res) => {
  const model = req.query.model || 'all';
  const category = req.query.category || 'all';
  
  try {
    const baseDir = path.join(__dirname, 'public', 'uploads', 'scraped-bikes');
    const images = [];
    
    // 確保目錄存在
    if (!fs.existsSync(baseDir)) {
      return res.json({ images: [], model, category });
    }
    
    // 讀取車款目錄
    const modelDirs = fs.readdirSync(baseDir);
    
    for (const modelDir of modelDirs) {
      // 檢查是否符合模型過濾
      if (model !== 'all' && modelDir !== model.replace(/\s+/g, '-')) {
        continue;
      }
      
      const modelPath = path.join(baseDir, modelDir);
      const categoryDirs = fs.readdirSync(modelPath);
      
      for (const categoryDir of categoryDirs) {
        // 檢查是否符合類別過濾
        let matchCategory = false;
        
        if (category === 'all') {
          matchCategory = true;
        } else if (category === '原廠' && categoryDir === '原廠') {
          matchCategory = true;
        } else if (category === '改裝整車' && categoryDir === '改裝整車') {
          matchCategory = true;
        } else if (category === '改裝零件' && categoryDir.startsWith('改裝零件-')) {
          matchCategory = true;
        }
        
        if (matchCategory) {
          const categoryPath = path.join(modelPath, categoryDir);
          const files = fs.readdirSync(categoryPath);
          
          for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
              const imagePath = `/uploads/scraped-bikes/${modelDir}/${categoryDir}/${file}`;
              const modelName = modelDir.replace(/-/g, ' ');
              
              // 生成圖片描述
              let title = '';
              let description = '';
              
              if (categoryDir === '原廠') {
                title = `${modelName} 原廠`;
                description = '原廠標準配置';
              } else if (categoryDir === '改裝整車') {
                title = `${modelName} 改裝整車`;
                description = '客製化改裝';
              } else {
                const partName = categoryDir.replace('改裝零件-', '');
                title = `${modelName} ${partName}`;
                description = `改裝${partName}`;
              }
              
              images.push({
                path: imagePath,
                model: modelName,
                category: categoryDir,
                title,
                description
              });
            }
          }
        }
      }
    }
    
    res.json({
      images,
      model,
      category,
      total: images.length
    });
  } catch (error) {
    console.error('獲取圖庫圖片時出錯:', error);
    res.status(500).json({ error: '獲取圖片失敗' });
  }
});

// API 手動開始爬蟲 (僅限管理員)
app.post('/api/admin/start-scraper', authenticate, async (req, res) => {
  try {
    // 檢查用戶是否為管理員
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '只有管理員可以執行此操作' });
    }
    
    // 爬蟲功能已被刪除，返回相應錯誤訊息
    return res.status(404).json({ 
      error: '爬蟲功能已被移除', 
      message: '系統已改為使用固定的高質量圖片來源，不再依賴爬蟲獲取圖片'
    });
    
  } catch (error) {
    console.error('API調用出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 摩托車圖片API
app.get('/api/bikes/images', (req, res) => {
  try {
    const model = req.query.model || 'all';
    const category = req.query.category || 'all';
    
    // 基礎目錄
    const baseDir = path.join(__dirname, 'public', 'uploads', 'scraped-bikes');
    
    // 如果目錄不存在，返回空數組
    if (!fs.existsSync(baseDir)) {
      return res.json({ images: [] });
    }
    
    // 獲取所有車型目錄
    const modelDirs = model === 'all' 
      ? fs.readdirSync(baseDir).filter(dir => dir !== '.DS_Store' && fs.statSync(path.join(baseDir, dir)).isDirectory())
      : [model].filter(dir => fs.existsSync(path.join(baseDir, dir)));
    
    const allImages = [];
    
    // 遍歷每個車型目錄
    modelDirs.forEach(modelDir => {
      const modelPath = path.join(baseDir, modelDir);
      // 獲取該車型下的所有類別目錄
      const categoryDirs = fs.readdirSync(modelPath)
        .filter(dir => dir !== '.DS_Store' && fs.statSync(path.join(modelPath, dir)).isDirectory());
      
      // 過濾類別
      const filteredCategoryDirs = category === 'all' 
        ? categoryDirs 
        : categoryDirs.filter(dir => {
            if (category === '原廠') return dir === '原廠';
            if (category === '改裝整車') return dir === '改裝整車';
            if (category === '改裝零件') return dir.startsWith('改裝零件');
            return false;
          });
      
      // 遍歷每個類別目錄
      filteredCategoryDirs.forEach(categoryDir => {
        const categoryPath = path.join(modelPath, categoryDir);
        // 獲取目錄中的所有圖片
        const imageFiles = fs.readdirSync(categoryPath)
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          });
        
        // 將圖片信息添加到結果中
        imageFiles.forEach(imageFile => {
          const imagePath = `/uploads/scraped-bikes/${modelDir}/${categoryDir}/${imageFile}`;
          
          // 從目錄名稱生成易讀的標題
          let title = modelDir.replace(/-/g, ' ');
          if (categoryDir === '原廠') {
            title += ' 原廠';
          } else if (categoryDir === '改裝整車') {
            title += ' 改裝整車';
          } else if (categoryDir.startsWith('改裝零件')) {
            const partName = categoryDir.replace('改裝零件-', '');
            title += ` ${partName}`;
          }
          
          allImages.push({
            url: imagePath,
            title,
            model: modelDir,
            category: categoryDir
          });
        });
      });
    });
    
    res.json({ images: allImages });
  } catch (error) {
    console.error('獲取摩托車圖片時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 重新爬蟲API（僅管理員可用）
app.post('/api/bikes/scrape', authenticate, async (req, res) => {
  try {
    // 檢查用戶權限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '沒有權限執行此操作' });
    }
    
    // 爬蟲功能已被刪除，返回相應錯誤訊息
    return res.status(404).json({ 
      error: '爬蟲功能已被移除', 
      message: '系統已改為使用固定的高質量圖片來源，不再依賴爬蟲獲取圖片'
    });
    
  } catch (error) {
    console.error('API調用出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 車庫管理 API
app.post('/api/garage', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { brand, model, year, cc, category, description, isMainBike } = req.body;
    
    // 驗證必要字段
    if (!brand || !model || !year) {
      return res.status(400).json({ error: '品牌、型號與年份為必填項' });
    }
    
    // 處理圖片路徑
    let imagePath = '/images/bikes/placeholder.jpg'; // 默認圖片
    if (req.file) {
      imagePath = `/uploads/garage/${req.file.filename}`;
    }
    
    // 創建車輛資料
    const bike = {
      userId: req.user._id,
      brand,
      model,
      year: parseInt(year),
      cc: cc ? parseInt(cc) : null,
      category,
      description,
      imagePath,
      isMainBike: isMainBike === 'on' || isMainBike === 'true',
      modifications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mileage: 0
    };
    
    // 如果設置為主要車輛，先將所有其他車輛設為非主要
    if (bike.isMainBike) {
      await db.collection('bikes').updateMany(
        { userId: req.user._id },
        { $set: { isMainBike: false } }
      );
    }
    
    // 保存到數據庫
    const result = await db.collection('bikes').insertOne(bike);
    
    res.status(201).json({
      message: '車輛新增成功',
      bikeId: result.insertedId,
      bike: {
        ...bike,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('新增車輛時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取用戶車庫列表
app.get('/api/garage', authenticate, async (req, res) => {
  try {
    const bikes = await db.collection('bikes')
      .find({ userId: req.user._id })
      .sort({ isMainBike: -1, createdAt: -1 })
      .toArray();
    
    res.json({ bikes });
  } catch (error) {
    console.error('獲取車庫列表時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 刪除車輛
app.delete('/api/garage/:id', authenticate, async (req, res) => {
  try {
    const result = await db.collection('bikes').deleteOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '找不到該車輛或無權刪除' });
    }
    
    res.json({ message: '車輛刪除成功' });
  } catch (error) {
    console.error('刪除車輛時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 更新車輛資料
app.put('/api/garage/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { brand, model, year, cc, category, description, isMainBike } = req.body;
    
    // 驗證必要字段
    if (!brand || !model || !year) {
      return res.status(400).json({ error: '品牌、型號與年份為必填項' });
    }
    
    // 取得當前車輛資料
    const currentBike = await db.collection('bikes').findOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (!currentBike) {
      return res.status(404).json({ error: '找不到該車輛或無權編輯' });
    }
    
    // 處理圖片路徑
    let imagePath = currentBike.imagePath; // 保持原圖片
    if (req.file) {
      imagePath = `/uploads/garage/${req.file.filename}`;
    }
    
    // 更新資料
    const updateData = {
      brand,
      model,
      year: parseInt(year),
      cc: cc ? parseInt(cc) : null,
      category,
      description,
      imagePath,
      isMainBike: isMainBike === 'on' || isMainBike === 'true',
      updatedAt: new Date()
    };
    
    // 如果設置為主要車輛，先將所有其他車輛設為非主要
    if (updateData.isMainBike) {
      await db.collection('bikes').updateMany(
        { userId: req.user._id, _id: { $ne: ObjectId(req.params.id) } },
        { $set: { isMainBike: false } }
      );
    }
    
    // 更新數據庫
    await db.collection('bikes').updateOne(
      { _id: ObjectId(req.params.id), userId: req.user._id },
      { $set: updateData }
    );
    
    res.json({
      message: '車輛資料更新成功',
      bike: {
        ...currentBike,
        ...updateData
      }
    });
  } catch (error) {
    console.error('更新車輛資料時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 添加車輛改裝零件
app.post('/api/garage/:id/modifications', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, price, installDate, description } = req.body;
    
    // 驗證必要字段
    if (!name) {
      return res.status(400).json({ error: '零件名稱為必填項' });
    }
    
    // 取得當前車輛資料
    const bike = await db.collection('bikes').findOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (!bike) {
      return res.status(404).json({ error: '找不到該車輛或無權編輯' });
    }
    
    // 處理圖片路徑
    let imagePath = '/images/parts/placeholder.jpg'; // 默認圖片
    if (req.file) {
      imagePath = `/uploads/parts/${req.file.filename}`;
    }
    
    // 創建改裝零件資料
    const modification = {
      _id: new ObjectId(),
      name,
      brand,
      price,
      installDate: installDate ? new Date(installDate) : new Date(),
      description,
      imagePath,
      createdAt: new Date()
    };
    
    // 更新數據庫
    await db.collection('bikes').updateOne(
      { _id: ObjectId(req.params.id), userId: req.user._id },
      { 
        $push: { modifications: modification },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.status(201).json({
      message: '改裝零件添加成功',
      modification
    });
  } catch (error) {
    console.error('添加改裝零件時出錯:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 確保所有其他路由都返回 index.html（SPA 路由支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服務器發生錯誤' });
});

// 404處理
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: '找不到該API端點' });
  }
  
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 啟動服務器
(async () => {
  const connected = await connectToDatabase();
  
  if (!connected) {
    console.error('無法連接到任何 MongoDB 資料庫，服務器將以有限功能模式啟動');
    console.error('請檢查 MongoDB 連接設置或確保 MongoDB 服務已運行');
  } else {
    // 如果資料庫連接成功，初始化示例資料
    await initializeSampleEvents();
  }
  
  app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
    console.log(`API 文檔: http://localhost:${PORT}/api-docs`);
    console.log(`MongoDB 連接狀態: ${connected ? '已連接' : '未連接 (有限功能模式)'}`);
  });
})();

// 初始化示例活動資料
async function initializeSampleEvents() {
  try {
    // 檢查是否已經有活動資料
    const existingEvents = await db.collection('events').countDocuments();
    
    // 強制重新初始化活動資料（清除舊資料）
    if (existingEvents > 0) {
      console.log('清除現有活動資料...');
      await db.collection('events').deleteMany({});
    }
    
    console.log('初始化示例活動資料...');
    
    const sampleEvents = [
      {
        title: '台灣摩托車文化節',
        description: '一年一度的台灣摩托車文化盛會，匯聚全台車友共同慶祝摩托車文化，展示各式改裝車輛、零件及週邊商品。活動包含靜態展示、動態表演、技術講座、競賽活動等豐富內容。',
        category: 'exhibition',
        location: '華山1914文化創意產業園區',
        address: '台北市中正區八德路一段1號',
        eventDate: new Date('2025-07-15T10:00:00'),
        endDate: new Date('2025-07-17T18:00:00'),
        imageUrl: '/images/events/event1.jpg',
        organizerId: null, // 將在後面設置
        organizer: '台灣摩托車協會',
        maxAttendees: 1000,
        registeredCount: 247,
        attendees: [],
        fee: 0,
        deadline: new Date('2025-07-10T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '春季改裝工作坊',
        description: '專業技師帶領的改裝實作課程，教授基礎改裝技術與安全知識。適合初學者參加，提供完整的工具與材料。',
        category: 'workshop',
        location: 'MotoTech改裝中心',
        address: '新北市板橋區中山路二段100號',
        eventDate: new Date('2025-06-20T14:00:00'),
        endDate: new Date('2025-06-20T17:00:00'),
        imageUrl: '/images/events/event2.jpg',
        organizerId: null,
        organizer: 'MotoTech改裝中心',
        maxAttendees: 20,
        registeredCount: 12,
        attendees: [],
        fee: 1500,
        deadline: new Date('2025-06-15T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '北台灣車友大會師',
        description: '北台灣地區車友聚會活動，分享改裝心得、交流技術經驗。現場有美食攤位、音樂表演和抽獎活動。',
        category: 'meetup',
        location: '大佳河濱公園',
        address: '台北市中山區濱江街5號',
        eventDate: new Date('2025-06-05T09:00:00'),
        endDate: new Date('2025-06-05T16:00:00'),
        imageUrl: '/images/events/event3.jpg',
        organizerId: null,
        organizer: '北台灣車友會',
        maxAttendees: 500,
        registeredCount: 156,
        attendees: [],
        fee: 0,
        deadline: new Date('2025-06-01T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '改裝安全技術講座',
        description: '由資深技師分享改裝安全知識，包含煞車系統、懸吊系統、引擎調校等專業技術。提供認證證書。',
        category: 'seminar',
        location: '台北科技大學',
        address: '台北市大安區忠孝東路三段1號',
        eventDate: new Date('2025-06-12T19:00:00'),
        endDate: new Date('2025-06-12T21:00:00'),
        imageUrl: '/images/events/event4.jpg',
        organizerId: null,
        organizer: '改裝技術研習會',
        maxAttendees: 100,
        registeredCount: 67,
        attendees: [],
        fee: 500,
        deadline: new Date('2025-06-10T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '夏日改裝競賽',
        description: '年度最大規模的改裝車競賽，分為多個組別評選最佳改裝車。獲勝者將獲得豐厚獎品與榮譽。',
        category: 'competition',
        location: '麗寶國際賽車場',
        address: '台中市后里區月眉東路一段185號',
        eventDate: new Date('2025-08-10T08:00:00'),
        endDate: new Date('2025-08-10T18:00:00'),
        imageUrl: '/images/events/event5.jpg',
        organizerId: null,
        organizer: '台灣改裝車競賽協會',
        maxAttendees: 300,
        registeredCount: 89,
        attendees: [],
        fee: 2000,
        deadline: new Date('2025-08-05T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '電動車改裝展示會',
        description: '專注於電動摩托車改裝的展示活動，展現電動車改裝的最新趨勢與技術發展。',
        category: 'exhibition',
        location: '南港展覽館',
        address: '台北市南港區經貿二路1號',
        eventDate: new Date('2025-09-01T10:00:00'),
        endDate: new Date('2025-09-01T17:00:00'),
        imageUrl: '/images/events/event6.jpg',
        organizerId: null,
        organizer: '電動車改裝聯盟',
        maxAttendees: 800,
        registeredCount: 203,
        attendees: [],
        fee: 200,
        deadline: new Date('2025-08-28T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 插入示例活動資料
    const result = await db.collection('events').insertMany(sampleEvents);
    console.log(`成功插入 ${result.insertedCount} 個示例活動`);
  } catch (error) {
    console.error('初始化示例活動資料時出錯:', error);
  }
}