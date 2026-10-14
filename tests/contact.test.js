/**
 * tests/contact.test.js
 *
 * Unit tests (Task 13.4) for validateForm exported from assets/js/contact.js.
 *
 * validateForm(formElement) returns { valid: boolean, errors: Map<fieldId, string> }
 *
 * Checks covered:
 *   1. Empty required field          → valid: false, field id in errors
 *   2. Invalid email format          → valid: false, email field id in errors
 *   3. Valid form (all fields OK)    → valid: true, errors Map is empty
 *   4. Number field below min        → valid: false
 *   5. Number field above max        → valid: false
 *   6. Field exceeding maxLength     → valid: false
 *
 * Requirements: 11.7
 */

import { describe, it, expect } from 'vitest';
import { validateForm } from '../assets/js/contact.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal HTMLFormElement containing one <input> with the given attributes.
 *
 * @param {Object} attrs  Key/value HTML attribute pairs to set on the input element.
 *                        Use `tagName` to override the element type (default: 'input').
 * @returns {HTMLFormElement}
 */
function makeForm(attrs = {}) {
  const form = document.createElement('form');
  const { tagName = 'input', ...rest } = attrs;
  const field = document.createElement(tagName);

  for (const [key, value] of Object.entries(rest)) {
    // Handle JS property names that differ from HTML attribute names
    if (key === 'maxLength') {
      field.setAttribute('maxlength', value);
      field.maxLength = Number(value);
    } else if (key === 'value') {
      field.value = value;
    } else {
      field.setAttribute(key, value);
    }
  }

  form.appendChild(field);
  return form;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateForm', () => {

  // 1. Empty required field
  it('returns valid: false and includes the field id in errors when a required field is empty', () => {
    const form = makeForm({ id: 'full-name', name: 'full-name', required: '', value: '' });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('full-name')).toBe(true);
    expect(errors.get('full-name')).toBe('This field is required.');
  });

  it('treats a whitespace-only value as empty for a required field', () => {
    const form = makeForm({ id: 'company', name: 'company', required: '', value: '   ' });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('company')).toBe(true);
  });

  // 2. Invalid email format
  it('returns valid: false and includes the email field id in errors for a bad email', () => {
    const form = makeForm({
      id: 'email',
      name: 'email',
      type: 'email',
      value: 'not-an-email',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('email')).toBe(true);
    expect(errors.get('email')).toMatch(/valid email/i);
  });

  it('accepts a valid email address', () => {
    const form = makeForm({
      id: 'email',
      name: 'email',
      type: 'email',
      value: 'buyer@example.com',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.size).toBe(0);
  });

  // 3. Valid form — all fields present and correct
  it('returns valid: true and an empty errors Map when all fields pass validation', () => {
    const form = document.createElement('form');

    const addInput = (id, type, value, required = true) => {
      const el = document.createElement('input');
      el.id = id;
      el.name = id;
      el.type = type;
      el.value = value;
      if (required) el.setAttribute('required', '');
      form.appendChild(el);
    };

    addInput('contact-name',    'text',  'Alice Smith');
    addInput('contact-company', 'text',  'Fragrance Co.');
    addInput('contact-email',   'email', 'alice@fragrance.com');
    addInput('contact-subject', 'text',  'Product Enquiry');

    const textarea = document.createElement('textarea');
    textarea.id = 'contact-message';
    textarea.name = 'contact-message';
    textarea.setAttribute('required', '');
    textarea.value = 'I am interested in your rose oil.';
    form.appendChild(textarea);

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.size).toBe(0);
  });

  // 4. Numeric field below min
  it('returns valid: false when a number field value is below the min attribute', () => {
    const form = makeForm({
      id: 'quantity',
      name: 'quantity',
      type: 'number',
      min: '10',
      value: '5',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('quantity')).toBe(true);
    expect(errors.get('quantity')).toMatch(/at least 10/i);
  });

  it('accepts a number equal to the min attribute', () => {
    const form = makeForm({
      id: 'quantity',
      name: 'quantity',
      type: 'number',
      min: '10',
      value: '10',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.has('quantity')).toBe(false);
  });

  // 5. Numeric field above max
  it('returns valid: false when a number field value exceeds the max attribute', () => {
    const form = makeForm({
      id: 'volume',
      name: 'volume',
      type: 'number',
      max: '1000',
      value: '9999',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('volume')).toBe(true);
    expect(errors.get('volume')).toMatch(/no more than 1000/i);
  });

  it('accepts a number equal to the max attribute', () => {
    const form = makeForm({
      id: 'volume',
      name: 'volume',
      type: 'number',
      max: '1000',
      value: '1000',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.has('volume')).toBe(false);
  });

  // 6. Field exceeding maxLength
  it('returns valid: false when a text field value exceeds its maxlength attribute', () => {
    const form = makeForm({
      id: 'subject',
      name: 'subject',
      type: 'text',
      maxLength: '20',
      value: 'This value is definitely longer than twenty characters',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('subject')).toBe(true);
    expect(errors.get('subject')).toMatch(/20 characters/i);
  });

  it('accepts a text field value at exactly maxlength characters', () => {
    const form = makeForm({
      id: 'subject',
      name: 'subject',
      type: 'text',
      maxLength: '5',
      value: 'Hello',
    });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.has('subject')).toBe(false);
  });

  // Edge case: non-required empty field is not flagged
  it('ignores empty non-required fields', () => {
    const form = makeForm({ id: 'optional-note', name: 'optional-note', type: 'text', value: '' });

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(true);
    expect(errors.size).toBe(0);
  });

  // Edge case: multiple fields, only one invalid
  it('collects all errors when multiple fields fail', () => {
    const form = document.createElement('form');

    const name = document.createElement('input');
    name.id = 'name'; name.name = 'name'; name.type = 'text';
    name.setAttribute('required', '');
    name.value = ''; // will fail: required
    form.appendChild(name);

    const email = document.createElement('input');
    email.id = 'email'; email.name = 'email'; email.type = 'email';
    email.value = 'bad-email'; // will fail: format
    form.appendChild(email);

    const { valid, errors } = validateForm(form);

    expect(valid).toBe(false);
    expect(errors.has('name')).toBe(true);
    expect(errors.has('email')).toBe(true);
    expect(errors.size).toBe(2);
  });

});
