/**
 * Staff sign-in: email/password are sent to Supabase Auth only (Auth.signInWithEmail).
 * No passwords or allow-lists are stored in this file — identities live in your Supabase project.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (window.Auth && typeof Auth.isLoggedIn === 'function' && Auth.isLoggedIn()) {
    window.location.href = 'admin.html';
    return;
  }

  var form = document.getElementById('adminLoginForm');
  var emailInput = document.getElementById('email');
  var pwInput = document.getElementById('password');
  var emailError = document.getElementById('emailError');
  var pwError = document.getElementById('passwordError');
  var togglePwBtn = document.getElementById('togglePw');
  var loginBtn = document.getElementById('loginBtn');
  var btnText = loginBtn ? loginBtn.querySelector('.btn-text') : null;
  var btnSpinner = document.getElementById('btnSpinner');

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function showFieldError(inputEl, errorEl, msg) {
    if (!inputEl || !errorEl) return;
    var wrap = inputEl.closest('.input-wrap');
    if (wrap) wrap.classList.add('error');
    errorEl.textContent = msg;
  }

  function clearFieldError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    var wrap = inputEl.closest('.input-wrap');
    if (wrap) wrap.classList.remove('error');
    errorEl.textContent = '';
  }

  if (emailInput) emailInput.addEventListener('input', function () { clearFieldError(emailInput, emailError); });
  if (pwInput) pwInput.addEventListener('input', function () { clearFieldError(pwInput, pwError); });

  if (togglePwBtn) {
    togglePwBtn.addEventListener('click', function () {
      var isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      var eyeOpen = togglePwBtn.querySelector('.eye-open');
      var eyeClosed = togglePwBtn.querySelector('.eye-closed');
      if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
  }

  function validateForm() {
    var ok = true;
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

  function showToast(message, type, duration) {
    duration = duration || 3000;
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { requestAnimationFrame(function () { toast.classList.add('show'); }); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 350);
    }, duration);
  }

  function setLoading(on) {
    if (!loginBtn) return;
    loginBtn.disabled = on;
    if (btnText) btnText.style.display = on ? 'none' : 'inline';
    if (btnSpinner) btnSpinner.style.display = on ? 'inline-flex' : 'none';
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);

      try {
        await Auth.signInWithEmail(emailInput.value.trim().toLowerCase(), pwInput.value);
        showToast('Signed in. Opening dashboard…', 'success');
        setTimeout(function () { window.location.href = 'admin.html'; }, 600);
      } catch (err) {
        console.error('Admin login error:', err);
        showToast(err.message || 'Sign-in failed. Please try again.', 'error', 4000);
        setLoading(false);
      }
    });
  }
});
