/* ============================================================
   SAFARIQUEST — dashboard.js
   Bookings / recommended / saved — Supabase-backed (see supabase/migrations)
============================================================ */

var SEARCH_DATA = [
  { icon: '🦁', name: 'Maasai Mara',        loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🏔', name: 'Mount Kilimanjaro',   loc: 'Tanzania',    href: 'destinations.html' },
  { icon: '🏖', name: 'Diani Beach',         loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🌊', name: 'Zanzibar',            loc: 'Tanzania',    href: 'destinations.html' },
  { icon: '🐘', name: 'Amboseli NP',         loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🌋', name: 'Great Rift Valley',   loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🦒', name: 'Samburu NP',          loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🐆', name: 'Tsavo East',          loc: 'Kenya',       href: 'destinations.html' },
  { icon: '☕', name: 'Kericho Tea Farms',   loc: 'Kenya',       href: 'destinations.html' },
  { icon: '🏨', name: 'Nairobi Serena',      loc: 'Hotel',       href: 'hotels.html'       },
  { icon: '🍽', name: 'Carnivore Restaurant',loc: 'Restaurant',  href: 'restaurants.html'  },
  { icon: '🎯', name: 'Hot Air Balloon',     loc: 'Activity',    href: 'activities.html'   },
];

var dashRealtimeChannel = null;

document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth) {
    window.location.href = 'login.html';
    return;
  }
  if (!Auth.isLoggedIn()) {
    Auth.requireAuth({ action: 'dashboard' });
    return;
  }

  hydrateDashboardUser().catch(function () {});

  void (async function loadAll() {
    var merged = await loadBookingsWithFallback();
    updateBookingStats(merged);
    renderTripListUnified(merged);

    await loadRecommendedSection();
    await loadSavedSection();
    initFilterTabsRecommended();
    initRecommendedHeartDelegation();
    initSavedRemoveDelegation();
    setupDashboardRealtime();
  })();

  /* Destination tags */
  var destinations = ['Kenya','Tanzania','Uganda','Rwanda','Ethiopia','Somalia','Namibia','South Africa'];
  var tagsEl = document.getElementById('destTags');
  if (tagsEl) {
    destinations.forEach(function (name, i) {
      var tag = document.createElement('span');
      tag.className = 'dest-tag';
      tag.textContent = '✓ ' + name;
      tag.style.animationDelay = (i * 0.07) + 's';
      tagsEl.appendChild(tag);
    });
  }

  setTimeout(function () {
    document.querySelectorAll('.stat-val').forEach(function (el) {
      animateCount(el, parseInt(el.dataset.count, 10) || 0, 1400);
    });
  }, 350);

  document.querySelectorAll('.nav-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  document.querySelectorAll('.hero-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      this.style.transform = 'scale(0.93)';
      var self = this;
      setTimeout(function () { self.style.transform = ''; }, 150);
    });
  });

  initTopbarSearch();
  initSidebarSearch();
  initTripRowLinkDelegation();
  initMobileSidebar();

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      if (dashRealtimeChannel && typeof dashRealtimeChannel.unsubscribe === 'function') {
        dashRealtimeChannel.unsubscribe();
      }
      await Auth.signOut();
      window.location.href = 'index.html';
    });
  }
});

/* ════════════════════════════════════════════════════════════
   SUPABASE SECTION LOADERS
════════════════════════════════════════════════════════════ */

async function loadBookingsWithFallback() {
  var remote = [];
  try {
    remote = await Auth.listUserBookings();
  } catch (e) {
    console.warn('listUserBookings:', e);
  }
  if (remote && remote.length) {
    return remote.map(normalizeRemoteBooking);
  }
  var local = [];
  try { local = JSON.parse(localStorage.getItem('sq_bookings') || '[]'); } catch (e) {}
  return (local || []).map(normalizeLegacyLocalBooking);
}

function normalizeRemoteBooking(b) {
  return {
    id: b.id,
    attraction_slug: b.attraction_slug || '',
    attraction_name: b.attraction_name || b.attraction_slug || 'Destination',
    check_in: b.check_in,
    check_out: b.check_out,
    guests: b.guests,
    status: b.status || 'confirmed',
    special_requests: b.special_requests,
    _source: 'supabase'
  };
}

function normalizeLegacyLocalBooking(b) {
  return {
    id: b.id,
    attraction_slug: b.slug || '',
    attraction_name: b.attraction || 'Trip',
    check_in: b.checkIn || '',
    check_out: b.checkOut || '',
    guests: parseInt(String(b.guests), 10) || 1,
    status: b.status || 'confirmed',
    _source: 'local'
  };
}

function isUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function bookingDetailsUrl(b) {
  var slug = b.attraction_slug || '';
  if (!slug) return 'destinations.html';
  var base = 'attraction-details.html?id=' + encodeURIComponent(slug);
  if (b._source === 'supabase' && isUuid(b.id)) {
    return base + '&booking=' + encodeURIComponent(b.id);
  }
  return base;
}

function updateBookingStats(merged) {
  var n = merged.length;
  var bookingsBadge = document.getElementById('bookingsBadge');
  if (bookingsBadge) bookingsBadge.textContent = n;
  var statVals = document.querySelectorAll('.stat-val');
  if (statVals.length > 0) statVals[0].dataset.count = n;

  setTimeout(function () {
    var fill = document.getElementById('goalFill');
    if (!fill) return;
    var pct = n > 0 ? Math.min(n * 10 + 20, 95) : 53;
    fill.style.width = pct + '%';
    var pctEl = document.getElementById('goalPct');
    if (pctEl) pctEl.textContent = pct + '%';
  }, 500);
}

function renderTripListUnified(bookings) {
  var tripList = document.getElementById('tripList');
  if (!tripList) return;

  if (!bookings.length) return;

  tripList.innerHTML = bookings.map(function (b) {
    var statusRaw = (b.status || 'pending');
    var statusLabel = String(statusRaw).replace(/_/g, ' ');
    var statusOk = /confirmed|complete/i.test(statusRaw);
    var statusColor = statusOk ? '#1ec99a' : '#C8A24E';
    var statusBg    = statusOk ? 'rgba(30,201,154,0.12)' : 'rgba(200,162,78,0.15)';
    var href = bookingDetailsUrl(b);
    var ci = b.check_in || '';
    var co = b.check_out || '';
    return '<div class="trip-item">' +
      '<div style="width:52px;height:52px;border-radius:8px;background:rgba(107,76,42,0.1);' +
           'display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">🌍</div>' +
      '<div class="trip-info">' +
        '<div class="trip-name">' + escHtml(b.attraction_name) + '</div>' +
        '<div class="trip-meta">' +
          '<span>📅 ' + escHtml(ci) + ' → ' + escHtml(co) + '</span>' +
          '<span>👥 ' + escHtml(String(b.guests)) + ' guests</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">' +
          (b._source === 'supabase' ? 'Booking ID: <strong>' + escHtml(String(b.id)) + '</strong>' : 'Local demo booking') +
        '</div>' +
      '</div>' +
      '<div class="trip-actions">' +
        '<a class="trip-action" href="' + escHtml(href) + '">View Details</a>' +
        '<a class="trip-action-sec" href="' + escHtml(href) + '">Edit</a>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0;align-self:center">' +
        '<span style="display:inline-block;padding:4px 10px;background:' + statusBg + ';' +
              'color:' + statusColor + ';border-radius:20px;font-size:11px;font-weight:700">' +
          escHtml(statusLabel) +
        '</span>' +
      '</div>' +
    '</div>';
  }).join('') +
  '<div style="padding:14px 20px;border-top:1px solid var(--border)">' +
    '<a href="destinations.html" style="font-size:13px;color:var(--savanna);font-weight:500;text-decoration:none">' +
      '+ Browse more destinations →' +
    '</a>' +
  '</div>';
}

