/**
 * tests/integration.test.js
 *
 * Integration tests (Task 15.2) — structural validation of all 9 HTML pages.
 *
 * Assertions per page:
 *  - <main> present (landmark; navbar/footer are JS-injected so #navbar-root
 *    and #footer-root divs serve as proxies for those landmarks)
 *  - #navbar-root and #footer-root mount points present
 *  - nav.js script tag present (proxy for navigation requirement)
 *  - <meta name="viewport"> present with correct content
 *  - <meta name="description"> content length 50–160
 *  - All <img> elements have a non-empty alt attribute, or an explicit alt=""
 *    for decorative images
 *  - All <a href="...html"> hrefs resolve to files that exist in the project
 *
 * Requirements: 12.1, 12.4, 12.5, 12.6, 12.7
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Absolute path to the workspace root (one directory above /tests/) */
const ROOT = resolve(__dirname, '..');

/**
 * Read an HTML file from the workspace root and parse it with DOMParser
 * (provided by vitest's JSDOM environment).
 */
function loadPage(filename) {
  const html = readFileSync(join(ROOT, filename), 'utf-8');
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

/**
 * Extract only the path portion from an href, stripping query strings and
 * hash fragments so we can check file existence.
 * e.g. "products.html?category=Essential%20Oils" → "products.html"
 *      "contact.html#form-sample" → "contact.html"
 */
function hrefToPath(href) {
  // Remove hash and query string, keep only the file path
  return href.split('#')[0].split('?')[0];
}

// ---------------------------------------------------------------------------
// The 9 pages to test
// ---------------------------------------------------------------------------

const PAGES = [
  'index.html',
  'about.html',
  'products.html',
  'applications.html',
  'facilities.html',
  'quality.html',
  'sustainability.html',
  'resources.html',
  'contact.html',
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration — structural validation of all 9 HTML pages', () => {

  for (const page of PAGES) {
    describe(page, () => {
      let doc;

      // Parse once per page; if loading throws the tests in this block will
      // also fail, which is the desired behaviour.
      try {
        doc = loadPage(page);
      } catch (err) {
        it('page must be readable', () => {
          throw new Error(`Could not read/parse ${page}: ${err.message}`);
        });
        return; // skip further assertions for this page
      }

      // ------------------------------------------------------------------
      // Landmark / mount-point checks (Req 12.4)
      // ------------------------------------------------------------------

      it('has a <main> element', () => {
        const main = doc.querySelector('main');
        expect(main, '<main> element not found').not.toBeNull();
      });

      it('has a #navbar-root mount point (nav injection target)', () => {
        const navRoot = doc.getElementById('navbar-root');
        expect(navRoot, '#navbar-root not found — navbar injection mount point missing').not.toBeNull();
      });

      it('has a #footer-root mount point (footer injection target)', () => {
        const footerRoot = doc.getElementById('footer-root');
        expect(footerRoot, '#footer-root not found — footer injection mount point missing').not.toBeNull();
      });

      it('includes nav.js <script type="module"> tag (navigation module)', () => {
        const scripts = Array.from(doc.querySelectorAll('script[type="module"]'));
        const hasNavJs = scripts.some(s => s.getAttribute('src')?.includes('nav.js'));
        expect(hasNavJs, 'nav.js module script tag not found').toBe(true);
      });

      it('includes components.js <script type="module"> tag (shared component module)', () => {
        const scripts = Array.from(doc.querySelectorAll('script[type="module"]'));
        const hasComponentsJs = scripts.some(s => s.getAttribute('src')?.includes('components.js'));
        expect(hasComponentsJs, 'components.js module script tag not found').toBe(true);
      });

      // ------------------------------------------------------------------
      // <meta name="viewport"> check (Req 12.6)
      // ------------------------------------------------------------------

      it('has <meta name="viewport" content="width=device-width, initial-scale=1">', () => {
        const viewport = doc.querySelector('meta[name="viewport"]');
        expect(viewport, '<meta name="viewport"> not found').not.toBeNull();

        const content = viewport.getAttribute('content') ?? '';
        // Accept both "initial-scale=1" and "initial-scale=1.0"
        expect(
          content,
          `viewport content "${content}" does not include width=device-width`
        ).toMatch(/width=device-width/);
        expect(
          content,
          `viewport content "${content}" does not include initial-scale=1`
        ).toMatch(/initial-scale=1(\.0)?/);
      });

      // ------------------------------------------------------------------
      // <meta name="description"> length check (Req 12.7)
      // ------------------------------------------------------------------

      it('has <meta name="description"> with content length 50–160 chars', () => {
        const metaDesc = doc.querySelector('meta[name="description"]');
        expect(metaDesc, '<meta name="description"> not found').not.toBeNull();

        const content = (metaDesc.getAttribute('content') ?? '').trim();
        expect(
          content.length,
          `description length ${content.length} is below 50 chars: "${content}"`
        ).toBeGreaterThanOrEqual(50);
        expect(
          content.length,
          `description length ${content.length} exceeds 160 chars: "${content}"`
        ).toBeLessThanOrEqual(160);
      });

      // ------------------------------------------------------------------
      // <img> alt attribute check (Req 12.5)
      // ------------------------------------------------------------------

      it('all <img> elements have an alt attribute (empty string is allowed for decorative)', () => {
        const images = Array.from(doc.querySelectorAll('img'));

        const violations = images.filter(img => {
          // alt attribute must exist; if it does not, hasAttribute returns false
          if (!img.hasAttribute('alt')) return true; // violation: missing alt
          // alt="" is explicitly allowed for decorative images
          // alt with non-file-path value is fine — we only reject missing alt here
          return false;
        });

        expect(
          violations.length,
          `${violations.length} <img> element(s) missing alt attribute:\n` +
          violations.map(img => `  src="${img.getAttribute('src')}"  (no alt)`).join('\n')
        ).toBe(0);
      });

      it('no <img> has an alt value that looks like a raw file path or filename', () => {
        const images = Array.from(doc.querySelectorAll('img'));

        // Only flag images whose alt IS set and looks like a bare file path
        // (contains "/" or ends with a file extension like .jpg/.png/.webp/.svg).
        const violations = images.filter(img => {
          const alt = img.getAttribute('alt');
          if (alt === null || alt === '') return false; // missing handled above; '' is decorative
          // Reject alt values that are obviously file paths or file names
          return /\.(jpg|jpeg|png|webp|svg|gif|ico)$/i.test(alt) ||
                 /^assets\//i.test(alt);
        });

        expect(
          violations.length,
          `${violations.length} <img> element(s) have a file-path alt value:\n` +
          violations.map(img => `  src="${img.getAttribute('src')}"  alt="${img.getAttribute('alt')}"`).join('\n')
        ).toBe(0);
      });

      // ------------------------------------------------------------------
      // Internal href file existence check (Req 12.1)
      // ------------------------------------------------------------------

      it('all internal <a href="...html"> links point to existing files', () => {
        const anchors = Array.from(doc.querySelectorAll('a[href]'));

        // Collect hrefs that reference .html files with a relative path
        // (skip mailto:, tel:, http:, https:, and hash-only links)
        const htmlAnchors = anchors.filter(a => {
          const href = a.getAttribute('href') ?? '';
          return (
            href.endsWith('.html') ||
            href.includes('.html?') ||
            href.includes('.html#')
          ) && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel');
        });

        const missing = htmlAnchors.filter(a => {
          const href = a.getAttribute('href') ?? '';
          const filePath = hrefToPath(href);
          // Resolve relative to workspace root
          const absolute = join(ROOT, filePath);
          return !existsSync(absolute);
        });

        expect(
          missing.length,
          `${missing.length} broken internal link(s) found:\n` +
          missing.map(a => `  href="${a.getAttribute('href')}" — file not found`).join('\n')
        ).toBe(0);
      });

    }); // describe(page)
  } // for (const page of PAGES)

}); // Integration suite
