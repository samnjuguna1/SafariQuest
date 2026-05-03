/* ============================================================
   ATTRACTION DETAILS — attraction-details.js
   Reads ?id=slug from URL, fetches from Supabase, populates page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function attractionDetailsMain() {

  /* ── Navbar scroll shadow ── */
  const navbar = document.getElementById('navbar');
  const heroBg = document.querySelector('.hero-bg');

  function onScroll() {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(0,0,0,.12)'
        : '0 2px 12px rgba(0,0,0,.07)';
    }
    const st = document.getElementById('scrollTop');
    if (st) st.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Trigger hero bg slow-zoom after a tiny delay */
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);

  document.getElementById('scrollTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Intersection observer for fade-in ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ── Toast helper ── */
  function toast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast ' + (type || 'info') + ' show';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ══════════════════════════════════════
     1. READ SLUG FROM URL
  ══════════════════════════════════════ */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('id');

  if (!slug) {
    showError('No attraction specified. Please go back and select a destination.');
    return;
  }

  /* FIX: Set a readable breadcrumb immediately from the slug as a fallback,
     so it never stays as "Loading..." if data is slow or fails. */
  const bc = document.querySelector('.breadcrumb span');
  if (bc) {
    bc.textContent = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ══════════════════════════════════════
     2. FETCH FROM SUPABASE
  ══════════════════════════════════════ */
  let attraction;
  try {
    attraction = await db.getAttraction(slug);
    if (!attraction) {
      showError('Attraction not found. The link may be incorrect.');
      return;
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showError('Could not load details. Check your connection and try again.');
    return;
  }

  /* ══════════════════════════════════════
     3. POPULATE PAGE
  ══════════════════════════════════════ */
  populatePage(attraction);

  /* ══════════════════════════════════════
     4. FETCH SIMILAR DESTINATIONS
  ══════════════════════════════════════ */
  try {
    const similar = await db.getSimilar(attraction.category, attraction.slug);
    renderSimilar(similar);
  } catch (err) {
    console.error('Similar fetch error:', err);
  }

  /* ══════════════════════════════════════
     5. INIT INTERACTIVE FEATURES
  ══════════════════════════════════════ */

  /* Parse image_gallery safely — Supabase may return it as a JSON string.
     Always ensure image_hero is present so lightbox has at least one image. */
  let gallery = attraction.image_gallery;
  if (typeof gallery === 'string') {
    try { gallery = JSON.parse(gallery); } catch { gallery = []; }
  }
  if (!Array.isArray(gallery)) gallery = [];
  gallery = gallery.filter(Boolean);
  if (attraction.image_hero && !gallery.includes(attraction.image_hero)) {
    gallery.unshift(attraction.image_hero);
  }
  if (gallery.length === 0 && attraction.image_hero) gallery = [attraction.image_hero];

  const bookingParam = params.get('booking');
  await initBooking(attraction, toast, { bookingId: bookingParam, slug });
  initLightbox(gallery);
  initWishlist(attraction, toast);
  initShare(attraction, toast);
  initNewsletter(toast);

  /* ══════════════════════════════════════
     6. FETCH & RENDER ENTRY FEES
  ══════════════════════════════════════ */
  fetchAndRenderFees(attraction);

  /* ══════════════════════════════════════
     7. RENDER ACTIVITIES
  ══════════════════════════════════════ */
  renderActivities(attraction);

  /* ══════════════════════════════════════
     8. RENDER AVAILABLE SERVICES
  ══════════════════════════════════════ */
  renderServices(attraction);

  /* ══════════════════════════════════════
     9. WIRE ACCOMMODATION BUTTON
  ══════════════════════════════════════ */
  const accomBtn = document.getElementById('accommodationBtn');
  if (accomBtn) {
    accomBtn.addEventListener('click', () => {
      window.location.href = `accommodation.html?id=${encodeURIComponent(slug)}`;
    });
  }

  /* ══════════════════════════════════════
     10. WIRE SIDEBAR BUTTONS
  ══════════════════════════════════════ */
  const sidebarBookBtn = document.getElementById('sidebar-book-btn');
  if (sidebarBookBtn) {
    sidebarBookBtn.href = `booking.html?destination=${encodeURIComponent(slug)}`;
  }

  const sidebarAccomBtn = document.getElementById('sidebar-accom-btn');
  if (sidebarAccomBtn) {
    sidebarAccomBtn.href = `accommodation.html?id=${encodeURIComponent(slug)}`;
  }

  /* ══════════════════════════════════════
     11. RENDER ACCOMMODATION PREVIEW
  ══════════════════════════════════════ */
  renderAccomPreview(slug, attraction.name);

});

/* ────────────────────────────────────────
   POPULATE PAGE WITH SUPABASE DATA
──────────────────────────────────────── */
function populatePage(a) {
  const set    = (id, val)  => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML   = val; };

  /* Page title */
  document.title = `${a.name} — SafariQuest Kenya`;

  /* Hero background */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && a.image_hero) {
    heroBg.style.backgroundImage = `url('${a.image_hero}')`;
  }

  /* Hero badges */
  const diffBadge = document.querySelector('.badge-difficulty');
  if (diffBadge) {
    diffBadge.textContent = a.difficulty;
    diffBadge.className   = `badge-difficulty ${(a.difficulty || '').toLowerCase()}`;
  }
  const catBadge = document.querySelector('.badge-category');
  if (catBadge) catBadge.textContent = `🌍 ${a.category || 'Safari'}`;

  /* Hero title */
  const h1 = document.querySelector('.hero-content h1');
  if (h1) h1.textContent = a.name;

  /* Hero meta spans */
  const metaLoc    = document.querySelector('.meta-location');
  const metaRating = document.querySelector('.meta-rating');
  const metaTime   = document.querySelector('.meta-time');
  if (metaLoc)    metaLoc.innerHTML    = `📍 ${a.location || 'Kenya'}`;
  if (metaRating) metaRating.innerHTML = `⭐ ${a.rating} (${(a.review_count || 0).toLocaleString()} reviews)`;
  if (metaTime)   metaTime.innerHTML   = `🕐 Best: ${a.best_time || 'Year-round'}`;

  /* Breadcrumb — update with actual name now data has loaded */
  const bc = document.querySelector('.breadcrumb span');
  if (bc) bc.textContent = a.name;

  /* Quick info bar */
  set('info-best-time', a.best_time  || '—');
  set('info-difficulty', a.difficulty || '—');
  set('info-climate',    a.climate    || '—');

  /* Sidebar rating */
  set('sidebar-rating-score', a.rating || '—');
  set('sidebar-rating-count', `(${(a.review_count || 0).toLocaleString()} reviews)`);

  /* Sidebar quick details */
  set('sidebar-duration',    a.duration   || '—');
  set('sidebar-group',       a.group_size || '—');
  set('sidebar-price-range', `KSh ${(a.price_min || 0).toLocaleString('en-KE')} – KSh ${(a.price_max || 0).toLocaleString('en-KE')}`);

  /* Price display in sidebar header */
  const priceKsh = document.querySelector('.price-ksh');
  if (priceKsh) priceKsh.textContent = `KSh ${(a.price_min || 0).toLocaleString('en-KE')}`;

  /* Overview */
  const overviewEl = document.getElementById('overview-text');
  if (overviewEl) overviewEl.innerHTML = `<strong>${a.name}</strong> — ${a.description || ''}`;

  /* Highlights */
  const hlList = document.getElementById('highlights-list');
  if (hlList) {
    /* FIX: highlights may be a JSON string in Supabase */
    let highlights = a.highlights;
    if (typeof highlights === 'string') {
      try { highlights = JSON.parse(highlights); } catch { highlights = []; }
    }
    if (Array.isArray(highlights) && highlights.length) {
      hlList.innerHTML = highlights.map(h => `
        <div class="highlight-item">
          <div class="hl-dot"></div>
          <span>${h}</span>
        </div>
      `).join('');
    } else {
      hlList.innerHTML = '<p style="color:#999;font-size:.9rem">No highlights listed.</p>';
    }
  }

  /* Gallery images */
  /* FIX: parse safely in case Supabase returns image_gallery as a JSON string */
  let gallery = a.image_gallery;
  if (typeof gallery === 'string') {
    try { gallery = JSON.parse(gallery); } catch { gallery = []; }
  }
  if (!Array.isArray(gallery)) gallery = [];
  /* Remove any null/undefined/empty entries */
  gallery = gallery.filter(Boolean);

  /* Always ensure image_hero is in the gallery so the main slot is never black */
  if (a.image_hero && !gallery.includes(a.image_hero)) {
    gallery.unshift(a.image_hero);
  }
  /* Final fallback if still empty */
  if (gallery.length === 0 && a.image_hero) gallery = [a.image_hero];

  const galMain = document.querySelector('.gal-main');
  if (galMain && gallery[0]) galMain.style.backgroundImage = `url('${gallery[0]}')`;

  document.querySelectorAll('.gal-thumb').forEach((el, i) => {
    /* i+1 so thumbs show images after the main slot */
    const src = gallery[i + 1] || gallery[0]; /* fallback to first if not enough images */
    if (src) el.style.backgroundImage = `url('${src}')`;
  });

  /* Map */
  set('map-pin-title', a.name);
  set('location-note', `Located in ${a.location || 'Kenya'}. Duration: ${a.duration || '—'}. Best visited: ${a.best_time || '—'}.`);
  const mapsLink = document.getElementById('maps-link');
  if (mapsLink) mapsLink.href = `https://maps.google.com/?q=${encodeURIComponent(a.name + ' ' + (a.location || 'Kenya'))}`;

  /* Reviews section */
  set('rating-score', a.rating || '—');
  set('rating-count', `${(a.review_count || 0).toLocaleString()} reviews`);

  /* FIX: removed dead set('display-price') and set('sidebar-rating') calls —
     those element IDs do not exist in the HTML */
}

