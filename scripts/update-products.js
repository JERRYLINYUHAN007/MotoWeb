const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'motoweb';

async function updateProducts() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('已連接到 MongoDB');
        
        const db = client.db(DB_NAME);
        const collection = db.collection('products');
        
        // 1. 移除所有雷霆s125/150相關產品
        console.log('移除雷霆s125/150產品...');
        const deleteResult = await collection.deleteMany({
            $or: [
                { mainCategory: 'kymco-racings' },
                { category: { $regex: 'kymco-racings' } },
                { name: { $regex: '雷霆' } }
            ]
        });
        console.log(`已移除 ${deleteResult.deletedCount} 個雷霆s125/150產品`);
        
        // 2. 更新勁戰車系名稱為CYGNUS GRYPHUS
        console.log('更新勁戰車系名稱為CYGNUS GRYPHUS...');
        const updateCygnusResult = await collection.updateMany(
            { mainCategory: 'yamaha-cygnus' },
            { 
                $set: { 
                    mainCategoryName: 'CYGNUS GRYPHUS',
                    updatedAt: new Date()
                }
            }
        );
        console.log(`已更新 ${updateCygnusResult.modifiedCount} 個勁戰車系產品名稱`);
        
        // 3. 檢查並修正車款照片映射
        console.log('檢查車款照片映射...');
        const products = await collection.find({}).toArray();
        
        for (const product of products) {
            let needsUpdate = false;
            let updates = {};
            
            // 檢查是否需要修正圖片路徑
            if (!product.image || product.image.includes('placeholder')) {
                let defaultImage = null;
                
                switch (product.mainCategory) {
                    case 'sym-jet':
                        defaultImage = 'images/bikes/JET.jpg';
                        break;
                    case 'sym-drg':
                        defaultImage = 'images/bikes/DRG.jpg';
                        break;
                    case 'sym-mmbcu':
                        defaultImage = 'images/bikes/MMBCU.jpg';
                        break;
                    case 'yamaha-cygnus':
                        defaultImage = 'images/bikes/CYGNUS GRYPHUS.jpg'; // 使用CYGNUS GRYPHUS照片
                        break;
                    case 'yamaha-force-smax':
                    case 'yamaha-force2':
                        defaultImage = 'images/bikes/FORCE.jpg';
                        break;
                    case 'kymco-krv':
                        defaultImage = 'images/bikes/KRV.jpg';
                        break;
                    default:
                        defaultImage = 'images/parts/placeholder-product.png';
                }
                
                if (defaultImage && defaultImage !== product.image) {
                    updates.image = defaultImage;
                    needsUpdate = true;
                }
            }
            
            // 更新產品
            if (needsUpdate) {
                updates.updatedAt = new Date();
                await collection.updateOne(
                    { _id: product._id },
                    { $set: updates }
                );
            }
        }
        
        // 4. 統計更新後的產品數量
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: '$mainCategory',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).toArray();
        
        console.log('\n更新後的產品統計:');
        stats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} 個產品`);
        });
        
        const totalProducts = await collection.countDocuments();
        console.log(`\n總產品數: ${totalProducts}`);
        
        console.log('\n產品更新完成！');
        
    } catch (error) {
        console.error('更新產品時發生錯誤:', error);
    } finally {
        await client.close();
    }
}

// 執行更新
updateProducts(); 