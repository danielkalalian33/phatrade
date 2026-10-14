/**
 * about.js  —  About page: Timeline component
 *
 * Imports milestones from assets/data/timeline.js and renders an
 * accessible <ol class="timeline__list"> inside #timeline.
 *
 * Requirements: 4.2, 4.3, 4.6
 */

/**
 * Returns the datetime attribute value for a milestone year.
 * "Present" is not a valid datetime value so we use an empty string
 * and omit the attribute entirely for that entry.
 *
 * @param {string} year
 * @returns {string}
 */
function datetimeValue(year) {
  return /^\d{4}$/.test(year) ? year : '';
}

/**
 * Builds the HTML string for one timeline item.
 *
 * @param {{ year: string, description: string }} milestone
 * @param {number} index
 * @param {number} total
 * @returns {string}
 */
function buildTimelineItem(milestone, index, total) {
  const dt = datetimeValue(milestone.year);
  const timeTag = dt
    ? `<time class="timeline__year" datetime="${dt}">${milestone.year}</time>`
    : `<span class="timeline__year">${milestone.year}</span>`;

  const isLast = index === total - 1;

  return `
    <li class="timeline__item" aria-label="Milestone ${index + 1} of ${total}: ${milestone.year}">
      <div class="timeline__connector" aria-hidden="true">
        <div class="timeline__dot"></div>
      </div>
      <div class="timeline__content">
        ${timeTag}
        <p class="timeline__description">${milestone.description}</p>
      </div>
    </li>`.trim();
}

/**
 * Renders the timeline into the #timeline section.
 * On failure, marks the section as unavailable and shows an error indicator.
 */
function renderTimeline() {
  // Resolve milestones from window global (set by data/timeline.js script tag)
  const milestones = (typeof window !== 'undefined' ? window.milestones : undefined) || [];
  const section = document.getElementById('timeline');
  if (!section) return;

  try {
    if (!Array.isArray(milestones) || milestones.length === 0) {
      throw new Error('No milestone data available.');
    }

    const items = milestones
      .map((m, i) => buildTimelineItem(m, i, milestones.length))
      .join('\n');

    const container = section.querySelector('.container');
    if (!container) {
      throw new Error('Timeline container element not found.');
    }

    // Mount point  —  the heading already exists in HTML; append the list after it
    const ol = document.createElement('ol');
    ol.className = 'timeline__list';
    ol.setAttribute('aria-label', 'Company history milestones');
    ol.innerHTML = items;
    container.appendChild(ol);

  } catch (err) {
    // Requirement 4.6: mark section unavailable without blocking other sections
    section.setAttribute('aria-label', 'Section unavailable');
    const container = section.querySelector('.container') ?? section;

    const errorEl = document.createElement('div');
    errorEl.className = 'section-error';
    errorEl.setAttribute('role', 'status');
    errorEl.innerHTML = `
      <div class="section-error__icon" aria-hidden="true">âš </div>
      <p class="section-error__message">Timeline could not be loaded. Please refresh the page.</p>
    `.trim();

    container.appendChild(errorEl);
    console.error('[about.js] Timeline render error:', err);
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderTimeline);
} else {
  renderTimeline();
}
