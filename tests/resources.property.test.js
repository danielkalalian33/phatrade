/**
 * tests/resources.property.test.js
 *
 * Property 4: Document search filter — matching and exclusivity
 * Validates: Requirements 10.6
 *
 * For any non-empty search term and any array of document records,
 * filterDocuments(docs, term, 'all') must:
 *   (a) include only documents whose title or productName contains the term
 *       (case-insensitive), and
 *   (b) exclude every document that does not match.
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { filterDocuments } from '../assets/js/resources.js';

// ---------------------------------------------------------------------------
// Arbitrary for a single document record
// ---------------------------------------------------------------------------

const docArb = fc.record({
  id: fc.string(),
  title: fc.string(),
  productName: fc.string(),
  category: fc.constantFrom('TDS', 'SDS', 'Certificate'),
  fileUrl: fc.option(fc.string(), { nil: null }),
  fileType: fc.option(fc.constantFrom('pdf', 'other'), { nil: null }),
});

// ---------------------------------------------------------------------------
// Property 4 — matching and exclusivity
// Validates: Requirements 10.6
// ---------------------------------------------------------------------------

describe('Property 4 – filterDocuments matching and exclusivity', () => {
  it('every result contains the term in title or productName (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(docArb),
        (term, docs) => {
          const results = filterDocuments(docs, term, 'all');
          const needle = term.trim().toLowerCase();

          // If the trimmed term is empty (e.g. term was all whitespace),
          // filterDocuments returns everything — skip the inclusion check.
          if (needle === '') return true;

          return results.every(
            (doc) =>
              doc.title.toLowerCase().includes(needle) ||
              doc.productName.toLowerCase().includes(needle)
          );
        }
      )
    );
  });

  it('no non-matching document appears in the results', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(docArb),
        (term, docs) => {
          const results = filterDocuments(docs, term, 'all');
          const needle = term.trim().toLowerCase();

          if (needle === '') return true;

          const resultIds = new Set(results.map((d) => d.id));

          // Every doc that does NOT match must be absent from results
          const nonMatching = docs.filter(
            (doc) =>
              !doc.title.toLowerCase().includes(needle) &&
              !doc.productName.toLowerCase().includes(needle)
          );

          return nonMatching.every((doc) => !resultIds.has(doc.id));
        }
      )
    );
  });

  it('results are a subset of the input docs array', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(docArb),
        (term, docs) => {
          const results = filterDocuments(docs, term, 'all');

          // Every result must have originated from the input array
          return results.every((r) =>
            docs.some(
              (d) =>
                d.id === r.id &&
                d.title === r.title &&
                d.productName === r.productName
            )
          );
        }
      )
    );
  });
});
