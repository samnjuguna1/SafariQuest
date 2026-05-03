/**
 * SafariQuest — auth.js
 * Supabase-backed authentication & session management.
 * Include this script on EVERY page of the site.
 *
 * Usage:
 *   <script src="/js/auth.js"></script>
 *
 * The script auto-runs on DOMContentLoaded and:
 *  1. Refreshes the Supabase session from the URL hash (OAuth callback).
 *  2. Reads the current session.
 *  3. Updates the nav (login/signup ↔ avatar menu).
 *  4. Wires up any logout buttons.
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://cbyipmrozqsntojiartw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlwbXJvenFzbnRvamlhcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTkxNTQsImV4cCI6MjA4ODk3NTE1NH0.31TAhmUCV_Uh0W8FGnR2_TLCZDU4YBM1U5LMSMc5JZs';
/** Exposed for dashboard realtime (supabase-js) — same project as SQ helpers */
window.SQ_PUBLIC = { url: SUPABASE_URL, anon: SUPABASE_ANON };
const DEV_USERS_KEY = 'sq_dev_users';
const DEV_BYPASS_FLAG_KEY = 'sq_enable_dev_auth_bypass';
const AUTH_DEBUG_FLAG_KEY = 'sq_auth_debug';
const DEV_AUTH_BYPASS =
  localStorage.getItem(DEV_BYPASS_FLAG_KEY) === '1' ||
  window.location.protocol === 'file:' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';
const AUTH_DEBUG = localStorage.getItem(AUTH_DEBUG_FLAG_KEY) === '1';

