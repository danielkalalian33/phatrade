/**
 * site-content.js
 * Reads saved content from localStorage and applies it to all pages.
 */
(function() {
  var STORAGE_KEY = 'phatrade_cms';

  function getData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e) { return {}; }
  }

  function setText(selector, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setHtml(selector, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.innerHTML = value;
  }

  function setAttr(selector, attr, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  var path = location.pathname;
  var page = path.split('/').pop() || 'index.html';

  document.addEventListener('DOMContentLoaded', function() {
    var d = getData();

    // ── ALL PAGES: Footer social links via MutationObserver ──
    var footerRoot = document.getElementById('footer-root');
    if (footerRoot) {
      var obs = new MutationObserver(function() {
        if (d['contact-email']) {
          var el = document.querySelector('.footer__contact-row a[href^="mailto"]');
          if (el) { el.textContent = d['contact-email']; el.href = 'mailto:' + d['contact-email']; }
        }
        if (d['social-linkedin'] && d['social-linkedin'] !== '#') {
          var li = document.querySelector('.footer__social-link[aria-label*="LinkedIn"]');
          if (li) { li.href = d['social-linkedin']; li.target = '_blank'; }
        }
        if (d['social-facebook'] && d['social-facebook'] !== '#') {
          var fb = document.querySelector('.footer__social-link[aria-label*="Facebook"]');
          if (fb) { fb.href = d['social-facebook']; fb.target = '_blank'; }
        }
        // Reveal the social icon row only when at least one real URL is saved
        var hasRealSocial = (d['social-linkedin'] && d['social-linkedin'] !== '#') ||
                            (d['social-facebook'] && d['social-facebook'] !== '#');
        var socialDiv = document.querySelector('.footer__social');
        if (socialDiv && hasRealSocial) { socialDiv.removeAttribute('hidden'); }
      });
      obs.observe(footerRoot, { childList: true, subtree: true });
    }

    // ── INDEX / HOME ──
    if (page === 'index.html' || page === '' || path === '/') {
      setText('.hero__eyebrow', d['hero-eyebrow']);
      var titleEl = document.querySelector('.hero__title');
      if (titleEl && (d['hero-title-line1'] || d['hero-title-line2'])) {
        titleEl.innerHTML = (d['hero-title-line1'] || "Egypt's Finest") + '<br><em class="hero__title-accent">' + (d['hero-title-line2'] || 'Aromatic Ingredients') + '</em>';
      }
      setText('.hero__tagline', d['hero-tagline']);
      setText('.hero__slogan-line1', d['hero-slogan-line1']);
      setText('.hero__slogan-line2', d['hero-slogan-line2']);

      var ctas = document.querySelectorAll('.hero__ctas a');
      if (ctas[0] && d['hero-cta1']) ctas[0].textContent = d['hero-cta1'];
      if (ctas[1] && d['hero-cta2']) ctas[1].textContent = d['hero-cta2'];

      var badgeNums   = document.querySelectorAll('.hero__badge-num');
      var badgeLabels = document.querySelectorAll('.hero__badge-label');
      if (badgeNums[0]   && d['badge1-num'])   badgeNums[0].textContent   = d['badge1-num'];
      if (badgeLabels[0] && d['badge1-label']) badgeLabels[0].textContent = d['badge1-label'];
      if (badgeNums[1]   && d['badge2-num'])   badgeNums[1].textContent   = d['badge2-num'];
      if (badgeLabels[1] && d['badge2-label']) badgeLabels[1].textContent = d['badge2-label'];

      // About intro
      setText('#about-intro h2', d['about-heading']);
      setText('#about-intro .about-intro__text > p', d['about-body']);
      setText('.about-intro__slogan', d['company-slogan']);

      // Stat counters
      var stats = document.querySelectorAll('.stat-counter[data-target]');
      var statKeys = ['stat1', 'stat2', 'stat3'];
      for (var i = 0; i < statKeys.length; i++) {
        var k = statKeys[i];
        if (stats[i]) {
          if (d[k + '-num']) stats[i].setAttribute('data-target', d[k + '-num']);
          var suf = stats[i].querySelector('.stat-counter__suffix');
          var lbl = stats[i].querySelector('.stat-counter__label');
          if (suf && d[k + '-suffix'] !== undefined) suf.textContent = d[k + '-suffix'];
          if (lbl && d[k + '-label'])  lbl.textContent = d[k + '-label'];
        }
      }

      // Product showcase
      setText('#product-showcase-heading', d['showcase-heading']);
      setText('.product-showcase .section-heading__subtitle', d['showcase-subtitle']);

      // CTA banner
      setText('.cta-banner__text h2', d['cta-heading-text']);
      setText('.cta-banner__text p', d['cta-subtext']);
      var ctaBtns = document.querySelectorAll('.cta-banner__actions a');
      if (ctaBtns[0] && d['cta-btn1']) ctaBtns[0].textContent = d['cta-btn1'];
      if (ctaBtns[1] && d['cta-btn2']) ctaBtns[1].textContent = d['cta-btn2'];

      // Global reach
      setText('#location-reach-heading', d['reach-heading']);
      setText('.location-reach__description', d['reach-description']);

      // Hero background image
      if (d['hero-bg-image']) {
        var hero = document.querySelector('.hero');
        if (hero) {
          hero.style.backgroundImage = 'linear-gradient(105deg, rgba(30,51,38,0.92) 0%, rgba(30,51,38,0.75) 55%, rgba(45,74,53,0.55) 100%), url("' + d['hero-bg-image'] + '")';
          hero.style.backgroundSize = 'cover';
          hero.style.backgroundPosition = 'center';
        }
      }
    }

    // ── ABOUT PAGE ──
    if (page === 'about.html') {
      setText('#company-story-heading', d['about-heading'] ? 'About PHATRADE' : null);
      setText('.story-banner__subtitle', d['about-body']);
      setText('.story-banner__slogan-main', d['company-slogan']);
    }

    // ── PRODUCTS PAGE ──
    if (page === 'products.html') {
      setText('#products-heading', d['products-heading']);
      setText('.products-header .section-heading__subtitle', d['products-subtitle']);
    }

    // ── QUALITY PAGE ──
    if (page === 'quality.html') {
      setText('#quality-page-heading', d['quality-heading']);
      setText('.page-header .section-heading__subtitle', d['quality-subtitle']);
      setText('#gc-lab-heading', d['gclab-heading']);
      setText('.gc-lab__intro', d['gclab-intro']);
      setText('#traceability .section-heading__subtitle', d['traceability-subtitle']);
    }

    // ── SUSTAINABILITY PAGE ──
    if (page === 'sustainability.html') {
      setText('#sus-hero-heading', d['sus-heading']);
      setText('.sus-hero__subtitle', d['sus-subtitle']);
      setText('.sus-sourcing__lead', d['sus-sourcing-lead']);
      setText('.sus-process__subtitle', d['sus-process-subtitle']);
    }

    // ── FACILITIES PAGE ──
    if (page === 'facilities.html') {
      setText('#facilities-page-heading', d['facilities-heading']);
      setText('.page-header .section-heading__subtitle', d['facilities-subtitle']);
      setText('#obour-city .facility-section__intro', d['obour-intro']);
      setText('#sadat-city .facility-section__intro', d['sadat-intro']);
    }

    // ── APPLICATIONS PAGE ──
    if (page === 'applications.html') {
      setText('#applications-heading', d['applications-heading']);
      setText('.applications-header__intro', d['applications-intro']);
      setText('#sector-cards-heading', d['sectors-heading']);
      setText('#sector-cards .section-heading__subtitle', d['sectors-subtitle']);
    }

    // ── CONTACT PAGE ──
    if (page === 'contact.html') {
      var phones = document.querySelectorAll('.contact-phones a[href^="tel"]');
      if (phones[0] && d['contact-phone1']) { phones[0].textContent = d['contact-phone1']; phones[0].href = 'tel:' + d['contact-phone1'].replace(/\s/g,''); }
      if (phones[1] && d['contact-phone2']) { phones[1].textContent = d['contact-phone2']; phones[1].href = 'tel:' + d['contact-phone2'].replace(/\s/g,''); }
      var emailLink = document.querySelector('.contact-email a');
      if (emailLink && d['contact-email']) { emailLink.textContent = d['contact-email']; emailLink.href = 'mailto:' + d['contact-email']; }
      var wa = document.querySelector('.contact-whatsapp');
      if (wa && d['contact-whatsapp']) wa.href = 'https://wa.me/' + d['contact-whatsapp'];
    }

  });
})();
