/**
 * cert-gate.js
 * Lead-capture gate for certification downloads on the Quality page.
 *
 * Certs with a real file → form submission triggers download.
 * Certs without a file   → form submission sends an email request
 *                          and shows a success toast.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'phatrade_gate_lead';

const CERTS = {
  iso22000:  { title: 'ISO 22000 Food Safety Certificate',              fileUrl: 'assets/docs/cert-iso22000.pdf'  },
  fssc22000: { title: 'FSSC 22000 Food Safety Certificate',             fileUrl: 'assets/docs/cert-iso22000.pdf'  },
  iso14001: { title: 'ISO 14001 Environmental Management Certificate', fileUrl: 'assets/docs/cert-iso14001.pdf' },
  iso45001: { title: 'ISO 45001 Health & Safety Certificate',          fileUrl: 'assets/docs/cert-iso45001.pdf' },
  halal:    { title: 'HALAL Certificate',                              fileUrl: 'assets/docs/cert-halal.pdf'    },
  fda:      { title: 'FDA Registration Certificate',                   fileUrl: 'assets/docs/cert-fda.pdf'      },
  kosher:   { title: 'Kosher Supervision Certificate',                 fileUrl: 'assets/docs/cert-kosher.pdf'   },
  sedex:    { title: 'SEDEX Certificate',                              fileUrl: 'assets/docs/cert-sedex.pdf'    },
  ecovadis: { title: 'EcoVadis Committed Sustainability Rating',       fileUrl: null                            },
};

/* ── Storage helpers ── */
function getSavedLead() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}
function saveLead(lead) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead)); } catch {}
}

/* ── Web3Forms notification (fire-and-forget — never blocks the download/toast) ── */
function notifyLead(lead, title, isRequest) {
  const send = typeof window.submitToWeb3Forms === 'function'
    ? window.submitToWeb3Forms
    : null;

  if (!send) return;

  send({
    subject:     'PHATRADE ' + (isRequest ? 'Certificate Request: ' : 'Certificate Download: ') + title,
    from_name:   'PHATRADE Website',
    name:        lead.name,
    email:       lead.email,
    Company:     lead.company,
    Certificate: title,
    Type:        isRequest ? 'Request (no file available yet)' : 'Direct download',
    Source:      'Quality page – certificate gate',
  }).catch(err => console.warn('[cert-gate] Web3Forms error:', err));
}

/* ── File download ── */
function triggerDownload(href) {
  const a = document.createElement('a');
  a.href = href;
  a.download = '';
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}

/* ── Toast notification ── */
function showToast(msg) {
  const existing = document.getElementById('cert-gate-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cert-gate-toast';
  toast.className = 'cert-gate-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${msg}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('cert-gate-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('cert-gate-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* ── Form validation ── */
function validateForm(form) {
  const errors = new Map();
  const name    = form.querySelector('#gate-name');
  const company = form.querySelector('#gate-company');
  const email   = form.querySelector('#gate-email');
  if (!name.value.trim())    errors.set('gate-name', 'Please enter your full name.');
  if (!company.value.trim()) errors.set('gate-company', 'Please enter your company name.');
  if (!email.value.trim())   errors.set('gate-email', 'Please enter your business email.');
  else if (!EMAIL_RE.test(email.value.trim())) errors.set('gate-email', 'Please enter a valid email address.');
  return errors;
}

function showErrors(form, errors) {
  form.querySelectorAll('.form-field__error').forEach(el => { el.textContent = ''; el.setAttribute('aria-hidden', 'true'); });
  form.querySelectorAll('.form-field').forEach(el => el.classList.remove('form-field--error'));
  for (const [id, msg] of errors) {
    const errEl = document.getElementById(id + '-error');
    const field = document.getElementById(id);
    if (errEl) { errEl.textContent = msg; errEl.setAttribute('aria-hidden', 'false'); }
    if (field) {
      field.closest('.form-field')?.classList.add('form-field--error');
      field.addEventListener('input', function clear() {
        if (errEl) { errEl.textContent = ''; errEl.setAttribute('aria-hidden', 'true'); }
        field.closest('.form-field')?.classList.remove('form-field--error');
        field.removeEventListener('input', clear);
      }, { once: true });
    }
  }
  const firstId = errors.keys().next().value;
  if (firstId) document.getElementById(firstId)?.focus();
}

/* ── Main init ── */
function initCertGate() {
  const dialog    = document.getElementById('download-gate');
  const form      = document.getElementById('download-gate-form');
  const closeBtn  = document.getElementById('download-gate-close');
  const cancelBtn = document.getElementById('download-gate-cancel');
  const docNameEl = document.getElementById('download-gate-docname');
  const submitBtn = form?.querySelector('.download-gate__submit');

  if (!dialog || !form) return;

  let pendingCertId = null;

  function openGate(certId) {
    const cert = CERTS[certId];
    if (!cert) return;
    pendingCertId = certId;

    if (docNameEl) docNameEl.textContent = cert.title;

    // Update submit button label
    if (submitBtn) {
      // Remove any previously prepended SVG to avoid duplication
      submitBtn.querySelector('svg')?.remove();
      submitBtn.childNodes.forEach(n => { if (n.nodeType === 3) n.remove(); });
      submitBtn.textContent = cert.fileUrl ? 'Download Now' : 'Send Request';
      submitBtn.insertAdjacentHTML('afterbegin',
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          ${cert.fileUrl
            ? '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
            : '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'}
        </svg>`
      );
    }

    // Pre-fill if we have a saved lead
    const saved = getSavedLead();
    if (saved) {
      const nameEl    = form.querySelector('#gate-name');
      const companyEl = form.querySelector('#gate-company');
      const emailEl   = form.querySelector('#gate-email');
      if (nameEl)    nameEl.value    = saved.name    || '';
      if (companyEl) companyEl.value = saved.company || '';
      if (emailEl)   emailEl.value   = saved.email   || '';
    }

    // Clear previous errors
    form.querySelectorAll('.form-field__error').forEach(el => { el.textContent = ''; el.setAttribute('aria-hidden', 'true'); });
    form.querySelectorAll('.form-field').forEach(el => el.classList.remove('form-field--error'));

    dialog.showModal();
    setTimeout(() => {
      const first = form.querySelector('input[value=""], input:not([value])') || form.querySelector('input');
      first?.focus();
    }, 60);
  }

  function closeGate() {
    dialog.close();
    pendingCertId = null;
  }

  if (closeBtn)  closeBtn.addEventListener('click', closeGate);
  if (cancelBtn) cancelBtn.addEventListener('click', closeGate);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeGate(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = validateForm(form);
    if (errors.size > 0) { showErrors(form, errors); return; }

    const lead = {
      name:    form.querySelector('#gate-name').value.trim(),
      company: form.querySelector('#gate-company').value.trim(),
      email:   form.querySelector('#gate-email').value.trim(),
    };
    saveLead(lead);

    const cert = CERTS[pendingCertId];
    dialog.close();

    if (cert.fileUrl) {
      notifyLead(lead, cert.title, false);
      triggerDownload(cert.fileUrl);
    } else {
      notifyLead(lead, cert.title, true);
      showToast("Request sent! We'll email your certificate to " + lead.email + " shortly.");
    }

    pendingCertId = null;
  });

  // Wire up all cert download buttons
  document.querySelectorAll('[data-cert-id]').forEach(btn => {
    btn.addEventListener('click', () => openGate(btn.dataset.certId));
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCertGate);
  } else {
    initCertGate();
  }
}
