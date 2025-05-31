/**
 * MotoWeb Main JavaScript Functions
 * Handles navigation, scroll effects, dynamic content loading, etc.
 */

// Execute after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initMobileNav();
    initBackToTop();
    initSmoothScrolling();
    initCardAnimations();
    loadDiscussions();
    initNewsletterForm();
    initPageTransitions();
    initHeroSlider();
});

/**
 * Initialize mobile navigation menu
 */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Set ARIA attributes
            const isExpanded = menuToggle.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Toggle hamburger menu animation
            const bars = menuToggle.querySelectorAll('.bar');
            bars[0].style.transform = isExpanded ? 'rotate(45deg) translate(5px, 5px)' : '';
            bars[1].style.opacity = isExpanded ? '0' : '1';
            bars[2].style.transform = isExpanded ? 'rotate(-45deg) translate(7px, -6px)' : '';
            
            // Prevent background scrolling
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
        
        // Close menu when clicking nav links
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', false);
                    document.body.style.overflow = '';
                    
                    // Reset hamburger menu animation
                    const bars = menuToggle.querySelectorAll('.bar');
                    bars.forEach(bar => bar.style.transform = '');
                    bars[1].style.opacity = '1';
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
                document.body.style.overflow = '';
                
                // Reset hamburger menu animation
                const bars = menuToggle.querySelectorAll('.bar');
                bars.forEach(bar => bar.style.transform = '');
                bars[1].style.opacity = '1';
            }
        });
    }
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Use throttle function to optimize scroll event
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 300) {
                        backToTopButton.classList.add('visible');
                    } else {
                        backToTopButton.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Add keyboard support
        backToTopButton.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * Initialize smooth scrolling
 */
function initSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without scrolling
                history.pushState(null, '', targetId);
                
                // Set focus
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * Initialize card animation effects
 */
function initCardAnimations() {
    if ('IntersectionObserver' in window) {
        const cards = document.querySelectorAll('.featured-card, .discussion-card, .category-card');
        
        if (cards.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            cards.forEach(card => {
                card.classList.add('fade-in');
                observer.observe(card);
            });
        }
    }
}

/**
 * Load latest discussions from API
 */
function loadDiscussions() {
    const discussionList = document.querySelector('.discussion-list');
    
    if (!discussionList || window.location.pathname !== '/index.html') {
        return;
    }
    
    // Add loading state
    discussionList.innerHTML = '<div class="loading">Loading...</div>';
    
    // Simulate API request
    setTimeout(() => {
        const mockDiscussions = [
            {
                id: 1,
                title: 'Electronic Suspension System Experience',
                excerpt: 'Recently installed an electronic suspension system, significant improvements in both comfort and handling. Want to share some installation and setup tips...',
                user: {
                    name: 'RideMaster',
                    avatar: 'images/user-avatar1.webp'
                },
                stats: {
                    replies: 32,
                    views: 256
                },
                timestamp: '3 hours ago'
            },
            {
                id: 2,
                title: 'Top Modification Parts and Tech Trends 2025',
                excerpt: 'Compiled a comprehensive list of premium modification parts and innovative technologies launching this year. Let\'s discuss the future of motorcycle mods...',
                user: {
                    name: 'SpeedHunter',
                    avatar: 'images/user-avatar2.webp'
                },
                stats: {
                    replies: 47,
                    views: 378
                },
                timestamp: 'Yesterday'
            }
        ];
        
        // Clear loading state
        discussionList.innerHTML = '';
        
        // Render discussion cards
        mockDiscussions.forEach(discussion => {
            const discussionCard = document.createElement('article');
            discussionCard.className = 'discussion-card fade-in';
            
            discussionCard.innerHTML = `
                <div class="user-info">
                    <img src="${discussion.user.avatar}" alt="${discussion.user.name}'s avatar" class="user-avatar" loading="lazy">
                    <div class="user-meta">
                        <h4>${discussion.user.name}</h4>
                        <span>${discussion.timestamp}</span>
                    </div>
                </div>
                <h3 class="discussion-title">${discussion.title}</h3>
                <p class="discussion-excerpt">${discussion.excerpt}</p>
                <div class="discussion-meta">
                    <span><i class="fas fa-comment"></i> ${discussion.stats.replies} replies</span>
                    <span><i class="fas fa-eye"></i> ${discussion.stats.views} views</span>
                    <a href="discussion.html?id=${discussion.id}" class="discussion-link">Join discussion</a>
                </div>
            `;
            
            discussionList.appendChild(discussionCard);
        });
        
        // Initialize animations for newly added cards
        initCardAnimations();
        
    }, 1000); // Simulate network delay
}

/**
 * Initialize newsletter subscription form
 */
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (emailInput && emailInput.value) {
                // Disable form elements
                emailInput.disabled = true;
                submitButton.disabled = true;
                submitButton.innerHTML = 'Subscribing...';
                
                // Simulate API request
                setTimeout(() => {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'newsletter-success';
                    successMessage.innerHTML = 'Thank you for subscribing!';
                    form.appendChild(successMessage);
                    
                    // Reset form
                    emailInput.value = '';
                    emailInput.disabled = false;
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Subscribe';
                    
                    // Remove success message after 3 seconds
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
                }, 1500);
            }
        });
    }
}

/**
 * Initialize page transition effects
 */
function initPageTransitions() {
    const body = document.body;
    
    // Add animation when entering page
    body.classList.add('fade-in');
    
    // Add animation when leaving page
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a'); // Use closest to handle clicks on elements inside a tag
        
        if (target && 
            target.hostname === window.location.hostname && 
            target.getAttribute('target') !== '_blank' &&
            !target.hasAttribute('download')) {
            
            e.preventDefault();
            const href = target.getAttribute('href');
            
            // Add fade out animation
            body.classList.add('fade-out');
            
            // Navigate to new page after animation ends
            setTimeout(function() {
                window.location.href = href;
            }, 300);
        }
    });
}

// Homepage slider functionality
function initHeroSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slider-slide');
    const prevBtn = document.querySelector('.slider-control.prev');
    const nextBtn = document.querySelector('.slider-control.next');
    
    if (!sliderTrack || slides.length === 0) return;
    
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoplayInterval;
    
    // Update slider position
    function updateSliderPosition() {
        sliderTrack.style.transform = `translateX(-${currentIndex * 25}%)`;
    }
    
    // Update button state
    function updateButtonState() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === slideCount - 1;
    }
    
    // Start autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentIndex < slideCount - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSliderPosition();
            updateButtonState();
        }, 5000);
    }
    
    // Stop autoplay
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Previous slide
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
            updateButtonState();
        }
    });
    
    // Next slide
    nextBtn.addEventListener('click', () => {
        if (currentIndex < slideCount - 1) {
            currentIndex++;
            updateSliderPosition();
            updateButtonState();
        }
    });
    
    // Initialize
    updateSliderPosition();
    updateButtonState();
    startAutoplay();
    
    // Pause autoplay on hover
    sliderTrack.addEventListener('mouseenter', stopAutoplay);
    sliderTrack.addEventListener('mouseleave', startAutoplay);
} 