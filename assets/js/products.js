/**
 * assets/js/products.js
 *
 * Products page module: category filter, card rendering, and keyboard navigation.
 *
 * Exports:
 *   filterProducts(products, category)  —  pure filter helper (also tested in tests/)
 *   CATEGORIES, products                —  re-exported from the data module
 *
 * DOM responsibilities (when running in a page context):
 *   - Renders product cards into #product-grid
 *   - Wires category tab clicks with aria-selected updates
 *   - Implements ARIA APG arrow-key navigation on the tablist
 *   - Reads ?category URL param on load and pre-applies filter
 *   - Navigates to contact.html with product pre-population on Enquire/Request Sample
 *
 * Requirements: 5.1 — 5.8, 12.8
 */

/* --------------------------------------------------------------------------
   Pure filter function (Requirements 5.6)
   -------------------------------------------------------------------------- */

/**
 * Filter a products array by category.
 *
 * @param {import('../data/products.js').Product[]} productList
 * @param {string} category - one of CATEGORIES values, or `'all'` to return everything
 * @returns {import('../data/products.js').Product[]}
 */
function filterProducts(productList, category) {
  if (category === 'all') {
    return productList;
  }
  return productList.filter(p => p.category === category);
}

/* Apply any admin product overrides saved in localStorage */
function applyProductOverrides(productList) {
  try {
    const overrides = JSON.parse(localStorage.getItem('phatrade_prod_overrides') || '{}');
    if (!Object.keys(overrides).length) return productList;
    return productList.map(p => {
      const ov = overrides[p.id];
      if (!ov) return p;
      const updated = Object.assign({}, p);
      if (ov.name)             updated.name             = ov.name;
      if (ov.tagline)          updated.tagline          = ov.tagline;
      if (ov.image)            updated.image            = ov.image;
      if (ov.extractionMethod) updated.extractionMethod = ov.extractionMethod;
      if (ov.color)            updated.color            = ov.color;
      if (ov.aroma)            updated.aroma            = ov.aroma;
      if (ov.description)      updated.description      = ov.description;
      if (ov.packSizes)        updated.packSizes        = ov.packSizes;
      if (ov.shelfLife)        updated.shelfLife        = ov.shelfLife;
      if (ov.storage)          updated.storage          = ov.storage;
      if (ov.applications)     updated.applications     = ov.applications.split ? ov.applications.split(',').map(s => s.trim()) : ov.applications;
      // physical properties overrides
      var spKeys = {'sp-density':'density','sp-ri':'refractiveIndex','sp-rotation':'opticalRotation','sp-sg':'specificGravity','sp-solubility':'solubility','sp-acidno':'acidNo','sp-meltpt':'meltingPoint'};
      Object.keys(spKeys).forEach(function(k){ if(ov[k]){ updated.physicalProperties = Object.assign({}, updated.physicalProperties||{}); updated.physicalProperties[spKeys[k]] = ov[k]; } });
      // regulatory IDs overrides
      var rgKeys = {'rg-cas':'CAS','rg-fema':'FEMA','rg-fda':'FDA','rg-einecs':'EINECS','rg-coe':'CoE','rg-h':'H'};
      Object.keys(rgKeys).forEach(function(k){ if(ov[k]){ updated.regulatoryIds = Object.assign({}, updated.regulatoryIds||{}); updated.regulatoryIds[rgKeys[k]] = ov[k]; } });
      return updated;
    });
  } catch(e) { return productList; }
}

/* --------------------------------------------------------------------------
   Product card rendering (Requirements 5.1 — 5.5, 5.7)
   -------------------------------------------------------------------------- */

/**
 * Render HTML for a single product card.
 *
 * @param {import('../data/products.js').Product} product
 * @returns {string}
 */
