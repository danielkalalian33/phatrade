/**
 * contact.js  —  Form validation, error rendering, and mailto submission for
 * the PHATRADE Contact page.
 *
 * Exports:
 *   validateForm(formElement)          -> { valid: boolean, errors: Map<fieldId, string> }
 *   renderErrors(form, errors)         -> void
 *   collectFields(form)                -> { [label]: value }
 *
 * Side-effects on DOMContentLoaded:
 *   - Wires submit handlers on all four Contact_Forms
 *   - Reads ?form and ?product URL params to pre-populate #form-product
 *
 * Requirements: 11.1, 11.6, 11.7, 11.10, 5.7, 5.8
 */

// ---------------------------------------------------------------------------
// Constants

// Resolve utility functions from window globals (set by utils.js script tag)
function _buildMailtoUri(...args) {
  const fn = (typeof window !== 'undefined' && window.buildMailtoUri) ? window.buildMailtoUri : null;
  if (!fn) throw new Error('buildMailtoUri not available');
  return fn(...args);
}
function _scrollToSection(...args) {
  const fn = (typeof window !== 'undefined' && window.scrollToSection) ? window.scrollToSection : null;
  if (fn) fn(...args);
}
// ---------------------------------------------------------------------------

/** Email regex from the design document */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Human-readable form type labels keyed by form element id */
const FORM_TYPES = {
  'form-general':        'General Enquiry',
  'form-product':        'Product Enquiry',
  'form-sample':         'Sample Request',
  'form-quote':          'Bulk Quote Request',
  'general-enquiry-form': 'General Enquiry',
  'product-enquiry-form': 'Product Enquiry',
  'sample-request-form':  'Sample Request',
  'quote-request-form':   'Bulk Quote Request',
};

// ---------------------------------------------------------------------------
// validateForm
// ---------------------------------------------------------------------------

/**
 * Validate all fields in a form against their HTML constraints.
 *
 * Checks performed for each named field element:
 *   1. required  —  non-empty after .trim()
 *   2. type="email"  —  matches /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   3. type="number"  —  within [min, max] when those attributes are present
 *   4. maxlength / maxLength attribute  —  value length within limit
 *
 * @param {HTMLFormElement} formElement
 * @returns {{ valid: boolean, errors: Map<string, string> }}
 */
function validateForm(formElement) {
  const errors = new Map();

  // Collect all form controls with a name attribute
  const fields = Array.from(
    formElement.querySelectorAll('input[name], textarea[name], select[name]')
  );

  for (const field of fields) {
    const id    = field.id   || field.name;
    const value = field.value ?? '';
    const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();

    // 1. Required: must not be empty after trimming
    if (field.required && trimmed === '') {
      errors.set(id, 'This field is required.');
      continue; // skip further checks for this field  —  required takes priority
    }

    // Skip remaining checks if the field is empty and not required
    if (trimmed === '') continue;

    // 2. Email format validation
    if (field.type === 'email' && !EMAIL_REGEX.test(trimmed)) {
      errors.set(id, 'Please enter a valid email address (e.g. name@company.com).');
      continue;
    }

    // 3. Numeric range validation
    if (field.type === 'number') {
      const numValue = Number(trimmed);

      if (field.hasAttribute('min')) {
        const min = Number(field.getAttribute('min'));
        if (numValue < min) {
          errors.set(id, `Value must be at least ${min}.`);
          continue;
        }
      }

      if (field.hasAttribute('max')) {
        const max = Number(field.getAttribute('max'));
        if (numValue > max) {
          errors.set(id, `Value must be no more than ${max}.`);
          continue;
        }
      }
    }

    // 4. maxLength validation (covers both input and textarea)
    const maxLength =
      field.maxLength !== undefined && field.maxLength !== -1
        ? field.maxLength
        : field.hasAttribute('maxlength')
          ? Number(field.getAttribute('maxlength'))
          : null;

    if (maxLength !== null && value.length > maxLength) {
      errors.set(id, `Maximum ${maxLength} characters allowed.`);
    }
  }

  return { valid: errors.size === 0, errors };
}

