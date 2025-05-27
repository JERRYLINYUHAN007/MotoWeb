const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'motoweb';

async function testDatabase() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('已連接到 MongoDB');
        
        const db = client.db(DB_NAME);
        
        // 檢查posts集合
        const postsCount = await db.collection('posts').countDocuments();
        console.log(`posts集合中有 ${postsCount} 篇文章`);
        
        if (postsCount > 0) {
            const post = await db.collection('posts').findOne({});
            console.log('\n第一篇文章的字段結構:');
            console.log(Object.keys(post));
            console.log('\n第一篇文章的內容:');
            console.log(JSON.stringify(post, null, 2));
        }
        
        // 檢查所有集合
        const collections = await db.listCollections().toArray();
        console.log('\n所有集合:');
        collections.forEach(col => {
            console.log(`- ${col.name}`);
        });
        
    } catch (error) {
        console.error('錯誤:', error);
    } finally {
        await client.close();
    }
}

testDatabase(); 