/* ────────────────────────────────────────
   FETCH & RENDER ENTRY FEES (Card Style)
   Tries Supabase attraction_fees table; falls back to sensible defaults
   derived from the attraction's price_min.
──────────────────────────────────────── */
async function fetchAndRenderFees(attraction) {
  const slug      = attraction.slug;
  const sfList    = document.getElementById('sidebar-fees-list');

  /* Default fees computed from priceMin when Supabase table is absent */
  function buildDefaultFees(a) {
    const base = a.price_min || a.price_from || 0;
    return [
      { 
        fee_type: 'Kenya Citizen',  
        amount_ksh: Math.round(base * 0.1) || 430,  
        notes: 'Kenya citizens',
        flag: '🇰🇪'
      },
      { 
        fee_type: 'East African Resident',      
        amount_ksh: Math.round(base * 0.5) || 2150, 
        notes: 'East African residents',
        flag: '🌍'
      },
      { 
        fee_type: 'International Visitor',  
        amount_ksh: Math.round(base * 1.5) || 6460,  
        notes: '≈ $52 International visitors',
        flag: '✈️'
      },
      { 
        fee_type: 'Child (Under 12)',      
        amount_ksh: Math.round(base * 0.375) || 1615, 
        notes: '≈ $13 Children under 12 (non-resident)',
        flag: '👶'
      },
    ];
  }

  let fees = [];
  try {
    fees = await db.getAttractionFees(slug);
  } catch (_) {}

  if (!fees || fees.length === 0) {
    fees = buildDefaultFees(attraction);
  }

  /* ── Populate the sidebar fees panel only ── */
  if (sfList) {
    sfList.innerHTML = fees.map(f => `
      <div class="sf-row">
        <span class="sf-type">${f.flag || '🎟️'} ${f.fee_type || '—'}</span>
        <span class="sf-amount">KSh ${(f.amount_ksh || 0).toLocaleString('en-KE')}</span>
      </div>
    `).join('');
  }
}

