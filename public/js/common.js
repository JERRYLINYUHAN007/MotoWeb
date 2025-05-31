// Insert navigation bar (only for pages without a navbar)
function insertNavbar() {
    // Check if page already has a navbar, if so, skip insertion
    if (document.querySelector('.navbar')) {
        console.log('Page already has a navbar, skipping dynamic insertion');
        return;
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    
    if (isLoggedIn) {
        // Logged in navbar structure
        navbar.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="logo">
                    <img src="/MOTOWEB.png" alt="MotoWeb Logo">
                    <span>MotoWeb</span>
                </a>
                
                <div class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                
                <div class="nav-links">
                    <a href="/">Home</a>
                    <a href="/products.html">Modification Parts</a>
                    <a href="/community.html">Community</a>
                    <a href="/showcase.html">Gallery</a>
                    <a href="/events.html">Events</a>
                </div>

                <div class="user-actions"> 
                    <div class="user-menu">
                        <img src="/images/default-avatar.svg" alt="User Avatar" class="avatar">
                        <div class="dropdown-menu">
                            <a href="/profile.html">Profile</a>
                            <a href="/garage.html">My Garage</a>
                            <a href="/settings.html">Settings</a>
                            <a href="#" id="logout">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Not logged in navbar
        navbar.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="logo">
                    <img src="/MOTOWEB.png" alt="MotoWeb Logo">
                    <span>MotoWeb</span>
                </a>
                
                <div class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                
                <div class="nav-links">
                    <a href="/" class="active">Home</a>
                    <a href="/showcase.html">Gallery</a>
                    <a href="/products.html">Parts Shop</a>
                    <a href="/community.html">Forum</a>
                    <a href="/bikes-gallery.html">Bike Gallery</a>
                    <a href="/garage.html">Garage</a>
                </div>
                
                <div class="user-actions">
                    <a href="/login.html" class="login-btn">Login</a>
                    <a href="/register.html" class="signup-btn">Register</a>
                </div>
            </div>
        `;
    }
    
    document.body.insertBefore(navbar, document.body.firstChild);
    
    // If user is logged in, setup logout functionality
    if (isLoggedIn) {
        setupLogout();
    }
}

// Setup logout functionality - now handled by auth-state.js, function kept for compatibility
function setupLogout() {
    console.log('common.js setupLogout called, but handled by auth-state.js');
    // Logout logic now handled by auth-state.js
    
    // Old implementation removed to avoid conflicts
    /*
    const logoutButton = document.getElementById('logout');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear login state
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            
            // Show logout success message
            alert('Successfully logged out!');
            
            // Redirect to homepage
            setTimeout(function() {
                window.location.href = '/';
            }, 500);
        });
    }
    */
}

// Insert footer
function insertFooter() {
    // Check if page already has a footer
    if (document.querySelector('.footer')) {
        return;
    }
    
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h3>About Us</h3>
                <ul>
                    <li><a href="/about.html">Company</a></li>
                    <li><a href="/contact.html">Contact</a></li>
                    <li><a href="/careers.html">Careers</a></li>
                    <li><a href="/press.html">Press</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Services</h3>
                <ul>
                    <li><a href="/showcase.html">Gallery</a></li>
                    <li><a href="/products.html">Parts Shop</a></li>
                    <li><a href="/community.html">Forum</a></li>
                    <li><a href="/garage.html">Garage</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Help Center</h3>
                <ul>
                    <li><a href="/faq.html">FAQ</a></li>
                    <li><a href="/shipping.html">Shipping</a></li>
                    <li><a href="/returns.html">Returns</a></li>
                    <li><a href="/privacy.html">Privacy Policy</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Follow Us</h3>
                <ul>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">YouTube</a></li>
                    <li><a href="#">Line</a></li>
                </ul>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2024 MotoWeb. All rights reserved.</p>
        </div>
    `;
    document.body.appendChild(footer);
}

// Initialize navigation functionality
function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Set current page's navigation link as active
    const currentPath = window.location.pathname;
    const navAnchors = document.querySelectorAll('.nav-links a');
    
    navAnchors.forEach(anchor => {
        if (anchor.getAttribute('href') === currentPath) {
            anchor.classList.add('active');
        } else {
            anchor.classList.remove('active');
        }
    });
}

/**
 * Initialize page transitions
 */
function initPageTransitions() {
    const body = document.body;

    // Add animation when entering page
    body.classList.add('fade-in');

    // Link click handling - Internal logic removed due to navigation issues
    // Structure kept for potential future transition redesign
    // document.addEventListener('click', function(e) {
    //     const targetLink = e.target.closest('a');

    //     if (targetLink && targetLink.href && 
    //         targetLink.hostname === window.location.hostname && // Ensure same-site link
    //         targetLink.getAttribute('target') !== '_blank' && // Not opening in new tab
    //         !targetLink.href.includes('#') && // Not anchor link
    //         !targetLink.hasAttribute('download') && // Not download link
    //         !targetLink.classList.contains('no-transition')) { // Avoid specific links
            
    //         // Original fade-out animation and delayed navigation logic commented out
    //         // e.preventDefault();
    //         // body.classList.add('fade-out');
    //         // setTimeout(function() {
    //         //     window.location.href = targetLink.href;
    //         // }, 300); // Animation duration
    //     }
    // });
}

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    insertNavbar();
    insertFooter();
    initializeNavigation();
    initPageTransitions();
}); 