/* ============================================================
   ACCOMMODATION — accommodation.js
   Reads ?id=slug, fetches from Supabase (entry fees, services,
   accommodation), falls back to rich local data, renders a
   filterable grid with price-bracket tabs.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {

  /* ── Scroll-to-top ── */
  const scrollTopBtn = document.getElementById('accomScrollTop');
  window.addEventListener('scroll', () => {
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Hero bg slow-zoom ── */
  const heroBg = document.getElementById('accomHeroBg');
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);

  /* ── Toast helper ── */
  function toast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast ' + (type || 'info') + ' show';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ═══════════════════════════════════════
     1. READ SLUG FROM URL
  ═══════════════════════════════════════ */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('id');

  /* ── Update back button ── */
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.href = slug
    ? `attraction-details.html?id=${encodeURIComponent(slug)}`
    : 'destinations.html';

  if (!slug) {
    document.getElementById('accom-hero-title').textContent  = 'Accommodation';
    document.getElementById('accom-section-title').textContent = 'All Accommodation';
    renderCards(buildFallbackAccom('maasai-mara'));
    renderFees(buildFallbackFees('maasai-mara'));
    renderServices(buildFallbackServices('maasai-mara'));
    return;
  }

  /* ═══════════════════════════════════════
     2. FETCH DESTINATION INFO (for hero)
  ═══════════════════════════════════════ */
  let attractionName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  let attractionImg  = '';

  try {
    const attr = await db.getAttraction(slug);
    if (attr) {
      attractionName = attr.name;
      attractionImg  = attr.image_hero || '';
    }
  } catch (_) {}

  /* Update hero */
  document.title = `Accommodation near ${attractionName} — SafariQuest Kenya`;
  const heroTitle = document.getElementById('accom-hero-title');
  if (heroTitle) heroTitle.textContent = `Accommodation near ${attractionName}`;
  const heroSub = document.getElementById('accom-hero-sub');
  if (heroSub) heroSub.textContent =
    `Discover the best hotels, BnBs, lodges and camps near ${attractionName}.`;

  /* Breadcrumb */
  const bcDest = document.getElementById('breadcrumb-dest');
  if (bcDest) {
    bcDest.textContent = attractionName;
    bcDest.href = `attraction-details.html?id=${encodeURIComponent(slug)}`;
  }

  /* Hero background */
  if (heroBg && attractionImg) {
    heroBg.style.backgroundImage = `url('${attractionImg}')`;
  }

  /* Section title */
  const secTitle = document.getElementById('accom-section-title');
  if (secTitle) secTitle.textContent = `Where to Stay near ${attractionName}`;

  /* Fees sub */
  const feesSub = document.getElementById('fees-sub');
  if (feesSub) {
    const isFree = slug === 'diani-beach';
    feesSub.textContent = isFree
      ? 'Diani Beach is a public beach — there are no entry fees.'
      : `Current fees charged at the gate — payable via M-Pesa or card.`;
  }

  /* ═══════════════════════════════════════
     3. FETCH ENTRY FEES FROM SUPABASE
  ═══════════════════════════════════════ */
  let fees = [];
  try {
    if (typeof db !== 'undefined' && db.getEntryFees) {
      fees = await db.getEntryFees(slug);
    }
  } catch (_) {}
  if (!fees || fees.length === 0) fees = buildFallbackFees(slug);
  renderFees(fees);

  /* ═══════════════════════════════════════
     4. FETCH SERVICES FROM SUPABASE
  ═══════════════════════════════════════ */
  let services = [];
  try {
    if (typeof db !== 'undefined' && db.getDestinationServices) {
      services = await db.getDestinationServices(slug);
    }
  } catch (_) {}
  if (!services || services.length === 0) services = buildFallbackServices(slug);
  renderServices(services);

  /* ═══════════════════════════════════════
     5. FETCH ACCOMMODATIONS
  ═══════════════════════════════════════ */
  let accommodations = [];
  try {
    accommodations = await db.getAccommodations(slug);
  } catch (_) {}
  if (!accommodations || accommodations.length === 0) {
    accommodations = buildFallbackAccom(slug);
  }

  /* ═══════════════════════════════════════
     6. BRACKET TABS + FILTER CHIPS
  ═══════════════════════════════════════ */
  let activeBracket = 'all';
  let activeType    = 'all';
  const allCards    = accommodations;

  /* Price bracket mapping helper */
  function getBracket(item) {
    if (item.price_bracket) return item.price_bracket;
    const p = item.price_per_night || item.price_min || 0;
    if (p < 8000)  return 'budget';
    if (p < 25000) return 'mid_range';
    if (p < 60000) return 'upscale';
    return 'luxury';
  }

  function applyFilters() {
    let filtered = allCards.filter(a => {
      const bracket = getBracket(a);
      const type    = (a.type || a.category || '').toLowerCase();
      const matchB  = activeBracket === 'all' || bracket === activeBracket;
      const matchT  = activeType === 'all'
        || type.includes(activeType)
        || (a.price_label || '').toLowerCase().includes(activeType);
      return matchB && matchT;
    });
    renderCards(filtered);
  }

  /* Bracket tab listeners */
  document.getElementById('bracketTabs')?.querySelectorAll('.btab').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeBracket = this.dataset.b;
      applyFilters();
    });
  });

  /* Type chip listeners */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      activeType = this.dataset.filter;
      applyFilters();
    });
  });

  /* Initial render */
  applyFilters();

  /* ═══════════════════════════════════════
     7. RENDERERS
  ═══════════════════════════════════════ */

  /* — Entry fees — */
  function renderFees(feeData) {
    const grid = document.getElementById('fees-grid');
    if (!grid) return;

    const ORDER = { citizen: 0, resident: 1, non_resident: 2, child: 3 };
    const LABELS = {
      citizen:      { label: 'Kenya Citizen',        icon: '🇰🇪' },
      resident:     { label: 'East African Resident', icon: '🌍' },
      non_resident: { label: 'International Visitor', icon: '✈️'  },
      child:        { label: 'Child (Under 12)',      icon: '👶'  },
    };
    feeData.sort((a, b) => (ORDER[a.visitor_type] ?? 9) - (ORDER[b.visitor_type] ?? 9));

    grid.innerHTML = feeData.map(f => {
      const vm   = LABELS[f.visitor_type] || { label: f.visitor_type, icon: '🎫' };
      const free = Number(f.fee_ksh) === 0;
      const usd  = f.fee_usd ? `<div class="fee-card-usd">≈ $${Number(f.fee_usd).toLocaleString()}</div>` : '';
      return `
        <div class="fee-card${free ? ' free-entry' : ''}">
          <div class="fee-card-visitor">${vm.icon} ${vm.label}</div>
          <div class="fee-card-amount${free ? ' free' : ''}">
            ${free ? 'Free' : 'KSh ' + Number(f.fee_ksh).toLocaleString()}
            ${!free ? '<span>/ day</span>' : ''}
          </div>
          ${usd}
          <div class="fee-card-note">${f.notes || ''}</div>
        </div>`;
    }).join('');
  }

  /* — Services / activities — */
  function renderServices(svcData) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    if (!svcData.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = svcData.map(s => {
      const free = s.is_free || Number(s.fee_ksh) === 0;
      const fee  = free
        ? `<span class="svc-fee free">Free</span>`
        : `<span class="svc-fee">KSh ${Number(s.fee_ksh || 0).toLocaleString()}</span>`;
      return `
        <div class="svc-card">
          <div class="svc-icon">${s.icon || '⚡'}</div>
          <div class="svc-info">
            <div class="svc-name">${s.service_name}</div>
            <div class="svc-desc">${s.description || ''}</div>
            ${fee}
          </div>
        </div>`;
    }).join('');
  }

  /* — Accommodation cards — */
  function renderCards(items) {
    const grid  = document.getElementById('accom-grid');
    const count = document.getElementById('filter-count');
    if (!grid) return;
    if (count) count.textContent = `${items.length} option${items.length !== 1 ? 's' : ''}`;

    if (!items || items.length === 0) {
      grid.innerHTML = `
        <div class="accom-empty">
          <div class="accom-empty-icon">🏨</div>
          <h3>No accommodation found</h3>
          <p>Try a different filter, or contact our team for bespoke recommendations.</p>
        </div>`;
      return;
    }
    grid.innerHTML = items.map(a => buildCard(a)).join('');
  }

  function buildCard(a) {
    const starsN   = parseInt(a.stars || a.star_rating || a.rating || 3, 10);
    const starHTML = Array.from({ length: 5 }, (_, i) =>
      `<span class="accom-star">${i < starsN ? '★' : '☆'}</span>`).join('');

    const amenities = parseList(a.amenities).slice(0, 5);
    const amenHTML  = amenities.map(am => `<span class="amenity-tag">${am}</span>`).join('');

    const price    = a.price_per_night || a.price_min || 0;
    const bracket  = getBracket(a);
    const bracketLabels = {
      budget: '💚 Budget', mid_range: '⭐ Mid-Range',
      upscale: '💎 Upscale', luxury: '👑 Luxury',
    };
    const imgStyle  = a.image_url
      ? `background-image: url('${a.image_url}')`
      : `background: linear-gradient(135deg, #1a2e3b, #2a4a5e)`;
    const type      = a.type || a.category || 'Lodge';
    const featured  = (a.featured || a.is_featured)
      ? `<span class="accom-featured-badge">⭐ Featured</span>` : '';
    const distNote  = a.distance_note
      ? `<div class="accom-distance">📍 ${a.distance_note}</div>` : '';

    return `
      <div class="accom-card" data-type="${type.toLowerCase()}" data-bracket="${bracket}">
        <div class="accom-img" style="${imgStyle}">
          <span class="accom-img-badge">${type}</span>
          <span class="accom-bracket-badge ${bracket}">${bracketLabels[bracket] || ''}</span>
          ${featured}
          <div class="accom-stars">${starHTML}</div>
        </div>
        <div class="accom-body">
          <div class="accom-name">${a.name || 'Accommodation'}</div>
          <div class="accom-location">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            ${a.location || attractionName}
          </div>
          ${distNote}
          ${amenHTML ? `<div class="accom-amenities">${amenHTML}</div>` : ''}
          <div class="accom-footer">
            <div class="accom-price-block">
              <div class="accom-price-from">From</div>
              <div class="accom-price-value">KSh ${Number(price).toLocaleString('en-KE')}</div>
              <div class="accom-price-night">per night</div>
            </div>
            <button onclick="openMpesaModal({ bookingId: '${a.id || a.name}', bookingType: 'accommodation', amount: ${price}, name: '${(a.name || 'Accommodation').replace(/'/g, "\\'")}' })" class="accom-book-btn">
              Pay with M-Pesa
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  function parseList(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()).filter(Boolean); }
    }
    return [];
  }

}); // end DOMContentLoaded


/* ═══════════════════════════════════════════════════════════════
   FALLBACK DATA — shown when Supabase tables are absent / empty
   All three: fees, services, accommodation — keyed by slug
═══════════════════════════════════════════════════════════════ */

/* ── ENTRY FEES ─────────────────────────────────────────────── */
function buildFallbackFees(slug) {
  const FEES = {
    'maasai-mara': [
      { visitor_type:'citizen',      fee_ksh:540,  fee_usd:null, notes:'Kenya citizens — National ID required' },
      { visitor_type:'resident',     fee_ksh:2700, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:8640, fee_usd:70,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:2160, fee_usd:17,   notes:'Children under 12 (non-resident)' },
    ],
    'amboseli': [
      { visitor_type:'citizen',      fee_ksh:430,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:2150, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:6460, fee_usd:52,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:1615, fee_usd:13,   notes:'Children under 12 (non-resident)' },
    ],
    'lake-nakuru': [
      { visitor_type:'citizen',      fee_ksh:430,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:2150, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:5400, fee_usd:44,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:1350, fee_usd:11,   notes:'Children under 12 (non-resident)' },
    ],
    'tsavo': [
      { visitor_type:'citizen',      fee_ksh:430,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:2150, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:5400, fee_usd:44,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:1350, fee_usd:11,   notes:'Children under 12 (non-resident)' },
    ],
    'mount-kenya': [
      { visitor_type:'citizen',      fee_ksh:540,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:2700, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:8640, fee_usd:70,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:2160, fee_usd:17,   notes:'Children under 12' },
    ],
    'samburu': [
      { visitor_type:'citizen',      fee_ksh:430,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:2150, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:6460, fee_usd:52,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:1615, fee_usd:13,   notes:'Children under 12 (non-resident)' },
    ],
    'diani-beach': [
      { visitor_type:'citizen',      fee_ksh:0, fee_usd:null, notes:'Public beach — free entry' },
      { visitor_type:'resident',     fee_ksh:0, fee_usd:null, notes:'Public beach — free entry' },
      { visitor_type:'non_resident', fee_ksh:0, fee_usd:null, notes:'Public beach — free entry' },
      { visitor_type:'child',        fee_ksh:0, fee_usd:null, notes:'Free for all children' },
    ],
    'hells-gate': [
      { visitor_type:'citizen',      fee_ksh:215,  fee_usd:null, notes:'Kenya citizens' },
      { visitor_type:'resident',     fee_ksh:1080, fee_usd:null, notes:'East African residents' },
      { visitor_type:'non_resident', fee_ksh:2700, fee_usd:22,   notes:'International visitors' },
      { visitor_type:'child',        fee_ksh:675,  fee_usd:5.5,  notes:'Children under 12 (non-resident)' },
    ],
  };
  return FEES[slug] || FEES['maasai-mara'];
}

/* ── DESTINATION SERVICES ───────────────────────────────────── */
function buildFallbackServices(slug) {
  const SERVICES = {
    'maasai-mara': [
      { icon:'🚙', service_name:'Morning Game Drive',       description:'3-hour guided drive at dawn across the savanna',                        fee_ksh:3500,  is_free:false },
      { icon:'🎈', service_name:'Hot Air Balloon Safari',   description:'Sunrise balloon ride over the Mara with champagne breakfast',           fee_ksh:27000, is_free:false },
      { icon:'🏘️', service_name:'Maasai Village Tour',      description:'Cultural visit to an authentic boma with dance and crafts',             fee_ksh:1500,  is_free:false },
      { icon:'🌙', service_name:'Night Game Drive',         description:'After-dark drive to spot nocturnal predators',                          fee_ksh:4500,  is_free:false },
      { icon:'🥗', service_name:'Bush Breakfast',           description:'Gourmet breakfast served in the open bush at sunrise',                  fee_ksh:2500,  is_free:false },
      { icon:'🧺', service_name:'Picnic Sites',             description:'Designated picnic zones inside the reserve',                            fee_ksh:0,     is_free:true  },
    ],
    'amboseli': [
      { icon:'🚙', service_name:'Full-Day Game Drive',      description:'All-day guided drive with Kilimanjaro backdrop',                        fee_ksh:3000,  is_free:false },
      { icon:'🦅', service_name:'Bird Watching Tour',       description:'Expert ornithologist-led birding walk',                                 fee_ksh:2000,  is_free:false },
      { icon:'⛰️', service_name:'Observation Hill Walk',    description:'Self-guided walk to the park viewpoint hill',                           fee_ksh:0,     is_free:true  },
      { icon:'🐘', service_name:'Elephant Research Visit',  description:'Behind-the-scenes with Amboseli elephant researchers',                 fee_ksh:3500,  is_free:false },
      { icon:'🌿', service_name:'Swamp Nature Walk',        description:'Guided walk through Enkongo Narok swamp',                              fee_ksh:2500,  is_free:false },
    ],
    'lake-nakuru': [
      { icon:'🚙', service_name:'Game Drive',               description:'Guided drive through rhino sanctuary and flamingo shores',              fee_ksh:2500,  is_free:false },
      { icon:'🦩', service_name:'Flamingo Lakeside Walk',   description:'Ranger-led walk to the flamingo shore viewpoint',                      fee_ksh:1500,  is_free:false },
      { icon:'🦏', service_name:'Rhino Sanctuary Drive',    description:'Special access drive within the black rhino sanctuary',                 fee_ksh:3000,  is_free:false },
      { icon:'🧺', service_name:'Baboon Cliff Picnic',      description:'Scenic picnic site with panoramic lake views — free',                  fee_ksh:0,     is_free:true  },
      { icon:'🚶', service_name:'Guided Forest Walk',       description:'Ranger trail through the Acacia and Euphorbia woodland',               fee_ksh:1200,  is_free:false },
    ],
    'tsavo': [
      { icon:'🚙', service_name:'Full-Day Game Drive',      description:'All-day drive through Tsavo East or West',                             fee_ksh:3000,  is_free:false },
      { icon:'🐘', service_name:'Red Elephant Tracking',    description:'Track Tsavo\'s famous red-dusted elephants by vehicle',               fee_ksh:3500,  is_free:false },
      { icon:'🌊', service_name:'Mzima Springs Walk',       description:'Walk to the crystal-clear Mzima Springs hippo pool',                  fee_ksh:800,   is_free:false },
      { icon:'🧗', service_name:'Mudanda Rock Climb',       description:'Guided climb at Mudanda Rock for panoramic views',                    fee_ksh:2000,  is_free:false },
      { icon:'💧', service_name:'Lugard Falls Walk',        description:'Self-guided nature walk to the dramatic Lugard Falls — free',          fee_ksh:0,     is_free:true  },
    ],
    'mount-kenya': [
      { icon:'🏔️', service_name:'Summit Trek (Sirimon)',    description:'Multi-day trek to Point Lenana via Sirimon route',                    fee_ksh:5000,  is_free:false },
      { icon:'🚙', service_name:'Forest Zone Game Drive',   description:'4x4 drive through montane forest elephant habitat',                   fee_ksh:3000,  is_free:false },
      { icon:'🎣', service_name:'Trout Fishing',            description:'Guided trout fishing at Lake Ellis or Rutundu',                        fee_ksh:1500,  is_free:false },
      { icon:'🧗', service_name:'Technical Rock Climbing',  description:'Guided ascent of Batian or Nelion peaks',                             fee_ksh:8000,  is_free:false },
      { icon:'🌿', service_name:'Moorland Nature Walk',     description:'Guided walk through the moorland to the met station',                 fee_ksh:2500,  is_free:false },
    ],
    'samburu': [
      { icon:'🚙', service_name:'Morning Game Drive',       description:'Track Samburu\'s Special Five at dawn',                               fee_ksh:3500,  is_free:false },
      { icon:'🐪', service_name:'Camel Safari',             description:'Half-day camel ride through the dry Samburu savanna',                 fee_ksh:2500,  is_free:false },
      { icon:'🏘️', service_name:'Samburu Cultural Tour',    description:'Guided visit to an authentic Samburu homestead',                      fee_ksh:1500,  is_free:false },
      { icon:'🌊', service_name:'Ewaso River Walk',         description:'Guided walk along the Ewaso Nyiro River to spot crocodile',           fee_ksh:1200,  is_free:false },
      { icon:'🦅', service_name:'Bird Watching',            description:'350+ species including the Somali Ostrich',                           fee_ksh:2000,  is_free:false },
    ],
    'diani-beach': [
      { icon:'🤿', service_name:'Coral Reef Snorkelling',   description:'Guided snorkelling on Diani\'s fringing reef — gear included',        fee_ksh:3000,  is_free:false },
      { icon:'🐬', service_name:'Spinner Dolphin Cruise',   description:'Sunrise boat cruise to swim with wild spinner dolphins',               fee_ksh:4500,  is_free:false },
      { icon:'🪁', service_name:'Kitesurfing Lesson',       description:'2-hour beginner kitesurfing lesson on the flat lagoon',               fee_ksh:6000,  is_free:false },
      { icon:'⛵', service_name:'Glass Bottom Boat',        description:'1-hour reef tour on a traditional glass-bottomed boat',               fee_ksh:2500,  is_free:false },
      { icon:'🎣', service_name:'Deep Sea Fishing',         description:'Half-day deep sea fishing for marlin and sailfish',                   fee_ksh:12000, is_free:false },
      { icon:'🏖️', service_name:'Beach Access',             description:'Public beach — open and free for all visitors',                       fee_ksh:0,     is_free:true  },
    ],
    'hells-gate': [
      { icon:'🚴', service_name:'Gorge Cycling',            description:'Self-guided bicycle hire through Fischer\'s Tower gorge',             fee_ksh:800,   is_free:false },
      { icon:'🚶', service_name:'Guided Gorge Walk',        description:'Ranger-guided walk through Central and Little Hell\'s Gate gorge',   fee_ksh:1500,  is_free:false },
      { icon:'🧗', service_name:'Rock Climbing',            description:'Beginner and intermediate climbing on volcanic columns',              fee_ksh:2000,  is_free:false },
      { icon:'♨️', service_name:'Geothermal Spa (Olkaria)', description:'Soak in natural geothermal hot springs at Olkaria spa',             fee_ksh:1000,  is_free:false },
      { icon:'🦅', service_name:'Raptor Watching',          description:'Spot Lammergeier vultures and augur buzzards above the cliffs',      fee_ksh:1500,  is_free:false },
    ],
  };
  return SERVICES[slug] || [];
}

/* ── ACCOMMODATION ──────────────────────────────────────────── */
function buildFallbackAccom(slug) {
  const DATABASE = {

    'maasai-mara': [
      { name:'Angama Mara',              type:'Lodge',        stars:5, featured:true,  price_per_night:85000, price_bracket:'luxury',    location:'Oloololo Escarpment', distance_note:'Inside Reserve', amenities:['Infinity Pool','Butler','Gourmet Dining','Spa','Hot Air Balloon'], image_url:'https://images.unsplash.com/photo-1599642884710-83507be2e1cc?w=800&q=80' },
      { name:'Mara Serena Safari Lodge', type:'Lodge',        stars:5, featured:true,  price_per_night:38000, price_bracket:'upscale',   location:'Mara Triangle',       distance_note:'Inside Reserve', amenities:['Pool','WiFi','Restaurant','Game Drives','Spa','Bar'],             image_url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
      { name:'Mara Sopa Lodge',          type:'Lodge',        stars:4, featured:false, price_per_night:22000, price_bracket:'mid_range', location:'Ol Kiombo',           distance_note:'Inside Reserve', amenities:['Pool','Restaurant','Bar','WiFi','Game Drives'],                   image_url:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80' },
      { name:'Mara River Camp BnB',      type:'BnB',          stars:3, featured:false, price_per_night:12000, price_bracket:'mid_range', location:'Mara River',          distance_note:'Inside Reserve', amenities:['Full Board','Game Drives','WiFi','River Views','Laundry'],        image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Enkiama Mara Hotel',       type:'Hotel',        stars:3, featured:true,  price_per_night:14500, price_bracket:'mid_range', location:'Narok Town',          distance_note:'55 km from park gate', amenities:['Restaurant','Bar','WiFi','Pool','Parking'],              image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
      { name:'Sekenani Gate BnB',        type:'BnB',          stars:3, featured:false, price_per_night:5800,  price_bracket:'budget',    location:'Sekenani',            distance_note:'500 m from gate', amenities:['Full Board','Game Drive Pickup','WiFi','Campfire'],               image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
      { name:'Mara Talek Guesthouse',    type:'Guesthouse',   stars:2, featured:false, price_per_night:4200,  price_bracket:'budget',    location:'Talek',               distance_note:'1 km from Talek Gate', amenities:['WiFi','Breakfast','Rooftop Terrace'],                     image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Mara Crossings Camp',      type:'Tented Camp',  stars:4, featured:false, price_per_night:32000, price_bracket:'upscale',   location:'Mara River',          distance_note:'Inside Reserve', amenities:['River Views','Full Board','Game Drives','Bar'],                   image_url:'https://images.unsplash.com/photo-1612099197788-bde7f41d9710?w=800&q=80' },
      { name:'Mara Leisure Budget Camp', type:'Budget',       stars:2, featured:false, price_per_night:5500,  price_bracket:'budget',    location:'Talek Gate',          distance_note:'Adjacent to Talek Gate', amenities:['Camping Pitches','Restaurant','Shared Bathrooms'],       image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
    ],

    'amboseli': [
      { name:'Tortilis Camp',            type:'Tented Camp',  stars:5, featured:true,  price_per_night:42000, price_bracket:'luxury',    location:'Amboseli',            distance_note:'Private conservancy', amenities:['Plunge Pool','Spa','Wildlife Drives','Restaurant','Bar'],    image_url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
      { name:'Amboseli Serena Lodge',    type:'Lodge',        stars:5, featured:true,  price_per_night:28000, price_bracket:'upscale',   location:'Inside Amboseli NP',  distance_note:'Park interior',      amenities:['Pool','Spa','Restaurant','Bar','WiFi','Game Drives'],         image_url:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80' },
      { name:'Ol Tukai Lodge',           type:'Lodge',        stars:4, featured:false, price_per_night:24000, price_bracket:'upscale',   location:'Inside Amboseli NP',  distance_note:'Park interior',      amenities:['Pool','Restaurant','Bar','WiFi','Game Drives'],               image_url:'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80' },
      { name:'Sentrim Amboseli Camp',    type:'BnB',          stars:3, featured:false, price_per_night:14000, price_bracket:'mid_range', location:'Kimana',              distance_note:'10 km from gate',    amenities:['Full Board','Game Drives','WiFi','Cultural Evenings'],         image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Kilimanjaro View BnB',     type:'BnB',          stars:3, featured:false, price_per_night:6500,  price_bracket:'budget',    location:'Loitokitok',          distance_note:'15 km from boundary',amenities:['Full Breakfast','Mountain Views','WiFi','Guided Walks'],      image_url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
      { name:'Namanga River Hotel',      type:'Hotel',        stars:2, featured:false, price_per_night:5000,  price_bracket:'budget',    location:'Namanga',             distance_note:'At border crossing', amenities:['Restaurant','WiFi','Parking','24hr Reception'],               image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
      { name:'Amboseli Eco Camp BnB',    type:'BnB',          stars:3, featured:true,  price_per_night:10500, price_bracket:'mid_range', location:'Kimana',              distance_note:'12 km from gate',    amenities:['Full Board','Solar Power','WiFi','Community Tours'],           image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
      { name:'Amboseli Budget Lodge',    type:'Budget',       stars:2, featured:false, price_per_night:4000,  price_bracket:'budget',    location:'Kimana Gate',         distance_note:'At Kimana Gate',     amenities:['Breakfast','Parking','Basic Amenities'],                      image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
    ],

    'lake-nakuru': [
      { name:'Sarova Lion Hill Lodge',   type:'Lodge',        stars:4, featured:true,  price_per_night:28000, price_bracket:'upscale',   location:'Lake Nakuru NP',      distance_note:'Inside park',        amenities:['Lake Views','Pool','Full Board','Game Drives'],               image_url:'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80' },
      { name:'Lake Nakuru Lodge',        type:'Lodge',        stars:4, featured:false, price_per_night:20000, price_bracket:'upscale',   location:'Lake Nakuru NP',      distance_note:'Inside park',        amenities:['Pool','Restaurant','Bar','WiFi','Cultural Shows'],            image_url:'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80' },
      { name:'Flamingo Hill Tented Camp',type:'Tented Camp',  stars:4, featured:true,  price_per_night:15000, price_bracket:'mid_range', location:'Lake Nakuru',         distance_note:'3 km from flamingo shore', amenities:['Full Board','Game Drives','Bar','WiFi'],               image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
      { name:'Merica Hotel Nakuru',      type:'Hotel',        stars:4, featured:true,  price_per_night:12500, price_bracket:'mid_range', location:'Nakuru Town',         distance_note:'7 km from main gate', amenities:['Pool','Rooftop Bar','Restaurant','WiFi','Parking'],          image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name:'Nakuru Milimani BnB',      type:'BnB',          stars:3, featured:false, price_per_night:6000,  price_bracket:'budget',    location:'Milimani',            distance_note:'5 km from main gate', amenities:['Full Breakfast','Garden','WiFi','Parking'],                  image_url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
      { name:'Kunste Hotel Nakuru',      type:'Hotel',        stars:3, featured:false, price_per_night:9000,  price_bracket:'mid_range', location:'Nakuru Town',         distance_note:'6 km from main gate', amenities:['Restaurant','Bar','WiFi','Conference Room','Parking'],       image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Green Valley Guesthouse',  type:'Guesthouse',   stars:2, featured:false, price_per_night:4200,  price_bracket:'budget',    location:'Nakuru Town',         distance_note:'8 km from main gate', amenities:['WiFi','Breakfast Available','Parking'],                      image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Nakuru Budget Campsite',   type:'Budget',       stars:2, featured:false, price_per_night:3500,  price_bracket:'budget',    location:'Nakuru Town',         distance_note:'9 km from main gate', amenities:['Self-Catering','Shared Ablutions','Secure Compound'],        image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
    ],

    'tsavo': [
      { name:'Finch Hattons Luxury Camp',type:'Tented Camp',  stars:5, featured:true,  price_per_night:78000, price_bracket:'luxury',    location:'Tsavo West',          distance_note:'Inside park',        amenities:['Private Pool','Butler','Gourmet Dining','Bar','Spa'],         image_url:'https://images.unsplash.com/photo-1612099197788-bde7f41d9710?w=800&q=80' },
      { name:'Satao Camp Tsavo',         type:'Tented Camp',  stars:4, featured:false, price_per_night:34000, price_bracket:'upscale',   location:'Tsavo East',          distance_note:'Inside park — water pan', amenities:['Waterhole','All Meals','Game Drives','Bar','Pool'],       image_url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
      { name:'Voi Safari Lodge',         type:'Lodge',        stars:4, featured:true,  price_per_night:19000, price_bracket:'mid_range', location:'Tsavo East',          distance_note:'Inside park — hilltop', amenities:['Pool','Waterhole View','Restaurant','Bar','WiFi'],         image_url:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80' },
      { name:'Maneaters Hotel Tsavo',    type:'Hotel',        stars:3, featured:true,  price_per_night:9500,  price_bracket:'mid_range', location:'Voi Town',            distance_note:'3 km from Voi Gate', amenities:['Restaurant','Bar','WiFi','Garden','Parking'],                 image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name:'Voi Town Guesthouse',      type:'Guesthouse',   stars:2, featured:false, price_per_night:3800,  price_bracket:'budget',    location:'Voi Town',            distance_note:'2 km from Voi Gate', amenities:['WiFi','Parking','Breakfast Optional'],                        image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Mtito Andei Guest Lodge',  type:'Guesthouse',   stars:2, featured:false, price_per_night:4200,  price_bracket:'budget',    location:'Mtito Andei',         distance_note:'Adjacent to Tsavo West gate', amenities:['WiFi','Restaurant','Parking'],                    image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Hunters Lodge BnB',        type:'BnB',          stars:3, featured:false, price_per_night:6500,  price_bracket:'budget',    location:'Kiboko',              distance_note:'75 km from Mtito gate', amenities:['River Pool','Restaurant','Bar','WiFi','Parking'],          image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
      { name:'Ndara Plains Tented Camp', type:'Budget',       stars:2, featured:false, price_per_night:6500,  price_bracket:'budget',    location:'Tsavo East buffer',   distance_note:'Borders Tsavo East',  amenities:['Self-Catering','Campfire','Parking','Wildlife'],             image_url:'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80' },
    ],

    'mount-kenya': [
      { name:'Fairmont Mt Kenya Safari Club', type:'Hotel',   stars:5, featured:true,  price_per_night:65000, price_bracket:'luxury',    location:'Nanyuki',             distance_note:'25 km from park gate', amenities:['Golf','Spa','Pool','Horse Riding','Fine Dining','WiFi'],   image_url:'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80' },
      { name:'Serena Mountain Lodge',    type:'Lodge',        stars:5, featured:true,  price_per_night:32000, price_bracket:'upscale',   location:'Inside Mt Kenya NP',  distance_note:'Park interior',      amenities:['Waterhole','Restaurant','Bar','Guided Treks','WiFi'],         image_url:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80' },
      { name:'Sportsman Arms Hotel',     type:'Hotel',        stars:4, featured:true,  price_per_night:13000, price_bracket:'mid_range', location:'Nanyuki',             distance_note:'35 km from park gate', amenities:['Pool','Restaurant','Bar','Fireplace','WiFi','Parking'],    image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name:'Nanyuki River BnB',        type:'BnB',          stars:3, featured:false, price_per_night:9500,  price_bracket:'mid_range', location:'Nanyuki',             distance_note:'On the equator line', amenities:['Full Board','Camel Rides','Fly Fishing','WiFi','Garden'],   image_url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
      { name:'Mountain Rock BnB',        type:'BnB',          stars:3, featured:false, price_per_night:6000,  price_bracket:'budget',    location:'Naro Moru',           distance_note:'3 km from park gate', amenities:['Full Breakfast','Trek Advice','Campfire','WiFi'],           image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Naro Moru River Lodge',    type:'Guesthouse',   stars:3, featured:false, price_per_night:7000,  price_bracket:'budget',    location:'Naro Moru',           distance_note:'At Naro Moru trailhead', amenities:['Restaurant','Bar','WiFi','Equipment Hire','Camping'],   image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Sirimon Bandas (KWS)',     type:'Budget',       stars:2, featured:false, price_per_night:3500,  price_bracket:'budget',    location:'Sirimon Gate',        distance_note:'At Sirimon trailhead', amenities:['Self-Catering','Parking','Campfire','Ranger Briefing'],   image_url:'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80' },
      { name:'Mt Kenya Wildlife Club',   type:'Hotel',        stars:3, featured:false, price_per_night:11000, price_bracket:'mid_range', location:'Nanyuki',             distance_note:'30 km from park gate', amenities:['Pool','Restaurant','Bar','Wildlife Grounds','WiFi'],       image_url:'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80' },
    ],

    'samburu': [
      { name:'Elephant Bedroom Camp',    type:'Tented Camp',  stars:5, featured:true,  price_per_night:55000, price_bracket:'luxury',    location:'Samburu NR',          distance_note:'Inside reserve',     amenities:['Elephant Encounters','Full Board','Game Drives','Bar','Pool'],image_url:'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80' },
      { name:'Samburu Serena Lodge',     type:'Lodge',        stars:5, featured:false, price_per_night:35000, price_bracket:'upscale',   location:'Samburu NR',          distance_note:'Inside reserve',     amenities:['Pool','Spa','Restaurant','Bar','WiFi','Game Drives'],         image_url:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80' },
      { name:'Samburu Sopa Lodge',       type:'Lodge',        stars:4, featured:false, price_per_night:20000, price_bracket:'mid_range', location:'Samburu NR',          distance_note:'Inside reserve',     amenities:['Pool','Restaurant','Bar','WiFi'],                             image_url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
      { name:'Samburu Riverside BnB',    type:'BnB',          stars:3, featured:true,  price_per_night:11000, price_bracket:'mid_range', location:"Archer's Post",       distance_note:'500 m from reserve gate', amenities:['Full Board','River Views','Hippo Watching','WiFi'],       image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
      { name:"Isiolo Frontier Hotel",    type:'Hotel',        stars:3, featured:false, price_per_night:9500,  price_bracket:'mid_range', location:'Isiolo',              distance_note:'45 km from reserve gate', amenities:['Restaurant','Bar','WiFi','Rooftop Terrace','Parking'],  image_url:'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80' },
      { name:"Archer's Post Guesthouse", type:'Guesthouse',   stars:2, featured:false, price_per_night:3800,  price_bracket:'budget',    location:"Archer's Post",       distance_note:'1 km from reserve boundary', amenities:['WiFi','Parking','Breakfast','Game Drive Transfers'], image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Samburu Budget Camp',      type:'Budget',       stars:2, featured:false, price_per_night:6000,  price_bracket:'budget',    location:"Archer's Post",       distance_note:'2 km from reserve gate', amenities:['Shared Facilities','Meals on Request','Secure Parking'],  image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
    ],

    'diani-beach': [
      { name:'Leopard Beach Resort & Spa', type:'Hotel',      stars:5, featured:true,  price_per_night:32000, price_bracket:'luxury',    location:'Diani Beach',         distance_note:'Beachfront',         amenities:['Beachfront','3 Pools','Spa','6 Restaurants','Watersports'],   image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
      { name:'Baobab Beach Resort & Spa', type:'Hotel',       stars:5, featured:true,  price_per_night:28000, price_bracket:'luxury',    location:'Diani Beach',         distance_note:'Beachfront',         amenities:['Pool','Spa','Watersports','Restaurant','Bar','WiFi'],         image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
      { name:'Swahili Beach Resort',      type:'Hotel',       stars:4, featured:false, price_per_night:15000, price_bracket:'mid_range', location:'Diani Beach',         distance_note:'Beachfront',         amenities:['Rooftop Pool','Restaurant','Bar','WiFi','Beach Access'],      image_url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80' },
      { name:'Diani Blue Hotel',          type:'Hotel',       stars:3, featured:false, price_per_night:11500, price_bracket:'mid_range', location:'Diani Beach',         distance_note:'On beach road',      amenities:['Rooftop Pool','Restaurant','Dive Centre','Bar','WiFi'],       image_url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
      { name:'Colobus Cottage BnB',       type:'BnB',         stars:3, featured:true,  price_per_night:9500,  price_bracket:'mid_range', location:'Diani Beach',         distance_note:'150 m from beach',   amenities:['Full Breakfast','Garden','WiFi','Monkey Viewing'],            image_url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
      { name:'Diani Sea Resort',          type:'Budget',      stars:3, featured:false, price_per_night:9000,  price_bracket:'budget',    location:'Diani',               distance_note:'Short walk to beach',amenities:['Pool','Restaurant','WiFi','Parking'],                          image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
      { name:'Diani Backpackers',         type:'Guesthouse',  stars:2, featured:false, price_per_night:4500,  price_bracket:'budget',    location:'Diani Beach',         distance_note:'200 m from beach',   amenities:['Dorms Available','WiFi','Common Kitchen','Bar','Bonfire'],    image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Ukunda Guesthouse',         type:'Guesthouse',  stars:2, featured:false, price_per_night:3800,  price_bracket:'budget',    location:'Ukunda',              distance_note:'10 min matatu to beach', amenities:['WiFi','Parking','Breakfast Available'],                  image_url:'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80' },
    ],

    'hells-gate': [
      { name:"Great Rift Valley Lodge",  type:'Lodge',        stars:5, featured:true,  price_per_night:38000, price_bracket:'luxury',    location:'Naivasha Highlands',  distance_note:'20 km from park gate', amenities:['Pool','Golf','Restaurant','Spa','Bar','WiFi'],            image_url:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80' },
      { name:'Naivasha Sopa Resort',     type:'Hotel',        stars:4, featured:false, price_per_night:18000, price_bracket:'mid_range', location:'Lake Naivasha',       distance_note:'10 km from park gate', amenities:['Pool','Restaurant','Bar','WiFi','Boat Rides'],            image_url:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80' },
      { name:"Lake Naivasha Country Club",type:'Hotel',       stars:4, featured:false, price_per_night:16000, price_bracket:'mid_range', location:'Lake Naivasha',       distance_note:'12 km from park gate', amenities:['Pool','Restaurant','Bar','Boat Hire','WiFi'],            image_url:'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80' },
      { name:"Fisherman's Camp Hotel",   type:'Hotel',        stars:3, featured:true,  price_per_night:12000, price_bracket:'mid_range', location:'Lake Naivasha',       distance_note:'9 km from park gate', amenities:['Restaurant','Bar','Boat Trips','Hippo Spotting','WiFi'],   image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name:"Kongoni Game BnB",         type:'BnB',          stars:3, featured:false, price_per_night:10000, price_bracket:'mid_range', location:'Kongoni',             distance_note:'5 km from park gate', amenities:['Full Board','Game Walks','WiFi','Campfire','Wildlife'],     image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
      { name:'Elsamere BnB',             type:'BnB',          stars:3, featured:false, price_per_night:7500,  price_bracket:'budget',    location:'Lake Naivasha',       distance_note:'10 km from park gate', amenities:['Lake Views','Breakfast','Nature Walks','Museum','WiFi'],  image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
      { name:'Crayfish Camp',            type:'Budget',       stars:2, featured:false, price_per_night:5500,  price_bracket:'budget',    location:'Lake Naivasha',       distance_note:'8 km from park gate', amenities:['Camping','Bandas','Restaurant','Bar','Boat Rides'],        image_url:'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80' },
      { name:'Naivasha Budget Inn',      type:'Guesthouse',   stars:2, featured:false, price_per_night:3500,  price_bracket:'budget',    location:'Naivasha Town',       distance_note:'15 km from park gate', amenities:['WiFi','Parking','Breakfast Optional'],                   image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
    ],

    /* Keep original slugs for backwards compatibility */
    'hell-gate': [],   /* filled below */
    'nairobi-national-park': [
      { name:'Emara Ole-Sereni',         type:'Hotel',        stars:5, featured:true,  price_per_night:35000, price_bracket:'upscale',   location:'Mombasa Road, Nairobi',distance_note:'Park-facing',       amenities:['Park Views','Infinity Pool','Spa','Fine Dining','Business Centre'], image_url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
      { name:'Nairobi Tented Camp',      type:'Tented Camp',  stars:4, featured:true,  price_per_night:18000, price_bracket:'mid_range', location:'Inside Nairobi NP',   distance_note:'Inside park',       amenities:['Park Views','Full Board','Game Drives','Night Safari','WiFi'],  image_url:'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80' },
      { name:'Boma Inn Nairobi',         type:'Hotel',        stars:3, featured:false, price_per_night:9000,  price_bracket:'mid_range', location:'Langata Road, Nairobi',distance_note:'Near park gate',    amenities:['Pool','Restaurant','Bar','Free Parking','WiFi'],              image_url:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80' },
      { name:'Nairobi Budget Inn',       type:'Budget',       stars:2, featured:false, price_per_night:4000,  price_bracket:'budget',    location:'Karen, Nairobi',      distance_note:'Near Karen Gate',   amenities:['Breakfast Included','Airport Shuttle','Safe Parking','WiFi'],  image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
    ],
    'lamu-old-town': [
      { name:'Peponi Hotel',             type:'Hotel',        stars:5, featured:true,  price_per_night:42000, price_bracket:'luxury',    location:'Shela Beach, Lamu',   distance_note:'Beachfront',        amenities:['Seafront Terrace','Pool','Fine Dining','Dhow Trips'],         image_url:'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80' },
      { name:'Lamu House Hotel',         type:'Hotel',        stars:4, featured:false, price_per_night:25000, price_bracket:'upscale',   location:'Lamu Old Town',       distance_note:'Old Town',          amenities:['Rooftop Terrace','Swahili Architecture','WiFi','Breakfast'],  image_url:'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
      { name:'Kijani House',             type:'Hotel',        stars:4, featured:true,  price_per_night:32000, price_bracket:'upscale',   location:'Shela Village, Lamu', distance_note:'Seafront',          amenities:['Garden Pool','Sea Views','Snorkelling','Boat Hire','WiFi'],   image_url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
      { name:'Lamu Budget Guesthouse',   type:'Budget',       stars:2, featured:false, price_per_night:5000,  price_bracket:'budget',    location:'Lamu Old Town',       distance_note:'Old Town centre',   amenities:['Breakfast Included','Fan Rooms','Courtyard'],                 image_url:'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80' },
    ],
  };

  /* hell-gate alias → hells-gate data */
  DATABASE['hell-gate'] = DATABASE['hells-gate'];

  if (DATABASE[slug]) return DATABASE[slug];

  /* Generic fallback for any unrecognised slug */
  return [
    { name:'Wilderness Lodge',   type:'Lodge',       stars:4, featured:true,  price_per_night:20000, price_bracket:'mid_range', location:'Near ' + slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), amenities:['Full Board','Game Drives','Pool','WiFi'], image_url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
    { name:'Explorer Tented Camp',type:'Tented Camp', stars:3, featured:false, price_per_night:12000, price_bracket:'mid_range', location:'Near the reserve', amenities:['En-suite Tent','All Meals','Guided Walks'], image_url:'https://images.unsplash.com/photo-1529083891485-9c1c49d3c4e6?w=800&q=80' },
    { name:'Local BnB',           type:'BnB',         stars:3, featured:false, price_per_night:7500,  price_bracket:'budget',    location:'Nearest town',     amenities:['Full Breakfast','WiFi','Parking'],           image_url:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
    { name:'Budget Guesthouse',   type:'Budget',      stars:2, featured:false, price_per_night:4500,  price_bracket:'budget',    location:'Nearest town',     amenities:['Breakfast','Parking','WiFi'],                image_url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
  ];
}