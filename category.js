/* ══════════════════════════════════════════════════════════════════════
   category.js  —  SafariQuest Kenya
   Reads ?sport=football | ?type=adventure (legacy).
   Images (hero + destination cards) come from Supabase Storage.
   Falls back to STATIC_SPORTS if Supabase is unavailable.
══════════════════════════════════════════════════════════════════════ */

/* SUPABASE_URL is declared in supabase-config.js — do not redeclare here */
const STORAGE_BASE  = 'https://cbyipmrozqsntojiartw.supabase.co/storage/v1/object/public/destination-images';

function storageUrl(path) {
  return `${STORAGE_BASE}/${path}`;
}

const SPORT_META = {
  football: {
    label:         '⚽ Football in Kenya',
    badge:         '🏆 Sports & Recreation',
    heroTitle:     'Kenya\'s World-Class <em>Football Scene</em>',
    heroDesc:      'Home of Talanta Stadium — Africa\'s most beloved football fortress. Explore stadiums, training grounds and fan culture across Kenya.',
    heroBg:        storageUrl('heroes/hero-football.jpg'),
    heroFallbackBg:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Talanta_FC_stadium_Nairobi.jpg/1280px-Talanta_FC_stadium_Nairobi.jpg',
    introTitle:    'The Beautiful Game <em>Across Kenya</em>',
    introDesc:     'Kenya\'s football scene is vibrant and passionate — from Kasarani\'s 60,000-seat national stadium hosting AFCON qualifiers, to grassroots pitches in Kisumu and Mombasa producing world-class talent.',
    stats:         [{ val:'15', lbl:'Stadiums & Venues' }, { val:'18', lbl:'KPL Clubs' }, { val:'60K+', lbl:'Max Capacity' }],
    grid:          'Football Stadiums & Venues',
    breadcrumb:    'Football'
  },
  golf: {
    label:         '⛳ Golf in Kenya',
    badge:         '⛳ Golf & Country Clubs',
    heroTitle:     'Championship Courses <em>Under African Skies</em>',
    heroDesc:      'Kenya boasts some of Africa\'s finest golf courses — from Muthaiga Golf Club (est. 1913) to Vipingo Ridge with Indian Ocean panoramas.',
    heroBg:        storageUrl('heroes/hero-golf.jpg'),
    heroFallbackBg:'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',
    introTitle:    'Championship Courses <em>Under African Skies</em>',
    introDesc:     'Kenya boasts some of Africa\'s finest golf courses — from Muthaiga Golf Club (est. 1913) to Vipingo Ridge on the coast with Indian Ocean panoramas. Playing golf against a backdrop of wildlife is uniquely Kenyan.',
    stats:         [{ val:'15', lbl:'Golf Courses' }, { val:'110+', lbl:'Years of Golf' }, { val:'4.9★', lbl:'Avg Rating' }],
    grid:          'Golf Courses & Clubs',
    breadcrumb:    'Golf'
  },
  rally: {
    label:         '🚗 Safari Rally in Kenya',
    badge:         '🚗 WRC Safari Rally',
    heroTitle:     'The World\'s Most <em>Legendary Rally</em>',
    heroDesc:      'WRC Safari Rally Kenya — drivers battle through red murram roads, dramatic Rift Valley stages and unpredictable African weather.',
    heroBg:        storageUrl('heroes/hero-rally.jpg'),
    heroFallbackBg:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=80',
    introTitle:    'The World\'s Most <em>Legendary Rally</em>',
    introDesc:     'The Safari Rally Kenya is a WRC round and the most iconic rally on earth. Drivers battle through red murram roads, dramatic Rift Valley stages, and unpredictable African weather.',
    stats:         [{ val:'15', lbl:'Rally Stages' }, { val:'70+', lbl:'Years of History' }, { val:'WRC', lbl:'World Championship' }],
    grid:          'Safari Rally Stages & Venues',
    breadcrumb:    'Safari Rally'
  },
  basketball: {
    label:         '🏀 Basketball in Kenya',
    badge:         '🏀 Basketball',
    heroTitle:     'Kenya\'s Rising <em>Basketball Nation</em>',
    heroDesc:      'From FIBA Africa qualifiers at Nyayo Indoor Arena to university rivalries — Kenyan basketball is on the rise.',
    heroBg:        storageUrl('heroes/hero-basketball.jpg'),
    heroFallbackBg:'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1400&q=80',
    introTitle:    'Kenya\'s Rising <em>Basketball Nation</em>',
    introDesc:     'Kenya\'s basketball scene has exploded in recent years. The KBF league features fierce rivalries and world-class facilities in Nairobi have helped Kenyan players earn NBA G-League contracts.',
    stats:         [{ val:'15', lbl:'Arenas & Courts' }, { val:'KBF', lbl:'National League' }, { val:'4.7★', lbl:'Avg Rating' }],
    grid:          'Basketball Arenas & Courts',
    breadcrumb:    'Basketball'
  },
  swimming: {
    label:         '🏊 Swimming in Kenya',
    badge:         '🏊 Aquatics',
    heroTitle:     'Olympic Pools & <em>Coastal Waters</em>',
    heroDesc:      'From Olympic-standard pools in Nairobi to open-water swimming in the Indian Ocean and freshwater Lake Victoria.',
    heroBg:        storageUrl('heroes/hero-swimming.jpg'),
    heroFallbackBg:'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1400&q=80',
    introTitle:    'Olympic Pools & <em>Coastal Waters</em>',
    introDesc:     'From Olympic-standard pools in Nairobi to open-water swimming in the Indian Ocean and freshwater Lake Victoria — Kenya offers world-class aquatic experiences for every level.',
    stats:         [{ val:'15', lbl:'Pools & Venues' }, { val:'50m', lbl:'Olympic Pools' }, { val:'4.8★', lbl:'Avg Rating' }],
    grid:          'Swimming Pools & Aquatic Venues',
    breadcrumb:    'Swimming'
  },
  adventure: {
    label:         '🪂 Adventure Sports in Kenya',
    badge:         '🪂 Adventure Sports',
    heroTitle:     'Kenya\'s Most Thrilling <em>Adventure Experiences</em>',
    heroDesc:      'White water rafting on the Tana River, rock climbing at Hell\'s Gate, hot air balloon safaris and bungee jumping at Sagana.',
    heroBg:        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1400&q=80&auto=format',
    heroFallbackBg:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1400&q=80&auto=format',
    introTitle:    'Adventure <em>Awaits in Kenya</em>',
    introDesc:     'From bungee jumping at Sagana to paragliding over the Rift Valley — Kenya is Africa\'s adventure capital. The diverse landscape creates perfect conditions for every kind of thrill-seeker.',
    stats:         [{ val:'7', lbl:'Adventure Types' }, { val:'15+', lbl:'Top Venues' }, { val:'4.7★', lbl:'Avg Rating' }],
    grid:          'Adventure Destinations',
    breadcrumb:    'Adventure Sports'
  }
};

