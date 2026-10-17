/**
 * product-detail.js — Renders a single product detail page
 * Reads ?id= from URL, finds the product, populates the page.
 */

function boot() {
  // Ensure page starts at top when navigating between products
  window.scrollTo(0, 0);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const allProducts = (typeof window !== 'undefined' && window.products) ? window.products : [];
  const product = allProducts.find(p => p.id === productId);

  if (!product) {
    document.getElementById('product-name-heading').textContent = 'Product Not Found';
    document.getElementById('product-description').textContent = 'This product could not be found. Please return to the products catalogue.';
    return;
  }

  // Apply any admin overrides from localStorage
  try {
    var prodOverrides = JSON.parse(localStorage.getItem('phatrade_prod_overrides') || '{}');
    var ov = prodOverrides[productId];
    if (ov) {
      if (ov.name)              product = Object.assign({}, product, { name: ov.name });
      if (ov.tagline)           product = Object.assign({}, product, { tagline: ov.tagline });
      if (ov.description)       product = Object.assign({}, product, { description: ov.description });
      if (ov.image)             product = Object.assign({}, product, { image: ov.image });
      if (ov.extractionMethod)  product = Object.assign({}, product, { extractionMethod: ov.extractionMethod });
      if (ov.color)             product = Object.assign({}, product, { color: ov.color });
      if (ov.aroma)             product = Object.assign({}, product, { aroma: ov.aroma });
      if (ov.applications)      product = Object.assign({}, product, { applications: ov.applications.split ? ov.applications.split(',').map(function(s){ return s.trim(); }) : ov.applications });
      // physical properties overrides
      var spKeys = {'sp-density':'density','sp-ri':'refractiveIndex','sp-rotation':'opticalRotation','sp-sg':'specificGravity','sp-solubility':'solubility','sp-acidno':'acidNo','sp-meltpt':'meltingPoint'};
      Object.keys(spKeys).forEach(function(k){ if(ov[k]){ var pp = Object.assign({}, product.physicalProperties||{}); pp[spKeys[k]] = ov[k]; product = Object.assign({}, product, {physicalProperties: pp}); } });
      // regulatory IDs overrides
      var rgKeys = {'rg-cas':'CAS','rg-fema':'FEMA','rg-fda':'FDA','rg-einecs':'EINECS','rg-coe':'CoE','rg-h':'H'};
      Object.keys(rgKeys).forEach(function(k){ if(ov[k]){ var rr = Object.assign({}, product.regulatoryIds||{}); rr[rgKeys[k]] = ov[k]; product = Object.assign({}, product, {regulatoryIds: rr}); } });
      if (ov.packSizes)  product = Object.assign({}, product, { packSizes: Array.isArray(ov.packSizes) ? ov.packSizes : ov.packSizes.split(',').map(function(s){ return s.trim(); }) });
      if (ov.shelfLife)  product = Object.assign({}, product, { shelfLife: ov.shelfLife });
      if (ov.storage)    product = Object.assign({}, product, { storage: ov.storage });
    }
  } catch(e) {}

  // Page title
  document.title = product.name + ' – PHATRADE | Phatrade Essential Oils';
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = product.name + ' – PHATRADE | Phatrade Essential Oils';

  // Breadcrumb
  const bc = document.getElementById('breadcrumb-product');
  if (bc) bc.textContent = product.name;

  // Image — set src and handle skeleton loader
  const img = document.getElementById('product-image');
  if (img) {
    img.alt = product.name + ' – PHATRADE';
    img.addEventListener('load', () => {
      img.classList.remove('pd-hero__image--loading');
      img.classList.add('pd-hero__image--loaded');
    }, { once: true });
    img.src = product.image || 'assets/images/products/essential-oils.svg';
  }

  // Category badge
  const catBadge = document.getElementById('product-category-badge');
  if (catBadge) {
    catBadge.textContent = product.category;
    catBadge.className = 'pd-category-badge';
  }

  // Name
  const nameEl = document.getElementById('product-name-heading');
  if (nameEl) nameEl.textContent = product.name;

  // Botanical name
  const botEl = document.getElementById('product-botanical');
  if (botEl && product.botanicalName) {
    botEl.innerHTML = '<em>' + product.botanicalName + '</em>';
  } else if (botEl) {
    botEl.style.display = 'none';
  }

  // Description
  const descEl = document.getElementById('product-description');
  if (descEl) descEl.textContent = product.description || '';

  // Specs
  const specsEl = document.getElementById('product-specs');
  if (specsEl) {
    const specs = [
      ['Origin', product.origin],
      ['Extraction Method', product.extractionMethod],
      ['Colour', product.color],
      ['Aroma Profile', product.aroma],
    ].filter(([, v]) => v);

    specsEl.innerHTML = specs.map(([label, value]) =>
      '<div class="pd-specs__row"><dt>' + label + '</dt><dd>' + value + '</dd></div>'
    ).join('');
  }

  // Actions
  const actionsEl = document.getElementById('product-actions');
  if (actionsEl && product.enquirable) {
    const name = encodeURIComponent(product.name);
    actionsEl.innerHTML = `
      <a href="contact.html?form=product&product=${name}" class="btn btn--primary btn--lg">Send Enquiry</a>
      <a href="contact.html?form=sample&product=${name}" class="btn btn--secondary btn--lg">Request Sample</a>
    `;
  }

  // Typical Composition
  const compTable = document.getElementById('composition-table');
  if (compTable && product.composition && product.composition.length) {
    compTable.innerHTML = product.composition.map(c => `
      <div class="pd-comp__row">
        <span class="pd-comp__compound">${c.compound}</span>
        <span class="pd-comp__bar-wrap" aria-hidden="true">
          <span class="pd-comp__bar" style="width:${parseInt(c.range)}%"></span>
        </span>
        <span class="pd-comp__range">${c.range}</span>
      </div>
    `).join('');
  } else if (compTable) {
    document.getElementById('product-composition').style.display = 'none';
  }

  // Storage & Shelf Life
  const storageGrid = document.getElementById('storage-grid');
  if (storageGrid && product.shelfLife) {
    storageGrid.innerHTML = `
      <div class="pd-storage__card">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div>
          <h3>Shelf Life</h3>
          <p>${product.shelfLife}</p>
        </div>
      </div>
      <div class="pd-storage__card">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <div>
          <h3>Storage Conditions</h3>
          <p>${product.storage}</p>
        </div>
      </div>
    `;
  } else if (storageGrid) {
    document.getElementById('product-storage').style.display = 'none';
  }

  // Pack Sizes
  const packList = document.getElementById('packsizes-list');
  if (packList && product.packSizes && product.packSizes.length) {
    packList.innerHTML = product.packSizes.map(size => `
      <div class="pd-packsize">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>${size}</span>
      </div>
    `).join('');
  } else if (packList) {
    document.getElementById('product-packsizes').style.display = 'none';
  }

  // Applications
  const appsGrid = document.getElementById('applications-grid');
  if (appsGrid && product.applications && product.applications.length) {
    const icons = {
      'Fine Fragrance': '<path d="M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z"/>',
      'Flavours & Food': '<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
      'Cosmetics & Skincare': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      'Aromatherapy': '<path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
      'Pharmaceuticals': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      'Personal Care': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
      'Luxury Cosmetics': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      'Luxury Perfumery': '<path d="M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z"/>',
    };
    appsGrid.innerHTML = product.applications.map(app => `
      <div class="pd-application-card">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[app] || '<circle cx="12" cy="12" r="10"/>'}</svg>
        <span>${app}</span>
      </div>
    `).join('');
  }

  // Related Products — same botanical family or same category
  const relatedSection = document.getElementById('product-related');
  const relatedGrid = document.getElementById('related-grid');
  if (relatedSection && relatedGrid) {
    // Match by botanicalName prefix (same genus) or same category, exclude self
    const baseName = product.botanicalName
      ? product.botanicalName.split(' ').slice(0, 2).join(' ').toLowerCase()
      : null;

    const related = allProducts.filter(p => {
      if (p.id === product.id) return false;
      if (p.note) return false;
      // Same genus (first two words of botanical name)
      if (baseName && p.botanicalName) {
        const pBase = p.botanicalName.split(' ').slice(0, 2).join(' ').toLowerCase();
        if (pBase === baseName) return true;
      }
      // Same category as fallback (limit to 3)
      return p.category === product.category;
    }).slice(0, 4);

    if (related.length > 0) {
      relatedGrid.innerHTML = related.map(p => `
        <a href="product-detail.html?id=${p.id}" class="pd-related-card">
          <div class="pd-related-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
              <path d="M12 2C12 2 5 10.4 5 14.5a7 7 0 0 0 14 0C19 10.4 12 2 12 2z"/>
            </svg>
          </div>
          <span class="pd-related-card__category">${p.category}</span>
          <h3 class="pd-related-card__name">${p.name}</h3>
          ${p.botanicalName ? `<p class="pd-related-card__botanical"><em>${p.botanicalName}</em></p>` : ''}
          ${p.tagline ? `<p class="pd-related-card__tagline">${p.tagline}</p>` : ''}
          <span class="pd-related-card__link">View Details →</span>
        </a>
      `).join('');
    } else {
      relatedSection.style.display = 'none';
    }
  }

  // CTA links
  const ctaEnquire = document.getElementById('cta-enquire');
  const ctaSample = document.getElementById('cta-sample');
  if (ctaEnquire && product.name) {
    ctaEnquire.href = 'contact.html?form=product&product=' + encodeURIComponent(product.name);
  }
  if (ctaSample && product.name) {
    ctaSample.href = 'contact.html?form=sample&product=' + encodeURIComponent(product.name);
  }

  // Sticky CTA bar
  const stickyBar = document.getElementById('pd-sticky-bar');
  const stickyName = document.getElementById('pd-sticky-name');
  const stickyEnquire = document.getElementById('pd-sticky-enquire');
  const stickySample = document.getElementById('pd-sticky-sample');
  const heroSection = document.getElementById('product-hero');

  if (stickyBar && heroSection) {
    if (stickyName) stickyName.textContent = product.name;
    if (stickyEnquire && product.name) {
      stickyEnquire.href = 'contact.html?form=product&product=' + encodeURIComponent(product.name);
    }
    if (stickySample && product.name) {
      stickySample.href = 'contact.html?form=sample&product=' + encodeURIComponent(product.name);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const heroBottom = heroSection.getBoundingClientRect().bottom;
          const show = heroBottom < 0;
          stickyBar.classList.toggle('pd-sticky-bar--visible', show);
          stickyBar.setAttribute('aria-hidden', String(!show));
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
