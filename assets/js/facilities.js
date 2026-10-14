/**
 * facilities.js
 *
 * Handles the facilities map image fallback.
 *
 * The facilities-map.svg is displayed via an <img> element. If the image
 * fails to load, the inline onerror handler calls showFacilitiesTextFallback()
 * which hides the broken image and reveals the text-based fallback <dl>.
 *
 * Because ES modules do not expose exports to the global scope, this module
 * explicitly attaches showFacilitiesTextFallback to window so the inline
 * onerror="showFacilitiesTextFallback()" attribute on the <img> element
 * can reach it.
 *
 * Requirements: 7.7
 */

/**
 * Hides the facilities map image and reveals the text-based fallback.
 * Called by the inline onerror attribute on #facilities-map when the
 * SVG asset fails to load.
 */
function showFacilitiesTextFallback() {
  const map = document.getElementById('facilities-map');
  const fallback = document.getElementById('facilities-fallback');

  if (map) {
    map.style.display = 'none';
  }

  if (fallback) {
    // The element starts with the HTML `hidden` attribute; remove it
    // and also clear any inline display style so CSS controls layout.
    fallback.removeAttribute('hidden');
    fallback.style.display = '';
  }
}

// Attach to window so the inline onerror handler can call it.
// ES module scope is not shared with the global scope, so this is required.
window.showFacilitiesTextFallback = showFacilitiesTextFallback;
