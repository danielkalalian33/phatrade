/**
 * Company history milestones for the About page timeline.
 * Each entry has a `year` string and a `description` (1—150 chars).
 *
 * Requirements: 4.2
 */
const milestones = [
  {
    year: '1975',
    description: 'PHATRADE founded in Egypt, beginning as a trader of premium spices and herbs.'
  },
  {
    year: '1977',
    description: 'Expanded operations into essential oils extraction, marking the start of our core business.'
  },
  {
    year: '1987',
    description: 'Established a dedicated manufacturing facility in Obour City, scaling production capacity.'
  },
  {
    year: '1989',
    description: 'Received first international quality certification, affirming our commitment to global standards.'
  },
  {
    year: 'Present',
    description: 'Leading Egyptian producer of essential oils, concretes, and absolutes, exporting to markets worldwide.'
  }
];

// Make data available as globals for non-module script consumers (browser)
if (typeof window !== 'undefined') {
  window.milestones = milestones;
}
