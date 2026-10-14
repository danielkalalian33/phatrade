/**
 * faq.js — FAQ accordion for the Contact page.
 * Toggles aria-expanded and hidden attributes on click.
 * Keyboard accessible: Enter/Space toggle, Escape closes.
 */
function initFaq() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);
      if (!answer) return;

      btn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        answer.setAttribute('hidden', '');
      } else {
        answer.removeAttribute('hidden');
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        const answerId = btn.getAttribute('aria-controls');
        const answer = document.getElementById(answerId);
        if (answer) answer.setAttribute('hidden', '');
        btn.focus();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaq);
} else {
  initFaq();
}
