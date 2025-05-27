const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/';
const DB_NAME = 'motoweb';

// 從前端複製的模擬貼文資料
const mockDiscussionsDB = {
    "1": {
        id: "1",
        title: "有人嘗試過Akrapovic排氣管嗎？值得裝嗎？",
        author: "摩托車小子",
        avatar: "images/avatars/user1.svg",
        thumbnail: "images/community/thumb-akrapovic.jpg",
        date: "2025-04-20",
        category: "排氣系統",
        tags: ["#排氣管", "#動力提升", "#Akrapovic"],
        excerpt: "最近在考慮升級我的座駕的排氣系統，Akrapovic（天蠍）這個牌子一直在我的雷達上。聽說它的聲音渾厚，性能提升也相當不錯，但價格也確實不便宜。想請問社群裡有沒有車友實際安裝使用過 Akrapovic 的排氣管？",
        content: "<p>最近在考慮升級我的座駕的排氣系統，Akrapovic（天蠍）這個牌子一直在我的雷達上。聽說它的聲音渾厚，性能提升也相當不錯，但價格也確實不便宜。</p><p>想請問社群裡有沒有車友實際安裝使用過 Akrapovic 的排氣管？可以分享一下實際的體驗嗎？例如：</p><ul><li>聲音表現如何？會不會太吵影響日常使用？</li><li>性能提升（馬力、扭力）有感嗎？</li><li>安裝過程是否複雜？</li><li>長期使用的耐用度如何？</li><li>整體來說，你覺得這筆花費值得嗎？</li></ul><p>我的車型是 Yamaha YZF-R3，主要用途是週末跑山和偶爾的賽道日。任何相關的經驗或建議都非常歡迎，感謝大家！</p>",
        likes: 24,
        views: 432,
        commentsCount: 2
    },
    "2": {
        id: "2",
        title: "懸吊系統調校經驗分享 - Öhlins避震器",
        author: "改裝達人",
        avatar: "images/avatars/user2.svg",
        thumbnail: "images/community/thumb-ohlins.jpg",
        date: "2025-04-18",
        category: "懸吊系統",
        tags: ["#避震器", "#懸吊", "#Öhlins"],
        excerpt: "Öhlins 避震器一直是許多熱血騎士的夢幻逸品。它的吸震效果、路感回饋和高速穩定性都是頂級水準。我最近剛為我的 Kawasaki Z900RS 換上了 Öhlins 的前後避震...",
        content: "<p>Öhlins 避震器一直是許多熱血騎士的夢幻逸品。它的吸震效果、路感回饋和高速穩定性都是頂級水準。</p><p>我最近剛為我的 Kawasaki Z900RS 換上了 Öhlins 的前後避震，並根據自己的騎乘習慣做了詳細調校。整個過程雖然花了不少時間，但成果非常令人滿意。過彎的信心提升很多，路面的碎震也處理得更細膩。想跟大家分享一些調校的心得，以及更換前後的差異比較...</p>",
        likes: 18,
        views: 356,
        commentsCount: 1
    },
    "3": {
        id: "3",
        title: "【討論】最省油的機車改裝方式？",
        author: "省油達人",
        avatar: "images/avatars/user3.svg",
        thumbnail: "images/community/thumb-fuel.jpg",
        date: "2025-04-17",
        category: "引擎改裝",
        tags: ["#引擎調教", "#省油", "#效能"],
        excerpt: "在油價高漲的時代，如何讓愛車更省油是個重要的課題。除了改變騎乘習慣外，透過適當的改裝也能達到不錯的省油效果。大家有沒有什麼推薦的省油改裝方式？",
        content: "<p>在油價高漲的時代，如何讓愛車更省油是個重要的課題。除了改變騎乘習慣外，透過適當的改裝也能達到不錯的省油效果。</p><p>大家有沒有什麼推薦的省油改裝方式？例如更換火星塞、調整供油電腦、使用輕量化傳動等等。歡迎分享您的經驗和看法！</p>",
        likes: 32,
        views: 528,
        commentsCount: 0
    },
    "4": {
        id: "4",
        title: "LED大燈改裝 - 增加夜間視野安全",
        author: "夜行俠",
        avatar: "images/avatars/user4.svg",
        thumbnail: "images/community/thumb-led.jpg",
        date: "2025-04-15",
        category: "電子系統",
        tags: ["#車燈", "#LED", "#安全"],
        excerpt: "原廠的鹵素大燈在夜間騎乘時總覺得不夠亮，尤其是在沒有路燈的山路或鄉間小道。最近升級了 LED 大燈，亮度和照射範圍都有顯著提升...",
        content: "<p>原廠的鹵素大燈在夜間騎乘時總覺得不夠亮，尤其是在沒有路燈的山路或鄉間小道。最近升級了 LED 大燈，亮度和照射範圍都有顯著提升，夜間騎乘的安全性大大增加。</p><p>分享一下我選擇的 LED 大燈品牌、安裝過程以及前後比較圖。有興趣的車友可以參考看看。</p>",
        likes: 15,
        views: 267,
        commentsCount: 0
    },
    "5": {
        id: "5",
        title: "新手必學的基礎保養技巧",
        author: "技師長",
        avatar: "images/avatars/speaker1.svg",
        thumbnail: "images/community/thumb-maintenance.jpg",
        date: "2025-04-14",
        category: "保養維護",
        tags: ["#保養", "#機油", "#新手"],
        excerpt: "擁有一台摩托車是很棒的體驗，但基礎的保養知識也不可少。學會一些簡單的保養技巧，不僅能讓你的愛車保持在最佳狀態，也能省下不少保養費用。這篇文章會分享一些新手騎士必須知道的基礎保養項目...",
        content: "<p>擁有一台摩托車是很棒的體驗，但基礎的保養知識也不可少。學會一些簡單的保養技巧，不僅能讓你的愛車保持在最佳狀態，也能省下不少保養費用。</p><p>這篇文章會分享一些新手騎士必須知道的基礎保養項目，例如如何檢查更換機油、清潔鏈條、檢查胎壓等等。希望對剛加入摩托車世界的你有所幫助！</p>",
        likes: 47,
        views: 823,
        commentsCount: 0
    },
    "6": {
        id: "6",
        title: "SIMOTA碳纖維後照鏡安裝心得",
        author: "孤狼騎士",
        avatar: "images/avatars/user5.svg",
        thumbnail: "images/community/thumb-mirror.jpg",
        date: "2025-04-13",
        category: "外觀套件",
        tags: ["#碳纖維", "#後照鏡", "#SIMOTA"],
        excerpt: "最近替我的Honda CB650R換上了SIMOTA的碳纖維後照鏡，不僅大幅提升外觀質感，重量也比原廠輕了不少。這篇文章分享安裝過程與使用心得...",
        content: "<p>碳纖維後照鏡不只是外觀升級，也能降低車輛重量。我選擇SIMOTA是因為它兼顧了美觀與功能性，鏡面採用藍鏡設計，夜間行車時能有效減少後方車輛燈光刺眼的問題。</p><p>安裝過程相當簡單，只需要將原廠後照鏡卸下，轉接座對準孔位旋入即可。值得注意的是，要確保轉接座旋緊到位，避免高速行駛時產生震動。</p><p>使用一週後的感受非常正面，視野比原廠還要清晰，風阻也有些微降低。美中不足的是價格偏高，但考慮到它的做工與材質，我認為這是值得的投資。</p>",
        likes: 23,
        views: 315,
        commentsCount: 3
    },
    "7": {
        id: "7",
        title: "牛王SVR排氣管音量與性能測試",
        author: "排氣管達人",
        avatar: "images/avatars/user6.svg",
        thumbnail: "images/community/thumb-svr.jpg",
        date: "2025-04-12",
        category: "排氣系統",
        tags: ["#牛王", "#SVR", "#排氣管", "#聲浪"],
        excerpt: "牛王SVR一直是國產排氣管中的熱門選擇，價格相對親民但性能表現不俗。這次我實際測試了SVR在不同轉速下的聲浪表現與動力輸出變化...",
        content: "<p>牛王SVR排氣管是許多車友入門改裝的首選，它的價格只有進口排氣管的三分之一，但聲浪與外觀都有不錯的表現。我這次在我的Yamaha MT-07上安裝了SVR全段排氣管，並進行了一系列測試。</p><p>聲浪方面，SVR在怠速時就有明顯的低沉轟隆聲，但不會過於嘈雜。隨著轉速上升，聲浪變得更加渾厚有力，在6000轉以上時有非常爽朗的高音，但測量分貝數後發現仍在合法範圍內。</p><p>性能方面，與原廠排氣管相比，中低轉速的扭力感受有明顯提升，高轉速時馬力提升約3-4匹。搭配簡單的供油調整後，油耗反而略有改善。</p><p>總體來說，牛王SVR在性價比上非常出色，適合預算有限但又想體驗改裝排氣管樂趣的車友。</p>",
        likes: 36,
        views: 542,
        commentsCount: 5
    },
    "8": {
        id: "8",
        title: "全車貼膜改色經驗分享 - 從消光黑到電鍍藍",
        author: "改色大師",
        avatar: "images/avatars/user7.svg",
        thumbnail: "images/community/thumb-wrapping.jpg",
        date: "2025-04-10",
        category: "外觀套件",
        tags: ["#改色", "#貼膜", "#外觀", "#DIY"],
        excerpt: "想換車色但不想重新噴漆？車身貼膜是個很好的選擇！這篇文章分享我將愛車從原廠消光黑改為電鍍藍的全過程，包含材料選擇、工具準備和施工技巧...",
        content: "<p>全車貼膜是改變車輛外觀最簡單的方式之一，不需要繁瑣的噴漆程序，也不會影響車輛的原廠塗裝。我這次選擇了3M的電鍍藍膜，材質彈性好且耐候性強。</p><p>工具準備：刮板、熱風槍、美工刀、酒精、微纖維布和貼膜專用噴霧。這些工具都不貴，全部加起來約1500元左右。</p><p>貼膜前的準備工作非常重要！我花了整整一天時間徹底清洗車身，去除所有蠟和油脂，這樣才能確保膜的附著力。施工時從較平整的部位開始，如油箱側板，再逐步挑戰複雜的曲面。</p><p>最困難的部分是前土除和車頭整流罩，曲面變化大且有許多邊角，需要使用熱風槍加熱膜材使其更具延展性。整個過程耗時三天，但最終效果非常滿意，車友們都以為我重新噴漆了！</p><p>電鍍藍在不同光線下呈現不同色澤，從深藍到紫藍都有，非常炫目。而且貼膜還能保護原車漆，等厭倦了還可以撕掉換其他顏色。</p>",
        likes: 41,
        views: 678,
        commentsCount: 7
    },
    "9": {
        id: "9",
        title: "YSS避震器與Öhlins的實際騎乘比較",
        author: "避震專家",
        avatar: "images/avatars/user8.svg",
        thumbnail: "images/community/thumb-yss.jpg",
        date: "2025-04-08",
        category: "懸吊系統",
        tags: ["#YSS", "#Öhlins", "#避震器", "#懸吊調校"],
        excerpt: "YSS和Öhlins是兩個受歡迎的避震器品牌，價格差了一倍以上，但性能差距真的有那麼大嗎？這篇文章基於同一台車分別安裝兩種避震器的實際體驗...",
        content: "<p>在摩托車避震器市場中，泰國品牌YSS常被視為性價比之選，而瑞典品牌Öhlins則是高端首選。我有幸能在相同的車型上分別體驗這兩款避震器，並進行了詳細的路感與操控性比較。</p><p>測試車輛是Kawasaki Z900，測試路段包含市區道路、高速公路和山區彎道。</p><p><strong>YSS G-Sport:</strong><br>價格約15,000元，安裝簡單，預載調整和回彈阻尼都可調。市區路況表現良好，吸震效果比原廠更舒適，但高速過彎時支撐性略顯不足，需要更謹慎的騎乘方式。</p><p><strong>Öhlins STX46:</strong><br>價格約40,000元，安裝同樣簡單，但調整選項更多，包含高低速壓縮阻尼。市區路況略微偏硬但仍舒適，高速過彎時支撐性極佳，車身穩定性明顯優於YSS，能讓騎士更有信心快速過彎。</p><p>結論：如果你主要是通勤和一般休閒騎乘，YSS已經足夠，性價比極高。但如果你常跑山或參加賽道日，Öhlins的優勢就非常明顯了，它的精準路感回饋和極佳支撐性值得額外投資。</p>",
        likes: 29,
        views: 436,
        commentsCount: 4
    },
    "10": {
        id: "10",
        title: "自製冷卻風扇輔助系統 - 解決水冷車夏季過熱問題",
        author: "DIY工程師",
        avatar: "images/avatars/user9.svg",
        thumbnail: "images/community/thumb-cooling.jpg",
        date: "2025-04-05",
        category: "引擎改裝",
        tags: ["#冷卻系統", "#DIY", "#散熱", "#電子改裝"],
        excerpt: "台灣夏季炎熱，市區騎車常常遇到水冷車輛水溫過高的問題。這篇文章分享如何自製一套輔助冷卻系統，有效降低怠速和低速行駛時的水溫...",
        content: "<p>水冷摩托車在夏季塞車時容易遇到水溫過高的問題，原廠風扇有時候無法應付40度以上的高溫環境。經過一番研究，我設計了一套簡單但有效的輔助冷卻系統。</p><p><strong>材料清單：</strong></p><ul><li>12V高流量散熱風扇 x 2 (建議使用DELTA或Noctua品牌)</li><li>繼電器模組 (建議30A)</li><li>溫度感應開關 (可設定啟動溫度)</li><li>配線與防水接頭</li><li>鋁製固定支架</li></ul><p><strong>安裝步驟：</strong></p><ol><li>設計並製作鋁製支架，確保風扇固定在水箱兩側，不影響原有零件</li><li>將溫度感應開關安裝在水箱附近，確保能準確感應水溫</li><li>電源接線取自電瓶正極，經過保險絲後連接到繼電器</li><li>繼電器控制由溫度開關觸發，設定在90度啟動</li><li>測試系統功能，確保在水溫上升時自動啟動</li></ol><p>經過測試，這套系統能在原廠風扇啟動前就開始輔助散熱，有效將高溫環境下的最高水溫降低約8-10度。最棒的是，整套系統材料成本不到2000元，卻能有效解決水溫過高的困擾，特別適合經常在市區通勤的水冷車友。</p>",
        likes: 52,
        views: 734,
        commentsCount: 9
    },
    "11": {
        id: "11",
        title: "智能儀表板升級 - OBD II連接與自訂顯示功能",
        author: "科技騎士",
        avatar: "images/avatars/user10.svg",
        thumbnail: "images/community/thumb-dashboard.jpg",
        date: "2025-04-03",
        category: "電子系統",
        tags: ["#儀表板", "#OBD", "#電子改裝", "#智能系統"],
        excerpt: "現代摩托車的電子系統越來越複雜，但原廠儀表顯示的資訊常常不夠全面。這篇文章介紹如何安裝aftermarket智能儀表，實現更多數據監控和自訂功能...",
        content: "<p>原廠儀表板通常只顯示基本資訊如速度、轉速、里程和水溫，但現代車輛的ECU其實收集了更多有價值的數據。透過安裝智能儀表板，我們可以獲取這些隱藏的資訊，並實現更多個性化功能。</p><p>我選擇了RaceSens Pro智能儀表，它支援藍牙連接，能通過OBD II接口讀取車輛的所有傳感器數據。</p><p><strong>安裝過程：</strong></p><ol><li>找到車輛的OBD II診斷接口（通常在座墊下方）</li><li>安裝適配器並連接至智能儀表</li><li>使用配套的手機應用程式進行初始設置</li><li>將儀表固定在把手上的適當位置</li></ol><p><strong>主要功能：</strong></p><ul><li>即時顯示進排氣溫度、空燃比、ECU點火提前角等專業數據</li><li>加速性能測試（0-100km/h計時）</li><li>最高速度與最高轉速記錄</li><li>燃油經濟性分析</li><li>警報功能（可設定各參數的警報閾值）</li><li>騎乘數據記錄與分析</li></ul><p>這套系統最大的好處是可自訂顯示內容，我通常讓它顯示轉速、速度、進氣溫度和瞬時油耗，這些資訊對於調整騎乘方式很有幫助。系統還支援行車記錄功能，可以記錄整個旅程的數據，方便日後分析或分享。</p><p>唯一的缺點是安裝需要一定的電子知識，而且價格不菲（約15,000元），但對於喜歡掌握車輛狀態的車友來說，這絕對是值得的投資。</p>",
        likes: 38,
        views: 612,
        commentsCount: 6
    },
    "12": {
        id: "12",
        title: "輪胎選擇指南 - 米其林Road 5與倍耐力Angel GT II實測比較",
        author: "輪胎專家",
        avatar: "images/avatars/user11.svg",
        thumbnail: "images/community/thumb-tires.jpg",
        date: "2025-04-01",
        category: "保養維護",
        tags: ["#輪胎", "#米其林", "#倍耐力", "#Road5", "#AngelGT"],
        excerpt: "運動旅行胎是許多多功能車款的首選，米其林Road 5與倍耐力Angel GT II是市場上最受歡迎的兩款。這篇文章分享我在相同車輛上交替使用這兩款輪胎的實際體驗...",
        content: "<p>選擇合適的輪胎對騎乘體驗有著決定性的影響。在運動旅行胎市場中，米其林Road 5和倍耐力Angel GT II是最受歡迎的選擇，它們都宣稱提供出色的抓地力和耐久性，但實際表現如何？</p><p>測試車輛：BMW F900XR<br>測試里程：各5000公里<br>測試路況：40%市區、30%高速公路、30%山路</p><p><strong>米其林Road 5：</strong></p><ul><li>濕地抓地力：★★★★★（溝槽設計優異，即使磨損後仍維持良好排水性）</li><li>乾地抓地力：★★★★☆（轉彎信心足，但極限稍低於Angel GT II）</li><li>舒適性：★★★★☆（振動吸收良好，但高速偶有輕微漂浮感）</li><li>耐久性：★★★★★（前輪預估壽命9000公里，後輪7000公里）</li><li>價格：前輪約3,800元，後輪約5,200元</li></ul><p><strong>倍耐力Angel GT II：</strong></p><ul><li>濕地抓地力：★★★★☆（優秀但新胎和磨損後的表現差異較大）</li><li>乾地抓地力：★★★★★（尤其在高速過彎時信心十足）</li><li>舒適性：★★★★★（震動抑制出色，高速穩定性佳）</li><li>耐久性：★★★★☆（前輪預估壽命8000公里，後輪6000公里）</li><li>價格：前輪約3,600元，後輪約4,900元</li></ul><p><strong>結論：</strong><br>如果你的騎乘路況常遇到雨天，或注重耐久性，米其林Road 5是更好的選擇。如果你喜歡運動化騎乘，經常在乾燥路面上跑山，倍耐力Angel GT II會提供更好的感受。價格方面，倍耐力略便宜一些，但考慮到米其林的更長壽命，長期成本其實差不多。</p><p>無論選擇哪一款，它們都比原廠配胎有明顯的提升，絕對是值得的升級。</p>",
        likes: 45,
        views: 716,
        commentsCount: 8
    },
    "13": {
        id: "13",
        title: "Power Commander V 調校心得 - 如何提升動力並改善油耗",
        author: "引擎調校師",
        avatar: "images/avatars/user12.svg",
        thumbnail: "images/community/thumb-pcv.jpg",
        date: "2025-03-30",
        category: "引擎改裝",
        tags: ["#電腦調校", "#Power Commander", "#動力提升", "#油耗"],
        excerpt: "Power Commander是最常見的ECU調校工具，但很多車友不知道如何發揮它的最大效益。本文分享我多年來使用PCV的經驗，以及如何兼顧動力和油耗的調校技巧...",
        content: "<p>Power Commander V (PCV)是目前市場上最受歡迎的摩托車供油電腦，它可以攔截並修改ECU的信號，達到調整供油和點火時間的目的。許多車友安裝後只是下載網路上的地圖檔，但其實每台車都應該進行個別化調校。</p><p><strong>調校前的準備工作：</strong></p><ol><li>確保車輛已完成基本改裝（排氣管、進氣系統等）</li><li>車輛充分暖機，達到正常工作溫度</li><li>使用高辛烷值汽油（建議95以上）</li><li>準備好數據記錄設備（如氧傳感器或寬頻空燃比表）</li></ol><p><strong>調校過程：</strong></p><p>我的調校理念是在低轉速區域（怠速至4000轉）略為稀釋混合比，提高燃油經濟性；在中轉速區域（4000-7000轉）維持理想空燃比13.5:1左右；在高轉速區域（7000轉以上）略為濃化至12.8:1左右，保護引擎並提供最大動力。</p><p>點火提前角調整同樣重要，適當提前點火可以提升扭力，但過度提前會導致爆震。我的建議是在中低轉速區域嘗試提前1-3度，高轉速區域保持原廠設定或略微延後。</p><p><strong>調校成果：</strong></p><p>在我的Yamaha MT-09上，經過精細調校後，低轉速的油耗改善約10%，而高轉速區域的動力提升約5-8%。更重要的是，油門反應更加線性，沒有原廠設定中常見的突然加速或遲滯現象。</p><p>最後提醒：調校是一個耗時的過程，需要反覆測試和修改。如果沒有專業設備和知識，建議尋求專業調校師協助，避免過度濃混合比導致的排氣閥積碳或過度稀混合比導致的引擎過熱問題。</p>",
        likes: 63,
        views: 892,
        commentsCount: 11
    }
};

