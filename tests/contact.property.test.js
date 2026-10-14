/**
 * tests/contact.property.test.js
 *
 * Property 3: Form validation rejects invalid submissions
 * Validates: Requirements 11.7
 *
 * For any form where at least one required field is invalid — either the
 * name field is empty or the email field is not a valid address —
 * validateForm must return { valid: false }.
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateForm } from '../assets/js/contact.js';

// ---------------------------------------------------------------------------
// Helpers — build a real HTMLFormElement in JSDOM
// ---------------------------------------------------------------------------

/**
 * Build a minimal HTMLFormElement with a required text input (name) and a
 * required email input (email), then set their values from the provided data.
 *
 * @param {{ name: string, email: string }} data
 * @returns {HTMLFormElement}
 */
function buildForm(data) {
  const form = document.createElement('form');
  form.id = 'form-test';

  // Name field — required text input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'name';
  nameInput.name = 'name';
  nameInput.required = true;
  nameInput.value = data.name;
  form.appendChild(nameInput);

  // Email field — required email input
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.required = true;
  emailInput.value = data.email;
  form.appendChild(emailInput);

  return form;
}

// ---------------------------------------------------------------------------
// Arbitrary — generates data with at least one invalid field
// ---------------------------------------------------------------------------

/**
 * Generates { name, email } records where either:
 *   - name === ''               (required field empty → invalid), or
 *   - email === 'not-an-email'  (invalid email format → invalid)
 *
 * This guarantees at least one validation failure per generated record.
 */
const invalidFormDataArb = fc
  .record({
    name: fc.oneof(fc.constant(''), fc.string({ minLength: 1 })),
    email: fc.oneof(fc.constant('not-an-email'), fc.emailAddress()),
  })
  .filter((data) => data.name === '' || data.email === 'not-an-email');

// ---------------------------------------------------------------------------
// Property 3 — Form validation rejects invalid submissions
// Validates: Requirements 11.7
// ---------------------------------------------------------------------------

describe('Property 3 – Form validation rejects invalid submissions', () => {
  /**
   * Core property: any form with an empty required field or an invalid email
   * must be rejected with valid: false.
   */
  it('validateForm returns valid: false when at least one field is invalid', () => {
    fc.assert(
      fc.property(invalidFormDataArb, (data) => {
        const form = buildForm(data);
        const { valid } = validateForm(form);
        return valid === false;
      })
    );
  });

  /**
   * Companion property: the errors Map is non-empty whenever valid is false.
   * Ensures the caller always receives actionable error information.
   */
  it('validateForm populates the errors Map for every invalid form', () => {
    fc.assert(
      fc.property(invalidFormDataArb, (data) => {
        const form = buildForm(data);
        const { valid, errors } = validateForm(form);
        // When invalid, errors must contain at least one entry
        return valid === false && errors.size > 0;
      })
    );
  });

  /**
   * Empty-name sub-property: a blank required name field is always an error,
   * regardless of how valid or invalid the email is.
   */
  it('validateForm returns valid: false when name is empty (regardless of email)', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('not-an-email'), fc.emailAddress()),
        (email) => {
          const form = buildForm({ name: '', email });
          const { valid } = validateForm(form);
          return valid === false;
        }
      )
    );
  });

  /**
   * Invalid-email sub-property: a malformed email is always an error,
   * regardless of whether name is filled in.
   */
  it('validateForm returns valid: false when email is not-an-email (regardless of name)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (name) => {
          const form = buildForm({ name, email: 'not-an-email' });
          const { valid } = validateForm(form);
          return valid === false;
        }
      )
    );
  });
});
