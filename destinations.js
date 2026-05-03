/* ============================================================
   DESTINATIONS PAGE — destinations.js
   Type filtering + site-specific destinations per category
   ============================================================ */

const DESTINATIONS = {

  'big-five': [
    {
      slug: 'maasai-mara',
      name: 'Maasai Mara National Reserve',
      county: 'Narok',
      difficulty: 'Moderate',
      rating: 4.9,
      best_time: 'July – October',
      description: 'Home to the Great Wildebeest Migration and all Big Five in breathtaking golden savanna landscapes.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      highlights: ['Great Migration', 'Lions & Cheetahs']
    },
    {
      slug: 'amboseli',
      name: 'Amboseli National Park',
      county: 'Kajiado',
      difficulty: 'Easy',
      rating: 4.8,
      best_time: 'June – October',
      description: 'Iconic Kilimanjaro backdrop with the largest elephant herds in East Africa roaming freely.',
      image: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=800&q=80',
      highlights: ['Elephants', 'Kilimanjaro Views']
    },
    {
      slug: 'tsavo',
      name: 'Tsavo National Park',
      county: 'Taita-Taveta',
      difficulty: 'Moderate',
      rating: 4.7,
      best_time: 'June – October',
      description: 'Kenya\'s largest park — red-dusted elephants, Mzima Springs and vast untamed wilderness.',
      image: 'https://images.unsplash.com/photo-1598886290734-c4dee49e29cc?auto=format&fit=crop&w=800&q=80',
      highlights: ['Red Elephants', 'Mzima Springs']
    },
    {
      slug: 'nairobi-np',
      name: 'Nairobi National Park',
      county: 'Nairobi',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'July – March',
      description: 'The world\'s only national park inside a capital city — lions and giraffes against a city skyline.',
      image: 'https://images.unsplash.com/photo-1612213938763-9ed26ab83a31?auto=format&fit=crop&w=800&q=80',
      highlights: ['City + Wildlife', 'Lions & Rhinos']
    },
    {
      slug: 'samburu',
      name: 'Samburu National Reserve',
      county: 'Samburu',
      difficulty: 'Moderate',
      rating: 4.7,
      best_time: 'July – September',
      description: 'Remote northern reserve home to the rare Samburu Special Five found nowhere else in Kenya.',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
      highlights: ['Special Five', 'Remote Wilderness']
    },
    {
      slug: 'ol-pejeta',
      name: 'Ol Pejeta Conservancy',
      county: 'Laikipia',
      difficulty: 'Easy',
      rating: 4.8,
      best_time: 'June – October',
      description: 'Africa\'s largest black rhino sanctuary and home to the last northern white rhinos on earth.',
      image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=800&q=80',
      highlights: ['Last White Rhinos', 'Big Five']
    },
    {
      slug: 'lake-nakuru',
      name: 'Lake Nakuru National Park',
      county: 'Nakuru',
      difficulty: 'Easy',
      rating: 4.7,
      best_time: 'June – September',
      description: 'Critical rhino sanctuary with Rothschild giraffes and millions of flamingos on a pink soda lake.',
      image: 'https://images.unsplash.com/photo-1564760290292-23341e4df6ec?auto=format&fit=crop&w=800&q=80',
      highlights: ['Rhino Sanctuary', 'Flamingos']
    },
    {
      slug: 'meru-np',
      name: 'Meru National Park',
      county: 'Meru',
      difficulty: 'Moderate',
      rating: 4.6,
      best_time: 'June – October',
      description: 'Where Elsa the lioness roamed — lush rivers, diverse wildlife and far fewer crowds than the Mara.',
      image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
      highlights: ['Elsa\'s homeland', 'Rivers & Wildlife']
    }
  ],

  'birds': [
    {
      slug: 'lake-nakuru-birds',
      name: 'Lake Nakuru National Park',
      county: 'Nakuru',
      difficulty: 'Easy',
      rating: 4.7,
      best_time: 'Year-round',
      description: 'Famous for flamingo carpets that paint the entire lake shore pink — over 450 bird species recorded.',
      image: 'https://images.unsplash.com/photo-1585389639821-a4c1c2886aab?auto=format&fit=crop&w=800&q=80',
      highlights: ['Flamingo Carpets', '450+ Species']
    },
    {
      slug: 'lake-bogoria',
      name: 'Lake Bogoria',
      county: 'Baringo',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'November – April',
      description: 'Dramatic combination of geothermal geysers and millions of flamingos — a truly otherworldly scene.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      highlights: ['Geysers + Flamingos', 'Hot Springs']
    },
    {
      slug: 'lake-naivasha',
      name: 'Lake Naivasha',
      county: 'Nakuru',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'Year-round',
      description: 'Tranquil freshwater lake with hippos, fish eagles and hundreds of waterbird species.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Fish Eagles', 'Hippos + Birds']
    },
    {
      slug: 'kakamega-forest',
      name: 'Kakamega Forest',
      county: 'Kakamega',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'December – March',
      description: 'Kenya\'s only tropical rainforest — home to over 330 bird species including rare Central African endemics.',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      highlights: ['330+ Species', 'Rainforest Birding']
    },
    {
      slug: 'arabuko-sokoke',
      name: 'Arabuko Sokoke Forest',
      county: 'Kilifi',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'November – April',
      description: 'Africa\'s largest protected coastal forest and home to rare, globally threatened bird species.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Rare Endemic Birds', 'Coastal Forest']
    },
    {
      slug: 'lake-baringo',
      name: 'Lake Baringo',
      county: 'Baringo',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'Year-round',
      description: 'Fresh water Rift Valley lake with 470+ bird species, hippos and traditional fishermen in dugout canoes.',
      image: 'https://images.unsplash.com/photo-1504173010664-32509107de82?auto=format&fit=crop&w=800&q=80',
      highlights: ['470+ Species', 'Local Culture']
    },
    {
      slug: 'mida-creek',
      name: 'Mida Creek',
      county: 'Kilifi',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'October – March',
      description: 'Pristine mangrove estuary with stunning migratory shorebirds and boardwalk trails over the creek.',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=800&q=80',
      highlights: ['Mangrove Boardwalk', 'Migratory Birds']
    },
    {
      slug: 'shimba-hills',
      name: 'Shimba Hills National Reserve',
      county: 'Kwale',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'June – October',
      description: 'Coastal forest reserve with sable antelopes and rare coastal birds above the Indian Ocean.',
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
      highlights: ['Sable Antelope', 'Ocean Views']
    },
    {
      slug: 'tana-delta',
      name: 'Tana River Delta',
      county: 'Tana River',
      difficulty: 'Moderate',
      rating: 4.4,
      best_time: 'November – April',
      description: 'Vast river delta with spectacular aerial patterns of channels and massive flocks of waterbirds.',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      highlights: ['Delta Landscape', 'Waterbird Flocks']
    },
    {
      slug: 'saiwa-swamp',
      name: 'Saiwa Swamp National Park',
      county: 'Trans-Nzoia',
      difficulty: 'Easy',
      rating: 4.3,
      best_time: 'Year-round',
      description: 'Kenya\'s smallest national park — a unique swampy habitat for rare sitatunga antelopes and waterbirds.',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      highlights: ['Sitatunga Antelope', 'Wetland Trails']
    }
  ],

  'mountain': [
    {
      slug: 'mount-kenya',
      name: 'Mount Kenya National Park',
      county: 'Nyeri',
      difficulty: 'Challenging',
      rating: 4.8,
      best_time: 'January – February',
      description: 'Africa\'s second highest peak — glaciers, moorlands and diverse wildlife on a UNESCO World Heritage site.',
      image: 'https://images.unsplash.com/photo-1589825743638-54a8ee3b6d67?auto=format&fit=crop&w=800&q=80',
      highlights: ['5,199m Summit', 'Glaciers & Tarns']
    },
    {
      slug: 'mount-longonot',
      name: 'Mount Longonot',
      county: 'Nakuru',
      difficulty: 'Moderate',
      rating: 4.5,
      best_time: 'June – October',
      description: 'Dramatic volcanic crater with a stunning rim hike offering panoramic views of the Great Rift Valley.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      highlights: ['Crater Rim Trek', 'Rift Valley Views']
    },
    {
      slug: 'aberdare',
      name: 'Aberdare National Park',
      county: 'Nyeri',
      difficulty: 'Moderate',
      rating: 4.6,
      best_time: 'July – October',
      description: 'Mist-shrouded highland forest with dramatic waterfalls, moorlands and nocturnal wildlife at tree lodges.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Gura Falls', 'Tree Lodges']
    },
    {
      slug: 'ngong-hills',
      name: 'Ngong Hills',
      county: 'Kajiado',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'Year-round',
      description: 'Rolling green ridges overlooking Nairobi — a popular day hike with sweeping views and wind turbines.',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      highlights: ['Nairobi Views', 'Day Hike']
    }
  ],

  'beach': [
    {
      slug: 'diani-beach',
      name: 'Diani Beach',
      county: 'Kwale',
      difficulty: 'Easy',
      rating: 4.8,
      best_time: 'January – March',
      description: '17km of powdery white sand lapped by the warm turquoise Indian Ocean with world-class coral reefs.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      highlights: ['White Sand', 'Coral Reef Diving']
    },
    {
      slug: 'watamu',
      name: 'Watamu Beach',
      county: 'Kilifi',
      difficulty: 'Easy',
      rating: 4.7,
      best_time: 'October – March',
      description: 'UNESCO Biosphere Reserve with stunning sandbars, marine national park and whale shark encounters.',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=800&q=80',
      highlights: ['Marine Park', 'Whale Sharks']
    },
    {
      slug: 'lamu-island',
      name: 'Lamu Island',
      county: 'Lamu',
      difficulty: 'Easy',
      rating: 4.8,
      best_time: 'October – March',
      description: 'UNESCO World Heritage old town with Swahili architecture, dhow sailing and car-free cobbled streets.',
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
      highlights: ['UNESCO Old Town', 'Dhow Sailing']
    },
    {
      slug: 'malindi',
      name: 'Malindi Beach',
      county: 'Kilifi',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'October – March',
      description: 'Historic Swahili coast town with traditional dhow boats, ancient ruins and vibrant marine life.',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      highlights: ['Dhow Boats', 'Historic Ruins']
    },
    {
      slug: 'nyali-beach',
      name: 'Nyali Beach',
      county: 'Mombasa',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'January – March',
      description: 'Mombasa\'s most accessible beach — palm-fringed shoreline with gorgeous sunsets and vibrant nightlife.',
      image: 'https://images.unsplash.com/photo-1507881466959-c6af49fc97fb?auto=format&fit=crop&w=800&q=80',
      highlights: ['Palm Sunsets', 'Beach Resorts']
    },
    {
      slug: 'tiwi-beach',
      name: 'Tiwi Beach',
      county: 'Kwale',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'January – March',
      description: 'Hidden secluded cove with natural rock pools, coral gardens and a peaceful off-the-beaten-path feel.',
      image: 'https://images.unsplash.com/photo-1504173010664-32509107de82?auto=format&fit=crop&w=800&q=80',
      highlights: ['Secluded Cove', 'Natural Rock Pools']
    }
  ],

  'cultural': [
    {
      slug: 'lamu-old-town',
      name: 'Lamu Old Town',
      county: 'Lamu',
      difficulty: 'Easy',
      rating: 4.8,
      best_time: 'October – March',
      description: 'The oldest living Swahili settlement in East Africa — narrow streets, ornate carved doors and no cars.',
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
      highlights: ['Swahili Architecture', 'UNESCO Heritage']
    },
    {
      slug: 'maasai-village',
      name: 'Maasai Village Experience',
      county: 'Narok',
      difficulty: 'Easy',
      rating: 4.7,
      best_time: 'Year-round',
      description: 'Authentic Maasai warrior cultural encounters — traditional dances, bead crafts and village life immersion.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      highlights: ['Warrior Dances', 'Bead Crafts']
    },
    {
      slug: 'fort-jesus',
      name: 'Fort Jesus, Mombasa',
      county: 'Mombasa',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'Year-round',
      description: 'Portuguese 16th-century coastal fort and UNESCO World Heritage site overlooking the old port of Mombasa.',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      highlights: ['16th Century Fort', 'UNESCO Heritage']
    },
    {
      slug: 'bomas-kenya',
      name: 'Bomas of Kenya',
      county: 'Nairobi',
      difficulty: 'Easy',
      rating: 4.5,
      best_time: 'Year-round',
      description: 'Kenya\'s premier cultural centre — traditional homesteads and daily performances of 40+ ethnic dances.',
      image: 'https://images.unsplash.com/photo-1612213938763-9ed26ab83a31?auto=format&fit=crop&w=800&q=80',
      highlights: ['40+ Ethnic Dances', 'Cultural Village']
    },
    {
      slug: 'karen-blixen',
      name: 'Karen Blixen Museum',
      county: 'Nairobi',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'Year-round',
      description: 'The historic Danish farmhouse of Out of Africa author Karen Blixen, set among lush colonial gardens.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      highlights: ['Colonial History', 'Out of Africa']
    },
    {
      slug: 'thimlich-ohinga',
      name: 'Thimlich Ohinga',
      county: 'Migori',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'Year-round',
      description: 'The largest and best-preserved dry-stone walled enclosure in sub-Saharan Africa — a UNESCO World Heritage site.',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      highlights: ['Ancient Stone Walls', 'UNESCO Heritage']
    },
    {
      slug: 'kit-mikayi',
      name: 'Kit Mikayi Rock',
      county: 'Kisumu',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'Year-round',
      description: 'Sacred Luo rock formation rising 40 meters above the plains — a spiritual site of deep cultural significance.',
      image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
      highlights: ['Sacred Rock', 'Luo Heritage']
    },
    {
      slug: 'koobi-fora',
      name: 'Koobi Fora',
      county: 'Marsabit',
      difficulty: 'Challenging',
      rating: 4.5,
      best_time: 'June – October',
      description: 'One of the most important paleoanthropological sites on earth — human fossils dating back 4 million years.',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
      highlights: ['4M Year Old Fossils', 'Anthropology Site']
    }
  ],

  'adventure': [
    {
      slug: 'hells-gate',
      name: 'Hell\'s Gate National Park',
      county: 'Nakuru',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'June – October',
      description: 'Kenya\'s only park where you walk and cycle freely among wildlife through dramatic volcanic gorges.',
      image: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&w=800&q=80',
      highlights: ['Cycling Safari', 'Gorge Walk']
    },
    {
      slug: 'mount-longonot-adv',
      name: 'Mount Longonot',
      county: 'Nakuru',
      difficulty: 'Moderate',
      rating: 4.5,
      best_time: 'June – October',
      description: 'Hike to the rim of an active volcanic crater for breathtaking 360° views of the Great Rift Valley.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      highlights: ['Crater Rim Trek', 'Rift Valley Views']
    },
    {
      slug: 'mount-kenya-trek',
      name: 'Mount Kenya Trekking',
      county: 'Nyeri',
      difficulty: 'Challenging',
      rating: 4.8,
      best_time: 'January – February',
      description: 'Summit Africa\'s second highest peak through dramatic ecological zones from rainforest to glacial moorland.',
      image: 'https://images.unsplash.com/photo-1589825743638-54a8ee3b6d67?auto=format&fit=crop&w=800&q=80',
      highlights: ['Summit Trek', 'Glacier Zones']
    },
    {
      slug: 'tana-rapids',
      name: 'Tana River Rafting',
      county: 'Tana River',
      difficulty: 'Challenging',
      rating: 4.7,
      best_time: 'May – August',
      description: 'Thrilling Grade 4–5 white water rafting through dramatic gorges on Kenya\'s longest and most powerful river.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      highlights: ['Grade 4–5 Rapids', 'River Gorges']
    },
    {
      slug: 'diani-sports',
      name: 'Diani Watersports',
      county: 'Kwale',
      difficulty: 'Easy',
      rating: 4.7,
      best_time: 'January – March',
      description: 'East Africa\'s kitesurfing capital — world-class winds, kite schools, deep sea fishing and snorkelling trips.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Kitesurfing', 'Deep Sea Fishing']
    },
    {
      slug: 'aberdare-walks',
      name: 'Aberdare Forest Walks',
      county: 'Nyeri',
      difficulty: 'Moderate',
      rating: 4.6,
      best_time: 'July – October',
      description: 'Night game walks and guided forest treks through misty highland wilderness teeming with black leopard.',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Night Game Walks', 'Black Leopard']
    },
    {
      slug: 'ngong-hike',
      name: 'Ngong Hills Hiking',
      county: 'Kajiado',
      difficulty: 'Easy',
      rating: 4.4,
      best_time: 'Year-round',
      description: 'Easy half-day ridge hike above Nairobi with sweeping views of the Rift Valley escarpment.',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      highlights: ['Ridge Hike', 'City Views']
    }
  ],

  /* Sports — navigates to category.html with sport tabs (Supabase-powered) */
  'sports': []
};

