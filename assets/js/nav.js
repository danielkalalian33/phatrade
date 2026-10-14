/**
 * nav.js — Navigation interactivity for PHATRADE website
 *
 * Responsibilities:
 *  1. Active-page link highlighting  (aria-current="page")
 *  2. Hamburger menu toggle          (aria-expanded + .is-open)
 *  3. Focus trap inside mobile overlay
 *  4. Escape key closes overlay
 *  5. Hash-based scroll-to-section with brief highlight animation
 *
 * This module is imported AFTER components.js has injected the navbar into
 * #navbar-root, so all selectors are read at DOMContentLoaded time.
 *
 * Requirements: 1.3, 1.4, 1.5, 1.8, 1.9, 12.8
 */

/* --------------------------------------------------------------------------
   1. Active-page link highlighting
   -------------------------------------------------------------------------- */

/**
 * Compare the current page's pathname to each nav link's href and set
 * aria-current="page" on the matching link.
 *
 * Handles both the desktop link list and the mobile overlay link list.
 */
function highlightActiveLink() {
  const pathname = window.location.pathname;

  // Normalise: extract the final path segment (e.g. "/about.html" → "about.html")
  const currentSegment = pathname.split('/').pop() || 'index.html';
  // Treat bare "/" or an empty segment as the home page
  const isRoot = pathname === '/' || pathname === '' || currentSegment === '';

  const navLinks = document.querySelectorAll(
    '.navbar__links a, .navbar__mobile-menu__links a'
  );

  navLinks.forEach((link) => {
    // Extract the filename from the link's href attribute value
    const hrefAttr = link.getAttribute('href') || '';
    const hrefSegment = hrefAttr.split('/').pop() || 'index.html';

    let isActive = false;

    if (isRoot) {
      // Root path matches index.html or empty href
      isActive = hrefSegment === 'index.html' || hrefAttr === '/' || hrefAttr === '';
    } else {
      isActive = currentSegment !== '' && currentSegment === hrefSegment;
    }

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/* --------------------------------------------------------------------------
   2 & 3 & 4. Hamburger menu toggle + focus trap + Escape key
   -------------------------------------------------------------------------- */

/** Selector helpers — resolved lazily so they work after components.js injects */
function getHamburger()  { return document.querySelector('.navbar__hamburger'); }
function getMobileMenu() { return document.querySelector('.navbar__mobile-menu'); }
function getCloseBtn()   { return document.querySelector('.navbar__mobile-menu__close'); }

/**
 * Return all keyboard-focusable elements inside the mobile menu overlay.
 * @returns {HTMLElement[]}
 */
function getFocusableElements() {
  const overlay = getMobileMenu();
  if (!overlay) return [];

  return Array.from(
    overlay.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
}

/**
 * Open the mobile overlay.
 */
function openMenu() {
  const hamburger = getHamburger();
  const overlay   = getMobileMenu();
  if (!hamburger || !overlay) return;

  hamburger.setAttribute('aria-expanded', 'true');
  overlay.classList.add('is-open');

  // Move focus to the close button (first focusable element in the overlay)
  const closeBtn = getCloseBtn();
  if (closeBtn) closeBtn.focus();
}

/**
 * Close the mobile overlay and return focus to the hamburger button.
 */
function closeMenu() {
  const hamburger = getHamburger();
  const overlay   = getMobileMenu();
  if (!hamburger || !overlay) return;

  hamburger.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('is-open');

  // Return focus to the trigger that opened the menu
  hamburger.focus();
}

/**
 * Focus-trap handler.
 * When the overlay is open, Tab / Shift+Tab cycle strictly within the
 * overlay's focusable elements.
 *
 * @param {KeyboardEvent} e
 */
function handleOverlayKeydown(e) {
  const overlay = getMobileMenu();
  if (!overlay || !overlay.classList.contains('is-open')) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
    return;
  }

  if (e.key !== 'Tab') return;

  const focusable = getFocusableElements();
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    // Shift+Tab: if we are on the first element, wrap to last
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    // Tab: if we are on the last element, wrap to first
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/**
 * Wire all hamburger / overlay event listeners.
 */
function initHamburger() {
  const hamburger = getHamburger();
  const overlay   = getMobileMenu();
  const closeBtn  = getCloseBtn();

  if (!hamburger || !overlay) return;

  // Hamburger click — toggle
  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close button inside overlay
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Overlay nav links — close menu after navigation
  overlay.querySelectorAll('.navbar__mobile-menu__links a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });

  // Keyboard: Escape + focus trap (document-level listener)
  document.addEventListener('keydown', handleOverlayKeydown);
}

/* --------------------------------------------------------------------------
   5. Hash-based scroll-to-section with highlight animation
   -------------------------------------------------------------------------- */

/**
 * CSS animation class added to the hash target element.
 * Remove it after 1 s so subsequent navigations re-trigger it.
 */
const HIGHLIGHT_CLASS = '--highlight';

/**
 * If the URL contains a hash fragment, scroll that element into view and
 * briefly apply the highlight animation class.
 */
function handleHashScroll() {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return; // no hash or bare "#"

  // Remove the leading "#"
  const id = hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;

  // Use smooth scroll; give components.js a tick to inject content first
  // (DOMContentLoaded fires after injection, so this is purely defensive)
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  target.classList.add(HIGHLIGHT_CLASS);
  setTimeout(() => {
    target.classList.remove(HIGHLIGHT_CLASS);
  }, 1000);
}

/* --------------------------------------------------------------------------
   Bootstrap on DOMContentLoaded
   -------------------------------------------------------------------------- */

function boot() {
  highlightActiveLink();
  initHamburger();
  handleHashScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
