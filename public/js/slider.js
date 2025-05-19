/**
 * 圖片輪播功能
 * 提供響應式、觸控支援的圖片輪播功能
 */
class ImageSlider {
    constructor(sliderSelector) {
        this.slider = document.querySelector(sliderSelector);
        if (!this.slider) return;
        
        this.slides = this.slider.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.isAutoPlaying = true;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        // 創建導航點
        this.createNavDots();
        
        // 創建上一張/下一張按鈕
        this.createNavButtons();
        
        // 設定初始狀態
        this.goToSlide(0);
        
        // 開始自動播放
        this.startAutoplay();
        
        // 滑鼠懸停時暫停輪播
        this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.slider.addEventListener('mouseleave', () => this.startAutoplay());
        
        // 添加觸控支援
        this.initTouchSupport();
        
        // 添加鍵盤支援
        this.initKeyboardSupport();
        
        // 添加 ResizeObserver 以處理視窗大小變化
        this.initResizeObserver();
    }
    
    createNavDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        
        for (let i = 0; i < this.slides.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('aria-label', `前往第 ${i + 1} 張圖片`);
            dot.addEventListener('click', () => {
                this.pauseAutoplay();
                this.goToSlide(i);
                this.startAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
        
        this.slider.appendChild(dotsContainer);
        this.dots = dotsContainer.querySelectorAll('.slider-dot');
    }
    
    createNavButtons() {
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-nav prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.setAttribute('aria-label', '上一張圖片');
        prevButton.addEventListener('click', () => {
            this.pauseAutoplay();
            this.prevSlide();
            this.startAutoplay();
        });
        
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-nav next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.setAttribute('aria-label', '下一張圖片');
        nextButton.addEventListener('click', () => {
            this.pauseAutoplay();
            this.nextSlide();
            this.startAutoplay();
        });
        
        this.slider.appendChild(prevButton);
        this.slider.appendChild(nextButton);
    }
    
    goToSlide(index) {
        // 更新當前幻燈片
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.setAttribute('aria-hidden', i !== index);
            
            // 設定過渡方向
            if (i === index) {
                slide.style.transform = 'translateX(0)';
                slide.style.opacity = '1';
            } else {
                const direction = i < index ? -100 : 100;
                slide.style.transform = `translateX(${direction}%)`;
                slide.style.opacity = '0';
            }
        });
        
        // 更新導航點
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
        
        this.currentSlide = index;
        
        // 發送自定義事件
        this.slider.dispatchEvent(new CustomEvent('slideChange', {
            detail: { currentSlide: index }
        }));
    }
    
    nextSlide() {
        const newIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(newIndex);
    }
    
    prevSlide() {
        const newIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(newIndex);
    }
    
    startAutoplay() {
        if (!this.isAutoPlaying) {
            this.isAutoPlaying = true;
            this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
        }
    }
    
    pauseAutoplay() {
        if (this.isAutoPlaying) {
            this.isAutoPlaying = false;
            clearInterval(this.autoplayInterval);
        }
    }
    
    initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            this.pauseAutoplay();
        }, { passive: true });
        
        this.slider.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
            
            // 計算滑動距離並應用即時效果
            const diff = touchEndX - touchStartX;
            const currentSlide = this.slides[this.currentSlide];
            const threshold = this.slider.offsetWidth * 0.3;
            
            if (Math.abs(diff) < threshold) {
                currentSlide.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: true });
        
        this.slider.addEventListener('touchend', () => {
            const diff = touchEndX - touchStartX;
            const threshold = this.slider.offsetWidth * 0.3;
            
            if (diff > threshold) {
                this.prevSlide();
            } else if (diff < -threshold) {
                this.nextSlide();
            } else {
                // 回到原位
                this.goToSlide(this.currentSlide);
            }
            
            this.startAutoplay();
        });
    }
    
    initKeyboardSupport() {
        this.slider.setAttribute('tabindex', '0');
        this.slider.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.pauseAutoplay();
                    this.prevSlide();
                    this.startAutoplay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.pauseAutoplay();
                    this.nextSlide();
                    this.startAutoplay();
                    break;
            }
        });
    }
    
    initResizeObserver() {
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    // 重新計算並應用尺寸
                    this.slides.forEach(slide => {
                        slide.style.width = `${entry.contentRect.width}px`;
                    });
                }
            });
            
            observer.observe(this.slider);
        }
    }
}

// 初始化頁面上的所有滑塊
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.image-slider');
    sliders.forEach(slider => {
        new ImageSlider(slider);
    });
}); 