/* ══════════════════════════════════════════════════════════════════════
   supabase-client.js  —  SafariQuest Kenya
   Loaded by restaurants.html and restaurant-details.html BEFORE their
   respective JS files.
   Exposes:
     - getRestaurants()    → all restaurants (up to 200)
     - getRestaurant(slug) → single restaurant by slug
══════════════════════════════════════════════════════════════════════ */

/* Re-use the same project + anon JWT as auth.js / supabase-config.js
   (admin and user accounts live in Supabase Auth — not in any local .js file). */
const _SQ_URL = (window.SQ_PUBLIC && window.SQ_PUBLIC.url)
  ? window.SQ_PUBLIC.url
  : ((typeof SUPABASE_URL !== 'undefined')
    ? SUPABASE_URL
    : 'https://cbyipmrozqsntojiartw.supabase.co');

const _SQ_KEY = (window.SQ_PUBLIC && window.SQ_PUBLIC.anon)
  ? window.SQ_PUBLIC.anon
  : ((typeof SUPABASE_KEY !== 'undefined')
    ? SUPABASE_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlwbXJvenFzbnRvamlhcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTkxNTQsImV4cCI6MjA4ODk3NTE1NH0.31TAhmUCV_Uh0W8FGnR2_TLCZDU4YBM1U5LMSMc5JZs');

/* ── fetch helper with detailed error logging ── */
async function _sqFetch(path) {
  const url = `${_SQ_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    headers: {
      'apikey':        _SQ_KEY,
      'Authorization': `Bearer ${_SQ_KEY}`,
      'Content-Type':  'application/json',
    }
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[supabase-client] ${res.status} ${res.statusText} → ${url}`);
    console.error(`[supabase-client] Response body:`, body);
    if (res.status === 401 || res.status === 403) {
      console.error('[supabase-client] ⛔ RLS is blocking this query. Go to Supabase → Table Editor → restaurants → RLS → Add policy: SELECT USING (true)');
    }
    throw new Error(`Supabase ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

/* ══════════════════════════════════════════════════════════════════════
   getRestaurants()
   Returns ALL restaurants ordered by featured desc, then rating desc.
   limit=200 ensures all 45+ rows are always returned.
══════════════════════════════════════════════════════════════════════ */
window.getRestaurants = async function () {
  try {
    const data = await _sqFetch(
      `restaurants?order=featured.desc,rating.desc&limit=200&select=*`
    );
    console.log(`[supabase-client] ✅ getRestaurants → ${Array.isArray(data) ? data.length : 0} rows`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[supabase-client] getRestaurants failed:', err.message);
    return [];
  }
};

/* ══════════════════════════════════════════════════════════════════════
   getRestaurant(slug)
   Returns a single restaurant object, or null if not found.
══════════════════════════════════════════════════════════════════════ */
window.getRestaurant = async function (slug) {
  try {
    const data = await _sqFetch(
      `restaurants?slug=eq.${encodeURIComponent(slug)}&limit=1&select=*`
    );
    console.log(`[supabase-client] getRestaurant("${slug}") → ${Array.isArray(data) ? data.length : 0} rows`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn('[supabase-client] getRestaurant failed:', err.message);
    return null;
  }
};

/* ══════════════════════════════════════════════════════════════════════
   getEvents()
   Returns upcoming events ordered by date. Limit 10.
══════════════════════════════════════════════════════════════════════ */
const _SQ_EVENTS_FALLBACK = [
  {
    id: 'sq-fallback-safari-rally',
    title: 'Safari Rally Fan Weekend',
    event_date: '2026-06-21',
    location: 'Naivasha',
    category: 'sports',
    description: 'Catch rally action zones, motorsport showcases, and family activities around Naivasha during race week.',
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format'
  },
  {
    id: 'sq-fallback-lamu-cultural',
    title: 'Lamu Cultural Weekend',
    event_date: '2026-11-15',
    location: 'Lamu Island',
    category: 'cultural',
    description: 'Experience Swahili music, dhow processions, local cuisine, and heritage walks in old town Lamu.',
    image_url: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80&auto=format'
  },
  {
    id: 'sq-fallback-nairobi-food',
    title: 'Nairobi Street Food Fiesta',
    event_date: '2026-08-10',
    location: 'Nairobi',
    category: 'food',
    description: 'Taste popular Kenyan street dishes, live cooking demos, and evening performances from local artists.',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&auto=format'
  },
  {
    id: 'sq-fallback-mara-photo',
    title: 'Mara Wildlife Photo Camp',
    event_date: '2026-07-04',
    location: 'Maasai Mara',
    category: 'wildlife',
    description: 'A guided wildlife photography camp focused on migration season and golden-hour game drives.',
    image_url: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80&auto=format'
  }
];

function _getFallbackEvents(limit) {
  const n = Math.min(50, Math.max(1, Number(limit) || 10));
  return _SQ_EVENTS_FALLBACK
    .slice()
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)))
    .slice(0, n);
}

window.getEvents = async function (limit = 10) {
  const n = Math.min(50, Math.max(1, Number(limit) || 10));
  const today = new Date().toISOString().slice(0, 10);
  try {
    let data = await _sqFetch(
      `events?event_date=gte.${today}&order=event_date.asc&limit=${n}&select=*`
    );
    if (!Array.isArray(data) || data.length === 0) {
      data = await _sqFetch(
        `events?order=event_date.desc&limit=${n}&select=*`
      );
    }
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[supabase-client] getEvents empty response, using fallback events');
      return _getFallbackEvents(n);
    }
    console.log(`[supabase-client] getEvents → ${Array.isArray(data) ? data.length : 0} rows`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[supabase-client] getEvents failed:', err.message);
    return _getFallbackEvents(n);
  }
};
