// ============================================
// Mobile Navigation Toggle
// ============================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Skip if it's just "#"
        if (href === '#' || href === '#!') {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            // Use smooth scroll with better browser support
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            } else {
                // Fallback for older browsers
                smoothScrollTo(offsetPosition, 600);
            }
        }
    });
});

// Fallback smooth scroll function for older browsers
function smoothScrollTo(target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// ============================================
// Active Navigation Link on Scroll
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinksArray = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// ============================================
// Scroll Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.project-card, .skill-item, .about-content, .contact-content');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ============================================
// Back to Top Button
// ============================================
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// Contact Form Validation & Submission
// ============================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const subject = formData.get('subject').trim();
        const message = formData.get('message').trim();

        // Client-side validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Check if form action contains formspree.io (for static hosting)
        const formAction = contactForm.getAttribute('action');
        if (formAction && formAction.includes('formspree.io')) {
            // Formspree submission
            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    showFormMessage('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    if (result.errors) {
                        showFormMessage('Error: ' + result.errors.map(e => e.message).join(', '), 'error');
                    } else {
                        showFormMessage('An error occurred. Please try again later.', 'error');
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showFormMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } else {
            // PHP handler submission (for local development)
            try {
                const response = await fetch('includes/contact-handler.php', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseText = await response.text();
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError);
                    console.error('Response Text:', responseText);
                    showFormMessage('Server returned invalid response. Please check the console for details.', 'error');
                    return;
                }

                if (result.success) {
                    showFormMessage('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    showFormMessage(result.message || 'An error occurred. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showFormMessage('Network error. Please check your connection and try again. Error: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// ============================================
// Header Scroll Effect
// ============================================
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
});

// ============================================
// Project Card Hover Effects
// ============================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// ============================================
// Skill Items Animation on Hover
// ============================================
const skillItems = document.querySelectorAll('.skill-item');

skillItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// ============================================
// Initialize on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Highlight active section on page load
    highlightActiveSection();
    
    // Add fade-in animation to hero content if needed
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease';
    }
});

