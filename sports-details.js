/* ══════════════════════════════════════════════════════════════════════
   sports-details.js  —  SafariQuest Kenya
   Loads facility details from local data + Supabase DB row.
   URL format: sports-details.html?id=kasarani-stadium
══════════════════════════════════════════════════════════════════════ */

const SD_SUPABASE_URL = 'https://cbyipmrozqsntojiartw.supabase.co';
const SD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlwbXJvenFzbnRvamlhcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTkxNTQsImV4cCI6MjA4ODk3NTE1NH0.31TAhmUCV_Uh0W8FGnR2_TLCZDU4YBM1U5LMSMc5JZs';

/* ══════════════════════════════════════════════════════════════════════
   FACILITY DATABASE
   Rich local data for each facility. image_hero from Supabase DB
   overrides the image field here if present.
══════════════════════════════════════════════════════════════════════ */
const FACILITY_DATA = {

  /* ─── FOOTBALL ──────────────────────────────────────────────────── */

  'kasarani-stadium': {
    fullName:    'Moi International Sports Centre, Kasarani',
    sport:       'football',
    county:      'Nairobi',
    established: 1987,
    capacity:    60000,
    surface:     'Natural Grass + 8-Lane Tartan Athletics Track',
    image:       'https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
      'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
    ],
    about: `Moi International Sports Centre, Kasarani — popularly known as Kasarani Stadium or Safaricom Stadium Kasarani — is Kenya's premier national sports facility. Built in 1987 for the All-Africa Games, it remains the country's largest and most prestigious sporting venue with a seating capacity of 60,000.

Managed by Sports Kenya, the complex spans over 200 acres and houses a main football stadium, an indoor arena, an aquatic complex with five pools, a gymnasium, tartan athletics tracks, and the Stadion Hotel. The facility co-hosted the 2024 African Nations Championship (CHAN) alongside Nyayo Stadium, with the tournament final held here on 30 August 2025.

The stadium recently underwent major renovations ahead of CHAN 2024 including floodlight upgrades, new seating, and improved crowd management infrastructure. It is also Kenya's primary venue for AFCON 2027 qualification matches.`,
    facilities: [
      { icon: '🏟️', name: 'Main Stadium',         desc: '60,000 seats, natural grass pitch, FIFA-approved international standard' },
      { icon: '🏊', name: '5 Swimming Pools',      desc: 'Olympic 50m, diving 5.3m deep (10m platform), standard 25m, baby pool, residential pool' },
      { icon: '🏀', name: 'Indoor Arena',           desc: '5,000-seat arena for basketball, volleyball, boxing, martial arts & concerts' },
      { icon: '🏃', name: 'Athletics Track',        desc: '8-lane IAAF-certified tartan track, open for public jogging daily' },
      { icon: '💪', name: 'Gymnasium',              desc: 'Fully equipped Stadia Health & Fitness Centre with professional equipment' },
      { icon: '🅿️', name: 'Ample Parking',         desc: 'On-site parking for 2,000+ vehicles across multiple zones' },
      { icon: '🏨', name: 'Stadion Hotel',          desc: 'On-site accommodation for athletes, officials and guests' },
      { icon: '🍽️', name: 'VIP Restaurant',        desc: 'Premium dining in the Indoor Arena complex, open to members and guests' },
      { icon: '🎤', name: 'Conference Facilities',  desc: 'Halls for meetings, exhibitions, weddings and banquets' },
      { icon: '🩺', name: 'Medical Centre',         desc: 'On-site first aid and fully staffed medical team on all match days' },
      { icon: '📷', name: 'CCTV Security',          desc: '102 cameras monitored 24/7, upgraded for CHAN 2024' },
      { icon: '♿', name: 'Accessibility',           desc: 'Wheelchair accessible sections and facilities throughout the complex' },
    ],
    ticketPrices: [
      { zone: 'Regular / General',  price: 'KSh 200 – 250',    desc: 'General terraces and standard uncovered seating' },
      { zone: 'Gold',               price: 'KSh 500',           desc: 'Covered seated sections with a good view of the pitch' },
      { zone: 'VIP',                price: 'KSh 1,000',         desc: 'VIP seated enclosure with access to premium facilities' },
      { zone: 'VVIP / Hospitality', price: 'KSh 2,500+',        desc: 'Presidential suite, corporate boxes and hospitality packages' },
      { zone: 'Public Swimming',    price: 'KSh 150 adults / KSh 50 children', desc: 'Daily recreational access to all pools' },
      { zone: 'Public Jogging (Track)', price: 'KSh 100/person/day', desc: 'Full tartan athletics track, no booking required' },
    ],
    hiringRates: [
      { service: 'Full Stadium — International Match',  cost: 'KSh 500,000 – 1,000,000 / match', note: 'Includes security, stewards, medical, floodlights' },
      { service: 'Full Stadium — KPL / Local Match',    cost: 'KSh 100,000 – 300,000 / match',   note: 'FKF-negotiated rates apply for affiliated clubs' },
      { service: 'Training Session (Pitch Only)',        cost: 'KSh 20,000 – 50,000 / session',   note: '2–3 hour sessions, advance booking required' },
      { service: 'Indoor Arena — Sports Event',         cost: 'KSh 100,000 – 500,000 / event',   note: 'Basketball, volleyball, boxing, martial arts' },
      { service: 'Indoor Arena — Concert / Show',       cost: 'KSh 300,000 – 800,000 / event',   note: 'Subject to Sports Kenya approval' },
      { service: 'Conference / Exhibition Hall',        cost: 'KSh 50,000 – 200,000 / day',      note: 'Multiple hall sizes available' },
      { service: 'Photography / Film Shoot',            cost: 'KSh 30,000 – 100,000 / day',      note: 'Subject to availability and approval' },
    ],
    howToBuy: [
      {
        title: 'Official Online — Mookh Platform',
        desc: 'Purchase tickets via <a href="https://mookh.com" target="_blank" rel="noopener">mookh.com</a> — the official FKF and Sports Kenya ticketing partner. Select your match, choose your tier, pay securely via M-Pesa or card, and receive your e-ticket instantly.'
      },
      {
        title: 'M-Pesa Paybill',
        desc: 'Use FKF Paybill <strong>522200</strong>. Enter the match code as the Account Number. Your ticket will be sent via SMS to your registered M-Pesa number within minutes of payment.'
      },
      {
        title: 'Physical Box Office',
        desc: 'Kasarani Stadium Box Office at Gate 11. Open Monday – Friday 8:00 AM – 5:00 PM and on all match days from 9:00 AM until kick-off. Cash only. Avoid queues by buying online.'
      },
      {
        title: 'Authorised Ticket Agents',
        desc: 'Selected Naivas Supermarket and Equity Bank branches in Nairobi stock tickets for high-profile fixtures. <strong>Avoid street touts</strong> — all third-party tickets are invalid and non-refundable.'
      },
    ],
    schedule: [
      { day: 'Ongoing', month: '2026',        event: 'FKF Premier League — Home Fixtures',       time: '3:00 PM & 7:30 PM EAT', badge: 'upcoming', note: 'Gor Mahia & AFC Leopards home games' },
      { day: 'TBC',     month: '2026',        event: 'AFCON 2027 Qualifier — Harambee Stars',     time: '4:00 PM EAT',           badge: 'tbc',      note: 'Venue subject to CAF confirmation' },
      { day: 'Daily',   month: 'Year-round',  event: 'Public Swimming — Aquatic Complex',         time: '6:00 AM – 6:00 PM',     badge: 'live',     note: 'All 5 pools open, lifeguards on duty' },
      { day: 'Daily',   month: 'Year-round',  event: 'Athletics Track — Public Jogging',          time: '5:30 AM – 7:00 PM',     badge: 'live',     note: 'No booking required, KSh 100/day' },
      { day: 'Mon–Sat', month: 'Year-round',  event: 'Gymnasium Sessions',                       time: '6:00 AM – 8:00 PM',     badge: 'live',     note: 'Membership or pay-per-visit available' },
    ],
    hours: {
      'Mon – Fri':          '6:00 AM – 9:00 PM',
      'Saturday':           '6:00 AM – 8:00 PM',
      'Sunday':             '7:00 AM – 6:00 PM',
      'Public Holidays':    '7:00 AM – 6:00 PM',
      'Match Days':         'Open from 9:00 AM',
    },
    contact: {
      phone:   '+254 020 239 0502',
      phone2:  '+254 020 239 0501',
      email:   'info@stadiumskenya.co.ke',
      web:     'http://www.sportskenya.org',
      address: 'Kasarani, Nairobi, Kenya',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6741765822786!2d36.892737!3d-1.220572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3f5b52e1caed%3A0x697c87e2b16e3c6d!2sMoi%20International%20Sports%20Centre%2C%20Kasarani!5e0!3m2!1sen!2ske!4v1694000000000',
    tags: ['International Venue', 'CAF Approved', 'FIFA Standard', 'IAAF Certified', 'CHAN 2024 Host', 'Aquatic Complex', '60,000 Capacity'],
  },

  'nyayo-stadium': {
    fullName:    'Nyayo National Stadium',
    sport:       'football',
    county:      'Nairobi',
    established: 1983,
    capacity:    30000,
    surface:     'Natural Grass + 8-Lane Tartan Athletics Track',
    image:       'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?w=800&q=80',
      'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&q=80',
    ],
    about: `Nyayo National Stadium, completed in 1983 on Langata Road in Nairobi, is Kenya's second national stadium and a cornerstone of the country's football landscape. With a capacity of 30,000, it regularly hosts Kenya Premier League matches, international friendlies, AFCON qualifiers and athletics competitions.

The stadium features an Olympic-size swimming pool, a 2,500-seat indoor arena, a full tartan athletics track, and a dedicated handball court — all managed by Sports Kenya. It co-hosted CHAN 2024 group stage matches alongside Kasarani Stadium.

The arena complex houses changing rooms, VIP lounges and washrooms, making it a versatile venue for both elite competition and public recreation.`,
    facilities: [
      { icon: '🏟️', name: 'Main Stadium',       desc: '30,000 seats, natural grass pitch, international standard' },
      { icon: '🏊', name: 'Olympic Pool (50m)',  desc: 'Full Olympic-size pool, always well-maintained and open to public' },
      { icon: '🏀', name: 'Indoor Arena',         desc: '2,500-seat arena — basketball, volleyball, boxing & martial arts' },
      { icon: '🏃', name: 'Athletics Track',      desc: '8-lane tartan track, open for public jogging daily' },
      { icon: '🤾', name: 'Handball Court',       desc: 'Dedicated full-size handball court, rare in Nairobi' },
      { icon: '🅿️', name: 'Parking',             desc: 'On-site parking for 1,000+ vehicles' },
      { icon: '🩺', name: 'Medical Centre',       desc: 'First aid and medical support on all event days' },
    ],
    ticketPrices: [
      { zone: 'Regular',  price: 'KSh 200',        desc: 'General admission terraces' },
      { zone: 'Gold',     price: 'KSh 500',         desc: 'Covered seated section with good pitch views' },
      { zone: 'VIP',      price: 'KSh 1,000',       desc: 'VIP enclosure with premium facilities' },
      { zone: 'Public Swimming', price: 'KSh 150 adults / KSh 50 children', desc: 'Daily recreational pool access' },
      { zone: 'Athletics Track', price: 'KSh 100 / day', desc: 'Public jogging and training' },
    ],
    hiringRates: [
      { service: 'Full Stadium — KPL Match',        cost: 'KSh 80,000 – 200,000 / match',   note: 'FKF affiliated clubs, negotiated rates' },
      { service: 'Full Stadium — International',    cost: 'KSh 300,000 – 600,000 / match',  note: 'Includes security, stewards, medical' },
      { service: 'Training Session',                cost: 'KSh 15,000 – 30,000 / session',  note: '2-hour sessions, advance booking required' },
      { service: 'Indoor Arena',                    cost: 'KSh 80,000 – 300,000 / event',   note: 'Basketball, volleyball, boxing, concerts' },
      { service: 'Vendor Access (per match)',        cost: 'KSh 500 / vendor',                note: 'Food and merchandise stalls' },
    ],
    howToBuy: [
      { title: 'Online via Mookh',    desc: 'Visit <a href="https://mookh.com" target="_blank">mookh.com</a> for all FKF Premier League and international match tickets.' },
      { title: 'M-Pesa Paybill',      desc: 'FKF Paybill <strong>522200</strong>. Account Number: match code. E-ticket delivered via SMS instantly.' },
      { title: 'Physical Box Office', desc: 'Nyayo Stadium Gate A, open on all match days from 9:00 AM. Cash only at the gate.' },
    ],
    schedule: [
      { day: 'Ongoing', month: '2026',       event: 'FKF Premier League — Home Fixtures',  time: '3:00 PM EAT',           badge: 'upcoming', note: 'AFC Leopards & Bandari FC home games' },
      { day: 'Daily',   month: 'Year-round', event: 'Public Swimming Sessions',            time: '6:00 AM – 6:00 PM',     badge: 'live',     note: 'Olympic pool open to public daily' },
      { day: 'Daily',   month: 'Year-round', event: 'Athletics Track — Public Jogging',   time: '5:30 AM – 7:00 PM',     badge: 'live',     note: 'No booking required' },
    ],
    hours: {
      'Mon – Fri':       '6:00 AM – 9:00 PM',
      'Saturday':        '6:00 AM – 8:00 PM',
      'Sunday':          '7:00 AM – 6:00 PM',
      'Public Holidays': '7:00 AM – 6:00 PM',
    },
    contact: {
      phone:   '+254 020 239 0502',
      email:   'info@stadiumskenya.co.ke',
      web:     'http://www.sportskenya.org',
      address: 'Langata Road, Nairobi, Kenya',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.93!2d36.8208!3d-1.3098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1b39a0b0a4f7%3A0x1e4fca71a5e07d!2sNyayo%20National%20Stadium!5e0!3m2!1sen!2ske!4v1694000000001',
    tags: ['FKF Premier League', 'CHAN 2024 Host', 'Olympic Pool', 'Athletics Track', 'Indoor Arena', '30,000 Capacity'],
  },

  /* ─── GOLF ─────────────────────────────────────────────────────── */

  'muthaiga-golf-club': {
    fullName:    'Muthaiga Golf Club',
    sport:       'golf',
    county:      'Nairobi',
    established: 1913,
    capacity:    500,
    surface:     '18-Hole Championship Course — Par 71, 6,072m',
    image:       'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
      'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
      'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80',
    ],
    about: `Muthaiga Golf Club, established in 1913, is Kenya's oldest and most prestigious golf club. Set amid 150 acres of indigenous trees and manicured fairways in Nairobi's leafy Muthaiga suburb, the club has hosted the Magical Kenya Open — a DP World Tour event — since 1967, making it one of Africa's longest-running professional golf tournaments.

The championship course plays to par 71 over 6,072 metres and is renowned for its challenging layout combining tight tree-lined fairways, undulating greens and classic parkland design. It is a private members' club but welcomes visitors on weekdays subject to availability.

The clubhouse is a historic colonial building offering fine dining, a bar and function rooms for private events.`,
    facilities: [
      { icon: '⛳', name: '18-Hole Course',         desc: 'Par 71, 6,072m championship layout, immaculate conditioning' },
      { icon: '🏌️', name: 'Driving Range',          desc: 'Multi-bay covered practice range with range balls included' },
      { icon: '🟩', name: 'Practice Putting Green', desc: 'Championship-quality chipping and putting practice area' },
      { icon: '🎽', name: 'Pro Shop',               desc: 'Equipment, apparel, accessories and professional club fitting' },
      { icon: '🍽️', name: 'Clubhouse Restaurant',  desc: 'Fine dining and casual bar — open to members and invited guests' },
      { icon: '🚿', name: 'Changing Rooms',         desc: 'Full facilities with secure lockers for members and visitors' },
      { icon: '🏊', name: 'Swimming Pool',          desc: 'Members\' pool within the club grounds' },
      { icon: '🎾', name: 'Tennis Courts',           desc: 'Hard-court tennis available to members' },
      { icon: '🎊', name: 'Function Rooms',          desc: 'Banquet and conference space for private events' },
    ],
    ticketPrices: [
      { zone: 'Visitor Green Fee (Weekday)',        price: 'KSh 8,000 – 12,000',    desc: '18 holes including mandatory caddie fee' },
      { zone: 'Visitor Green Fee (Weekend/Holiday)',price: 'KSh 10,000 – 15,000',   desc: '18 holes — subject to member priority tee times' },
      { zone: 'Caddie Fee (Mandatory)',             price: 'KSh 1,500 – 2,000',     desc: 'Per round, tip at your discretion' },
      { zone: 'Trolley / Buggy Hire',              price: 'KSh 1,000 – 3,000',     desc: 'Per round, subject to availability' },
      { zone: 'Kenya Open — General Spectator',    price: 'KSh 500 – 1,000 / day', desc: 'DP World Tour event, held annually in March' },
      { zone: 'Kenya Open — VIP Hospitality',      price: 'KSh 5,000 – 15,000 / day', desc: 'Corporate packages available' },
    ],
    hiringRates: [
      { service: 'Corporate Golf Day (Full Course)',  cost: 'KSh 500,000+ / day',       note: 'Min. 72 players, full catering package included' },
      { service: 'Society Golf Day',                  cost: 'KSh 8,000–12,000 / player', note: 'Green fee + lunch, min. 20 players' },
      { service: 'Clubhouse — Banquet / Conference',  cost: 'KSh 50,000–200,000 / event', note: 'Subject to availability, members priority' },
    ],
    howToBuy: [
      {
        title: 'Visitor Tee Time Booking',
        desc: 'Contact the Club Secretary at <a href="mailto:secretary@muthaigagolfclub.co.ke">secretary@muthaigagolfclub.co.ke</a> or call <strong>+254 020 376 1513</strong>. Minimum 72-hour advance booking. Visitors must be introduced by a member or have a letter of introduction from their home club.'
      },
      {
        title: 'Kenya Open Spectator Tickets',
        desc: 'Available annually during the DP World Tour Magical Kenya Open (March). Purchase via <a href="https://www.kenyaopen.com" target="_blank">kenyaopen.com</a> or at the gate during the event.'
      },
      {
        title: 'Corporate & Society Bookings',
        desc: 'Contact the club events team for society days and corporate golf packages. Include your preferred date, group size and catering requirements in your inquiry.'
      },
    ],
    schedule: [
      { day: 'March',   month: '2026',       event: 'Magical Kenya Open — DP World Tour',  time: '7:00 AM – 6:00 PM', badge: 'upcoming', note: 'Europe\'s DP World Tour annual Kenya flagship' },
      { day: 'Monthly', month: 'Year-round', event: 'Monthly Medal Competition',           time: '7:00 AM Shotgun Start', badge: 'upcoming', note: 'Members only, all handicap categories' },
      { day: 'Tue–Sun', month: 'Year-round', event: 'Visitor Tee Times',                  time: '7:00 AM – 2:00 PM',  badge: 'live',     note: 'Subject to member priority, pre-booking required' },
      { day: 'Sat–Sun', month: 'Year-round', event: 'Members Club Competitions',          time: '7:00 AM Shotgun',    badge: 'upcoming', note: 'Weekly competitions for all club members' },
    ],
    hours: {
      'Tuesday – Friday': '6:30 AM – 7:00 PM',
      'Saturday':          '6:00 AM – 7:00 PM',
      'Sunday':            '6:30 AM – 5:00 PM',
      'Monday':            'CLOSED (Course Maintenance)',
    },
    contact: {
      phone:   '+254 020 376 1513',
      email:   'secretary@muthaigagolfclub.co.ke',
      web:     'https://www.muthaigagolfclub.co.ke',
      address: 'Muthaiga Road, Nairobi, Kenya',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.4!2d36.836!3d-1.253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173!2sMuthaiga+Golf+Club!5e0!3m2!1sen!2ske!4v1694000000002',
    tags: ['Est. 1913', 'DP World Tour', 'Kenya Open Host', 'Championship Course', 'Members Club', 'Visitor Friendly'],
  },

  /* ─── SAFARI RALLY ──────────────────────────────────────────────── */

  'naivasha-rally-stage': {
    fullName:    'WRC Safari Rally Kenya — Naivasha Service Park',
    sport:       'rally',
    county:      'Nakuru',
    established: 1953,
    capacity:    50000,
    surface:     'Red Murram, Loose Gravel, Volcanic Rock — Multiple Stage Types',
    image:       'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    ],
    about: `The WRC Safari Rally Kenya is one of the most iconic and brutally challenging events in world motorsport, held annually in June/July around Naivasha in Kenya's Rift Valley. First run in 1953, the Safari Rally returned to the FIA World Rally Championship calendar in 2021 after a 19-year absence and has firmly re-established itself as a fan favourite.

The Naivasha Service Park acts as the event's nerve centre — where all WRC manufacturer teams (Toyota, Hyundai, Ford) set up their workshops to repair and prepare cars between stages. Fan zones, grandstands, manufacturer displays and hospitality areas are concentrated here.

Stages wind through the Rift Valley, Hell's Gate National Park, Soysambu Conservancy and private farmland — making Kenya's roads some of the most dramatic and unpredictable in the entire WRC season.`,
    facilities: [
      { icon: '🚗', name: 'WRC Service Park',       desc: 'Central hub for all manufacturer team workshops and FIA operations' },
      { icon: '🏁', name: 'Ceremonial Start / Podium', desc: 'Official WRC start ramp and trophy podium finish area' },
      { icon: '🎪', name: 'Fan Zone',               desc: 'Interactive displays, manufacturer stands, driver appearances' },
      { icon: '🎭', name: 'Grandstand Seating',     desc: 'Ticketed covered grandstands at key spectator stage locations' },
      { icon: '🍔', name: 'Food Village',            desc: 'Full food and beverage concessions throughout the 4-day event' },
      { icon: '🅿️', name: 'Managed Parking',        desc: 'Designated zones with shuttle buses to stage spectator points' },
      { icon: '📸', name: 'Media Centre',            desc: 'Fully equipped press and broadcast facilities for accredited media' },
      { icon: '🩺', name: 'FIA Medical Units',       desc: 'Helicopter and ground medical teams at every stage' },
    ],
    ticketPrices: [
      { zone: 'Stage Spectator Point',          price: 'KSh 300 – 800',      desc: 'Roadside viewing at designated spectator zones' },
      { zone: 'Super Special Stage (Stadium)',  price: 'KSh 500 – 1,000',    desc: 'Crowd-pleasing head-to-head car duels, evening entertainment' },
      { zone: 'Service Park Access',            price: 'KSh 500 – 1,500',    desc: 'Walk around WRC manufacturer team workshops' },
      { zone: 'Multi-Day Event Pass',           price: 'KSh 2,000 – 5,000',  desc: 'Access across all 3–4 days of the event' },
      { zone: 'VIP Hospitality Package',        price: 'KSh 15,000 – 50,000',desc: 'Premium access, meals, close-up stage viewing' },
    ],
    hiringRates: [
      { service: 'Event Sponsorship / Branding', cost: 'Contact WRC / FIA directly',      note: 'Via FIA and Safari Rally Kenya LOC' },
      { service: 'Corporate Hospitality Tent',   cost: 'KSh 200,000 – 500,000 / event',   note: 'Limited packages, early booking essential' },
      { service: 'Media Accreditation',          cost: 'Free (qualified media only)',       note: 'Apply via WRC media portal months ahead' },
    ],
    howToBuy: [
      {
        title: 'Official WRC Ticketing',
        desc: 'Buy tickets at <a href="https://www.wrc.com" target="_blank" rel="noopener">wrc.com</a> under Events → Safari Rally Kenya, or via <a href="https://mookh.com" target="_blank">mookh.com</a> when tickets go on sale (usually 3–4 months before the event).'
      },
      {
        title: 'At the Gate on Event Days',
        desc: 'Day tickets available at service park and stage entrances. Cash and M-Pesa accepted. Arrive very early — popular stage spectator points sell out fast.'
      },
      {
        title: 'Corporate & VIP Packages',
        desc: 'Contact Safari Rally Kenya LOC via the WRC website. Hospitality packages must be booked 3–6 months in advance. Very limited availability.'
      },
    ],
    schedule: [
      { day: 'Wed',  month: 'June 2026', event: 'Safari Rally — Recce & Shakedown',   time: 'All Day',         badge: 'upcoming', note: 'Annual WRC round, exact dates TBC early 2026' },
      { day: 'Thu',  month: 'June 2026', event: 'Ceremonial Start & Super Special',   time: '6:00 PM EAT',     badge: 'upcoming', note: 'Evening crowd show — free to watch in Naivasha town' },
      { day: 'Fri',  month: 'June 2026', event: 'Full Stage Day 1 — Rift Valley',     time: '7:00 AM – 6:00 PM', badge: 'upcoming', note: 'Soysambu, Kedong, Oserian stages' },
      { day: 'Sat',  month: 'June 2026', event: 'Full Stage Day 2 — Hell\'s Gate',    time: '7:00 AM – 6:00 PM', badge: 'upcoming', note: 'Longonot, Hell\'s Gate, Sleeping Warrior stages' },
      { day: 'Sun',  month: 'June 2026', event: 'Power Stage & Podium Finish',        time: '2:00 PM EAT',     badge: 'upcoming', note: 'Live on WRC+, DStv & KBC TV' },
    ],
    hours: {
      'Service Park (Event Days)':    '7:00 AM – 9:00 PM',
      'Spectator Stages':              'Varies — check wrc.com for stage times',
      'Non-Event Period':              'Stages not accessible to the public',
    },
    contact: {
      phone:   '+254 722 000 000',
      email:   'info@safarirally.co.ke',
      web:     'https://www.wrc.com/en/events/safari-rally-kenya',
      address: 'Naivasha Service Park, Nakuru County, Kenya',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63804.8!2d36.431!3d-0.717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182972!2sNaivasha!5e0!3m2!1sen!2ske!4v1694000000003',
    tags: ['WRC World Championship', 'Est. 1953', 'Annual June/July', 'Fan Zone', 'Rift Valley', 'Corporate Hospitality'],
  },

  /* ─── BASKETBALL ────────────────────────────────────────────────── */

  'nyayo-indoor-arena': {
    fullName:    'Nyayo National Stadium Indoor Arena',
    sport:       'basketball',
    county:      'Nairobi',
    established: 1983,
    capacity:    2500,
    surface:     'Hardwood Parquet Floor — Multi-sport Indoor',
    image:       'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=80',
    ],
    about: `The Nyayo National Stadium Indoor Arena is Kenya's primary venue for indoor sports, hosting the Kenya Basketball Federation Premier League finals, FIBA Africa Zone V qualifying rounds, volleyball championships, boxing galas and martial arts events. With 2,500 seats and a hardwood parquet floor, it is the nation's top indoor competition venue.

The arena is part of the Nyayo National Stadium complex managed by Sports Kenya, and features VIP lounges, full changing room facilities, a professional PA system and international-standard floodlighting. It also hosts the Kasarani Indoor Arena sister facility at the main Kasarani complex, which seats 5,000.`,
    facilities: [
      { icon: '🏀', name: 'Basketball Court',      desc: 'FIBA-standard hardwood parquet, 3 full courts when not set for competition' },
      { icon: '🏐', name: 'Volleyball Court',      desc: 'Full-size competition volleyball setup, FIVB standard' },
      { icon: '🥊', name: 'Boxing Ring',           desc: 'Portable professional boxing ring for fight nights' },
      { icon: '🪑', name: '2,500 Seats',           desc: 'Fixed tiered seating with excellent sightlines from all positions' },
      { icon: '🚿', name: 'Changing Rooms',        desc: 'Separate facilities for home and away teams, with showers' },
      { icon: '🎤', name: 'PA System',             desc: 'Professional sound system with scoreboard display' },
      { icon: '💡', name: 'Floodlighting',         desc: 'International-standard LED indoor lighting' },
      { icon: '🍔', name: 'Concession Area',       desc: 'Food and beverage available on all match and event days' },
    ],
    ticketPrices: [
      { zone: 'Regular',  price: 'KSh 200 – 300',   desc: 'General seated admission, unreserved' },
      { zone: 'VIP',      price: 'KSh 500 – 1,000', desc: 'Premium section with better sightlines' },
      { zone: 'Student',  price: 'KSh 100',           desc: 'Valid student ID required at the gate' },
    ],
    hiringRates: [
      { service: 'Full Arena — Basketball / Volleyball Match', cost: 'KSh 50,000 – 150,000 / event',  note: 'Includes PA system, lighting, security' },
      { service: 'Training Session (Court Only)',              cost: 'KSh 5,000 – 15,000 / session',  note: '2–3 hour sessions, advance booking' },
      { service: 'Boxing / Martial Arts Event',               cost: 'KSh 80,000 – 200,000 / event',  note: 'Ring setup and ringside seating included' },
      { service: 'Concert / Entertainment Event',             cost: 'KSh 200,000 – 500,000 / event', note: 'Subject to Sports Kenya approval' },
    ],
    howToBuy: [
      { title: 'KBF Official Channels', desc: 'Kenya Basketball Federation tickets via <a href="https://www.kenyabasketball.com" target="_blank">kenyabasketball.com</a> or the official KBF social media pages.' },
      { title: 'At the Gate',           desc: 'Tickets sold at the arena entrance 1 hour before tip-off. Cash and M-Pesa accepted. No advance booking needed for regular-season games.' },
      { title: 'University Leagues',    desc: 'KUSA championship events — check with your university sports office for group block bookings.' },
    ],
    schedule: [
      { day: 'Ongoing', month: '2026',       event: 'KBF Premier League — Home Fixtures',   time: '5:00 PM & 7:30 PM EAT', badge: 'upcoming', note: 'Men\'s and women\'s league rounds, alternating weekends' },
      { day: 'Ongoing', month: '2026',       event: 'KUSA Basketball Championship',         time: 'Weekends, 10:00 AM',    badge: 'upcoming', note: 'University league rounds — check KUSA calendar' },
      { day: 'TBC',     month: '2026',       event: 'FIBA Africa Zone V Qualifier',         time: 'TBC',                   badge: 'tbc',      note: 'Subject to FIBA scheduling and confirmation' },
    ],
    hours: {
      'Mon – Fri':         '8:00 AM – 9:00 PM',
      'Saturday – Sunday': '8:00 AM – 7:00 PM',
      'Match Days':        'Gates open 1 hour before tip-off',
    },
    contact: {
      phone:   '+254 020 239 0502',
      email:   'info@stadiumskenya.co.ke',
      web:     'http://www.sportskenya.org',
      address: 'Nyayo National Stadium Complex, Langata Road, Nairobi',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.93!2d36.8208!3d-1.3098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1b39a0b0a4f7%3A0x1e4fca71a5e07d!2sNyayo%20National%20Stadium!5e0!3m2!1sen!2ske!4v1694000000004',
    tags: ['FIBA Certified', 'KBF Premier League', 'KUSA Venue', 'Multi-Sport', 'Boxing', 'Volleyball'],
  },

  /* ─── SWIMMING ──────────────────────────────────────────────────── */

  'kasarani-aquatic-centre': {
    fullName:    'Kasarani Aquatic Centre',
    sport:       'swimming',
    county:      'Nairobi',
    established: 1987,
    capacity:    5000,
    surface:     '5 Pools — Olympic 50m · Diving 5.3m · Standard 25m · Baby · Residential',
    image:       'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1400&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
      'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80',
      'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800&q=80',
    ],
    about: `The Kasarani Aquatic Centre is Kenya's premier and most comprehensive swimming facility, housing five pools catering to every age and ability — from toddlers taking their first swim to elite national champions competing in FINA/World Aquatics events.

It is the only aquatic facility in Kenya with a dedicated diving pool (5.3m deep with a 10-metre platform) and a full five-pool complex, making it the home of the Kenya Aquatics Federation national championships. Qualified swimming instructors and certified lifeguards are on duty at all pools at all times.

The centre is open daily to the general public, schools, clubs and elite squads. The 5,000-seat spectator grandstand makes it fully equipped to host national and regional competitive meets.`,
    facilities: [
      { icon: '🏊', name: 'Olympic Pool (50m)',      desc: '8 lanes, competition timing system, FINA standard' },
      { icon: '🤿', name: 'Diving Pool (5.3m deep)', desc: '10m, 7.5m and 3m diving platforms and springboards' },
      { icon: '🏊', name: 'Standard Pool (25m)',      desc: '6 lanes — ideal for clubs, schools and intermediate swimmers' },
      { icon: '👶', name: 'Baby Pool',               desc: 'Shallow toddler pool with qualified instructors always present' },
      { icon: '🏡', name: 'Residential Pool',        desc: 'For Stadion Hotel guests and residential clients' },
      { icon: '🪑', name: '5,000 Spectator Seats',  desc: 'Full grandstand for competitive national and regional meets' },
      { icon: '💪', name: 'Dryland Training Area',  desc: 'Warm-up and strength exercises area for competitive squads' },
      { icon: '🩺', name: 'Lifeguards on Duty',     desc: 'Certified lifeguards present at every pool at all times' },
    ],
    ticketPrices: [
      { zone: 'Adult — Recreational Swimming',   price: 'KSh 150 / day',      desc: 'Full access to Olympic and standard pools' },
      { zone: 'Child (Under 12)',                price: 'KSh 50 / day',       desc: 'Baby pool and standard pool access' },
      { zone: 'School Group (per pupil)',         price: 'KSh 50 – 100',       desc: 'Includes instructor-led session, booking required' },
      { zone: 'Diving Pool (per session)',        price: 'KSh 300 / session',  desc: 'Must demonstrate basic swimming competence first' },
      { zone: 'Swimming Lessons (per session)',   price: 'KSh 500 – 1,000',   desc: 'Qualified instructors, all ages and levels' },
      { zone: 'National Championship Spectator', price: 'KSh 200 – 500',      desc: 'KAF event days only' },
    ],
    hiringRates: [
      { service: 'Pool Hire — Club / School Training', cost: 'KSh 10,000 – 30,000 / session',   note: '2-hour sessions, advance booking required 48hrs' },
      { service: 'Full Centre — Championship Event',   cost: 'KSh 100,000 – 300,000 / event',   note: 'Includes timing system, officials area, spectator stands' },
      { service: 'Photography / Film Shoot',           cost: 'KSh 20,000 – 50,000 / day',        note: 'Subject to Sports Kenya approval' },
    ],
    howToBuy: [
      { title: 'Walk-In Daily Access',   desc: 'No booking required for recreational swimming. Pay at the aquatic centre cashier on arrival. Open every day 6:00 AM – 6:00 PM including weekends and public holidays.' },
      { title: 'School Group Bookings',  desc: 'Call Sports Kenya on <strong>+254 020 239 0502</strong> at least 48 hours in advance to reserve a time slot and allocate a swimming instructor.' },
      { title: 'Competition Tickets',    desc: 'Kenya Aquatics Federation event tickets via <a href="https://www.kenyaaquatics.org" target="_blank">kenyaaquatics.org</a>. Check their calendar for upcoming national championship dates.' },
      { title: 'Swimming Lesson Enrolment', desc: 'Enrol at the centre reception in person. Lessons run in blocks of 10 sessions for all age groups — beginner through advanced.' },
    ],
    schedule: [
      { day: 'Daily',   month: 'Year-round', event: 'Public Recreational Swimming',          time: '6:00 AM – 6:00 PM',  badge: 'live',     note: 'All 5 pools open, lifeguards on duty at all times' },
      { day: 'Daily',   month: 'Year-round', event: 'School Group Sessions',                 time: '8:00 AM – 12:00 PM', badge: 'live',     note: 'Advance booking required, 48 hours notice' },
      { day: 'Monthly', month: 'Year-round', event: 'KAF Club Competitive Meets',            time: '7:00 AM – 4:00 PM',  badge: 'upcoming', note: 'Check Kenya Aquatics Federation calendar' },
      { day: 'TBC',     month: '2026',       event: 'KAF National Long Course Championships', time: 'All Day',            badge: 'tbc',      note: 'Annual flagship event, exact date TBC' },
    ],
    hours: {
      'Daily (Mon – Sun including Holidays)': '6:00 AM – 6:00 PM',
      'Competition Days':                      '5:30 AM – 8:00 PM',
      'Christmas Day':                         '7:00 AM – 2:00 PM',
    },
    contact: {
      phone:   '+254 020 239 0502',
      email:   'info@stadiumskenya.co.ke',
      web:     'http://www.sportskenya.org',
      address: 'Moi International Sports Centre, Kasarani, Nairobi',
    },
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6741765822786!2d36.892737!3d-1.220572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3f5b52e1caed%3A0x697c87e2b16e3c6d!2sMoi%20International%20Sports%20Centre%2C%20Kasarani!5e0!3m2!1sen!2ske!4v1694000000000',
    tags: ['Olympic Pool', 'Diving Pool', 'KAF Certified', 'School Groups', 'Daily Public Access', '5,000 Spectator Seats'],
  },

};

