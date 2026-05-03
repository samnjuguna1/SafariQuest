/* ============================================================
   RESTAURANTS PAGE — restaurants.js
   Fetches all restaurants from Supabase and renders them.

   FIXES:
   - Static fallback data now has a mix of featured/non-featured
     so cards always appear even when Supabase is unreachable
   - Added console logging to help diagnose Supabase errors
   - featuredSection visibility logic made more robust
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {

  /* ── State ── */
  let allRestaurants = [];
  let filtered = [];
  let activeCity = 'all';

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Fetch from Supabase ── */
  async function fetchRestaurants() {
    showSkeletons();
    try {
      const data = await getRestaurants();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data returned from Supabase');
      }
      allRestaurants = data;
      console.log(`✅ Loaded ${allRestaurants.length} restaurants from Supabase`);
    } catch (err) {
      console.warn('⚠️ Supabase unavailable, using static fallback:', err.message);
      allRestaurants = getStaticRestaurants();
    }
    filtered = [...allRestaurants];
    renderAll();
    document.getElementById('statTotal').textContent = allRestaurants.length;
  }

  /* ── Render both grids ── */
  function renderAll() {
    const featured = filtered.filter(r => r.featured);
    const rest     = filtered.filter(r => !r.featured);

    const featuredSection = document.getElementById('featuredSection');
    const featuredGrid    = document.getElementById('featuredGrid');

    if (featured.length > 0) {
      featuredSection.style.display = 'block';
      featuredGrid.innerHTML = featured.map(buildCard).join('');
    } else {
      featuredSection.style.display = 'none';
      featuredGrid.innerHTML = '';
    }

    const grid   = document.getElementById('restaurantsGrid');
    const count  = document.getElementById('resultsCount');
    const empty  = document.getElementById('emptyState');

    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      /* Always show all restaurants in the main grid.
         Non-featured go here; if everything is featured they still show here too */
      const mainItems = rest.length > 0 ? rest : filtered;
      grid.innerHTML = mainItems.map(buildCard).join('');
    }

    count.textContent = `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''}`;
  }

  /* ── Build Card HTML ── */
  function buildCard(r) {
    const desc      = r.description || '';
    const shortDesc = desc.length > 110 ? desc.substring(0, 110) + '…' : desc;
    const image     = r.image_hero || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';
    const cuisine   = r.cuisine || '';
    const city      = r.city || '';
    const name      = r.name || 'Restaurant';

    return `
      <a class="rest-card" href="restaurant-details.html?id=${r.slug}">
        <div class="rest-card-img-wrap">
          <img class="rest-card-img" src="${image}" alt="${name}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'"/>
          ${r.featured ? '<div class="rest-card-badge">⭐ Featured</div>' : ''}
          ${cuisine    ? `<div class="rest-card-cuisine-badge">${cuisine}</div>` : ''}
        </div>
        <div class="rest-card-body">
          ${city ? `<div class="rest-card-city">📍 ${city}</div>` : ''}
          <div class="rest-card-name">${name}</div>
          <div class="rest-card-desc">${shortDesc}</div>
          <div class="rest-card-footer">
            <div class="rest-card-cta">View Restaurant →</div>
          </div>
        </div>
      </a>`;
  }

  /* ── Skeleton loaders ── */
  function showSkeletons() {
    const grid = document.getElementById('restaurantsGrid');
    grid.innerHTML = Array(9).fill('<div class="skeleton"></div>').join('');
  }

  /* ── Apply all filters ── */
  window.applyFilters = function () {
    const cuisine = document.getElementById('cuisineFilter').value;
    const sort    = document.getElementById('sortFilter').value;
    const search  = document.getElementById('searchInput').value.toLowerCase().trim();

    filtered = allRestaurants.filter(r => {
      const matchCity    = activeCity === 'all' || r.city === activeCity;
      const matchCuisine = cuisine === 'all' || (r.cuisine || '').toLowerCase().includes(cuisine.toLowerCase());
      const matchSearch  = !search ||
        (r.name        || '').toLowerCase().includes(search) ||
        (r.city        || '').toLowerCase().includes(search) ||
        (r.cuisine     || '').toLowerCase().includes(search) ||
        (r.description || '').toLowerCase().includes(search) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(search)));
      return matchCity && matchCuisine && matchSearch;
    });

    if (sort === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const titleEl = document.getElementById('resultsTitle');
    if (activeCity !== 'all') {
      titleEl.textContent = `Restaurants in ${activeCity}`;
    } else if (cuisine !== 'all') {
      titleEl.textContent = `${cuisine} Restaurants`;
    } else {
      titleEl.textContent = 'All Restaurants';
    }

    renderAll();
  };

  /* ── City filter ── */
  window.filterCity = function (el, city) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    activeCity = city;
    applyFilters();
  };

  /* ── Search ── */
  window.applySearch = applyFilters;
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });

  /* ── Cuisine section click ── */
  window.setCuisineFilter = function (cuisine) {
    document.getElementById('cuisineFilter').value = cuisine;
    applyFilters();
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
  };

  /* ── Clear all ── */
  window.clearFilters = function () {
    activeCity = 'all';
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.pill').classList.add('active');
    document.getElementById('cuisineFilter').value = 'all';
    document.getElementById('priceFilter').value   = 'all';
    document.getElementById('sortFilter').value    = 'featured';
    document.getElementById('searchInput').value   = '';
    filtered = [...allRestaurants];
    document.getElementById('resultsTitle').textContent = 'All Restaurants';
    renderAll();
  };

  /* ── Static fallback data ──
     IMPORTANT: Mix of featured:true and featured:false so that
     both the "Editor's Picks" section AND the main grid populate.
  ── */
  function getStaticRestaurants() {
    return [
      {
        slug: 'carnivore-restaurant',
        name: 'Carnivore Restaurant',
        city: 'Nairobi',
        cuisine: 'BBQ & Steakhouse',
        price_level: 3,
        featured: true,
        description: 'World-famous all-you-can-eat meat restaurant — a Nairobi icon since 1980.',
        image_hero: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80'
      },
      {
        slug: 'mama-oliech',
        name: 'Mama Oliech Restaurant',
        city: 'Nairobi',
        cuisine: 'Kenyan',
        price_level: 1,
        featured: true,
        description: "Nairobi's most famous fried tilapia restaurant — a legendary institution loved by all.",
        image_hero: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80'
      },
      {
        slug: 'tamarind-dhow',
        name: 'Tamarind Dhow',
        city: 'Mombasa',
        cuisine: 'Swahili & Seafood',
        price_level: 3,
        featured: true,
        description: 'A unique dining experience on a traditional sailing dhow with Mombasa harbour views.',
        image_hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
      },
      {
        slug: 'talisman-restaurant',
        name: 'Talisman Restaurant',
        city: 'Nairobi',
        cuisine: 'International',
        price_level: 3,
        featured: false,
        description: 'A Karen institution with beautiful fairy-lit garden and an eclectic world menu.',
        image_hero: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80'
      },
      {
        slug: 'the-moorings-kisumu',
        name: 'The Moorings',
        city: 'Kisumu',
        cuisine: 'African & Seafood',
        price_level: 2,
        featured: false,
        description: 'A floating restaurant on Lake Victoria with spectacular sunset views.',
        image_hero: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80'
      },
      {
        slug: 'forodhani-mombasa',
        name: 'Forodhani Restaurant',
        city: 'Mombasa',
        cuisine: 'Swahili & Seafood',
        price_level: 2,
        featured: false,
        description: "Authentic Swahili seafood in the heart of Mombasa's historic Old Town.",
        image_hero: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80'
      },
      {
        slug: 'java-house-nairobi',
        name: 'Java House',
        city: 'Nairobi',
        cuisine: 'Café & Coffee',
        price_level: 2,
        featured: false,
        description: "Kenya's beloved coffee chain — great breakfast, all-day dining and the best local brews.",
        image_hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'
      },
      {
        slug: 'swahili-plate-nakuru',
        name: 'Swahili Plate',
        city: 'Nakuru',
        cuisine: 'Kenyan',
        price_level: 1,
        featured: false,
        description: 'Hearty local favourites — nyama choma, ugali, sukuma wiki and fresh tilapia from Lake Nakuru.',
        image_hero: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
      },
      {
        slug: 'olepolos-nairobi',
        name: 'Olepolos Country Club',
        city: 'Nairobi',
        cuisine: 'BBQ & Kenyan',
        price_level: 2,
        featured: false,
        description: 'An open-air nyama choma hotspot on the outskirts of Nairobi with a relaxed country atmosphere.',
        image_hero: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
      }
    ];
  }

  /* ── Init ── */
  fetchRestaurants();

});
