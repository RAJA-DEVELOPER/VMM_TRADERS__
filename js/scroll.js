/**
 * VMM TRADERS — scroll.js
 * Smooth in-page scrolling (for anchor links within the same page),
 * scroll-to-top button, and scroll progress indicator.
 */

'use strict';

const ScrollModule = {
  /* ── Config ── */
  SCROLL_TOP_THRESHOLD: 400,  // px before scroll-to-top button appears
  PROGRESS_BAR_ID:      'scroll-progress',
  SCROLL_TOP_ID:        'scroll-to-top',


  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  init() {
    this.setupSmoothScroll();
    this.setupScrollToTop();
    this.setupProgressBar();
  },


  /* ─────────────────────────────────────────
     SMOOTH IN-PAGE SCROLLING
     Intercepts clicks on href="#section-id"
     and scrolls smoothly to the target.
     ───────────────────────────────────────── */
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      this.scrollTo(target);
    });
  },

  /**
   * Smooth scroll to a target element, accounting for fixed navbar.
   * @param {Element} target
   * @param {number} [extraOffset=0] — additional px offset
   */
  scrollTo(target, extraOffset = 0) {
    const navbar     = document.getElementById('navbar');
    const navbarH    = navbar ? navbar.getBoundingClientRect().height : 80;
    const elementTop = target.getBoundingClientRect().top + window.scrollY;
    const scrollTo   = elementTop - navbarH - 20 - extraOffset;

    window.scrollTo({
      top:      Math.max(0, scrollTo),
      behavior: 'smooth',
    });
  },

  /**
   * Scroll to the top of the page.
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },


  /* ─────────────────────────────────────────
     SCROLL-TO-TOP BUTTON
     ───────────────────────────────────────── */
  setupScrollToTop() {
    const btn = document.getElementById(this.SCROLL_TOP_ID);
    if (!btn) return;

    // Show / hide on scroll
    const onScroll = throttle(() => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > this.SCROLL_TOP_THRESHOLD) {
        btn.classList.add('is-visible');
        btn.setAttribute('aria-hidden', 'false');
      } else {
        btn.classList.remove('is-visible');
        btn.setAttribute('aria-hidden', 'true');
      }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });

    // Click handler
    btn.addEventListener('click', () => this.scrollToTop());
  },


  /* ─────────────────────────────────────────
     SCROLL PROGRESS BAR
     A thin bar at the top of the page that
     fills as the user scrolls down.
     ───────────────────────────────────────── */
  setupProgressBar() {
    const bar = document.getElementById(this.PROGRESS_BAR_ID);
    if (!bar) return;

    const updateProgress = throttle(() => {
      const scrollY   = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      bar.style.width = `${clamp(progress, 0, 100)}%`;
    }, 16);

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Set initial state
  },


  /* ─────────────────────────────────────────
     UTILITY: Get current scroll position
     ───────────────────────────────────────── */
  getScrollY() {
    return window.scrollY || window.pageYOffset;
  },

  /**
   * Check if an element is in the viewport.
   * @param {Element} el
   * @param {number} [offset=0]
   * @returns {boolean}
   */
  isInViewport(el, offset = 0) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top <= (window.innerHeight - offset) && rect.bottom >= 0;
  },
};

/* Register with VMM */
VMM.register('scroll', ScrollModule);

/* Expose for direct use */
window.ScrollModule = ScrollModule;