async function loadRecommendedSection() {
  var grid = document.getElementById('recommendedGrid');
  var statusEl = document.getElementById('recommendedStatus');
  var loading = document.getElementById('recommendedLoading');
  if (loading) loading.style.display = 'none';
  if (statusEl) statusEl.textContent = 'Loading…';

  var items = [];
  try {
    items = await Auth.listRecommendedDestinations();
  } catch (e) {
    console.warn('recommended:', e);
  }

  if (statusEl) statusEl.textContent = '';

  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="dash-empty-msg">No recommendations yet. Add rows in Supabase table <code>recommended_destinations</code> (or run the project SQL migration).</p>';
    return;
  }

  grid.innerHTML = items.map(function (r) {
    var cat = (r.category || 'safari').toLowerCase();
    var slug = r.attraction_slug || '';
    var href = slug ? ('attraction-details.html?id=' + encodeURIComponent(slug)) : 'destinations.html';
    var img = r.image_url || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80&fit=crop';
    return '<div class="explore-card" data-category="' + escHtml(cat) + '">' +
      '<img src="' + escHtml(img) + '" alt="">' +
      '<button type="button" class="heart-btn explore-heart dash-save-heart" title="Save"' +
        ' data-slug="' + escHtml(slug) + '" data-name="' + escHtml(r.title || '') + '" data-image="' + escHtml(img) + '">♡</button>' +
      '<div class="explore-overlay"></div>' +
      '<div class="explore-category">' + escHtml(cat) + '</div>' +
      '<div class="explore-info">' +
        '<div class="explore-name">' + escHtml(r.title || 'Destination') + '</div>' +
        '<div class="explore-location">' + escHtml((r.short_description || '').slice(0, 120)) + (r.short_description && r.short_description.length > 120 ? '…' : '') + '</div>' +
        '<div class="explore-price">' +
          '<a class="explore-link" href="' + escHtml(href) + '">View →</a>' +
          '&nbsp; <a class="explore-link dash-book" href="' + escHtml(href) + '">Book Now</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function loadSavedSection() {
  var row = document.getElementById('savedRow');
  var statusEl = document.getElementById('savedStatus');
  var loading = document.getElementById('savedLoading');
  if (loading) loading.style.display = 'none';
  if (statusEl) statusEl.textContent = 'Loading…';

  var items = [];
  try {
    items = await Auth.listUserSavedDestinations(5);
  } catch (e) {
    console.warn('saved:', e);
  }

  if (statusEl) statusEl.textContent = '';

  if (!row) return;
  if (!items.length) {
    row.innerHTML = '<p class="dash-empty-msg">Nothing saved yet. Use ♡ on recommendations or “Save to Wishlist” on a destination page.</p>';
    return;
  }

  row.innerHTML = items.map(function (s) {
    var img = s.image_url || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=300&q=80&fit=crop';
    var slug = s.attraction_slug || '';
    var href = slug ? ('attraction-details.html?id=' + encodeURIComponent(slug)) : 'destinations.html';
    return '<div class="saved-item-wrap">' +
      '<button type="button" class="saved-remove-btn" data-saved-id="' + escHtml(s.id) + '" title="Remove">×</button>' +
      '<a class="saved-item" href="' + escHtml(href) + '">' +
        '<img class="saved-img" src="' + escHtml(img) + '" alt="">' +
        '<div class="saved-item-name">' + escHtml(s.attraction_name || slug || 'Saved') + '</div>' +
        '<div class="saved-item-loc">' + escHtml(slug.replace(/-/g, ' ')) + '</div>' +
      '</a>' +
    '</div>';
  }).join('');
}

function initFilterTabsRecommended() {
  var wrap = document.getElementById('recommendedSectionWrap');
  var grid = document.getElementById('recommendedGrid');
  if (!wrap || !grid) return;
  var tabs = wrap.querySelectorAll('.filter-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      var filter = (this.getAttribute('data-filter') || 'all').toLowerCase();
      grid.querySelectorAll('.explore-card').forEach(function (card) {
        var cat = (card.getAttribute('data-category') || '').toLowerCase();
        card.classList.toggle('hidden', filter !== 'all' && cat !== filter);
      });
    });
  });
}

function initRecommendedHeartDelegation() {
  var grid = document.getElementById('recommendedGrid');
  if (!grid) return;
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.dash-save-heart');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var slug = btn.getAttribute('data-slug');
    var name = btn.getAttribute('data-name');
    var image = btn.getAttribute('data-image');
    if (!slug) {
      showDashToast('Link this card to an attraction slug in Supabase.', 'info');
      return;
    }
    void (async function () {
      try {
        var uid = Auth.getUser()?.id;
        if (!uid) return;
        await Auth.insertUserSavedDestination({
          user_id: uid,
          attraction_slug: slug,
          attraction_name: name || slug,
          image_url: image || null
        });
        btn.classList.add('liked');
        showDashToast('Saved to your list.', 'success');
        await loadSavedSection();
      } catch (err) {
        showDashToast(err.message || 'Could not save', 'error');
      }
    })();
  });
}

function initSavedRemoveDelegation() {
  var row = document.getElementById('savedRow');
  if (!row) return;
  row.addEventListener('click', function (e) {
    var del = e.target.closest('.saved-remove-btn');
    if (!del) return;
    e.preventDefault();
    var id = del.getAttribute('data-saved-id');
    if (!id) return;
    void (async function () {
      try {
        await Auth.deleteUserSavedDestination(id);
        showDashToast('Removed from saved.', 'success');
        await loadSavedSection();
      } catch (err) {
        showDashToast(err.message || 'Could not remove', 'error');
      }
    })();
  });
}

function initTripRowLinkDelegation() {
  /* Links handle navigation; no extra JS needed */
}

