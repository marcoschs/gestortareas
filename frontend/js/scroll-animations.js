// ===== SCROLL ANIMATIONS CON INTERSECTION OBSERVER =====

class ScrollAnimations {
    constructor() {
        this.sections = document.querySelectorAll('.fullscreen-section');
        this.animatedElements = document.querySelectorAll('[data-scroll-animation]');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupSectionObserver();
        this.setupStaggeredAnimations();
    }

    // Observer para elementos individuales
    setupIntersectionObserver() {
        const options = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.scrollAnimation;
                    const delay = element.dataset.delay || '0';

                    element.style.animationDelay = delay + 's';
                    element.classList.add(`animate-${animationType}`);

                    // No volver a animar una vez mostrado
                    observer.unobserve(element);
                }
            });
        }, options);

        this.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Observer para secciones completas
    setupSectionObserver() {
        const options = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');

                    // Animar elementos hijos
                    const children = entry.target.querySelectorAll('.section-content > *');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, options);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Animaciones escalonadas para grupos de elementos
    setupStaggeredAnimations() {
        const staggerContainers = document.querySelectorAll('.stagger-children');

        const options = {
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        staggerContainers.forEach(container => {
            observer.observe(container);
        });
    }

    // Scroll suave a sección específica
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
    constructor() {
        this.scrollContainer = document.querySelector('.scroll-container');
        if (!this.scrollContainer) return;

        this.currentScroll = 0;
        this.targetScroll = 0;
        this.ease = 0.1;
        this.init();
    }

    init() {
        // Solo en dispositivos de escritorio
        if (window.innerWidth > 1024 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.setupSmoothScroll();
        }
    }

    setupSmoothScroll() {
        this.scrollContainer.addEventListener('scroll', () => {
            this.targetScroll = this.scrollContainer.scrollTop;
        });

        this.animate();
    }

    animate() {
        this.currentScroll += (this.targetScroll - this.currentScroll) * this.ease;

        // Aplicar transformación suave
        const sections = document.querySelectorAll('.fullscreen-section');
        sections.forEach((section, index) => {
            const offset = (this.currentScroll - (index * window.innerHeight)) * 0.1;
            section.style.transform = `translateY(${offset}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== SCROLL PROGRESS INDICATOR =====
class ScrollProgress {
    constructor() {
        this.createProgressBar();
        this.updateProgress();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        // Estilos inline
        const styles = `
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 10000;
      }
      .scroll-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #00D9FF, #FF406E, #A855F7);
        width: 0%;
        transition: width 0.2s ease;
      }
    `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    updateProgress() {
        const scrollContainer = document.querySelector('.scroll-container') || window;

        scrollContainer.addEventListener('scroll', () => {
            const scrollable = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const scrolled = scrollContainer.scrollTop;
            const progress = (scrolled / scrollable) * 100;

            const progressBar = document.querySelector('.scroll-progress-bar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        });
    }
}

// ===== TEXT REVEAL LETTER BY LETTER =====
class TextReveal {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        this.elements.forEach(element => {
            this.splitText(element);
        });
    }

    splitText(element) {
        const text = element.textContent;
        element.textContent = '';

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'reveal-text';
            span.style.animationDelay = `${index * 0.05}s`;
            element.appendChild(span);
        });
    }
}

// ===== SCROLL DIRECTION DETECTION =====
class ScrollDirection {
    constructor(callback) {
        this.lastScrollTop = 0;
        this.callback = callback;
        this.init();
    }

    init() {
        const scrollContainer = document.querySelector('.scroll-container') || window;

        scrollContainer.addEventListener('scroll', () => {
            const scrollTop = scrollContainer.scrollTop || window.pageYOffset;

            if (scrollTop > this.lastScrollTop) {
                this.callback('down');
            } else {
                this.callback('up');
            }

            this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }
}

// ===== SCROLL SNAP POLYFILL =====
class ScrollSnap {
    constructor() {
        // Solo para navegadores que no soporten scroll-snap
        if (!('scrollSnapType' in document.documentElement.style)) {
            this.setupPolyfill();
        }
    }

    setupPolyfill() {
        const sections = document.querySelectorAll('.fullscreen-section');
        let isScrolling = false;

        window.addEventListener('wheel', (e) => {
            if (isScrolling) return;

            isScrolling = true;
            const direction = e.deltaY > 0 ? 'down' : 'up';

            // Encontrar sección actual
            let currentSection = 0;
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top >= -100 && rect.top <= 100) {
                    currentSection = index;
                }
            });

            // Navegar a la siguiente/anterior sección
            if (direction === 'down' && currentSection < sections.length - 1) {
                sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
            } else if (direction === 'up' && currentSection > 0) {
                sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
            }

            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }, { passive: false });
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si no se prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        // Inicializar animaciones de scroll
        new ScrollAnimations();

        // Smooth scrolling (solo desktop)
        if (window.innerWidth > 1024) {
            new SmoothScroll();
        }

        // Barra de progreso
        new ScrollProgress();

        // Text reveal si hay elementos con la clase
        new TextReveal('.text-reveal-animation');

        // Scroll snap polyfill
        new ScrollSnap();

        // Detección de dirección de scroll (ejemplo de uso)
        new ScrollDirection((direction) => {
            // Aquí puedes hacer algo cuando cambia la dirección
            // console.log('Scrolling:', direction);
        });
    }
});

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollAnimations,
        SmoothScroll,
        ScrollProgress,
        TextReveal,
        ScrollDirection,
        ScrollSnap
    };
}
