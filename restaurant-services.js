/* ============================================================
   RESTAURANT SERVICES & MENU — restaurant-services.js
   On-premises geolocation gate + checkout redirect to bookings.html
   DEPENDS ON: supabase-config.js, auth.js, supabase-client.js
   ============================================================ */

if (typeof SUPABASE_URL === 'undefined') {
  console.error('SUPABASE_URL missing — load auth.js / supabase-config before restaurant-services.js.');
}

const PREMISES_RADIUS_M = 100;
const GEO_OVERRIDE_KEY = slug => `sq_restaurant_geo_override_${slug || 'default'}`;

/** Known venue coordinates (fallback when DB row has no lat/lng). */
const PREMISES_BY_SLUG = {
  'gilanis-nakuru': { lat: -0.3031, lng: 36.08, label: 'Gilanis Nakuru' },
  'swahili-plate-nakuru': { lat: -0.284, lng: 36.071, label: 'Swahili Plate Nakuru' },
  'carnivore-nairobi': { lat: -1.321, lng: 36.805, label: 'The Carnivore Nairobi' },
};

const FALLBACK_PREMISES = { lat: -0.3031, lng: 36.08, label: 'Restaurant premises' };

function cartKey() {
  const slug = new URLSearchParams(window.location.search).get('id') || 'default';
  return `sq_cart_${slug}`;
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(cartKey());
    if (!saved) return {};
    const items = JSON.parse(saved);
    const cart = {};
    items.forEach(item => {
      const key = item.db_id || item.id;
      cart[key] = {
        id: item.db_id || item.id,
        item_name: item.name,
        price: item.price,
        image: item.image || '',
        description: item.desc || '',
        qty: item.qty,
        available: true,
        _fromStorage: true,
      };
    });
    return cart;
  } catch (e) {
    return {};
  }
}

function saveCartToStorage() {
  try {
    const items = Object.values(window._cart || {}).map(item => ({
      id:
        typeof item.id === 'number' && item.id < 0
          ? String(item.id)
          : typeof item.id === 'number'
            ? (item.item_name + '_' + item.price).toLowerCase().replace(/[^a-z0-9]/g, '_')
            : item.id,
      db_id: typeof item.id === 'number' && item.id > 0 ? item.id : item.id,
      name: item.item_name,
      price: item.price,
      image: item.image || '',
      desc: item.description || '',
      qty: item.qty,
    }));
    localStorage.setItem(cartKey(), JSON.stringify(items));
  } catch (e) {}
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPremisesForSlug(slug, restaurant) {
  if (restaurant && restaurant.latitude != null && restaurant.longitude != null) {
    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng, label: restaurant.name || slug };
    }
  }
  const key = (slug || '').toLowerCase();
  if (PREMISES_BY_SLUG[key]) return { ...PREMISES_BY_SLUG[key] };
  return { ...FALLBACK_PREMISES, label: (restaurant && restaurant.name) || 'This restaurant' };
}

function loadGeoOverride(slug) {
  try {
    return sessionStorage.getItem(GEO_OVERRIDE_KEY(slug)) === '1';
  } catch (_) {
    return false;
  }
}

function saveGeoOverride(slug, on) {
  try {
    if (on) sessionStorage.setItem(GEO_OVERRIDE_KEY(slug), '1');
    else sessionStorage.removeItem(GEO_OVERRIDE_KEY(slug));
  } catch (_) {}
}

function getOrderingUnlocked() {
  if (loadGeoOverride(window._restaurantSlug)) return true;
  return window._geoInside === true;
}

function setBodyGeoMode(mode) {
  document.body.classList.remove(
    'geo-checking',
    'geo-inside',
    'geo-outside',
    'geo-denied',
    'geo-error',
    'geo-unavailable'
  );
  document.body.classList.add('geo-' + mode);
}

