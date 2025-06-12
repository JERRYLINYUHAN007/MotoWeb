/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
/**
 * MotoWeb Showcase Page Functionality
 * Handles modification showcase display, filtering, and interactions
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize comparison sliders
    initializeComparisonSliders();
    
    // Initialize advanced search panel
    initializeAdvancedSearch();
    
    // Initialize showcase card click events
    initializeShowcaseCards();
    
    // Initialize load more functionality
    initializeLoadMore();
    
    // Initialize filtering functionality
    initializeFilters();
});

// Before/after comparison slider functionality
function initializeComparisonSliders() {
    document.querySelectorAll('.comparison-slider').forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('img:last-child');
        let isDragging = false;

        const moveSlider = (e) => {
            if (!isDragging) return;
            
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            handle.style.left = `${percentage}%`;
            afterImage.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        };

        handle.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mousemove', moveSlider);
        window.addEventListener('mouseup', () => isDragging = false);
        
        // Touch support
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            
            handle.style.left = `${percentage}%`;
            afterImage.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
        });
        
        window.addEventListener('touchend', () => isDragging = false);
    });
}

// Advanced search panel functionality
function initializeAdvancedSearch() {
    const advancedSearchBtn = document.querySelector('.advanced-search-btn');
    const advancedSearchPanel = document.querySelector('.advanced-search-panel');
    
    if (advancedSearchBtn && advancedSearchPanel) {
        advancedSearchBtn.addEventListener('click', () => {
            advancedSearchPanel.style.display = 
                advancedSearchPanel.style.display === 'none' ? 'block' : 'none';
            advancedSearchBtn.textContent = 
                advancedSearchPanel.style.display === 'none' ? 'Advanced Search' : 'Hide Advanced Search';
        });
    }
}

// Showcase card click events
function initializeShowcaseCards() {
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.close-modal');
    
    document.querySelectorAll('.showcase-card').forEach(card => {
        card.addEventListener('click', () => {
            const showcaseId = card.dataset.showcaseId;
            loadShowcaseDetails(showcaseId);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Load showcase details
async function loadShowcaseDetails(showcaseId) {
    try {
        const response = await fetch(`/api/showcase/${showcaseId}`);
        const data = await response.json();
        
        updateModalContent(data);
        initializeGallery(data.images);
    } catch (error) {
        console.error('Error loading showcase details:', error);
    }
}

// Update modal content
function updateModalContent(data) {
    const modalContent = document.querySelector('.modal-content');
    
    // Update showcase details
    // This needs to be adjusted based on the actual API data structure
    modalContent.querySelector('.showcase-title').textContent = data.title;
    modalContent.querySelector('.author-name').textContent = data.author;
    modalContent.querySelector('.project-description').textContent = data.description;
    
    // Update parts list
    const partsList = modalContent.querySelector('.parts-list');
    partsList.innerHTML = data.parts.map(part => `
        <div class="part-item">
            <span>${part.name}</span>
            <span>${part.price}</span>
        </div>
    `).join('');
    
    // Update specifications
    const specs = modalContent.querySelector('.specs');
    specs.innerHTML = Object.entries(data.specifications).map(([key, value]) => `
        <div class="spec-item">
            <label>${key}</label>
            <span>${value}</span>
        </div>
    `).join('');
}

// Initialize gallery
function initializeGallery(images) {
    const mainImage = document.querySelector('.main-image img');
    const thumbnailStrip = document.querySelector('.thumbnail-strip');
    const prevBtn = document.querySelector('.gallery-nav .prev');
    const nextBtn = document.querySelector('.gallery-nav .next');
    
    let currentImageIndex = 0;
    
    // Update thumbnail strip
    thumbnailStrip.innerHTML = images.map((image, index) => `
        <img src="${image}" alt="Gallery thumbnail ${index + 1}"
             class="${index === 0 ? 'active' : ''}"
             onclick="changeMainImage(${index})">
    `).join('');
    
    // Update main image
    function updateMainImage() {
        mainImage.src = images[currentImageIndex];
        thumbnailStrip.querySelectorAll('img').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // Image switching events
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateMainImage();
    });
    
    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateMainImage();
    });
    
    // Thumbnail click event
    window.changeMainImage = (index) => {
        currentImageIndex = index;
        updateMainImage();
    };
}

// Load more functionality
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let page = 1;
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/showcase?page=${++page}`);
                const data = await response.json();
                
                if (data.showcases.length > 0) {
                    appendShowcases(data.showcases);
                    initializeComparisonSliders();
                    initializeShowcaseCards();
                }
                
                if (data.isLastPage) {
                    loadMoreBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error loading more showcases:', error);
            }
        });
    }
}

// Add new showcase cards
function appendShowcases(showcases) {
    const showcaseGrid = document.querySelector('.showcase-grid');
    
    showcases.forEach(showcase => {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.dataset.showcaseId = showcase.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="comparison-slider">
                    <img src="${showcase.beforeImage}" alt="Before modification">
                    <img src="${showcase.afterImage}" alt="After modification">
                    <div class="slider-handle"></div>
                </div>
            </div>
            <div class="card-body">
                <h3>${showcase.title}</h3>
                <div class="card-meta">
                    <span>${showcase.author}</span>
                    <span>${showcase.date}</span>
                </div>
                <p class="card-description">${showcase.description}</p>
                <div class="card-stats">
                    <span>👍 ${showcase.likes}</span>
                    <span>💬 ${showcase.comments}</span>
                    <span>⭐ ${showcase.rating}</span>
                </div>
            </div>
        `;
        
        showcaseGrid.appendChild(card);
    });
}

// Initialize filtering functionality
function initializeFilters() {
    const filterForm = document.querySelector('.search-filters form');
    const searchInput = document.querySelector('.search-bar input');
    let filterTimeout;
    
    // Search input debouncing
    searchInput.addEventListener('input', () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            filterForm.dispatchEvent(new Event('submit'));
        }, 500);
    });
    
    // Filter form submission
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const queryParams = new URLSearchParams(formData);
        
        try {
            const response = await fetch(`/api/showcase/filter?${queryParams}`);
            const data = await response.json();
            
            const showcaseGrid = document.querySelector('.showcase-grid');
            showcaseGrid.innerHTML = '';
            
            if (data.showcases.length > 0) {
                appendShowcases(data.showcases);
                initializeComparisonSliders();
                initializeShowcaseCards();
            } else {
                showcaseGrid.innerHTML = '<p class="no-results">No modification cases found matching your criteria</p>';
            }
        } catch (error) {
            console.error('Error filtering showcases:', error);
        }
    });
    
    // Listen for filter changes
    document.querySelectorAll('.filter-group select').forEach(select => {
        select.addEventListener('change', () => {
            filterForm.dispatchEvent(new Event('submit'));
        });
    });
}

// Showcase case data
const showcaseItems = [
    {
        id: 1,
        title: 'SYM DRG Sport Modification',
        image: 'images/bikes/DRG.jpg',
        author: {
            name: 'Jack',
            avatar: 'images/avatars/user1.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM DRG',
        description: 'Upgraded LED headlight, sport exhaust system and suspension for improved handling and appearance.',
        date: '2025-04-10',
        tags: ['LED Headlight', 'Exhaust', 'Suspension', 'SYM'],
        stats: {
            likes: 120,
            comments: 8,
            views: 500
        }
    },
    {
        id: 2,
        title: 'SYM MMBCU Daily Commute Modification',
        image: 'images/bikes/MMBCU.jpg',
        author: {
            name: 'Mike',
            avatar: 'images/avatars/user2.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM MMBCU',
        description: 'Installed LED turn signals and sport rear shock absorber, balancing safety and comfort.',
        date: '2025-04-09',
        tags: ['Turn Signals', 'Shock Absorber', 'SYM'],
        stats: {
            likes: 85,
            comments: 5,
            views: 320
        }
    },
    {
        id: 3,
        title: 'SYM SL Street Style Modification',
        image: 'images/bikes/JET.jpg',
        author: {
            name: 'Amy',
            avatar: 'images/avatars/user3.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM SL',
        description: 'Exterior upgrades and exhaust modification to showcase personal style.',
        date: '2025-04-08',
        tags: ['Exterior', 'Exhaust', 'SYM'],
        stats: {
            likes: 60,
            comments: 3,
            views: 210
        }
    },
    {
        id: 4,
        title: 'SYM SR Urban Commute Modification',
        image: 'images/bikes/JET.jpg',
        author: {
            name: 'Hong',
            avatar: 'images/avatars/user4.jpg'
        },
        category: 'scooter',
        style: 'street',
        model: 'SYM SR',
        description: 'Added LED headlight and shock absorbers to improve night safety and comfort.',
        date: '2025-04-07',
        tags: ['LED Headlight', 'Shock Absorber', 'SYM'],
        stats: {
            likes: 45,
            comments: 2,
            views: 150
        }
    }
]; 