/**
 * SafariQuest — Page Protection
 * Checks auth state and redirects if needed.
 *
 * FIX: admin.html's requiresAdmin check is intentionally SKIPPED here because
 * role is stored in the Supabase `profiles` table (DB) — not in
 * user_metadata — so it cannot be verified synchronously from localStorage.
 * admin.html performs its own async DB role check on DOMContentLoaded.
 */
(function () {
  'use strict';

  const PROTECTED = {
    'dashboard.html': { requiresAuth: true,  requiresAdmin: false },
    'saved.html':     { requiresAuth: true,  requiresAdmin: false },
    'bookings.html':  { requiresAuth: true,  requiresAdmin: false },
    'reviews.html':   { requiresAuth: true,  requiresAdmin: false },
    'profile.html':   { requiresAuth: true,  requiresAdmin: false },
    // requiresAdmin is false here — async DB check in admin.html handles it
    'admin.html':     { requiresAuth: true,  requiresAdmin: false },
  };

  function currentPage() {
    const p = window.location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  function getSessionDirect() {
    try { return JSON.parse(localStorage.getItem('sq_session') || 'null'); }
    catch { return null; }
  }

  function isLoggedInDirect() {
    const s = getSessionDirect();
    return !!(s && s.access_token);
  }

  function redirectWithMsg(url, message) {
    sessionStorage.setItem('sq_redirect_message', JSON.stringify({ message, type: 'error' }));
    window.location.replace(url);
  }

  function check() {
    const config = PROTECTED[currentPage()];
    if (!config) return;

    const loggedIn = isLoggedInDirect();

    // Not logged in at all → send to the right login page
    if (config.requiresAuth && !loggedIn) {
      if (currentPage() === 'admin.html') {
        window.location.replace('admin-login.html');
        return;
      }
      redirectWithMsg('login.html', 'Please log in to continue.');
      return;
    }

    // requiresAdmin is intentionally not checked here — see header comment
  }

  // Runs synchronously before DOM paint — only reads localStorage
  check();

  window.PageProtection = { currentPage };
}());
