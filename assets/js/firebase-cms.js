/**
 * firebase-cms.js
 * Shared Firebase Realtime Database helpers for PHATRADE website.
 * Loaded on every page (reads CMS data) and on admin.html (reads + writes).
 *
 * Database structure:
 *   /cms/data      → all site-content fields (same keys as localStorage phatrade_cms)
 *   /cms/products  → per-product overrides (same structure as phatrade_prod_overrides)
 */

(function () {
  /* ── Firebase config ──────────────────────────────────────────── */
  var FB_CONFIG = {
    apiKey:            'AIzaSyDHeUG3eJUwJuNlu14uR7MM9aUAqqmf3jk',
    authDomain:        'phatrade-website.firebaseapp.com',
    databaseURL:       'https://phatrade-website-default-rtdb.europe-west1.firebasedatabase.app',
    projectId:         'phatrade-website',
    storageBucket:     'phatrade-website.firebasestorage.app',
    messagingSenderId: '1035956708989',
    appId:             '1:1035956708989:web:4d8fc5b7f2d501ffeafaa4'
  };

  var LS_KEY      = 'phatrade_cms';
  var LS_PROD_KEY = 'phatrade_prod_overrides';
  var db          = null;

  /* ── Init ──────────────────────────────────────────────────────── */
  function init() {
    if (db) return db;
    if (typeof firebase === 'undefined') return null;
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(FB_CONFIG);
    }
    db = firebase.database();
    return db;
  }

  /* ── Helpers ───────────────────────────────────────────────────── */
  function lsGet(key)       { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { return {}; } }
  function lsSet(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {} }

  /* ── Public API ────────────────────────────────────────────────── */
  window.PHATRADE_FB = {

    /** Read CMS content from Firebase; falls back to localStorage. */
    readCMS: function (callback) {
      var database = init();
      if (!database) { callback(lsGet(LS_KEY)); return; }
      database.ref('cms/data').once('value')
        .then(function (snap) {
          var remote = snap.val() || {};
          lsSet(LS_KEY, remote);          // update local cache
          callback(remote);
        })
        .catch(function () { callback(lsGet(LS_KEY)); });
    },

    /** Write CMS content to Firebase AND localStorage. */
    saveCMS: function (data, callback) {
      lsSet(LS_KEY, data);               // instant local update
      var database = init();
      if (!database) { callback && callback(false, 'Firebase not loaded'); return; }
      database.ref('cms/data').set(data)
        .then(function ()      { callback && callback(true); })
        .catch(function (err)  { callback && callback(false, err.message); });
    },

    /** Read product overrides from Firebase; falls back to localStorage. */
    readProducts: function (callback) {
      var database = init();
      if (!database) { callback(lsGet(LS_PROD_KEY)); return; }
      database.ref('cms/products').once('value')
        .then(function (snap) {
          var remote = snap.val() || {};
          lsSet(LS_PROD_KEY, remote);
          callback(remote);
        })
        .catch(function () { callback(lsGet(LS_PROD_KEY)); });
    },

    /** Write product overrides to Firebase AND localStorage. */
    saveProducts: function (data, callback) {
      lsSet(LS_PROD_KEY, data);
      var database = init();
      if (!database) { callback && callback(false, 'Firebase not loaded'); return; }
      database.ref('cms/products').set(data)
        .then(function ()      { callback && callback(true); })
        .catch(function (err)  { callback && callback(false, err.message); });
    },

    /** Listen for real-time CMS changes (used on site pages for instant updates). */
    onCMSChange: function (callback) {
      var database = init();
      if (!database) return;
      database.ref('cms/data').on('value', function (snap) {
        var data = snap.val() || {};
        lsSet(LS_KEY, data);
        callback(data);
      });
    },

    /** Listen for real-time product override changes. */
    onProductsChange: function (callback) {
      var database = init();
      if (!database) return;
      database.ref('cms/products').on('value', function (snap) {
        var data = snap.val() || {};
        lsSet(LS_PROD_KEY, data);
        callback(data);
      });
    }
  };
})();