/* ────────────────────────────────────────
   RENDER ACTIVITIES & SERVICES
   Shows activities available at the destination with pricing
──────────────────────────────────────── */
function renderActivities(attraction) {
  const grid = document.getElementById('activities-grid');
  if (!grid) return;

  const cat = (attraction.category || '').toLowerCase();
  const slug = attraction.slug || '';
  
  /* Default activities by category */
  const activityDefaults = {
    safari: [
      { icon: '🚙', name: 'Full-Day Game Drive', desc: 'All-day guided drive with expert naturalist', price: 'KSh 3,000' },
      { icon: '🦅', name: 'Bird Watching Tour', desc: 'Expert ornithologist-led birding walk', price: 'KSh 2,000' },
      { icon: '🌅', name: 'Sunrise Safari', desc: 'Early morning game drive to catch wildlife at dawn', price: 'KSh 2,500' },
      { icon: '📸', name: 'Photography Safari', desc: 'Specialized tour for wildlife photography enthusiasts', price: 'KSh 4,000' },
      { icon: '🌙', name: 'Night Game Drive', desc: 'Spot nocturnal animals with spotlight', price: 'KSh 3,500' },
      { icon: '🏕️', name: 'Bush Camping', desc: 'Overnight camping experience in the wild', price: 'KSh 5,000' },
    ],
    beach: [
      { icon: '🤿', name: 'Snorkeling Tour', desc: 'Explore coral reefs and marine life', price: 'KSh 2,500' },
      { icon: '🏄', name: 'Water Sports Package', desc: 'Jet ski, kayaking, and paddleboarding', price: 'KSh 4,000' },
      { icon: '🐠', name: 'Scuba Diving', desc: 'PADI-certified diving with equipment', price: 'KSh 6,000' },
      { icon: '⛵', name: 'Dhow Sunset Cruise', desc: 'Traditional sailing boat sunset experience', price: 'KSh 3,000' },
      { icon: '🐬', name: 'Dolphin Watching', desc: 'Boat trip to see dolphins in their habitat', price: 'KSh 3,500' },
      { icon: '🏖️', name: 'Beach Massage', desc: 'Relaxing massage by the ocean', price: 'KSh 2,000' },
    ],
    mountain: [
      { icon: '🏔️', name: 'Guided Summit Trek', desc: 'Multi-day trek to the peak with porters', price: 'KSh 15,000' },
      { icon: '⛰️', name: 'Day Hike', desc: 'Scenic day hike with packed lunch', price: 'KSh 2,500' },
      { icon: '🧗', name: 'Rock Climbing', desc: 'Technical climbing with certified guide', price: 'KSh 4,000' },
      { icon: '🔦', name: 'Equipment Rental', desc: 'Hiking boots, poles, and gear rental', price: 'KSh 1,500' },
      { icon: '🌡️', name: 'Acclimatization Walk', desc: 'Gentle walk to adjust to altitude', price: 'Free' },
      { icon: '📷', name: 'Scenic Viewpoint Tour', desc: 'Visit the best photo spots', price: 'KSh 1,000' },
    ],
    cultural: [
      { icon: '🏛️', name: 'Museum Tour', desc: 'Guided tour of historical exhibits', price: 'KSh 1,500' },
      { icon: '🎭', name: 'Cultural Performance', desc: 'Traditional dance and music show', price: 'KSh 2,000' },
      { icon: '🛖', name: 'Village Visit', desc: 'Experience local community life', price: 'KSh 2,500' },
      { icon: '🍲', name: 'Cooking Class', desc: 'Learn to prepare traditional dishes', price: 'KSh 3,000' },
      { icon: '🛒', name: 'Artisan Market Tour', desc: 'Shop for handmade crafts with guide', price: 'KSh 1,000' },
      { icon: '📚', name: 'Heritage Walk', desc: 'Walking tour of historical sites', price: 'KSh 1,500' },
    ],
  };

  /* Amboseli-specific activities */
  if (slug === 'amboseli') {
    grid.innerHTML = `
      <div class="activity-card">
        <div class="activity-icon">🚙</div>
        <div class="activity-info">
          <div class="activity-name">Full-Day Game Drive</div>
          <div class="activity-desc">All-day guided drive with Kilimanjaro backdrop</div>
          <div class="activity-price">KSh 3,000</div>
        </div>
      </div>
      <div class="activity-card">
        <div class="activity-icon">🦅</div>
        <div class="activity-info">
          <div class="activity-name">Bird Watching Tour</div>
          <div class="activity-desc">Expert ornithologist-led birding walk</div>
          <div class="activity-price">KSh 2,000</div>
        </div>
      </div>
      <div class="activity-card">
        <div class="activity-icon">⛰️</div>
        <div class="activity-info">
          <div class="activity-name">Observation Hill Walk</div>
          <div class="activity-desc">Self-guided walk to the park viewpoint hill</div>
          <div class="activity-price">Free</div>
        </div>
      </div>
      <div class="activity-card">
        <div class="activity-icon">🐘</div>
        <div class="activity-info">
          <div class="activity-name">Elephant Research Visit</div>
          <div class="activity-desc">Behind-the-scenes with Amboseli elephant researchers</div>
          <div class="activity-price">KSh 3,500</div>
        </div>
      </div>
      <div class="activity-card">
        <div class="activity-icon">🌿</div>
        <div class="activity-info">
          <div class="activity-name">Swamp Nature Walk</div>
          <div class="activity-desc">Guided walk through Enkongo Narok swamp</div>
          <div class="activity-price">KSh 2,500</div>
        </div>
      </div>
    `;
    return;
  }

  /* Use category defaults for other destinations */
  const defaultKey = Object.keys(activityDefaults).find(k => cat.includes(k)) || 'safari';
  const activities = activityDefaults[defaultKey].slice(0, 6);

  grid.innerHTML = activities.map(a => `
    <div class="activity-card">
      <div class="activity-icon">${a.icon}</div>
      <div class="activity-info">
        <div class="activity-name">${a.name}</div>
        <div class="activity-desc">${a.desc}</div>
        <div class="activity-price">${a.price}</div>
      </div>
    </div>
  `).join('');
}

