/**
 * admin.js — PHATRADE Admin Panel
 * Fixed: all DOM code wrapped in DOMContentLoaded
 */

const STORAGE_KEY = 'phatrade_cms';
const DEFAULT_PASSWORD = 'phatrade2024';
const PASSWORD_KEY = 'phatrade_admin_pw';

const DEFAULTS = {
  'hero-eyebrow': 'Where Nature Meets Global Trust',
  'hero-title-line1': "Egypt's Finest",
  'hero-title-line2': 'Aromatic Ingredients',
  'hero-tagline': 'Premium essential oils, concretes, and absolutes, grown and crafted in Egypt.',
  'hero-slogan-line1': 'Where Nature Meets',
  'hero-slogan-line2': 'Global Trust',
  'hero-cta1': 'Explore Products',
  'hero-cta2': 'Request a Sample',
  'badge1-num': '50',
  'badge1-label': 'Years of Excellence',
  'badge2-num': '5',
  'badge2-label': 'Continents Served',
  'about-heading': "Egypt's Leading Aromatic Ingredient Manufacturer",
  'about-body': "Founded in 1975, PHATRADE has grown from a spice and herb trading company into one of Egypt's most trusted producers of essential oils, concretes, and absolutes. Every ingredient we supply is cultivated on our own farm, extracted at our Sadat City facility, and GC-verified at our Obour City laboratory before it reaches you.",
  'company-slogan': 'Where Nature Meets Global Trust',
  'stat1-num': '50',
  'stat1-suffix': '+',
  'stat1-label': 'Years of Manufacturing Experience',
  'stat2-num': '27',
  'stat2-suffix': '',
  'stat2-label': 'Product Lines',
  'stat3-num': '5',
  'stat3-suffix': '',
  'stat3-label': 'Export Continents',
  'contact-email': 'info@phatrade-eg.com',
  'contact-phone1': '+2 02 4481 0158',
  'contact-phone2': '+2 02 4481 0159',
  'contact-address1': '3 Street 194, Western Extension, Industrial Zone, Obour City 11181, Cairo Governorate, Egypt',
  'contact-address2': 'Km 15, Sadat City, Kafr Dawood Road, Al-Beheira Governorate, Egypt',
  'contact-whatsapp': '20224810158',
  'social-linkedin': '#',
  'social-facebook': '#',
};

// Storage helpers
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function getPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

// Populate forms with saved data
function populateForms() {
  var data = loadData();
  Object.keys(DEFAULTS).forEach(function(key) {
    var el = document.getElementById(key);
    if (el) el.value = (data[key] !== undefined) ? data[key] : DEFAULTS[key];
  });

  // Hero bg preview
  if (data['hero-bg-image']) {
    var prev = document.getElementById('hero-bg-preview');
    var wrap = document.getElementById('hero-bg-preview-wrap');
    var dropzone = document.getElementById('hero-bg-dropzone');
    if (prev) prev.src = data['hero-bg-image'];
    if (wrap) wrap.hidden = false;
    if (dropzone) dropzone.hidden = true;
  }
}

