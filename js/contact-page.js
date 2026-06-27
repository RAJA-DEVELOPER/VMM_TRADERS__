
'use strict';

VMM.register('ContactPage', {
  init() {
    this._initFAQ();
    this._initOpenStatus();
    this._initFormSubmit();
    this._init3DTilt();
  },

  /* ── 3D Tilt Effect ──────────────────────────────── */
  _init3DTilt() {
    const cards = document.querySelectorAll('.contact-info-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  },

  /* ── FAQ Accordion ───────────────────────────────── */
  _initFAQ() {
    const triggers = document.querySelectorAll('.faq-item__trigger');
    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const panelId = btn.getAttribute('aria-controls');
        const panel   = document.getElementById(panelId);
        const isOpen  = btn.getAttribute('aria-expanded') === 'true';

        // Close all other open items
        triggers.forEach((other) => {
          if (other !== btn) {
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (otherPanel && otherPanel.classList.contains('is-open')) {
              other.setAttribute('aria-expanded', 'false');
              otherPanel.classList.remove('is-open');
              const item = other.closest('.faq-item');
              if (item) item.classList.remove('is-open');
              
              setTimeout(() => {
                if (!otherPanel.classList.contains('is-open')) otherPanel.hidden = true;
              }, 400);
            }
          }
        });

        // Toggle current
        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          panel.classList.remove('is-open');
          const item = btn.closest('.faq-item');
          if (item) item.classList.remove('is-open');
          
          setTimeout(() => {
            if (!panel.classList.contains('is-open')) panel.hidden = true;
          }, 400);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
          // Force reflow then add class for smooth transition
          requestAnimationFrame(() => {
            panel.classList.add('is-open');
            const item = btn.closest('.faq-item');
            if (item) item.classList.add('is-open');
          });
        }
      });
    });
  },

  /* ── Open / Closed Business Status ──────────────── */
  _initOpenStatus() {
    const badge  = document.getElementById('open-status');
    const label  = document.getElementById('open-status-text');
    if (!badge || !label) return;

    const now  = new Date();
    const day  = now.getDay();   // 0=Sun, 1=Mon … 6=Sat
    const hour = now.getHours();
    const min  = now.getMinutes();
    const time = hour + min / 60;

    let isOpen = false;

    if (day >= 1 && day <= 6) {
      // Mon–Sat: 7:00 AM – 9:00 PM
      isOpen = time >= 7 && time < 21;
    } else {
      // Sunday: 9:00 AM – 6:00 PM
      isOpen = time >= 9 && time < 18;
    }

    if (isOpen) {
      label.textContent = 'We\'re Open Now';
      badge.style.background   = 'rgba(34,197,94,0.1)';
      badge.style.color         = '#16a34a';
    } else {
      label.textContent = 'Currently Closed';
      badge.style.background   = 'rgba(239,68,68,0.08)';
      badge.style.color         = '#b91c1c';
      const dot = badge.querySelector('.contact-info-card__open-dot');
      if (dot) dot.style.background = '#ef4444';
    }
  },

  /* ── Form Submit Integration ─────────────────────── */
  _initFormSubmit() {
    // Smooth scroll from hero CTA → form
    document.querySelectorAll('a[href="#contact-form"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('contact-form');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const firstField = target.querySelector('input, textarea');
            if (firstField) firstField.focus();
          }, 600);
        }
      });
    });
  }
});
