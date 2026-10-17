/**
 * components.js — Shared navbar and footer injection for PHATRADE website
 *
 * Injects the shared Navigation_Bar into `#navbar-root` and the shared Footer
 * into `#footer-root` on every page. Both mount points are optional; missing
 * elements are handled gracefully (no errors thrown).
 *
 * Requirements: 1.1, 1.2, 1.6, 1.7
 */

/* --------------------------------------------------------------------------
   Navigation HTML
   Includes:
     • Skip link → #main-content (accessibility)
     • Logo with <img> + <span id="logo-text"> fallback (Req 1.9 / Task 5.7)
     • Desktop nav links (.navbar__links)
     • Hamburger button (Req 1.3)
     • Mobile overlay (.navbar__mobile-menu) with close button (Req 1.8)
   -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { href: 'index.html',           label: 'Home'           },
  { href: 'about.html',           label: 'About'          },
  { href: 'products.html',        label: 'Products'       },
  { href: 'applications.html',    label: 'Applications'   },
  { href: 'facilities.html',      label: 'Facilities'     },
  { href: 'quality.html',         label: 'Quality'        },
  { href: 'sustainability.html',  label: 'Sustainability'  },
  { href: 'contact.html',         label: 'Contact'        },
];

/**
 * Build the <li> elements for a given link array.
 * @param {Array<{href: string, label: string}>} links
 * @returns {string}
 */
function buildDesktopLinks(links) {
  return links
    .map(
      ({ href, label }) =>
        `<li><a href="${href}">${label}</a></li>`
    )
    .join('\n          ');
}

/**
 * Build the <a> elements for the mobile overlay.
 * @param {Array<{href: string, label: string}>} links
 * @returns {string}
 */
function buildMobileLinks(links) {
  return links
    .map(
      ({ href, label }) =>
        `<a href="${href}">${label}</a>`
    )
    .join('\n          ');
}

const NAVBAR_HTML = /* html */ `
<a class="skip-link" href="#main-content">Skip to main content</a>

<nav class="navbar" aria-label="Main navigation">
  <div class="navbar__inner">

    <!-- Logo (links to Home) -->
    <a class="navbar__logo" href="index.html" aria-label="PHATRADE – Phatrade Essential Oils home">
      <img
        src="assets/images/logo.png"
        alt="PHATRADE Essential Oils"
        width="90"
        height="90"
        loading="eager"
      />
    </a>

    <!-- Desktop navigation links -->
    <ul class="navbar__links" role="list">
          ${buildDesktopLinks(NAV_LINKS)}
    </ul>

    <!-- Hamburger button (mobile) -->
    <button
      class="navbar__hamburger"
      id="hamburger-btn"
      aria-label="Open navigation menu"
      aria-expanded="false"
      aria-controls="mobile-menu"
    >
      <!-- Open icon (three lines) -->
      <svg class="icon-open" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <line x1="3" y1="6"  x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
      <!-- Close icon (×) — shown when menu is open -->
      <svg class="icon-close" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
      </svg>
    </button>

  </div>
</nav>

<!-- Mobile full-screen overlay menu -->
<div
  class="navbar__mobile-menu"
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Navigation menu"
>
  <div class="navbar__mobile-menu__header">
    <!-- Logo (repeat for visual context inside overlay) -->
    <a class="navbar__logo" href="index.html" aria-label="PHATRADE – Phatrade Essential Oils home" tabindex="-1">
      <img
        src="assets/images/logo.png"
        alt="PHATRADE Essential Oils"
        width="68"
        height="68"
        loading="lazy"
      />
    </a>

    <!-- Close button -->
    <button
      class="navbar__mobile-menu__close"
      id="mobile-menu-close"
      aria-label="Close navigation menu"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <nav class="navbar__mobile-menu__links" aria-label="Mobile navigation">
          ${buildMobileLinks(NAV_LINKS)}
  </nav>
</div>
`.trim();

/* --------------------------------------------------------------------------
   Footer HTML
   Includes:
     • Brand block (logo + tagline)
     • 9-link navigation column
     • <address> block (offices, phones, email) — Req 1.7
     • Copyright notice
   -------------------------------------------------------------------------- */

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = NAV_LINKS; // same 9 links

function buildFooterLinks(links) {
  return links
    .map(
      ({ href, label }) =>
        `<li><a href="${href}">${label}</a></li>`
    )
    .join('\n          ');
}

