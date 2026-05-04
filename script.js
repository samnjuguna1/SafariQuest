/* ============================================================
   SAFARIQUEST — script.js
   ============================================================ */

/* ─────────────────────────────────────────
   DATA: DESTINATIONS
───────────────────────────────────────── */
const destinations = [
  {
    name:   'Maasai Mara',
    tag:    'Safari Tours',
    rating: 4.8,
    stars:  5,
    slug:   'maasai-mara',
    img:    'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=80'
  },
  {
    name:   'Diani Beach',
    tag:    'Beach Paradise',
    rating: 4.6,
    stars:  4,
    slug:   'diani-beach',
    img:    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80'
  },
  {
    name:   'Mount Kenya',
    tag:    'Mountain Adventure',
    rating: 4.9,
    stars:  5,
    slug:   'mount-kenya',
    img:    'https://images.unsplash.com/photo-1606826995389-47c33af60af9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TW91bnQlMjBLZW55YXxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name:   'Lake Nakuru',
    tag:    'Flamingo Paradise',
    rating: 4.7,
    stars:  4,
    slug:   'lake-nakuru',
    img:    'https://plus.unsplash.com/premium_photo-1661846340419-89bf27138124?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFrZSUyMG5ha3VydXxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name:   'Amboseli National Park',
    tag:    'Elephant Safari',
    rating: 4.8,
    stars:  5,
    slug:   'amboseli',
    img:    'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=600&q=80'
  },
  {
    name:   'Samburu National Reserve',
    tag:    'Rare Wildlife',
    rating: 4.7,
    stars:  4,
    slug:   'samburu',
    img:    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80'
  }
];

/* ─────────────────────────────────────────
   DATA: EVENTS — fetched from Supabase (see getEvents in supabase-client.js)
───────────────────────────────────────── */