function updateLocBanner(mode, lines) {
  const banner = document.getElementById('locBanner');
  const title = document.getElementById('locTitle');
  const sub = document.getElementById('locSub');
  const spin = document.getElementById('locSpinner');
  if (!banner || !title || !sub) return;

  banner.className = 'loc-banner loc-banner--' + mode;
  title.textContent = lines.title || '';
  sub.textContent = lines.sub || '';
  if (spin) spin.hidden = mode !== 'checking';
}

function requestDevicePosition(slug, premises) {
  if (!navigator.geolocation) {
    window._geoInside = false;
    setBodyGeoMode('unavailable');
    updateLocBanner('error', {
      title: 'Location not available on this device',
      sub: 'Use the demo toggle if you are at the restaurant, or open this page on a phone with GPS.',
    });
    onGeoStateChanged();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const d = haversineM(pos.coords.latitude, pos.coords.longitude, premises.lat, premises.lng);
      window._geoDistanceM = d;
      const inside = d <= PREMISES_RADIUS_M;
      window._geoInside = inside;
      if (inside) {
        setBodyGeoMode('inside');
        updateLocBanner('inside', {
          title: 'Inside — You can order now',
          sub: 'You are within ' + PREMISES_RADIUS_M + 'm of ' + premises.label + '.',
        });
      } else {
        setBodyGeoMode('outside');
        const dist =
          d < 1000 ? Math.round(d) + 'm' : (d / 1000).toFixed(1) + 'km';
        updateLocBanner('outside', {
          title: 'Outside — Please visit us to order',
          sub:
            'You are about ' +
            dist +
            ' from ' +
            premises.label +
            '. Orders can only be placed on site (within ' +
            PREMISES_RADIUS_M +
            'm).',
        });
      }
      onGeoStateChanged();
    },
    err => {
      window._geoInside = false;
      if (err.code === 1) {
        setBodyGeoMode('denied');
        updateLocBanner('denied', {
          title: 'Location permission needed',
          sub:
            'Allow location to verify you are inside ' +
            premises.label +
            ', or use the demo toggle for presentations.',
        });
      } else {
        setBodyGeoMode('error');
        updateLocBanner('error', {
          title: 'Could not read your location',
          sub: err.message || 'Try again or use the demo toggle if you are already on site.',
        });
      }
      onGeoStateChanged();
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 14000 }
  );
}

function startGeolocation(slug, premises) {
  window._restaurantSlug = slug;
  window._premises = premises;
  window._geoInside = null;
  setBodyGeoMode('checking');
  updateLocBanner('checking', {
    title: 'Location status: Checking…',
    sub: 'We use a one-time device position to confirm you are within ' + PREMISES_RADIUS_M + 'm of the venue.',
  });

  const ov = document.getElementById('locDemoOverride');
  if (ov) {
    ov.checked = loadGeoOverride(slug);
    ov.onchange = () => {
      saveGeoOverride(slug, ov.checked);
      if (ov.checked) {
        window._geoInside = true;
        setBodyGeoMode('inside');
        updateLocBanner('inside', {
          title: 'Inside — You can order now',
          sub: 'Demo override is on. Turn it off to test real GPS.',
        });
        onGeoStateChanged();
        return;
      }
      window._geoInside = null;
      setBodyGeoMode('checking');
      updateLocBanner('checking', {
        title: 'Location status: Checking…',
        sub: 'Re-checking your position…',
      });
      requestDevicePosition(slug, premises);
    };
    if (ov.checked) {
      window._geoInside = true;
      setBodyGeoMode('inside');
      updateLocBanner('inside', {
        title: 'Inside — You can order now',
        sub: 'Demo override is active.',
      });
      onGeoStateChanged();
      return;
    }
  }

  requestDevicePosition(slug, premises);
}

function onGeoStateChanged() {
  if (window._allItems && window._allItems.length) {
    const cat = window._activeTabCategory || 'All';
    const items =
      cat === 'All' || !window._categories ? window._allItems : window._categories[cat] || window._allItems;
    renderItems(items);
  }
  updateCartSidebar();
  updateCheckoutFloater();
}

