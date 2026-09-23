document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Revelação ao rolar ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('show');

            if (entry.target.classList.contains('about-content')) {
                entry.target.querySelectorAll('.progress').forEach(bar => {
                    setTimeout(() => {
                        bar.style.width = bar.getAttribute('data-width');
                    }, 300);
                });
            }

            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    document.querySelectorAll('.hidden').forEach(el => revealObserver.observe(el));

    /* ---------- Contadores ---------- */
    const animateCount = (el) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

    /* ---------- Texto digitado no hero ---------- */
    const roleTyped = document.getElementById('roleTyped');
    if (roleTyped && !reduceMotion) {
        const phrases = ['Front-end & Back-end', 'Hardware & Manutenção', 'Liderança de Equipe', 'Cisco Redes & Cyber'];
        let phraseIndex = 0;
        let charIndex = phrases[0].length;
        let deleting = true;
        roleTyped.classList.add('typing');

        const tick = () => {
            const current = phrases[phraseIndex];
            charIndex += deleting ? -1 : 1;
            roleTyped.textContent = current.slice(0, charIndex);

            let delay = deleting ? 40 : 80;
            if (!deleting && charIndex === current.length) {
                deleting = true;
                delay = 2200;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 350;
            }
            setTimeout(tick, delay);
        };
        setTimeout(tick, 2600);
    }

    /* ---------- Menu mobile ---------- */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    const closeMenu = () => {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.classList.remove('no-scroll');
    };

    const openMenu = () => {
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Fechar menu');
        document.body.classList.add('no-scroll');
    };

    navToggle.addEventListener('click', () => {
        navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });
    navOverlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });

    /* ---------- Navbar, progresso e voltar ao topo ---------- */
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const navAnchors = [...navLinks.querySelectorAll('a')];
    const sections = [...document.querySelectorAll('header[id], section[id], footer[id]')];

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        navbar.classList.toggle('scrolled', y > 20);
        backToTop.classList.toggle('visible', y > window.innerHeight * 0.8);

        // Link ativo: última seção cujo topo já passou de 40% da tela (ou a última, no fim da página)
        let current = sections[0];
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) current = section;
        });
        if (max > 0 && y >= max - 2) current = sections[sections.length - 1];
        navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ---------- Lightbox das galerias ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let currentGroup = [];
    let currentIndex = 0;
    let lastFocused = null;

    const showImage = (index) => {
        currentIndex = (index + currentGroup.length) % currentGroup.length;
        const img = currentGroup[currentIndex];
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = `${img.alt} · ${currentIndex + 1}/${currentGroup.length}`;
        const single = currentGroup.length < 2;
        lightboxPrev.hidden = single;
        lightboxNext.hidden = single;
    };

    const openLightbox = (img) => {
        currentGroup = [...img.closest('.gallery').querySelectorAll('img')];
        lastFocused = document.activeElement;
        showImage(currentGroup.indexOf(img));
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        document.getElementById('lightboxClose').focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('.gallery figure').forEach(fig => {
        const img = fig.querySelector('img');
        fig.setAttribute('tabindex', '0');
        fig.setAttribute('role', 'button');
        fig.setAttribute('aria-label', `Ampliar: ${img.alt}`);
        fig.addEventListener('click', () => openLightbox(img));
        fig.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(img);
            }
        });
    });

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
    lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('open')) closeLightbox();
            else if (navLinks.classList.contains('active')) closeMenu();
        }
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Swipe no celular para trocar de imagem
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50 && currentGroup.length > 1) {
            showImage(currentIndex + (dx < 0 ? 1 : -1));
        }
    }, { passive: true });

    /* ---------- Ano no rodapé ---------- */
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});