/** Max cards for homepage Events + Reviews sections (3–4 each) */
const HOME_EVENTS_LIMIT = 4;
const HOME_REVIEWS_LIMIT = 4;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCompactCount(n) {
  const x = Number(n) || 0;
  if (x >= 1_000_000) return (x / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (x >= 10_000) return Math.round(x / 1000) + 'K+';
  if (x >= 1000) return (x / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return String(x);
}

function formatEventDateDisplay(iso) {
  if (!iso) return '';
  const s = String(iso);
  try {
    const d = new Date(s.length === 10 ? s + 'T12:00:00' : s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function titleCaseWords(str) {
  if (!str) return '';
  return String(str).replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}
function renderStars(count, total = 5) {
  return Array.from({ length: total }, (_, i) =>
    `<span style="color:${i < count ? '#F5A623' : '#ddd'}">&#9733;</span>`
  ).join('');
}

function calendarIcon() {
  return `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>`;
}

function pinIcon() {
  return `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  </svg>`;
}

/* ─────────────────────────────────────────
   RENDER: DESTINATION CARDS
───────────────────────────────────────── */
function buildDestCard(dest, grid) {
  const slug  = dest.slug || dest.id || '';
  const name  = dest.name || dest.title || 'Destination';
  const tag   = dest.category || dest.tag || 'Safari';
  const img   = dest.image_hero || dest.img || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80&auto=format';
  const stars = dest.stars || Math.round(dest.rating || 4.5);
  const rating = dest.rating || dest.stars || 4.5;

  const card = document.createElement('div');
  card.className = 'dest-card';
  card.style.cursor = 'pointer';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', 'View ' + name);

  card.innerHTML = `
    <div class="dest-img-wrap">
      <img src="${img}" alt="${name}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80&auto=format'" />
      <div class="dest-overlay">
        <h3>${name}</h3>
        <span>${tag}</span>
      </div>
    </div>
    <div class="dest-footer">
      <span class="stars">${renderStars(stars)}</span>
      <span class="rating">${Number(rating).toFixed(1)}</span>
    </div>
  `;

  const navigate = () => { window.location.href = 'attraction-details.html?id=' + slug; };
  card.addEventListener('click', navigate);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
  });
  grid.appendChild(card);
}

async function renderDestinations() {
  const grid = document.getElementById('destGrid');
  if (!grid) return;

  /* Show skeletons while loading */
  grid.innerHTML = Array(6).fill(
    '<div class="dest-card" style="opacity:0.4;pointer-events:none;"><div class="dest-img-wrap" style="background:#e0e0e0;height:200px;border-radius:8px;"></div></div>'
  ).join('');

  let data = [];
  try {
    if (window.db && typeof window.db.getAttractions === 'function') {
      data = await window.db.getAttractions({ limit: 6, order: 'rating.desc' });
    }
  } catch (e) {
    console.warn('[script.js] Supabase destinations failed, using fallback:', e.message);
  }

  grid.innerHTML = '';

  /* Fall back to hardcoded if Supabase returned nothing */
  if (!data || data.length === 0) {
    destinations.forEach(dest => buildDestCard(dest, grid));
    return;
  }

  data.slice(0, 6).forEach(dest => buildDestCard(dest, grid));
}

/* ─────────────────────────────────────────
   SEARCH WITH SUPABASE SUGGESTIONS
───────────────────────────────────────── */

/* Cache so we don't re-fetch on every keystroke */
let _attractionsCache = null;

async function fetchAttractions() {
  if (_attractionsCache) return _attractionsCache;
  try {
    _attractionsCache = await db.getAttractions();
    return _attractionsCache;
  } catch {
    /* Fall back to local destinations array so search still works offline */
    _attractionsCache = destinations.map(d => ({
      slug: d.slug, name: d.name,
      region: '', category: d.tag,
      image_hero: d.img
    }));
    return _attractionsCache;
  }
}

function initSearch() {
  const input       = document.getElementById('searchWhere');
  const dropdown    = document.getElementById('searchSuggestions');
  const searchBtn   = document.getElementById('btnSearch');
  if (!input || !dropdown) return;

  let debounceTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 1) { dropdown.innerHTML = ''; return; }
    debounceTimer = setTimeout(() => showSuggestions(q), 200);
  });

  async function showSuggestions(q) {
    const items = await fetchAttractions();
    const ql = q.toLowerCase();
    const matches = items.filter(a =>
      (a.name     || '').toLowerCase().includes(ql) ||
      (a.region   || '').toLowerCase().includes(ql) ||
      (a.category || '').toLowerCase().includes(ql)
    ).slice(0, 6);

    if (!matches.length) {
      dropdown.innerHTML = `<div class="suggestion-no-results">No destinations found for "<strong>${q}</strong>"</div>`;
      return;
    }

    dropdown.innerHTML = matches.map(a => `
      <div class="suggestion-item" data-slug="${a.slug}" role="button" tabindex="0">
        <img class="suggestion-img"
             src="${a.image_hero || 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=100&q=60'}"
             alt="${a.name}"
             onerror="this.src='https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=100&q=60'"/>
        <div class="suggestion-info">
          <div class="suggestion-name">${a.name}</div>
          <div class="suggestion-tag">${a.category || a.region || 'Destination'}</div>
        </div>
        <span class="suggestion-arrow">→</span>
      </div>
    `).join('');

    /* Click/keyboard on a suggestion */
    dropdown.querySelectorAll('.suggestion-item').forEach(el => {
      const go = () => {
        window.location.href = 'attraction-details.html?id=' + el.dataset.slug;
      };
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    });
  }

  /* Search button — navigate to first match or destinations page */
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const q = input.value.trim();
      if (!q) { window.location.href = 'destinations.html'; return; }
      const items = await fetchAttractions();
      const match = items.find(a =>
        (a.name || '').toLowerCase().includes(q.toLowerCase())
      );
      if (match) {
        window.location.href = 'attraction-details.html?id=' + match.slug;
      } else {
        window.location.href = `destinations.html?search=${encodeURIComponent(q)}`;
      }
    });
  }

  /* Enter key in input */
  input.addEventListener('keydown', async e => {
    if (e.key === 'Enter') searchBtn && searchBtn.click();
  });

  /* Close dropdown when clicking outside */
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-field-wrap')) {
      dropdown.innerHTML = '';
    }
  });
}