// ─── SUPABASE HELPER ─────────────────────────────────────────────────────────
const SQ = (() => {
  function debugLog(label, payload) {
    if (!AUTH_DEBUG) return;
    try {
      console.log(`[AUTH DEBUG] ${label}`, payload);
    } catch (_) {}
  }

  // ── Session storage ────────────────────────────────────────────────────────

  function saveSession(session) {
    if (!session) { localStorage.removeItem('sq_session'); return; }
    localStorage.setItem('sq_session', JSON.stringify(session));
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('sq_session')); }
    catch { return null; }
  }

  function getAccessToken() {
    return getSession()?.access_token || null;
  }

  function getUser() {
    return getSession()?.user || null;
  }

  function isLoggedIn() {
    return !!getAccessToken();
  }

  function getDevUsers() {
    try { return JSON.parse(localStorage.getItem(DEV_USERS_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveDevUser(email, password, meta = {}) {
    const users = getDevUsers();
    users[email.toLowerCase()] = {
      password,
      full_name: meta.full_name || '',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));
  }

  function createDevSession(email, meta = {}) {
    const fullName = meta.full_name || email.split('@')[0];
    const session = {
      access_token: 'dev_' + Date.now(),
      refresh_token: 'dev_refresh',
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
      user: {
        id: 'dev_' + email.toLowerCase(),
        email: email.toLowerCase(),
        user_metadata: { full_name: fullName }
      },
      is_dev_auth: true
    };
    saveSession(session);
    return session;
  }

  // ── OAuth hash handling ────────────────────────────────────────────────────

  function handleHashSession() {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) return false;

    const params  = new URLSearchParams(hash.slice(1));
    const session = {
      access_token:  params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      expires_at:    Date.now() + Number(params.get('expires_in') || 3600) * 1000,
      user: null,
    };
    saveSession(session);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return true;
  }

  // ── Remote user fetch ──────────────────────────────────────────────────────

  async function fetchUser() {
    const token = getAccessToken();
    if (!token) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey':        SUPABASE_ANON,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) { saveSession(null); return null; }
      const user    = await res.json();
      debugLog('fetchUser ok', {
        status: res.status,
        id: user?.id,
        email: user?.email,
        email_confirmed_at: user?.email_confirmed_at || null
      });
      const session = getSession();
      if (session) { session.user = user; saveSession(session); }
      await ensureProfile(user, token).catch(() => {});
      return user;
    } catch (err) {
      debugLog('fetchUser failed', { message: err?.message || String(err) });
      return null;
    }
  }

  // ── Sign In ────────────────────────────────────────────────────────────────

  async function signInWithEmail(email, password) {
    debugLog('signIn start', { email, dev_bypass_enabled: DEV_AUTH_BYPASS });
    
    // Check for hardcoded admin credentials first
    if (email.toLowerCase() === 'adminsafariquest@gmail.com' && password === 'admin123') {
      const adminSession = {
        access_token: 'admin_' + Date.now(),
        refresh_token: 'admin_refresh',
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
        user: {
          id: 'admin_safariquest',
          email: 'adminsafariquest@gmail.com',
          user_metadata: { 
            full_name: 'SafariQuest Admin',
            role: 'admin'
          }
        },
        is_admin: true
      };
      saveSession(adminSession);
      debugLog('admin login successful', { email });
      return adminSession;
    }
    
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method:  'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    debugLog('signIn response', {
      status: res.status,
      ok: res.ok,
      error: data?.error || null,
      error_description: data?.error_description || null,
      has_access_token: !!data?.access_token,
      user_id: data?.user?.id || null
    });
    if (!res.ok) {
      if (DEV_AUTH_BYPASS) {
        const users = getDevUsers();
        const devUser = users[email.toLowerCase()];
        if (devUser && devUser.password === password) {
          createDevSession(email, { full_name: devUser.full_name });
          debugLog('signIn dev bypass used', { email });
          return { user: getUser(), access_token: getAccessToken(), dev_bypass: true };
        }
      }
      throw new Error(data.error_description || data.msg || 'Login failed');
    }
    saveSession(data);
    await ensureProfile(data.user, data.access_token).catch(() => {});
    return data;
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────
  /**
   * Registers a new user via Supabase Auth, then writes a matching row into
   * the `profiles` table so credentials/metadata are stored in the DB.
   *
   * Supabase Auth already stores email + hashed password automatically;
   * the profiles upsert adds full_name and any extra metadata you want to
   * persist server-side.
   */
  async function signUp(email, password, meta = {}) {
    debugLog('signUp start', { email, dev_bypass_enabled: DEV_AUTH_BYPASS, meta });
    // 1. Create the auth account
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method:  'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, data: meta }),
    });
    const data = await res.json();
    debugLog('signUp response', {
      status: res.status,
      ok: res.ok,
      error: data?.error || null,
      error_description: data?.error_description || null,
      has_access_token: !!data?.access_token,
      user_id: data?.user?.id || null,
      email_confirmed_at: data?.user?.email_confirmed_at || null
    });

    if (!res.ok) {
      if (DEV_AUTH_BYPASS) {
        saveDevUser(email, password, meta);
        createDevSession(email, meta);
        debugLog('signUp dev bypass used', { email });
        return { user: getUser(), access_token: getAccessToken(), dev_bypass: true };
      }
      throw new Error(data.error_description || data.msg || 'Sign-up failed');
    }

    // 2. Persist session if Supabase returned one immediately
    //    (happens when "Confirm email" is disabled in your project settings)
    if (data.access_token) {
      saveSession(data);

      // 3. Write profile row to `profiles` table
      //    Uses the access token so RLS policies can identify the user.
      try {
        await upsertProfile({
          id:         data.user?.id,
          email:      email,
          full_name:  meta.full_name || '',
          created_at: new Date().toISOString(),
        }, data.access_token);
        debugLog('profile upsert ok', { id: data.user?.id, email });
      } catch (profileErr) {
        // Non-fatal — auth succeeded even if profile write fails
        console.warn('SafariQuest: profile upsert failed', profileErr);
        debugLog('profile upsert failed', { message: profileErr?.message || String(profileErr) });
      }
    } else if (DEV_AUTH_BYPASS) {
      // Local dev shortcut when Supabase requires email confirmation.
      saveDevUser(email, password, meta);
      createDevSession(email, meta);
      debugLog('signUp no token; dev bypass session created', { email });
    }

    return data;
  }

  // ── Profile upsert ────────────────────────────────────────────────────────
  /**
   * Writes (or updates) a row in the public.profiles table.
   * Your Supabase table should have at minimum: id (uuid), email, full_name.
   *
   * Make sure you have an RLS policy that allows:
   *   INSERT / UPDATE for authenticated users WHERE id = auth.uid()
   */
  async function upsertProfile(profile, accessToken) {
    if (!profile.id) return; // no-op if no user id
    const token = accessToken || getAccessToken();
    if (!token) return;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method:  'POST',
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        'Prefer':        'resolution=merge-duplicates', // upsert behaviour
      },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      debugLog('upsertProfile response failed', { status: res.status, err });
      throw new Error(err.message || 'Profile write failed');
    }
    debugLog('upsertProfile response ok', { status: res.status, id: profile?.id, email: profile?.email });
  }

  // ── Profile read / sync helpers ───────────────────────────────────────────
  async function fetchProfileById(userId, accessToken) {
    if (!userId) return null;
    const token = accessToken || getAccessToken();
    if (!token) return null;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return null;
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function ensureProfile(user, accessToken) {
    if (!user?.id) return null;

    const existing = await fetchProfileById(user.id, accessToken);
    if (existing) return existing;

    const fallbackName =
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Traveller';

    await upsertProfile({
      id: user.id,
      email: user.email || '',
      full_name: fallbackName,
      created_at: user.created_at || new Date().toISOString(),
    }, accessToken);

    return fetchProfileById(user.id, accessToken);
  }

  async function getProfile() {
    const user = getUser();
    if (!user?.id) return null;
    return fetchProfileById(user.id, getAccessToken());
  }

  // ── Dashboard: bookings / recommended / saved (PostgREST + user JWT) ───────

  function authRestHeaders(optionalToken) {
    const token = optionalToken || getAccessToken();
    if (!token) return null;
    return {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
  }

  async function listUserBookings() {
    const h = authRestHeaders();
    if (!h) return [];
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_bookings?order=check_in.desc`,
      { headers: h }
    );
    if (!res.ok) {
      debugLog('listUserBookings failed', { status: res.status });
      return [];
    }
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  }

  async function getUserBookingById(id) {
    if (!id) return null;
    const h = authRestHeaders();
    if (!h) return null;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_bookings?id=eq.${encodeURIComponent(id)}&select=*`,
      { headers: h }
    );
    if (!res.ok) return null;
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function createUserBooking(row) {
    const h = authRestHeaders();
    if (!h) throw new Error('Not signed in');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_bookings`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      debugLog('createUserBooking failed', { status: res.status, err });
      throw new Error(err.message || err.hint || 'Could not create booking');
    }
    const data = await res.json().catch(() => null);
    return Array.isArray(data) ? data[0] : data;
  }

  async function updateUserBooking(id, patch) {
    if (!id) throw new Error('Missing booking id');
    const h = authRestHeaders();
    if (!h) throw new Error('Not signed in');
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_bookings?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify(patch),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      debugLog('updateUserBooking failed', { status: res.status, err });
      throw new Error(err.message || 'Could not update booking');
    }
    const data = await res.json().catch(() => null);
    return Array.isArray(data) ? data[0] : data;
  }

  async function listRecommendedDestinations() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/recommended_destinations?active=eq.true&order=sort_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) {
      debugLog('listRecommendedDestinations failed', { status: res.status });
      return [];
    }
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  }

  async function listUserSavedDestinations(limit) {
    const lim = typeof limit === 'number' ? limit : 5;
    const h = authRestHeaders();
    if (!h) return [];
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_saved_destinations?order=created_at.desc&limit=${lim}`,
      { headers: h }
    );
    if (!res.ok) {
      debugLog('listUserSavedDestinations failed', { status: res.status });
      return [];
    }
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  }

  async function insertUserSavedDestination(row) {
    const h = authRestHeaders();
    if (!h) throw new Error('Not signed in');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_saved_destinations`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) return null;
      throw new Error(err.message || 'Could not save destination');
    }
    const data = await res.json().catch(() => null);
    return Array.isArray(data) ? data[0] : data;
  }

  async function deleteUserSavedDestination(id) {
    if (!id) throw new Error('Missing id');
    const h = authRestHeaders();
    if (!h) throw new Error('Not signed in');
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_saved_destinations?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE', headers: { ...h, Prefer: 'return=minimal' } }
    );
    if (!res.ok) throw new Error('Could not remove saved item');
  }

  async function deleteUserSavedBySlug(slug) {
    if (!slug) throw new Error('Missing slug');
    const h = authRestHeaders();
    if (!h) throw new Error('Not signed in');
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_saved_destinations?attraction_slug=eq.${encodeURIComponent(slug)}`,
      { method: 'DELETE', headers: { ...h, Prefer: 'return=minimal' } }
    );
    if (!res.ok && res.status !== 204) throw new Error('Could not remove saved item');
  }

  // ── Sign Out ───────────────────────────────────────────────────────────────

  async function signOut() {
    const token = getAccessToken();
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method:  'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    saveSession(null);
  }

  // ── OAuth (Google / Facebook) ─────────────────────────────────────────────
  /**
   * Redirects to Supabase's OAuth flow.
   * provider: 'google' | 'facebook'
   * Redirect returns to the current page (login or register); add both URLs in
   * Supabase → Authentication → URL Configuration → Redirect URLs.
   */
  function signInWithOAuth(provider) {
    const baseUrl = window.location.href.replace(/#.*$/, '');
    const redirectTo = encodeURIComponent(baseUrl);
    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${redirectTo}`;
  }

  return {
    setSession: saveSession,
    saveSession,
    getSession,
    getAccessToken,
    getUser,
    isLoggedIn,
    handleHashSession,
    fetchUser,
    signInWithEmail,
    signUp,
    upsertProfile,
    getProfile,
    listUserBookings,
    getUserBookingById,
    createUserBooking,
    updateUserBooking,
    listRecommendedDestinations,
    listUserSavedDestinations,
    insertUserSavedDestination,
    deleteUserSavedDestination,
    deleteUserSavedBySlug,
    signOut,
    signInWithOAuth,
    _debug: {
      enabled: AUTH_DEBUG,
      devBypassEnabled: DEV_AUTH_BYPASS,
      getSessionSnapshot: () => getSession()
    }
  };
})();


// ─── INTENT STORAGE ──────────────────────────────────────────────────────────
const PendingIntent = {
  save(intent) {
    sessionStorage.setItem('sq_pending_intent', JSON.stringify(intent));
  },
  get() {
    try { return JSON.parse(sessionStorage.getItem('sq_pending_intent')); }
    catch { return null; }
  },
  clear() {
    sessionStorage.removeItem('sq_pending_intent');
  },
};

const AvatarStore = {
  key: 'sq_profile_avatars',
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}'); }
    catch { return {}; }
  },
  get(email) {
    if (!email) return '';
    return this.getAll()[email.toLowerCase()] || '';
  },
  set(email, dataUrl) {
    if (!email) return;
    const all = this.getAll();
    all[email.toLowerCase()] = dataUrl;
    localStorage.setItem(this.key, JSON.stringify(all));
  }
};


// ─── NAV UPDATE ──────────────────────────────────────────────────────────────
function updateNavForUser(user) {
  const path = window.location.pathname.toLowerCase();
  const isAuthPage = path.endsWith('/login.html') || path.endsWith('/register.html') || path.endsWith('login.html') || path.endsWith('register.html');
  const isProfilePage = path.endsWith('/profile.html') || path.endsWith('profile.html');
  
  if (isAuthPage) return;

  document.querySelectorAll('.sq-avatar-menu').forEach(node => node.remove());

  // Find login/register buttons by class (preferred) or by text content
  const loginBtn =
    document.querySelector('.nav-login, a[href*="login.html"].btn-plan, a[href*="login.html"].btn-solid, .btn-nav-outline') ||
    document.querySelector('a[href*="login.html"], button[onclick*="login.html"]') ||
    Array.from(document.querySelectorAll('button,a')).find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      return t === 'sign in' || t === 'login' || t === 'log in';
    });
  const registerBtn =
    document.querySelector('.nav-register, a[href*="register.html"].btn-solid') ||
    document.querySelector('a[href*="register.html"], button[onclick*="register.html"]') ||
    Array.from(document.querySelectorAll('button,a')).find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      return t.includes('sign up') || t.includes('register');
    });

  // Hide login/signup buttons on profile page
  if (isProfilePage) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
  }

  if (!loginBtn && !registerBtn) return;

  if (user) {
    const displayName = getDisplayName(user);
    const avatarUrl   = getAvatarUrl(user);
    const initials   = getInitials(user);
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
        <li><button id="sq-upload-avatar-btn" type="button" role="menuitem">📷 Upload Photo</button></li>
        <li class="sq-divider"></li>
        <li><button id="sq-logout-btn" role="menuitem">🚪 Logout</button></li>
      </ul>`;

    const parent = loginBtn?.parentNode || registerBtn?.parentNode;
    loginBtn?.remove();
    registerBtn?.remove();
    parent?.appendChild(avatarMenu);

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

    document.getElementById('sq-logout-btn')?.addEventListener('click', async () => {
      await SQ.signOut();
      window.location.href = 'index.html';
    });

    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'image/*';
    uploadInput.style.display = 'none';
    avatarMenu.appendChild(uploadInput);

    document.getElementById('sq-upload-avatar-btn')?.addEventListener('click', () => {
      uploadInput.click();
    });

    uploadInput.addEventListener('change', async () => {
      const file = uploadInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result || '');
        AvatarStore.set(user.email, dataUrl);
        if (user.user_metadata) user.user_metadata.avatar_url = dataUrl;
        const session = SQ.getSession();
        if (session?.user) {
          session.user.user_metadata = session.user.user_metadata || {};
          session.user.user_metadata.avatar_url = dataUrl;
          SQ.saveSession(session);
        }
        try {
          await SQ.upsertProfile({
            id: session?.user?.id,
            email: user.email,
            full_name: displayName,
            avatar_url: dataUrl
          }, SQ.getAccessToken());
        } catch (_) {}
        updateNavForUser(session?.user || user);
      };
      reader.readAsDataURL(file);
    });

  } else {
    loginBtn?.style.removeProperty('display');
    registerBtn?.style.removeProperty('display');
  }
}

