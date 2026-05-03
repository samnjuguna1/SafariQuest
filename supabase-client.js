/* ══════════════════════════════════════════════════════════════════════
   supabase-client.js  —  SafariQuest Kenya
   Loaded by restaurants.html and restaurant-details.html BEFORE their
   respective JS files.
   Exposes:
     - getRestaurants()    → all restaurants (up to 200)
     - getRestaurant(slug) → single restaurant by slug
══════════════════════════════════════════════════════════════════════ */

/* Re-use the globals already set by supabase-config.js if available,
   otherwise define them here as fallback */
const _SQ_URL = (typeof SUPABASE_URL !== 'undefined')
  ? SUPABASE_URL
  : 'https://cbyipmrozqsntojiartw.supabase.co';

const _SQ_KEY = (typeof SUPABASE_KEY !== 'undefined')
  ? SUPABASE_KEY
  : 'sb_publishable_eKZx3549j8unaFOQaZNGlQ_IdVWH5BI';

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
window.getEvents = async function (limit = 10) {
  try {
    const data = await _sqFetch(
      `events?order=date.asc&limit=${limit}&select=*`
    );
    console.log(`[supabase-client] getEvents → ${Array.isArray(data) ? data.length : 0} rows`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[supabase-client] getEvents failed:', err.message);
    return [];
  }
};
