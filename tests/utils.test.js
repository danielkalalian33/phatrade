/**
 * tests/utils.test.js
 *
 * Unit tests (Task 2.5) and property tests (Task 2.6) for buildMailtoUri.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildMailtoUri } from '../assets/js/utils.js';

// ---------------------------------------------------------------------------
// Property 2 – buildMailtoUri contains all form field values
// Validates: Requirements 11.6
// ---------------------------------------------------------------------------

describe('Property 2 – buildMailtoUri contains all form field values', () => {
  it('every non-empty field value appears in the decoded URI', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          company: fc.string(),
          email: fc.string(),
          message: fc.string(),
        }),
        (fields) => {
          const uri = buildMailtoUri('General', fields);
          const decoded = decodeURIComponent(uri);

          for (const [, value] of Object.entries(fields)) {
            if (value.trim() !== '') {
              if (!decoded.includes(value)) {
                return false;
              }
            }
          }

          return true;
        }
      )
    );
  });

  it('empty-string field values appear as "(not provided)" in the decoded URI', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant(''),
          company: fc.constant(''),
        }),
        (fields) => {
          const uri = buildMailtoUri('General', fields);
          const decoded = decodeURIComponent(uri);
          return decoded.includes('(not provided)');
        }
      )
    );
  });

  it('the recipient is always info@phatrade-eg.com regardless of inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          company: fc.string(),
        }),
        fc.string(),
        (fields, formType) => {
          const uri = buildMailtoUri(formType, fields);
          return uri.startsWith('mailto:info@phatrade-eg.com?');
        }
      )
    );
  });
});
