/**
 * nav.js — Navigation enhancements (v3)
 *
 * 1. Logo click / TSPN.dev → scroll to hero
 * 2. Smooth scrolling for navbar link clicks (with navbar-offset)
 * 3. Active nav highlight via scroll position (reliable across all sections)
 */

(() => {
  const NAVBAR_HEIGHT = 72;
  const ACTIVATION_OFFSET = NAVBAR_HEIGHT + 40; // px past section top = "active"

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── 1. LOGO → scroll to hero ── */
  function initLogoScroll() {
    const logo = $('nav .flex.items-center.gap-3');
    if (!logo) return;
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  /* ── 2. SMOOTH SCROLL for navbar links ── */
  function initSmoothScroll() {
    $$('nav a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── 3. ACTIVE NAV HIGHLIGHT (scroll-position based) ── */
  function initActiveNav() {
    const navLinks = $$('nav a[href^="#"]');
    if (!navLinks.length) return;

    // Build ordered list: [{ id, el, link }]
    const sections = navLinks
      .map((a) => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        return el ? { id, el, link: a } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    function setActive(id) {
      navLinks.forEach((a) => a.classList.remove('nav-active'));
      const match = sections.find((s) => s.id === id);
      if (match) match.link.classList.add('nav-active');
    }

    function updateActive() {
      const scrollY = window.scrollY;

      // If near the very top, clear all (hero zone)
      if (scrollY < 80) {
        setActive(null);
        return;
      }

      // Walk sections from bottom to top — first one whose top is above
      // (scrollY + ACTIVATION_OFFSET) wins
      let active = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionTop = sections[i].el.getBoundingClientRect().top + scrollY;
        if (scrollY + ACTIVATION_OFFSET >= sectionTop) {
          active = sections[i].id;
          break;
        }
      }
      setActive(active);
    }

    // Throttle to ~60fps
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Run once on load
    updateActive();
  }

  /* ── 4. EYE TRACKING ANIMATION ── */
  function initEyeTracking() {
    const eyes = $$('.eye');
    if (!eyes.length) return;

    // Throttle for performance
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!ticking) {
        requestAnimationFrame(updateEyes);
        ticking = true;
      }
    });

    function updateEyes() {
      eyes.forEach(eye => {
        const pupil = eye.querySelector('.pupil');
        if (!pupil) return;

        const rect = eye.getBoundingClientRect();
        
        // Find the center of the eye
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        // Calculate angle between eye center and mouse
        const angle = Math.atan2(mouseY - eyeY, mouseX - eyeX);
        
        // Define distance pupil can travel (radius of eye - radius of pupil - small padding)
        const distance = 8; 
        
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        
        // Update pupil position
        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      ticking = false;
    }
  }

  /* ── Bootstrap ── */
  document.addEventListener('DOMContentLoaded', () => {
    initLogoScroll();
    initSmoothScroll();
    initActiveNav();
    initEyeTracking();
  });
})();
