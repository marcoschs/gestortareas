// ===== EFECTO PARALLAX AVANZADO =====

class ParallaxEffect {
    constructor() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
        this.scrollPosition = 0;
        this.ticking = false;

        if (this.parallaxElements.length > 0) {
            this.init();
        }
    }

    init() {
        // Solo en desktop y si no se prefiere reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (window.innerWidth < 768 || prefersReducedMotion) return;

        this.setupParallax();
        this.handleScroll();
    }

    setupParallax() {
        // Agregar will-change para mejor performance
        this.parallaxElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }

    handleScroll() {
        const scrollContainer = document.querySelector('.scroll-container') || window;

        scrollContainer.addEventListener('scroll', () => {
            this.scrollPosition = scrollContainer.scrollTop || window.pageYOffset;

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateParallax();
                    this.ticking = false;
                });

                this.ticking = true;
            }
        });
    }

    updateParallax() {
        this.parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const direction = el.dataset.parallaxDirection || 'vertical';
            const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
            const elementHeight = el.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Calcular si el elemento está en viewport
            if (this.scrollPosition + viewportHeight > elementTop &&
                this.scrollPosition < elementTop + elementHeight) {

                const yPos = (this.scrollPosition - elementTop) * speed;

                if (direction === 'horizontal') {
                    el.style.transform = `translateX(${yPos}px)`;
                } else {
                    el.style.transform = `translateY(${yPos}px)`;
                }
            }
        });
    }
}

// ===== PARALLAX MOUSE MOVEMENT =====
class MouseParallax {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.elements = document.querySelectorAll('[data-mouse-parallax]');

        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        if (window.innerWidth < 1024) return;

        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

            this.updatePositions();
        });
    }

    updatePositions() {
        this.elements.forEach(el => {
            const speed = parseFloat(el.dataset.mouseParallax) || 20;
            const x = this.mouseX * speed;
            const y = this.mouseY * speed;

            el.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
}

// ===== PARALLAX DE MÚLTIPLES CAPAS =====
class LayeredParallax {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.layers = this.container.querySelectorAll('.parallax-layer');
        this.scrollPosition = 0;
        this.init();
    }

    init() {
        if (window.innerWidth < 768) return;

        const scrollContainer = document.querySelector('.scroll-container') || window;

        scrollContainer.addEventListener('scroll', () => {
            this.scrollPosition = scrollContainer.scrollTop || window.pageYOffset;
            this.updateLayers();
        });
    }

    updateLayers() {
        this.layers.forEach((layer, index) => {
            // Cada capa se mueve a diferente velocidad
            const speed = (index + 1) * 0.2;
            const yPos = -(this.scrollPosition * speed);

            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// ===== PARALLAX 3D TILT (CARD HOVER) =====
class TiltEffect {
    constructor(selector) {
        this.cards = document.querySelectorAll(selector);
        if (this.cards.length > 0) {
            this.init();
        }
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
        });
    }

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    }

    handleMouseLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

// ===== PARALLAX BACKGROUND =====
class ParallaxBackground {
    constructor() {
        this.backgrounds = document.querySelectorAll('.parallax-bg');
        if (this.backgrounds.length > 0) {
            this.init();
        }
    }

    init() {
        const scrollContainer = document.querySelector('.scroll-container') || window;

        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop || window.pageYOffset;

            this.backgrounds.forEach(bg => {
                const speed = parseFloat(bg.dataset.speed) || 0.5;
                const yPos = -(scrollY * speed);
                bg.style.backgroundPosition = `center ${yPos}px`;
            });
        });
    }
}

// ===== GYROSCOPE PARALLAX (MÓVIL) =====
class GyroParallax {
    constructor() {
        this.elements = document.querySelectorAll('[data-gyro-parallax]');
        if (this.elements.length > 0 && 'DeviceOrientationEvent' in window) {
            this.init();
        }
    }

    init() {
        window.addEventListener('deviceorientation', (e) => {
            const gamma = e.gamma; // Inclinación izquierda-derecha [-90, 90]
            const beta = e.beta;   // Inclinación adelante-atrás [-180, 180]

            this.elements.forEach(el => {
                const intensity = parseFloat(el.dataset.gyroParallax) || 10;
                const x = (gamma / 90) * intensity;
                const y = (beta / 180) * intensity;

                el.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
}

// ===== PERFORMANCE MONITOR =====
class ParallaxPerformance {
    constructor() {
        this.fps = 0;
        this.lastTime = performance.now();
        this.frames = 0;
        this.monitor();
    }

    monitor() {
        const currentTime = performance.now();
        this.frames++;

        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;

            // Si FPS es muy bajo, deshabilitar algunos efectos
            if (this.fps < 30) {
                this.reducedMotionMode();
            }
        }

        requestAnimationFrame(() => this.monitor());
    }

    reducedMotionMode() {
        console.warn('Low FPS detected, reducing motion effects');
        document.body.classList.add('reduced-motion');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        // Parallax de scroll
        new ParallaxEffect();

        // Parallax de mouse (solo desktop)
        if (window.innerWidth >= 1024) {
            new MouseParallax();
        }

        // Parallax de capas
        new LayeredParallax('.fullscreen-section');

        // Efecto tilt en tarjetas
        new TiltEffect('.card-3d');

        // Parallax de fondo
        new ParallaxBackground();

        // Gyroscope parallax (móvil)
        if (window.innerWidth < 768) {
            new GyroParallax();
        }

        // Monitor de performance
        new ParallaxPerformance();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParallaxEffect,
        MouseParallax,
        LayeredParallax,
        TiltEffect,
        ParallaxBackground,
        GyroParallax
    };
}
