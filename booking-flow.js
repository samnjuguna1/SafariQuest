/**
 * SafariQuest — booking.html flow (M-Pesa + Supabase user_bookings)
 * Depends: auth.js, attractions-data.js (optional), supabase-config.js, mpesa.js
 */
(function () {
  const TAX_RATE = 0.0333;

  function mpesaBackendUrl() {
    const ls = localStorage.getItem('sq_mpesa_backend_url');
    const meta = document.querySelector('meta[name="mpesa-backend-url"]');
    const m = meta && meta.getAttribute('content');
    const raw = (ls || m || '').trim();
    if (raw && raw !== 'https://YOUR-BACKEND.onrender.com') return raw.replace(/\/$/, '');
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return 'http://localhost:3000';
    return '';
  }

  function fmtK(n) {
    return 'KES ' + Math.round(Number(n) || 0).toLocaleString('en-KE');
  }

  function nightsBetween(a, b) {
    const d1 = new Date(a);
    const d2 = new Date(b);
    const n = Math.ceil((d2 - d1) / 86400000);
    return n > 0 ? n : 1;
  }

  function priceBreakdown(attr, checkIn, checkOut, guests) {
    const perNight = attr.price_from || attr.price_min || 12000;
    const nights = nightsBetween(checkIn, checkOut);
    const base = perNight * nights * Math.max(1, guests);
    const tax = Math.round(base * TAX_RATE);
    return { perNight, nights, base, tax, total: base + tax };
  }

  async function loadDestinations() {
    let list = [];
    try {
      if (window.db && typeof window.db.getAttractions === 'function') {
        list = await window.db.getAttractions({ limit: 100 });
      }
    } catch (e) {
      console.warn('[booking]', e);
    }
    if ((!list || !list.length) && window.ATTRACTIONS_DATA) list = window.ATTRACTIONS_DATA;
    return Array.isArray(list) ? list : [];
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function showStep(n) {
    [1, 2, 3].forEach(function (i) {
      const el = qs('step-panel-' + i);
      if (el) el.hidden = i !== n;
      const dot = qs('step-dot-' + i);
      if (dot) {
        dot.classList.toggle('active', i === n);
        dot.classList.toggle('done', i < n);
      }
    });
  }

  let destinations = [];
  let selected = null;
  let currentBookingId = null;
  let lastTotals = null;

  async function checkAvailability() {
    const slug = qs('destination').value;
    const checkIn = qs('check_in').value;
    const checkOut = qs('check_out').value;
    const hint = qs('availability-hint');
    const backend = mpesaBackendUrl();
    if (!slug || !checkIn || !checkOut) {
      hint.textContent = 'Choose destination and dates to check availability.';
      hint.className = 'hint hint-muted';
      return;
    }
    if (!backend) {
      hint.textContent = 'Set your M-Pesa backend URL (localStorage key sq_mpesa_backend_url or meta tag) to enable live availability.';
      hint.className = 'hint hint-warn';
      return;
    }
    hint.textContent = 'Checking availability…';
    hint.className = 'hint hint-muted';
    try {
      const url =
        backend +
        '/booking/availability?slug=' +
        encodeURIComponent(slug) +
        '&check_in=' +
        encodeURIComponent(checkIn) +
        '&check_out=' +
        encodeURIComponent(checkOut);
      const res = await fetch(url);
      const data = await res.json().catch(function () {
        return {};
      });
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.available) {
        hint.textContent =
          'Good availability — ' +
          (data.booked || 0) +
          ' of ' +
          (data.capacity || 40) +
          ' slots used for these dates.';
        hint.className = 'hint hint-ok';
      } else {
        hint.textContent =
          'This destination is nearly full for those dates (' +
          (data.booked || 0) +
          '/' +
          (data.capacity || 40) +
          '). Try different dates or another park.';
        hint.className = 'hint hint-bad';
      }
    } catch (e) {
      hint.textContent = 'Could not reach availability service. You can still continue if the backend is not deployed yet.';
      hint.className = 'hint hint-warn';
    }
  }

  function refreshSummary() {
    const slug = qs('destination').value;
    selected = destinations.find(function (d) {
      return (d.slug || d.id) === slug;
    });
    const guests = Math.max(1, parseInt(qs('guests').value, 10) || 1);
    const checkIn = qs('check_in').value;
    const checkOut = qs('check_out').value;
    const nameEl = qs('full_name');
    const emailEl = qs('email');
    if (window.SQ && window.SQ.getUser) {
      const u = window.SQ.getUser();
      if (u && nameEl && !nameEl.value) nameEl.value = (u.user_metadata && u.user_metadata.full_name) || '';
      if (u && emailEl && !emailEl.value) emailEl.value = u.email || '';
    }

    if (!selected || !checkIn || !checkOut) return;

    lastTotals = priceBreakdown(selected, checkIn, checkOut, guests);
    qs('sum-dest').textContent = selected.name || slug;
    qs('sum-dates').textContent = checkIn + ' → ' + checkOut;
    qs('sum-guests').textContent = String(guests);
    qs('pb-nights').textContent =
      lastTotals.nights + ' night' + (lastTotals.nights !== 1 ? 's' : '') + ' × ' + guests + ' guest' + (guests !== 1 ? 's' : '');
    qs('pb-rate').textContent =
      fmtK(lastTotals.perNight) + ' × ' + lastTotals.nights + ' × ' + guests;
    qs('pb-base').textContent = fmtK(lastTotals.base);
    qs('pb-tax').textContent = fmtK(lastTotals.tax);
    qs('pb-total').textContent = fmtK(lastTotals.total);
  }

  function validateStep1() {
    const slug = qs('destination').value;
    const checkIn = qs('check_in').value;
    const checkOut = qs('check_out').value;
    const guests = parseInt(qs('guests').value, 10) || 0;
    const name = (qs('full_name').value || '').trim();
    const email = (qs('email').value || '').trim();
    if (!slug) return 'Please choose a destination.';
    if (!checkIn || !checkOut) return 'Please select check-in and check-out dates.';
    if (checkOut <= checkIn) return 'Check-out must be after check-in.';
    if (guests < 1 || guests > 20) return 'Guests must be between 1 and 20.';
    if (!name || !email) return 'Please enter your full name and email.';
    return '';
  }

  async function goStep2() {
    const err = validateStep1();
    if (err) {
      alert(err);
      return;
    }
    refreshSummary();
    await checkAvailability();
    showStep(2);
  }

  async function goStep3() {
    const err = validateStep1();
    if (err) {
      alert(err);
      return;
    }
    if (!window.SQ || !window.SQ.isLoggedIn || !window.SQ.isLoggedIn()) {
      const here = encodeURIComponent(location.pathname + location.search);
      window.location.href = 'login.html?next=' + here;
      return;
    }
    const sess = window.SQ.getSession && window.SQ.getSession();
    if (sess && sess.is_dev_auth) {
      alert('M-Pesa and saved bookings require a real Supabase login. Turn off dev bypass or register a real account.');
      return;
    }
    refreshSummary();
    if (!lastTotals) return;

    const slug = qs('destination').value;
    selected = destinations.find(function (d) {
      return (d.slug || d.id) === slug;
    });
    const guests = Math.max(1, parseInt(qs('guests').value, 10) || 1);
    const checkIn = qs('check_in').value;
    const checkOut = qs('check_out').value;
    const notes = (qs('notes').value || '').trim();

    const row = {
      attraction_slug: slug,
      attraction_name: selected ? selected.name : slug,
      attraction_location: (selected && (selected.region || selected.county || selected.location))
        ? (selected.region || selected.county || selected.location) + ', Kenya'
        : 'Kenya',
      booking_type: 'Tour',
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      total_price: lastTotals.total,
      status: 'pending_payment',
      payment_ref: 'PENDING',
      image_url: (selected && selected.image_hero) || '',
      special_requests: notes,
      package_type: 'web_booking',
    };
    const u = window.SQ.getUser();
    if (u && u.id) row.user_id = u.id;

    const payBtn = qs('btn-pay');
    payBtn.disabled = true;
    payBtn.textContent = 'Saving booking…';

    try {
      const created = await window.SQ.createUserBooking(row);
      currentBookingId = (created && created.id) || null;
      if (!currentBookingId) throw new Error('No booking id returned');
      qs('pay-booking-id').textContent = currentBookingId;
      qs('pay-total-line').textContent = fmtK(lastTotals.total);
      showStep(3);
    } catch (e) {
      console.error(e);
      alert('Could not save your booking: ' + (e.message || 'Unknown error') + '\nIf this persists, confirm Supabase columns (see mpesa-backend README migration 002).');
    } finally {
      payBtn.disabled = false;
      payBtn.textContent = 'Pay with M-Pesa';
    }
  }

  function showMsg(text, kind) {
    const el = qs('pay-message');
    el.textContent = text;
    el.className = 'pay-message ' + (kind || '');
    el.hidden = !text;
  }

  function validatePhone(phone) {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '254');
    return /^2547\d{8}$|^2541\d{8}$/.test(cleaned);
  }

  function normalizePhone(phone) {
    return phone.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '254');
  }

  async function doPay() {
    const backend = mpesaBackendUrl();
    if (!backend) {
      alert('Configure your backend URL:\nlocalStorage.setItem("sq_mpesa_backend_url","https://your-app.onrender.com")');
      return;
    }
    if (!currentBookingId || !lastTotals) return;
    const phone = (qs('mpesa_phone').value || '').trim();
    
    if (!phone) {
      showMsg('Please enter your M-Pesa phone number.', 'err');
      qs('mpesa_phone').focus();
      return;
    }

    if (!validatePhone(phone)) {
      showMsg('Please enter a valid Safaricom number (07xx or 01xx).', 'err');
      qs('mpesa_phone').focus();
      return;
    }

    if (!window.MpesaHelper || !window.MpesaHelper.initiateStkPush) {
      alert('M-Pesa helper not loaded.');
      return;
    }

    const payBtn = qs('btn-pay');
    payBtn.disabled = true;
    showMsg('Your order has been received. Sending payment prompt to ' + phone + '…', 'info');

    try {
      const data = await window.MpesaHelper.initiateStkPush({
        backendUrl: backend,
        phone: normalizePhone(phone),
        amount: lastTotals.total,
        bookingId: currentBookingId,
        description: 'SafariQuest: ' + (selected && selected.name ? selected.name : 'Tour'),
      });

      showMsg('Payment prompt sent! Please check your phone and enter your M-Pesa PIN to complete the payment.', 'info');

      window.MpesaHelper.pollPaymentStatus({
        backendUrl: backend,
        checkoutRequestId: data.checkoutRequestId,
        onPaid: function (info) {
          showMsg('Payment successful! Redirecting…', 'ok');
          const dest = encodeURIComponent((selected && selected.name) || qs('destination').value);
          const q =
            'id=' +
            encodeURIComponent(currentBookingId) +
            '&dest=' +
            dest +
            '&amount=' +
            encodeURIComponent(String(lastTotals.total));
          window.location.href = 'thank-you.html?' + q;
        },
        onFailed: function (reason) {
          showMsg(reason || 'Payment failed. Please try again.', 'err');
          payBtn.disabled = false;
        },
        onTimeout: function () {
          showMsg('No confirmation yet. Check your phone or M-Pesa balance. You can verify status in My Bookings.', 'warn');
          payBtn.disabled = false;
        },
      });
    } catch (e) {
      console.error(e);
      showMsg(e.message || 'Payment could not start.', 'err');
      payBtn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', async function () {
    destinations = await loadDestinations();
    const sel = qs('destination');
    sel.innerHTML =
      '<option value="">Select destination…</option>' +
      destinations
        .map(function (d) {
          const slug = d.slug || d.id;
          const label = d.name || slug;
          return '<option value="' + slug + '">' + label + '</option>';
        })
        .join('');

    const params = new URLSearchParams(location.search);
    const preset = params.get('destination');
    if (preset && sel.querySelector('option[value="' + preset + '"]')) sel.value = preset;

    const today = new Date();
    const out = new Date(today);
    out.setDate(out.getDate() + 5);
    const fmt = function (d) {
      return d.toISOString().slice(0, 10);
    };
    if (!qs('check_in').value) qs('check_in').value = fmt(today);
    if (!qs('check_out').value) {
      const o2 = new Date(today);
      o2.setDate(o2.getDate() + 4);
      qs('check_out').value = fmt(o2);
    }
    qs('check_in').min = fmt(today);

    ['destination', 'check_in', 'check_out', 'guests'].forEach(function (id) {
      qs(id).addEventListener('change', function () {
        if (id === 'check_in') {
          const ci = qs('check_in').value;
          if (ci) {
            const minOut = new Date(ci);
            minOut.setDate(minOut.getDate() + 1);
            qs('check_out').min = fmt(minOut);
          }
        }
        refreshSummary();
      });
    });

    qs('btn-step2').addEventListener('click', goStep2);
    qs('btn-back-1').addEventListener('click', function () {
      showStep(1);
    });
    qs('btn-step3').addEventListener('click', goStep3);
    qs('btn-back-2').addEventListener('click', function () {
      showStep(2);
    });
    qs('btn-check-av').addEventListener('click', checkAvailability);
    qs('btn-pay').addEventListener('click', doPay);

    showStep(1);
    refreshSummary();
  });
})();
