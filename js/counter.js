/**
 * VMM TRADERS — counter.js
 * Animated number counters.
 * Triggered by animations.js when elements
 * with [data-counter] enter the viewport.
 *
 * Usage in HTML:
 *   <span data-counter data-target="500" data-suffix="+" data-prefix="">0</span>
 *
 * Attributes:
 *   data-target  — Final numeric value (required)
 *   data-prefix  — Text before the number (e.g., "$", "₹")
 *   data-suffix  — Text after the number (e.g., "+", "%", "K")
 *   data-duration — Animation duration in ms (default: 2000)
 *   data-separator — Whether to use locale separator (default: true)
 */

'use strict';

const CounterModule = {
  /* ── Config ── */
  DEFAULT_DURATION: 2200,
  EASING:           'easeOutBack',


  /* ─────────────────────────────────────────
     INIT
     Register the Intersection Observer so
     counters animate when they scroll into view.
     ───────────────────────────────────────── */
  init() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Just set final values immediately
      counters.forEach(el => this.setFinalValue(el));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        this.animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
    this._observer = observer;
  },


  /* ─────────────────────────────────────────
     ANIMATE A SINGLE COUNTER
     @param {Element} el
     ───────────────────────────────────────── */
  animateCounter(el) {
    if (el.dataset.counted === 'true') return; // Prevent double-animation
    el.dataset.counted = 'true';

    const target    = parseFloat(el.dataset.target) || 0;
    const prefix    = el.dataset.prefix  || '';
    const suffix    = el.dataset.suffix  || '';
    const duration  = parseInt(el.dataset.duration) || this.DEFAULT_DURATION;
    const separator = el.dataset.separator !== 'false';
    const decimals  = (String(target).split('.')[1] || '').length;

    const start     = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = (this[this.EASING] || this.easeOutExpo)(progress);
      const current  = start + (target - start) * eased;

      el.textContent = prefix + this.formatValue(current, decimals, separator) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure exact final value
        el.textContent = prefix + this.formatValue(target, decimals, separator) + suffix;
        el.classList.add('counter--done');
      }
    };

    requestAnimationFrame(update);
  },


  /* ─────────────────────────────────────────
     SET FINAL VALUE (no animation)
     ───────────────────────────────────────── */
  setFinalValue(el) {
    const target    = parseFloat(el.dataset.target) || 0;
    const prefix    = el.dataset.prefix  || '';
    const suffix    = el.dataset.suffix  || '';
    const separator = el.dataset.separator !== 'false';
    const decimals  = (String(target).split('.')[1] || '').length;

    el.textContent = prefix + this.formatValue(target, decimals, separator) + suffix;
    el.dataset.counted = 'true';
  },


  /* ─────────────────────────────────────────
     FORMAT NUMBER
     @param {number} value
     @param {number} decimals
     @param {boolean} separator
     @returns {string}
     ───────────────────────────────────────── */
  formatValue(value, decimals = 0, separator = true) {
    if (separator) {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    }
    return value.toFixed(decimals);
  },


  /* ─────────────────────────────────────────
     EASING FUNCTIONS
     ───────────────────────────────────────── */
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  },

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },
};

/* Register with VMM */
VMM.register('counter', CounterModule);

/* Expose for use by animations.js */
window.CounterModule = CounterModule;
