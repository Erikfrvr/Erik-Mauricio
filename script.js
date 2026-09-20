document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');

                if (entry.target.classList.contains('about-content')) {
                    const progressBars = document.querySelectorAll('.progress');
                    progressBars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 300);
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

    document.querySelectorAll('.nav-links a, .hero-actions a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    const closeMenu = () => {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.style.overflow = '';
    };

    const openMenu = () => {
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        document.body.style.overflow = 'hidden';
    };

    if (navToggle && navLinks && navOverlay) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.contains('active') ? closeMenu() : openMenu();
        });

        navOverlay.addEventListener('click', closeMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
});
