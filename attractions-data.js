/* ============================================================
   attractions-data.js  —  SafariQuest Kenya
   Local fallback data used when Supabase is unavailable.
   Loaded before supabase-config.js on any page that needs it.
============================================================ */

window.ATTRACTIONS_DATA = [
  {
    slug: 'maasai-mara',
    name: 'Maasai Mara National Reserve',
    category: 'Safari',
    region: 'Rift Valley',
    rating: 4.9,
    difficulty: 'Easy',
    duration: '3–7 days',
    price_from: 15000,
    featured: true,
    description: 'The crown jewel of Kenya's wildlife heritage. Home to the world-famous Great Wildebeest Migration, the Maasai Mara offers unparalleled Big Five game viewing year-round. Vast golden plains stretch to the horizon, dotted with acacia trees and teeming with lions, elephants, leopards, buffalo, and rhinos.',
    highlights: ['Great Wildebeest Migration (Jul–Oct)', 'Big Five guaranteed sightings', 'Hot air balloon safaris', 'Maasai cultural village visits', 'Mara River hippo pools'],
    best_time: 'July to October for the Migration; year-round for general game viewing',
    image_hero: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
      'https://images.unsplash.com/photo-1612099197788-bde7f41d9710?w=800&q=80'
    ],
    lat: -1.5021,
    lng: 35.1447,
    tags: ['Safari', 'Wildlife', 'Migration', 'Big Five']
  },
  {
    slug: 'amboseli',
    name: 'Amboseli National Park',
    category: 'Safari',
    region: 'Rift Valley',
    rating: 4.8,
    difficulty: 'Easy',
    duration: '2–4 days',
    price_from: 12000,
    featured: true,
    description: 'Set against the magnificent backdrop of Mount Kilimanjaro, Amboseli is world-famous for its large free-ranging elephant herds. The park's swamps and marshes create a dramatic landscape that attracts abundant wildlife and provides some of Africa's most iconic photography opportunities.',
    highlights: ['Largest elephant herds in Kenya', 'Kilimanjaro backdrop views', 'Observation Hill panoramas', 'Maasai cultural interactions', 'Wetland birdwatching'],
    best_time: 'June to October and January to February (dry seasons)',
    image_hero: 'https://images.unsplash.com/photo-1612099197788-bde7f41d9710?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80'
    ],
    lat: -2.6527,
    lng: 37.2593,
    tags: ['Safari', 'Elephants', 'Kilimanjaro', 'Wildlife']
  },
  {
    slug: 'diani-beach',
    name: 'Diani Beach',
    category: 'Beach',
    region: 'Coast',
    rating: 4.7,
    difficulty: 'Easy',
    duration: '3–7 days',
    price_from: 8000,
    featured: true,
    description: 'Repeatedly voted Africa's leading beach destination, Diani Beach boasts 17 km of pristine white sand lapped by warm turquoise Indian Ocean waters. Coral reefs teeming with marine life, luxury beach resorts, water sports, and a laid-back coastal atmosphere make it the ultimate Kenyan beach escape.',
    highlights: ['17 km of white sand beach', 'World-class snorkelling and diving', 'Colobus monkey sanctuary', 'Dolphin watching trips', 'Kisite-Mpunguti Marine Park'],
    best_time: 'January to March and July to September (dry seasons)',
    image_hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      'https://images.unsplash.com/photo-1510784722466-f2aa240d9562?w=800&q=80'
    ],
    lat: -4.3167,
    lng: 39.5667,
    tags: ['Beach', 'Snorkelling', 'Coast', 'Diving']
  },
  {
    slug: 'mount-kenya',
    name: 'Mount Kenya National Park',
    category: 'Mountain',
    region: 'Central',
    rating: 4.8,
    difficulty: 'Hard',
    duration: '4–8 days',
    price_from: 20000,
    featured: true,
    description: 'Africa's second-highest peak and Kenya's namesake mountain is a UNESCO World Heritage Site. Its dramatic glaciers, moorlands, and afro-alpine flora create an otherworldly trekking environment. Multiple routes suit different experience levels, with Point Lenana (4,985 m) accessible to non-technical climbers.',
    highlights: ['Point Lenana summit (4,985 m)', 'Unique afro-alpine flora', 'Giant lobelia and senecio plants', 'Chogoria, Sirimon & Naro Moru routes', 'Wildlife including elephants and buffalo'],
    best_time: 'January to February and July to October',
    image_hero: 'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
    ],
    lat: -0.1521,
    lng: 37.3084,
    tags: ['Mountain', 'Trekking', 'UNESCO', 'Adventure']
  },
  {
    slug: 'lamu-old-town',
    name: 'Lamu Old Town',
    category: 'Cultural',
    region: 'Coast',
    rating: 4.6,
    difficulty: 'Easy',
    duration: '2–4 days',
    price_from: 9000,
    featured: true,
    description: 'The oldest and best-preserved Swahili settlement in East Africa, Lamu Old Town is a UNESCO World Heritage Site dating back to the 14th century. Its labyrinthine coral-stone streets, ornate carved wooden doors, and donkey-only transport system create a unique living museum of Swahili culture.',
    highlights: ['UNESCO World Heritage Site', 'Lamu Fort and Museum', 'Traditional dhow sailing', 'Annual Lamu Cultural Festival', 'Swahili architecture and carved doors'],
    best_time: 'July to September and January to March',
    image_hero: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80'
    ],
    lat: -2.2694,
    lng: 40.9022,
    tags: ['Cultural', 'UNESCO', 'Swahili', 'History']
  },
  {
    slug: 'nairobi-national-park',
    name: 'Nairobi National Park',
    category: 'Safari',
    region: 'Nairobi',
    rating: 4.5,
    difficulty: 'Easy',
    duration: 'Half day – 1 day',
    price_from: 5000,
    featured: false,
    description: 'The world's only national park bordering a capital city. Just 7 km from Nairobi's CBD, lions, rhinos, giraffes, and cheetahs roam freely against a backdrop of skyscrapers. Also home to the David Sheldrick Wildlife Trust elephant orphanage and the Giraffe Centre.',
    highlights: ['Black rhino sanctuary', 'Lions with city skyline backdrop', 'David Sheldrick Elephant Orphanage', 'Nairobi Giraffe Centre nearby', 'Half-day trip from the city'],
    best_time: 'Year-round; dry seasons offer better game viewing',
    image_hero: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85',
    gallery: [],
    lat: -1.3590,
    lng: 36.8219,
    tags: ['Safari', 'Nairobi', 'Rhino', 'Day Trip']
  },
  {
    slug: 'lake-nakuru',
    name: 'Lake Nakuru National Park',
    category: 'Safari',
    region: 'Rift Valley',
    rating: 4.6,
    difficulty: 'Easy',
    duration: '1–2 days',
    price_from: 8000,
    featured: false,
    description: 'Famous for its flocks of flamingos turning the lake shoreline pink, Lake Nakuru is also a critical sanctuary for both black and white rhinos. The park's diverse habitats — from alkaline lake to forest and rocky outcrops — support an extraordinary concentration of wildlife.',
    highlights: ['Flamingo-pink lake shores', 'Black and white rhino sanctuary', 'Baboon Cliff viewpoint', 'Lion Hill panoramas', 'Over 400 bird species'],
    best_time: 'Year-round; flamingos present throughout the year',
    image_hero: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85',
    gallery: [],
    lat: -0.3631,
    lng: 36.0800,
    tags: ['Safari', 'Flamingos', 'Rhino', 'Birdwatching']
  },
  {
    slug: 'tsavo',
    name: 'Tsavo National Park',
    category: 'Safari',
    region: 'Coast',
    rating: 4.7,
    difficulty: 'Easy',
    duration: '2–5 days',
    price_from: 10000,
    featured: false,
    description: 'Kenya's largest national park, split into Tsavo East and West, covers a vast wilderness of lava flows, savannah, and riverine forest. Home to the "red elephants" whose tusks are stained by the red laterite soil, as well as large prides of lions and diverse birdlife.',
    highlights: ['Red elephants of Tsavo', 'Mzima Springs (hippos and crocs)', 'Shetani Lava Flow', 'Lugard Falls', 'Kenya's largest park'],
    best_time: 'June to October and January to March',
    image_hero: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200&q=85',
    gallery: [],
    lat: -2.9333,
    lng: 38.5000,
    tags: ['Safari', 'Wildlife', 'Elephants', 'Adventure']
  },
  {
    slug: 'samburu',
    name: 'Samburu National Reserve',
    category: 'Safari',
    region: 'Northern Kenya',
    rating: 4.7,
    difficulty: 'Easy',
    duration: '2–4 days',
    price_from: 14000,
    featured: false,
    description: 'A remote and rugged wilderness in Northern Kenya, Samburu is home to the "Samburu Special Five" — species found nowhere else in Kenya: Grevy's zebra, Somali ostrich, reticulated giraffe, gerenuk, and beisa oryx. The Ewaso Ng'iro river teems with crocodiles and elephants.',
    highlights: ['Samburu Special Five species', 'Grevy\'s zebra sightings', 'Reticulated giraffe', 'Ewaso Ng\'iro river game drives', 'Authentic Samburu culture'],
    best_time: 'June to October and January to February',
    image_hero: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85',
    gallery: [],
    lat: 0.5833,
    lng: 37.5333,
    tags: ['Safari', 'Northern Kenya', 'Rare Species', 'Remote']
  },
  {
    slug: 'hell-gate',
    name: 'Hell\'s Gate National Park',
    category: 'Adventure',
    region: 'Rift Valley',
    rating: 4.4,
    difficulty: 'Medium',
    duration: '1 day',
    price_from: 3500,
    featured: false,
    description: 'One of the few Kenyan parks where you can walk and cycle among wildlife. Hell\'s Gate\'s dramatic gorges, hot springs, and towering volcanic plugs inspired the setting for Disney\'s The Lion King. Cyclists can pedal through herds of zebra and giraffe.',
    highlights: ['Cycling among giraffes and zebras', 'Fischer\'s Tower volcanic plug', 'Ol Njorowa Gorge hike', 'Natural hot springs', 'Inspired The Lion King'],
    best_time: 'Year-round; avoid rainy season for gorge hiking',
    image_hero: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
    gallery: [],
    lat: -0.9166,
    lng: 36.3166,
    tags: ['Adventure', 'Cycling', 'Hiking', 'Rift Valley']
  }
];