// ---------------------------------------------------------------------------
// renderErrors
// ---------------------------------------------------------------------------

/**
 * Display inline validation errors adjacent to their form fields.
 *
 * For each entry in `errors`, this function:
 *   - Finds the error container by id "{fieldId}-error" or via
 *     the field's aria-describedby attribute
 *   - Sets the container's textContent to the error message
 *   - Sets aria-hidden="false" so the live region announces the error
 *   - Adds the `.form-field--error` modifier class to the parent .form-field
 *   - Registers a one-time `input` event listener that clears the error
 *     when the user starts typing
 *
 * @param {HTMLFormElement} form
 * @param {Map<string, string>} errors
 */
function renderErrors(form, errors) {
  for (const [fieldId, message] of errors) {
    const field = form.querySelector(`#${CSS.escape(fieldId)}, [name="${CSS.escape(fieldId)}"]`);
    if (!field) continue;

    // Locate the error container: try aria-describedby first, then id convention
    let errorEl = null;

    const describedBy = field.getAttribute('aria-describedby');
    if (describedBy) {
      // aria-describedby can list multiple ids; find the one that is an error span
      for (const refId of describedBy.split(/\s+/)) {
        const candidate = document.getElementById(refId);
        if (candidate && candidate.classList.contains('form-field__error')) {
          errorEl = candidate;
          break;
        }
      }
    }

    // Fallback: conventional id pattern "{fieldId}-error"
    if (!errorEl) {
      errorEl = document.getElementById(`${fieldId}-error`);
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.setAttribute('aria-hidden', 'false');
    }

    // Add error state modifier to the parent .form-field wrapper
    const formFieldWrapper = field.closest('.form-field');
    if (formFieldWrapper) {
      formFieldWrapper.classList.add('form-field--error');
    }

    // Clear error on next input event (one-time handler)
    field.addEventListener('input', function clearError() {
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.setAttribute('aria-hidden', 'true');
      }
      if (formFieldWrapper) {
        formFieldWrapper.classList.remove('form-field--error');
      }
      field.removeEventListener('input', clearError);
    }, { once: true });
  }
}

// ---------------------------------------------------------------------------
// collectFields
// ---------------------------------------------------------------------------

/**
 * Collect all named form field values as a label -> value map.
 *
 * The label is derived from the field's associated <label> element text
 * (using the `for` attribute).  If no <label> is found, the field's `name`
 * attribute is used as a fallback key.
 *
 * @param {HTMLFormElement} form
 * @returns {Object.<string, string>}
 */