function renderProductCard(product) {
  if (product.note) {
    return `
      <article class="product-card product-card--note" data-product-id="${escapeAttr(product.id)}">
        <div class="product-card__body">
          <span class="product-card__category">${escapeHtml(product.category)}</span>
          <h3 class="product-card__name">${escapeHtml(product.name)}</h3>
          ${product.description ? `<p class="product-card__desc">${escapeHtml(product.description)}</p>` : ''}
          <a href="contact.html#form-general" class="btn btn--secondary btn--sm" style="margin-top:auto">Contact Us</a>
        </div>
      </article>`.trim();
  }

  const imageSrc = product.image || 'assets/images/products/essential-oils.svg';
  const shortDesc = product.tagline
    ? escapeHtml(product.tagline)
    : product.description
      ? escapeHtml(product.description.split('. ')[0] + '.')
      : '';
  const botanical = product.botanicalName
    ? `<p class="product-card__botanical"><em>${escapeHtml(product.botanicalName)}</em></p>`
    : '';

  return `
    <article class="product-card" data-product-id="${escapeAttr(product.id)}">
      <a href="product-detail.html?id=${escapeAttr(product.id)}" class="product-card__image-link" tabindex="-1" aria-hidden="true">
        <img src="${escapeAttr(imageSrc)}" alt="${escapeAttr(product.name)} botanical illustration" class="product-card__image" width="400" height="220" loading="lazy"/>
      </a>
      <div class="product-card__body">
        <div class="product-card__meta">
          <span class="product-card__category">${escapeHtml(product.category)}</span>
          ${product.extractionMethod ? `<span class="product-card__method">${escapeHtml(product.extractionMethod)}</span>` : ''}
        </div>
        <h3 class="product-card__name">
          <a href="product-detail.html?id=${escapeAttr(product.id)}">${escapeHtml(product.name)}</a>
        </h3>
        ${botanical}
        ${shortDesc ? `<p class="product-card__desc">${shortDesc}</p>` : ''}
        <div class="product-card__actions">
          <a href="product-detail.html?id=${escapeAttr(product.id)}" class="btn btn--primary btn--sm">View Details</a>
          <button class="btn btn--secondary btn--sm product-card__enquire" data-product="${escapeAttr(product.name)}" data-action="enquire" aria-label="Enquire about ${escapeAttr(product.name)}">Enquire</button>
        </div>
      </div>
    </article>`.trim();
}

/**
 * Render the full product grid for the given list.
 *
 * @param {import('../data/products.js').Product[]} productList
 * @param {HTMLElement} gridEl
 */
function renderGrid(productList, gridEl) {
  if (!gridEl) return;
  gridEl.innerHTML = productList.map(renderProductCard).join('\n');
}

/* --------------------------------------------------------------------------
   Tab management helpers (Requirements 5.6, 12.8)
   -------------------------------------------------------------------------- */

/**
 * Map tab button id -> category value (or 'all').
 * Mirrors the tab ids in products.html.
 * Built lazily using window.CATEGORIES (set by data/products.js script tag).
 */
function getTabIdToCategory() {
  const C = (typeof window !== 'undefined' && window.CATEGORIES) ? window.CATEGORIES : {
    ESSENTIAL_OILS: 'Essential Oils',
    CONCRETES: 'Concretes',
    ABSOLUTES: 'Absolutes',
    AROMA_CHEMICALS: 'Aroma Chemicals',
  };
  return {
    'tab-all':              'all',
    'tab-essential-oils':   C.ESSENTIAL_OILS,
    'tab-concretes':        C.CONCRETES,
    'tab-absolutes':        C.ABSOLUTES,
    'tab-aroma-chemicals':  C.AROMA_CHEMICALS,
  };
}

/**
 * Activate a specific tab button: update aria-selected, tabindex, and
 * re-render the product grid.  Triggers within 300 ms (synchronous).
 *
 * @param {HTMLElement} activeTab - The tab button to activate
 * @param {NodeList|HTMLElement[]} allTabs - All tab buttons in the tablist
 * @param {HTMLElement} gridEl - The #product-grid element
 */
function activateTab(activeTab, allTabs, gridEl) {
  // Deactivate all tabs
  allTabs.forEach((tab) => {
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });

  // Activate the chosen tab
  activeTab.setAttribute('aria-selected', 'true');
  activeTab.removeAttribute('tabindex'); // tabindex="0" is the default

  // Update panel labelledby
  if (gridEl) {
    gridEl.setAttribute('aria-labelledby', activeTab.id);
  }

  // Render products
  const category = getTabIdToCategory()[activeTab.id] ?? 'all';
  const _products = (typeof window !== 'undefined' && window.products) ? window.products : [];
  const filtered = filterProducts(applyProductOverrides(_products), category);
  renderGrid(filtered, gridEl);
}

/* --------------------------------------------------------------------------
   Keyboard navigation  —  ARIA APG tab pattern (Requirements 1.8, 12.8, 5.6)
   -------------------------------------------------------------------------- */