const FOOTER_HTML = /* html */ `
<footer class="footer" aria-label="Site footer">

  <!-- Top accent line -->
  <div class="footer__topbar"></div>

  <div class="footer__body">
    <div class="container">
      <div class="footer__grid">

        <!-- Col 1: Brand -->
        <div class="footer__col footer__col--brand">
          <a class="footer__logo-link" href="index.html" aria-label="PHATRADE home">
            <img src="assets/images/logo.png" alt="PHATRADE Essential Oils" width="110" height="110" loading="lazy" />
          </a>
          <p class="footer__tagline">
            Natural aromatic ingredients from Egypt since 1975. Trusted by fragrance, flavour and cosmetics manufacturers worldwide.
          </p>
          <p class="footer__slogan">Where Nature Meets Global Trust</p>
          <div class="footer__certs" aria-label="Certifications">
            <span class="footer__cert-badge">GFSI</span>
            <span class="footer__cert-badge">HACCP</span>
            <span class="footer__cert-badge">FDA</span>
            <span class="footer__cert-badge">KOSHER</span>
          </div>
          <div class="footer__social" aria-label="Social media">
            <a href="https://eg.linkedin.com/company/phatrade" class="footer__social-link" aria-label="PHATRADE on LinkedIn" rel="noopener noreferrer" target="_blank">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Products -->
        <div class="footer__col">
          <h3 class="footer__col-heading">Products</h3>
          <ul class="footer__col-links" role="list">
            <li><a href="products.html?category=Essential%20Oils">Essential Oils</a></li>
            <li><a href="products.html?category=Concretes">Concretes</a></li>
            <li><a href="products.html?category=Absolutes">Absolutes</a></li>
            <li><a href="products.html?category=Aroma%20Chemicals">Aroma Chemicals</a></li>
          </ul>
        </div>

        <!-- Col 3: Company -->
        <div class="footer__col">
          <h3 class="footer__col-heading">Company</h3>
          <ul class="footer__col-links" role="list">
            <li><a href="about.html">About PHATRADE</a></li>
            <li><a href="facilities.html">Our Facilities</a></li>
            <li><a href="quality.html">Quality Assurance</a></li>
            <li><a href="sustainability.html">Sustainability</a></li>
            <li><a href="applications.html">Applications</a></li>
          </ul>
        </div>

        <!-- Col 4: Contact -->
        <div class="footer__col">
          <h3 class="footer__col-heading">Contact</h3>
          <address class="footer__address">
            <div class="footer__address-block">
              <p class="footer__address-label">Head Office &amp; Production</p>
              <p>3 Street 194, Western Extension,<br>Industrial Zone, Obour City 11181,<br>Cairo, Egypt</p>
            </div>
            <div class="footer__address-block">
              <p class="footer__address-label">Factory &amp; Farm</p>
              <p>Km 15, Sadat City–Kafr Dawood Road,<br>Al-Beheira Governorate, Egypt</p>
            </div>
            <div class="footer__contact-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+20224810158">+2 02 4481 0158</a>
            </div>
            <div class="footer__contact-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:info@phatrade-eg.com">info@phatrade-eg.com</a>
            </div>
          </address>
        </div>

      </div>
    </div>
  </div>

  <!-- Bottom legal bar -->
  <div class="footer__legal">
    <div class="container">
      <div class="footer__legal-inner">
        <p class="footer__copyright">
          &copy; ${CURRENT_YEAR} PHATRADE. All rights reserved.
        </p>
        <nav class="footer__legal-links" aria-label="Legal links">
          <a href="contact.html">Contact</a>
        </nav>
      </div>
    </div>
  </div>

</footer>
`.trim();

/* --------------------------------------------------------------------------
   Injection — runs on DOMContentLoaded
   -------------------------------------------------------------------------- */

function inject() {
  const navbarRoot = document.getElementById('navbar-root');
  if (navbarRoot) navbarRoot.innerHTML = NAVBAR_HTML;

  const footerRoot = document.getElementById('footer-root');
  if (footerRoot) footerRoot.innerHTML = FOOTER_HTML;

  // Inject back-to-top button
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.setAttribute('title', 'Back to top');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  // Show/hide on scroll
  function onScroll() {
    if (window.scrollY > 400) {
      btn.classList.add('back-to-top--visible');
    } else {
      btn.classList.remove('back-to-top--visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

}

// Run immediately if DOM is ready; otherwise wait for the event.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inject);
} else {
  inject();
}
