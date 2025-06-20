/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const config = require('./config');

// 加載環境變數
require('dotenv').config();

// MongoDB 連接 - 優先使用環境變數
const MONGO_URI = process.env.MONGODB_URI || config.mongodb.uri;

async function initializeDatabase() {
  let client;
  
  try {
    console.log('🚀 開始初始化資料庫...');
    console.log('連接 URI:', MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@'));
    
    // 連接到 MongoDB
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    client = new MongoClient(MONGO_URI, options);
    await client.connect();
    console.log('✅ MongoDB 連接成功');
    
    const db = client.db();
    
    // 創建索引
    await createIndexes(db);
    
    // 初始化管理員帳號
    await initializeAdminUser(db);
    
    // 初始化示例資料
    await initializeSampleData(db);
    
    console.log('🎉 資料庫初始化完成！');
    
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('提示: 請確認 MongoDB 服務已啟動或檢查連接字串');
    }
    
    // 在生產環境中不要強制退出
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

async function createIndexes(db) {
  console.log('📊 創建資料庫索引...');
  
  try {
    // 用戶索引
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ 用戶索引創建完成');
    
    // 產品索引
    await db.collection('products').createIndex(
      { name: 'text', description: 'text', brand: 'text', tags: 'text' },
      { 
        name: 'products_text_search',
        default_language: 'none',
        weights: { name: 10, brand: 5, description: 1, tags: 3 }
      }
    );
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ brand: 1 });
    await db.collection('products').createIndex({ price: 1 });
    console.log('✅ 產品索引創建完成');
    
    // 改裝案例索引
    await db.collection('showcases').createIndex(
      { title: 'text', description: 'text' },
      { name: 'showcases_text_search', default_language: 'none' }
    );
    await db.collection('showcases').createIndex({ createdAt: -1 });
    console.log('✅ 改裝案例索引創建完成');
    
    // 社群文章索引
    await db.collection('posts').createIndex(
      { title: 'text', content: 'text' },
      { name: 'posts_text_search', default_language: 'none' }
    );
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ category: 1 });
    console.log('✅ 社群文章索引創建完成');
    
    // 活動索引
    await db.collection('events').createIndex(
      { title: 'text', description: 'text' },
      { name: 'events_text_search', default_language: 'none' }
    );
    await db.collection('events').createIndex({ eventDate: 1 });
    await db.collection('events').createIndex({ category: 1 });
    await db.collection('events').createIndex({ status: 1 });
    console.log('✅ 活動索引創建完成');
    
    // 畫廊索引
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
    console.log('✅ 畫廊索引創建完成');
    
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.warn('⚠️ 索引創建警告:', error.message);
    }
  }
}

