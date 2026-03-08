/**
 * hero.js — 3D Hero Section: Particles + Cursor Parallax
 * Portfolio: Teja Sai Pavan Nakka  |  TSPN.dev
 *
 * Architecture:
 *   - Ambient particle canvas: floating purple/indigo dust particles
 *   - Cursor parallax: each .skill-icon moves at its own depth via rAF lerp
 *
 * DOM structure (parallax-safe, no CSS/JS transform conflict):
 *   .skill-icon        ← JS-only: perspective + translate3d + rotateX/Y
 *     └─ .float-wrap   ← CSS-only: idle float keyframe animation
 *          └─ .icon-inner
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     SECTION 1 — Ambient particle canvas
  ═══════════════════════════════════════════════════════════ */

  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const PARTICLE_COUNT = 90;
  const particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }

    reset(random) {
      this.x     = Math.random() * W;
      this.y     = random ? Math.random() * H : H + 10;
      this.r     = Math.random() * 1.6 + 0.3;
      this.vx    = (Math.random() - 0.5) * 0.25;
      this.vy    = -(Math.random() * 0.5 + 0.2);
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '168,85,247' : '99,102,241';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset(false);
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = `rgba(${this.color},1)`;
      ctx.shadowColor = `rgba(${this.color},0.8)`;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ═══════════════════════════════════════════════════════════
     SECTION 2 — Cursor parallax for floating skill icons
     ─────────────────────────────────────────────────────────
     Each icon has:
       depth  px of translation on cursor edge (higher = more movement)
       tilt   degrees of rotateX/Y on cursor edge (higher = more tilt)
     The outer .skill-icon element is the ONLY transform target for JS.
     CSS float animation lives on .float-wrap (child) — no conflict.
  ═══════════════════════════════════════════════════════════ */

  const PERSPECTIVE = 600; // px — controls perceived 3D depth

  const icons = [
    { id: 'si-sf',    depth: 28, tilt: 8  },
    { id: 'si-apex',  depth: 46, tilt: 14 },
    { id: 'si-lwc',   depth: 34, tilt: 10 },
    { id: 'si-cpq',   depth: 22, tilt: 7  },
    { id: 'si-api',   depth: 40, tilt: 12 },
    { id: 'si-db',    depth: 36, tilt: 11 },
    { id: 'si-bolt',  depth: 52, tilt: 16 },
    { id: 'si-react', depth: 20, tilt: 6  },
    { id: 'si-py',    depth: 24, tilt: 7  },
    { id: 'si-fig',   depth: 42, tilt: 13 },
  ].map(ic => ({
    el: document.getElementById(ic.id),
    depth: ic.depth,
    tilt: ic.tilt,
    tx: 0, ty: 0, rx: 0, ry: 0, // lerp state
  }));

  // Raw cursor position, normalised to -1..+1 from hero centre
  let rawX = 0, rawY = 0;
  const heroEl = document.getElementById('hero3d');

  heroEl.addEventListener('mousemove', e => {
    const r = heroEl.getBoundingClientRect();
    rawX = (e.clientX - r.left  - r.width  * 0.5) / (r.width  * 0.5);
    rawY = (e.clientY - r.top   - r.height * 0.5) / (r.height * 0.5);
  });
  heroEl.addEventListener('mouseleave', () => { rawX = 0; rawY = 0; });

  // Touch support for mobile
  heroEl.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const r = heroEl.getBoundingClientRect();
    rawX = (t.clientX - r.left  - r.width  * 0.5) / (r.width  * 0.5);
    rawY = (t.clientY - r.top   - r.height * 0.5) / (r.height * 0.5);
  }, { passive: true });

  /** Linear interpolation */
  const lerp = (a, b, t) => a + (b - a) * t;
  const LERP_SPEED = 0.055; // lower = smoother, laggy chase

  function tickParallax() {
    icons.forEach(ic => {
      if (!ic.el) return;

      ic.tx = lerp(ic.tx,  rawX * ic.depth,  LERP_SPEED);
      ic.ty = lerp(ic.ty,  rawY * ic.depth,  LERP_SPEED);
      ic.rx = lerp(ic.rx, -rawY * ic.tilt,   LERP_SPEED);
      ic.ry = lerp(ic.ry,  rawX * ic.tilt,   LERP_SPEED);

      // perspective() MUST be first — without it rotateX/Y produce no visible tilt
      ic.el.style.transform =
        `perspective(${PERSPECTIVE}px) ` +
        `translate3d(${ic.tx}px, ${ic.ty}px, 0px) ` +
        `rotateX(${ic.rx}deg) ` +
        `rotateY(${ic.ry}deg)`;
    });
    requestAnimationFrame(tickParallax);
  }
  tickParallax();

})();
