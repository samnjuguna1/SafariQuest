/* ============================================================
   MPESA PAYMENT MODULE — mpesa.js
   Requires: supabase-config.js (loaded first, exposes `sb`)
   Usage: openMpesaModal({ bookingId, bookingType, amount, name })
   ============================================================ */

(function () {
  'use strict';

  /* ── CONFIG — update with your Supabase project ref ── */
  const STK_FUNCTION_URL =
    'https://cbyipmrozqsntojiartw.supabase.co/functions/v1/mpesa-stk-push';

  /* ── STATE ── */
  let currentBooking    = {};
  let currentCheckoutId = null;
  let pollTimer         = null;
  let countdownTimer    = null;

  /* ────────────────────────────────────────────────────────
     PUBLIC API
  ──────────────────────────────────────────────────────── */

  /**
   * Open the M-Pesa payment modal.
   * @param {Object} opts
   * @param {string|number} opts.bookingId   - ID of the hotel / accommodation
   * @param {string}        opts.bookingType - 'hotel' | 'accommodation' | 'event'
   * @param {number}        opts.amount      - Amount in KSh
   * @param {string}        opts.name        - Human-readable property name
   */
  window.openMpesaModal = function ({ bookingId, bookingType, amount, name }) {
    currentBooking = { bookingId, bookingType, amount, name };

    // Populate static fields
    _el('mpesa-amount').value = amount;
    _el('mpesa-phone').value  = '';
    _el('mpesa-booking-name').textContent   = name || 'Your booking';
    _el('mpesa-booking-amount').textContent =
      'KSh ' + Number(amount).toLocaleString('en-KE') + ' / night';

    _showStep(1);
    _el('mpesa-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => _el('mpesa-phone').focus(), 350);
  };

  window.closeMpesaModal = function () {
    _el('mpesa-overlay').classList.remove('active');
    document.body.style.overflow = '';
    _clearTimers();
  };

  /* ────────────────────────────────────────────────────────
     STEP NAVIGATION
  ──────────────────────────────────────────────────────── */

  function _showStep(n) {
    document.querySelectorAll('.mpesa-step').forEach(el => el.classList.remove('active'));
    const step = document.getElementById('mpesa-step-' + n);
    if (step) step.classList.add('active');
  }

  /* ────────────────────────────────────────────────────────
     SUBMIT PAYMENT
  ──────────────────────────────────────────────────────── */

  window.submitMpesaPayment = async function () {
    const rawPhone = _el('mpesa-phone').value.trim();

    if (!rawPhone) {
      _shakeInput('mpesa-phone');
      _toast('Please enter your M-Pesa phone number.');
      return;
    }

    // Normalise: 07xx / 01xx / +254xx → 254xxxxxxxxx
    const phone = rawPhone
      .replace(/\s+/g, '')
      .replace(/^\+/, '')
      .replace(/^0/, '254');

    if (!/^2547\d{8}$|^2541\d{8}$/.test(phone)) {
      _shakeInput('mpesa-phone');
      _toast('Please enter a valid Safaricom number (07xx or 01xx).');
      return;
    }

    // Show confirmation that order is received
    _toast('Your order has been received. Sending payment prompt to ' + rawPhone + '…');

    // Disable button / show spinner
    const btn     = _el('mpesa-pay-btn');
    const spinner = _el('mpesa-spinner');
    const btnText = _el('mpesa-btn-text');

    btn.disabled        = true;
    spinner.style.display = 'block';
    btnText.style.display = 'none';

    try {
      // Get current user ID if logged in
      let userId = null;
      if (typeof sb !== 'undefined' && sb.auth) {
        const { data } = await sb.auth.getUser().catch(() => ({ data: null }));
        userId = data?.user?.id ?? null;
      }

      const res = await fetch(STK_FUNCTION_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount:      currentBooking.amount,
          bookingId:   currentBooking.bookingId,
          bookingType: currentBooking.bookingType || 'general',
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Payment request failed. Please try again.');
      }

      // Success — move to waiting screen
      currentCheckoutId = data.checkoutRequestId;
      _el('mpesa-confirm-phone').textContent  = rawPhone;
      _el('mpesa-confirm-amount').textContent =
        'KSh ' + Number(currentBooking.amount).toLocaleString('en-KE');

      _toast('Payment prompt sent! Please check your phone and enter your M-Pesa PIN to complete the payment.');
      _showStep(2);
      _startCountdown(60);
      _startPolling(currentCheckoutId);

    } catch (err) {
      _toast(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      btn.disabled        = false;
      spinner.style.display = 'none';
      btnText.style.display = 'inline';
    }
  };

  /* ────────────────────────────────────────────────────────
     POLLING — check Supabase every 3s for payment status
  ──────────────────────────────────────────────────────── */

  function _startPolling(checkoutId) {
    let attempts = 0;
    const MAX    = 20; // 20 × 3s = 60s

    pollTimer = setInterval(async () => {
      attempts++;

      try {
        const { data, error } = await sb
          .from('mpesa_transactions')
          .select('status, mpesa_receipt, confirmed_amount, result_desc')
          .eq('checkout_request_id', checkoutId)
          .single();

        if (error) throw error;

        if (data?.status === 'completed') {
          _clearTimers();
          _el('mpesa-receipt-num').textContent = data.mpesa_receipt || '—';
          _showStep(3);

        } else if (data?.status === 'failed') {
          _clearTimers();
          _el('mpesa-fail-reason').textContent =
            data.result_desc || 'The payment was cancelled or failed. Please try again.';
          _showStep(4);

        } else if (attempts >= MAX) {
          _clearTimers();
          _el('mpesa-fail-reason').textContent =
            'Payment timed out. If money was deducted from your M-Pesa, ' +
            'please check your messages for a confirmation code and contact us.';
          _showStep(4);

          // Mark as timeout in DB
          try {
            await sb
              .from('mpesa_transactions')
              .update({ status: 'timeout', updated_at: new Date().toISOString() })
              .eq('checkout_request_id', checkoutId);
          } catch (_) { /* silent */ }
        }

      } catch (_) {
        // Network blip — keep polling silently
      }
    }, 3000);
  }

  /* ────────────────────────────────────────────────────────
     COUNTDOWN DISPLAY
  ──────────────────────────────────────────────────────── */

  function _startCountdown(seconds) {
    let remaining = seconds;
    _el('mpesa-countdown-val').textContent = remaining;

    countdownTimer = setInterval(() => {
      remaining--;
      const el = _el('mpesa-countdown-val');
      if (el) el.textContent = remaining;
      if (remaining <= 0) clearInterval(countdownTimer);
    }, 1000);
  }

  /* ────────────────────────────────────────────────────────
     RETRY (from failed screen)
  ──────────────────────────────────────────────────────── */

  window.retryMpesaPayment = function () {
    _clearTimers();
    _showStep(1);
  };

  /* ────────────────────────────────────────────────────────
     HELPERS
  ──────────────────────────────────────────────────────── */

  function _el(id) { return document.getElementById(id); }

  function _clearTimers() {
    clearInterval(pollTimer);
    clearInterval(countdownTimer);
    pollTimer = countdownTimer = null;
  }

  function _shakeInput(id) {
    const el = _el(id);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'mpesaShake 0.4s ease';
  }

  function _toast(msg) {
    // Reuse project toast if available, else alert
    if (typeof showToast === 'function') {
      showToast(msg, 'error');
    } else {
      alert(msg);
    }
  }

  /* ── Close on overlay click ── */
  document.addEventListener('DOMContentLoaded', function () {
    const overlay = _el('mpesa-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) window.closeMpesaModal();
      });
    }
  });

  /* ── Shake keyframe (injected once) ── */
  if (!document.getElementById('mpesa-shake-style')) {
    const style = document.createElement('style');
    style.id = 'mpesa-shake-style';
    style.textContent = `
      @keyframes mpesaShake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-6px); }
        40%       { transform: translateX(6px); }
        60%       { transform: translateX(-4px); }
        80%       { transform: translateX(4px); }
      }
    `;
    document.head.appendChild(style);
  }

})();