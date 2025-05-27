const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/';

async function testData() {
    let client;
    
    try {
        console.log('🔍 檢查導入的數據...');
        
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB 連接成功');
        
        const db = client.db();
        
        // 檢查產品數據
        const productsCount = await db.collection('products').countDocuments();
        console.log(`📦 改裝零件數量: ${productsCount}`);
        
        if (productsCount > 0) {
            const sampleProducts = await db.collection('products').find({}).limit(3).toArray();
            console.log('   範例產品:');
            sampleProducts.forEach(product => {
                console.log(`   - ${product.name} (${product.brand}) - NT$${product.price}`);
            });
        }
        
        // 檢查畫廊數據
        const galleryCount = await db.collection('galleries').countDocuments();
        console.log(`\n🎨 作品展示數量: ${galleryCount}`);
        
        if (galleryCount > 0) {
            const sampleGallery = await db.collection('galleries').find({}).limit(3).toArray();
            console.log('   範例作品:');
            sampleGallery.forEach(item => {
                console.log(`   - ${item.title} (${item.model}) - ${item.stats.likes} 讚`);
            });
        }
        
        // 檢查活動數據
        const eventsCount = await db.collection('events').countDocuments();
        console.log(`\n🎪 改裝活動數量: ${eventsCount}`);
        
        if (eventsCount > 0) {
            const sampleEvents = await db.collection('events').find({}).limit(3).toArray();
            console.log('   範例活動:');
            sampleEvents.forEach(event => {
                console.log(`   - ${event.title} (${event.category}) - ${event.registeredCount}/${event.maxAttendees} 人報名`);
            });
        }
        
        console.log('\n🎉 數據檢查完成！');
        console.log(`\n📊 總計:`);
        console.log(`   改裝零件: ${productsCount} 個`);
        console.log(`   作品展示: ${galleryCount} 個`);
        console.log(`   改裝活動: ${eventsCount} 個`);
        
    } catch (error) {
        console.error('❌ 檢查失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 資料庫連接已關閉');
        }
    }
}

// 執行檢查
testData(); 