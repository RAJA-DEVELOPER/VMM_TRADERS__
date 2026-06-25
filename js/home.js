/**
 * VMM TRADERS — home.js
 * JavaScript specific to the Home page only.
 * Handles: hero load animation, counter observer,
 * timeline progress line, newsletter form, hero scroll-zoom.
 */

'use strict';

/* ─────────────────────────────────────────
   COUNTER ANIMATION
   Triggered by IntersectionObserver when
   .stat-glass-card enters the viewport.
   ───────────────────────────────────────── */
(function initCounters() {
  const counterEls = document.querySelectorAll('[data-counter]');
  if (!counterEls.length) return;

  const DURATION_MS = 2000; // 2 seconds

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const target    = parseFloat(el.dataset.target)  || 0;
    const suffix    = el.dataset.suffix    || '';
    const separator = el.dataset.separator || '';
    const decimals  = el.dataset.decimals  ? parseInt(el.dataset.decimals, 10) : 0;
    const start     = performance.now();

    function formatNumber(num) {
      const fixed = num.toFixed(decimals);
      if (separator && num >= 1000) {
        return Number(fixed).toLocaleString('en-IN');
      }
      return fixed;
    }

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased    = easeOutQuart(progress);
      const current  = target * eased;

      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counterEl = entry.target.querySelector('[data-counter]');
          if (counterEl) animateCounter(counterEl);
          // Also trigger direct if element itself is counter
          if (entry.target.hasAttribute('data-counter')) {
            animateCounter(entry.target);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  // Observe each stat card
  document.querySelectorAll('.stat-glass-card').forEach((card) => observer.observe(card));
  // Also observe lone counter elements
  counterEls.forEach((el) => {
    if (!el.closest('.stat-glass-card')) observer.observe(el);
  });
})();


/* ─────────────────────────────────────────
   TIMELINE PROGRESS LINE
   Grows the .how-steps__line-fill as user
   scrolls through the section.
   ───────────────────────────────────────── */
(function initTimelineLine() {
  const lineFill   = document.getElementById('timeline-line-fill');
  const howSection = document.querySelector('.how-works');
  if (!lineFill || !howSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Delay slightly for reveal effect
          setTimeout(() => {
            lineFill.style.width = '100%';
          }, 400);
          observer.unobserve(howSection);
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(howSection);
})();


/* ─────────────────────────────────────────
   HOW-STEP BUBBLES
   Add active class to each step as it reveals.
   ───────────────────────────────────────── */
(function initHowSteps() {
  const steps = document.querySelectorAll('.how-step');
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.4 }
  );

  steps.forEach((step) => observer.observe(step));
})();


/* ─────────────────────────────────────────
   SCROLL-REVEAL — reveal class handler
   Uses IntersectionObserver on elements
   with reveal / reveal-* classes.
   ───────────────────────────────────────── */
(function initScrollReveal() {
  const revealClasses = [
    '.reveal',
    '.reveal-down',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.reveal-zoom',
    '.reveal-fade',
    '.reveal-image',
    '.img-reveal-wrap',
  ];

  const elements = document.querySelectorAll(revealClasses.join(','));
  if (!elements.length) return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  // Apply stagger delays from data-delay attribute
  elements.forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) {
      el.style.transitionDelay = `${parseInt(delay, 10) * 0.15}s`;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
    threshold: 0.08,
        rootMargin: '0px 0px -80px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ─────────────────────────────────────────
   NEWSLETTER FORM
   Simple client-side validation + feedback.
   ───────────────────────────────────────── */
(function initNewsletter() {
  const form        = document.getElementById('newsletter-form');
  const input       = document.getElementById('newsletter-email');
  const submit      = document.getElementById('newsletter-submit');
  const errorEl     = document.getElementById('newsletter-error');
  if (!form || !input || !submit) return;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(msg) {
    input.style.borderColor = '#EF4444';
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('is-visible');
    }
    // Shake animation
    input.style.animation = 'none';
    requestAnimationFrame(() => {
      input.style.animation = 'shake 0.4s ease';
    });
  }

  function clearError() {
    input.style.borderColor = '';
    input.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = input.value.trim();

    if (!email) {
      showError('Please enter your email address');
      input.focus();
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      showError('Please enter a valid email address');
      input.focus();
      return;
    }

    clearError();

    // Loading state
    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Subscribing…';

    // Simulate API call
    setTimeout(() => {
      submit.textContent = '✓ Subscribed!';
      submit.style.setProperty('background', 'var(--clr-success)');
      input.value = '';

      setTimeout(() => {
        submit.textContent = originalText;
        submit.style.background = '';
        submit.disabled = false;
      }, 3000);
    }, 1200);
  });

  // Clear error on input
  input.addEventListener('input', clearError);
})();


/* ─────────────────────────────────────────
   HERO PARALLAX
   Subtle translateY on hero background on scroll.
   Waits for entrance animation to complete before activating.
   ───────────────────────────────────────── */
(function initHeroParallax() {
  const heroBg = document.querySelector('.hero__bg-img');
  if (!heroBg) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;
  let active = false;

  // Activate after entrance animation finishes (1.2s + buffer)
  setTimeout(() => { active = true; }, 1400);

  function onScroll() {
    if (!active || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.28}px)`;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─────────────────────────────────────────
   SCROLL INDICATOR — hide on scroll
   ───────────────────────────────────────── */
(function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  let hidden = false;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 200 && !hidden) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
      hidden = true;
    } else if (window.scrollY <= 200 && hidden) {
      indicator.style.opacity = '';
      indicator.style.pointerEvents = '';
      hidden = false;
    }
  }, { passive: true });
})();


/* ─────────────────────────────────────────
   RATING BARS ANIMATION
   Grow on viewport entry.
   ───────────────────────────────────────── */
(function initRatingBars() {
  const bars = document.querySelectorAll('.rating-bar__fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Width is set inline in HTML; just ensure transition fires
          bars.forEach((bar) => {
            const target = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = target; }, 50);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const ratingSection = document.querySelector('.testimonials__rating-bar');
  if (ratingSection) observer.observe(ratingSection);
})();


/* ─────────────────────────────────────────
   YEAR — footer copyright
   ───────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────
   SMOOTH SCROLL — anchor links
   ───────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id     = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const navbar = document.getElementById('navbar');
      const navH   = navbar ? navbar.getBoundingClientRect().height : 72;

      const top =
        target.getBoundingClientRect().top + window.scrollY - navH - 20;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────
   BUTTON RIPPLE EFFECT
   Creates ripple span on .btn click.
   ───────────────────────────────────────── */
(function initRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      // Remove old ripples
      const old = this.querySelectorAll('.ripple-el');
      old.forEach((r) => r.remove());

      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-el';
      Object.assign(ripple.style, {
        position:     'absolute',
        width:        size + 'px',
        height:       size + 'px',
        left:         x + 'px',
        top:          y + 'px',
        borderRadius: '50%',
        background:   'rgba(255,255,255,0.25)',
        transform:    'scale(0)',
        animation:    'rippleExpand 0.55s ease forwards',
        pointerEvents:'none',
        zIndex:       0,
      });

      this.style.position  = 'relative';
      this.style.overflow  = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
})();
