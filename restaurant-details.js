/* ============================================================
   RESTAURANT DETAILS — restaurant-details.js
   Fetches a single restaurant from Supabase by slug
   ============================================================ */

/* ══════════════════════════════════════
   CART STATE
══════════════════════════════════════ */
/* ── Cart key is per-restaurant so carts don't bleed across restaurants ── */
function cartKey() {
  const slug = new URLSearchParams(window.location.search).get('id') || 'default';
  return `sq_cart_${slug}`;
}

const cart = {
  items: [],   // { id, name, price, qty }

  /* Load from localStorage on startup */
  load() {
    try {
      const saved = localStorage.getItem(cartKey());
      if (saved) this.items = JSON.parse(saved);
    } catch (e) { this.items = []; }
  },

  /* Persist to localStorage after every change */
  save() {
    try { localStorage.setItem(cartKey(), JSON.stringify(this.items)); } catch (e) {}
  },

  add(id, name, price, dbId, image, desc) {
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ id, db_id: dbId, name, price, image: image || '', desc: desc || '', qty: 1 });
    }
    this.save();
    this.render();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
  },

  changeQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
  },

  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  get count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  render() {
    renderCart();
    syncAddButtons();
  }
};

/* ══════════════════════════════════════
   RENDER CART IN SIDEBAR
══════════════════════════════════════ */
function renderCart() {
  const panel = document.getElementById('cartPanel');
  const badge = document.getElementById('cartBadge');
  const totalEl = document.getElementById('cartTotal');
  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const countEl = document.getElementById('cartCount');

  if (!panel) return;

  const count = cart.count;
  const total = cart.total;

  // Badge
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Count label
  if (countEl) countEl.textContent = count === 0 ? 'Your order' : `${count} item${count !== 1 ? 's' : ''}`;

  if (count === 0) {
    if (emptyEl)  emptyEl.style.display = 'flex';
    if (itemsEl)  itemsEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl)  emptyEl.style.display = 'none';
  if (itemsEl)  itemsEl.style.display = 'flex';
  if (footerEl) footerEl.style.display = 'block';

  // Build item rows
  itemsEl.innerHTML = cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit">KSh ${item.price.toLocaleString('en-KE')} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="cart.changeQty('${item.id}', -1)">−</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="cart-qty-btn" onclick="cart.changeQty('${item.id}', 1)">+</button>
        <span class="cart-item-subtotal">KSh ${(item.price * item.qty).toLocaleString('en-KE')}</span>
        <button class="cart-remove-btn" onclick="cart.remove('${item.id}')" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  // Total
  if (totalEl) totalEl.textContent = `KSh ${total.toLocaleString('en-KE')}`;
}

/* Keep "+ Add" buttons in sync with cart state */
function syncAddButtons() {
  document.querySelectorAll('.menu-item-add[data-item-id]').forEach(btn => {
    const id = btn.dataset.itemId;
    const inCart = cart.items.find(i => i.id === id);
    if (inCart) {
      btn.textContent = `✓ ${inCart.qty} in cart`;
      btn.classList.add('in-cart');
    } else {
      btn.textContent = '+ Add';
      btn.classList.remove('in-cart');
    }
  });
}

/* ══════════════════════════════════════
   PLACE ORDER
══════════════════════════════════════ */
function placeOrder() {
  if (cart.count === 0) return;
  const btn = document.getElementById('placeOrderBtn');
  if (!btn) return;
  btn.textContent = '✅ Order Placed!';
  btn.style.background = '#22c55e';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '🛒 Place Order';
    btn.style.background = '';
    btn.disabled = false;
    cart.items = [];
    cart.render();
    showToast('Order placed! The restaurant will confirm shortly.');
  }, 2000);
}