function buildSampleMenu(slug) {
  const rs = slug || 'demo';
  const img = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
  return [
    {
      id: -101,
      restaurant_slug: rs,
      category: 'Starters',
      item_name: 'Swahili Soup Bowl',
      description: 'Spiced coastal broth with coconut cream and fresh herbs.',
      price: 450,
      popular: true,
      available: true,
      image: img,
    },
    {
      id: -102,
      restaurant_slug: rs,
      category: 'Starters',
      item_name: 'Samosas Trio',
      description: 'Beef, lentil, and vegetable samosas with tamarind dip.',
      price: 380,
      popular: false,
      available: true,
      image: img,
    },
    {
      id: -201,
      restaurant_slug: rs,
      category: 'Mains',
      item_name: 'Nyama Choma Platter',
      description: 'Grilled goat and beef with kachumbari, ugali, and greens.',
      price: 1850,
      popular: true,
      available: true,
      image: img,
    },
    {
      id: -202,
      restaurant_slug: rs,
      category: 'Mains',
      item_name: 'Pizza Margherita',
      description: 'Wood-fired crust, San Marzano tomato, mozzarella, basil.',
      price: 1200,
      popular: false,
      available: true,
      image: img,
    },
    {
      id: -203,
      restaurant_slug: rs,
      category: 'Mains',
      item_name: 'Grilled Tilapia',
      description: 'Whole fish with lemon butter, seasonal vegetables.',
      price: 1450,
      popular: false,
      available: true,
      image: img,
    },
    {
      id: -301,
      restaurant_slug: rs,
      category: 'Drinks',
      item_name: 'Fresh Passion Juice',
      description: 'Chilled, no added sugar.',
      price: 220,
      popular: false,
      available: true,
      image: img,
    },
    {
      id: -302,
      restaurant_slug: rs,
      category: 'Drinks',
      item_name: 'Dawa Cocktail',
      description: 'Honey, lime, vodka — Kenya’s classic.',
      price: 650,
      popular: true,
      available: true,
      image: img,
    },
    {
      id: -401,
      restaurant_slug: rs,
      category: 'Desserts',
      item_name: 'Mango Coconut Panna Cotta',
      description: 'Light, tropical finish.',
      price: 520,
      popular: false,
      available: true,
      image: img,
    },
  ];
}