function collectFields(form) {
  const result = {};

  const fields = Array.from(
    form.querySelectorAll('input[name], textarea[name], select[name]')
  );

  for (const field of fields) {
    // Derive a human-readable label
    let label = field.name;

    // Prefer the associated <label> element text
    if (field.id) {
      const labelEl = form.querySelector(`label[for="${CSS.escape(field.id)}"]`);
      if (labelEl) {
        // Strip the required asterisk (if any) and trim whitespace
        label = labelEl.textContent
          .replace(/\s*\*\s*$/, '')
          .replace(/\u2009/g, '')   // thin space from required marker SVG
          .trim();
      }
    }

    result[label] = field.value;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Mailto fallback dialog helpers
// ---------------------------------------------------------------------------

/**
 * Populate and open the mailto-fallback <dialog>.
 *
 * Shows the recipient address and the full pre-composed message body so the
 * visitor can copy and send it manually if their email client could not open.
 *
 * @param {string} formType - Human-readable form label
 * @param {Object} fields   - Collected field label->value pairs
 */
function showMailtoFallback(formType, fields) {
  const dialog = document.getElementById('mailto-fallback');
  if (!dialog) return;

  // Compose the plain-text body for the <textarea>
  const bodyLines = [
    `Form Type: ${formType}`,
    '---',
    ...Object.entries(fields).map(
      ([label, value]) =>
        `${label}: ${typeof value === 'string' && value.trim() !== '' ? value : '(not provided)'}`
    ),
    '---',
    'Sent via PHATRADE website (phatrade-eg.com)',
  ];

  const textarea = document.getElementById('mailto-fallback-body');
  if (textarea) {
    textarea.value = bodyLines.join('\n');
  }

  // Update the "Try Again" link href with a fresh mailto URI
  const tryAgainLink = document.getElementById('mailto-fallback-open');
  if (tryAgainLink) {
    const uri = _buildMailtoUri(formType, fields);
    tryAgainLink.href = uri;
  }

  // Open the dialog (native HTML dialog API)
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

/**
 * Close the mailto-fallback dialog.
 */
function closeMailtoFallback() {
  const dialog = document.getElementById('mailto-fallback');
  if (!dialog) return;

  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

// ---------------------------------------------------------------------------
// Web3Forms helpers
// ---------------------------------------------------------------------------

/**
 * Find the value of a field by trying several possible label names.
 * Used to extract `name` and `email` for Web3Forms' reply-to handling.
 */
function findFieldValue(fields, candidates) {
  for (const key of Object.keys(fields)) {
    if (candidates.some(c => key.toLowerCase().includes(c.toLowerCase()))) {
      return fields[key] || '';
    }
  }
  return '';
}

/** Show the success toast that already exists in contact.html */
function showSuccessToast(formType) {
  const toast   = document.getElementById('form-success-toast');
  const toastMsg = document.getElementById('form-success-message');
  if (!toast) return;
  if (toastMsg) {
    toastMsg.textContent =
      `Your ${formType.toLowerCase()} has been sent. We will respond within one business day.`;
  }
  toast.removeAttribute('hidden');
  setTimeout(() => toast.setAttribute('hidden', ''), 6000);
}

/** Show a brief inline error banner below the submit button */
function showSubmitError(form) {
  let errEl = form.querySelector('.form-submit-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.className = 'form-submit-error';
    errEl.style.cssText = 'color:var(--color-error);font-size:var(--text-sm);margin-top:var(--space-2)';
    const actions = form.querySelector('.form-actions, [class*="actions"]');
    (actions || form).appendChild(errEl);
  }
  errEl.textContent = 'Something went wrong. Please try again or email us directly at info@phatrade-eg.com.';
  setTimeout(() => { errEl.textContent = ''; }, 8000);
}

// ---------------------------------------------------------------------------
// Submit handler factory
// ---------------------------------------------------------------------------

/**
 * Attach an async submit handler to a single form element.
 *
 * Flow:
 *   1. e.preventDefault()
 *   2. validateForm(form)
 *   3a. If invalid  → renderErrors + focus first error field
 *   3b. If valid    → disable button, POST to Web3Forms
 *   4a. On success  → show toast, reset form, re-enable button
 *   4b. On failure  → show error message, re-enable button (form data kept)
 *
 * @param {HTMLFormElement} form
 */
function wireSubmitHandler(form) {
  const formType = FORM_TYPES[form.id] ?? form.id;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { valid, errors } = validateForm(form);

    if (!valid) {
      renderErrors(form, errors);
      const firstErrorId = errors.keys().next().value;
      if (firstErrorId) {
        const firstField = form.querySelector(
          `#${CSS.escape(firstErrorId)}, [name="${CSS.escape(firstErrorId)}"]`
        );
        if (firstField) firstField.focus();
      }
      return;
    }

    // Disable submit button and show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalHTML = submitBtn?.innerHTML ?? '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';
    }

    const fields = collectFields(form);

    // Extract name + email so Web3Forms can set reply-to correctly
    const visitorName  = findFieldValue(fields, ['name', 'full name', 'your name']);
    const visitorEmail = findFieldValue(fields, ['email', 'email address', 'business email']);

    const payload = {
      subject:   'PHATRADE Website: ' + formType,
      from_name: 'PHATRADE Website',
      ...(visitorName  && { name:  visitorName  }),
      ...(visitorEmail && { email: visitorEmail }),
      // All collected fields as individual rows in the received email
      ...Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.trim() !== '' ? v : '(not provided)'])
      ),
    };

    try {
      const send = typeof window.submitToWeb3Forms === 'function'
        ? window.submitToWeb3Forms
        : () => Promise.resolve({ success: false, message: 'Web3Forms not loaded' });

      const result = await send(payload);

      if (result.success) {
        showSuccessToast(formType);
        form.reset();
      } else {
        console.error('[contact.js] Web3Forms rejected:', result.message);
        showSubmitError(form);
      }
    } catch (err) {
      console.error('[contact.js] Web3Forms error:', err);
      showSubmitError(form);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Dialog close wiring
// ---------------------------------------------------------------------------

/**
 * Wire close buttons and backdrop click for the mailto-fallback dialog.
 */
function wireDialogCloseHandlers() {
  const dialog = document.getElementById('mailto-fallback');
  if (!dialog) return;

  // Both close-button variants
  ['mailto-fallback-close', 'mailto-fallback-close-btn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', closeMailtoFallback);
    }
  });

  // Close on Escape is handled natively by <dialog>; close on backdrop click
  dialog.addEventListener('click', (e) => {
    // A click on the dialog backdrop targets the <dialog> itself
    if (e.target === dialog) {
      closeMailtoFallback();
    }
  });
}