/* ─────────────────────────────────────────
   RENDER: EVENT CARDS — fetched from Supabase
───────────────────────────────────────── */
async function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  /* Show loading skeleton */
  grid.innerHTML = Array(HOME_EVENTS_LIMIT).fill(
    '<div class="event-card" style="opacity:0.4;pointer-events:none;"><div class="event-img-wrap" style="background:#e0e0e0;height:200px;border-radius:8px;"></div></div>'
  ).join('');

  let data = [];
  try {
    if (window.getEvents) {
      data = await window.getEvents(HOME_EVENTS_LIMIT);
    }
  } catch (e) {
    console.warn('[script.js] Supabase events failed:', e.message);
  }

  /* If no events from Supabase, show empty state */
  if (!data || data.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#aaa;grid-column:1/-1;">No upcoming events at the moment.</p>';
    return;
  }

  grid.innerHTML = '';
  data.forEach(event => {
    const title    = escapeHtml(event.title || event.name || 'Event');
    const dateRaw  = event.event_date || event.date || '';
    const dateDisp = formatEventDateDisplay(dateRaw);
    const location = escapeHtml(event.location || event.city || '');
    const descRaw  = event.description || event.desc || '';
    const desc     = escapeHtml(descRaw.length > 160 ? descRaw.slice(0, 157) + '…' : descRaw);
    const img      = event.image_url || event.image_hero || event.image || event.img ||
                     'https://images.unsplash.com/photo-1541532713592-79a0317b272b?w=500&q=80&auto=format';
    const eventId  = event.id != null ? encodeURIComponent(String(event.id)) : '';

    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-img-wrap">
        <img class="event-img" src="${img}" alt="${title}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1541532713592-79a0317b272b?w=500&q=80&auto=format'" />
        <div class="event-date-badge">${dateDisp || dateRaw}</div>
      </div>
      <div class="event-body">
        ${event.category ? `<div class="event-cat-pill">${escapeHtml(titleCaseWords(event.category))}</div>` : ''}
        <h3>${title}</h3>
        <div class="event-meta">${calendarIcon()} ${dateDisp || dateRaw}</div>
        <div class="event-meta">${pinIcon()} ${location || 'Kenya'}</div>
        <p>${desc}</p>
        <a href="${eventId ? 'events.html?event=' + eventId : 'events.html'}" class="learn-more-link">Learn More &#8594;</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   RENDER: HOMEPAGE REVIEWS — Supabase (getHomepageReviews in supabase-config.js)
───────────────────────────────────────── */
function reviewStarsHtml(rating) {
  const n = Math.max(0, Math.min(5, Number(rating) || 0));
  return '&#9733;'.repeat(n);
}

function buildTestimonialCard(row) {
  const reviewer = escapeHtml(row.reviewer_name || 'Traveller');
  const loc = row.location ? escapeHtml(row.location) : '';
  const quote = escapeHtml(row.body || row.review_text || '');
  return (
    '<div class="testi-card">' +
    '<div class="testi-quote-icon">\u275d</div>' +
    '<p class="testi-quote">"' + quote + '"</p>' +
    '<div class="testi-stars">' + reviewStarsHtml(row.rating) + '</div>' +
    '<div class="testi-author">' +
    '<div class="avatar">' +
    '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">' +
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
    '<circle cx="12" cy="7" r="4"/>' +
    '</svg></div>' +
    '<div class="author-info">' +
    '<strong>' + reviewer + '</strong>' +
    (loc ? '<span>' + loc + '</span>' : '') +
    '</div></div></div>'
  );
}

async function renderHomepageReviews() {
  const grid = document.getElementById('testiGrid');
  if (!grid) return;

  let rows = [];
  try {
    if (typeof window.getHomepageReviews === 'function') {
      rows = await window.getHomepageReviews(HOME_REVIEWS_LIMIT);
    }
  } catch (e) {
    console.warn('[script.js] Homepage reviews failed:', e.message);
  }

  if (!rows || rows.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#aaa;grid-column:1/-1;">No reviews yet.</p>';
    return;
  }

  grid.innerHTML = rows.slice(0, HOME_REVIEWS_LIMIT).map(buildTestimonialCard).join('');
}

/* ─────────────────────────────────────────
   HERO — stats & slide backgrounds from Supabase
───────────────────────────────────────── */
async function renderHeroStats() {
  const elDest = document.getElementById('heroStatDest');
  const elRev  = document.getElementById('heroStatReviews');
  const elRat  = document.getElementById('heroStatRating');
  if (!elDest || !elRev || !elRat) return;

  try {
    if (typeof window.getHomepageStats === 'function') {
      const s = await window.getHomepageStats();
      elDest.textContent = s.destinationCount ? formatCompactCount(s.destinationCount) : '—';
      elRev.textContent  = s.reviewVolume ? formatCompactCount(s.reviewVolume) : '—';
      elRat.textContent  = s.avgRating > 0 ? `${s.avgRating.toFixed(1)}★` : '—';
      return;
    }
  } catch (e) {
    console.warn('[script.js] Hero stats failed:', e.message);
  }
  elDest.textContent = '—';
  elRev.textContent = '—';
  elRat.textContent = '—';
}

async function applyHeroSlideBackgrounds() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;

  let rows = [];
  try {
    if (window.db && typeof window.db.getAttractions === 'function') {
      rows = await window.db.getAttractions({ limit: slides.length, order: 'rating.desc' });
    }
  } catch (e) {
    console.warn('[script.js] Hero slides:', e.message);
  }

  if (!rows || !rows.length) return;

  rows.forEach((row, i) => {
    const el = slides[i];
    if (!el) return;
    const img = row.image_hero || row.img;
    if (img) el.style.backgroundImage = 'url(' + JSON.stringify(String(img)) + ')';
  });
}

/* ─────────────────────────────────────────
   HERO SLIDESHOW
───────────────────────────────────────── */
const SLIDE_INTERVAL = 5000;

function initSlideshow() {
  const slides   = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('slideDots');
  const prevBtn  = document.querySelector('.slide-prev');
  const nextBtn  = document.querySelector('.slide-next');

  if (!slides.length || !dotsWrap || !prevBtn || !nextBtn) return;

  let current = 0;
  let timer   = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => { stopTimer(); goTo(i); startTimer(); });
    dotsWrap.appendChild(dot);
  });

  const allDots = () => dotsWrap.querySelectorAll('.slide-dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    allDots()[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    allDots()[current].classList.add('active');
  }

  function startTimer() { timer = setInterval(() => goTo(current + 1), SLIDE_INTERVAL); }
  function stopTimer()  { clearInterval(timer); }

  prevBtn.addEventListener('click', () => { stopTimer(); goTo(current - 1); startTimer(); });
  nextBtn.addEventListener('click', () => { stopTimer(); goTo(current + 1); startTimer(); });

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { stopTimer(); goTo(current - 1); startTimer(); }
    if (e.key === 'ArrowRight') { stopTimer(); goTo(current + 1); startTimer(); }
  });

  startTimer();
}

/* ─────────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────
   SCROLL REVEAL (fade-in on scroll)
───────────────────────────────────────── */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.dest-card, .why-card, .event-card, .testi-card'
  );
  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    obs.observe(el);
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initSlideshow();
  await Promise.all([
    renderDestinations(),
    renderEvents(),
    renderHomepageReviews(),
    renderHeroStats(),
    applyHeroSlideBackgrounds()
  ]);
  initSmoothScroll();
  initScrollReveal();
  initSearch();
});