// Show toast
function showToast(msg) {
  var toast = document.getElementById('admin-toast');
  var msgEl = document.getElementById('admin-toast-msg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.hidden = false;
  setTimeout(function() { toast.hidden = true; }, 4000);
}

// Save all
function saveAll() {
  var data = loadData();
  Object.keys(DEFAULTS).forEach(function(key) {
    var el = document.getElementById(key);
    if (el) data[key] = el.value;
  });
  saveData(data);
  showToast('Changes saved successfully. Refresh the site to see updates.');
}

// Everything that touches the DOM goes inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {

  var loginScreen = document.getElementById('login-screen');
  var dashboard   = document.getElementById('dashboard');
  var loginForm   = document.getElementById('login-form');
  var loginError  = document.getElementById('login-error');
  var logoutBtn   = document.getElementById('logout-btn');

  // Already logged in this session?
  if (sessionStorage.getItem('phatrade_admin_auth') === '1') {
    if (loginScreen) loginScreen.hidden = true;
    if (dashboard)   dashboard.hidden   = false;
    populateForms();
  }

  // Login submit
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var pw = document.getElementById('admin-password').value;
      if (pw === getPassword()) {
        sessionStorage.setItem('phatrade_admin_auth', '1');
        if (loginScreen) loginScreen.hidden = true;
        if (dashboard)   dashboard.hidden   = false;
        if (loginError)  loginError.hidden  = true;
        populateForms();
      } else {
        if (loginError) loginError.hidden = false;
        document.getElementById('admin-password').value = '';
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem('phatrade_admin_auth');
      if (dashboard)   dashboard.hidden   = true;
      if (loginScreen) loginScreen.hidden = false;
      var pwField = document.getElementById('admin-password');
      if (pwField) pwField.value = '';
    });
  }

  // Navigation
  var navItems    = document.querySelectorAll('.admin-nav__item');
  var sections    = document.querySelectorAll('.admin-section');
  var sectionTitle = document.getElementById('section-title');

  var sectionTitles = {
    'hero':         'Hero Section',
    'about':        'About & Company',
    'contact-info': 'Contact Info',
    'images':       'Images & Logo',
    'password':     'Change Password',
  };

  navItems.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-section');
      navItems.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      sections.forEach(function(s) { s.hidden = true; });
      var sec = document.getElementById('section-' + target);
      if (sec) sec.hidden = false;
      if (sectionTitle) sectionTitle.textContent = sectionTitles[target] || target;
      var toast = document.getElementById('admin-toast');
      if (toast) toast.hidden = true;
    });
  });

  // Save button
  var saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveAll);

  // Reset button
  var resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (!confirm('Reset this section to defaults? This cannot be undone.')) return;
      var data = loadData();
      var activeSection = document.querySelector('.admin-section:not([hidden])');
      if (activeSection) {
        activeSection.querySelectorAll('input, textarea').forEach(function(el) {
          if (el.id && DEFAULTS[el.id] !== undefined) {
            data[el.id] = DEFAULTS[el.id];
            el.value    = DEFAULTS[el.id];
          }
        });
      }
      saveData(data);
      showToast('Section reset to defaults.');
    });
  }

  // Hero background image upload
  var heroBgInput = document.getElementById('hero-bg-input');
  if (heroBgInput) {
    heroBgInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var dataUrl = ev.target.result;
        var data = loadData();
        data['hero-bg-image'] = dataUrl;
        saveData(data);
        var prev    = document.getElementById('hero-bg-preview');
        var wrap    = document.getElementById('hero-bg-preview-wrap');
        var dropzone = document.getElementById('hero-bg-dropzone');
        if (prev)     prev.src      = dataUrl;
        if (wrap)     wrap.hidden   = false;
        if (dropzone) dropzone.hidden = true;
        showToast('Hero image saved. Refresh the homepage to see it.');
      };
      reader.readAsDataURL(file);
    });
  }

  var heroBgRemove = document.getElementById('hero-bg-remove');
  if (heroBgRemove) {
    heroBgRemove.addEventListener('click', function() {
      var data = loadData();
      delete data['hero-bg-image'];
      saveData(data);
      var wrap    = document.getElementById('hero-bg-preview-wrap');
      var dropzone = document.getElementById('hero-bg-dropzone');
      if (wrap)     wrap.hidden    = true;
      if (dropzone) dropzone.hidden = false;
      showToast('Hero image removed.');
    });
  }

  // Change password
  var changePwBtn = document.getElementById('change-password-btn');
  if (changePwBtn) {
    changePwBtn.addEventListener('click', function() {
      var current  = document.getElementById('current-password').value;
      var newPw    = document.getElementById('new-password').value;
      var confirm  = document.getElementById('confirm-password').value;
      var errorEl  = document.getElementById('password-error');

      if (current !== getPassword()) {
        if (errorEl) { errorEl.textContent = 'Current password is incorrect.'; errorEl.hidden = false; }
        return;
      }
      if (newPw.length < 6) {
        if (errorEl) { errorEl.textContent = 'New password must be at least 6 characters.'; errorEl.hidden = false; }
        return;
      }
      if (newPw !== confirm) {
        if (errorEl) { errorEl.textContent = 'Passwords do not match.'; errorEl.hidden = false; }
        return;
      }

      localStorage.setItem(PASSWORD_KEY, newPw);
      if (errorEl) errorEl.hidden = true;
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value     = '';
      document.getElementById('confirm-password').value = '';
      showToast('Password updated successfully.');
    });
  }

}); // end DOMContentLoaded