/* ══════════════════════════════════════════════════════════════════════
   GENERIC FALLBACK for facilities not in FACILITY_DATA above
══════════════════════════════════════════════════════════════════════ */
function buildGenericData(row) {
  return {
    fullName:    row.name,
    sport:       row.sport,
    county:      row.county || '',
    established: null,
    capacity:    null,
    surface:     'Standard Sports Surface',
    image:       row.image_hero || 'https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?w=1400&q=90',
    gallery:     [],
    about:       row.description || 'Detailed facility information is being compiled. Please contact the venue directly for the latest details.',
    facilities:  (row.highlights || []).map(h => ({ icon: '✅', name: h, desc: '' })),
    ticketPrices:[{ zone: 'General Admission', price: 'Contact venue', desc: 'Prices vary by event and organiser' }],
    hiringRates: [{ service: 'Venue Hire', cost: 'Contact venue directly', note: 'Rates depend on event type and duration' }],
    howToBuy:    [{ title: 'Contact the Venue', desc: 'Reach out to the facility management directly for ticketing and booking information.' }],
    schedule:    [{ day: 'TBC', month: '2026', event: 'Upcoming Events', time: 'TBC', badge: 'tbc', note: 'Check official federation channels for schedule updates' }],
    hours:       { 'Opening Hours': 'Contact venue for current hours' },
    contact:     { phone: '+254 020 239 0502', email: 'info@stadiumskenya.co.ke', web: 'http://www.sportskenya.org', address: `${row.county || ''} County, Kenya` },
    mapEmbed:    null,
    tags:        (row.highlights || []).slice(0, 5),
  };
}

