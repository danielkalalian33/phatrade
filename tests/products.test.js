/**
 * tests/products.test.js
 *
 * Unit tests (Task 7.3) for filterProducts.
 * Requirements: 5.6
 */

import { describe, it, expect } from 'vitest';
import { filterProducts } from '../assets/js/products.js';
import { products, CATEGORIES } from '../assets/data/products.js';

describe('filterProducts', () => {
  // ── All-category mode ────────────────────────────────────────────────────

  it('returns all products when category is "all"', () => {
    const result = filterProducts(products, 'all');
    expect(result).toHaveLength(products.length);
    expect(result).toEqual(products);
  });

  // ── Specific categories ──────────────────────────────────────────────────

  it('returns only Essential Oils products for CATEGORIES.ESSENTIAL_OILS', () => {
    const result = filterProducts(products, CATEGORIES.ESSENTIAL_OILS);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => {
      expect(p.category).toBe(CATEGORIES.ESSENTIAL_OILS);
    });
    // Ensure no products from other categories slipped through
    const otherCategories = Object.values(CATEGORIES).filter(
      (c) => c !== CATEGORIES.ESSENTIAL_OILS,
    );
    result.forEach((p) => {
      expect(otherCategories).not.toContain(p.category);
    });
  });

  it('returns only Concretes products for CATEGORIES.CONCRETES', () => {
    const result = filterProducts(products, CATEGORIES.CONCRETES);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => {
      expect(p.category).toBe(CATEGORIES.CONCRETES);
    });
  });

  // ── Unknown category ─────────────────────────────────────────────────────

  it('returns an empty array for an unknown category', () => {
    const result = filterProducts(products, 'unknown-category');
    expect(result).toEqual([]);
  });

  it('returns an empty array for an empty string category', () => {
    const result = filterProducts(products, '');
    expect(result).toEqual([]);
  });
});
