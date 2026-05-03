/* ============================================================
  TRAVEL PORTAL — login.js
  Uses shared Auth utility from auth.js.
  ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  function safeNextRedirect() {
    const raw = new URLSearchParams(window.location.search).get('next');
    if (!raw) return null;
    let u;
    try { u = decodeURIComponent(raw); } catch (_) { return null; }
    if (u.startsWith('http://') || u.startsWith('https://')) {
      try {
        const parsed = new URL(u);
        if (parsed.origin !== window.location.origin) return null;
        return parsed.pathname + parsed.search + parsed.hash;
      } catch (_) { return null; }
    }
    if (u.startsWith('/')) return u;
    if (/^[a-z0-9_.-]+\.html(\?|$)/i.test(u)) return u;
    return null;
  }

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const pwInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const pwError = document.getElementById('passwordError');
  const togglePwBtn = document.getElementById('togglePw');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn ? loginBtn.querySelector('.btn-text') : null;
  const btnSpinner = document.getElementById('btnSpinner');

  /* ── Redirect if already logged in ── */
  if (Auth.isLoggedIn()) {
    window.location.href = safeNextRedirect() || 'dashboard.html';
    return;
  }

  /* ── Password visibility toggle ── */
  if (togglePwBtn) {
    togglePwBtn.addEventListener('click', function () {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      const eyeOpen = togglePwBtn.querySelector('.eye-open');
      const eyeClosed = togglePwBtn.querySelector('.eye-closed');
      if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
  }

  /* ── Field validation helpers ── */
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function showFieldError(inputEl, errorEl, msg) {
    if (!inputEl || !errorEl) return;
    const wrap = inputEl.closest('.input-wrap');
    if (wrap) wrap.classList.add('error');
    errorEl.textContent = msg;
  }

  function clearFieldError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    const wrap = inputEl.closest('.input-wrap');
    if (wrap) wrap.classList.remove('error');
    errorEl.textContent = '';
  }

  if (emailInput) emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  if (pwInput) pwInput.addEventListener('input', () => clearFieldError(pwInput, pwError));

  function validateForm() {
    let ok = true;
    if (!emailInput.value.trim()) {
      showFieldError(emailInput, emailError, 'Email address is required.'); ok = false;
    } else if (!isValidEmail(emailInput.value)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address.'); ok = false;
    } else {
      clearFieldError(emailInput, emailError);
    }

    if (!pwInput.value) {
      showFieldError(pwInput, pwError, 'Password is required.'); ok = false;
    } else if (pwInput.value.length < 6) {
      showFieldError(pwInput, pwError, 'Password must be at least 6 characters.'); ok = false;
    } else {
      clearFieldError(pwInput, pwError);
    }
    return ok;
  }

  /* ── Toast notification ── */
  function showToast(message, type, duration) {
    duration = duration || 3000;
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  /* ── Button loading state ── */
  function setLoading(on) {
    if (!loginBtn) return;
    loginBtn.disabled = on;
    if (btnText) btnText.style.display = on ? 'none' : 'inline';
    if (btnSpinner) btnSpinner.style.display = on ? 'inline-flex' : 'none';
  }

  /* ── Form submit → Supabase sign in ── */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);

      try {
        await Auth.signInWithEmail(emailInput.value.trim().toLowerCase(), pwInput.value);
        const name =
          Auth.getUser()?.user_metadata?.full_name ||
          Auth.getUser()?.name ||
          Auth.getUser()?.email?.split('@')[0] ||
          'Traveller';
        showToast('Welcome back, ' + name + '! Redirecting...', 'success');
        const dest = safeNextRedirect() || 'dashboard.html';
        setTimeout(() => { window.location.href = dest; }, 1000);

      } catch (err) {
        console.error('Login error:', err);
        showToast(err.message || 'Something went wrong. Please try again.', 'error', 4000);
        setLoading(false);
      }
    });
  }

  /* ── Social login (Supabase OAuth) — same flow as register.html ── */
  function startOAuth(provider) {
    if (!window.Auth || typeof Auth.signInWithOAuth !== 'function') {
      showToast('Sign-in unavailable. Check that auth.js is loaded.', 'error', 4000);
      return;
    }
    Auth.signInWithOAuth(provider);
  }

  document.getElementById('loginGoogleBtn')?.addEventListener('click', function () {
    startOAuth('google');
  });
  document.getElementById('loginFacebookBtn')?.addEventListener('click', function () {
    startOAuth('facebook');
  });

  /* ── Forgot password ── */
  const forgotLink = document.querySelector('.forgot-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !isValidEmail(email)) {
        showToast('Enter your email above first, then click Forgot password.', 'error', 4000);
        emailInput.focus();
        return;
      }
      
      setLoading(true);
      try {
        // Check if email exists in public.profiles table
        const res = await fetch(`${window.SQ_PUBLIC.url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`, {
          headers: { 'apikey': window.SQ_PUBLIC.anon }
        });
        
        if (res.ok) {
          const rows = await res.json();
          if (!rows || rows.length === 0) {
            setLoading(false);
            showToast('Account not found in our database. Please check your email or register.', 'error', 4000);
            return;
          }
        }
      } catch (err) {
        console.warn('Network error during email check', err);
      }
      
      setLoading(false);
      setTimeout(() => { window.location.href = 'forgot-password.html'; }, 500);
    });
  }

  /* ── Sign up link ── */
  const signupLink = document.querySelector('.signup-link');
  if (signupLink) {
    signupLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'register.html';
    });
  }

});