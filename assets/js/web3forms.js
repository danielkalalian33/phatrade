/**
 * web3forms.js — Shared Web3Forms submission utility
 *
 * HOW TO ACTIVATE:
 * 1. Go to https://web3forms.com
 * 2. Enter info@phatrade-eg.com → click "Create Access Key"
 * 3. Copy the key from the email they send you
 * 4. Paste it below to replace YOUR_ACCESS_KEY_HERE
 *
 * Every form on the site (Contact, Download Gate, Certificate Gate)
 * uses this single key. One change activates everything.
 */

const WEB3FORMS_KEY = 'a8013c9c-d934-411b-8c04-49f07490a152';

/**
 * Submit a form payload to Web3Forms and deliver it to info@phatrade-eg.com.
 *
 * @param {Object} payload - Fields to send. Always include `subject`.
 *   Web3Forms treats `name` and `email` specially (sets reply-to / from).
 *   All other keys appear as labelled rows in the received email.
 *
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitToWeb3Forms(payload) {
  if (!WEB3FORMS_KEY || WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
    console.warn('[Web3Forms] No access key set. Add your key to assets/js/web3forms.js');
    // Return a fake success so the UI still works during development
    return { success: true, message: 'Dev mode — key not set' };
  }

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
  });

  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

// Expose as global so every script can call window.submitToWeb3Forms(...)
if (typeof window !== 'undefined') {
  window.submitToWeb3Forms = submitToWeb3Forms;
}
