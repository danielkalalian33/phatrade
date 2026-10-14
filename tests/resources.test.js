/**
 * tests/resources.test.js
 *
 * Unit tests for filterDocuments (Task 12.3).
 * Requirements: 10.6
 */

import { describe, it, expect } from 'vitest';
import { filterDocuments } from '../assets/js/resources.js';

// ---------------------------------------------------------------------------
// Sample document fixtures — isolated from the real data module
// ---------------------------------------------------------------------------

const sampleDocs = [
  {
    id: 'neroli-tds',
    title: 'Neroli Essential Oil – Technical Data Sheet',
    productName: 'Neroli',
    category: 'TDS',
    fileUrl: 'assets/docs/neroli-tds.pdf',
    fileType: 'pdf',
  },
  {
    id: 'geranium-tds',
    title: 'Geranium Essential Oil – Technical Data Sheet',
    productName: 'Geranium',
    category: 'TDS',
    fileUrl: 'assets/docs/geranium-tds.pdf',
    fileType: 'pdf',
  },
  {
    id: 'rose-otto-tds',
    title: 'Rose Otto – Technical Data Sheet',
    productName: 'Rose Otto',
    category: 'TDS',
    fileUrl: null,
    fileType: null,
  },
  {
    id: 'neroli-sds',
    title: 'Neroli Essential Oil – Safety Data Sheet',
    productName: 'Neroli',
    category: 'SDS',
    fileUrl: 'assets/docs/neroli-sds.pdf',
    fileType: 'pdf',
  },
  {
    id: 'jasmine-con-sds',
    title: 'Jasmine Concrete – Safety Data Sheet',
    productName: 'Jasmine',
    category: 'SDS',
    fileUrl: null,
    fileType: null,
  },
  {
    id: 'cert-gfsi',
    title: 'GFSI Audit Certificate',
    productName: 'PHATRADE',
    category: 'Certificate',
    fileUrl: 'assets/docs/cert-gfsi.pdf',
    fileType: 'pdf',
  },
  {
    id: 'cert-haccp',
    title: 'HACCP Certificate',
    productName: 'PHATRADE',
    category: 'Certificate',
    fileUrl: null,
    fileType: null,
  },
];

// ---------------------------------------------------------------------------
// Case-insensitive title match
// ---------------------------------------------------------------------------

describe('filterDocuments — title match', () => {
  it('finds docs whose title contains the term (lowercase search, mixed-case data)', () => {
    const results = filterDocuments(sampleDocs, 'geranium', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('geranium-tds');
  });

  it('finds docs whose title contains the term (uppercase search)', () => {
    const results = filterDocuments(sampleDocs, 'GERANIUM', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('geranium-tds');
  });

  it('finds docs whose title contains the term (mixed-case search)', () => {
    const results = filterDocuments(sampleDocs, 'GfSi', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('cert-gfsi');
  });

  it('matches on a partial title substring', () => {
    // "Safety Data Sheet" appears in both neroli-sds and jasmine-con-sds
    const results = filterDocuments(sampleDocs, 'safety data', 'all');
    expect(results).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Case-insensitive productName match
// ---------------------------------------------------------------------------

describe('filterDocuments — productName match', () => {
  it('finds docs whose productName contains the term (lowercase search)', () => {
    const results = filterDocuments(sampleDocs, 'rose', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rose-otto-tds');
  });

  it('finds docs whose productName contains the term (uppercase search)', () => {
    const results = filterDocuments(sampleDocs, 'ROSE', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rose-otto-tds');
  });

  it('returns multiple docs when productName matches more than one entry', () => {
    // "Neroli" is the productName for both neroli-tds and neroli-sds
    const results = filterDocuments(sampleDocs, 'neroli', 'all');
    expect(results).toHaveLength(2);
    expect(results.map((d) => d.id).sort()).toEqual(['neroli-sds', 'neroli-tds']);
  });
});

// ---------------------------------------------------------------------------
// Category filter
// ---------------------------------------------------------------------------

describe('filterDocuments — category filter', () => {
  it('returns only TDS documents when category is "TDS"', () => {
    const results = filterDocuments(sampleDocs, '', 'TDS');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.category === 'TDS')).toBe(true);
  });

  it('returns only SDS documents when category is "SDS"', () => {
    const results = filterDocuments(sampleDocs, '', 'SDS');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.category === 'SDS')).toBe(true);
  });

  it('returns only Certificate documents when category is "Certificate"', () => {
    const results = filterDocuments(sampleDocs, '', 'Certificate');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.category === 'Certificate')).toBe(true);
  });

  it('combines category filter with a search term', () => {
    // "neroli" exists as both TDS and SDS; only the TDS one should appear
    const results = filterDocuments(sampleDocs, 'neroli', 'TDS');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('neroli-tds');
  });

  it('excludes documents from other categories even when term matches', () => {
    // "GFSI" exists only as a Certificate; filtering by TDS should return nothing
    const results = filterDocuments(sampleDocs, 'gfsi', 'TDS');
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Empty term returns all docs (within optional category)
// ---------------------------------------------------------------------------

describe('filterDocuments — empty term', () => {
  it('returns all docs when term is "" and category is "all"', () => {
    const results = filterDocuments(sampleDocs, '', 'all');
    expect(results).toHaveLength(sampleDocs.length);
  });

  it('returns all docs of the given category when term is "" and category is set', () => {
    const tdsCount = sampleDocs.filter((d) => d.category === 'TDS').length;
    const results = filterDocuments(sampleDocs, '', 'TDS');
    expect(results).toHaveLength(tdsCount);
  });

  it('treats a whitespace-only term as empty (matches everything)', () => {
    const results = filterDocuments(sampleDocs, '   ', 'all');
    expect(results).toHaveLength(sampleDocs.length);
  });
});

// ---------------------------------------------------------------------------
// No-match term returns empty array
// ---------------------------------------------------------------------------

describe('filterDocuments — no-match', () => {
  it('returns an empty array when no document title or productName matches the term', () => {
    const results = filterDocuments(sampleDocs, 'zzz-no-such-product', 'all');
    expect(results).toHaveLength(0);
  });

  it('returns an empty array when the category matches but the term does not', () => {
    const results = filterDocuments(sampleDocs, 'zzz-no-such-product', 'TDS');
    expect(results).toHaveLength(0);
  });

  it('returns an empty array when given an empty docs array', () => {
    const results = filterDocuments([], 'neroli', 'all');
    expect(results).toHaveLength(0);
  });
});
