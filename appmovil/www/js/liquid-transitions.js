// ===== TRANSICIONES LÍQUIDAS ENTRE SECCIONES =====

class LiquidTransitions {
    constructor() {
        this.currentSection = 0;
        this.sections = document.querySelectorAll('.fullscreen-section');
        this.isTransitioning = false;
        this.init();
    }

    init() {
        this.createSVGMorph();
        this.setupScrollListener();
    }

    // Crear SVG para efecto líquido
    createSVGMorph() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'liquid-transition');
        svg.setAttribute('viewBox', '0 0 1920 1080');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'liquid-path');
        path.setAttribute('d', 'M 0 0 L 1920 0 L 1920 1080 L 0 1080 Z');

        svg.appendChild(path);
        document.body.appendChild(svg);

        this.liquidPath = path;
        this.liquidSVG = svg;
    }

    // Escuchar scroll para trigger transiciones
    setupScrollListener() {
        let lastSection = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const currentSectionIndex = Array.from(this.sections).indexOf(entry.target);

                    if (currentSectionIndex !== lastSection && !this.isTransitioning) {
                        this.triggerLiquidTransition(lastSection, currentSectionIndex);
                        lastSection = currentSectionIndex;
                    }
                }
            });
        }, {
            threshold: [0.5]
        });

        this.sections.forEach(section => observer.observe(section));
    }

    // Ejecutar transición líquida
    triggerLiquidTransition(fromIndex, toIndex) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        const fromSection = this.sections[fromIndex];
        const toSection = this.sections[toIndex];

        if (!fromSection || !toSection) {
            this.isTransitioning = false;
            return;
        }

        const fromColor = window.getComputedStyle(fromSection).backgroundColor;
        const toColor = window.getComputedStyle(toSection).backgroundColor;

        // Animar el path del SVG para crear efecto líquido
        this.morphPath(fromColor, toColor);

        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }

    // Morphing del path SVG
    morphPath(fromColor, toColor) {
        this.liquidSVG.style.color = toColor;
        this.liquidPath.style.fill = toColor;

        const morphSteps = [
            'M 0 0 L 1920 0 L 1920 0 L 0 0 Z',
            'M 0 0 L 1920 0 Q 1920 300 1920 540 Q 1920 780 1920 1080 L 0 1080 Q 0 780 0 540 Q 0 300 0 0 Z',
            'M 0 0 L 1920 0 L 1920 1080 L 0 1080 Z'
        ];

        let step = 0;
        const interval = setInterval(() => {
            if (step < morphSteps.length) {
                this.liquidPath.setAttribute('d', morphSteps[step]);
                step++;
            } else {
                clearInterval(interval);
            }
        }, 300);
    }
}

// ===== COLOR MORPHING =====
class ColorMorph {
    constructor() {
        this.sections = document.querySelectorAll('.fullscreen-section');
        this.init();
    }

    init() {
        this.sections.forEach((section, index) => {
            section.addEventListener('mouseenter', () => {
                this.morphColors(section);
            });
        });
    }

    morphColors(section) {
        const color = window.getComputedStyle(section).backgroundColor;
        document.body.style.transition = 'background-color 1s cubic-bezier(0.76, 0, 0.24, 1)';
        document.body.style.backgroundColor = color;
    }
}

// ===== RIPPLE EFFECT ON CLICK =====
class RippleEffect {
    constructor() {
        this.elements = document.querySelectorAll('.ripple-effect');
        this.init();
    }

    init() {
        this.elements.forEach(el => {
            el.addEventListener('click', (e) => this.createRipple(e, el));
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// ===== MENU HAMBURGUESA CON ANIMACIÓN =====
class HamburgerMenu {
    constructor() {
        this.menuBtn = document.querySelector('.hamburger-menu');
        this.navOverlay = document.querySelector('.nav-overlay');

        if (this.menuBtn && this.navOverlay) {
            this.init();
        }
    }

    init() {
        this.menuBtn.addEventListener('click', () => this.toggle());

        // Cerrar al hacer click en un enlace
        const navLinks = this.navOverlay.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navOverlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    toggle() {
        this.menuBtn.classList.toggle('active');
        this.navOverlay.classList.toggle('active');
        document.body.style.overflow = this.navOverlay.classList.contains('active') ? 'hidden' : '';
    }

    close() {
        this.menuBtn.classList.remove('active');
        this.navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== MAGNETIC BUTTON EFFECT =====
class MagneticButtons {
    constructor() {
        this.buttons = document.querySelectorAll('.magnetic-btn');
        if (this.buttons.length > 0) {
            this.init();
        }
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => this.handleMouseMove(e, btn));
            btn.addEventListener('mouseleave', (e) => this.handleMouseLeave(btn));
        });
    }

    handleMouseMove(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        const moveX = x * 0.3;
        const moveY = y * 0.3;

        btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }

    handleMouseLeave(btn) {
        btn.style.transform = 'translate(0, 0) scale(1)';
    }
}

// ===== SMOOTH HOVER LIQUID EFFECT =====
class LiquidHover {
    constructor() {
        this.elements = document.querySelectorAll('.liquid-hover');
        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        this.elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.05)';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
            });
        });
    }
}

// ===== MORPHING SHAPES =====
class MorphingShapes {
    constructor() {
        this.shapes = document.querySelectorAll('.morphing-shape');
        if (this.shapes.length > 0) {
            this.startMorphing();
        }
    }

    startMorphing() {
        // Las formas ya tienen la animación CSS, solo inicializamos delays aleatorios
        this.shapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 2}s`;
        });
    }
}

// ===== CURSOR PERSONALIZADO (OPCIONAL) =====
class CustomCursor {
    constructor() {
        if (window.innerWidth < 1024) return; // Solo en desktop

        this.cursor = this.createCursor();
        this.cursorFollower = this.createCursorFollower();
        this.init();
    }

    createCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: white;
      pointer-events: none;
      z-index: 10001;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
    `;
        document.body.appendChild(cursor);
        return cursor;
    }

    createCursorFollower() {
        const follower = document.createElement('div');
        follower.className = 'custom-cursor-follower';
        follower.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid white;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      mix-blend-mode: difference;
      transition: all 0.3s ease;
    `;
        document.body.appendChild(follower);
        return follower;
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
            this.cursorFollower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
        });

        // Escala en hover de elementos interactivos
        const interactiveElements = document.querySelectorAll('a, button, .btn-pill');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorFollower.style.transform += ' scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                this.cursorFollower.style.transform = this.cursorFollower.style.transform.replace(' scale(1.5)', '');
            });
        });
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        // Transiciones líquidas
        new LiquidTransitions();

        // Color morphing
        new ColorMorph();
    }

    // Estos funcionan independientemente de reduced motion
    new RippleEffect();
    new HamburgerMenu();
    new MagneticButtons();
    new LiquidHover();
    new MorphingShapes();

    // Cursor personalizado (opcional, solo desktop)
    if (window.innerWidth >= 1024 && !prefersReducedMotion) {
        // new CustomCursor(); // Comentado por defecto, descomentar si se desea
    }
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LiquidTransitions,
        ColorMorph,
        RippleEffect,
        HamburgerMenu,
        MagneticButtons,
        LiquidHover,
        MorphingShapes,
        CustomCursor
    };
}