/* ══════════════════════════════════════════════════════════════════════
   SPORT LABELS
══════════════════════════════════════════════════════════════════════ */
const SPORT_LABELS = {
  football:   '⚽ Football',
  golf:       '⛳ Golf',
  rally:      '🚗 Safari Rally',
  basketball: '🏀 Basketball',
  swimming:   '🏊 Swimming',
};

/* ══════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* Navbar scroll */
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  /* Get slug from URL */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('id') || params.get('slug') || '';

  if (!slug) { renderNotFound(); return; }

  /* Try Supabase for DB row (image_hero + extra fields) */
  let dbRow = null;
  try {
    const res = await fetch(
      `${SD_SUPABASE_URL}/rest/v1/sports_destinations?slug=eq.${slug}&limit=1`,
      {
        headers: {
          'apikey':        SD_SUPABASE_KEY,
          'Authorization': `Bearer ${SD_SUPABASE_KEY}`,
        }
      }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) dbRow = data[0];
  } catch (e) {
    console.warn('Supabase fetch failed:', e);
  }

  /* Resolve facility data */
  const local    = FACILITY_DATA[slug];
  let facility   = local ? { ...local } : (dbRow ? buildGenericData(dbRow) : null);

  if (!facility) { renderNotFound(); return; }

  /* Merge DB image if available and valid */
  if (dbRow && dbRow.image_hero && dbRow.image_hero.startsWith('http')) {
    facility.image = dbRow.image_hero;
  }

  document.title = `${facility.fullName} — SafariQuest Kenya`;
  renderPage(facility);
});

