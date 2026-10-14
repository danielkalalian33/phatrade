/**
 * utils.js  —  Shared utility functions for PHATRADE website
 *
 * Exports:
 *   buildMailtoUri(formType, fields) -> string
 *   scrollToSection(id)             -> void
 *   debounce(fn, ms)                -> Function
 */

/**
 * Build a mailto: URI from a form type and field values.
 *
 * The subject takes the form:
 *   "PHATRADE Website  —  {formType} Enquiry"
 *
 * The body lists every field as "Label: Value\n" pairs.
 * Empty (or whitespace-only) field values render as "(not provided)".
 *
 * Both the subject and body are encoded with encodeURIComponent so that
 * special characters, unicode, ampersands, and newlines are handled safely.
 *
 * @param {string} formType - Human-readable form type, e.g. "General Enquiry"
 * @param {Object.<string, string>} fields - { "Field Label": "field value", ... }
 * @returns {string} Complete mailto: URI
 */
function buildMailtoUri(formType, fields) {
  const subject = encodeURIComponent(
    `PHATRADE Website \u2013 ${formType} Enquiry`
  );

  const fieldLines = Object.entries(fields).map(
    ([label, value]) =>
      `${label}: ${typeof value === 'string' && value.trim() !== '' ? value : '(not provided)'}`
  );

  const bodyLines = [
    `Form Type: ${formType}`,
    '---',
    ...fieldLines,
    '---',
    'Sent via PHATRADE website (phatrade-eg.com)',
  ];

  const body = encodeURIComponent(bodyLines.join('\n'));

  return `mailto:info@phatrade-eg.com?subject=${subject}&body=${body}`;
}

/**
 * Scroll the element with the given id into the viewport.
 * Uses optional chaining so it is safe if the element is absent.
 *
 * @param {string} id - The id of the target element
 * @returns {void}
 */
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Leading-edge debounce.
 *
 * The wrapped function fires immediately on the first call, then waits `ms`
 * milliseconds before it can fire again. Subsequent calls within the cooldown
 * window are dropped (not queued).
 *
 * @param {Function} fn - The function to debounce
 * @param {number} ms   - Cooldown period in milliseconds
 * @returns {Function}  - Debounced wrapper
 */
function debounce(fn, ms) {
  let timer = null;

  return function debounced(...args) {
    if (timer !== null) {
      // Still within cooldown  —  drop this call
      return;
    }

    // Fire immediately (leading edge)
    fn.apply(this, args);

    // Start the cooldown timer; clear it when it expires
    timer = setTimeout(() => {
      timer = null;
    }, ms);
  };
}

// Make utilities available as globals for non-module script consumers (browser)
if (typeof window !== 'undefined') {
  window.buildMailtoUri = buildMailtoUri;
  window.scrollToSection = scrollToSection;
  window.debounce = debounce;
}
