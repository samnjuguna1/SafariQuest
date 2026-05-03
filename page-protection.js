/**
 * SafariQuest — Page Protection
 * Checks auth state and redirects if needed.
 * Uses a reliable approach: checks localStorage session directly (synchronous),
 * so it works even before auth.js async fetchUser() completes.
 */
(function () {
  'use strict';

  const ADMIN_EMAIL = 'adminsafariquest@gmail.com';

  const PROTECTED = {
    'dashboard.html': { requiresAuth: true,  requiresAdmin: false },
    'saved.html':     { requiresAuth: true,  requiresAdmin: false },
    'bookings.html':  { requiresAuth: true,  requiresAdmin: false },
    'reviews.html':   { requiresAuth: true,  requiresAdmin: false },
    'profile.html':   { requiresAuth: true,  requiresAdmin: false },
    'admin.html':     { requiresAuth: true,  requiresAdmin: true  },
  };

  function currentPage() {
    const p = window.location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  // Read session directly from localStorage — synchronous, no dependency on SQ
  function getSessionDirect() {
    try { return JSON.parse(localStorage.getItem('sq_session') || 'null'); }
    catch { return null; }
  }

  function isLoggedInDirect() {
    const s = getSessionDirect();
    return !!(s && s.access_token);
  }

  function getUserDirect() {
    const s = getSessionDirect();
    return s ? s.user : null;
  }

  function isAdmin(user) {
    return !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL);
  }

  function redirectWithMsg(url, message) {
    sessionStorage.setItem('sq_redirect_message', JSON.stringify({ message, type: 'error' }));
    window.location.replace(url);
  }

  function check() {
    const config = PROTECTED[currentPage()];
    if (!config) return;

    const loggedIn = isLoggedInDirect();
    const user     = getUserDirect();

    if (config.requiresAuth && !loggedIn) {
      redirectWithMsg('login.html', 'Please log in to continue.');
      return;
    }

    if (config.requiresAdmin && !isAdmin(user)) {
      redirectWithMsg(
        loggedIn ? 'dashboard.html' : 'login.html',
        loggedIn ? 'Access denied. Admins only.' : 'Please log in to continue.'
      );
    }
  }

  // Run immediately — no need to wait for DOMContentLoaded since we only
  // read localStorage (synchronous). This prevents any flash of content.
  check();

  window.PageProtection = {
    isAdmin: () => isAdmin(getUserDirect()),
    currentPage,
  };
}());
