const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// 數據庫連接URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/motomod';

// 示例數據
const initialData = {
  users: [
    {
      username: 'admin',
      email: 'admin@motomod.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date(),
      profile: {
        avatar: '/images/default-avatar.png',
        bio: '網站管理員',
        location: '台北市',
        favoriteModels: ['YAMAHA R15', 'Honda CB650R'],
        social: {
          facebook: 'https://facebook.com/admin',
          instagram: 'https://instagram.com/admin'
        }
      }
    },
    {
      username: 'user',
      email: 'user@motomod.com',
      password: 'user123',
      role: 'user',
      createdAt: new Date(),
      profile: {
        avatar: '/images/default-avatar.png',
        bio: '摩托車愛好者',
        location: '台中市',
        favoriteModels: ['Kawasaki Z900', 'Suzuki GSX-R150'],
        social: {
          facebook: 'https://facebook.com/user',
          instagram: 'https://instagram.com/user'
        }
      }
    }
  ],
  showcases: [
    {
      title: 'YAMAHA R15 街道改裝案例',
      author: 'admin',
      authorId: null, // 待填充
      createdAt: new Date('2024-01-15'),
      description: '這是一個注重性能和外觀平衡的改裝案例，主要升級了排氣系統和懸吊。',
      beforeImage: 'https://picsum.photos/id/133/800/600',
      afterImage: 'https://picsum.photos/id/134/800/600',
      likes: 156,
      comments: [],
      commentCount: 0,
      parts: [
        { name: 'Akrapovic 排氣管', price: 'NT$ 35,000' },
        { name: 'Ohlins 後避震', price: 'NT$ 28,000' },
        { name: '碳纖維尾蓋', price: 'NT$ 8,000' }
      ],
      specifications: {
        '馬力': '20.4 hp',
        '扭力': '15.1 Nm',
        '車重': '138 kg'
      },
      images: [
        'https://picsum.photos/id/133/800/600',
        'https://picsum.photos/id/134/800/600',
        'https://picsum.photos/id/135/800/600',
        'https://picsum.photos/id/136/800/600'
      ]
    },
    {
      title: 'Honda CB650R 性能改裝',
      author: 'user',
      authorId: null, // 待填充
      createdAt: new Date('2024-01-10'),
      description: '全車性能升級，包括引擎、進排氣系統和懸吊系統的全面優化。',
      beforeImage: 'https://picsum.photos/id/137/800/600',
      afterImage: 'https://picsum.photos/id/138/800/600',
      likes: 234,
      comments: [],
      commentCount: 0,
      parts: [
        { name: 'DNA 高流量空濾', price: 'NT$ 3,500' },
        { name: 'SC-Project 排氣管', price: 'NT$ 42,000' },
        { name: 'Brembo 煞車系統', price: 'NT$ 55,000' }
      ],
      specifications: {
        '馬力': '95.2 hp',
        '扭力': '64.4 Nm',
        '車重': '202 kg'
      },
      images: [
        'https://picsum.photos/id/137/800/600',
        'https://picsum.photos/id/138/800/600',
        'https://picsum.photos/id/139/800/600',
        'https://picsum.photos/id/140/800/600'
      ]
    }
  ],
  products: [
    {
      name: 'Akrapovic 排氣管系統',
      description: '高品質鈦合金材質排氣管，提升馬力與扭力表現，同時降低重量。',
      category: '排氣系統',
      price: 35000,
      brand: 'Akrapovic',
      stock: 5,
      images: [
        'https://picsum.photos/id/133/800/600',
        'https://picsum.photos/id/134/800/600'
      ],
      compatibility: ['YAMAHA R15', 'YAMAHA R3', 'YAMAHA MT-15'],
      specifications: {
        '材質': '鈦合金',
        '重量': '3.2 kg',
        '噪音值': '95 dB'
      },
      createdAt: new Date()
    },
    {
      name: 'Ohlins 後避震',
      description: '專業級避震系統，提供絕佳的操控性與舒適性，可調式阻尼與預載。',
      category: '懸吊系統',
      price: 28000,
      brand: 'Ohlins',
      stock: 3,
      images: [
        'https://picsum.photos/id/135/800/600',
        'https://picsum.photos/id/136/800/600'
      ],
      compatibility: ['YAMAHA R15', 'Honda CBR150R', 'Suzuki GSX-R150'],
      specifications: {
        '材質': '鋁合金',
        '行程': '50 mm',
        '阻尼調整': '20段可調'
      },
      createdAt: new Date()
    }
  ],
  posts: [
    {
      title: '如何選擇適合你的摩托車排氣管',
      content: '排氣管不僅影響聲浪，更會影響引擎性能。本文將介紹不同材質、設計的排氣管如何影響車輛表現，並提供選購建議。',
      category: '技術指南',
      tags: ['排氣系統', '性能改裝', '新手指南'],
      author: 'admin',
      authorId: null, // 待填充
      createdAt: new Date('2024-01-20'),
      likes: 78,
      comments: [],
      commentCount: 0,
      views: 342
    },
    {
      title: '2024年值得期待的新車款介紹',
      content: '2024年將有哪些重磅新車推出？本文整理了即將發表的重要車款資訊，包含規格、預計售價與發表時間。',
      category: '新車資訊',
      tags: ['新車', '2024', '車款介紹'],
      author: 'user',
      authorId: null, // 待填充
      createdAt: new Date('2024-01-15'),
      likes: 103,
      comments: [],
      commentCount: 0,
      views: 567
    }
  ],
  events: [
    {
      title: '2024台北摩托車展',
      description: '年度最大摩托車展覽，展示最新車款與改裝零件，還有多項互動活動與抽獎。',
      category: '展覽',
      location: '台北南港展覽館',
      eventDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-12'),
      createdAt: new Date(),
      organizer: 'MotoMod 官方',
      imageUrl: 'https://picsum.photos/id/133/800/600',
      attendees: [],
      maxAttendees: 500
    },
    {
      title: '南台灣山道騎乘體驗',
      description: '專業教練帶領的山道騎乘活動，適合進階車友參加，包含技術指導與美景欣賞。',
      category: '騎乘活動',
      location: '高雄市六龜區',
      eventDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-15'),
      createdAt: new Date(),
      organizer: 'MotoMod 車友會',
      imageUrl: 'https://picsum.photos/id/137/800/600',
      attendees: [],
      maxAttendees: 20
    }
  ]
};