function setupDashboardRealtime() {
  if (!window.SQ_PUBLIC || !window.supabase || typeof window.supabase.createClient !== 'function') return;
  var sess = Auth.getSession && Auth.getSession();
  if (!sess?.access_token || !sess.refresh_token) return;

  try {
    var client = window.supabase.createClient(window.SQ_PUBLIC.url, window.SQ_PUBLIC.anon, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    client.auth.setSession({
      access_token: sess.access_token,
      refresh_token: sess.refresh_token
    }).then(function () {
      dashRealtimeChannel = client
        .channel('dashboard-' + (Auth.getUser()?.id || 'me'))
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_bookings' },
          function () {
            loadBookingsWithFallback().then(function (m) {
              updateBookingStats(m);
              renderTripListUnified(m);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_saved_destinations' },
          function () { loadSavedSection(); }
        )
        .subscribe();
    });
  } catch (e) {
    console.warn('Realtime unavailable:', e);
  }
}

function showDashToast(msg, type) {
  var el = document.getElementById('dashToast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'dash-toast show ' + (type || 'info');
  clearTimeout(showDashToast._t);
  showDashToast._t = setTimeout(function () { el.classList.remove('show'); }, 3200);
}

/* ════════════════════════════════════════════════════════════
   USER / GREETING
════════════════════════════════════════════════════════════ */

async function hydrateDashboardUser() {
  var user = Auth.getUser() || {};
  var profile = null;
  try { profile = await Auth.getProfile(); } catch (err) { console.warn(err); }

  var fullName =
    (profile && profile.full_name) ||
    (user.user_metadata && user.user_metadata.full_name) ||
    user.name ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Traveller';
  var firstName = fullName.split(' ')[0] || 'Traveller';
  var email = (profile && profile.email) || user.email || '';
  var joinedRaw = (profile && profile.created_at) || user.created_at || '';

  renderUserIdentity(fullName, firstName, email, joinedRaw);
}

function renderUserIdentity(fullName, firstName, email, joinedRaw) {
  var userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = fullName;

  var userEmailEl = document.getElementById('userEmail');
  if (userEmailEl) {
    userEmailEl.textContent = email || 'Explorer Plan ✦';
    userEmailEl.title = email || '';
  }

  var joinedEl = document.getElementById('joinedDate');
  if (joinedEl) {
    joinedEl.textContent = joinedRaw
      ? 'Member since ' + formatJoinedDate(joinedRaw)
      : 'Member since —';
  }

  var initials = firstName.charAt(0).toUpperCase() +
    (fullName.split(' ')[1] ? fullName.split(' ')[1].charAt(0).toUpperCase() : '');
  document.querySelectorAll('#userAvatar, #heroAvatar').forEach(function (el) { el.textContent = initials || 'S'; });

  // Update topbar profile icon
  var topbarInitials = document.getElementById('topbarProfileInitials');
  if (topbarInitials) topbarInitials.textContent = initials || '👤';
  var topbarProfileBtn = document.getElementById('topbarProfileBtn');
  if (topbarProfileBtn && initials) {
    topbarProfileBtn.title = 'My Profile — ' + fullName;
  }

  setGreeting(firstName);
}

function formatJoinedDate(value) {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function setGreeting(firstName) {
  var hour = new Date().getHours();
  var period = hour < 12 ? 'morning' : (hour < 17 ? 'afternoon' : 'evening');
  var greetText = 'Good ' + period + ' 👋';
  var heroGreet = 'Good ' + period + ', ' + (firstName || 'Traveller') + ' 👋';
  var topbarEl = document.getElementById('greeting-text');
  if (topbarEl) topbarEl.textContent = greetText;
  var heroTitleEl = document.getElementById('heroTitle');
  if (heroTitleEl) heroTitleEl.textContent = heroGreet;
}

function animateCount(el, target, duration) {
  var start = performance.now();
  (function step(now) {
    var progress = Math.min((now - start) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  })(performance.now());
}

function initTopbarSearch() {
  var input = document.getElementById('topbarSearch');
  var dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    if (q.length < 1) { closeDropdown(); return; }
    var matches = SEARCH_DATA.filter(function (item) {
      return item.name.toLowerCase().includes(q) || item.loc.toLowerCase().includes(q);
    }).slice(0, 6);
    if (matches.length === 0) { closeDropdown(); return; }
    dropdown.innerHTML = matches.map(function (item) {
      return '<a class="search-result-item" href="' + item.href + '">' +
        '<span class="search-result-icon">' + item.icon + '</span>' +
        '<div><div class="search-result-name">' + escHtml(item.name) + '</div>' +
        '<div class="search-result-loc">' + escHtml(item.loc) + '</div></div></a>';
    }).join('');
    dropdown.classList.add('open');
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; closeDropdown(); input.blur(); }
  });

  document.addEventListener('click', function (e) {
    if (!input.closest('.topbar-search').contains(e.target)) closeDropdown();
  });

  function closeDropdown() { dropdown.classList.remove('open'); dropdown.innerHTML = ''; }
}

function initSidebarSearch() {
  var input = document.getElementById('sidebarSearch');
  if (!input) return;
  input.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    document.querySelectorAll('.nav-item').forEach(function (item) {
      var text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
}

function initMobileSidebar() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('open');
    }
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