document.addEventListener('DOMContentLoaded', async function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('id');

  if (!slug) {
    document.getElementById('heroTitle').textContent = 'Restaurant not found';
    document.getElementById('heroDesc').textContent = 'No restaurant ID was provided in the URL.';
    const lb = document.getElementById('locBanner');
    if (lb) lb.style.display = 'none';
    return;
  }

  document.getElementById('backLink').href = `restaurant-details.html?id=${slug}`;

  let restaurant = null;
  try {
    restaurant = await getRestaurant(slug);
  } catch (e) {
    console.error('Could not load restaurant info:', e.message);
  }

  if (restaurant) {
    document.title = `${restaurant.name} — Menu & Services | SafariQuest`;
    if (restaurant.image_hero) {
      document.getElementById('heroBg').style.backgroundImage = `url('${restaurant.image_hero}')`;
    }
    document.getElementById('heroTitle').textContent = restaurant.name;
    document.getElementById('heroCuisine').textContent = restaurant.cuisine || '';
    document.getElementById('heroCity').textContent = `📍 ${restaurant.city || ''}`;
    document.getElementById('heroDesc').textContent = restaurant.description
      ? restaurant.description.substring(0, 120) + '…'
      : 'Explore our full menu and services below.';
    window._restaurantName = restaurant.name;
  } else {
    document.getElementById('heroDesc').textContent = 'Explore our full menu and services below.';
    window._restaurantName = slug;
  }

  const premises = getPremisesForSlug(slug, restaurant);
  startGeolocation(slug, premises);

  window._cart = loadCartFromStorage();
  updateCartSidebar();

  showSkeletons();
  let allItems = [];
  try {
    allItems = await sbFetch(
      `restaurant_menus?restaurant_slug=eq.${encodeURIComponent(slug)}&order=category.asc,popular.desc&select=*`
    );
  } catch (e) {
    console.error('Menu fetch error:', e.message);
  }

  if (!Array.isArray(allItems)) {
    console.warn('Unexpected menu response:', allItems);
    allItems = [];
  }

  if (allItems.length === 0) {
    allItems = buildSampleMenu(slug);
    window._usingSampleMenu = true;
  }

  window._allItems = allItems;

  const mergedCart = {};
  Object.values(window._cart).forEach(stored => {
    const live = allItems.find(i => i.id === stored.id || i.item_name === stored.item_name);
    if (live) mergedCart[live.id] = { ...live, qty: stored.qty };
    else mergedCart[stored.id] = stored;
  });
  window._cart = mergedCart;
  updateCartSidebar();

  const categories = {};
  allItems.forEach(item => {
    const cat = item.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });
  window._categories = categories;

  const catIcons = {
    Starters: '🥗',
    Mains: '🍽️',
    Desserts: '🍮',
    Drinks: '🥂',
    'Events & Private Dining': '🎉',
    Rooms: '🛏️',
    'Spa & Wellness': '💆',
    Sides: '🥘',
    Breakfast: '🍳',
    Lunch: '☀️',
    Dinner: '🌙',
    Seafood: '🦐',
    BBQ: '🔥',
    Other: '🍴',
  };

  const tabsEl = document.getElementById('tabsScroll');
  const catKeys = ['All', ...Object.keys(categories)];

  tabsEl.innerHTML = catKeys
    .map((cat, i) => {
      const count = cat === 'All' ? allItems.length : categories[cat].length;
      const icon = cat === 'All' ? '🍴' : catIcons[cat] || '🍽️';
      return `
      <button type="button" class="tab-btn ${i === 0 ? 'active' : ''}"
              onclick='switchTab(${JSON.stringify(cat)}, this)'>
        <span class="tab-icon">${icon}</span>
        ${cat}
        <span class="tab-count">${count}</span>
      </button>`;
    })
    .join('');

  window._activeTabCategory = 'All';
  renderItems(allItems);

  const paySidebar = document.getElementById('proceedPaymentBtn');
  const payFloater = document.getElementById('floaterPayBtn');
  if (paySidebar) paySidebar.addEventListener('click', proceedToPayment);
  if (payFloater) payFloater.addEventListener('click', proceedToPayment);
});

window.switchTab = function (cat, el) {
  window._activeTabCategory = cat;
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const items = cat === 'All' ? window._allItems : window._categories[cat] || [];
  document.getElementById('menuCatTitle').textContent = cat === 'All' ? 'All Items' : cat;
  renderItems(items);
};

