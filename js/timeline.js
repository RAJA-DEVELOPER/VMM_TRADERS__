/**
 * VMM TRADERS — timeline.js
 * Timeline section animations for the About page.
 * Each timeline item slides in as it enters the viewport.
 *
 * Usage in HTML:
 *   <div class="timeline">
 *     <div class="timeline__item" data-year="2020">
 *       <div class="timeline__dot"></div>
 *       <div class="timeline__content">...</div>
 *     </div>
 *   </div>
 *
 * The timeline line height grows as you scroll past items.
 */

'use strict';

const TimelineModule = {
  /* ── Config ── */
  ITEM_CLASS:    'timeline__item',
  VISIBLE_CLASS: 'timeline__item--visible',
  LINE_ID:       'timeline-line',
  THRESHOLD:     0.25,
  STAGGER_MS:    120,


  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  init() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    this.timeline = timeline;
    this.items    = timeline.querySelectorAll(`.${this.ITEM_CLASS}`);
    this.line     = document.getElementById(this.LINE_ID);

    if (!this.items.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.showAll();
      return;
    }

    this.setupItemObserver();
    this.setupLineAnimation();
    this.addYearLabels();
  },


  /* ─────────────────────────────────────────
     ITEM OBSERVER
     Each item fades/slides in when it enters view.
     ───────────────────────────────────────── */
  setupItemObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(this.VISIBLE_CLASS);
        observer.unobserve(entry.target);
      });
    }, {
      threshold:  this.THRESHOLD,
      rootMargin: '0px 0px -60px 0px',
    });

    this.items.forEach(item => observer.observe(item));
    this._observer = observer;
  },


  /* ─────────────────────────────────────────
     TIMELINE LINE ANIMATION
     The vertical connecting line grows as
     the user scrolls past the timeline.
     ───────────────────────────────────────── */
  setupLineAnimation() {
    const line = this.timeline.querySelector('.timeline__line');
    if (!line) return;

    const update = throttle(() => {
      const rect      = this.timeline.getBoundingClientRect();
      const viewH     = window.innerHeight;
      const progress  = clamp(
        (viewH - rect.top) / (rect.height + viewH),
        0, 1
      );
      line.style.setProperty('--line-progress', `${progress * 100}%`);
    }, 16);

    window.addEventListener('scroll', update, { passive: true });
    update(); // Set initial
  },


  /* ─────────────────────────────────────────
     ADD YEAR LABELS TO DOTS
     Reads data-year attribute and creates
     a floating label beside the dot.
     ───────────────────────────────────────── */
  addYearLabels() {
    this.items.forEach(item => {
      const year = item.dataset.year;
      if (!year) return;

      const dot = item.querySelector('.timeline__dot');
      if (!dot) return;

      // Only add if not already present
      if (dot.querySelector('.timeline__year')) return;

      const label = document.createElement('span');
      label.classList.add('timeline__year');
      label.textContent = year;
      dot.appendChild(label);
    });
  },


  /* ─────────────────────────────────────────
     SHOW ALL (reduced motion / fallback)
     ───────────────────────────────────────── */
  showAll() {
    this.items.forEach(item => item.classList.add(this.VISIBLE_CLASS));
    const line = this.timeline.querySelector('.timeline__line');
    if (line) line.style.setProperty('--line-progress', '100%');
  },


  /* ─────────────────────────────────────────
     STAGGER REVEAL (triggered externally)
     Reveals all items with a staggered delay.
     ───────────────────────────────────────── */
  staggerReveal() {
    this.items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add(this.VISIBLE_CLASS);
      }, i * this.STAGGER_MS);
    });
  },
};

/* Register with VMM */
VMM.register('timeline', TimelineModule);

/* Expose for direct use */
window.TimelineModule = TimelineModule;
