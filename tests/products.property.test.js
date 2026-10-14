/**
 * tests/products.property.test.js
 *
 * Property 1: Product category filter — completeness and exclusivity
 * Validates: Requirements 5.6
 *
 * For every category value in CATEGORIES, filterProducts must:
 *   - Return ONLY products whose category matches the requested category
 *     (exclusivity: no product of another category slips through)
 *   - Return ALL products of that category from the source array
 *     (completeness: no matching product is silently dropped)
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { filterProducts } from '../assets/js/products.js';
import { products, CATEGORIES } from '../assets/data/products.js';

describe('Property 1 – Product category filter: completeness and exclusivity', () => {
  it('every result has the requested category (exclusivity)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(CATEGORIES)),
        (category) => {
          const results = filterProducts(products, category);
          return results.every(p => p.category === category);
        }
      )
    );
  });

  it('no product of another category appears in the results (cross-category exclusion)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(CATEGORIES)),
        (category) => {
          const results = filterProducts(products, category);
          return results.every(p => p.category !== undefined && p.category === category);
        }
      )
    );
  });

  it('all products of the requested category are included in results (completeness)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(CATEGORIES)),
        (category) => {
          const results = filterProducts(products, category);
          const expected = products.filter(p => p.category === category);
          // Every expected product must appear in results
          return expected.every(p => results.some(r => r.id === p.id));
        }
      )
    );
  });
});