/* ── Field normalizer ──
   Local data uses price_from / gallery / region.
   Supabase and populatePage() expect price_min / price_max / image_gallery / location / county.
   This bridges the gap so the fallback path renders correctly.               */
function normalizeAttraction(a) {
  if (!a) return null;
  return Object.assign({}, a, {
    price_min:     a.price_min     !== undefined ? a.price_min     : (a.price_from || 0),
    price_max:     a.price_max     !== undefined ? a.price_max     : Math.round((a.price_from || 0) * 2),
    image_gallery: a.image_gallery !== undefined ? a.image_gallery : (a.gallery || []),
    location:      a.location      !== undefined ? a.location      : (a.region   || 'Kenya'),
    county:        a.county        !== undefined ? a.county        : (a.region   || 'Kenya'),
    /* ensure review_count exists */
    review_count:  a.review_count  !== undefined ? a.review_count  : 0,
  });
}

/* Helper: look up by slug */
window.getAttractionBySlug = function(slug) {
  const found = window.ATTRACTIONS_DATA.find(a => a.slug === slug) || null;
  return normalizeAttraction(found);
};

/* Helper: get similar attractions (same category, different slug) */
window.getSimilarAttractions = function(category, currentSlug) {
  return window.ATTRACTIONS_DATA
    .filter(a => a.category === category && a.slug !== currentSlug)
    .slice(0, 4)
    .map(normalizeAttraction);
};