async function initializeAdminUser(db) {
  console.log('👤 初始化管理員帳號...');
  
  try {
    // 檢查是否已存在管理員
    const existingAdmin = await db.collection('users').findOne({ 
      $or: [
        { username: 'admin' },
        { email: config.admin.email }
      ]
    });
    
    if (existingAdmin) {
      console.log('ℹ️ 管理員帳號已存在，跳過創建');
      return;
    }
    
    // 創建管理員帳號
    const hashedPassword = await bcrypt.hash(config.admin.password, 10);
    
    const adminUser = {
      username: 'admin',
      email: config.admin.email,
      password: hashedPassword,
      role: 'admin',
      profile: {
        displayName: 'System Administrator',
        bio: 'System Administrator - Managing MotoWeb community platform with extensive experience in motorcycle technology and system administration.',
        avatar: '/images/default-avatar.svg',
        location: 'System Headquarters',
        joinDate: new Date(),
        interests: ['System Admin', 'All Categories', 'Platform Management', 'Technical Support', 'Community Moderation'],
        privacy: {
          showEmail: true,
          showLocation: true,
          publicProfile: true
        },
        stats: {
          bikes: 5,
          mods: 50,
          photos: 100,
          posts: 25,
          followers: 0,
          following: 0,
          likes: 0
        },
        activities: [
          'System maintenance and updates - ' + new Date().toLocaleDateString('en-US'),
          'Reviewed community guidelines - ' + new Date().toLocaleDateString('en-US'),
          'Added new product categories - ' + new Date().toLocaleDateString('en-US')
        ],
        achievements: [
          {
            icon: 'fa-crown',
            title: 'Platform Administrator',
            description: 'System administrator and community manager'
          },
          {
            icon: 'fa-shield-alt',
            title: 'Security Expert',
            description: 'Ensures platform security and user safety'
          },
          {
            icon: 'fa-users-cog',
            title: 'Community Manager',
            description: 'Manages and supports the riding community'
          }
        ]
      },
      preferences: {
        notifications: true,
        privacy: 'public',
        theme: 'light'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      emailVerified: true
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log('✅ 管理員帳號創建成功');
    console.log(`   用戶名: admin`);
    console.log(`   密碼: ${config.admin.password}`);
    console.log(`   郵箱: ${config.admin.email}`);
    
  } catch (error) {
    console.error('❌ 創建管理員帳號失敗:', error);
  }
}

async function initializeSampleData(db) {
  console.log('📝 初始化示例資料...');
  
  try {
    // 初始化示例用戶
    await initializeSampleUsers(db);
    
    // 初始化示例產品
    await initializeSampleProducts(db);
    
    // 初始化示例改裝案例
    await initializeSampleShowcases(db);
    
    // 初始化示例活動
    await initializeSampleEvents(db);
    
    console.log('✅ 示例資料初始化完成');
    
  } catch (error) {
    console.error('❌ 初始化示例資料失敗:', error);
  }
}

async function initializeSampleUsers(db) {
  const existingUsers = await db.collection('users').countDocuments({ role: { $ne: 'admin' } });
  
  if (existingUsers > 0) {
    console.log('ℹ️ 示例用戶已存在，跳過創建');
    return;
  }
  
  const hashedPassword = await bcrypt.hash('user123', 10);
  
  const sampleUsers = [
    {
      username: 'JohnRider',
      email: 'john.rider@email.com',
      password: hashedPassword,
      role: 'user',
      profile: {
        displayName: 'JohnRider',
        bio: '熱愛機車改裝的騎士，擁有5年以上的改裝經驗。喜歡分享知識並幫助其他騎士。',
        avatar: '/images/default-avatar.svg',
        location: '台北市',
        joinDate: new Date(),
        interests: ['運動型機車', '性能改裝', 'LED燈光', '避震系統', '排氣管'],
        privacy: {
          showEmail: true,
          showLocation: true,
          publicProfile: true
        },
        stats: {
          bikes: 2,
          mods: 15,
          photos: 24,
          posts: 8,
          followers: 0,
          following: 0,
          likes: 0
        },
        activities: [
          '新增怪獸工廠 Z2 PRO 前叉 - ' + new Date().toLocaleDateString('zh-TW'),
          '發布 JET 改裝照片 - ' + new Date().toLocaleDateString('zh-TW'),
          '分享煞車系統升級經驗 - ' + new Date().toLocaleDateString('zh-TW')
        ],
        achievements: [
          {
            icon: 'fa-wrench',
            title: '改裝大師',
            description: '完成10+項改裝'
          },
          {
            icon: 'fa-users',
            title: '社群貢獻者',
            description: '發表50+條有用評論'
          },
          {
            icon: 'fa-camera',
            title: '攝影愛好者',
            description: '分享20+張照片'
          }
        ]
      },
      preferences: {
        notifications: true,
        privacy: 'public',
        theme: 'light'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      emailVerified: true
    }
  ];
  
  await db.collection('users').insertMany(sampleUsers);
  console.log(`✅ 創建 ${sampleUsers.length} 個示例用戶`);
}

async function initializeSampleProducts(db) {
  const existingProducts = await db.collection('products').countDocuments();
  
  if (existingProducts > 0) {
    console.log('ℹ️ 示例產品已存在，跳過創建');
    return;
  }
  
  const sampleProducts = [
    {
      productId: 'aracer-sport-ecu',
      name: 'ARACER SPORT ECU',
      description: '高性能電腦調校系統，提升引擎動力輸出',
      category: '引擎系統',
      brand: 'ARACER',
      price: 15000,
      image: '/images/parts/ARACER SPORTD.webp',
      tags: ['ECU', '調校', '動力提升'],
      specifications: {
        compatibility: ['FORCE', 'SMAX', 'DRG'],
        warranty: '1年'
      },
      stock: 10,
      rating: 4.8,
      reviews: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 'reveno-transmission',
      name: 'REVENO 傳動組',
      description: '高品質傳動系統，提升加速性能',
      category: '傳動系統',
      brand: 'REVENO',
      price: 8500,
      image: '/images/parts/REVENO傳動.webp',
      tags: ['傳動', '加速', '性能'],
      specifications: {
        compatibility: ['通用型'],
        warranty: '6個月'
      },
      stock: 15,
      rating: 4.6,
      reviews: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('products').insertMany(sampleProducts);
  console.log(`✅ 創建 ${sampleProducts.length} 個示例產品`);
}

async function initializeSampleShowcases(db) {
  const existingShowcases = await db.collection('showcases').countDocuments();
  
  if (existingShowcases > 0) {
    console.log('ℹ️ 示例改裝案例已存在，跳過創建');
    return;
  }
  
  const sampleShowcases = [
    {
      title: 'FORCE 155 街道改裝',
      description: '完整的街道改裝案例，包含動力、外觀、懸吊系統升級',
      model: 'FORCE 155',
      category: '街道改裝',
      images: ['/images/showcase/force-street-mod.jpg'],
      modifications: [
        { part: 'ECU', brand: 'ARACER', model: 'SPORT' },
        { part: '排氣管', brand: '牛王', model: 'SVR' }
      ],
      stats: {
        views: 1250,
        likes: 89,
        comments: 12
      },
      author: {
        username: 'user',
        displayName: '測試用戶'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('showcases').insertMany(sampleShowcases);
  console.log(`✅ 創建 ${sampleShowcases.length} 個示例改裝案例`);
}

async function initializeSampleEvents(db) {
  const existingEvents = await db.collection('events').countDocuments();
  
  if (existingEvents > 0) {
    console.log('ℹ️ 示例活動已存在，跳過創建');
    return;
  }
  
  const sampleEvents = [
    {
      title: '台灣摩托車文化節',
      description: '一年一度的台灣摩托車文化盛會',
      category: 'exhibition',
      location: '華山1914文化創意產業園區',
      address: '台北市中正區八德路一段1號',
      eventDate: new Date('2025-07-15T10:00:00'),
      endDate: new Date('2025-07-17T18:00:00'),
      imageUrl: '/images/events/event1.jpg',
      organizer: '台灣摩托車協會',
      maxAttendees: 1000,
      registeredCount: 0,
      attendees: [],
      fee: 0,
      deadline: new Date('2025-07-10T23:59:59'),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('events').insertMany(sampleEvents);
  console.log(`✅ 創建 ${sampleEvents.length} 個示例活動`);
}

// 如果直接執行此腳本
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase,
  createIndexes,
  initializeAdminUser,
  initializeSampleData
}; 