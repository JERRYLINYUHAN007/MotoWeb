const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// 加載環境變數
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/motoweb?retryWrites=true&w=majority';

async function fixMongoDBIndexes() {
    let client;
    
    try {
        console.log('🔧 開始修復MongoDB索引問題...');
        console.log(`連接到: ${MONGO_URI}`);
        
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB連接成功');
        
        const db = client.db();
        
        // 需要修復索引的集合
        const collections = ['products', 'posts', 'showcases', 'events', 'galleries'];
        
        for (const collectionName of collections) {
            console.log(`\n🔍 檢查集合: ${collectionName}`);
            
            try {
                // 檢查集合是否存在
                const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
                
                if (!collectionExists) {
                    console.log(`⚠️  集合 ${collectionName} 不存在，跳過`);
                    continue;
                }
                
                const collection = db.collection(collectionName);
                
                // 獲取現有索引
                const indexes = await collection.indexes();
                console.log(`📋 現有索引:`, indexes.map(idx => idx.name));
                
                // 刪除衝突的文字搜尋索引
                const textIndexes = indexes.filter(idx => 
                    idx.key && idx.key._fts === 'text'
                );
                
                for (const textIndex of textIndexes) {
                    console.log(`🗑️  刪除衝突索引: ${textIndex.name}`);
                    try {
                        await collection.dropIndex(textIndex.name);
                        console.log(`✅ 成功刪除索引: ${textIndex.name}`);
                    } catch (error) {
                        console.log(`⚠️  刪除索引失敗: ${error.message}`);
                    }
                }
                
                // 重新創建正確的文字搜尋索引
                console.log(`🔨 重新創建文字搜尋索引...`);
                
                if (collectionName === 'products') {
                    await collection.createIndex(
                        { 
                            name: 'text', 
                            description: 'text', 
                            brand: 'text', 
                            tags: 'text' 
                        },
                        { 
                            name: 'products_text_search',
                            default_language: 'none',
                            weights: { 
                                name: 10, 
                                brand: 5, 
                                description: 1, 
                                tags: 3 
                            }
                        }
                    );
                } else if (collectionName === 'posts') {
                    await collection.createIndex(
                        { title: 'text', content: 'text' },
                        { 
                            name: 'posts_text_search',
                            default_language: 'none' 
                        }
                    );
                } else if (collectionName === 'galleries') {
                    await collection.createIndex(
                        { 
                            title: 'text', 
                            description: 'text',
                            model: 'text',
                            tags: 'text'
                        },
                        { 
                            name: 'galleries_text_search',
                            default_language: 'none' 
                        }
                    );
                } else {
                    // 其他集合使用基本的文字搜尋索引
                    await collection.createIndex(
                        { title: 'text', description: 'text' },
                        { 
                            name: `${collectionName}_text_search`,
                            default_language: 'none' 
                        }
                    );
                }
                
                console.log(`✅ ${collectionName} 索引重建完成`);
                
            } catch (error) {
                console.error(`❌ 處理集合 ${collectionName} 時出錯:`, error.message);
            }
        }
        
        // 創建其他必要的索引
        console.log('\n🔨 創建其他必要索引...');
        
        // 用戶集合索引
        try {
            await db.collection('users').createIndex({ username: 1 }, { unique: true });
            await db.collection('users').createIndex({ email: 1 }, { unique: true });
            console.log('✅ 用戶索引創建完成');
        } catch (error) {
            console.log('⚠️  用戶索引可能已存在:', error.message);
        }
        
        // 畫廊集合索引
        try {
            await db.collection('galleries').createIndex({ createdAt: -1 });
            await db.collection('galleries').createIndex({ 'stats.likes': -1 });
            await db.collection('galleries').createIndex({ category: 1 });
            await db.collection('galleries').createIndex({ style: 1 });
            console.log('✅ 畫廊索引創建完成');
        } catch (error) {
            console.log('⚠️  畫廊索引可能已存在:', error.message);
        }
        
        console.log('\n🎉 MongoDB索引修復完成！');
        console.log('現在可以重新啟動伺服器了。');
        
    } catch (error) {
        console.error('❌ 修復過程中出錯:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 資料庫連接已關閉');
        }
    }
}

// 執行修復
if (require.main === module) {
    fixMongoDBIndexes()
        .then(() => {
            console.log('\n✅ 修復完成，請重新啟動伺服器');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ 修復失敗:', error);
            process.exit(1);
        });
}

module.exports = fixMongoDBIndexes; 