// ---------------------------------------------------------------------------
// URL param pre-population (Requirements 5.7, 5.8)
// ---------------------------------------------------------------------------

/**
 * Read `?form` and `?product` query params and pre-populate the product
 * enquiry form.
 *
 * If `form=product` is present:
 *   - Scrolls to #form-product
 *   - Attempts to set the product name field value from `?product`
 *
 * If product pre-population fails for any reason, the scroll still happens.
 *
 * Also handles `?form=sample` to scroll to the sample request form, and
 * `?form=general` / `?form=quote` similarly.
 */
function handleUrlParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const formParam    = params.get('form');
    const productParam = params.get('product');

    // Map form param values to section ids
    const formSectionMap = {
      general: 'form-general',
      product: 'form-product',
      sample:  'form-sample',
      quote:   'form-quote',
    };

    if (formParam && formSectionMap[formParam]) {
      const sectionId = formSectionMap[formParam];

      // Scroll to the target form section
      _scrollToSection(sectionId);

      // Pre-populate the product name field when form=product and ?product is set
      if (formParam === 'product' && productParam) {
        try {
          const formEl = document.getElementById(sectionId);
          if (formEl) {
            // Try common id patterns for the product name field
            const productField =
              formEl.querySelector('#product-product-name') ||
              formEl.querySelector('#product-name[name*="roduct"]') ||
              formEl.querySelector('[name="product-name"]') ||
              formEl.querySelector('[name="product_name"]') ||
              formEl.querySelector('[name="productName"]') ||
              formEl.querySelector('[name="Product Name"]') ||
              formEl.querySelector('input[name*="product" i]') ||
              formEl.querySelector('select[name*="product" i]');

            if (productField) {
              productField.value = productParam;
            }
          }
        } catch {
          // Pre-population failed  —  scroll already happened above (Req 5.8)
        }
      }
    }
  } catch {
    // URL parsing failure  —  do not block page rendering
  }
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Wire all forms and handlers once the DOM is ready.
 */
function init() {
  // Wire submit handlers on all four contact forms.
  // The section IDs ('form-general', etc.) are used for hash-scroll navigation.
  // The actual <form> elements live inside those sections; try both directly by
  // section id (legacy: if a <form> ever gets that id) and by looking inside the section.
  const sectionIds = ['form-general', 'form-product', 'form-sample', 'form-quote'];
  for (const id of sectionIds) {
    const sectionEl = document.getElementById(id);
    if (!sectionEl) continue;

    // If the section itself is a <form> (unlikely but guard), wire it
    if (sectionEl.tagName === 'FORM') {
      wireSubmitHandler(sectionEl);
      continue;
    }

    // Otherwise, look for the first <form> inside the section
    const formEl = sectionEl.querySelector('form');
    if (formEl) {
      wireSubmitHandler(formEl);
    }
  }

  // Wire the mailto-fallback dialog close buttons
  wireDialogCloseHandlers();

  // Handle URL params for pre-population and scroll targeting
  handleUrlParams();
}

// Guard: only run init in a browser context (not during unit tests)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOMContentLoaded already fired (e.g. script loaded after parse)
    init();
  }
}
