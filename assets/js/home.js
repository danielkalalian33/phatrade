/**
 * home.js — Homepage animations (ES module, runs after HTML parse)
 * - Scroll-reveal via IntersectionObserver
 * - Count-up on stat counters
 * - Navbar darkens on scroll
 */

/* --------------------------------------------------------------------------
   Scroll-reveal
   Approach: JS adds the hidden state, so elements are always visible
   if JS hasn't run. Then we hide & animate elements below the fold.
   -------------------------------------------------------------------------- */
function initReveal() {
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  // Enable CSS-gated scroll-reveal animations (matches animations.js behaviour)
  document.body.classList.add('js-animations');

  // Wait one rAF so layout is settled (getBoundingClientRect is reliable)
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
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh + 50) {
        // Already in or near viewport — show immediately, no animation
        el.classList.add('is-visible');
      } else {
        // Below fold — observe for scroll-in animation
        observer.observe(el);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Count-up
   -------------------------------------------------------------------------- */
function countUp(el, target, duration) {
  const numEl = el.querySelector('.stat-counter__num');
  if (!numEl) return;
  duration = duration || 1800;

  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    numEl.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else numEl.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-counter[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target, parseInt(entry.target.dataset.target, 10));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => observer.observe(c));
}

/* --------------------------------------------------------------------------
   Navbar scroll darkening
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

/* --------------------------------------------------------------------------
   Run — deferred scripts run after HTML is parsed, no DOMContentLoaded needed
   -------------------------------------------------------------------------- */

initReveal();
initCounters();
initNavbarScroll();
