/**
 * Image Slider Functionality
 * Provides responsive, touch-supported image slider functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
});

// Initialize all sliders on the page
function initializeSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        new Slider(slider);
    });
}

// Slider class
class Slider {
    constructor(element) {
        this.element = element;
        this.slides = element.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.isAnimating = false;
        
        // Set initial state
        this.init();
        this.bindEvents();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        // Create navigation dots
        this.createDots();
        
        // Set first slide as active
        this.updateSlide();
        
        // Start autoplay if enabled
        if (this.element.dataset.autoplay !== 'false') {
            this.startAutoplay();
        }
    }
    
    bindEvents() {
        // Previous/Next buttons
        const prevBtn = this.element.querySelector('.prev');
        const nextBtn = this.element.querySelector('.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch support
        this.addTouchSupport();
        
        // Pause autoplay on hover
        this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
    }
    
    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        
        this.element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.element.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const difference = startX - endX;
            
            if (Math.abs(difference) > 50) {
                if (difference > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }
    
    // Update current slide
    updateSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Set transition direction
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else if (index < this.currentIndex) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });
        
        // Update navigation dots
        this.updateDots();
        
        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }
    
    createDots() {
        const dotsContainer = this.element.querySelector('.slider-dots');
        if (!dotsContainer || this.slides.length <= 1) return;
        
        dotsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => this.goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }
    
    updateDots() {
        const dots = this.element.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlide();
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlide();
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateSlide();
    }
    
    startAutoplay() {
        const interval = parseInt(this.element.dataset.interval) || 5000;
        this.autoplayTimer = setInterval(() => {
            this.nextSlide();
        }, interval);
    }
    
    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }
    }
    
    resumeAutoplay() {
        if (this.element.dataset.autoplay !== 'false') {
            this.startAutoplay();
        }
    }
    
    destroy() {
        this.pauseAutoplay();
        // Remove event listeners and clean up
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Slider;
} 