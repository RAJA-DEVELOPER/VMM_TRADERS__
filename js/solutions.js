/* =============================================================
   VMM TRADERS — SOLUTIONS PAGE JAVASCRIPT
   Handles: workflow step active state on scroll, newsletter
   ============================================================= */

(function () {
  'use strict';

  /* ── Workflow step highlight on scroll ── */
  function initWorkflowHighlight() {
    const steps = document.querySelectorAll('.sol-workflow__step');
    if (!steps.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('sol-workflow__step--active');
          }
        });
      },
      { threshold: 0.45, rootMargin: '0px 0px -80px 0px' }
    );

    steps.forEach(function (step) { observer.observe(step); });
  }

  /* ── Solution card hover illustration parallax ── */
  function initCardParallax() {
    const cards = document.querySelectorAll('.sol-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;

        card.style.setProperty('--rx', (-dy * 3).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (dx * 3).toFixed(2) + 'deg');
      });

      card.addEventListener('mouseleave', function () {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    });
  }

  /* ── Category card hover micro-interaction ── */
  function initCatCardHover() {
    const catCards = document.querySelectorAll('.sol-cat-card');
    catCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease-out';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.35s ease-out, box-shadow 0.35s ease-out';
      });
    });
  }

  /* ── Newsletter form (footer) ── */
  function initNewsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn   = document.getElementById('newsletter-submit');
      if (!input || !input.value.trim()) return;

      var original = btn.textContent;
      btn.textContent = '✓ Subscribed!';
      btn.disabled = true;
      btn.style.background = '#2D9C64';

      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        input.value = '';
      }, 3000);
    });
  }

  /* ── Smooth anchor scroll for hero buttons ── */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#sol-"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var navbar = document.getElementById('navbar');
        var offset = navbar ? navbar.getBoundingClientRect().height + 20 : 90;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  }

  /* ── Workflow horizontal scroll hint ── */
  function initWorkflowScrollHint() {
    var trackWrap = document.querySelector('.sol-workflow__track-wrap');
    if (!trackWrap) return;

    // Fade-in hint arrow if content overflows
    if (trackWrap.scrollWidth > trackWrap.clientWidth + 20) {
      trackWrap.classList.add('sol-workflow__track-wrap--overflow');
    }
  }

  /* ── Init all on DOM ready ── */
  function init() {
    initWorkflowHighlight();
    initCardParallax();
    initCatCardHover();
    initNewsletterForm();
    initSmoothAnchors();
    initWorkflowScrollHint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
