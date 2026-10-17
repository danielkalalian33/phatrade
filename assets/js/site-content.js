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

      // Home features grid
      var feats = document.querySelectorAll('.feature-item');
      var featData = [
        { t: d['feat1-title'], tx: d['feat1-text'] },
        { t: d['feat2-title'], tx: d['feat2-text'] },
        { t: d['feat3-title'], tx: d['feat3-text'] },
        { t: d['feat4-title'], tx: d['feat4-text'] },
        { t: d['feat5-title'], tx: d['feat5-text'] },
        { t: d['feat6-title'], tx: d['feat6-text'] }
      ];
      for (var fi = 0; fi < feats.length && fi < 6; fi++) {
        var fe = feats[fi]; var fd = featData[fi];
        if (fd.t)  { var fh = fe.querySelector('.feature-item__title, h3'); if (fh) fh.textContent = fd.t; }
        if (fd.tx) { var fp = fe.querySelector('.feature-item__text, p');   if (fp) fp.textContent = fd.tx; }
      }

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

      // Story chapters
      var chapters = document.querySelectorAll('.story-chapter');
      var chData = [
        { year: d['story1-year'], h: d['story1-heading'], t: d['story1-text'] },
        { year: d['story2-year'], h: d['story2-heading'], t: d['story2-text'] },
        { year: d['story3-year'], h: d['story3-heading'], t: d['story3-text'] }
      ];
      for (var ci = 0; ci < chapters.length && ci < 3; ci++) {
        var ch = chapters[ci];
        var cd = chData[ci];
        if (cd.year) { var yl = ch.querySelector('.story-chapter__year'); if (yl) yl.textContent = cd.year; }
        if (cd.h)    { var hl = ch.querySelector('h3, h2'); if (hl) hl.textContent = cd.h; }
        if (cd.t)    { var tl = ch.querySelector('p');   if (tl) tl.textContent = cd.t; }
      }

      // Values
      var values = document.querySelectorAll('.value-item, .about-value');
      var vData = [
        { t: d['val1-title'], d: d['val1-text'] },
        { t: d['val2-title'], d: d['val2-text'] },
        { t: d['val3-title'], d: d['val3-text'] },
        { t: d['val4-title'], d: d['val4-text'] }
      ];
      for (var vi = 0; vi < values.length && vi < 4; vi++) {
        var vEl = values[vi]; var vd = vData[vi];
        if (vd.t) { var vh = vEl.querySelector('h3, h4, strong'); if (vh) vh.textContent = vd.t; }
        if (vd.d) { var vp = vEl.querySelector('p'); if (vp) vp.textContent = vd.d; }
      }

      // About page images
      if (d['img-about1'] || d['img-about2'] || d['img-about3'] || d['img-about4']) {
        var imgs = document.querySelectorAll('.about-photos img, .story-photos img, .about-mosaic img');
        var imgUrls = [d['img-about1'], d['img-about2'], d['img-about3'], d['img-about4']];
        for (var ai = 0; ai < imgs.length && ai < 4; ai++) { if (imgUrls[ai]) imgs[ai].src = imgUrls[ai]; }
      }
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

      // Cert cards
      var certCards = document.querySelectorAll('.cert-card');
      var certKeys = [
        { h: 'cert-fssc-heading', b: 'cert-fssc-body' },
        { h: 'cert-iso22-heading', b: 'cert-iso22-body' },
        { h: 'cert-iso14-heading', b: 'cert-iso14-body' },
        { h: 'cert-iso45-heading', b: 'cert-iso45-body' },
        { h: 'cert-halal-heading', b: 'cert-halal-body' },
        { h: 'cert-fda-heading',   b: 'cert-fda-body'   },
        { h: 'cert-kosher-heading',b: 'cert-kosher-body' },
        { h: 'cert-sedex-heading', b: 'cert-sedex-body'  }
      ];
      for (var qi = 0; qi < certCards.length && qi < certKeys.length; qi++) {
        var cc = certCards[qi];
        var ck = certKeys[qi];
        if (d[ck.h]) { var ch2 = cc.querySelector('h3'); if (ch2) ch2.textContent = d[ck.h]; }
        if (d[ck.b]) { var cb2 = cc.querySelector('.cert-card__body'); if (cb2) cb2.textContent = d[ck.b]; }
      }

      // GC Lab Stats
      var gcStats = document.querySelectorAll('.gc-lab__stat');
      for (var gsi = 0; gsi < gcStats.length && gsi < 3; gsi++) {
        var gsn = gsi+1;
        var gsv = gcStats[gsi].querySelector('.gc-lab__stat-value'); if(gsv && d['gcstat'+gsn+'-val']) gsv.textContent = d['gcstat'+gsn+'-val'];
        var gsl = gcStats[gsi].querySelector('.gc-lab__stat-label'); if(gsl && d['gcstat'+gsn+'-lbl']) gsl.textContent = d['gcstat'+gsn+'-lbl'];
      }
      // GC Lab Capabilities
      var gcCaps = document.querySelectorAll('.gc-capability');
      for (var gci = 0; gci < gcCaps.length && gci < 4; gci++) {
        var gcn = gci+1;
        var gct = gcCaps[gci].querySelector('.gc-capability__title, h3'); if(gct && d['gccap'+gcn+'-title']) gct.textContent = d['gccap'+gcn+'-title'];
        var gcp = gcCaps[gci].querySelector('.gc-capability__desc, p');   if(gcp && d['gccap'+gcn+'-desc'])  gcp.textContent  = d['gccap'+gcn+'-desc'];
      }

      // Traceability pipeline
      var stages = document.querySelectorAll('.trace-stage, .pipeline-stage, .traceability-step');
      for (var ti = 0; ti < stages.length && ti < 4; ti++) {
        var tn = ti + 1;
        var tt = d['trace'+tn+'-title']; var td = d['trace'+tn+'-desc'];
        if (tt) { var th = stages[ti].querySelector('h3, h4, strong'); if (th) th.textContent = tt; }
        if (td) { var tp = stages[ti].querySelector('p'); if (tp) tp.textContent = td; }
      }
    }

    // ── SUSTAINABILITY PAGE ──
    if (page === 'sustainability.html') {
      setText('#sus-hero-heading', d['sus-heading']);
      setText('.sus-hero__subtitle', d['sus-subtitle']);
      setText('.sus-sourcing__lead', d['sus-sourcing-lead']);
      setText('.sus-process__subtitle', d['sus-process-subtitle']);
      // Our Farm section
      setText('#farm-heading', d['farm-heading']);
      setText('#farm .section-heading__subtitle', d['farm-subtitle']);

      // Pillars
      var pillars = document.querySelectorAll('.sus-pillar, .pillar-item, .sus-hero__pillars li, .sus-pillars .pillar');
      for (var pi = 0; pi < pillars.length && pi < 4; pi++) {
        var pn = pi + 1;
        var pt = d['sus-p'+pn+'-title']; var ptx = d['sus-p'+pn+'-text'];
        if (pt)  { var ph = pillars[pi].querySelector('h3, h4, strong'); if (ph) ph.textContent = pt; }
        if (ptx) { var pp = pillars[pi].querySelector('p'); if (pp) pp.textContent = ptx; }
      }
    }

    // ── FACILITIES PAGE ──
    if (page === 'facilities.html') {
      setText('#facilities-page-heading', d['facilities-heading']);
      setText('.page-header .section-heading__subtitle', d['facilities-subtitle']);
      setText('#obour-city .facility-section__intro', d['obour-intro']);
      setText('#sadat-city .facility-section__intro', d['sadat-intro']);

      // Stats strip
      var statsItems = document.querySelectorAll('.stat-item');
      var statMap = ['fac-stat-extraction-lines','fac-stat-distillers','fac-stat-extractors','fac-stat-dist-units','fac-stat-airport'];
      statsItems.forEach(function(si, idx){ if(statMap[idx] && d[statMap[idx]]){ var sv = si.querySelector('.stat-item__value'); if(sv) sv.textContent = d[statMap[idx]]; } });

      // Obour capabilities
      var caps = document.querySelectorAll('.facility-capabilities__item');
      for (var ci = 0; ci < caps.length && ci < 5; ci++) {
        var n = ci + 1;
        var ct = d['obour-cap'+n+'-title']; var cd = d['obour-cap'+n+'-desc'];
        if (ct) { var ch = caps[ci].querySelector('.facility-capabilities__label, strong'); if (ch) ch.textContent = ct; }
        if (cd) { var cp = caps[ci].querySelector('.facility-capabilities__desc, p'); if (cp) cp.textContent = cd; }
      }

      // Farm crops
      var crops = document.querySelectorAll('.farm-crop');
      for (var ki = 0; ki < crops.length && ki < 4; ki++) {
        var m = ki + 1;
        var cn = d['crop'+m+'-name']; var cb = d['crop'+m+'-botanical']; var cdesc = d['crop'+m+'-desc'];
        if (cn) { var cnh = crops[ki].querySelector('.farm-crop__name, h3'); if (cnh) cnh.textContent = cn; }
        if (cb) { var cbe = crops[ki].querySelector('.farm-crop__botanical em, em'); if (cbe) cbe.textContent = cb; }
        if (cdesc) { var cdp = crops[ki].querySelector('.farm-crop__desc, p'); if (cdp) cdp.textContent = cdesc; }
      }

      // Obour Key Facts aside
      var kfRows = document.querySelectorAll('#obour-city .facility-highlight__row');
      var kfData = [
        { l: 'obour-kf1-label', v: 'obour-kf1-value' },
        { l: 'obour-kf2-label', v: 'obour-kf2-value' },
        { l: 'obour-kf3-label', v: 'obour-kf3-value' }
      ];
      kfRows.forEach(function(row, idx) {
        if (idx >= kfData.length) return;
        var dt = row.querySelector('dt'); if (dt && d[kfData[idx].l]) dt.textContent = d[kfData[idx].l];
        var dd = row.querySelector('dd'); if (dd && d[kfData[idx].v]) dd.textContent = d[kfData[idx].v];
      });
    }

    // ── APPLICATIONS PAGE ──
    if (page === 'applications.html') {
      setText('#applications-heading', d['applications-heading']);
      setText('.applications-header__intro', d['applications-intro']);
      setText('#sector-cards-heading', d['sectors-heading']);
      setText('#sector-cards .section-heading__subtitle', d['sectors-subtitle']);

      // Sector cards
      var sectors = document.querySelectorAll('.sector-card, .application-card');
      var secData = [
        { t: d['sec1-title'], d: d['sec1-desc'] },
        { t: d['sec2-title'], d: d['sec2-desc'] },
        { t: d['sec3-title'], d: d['sec3-desc'] },
        { t: d['sec4-title'], d: d['sec4-desc'] },
        { t: d['sec5-title'], d: d['sec5-desc'] },
        { t: d['sec6-title'], d: d['sec6-desc'] }
      ];
      for (var si = 0; si < sectors.length && si < 6; si++) {
        var sc = sectors[si]; var sd = secData[si];
        if (sd.t) { var sh = sc.querySelector('h3, h2'); if (sh) sh.textContent = sd.t; }
        if (sd.d) { var sp = sc.querySelector('p:not(.sector-card__featured)'); if (sp) sp.textContent = sd.d; }
      }
    }

    // ── CONTACT PAGE ──
    if (page === 'contact.html') {
      setText('.page-header h1', d['contact-page-heading']);
      setText('.page-header .section-heading__subtitle', d['contact-page-subtitle']);
      var phones = document.querySelectorAll('.contact-phones a[href^="tel"]');
      if (phones[0] && d['contact-phone1']) { phones[0].textContent = d['contact-phone1']; phones[0].href = 'tel:' + d['contact-phone1'].replace(/\s/g,''); }
      if (phones[1] && d['contact-phone2']) { phones[1].textContent = d['contact-phone2']; phones[1].href = 'tel:' + d['contact-phone2'].replace(/\s/g,''); }
      var emailLink = document.querySelector('.contact-email a');
      if (emailLink && d['contact-email']) { emailLink.textContent = d['contact-email']; emailLink.href = 'mailto:' + d['contact-email']; }
      var wa = document.querySelector('.contact-whatsapp');
      if (wa && d['contact-whatsapp']) wa.href = 'https://wa.me/' + d['contact-whatsapp'];

      // FAQ — all 7
      if (d['faq-heading']) setText('#faq-heading', d['faq-heading']);
      var faqItems = document.querySelectorAll('.faq-item');
      var faqData = [
        { q: 'faq1q', a: 'faq1a' }, { q: 'faq2q', a: 'faq2a' }, { q: 'faq3q', a: 'faq3a' },
        { q: 'faq4q', a: 'faq4a' }, { q: 'faq5q', a: 'faq5a' }, { q: 'faq6q', a: 'faq6a' },
        { q: 'faq7q', a: 'faq7a' }
      ];
      faqItems.forEach(function(fi, idx) {
        if (idx >= faqData.length) return;
        var fq = fi.querySelector('.faq-question'); if (fq && d[faqData[idx].q]) fq.childNodes[0].textContent = d[faqData[idx].q];
        var fa = fi.querySelector('.faq-answer p'); if (fa && d[faqData[idx].a]) fa.textContent = d[faqData[idx].a];
      });

      // Form section headings (4 forms)
      var formSections = document.querySelectorAll('.contact-form-section');
      var formData = [
        { h: 'form1-heading', s: 'form1-subtitle' },
        { h: 'form2-heading', s: 'form2-subtitle' },
        { h: 'form3-heading', s: 'form3-subtitle' },
        { h: 'form4-heading', s: 'form4-subtitle' }
      ];
      formSections.forEach(function(fs, idx) {
        if (idx >= formData.length) return;
        var fh = fs.querySelector('h2, h3'); if (fh && d[formData[idx].h]) fh.textContent = d[formData[idx].h];
        var fp = fs.querySelector('.section-heading__subtitle, p.form-subtitle'); if (fp && d[formData[idx].s]) fp.textContent = d[formData[idx].s];
      });

      // Obour Key Facts
      var kfRows = document.querySelectorAll('.facility-highlight__row');
      var kfData = [
        { l: 'obour-kf1-label', v: 'obour-kf1-value' },
        { l: 'obour-kf2-label', v: 'obour-kf2-value' },
        { l: 'obour-kf3-label', v: 'obour-kf3-value' }
      ];
      kfRows.forEach(function(row, idx) {
        if (idx >= kfData.length) return;
        var dt = row.querySelector('dt'); if (dt && d[kfData[idx].l]) dt.textContent = d[kfData[idx].l];
        var dd = row.querySelector('dd'); if (dd && d[kfData[idx].v]) dd.textContent = d[kfData[idx].v];
      });
    }

    // ── ALL PAGES: SEO ──
    if (d['seo-'+page.replace('.html','')+'-title'])
      document.title = d['seo-'+page.replace('.html','')+'-title'];
    var metaDesc = document.querySelector('meta[name="description"]');
    var seoDescKey = 'seo-' + page.replace('.html','') + '-desc';
    if (metaDesc && d[seoDescKey]) metaDesc.setAttribute('content', d[seoDescKey]);

    // ── 404 PAGE ──
    if (page === '404.html') {
      setText('h1', d['p404-heading']);
      var p404p = document.querySelector('.not-found__body, main p');
      if (p404p && d['p404-body']) p404p.textContent = d['p404-body'];
      var p404btns = document.querySelectorAll('main a.btn, .not-found a');
      if (p404btns[0] && d['p404-btn1']) p404btns[0].textContent = d['p404-btn1'];
      if (p404btns[1] && d['p404-btn2']) p404btns[1].textContent = d['p404-btn2'];
    }

    // ── INDEX / HOME — marquee ──
    if (page === 'index.html' || page === '' || path === '/') {
      var mqEls = document.querySelectorAll('.marquee-item');
      var mqKeys = ['mq1','mq2','mq3','mq4','mq5','mq6','mq7','mq8','mq9','mq10','mq11'];
      var seen = {};
      var mqIdx = 0;
      mqEls.forEach(function(mEl) {
        var txt = mEl.childNodes[mEl.childNodes.length-1];
        if (txt && txt.nodeType === 3 && mqIdx < mqKeys.length) {
          var k = mqKeys[mqIdx % 11];
          if (d[k] && !seen[k]) { seen[k] = true; txt.textContent = '\n            ' + d[k] + '\n          '; }
          mqIdx++;
        }
      });
    }
    // Additional footer fields
    var footerObs = new MutationObserver(function() {
      if (d['footer-tagline']) setText('.footer__tagline', d['footer-tagline']);
      if (d['footer-slogan'])  setText('.footer__slogan', d['footer-slogan']);
      if (d['footer-copyright']) setText('.footer__copyright, .footer__bottom p', d['footer-copyright']);
      var certBadges = document.querySelectorAll('.footer__cert-badge');
      var certBadgeKeys = ['footer-cert1','footer-cert2','footer-cert3','footer-cert4'];
      certBadges.forEach(function(b, i){ if(d[certBadgeKeys[i]]) b.textContent = d[certBadgeKeys[i]]; });
      // Nav labels
      var navLinks = document.querySelectorAll('.navbar__links a, .navbar__mobile-menu__links a');
      var navKeys = ['nav-home','nav-about','nav-products','nav-applications','nav-facilities','nav-quality','nav-sustainability','nav-contact'];
      navLinks.forEach(function(a, i){ if(navKeys[i] && d[navKeys[i]]) a.textContent = d[navKeys[i]]; });
    });
    if (document.getElementById('footer-root')) {
      footerObs.observe(document.getElementById('footer-root'), { childList: true, subtree: true });
    }

    // ── ABOUT TIMELINE ──
    if (page === 'about.html') {
      var tlItems = document.querySelectorAll('.timeline-item, .timeline__item, .milestone');
      for (var tli = 0; tli < tlItems.length && tli < 6; tli++) {
        var tln = tli + 1;
        var tly = d['tl'+tln+'-year']; var tll = d['tl'+tln+'-label']; var tld = d['tl'+tln+'-desc'];
        if (tly) { var tlyEl = tlItems[tli].querySelector('.timeline-year, .year, time'); if (tlyEl) tlyEl.textContent = tly; }
        if (tll) { var tllEl = tlItems[tli].querySelector('h3, h4, .label, strong'); if (tllEl) tllEl.textContent = tll; }
        if (tld) { var tldEl = tlItems[tli].querySelector('p'); if (tldEl) tldEl.textContent = tld; }
      }
    }
    // Apply any image URL overrides stored in the CMS
    (function applyImages() {
      // Cert logos (quality page)
      if (page === 'quality.html') {
        var certLogoMap = [
          ['img-cert-fssc','img-cert-iso22','img-cert-iso14','img-cert-iso45',
           'img-cert-halal','img-cert-fda','img-cert-kosher','img-cert-sedex','img-cert-ecovadis']
        ][0];
        var certImgs = document.querySelectorAll('.cert-card img');
        certLogoMap.forEach(function(k, idx) { if (d[k] && certImgs[idx]) certImgs[idx].src = d[k]; });
      }

      // "Why PHATRADE" block (product detail page)
      if (page === 'product-detail.html') {
        var whyH = document.querySelector('#why-heading');
        if (whyH && d['why-heading']) whyH.textContent = d['why-heading'];
        var whyItems = document.querySelectorAll('.pd-why__item');
        var whyData = [
          { t:'why1-title', tx:'why1-text' },{ t:'why2-title', tx:'why2-text' },
          { t:'why3-title', tx:'why3-text' },{ t:'why4-title', tx:'why4-text' }
        ];
        whyItems.forEach(function(wi,idx) {
          if (idx>=4) return;
          var wh=wi.querySelector('h3'); if(wh&&d[whyData[idx].t]) wh.textContent=d[whyData[idx].t];
          var wp=wi.querySelector('p');  if(wp&&d[whyData[idx].tx]) wp.textContent=d[whyData[idx].tx];
        });
        // Product detail button labels
        var pBtns = document.querySelectorAll('.pd-hero__actions a.btn, .pd-hero__actions button.btn');
        if(pBtns[0] && d['btn-send-enquiry'])  pBtns[0].textContent = d['btn-send-enquiry'];
        if(pBtns[1] && d['btn-request-sample']) pBtns[1].textContent = d['btn-request-sample'];
      }

      // Cert download button labels
      if (page === 'quality.html' && d['btn-download-cert']) {
        document.querySelectorAll('.cert-card__download').forEach(function(btn) {
          var t=btn.childNodes[btn.childNodes.length-1]; if(t&&t.nodeType===3) t.textContent='\n              '+d['btn-download-cert'];
        });
      }

      // Contact form submit buttons
      if (page === 'contact.html' && d['btn-form-submit']) {
        document.querySelectorAll('button[type="submit"].btn').forEach(function(btn){
          if (!btn.classList.contains('cert-card__download')) btn.textContent = d['btn-form-submit'];
        });
      }
      var imgMap = [
        // selector → cms key
        ['header .navbar__logo img, .footer__logo-link img',   'img-logo'],
        // About page photos
        ['.about-mosaic__item:nth-child(1) img, .about-photos img:nth-child(1)', 'img-about1'],
        ['.about-mosaic__item:nth-child(2) img, .about-photos img:nth-child(2)', 'img-about2'],
        ['.about-mosaic__item:nth-child(3) img, .about-photos img:nth-child(3)', 'img-about3'],
        ['.about-mosaic__item:nth-child(4) img, .about-photos img:nth-child(4)', 'img-about4'],
        // Facilities gallery
        ['.facility-gallery__item--featured img', 'img-fac-gallery1'],
        ['.facility-gallery__item:nth-child(2) img', 'img-fac-gallery2'],
        ['.facility-gallery__item:nth-child(3) img', 'img-fac-gallery3'],
        // Obour photos
        ['.facility-photos[aria-label*="Obour"] .facility-photos__item:nth-child(1) img', 'img-obour-lab'],
        ['.facility-photos[aria-label*="Obour"] .facility-photos__item:nth-child(2) img', 'img-obour-proc'],
        ['.facility-photos[aria-label*="Obour"] .facility-photos__item:nth-child(3) img', 'img-obour-dist'],
        // Sadat photos
        ['.facility-photos[aria-label*="Sadat"] .facility-photos__item:nth-child(1) img', 'img-sadat1'],
        ['.facility-photos[aria-label*="Sadat"] .facility-photos__item:nth-child(2) img', 'img-sadat2'],
        ['.facility-photos[aria-label*="Sadat"] .facility-photos__item:nth-child(3) img', 'img-sadat3']
      ];
      for (var ii = 0; ii < imgMap.length; ii++) {
        var imgUrl = d[imgMap[ii][1]];
        if (!imgUrl) continue;
        var imgEls = document.querySelectorAll(imgMap[ii][0]);
        for (var ij = 0; ij < imgEls.length; ij++) { imgEls[ij].src = imgUrl; }
      }
      // Logo via MutationObserver for navbar/footer (injected after DOMContentLoaded)
      if (d['img-logo']) {
        var obs2 = new MutationObserver(function() {
          document.querySelectorAll('.navbar__logo img, .footer__logo-link img').forEach(function(el) {
            el.src = d['img-logo'];
          });
        });
        obs2.observe(document.body, { childList: true, subtree: true });
      }
    })();

  });
})();