async function migrateCommunityPosts() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('已連接到 MongoDB');
        
        const db = client.db(DB_NAME);
        const collection = db.collection('posts');
        
        // 清空現有的貼文資料
        console.log('清空現有貼文資料...');
        await collection.deleteMany({});
        
        // 轉換模擬資料為資料庫格式
        const posts = Object.values(mockDiscussionsDB).map(post => {
            // 處理標籤，移除 # 符號
            const cleanTags = post.tags.map(tag => tag.replace('#', ''));
            
            return {
                title: post.title,
                content: post.content,
                category: post.category,
                tags: cleanTags,
                author: post.author,
                authorId: null, // 暫時設為null，因為沒有真實的用戶ID
                createdAt: new Date(post.date),
                updatedAt: new Date(post.date),
                likes: post.likes || 0,
                views: post.views || 0,
                commentCount: post.commentsCount || 0,
                comments: [], // 空的評論陣列
                excerpt: post.excerpt,
                thumbnail: post.thumbnail,
                avatar: post.avatar,
                isActive: true,
                isPinned: false
            };
        });
        
        // 插入貼文到資料庫
        console.log(`準備插入 ${posts.length} 篇貼文...`);
        const result = await collection.insertMany(posts);
        console.log(`成功插入 ${result.insertedCount} 篇貼文`);
        
        // 建立文字搜尋索引
        console.log('建立文字搜尋索引...');
        try {
            await collection.createIndex({
                title: "text",
                content: "text",
                tags: "text",
                category: "text"
            }, {
                name: "posts_text_search",
                default_language: "none"
            });
            console.log('文字搜尋索引建立成功');
        } catch (indexError) {
            if (indexError.message.includes('already exists')) {
                console.log('文字搜尋索引已存在，跳過建立');
            } else {
                console.error('建立索引時發生錯誤:', indexError.message);
            }
        }
        
        // 建立其他索引
        await collection.createIndex({ category: 1 });
        await collection.createIndex({ createdAt: -1 });
        await collection.createIndex({ author: 1 });
        await collection.createIndex({ tags: 1 });
        
        // 統計結果
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalLikes: { $sum: '$likes' },
                    totalViews: { $sum: '$views' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).toArray();
        
        console.log('\n貼文統計:');
        stats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} 篇貼文, ${stat.totalLikes} 個讚, ${stat.totalViews} 次瀏覽`);
        });
        
        const totalPosts = await collection.countDocuments();
        console.log(`\n總貼文數: ${totalPosts}`);
        
        console.log('\n社群貼文遷移完成！');
        
    } catch (error) {
        console.error('遷移貼文時發生錯誤:', error);
    } finally {
        await client.close();
    }
}

// 執行遷移
migrateCommunityPosts(); 