/* ────────────────────────────────────────
   RENDER AVAILABLE SERVICES
   Uses attraction.services / attraction.facilities field from Supabase,
   or generates a contextual default set based on the category.
──────────────────────────────────────── */
function renderServices(attraction) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  /* Parse services field — Supabase may return JSON string or array */
  let services = attraction.services || attraction.facilities;
  if (typeof services === 'string') {
    try { services = JSON.parse(services); } catch { services = null; }
  }

  /* Default services by category */
  const cat = (attraction.category || '').toLowerCase();
  const defaults = {
    safari: [
      { icon: '🚙', label: 'Game Drives' },
      { icon: '🏕️', label: 'Camping Sites' },
      { icon: '🍽️', label: 'Picnic Areas' },
      { icon: '🚻', label: 'Restrooms' },
      { icon: '👮', label: 'Park Rangers' },
      { icon: '🔭', label: 'Observation Decks' },
      { icon: '🛒', label: 'Curio Shops' },
      { icon: '📶', label: 'Visitor Centre' },
    ],
    beach: [
      { icon: '🏄', label: 'Water Sports' },
      { icon: '🤿', label: 'Snorkelling & Diving' },
      { icon: '🏖️', label: 'Beach Chairs & Umbrellas' },
      { icon: '🍹', label: 'Beach Bars' },
      { icon: '🚿', label: 'Shower Facilities' },
      { icon: '🐠', label: 'Marine Tours' },
      { icon: '🚑', label: 'First Aid Post' },
      { icon: '🅿️', label: 'Secure Parking' },
    ],
    mountain: [
      { icon: '🏔️', label: 'Guided Hiking' },
      { icon: '🏕️', label: 'Camping Huts' },
      { icon: '🧗', label: 'Rock Climbing' },
      { icon: '🔦', label: 'Equipment Hire' },
      { icon: '🌡️', label: 'Acclimatisation Support' },
      { icon: '🚒', label: 'Mountain Rescue' },
      { icon: '📷', label: 'Scenic Viewpoints' },
      { icon: '🧊', label: 'Glacier Tours' },
    ],
    cultural: [
      { icon: '🏛️', label: 'Museum & Exhibits' },
      { icon: '🎭', label: 'Cultural Performances' },
      { icon: '🛖', label: 'Village Tours' },
      { icon: '🍲', label: 'Traditional Cuisine' },
      { icon: '🛒', label: 'Artisan Market' },
      { icon: '📸', label: 'Guided Tours' },
      { icon: '📚', label: 'Library & Archives' },
      { icon: '♿', label: 'Accessibility Support' },
    ],
    adventure: [
      { icon: '🚵', label: 'Cycling Trails' },
      { icon: '🧗', label: 'Rock Climbing' },
      { icon: '🏊', label: 'Hot Springs' },
      { icon: '🛶', label: 'Canoe Hire' },
      { icon: '🔦', label: 'Equipment Rental' },
      { icon: '📷', label: 'Guided Hikes' },
      { icon: '🅿️', label: 'Secure Parking' },
      { icon: '🍽️', label: 'Picnic Spots' },
    ],
  };

  const defaultKey = Object.keys(defaults).find(k => cat.includes(k)) || 'safari';

  /* Use Supabase data if available and it is an array of objects with icon+label */
  let items = null;
  if (Array.isArray(services) && services.length > 0) {
    if (typeof services[0] === 'string') {
      /* Plain string array — wrap in objects */
      items = services.map(s => ({ icon: '✅', label: s }));
    } else if (services[0].label || services[0].name) {
      items = services.map(s => ({ icon: s.icon || '✅', label: s.label || s.name }));
    }
  }
  if (!items) items = defaults[defaultKey];

  grid.innerHTML = items.map(s => `
    <div class="service-item">
      <span class="service-icon">${s.icon}</span>
      <span class="service-label">${s.label}</span>
    </div>
  `).join('');
}