/* ══════════════════════════════════════════════════════════════════════
   RENDER PAGE
══════════════════════════════════════════════════════════════════════ */
function renderPage(f) {
  const sportLabel = SPORT_LABELS[f.sport] || f.sport;

  document.getElementById('pageRoot').innerHTML = `

    <!-- HERO -->
    <div class="sd-hero" style="background-image:url('${f.image}');">
      <div class="sd-hero-overlay"></div>
      <div class="sd-hero-content">
        <div class="sd-breadcrumb">
          <a href="destinations.html">Destinations</a>
          <span>›</span>
          <a href="category.html?sport=${f.sport}">${sportLabel}</a>
          <span>›</span>
          <span>${f.fullName}</span>
        </div>
        <div class="sd-hero-badge">${sportLabel}</div>
        <h1>${f.fullName}</h1>
        <div class="sd-hero-meta">
          <span>📍 ${f.county} County</span>
          ${f.established ? `<span>🗓️ Est. ${f.established}</span>` : ''}
          ${f.capacity    ? `<span>👥 ${f.capacity.toLocaleString()} capacity</span>` : ''}
          <span>🟢 Open to Public</span>
        </div>
      </div>
    </div>

    <!-- STATS BAR -->
    <div class="sd-stats-bar">
      <div class="sd-stats-inner">
        ${f.capacity    ? `<div class="sd-stat"><strong>${f.capacity.toLocaleString()}</strong><span>Capacity</span></div>` : ''}
        ${f.established ? `<div class="sd-stat"><strong>${f.established}</strong><span>Established</span></div>` : ''}
        <div class="sd-stat"><strong>${f.facilities.length}</strong><span>Facilities</span></div>
        <div class="sd-stat"><strong>${f.ticketPrices.length}</strong><span>Ticket Tiers</span></div>
        <div class="sd-stat"><strong>${f.surface.split('—')[0].trim().split('·')[0].trim()}</strong><span>Surface</span></div>
      </div>
    </div>

    <!-- BODY -->
    <div class="sd-body">

      <!-- ── MAIN COLUMN ── -->
      <div>

        <!-- Gallery -->
        ${f.gallery.length > 0 ? `
          <div class="sd-gallery">
            <img src="${f.image}" alt="${f.fullName}" loading="lazy"/>
            ${f.gallery.slice(0, 2).map(g =>
              `<img src="${g}" alt="${f.fullName}" loading="lazy" onerror="this.style.display='none'"/>`
            ).join('')}
          </div>
        ` : ''}

        <!-- About -->
        <div class="sd-section sd-about">
          <div class="sd-section-title">
            <span class="icon">ℹ️</span>
            About This Facility
          </div>
          ${f.about.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}
          <div class="sd-tags">
            ${f.tags.map(t => `<span class="sd-tag">${t}</span>`).join('')}
          </div>
        </div>

        <!-- Facilities -->
        <div class="sd-section">
          <div class="sd-section-title">
            <span class="icon">🏗️</span>
            Facilities &amp; Services
          </div>
          <div class="sd-facilities-grid">
            ${f.facilities.map(fac => `
              <div class="sd-facility-card">
                <div class="sd-facility-icon">${fac.icon}</div>
                <div class="sd-facility-info">
                  <strong>${fac.name}</strong>
                  <span>${fac.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pricing -->
        <div class="sd-section">
          <div class="sd-section-title">
            <span class="icon">💰</span>
            Pricing &amp; Charges
          </div>
          <div class="sd-pricing-tabs">
            <button class="sd-ptab active" onclick="switchTab('spectator', this)">🎫 Spectator Tickets</button>
            <button class="sd-ptab" onclick="switchTab('hiring', this)">📋 Venue Hire Rates</button>
          </div>

          <div class="sd-pricing-panel active" id="panel-spectator">
            <table class="sd-price-table">
              <thead>
                <tr><th>Zone / Category</th><th>Price</th><th>What's Included</th></tr>
              </thead>
              <tbody>
                ${f.ticketPrices.map(t => `
                  <tr>
                    <td><strong>${t.zone}</strong></td>
                    <td>${t.price}</td>
                    <td style="color:#6B6B6B">${t.desc}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="sd-price-note">
              ℹ️ Prices shown are indicative and may vary by event, organiser and season. Always purchase through official channels only to avoid fraudulent tickets.
            </div>
          </div>

          <div class="sd-pricing-panel" id="panel-hiring">
            <table class="sd-price-table">
              <thead>
                <tr><th>Service</th><th>Estimated Cost</th><th>Notes</th></tr>
              </thead>
              <tbody>
                ${f.hiringRates.map(h => `
                  <tr>
                    <td><strong>${h.service}</strong></td>
                    <td>${h.cost}</td>
                    <td style="color:#6B6B6B">${h.note}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="sd-price-note">
              ℹ️ Hiring rates are indicative estimates. Final costs depend on event type, duration, additional services and negotiations with venue management. Always request a formal written quote.
            </div>
          </div>
        </div>

        <!-- How to Buy -->
        <div class="sd-section">
          <div class="sd-section-title">
            <span class="icon">🎟️</span>
            How to Buy Tickets
          </div>
          <div class="sd-steps">
            ${f.howToBuy.map((s, i) => `
              <div class="sd-step">
                <div class="sd-step-num">${i + 1}</div>
                <div class="sd-step-body">
                  <strong>${s.title}</strong>
                  <p>${s.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Schedule -->
        <div class="sd-section">
          <div class="sd-section-title">
            <span class="icon">📅</span>
            Games &amp; Events Schedule
          </div>
          <div class="sd-schedule-list">
            ${f.schedule.map(s => `
              <div class="sd-schedule-item">
                <div class="sd-schedule-date">
                  <span class="s-day">${s.day}</span>
                  <span class="s-month">${s.month}</span>
                </div>
                <div class="sd-schedule-info">
                  <strong>${s.event}</strong>
                  <span>🕐 ${s.time}${s.note ? ' &nbsp;·&nbsp; ' + s.note : ''}</span>
                </div>
                <span class="sd-schedule-badge badge-${s.badge}">
                  ${s.badge === 'live' ? '🟢 Open Now' : s.badge === 'upcoming' ? '🟠 Upcoming' : '⚪ TBC'}
                </span>
              </div>
            `).join('')}
          </div>
          <div class="sd-schedule-note">
            ⚠️ All schedules are subject to change without notice. Always verify dates and kick-off times directly with the venue or federation before travelling. Live fixtures are updated on official federation websites.
          </div>
        </div>

      </div><!-- end main column -->

      <!-- ── SIDEBAR ── -->
      <div class="sd-sidebar">

        <!-- CTA Card -->
        <div class="sd-card">
          <div class="sd-card-title">🎫 Book &amp; Get Tickets</div>
          <a href="${f.contact.web || '#'}" target="_blank" rel="noopener" class="sd-btn sd-btn-primary">
            🌐 Visit Official Website
          </a>
          <a href="tel:${(f.contact.phone || '').replace(/[\s\-]/g, '')}" class="sd-btn sd-btn-secondary">
            📞 Call to Book
          </a>
          <a href="https://mookh.com" target="_blank" rel="noopener" class="sd-btn sd-btn-outline">
            🎟️ Buy Tickets on Mookh
          </a>
        </div>

        <!-- Contact -->
        <div class="sd-card">
          <div class="sd-card-title">📞 Contact &amp; Location</div>
          <div class="sd-contact-list">

            ${f.contact.phone ? `
            <div class="sd-contact-item">
              <div class="sd-ci-icon">📞</div>
              <div>
                <div class="ci-label">Phone</div>
                <a href="tel:${f.contact.phone.replace(/[\s\-]/g, '')}">${f.contact.phone}</a>
              </div>
            </div>` : ''}

            ${f.contact.phone2 ? `
            <div class="sd-contact-item">
              <div class="sd-ci-icon">📞</div>
              <div>
                <div class="ci-label">Alt. Phone</div>
                <a href="tel:${f.contact.phone2.replace(/[\s\-]/g, '')}">${f.contact.phone2}</a>
              </div>
            </div>` : ''}

            ${f.contact.email ? `
            <div class="sd-contact-item">
              <div class="sd-ci-icon">✉️</div>
              <div>
                <div class="ci-label">Email</div>
                <a href="mailto:${f.contact.email}">${f.contact.email}</a>
              </div>
            </div>` : ''}

            <div class="sd-contact-item">
              <div class="sd-ci-icon">📍</div>
              <div>
                <div class="ci-label">Address</div>
                <span>${f.contact.address}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Opening Hours -->
        <div class="sd-card">
          <div class="sd-card-title">🕐 Opening Hours</div>
          <div class="sd-hours-list">
            ${Object.entries(f.hours).map(([day, time]) => `
              <div class="sd-hours-row">
                <span class="h-day">${day}</span>
                <span class="h-time ${time.toUpperCase().includes('CLOSED') ? 'h-closed' : 'h-open'}">${time}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Map -->
        <div class="sd-card sd-map-card">
          <div class="sd-map-wrap">
            ${f.mapEmbed
              ? `<iframe src="${f.mapEmbed}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
              : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6B6B6B;font-size:0.85rem;">📍 ${f.contact.address}</div>`
            }
          </div>
          <div class="sd-map-footer">
            <a href="https://www.google.com/maps/search/${encodeURIComponent(f.fullName + ' Kenya')}"
               target="_blank" rel="noopener">
              🗺️ Open in Google Maps →
            </a>
          </div>
        </div>

        <!-- Back link -->
        <a href="category.html?sport=${f.sport}" class="sd-btn sd-btn-outline"
           style="display:flex;align-items:center;justify-content:center;gap:6px;">
          ← Back to ${f.sport.charAt(0).toUpperCase() + f.sport.slice(1)} Venues
        </a>

      </div><!-- end sidebar -->

    </div><!-- end sd-body -->
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   NOT FOUND
══════════════════════════════════════════════════════════════════════ */
function renderNotFound() {
  document.getElementById('pageRoot').innerHTML = `
    <div class="sd-not-found">
      <div class="nf-icon">🏟️</div>
      <h2>Facility Not Found</h2>
      <p>We couldn't find details for this venue. It may not be in our database yet, or the link may be incorrect.</p>
      <a href="destinations.html">← Back to Destinations</a>
    </div>`;
}

/* ══════════════════════════════════════════════════════════════════════
   TAB SWITCHER (Pricing)
══════════════════════════════════════════════════════════════════════ */
window.switchTab = function (panel, btn) {
  document.querySelectorAll('.sd-ptab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sd-pricing-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`panel-${panel}`).classList.add('active');
};
