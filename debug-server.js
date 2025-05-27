const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'motoweb';

async function debugServer() {
    console.log('調試伺服器資料庫連接...');
    console.log('MONGODB_URI:', MONGODB_URI);
    console.log('DB_NAME:', DB_NAME);
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✓ 成功連接到 MongoDB');
        
        const db = client.db(DB_NAME);
        
        // 測試posts集合
        const postsCount = await db.collection('posts').countDocuments();
        console.log(`✓ posts集合中有 ${postsCount} 篇文章`);
        
        // 測試查詢
        const posts = await db.collection('posts')
            .find({})
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();
            
        console.log(`✓ 查詢到 ${posts.length} 篇文章`);
        
        if (posts.length > 0) {
            console.log('前3篇文章標題:');
            posts.forEach((post, index) => {
                console.log(`  ${index + 1}. ${post.title}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 錯誤:', error);
    } finally {
        await client.close();
    }
}

debugServer(); 