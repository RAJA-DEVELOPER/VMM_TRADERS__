/**
 * VMM TRADERS — about.js
 * Premium about-page interactions:
 *   - Journey timeline line-fill with parallax-awareness
 *   - Milestone staggered scroll reveal
 *   - Counter card entrance sequence
 *   - Feature list item stagger on scroll
 */

'use strict';

const AboutModule = {

  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  init() {
    this.initJourney();
    this.initFeatureStagger();
  },

  /* ─────────────────────────────────────────
     JOURNEY TIMELINE
     ───────────────────────────────────────── */
  initJourney() {
    const track = document.querySelector('.journey__track');
    if (!track) return;

    const milestones = track.querySelectorAll('.journey__milestone');
    const lineFill   = document.getElementById('journey-line-fill');
    if (!milestones.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (lineFill) lineFill.style.width = '100%';
      return;
    }

    const isVertical = () => window.innerWidth < 1024;

    /* ── Update line fill based on scroll position ── */
    const updateLine = () => {
      if (!lineFill) return;
      const rect = track.getBoundingClientRect();
      const viewH = window.innerHeight;
      const vert = isVertical();

      if (vert) {
        const progress = clamp(
          (viewH - rect.top) / (rect.height + viewH - 120),
          0, 1
        );
        lineFill.style.width = '100%';
        lineFill.style.height = `${progress * 100}%`;
      } else {
        const trackW = track.scrollWidth;
        const containerW = track.clientWidth;
        const maxScroll = trackW - containerW;
        if (maxScroll <= 0) return;
        const progress = clamp(track.scrollLeft / maxScroll, 0, 1);
        lineFill.style.height = '100%';
        lineFill.style.width = `${progress * 100}%`;
      }
    };

    const onScroll = throttle(updateLine, 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scroll', updateLine, { passive: true });
    updateLine();

    /* ── Observe milestones with IntersectionObserver ── */
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('revealed');
        /* Add a subtle entrance effect via data-delay */
        const delay = parseInt(el.dataset.delay) || 0;
        el.style.transitionDelay = `${delay * 0.08}s`;
        obs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    milestones.forEach((m) => obs.observe(m));

    /* ── Re-check on resize ── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLine, 200);
    }, { passive: true });
  },

  /* ─────────────────────────────────────────
     STAGGER FEATURE LIST ITEMS
     ───────────────────────────────────────── */
  initFeatureStagger() {
    const lists = document.querySelectorAll('.future__features, .serve__block-points');
    if (!lists.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lists.forEach((list) => {
      const items = list.children;
      if (!items.length) return;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          Array.from(items).forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-12px)';
            item.style.transition =
              `opacity 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.08}s, ` +
              `transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.08}s`;
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateX(0)';
            });
          });
          obs.unobserve(list);
        });
      }, { threshold: 0.3 });

      obs.observe(list);
    });
  },
};

VMM.register('about', AboutModule);