function getInitials(user) {
  const name = getDisplayName(user);
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
}

function getAvatarUrl(user) {
  return user?.user_metadata?.avatar_url || AvatarStore.get(user?.email) || '';
}


// ─── AUTH GATE ────────────────────────────────────────────────────────────────
function requireAuth(intent, proceedFn) {
  const user = SQ.getUser();
  if (user) { proceedFn(user); return; }

  PendingIntent.save({ returnUrl: window.location.href, ...intent });

  const modal = document.getElementById('sq-login-modal');
  if (modal) {
    modal.classList.add('sq-modal-open');
    modal.querySelector('[data-close]')?.addEventListener('click', () => {
      modal.classList.remove('sq-modal-open');
    });
  } else {
    window.location.href = 'login.html';
  }
}

async function resumePendingIntent() {
  const intent = PendingIntent.get();
  PendingIntent.clear();

  if (!intent?.returnUrl) { window.location.href = 'dashboard.html'; return; }

  const url = new URL(intent.returnUrl);
  if (intent.data) {
    url.searchParams.set('sq_resume', btoa(JSON.stringify(intent.data)));
    url.searchParams.set('sq_action', intent.action || 'book');
  }
  window.location.href = url.toString();
}

function handlePostLoginRedirect(defaultUrl = 'dashboard.html') {
  const intent = PendingIntent.get();
  PendingIntent.clear();

  if (!intent?.returnUrl) {
    window.location.href = defaultUrl;
    return;
  }

  const url = new URL(intent.returnUrl, window.location.origin);
  if (intent.data) {
    url.searchParams.set('sq_resume', btoa(JSON.stringify(intent.data)));
    url.searchParams.set('sq_action', intent.action || 'book');
  }
  window.location.href = url.toString();
}