function showToast(msg) {
  let t = document.getElementById('sqToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sqToast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════
   DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Get slug from URL ── */
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('id');

  if (!slug) {
    document.getElementById('heroTitle').textContent = 'Restaurant not found';
    return;
  }

  /* ── Fetch from Supabase ── */
  let restaurant = null;
  try {
    restaurant = await getRestaurant(slug);
  } catch (err) {
    console.error('Supabase error:', err);
    document.getElementById('heroTitle').textContent = 'Could not load restaurant';
    document.getElementById('heroBg').style.background = '#1a1a1a';
    document.getElementById('breadcrumbName').textContent = 'Error';
    return;
  }

  if (!restaurant) {
    document.getElementById('heroTitle').textContent = 'Restaurant not found';
    return;
  }

  /* ── Set page title ── */
  document.title = `${restaurant.name} — Discover the Magic of Kenya`;

  /* ── Populate Page ── */
  populatePage(restaurant);
  buildGallery(restaurant.image_gallery || [restaurant.image_hero]);
  buildHighlights(restaurant.highlights || []);
  buildExperience(restaurant);
  buildMenu(restaurant);
  populateSidebar(restaurant);
  updateMap(restaurant);
  fetchSimilar(restaurant);

  /* Load persisted cart then render */
  cart.load();
  renderCart();

  /* ── Set min date for reservation ── */
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('resDate').min = today;
  document.getElementById('resDate').value = today;

  /* ── Button listeners ── */
  document.getElementById('reserveBtn').addEventListener('click', () => {
    document.getElementById('bookingSidebar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('galleryBtn').addEventListener('click', () => {
    openLightbox(0);
  });

  /* ── Menu & Services — all three entry points go to same page ── */
  const goToMenu = () => {
    window.location.href = `restaurant-services.html?id=${restaurant.slug}`;
  };
  document.getElementById('menuBtn').addEventListener('click', goToMenu);
  document.getElementById('menuSidebarBtn').addEventListener('click', goToMenu);
  document.getElementById('menuBannerBtn').addEventListener('click', goToMenu);

  /* ── Cart toggle (mobile) ── */
  const cartToggle = document.getElementById('cartToggle');
  const cartPanel  = document.getElementById('cartPanel');
  if (cartToggle && cartPanel) {
    cartToggle.addEventListener('click', () => {
      cartPanel.classList.toggle('cart-open');
    });
  }

  /* ── Place order button ── */
  const placeBtn = document.getElementById('placeOrderBtn');
  if (placeBtn) placeBtn.addEventListener('click', placeOrder);
});

/* ── Populate Hero & Strip ── */
function populatePage(r) {
  document.getElementById('heroBg').style.backgroundImage = `url('${r.image_hero}')`;
  set('breadcrumbName', r.name);
  set('heroCuisine', r.cuisine);
  set('heroCity', `📍 ${r.city}`);
  set('heroTitle', r.name);
  set('heroPriceRange', '');
  set('heroHours', r.opening_hours || 'See details');

  set('stripCuisine', r.cuisine);
  set('stripPrice', '');
  set('stripLocation', `${r.city}, Kenya`);
  set('stripHours', r.opening_hours ? r.opening_hours.split('|')[0].trim() : '—');

  set('overviewText', r.description);
  set('mapCardName', r.name);
  set('mapCardLocation', `${r.location || ''}, ${r.city}`);
}

/* ── Populate Sidebar ── */
function populateSidebar(r) {
  const priceEl = document.getElementById('sidebarPriceKsh');
  if (priceEl) priceEl.textContent = '';
  set('sidebarCuisine', r.cuisine);
  set('sidebarPriceRange', '');
  set('sidebarHours', r.opening_hours ? r.opening_hours.split('|')[0].trim() : '—');
  set('sidebarLocation', `${r.city}, Kenya`);
}

/* ── Build Gallery ── */
function buildGallery(images) {
  const grid = document.getElementById('galleryGrid');
  if (!images || images.length === 0) { grid.style.display = 'none'; return; }
  window._galleryImages = images;
  grid.innerHTML = images.slice(0, 5).map((src, i) => `
    <img class="gal-img" src="${src}" alt="Photo ${i + 1}" loading="lazy"
         onclick="openLightbox(${i})"
         onerror="this.style.display='none'"/>
  `).join('');
}

/* ── Build Highlights ── */
function buildHighlights(highlights) {
  const grid = document.getElementById('highlightsGrid');
  if (!highlights || !highlights.length) { grid.style.display = 'none'; return; }
  grid.innerHTML = highlights.map(h => `
    <div class="highlight-item">
      <span class="highlight-check">✓</span>
      <span class="highlight-text">${h}</span>
    </div>
  `).join('');
}

/* ── Build Experience cards ── */
function buildExperience(r) {
  const defaults = [
    { icon: '🍽️', name: 'Dining Experience', desc: `${r.cuisine} cuisine in ${r.city}` },
    { icon: '🛎️', name: 'Table Service', desc: 'Attentive and friendly staff' },
    { icon: '🥂', name: 'Beverages', desc: 'Curated drinks and cocktails' },
    { icon: '🌿', name: 'Fresh Ingredients', desc: 'Locally sourced where possible' },
    { icon: '📍', name: 'Location', desc: `Conveniently located in ${r.city}` },
    { icon: '🎉', name: 'Events & Groups', desc: 'Available for private bookings' }
  ];
  const items = (r.experiences && r.experiences.length > 0) ? r.experiences : defaults;
  document.getElementById('experienceGrid').innerHTML = items.map(e => `
    <div class="exp-card">
      <div class="exp-icon">${e.icon}</div>
      <div class="exp-name">${e.name}</div>
      <div class="exp-desc">${e.desc}</div>
    </div>
  `).join('');
}

/* ── Build Menu Section ── */
function buildMenu(r) {
  const tabsEl = document.getElementById('menuTabs');
  const bodyEl = document.getElementById('menuBody');

  if (!r.menu || !r.menu.length) {
    tabsEl.style.display = 'none';
    bodyEl.innerHTML = `<div class="menu-loading"><span class="menu-loading-spinner"></span> Loading best dishes…</div>`;
    fetchBestMenuItems(r.slug, bodyEl);
    return;
  }

  tabsEl.innerHTML = r.menu.map((cat, i) => `
    <button class="menu-tab ${i === 0 ? 'active' : ''}"
      onclick="switchMenuTab(${i})">${cat.category}</button>
  `).join('');

  bodyEl.innerHTML = r.menu.map((cat, i) => `
    <div class="menu-category ${i === 0 ? 'active' : ''}" id="menuCat${i}">
      <div class="menu-category-title">${cat.category}</div>
      <div class="menu-items-grid">
        ${cat.items.map(item => buildMenuItem(item)).join('')}
      </div>
    </div>
  `).join('');
}

/* ── Fetch best/popular items from restaurant_menus table ── */
async function fetchBestMenuItems(slug, bodyEl) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/restaurant_menus?restaurant_slug=eq.${encodeURIComponent(slug)}&order=popular.desc,price.asc&limit=6&select=*`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      bodyEl.innerHTML = `
        <div class="menu-empty">
          <div class="menu-empty-icon-wrap">🍽️</div>
          <h3>Menu Coming Soon</h3>
          <p>We're working on adding the full menu. Contact the restaurant directly for current offerings.</p>
        </div>`;
      return;
    }

    bodyEl.innerHTML = `
      <div class="menu-best-header">
        <span class="menu-best-label">⭐ Best Dishes</span>
        <span class="menu-best-sub">Hand-picked popular items from this restaurant</span>
      </div>
      <div class="menu-items-grid">
        ${items.map(item => buildMenuItemFromDB(item)).join('')}
      </div>`;

  } catch (err) {
    console.error('Menu fetch error:', err);
    bodyEl.innerHTML = `
      <div class="menu-empty">
        <div class="menu-empty-icon-wrap">🍽️</div>
        <h3>Menu Coming Soon</h3>
        <p>Contact the restaurant directly for current offerings and daily specials.</p>
      </div>`;
  }
}

/* ── Generate a stable item ID from name + price ── */
function makeItemId(name, price) {
  return (name + '_' + price).toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/* ── Build a menu item card from restaurant_menus DB row ── */
function buildMenuItemFromDB(item) {
  const name    = item.item_name || item.name || '—';
  const desc    = item.description || '';
  const price   = item.price || 0;
  const image   = item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
  const popular = item.popular;
  const itemId  = makeItemId(name, price);

  const priceStr = price === 0
    ? `<span class="menu-item-price free">Included</span>`
    : `<span class="menu-item-price">KSh ${price.toLocaleString('en-KE')}</span>`;

  const addBtn = price === 0 ? '' : `
    <button class="menu-item-add"
      data-item-id="${itemId}"
      data-item-db-id="${item.id}"
      data-item-name="${name.replace(/"/g, '&quot;')}"
      data-item-price="${price}"
      data-item-image="${image}"
      data-item-desc="${desc.replace(/"/g, '&quot;')}"
      onclick="handleAddToCart(this)">+ Add</button>`;

  return `
    <div class="menu-item-card">
      <div class="menu-item-img-wrap">
        <img class="menu-item-img" src="${image}" alt="${name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'"/>
        ${popular ? '<div class="popular-badge">⭐ Popular</div>' : ''}
      </div>
      <div class="menu-item-body">
        <div class="menu-item-info">
          <div class="menu-item-name">${name}</div>
          <div class="menu-item-desc">${desc}</div>
        </div>
        <div class="menu-item-footer">
          ${priceStr}
          ${addBtn}
        </div>
      </div>
    </div>`;
}

function buildMenuItem(item) {
  const price   = item.price || 0;
  const itemId  = makeItemId(item.name, price);

  const priceStr = price === 0
    ? `<span class="menu-item-price free">Included</span>`
    : `<span class="menu-item-price">KSh ${price.toLocaleString('en-KE')}</span>`;

  const addBtn = price === 0 ? '' : `
    <button class="menu-item-add"
      data-item-id="${itemId}"
      data-item-db-id="${item.id || ''}"
      data-item-name="${item.name.replace(/"/g, '&quot;')}"
      data-item-price="${price}"
      data-item-image="${item.image || ''}"
      data-item-desc="${(item.desc || '').replace(/"/g, '&quot;')}"
      onclick="handleAddToCart(this)">+ Add</button>`;

  return `
    <div class="menu-item-card">
      <div class="menu-item-img-wrap">
        <img class="menu-item-img" src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'"/>
        ${item.popular ? '<div class="popular-badge">⭐ Popular</div>' : ''}
      </div>
      <div class="menu-item-body">
        <div class="menu-item-info">
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-desc">${item.desc}</div>
        </div>
        <div class="menu-item-footer">
          ${priceStr}
          ${addBtn}
        </div>
      </div>
    </div>`;
}

/* ── Handle Add to Cart click ── */
window.handleAddToCart = function(btn) {
  const id      = btn.dataset.itemId;
  const dbId    = btn.dataset.itemDbId ? parseInt(btn.dataset.itemDbId, 10) : null;
  const name    = btn.dataset.itemName;
  const price   = parseInt(btn.dataset.itemPrice, 10);
  const image   = btn.dataset.itemImage || '';
  const desc    = btn.dataset.itemDesc || '';
  cart.add(id, name, price, dbId, image, desc);

  /* Micro-animation on the button */
  btn.classList.add('add-bounce');
  setTimeout(() => btn.classList.remove('add-bounce'), 350);

  /* Scroll sidebar into view on mobile if cart just got its first item */
  if (cart.count === 1) {
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel && window.innerWidth < 1100) {
      cartPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

window.switchMenuTab = function(index) {
  document.querySelectorAll('.menu-tab').forEach((t, i) => t.classList.toggle('active', i === index));
  document.querySelectorAll('.menu-category').forEach((c, i) => c.classList.toggle('active', i === index));
};

/* ── Update Map ── */
function updateMap(r) {
  const query = encodeURIComponent(`${r.name}, ${r.city}, Kenya`);
  document.getElementById('mapFrame').src = `https://www.google.com/maps?q=${query}&output=embed`;
  document.getElementById('mapOpenLink').href = `https://www.google.com/maps/search/${query}`;
}

