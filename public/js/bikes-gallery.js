/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
document.addEventListener('DOMContentLoaded', function() {
    // 全局變量
    let currentModel = 'all';
    let currentCategory = 'all';
    let imagesData = [];
    
    // 選擇器
    const galleryGrid = document.getElementById('gallery-grid');
    const modelButtons = document.querySelectorAll('.model-button');
    const categoryButtons = document.querySelectorAll('.category-button');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    
    // 從API獲取圖片數據
    async function fetchImages() {
        try {
            galleryGrid.innerHTML = `
                <div class="loader">
                    <i class="fas fa-spinner"></i>
                </div>
            `;
            
            const response = await fetch(`/api/bikes/images?model=${currentModel}&category=${currentCategory}`);
            const data = await response.json();
            
            imagesData = data.images || [];
            renderGallery();
        } catch (error) {
            console.error('獲取圖片失敗:', error);
            galleryGrid.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>獲取圖片時出錯，請稍後再試</p>
                </div>
            `;
        }
    }
    
    // 渲染圖片庫
    function renderGallery() {
        if (imagesData.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-image"></i>
                    <p>未找到符合條件的圖片</p>
                </div>
            `;
            return;
        }
        
        galleryGrid.innerHTML = '';
        
        // 遍歷圖片數據並創建圖片項目
        imagesData.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.model = image.model;
            item.dataset.category = image.category;
            
            // 從類別生成描述
            const description = getImageDescription(image.category);
            
            item.innerHTML = `
                <img class="gallery-image" src="${image.url}" alt="${image.title}">
                <div class="gallery-caption">
                    <h3>${image.title}</h3>
                    <p>${description}</p>
                </div>
            `;
            
            // 為圖片添加點擊事件（燈箱）
            const img = item.querySelector('.gallery-image');
            img.addEventListener('click', function() {
                lightboxImg.src = this.src;
                lightboxCaption.textContent = image.title;
                lightbox.style.display = 'flex';
            });
            
            // 添加錯誤處理，如果圖片加載失敗，顯示佔位圖
            img.onerror = function() {
                this.src = 'https://picsum.photos/id/133/500/300';
                this.alt = '圖片加載失敗';
            };
            
            galleryGrid.appendChild(item);
        });
    }
    
    // 獲取圖片描述
    function getImageDescription(category) {
        const descriptions = {
            '原廠': [
                '原廠標準配置',
                '出廠狀態',
                '官方形象',
                '原廠設計',
                '標準款'
            ],
            '改裝整車': [
                '專業全車改裝',
                '街頭風格改造',
                '賽道改裝',
                '都會風格定製',
                '個性化設計'
            ]
        };
        
        // 檢查是否是改裝零件
        if (category.startsWith('改裝零件-')) {
            const partName = category.replace('改裝零件-', '');
            const partDescriptions = {
                '排氣管': [
                    'Akrapovic 鈦合金排氣管',
                    'SC Project 競技排氣',
                    'Yoshimura RS4 排氣',
                    'Two Brothers 碳纖維排氣',
                    'Arrow 競技款排氣'
                ],
                '前叉': [
                    'Ohlins 前叉套件',
                    'Showa 前叉改裝',
                    'YSS 可調式前叉',
                    'Andreani 前叉內閥組',
                    'K-Tech 前叉彈簧'
                ],
                '避震器': [
                    'Ohlins S36 後避震',
                    'YSS 氮氣避震器',
                    'RCB 後避震器',
                    'KYB 競技版避震',
                    'WP 氮氣避震'
                ],
                '車殼': [
                    '碳纖維車殼組',
                    '競技款整流罩',
                    '客製化彩繪車殼',
                    '輕量化車殼套件',
                    'ABS 材質車殼'
                ],
                '車燈': [
                    'LED 魚眼大燈',
                    '天使眼 LED 頭燈',
                    '動態方向燈',
                    '整合式尾燈',
                    'LED 序列式方向燈'
                ],
                '輪圈': [
                    'Marchesini 鍛造輪圈',
                    'OZ Racing 輕量化輪圈',
                    'ENKEI 鋁合金輪圈',
                    'PVM 賽道版輪圈',
                    'Wukawa 鍛造輪圈'
                ],
                '輪胎': [
                    'Pirelli Diablo Rosso',
                    'Michelin Power 5',
                    'Dunlop SportSmart TT',
                    'Bridgestone S22',
                    'Continental ContiRoad'
                ],
                '煞車系統': [
                    'Brembo 對向四活塞卡鉗',
                    'Galfer 浪花碟盤套件',
                    'HEL 不銹鋼煞車油管',
                    'Nissin 前煞車卡鉗',
                    'EBC 高性能來令片'
                ]
            };
            
            if (partDescriptions[partName]) {
                const randomIndex = Math.floor(Math.random() * partDescriptions[partName].length);
                return partDescriptions[partName][randomIndex];
            }
        }
        
        // 如果有對應類別的描述，隨機選擇一個
        if (descriptions[category]) {
            const randomIndex = Math.floor(Math.random() * descriptions[category].length);
            return descriptions[category][randomIndex];
        }
        
        // 默認描述
        return '摩托車配件';
    }
    
    // 模型按鈕點擊事件
    modelButtons.forEach(button => {
        button.addEventListener('click', function() {
            modelButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentModel = this.dataset.model;
            fetchImages();
        });
    });
    
    // 類別按鈕點擊事件
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            fetchImages();
        });
    });
    
    // 燈箱關閉事件
    lightboxClose.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
    
    // 初始化加載
    fetchImages();
}); 