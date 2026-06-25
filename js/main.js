/**
 * VMM TRADERS — main.js
 * Global initialization — runs on every page.
 * Brand: Plus Jakarta Sans (headings) + DM Sans (body)
 */

'use strict';


/* ─────────────────────────────────────────
   DOM READY HELPER
   ───────────────────────────────────────── */
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}


/* ─────────────────────────────────────────
   GLOBAL STATE
   ───────────────────────────────────────── */
const VMM = {
  /** Which HTML file are we on? e.g. 'index.html', 'about.html' */
  currentPage: window.location.pathname.split('/').pop() || 'index.html',

  /** Registered modules */
  modules: {},

  /**
   * Register a module so it can be invoked after DOM ready.
   * @param {string} name
   * @param {{ init: Function, destroy?: Function }} module
   */
  register(name, module) {
    this.modules[name] = module;
  },

  /** Initialize all registered modules */
  initAll() {
    Object.entries(this.modules).forEach(([name, mod]) => {
      try {
        mod.init();
      } catch (err) {
        console.warn(`[VMM] Module \"${name}\" failed to initialize:`, err);
      }
    });
  },
}

window.VMM = VMM;


/* ─────────────────────────────────────────
   UTILITY FUNCTIONS (global helpers)
   ───────────────────────────────────────── */

/**
 * Select a single element.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Select all matching elements.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Add event listener with optional delegation.
 * @param {Element|string} target
 * @param {string} event
 * @param {Function} handler
 * @param {string} [delegateSelector]
 */
function on(target, event, handler, delegateSelector) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (delegateSelector) {
    el.addEventListener(event, (e) => {
      const match = e.target.closest(delegateSelector);
      if (match) handler.call(match, e);
    });
  } else {
    el.addEventListener(event, handler);
  }
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t  — 0..1
 */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Clamp a number between min and max.
 */
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

/**
 * Map a value from one range to another.
 */
function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Format a number with commas.
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

// Expose utilities globally
Object.assign(window, { $, $$, on, debounce, throttle, lerp, clamp, mapRange, formatNumber });


/* ─────────────────────────────────────────
   ACTIVE PAGE DETECTION
   (Done here so it's available before navbar.js)
   ───────────────────────────────────────── */
(function markActiveNavLinks() {
  const page = VMM.currentPage;
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const hrefPage = href.split('/').pop();
    if (
      hrefPage === page ||
      (page === '' && hrefPage === 'index.html') ||
      (page === 'index.html' && hrefPage === 'index.html')
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();


/* ─────────────────────────────────────────
   GLOBAL HERO LOADER
   Triggers staggered entrance on all pages.
   ───────────────────────────────────────── */
(function initHeroEntrance() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  function activate() {
    hero.classList.add('is-loaded');
  }

  const heroImg = hero.querySelector('.hero__bg-img');
  if (heroImg) {
    if (heroImg.complete) {
      activate();
    } else {
      heroImg.addEventListener('load', activate);
      setTimeout(activate, 1000);
    }
  } else {
    // No bg image — trigger immediately on next frame
    requestAnimationFrame(activate);
  }
})();


/* ─────────────────────────────────────────
   PAGE TRANSITION OVERLAY
   ───────────────────────────────────────── */
(function setupPageTransitions() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.classList.add('page-transition-overlay');
  overlay.id = 'page-transition-overlay';
  document.body.prepend(overlay);

  // Intercept internal navigation links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    // Only internal .html links
    const isInternal = !href.startsWith('http') &&
                       !href.startsWith('mailto:') &&
                       !href.startsWith('tel:') &&
                       !href.startsWith('#') &&
                       (href.endsWith('.html') || href === '/' || href === './');

    if (!isInternal) return;
    if (anchor.target === '_blank') return;

    e.preventDefault();
    overlay.classList.add('entering');
    setTimeout(() => {
      window.location.href = href;
    }, 280);
  });
})();


/* ─────────────────────────────────────────
   INIT ON DOM READY
   ───────────────────────────────────────── */
onReady(() => {
  VMM.initAll();

  // Remove no-js class if present
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js-ready');

  // Set copyright year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  console.log(`[VMM Traders] Page loaded: ${VMM.currentPage}`);
});
