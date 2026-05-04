/* ══════════════════════════════════════════════════════════════════════
   supabase-config.js  —  SafariQuest Kenya
   Loaded as a regular <script> tag (NOT a module).
   IMPORTANT: auth.js must be loaded BEFORE this file — it sets
   window.SQ_PUBLIC = { url, anon } which we reuse here.
   Exposes globals:
     - getSportsDestinations(sport)  used by category.js
     - db.getAttraction(slug)        used by attraction-details.js
     - db.getSimilar(category, slug) used by attraction-details.js
══════════════════════════════════════════════════════════════════════ */

/* ── Reuse credentials already set by auth.js to avoid const re-declaration ── */
const _SQ_CFG_URL  = (window.SQ_PUBLIC && window.SQ_PUBLIC.url)
  ? window.SQ_PUBLIC.url
  : 'https://cbyipmrozqsntojiartw.supabase.co';

/* FIX: Use the proper JWT anon key (not the publishable key).
   auth.js sets window.SQ_PUBLIC.anon to the correct eyJ... JWT.          */
const _SQ_CFG_ANON = (window.SQ_PUBLIC && window.SQ_PUBLIC.anon)
  ? window.SQ_PUBLIC.anon
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlwbXJvenFzbnRvamlhcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTkxNTQsImV4cCI6MjA4ODk3NTE1NH0.31TAhmUCV_Uh0W8FGnR2_TLCZDU4YBM1U5LMSMc5JZs';

const SPORTS_TABLE  = 'sports_destinations';
const ATTRACT_TABLE = 'attractions';

