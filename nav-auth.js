/* ============================================================
   nav-auth.js — SafariQuest Shared Nav Auth UI
   Load on every public page AFTER auth.js and site-layout.js.

   What it does:
   - Waits for auth.js async bootstrap to complete
   - If user is logged in: hides Login/Sign Up buttons,
     shows the avatar/account menu instead.
   - If not logged in: leaves the buttons as-is.
   ============================================================ */

(function () {

  /**
   * Core update — fetch the live user from Supabase, then
   * hand it to auth.js's updateNavForUser().
   */
  async function updateNav() {
    if (!window.Auth) return;

    // fetchUser() validates the token with Supabase and returns
    // the real user object (or null). This is the async step that
    // was previously being skipped, causing the nav to always
    // show as logged-out.
    let user = null;
    try {
      if (typeof window.Auth.fetchUser === 'function') {
        user = await window.Auth.fetchUser();
      } else {
        user = window.Auth.getUser();
      }
    } catch (e) {
      user = window.Auth.getUser ? window.Auth.getUser() : null;
    }

    // updateNav() in auth.js re-reads getUser() from the session
    // that fetchUser() just refreshed, so calling it now is correct.
    if (typeof window.Auth.updateNav === 'function') {
      window.Auth.updateNav();
    }
  }

  /**
   * Wait for site-layout.js to inject the nav HTML into #sq-nav-root
   * before we try to manipulate it. site-layout.js sets
   * window.__SQ_LAYOUT_READY = true when done.
   */
  function waitForLayoutThenUpdate() {
    if (window.__SQ_LAYOUT_READY) {
      updateNav();
      return;
    }
    // Poll every 30ms — site-layout.js is synchronous so this
    // resolves almost immediately (usually 1–2 ticks).
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (window.__SQ_LAYOUT_READY || attempts > 100) {
        clearInterval(interval);
        updateNav();
      }
    }, 30);
  }

  // Kick off after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLayoutThenUpdate);
  } else {
    waitForLayoutThenUpdate();
  }

  // Also re-run on full load in case of slow connections / late CDN
  window.addEventListener('load', function () {
    // Small delay so auth.js's own DOMContentLoaded bootstrap
    // (which calls fetchUser internally) has had time to run first
    setTimeout(updateNav, 200);
  });

})();
