/**
 * VMM TRADERS — animations.js
 * Scroll-triggered reveal animations using Intersection Observer.
 * Staggered children, custom thresholds, and one-time triggering.
 */

'use strict';

const AnimationsModule = {
  /* ── Config ── */
  REVEAL_SELECTORS: [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.reveal-fade',
    '.section-bar',
    '.section-eyebrow',
    '.img-reveal',
  ],

  STAGGER_SELECTOR: '[data-stagger]',

  OBSERVER_OPTIONS: {
    root:       null,          // viewport
    rootMargin: '0px 0px -100px 0px',  // trigger earlier for blur-in reveal
    threshold:  0.05,
  },

  STAGGER_DELAY: 120,   // ms between staggered children


  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  init() {
    this.setupRevealObserver();
    this.setupStaggerObserver();
    this.setupParallax();
    this.setup3DTilt();
  },


  /* ─────────────────────────────────────────
     SCROLL-REVEAL OBSERVER
     Elements with .reveal / .reveal-left / etc.
     get .revealed class when in view.
     ───────────────────────────────────────── */
  setupRevealObserver() {
    const elements = document.querySelectorAll(this.REVEAL_SELECTORS.join(', '));
    if (!elements.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Unobserve after animation — each element animates once
          observer.unobserve(entry.target);
        }
      });
    }, this.OBSERVER_OPTIONS);

    elements.forEach(el => observer.observe(el));
    this._revealObserver = observer;
  },


  /* ─────────────────────────────────────────
     STAGGER OBSERVER
     Parent element with [data-stagger] —
     children get staggered delays applied
     and .revealed when parent enters viewport.
     ───────────────────────────────────────── */
  setupStaggerObserver() {
    const staggerParents = document.querySelectorAll(this.STAGGER_SELECTOR);
    if (!staggerParents.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const parent   = entry.target;
        const children = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
        const delay    = parseInt(parent.dataset.staggerDelay) || this.STAGGER_DELAY;

        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, index * delay);
        });

        observer.unobserve(parent);
      });
    }, {
      ...this.OBSERVER_OPTIONS,
      rootMargin: '0px 0px -60px 0px',
    });

    staggerParents.forEach(el => observer.observe(el));
    this._staggerObserver = observer;
  },


  /* ─────────────────────────────────────────
     PARALLAX EFFECT
     Elements with [data-parallax] get a subtle
     vertical transform on scroll.
     ───────────────────────────────────────── */
  setupParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;

      elements.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax) || 0.3;
        const rect   = el.getBoundingClientRect();
        // Calculate relative to viewport center
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * speed;

        el.style.transform = `translateY(${offset}px) translateZ(0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  },


  /* ─────────────────────────────────────────
     COUNTER ANIMATION TRIGGER
     Delegates to counter.js when a counter
     element enters viewport.
     ───────────────────────────────────────── */
  observeCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (window.CounterModule) {
          window.CounterModule.animateCounter(entry.target);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
    this._counterObserver = observer;
  },


  /* ─────────────────────────────────────────
     TIMELINE ANIMATION TRIGGER
     Delegates to timeline.js when timeline
     items enter viewport.
     ───────────────────────────────────────── */
  observeTimeline() {
    const items = document.querySelectorAll('.timeline__item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('timeline__item--visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => observer.observe(el));
    this._timelineObserver = observer;
  },


  /* ─────────────────────────────────────────
     GLOBAL 3D TILT ENGINE
     ───────────────────────────────────────── */
  setup3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    if (!tiltElements.length) return;
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    tiltElements.forEach(el => {
      // Add preserve-3d class if not present
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = el.dataset.tiltX || 10;
        const tiltY = el.dataset.tiltY || 10;
        
        const rotateX = ((y - centerY) / centerY) * -tiltX;
        const rotateY = ((x - centerX) / centerX) * tiltY;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  },

  /* ─────────────────────────────────────────
     UTILITY: Manually trigger a reveal
     Useful for dynamically added content.
     ───────────────────────────────────────── */
  revealElement(el, delay = 0) {
    setTimeout(() => el.classList.add('revealed'), delay);
  },

  /**
   * Re-observe new elements (e.g., after dynamic content injection).
   */
  refresh() {
    this.init();
  },
};

/* Register with VMM */
VMM.register('animations', AnimationsModule);

/* Also expose for direct use in other modules */
window.AnimationsModule = AnimationsModule;
