/* ============================================
   Travel & Tourism Portal — Register Page JS
   ============================================ */

   'use strict';

   // ── DOM References ──────────────────────────────────────────────────────────
   
   const form       = document.getElementById('registerForm');
   const firstInput = document.getElementById('firstName');
   const lastInput  = document.getElementById('lastName');
   const emailInput = document.getElementById('email');
   const pw1Input   = document.getElementById('pw1');
   const pw2Input   = document.getElementById('pw2');
   const termsCheck = document.getElementById('terms');
   const submitBtn  = document.getElementById('submitBtn');
   
   const pw1ToggleBtn = document.getElementById('togglePw1');
   const pw2ToggleBtn = document.getElementById('togglePw2');
   
   const strengthBarFill = document.getElementById('strengthFill');
   const strengthBarWrap = document.getElementById('strengthBarWrapper');
   const strengthLabel   = document.getElementById('strengthLabel');
   
   // ── Utility: Show / Hide Error ──────────────────────────────────────────────
   
   function setError(input, message) {
     const fieldGrp = input.closest('.field-group');
     let errEl = fieldGrp.querySelector('.error-msg');
   
     input.classList.add('error');
     input.classList.remove('success');
   
     if (!errEl) {
       errEl = document.createElement('span');
       errEl.className = 'error-msg';
       fieldGrp.appendChild(errEl);
     }
   
     errEl.textContent = message;
     errEl.classList.add('visible');
   }
   
   function clearError(input) {
     const fieldGrp = input.closest('.field-group');
     const errEl    = fieldGrp ? fieldGrp.querySelector('.error-msg') : null;
   
     input.classList.remove('error');
     input.classList.add('success');
   
     if (errEl) {
       errEl.textContent = '';
       errEl.classList.remove('visible');
     }
   }
   
   function resetField(input) {
     input.classList.remove('error', 'success');
     const fieldGrp = input.closest('.field-group');
     const errEl    = fieldGrp ? fieldGrp.querySelector('.error-msg') : null;
     if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
   }
   
   // ── Utility: Toast ──────────────────────────────────────────────────────────
   
   function showToast(message, type = 'success') {
     const existing = document.querySelector('.toast');
     if (existing) existing.remove();
   
     const icons = { success: '✓', error: '✕' };
     const toast = document.createElement('div');
     toast.className = `toast ${type}`;
     toast.innerHTML = `<span>${icons[type] || '•'}</span> ${message}`;
     document.body.appendChild(toast);
   
     requestAnimationFrame(() => {
       requestAnimationFrame(() => toast.classList.add('show'));
     });
   
     setTimeout(() => {
       toast.classList.remove('show');
       setTimeout(() => toast.remove(), 400);
     }, 3500);
   }
   
   // ── Validation Helpers ──────────────────────────────────────────────────────
   
   function validateName(input, label) {
     const val = input.value.trim();
     if (!val) { setError(input, `${label} is required.`); return false; }
     if (val.length < 2) { setError(input, `${label} must be at least 2 characters.`); return false; }
     if (!/^[a-zA-Z\s'-]+$/.test(val)) { setError(input, `${label} contains invalid characters.`); return false; }
     clearError(input);
     return true;
   }
   
   function validateEmail(input) {
     const val        = input.value.trim();
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!val) { setError(input, 'Email address is required.'); return false; }
     if (!emailRegex.test(val)) { setError(input, 'Please enter a valid email address.'); return false; }
     clearError(input);
     return true;
   }
   
   function validatePassword(input) {
     const val = input.value;
     if (!val) { setError(input, 'Password is required.'); return false; }
     if (val.length < 8) { setError(input, 'Password must be at least 8 characters.'); return false; }
     clearError(input);
     return true;
   }
   
   function validateConfirmPassword() {
     const val1 = pw1Input.value;
     const val2 = pw2Input.value;
     if (!val2) { setError(pw2Input, 'Please confirm your password.'); return false; }
     if (val1 !== val2) { setError(pw2Input, 'Passwords do not match.'); return false; }
     clearError(pw2Input);
     return true;
   }
   
   function validateTerms() {
     if (!termsCheck.checked) {
       showToast('Please agree to the Terms of Service and Privacy Policy.', 'error');
       return false;
     }
     return true;
   }
   
   // ── Password Strength ───────────────────────────────────────────────────────
   
   function getPasswordStrength(password) {
     let score = 0;
     if (password.length >= 8)            score++;
     if (password.length >= 12)           score++;
     if (/[A-Z]/.test(password))          score++;
     if (/[0-9]/.test(password))          score++;
     if (/[^A-Za-z0-9]/.test(password))  score++;
     return score;
   }
   
   const strengthConfig = [
     { label: 'Too weak', color: '#e53e3e', width: '20%'  },
     { label: 'Weak',     color: '#dd6b20', width: '40%'  },
     { label: 'Fair',     color: '#d69e2e', width: '60%'  },
     { label: 'Good',     color: '#38a169', width: '80%'  },
     { label: 'Strong',   color: '#276749', width: '100%' },
   ];
   
   function updateStrengthBar(password) {
     if (!strengthBarWrap) return;
     if (!password) { strengthBarWrap.classList.remove('visible'); return; }
   
     strengthBarWrap.classList.add('visible');
     const score = Math.min(getPasswordStrength(password), 4);
     const cfg   = strengthConfig[score];
   
     if (strengthBarFill) {
       strengthBarFill.style.width      = cfg.width;
       strengthBarFill.style.background = cfg.color;
     }
     if (strengthLabel) {
       strengthLabel.textContent = cfg.label;
       strengthLabel.style.color = cfg.color;
     }
   }
   
   // ── Password Toggle ─────────────────────────────────────────────────────────
   
   function togglePasswordVisibility(inputEl, btnEl) {
     const isHidden = inputEl.type === 'password';
     inputEl.type   = isHidden ? 'text' : 'password';
   
     const eyeIcon = `
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>
       </svg>`;
   
     const eyeOffIcon = `
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`;
   
     btnEl.innerHTML   = isHidden ? eyeOffIcon : eyeIcon;
     btnEl.style.color = isHidden ? '#E8732A'  : '#bbb';
   }
   
   // ── Real-time Validation ────────────────────────────────────────────────────
   
   firstInput.addEventListener('blur', () => validateName(firstInput, 'First name'));
   lastInput.addEventListener('blur',  () => validateName(lastInput,  'Last name'));
   emailInput.addEventListener('blur', () => validateEmail(emailInput));
   
   pw1Input.addEventListener('input', () => {
     updateStrengthBar(pw1Input.value);
     if (pw1Input.classList.contains('error') || pw1Input.classList.contains('success')) {
       validatePassword(pw1Input);
     }
     if (pw2Input.value) validateConfirmPassword();
   });
   
   pw1Input.addEventListener('blur', () => validatePassword(pw1Input));
   pw2Input.addEventListener('blur', () => validateConfirmPassword());
   
   pw2Input.addEventListener('input', () => {
     if (pw2Input.classList.contains('error') || pw2Input.classList.contains('success')) {
       validateConfirmPassword();
     }
   });
   
   [firstInput, lastInput, emailInput, pw1Input, pw2Input].forEach(input => {
     input.addEventListener('focus', () => {
       if (!input.classList.contains('error') && !input.classList.contains('success')) {
         resetField(input);
       }
     });
   });
   
   // ── Password Toggle Buttons ─────────────────────────────────────────────────
   
   pw1ToggleBtn?.addEventListener('click', () => togglePasswordVisibility(pw1Input, pw1ToggleBtn));
   pw2ToggleBtn?.addEventListener('click', () => togglePasswordVisibility(pw2Input, pw2ToggleBtn));
   
   // ── Form Submission ─────────────────────────────────────────────────────────
   
   form.addEventListener('submit', async (e) => {
     e.preventDefault();
   
     const validFirst  = validateName(firstInput, 'First name');
     const validLast   = validateName(lastInput,  'Last name');
     const validEmail  = validateEmail(emailInput);
     const validPw     = validatePassword(pw1Input);
     const validConfPw = validateConfirmPassword();
     const validTerms  = validateTerms();
   
     if (!validFirst || !validLast || !validEmail || !validPw || !validConfPw || !validTerms) {
       const firstError = form.querySelector('.error');
       if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
       return;
     }
   
     submitBtn.classList.add('loading');
     submitBtn.disabled = true;
   
     try {
       // SQ.signUp registers the user in Supabase Auth AND writes a profiles row
       const data = await SQ.signUp(
         emailInput.value.trim().toLowerCase(),
         pw1Input.value,
         { full_name: `${firstInput.value.trim()} ${lastInput.value.trim()}` }
       );
   
       submitBtn.classList.remove('loading');
       submitBtn.disabled = false;
   
      // We want immediate login after registration.
      // If signup didn't return a token, try password sign-in right away.
      if (!data.access_token) {
        try {
          await SQ.signInWithEmail(
            emailInput.value.trim().toLowerCase(),
            pw1Input.value
          );
        } catch (_) {
          showToast(
            'Sign up succeeded, but instant login is blocked. Disable "Confirm email" in Supabase Auth settings for immediate access.',
            'error'
          );
          return;
        }
      }

      showToast('Account created! Welcome to SafariQuest 🌍', 'success');

      // Redirect after short delay so the user sees the toast
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
   
     } catch (err) {
       submitBtn.classList.remove('loading');
       submitBtn.disabled = false;
       showToast(err.message || 'Sign up failed. Please try again.', 'error');
     }
   });
   
   // ── Social Buttons ──────────────────────────────────────────────────────────
   
   document.getElementById('googleBtn')?.addEventListener('click', () => {
     (window.Auth || window.SQ).signInWithOAuth('google');
   });

   document.getElementById('facebookBtn')?.addEventListener('click', () => {
     (window.Auth || window.SQ).signInWithOAuth('facebook');
   });