// 連接到資料庫並填充數據
async function initializeDB() {
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
    console.log('MongoDB 連接成功');
    
    const db = client.db();
    
    // 清空資料庫中的現有集合
    console.log('清空現有集合...');
    await db.collection('users').drop().catch(() => console.log('無 users 集合'));
    await db.collection('showcases').drop().catch(() => console.log('無 showcases 集合'));
    await db.collection('products').drop().catch(() => console.log('無 products 集合'));
    await db.collection('posts').drop().catch(() => console.log('無 posts 集合'));
    await db.collection('events').drop().catch(() => console.log('無 events 集合'));
    await db.collection('likes').drop().catch(() => console.log('無 likes 集合'));
    
    // 建立索引
    console.log('建立索引...');
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    await db.collection('showcases').createIndex({ title: 'text', description: 'text' });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('posts').createIndex({ title: 'text', content: 'text' });
    await db.collection('events').createIndex({ title: 'text', description: 'text' });
    
    // 插入用戶數據（密碼加密）
    console.log('加密密碼...');
    for (const user of initialData.users) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    
    console.log('插入用戶數據...');
    const insertedUsers = await db.collection('users').insertMany(initialData.users);
    console.log(`已插入 ${insertedUsers.insertedCount} 個用戶`);
    
    // 關聯用戶ID
    console.log('關聯用戶ID...');
    const users = await db.collection('users').find({}).toArray();
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user._id;
    });
    
    // 填充 authorId
    initialData.showcases.forEach(showcase => {
      showcase.authorId = userMap[showcase.author];
    });
    
    initialData.posts.forEach(post => {
      post.authorId = userMap[post.author];
    });
    
    // 插入其他集合數據
    console.log('插入改裝案例數據...');
    const insertedShowcases = await db.collection('showcases').insertMany(initialData.showcases);
    console.log(`已插入 ${insertedShowcases.insertedCount} 個改裝案例`);
    
    console.log('插入產品數據...');
    const insertedProducts = await db.collection('products').insertMany(initialData.products);
    console.log(`已插入 ${insertedProducts.insertedCount} 個產品`);
    
    console.log('插入文章數據...');
    const insertedPosts = await db.collection('posts').insertMany(initialData.posts);
    console.log(`已插入 ${insertedPosts.insertedCount} 個文章`);
    
    console.log('插入活動數據...');
    const insertedEvents = await db.collection('events').insertMany(initialData.events);
    console.log(`已插入 ${insertedEvents.insertedCount} 個活動`);
    
    console.log('資料庫初始化完成！');
  } catch (error) {
    console.error('初始化資料庫時出錯:');
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
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 連接已關閉');
    }
  }
}

// 執行初始化
initializeDB(); 