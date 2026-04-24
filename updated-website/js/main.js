// Yoga by Luna - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const primaryMenu = document.querySelector('#primary-menu');

    if (menuToggle && primaryMenu) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            this.setAttribute('aria-expanded', !isExpanded);
            primaryMenu.classList.toggle('show');
        });

        // Close mobile menu when clicking on a link
        primaryMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                primaryMenu.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !primaryMenu.contains(e.target)) {
                primaryMenu.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });

    // Add CSS class for lazy loading
    const style = document.createElement('style');
    style.textContent = `
        .lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        .lazy:not([src]) {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    }, false);

    // Add smooth transitions to header
    header.style.transition = 'transform 0.3s ease-in-out';

    // Form handling (if forms are added later)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic form validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            if (isValid) {
                // Handle form submission
                console.log('Form submitted successfully');
                // Add actual form submission logic here
            }
        });
    });

    // Add CSS for form error states
    const formStyle = document.createElement('style');
    formStyle.textContent = `
        .error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 5px rgba(231, 76, 60, 0.3) !important;
        }
    `;
    document.head.appendChild(formStyle);

    // Reading progress bar for blog posts
    if (document.querySelector('.blog-post')) {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: #df9d00;
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Simple fade-in animation for elements
    const observeElements = document.querySelectorAll('.yoga-type, .class-item, .teacher-profile, .blog-post');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    observeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });

    // Add current page highlighting to navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-navigation a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === '/' && linkPage === 'index.html')) {
            link.parentElement.classList.add('current-menu-item');
        }
    });

    // Modern Disappearing Effect for Class Items
    function initModernDisappearingEffect() {
        const classItems = document.querySelectorAll('.class-item');

        if (classItems.length > 0) {
            const observerOptions = {
                threshold: [0.1, 0.9],
                rootMargin: '0px 0px -100px 0px'
            };

            const disappearObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio < 0.1) {
                        // Element is leaving viewport - trigger disappear
                        entry.target.classList.add('disappear');
                    } else if (entry.intersectionRatio > 0.1) {
                        // Element is entering viewport - remove disappear
                        entry.target.classList.remove('disappear');
                    }
                });
            }, observerOptions);

            classItems.forEach((item, index) => {
                // Stagger the initial animation
                item.style.animationDelay = `${index * 0.2 + 0.1}s`;
                disappearObserver.observe(item);
            });
        }
    }

    // Initialize modern effects for classes page
    if (document.querySelector('.classes-grid')) {
        initModernDisappearingEffect();
    }

    // Smooth background parallax effect
    function initSmoothParallax() {
        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            const body = document.body;

            if (heroSection) {
                heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    // Initialize smooth parallax
    initSmoothParallax();

    console.log('Yoga by Luna website initialized successfully with modern effects');
});

// External link handling
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
        e.target.setAttribute('target', '_blank');
        e.target.setAttribute('rel', 'noopener noreferrer');
    }
});

// Basic accessibility improvements
document.addEventListener('keydown', function(e) {
    // Skip to main content with Enter key
    if (e.key === 'Enter' && e.target.textContent === 'Skip to content') {
        e.preventDefault();
        document.querySelector('main').focus();
    }

    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        const primaryMenu = document.querySelector('#primary-menu');
        const menuToggle = document.querySelector('.menu-toggle');

        if (primaryMenu && primaryMenu.classList.contains('show')) {
            primaryMenu.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    }
});