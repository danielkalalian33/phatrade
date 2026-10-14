/**
 * animations.js — Shared scroll-reveal and count-up for all pages except homepage.
 * Homepage uses home.js which has the same logic.
 * This script is lightweight — only attaches observers, no layout work.
 */

/* --------------------------------------------------------------------------
   Scroll-reveal — same logic as home.js
   -------------------------------------------------------------------------- */
function initReveal() {
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  document.body.classList.add('js-animations');

  requestAnimationFrame(() => {
    const vh = window.innerHeight;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh + 50) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Count-up for .story-stat[data-count] elements
   -------------------------------------------------------------------------- */
function countUpStat(el) {
  const numEl = el.querySelector('.story-stat__year');
  if (!numEl) return;
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (isNaN(target)) return;

  const duration = 1600;
  let start = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    numEl.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else numEl.textContent = target + suffix;
  }

  requestAnimationFrame(step);
}

function initStoryStats() {
  const stats = document.querySelectorAll('.story-stat[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUpStat(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  stats.forEach((s) => observer.observe(s));
}

/* --------------------------------------------------------------------------
   Navbar scroll darkening — same as home.js, needed on inner pages too
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

initReveal();
initStoryStats();
initNavbarScroll();