function readResumedData() {
  const params = new URLSearchParams(window.location.search);
  const raw    = params.get('sq_resume');
  const action = params.get('sq_action');
  if (!raw) return null;

  params.delete('sq_resume');
  params.delete('sq_action');
  const clean = params.toString();
  history.replaceState(null, '', window.location.pathname + (clean ? '?' + clean : ''));

  try { return { action, data: JSON.parse(atob(raw)) }; }
  catch { return null; }
}

function ensureAuthStyles() {
  const hasStyles = !!document.querySelector('link[href*="auth-ui.css"]');
  if (hasStyles) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'auth-ui.css';
  document.head.appendChild(link);
}


// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  ensureAuthStyles();
  const fromHash = SQ.handleHashSession();

  let user = SQ.getUser();
  if (!user || fromHash) {
    user = await SQ.fetchUser();
  }

  updateNavForUser(user);

  if (fromHash && user) {
    await resumePendingIntent();
  }

  // ── Show any redirect messages (from page-protection.js) ──
  const stored = sessionStorage.getItem('sq_redirect_message');
  if (stored) {
    try {
      const { message, type } = JSON.parse(stored);
      sessionStorage.removeItem('sq_redirect_message');
      // Small delay so the page renders first
      setTimeout(() => {
        const toast = document.createElement('div');
        toast.className = `sq-toast sq-${type || 'error'} sq-show`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.remove('sq-show');
          setTimeout(() => toast.remove(), 300);
        }, 3500);
      }, 400);
    } catch (_) {}
  }
});


