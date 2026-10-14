/**
 * tests/accessibility.test.js
 *
 * Task 15.3 — Accessibility audit using axe-core + JSDOM.
 *
 * Loads each of the 9 HTML pages from the filesystem, sets the document
 * innerHTML, runs axe.run() and asserts no violations with impact
 * "critical" or "serious" are present in the static markup.
 *
 * Requirements: 2.3, 12.4, 12.8
 *
 * -----------------------------------------------------------------------
 * Design notes
 * -----------------------------------------------------------------------
 * The pages rely on components.js to inject the navbar and footer at
 * runtime. That JS does not execute in the JSDOM test environment, so the
 * #navbar-root and #footer-root mount points remain empty. This produces
 * false-positive violations for rules that require landmarks to wrap all
 * page content ("region") because the dynamically injected <header> /
 * <nav> / <footer> are absent.
 *
 * To keep the test focused on real authoring issues and avoid noise from
 * the missing dynamic shell, we disable the following rules whose
 * violations are entirely caused by the absent injection:
 *
 *   • "region" — all page content must be in a landmark
 *     (navbar <header>/<nav> and page <footer> are injected by JS)
 *
 * All other critical / serious rules run without exception.
 * -----------------------------------------------------------------------
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axe from 'axe-core';

// ---------------------------------------------------------------------------
// Resolve paths relative to workspace root
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/**
 * The 9 pages of the PHATRADE website.
 */
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

/**
 * axe rules that produce false-positive violations in the JSDOM environment
 * because they depend on content injected by components.js at runtime.
 *
 * Disabling a rule here means its violations will NOT be reported or failed
 * on — it does not affect the real browser audit.
 */
const JSDOM_FALSE_POSITIVE_RULES = [
  'region', // navbar <header>/<nav> and page <footer> are JS-injected; absent in JSDOM
];

// ---------------------------------------------------------------------------
// Helper: load page HTML and inject into document
// ---------------------------------------------------------------------------

/**
 * Read an HTML file and inject its <body> content plus <html lang>, <title>,
 * and relevant <head> meta into the live JSDOM document so axe can analyse it.
 *
 * We inject the full HTML string into document.documentElement.innerHTML so
 * that axe sees the correct `lang` attribute on <html> and the <main> landmark.
 *
 * @param {string} htmlFile  Filename relative to workspace root (e.g. "index.html")
 */
function loadPage(htmlFile) {
  const filePath = path.join(ROOT, htmlFile);
  const html = fs.readFileSync(filePath, 'utf8');

  // Extract just the opening <html ...> tag to get the lang attribute
  const htmlTagMatch = html.match(/<html([^>]*)>/i);
  const htmlAttrs = htmlTagMatch ? htmlTagMatch[1] : ' lang="en"';

  // Apply lang attribute to the document element
  const langMatch = htmlAttrs.match(/lang="([^"]*)"/i);
  if (langMatch) {
    document.documentElement.lang = langMatch[1];
  }

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    document.title = titleMatch[1].trim();
  }

  // Inject the full <body> content into document.body.
  // We use a DOMParser-style extraction: pull the innerHTML of <body>.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    document.body.innerHTML = bodyMatch[1];
  } else {
    // Fallback: inject whole HTML — axe will still analyse what's there
    document.body.innerHTML = html;
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Accessibility audit — no critical or serious violations', () => {
  beforeEach(() => {
    // Reset axe internal state between runs (clears cached results, configured rules, etc.)
    axe.reset();
    // Reset DOM between tests to avoid state bleed
    document.documentElement.lang = 'en';
    document.title = '';
    document.body.innerHTML = '';
  });

  for (const page of PAGES) {
    it(`${page} has no critical or serious violations`, async () => {
      loadPage(page);

      // Run axe against the current document
      const results = await axe.run(document, {
        runOnly: {
          type: 'tag',
          // Run WCAG 2.1 Level A and AA rules (covers Req 2.3, 12.8)
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
        rules: Object.fromEntries(
          JSDOM_FALSE_POSITIVE_RULES.map((id) => [id, { enabled: false }])
        ),
      });

      // Filter to only the severity levels we care about
      const criticalOrSerious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      // Build a readable failure message listing each violation
      const message = criticalOrSerious
        .map(
          (v) =>
            `[${v.impact.toUpperCase()}] ${v.id}: ${v.description}\n` +
            v.nodes
              .slice(0, 3) // limit to first 3 affected nodes per rule
              .map((n) => `  → ${n.html.slice(0, 120)}`)
              .join('\n')
        )
        .join('\n\n');

      expect(criticalOrSerious, `Violations in ${page}:\n\n${message}`).toHaveLength(0);
    });
  }
});