/* ────────────────────────────────────────
   RENDER SIMILAR DESTINATIONS
──────────────────────────────────────── */
function renderSimilar(similar) {
  const grid = document.getElementById('similar-grid');
  if (!grid || !similar || similar.length === 0) {
    if (grid) grid.innerHTML = '<p style="color:#999;font-size:.9rem">No similar destinations found.</p>';
    return;
  }

  grid.innerHTML = similar.map(a => `
    <a href="attraction-details.html?id=${a.slug}" class="sim-card fade-in">
      <div class="sim-img" style="background-image:url('${a.image_hero || ''}')">
        <span class="sim-badge ${(a.difficulty || '').toLowerCase()}">${a.difficulty || ''}</span>
      </div>
      <div class="sim-body">
        <div class="sim-name">${a.name}</div>
        <div class="sim-loc">📍 ${a.county || a.location || ''}</div>
        <div class="sim-row">
          <span class="sim-stars">★★★★★ ${a.rating || ''}</span>
          <span class="sim-price">KSh ${(a.price_min || 0).toLocaleString('en-KE')}–${(a.price_max || 0).toLocaleString('en-KE')}</span>
        </div>
        <span class="sim-link">Explore →</span>
      </div>
    </a>
  `).join('');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────
   BOOKING PANEL (Supabase user_bookings + local fallback)
──────────────────────────────────────── */
async function initBooking(a, toast, opts = {}) {
  let count     = 2;
  let basePrice = a.price_min || 0;
  let nights    = 3;

  let editMode = false;
  let bookingRow = null;

  const packages = {
    standard: { price: a.price_min,                          nights: 3 },
    premium:  { price: Math.round((a.price_min || 0) * 1.5), nights: 5 },
    luxury:   { price: a.price_max,                          nights: 7 },
    budget:   { price: Math.round((a.price_min || 0) * 0.7), nights: 2 }
  };

  const fmtK  = n => 'KSh ' + Math.round(n).toLocaleString('en-KE');
  const fmtD  = d => d.toISOString().split('T')[0];
  const today = new Date();
  const w1    = new Date(today); w1.setDate(today.getDate() + 7);
  const w2    = new Date(today); w2.setDate(today.getDate() + 10);

  const ci = document.getElementById('checkIn');
  const co = document.getElementById('checkOut');

  if (ci) { ci.value = fmtD(w1); ci.min = fmtD(today); }
  if (co) { co.value = fmtD(w2); co.min = fmtD(w1); }

  if (opts.bookingId && Auth.isLoggedIn && Auth.isLoggedIn()) {
    try {
      bookingRow = await Auth.getUserBookingById(opts.bookingId);
      if (!bookingRow) {
        toast('Booking not found.', 'error');
      } else if (bookingRow.attraction_slug !== a.slug) {
        toast('This booking is for a different destination.', 'error');
      } else {
        editMode = true;
        const banner = document.getElementById('bookingEditBanner');
        if (banner) banner.style.display = 'block';
        if (ci && bookingRow.check_in) ci.value = String(bookingRow.check_in).slice(0, 10);
        if (co && bookingRow.check_out) co.value = String(bookingRow.check_out).slice(0, 10);
        count = Math.max(1, Math.min(12, parseInt(bookingRow.guests, 10) || 1));
        const sr = document.getElementById('specialRequests');
        if (sr) sr.value = bookingRow.special_requests || '';
        const pkg = document.getElementById('packageType');
        if (pkg && bookingRow.package_type) pkg.value = bookingRow.package_type;
        const btn = document.getElementById('bookNowBtn');
        if (btn) btn.textContent = '💾 Save changes';
      }
    } catch (e) {
      console.warn(e);
      toast('Could not load booking for editing.', 'error');
    }
  }

  function getNights() {
    if (ci?.value && co?.value) {
      const diff = (new Date(co.value) - new Date(ci.value)) / 86400000;
      return diff > 0 ? Math.round(diff) : nights;
    }
    return nights;
  }

  function update() {
    const n     = getNights();
    const base  = basePrice * n * count;
    const tax   = Math.round(base * 0.0333);
    const total = base + tax;

    const priceKsh = document.querySelector('.price-ksh');
    if (priceKsh) priceKsh.textContent = `KSh ${Math.round(basePrice).toLocaleString('en-KE')}`;

    const el = id => document.getElementById(id);
    if (el('travCount'))  el('travCount').textContent  = count;
    if (el('pb-nights'))  el('pb-nights').textContent  = `${n} nights × ${count} traveler${count !== 1 ? 's' : ''}`;
    if (el('pb-label'))   el('pb-label').textContent   = `${fmtK(basePrice)} × ${n} nights × ${count}`;
    if (el('pbBase'))     el('pbBase').textContent     = fmtK(base);
    if (el('pb-tax'))     el('pb-tax').textContent     = fmtK(tax);
    if (el('pbTotal'))    el('pbTotal').textContent    = fmtK(total);

    const minus = el('travMinus');
    const plus  = el('travPlus');
    if (minus) minus.disabled = count <= 1;
    if (plus)  plus.disabled  = count >= 12;
  }

  document.getElementById('travMinus')?.addEventListener('click', () => { if (count > 1)  { count--; update(); } });
  document.getElementById('travPlus')?.addEventListener('click',  () => { if (count < 12) { count++; update(); } });

  document.getElementById('packageType')?.addEventListener('change', function () {
    const pkg = packages[this.value];
    if (pkg) {
      basePrice = pkg.price || 0;
      nights    = pkg.nights;
      if (ci?.value) {
        const d = new Date(ci.value);
        d.setDate(d.getDate() + pkg.nights);
        if (co) { co.min = ci.value; co.value = fmtD(d); }
      }
    }
    update();
  });

  ci?.addEventListener('change', function () {
    const d = new Date(this.value);
    d.setDate(d.getDate() + nights);
    if (co) { co.min = this.value; co.value = fmtD(d); }
    update();
  });
  co?.addEventListener('change', () => update());

  function buildBookingSelection() {
    return {
      attractionSlug: a.slug,
      attractionName: a.name,
      checkIn: ci?.value || '',
      checkOut: co?.value || '',
      guests: String(count),
      packageType: document.getElementById('packageType')?.value || 'standard',
      specialRequests: document.getElementById('specialRequests')?.value || ''
    };
  }

  const resumed = Auth.readResumedData();
  if (resumed?.data && !editMode) {
    if (resumed.data.checkIn && ci) ci.value = resumed.data.checkIn;
    if (resumed.data.checkOut && co) co.value = resumed.data.checkOut;
    if (resumed.data.guests) count = Math.max(1, parseInt(resumed.data.guests, 10) || count);
    if (resumed.data.packageType && document.getElementById('packageType')) {
      document.getElementById('packageType').value = resumed.data.packageType;
    }
  }

  document.getElementById('bookNowBtn')?.addEventListener('click', function () {
    if (!ci?.value || !co?.value) {
      toast('Please select your travel dates', 'info');
      return;
    }
    const specialReq = document.getElementById('specialRequests')?.value || '';

    if (editMode && bookingRow) {
      if (!Auth.isLoggedIn()) {
        toast('Please sign in to edit your booking.', 'info');
        return;
      }
      const btn = document.getElementById('bookNowBtn');
      const orig = btn.innerHTML;
      btn.textContent = '⏳ Saving...';
      btn.disabled = true;
      Auth.updateUserBooking(bookingRow.id, {
        check_in: ci.value,
        check_out: co.value,
        guests: count,
        special_requests: specialReq || null,
        package_type: document.getElementById('packageType')?.value || 'standard'
      }).then(function () {
        toast('Booking updated successfully.', 'success');
        btn.innerHTML = orig;
        btn.disabled = false;
      }).catch(function (err) {
        toast(err.message || 'Update failed', 'error');
        btn.innerHTML = orig;
        btn.disabled = false;
      });
      return;
    }

    Auth.requireAuth({ action: 'pay', data: buildBookingSelection() }, function () {
      const btn = document.getElementById('bookNowBtn');
      const orig = btn.innerHTML;
      btn.textContent = '⏳ Processing...';
      btn.disabled = true;
      btn.style.background = '#1ec99a';

      Auth.createUserBooking({
        user_id: Auth.getUser().id,
        attraction_slug: a.slug,
        attraction_name: a.name,
        check_in: ci.value,
        check_out: co.value,
        guests: count,
        special_requests: specialReq || null,
        package_type: document.getElementById('packageType')?.value || 'standard',
        status: 'confirmed'
      }).then(function (row) {
        const booking = {
          id: row.id,
          attraction: a.name,
          slug: a.slug,
          checkIn: ci.value,
          checkOut: co.value,
          guests: String(count),
          total: document.getElementById('pbTotal')?.textContent || '—',
          status: 'Confirmed',
          bookedAt: new Date().toISOString(),
          userName: Auth.getUser()?.user_metadata?.full_name || Auth.getUser()?.email || 'Guest'
        };
        try {
          const existing = JSON.parse(localStorage.getItem('sq_bookings') || '[]');
          existing.unshift(booking);
          localStorage.setItem('sq_bookings', JSON.stringify(existing));
        } catch (_) {}

        btn.innerHTML = orig;
        btn.disabled = false;
        btn.style.background = '';
        showBookingConfirmation(booking);
      }).catch(function (err) {
        toast(err.message || 'Could not complete booking. Apply the SQL migration if tables are missing.', 'error');
        btn.innerHTML = orig;
        btn.disabled = false;
        btn.style.background = '';
      });
    });
  });

  update();
}

/* ────────────────────────────────────────
   LIGHTBOX
──────────────────────────────────────── */
function initLightbox(images) {
  if (!images || images.length === 0) return;

  let current  = 0;
  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lbImg');
  const lbDots = document.getElementById('lbDots');
  if (!lb || !lbImg) return;

  /* Build dot navigation */
  lbDots.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'lb-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => setImg(i));
    lbDots.appendChild(dot);
  });

  function setImg(idx) {
    current  = (idx + images.length) % images.length;
    lbImg.src = images[current];
    document.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  const open  = idx => { setImg(idx); lb.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = ()  => { lb.classList.remove('open'); document.body.style.overflow = ''; };

  document.getElementById('openGallery')?.addEventListener('click',  () => open(0));
  document.getElementById('openGallery2')?.addEventListener('click', () => open(0));
  document.querySelectorAll('.gal-thumb').forEach((el, i) => el.addEventListener('click', () => open(i + 1)));
  document.getElementById('lbClose')?.addEventListener('click', close);
  document.getElementById('lbPrev')?.addEventListener('click',  () => setImg(current - 1));
  document.getElementById('lbNext')?.addEventListener('click',  () => setImg(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  setImg(current - 1);
    if (e.key === 'ArrowRight') setImg(current + 1);
    if (e.key === 'Escape')     close();
  });
}

/* ────────────────────────────────────────
   WISHLIST  (syncs to Supabase user_saved_destinations when signed in)
──────────────────────────────────────── */
function initWishlist(attraction, toast) {
  let saved = false;
  const btn = document.getElementById('wishlistBtn');
  if (!btn) return;

  function renderHeart(on) {
    btn.classList.toggle('saved', on);
    btn.innerHTML = on
      ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved!`
      : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Save to Wishlist`;
  }

  btn.addEventListener('click', async function () {
    if (!Auth.isLoggedIn || !Auth.isLoggedIn()) {
      toast('Sign in to save destinations to your account.', 'info');
      return;
    }
    const slug = attraction.slug;
    try {
      if (!saved) {
        await Auth.insertUserSavedDestination({
          user_id: Auth.getUser().id,
          attraction_slug: slug,
          attraction_name: attraction.name,
          image_url: attraction.image_hero || null
        });
        saved = true;
        renderHeart(true);
        toast('❤️ Saved! View it on your dashboard.', 'success');
      } else {
        await Auth.deleteUserSavedBySlug(slug);
        saved = false;
        renderHeart(false);
        toast('Removed from saved.', 'info');
      }
    } catch (e) {
      toast(e.message || 'Could not update saved list', 'error');
    }
  });
}

/* ────────────────────────────────────────
   SHARE
──────────────────────────────────────── */
function initShare(a, toast) {
  document.querySelector('.btn-share')?.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: a.name, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        const orig = this.innerHTML;
        this.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        setTimeout(() => { this.innerHTML = orig; }, 2000);
      });
    }
  });
}