/**
 * Wire arrow-key navigation on the tablist per the ARIA Authoring Practices
 * Guide (APG) tab pattern:
 *   - ArrowRight / ArrowDown  —  move focus to next tab (wraps)
 *   - ArrowLeft / ArrowUp    —  move focus to previous tab (wraps)
 *   - Home                   —  move focus to first tab
 *   - End                    —  move focus to last tab
 *
 * Tab activation follows "automatic activation"  —  the focused tab is
 * activated immediately (no need to press Enter/Space).
 *
 * @param {HTMLElement} tablistEl
 * @param {HTMLElement[]} allTabs
 * @param {HTMLElement} gridEl
 */
function initTablistKeyboard(tablistEl, allTabs, gridEl) {
  tablistEl.addEventListener('keydown', (e) => {
    const currentIndex = allTabs.indexOf(document.activeElement);
    if (currentIndex === -1) return; // focus is not on a tab

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % allTabs.length;
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
        break;

      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        nextIndex = allTabs.length - 1;
        break;

      default:
        return; // Not a navigation key  —  do nothing
    }

    const nextTab = allTabs[nextIndex];
    nextTab.focus();
    activateTab(nextTab, allTabs, gridEl);
  });
}

/* --------------------------------------------------------------------------
   Escape-hatch HTML helpers
   -------------------------------------------------------------------------- */

/**
 * Escape a string for safe HTML text content insertion.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a string for safe use as an HTML attribute value (double-quoted).
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------------------
   Enquire / Request Sample navigation (Requirements 5.7, 5.8)
   -------------------------------------------------------------------------- */

/**
 * Handle clicks on enquire / request-sample buttons.
 * Navigates to contact.html pre-populating the product name field.
 *
 * @param {MouseEvent} e
 */
function handleCardAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const productName = btn.dataset.product ?? '';
  const action      = btn.dataset.action;  // 'enquire' | 'sample'

  const params = new URLSearchParams({
    form:    action === 'sample' ? 'sample' : 'product',
    product: productName,
  });

  // Req 5.8: even if productName is empty the navigation still fires
  window.location.href = `contact.html?${params.toString()}`;
}

/* --------------------------------------------------------------------------
   URL param  —  pre-filter on load (Requirements 5.6, 5.7)
   -------------------------------------------------------------------------- */

/**
 * Map a URL ?category value to the corresponding tab element id.
 * Accepts the display name or a slug variant.
 *
 * @param {string} param  e.g. "essential-oils" or "Essential Oils"
 * @returns {string|null} tab id, or null if not recognised
 */
function categoryParamToTabId(param) {
  const normalised = param.toLowerCase().replace(/\s+/g, '-');
  const map = {
    'all':              'tab-all',
    'essential-oils':   'tab-essential-oils',
    'essential oils':   'tab-essential-oils',
    'concretes':        'tab-concretes',
    'absolutes':        'tab-absolutes',
    'aroma-chemicals':  'tab-aroma-chemicals',
    'aroma chemicals':  'tab-aroma-chemicals',
  };
  return map[normalised] ?? null;
}

/* --------------------------------------------------------------------------
   Bootstrap on DOMContentLoaded
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const tablistEl = document.querySelector('[role="tablist"]');
  const gridEl    = document.getElementById('product-grid');

  if (!tablistEl || !gridEl) return; // not on the products page

  // Collect all tab buttons in DOM order
  const allTabs = Array.from(tablistEl.querySelectorAll('[role="tab"]'));

  // --- Wire tab click handlers ---
  allTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activateTab(tab, allTabs, gridEl);
    });
  });

  // --- Wire arrow-key navigation on the tablist ---
  initTablistKeyboard(tablistEl, allTabs, gridEl);

  // --- Wire enquire / request-sample button delegation ---
  gridEl.addEventListener('click', handleCardAction);

  // --- Pre-filter from URL params ---
  const params      = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');

  let initialTab = allTabs.find((t) => t.getAttribute('aria-selected') === 'true')
                   ?? allTabs[0];

  if (categoryParam) {
    const tabId      = categoryParamToTabId(categoryParam);
    const targetTab  = tabId ? document.getElementById(tabId) : null;
    if (targetTab) {
      initialTab = targetTab;
    }
  }

  // Activate the initial tab (renders the grid)
  activateTab(initialTab, allTabs, gridEl);
});
