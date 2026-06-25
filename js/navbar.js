/**
 * VMM TRADERS — navbar.js
 * Sticky navigation, mobile menu toggle, active page highlighting,
 * transparent-to-glassmorphism scroll behavior.
 *
 * IDs expected in HTML:
 *   #navbar           — <header> element
 *   #nav-toggle       — hamburger <button>
 *   #mobile-menu      — mobile <div> overlay
 */

'use strict';

const NavbarModule = {

  /* ── DOM refs ── */
  navbar:      null,
  toggle:      null,
  mobileMenu:  null,

  /* ── State ── */
  isOpen:    false,
  lastY:     0,
  ticking:   false,

  /* ── Config ── */
  SCROLL_THRESHOLD: 60,       // px before glassmorphism kicks in
  GLASS_CLASS:      'navbar--glass',
  OPEN_CLASS:       'is-open',


  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  init() {
    this.navbar     = document.getElementById('navbar');
    this.toggle     = document.getElementById('nav-toggle');
    this.mobileMenu = document.getElementById('mobile-menu');

    if (!this.navbar) return;

    this.bindEvents();
    this.onScroll();        // Set correct initial state immediately
    this.markActiveLinks(); // Highlight current page link
  },


  /* ─────────────────────────────────────────
     EVENT BINDING
     ───────────────────────────────────────── */
  bindEvents() {
    /* Scroll — rAF throttled */
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.onScroll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    /* Hamburger button */
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this.toggleMenu());
    }

    /* Close menu when a mobile link is clicked */
    if (this.mobileMenu) {
      this.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
    }

    /* Escape key closes menu */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.closeMenu();
    });

    /* Click outside closes menu */
    document.addEventListener('click', e => {
      if (!this.isOpen) return;
      const inside =
        this.navbar.contains(e.target) ||
        (this.mobileMenu && this.mobileMenu.contains(e.target));
      if (!inside) this.closeMenu();
    });

    /* Resize — close menu at desktop width */
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && this.isOpen) this.closeMenu();
    }, 150));
  },


  /* ─────────────────────────────────────────
     SCROLL HANDLER
     transparent → glass on scroll
     ───────────────────────────────────────── */
  onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > this.SCROLL_THRESHOLD) {
      this.navbar.classList.add(this.GLASS_CLASS);
    } else {
      this.navbar.classList.remove(this.GLASS_CLASS);
    }

    this.lastY = scrollY;
  },


  /* ─────────────────────────────────────────
     MOBILE MENU
     ───────────────────────────────────────── */
  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  },

  openMenu() {
    this.isOpen = true;

    if (this.toggle) {
      this.toggle.classList.add(this.OPEN_CLASS);
      this.toggle.setAttribute('aria-expanded', 'true');
    }

    if (this.mobileMenu) {
      this.mobileMenu.style.display = 'flex';
      /* Force reflow so CSS transition fires */
      void this.mobileMenu.offsetHeight;
      this.mobileMenu.classList.add(this.OPEN_CLASS);
      this.mobileMenu.removeAttribute('aria-hidden');
    }

    document.body.style.overflow = 'hidden';
  },

  closeMenu() {
    this.isOpen = false;

    if (this.toggle) {
      this.toggle.classList.remove(this.OPEN_CLASS);
      this.toggle.setAttribute('aria-expanded', 'false');
    }

    if (this.mobileMenu) {
      this.mobileMenu.classList.remove(this.OPEN_CLASS);
      this.mobileMenu.setAttribute('aria-hidden', 'true');

      const done = () => {
        if (!this.isOpen) this.mobileMenu.style.display = 'none';
        this.mobileMenu.removeEventListener('transitionend', done);
      };
      this.mobileMenu.addEventListener('transitionend', done);
    }

    document.body.style.overflow = '';
  },


  /* ─────────────────────────────────────────
     ACTIVE LINK HIGHLIGHTING
     Matches current page filename to href.
     ───────────────────────────────────────── */
  markActiveLinks() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    const allLinks = document.querySelectorAll(
      '.navbar__link, .navbar__mobile-link'
    );

    allLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
      const href     = link.getAttribute('href') || '';
      const hrefPage = href.split('/').pop();
      if (
        hrefPage === page ||
        (page === '' && hrefPage === 'index.html')
      ) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  },
};

/* Register with VMM global */
VMM.register('navbar', NavbarModule);
