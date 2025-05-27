const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB 連接設定
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/';

// 預設活動資料
const defaultEvents = [
    {
        title: "2025春季改裝盛會",
        description: "一年一度的春季改裝展即將登場，現場將展示最新改裝零件與成品車，並有多場專業講座與互動展示。適合所有摩托車愛好者參加，無論您是改裝新手還是老手，都能在活動中獲得寶貴的經驗與知識。來自各大品牌的代表將展示最新產品，現場還有專業技師提供免費諮詢服務。",
        category: "exhibition",
        location: "台北南港展覽館",
        address: "台北市南港區經貿二路1號",
        eventDate: new Date('2025-04-15T09:00:00'),
        endDate: new Date('2025-04-17T18:00:00'),
        organizer: "MotoWeb管理員",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/spring-expo-2025.jpg",
        attendees: [],
        maxAttendees: 2000,
        registeredCount: 1240,
        fee: 200,
        deadline: new Date('2025-04-10T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "Akrapovic排氣管改裝工作坊",
        description: "由Akrapovic台灣總代理舉辦的專業排氣管改裝工作坊。現場將有資深技師示範正確的安裝方式，並分享排氣管選擇的要點與注意事項。參加者可以親手體驗安裝過程，學習專業的改裝技巧。工作坊結束後，每位參加者都能獲得Akrapovic原廠紀念品。",
        category: "workshop",
        location: "擎翔車業台北旗艦店",
        address: "台北市信義區松仁路100號",
        eventDate: new Date('2025-04-22T14:00:00'),
        endDate: new Date('2025-04-22T17:00:00'),
        organizer: "排氣管專家",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/akrapovic-workshop.jpg",
        attendees: [],
        maxAttendees: 30,
        registeredCount: 18,
        fee: 500,
        deadline: new Date('2025-04-20T18:00:00'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "新北山區車友聚會",
        description: "每月一次的山區車友聚會又來了！這次我們將前往新北市石碇山區，享受蜿蜒山路的樂趣。聚會包含騎乘技巧分享、愛車展示、以及豐富的美食饗宴。歡迎所有車友攜帶愛車參加，無論是原廠車還是改裝車都很歡迎。現場會有專業攝影師為大家拍攝愛車寫真。",
        category: "meetup",
        location: "石碇千島湖觀景台",
        address: "新北市石碇區北宜路五段",
        eventDate: new Date('2025-04-26T08:00:00'),
        endDate: new Date('2025-04-26T16:00:00'),
        organizer: "山道車神",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/mountain-meetup.jpg",
        attendees: [],
        maxAttendees: 80,
        registeredCount: 45,
        fee: 0,
        deadline: new Date('2025-04-24T20:00:00'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "2025年度改裝大賽",
        description: "年度最大規模的改裝比賽即將舉行！分為多個組別：街車組、仿賽組、重機組等。每個組別都有豐富的獎品等著你。比賽不僅看外觀，更重視創意與技術含量。評審團由業界知名改裝師與車手組成，確保公正專業的評選標準。冠軍可獲得價值10萬元的改裝零件大禮包！",
        category: "competition",
        location: "台中麗寶國際賽車場",
        address: "台中市后里區月眉東路一段185號",
        eventDate: new Date('2025-05-03T09:00:00'),
        endDate: new Date('2025-05-03T18:00:00'),
        organizer: "賽車場管理員",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/tuning-competition.jpg",
        attendees: [],
        maxAttendees: 150,
        registeredCount: 89,
        fee: 1000,
        deadline: new Date('2025-04-28T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "懸吊系統調校技術講座",
        description: "由Öhlins台灣技術團隊主講的專業懸吊系統講座。內容涵蓋懸吊系統基礎原理、調校技巧、常見問題排除等。現場將展示各種懸吊產品，並有實車示範調校過程。適合想要深入了解懸吊系統的車友參加。講座結束後還有Q&A時間，可以直接向專家提問。",
        category: "seminar",
        location: "Öhlins台灣教育訓練中心",
        address: "桃園市中壢區民族路六段550號",
        eventDate: new Date('2025-05-10T19:00:00'),
        endDate: new Date('2025-05-10T21:30:00'),
        organizer: "懸吊專家",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/suspension-seminar.jpg",
        attendees: [],
        maxAttendees: 60,
        registeredCount: 35,
        fee: 300,
        deadline: new Date('2025-05-08T18:00:00'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "南部車友大會師",
        description: "一年一度的南部車友大會師！高雄地區最大規模的摩托車聚會，預計有超過500台車參加。活動包含靜態展示、動態體驗、技術交流、美食市集等豐富內容。現場還有各大改裝品牌設攤，提供最新產品資訊與優惠價格。歡迎全台車友南下共襄盛舉！",
        category: "meetup",
        location: "高雄夢時代購物中心廣場",
        address: "高雄市前鎮區中華五路789號",
        eventDate: new Date('2025-05-17T10:00:00'),
        endDate: new Date('2025-05-17T17:00:00'),
        organizer: "南部車友會會長",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/south-meetup.jpg",
        attendees: [],
        maxAttendees: 500,
        registeredCount: 267,
        fee: 0,
        deadline: new Date('2025-05-15T20:00:00'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "電控系統改裝進階課程",
        description: "針對現代摩托車電控系統的深度改裝課程。課程內容包含ECU調校、線組改裝、電子儀表升級等進階技術。由具有10年以上經驗的電控專家親自授課，小班制教學確保每位學員都能充分學習。完成課程後將頒發結業證書。",
        category: "workshop",
        location: "台北科技大學推廣教育中心",
        address: "台北市大安區忠孝東路三段1號",
        eventDate: new Date('2025-05-24T09:00:00'),
        endDate: new Date('2025-05-25T17:00:00'),
        organizer: "電控改裝達人",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/ecu-workshop.jpg",
        attendees: [],
        maxAttendees: 20,
        registeredCount: 12,
        fee: 2500,
        deadline: new Date('2025-05-20T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: "台灣摩托車文化節",
        description: "慶祝台灣摩托車文化的盛大節慶！活動結合歷史展示、文化交流、藝術表演等多元內容。除了展示各年代的經典車款，還有台灣摩托車工業發展史介紹。現場邀請老師傅分享修車經驗，以及新世代改裝師展示創新技術。適合全家大小一起參加的文化活動。",
        category: "exhibition",
        location: "華山1914文化創意產業園區",
        address: "台北市中正區八德路一段1號",
        eventDate: new Date('2025-06-07T10:00:00'),
        endDate: new Date('2025-06-08T18:00:00'),
        organizer: "文化推廣協會",
        organizerId: new ObjectId(),
        imageUrl: "/images/events/culture-festival.jpg",
        attendees: [],
        maxAttendees: 1000,
        registeredCount: 432,
        fee: 150,
        deadline: new Date('2025-06-05T20:00:00'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function migrateEvents() {
    let client;
    
    try {
        console.log('正在連接到 MongoDB...');
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('MongoDB 連接成功！');
        
        const db = client.db();
        const eventsCollection = db.collection('events');
        
        // 檢查是否已有活動資料
        const existingEvents = await eventsCollection.countDocuments();
        console.log(`現有活動數量: ${existingEvents}`);
        
        if (existingEvents > 0) {
            console.log('清空現有活動資料...');
            await eventsCollection.deleteMany({});
            console.log('現有活動資料已清空');
        }
        
        // 跳過索引創建，直接導入數據
        console.log('開始導入活動資料...');
        
        // 導入預設活動資料
        const result = await eventsCollection.insertMany(defaultEvents);
        console.log(`✅ 成功導入 ${result.insertedCount} 個活動`);
        
        // 顯示統計資訊
        const stats = await eventsCollection.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('\n📊 活動統計：');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} 個活動`);
        });
        
        console.log('\n🎉 活動資料遷移完成！');
        
    } catch (error) {
        console.error('❌ 遷移過程中發生錯誤:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB 連接已關閉');
        }
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    migrateEvents().catch(console.error);
}

module.exports = { migrateEvents, defaultEvents }; 