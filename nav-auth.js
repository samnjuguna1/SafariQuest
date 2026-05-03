/* ============================================================
   nav-auth.js — SafariQuest Shared Nav Auth UI
   Add this file to your myProject/ root.
   Load it on every public page AFTER auth.js.

   What it does:
   - If user is logged in: hides Login/Sign Up buttons,
     shows a "Dashboard →" link and user avatar instead.
   - If not logged in: leaves the buttons as-is.

   Works with any of these nav auth container class names:
     .nav-cta        (restaurants.html)
     .nav-auth       (hotels.html)
     .nav-actions    (destinations.html)
   ============================================================ */

(function () {
  function updateNav() {
    if (!window.Auth) return;
    if (typeof Auth.updateNav === 'function') Auth.updateNav();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNav);
  } else {
    updateNav();
  }
  // Ensure nav updates after async auth user hydration.
  window.addEventListener('load', updateNav);
})();