/* ── fetch helper with proper JWT anon key ── */
async function sbFetch(path) {
  const res = await fetch(`${_SQ_CFG_URL}/rest/v1/${path}`, {
    headers: {
      'apikey':        _SQ_CFG_ANON,
      'Authorization': `Bearer ${_SQ_CFG_ANON}`,
      'Content-Type':  'application/json',
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[supabase-config] ${res.status} ${res.statusText} for path: ${path}`);
    if (res.status === 401 || res.status === 403) {
      console.error('[supabase-config] ⛔ Blocked — check your Supabase anon key and RLS policies for the attractions table.');
    }
    throw new Error(`Supabase ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/* ══════════════════════════════════════════════════════════════════════
   getSportsDestinations(sport)
   Used by category.js to load destination cards.
══════════════════════════════════════════════════════════════════════ */
window.getSportsDestinations = async function (sport) {
  try {
    const data = await sbFetch(
      `${SPORTS_TABLE}?sport=eq.${encodeURIComponent(sport)}&order=featured.desc,rating.desc&limit=50`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[supabase-config] getSportsDestinations failed:', err.message);
    return [];
  }
};

/* ══════════════════════════════════════════════════════════════════════
   db  —  used by attraction-details.js
══════════════════════════════════════════════════════════════════════ */
window.db = {

  getAttractions: async function (options) {
    try {
      if (!options || typeof options === 'number') options = { limit: options || 20 };
      const limit    = options.limit    || 20;
      const order    = options.order    || 'rating.desc';
      const category = options.category || null;
      let path = ATTRACT_TABLE + '?order=' + order + '&limit=' + limit;
      if (category) path += '&category=eq.' + encodeURIComponent(category);
      const data = await sbFetch(path);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[supabase-config] getAttractions failed:', err.message);
      return [];
    }
  },

  getAttraction: async function (slug) {
    try {
      const data = await sbFetch(
        `${ATTRACT_TABLE}?slug=eq.${encodeURIComponent(slug)}&limit=1`
      );
      if (Array.isArray(data) && data.length > 0) return data[0];
      // Supabase returned empty — use local fallback
      console.warn('[supabase-config] Supabase empty for slug:', slug, '— using local data');
      return window.getAttractionBySlug ? window.getAttractionBySlug(slug) : null;
    } catch (err) {
      console.warn('[supabase-config] getAttraction failed:', err.message, '— using local data');
      return window.getAttractionBySlug ? window.getAttractionBySlug(slug) : null;
    }
  },

  getSimilar: async function (category, currentSlug) {
    try {
      const data = await sbFetch(
        `${ATTRACT_TABLE}?category=eq.${encodeURIComponent(category)}&slug=neq.${encodeURIComponent(currentSlug)}&order=rating.desc&limit=4`
      );
      if (Array.isArray(data) && data.length > 0) return data;
      // Fallback to local similar
      return window.getSimilarAttractions ? window.getSimilarAttractions(category, currentSlug) : [];
    } catch (err) {
      console.warn('[supabase-config] getSimilar failed:', err.message);
      return window.getSimilarAttractions ? window.getSimilarAttractions(category, currentSlug) : [];
    }
  },

  /* ── Fetch entry/service fees for a destination ─────────────────────────
     Queries the attraction_fees table. Falls back gracefully to [] if
     the table is not yet created or the query returns nothing.             */
  getAttractionFees: async function (slug) {
    try {
      const data = await sbFetch(
        `attraction_fees?attraction_slug=eq.${encodeURIComponent(slug)}&order=sort_order.asc,fee_type.asc`
      );
      if (Array.isArray(data) && data.length > 0) return data;
      return [];
    } catch (err) {
      console.warn('[supabase-config] getAttractionFees failed (table may not exist yet):', err.message);
      return [];
    }
  },

  /* ── Fetch accommodations for a destination ──────────────────────────── */
  getAccommodations: async function (slug) {
    try {
      const data = await sbFetch(
        `accommodation?attraction_slug=eq.${encodeURIComponent(slug)}&order=featured.desc,stars.desc&limit=12`
      );
      if (Array.isArray(data) && data.length > 0) return data;
      return [];
    } catch (err) {
      console.warn('[supabase-config] getAccommodations failed (table may not exist yet):', err.message);
      return [];
    }
  }

};

/**
 * Homepage testimonials — public.reviews (body, reviewer_name, rating, status).
 */
window.getHomepageReviews = async function (limit) {
  const n = Math.min(12, Math.max(1, Number(limit) || 4));
  try {
    const data = await sbFetch(
      `reviews?select=reviewer_name,body,rating,status,created_at&order=created_at.desc&limit=${n}`
    );
    const rows = Array.isArray(data) ? data : [];
    const ok = rows.filter(function (r) {
      var s = (r.status || '').toString().toLowerCase();
      return !s || s === 'approved' || s === 'published' || s === 'active';
    });
    return ok.length ? ok : rows;
  } catch (err) {
    console.warn('[supabase-config] getHomepageReviews failed:', err.message);
    return [];
  }
};

/**
 * Hero strip: destination count, total review volume, avg attraction rating (all from attractions + count header).
 */
window.getHomepageStats = async function () {
  const out = {
    destinationCount: 0,
    reviewVolume: 0,
    avgRating: 0
  };
  try {
    const res = await fetch(`${_SQ_CFG_URL}/rest/v1/attractions?select=id`, {
      headers: {
        apikey: _SQ_CFG_ANON,
        Authorization: 'Bearer ' + _SQ_CFG_ANON,
        Prefer: 'count=exact'
      }
    });
    const cr = res.headers.get('content-range') || '';
    const totalPart = cr.split('/')[1];
    if (totalPart) out.destinationCount = parseInt(totalPart, 10) || 0;
  } catch (e) {
    console.warn('[supabase-config] getHomepageStats count failed:', e.message);
  }
  try {
    const rows = await sbFetch('attractions?select=rating,review_count&limit=500');
    if (!Array.isArray(rows) || !rows.length) return out;
    var sumR = 0;
    var sumReviews = 0;
    var n = 0;
    rows.forEach(function (row) {
      var rv = Number(row.rating);
      if (!isNaN(rv) && rv > 0) {
        sumR += rv;
        n += 1;
      }
      var rc = Number(row.review_count);
      if (!isNaN(rc) && rc > 0) sumReviews += rc;
    });
    out.reviewVolume = sumReviews;
    out.avgRating = n ? sumR / n : 0;
  } catch (e2) {
    console.warn('[supabase-config] getHomepageStats aggregate failed:', e2.message);
  }
  return out;
};