// ─── PUBLIC API ───────────────────────────────────────────────────────────────
window.SQ                  = SQ;
window.Auth                = {
  ...SQ,
  requireAuth,
  resumePendingIntent,
  handlePostLoginRedirect,
  readResumedData,
};
window.PendingIntent       = PendingIntent;
window.requireAuth         = requireAuth;
window.resumePendingIntent = resumePendingIntent;
window.readResumedData     = readResumedData;
window.AuthDebug = {
  enable() {
    localStorage.setItem(AUTH_DEBUG_FLAG_KEY, '1');
    console.log('[AUTH DEBUG] Enabled. Refresh page.');
  },
  disable() {
    localStorage.removeItem(AUTH_DEBUG_FLAG_KEY);
    console.log('[AUTH DEBUG] Disabled. Refresh page.');
  },
  status() {
    const session = SQ.getSession();
    const user = SQ.getUser();
    console.log('[AUTH DEBUG] status', {
      debug_enabled: localStorage.getItem(AUTH_DEBUG_FLAG_KEY) === '1',
      dev_bypass_enabled: DEV_AUTH_BYPASS,
      has_session: !!session,
      has_access_token: !!session?.access_token,
      is_dev_auth: !!session?.is_dev_auth,
      user_id: user?.id || null,
      email: user?.email || null,
      email_confirmed_at: user?.email_confirmed_at || null
    });
  }
};