/* ── Fetch Similar Restaurants ── */
async function fetchSimilar(r) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/restaurants?city=eq.${encodeURIComponent(r.city)}&slug=neq.${r.slug}&select=slug,name,city,cuisine,image_hero,price_range&limit=3`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    renderSimilar(data);
  } catch (err) {
    document.getElementById('similarGrid').innerHTML = '';
  }
}

function renderSimilar(restaurants) {
  const grid = document.getElementById('similarGrid');
  if (!restaurants || restaurants.length === 0) {
    grid.closest('.similar-section').style.display = 'none';
    return;
  }
  grid.innerHTML = restaurants.map(r => `
    <a class="similar-card" href="restaurant-details.html?id=${r.slug}">
      <img src="${r.image_hero}" alt="${r.name}"
           onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'"/>
      <div class="similar-card-body">
        <div class="similar-card-cuisine">${r.cuisine}</div>
        <div class="similar-card-name">${r.name}</div>
        <div class="similar-card-city">📍 ${r.city}</div>
      </div>
    </a>
  `).join('');
}

/* ── Price helpers ── */


/* ── Guests counter ── */
let guests = 2;
window.changeGuests = function (delta) {
  guests = Math.max(1, Math.min(20, guests + delta));
  document.getElementById('guestCount').textContent = guests;
};

/* ── Submit Reservation ── */
window.submitReservation = function () {
  const date = document.getElementById('resDate').value;
  const btn = document.getElementById('reserveSubmitBtn');
  if (!date) { alert('Please select a date.'); return; }
  btn.textContent = '✅ Reservation Requested!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = '🍽️ Reserve a Table';
    btn.style.background = '';
  }, 3000);
};

/* ── Wishlist ── */
let wishlisted = false;
window.toggleWishlist = function () {
  wishlisted = !wishlisted;
  document.getElementById('wishlistBtn').textContent = wishlisted ? '❤️ Saved' : '🤍 Save Restaurant';
};

/* ── Share ── */
window.shareRestaurant = function () {
  if (navigator.share) {
    navigator.share({ title: document.title, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
};

/* ── Lightbox ── */
let lbIndex = 0;
window.openLightbox = function (i) {
  const imgs = window._galleryImages || [];
  if (!imgs.length) return;
  lbIndex = i;
  document.getElementById('lightbox').classList.add('open');
  updateLightbox();
};
window.closeLightbox = function () {
  document.getElementById('lightbox').classList.remove('open');
};
window.moveLightbox = function (dir) {
  const imgs = window._galleryImages || [];
  lbIndex = (lbIndex + dir + imgs.length) % imgs.length;
  updateLightbox();
};
function updateLightbox() {
  const imgs = window._galleryImages || [];
  document.getElementById('lbImg').src = imgs[lbIndex];
  const dots = document.getElementById('lbDots');
  dots.innerHTML = imgs.map((_, i) =>
    `<div class="lb-dot ${i === lbIndex ? 'active' : ''}" onclick="openLightbox(${i})"></div>`
  ).join('');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') moveLightbox(-1);
  if (e.key === 'ArrowRight') moveLightbox(1);
});

/* ── Util ── */
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val;
}