/* ────────────────────────────────────────
   NEWSLETTER
──────────────────────────────────────── */
function initNewsletter(toast) {
  document.querySelector('.newsletter-btn')?.addEventListener('click', function () {
    const input = document.querySelector('.newsletter-input');
    if (input?.value.includes('@')) {
      toast('✓ Subscribed! Welcome aboard.', 'success');
      input.value = '';
    } else if (input) {
      input.classList.add('input-error');
      setTimeout(() => input.classList.remove('input-error'), 1500);
    }
  });

  document.querySelector('.btn-all-reviews')?.addEventListener('click', () => {
    toast('Full reviews coming soon!', 'info');
  });
}

/* ────────────────────────────────────────
   ERROR STATE
──────────────────────────────────────── */
function showError(message) {
  const hero = document.querySelector('.hero-content');
  if (hero) {
    hero.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Oops!</h2>
        <p>${message}</p>
        <a href="destinations.html" class="btn-book" style="display:inline-flex;text-decoration:none">← Back to Destinations</a>
      </div>`;
  }
}

/* ══════════════════════════════════════
   BOOKING CONFIRMATION MODAL
   Shows M-Pesa simulation after booking saved to localStorage
══════════════════════════════════════ */
function showBookingConfirmation(booking) {
  // Remove any existing modal
  document.getElementById('sq-booking-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'sq-booking-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;padding:20px;backdrop-filter:blur(4px);
  `;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;max-width:420px;width:100%;padding:32px;text-align:center;animation:slideUp .3s ease">
      <div style="font-size:3rem;margin-bottom:8px">🎉</div>
      <h2 style="color:#1a3c2e;margin:0 0 6px">Booking Confirmed!</h2>
      <p style="color:#666;margin:0 0 20px;font-size:.9rem">Booking ref: <strong>${booking.id}</strong></p>

      <div style="background:#f0f9f4;border-radius:12px;padding:16px;margin-bottom:24px;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666;font-size:.85rem">Destination</span>
          <span style="font-weight:600;font-size:.85rem">${booking.attraction}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666;font-size:.85rem">Check-in</span>
          <span style="font-weight:600;font-size:.85rem">${booking.checkIn}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666;font-size:.85rem">Check-out</span>
          <span style="font-weight:600;font-size:.85rem">${booking.checkOut}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#666;font-size:.85rem">Guests</span>
          <span style="font-weight:600;font-size:.85rem">${booking.guests}</span>
        </div>
      </div>

      <!-- M-Pesa simulation -->
      <div style="background:#4caf50;border-radius:12px;padding:16px;margin-bottom:20px;color:#fff">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px">🟢 M-Pesa Payment</div>
        <div style="font-size:.82rem;opacity:.9">A payment request has been sent to your M-Pesa.</div>
        <div style="font-size:.82rem;opacity:.9;margin-top:4px">Enter your PIN to complete the transaction.</div>
        <div style="background:rgba(255,255,255,.2);border-radius:8px;padding:10px;margin-top:12px">
          <div style="font-size:.78rem;opacity:.85">Transaction ID</div>
          <div style="font-size:1rem;font-weight:700;letter-spacing:2px">MP${booking.id}</div>
        </div>
      </div>

      <div style="display:flex;gap:12px">
        <button onclick="document.getElementById('sq-booking-modal').remove()"
          style="flex:1;padding:12px;border:2px solid #e0e0e0;border-radius:10px;background:#fff;cursor:pointer;font-size:.9rem">
          Close
        </button>
        <a href="dashboard.html"
          style="flex:1;padding:12px;background:#E8732A;color:#fff;border-radius:10px;text-decoration:none;font-size:.9rem;font-weight:600;display:inline-flex;align-items:center;justify-content:center">
          View My Bookings
        </a>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from { opacity:0; transform:translateY(30px); }
        to   { opacity:1; transform:translateY(0); }
      }
    </style>
  `;

  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
}

/* ════════════════════════════════════════════════
   ACCOMMODATION PREVIEW
   Renders up to 3 top accommodation cards inline on
   the attraction-details page, linking to the full
   accommodation.html?id=<slug> page.
════════════════════════════════════════════════ */

const ACCOM_PREVIEW_DB = {
  'maasai-mara': [
    {
      name: 'Mara Serena Safari Lodge',
      type: 'Lodge',
      stars: 5,
      featured: true,
      price_per_night: 52000,
      amenities: ['Pool', 'Full Board', 'Game Drives', 'Spa'],
      image_url: 'https://images.unsplash.com/photo-1599642884710-83507be2e1cc?w=800&q=80',
    },
    {
      name: 'Sarova Mara Game Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: false,
      price_per_night: 35000,
      amenities: ['En-suite Tents', 'Full Board', 'Bush Walks'],
      image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    },
    {
      name: 'Mara Budget Camp',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 6500,
      amenities: ['Breakfast Included', 'Secure Parking'],
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    },
  ],
  'amboseli': [
    {
      name: 'Amboseli Serena Safari Lodge',
      type: 'Lodge',
      stars: 5,
      featured: true,
      price_per_night: 48000,
      amenities: ['Pool', 'Kilimanjaro Views', 'Spa', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80',
    },
    {
      name: 'Ol Tukai Lodge',
      type: 'Lodge',
      stars: 4,
      featured: false,
      price_per_night: 30000,
      amenities: ['Pool', 'Restaurant', 'Elephant Viewing'],
      image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
    },
    {
      name: 'Satao Elerai Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: true,
      price_per_night: 25000,
      amenities: ['Private Conservancy', 'Night Drives'],
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    },
  ],
  'diani-beach': [
    {
      name: 'Baobab Beach Resort & Spa',
      type: 'Hotel',
      stars: 5,
      featured: true,
      price_per_night: 38000,
      amenities: ['Beachfront', 'Pool', 'Spa', 'Water Sports'],
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    },
    {
      name: 'The Sands at Chale Island',
      type: 'Luxury',
      stars: 5,
      featured: true,
      price_per_night: 55000,
      amenities: ['Private Island', 'All-inclusive', 'Snorkelling'],
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
      name: 'Diani Reef Beach Resort',
      type: 'Hotel',
      stars: 4,
      featured: false,
      price_per_night: 22000,
      amenities: ['Beachfront', 'Dive Centre', 'Bar'],
      image_url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80',
    },
  ],
  'mount-kenya': [
    {
      name: 'Fairmont Mount Kenya Safari Club',
      type: 'Hotel',
      stars: 5,
      featured: true,
      price_per_night: 62000,
      amenities: ['Equator View', 'Pool', 'Spa', 'Golf'],
      image_url: 'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80',
    },
    {
      name: 'Serena Mountain Lodge',
      type: 'Lodge',
      stars: 4,
      featured: true,
      price_per_night: 28000,
      amenities: ['Waterhole Views', 'Full Board', 'Guided Hikes'],
      image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    },
    {
      name: 'Mount Kenya Hostel',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 3500,
      amenities: ['Dorm & Private Rooms', 'Meals on Request'],
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    },
  ],
  'lamu-old-town': [
    {
      name: 'Peponi Hotel',
      type: 'Hotel',
      stars: 5,
      featured: true,
      price_per_night: 42000,
      amenities: ['Seafront', 'Swimming Pool', 'Restaurant', 'Dhow Trips'],
      image_url: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80',
    },
    {
      name: 'Lamu House Hotel',
      type: 'Hotel',
      stars: 4,
      featured: false,
      price_per_night: 25000,
      amenities: ['Rooftop Terrace', 'Traditional Architecture', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    },
    {
      name: 'Lamu Budget Guesthouse',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 5000,
      amenities: ['Breakfast', 'Fan Rooms', 'Courtyard'],
      image_url: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    },
  ],
  'nairobi-national-park': [
    {
      name: 'Nairobi Tented Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: true,
      price_per_night: 18000,
      amenities: ['Park Views', 'Full Board', 'Game Drives', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    },
    {
      name: 'Emara Ole-Sereni',
      type: 'Hotel',
      stars: 5,
      featured: true,
      price_per_night: 35000,
      amenities: ['Park-facing Rooms', 'Pool', 'Spa', 'Fine Dining'],
      image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    },
    {
      name: 'Nairobi Budget Inn',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 4000,
      amenities: ['Breakfast', 'Airport Shuttle', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    },
  ],
  'lake-nakuru': [
    {
      name: 'Sarova Lion Hill Game Lodge',
      type: 'Lodge',
      stars: 4,
      featured: true,
      price_per_night: 28000,
      amenities: ['Lake Views', 'Pool', 'Full Board', 'Flamingo Sightings'],
      image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    },
    {
      name: 'Lake Nakuru Lodge',
      type: 'Lodge',
      stars: 3,
      featured: false,
      price_per_night: 16000,
      amenities: ['Restaurant', 'Bar', 'Game Drives', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
    },
    {
      name: 'Flamingo Hill Tented Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: true,
      price_per_night: 22000,
      amenities: ['Tented Suites', 'Full Board', 'Flamingo Walks'],
      image_url: 'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80',
    },
  ],
  'tsavo': [
    {
      name: 'Voyager Ziwani Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: true,
      price_per_night: 30000,
      amenities: ['River Views', 'Full Board', 'Night Drives', 'Bush Breakfast'],
      image_url: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
    },
    {
      name: 'Satao Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: false,
      price_per_night: 24000,
      amenities: ['Waterhole Views', 'All Meals', 'Red Elephant Sightings'],
      image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    },
    {
      name: 'Tsavo Budget Bandas',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 5500,
      amenities: ['Self-catering', 'Secure Parking', 'Firewood'],
      image_url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
    },
  ],
  'samburu': [
    {
      name: 'Samburu Intrepids Camp',
      type: 'Tented Camp',
      stars: 5,
      featured: true,
      price_per_night: 55000,
      amenities: ['Riverfront', 'Full Board', 'Game Drives', 'Samburu Cultural Visits'],
      image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    },
    {
      name: 'Saruni Samburu',
      type: 'Lodge',
      stars: 5,
      featured: true,
      price_per_night: 68000,
      amenities: ['Hilltop Views', 'Private Pool', 'Walking Safaris', 'Spa'],
      image_url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80',
    },
    {
      name: 'Samburu Simba Lodge',
      type: 'Lodge',
      stars: 3,
      featured: false,
      price_per_night: 14000,
      amenities: ['Restaurant', 'Bar', 'Game Drives', 'Wi-Fi'],
      image_url: 'https://images.unsplash.com/photo-1612099197788-bde7f41d9710?w=800&q=80',
    },
  ],
  'hell-gate': [
    {
      name: 'Enashipai Resort & Spa',
      type: 'Hotel',
      stars: 5,
      featured: true,
      price_per_night: 32000,
      amenities: ['Spa', 'Pool', 'Lake Naivasha Views', 'Fine Dining'],
      image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    },
    {
      name: 'Crater Lake Tented Camp',
      type: 'Tented Camp',
      stars: 4,
      featured: false,
      price_per_night: 20000,
      amenities: ['Crater Views', 'Full Board', 'Cycling', 'Guided Gorge Hikes'],
      image_url: 'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80',
    },
    {
      name: 'Hell\'s Gate Budget Campsite',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 3000,
      amenities: ['Camping', 'Ablution Blocks', 'Firewood'],
      image_url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
    },
  ],
};

function renderAccomPreview(slug, attractionName) {
  const grid    = document.getElementById('accom-preview-grid');
  const link    = document.getElementById('accom-preview-link');
  const ctaBtn  = document.getElementById('accom-preview-cta');
  const accomUrl = `accommodation.html?id=${encodeURIComponent(slug)}`;

  /* Wire up the "View All" links */
  if (link)   link.href   = accomUrl;
  if (ctaBtn) ctaBtn.href = accomUrl;

  if (!grid) return;

  /* Get preview data — try Supabase first, fall back to local DB */
  const localData = ACCOM_PREVIEW_DB[slug] || buildGenericAccomPreview(slug, attractionName);
  const items = localData.slice(0, 3);

  if (!items || items.length === 0) {
    grid.innerHTML = '<p style="color:#999;font-size:.9rem">Accommodation details coming soon.</p>';
    return;
  }

  grid.innerHTML = items.map(a => {
    const stars   = parseInt(a.stars || 3, 10);
    const starStr = Array.from({ length: 5 }, (_, i) => i < stars ? '★' : '☆').join('');
    const price   = a.price_per_night || a.price_min || 0;
    const imgStyle = a.image_url
      ? `background-image:url('${a.image_url}')`
      : 'background:linear-gradient(135deg,#1a2e3b,#2a4a5e)';
    const ams = (a.amenities || []).slice(0, 3);
    const feat = a.featured
      ? '<span class="apc-featured">⭐ Featured</span>'
      : '';

    return `
      <div class="apc-card">
        <div class="apc-img" style="${imgStyle}">
          <span class="apc-type-badge">${a.type || 'Lodge'}</span>
          ${feat}
          <div class="apc-stars">${starStr}</div>
        </div>
        <div class="apc-body">
          <div class="apc-name">${a.name}</div>
          <div class="apc-amenities">
            ${ams.map(am => `<span class="apc-am">${am}</span>`).join('')}
          </div>
          <div class="apc-footer">
            <div class="apc-price-wrap">
              <span class="apc-price-from">From</span>
              <span class="apc-price-val">KSh ${price.toLocaleString('en-KE')}</span>
              <span class="apc-price-night">/night</span>
            </div>
            <a href="${accomUrl}" class="apc-book-btn">
              Book
              <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function buildGenericAccomPreview(slug, attractionName) {
  const name = attractionName || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return [
    {
      name: `${name} Safari Lodge`,
      type: 'Lodge',
      stars: 4,
      featured: true,
      price_per_night: 22000,
      amenities: ['Full Board', 'Game Drives', 'Pool'],
      image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    },
    {
      name: `${name} Tented Camp`,
      type: 'Tented Camp',
      stars: 3,
      featured: false,
      price_per_night: 14000,
      amenities: ['En-suite Tent', 'All Meals', 'Guided Walks'],
      image_url: 'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80',
    },
    {
      name: 'Budget Guesthouse',
      type: 'Budget',
      stars: 2,
      featured: false,
      price_per_night: 4500,
      amenities: ['Breakfast', 'Wi-Fi', 'Parking'],
      image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    },
  ];
}
