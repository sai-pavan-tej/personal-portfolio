/**
 * journey.js — Micro-animations for the Professional Journey section
 *
 * Animations:
 *  1. Scroll-triggered entrance: each card slides in from the right + fades in,
 *     nodes pop in from the left, both staggered by entry index.
 *  2. Spine draw-in: the SVG spine strokes itself down as you scroll into view.
 *  3. Card 3D tilt on mouse move (subtle perspective shift).
 *  4. Active node pulse ring (CSS-driven, JS adds the class).
 */

(() => {
  /* ── Helpers ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── 1. Entrance observer ── */
  function initEntranceObserver() {
    const entries = $$('[data-journey-entry]');
    if (!entries.length) return;

    const io = new IntersectionObserver(
      (records) => {
        records.forEach((rec) => {
          if (rec.isIntersecting) {
            rec.target.classList.add('jrn-visible');
            io.unobserve(rec.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    entries.forEach((el) => io.observe(el));
  }

  /* ── 2. SVG spine draw-in ── */
  function initSpineDraw() {
    const path = $('path', $('#pj-wrapper'));
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    path.style.transition       = 'stroke-dashoffset 0s'; // reset for safety

    const io = new IntersectionObserver(
      ([rec]) => {
        if (rec.isIntersecting) {
          path.style.transition =
            'stroke-dashoffset 3.5s cubic-bezier(0.4, 0, 0.2, 1)';

          path.style.strokeDashoffset = '0';
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    io.observe($('#pj-wrapper'));
  }

  /* ── 3. Card 3D tilt on mouse move ── */
  function initCardTilt() {
    $$('[data-journey-card]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 … +1
        const dy     = (e.clientY - cy) / (rect.height / 2); // -1 … +1
        const rotX   = (-dy * 4).toFixed(2);  // max ±4 deg
        const rotY   = ( dx * 4).toFixed(2);
        card.style.transform =
          `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition =
          'transform 0.12s ease, box-shadow 0.3s ease, border-color 0.3s ease';
      });
    });
  }

  /* ── 4. Active node pulse ring ── */
  function initActivePulse() {
    const firstNode = $('[data-journey-node-active]');
    if (firstNode) firstNode.classList.add('jrn-pulse-active');
  }

  /* ── Bootstrap ── */
  document.addEventListener('DOMContentLoaded', () => {
    initEntranceObserver();
    initSpineDraw();
    initCardTilt();
    initActivePulse();
  });
})();
