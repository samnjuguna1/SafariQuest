/* ============================================================
   nav-auth.js — SafariQuest Shared Nav Auth UI
   Load on every public page AFTER auth.js and site-layout.js.
   ============================================================ */

(function () {

  /**
   * Inject the avatar menu into .nav-actions directly.
   * We target the container rather than hunting for login/register
   * buttons that may have already been removed by a prior call.
   */
  async function updateNav() {
    if (!window.Auth) return;

    // Fetch the live user (validates token with Supabase)
    let user = null;
    try {
      user = typeof window.Auth.fetchUser === 'function'
        ? await window.Auth.fetchUser()
        : window.Auth.getUser?.();
    } catch (e) {
      user = window.Auth.getUser?.() || null;
    }

    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // Remove any existing avatar menu so we don't double-inject
    navActions.querySelectorAll('.sq-avatar-menu').forEach(el => el.remove());

    if (!user) {
      // Not logged in — make sure Login/Sign Up are visible
      let loginBtn = navActions.querySelector('.nav-login');
      let registerBtn = navActions.querySelector('.nav-register');

      // Re-inject buttons if they were removed by a prior stale call
      if (!loginBtn) {
        loginBtn = document.createElement('a');
        loginBtn.href = 'login.html';
        loginBtn.className = 'btn-nav-outline nav-login';
        loginBtn.textContent = 'Login';
        navActions.insertBefore(loginBtn, navActions.firstChild);
      }
      if (!registerBtn) {
        registerBtn = document.createElement('a');
        registerBtn.href = 'register.html';
        registerBtn.className = 'btn-solid nav-register';
        registerBtn.textContent = 'Sign Up';
        navActions.appendChild(registerBtn);
      }
      loginBtn.style.display = '';
      registerBtn.style.display = '';
      return;
    }

    // Logged in — remove login/register buttons
    navActions.querySelector('.nav-login')?.remove();
    navActions.querySelector('.nav-register')?.remove();

    // Build avatar info
    const displayName = user.user_metadata?.full_name
      || user.name
      || user.email?.split('@')[0]
      || 'User';

    const initials = displayName.split(/\s+/)
      .map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

    const avatarUrl = user.user_metadata?.avatar_url || '';

    // Build avatar menu element
    const avatarMenu = document.createElement('div');
    avatarMenu.className = 'sq-avatar-menu';
    avatarMenu.innerHTML = `
      <button class="sq-avatar-btn" aria-label="My account" aria-expanded="false">
        <span class="sq-avatar-initials sq-avatar-wrap" title="${displayName}">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="${displayName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : `<span>${initials}</span>`
          }
        </span>
        <span class="sq-avatar-name">My Account</span>
        <svg class="sq-chevron" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>
      <ul class="sq-avatar-dropdown" role="menu">
        <li style="padding:8px 16px;font-size:.83rem;color:#6b7280;border-bottom:1px solid #e5e7eb;margin-bottom:4px;">
          <div style="font-weight:600;color:#1c1c1c;margin-bottom:2px;">${displayName}</div>
          <div style="font-size:0.75rem;">${user.email || ''}</div>
        </li>
        <li><a href="dashboard.html" role="menuitem">📊 My Dashboard</a></li>
        <li><a href="bookings.html" role="menuitem">✈️ My Bookings</a></li>
        <li><a href="saved.html" role="menuitem">❤️ Saved Places</a></li>
        <li><a href="reviews.html" role="menuitem">★ My Reviews</a></li>
        <li><a href="profile.html" role="menuitem">👤 Profile</a></li>
        <li class="sq-divider"></li>
        <li><button id="sq-logout-btn" role="menuitem">🚪 Logout</button></li>
      </ul>`;

    navActions.appendChild(avatarMenu);

    // Dropdown toggle
    const btn      = avatarMenu.querySelector('.sq-avatar-btn');
    const dropdown = avatarMenu.querySelector('.sq-avatar-dropdown');

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      dropdown.classList.toggle('sq-open', !open);
    });

    document.addEventListener('click', e => {
      if (!avatarMenu.contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('sq-open');
      }
    });

    avatarMenu.querySelector('#sq-logout-btn')?.addEventListener('click', async () => {
      await window.Auth.signOut();
      window.location.href = 'index.html';
    });
  }

  // ── Wait for site-layout.js to inject the nav, then run ──────────────────
  function waitForLayoutThenUpdate() {
    if (window.__SQ_LAYOUT_READY) {
      updateNav();
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.__SQ_LAYOUT_READY || attempts > 100) {
        clearInterval(interval);
        updateNav();
      }
    }, 30);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLayoutThenUpdate);
  } else {
    waitForLayoutThenUpdate();
  }

})();