/* ────────────────────────────────────────
   ACTIVE TYPE STATE
──────────────────────────────────────── */
let activeType = 'big-five';

/* ────────────────────────────────────────
   DOM READY
──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async function () {

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  window.addEventListener('scroll', () => {
    document.getElementById('scrollTop')?.classList.toggle('visible', window.scrollY > 400);
  });
  document.getElementById('scrollTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.loadMore = function () {
    ['extra-dest-1','extra-dest-2','extra-dest-3','extra-dest-4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    const btn = document.querySelector('.btn-load-more');
    if (btn) btn.style.display = 'none';
  };

  /* Filter handler */
  window.filterType = function (btn, type) {
    document.querySelectorAll('.type-img-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    /* Sports routes to category.html with sport sub-tabs */
    if (type === 'sports') {
      window.location.href = 'category.html?type=sports';
      return;
    }

    window.location.href = `category.html?type=${type}`;
  };

  renderTypeGrid('big-five');
  await loadFeaturedDestinations();
});

/* ────────────────────────────────────────
   RENDER TYPE GRID — Supabase first, static fallback
──────────────────────────────────────── */
async function renderTypeGrid(type) {
  const grid = document.getElementById('dest-grid');
  if (!grid) return;

  if (type === 'sports') return;

  const typeLabels = {
    'big-five':  '🦁 Big Five Safari',
    'birds':     '🦅 Bird Watching',
    'mountain':  '⛰️ Mountain Treks',
    'beach':     '🏖️ Beach Escapes',
    'cultural':  '🎭 Cultural Tours',
    'adventure': '🪂 Adventure Sports',
  };

  /* Show skeletons while loading */
  grid.innerHTML = Array(6).fill(`
    <div class="dest-card" style="opacity:0.35;pointer-events:none;">
      <div class="dest-img-wrap" style="background:#e8e8e8;height:220px;border-radius:12px;animation:shimmer 1.4s infinite;"></div>
    </div>`).join('');

  let destinations = [];

  /* Try Supabase first */
  try {
    if (window.db && typeof window.db.getAttractions === 'function') {
      const supabaseData = await window.db.getAttractions({ category: type, limit: 20 });
      if (supabaseData && supabaseData.length > 0) {
        destinations = supabaseData;
      }
    }
  } catch (err) {
    console.warn('[destinations.js] Supabase fetch failed, using static fallback:', err.message);
  }

  /* Fall back to static data if Supabase returned nothing */
  if (!destinations.length) {
    destinations = DESTINATIONS[type] || [];
  }

  const sectionTitle = document.querySelector('.destinations-section .section-title');
  const sectionSub   = document.querySelector('.destinations-section .section-sub');
  if (sectionTitle) sectionTitle.textContent = typeLabels[type] || 'Featured Destinations';
  if (sectionSub)   sectionSub.textContent   = `Showing all ${destinations.length} destinations in this category`;

  const loadMoreWrap = document.querySelector('.load-more-wrap');
  if (loadMoreWrap) loadMoreWrap.style.display = 'none';

  if (!destinations.length) {
    grid.innerHTML = `<div class="fetch-error">No destinations found for this category.</div>`;
    return;
  }

  grid.innerHTML = destinations.map(d => {
    const slug       = d.slug || '';
    const name       = d.name || '';
    const county     = d.county || '';
    const difficulty = d.difficulty || 'Easy';
    const rating     = d.rating || 4.5;
    const best_time  = d.best_time || 'Year-round';
    const description= d.description || '';
    const image      = d.image_hero || d.image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80&auto=format';
    const highlights = Array.isArray(d.highlights) ? d.highlights : [];

    return `
      <div class="dest-card" onclick="window.location.href='attraction-details.html?id=${slug}'">
        <div class="dest-img-wrap">
          <div class="dest-img" style="background-image:url('${image}'); background-size:cover; background-position:center;"></div>
          <span class="difficulty-badge diff-${difficulty.toLowerCase()}">${difficulty}</span>
        </div>
        <div class="dest-body">
          <div class="dest-header">
            <div class="dest-name">${name}</div>
            <div class="dest-rating">⭐ ${rating}</div>
          </div>
          <div class="dest-desc">${description.substring(0, 110)}${description.length > 110 ? '...' : ''}</div>
          <div class="dest-meta">
            <div class="dest-meta-item">📍 ${county} County</div>
            <div class="dest-meta-item">🕐 Best: ${best_time}</div>
          </div>
          <div class="dest-tags">
            ${highlights.slice(0, 2).map(h => `<span class="tag">${h}</span>`).join('')}
          </div>
          <div class="dest-footer">
            <a href="attraction-details.html?id=${slug}" class="explore-link" onclick="event.stopPropagation()">⚡ Explore →</a>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ────────────────────────────────────────
   TRAVELER FAVORITES — from Supabase
──────────────────────────────────────── */
async function loadFeaturedDestinations() {
  const favGrid = document.querySelector('.favorites-section .destinations-grid');
  if (!favGrid) return;

  try {
    const attractions = await db.getAttractions();
    const top4 = attractions.slice(0, 4);
    favGrid.innerHTML = top4.map(a => `
      <div class="dest-card" onclick="window.location.href='attraction-details.html?id=${a.slug}'">
        <div class="dest-img-wrap">
          <div class="dest-img" style="background-image:url('${a.image_hero}'); background-size:cover; background-position:center;"></div>
          <span class="difficulty-badge diff-${(a.difficulty||'easy').toLowerCase()}">${a.difficulty || 'Easy'}</span>
        </div>
        <div class="dest-body">
          <div class="dest-header">
            <div class="dest-name" style="color:var(--orange)">${a.name}</div>
            <div class="dest-rating">⭐ ${a.rating}</div>
          </div>
          <div class="dest-desc">${(a.description||'').substring(0, 110)}...</div>
          <div class="dest-meta">
            <div class="dest-meta-item">📍 ${a.county} County</div>
            <div class="dest-meta-item">🕐 Best: ${a.best_time || 'Year-round'}</div>
          </div>
          <div class="dest-tags">
            ${(a.highlights||[]).slice(0, 2).map(h => `<span class="tag">${h.split(' ').slice(0,3).join(' ')}</span>`).join('')}
          </div>
          <div class="dest-footer">
            <a href="attraction-details.html?id=${a.slug}" class="explore-link" onclick="event.stopPropagation()">⚡ Explore →</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading favorites:', err);
  }
}