const PAGE_TITLES = {
  football:   'Football Destinations',
  golf:       'Golf Destinations',
  rally:      'Safari Rally Stages',
  basketball: 'Basketball Venues',
  swimming:   'Swimming Venues',
  adventure:  'Adventure Destinations',
  beach:      'Beach Destinations',
  wildlife:   'Wildlife Destinations',
  culture:    'Cultural Destinations',
  nature:     'Nature Destinations',
};

/* ─────────────────────────────────────────────────────────────────────
   STATIC FALLBACK DATA
───────────────────────────────────────────────────────────────────── */
function makeStatic(sport, slug, name, county, difficulty, rating, best_time, description, highlights, featured, schedule) {
  return {
    sport, slug, name, county, difficulty, rating, best_time, description,
    highlights, featured: featured || false, schedule,
    image_hero: storageUrl(`${sport}/${slug}.jpg`),
  };
}

const STATIC_SPORTS = {
  football: [
    makeStatic('football','kasarani-stadium','Moi International Sports Centre, Kasarani','Nairobi','Easy',4.8,'Year-round',"Kenya's premier national stadium with 60,000+ capacity, home of the Harambee Stars and major AFCON qualifiers.",['60,000 Capacity','AFCON Qualifiers','Olympic Track'],true,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','nyayo-stadium','Nyayo National Stadium','Nairobi','Easy',4.6,'Year-round','Iconic 30,000-seat multi-use stadium in Nairobi, regularly hosting KPL matches and national events.',['30,000 Capacity','KPL Matches','National Events'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','afraha-stadium','Afraha Stadium','Nakuru','Easy',4.4,'Year-round','The heartbeat of Rift Valley football — home to Nakuru All Stars and rowdy western Kenya derbies.',['Western Derbies','Rift Valley Hub','Local Passion'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','kinoru-stadium','Kinoru Stadium','Meru','Easy',4.3,'Year-round',"Central Kenya's principal football ground serving the Mount Kenya region clubs and regional tournaments.",['Regional Hub','Mt Kenya Region','Modern Facilities'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','mbaraki-stadium','Mbaraki Sports Ground','Mombasa','Easy',4.2,'October – March',"Coastal football in the sea breeze — home ground for Bandari FC, Kenya's Premier League coastal powerhouse.",['Bandari FC','Coastal Atmosphere','Sea Breeze'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','bukhungu-stadium','Bukhungu Stadium','Kakamega','Easy',4.5,'Year-round',"Western Kenya's fortress stadium — home to Kakamega Homeboyz and arguably the most passionate crowds in Kenya.",['Kakamega Homeboyz','Passionate Crowds','Western Hub'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','thika-stadium','Thika Municipal Stadium','Kiambu','Easy',4.2,'Year-round','Modern stadium serving the Thika sub-region and home to AFC Leopards pre-match training sessions.',['AFC Leopards','Modern Facilities','Sub-Regional Hub'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','mamboleo-stadium','Mamboleo Stadium','Kisumu','Easy',4.3,'Year-round',"Lakeside football at its finest — Kisumu's premier ground hosting Gor Mahia away matches and lake region derbies.",['Lake Region Derby','Gor Mahia','Lakeside City'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','kericho-stadium','Kericho Green Stadium','Kericho','Easy',4.1,'Year-round',"Perched in Kenya's tea highlands, this ground offers a unique backdrop of rolling green tea plantations.",['Tea Highlands','Unique Setting','Rift Valley League'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','machakos-stadium',"Machakos People's Park Stadium",'Machakos','Easy',4.4,'Year-round',"One of Kenya's newest and most modern football facilities, built as part of the People's Park development.",["Modern Facility","People's Park",'Eastern Hub'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','camp-toyoyo','Camp Toyoyo Ground','Nairobi','Easy',4.0,'Year-round',"Legendary grassroots football hub in Nairobi's Jericho estate — where many KPL stars began their journey.",['Grassroots Hub','Jericho Estate','Star Factory'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','kenyatta-stadium-kitui','Kenyatta Stadium Kitui','Kitui','Easy',4.1,'Year-round','Eastern Kenya football anchor — serving the vast Ukambani region and semi-arid football community.',['Eastern Kenya','Ukambani Region','Community Football'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','gusii-stadium','Gusii Stadium','Kisii','Easy',4.3,'Year-round',"Nyanza's premier stadium hosting fiercely contested South Nyanza football rivalries.",['South Nyanza Derby','Passionate Fans','Regional Pride'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','moi-stadium-mombasa','Moi Municipal Stadium Mombasa','Mombasa','Easy',4.2,'October – April',"Historic coastal stadium that hosted Kenyan football's greatest coastal rivalries for over five decades.",['Coastal Rivalries','Historic Ground','Swahili Coast'],false,'https://www.fkf.co.ke/fixtures'),
    makeStatic('football','ole-kasasi-stadium','Ole Kasasi Stadium','Kajiado','Easy',4.0,'Year-round','Maasai land football home — blending traditional culture with the passion of the beautiful game.',['Maasai Land','Cultural Mix','Rift Valley'],false,'https://www.fkf.co.ke/fixtures'),
  ],
  golf: [
    makeStatic('golf','muthaiga-golf-club','Muthaiga Golf Club','Nairobi','Moderate',4.9,'Year-round',"Kenya's most prestigious golf club, established in 1913. Hosting the Kenya Open since 1967 on a Championship course with towering indigenous trees.",['Est. 1913','Kenya Open Host','18-Hole Championship'],true,'https://www.kenyaopen.com/schedule'),
    makeStatic('golf','karen-country-club','Karen Country Club','Nairobi','Moderate',4.8,'Year-round','World-class golf in the leafy Karen suburb, set among manicured fairways with views of the Ngong Hills.',['Ngong Hills Views','Championship Course','18 Holes'],false,'https://www.karencountryclub.org'),
    makeStatic('golf','vipingo-ridge','Vipingo Ridge Golf Club','Kilifi','Moderate',4.9,'October – March','Designed by David Jones — 18 holes of championship golf on the Kenya coast with stunning Indian Ocean panoramas and cooling sea breezes.',['Ocean Panoramas','Coastal Breeze','David Jones Design'],true,'https://www.vipingoridge.com'),
    makeStatic('golf','windsor-golf','Windsor Golf & Country Club','Kiambu','Moderate',4.7,'Year-round','An 18-hole championship course set on the outskirts of Nairobi in a lush forested valley with dramatic elevation changes.',['Forested Valley','18 Holes','Elevation Changes'],false,'https://www.windsorgolfhotel.co.ke'),
    makeStatic('golf','royal-nairobi-golf','Royal Nairobi Golf Club','Nairobi','Moderate',4.6,'Year-round',"Est. 1906 — one of the oldest golf clubs in Africa, sitting minutes from the city centre with a rich colonial heritage.",["Est. 1906","Africa's Oldest",'City Centre'],false,'https://www.royalnairobigolfclub.com'),
    makeStatic('golf','vet-lab-golf','Vet Lab Sports Club','Nairobi','Easy',4.3,'Year-round','Friendly 9-hole course popular with beginners and corporate golf days — great value in the heart of Nairobi.',['9 Holes','Beginner Friendly','Corporate Events'],false,'#'),
    makeStatic('golf','limuru-country-club','Limuru Country Club','Kiambu','Moderate',4.5,'Year-round',"Elevated highland golf among Kenya's famous tea estates — crisp air, dramatic views and a challenging layout.",['Tea Estate Views','Highland Golf','Crisp Air'],false,'https://www.limurucountryclub.co.ke'),
    makeStatic('golf','sigona-golf-club','Sigona Golf Club','Kiambu','Moderate',4.4,'Year-round','A scenic 18-hole parkland course 20km from Nairobi, beloved for its welcoming atmosphere and excellent greens.',['Parkland Course','Excellent Greens','Family Friendly'],false,'https://www.sigonagolfclub.com'),
    makeStatic('golf','nakuru-golf-club','Nakuru Golf Club','Nakuru','Easy',4.3,'Year-round','Rift Valley golf at its relaxed best — 18 holes on the outskirts of Nakuru town with views towards the escarpment.',['Rift Valley Views','18 Holes','Relaxed Atmosphere'],false,'https://www.nakurugolfclub.co.ke'),
    makeStatic('golf','nanyuki-sports-club','Nanyuki Sports Club Golf Course','Laikipia','Easy',4.4,'June – October','Golf at the equator with Mount Kenya as your backdrop — a unique 9-hole course that straddles the equator line.',['Equator Golf','Mt Kenya Views','9 Holes'],false,'https://www.nanyukisportsclub.com'),
    makeStatic('golf','mombasa-golf-club','Mombasa Golf Club','Mombasa','Easy',4.4,'October – March','Coastal golf with an old-world charm — 18 holes weaving through tropical vegetation near the Indian Ocean.',['Coastal Golf','Tropical Setting','Historic Club'],false,'https://www.mombasagolfclub.co.ke'),
    makeStatic('golf','nyali-golf-club','Nyali Golf & Country Club','Mombasa','Easy',4.5,'October – March','Premier Mombasa golf experience — challenging 18-hole layout with ocean glimpses and a vibrant clubhouse.',['Ocean Glimpses','18 Holes','Vibrant Clubhouse'],false,'https://www.nyaligolfclub.com'),
    makeStatic('golf','eldoret-golf-club','Eldoret Golf Club','Uasin Gishu','Easy',4.2,'Year-round',"High-altitude golf in Kenya's athletics capital — the thin air and cool temperatures make for a unique game.",['High Altitude','Athletics Capital','Cool Climate'],false,'https://www.eldoretgolfclub.co.ke'),
    makeStatic('golf','kisumu-golf-club','Kisumu Golf Club','Kisumu','Easy',4.2,'Year-round','Lakeside golf on the shores of Lake Victoria — the only golf club in Kenya with lake views from every hole.',['Lake Victoria Views','Unique Setting','9 Holes'],false,'https://www.kisumugolfclub.co.ke'),
    makeStatic('golf','mountain-lodge-golf','Fairmont Mount Kenya Safari Club Golf','Nyeri','Moderate',4.7,'January – March','Golf against the breathtaking backdrop of Mount Kenya — a 9-hole course at altitude with wildlife on the fairways.',['Mt Kenya Views','Wildlife on Fairways','Altitude Golf'],false,'https://www.fairmont.com/mount-kenya-safari'),
  ],

  /* ── SAFARI RALLY: 3 locations only, no destinations detail link ── */
  rally: [
    {
      sport: 'rally',
      slug: 'naivasha-wrc-hub',
      name: 'Naivasha WRC Safari Rally Hub',
      county: 'Nakuru',
      difficulty: 'Moderate',
      rating: 4.9,
      best_time: 'June – July',
      description: 'The beating heart of the WRC Safari Rally — the service park, ceremonial start, super-special stages and massive fan zones are all centred around Lake Naivasha in the stunning Great Rift Valley.',
      highlights: ['WRC Service Park','Super Special Stage','Fan Zones & Camps'],
      featured: true,
      schedule: 'https://www.wrc.com/en/events/safari-rally-kenya',
      image_hero: storageUrl('rally/naivasha-rally-stage.jpg'),
      noDetail: true,
    },
    {
      sport: 'rally',
      slug: 'kasarani-super-special',
      name: 'Kasarani Super Special Stage',
      county: 'Nairobi',
      difficulty: 'Easy',
      rating: 4.6,
      best_time: 'June – July',
      description: 'The crowd-pleasing Kasarani Super Special Stage brings WRC action to 40,000 roaring fans inside the national stadium — side-by-side head-to-head duels that thrill even non-rally fans.',
      highlights: ['Stadium Rally Stage','40,000 Fans','Head-to-Head Duels'],
      featured: false,
      schedule: 'https://www.wrc.com/en/events/safari-rally-kenya',
      image_hero: storageUrl('rally/kasarani-sss.jpg'),
      noDetail: true,
    },
    {
      sport: 'rally',
      slug: 'naivasha-power-stage',
      name: 'Naivasha Power Stage',
      county: 'Nakuru',
      difficulty: 'Challenging',
      rating: 4.9,
      best_time: 'June – July',
      description: 'The final WRC Power Stage — bonus championship points and maximum drama as drivers push absolutely everything on the last gruelling test through the Rift Valley\'s iconic murram roads.',
      highlights: ['WRC Power Stage','Bonus Points','Maximum Drama'],
      featured: true,
      schedule: 'https://www.wrc.com/en/events/safari-rally-kenya',
      image_hero: storageUrl('rally/naivasha-power-stage.jpg'),
      noDetail: true,
    },
  ],

  basketball: [
    makeStatic('basketball','nyayo-indoor-arena','Nyayo National Stadium Indoor Arena','Nairobi','Easy',4.7,'Year-round',"Kenya's premier indoor basketball arena hosting KBF Premier League finals and FIBA Africa qualifying rounds.",['FIBA Africa Venue','KBF Finals','Premier Arena'],true,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','kasarani-indoor','Kasarani Gymnasium','Nairobi','Easy',4.6,'Year-round','Part of the Moi International Sports Centre complex — large indoor arena with excellent lighting and seating for major tournaments.',['Major Tournaments','International Events','Large Capacity'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','kicc-sports-hall','KICC Sports & Events Hall','Nairobi','Easy',4.5,'Year-round','The iconic Kenya International Conference Centre hosts basketball exhibition matches and community leagues in its versatile indoor hall.',['Iconic Nairobi Venue','Exhibition Matches','Community Leagues'],false,'https://www.kicc.co.ke/events'),
    makeStatic('basketball','upper-hill-courts','Upper Hill School Courts','Nairobi','Easy',4.3,'Year-round',"Premier school basketball in Kenya — Upper Hill's courts produce a remarkable number of national team players each season.",['School Basketball','National Players','Development Hub'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','strathmore-university-gym','Strathmore University Sports Hall','Nairobi','Easy',4.5,'Year-round','University-level basketball at its finest — Strathmore Blades dominate the Kenya University Sports Association (KUSA) league.',['KUSA League','Strathmore Blades','University Basketball'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','uon-hall','University of Nairobi Sports Hall','Nairobi','Easy',4.2,'Year-round','Historic UoN gym — a cornerstone of Kenyan university basketball with decades of passionate rivalry.',['University Rival','Historic Venue','UoN Rockets'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','mombasa-sports-club-bball','Mombasa Sports Club Courts','Mombasa','Easy',4.3,'October – March','Coastal basketball hub — the Mombasa Sports Club courts host the KBF Coast region league and youth development programs.',['Coast Region League','Youth Development','Coastal Hub'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','kisumu-indoor','Kisumu Indoor Arena','Kisumu','Easy',4.2,'Year-round',"Lake Victoria basin basketball — Kisumu's arena serves the western Kenya basketball community and national league clubs.",['Western Kenya','KBF Western','Lakeside City'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','eldoret-ymca-courts','Eldoret YMCA Courts','Uasin Gishu','Easy',4.1,'Year-round',"Basketball in the home of runners — Eldoret's YMCA courts are a hub for Rift Valley youth sport development.",['Youth Development','Rift Valley Hub','YMCA Community'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','daystar-university-courts','Daystar University Courts','Machakos','Easy',4.2,'Year-round',"Eastern Kenya's top university basketball facility — Daystar Warriors compete fiercely in the KUSA championship.",['KUSA Championship','Eastern Kenya','Daystar Warriors'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','kenyatta-university-gym','Kenyatta University Sports Hall','Kiambu','Easy',4.3,'Year-round','Large university sports hall hosting inter-university championships and national training camps for the Morans.',['Morans Training','Inter-University','Large Capacity'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','thika-sports-club-bball','Thika Sports Club Court','Kiambu','Easy',4.0,'Year-round','Community basketball in Thika — a well-maintained court that doubles as a development centre for youth hoops.',['Community Basketball','Youth Hoops','Development Centre'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','nakuru-sports-club-bball','Nakuru Athletic Club Courts','Nakuru','Easy',4.1,'Year-round',"Rift Valley basketball hub — Nakuru's courts host the regional KBF Rift Valley zone league games.",['KBF Rift Valley','Regional League','Athletic Club'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','jkuat-sports-hall','JKUAT Sports Hall','Kiambu','Easy',4.2,'Year-round','Technical university campus with a modern sports hall frequently hosting KBF development league and KUSA fixtures.',['KBF Development','KUSA Fixtures','Modern Hall'],false,'https://www.kenyabasketball.com/schedule'),
    makeStatic('basketball','pwani-university-courts','Pwani University Courts','Kilifi','Easy',4.1,'October – March',"Coastal university basketball — Pwani University's courts overlook the Indian Ocean, making training sessions uniquely refreshing.",['Ocean Views','Coastal University','Coast Zone League'],false,'https://www.kenyabasketball.com/schedule'),
  ],
  swimming: [
    makeStatic('swimming','kasarani-aquatic-centre','Kasarani Aquatic Centre','Nairobi','Easy',4.8,'Year-round',"Kenya's only Olympic-standard 50m pool — home of the Kenya Aquatics Federation national championships and the Aqua Stars club.",['50m Olympic Pool','National Championships','Olympic Standard'],true,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','nyayo-swimming-pool','Nyayo National Stadium Pool','Nairobi','Easy',4.5,'Year-round','Official 50m competition pool at Nyayo National Stadium — host to KAF opens and East African aquatics competitions.',['50m Pool','East African Meets','KAF Opens'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','westwood-pool','Westwood Health Club Pool','Nairobi','Easy',4.4,'Year-round',"Nairobi's premier leisure pool complex — heated, well-maintained and a favourite training venue for top swimming clubs.",['Heated Pool','Top Clubs','Leisure Complex'],false,'https://www.westwoodhealth.co.ke'),
    makeStatic('swimming','karen-cc-pool','Karen Country Club Pool','Nairobi','Easy',4.6,'Year-round','Beautifully maintained outdoor pool in the lush Karen estate — cool highland temperatures make for perfect lap sessions.',['Outdoor Pool','Karen Estate','Highland Cool'],false,'https://www.karencountryclub.org'),
    makeStatic('swimming','peponi-school-pool','Peponi School Aquatic Centre','Kiambu','Easy',4.5,'Year-round',"Elite school swimming facility producing Kenya's most decorated young swimmers — regular inter-school galas.",['Elite School Pool','Inter-School Galas','Young Champions'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','diani-reef-pool','Diani Reef Beach Resort Pool','Kwale','Easy',4.7,'October – March',"Infinity pool overlooking the Indian Ocean — open-water swimming training on Kenya's most beautiful coastline.",['Infinity Pool','Ocean Views','Open Water Training'],false,'https://www.dianibeach.com'),
    makeStatic('swimming','lake-victoria-swim','Lake Victoria Open Water Swim, Kisumu','Kisumu','Moderate',4.6,'June – September',"Africa's largest lake hosts the annual Kisumu Open Water Classic — a bucket-list swim through freshwater history.",["Africa's Largest Lake",'Open Water Classic','Freshwater Swim'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','watamu-marine-swim','Watamu Open Water Swim','Kilifi','Moderate',4.8,'October – March','Swim through the Watamu Marine National Park — crystal-clear waters with coral reefs and tropical fish as company.',['Marine Park Swim','Coral Reefs','Crystal Clear Water'],false,'https://www.watamu.com/events'),
    makeStatic('swimming','nairobi-club-pool','Nairobi Club Pool','Nairobi','Easy',4.4,'Year-round',"Historic colonial-era club with a full competition pool — site of Kenya's first ever organised swimming competitions in 1935.",['Historic 1935 Pool','Competition Pool','Colonial Heritage'],false,'https://www.nairobiclub.com'),
    makeStatic('swimming','strathmore-pool','Strathmore University Pool','Nairobi','Easy',4.3,'Year-round','University-level competition pool hosting KUSA swimming championships and open-club training sessions.',['KUSA Swimming','University Pool','Open Training'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','impala-club-pool','Impala Club Pool','Nairobi','Easy',4.3,'Year-round',"Well-kept suburban pool popular with Nairobi's swimming clubs for early morning training and evening galas.",['Morning Training','Suburban Pool','Swimming Galas'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','mombasa-sports-club-pool','Mombasa Sports Club Pool','Mombasa','Easy',4.4,'Year-round','Premier coastal swimming facility — well-maintained 25m pool with a thriving junior development programme.',['Coastal Pool','Junior Programme','25m Lane Pool'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','nakuru-sports-club-pool','Nakuru Athletic Club Pool','Nakuru','Easy',4.2,'Year-round','Rift Valley primary training pool — the Nakuru AC Sharks consistently produce competitive regional swimmers.',['Rift Valley Pool','Nakuru Sharks','Regional Championships'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','eldoret-swimming-pool','Eldoret Sports Club Pool','Uasin Gishu','Easy',4.1,'Year-round',"High-altitude swimming — Eldoret's pool is a unique training advantage, with thin-air conditioning boosting swimmers' lung capacity.",['High Altitude','Lung Capacity Boost','Athletics City Pool'],false,'https://www.kenyaaquatics.org/events'),
    makeStatic('swimming','kisumu-swimming-pool','Kisumu Sports Club Pool','Kisumu','Easy',4.2,'Year-round',"Lakeside pool where the warm climate allows year-round training — home to Western Kenya's most promising young swimmers.",['Warm Climate','Year-round Training','Young Talent'],false,'https://www.kenyaaquatics.org/events'),
  ],
  adventure: [
    makeStatic('adventure','sagana-adventure','Sagana Outdoor Adventure','Kirinyaga','Moderate',4.9,'Year-round','Kenya\'s premier adventure hub — white water rafting on the Tana River, bungee jumping, zip-lining and kayaking in one epic location.',['White Water Rafting','Bungee Jumping','Zip-lining'],true,'https://www.saganaadventure.com'),
    makeStatic('adventure','hells-gate-climbing','Hell\'s Gate Rock Climbing','Nakuru','Challenging',4.8,'June – October','Scale the dramatic red volcanic cliffs of Hell\'s Gate Gorge — one of East Africa\'s best natural climbing walls with routes for all levels.',['Rock Climbing','Volcanic Cliffs','Gorge Walking'],true,'https://www.kws.go.ke/parks/hells-gate'),
    makeStatic('adventure','masai-mara-balloon','Masai Mara Hot Air Balloon','Narok','Easy',5.0,'Year-round','Float silently over the golden plains at sunrise as thousands of wildebeest move below — the ultimate Kenyan adventure experience.',['Balloon Safari','Sunrise Flight','Wildebeest Migration'],true,'https://www.balloonafrica.com'),
    makeStatic('adventure','mount-kenya-climbing','Mount Kenya Summit Climb','Nyeri','Challenging',4.8,'January – March','Conquer Africa\'s second highest peak at 5,199m — technical routes via Batian, Nelion and Point Lenana for all skill levels.',['5,199m Summit','Technical Climbing','Glaciers & Tarns'],false,'https://www.kws.go.ke/parks/mount-kenya'),
    makeStatic('adventure','ol-pejeta-quad','Ol Pejeta Quad Biking','Laikipia','Moderate',4.6,'Year-round','Quad bike through an African wildlife conservancy alongside rhinos and buffalo — a truly unique off-road adventure.',['Quad Biking','Wildlife Views','Conservancy Access'],false,'https://www.olpejetaconservancy.org'),
    makeStatic('adventure','naivasha-cycling','Lake Naivasha Cycling','Nakuru','Easy',4.5,'Year-round','Cycle the scenic shores of Lake Naivasha through Hell\'s Gate and Crescent Island — hippos, giraffes and flamingos en route.',['Cycling Safari','Lake Shore Route','Wildlife Encounters'],false,'https://www.hellsgatepark.com'),
    makeStatic('adventure','arabuko-canopy','Arabuko Sokoke Canopy Walk','Kilifi','Moderate',4.7,'October – March','Walk through the treetops of coastal Kenya\'s largest indigenous forest on a spectacular aerial canopy walkway.',['Canopy Walk','Coastal Forest','Bird Watching'],false,'https://www.arabukosokokeforest.org'),
    makeStatic('adventure','turkana-expedition','Lake Turkana Expedition','Turkana','Challenging',4.8,'November – February','Epic overland expedition to the Jade Sea — remote desert landscapes, Loiyangalani village, and ancient archaeological sites.',['Jade Sea','Remote Expedition','Ancient Sites'],false,'#'),
    makeStatic('adventure','rift-valley-paragliding','Rift Valley Paragliding','Nakuru','Challenging',4.7,'June – September','Launch from the escarpment edge and soar over the Great Rift Valley floor — thermals and jaw-dropping views all the way to Lake Nakuru.',['Paragliding','Rift Valley Views','Thermal Flying'],false,'https://www.kenyaskydivers.com'),
    makeStatic('adventure','diani-kitesurfing','Diani Beach Kitesurfing','Kwale','Moderate',4.8,'January – March','Harness the reliable Indian Ocean trade winds at Diani — one of the top 10 kitesurfing spots in Africa with consistent conditions.',['Kitesurfing','Indian Ocean','Trade Winds'],false,'https://www.dianibeachkitesurf.com'),
  ],
};

/* ─────────────────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────────────────── */
let currentSport = 'football';

/* ─────────────────────────────────────────────────────────────────────
   ATTRACTION TYPE META
───────────────────────────────────────────────────────────────────── */
const ATTRACTION_META = {
  'big-five': {
    label:     '🦁 Big Five Safari',
    badge:     '🦁 Big Five Safari',
    heroTitle: 'Kenya\'s Greatest <em>Big Five Safari</em> Destinations',
    heroDesc:  'Track lion, leopard, elephant, buffalo and rhino across Kenya\'s world-class game reserves.',
    heroBg:    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=80&auto=format',
    introTitle:'The Big Five <em>in Kenya</em>',
    introDesc: 'Kenya is one of the best places on earth to see the Big Five. World-class reserves like Masai Mara, Amboseli and Tsavo offer unmatched wildlife encounters year-round.',
    stats:     [{ val:'8', lbl:'Top Reserves' }, { val:'5', lbl:'Big Five Species' }, { val:'4.8★', lbl:'Avg Rating' }],
    gridTitle: 'Big Five Safari Destinations',
    breadcrumb:'Big Five Safari',
    supabaseCategory: 'Big Five Safari',
  },
  'birds': {
    label:     '🦅 Bird Watching',
    badge:     '🦅 Bird Watching',
    heroTitle: 'Kenya\'s Premier <em>Bird Watching</em> Destinations',
    heroDesc:  'Discover 1,100+ bird species — from flamingos at Nakuru to eagles soaring over the Rift Valley.',
    heroBg:    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80&auto=format',
    introTitle:'A Birder\'s <em>Paradise</em>',
    introDesc: 'Kenya is one of the top birding destinations in the world with over 1,100 recorded species. Lake Nakuru, Kakamega Forest and the Maasai Mara are must-visit sites for birders.',
    stats:     [{ val:'1,100+', lbl:'Bird Species' }, { val:'10', lbl:'Top Sites' }, { val:'4.7★', lbl:'Avg Rating' }],
    gridTitle: 'Bird Watching Destinations',
    breadcrumb:'Bird Watching',
    supabaseCategory: 'Bird Watching',
  },
  'mountain': {
    label:     '⛰️ Mountain Treks',
    badge:     '⛰️ Mountain Treks',
    heroTitle: 'Kenya\'s Most Spectacular <em>Mountain Treks</em>',
    heroDesc:  'Conquer Mount Kenya — Africa\'s second highest peak — through lush rainforest and glacial zones.',
    heroBg:    'https://images.unsplash.com/photo-1589825743638-54a8ee3b6d67?w=1400&q=80&auto=format',
    introTitle:'Trekking <em>Above the Clouds</em>',
    introDesc: 'From the glaciers of Mount Kenya to the Aberdare Ranges, Kenya offers world-class trekking experiences for all levels — from gentle forest walks to summit attempts at 5,199m.',
    stats:     [{ val:'4', lbl:'Trekking Routes' }, { val:'5,199m', lbl:'Max Altitude' }, { val:'4.8★', lbl:'Avg Rating' }],
    gridTitle: 'Mountain Trekking Destinations',
    breadcrumb:'Mountain Treks',
    supabaseCategory: 'Mountain Treks',
  },
  'beach': {
    label:     '🏖️ Beach Escapes',
    badge:     '🏖️ Beach Escapes',
    heroTitle: 'Kenya\'s Most Beautiful <em>Beach Destinations</em>',
    heroDesc:  'Unwind on the stunning Indian Ocean coast — Diani, Watamu, Malindi, and beyond.',
    heroBg:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80&auto=format',
    introTitle:'Kenya\'s <em>Indian Ocean Coast</em>',
    introDesc: 'Kenya\'s 500km coastline stretches from the border of Tanzania to Somalia, offering pristine white-sand beaches, ancient Swahili towns, and vibrant coral reefs.',
    stats:     [{ val:'500km', lbl:'Coastline' }, { val:'6', lbl:'Top Beaches' }, { val:'4.8★', lbl:'Avg Rating' }],
    gridTitle: 'Beach Destinations',
    breadcrumb:'Beach Escapes',
    supabaseCategory: 'Beach Escapes',
  },
  'cultural': {
    label:     '🎭 Cultural Tours',
    badge:     '🎭 Cultural Tours',
    heroTitle: 'Kenya\'s Rich <em>Cultural & Heritage</em> Experiences',
    heroDesc:  'Visit Maasai villages, Swahili coastal towns, and Nairobi\'s vibrant arts and heritage scene.',
    heroBg:    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=80&auto=format',
    introTitle:'Culture & <em>Heritage in Kenya</em>',
    introDesc: 'Kenya is home to 42+ ethnic communities, each with unique traditions, music, dance and cuisine. From the Maasai Mara to Lamu Old Town — Kenya\'s cultural richness is extraordinary.',
    stats:     [{ val:'42+', lbl:'Ethnic Communities' }, { val:'8', lbl:'Cultural Sites' }, { val:'4.7★', lbl:'Avg Rating' }],
    gridTitle: 'Cultural Tour Destinations',
    breadcrumb:'Cultural Tours',
    supabaseCategory: 'Cultural Tours',
  },
};

const ATTRACTION_TYPES = Object.keys(ATTRACTION_META);

/* ─────────────────────────────────────────────────────────────────────
   LOAD ATTRACTIONS FROM SUPABASE
───────────────────────────────────────────────────────────────────── */
async function loadAttractions(type) {
  const grid = document.getElementById('sportsGrid');
  const meta = ATTRACTION_META[type];

  grid.innerHTML = Array(6).fill(`
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="height:200px;background:#e8e8e8;animation:shimmer 1.4s infinite;"></div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
        <div style="height:14px;background:#e8e8e8;border-radius:6px;animation:shimmer 1.4s infinite;"></div>
        <div style="height:12px;width:60%;background:#e8e8e8;border-radius:6px;animation:shimmer 1.4s infinite;"></div>
      </div>
    </div>`).join('');

  let items = [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/${ATTRACT_TABLE}?category=eq.${encodeURIComponent(meta.supabaseCategory)}&order=rating.desc&limit=50&select=*`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const data = await res.json();
    items = Array.isArray(data) ? data : [];
    console.log(`[category.js] attractions type="${type}" → ${items.length} rows`);
  } catch (err) {
    console.warn('[category.js] Attraction fetch failed:', err.message);
  }

  if (!items.length) {
    console.info(`[category.js] Supabase returned 0 rows for "${type}" — using static fallback`);
    const staticPool = (typeof DESTINATIONS !== 'undefined' && DESTINATIONS[type]) ? DESTINATIONS[type] : [];
    items = staticPool.map(d => ({
      slug:        d.slug,
      name:        d.name,
      county:      d.county,
      difficulty:  d.difficulty,
      rating:      d.rating,
      best_time:   d.best_time,
      description: d.description,
      image_hero:  d.image || d.image_hero || '',
      highlights:  d.highlights || [],
    }));
  }

  document.getElementById('gridTitle').textContent = meta.gridTitle;
  document.getElementById('gridCount').textContent = items.length ? `${items.length} destinations` : '';

  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#666;">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">No destinations found</h3>
      <p>Check back soon or explore other categories.</p>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(a => {
    const slug   = a.slug || '';
    const name   = a.name || 'Destination';
    const img    = a.image_hero || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80&auto=format';
    const rating = a.rating ? Number(a.rating).toFixed(1) : '';
    const diff   = a.difficulty || '';
    const county = a.county || a.location || '';
    const best   = a.best_time || '';
    const desc   = a.description ? (a.description.length > 100 ? a.description.slice(0,100)+'…' : a.description) : '';
    return `
      <a href="attraction-details.html?id=${slug}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);transition:transform .2s,box-shadow .2s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 28px rgba(0,0,0,0.13)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'">
        <div style="position:relative;height:200px;overflow:hidden;">
          <img src="${img}" alt="${name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"
               onerror="this.src='https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80&auto=format'"/>
          ${diff ? `<span style="position:absolute;top:12px;left:12px;background:#E8541A;color:#fff;font-size:0.72rem;font-weight:600;padding:3px 10px;border-radius:50px;text-transform:uppercase;">${diff}</span>` : ''}
          ${rating ? `<span style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.55);color:#fff;font-size:0.8rem;font-weight:600;padding:3px 9px;border-radius:50px;backdrop-filter:blur(4px);">⭐ ${rating}</span>` : ''}
        </div>
        <div style="padding:16px;flex:1;display:flex;flex-direction:column;gap:6px;">
          <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;">${name}</div>
          ${desc ? `<div style="font-size:0.85rem;color:#666;line-height:1.5;flex:1;">${desc}</div>` : ''}
          <div style="display:flex;gap:12px;font-size:0.78rem;color:#888;flex-wrap:wrap;margin-top:4px;">
            ${county ? `<span>📍 ${county}</span>` : ''}
            ${best   ? `<span>🕐 ${best}</span>`   : ''}
          </div>
          <span style="color:#E8541A;font-size:0.85rem;font-weight:600;margin-top:8px;">Explore →</span>
        </div>
      </a>`;
  }).join('');
}

/* ─────────────────────────────────────────────────────────────────────
   DOMContentLoaded — DEFAULT TO FOOTBALL TAB
───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  const params = new URLSearchParams(window.location.search);
  const param  = params.get('sport') || params.get('type');

  /* ── Attraction type: hide sports tabs, render attractions ── */
  if (param && ATTRACTION_TYPES.includes(param)) {
    const m = ATTRACTION_META[param];
    document.title = `${m.label} — SafariQuest Kenya`;

    const tabsBar    = document.querySelector('.sport-tabs-bar');
    const panelIntro = document.getElementById('panelIntro');
    if (tabsBar)    tabsBar.style.display    = 'none';
    if (panelIntro) panelIntro.style.display = 'none';

    const hero = document.getElementById('catHero');
    if (hero) hero.style.backgroundImage = `url('${m.heroBg}')`;
    const el = id => document.getElementById(id);
    if (el('heroBreadcrumb')) el('heroBreadcrumb').textContent = m.breadcrumb;
    if (el('heroBadge'))      el('heroBadge').textContent      = m.badge;
    if (el('heroTitle'))      el('heroTitle').innerHTML         = m.heroTitle;
    if (el('heroDesc'))       el('heroDesc').textContent        = m.heroDesc;

    if (panelIntro) {
      panelIntro.style.display = 'block';
      const statsHtml = m.stats.map(s => `<div class="stat-item"><span class="stat-val">${s.val}</span><span class="stat-lbl">${s.lbl}</span></div>`).join('');
      document.getElementById('introLabel').textContent = m.label;
      document.getElementById('introTitle').innerHTML   = m.introTitle;
      document.getElementById('introDesc').textContent  = m.introDesc;
      document.getElementById('panelStats').innerHTML   = statsHtml;
    }

    loadAttractions(param);
    return;
  }

  /* ── Sports type: always default to football tab ── */
  const valid  = Object.keys(SPORT_META);
  /* Only honour the URL param if it's a known sport; otherwise force football */
  currentSport = (param && valid.includes(param)) ? param : 'football';

  /* If URL had a non-football sport param, update URL to reflect actual tab shown */
  if (!param || !valid.includes(param)) {
    history.replaceState(null, '', `?sport=football`);
  }

  document.title = `${PAGE_TITLES[currentSport] || 'Destinations'} — SafariQuest Kenya`;

  /* Activate the correct tab button */
  document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.sport-tab[data-sport="${currentSport}"]`);
  if (activeTab) activeTab.classList.add('active');

  updateHero(currentSport);
  loadSport(currentSport);
});

/* ─────────────────────────────────────────────────────────────────────
   SWITCH SPORT TAB
───────────────────────────────────────────────────────────────────── */
window.switchSport = function (sport, btn) {
  if (sport === currentSport) return;
  currentSport = sport;
  document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  history.replaceState(null, '', `?sport=${sport}`);
  document.title = `${PAGE_TITLES[sport] || 'Destinations'} — SafariQuest Kenya`;
  updateHero(sport);
  loadSport(sport);
};

/* ─────────────────────────────────────────────────────────────────────
   UPDATE HERO SECTION
───────────────────────────────────────────────────────────────────── */
function updateHero(sport) {
  const m    = SPORT_META[sport];
  const hero = document.getElementById('catHero');

  if (hero) {
    hero.style.backgroundImage = `url('${m.heroFallbackBg}')`;
    const img = new Image();
    img.onload = () => { hero.style.backgroundImage = `url('${m.heroBg}')`; };
    img.onerror = () => { /* keep fallback */ };
    img.src = m.heroBg;
  }

  const el = (id) => document.getElementById(id);
  if (el('heroBreadcrumb')) el('heroBreadcrumb').textContent = m.breadcrumb;
  if (el('heroBadge'))      el('heroBadge').textContent      = m.badge;
  if (el('heroTitle'))      el('heroTitle').innerHTML         = m.heroTitle;
  if (el('heroDesc'))       el('heroDesc').textContent        = m.heroDesc;
}

/* ─────────────────────────────────────────────────────────────────────
   UPDATE INTRO PANEL
───────────────────────────────────────────────────────────────────── */
function updateIntro(sport) {
  const m = SPORT_META[sport];
  document.getElementById('introLabel').textContent = m.label;
  document.getElementById('introTitle').innerHTML   = m.introTitle;
  document.getElementById('introDesc').textContent  = m.introDesc;
  document.getElementById('panelStats').innerHTML   = m.stats.map(s => `
    <div class="stat-box">
      <strong>${s.val}</strong>
      <span>${s.lbl}</span>
    </div>`).join('');
  document.getElementById('gridTitle').textContent  = m.grid;
}

/* ─────────────────────────────────────────────────────────────────────
   LOAD DESTINATIONS  —  Supabase first, static fallback
───────────────────────────────────────────────────────────────────── */
async function loadSport(sport) {
  updateIntro(sport);
  showSkeletons();

  let destinations = [];

  try {
    if (typeof getSportsDestinations === 'function') {
      const supabaseData = await getSportsDestinations(sport);
      if (supabaseData && supabaseData.length > 0) {
        destinations = supabaseData;
      }
    }
  } catch (err) {
    console.warn('Supabase unavailable, using static fallback:', err);
  }

  if (!destinations.length) {
    destinations = STATIC_SPORTS[sport] || [];
  }

  const cntEl = document.getElementById(`cnt-${sport}`);
  if (cntEl) cntEl.textContent = destinations.length;

  document.getElementById('gridCount').textContent =
    `${destinations.length} destination${destinations.length !== 1 ? 's' : ''}`;

  renderGrid(destinations);
}

/* ─────────────────────────────────────────────────────────────────────
   RENDER GRID
───────────────────────────────────────────────────────────────────── */
function renderGrid(destinations) {
  const grid = document.getElementById('sportsGrid');
  if (!destinations.length) {
    grid.innerHTML = `
      <div class="state-box">
        <div class="state-icon">🏟️</div>
        <h4>No venues found</h4>
        <p>No destinations are listed for this sport yet. Check back soon!</p>
      </div>`;
    return;
  }
  grid.innerHTML = destinations.map(d => buildCard(d)).join('');
}

/* ─────────────────────────────────────────────────────────────────────
   BUILD CARD
   noDetail flag (rally) → card shows WRC schedule button only, no explore link
───────────────────────────────────────────────────────────────────── */
function buildCard(d) {
  const diff     = (d.difficulty || 'Easy').toLowerCase();
  const fallback  = `${STORAGE_BASE}/football/kasarani-stadium.jpg`;
  let img         = d.image_hero || fallback;

  if (typeof img === 'string' && img.startsWith('[')) {
    try { img = JSON.parse(img)[0] || fallback; } catch (_) { img = fallback; }
  }

  const tags     = Array.isArray(d.highlights) ? d.highlights.slice(0, 3) : [];
  const schedURL = d.schedule || '#';
  const county   = d.county   || '';
  const bestTime = d.best_time || 'Year-round';

  /* For rally (noDetail: true) — no clickable card nav, no Explore link */
  const cardClick = d.noDetail ? '' : `onclick="window.location.href='sports-details.html?id=${d.slug}'"`;
  const cardStyle = d.noDetail ? 'cursor:default;' : 'cursor:pointer;';

  const exploreLink = d.noDetail
    ? ''
    : `<a href="sports-details.html?id=${d.slug}" class="explore-link" onclick="event.stopPropagation()">⚡ Explore →</a>`;

  return `
    <div class="dest-card" ${cardClick} style="${cardStyle}">
      <div class="dest-img-wrap" style="position:relative;overflow:hidden;height:200px;border-radius:16px 16px 0 0;">
        <img
          src="${img}"
          alt="${d.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallback}'"
          style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s;"
        />
        <span class="difficulty-badge diff-${diff}"
              style="position:absolute;top:12px;left:12px;padding:4px 12px;border-radius:20px;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
          ${d.difficulty || 'Easy'}
        </span>
        <span style="position:absolute;top:12px;right:12px;background:rgba(26,26,26,0.8);backdrop-filter:blur(4px);color:#fff;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:20px;">
          ⭐ ${d.rating}
        </span>
        ${d.featured ? '<span style="position:absolute;bottom:12px;left:12px;background:#E8541A;color:#fff;font-size:0.65rem;font-weight:700;padding:3px 10px;border-radius:12px;text-transform:uppercase;letter-spacing:0.5px;">⭐ Featured</span>' : ''}
      </div>
      <div class="dest-body">
        <div class="dest-header">
          <div class="dest-name">${d.name}</div>
          <div class="dest-rating" style="color:#E8541A;font-weight:700;font-size:0.82rem;white-space:nowrap;">⭐ ${d.rating}</div>
        </div>
        <div class="dest-desc">${d.description}</div>
        <div class="dest-meta">
          ${county   ? `<div class="dest-meta-item">📍 ${county} County</div>` : ''}
          <div class="dest-meta-item">🕐 Best: ${bestTime}</div>
        </div>
        <div class="dest-tags">
          ${tags.map(h => `<span class="tag">${h}</span>`).join('')}
        </div>
        <div class="dest-footer">
          ${exploreLink}
          ${schedURL !== '#'
            ? `<a href="${schedURL}" class="schedule-btn" target="_blank" rel="noopener" onclick="event.stopPropagation()">📅 WRC Schedule</a>`
            : ''}
        </div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────────
   SKELETON LOADERS
───────────────────────────────────────────────────────────────────── */
function showSkeletons() {
  document.getElementById('sportsGrid').innerHTML =
    Array(9).fill(`
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`).join('');
}

function showError() {
  document.getElementById('sportsGrid').innerHTML = `
    <div class="state-box">
      <div class="state-icon">⚠️</div>
      <h4>Failed to load destinations</h4>
      <p>Something went wrong. Please refresh the page or try again later.</p>
    </div>`;
}