function renderItems(items) {
  const grid = document.getElementById('menuGrid');
  const empty = document.getElementById('menuEmpty');

  document.getElementById('menuCatCount').textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (!items.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = items.map(item => buildCard(item)).join('');
}

function lockedTooltip() {
  return 'Available only inside the restaurant.';
}

function buildCard(item) {
  const unlocked = getOrderingUnlocked();
  const inCart = window._cart && window._cart[item.id] ? window._cart[item.id].qty : 0;

  const priceStr =
    item.price === 0
      ? '<span class="menu-card-price free">Complimentary</span>'
      : `<span class="menu-card-price">KSh ${Number(item.price).toLocaleString('en-KE')}</span>`;

  let control;
  if (!item.available) {
    control = `<button class="btn-add-first" type="button" disabled>Unavailable</button>`;
  } else if (!unlocked) {
    control = `<button class="btn-add-first" type="button" disabled title="${lockedTooltip()}">🔒 Order on premises</button>`;
  } else if (inCart > 0) {
    control = `<div class="qty-control">
             <button type="button" class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
             <span class="qty-num" id="qty-${item.id}">${inCart}</span>
             <button type="button" class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
           </div>`;
  } else {
    control = `<button type="button" class="btn-add-first" onclick="addToCart(${item.id})">+ Add to order</button>`;
  }

  const fallbackImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

  return `
    <div class="menu-card" id="card-${item.id}">
      <div class="menu-card-img-wrap">
        <img class="menu-card-img"
             src="${item.image || fallbackImg}"
             alt="${item.item_name}"
             loading="lazy"
             onerror="this.src='${fallbackImg}'"/>
        <div class="menu-card-badges">
          ${item.popular ? '<span class="badge-popular">⭐ Popular</span>' : ''}
          ${!item.available ? '<span class="badge-unavailable">Sold Out</span>' : ''}
        </div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.item_name}</div>
        <div class="menu-card-desc">${item.description || ''}</div>
        <div class="menu-card-footer">
          ${priceStr}
          ${control}
        </div>
      </div>
    </div>`;
}

window.addToCart = function (id) {
  if (!getOrderingUnlocked()) return;
  const item = window._allItems.find(i => i.id === id);
  if (!item) return;
  if (!window._cart[id]) window._cart[id] = { ...item, qty: 0 };
  window._cart[id].qty++;
  saveCartToStorage();
  refreshCard(id);
  updateCartSidebar();
};

window.changeQty = function (id, delta) {
  if (!getOrderingUnlocked()) return;
  if (!window._cart[id]) return;
  window._cart[id].qty = Math.max(0, window._cart[id].qty + delta);
  if (window._cart[id].qty === 0) delete window._cart[id];
  saveCartToStorage();
  refreshCard(id);
  updateCartSidebar();
};

function refreshCard(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  const item = window._allItems.find(i => i.id === id);
  if (!item) return;
  const footer = card.querySelector('.menu-card-footer');
  if (!footer) return;

  const unlocked = getOrderingUnlocked();
  const inCart = window._cart[id] ? window._cart[id].qty : 0;

  const priceStr =
    item.price === 0
      ? '<span class="menu-card-price free">Complimentary</span>'
      : `<span class="menu-card-price">KSh ${Number(item.price).toLocaleString('en-KE')}</span>`;

  let control;
  if (!item.available) {
    control = `<button class="btn-add-first" type="button" disabled>Unavailable</button>`;
  } else if (!unlocked) {
    control = `<button class="btn-add-first" type="button" disabled title="${lockedTooltip()}">🔒 Order on premises</button>`;
  } else if (inCart > 0) {
    control = `<div class="qty-control">
         <button type="button" class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
         <span class="qty-num" id="qty-${id}">${inCart}</span>
         <button type="button" class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
       </div>`;
  } else {
    control = `<button type="button" class="btn-add-first" onclick="addToCart(${id})">+ Add to order</button>`;
  }

  footer.innerHTML = priceStr + control;
}

window.proceedToPayment = function () {
  if (!getOrderingUnlocked()) {
    alert('You need to be inside the restaurant (or use the demo toggle) to continue to payment.');
    return;
  }
  const cartItems = Object.values(window._cart || {});
  if (!cartItems.length) {
    alert('Your cart is empty.');
    return;
  }

  const tableNumber = document.getElementById('tableNumber').value.trim();
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const specialInstructions = document.getElementById('specialInstructions').value.trim();

  if (!tableNumber) {
    alert('Please enter your table number.');
    document.getElementById('tableNumber').focus();
    return;
  }
  if (!customerName) {
    alert('Please enter your name.');
    document.getElementById('customerName').focus();
    return;
  }

  const slug = new URLSearchParams(window.location.search).get('id');
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const payload = {
    type: 'restaurant_order',
    restaurantSlug: slug,
    restaurantName: window._restaurantName || slug,
    tableNumber,
    customerName,
    customerPhone: customerPhone || null,
    specialInstructions: specialInstructions || null,
    items: cartItems.map(i => ({
      id: i.id,
      name: i.item_name,
      price: i.price,
      qty: i.qty,
      subtotal: i.price * i.qty,
    })),
    totalAmount: total,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('sq_pending_restaurant_order', JSON.stringify(payload));
  } catch (e) {
    alert('Could not save your order for checkout.');
    return;
  }

  window.location.href = 'bookings.html?checkout=restaurant';
};

function updateCartSidebar() {
  const cartItems = Object.values(window._cart || {});
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const unlocked = getOrderingUnlocked();

  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooterEl = document.getElementById('cartFooter');
  const specialWrap = document.getElementById('specialWrap');
  const fabCart = document.getElementById('fabCart');

  ['tableNumber', 'customerName', 'customerPhone', 'specialInstructions'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !unlocked;
  });

  if (cartItems.length === 0) {
    cartEmptyEl.style.display = 'block';
    cartItemsEl.style.display = 'none';
    cartFooterEl.style.display = 'none';
    if (specialWrap) specialWrap.style.display = 'none';
    if (fabCart) fabCart.classList.remove('has-items');
    updateCheckoutFloater();
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartItemsEl.style.display = 'block';
  cartFooterEl.style.display = 'block';
  if (specialWrap) specialWrap.style.display = 'block';
  if (fabCart) fabCart.classList.add('has-items');

  const fallbackImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

  cartItemsEl.innerHTML = cartItems
    .map(item => {
      const qtyDisabled = !unlocked ? 'disabled' : '';
      return `
    <div class="cart-item">
      <img class="cart-item-img"
           src="${item.image || fallbackImg}"
           alt="${item.item_name}"
           onerror="this.src='${fallbackImg}'"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.item_name}</div>
        <div class="cart-item-price">KSh ${(item.price * item.qty).toLocaleString('en-KE')}</div>
      </div>
      <div class="cart-item-qty">
        <button type="button" class="cart-qty-btn" ${qtyDisabled} onclick="changeQty(${item.id}, -1)">−</button>
        <span  class="cart-item-count">${item.qty}</span>
        <button type="button" class="cart-qty-btn" ${qtyDisabled} onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <button type="button" class="cart-item-remove" ${qtyDisabled} onclick="changeQty(${item.id}, -${item.qty})">✕</button>
    </div>`;
    })
    .join('');

  document.getElementById('cartSubtotal').textContent = `KSh ${total.toLocaleString('en-KE')}`;
  document.getElementById('cartTotal').textContent = `KSh ${total.toLocaleString('en-KE')}`;
  if (document.getElementById('fabCount')) document.getElementById('fabCount').textContent = count;
  if (document.getElementById('fabTotal'))
    document.getElementById('fabTotal').textContent = `KSh ${total.toLocaleString('en-KE')}`;

  const btn = document.getElementById('proceedPaymentBtn');
  if (btn) btn.disabled = !unlocked;

  updateCheckoutFloater();
}

function updateCheckoutFloater() {
  const floater = document.getElementById('checkoutFloater');
  const btn = document.getElementById('floaterPayBtn');
  if (!floater || !btn) return;
  const cartItems = Object.values(window._cart || {});
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const unlocked = getOrderingUnlocked();

  const fabCart = document.getElementById('fabCart');

  if (!count) {
    floater.hidden = true;
    if (fabCart) fabCart.classList.remove('fab-behind-checkout');
    return;
  }
  floater.hidden = false;
  if (fabCart) fabCart.classList.add('fab-behind-checkout');
  document.getElementById('floaterCount').textContent = String(count);
  document.getElementById('floaterTotal').textContent = `KSh ${total.toLocaleString('en-KE')}`;
  btn.disabled = !unlocked;
  btn.title = unlocked ? '' : lockedTooltip();
}

window.clearCart = function () {
  if (!Object.keys(window._cart || {}).length) return;
  if (!confirm('Clear your entire cart?')) return;
  window._cart = {};
  saveCartToStorage();
  updateCartSidebar();
  (window._allItems || []).forEach(item => refreshCard(item.id));
};

window.toggleMobileCart = function () {
  const card = document.querySelector('.cart-card');
  if (card) card.style.display = card.style.display === 'block' ? 'none' : 'block';
};

window.closeModal = function () {
  document.getElementById('successModal').style.display = 'none';
};

function showSkeletons() {
  document.getElementById('menuGrid').innerHTML = Array(6)
    .fill(
      `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>`
    )
    .join('');
}
