/* ================================================================
   SA7 LUXURY AGENTS — SPA FRONTEND
   Connecté à Spring Boot API sur le même serveur (port 8080)
   ================================================================ */

// ==================== CONFIG ====================
const API = '';   // même origine → pas de CORS

const AGENT_PROFILES = [
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 257500, color: '#C41230' },
  { strategy: 'Agressif',     strategyKey: 'GREEDY',      budget: 312500, color: '#E8203E' },
  { strategy: 'Conservateur', strategyKey: 'FRUGAL',      budget: 255000, color: '#888888' },
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 335000, color: '#C41230' },
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 285000, color: '#C9A84C' },
];

const CATEGORY_EMOJI = {
  bags: '👜', watches: '⌚', clothing: '👗',
  perfumes: '🌹', shoes: '👠', default: '💎'
};

// ==================== PRODUCT IMAGES (Unsplash) ====================
// Photos choisies pour correspondre exactement à chaque produit
const PRODUCT_IMAGES = {
  // Sacs
  'Chanel Classic Flap Vintage':     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85', // Chanel quilted black bag
  'Louis Vuitton Neverfull MM':      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=85', // LV monogram tote
  'Hermès Birkin 30':                'https://images.unsplash.com/photo-1601924638867-3d8e59a9a694?w=600&q=85', // Hermès orange/tan leather
  'Prada Re-Edition 2000':           'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=85', // nylon mini bag
  'Balenciaga City Bag':             'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85', // dark leather city bag
  // Montres
  'Rolex Datejust 36':               'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=85', // silver Rolex datejust
  'Cartier Tank Française':          'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=85', // rectangular Cartier
  'Hermès Cape Cod Watch':           'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=85', // square luxury watch
  // Vêtements
  'Dior Bar Jacket':                 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85', // couture jacket editorial
  'Gucci Silk Maxi Dress':           'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=85', // silk long dress editorial
  // Parfum
  'Chanel No.5 Parfum 100ml':        'https://images.unsplash.com/photo-1588776813677-77aaf5595b83?w=600&q=85', // flacon Chanel No.5
  // Chaussures
  'Christian Louboutin Pigalle 120': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85', // red sole stilettos
};

const CATEGORY_IMAGES = {
  bags:     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85',
  watches:  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=85',
  clothing: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
  perfumes: 'https://images.unsplash.com/photo-1588776813677-77aaf5595b83?w=600&q=85',
  shoes:    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85',
  default:  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=85',
};

// Hero background images — dark editorial, palette noir/rouge/or
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=90',  // runway dark couture
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=90',  // editorial black
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=90',  // fashion dark
  'https://images.unsplash.com/photo-1536243298747-ea8874136d64?w=1920&q=90',  // luxury moody
];

function getProductImage(product) {
  return PRODUCT_IMAGES[product.name]
    || CATEGORY_IMAGES[product.category]
    || CATEGORY_IMAGES.default;
}

const CONDITIONS = ['Excellent', 'Très bon', 'Bon'];

// ==================== STATE ====================
const S = {
  activeAgent:     null,   // { id, name, email, strategy, strategyKey, budget, solde }
  token:           localStorage.getItem('sa7_token') || null,
  users:           [],
  products:        [],
  currentPage:     'accueil',
  customAgents:    JSON.parse(localStorage.getItem('sa7_custom_agents') || '[]'),
  // negotiation state
  negoProduct:     null,
  negoNegotiations:[],     // [{negId, sellerId, sellerName, status, offers:[]}]
  negoRound:       0,
  negoMaxRounds:   10,
  negoAutoMode:    false,
  // admin tab
  adminTab:        'produits',
  // marketplace filter
  filterCat:       'all',
  filterBrand:     '',
  filterSearch:    '',
  filterPriceMin:  0,
  filterPriceMax:  99999,
  // wishlist (Set of product ids, persisted in localStorage)
  wishlist: new Set(JSON.parse(localStorage.getItem('sa7_wishlist') || '[]')),
};

// Restore active agent from localStorage
try {
  const saved = localStorage.getItem('sa7_agent');
  if (saved) S.activeAgent = JSON.parse(saved);
} catch(e) {}

// ==================== HTTP HELPERS ====================
async function http(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (S.token) opts.headers['Authorization'] = 'Bearer ' + S.token;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.message || JSON.stringify(j); } catch(e) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)       => http('GET', path, null);
const post = (path, body) => http('POST', path, body);
const patch= (path, body) => http('PATCH', path, body);

// ==================== API CALLS ====================
async function apiLogin(email, password) {
  const data = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!data.ok) throw new Error('Login failed');
  return data.json();
}

async function apiGetUsers() {
  return get('/api/users');
}

async function apiGetProducts(params = {}) {
  const q = new URLSearchParams({ page: 0, size: 50, ...params });
  const data = await get('/api/products?' + q);
  return data.content || data || [];
}

async function apiStartNego(buyerId, productId) {
  return post('/api/negotiations', { buyerIdRequest: buyerId, productIdRequest: productId });
}

async function apiMakeOffer(negoId, senderId, price, qty = 1) {
  return post(`/api/negotiations/${negoId}/offers`, {
    senderId, proposedPrice: price, proposedQuantity: qty
  });
}

async function apiAutoRespond(negoId, responderId, strategy) {
  return post(`/api/negotiations/${negoId}/auto-respond?responderId=${responderId}&strategy=${strategy}`);
}

async function apiGetNego(negoId) {
  return get(`/api/negotiations/${negoId}`);
}

async function apiGetBuyerNegos(buyerId) {
  return get(`/api/negotiations/buyer/${buyerId}?page=0&size=50`);
}

// ==================== UTILS ====================
function fmt(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('fr-FR') + ' €';
}

function categoryEmoji(cat) {
  return CATEGORY_EMOJI[cat] || CATEGORY_EMOJI.default;
}

function conditionBadge(n) {
  const idx = Math.abs(n) % 3;
  const labels = ['Excellent', 'Très bon', 'Bon'];
  const cls    = ['badge-excellent', 'badge-good', 'badge-fair'];
  return `<span class="condition-badge ${cls[idx]}">${labels[idx]}</span>`;
}

function statusBadge(status) {
  const map = {
    NEGOTIATING: ['status-negotiating', 'En cours'],
    AGREED:      ['status-agreed',      'Accord ✓'],
    FAILED:      ['status-failed',      'Échoué'],
    PENDING:     ['status-pending',     'En attente'],
  };
  const [cls, label] = map[status] || ['status-pending', status];
  return `<span class="nego-status-badge ${cls}">${label}</span>`;
}

function toast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function loader() {
  return `<div class="loader"><div class="spinner"></div>Chargement...</div>`;
}

function setPage(id) {
  document.querySelectorAll('.nav-link[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === id);
  });
}

function updateNavAgent() {
  const badge = document.getElementById('nav-agent-badge');
  const name  = document.getElementById('nav-agent-name');
  if (S.activeAgent) {
    badge.style.display = 'flex';
    name.textContent = S.activeAgent.name;
  } else {
    badge.style.display = 'none';
  }
}

// ==================== ROUTER ====================
function navigate(page, params = {}) {
  S.currentPage = page;
  closeAllDropdowns();
  setPage(page);
  const app = document.getElementById('app');
  app.innerHTML = loader();

  const pages = {
    accueil:             renderAccueil,
    marketplace:         renderMarketplace,
    'marche-decentralise': renderMarcheDecentralise,
    'marche-centralise': renderMarcheCentralise,
    'achat-groupe':      renderAchatGroupe,
    historique:          renderHistorique,
    'profil-agent':      renderProfilAgent,
    admin:               renderAdmin,
    wishlist:            renderWishlist,
    comparateur:         renderComparateur,
    dashboard:           renderDashboard,
  };

  const fn = pages[page];
  if (fn) {
    Promise.resolve(fn(params)).finally(() => {
      setTimeout(() => {
        initScrollReveal();
        initTilt();
        initCounters();
      }, 80);
    });
  } else {
    app.innerHTML = '<div class="page"><h1>Page non trouvée</h1></div>';
  }
}

// ==================== NAVBAR ====================
function toggleDropdown(id) {
  const dd = document.getElementById('dd-' + id);
  const wasOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) dd.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
});

// ==================== PAGE: ACCUEIL ====================
async function renderAccueil() {
  setPage('accueil');
  const app = document.getElementById('app');
  // Remove top padding for hero
  app.style.paddingTop = '0';

  try {
    const users = await apiGetUsers();
    S.users = users;
    const buyers = users.filter(u => u.userType === 'BUYER');

    const agentCards = buyers.map((u, i) => {
      const profile = AGENT_PROFILES[i] || AGENT_PROFILES[0];
      const isActive = S.activeAgent && S.activeAgent.id === u.id;
      const initial = u.name.charAt(0).toUpperCase();
      const solde = Math.round(profile.budget * (0.75 + Math.random() * 0.25));
      return `
        <div class="agent-card fade-up stagger-${Math.min(i+1,5)} ${isActive ? 'active' : ''}" data-tilt
          onclick="selectAgent(${u.id}, '${u.name}', '${u.email}', '${profile.strategy}', '${profile.strategyKey}', ${profile.budget})">
          ${isActive ? '<span class="agent-badge badge-actif">Actif</span>' : '<span class="agent-badge badge-libre">Libre</span>'}
          <div class="agent-card-header">
            <div class="agent-avatar" style="background:${profile.color}">${initial}</div>
            <div>
              <div class="agent-name">${u.name}</div>
              <div class="agent-id">ID · buyer_${u.id}</div>
            </div>
          </div>
          <div class="agent-row"><span class="agent-row-label">Stratégie</span><span class="agent-row-value">${profile.strategy}</span></div>
          <div class="agent-row"><span class="agent-row-label">Budget</span><span class="agent-row-value">${fmt(profile.budget)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Solde</span><span style="color:var(--gold)">${fmt(solde)}</span></div>
          <div class="budget-bar"><div class="budget-bar-fill" style="width:${Math.round((solde/profile.budget)*100)}%"></div></div>
        </div>`;
    }).join('');

    const customCards = S.customAgents.map((a, i) => {
      const isActive = S.activeAgent && S.activeAgent.email === a.email;
      const solde = Math.round(a.budget * 0.9);
      return `
        <div class="agent-card fade-up ${isActive ? 'active' : ''}" data-tilt onclick="selectCustomAgent(${i})">
          ${isActive ? '<span class="agent-badge badge-actif">Actif</span>' : '<span class="agent-badge" style="background:var(--gold);color:#000">Custom</span>'}
          <div class="agent-card-header">
            <div class="agent-avatar" style="background:var(--grey2)">${a.name.charAt(0).toUpperCase()}</div>
            <div><div class="agent-name">${a.name}</div><div class="agent-id">Agent personnalisé</div></div>
          </div>
          <div class="agent-row"><span class="agent-row-label">Stratégie</span><span class="agent-row-value">${a.strategy}</span></div>
          <div class="agent-row"><span class="agent-row-label">Budget</span><span class="agent-row-value">${fmt(a.budget)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Solde</span><span style="color:var(--gold)">${fmt(solde)}</span></div>
          <div class="budget-bar"><div class="budget-bar-fill" style="width:90%"></div></div>
        </div>`;
    }).join('');

    // Build hero slides HTML
    const slidesHtml = HERO_IMAGES.map((src, i) =>
      `<div class="hero-slide ${i===0?'visible':''}" style="background-image:url('${src}')"></div>`
    ).join('');
    const dotsHtml = HERO_IMAGES.map((_, i) =>
      `<div class="hero-dot ${i===0?'active':''}" onclick="heroGoTo(${i})"></div>`
    ).join('');

    app.innerHTML = `
      <!-- HERO CINÉMATIQUE -->
      <section class="hero">
        <div class="hero-bg" id="hero-bg">${slidesHtml}</div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="hero-quote">Vos envies de luxe, nos agents s'occupent du prix.</p>
          <h1 class="hero-title">Couture<br>Marketplace</h1>
          <p class="hero-sub">Intelligence Artificielle · Négociation Automatique · Luxe</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" onclick="document.getElementById('agents-section').scrollIntoView({behavior:'smooth'})">Choisir un agent</button>
            <button class="btn btn-outline btn-lg" onclick="navigate('marketplace')">Explorer</button>
          </div>
        </div>
        <div class="hero-dots" id="hero-dots">${dotsHtml}</div>
        <div class="hero-scroll">
          <span>Défiler</span>
          <div class="hero-scroll-line"></div>
        </div>
      </section>

      <!-- TICKER -->
      <div class="ticker">
        <div class="ticker-inner">
          <span class="ticker-text">Couture Marketplace &nbsp;◆&nbsp; Vos envies de luxe, nos agents s'occupent du prix &nbsp;◆&nbsp; Chanel &nbsp;·&nbsp; Hermès &nbsp;·&nbsp; Rolex &nbsp;·&nbsp; Dior &nbsp;·&nbsp; Louis Vuitton &nbsp;·&nbsp; Cartier &nbsp;·&nbsp; Balenciaga &nbsp;◆&nbsp; Négociation Automatique &nbsp;◆&nbsp; Enchère Double &nbsp;◆&nbsp; Marché Décentralisé &nbsp;◆&nbsp;</span>
          <span class="ticker-text">Couture Marketplace &nbsp;◆&nbsp; Vos envies de luxe, nos agents s'occupent du prix &nbsp;◆&nbsp; Chanel &nbsp;·&nbsp; Hermès &nbsp;·&nbsp; Rolex &nbsp;·&nbsp; Dior &nbsp;·&nbsp; Louis Vuitton &nbsp;·&nbsp; Cartier &nbsp;·&nbsp; Balenciaga &nbsp;◆&nbsp; Négociation Automatique &nbsp;◆&nbsp; Enchère Double &nbsp;◆&nbsp; Marché Décentralisé &nbsp;◆&nbsp;</span>
        </div>
      </div>

      <!-- AGENTS -->
      <div class="page" id="agents-section">
        <div class="page-header">
          <div class="section-label">Agents Acheteurs</div>
          <h1>Sélectionnez votre agent</h1>
          <p>Choisissez un agent — connexion automatique via JWT</p>
        </div>
        <div class="grid grid-3">${(agentCards + customCards) || '<div class="empty-state"><p>Aucun agent disponible</p></div>'}</div>

        <div class="protocol-section">
          <div class="section-label">Protocoles</div>
          <h2>Choisissez votre marché</h2>
          <div class="protocol-cards">
            <div class="protocol-card fade-up stagger-1" onclick="navigate('marche-decentralise')">
              <span class="protocol-icon">🔀</span>
              <div class="protocol-name">Marché Décentralisé</div>
              <div class="protocol-desc">1 Acheteur négocie avec plusieurs vendeurs simultanément via Alternating-Offer.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card fade-up stagger-2" onclick="navigate('marche-centralise')">
              <span class="protocol-icon">🏛</span>
              <div class="protocol-name">Marché Centralisé</div>
              <div class="protocol-desc">Enchère double multi-rounds avec matching optimal acheteurs/vendeurs.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card fade-up stagger-3" onclick="navigate('achat-groupe')">
              <span class="protocol-icon">👥</span>
              <div class="protocol-name">Achat Groupé</div>
              <div class="protocol-desc">Coalition d'acheteurs pour négocier un prix collectif avantageux.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card fade-up stagger-4" onclick="navigate('marketplace')">
              <span class="protocol-icon">💎</span>
              <div class="protocol-name">Négociation 1v1</div>
              <div class="protocol-desc">Sélectionnez un article et négociez directement avec le vendeur.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
          </div>
        </div>
      </div>`;

    // Hero slideshow
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');

    window.heroGoTo = (n) => {
      slides[currentSlide].classList.remove('visible');
      dots[currentSlide].classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('visible');
      dots[currentSlide].classList.add('active');
    };

    const heroInterval = setInterval(() => heroGoTo(currentSlide + 1), 5000);
    // Clear interval when navigating away
    app._heroInterval = heroInterval;

    // Scroll animations
    initScrollReveal();
    // 3D tilt
    initTilt();

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Impossible de charger les agents.<br><small>${e.message}</small></p></div></div>`;
  }
}

async function selectAgent(id, name, email, strategy, strategyKey, budget) {
  try {
    const auth = await apiLogin(email, 'password');
    S.token = auth.token;
    localStorage.setItem('sa7_token', auth.token);
    S.activeAgent = { id, name, email, strategy, strategyKey, budget, solde: budget };
    localStorage.setItem('sa7_agent', JSON.stringify(S.activeAgent));
    updateNavAgent();
    toast(`Agent ${name} sélectionné ✓`, 'success');
    navigate('accueil');
  } catch(e) {
    toast('Erreur de connexion: ' + e.message, 'error');
  }
}

async function selectCustomAgent(i) {
  const a = S.customAgents[i];
  if (!a) return;
  try {
    const auth = await apiLogin(a.email, 'password');
    S.token = auth.token;
    localStorage.setItem('sa7_token', auth.token);
    S.activeAgent = { id: null, name: a.name, email: a.email, strategy: a.strategy, strategyKey: a.strategyKey, budget: a.budget, solde: a.budget };
    localStorage.setItem('sa7_agent', JSON.stringify(S.activeAgent));
  } catch(e) {
    // Agent not in DB yet → use locally only
    S.activeAgent = { id: null, name: a.name, email: a.email, strategy: a.strategy, strategyKey: a.strategyKey, budget: a.budget, solde: a.budget };
    localStorage.setItem('sa7_agent', JSON.stringify(S.activeAgent));
  }
  updateNavAgent();
  toast(`Agent ${a.name} sélectionné ✓`, 'success');
  navigate('accueil');
}

// ==================== PAGE: MARKETPLACE ====================
async function renderMarketplace() {
  setPage('marketplace');
  const app = document.getElementById('app');

  try {
    const products = await apiGetProducts();
    S.products = products;

    // Gather unique categories & brands
    const cats   = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = ['all', ...new Set(products.map(p => p.brand).filter(Boolean))];

    function filteredProducts() {
      return S.products.filter(p => {
        const catOk    = S.filterCat === 'all' || p.category === S.filterCat;
        const brandOk  = !S.filterBrand || S.filterBrand === 'all' || p.brand === S.filterBrand;
        const searchOk = !S.filterSearch ||
          p.name.toLowerCase().includes(S.filterSearch.toLowerCase()) ||
          (p.brand||'').toLowerCase().includes(S.filterSearch.toLowerCase());
        const priceOk  = (p.priceMin || 0) >= S.filterPriceMin && (p.priceMin || 0) <= S.filterPriceMax;
        return catOk && brandOk && searchOk && priceOk;
      });
    }

    function productGrid(list) {
      if (!list.length) return '<div class="empty-state"><div class="empty-icon">🔍</div><p>Aucun produit trouvé</p></div>';
      return `<div class="grid grid-3">${list.map((p, i) => {
        const imgSrc = getProductImage(p);
        const cond   = conditionBadge(p.id);
        const wished = S.wishlist.has(p.id);
        return `
          <div class="product-card fade-up stagger-${Math.min((i%5)+1,5)}" data-tilt
               onclick="navigate('marche-decentralise', {productId: ${p.id}})">
            <div class="product-img">
              <img src="${imgSrc}" alt="${p.name}"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div class="product-img-placeholder" style="display:none">${categoryEmoji(p.category)}</div>
              <div class="product-img-overlay"></div>
              <div class="product-quickview" onclick="event.stopPropagation(); openQuickView(${p.id})">
                <span>Quick View</span>
              </div>
              <button class="product-wish ${wished ? 'active' : ''}" data-wish="${p.id}"
                      onclick="event.stopPropagation(); toggleWishlist(${p.id})">♥</button>
            </div>
            <div class="product-body">
              <div class="product-brand">${p.brand || p.category || '—'}</div>
              <div class="product-name">${p.name}</div>
              <div class="product-seller">Par ${p.sellerName || '—'} &nbsp; ${cond}</div>
              <div class="product-prices">
                <div class="price-block">
                  <label>Min</label>
                  <div class="price">${fmt(p.priceMin)}</div>
                </div>
                <div class="price-block">
                  <label>Max</label>
                  <div class="price gold">${fmt(p.priceMax)}</div>
                </div>
              </div>
            </div>
            <div class="product-footer">
              <span>Stock : ${p.stockQuantity ?? '—'}</span>
              <span class="tag">${p.category || '—'}</span>
            </div>
          </div>`;
      }).join('')}</div>`;
    }

    function render() {
      const fp = filteredProducts();
      document.getElementById('product-count').textContent = `${fp.length} produit${fp.length > 1 ? 's' : ''} trouvé${fp.length > 1 ? 's' : ''}`;
      document.getElementById('product-grid').innerHTML = productGrid(fp);
    }

    const catChips = cats.map(c => `
      <div class="chip ${S.filterCat === c ? 'active' : ''}" onclick="setFilter('cat','${c}'); this.parentElement.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); this.classList.add('active'); document.getElementById('product-count').textContent='...'; setTimeout(reRenderGrid,10)">
        ${c === 'all' ? 'Tous' : c}
      </div>`).join('');

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>🛍 Luxury Marketplace</h1>
          <p>Trouvez l'article de luxe de vos rêves</p>
        </div>

        <input class="search-bar" placeholder="Rechercher par marque ou modèle..." id="search-input"
          oninput="S.filterSearch=this.value; reRenderGrid()" value="${S.filterSearch}">

        <div class="chip-row">${catChips}</div>

        <div class="price-range-wrap">
          <label class="price-range-label">Prix : <span id="pr-min-val">${S.filterPriceMin === 0 ? '0' : fmt(S.filterPriceMin)}</span> — <span id="pr-max-val">${S.filterPriceMax >= 99999 ? '∞' : fmt(S.filterPriceMax)}</span></label>
          <div class="dual-slider">
            <input type="range" id="pr-min" class="range-min" min="0" max="20000" step="100" value="${Math.min(S.filterPriceMin, 20000)}"
              oninput="S.filterPriceMin=Math.min(parseInt(this.value),S.filterPriceMax-100);this.value=S.filterPriceMin;document.getElementById('pr-min-val').textContent=S.filterPriceMin>0?S.filterPriceMin.toLocaleString('fr-FR')+'\u202f€':'0';reRenderGrid()">
            <input type="range" id="pr-max" class="range-max" min="0" max="20000" step="100" value="${Math.min(S.filterPriceMax >= 99999 ? 20000 : S.filterPriceMax, 20000)}"
              oninput="S.filterPriceMax=Math.max(parseInt(this.value),S.filterPriceMin+100)||99999;document.getElementById('pr-max-val').textContent=parseInt(this.value)>=20000?'\u221e':parseInt(this.value).toLocaleString('fr-FR')+'\u202f€';if(parseInt(this.value)>=20000)S.filterPriceMax=99999;reRenderGrid()">
          </div>
        </div>

        <div class="marketplace-layout">
          <div class="filters-panel">
            <h3>Filtres</h3>
            <div class="filter-group">
              <label>Marque</label>
              <select onchange="S.filterBrand=this.value; reRenderGrid()">
                ${brands.map(b => `<option value="${b}" ${S.filterBrand===b?'selected':''}>${b==='all'?'Toutes':b}</option>`).join('')}
              </select>
            </div>
            <div class="filter-group">
              <label>Catégorie</label>
              <select onchange="S.filterCat=this.value; reRenderGrid()">
                ${cats.map(c => `<option value="${c}" ${S.filterCat===c?'selected':''}>${c==='all'?'Toutes':c}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" style="width:100%" onclick="S.filterCat='all';S.filterBrand='';S.filterSearch='';document.getElementById('search-input').value=''; reRenderGrid()">Réinitialiser</button>
          </div>

          <div class="products-area">
            <h2 id="product-count">${products.length} produits trouvés</h2>
            <div id="product-grid">${productGrid(filteredProducts())}</div>
          </div>
        </div>
      </div>`;

    window.setFilter = (key, val) => {
      if (key === 'cat') S.filterCat = val;
    };
    window.reRenderGrid = () => {
      const fp = filteredProducts();
      document.getElementById('product-count').textContent = `${fp.length} produit${fp.length > 1 ? 's' : ''} trouvé${fp.length > 1 ? 's' : ''}`;
      document.getElementById('product-grid').innerHTML = productGrid(fp);
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: MARCHÉ DÉCENTRALISÉ ====================
async function renderMarcheDecentralise(params = {}) {
  const app = document.getElementById('app');

  if (!S.activeAgent) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">👤</div><p>Veuillez d'abord sélectionner un agent acheteur depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
    return;
  }

  try {
    const products = S.products.length ? S.products : await apiGetProducts();
    S.products = products;

    // Reset negotiation state
    S.negoNegotiations = [];
    S.negoRound = 0;
    S.negoProduct = params.productId ? products.find(p => p.id == params.productId) : null;

    function renderSetup() {
      const productOptions = products.map(p =>
        `<option value="${p.id}" ${S.negoProduct && S.negoProduct.id == p.id ? 'selected' : ''}>
          ${p.name} — ${p.brand || ''} (${fmt(p.priceMin)} - ${fmt(p.priceMax)})
        </option>`).join('');

      app.innerHTML = `
        <div class="cfg-wrap">

          <!-- Hero cinématique -->
          <div class="cfg-hero">
            <div class="cfg-hero-bg" style="background-image:url('${HERO_IMAGES[2]}')"></div>
            <div class="cfg-hero-veil"></div>
            <div class="cfg-hero-content">
              <div class="cfg-eyebrow">◆ &nbsp; Marché Décentralisé &nbsp; ◆</div>
              <h1 class="cfg-title">Négociation<br><em>Multi-Vendeurs</em></h1>
              <p class="cfg-sub">1 acheteur · N vendeurs · agents intelligents</p>
            </div>
            <div class="cfg-deco cfg-d1">◆</div>
            <div class="cfg-deco cfg-d2">◇</div>
            <div class="cfg-deco cfg-d3">◆</div>
          </div>

          <!-- Card centrée -->
          <div class="cfg-body">
            <div class="cfg-card">

              <!-- Agent actif -->
              <div class="cfg-agent-row">
                <div class="cfg-agent-dot-wrap"><span class="agent-dot"></span></div>
                <div class="cfg-agent-info">
                  <div class="cfg-agent-name">${S.activeAgent.name}</div>
                  <div class="cfg-agent-meta">Budget · ${fmt(S.activeAgent.budget || 0)}</div>
                </div>
                <div class="cfg-strategy-badge cfg-strat-${(S.activeAgent.strategyKey||'').toLowerCase()}">${S.activeAgent.strategy}</div>
              </div>

              <div class="cfg-sep"></div>

              <!-- Produit -->
              <div class="cfg-field">
                <label class="cfg-label">Article à négocier</label>
                <select class="cfg-select" id="product-select" onchange="updateDecentralisePreview()">
                  <option value="">— Sélectionner un article —</option>
                  ${productOptions}
                </select>
                <div id="cfg-product-preview" class="cfg-product-preview" style="display:none"></div>
              </div>

              <!-- Offre + Rounds -->
              <div class="cfg-two-col">
                <div class="cfg-field">
                  <label class="cfg-label">Offre initiale</label>
                  <div class="cfg-euro-wrap">
                    <input class="cfg-input" type="text" inputmode="numeric" id="initial-offer" placeholder="ex : 9 000" oninput="updatePriceEstimate()">
                    <span class="cfg-euro-sign">€</span>
                  </div>
                  <div id="cfg-estimate" class="cfg-estimate" style="display:none"></div>
                </div>
                <div class="cfg-field">
                  <label class="cfg-label">Rounds maximum</label>
                  <input class="cfg-input" type="number" id="max-rounds" value="${S.negoMaxRounds}" min="1" max="20">
                </div>
              </div>

              <!-- CTA -->
              <button class="cfg-cta" onclick="startDecentralise()">
                <span class="cfg-cta-gem">◆</span>
                Lancer la négociation
                <span class="cfg-cta-arrow">→</span>
              </button>

              <!-- Comparateur button (shown when product selected) -->
              <div id="cfg-comparateur-btn" style="display:none;margin-top:12px">
                <button class="btn btn-secondary" style="width:100%" onclick="window._launchComparateur()">
                  ⚖ Comparer les stratégies →
                </button>
              </div>

            </div>
          </div>
        </div>`;

      window.updateDecentralisePreview = () => {
        const sel = document.getElementById('product-select');
        const pid = sel?.value;
        const preview = document.getElementById('cfg-product-preview');
        const offerInput = document.getElementById('initial-offer');
        if (!pid || !preview) return;
        const p = products.find(x => x.id == pid);
        if (!p) { preview.style.display = 'none'; return; }
        const img = getProductImage(p);
        preview.style.display = 'flex';
        preview.innerHTML = `
          <div class="cfg-preview-img" style="background-image:url('${img}')"></div>
          <div class="cfg-preview-info">
            <div class="cfg-preview-brand">${p.brand || p.category}</div>
            <div class="cfg-preview-name">${p.name}</div>
            <div class="cfg-preview-range">
              <span>Min <strong>${fmt(p.priceMin)}</strong></span>
              <span class="cfg-preview-sep">·</span>
              <span>Max <strong style="color:var(--gold)">${fmt(p.priceMax)}</strong></span>
            </div>
          </div>`;
        if (offerInput && !offerInput.value) {
          const suggested = Math.round(p.priceMax * 0.78);
          offerInput.value = suggested.toLocaleString('fr-FR');
        }
        updatePriceEstimate();
        const compBtn = document.getElementById('cfg-comparateur-btn');
        if (compBtn) compBtn.style.display = 'block';
        window._launchComparateur = () => {
          const offer = document.getElementById('initial-offer')?.value;
          navigate('comparateur', { productId: p.id, offer: offer || Math.round(p.priceMin * 0.88) });
        };
      };

      window.updatePriceEstimate = () => {
        const sel = document.getElementById('product-select');
        const pid = sel?.value;
        const estimateEl = document.getElementById('cfg-estimate');
        if (!estimateEl) return;
        if (!pid) { estimateEl.style.display = 'none'; return; }
        const p = products.find(x => x.id == pid);
        if (!p) { estimateEl.style.display = 'none'; return; }

        const userOffer  = parseFloat(document.getElementById('initial-offer')?.value) || 0;
        const goodOffer  = Math.round(p.priceMax * 0.78);   // zone idéale = ~78% du max
        const estimate   = Math.round(p.priceMin * 0.95 + p.priceMax * 0.35);
        const strategy   = S.activeAgent ? S.activeAgent.strategy : 'Adaptatif';
        const pct        = userOffer > 0 ? Math.round((userOffer / p.priceMax) * 100) : null;

        estimateEl.style.display = 'block';

        // Alerte si offre trop basse
        if (userOffer > 0 && userOffer < p.priceMin * 0.6) {
          estimateEl.innerHTML = `⚠️ Offre trop basse (${pct}% du max) — le vendeur refusera.
            Recommandé : <strong>${goodOffer.toLocaleString('fr-FR')} €</strong> (78% du max)`;
          estimateEl.style.borderLeftColor = 'var(--crimson)';
          estimateEl.style.background      = 'rgba(196,18,48,0.08)';
          estimateEl.style.color           = 'var(--crimson2)';
        } else if (userOffer > 0 && userOffer < p.priceMin) {
          estimateEl.innerHTML = `⚠️ Offre inférieure au prix minimum (${fmt(p.priceMin)}) — risque d'échec.
            Zone recommandée : ${fmt(Math.round(p.priceMin * 0.85))} — ${fmt(goodOffer)}`;
          estimateEl.style.borderLeftColor = '#C9A84C';
          estimateEl.style.background      = 'rgba(201,168,76,0.08)';
          estimateEl.style.color           = 'var(--gold)';
        } else {
          const pctStr = pct !== null ? ` (${pct}% du max)` : '';
          estimateEl.innerHTML = `◆ Accord probable autour de <strong>${estimate.toLocaleString('fr-FR')} €</strong>${pctStr} · stratégie ${strategy}`;
          estimateEl.style.borderLeftColor = 'var(--gold)';
          estimateEl.style.background      = 'var(--gold-dim)';
          estimateEl.style.color           = 'var(--gold)';
        }
      };

      if (S.negoProduct) {
        document.getElementById('product-select').value = S.negoProduct.id;
        updateDecentralisePreview();
      }
    }

    renderSetup();

    window.startDecentralise = async () => {
      const productId = document.getElementById('product-select').value;
      const offer     = parseFloat(String(document.getElementById('initial-offer').value).replace(/\s/g, '').replace(',', '.'));
      const maxR      = parseInt(document.getElementById('max-rounds').value) || 10;

      if (!productId || !offer || offer <= 0) {
        toast('Remplissez tous les champs', 'error');
        return;
      }

      S.negoProduct   = products.find(p => p.id == productId);
      S.negoMaxRounds = maxR;
      S.negoRound     = 0;
      S.negoNegotiations = [];

      app.innerHTML = loader();

      try {
        // Find other products in same category (different sellers) for multi-vendor demo
        const sameCat = products.filter(p => p.category === S.negoProduct.category && p.sellerId !== S.negoProduct.sellerId);
        const vendors = [S.negoProduct, ...sameCat.slice(0, 2)]; // up to 3 vendors

        // Create negotiations
        for (const prod of vendors) {
          const nego = await apiStartNego(S.activeAgent.id, prod.id);
          S.negoNegotiations.push({
            negId: nego.id,
            sellerId: prod.sellerId,
            sellerName: prod.sellerName || 'Vendeur',
            productName: prod.name,
            priceMin: prod.priceMin,
            priceMax: prod.priceMax,
            status: 'NEGOTIATING',
            offers: [],
          });
        }

        // Make initial offer for all
        for (const n of S.negoNegotiations) {
          await apiMakeOffer(n.negId, S.activeAgent.id, offer);
          n.offers.push({ side: 'buyer', price: offer, round: 1 });
        }

        S.negoRound = 1;
        toast('Négociation démarrée avec ' + S.negoNegotiations.length + ' vendeur(s)', 'success');
        renderNegoView(offer);

      } catch(e) {
        toast('Erreur: ' + e.message, 'error');
        renderSetup();
      }
    };

    function renderNegoView(lastBuyerOffer) {
      const doneAll = S.negoNegotiations.every(n => n.status === 'AGREED' || n.status === 'FAILED');

      const stratKey = S.activeAgent && S.activeAgent.strategyKey ? S.activeAgent.strategyKey : 'COOL_HEADED';

      const vendorCards = S.negoNegotiations.map(n => {
        const offerBubbles = n.offers.map(o => {
          const bubble = `
            <div class="offer-bubble ${o.side} ${o.side === 'seller' && o.rejected ? 'rejected' : ''}">
              <div class="offer-price">${fmt(o.price)}</div>
              <div class="offer-label">${o.side === 'buyer' ? '🛒 Acheteur — Round ' + o.round : '🏪 ' + n.sellerName + ' — Round ' + o.round}</div>
            </div>`;
          if (o.side === 'seller') {
            const buyerPrice  = n.offers.filter(x => x.side === 'buyer' && x.round === o.round).map(x => x.price)[0] || o.price;
            const reasoning   = agentReasoning(stratKey, o.round || 1, S.negoMaxRounds, buyerPrice, o.price, n.priceMin || 0, n.priceMax || 0);
            return bubble + `<div class="agent-reasoning">◆ ${reasoning}</div>`;
          }
          return bubble;
        }).join('');

        return `
          <div class="nego-vendor-card">
            <div class="nego-vendor-header">
              <div class="nego-vendor-name">🏪 ${n.sellerName}</div>
              ${statusBadge(n.status)}
            </div>
            <div class="nego-vendor-body">
              <div style="font-size:12px;color:var(--text3);margin-bottom:12px">
                ${n.productName} &nbsp;|&nbsp; Min: ${fmt(n.priceMin)} &nbsp;|&nbsp; Max: ${fmt(n.priceMax)}
              </div>
              <div class="nego-offers-list" id="offers-${n.negId}">${offerBubbles}</div>
              ${n.status === 'AGREED' ? `<div class="text-green font-bold" style="font-size:16px">✓ Accord : ${fmt(n.finalPrice)}</div>` : ''}
              ${n.status === 'FAILED' ? `<div class="text-red font-bold">✗ Négociation échouée</div>` : ''}
            </div>
          </div>`;
      }).join('');

      // Result if all done
      const agreed = S.negoNegotiations.filter(n => n.status === 'AGREED');

      // Feature 8: surplus summary
      const surplusSummary = agreed.length > 0 ? `
        <div class="surplus-summary">
          ${agreed.map(n => {
            const surplus  = (n.priceMax || 0) - (n.finalPrice || 0);
            const pct      = n.priceMax ? Math.round((surplus / n.priceMax) * 100) : 0;
            return `<div class="surplus-row">
              <span class="surplus-label">Économie réalisée — ${n.sellerName}</span>
              <span class="surplus-amount">+${fmt(surplus)}</span>
              <span class="surplus-bar-wrap"><span class="surplus-bar-fill" style="width:${pct}%"></span></span>
              <span class="surplus-pct">${pct}% sous le prix max</span>
            </div>`;
          }).join('')}
        </div>` : '';

      const resultSection = doneAll ? `
        <div class="${agreed.length > 0 ? 'result-card' : 'result-card failed'}" style="margin-top:24px">
          <div class="result-icon">${agreed.length > 0 ? '✅' : '❌'}</div>
          <div class="result-title ${agreed.length > 0 ? 'success' : 'fail'}">
            ${agreed.length > 0 ? agreed.length + ' accord(s) trouvé(s) !' : 'Aucun accord'}
          </div>
          ${agreed.map(n => `<div style="font-size:14px;margin-top:8px">• ${n.sellerName} — <strong style="color:var(--gold)">${fmt(n.finalPrice)}</strong> — ${n.offerCount || '—'} round(s)</div>`).join('')}
          ${surplusSummary}
          <div class="btn-row" style="margin-top:20px;justify-content:center">
            <button class="btn btn-primary" onclick="navigate('historique')">Voir dans l'historique</button>
            <button class="btn btn-secondary" onclick="navigate('marche-decentralise')">Nouvelle négociation</button>
          </div>
        </div>` : '';

      app.innerHTML = `
        <div class="page">
          <div class="page-header">
            <h1>🔀 Marché Décentralisé</h1>
            <p>${S.negoProduct?.name} — ${S.activeAgent.name} (${S.activeAgent.strategy})</p>
          </div>

          <div class="round-progress">
            <h3>Progression de la Négociation</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.round((S.negoRound/S.negoMaxRounds)*100)}%"></div>
            </div>
            <div class="round-label">
              <span>Tour ${S.negoRound}/${S.negoMaxRounds}</span>
              <span>${S.negoNegotiations.filter(n=>n.status==='AGREED').length} accord(s) / ${S.negoNegotiations.length} vendeur(s)</span>
            </div>
          </div>

          ${S.negoNegotiations.some(n => n.offers.length > 1) ? `
          <div class="conv-chart-wrap">
            <div class="conv-chart-title">Convergence des Offres</div>
            ${drawConvergenceChart(S.negoNegotiations, S.negoMaxRounds)}
            <div class="conv-legend">
              <span class="conv-leg-solid">— acheteur</span>
              <span class="conv-leg-dash">- - vendeur</span>
              <span class="conv-leg-dot">⊙ accord</span>
            </div>
          </div>` : ''}

          <div class="nego-multi-grid">${vendorCards}</div>

          ${!doneAll ? `
            <div class="offer-input-section">
              <h3>🛒 Votre prochaine offre — Tour ${S.negoRound + 1}</h3>
              <div class="form-row" style="max-width:500px">
                <div class="form-group">
                  <label>Prix proposé (€)</label>
                  <input type="number" id="next-offer" value="${Math.round((lastBuyerOffer || 0) * 1.05)}" min="1">
                </div>
                <div class="form-group" style="display:flex;flex-direction:column;justify-content:flex-end">
                  <button class="btn btn-primary" onclick="nextRound()">Tour Suivant ▶</button>
                </div>
              </div>
              <div class="btn-row" style="margin-top:12px">
                <button class="btn btn-green btn-sm" onclick="autoMode()">⚡ Mode Auto</button>
                <button class="btn btn-secondary btn-sm" onclick="navigate('marche-decentralise')">Annuler</button>
              </div>
            </div>` : resultSection}
        </div>`;

      window.nextRound = async () => {
        const nextOffer = parseFloat(document.getElementById('next-offer')?.value);
        if (!nextOffer || nextOffer <= 0) { toast('Entrez un prix valide', 'error'); return; }
        await runRound(nextOffer);
      };

      window.autoMode = async () => {
        S.negoAutoMode = true;
        toast('Mode automatique activé', 'info');
        let currentOffer = lastBuyerOffer;
        while (!S.negoNegotiations.every(n => n.status !== 'NEGOTIATING') && S.negoRound < S.negoMaxRounds) {
          currentOffer = Math.round(currentOffer * 1.04);
          await runRound(currentOffer);
          await new Promise(r => setTimeout(r, 800));
        }
      };
    }

    async function runRound(buyerOffer) {
      S.negoRound++;
      const activeNegos = S.negoNegotiations.filter(n => n.status === 'NEGOTIATING');

      for (const n of activeNegos) {
        try {
          // Buyer makes offer
          await apiMakeOffer(n.negId, S.activeAgent.id, buyerOffer);
          n.offers.push({ side: 'buyer', price: buyerOffer, round: S.negoRound });

          // Seller auto-responds
          const negoUpdated = await apiAutoRespond(n.negId, n.sellerId, 'GREEDY');
          n.status = negoUpdated.status;
          if (negoUpdated.status === 'AGREED') {
            n.finalPrice = negoUpdated.finalPrice;
            n.offerCount = S.negoRound;
          }

          // Add seller response to display
          const lastOffer = negoUpdated.offers?.[negoUpdated.offers.length - 1];
          if (lastOffer && lastOffer.proposedPrice) {
            n.offers.push({ side: 'seller', price: lastOffer.proposedPrice, round: S.negoRound });
          }
        } catch(e) {
          n.status = 'FAILED';
        }
      }

      renderNegoView(buyerOffer);

      // Scroll offer lists to bottom
      document.querySelectorAll('.nego-offers-list').forEach(el => {
        el.scrollTop = el.scrollHeight;
      });
    }

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: MARCHÉ CENTRALISÉ ====================
async function renderMarcheCentralise() {
  const app = document.getElementById('app');

  try {
    const users    = S.users.length ? S.users : await apiGetUsers();
    const products = S.products.length ? S.products : await apiGetProducts();
    S.users = users;
    S.products = products;

    const buyers  = users.filter(u => u.userType === 'BUYER');
    const sellers = users.filter(u => u.userType === 'SELLER');
    const cats    = [...new Set(products.map(p => p.category).filter(Boolean))];

    const STRAT_COLORS = { COOL_HEADED: 'var(--crimson)', GREEDY: '#E8203E', FRUGAL: 'var(--grey)' };
    const STRAT_LABELS = { COOL_HEADED: 'Adaptatif', GREEDY: 'Agressif', FRUGAL: 'Conservateur' };
    const CAT_EMOJI    = { bags:'👜', watches:'⌚', clothing:'👗', perfumes:'🌹', shoes:'👠' };

    app.innerHTML = `
      <div class="cfg-wrap">

        <!-- Hero cinématique -->
        <div class="cfg-hero">
          <div class="cfg-hero-bg" style="background-image:url('${HERO_IMAGES[0]}')"></div>
          <div class="cfg-hero-veil"></div>
          <div class="cfg-hero-content">
            <div class="cfg-eyebrow">◆ &nbsp; Marché Centralisé &nbsp; ◆</div>
            <h1 class="cfg-title">Enchère<br><em>Double Face</em></h1>
            <p class="cfg-sub">acheteurs · vendeurs · matching algorithmique</p>
          </div>
          <div class="cfg-deco cfg-d1">◆</div>
          <div class="cfg-deco cfg-d2">◇</div>
          <div class="cfg-deco cfg-d3">◆</div>
        </div>

        <!-- Card centrée -->
        <div class="cfg-body">
          <div class="cfg-card" style="max-width:700px">

            <!-- Catégorie + acheteurs -->
            <div class="cfg-two-col" style="margin-bottom:0">
              <div class="cfg-field">
                <label class="cfg-label">Catégorie de produits</label>
                <select class="cfg-select" id="cc-cat">
                  ${cats.map(c => `<option value="${c}">${CAT_EMOJI[c]||'💎'} ${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
                </select>
              </div>
              <div class="cfg-field">
                <label class="cfg-label">Nombre d'acheteurs</label>
                <select class="cfg-select" id="cc-nb-buyers">
                  ${[2,3,4,5].map(n => `<option value="${n}" ${n===3?'selected':''}>${n} acheteur${n>1?'s':''}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="cfg-sep"></div>

            <!-- Participants -->
            <div class="cfg-participants-grid">
              <!-- Acheteurs -->
              <div class="cfg-participants-col">
                <div class="cfg-participants-title">
                  <span class="cfg-p-dot" style="background:var(--gold)"></span>
                  Acheteurs
                </div>
                ${buyers.slice(0,5).map((u, i) => {
                  const p   = AGENT_PROFILES[i] || AGENT_PROFILES[0];
                  const col = STRAT_COLORS[p.strategyKey] || 'var(--grey)';
                  const lbl = STRAT_LABELS[p.strategyKey] || 'Adaptatif';
                  const initials = u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                  return `
                  <div class="cfg-participant fade-up stagger-${Math.min(i+1,5)}">
                    <div class="cfg-p-avatar" style="background:${col}22;color:${col};border-color:${col}44">${initials}</div>
                    <div class="cfg-p-info">
                      <div class="cfg-p-name">${u.name.split(' ')[0]}</div>
                      <div class="cfg-p-strat" style="color:${col}">${lbl}</div>
                    </div>
                    <div class="cfg-p-budget">${fmt(p.budget)}</div>
                  </div>`;
                }).join('')}
              </div>

              <!-- Vendeurs -->
              <div class="cfg-participants-col">
                <div class="cfg-participants-title">
                  <span class="cfg-p-dot" style="background:var(--crimson)"></span>
                  Vendeurs
                </div>
                ${sellers.map((u, i) => {
                  const strats = [
                    {lbl:'Adaptatif', col:'var(--crimson)'},
                    {lbl:'Flexible',  col:'var(--gold)'},
                    {lbl:'Ferme',     col:'var(--grey)'},
                  ];
                  const s = strats[i % strats.length];
                  const initials = u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                  return `
                  <div class="cfg-participant fade-up stagger-${Math.min(i+1,5)}">
                    <div class="cfg-p-avatar" style="background:${s.col}22;color:${s.col};border-color:${s.col}44">${initials}</div>
                    <div class="cfg-p-info">
                      <div class="cfg-p-name">${u.name.split(' ')[0]}</div>
                      <div class="cfg-p-strat" style="color:${s.col}">${s.lbl}</div>
                    </div>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <div class="cfg-sep"></div>

            <!-- CTA -->
            <button class="cfg-cta" onclick="runCentralise()">
              <span class="cfg-cta-gem">◆</span>
              Démarrer l'enchère
              <span class="cfg-cta-arrow">→</span>
            </button>

          </div>
        </div>

        <div id="centralise-result" style="padding:0 40px 60px;max-width:900px;margin:0 auto"></div>
      </div>`;

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    window.runCentralise = async () => {
      const cat      = document.getElementById('cc-cat').value;
      const nbB      = parseInt(document.getElementById('cc-nb-buyers').value);
      const catProds = products.filter(p => p.category === cat);

      if (!catProds.length) { toast('Aucun produit dans cette catégorie', 'error'); return; }

      const selectedBuyers  = buyers.slice(0, nbB);
      const selectedSellers = catProds.slice(0, 3);
      const nbSellers = selectedSellers.length;
      const maxRounds = 15;
      const resultEl = document.getElementById('centralise-result');

      // Show 3-step animation + round area
      resultEl.innerHTML = `
        <div style="margin-top:28px">
          <div class="process-steps" id="steps">
            <div class="step active" id="step1"><div class="step-num">1</div><div class="step-label">Collection des Offres</div><div class="step-sub">(Bids)</div></div>
            <div class="step" id="step2"><div class="step-num">2</div><div class="step-label">Collection des Demandes</div><div class="step-sub">(Asks)</div></div>
            <div class="step" id="step3"><div class="step-num">3</div><div class="step-label">Enchère par Rounds</div><div class="step-sub">(Matching)</div></div>
          </div>

          <!-- Round indicator -->
          <div id="round-indicator" style="display:none;margin:20px 0;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <span id="round-badge" style="font-size:18px;font-weight:600;font-family:var(--font-serif)">🔄 Round 0/${maxRounds}</span>
            <span id="sellers-matched" style="font-size:14px;padding:4px 12px;border:1px solid var(--border)">Vendeurs 0/${nbSellers}</span>
            <span id="transactions-count" style="font-size:14px;color:var(--gold)">Transactions : 0</span>
          </div>

          <div id="step-content" style="margin-top:8px">${loader()}</div>

          <!-- Transaction history (live) -->
          <div id="tx-history" style="display:none;margin-top:20px">
            <h4 style="font-family:var(--font-serif);margin-bottom:12px;font-size:15px">📜 Historique de transactions</h4>
            <div id="tx-list" style="display:flex;flex-direction:column;gap:8px"></div>
          </div>
        </div>`;

      // Step 1 — collect bids
      await sleep(1100);
      document.getElementById('step1').classList.add('done');
      document.getElementById('step2').classList.add('active');

      // Initial bids: ~60-75% of priceMax, vary by buyer
      let currentBids = selectedBuyers.map((u, i) => {
        const p = AGENT_PROFILES[i] || AGENT_PROFILES[0];
        const base = catProds[0].priceMax * (0.58 + i * 0.04 + Math.random() * 0.04);
        return { buyer: u.name, buyerShort: 'Acheteur' + (i+1), bid: Math.round(base), budgetMax: p.budget, matched: false };
      });

      // Step 2 — collect asks
      await sleep(1000);
      document.getElementById('step2').classList.add('done');
      document.getElementById('step3').classList.add('active');

      // Initial asks: ~125-135% of priceMin (sellers start high)
      let currentAsks = selectedSellers.map((p, i) => {
        const base = p.priceMin * (1.28 - i * 0.03 + Math.random() * 0.05);
        return { seller: p.sellerName || ('Vendeur'+(i+1)), sellerShort: 'Vendeur'+(i+1), product: p.name, ask: Math.round(base), floor: p.priceMin, matched: false };
      });

      await sleep(800);
      document.getElementById('step3').classList.add('done');

      // Show round indicator
      document.getElementById('round-indicator').style.display = 'flex';
      document.getElementById('step-content').innerHTML = '';

      const transactions = [];
      let round = 0;

      function refreshRoundUI() {
        const matchedSellers = currentAsks.filter(a => a.matched).length;
        document.getElementById('round-badge').textContent = `🔄 Round ${round}/${maxRounds}`;
        document.getElementById('sellers-matched').textContent = `Vendeurs ${matchedSellers}/${nbSellers}`;
        document.getElementById('transactions-count').textContent = `Transactions : ${transactions.length}`;

        if (transactions.length > 0) {
          document.getElementById('tx-history').style.display = 'block';
          document.getElementById('tx-list').innerHTML = transactions.map(tx => `
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;padding:8px 12px;background:var(--surface2);border-left:3px solid var(--gold);color:var(--white)">
              <span style="color:var(--grey);min-width:70px">Round ${tx.round}</span>
              <span style="font-weight:600;color:var(--white-dim)">${tx.buyerShort}</span>
              <span style="color:var(--crimson)">→</span>
              <span style="font-weight:600;color:var(--white-dim)">${tx.sellerShort}</span>
              <span style="color:var(--grey)">|</span>
              <span style="font-size:12px;color:var(--grey)">${tx.product || ''}</span>
              <span style="color:var(--gold);font-weight:700;margin-left:auto;font-family:var(--font-display);font-style:italic;font-size:15px">${fmt(tx.price)}</span>
            </div>`).join('');
        }

        // Live bids/asks table in step-content
        document.getElementById('step-content').innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px">
            <div>
              <div style="font-size:11px;letter-spacing:.1em;color:var(--grey);margin-bottom:8px">OFFRES ACHETEURS</div>
              ${currentBids.filter(b=>!b.matched).map(b=>`
                <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--surface3);margin-bottom:4px">
                  <span>${b.buyer}</span><span style="color:var(--gold);font-weight:600">${fmt(b.bid)}</span>
                </div>`).join('') || '<div style="color:var(--grey);padding:8px">Tous les acheteurs ont conclu</div>'}
            </div>
            <div>
              <div style="font-size:11px;letter-spacing:.1em;color:var(--grey);margin-bottom:8px">DEMANDES VENDEURS</div>
              ${currentAsks.map((a,i)=>`
                <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--surface3);margin-bottom:4px;${a.matched?'opacity:.4;text-decoration:line-through':''}">
                  <span>${a.seller}</span><span style="color:${a.matched?'var(--grey)':'var(--crimson)'};font-weight:600">${a.matched?'✓ Vendu':fmt(a.ask)}</span>
                </div>`).join('')}
            </div>
          </div>`;
      }

      // Run rounds
      for (round = 1; round <= maxRounds; round++) {
        // Try to match: sort available bids desc, asks asc
        const availBids = currentBids.filter(b => !b.matched).sort((a,b) => b.bid - a.bid);
        const availAsks = currentAsks.filter(a => !a.matched).sort((a,b) => a.ask - b.ask);

        for (let i = 0; i < Math.min(availBids.length, availAsks.length); i++) {
          if (availBids[i].bid >= availAsks[i].ask) {
            const price = Math.round((availBids[i].bid + availAsks[i].ask) / 2);
            transactions.push({
              round,
              buyer: availBids[i].buyer, buyerShort: availBids[i].buyerShort,
              seller: availAsks[i].seller, sellerShort: availAsks[i].sellerShort,
              product: availAsks[i].product, price
            });
            availBids[i].matched = true;
            availAsks[i].matched = true;
          }
        }

        refreshRoundUI();

        // Stop if all sellers matched or no bids left
        if (currentAsks.every(a => a.matched) || currentBids.every(b => b.matched)) break;

        // Convergence: bids go up ~3%, asks go down ~3%
        currentBids.forEach(b => { if (!b.matched) b.bid = Math.round(b.bid * 1.03); });
        currentAsks.forEach(a => { if (!a.matched) a.ask = Math.round(a.ask * 0.97); });

        await sleep(750);
      }

      // Final summary
      const totalVol = transactions.reduce((s,t) => s+t.price, 0);
      const avgPrice = transactions.length ? Math.round(totalVol / transactions.length) : 0;
      document.getElementById('step-content').innerHTML += `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px">
          <div class="stat-card"><div class="stat-label">Transactions</div><div class="stat-value">${transactions.length}</div></div>
          <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold">${fmt(totalVol)}</div></div>
          <div class="stat-card"><div class="stat-label">Prix Moyen</div><div class="stat-value">${avgPrice ? fmt(avgPrice) : '—'}</div></div>
        </div>
        ${transactions.length === 0 ? '<div class="empty-state" style="padding:24px;margin-top:16px"><p>Aucun accord après '+ round +' rounds — prix trop éloignés</p></div>' : ''}`;

      toast(`Enchère terminée en ${round} round(s) — ${transactions.length} transaction(s)`, 'success');

      // Persist dans l'historique
      if (transactions.length > 0) {
        const hist = JSON.parse(localStorage.getItem('sa7_centralise_history') || '[]');
        transactions.forEach(tx => hist.push({
          ...tx,
          type: 'CENTRALISE',
          date: new Date().toISOString(),
          agentName: S.activeAgent?.name || '—',
          rounds: round,
        }));
        localStorage.setItem('sa7_centralise_history', JSON.stringify(hist.slice(-200)));
      }
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: ACHAT GROUPÉ ====================
async function renderAchatGroupe() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>👥 Achat Groupé</h1>
        <p>Plusieurs acheteurs s'unissent pour négocier un meilleur prix collectif</p>
      </div>
      <div class="card" style="max-width:600px">
        <div class="empty-state" style="padding:40px 20px">
          <div class="empty-icon">🚧</div>
          <p style="font-size:16px;margin-bottom:8px">Fonctionnalité en développement</p>
          <p>L'achat groupé sera disponible dans la prochaine version.</p>
          <button class="btn btn-secondary btn-sm" style="margin-top:20px" onclick="navigate('marche-decentralise')">Essayer le Marché Décentralisé</button>
        </div>
      </div>
    </div>`;
}

// ==================== PAGE: HISTORIQUE ====================
async function renderHistorique() {
  const app = document.getElementById('app');

  if (!S.activeAgent) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">👤</div><p>Sélectionnez un agent depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a> pour voir l'historique.</p></div></div>`;
    return;
  }

  try {
    const data = await apiGetBuyerNegos(S.activeAgent.id);
    const negos = (data.content || data || []);

    // Transactions Centralisé sauvegardées localement
    const centraliseAll = JSON.parse(localStorage.getItem('sa7_centralise_history') || '[]');

    const agreedNegos   = negos.filter(n => n.status === 'AGREED');
    const totalVolDec   = agreedNegos.reduce((s,n) => s + (n.finalPrice || 0), 0);
    const totalVolCen   = centraliseAll.reduce((s,t) => s + (t.price || 0), 0);
    const totalTx       = agreedNegos.length + centraliseAll.length;
    const totalVol      = totalVolDec + totalVolCen;
    const avgPrice      = totalTx ? Math.round(totalVol / totalTx) : 0;
    const surplus       = agreedNegos.reduce((s,n) => s + Math.max(0, (n.priceMax||0) - (n.finalPrice||0)), 0);

    window._histNegos      = negos;
    window._histCentralise = centraliseAll;

    // Rows décentralisé
    const decRows = negos.length === 0 ? '' : negos.map(n => `<tr>
      <td class="text-muted">#${n.id}</td>
      <td>${n.productName || '—'}</td>
      <td>${n.sellerName || '—'}</td>
      <td><span class="tag">Décentralisé</span></td>
      <td class="${n.finalPrice ? 'text-gold font-bold' : 'text-muted'}">${fmt(n.finalPrice)}</td>
      <td>${n.offers ? n.offers.length : '—'}</td>
      <td>${statusBadge(n.status)} ${n.status === 'AGREED' && n.finalPrice ? `<button class="btn-replay" onclick="showReplayModal('${(n.productName||'').replace(/'/g,"\\'")}','${(n.sellerName||'').replace(/'/g,"\\'")}',${n.priceMin||0},${n.priceMax||0},${n.finalPrice},${n.offers?.length||5})">▶</button>` : ''}</td>
      <td class="text-muted">${n.startedAt ? new Date(n.startedAt).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>`).join('');

    // Rows centralisé
    const cenRows = centraliseAll.slice().reverse().map((tx, i) => `<tr>
      <td class="text-muted">C${i+1}</td>
      <td>${tx.product || '—'}</td>
      <td>${tx.sellerShort || '—'}</td>
      <td><span class="tag" style="border-color:var(--gold);color:var(--gold)">Centralisé</span></td>
      <td class="text-gold font-bold">${fmt(tx.price)}</td>
      <td>${tx.rounds || '—'}</td>
      <td><span class="nego-status-badge status-agreed">Accord ✓</span></td>
      <td class="text-muted">${tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>`).join('');

    const allRows = decRows + cenRows || `<tr><td colspan="8" style="text-align:center;color:var(--grey);padding:40px">Aucune négociation — lancez une enchère pour commencer</td></tr>`;

    app.innerHTML = `
      <div class="page">
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div>
            <h1>📋 Historique des Négociations</h1>
            <p>Agent : ${S.activeAgent.name}</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="exportHistoriqueCSV(window._histNegos, window._histCentralise)" style="margin-top:8px">⬇ Exporter CSV</button>
        </div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-value" data-counter>${totalTx}</div></div>
          <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold" data-counter>${totalVol} €</div></div>
          <div class="stat-card"><div class="stat-label">Prix Moyen</div><div class="stat-value" data-counter>${avgPrice} €</div></div>
          <div class="stat-card"><div class="stat-label">Surplus Moyen</div><div class="stat-value text-green">${agreedNegos.length ? '+' + fmt(Math.round(surplus / Math.max(1, agreedNegos.length))) : '—'}</div></div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#ID</th><th>Produit</th><th>Vendeur</th><th>Type</th>
                <th>Prix Final</th><th>Rounds</th><th>Statut</th><th>Date</th>
              </tr>
            </thead>
            <tbody>${allRows}</tbody>
          </table>
        </div>

        ${centraliseAll.length > 0 ? `
        <div style="margin-top:12px;text-align:right">
          <button class="btn btn-ghost btn-sm" onclick="if(confirm('Effacer tout l\'historique Centralisé ?')){localStorage.removeItem('sa7_centralise_history');navigate('historique');}">
            🗑 Effacer historique centralisé
          </button>
        </div>` : ''}
      </div>`;
  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: PROFIL AGENT ====================
async function renderProfilAgent() {
  const app = document.getElementById('app');

  try {
    const users = S.users.length ? S.users : await apiGetUsers();
    S.users = users;
    const buyers = users.filter(u => u.userType === 'BUYER');
    const allAgents = buyers.length + S.customAgents.length;
    const totalBudget = AGENT_PROFILES.slice(0, buyers.length).reduce((s, p) => s + p.budget, 0)
      + S.customAgents.reduce((s, a) => s + a.budget, 0);

    const agentCards = buyers.map((u, i) => {
      const p = AGENT_PROFILES[i] || AGENT_PROFILES[0];
      const isActive = S.activeAgent && S.activeAgent.id === u.id;
      const solde = Math.round(p.budget * (0.7 + 0.3 * (i % 3 === 0 ? 1 : 0.8)));
      const pct = Math.round((solde / p.budget) * 100);
      return `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px">
              <div class="agent-avatar" style="background: linear-gradient(135deg, ${p.color}, #333)">${u.name.charAt(0)}</div>
              <div>
                <div class="agent-name">${u.name}</div>
                <div style="font-size:12px;color:var(--text3)">ID: buyer_${u.id}</div>
              </div>
            </div>
            ${isActive ? '<span class="agent-badge badge-actif">Actif</span>' : ''}
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px">
            <span style="color:var(--green)">✅ Vente via Négociation (${Math.floor(Math.random()*6)} produits)</span>
            <div class="budget-bar" style="margin-top:8px"><div class="budget-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="agent-row"><span class="agent-row-label">Stratégie</span><span class="agent-row-value">${p.strategy}</span></div>
          <div class="agent-row"><span class="agent-row-label">Budget</span><span class="agent-row-value">${fmt(p.budget)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Solde</span><span>${fmt(solde)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Pénalités</span><span style="color:var(--crimson)">0 €</span></div>
        </div>`;
    }).join('');

    const customCards = S.customAgents.map((a, i) => {
      const isActive = S.activeAgent && S.activeAgent.email === a.email;
      const solde = Math.round(a.budget * 0.9);
      const pct = 90;
      return `
        <div class="card" style="border-left:3px solid var(--gold)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px">
              <div class="agent-avatar" style="background:linear-gradient(135deg,#a855f7,#333)">${a.name.charAt(0)}</div>
              <div>
                <div class="agent-name">${a.name}</div>
                <div style="font-size:12px;color:var(--text3)">Agent personnalisé</div>
              </div>
            </div>
            <span style="font-size:11px;background:var(--gold);color:#000;padding:2px 8px;letter-spacing:.05em">CUSTOM</span>
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px">
            <span style="color:var(--green)">✅ Créé manuellement</span>
            <div class="budget-bar" style="margin-top:8px"><div class="budget-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="agent-row"><span class="agent-row-label">Stratégie</span><span class="agent-row-value">${a.strategy}</span></div>
          <div class="agent-row"><span class="agent-row-label">Budget</span><span class="agent-row-value">${fmt(a.budget)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Solde</span><span>${fmt(solde)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Pénalités</span><span style="color:var(--crimson)">0 €</span></div>
          <button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;color:var(--crimson);border-color:var(--crimson)" onclick="deleteCustomAgent(${i})">✕ Supprimer</button>
        </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page">
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
          <div>
            <h1>👤 Profil des Agents Acheteurs</h1>
            <p>Consultez les soldes, pénalités et stratégies de chaque agent</p>
          </div>
          <button class="btn btn-primary" onclick="toggleAddAgentForm()">+ Ajouter un agent</button>
        </div>

        <!-- FORM CRÉATION AGENT -->
        <div id="add-agent-form" style="display:none;max-width:600px;margin-bottom:32px">
          <div class="card" style="border-left:3px solid var(--gold)">
            <h3 style="margin-bottom:20px;font-family:var(--font-serif)">Créer un nouvel agent</h3>
            <div class="form-group" style="margin-bottom:16px">
              <label>Nom d'agent</label>
              <input type="text" id="new-agent-name" placeholder="Ex: Félix Acheteur" />
            </div>
            <div class="form-group" style="margin-bottom:16px">
              <label>Budget initial (€)</label>
              <input type="number" id="new-agent-budget" value="200000" min="10000" step="5000" />
            </div>
            <div class="form-group" style="margin-bottom:24px">
              <label>Stratégie de négociation</label>
              <select id="new-agent-strategy">
                <option value="COOL_HEADED">Adaptatif — équilibre offre/demande</option>
                <option value="GREEDY">Agressif — cherche le prix le plus bas</option>
                <option value="FRUGAL">Conservateur — respecte le budget strictement</option>
              </select>
            </div>
            <div style="display:flex;gap:12px">
              <button class="btn btn-outline" style="flex:1" onclick="toggleAddAgentForm()">Annuler</button>
              <button class="btn btn-primary" style="flex:2" onclick="createCustomAgent()">✓ Créer l'agent</button>
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">Total Agents</div><div class="stat-value">${allAgents}</div></div>
          <div class="stat-card"><div class="stat-label">Budget Total</div><div class="stat-value text-gold">${fmt(totalBudget)}</div></div>
          <div class="stat-card"><div class="stat-label">Agents Custom</div><div class="stat-value">${S.customAgents.length}</div></div>
        </div>

        <div class="grid grid-2">${agentCards}${customCards}</div>
      </div>`;

    window.toggleAddAgentForm = () => {
      const f = document.getElementById('add-agent-form');
      f.style.display = f.style.display === 'none' ? 'block' : 'none';
    };

    window.createCustomAgent = async () => {
      const name     = document.getElementById('new-agent-name').value.trim();
      const budget   = parseInt(document.getElementById('new-agent-budget').value);
      const stratKey = document.getElementById('new-agent-strategy').value;
      const stratMap = { COOL_HEADED: 'Adaptatif', GREEDY: 'Agressif', FRUGAL: 'Conservateur' };

      if (!name) { toast('Veuillez saisir un nom d\'agent', 'error'); return; }
      if (!budget || budget < 1000) { toast('Budget invalide (min 1 000 €)', 'error'); return; }

      const email = name.toLowerCase().replace(/\s+/g,'') + '_' + Date.now() + '@sa7.com';
      const agent = { name, email, budget, strategy: stratMap[stratKey], strategyKey: stratKey, color: '#a855f7' };

      try {
        // Register via API → creates real user in DB
        await post('/api/auth/register', { name, email, password: 'password', userType: 'BUYER' });
        toast(`Agent "${name}" créé avec succès !`, 'success');
      } catch(e) {
        // Store locally even if API fails (offline / already exists)
      }

      S.customAgents.push(agent);
      localStorage.setItem('sa7_custom_agents', JSON.stringify(S.customAgents));
      renderProfilAgent();
    };

    window.deleteCustomAgent = (i) => {
      const name = S.customAgents[i].name;
      S.customAgents.splice(i, 1);
      localStorage.setItem('sa7_custom_agents', JSON.stringify(S.customAgents));
      toast(`Agent "${name}" supprimé`, 'info');
      renderProfilAgent();
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: ADMIN ====================
async function renderAdmin() {
  setPage('admin');
  const app = document.getElementById('app');

  try {
    const products = await apiGetProducts();
    const users    = S.users.length ? S.users : await apiGetUsers();
    S.products = products;
    S.users    = users;

    function renderContent() {
      if (S.adminTab === 'produits') {
        return `
          <div class="section-header">
            <h2>Catalogue (${products.length} produits)</h2>
            <button class="btn btn-primary btn-sm" onclick="showAddProduct()">+ Ajouter un produit</button>
          </div>
          <div id="add-product-form" style="display:none">
            <div class="card" style="margin-bottom:20px;max-width:600px">
              <h3 style="margin-bottom:16px;color:var(--gold)">Nouveau produit</h3>
              <div class="form-row">
                <div class="form-group"><label>Nom</label><input id="ap-name" placeholder="ex: Sac Chanel Classic"></div>
                <div class="form-group"><label>Marque</label><input id="ap-brand" placeholder="ex: Chanel"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Catégorie</label>
                  <select id="ap-cat">
                    <option value="bags">bags</option><option value="watches">watches</option>
                    <option value="clothing">clothing</option><option value="perfumes">perfumes</option><option value="shoes">shoes</option>
                  </select>
                </div>
                <div class="form-group"><label>Stock</label><input id="ap-stock" type="number" value="5" min="0"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Prix min (€)</label><input id="ap-pmin" type="number" placeholder="500"></div>
                <div class="form-group"><label>Prix max (€)</label><input id="ap-pmax" type="number" placeholder="1200"></div>
              </div>
              <div class="btn-row">
                <button class="btn btn-primary" onclick="submitProduct()">Créer</button>
                <button class="btn btn-secondary" onclick="document.getElementById('add-product-form').style.display='none'">Annuler</button>
              </div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Nom</th><th>Marque</th><th>Catégorie</th><th>Prix Min</th><th>Prix Max</th><th>Stock</th><th>Vendeur</th></tr></thead>
              <tbody>
                ${products.map(p => `<tr>
                  <td class="text-muted">#${p.id}</td>
                  <td class="font-bold">${p.name}</td>
                  <td class="text-gold">${p.brand || '—'}</td>
                  <td><span class="tag">${p.category || '—'}</span></td>
                  <td>${fmt(p.priceMin)}</td>
                  <td class="text-gold">${fmt(p.priceMax)}</td>
                  <td>${p.stockQuantity ?? '—'}</td>
                  <td class="text-muted">${p.sellerName || '—'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>`;
      } else {
        const sellers = users.filter(u => u.userType === 'SELLER');
        const buyers  = users.filter(u => u.userType === 'BUYER');
        return `
          <div class="section-header"><h2>Agents (${users.length} utilisateurs)</h2></div>
          <h3 style="font-size:14px;color:var(--text2);margin-bottom:12px">VENDEURS (${sellers.length})</h3>
          <div class="table-wrap" style="margin-bottom:20px">
            <table>
              <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th></tr></thead>
              <tbody>
                ${sellers.map(u => `<tr><td class="text-muted">#${u.id}</td><td class="font-bold">${u.name}</td><td class="text-muted">${u.email}</td><td><span class="tag">SELLER</span></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <h3 style="font-size:14px;color:var(--text2);margin-bottom:12px">ACHETEURS (${buyers.length})</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Stratégie</th><th>Budget</th></tr></thead>
              <tbody>
                ${buyers.map((u, i) => {
                  const p = AGENT_PROFILES[i] || AGENT_PROFILES[0];
                  return `<tr>
                    <td class="text-muted">#${u.id}</td>
                    <td class="font-bold">${u.name}</td>
                    <td class="text-muted">${u.email}</td>
                    <td>${p.strategy}</td>
                    <td class="text-gold">${fmt(p.budget)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      }
    }

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>🔧 Panneau d'Administration</h1>
          <p>Gérez les produits et les agents</p>
        </div>

        <div class="tabs">
          <div class="tab ${S.adminTab==='produits'?'active':''}" onclick="switchAdminTab('produits')">Produits (${products.length})</div>
          <div class="tab ${S.adminTab==='agents'?'active':''}" onclick="switchAdminTab('agents')">Agents (${users.length})</div>
        </div>

        <div id="admin-content">${renderContent()}</div>
      </div>`;

    window.switchAdminTab = (tab) => {
      S.adminTab = tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.textContent.startsWith(tab === 'produits' ? 'Produits' : 'Agents')));
      document.getElementById('admin-content').innerHTML = renderContent();
    };

    window.showAddProduct = () => {
      document.getElementById('add-product-form').style.display = 'block';
    };

    window.submitProduct = async () => {
      if (!S.token) { toast('Connectez-vous d\'abord en sélectionnant un agent vendeur', 'error'); return; }
      const name  = document.getElementById('ap-name').value;
      const brand = document.getElementById('ap-brand').value;
      const cat   = document.getElementById('ap-cat').value;
      const stock = parseInt(document.getElementById('ap-stock').value) || 0;
      const pmin  = parseFloat(document.getElementById('ap-pmin').value);
      const pmax  = parseFloat(document.getElementById('ap-pmax').value);
      if (!name || !pmin || !pmax) { toast('Champs obligatoires manquants', 'error'); return; }
      try {
        await post('/api/products', { name, brand, category: cat, priceMin: pmin, priceMax: pmax, stockQuantity: stock });
        toast('Produit créé ✓', 'success');
        renderAdmin();
      } catch(e) { toast('Erreur: ' + e.message, 'error'); }
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== CUSTOM CURSOR ====================
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  // Move dot instantly
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with lag (lerp)
  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover on interactive elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,[onclick],.agent-card,.product-card,.protocol-card,.chip,.tab-btn')) {
      document.body.classList.add('cur-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,[onclick],.agent-card,.product-card,.protocol-card,.chip,.tab-btn')) {
      document.body.classList.remove('cur-hover');
    }
  });

  // Click ripple
  document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'));

  // Hide ring when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

// ==================== PRELOADER — flash cinéma rapide ====================
function initPreloader(onDone) {
  const pl  = document.getElementById('preloader');
  const el1 = document.getElementById('pl-line1');
  const el2 = document.getElementById('pl-line2');
  if (!pl) { onDone(); return; }

  // Texte statique
  if (el1) el1.textContent = 'Couture';
  if (el2) el2.textContent = 'Marketplace';

  // Rendre la page en arrière-plan AVANT le fade du preloader
  // → page déjà prête quand le fondu commence = blend parfait
  setTimeout(() => { onDone(); }, 140);

  // Fade du preloader après que la page est déjà rendue
  setTimeout(() => {
    pl.classList.add('hidden');
    setTimeout(() => { pl.style.display = 'none'; }, 460);
  }, 440);
}

// ==================== SWING BAR ====================
function initSwingBar() {
  const bar = document.getElementById('swing-bar');
  if (!bar) return;

  let visible = false;

  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 120;
    if (shouldShow !== visible) {
      visible = shouldShow;
      if (visible) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }
    }
  }, { passive: true });
}

window.scrollToTop    = () => window.scrollTo({ top: 0, behavior: 'smooth' });
window.scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

// ==================== PAGE TRANSITION ====================
let _transitioning = false;

async function pageTransition(callback) {
  if (_transitioning) return;
  _transitioning = true;

  const overlay = document.getElementById('page-transition');
  if (!overlay) { callback(); _transitioning = false; return; }

  overlay.classList.add('active');
  await new Promise(r => setTimeout(r, 380));

  callback();

  await new Promise(r => setTimeout(r, 80));
  overlay.classList.remove('active');
  _transitioning = false;
}

// ==================== COUNTER ANIMATION ====================
function animateCounter(el) {
  const raw = el.textContent.trim();
  const hasEuro = raw.includes('€') || raw.includes('€');
  const num = parseInt(raw.replace(/[^\d]/g, ''));
  if (!num || num < 10) return; // skip tiny numbers

  const duration = 1400;
  const start = performance.now();

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = easeOutCubic(progress);
    const current  = Math.round(num * eased);
    el.textContent = current.toLocaleString('fr-FR') + (hasEuro ? ' €' : '');
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = raw; // restore original formatted value
      el.classList.add('counter-flash');
    }
  }

  el.textContent = '0';
  requestAnimationFrame(tick);
}

function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.stat-value').forEach(el => observer.observe(el));
}

// ==================== WISHLIST ====================

function saveWishlist() {
  localStorage.setItem('sa7_wishlist', JSON.stringify([...S.wishlist]));
}

function updateWishlistBadge() {
  const badge = document.getElementById('nav-wishlist-count');
  if (!badge) return;
  const count = S.wishlist.size;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function toggleWishlist(productId) {
  if (S.wishlist.has(productId)) {
    S.wishlist.delete(productId);
    toast('Retiré des favoris', 'info');
  } else {
    S.wishlist.add(productId);
    toast('Ajouté aux favoris ♥', 'success');
  }
  saveWishlist();
  updateWishlistBadge();
  // Update every heart button for this product on the page
  document.querySelectorAll(`[data-wish="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', S.wishlist.has(productId));
  });
  // Update wishlist button text inside quick view if open
  const qvWishBtn = document.querySelector('.qv-wish-btn');
  if (qvWishBtn) {
    const wished = S.wishlist.has(productId);
    qvWishBtn.textContent = wished ? '♥ Dans la wishlist' : '♡ Ajouter aux favoris';
    qvWishBtn.classList.toggle('wished', wished);
  }
}

function renderWishlist() {
  setPage('');
  const app = document.getElementById('app');

  if (!S.wishlist.size) {
    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>♥ Mes Favoris</h1>
          <p>Vos articles de luxe sauvegardés</p>
        </div>
        <div class="wishlist-empty">
          <div class="wish-icon">♥</div>
          <p>Votre wishlist est vide.<br>Parcourez le marketplace pour sauvegarder vos coups de cœur.</p>
          <br>
          <button class="btn btn-primary" onclick="navigate('marketplace')">Explorer le marketplace</button>
        </div>
      </div>`;
    return;
  }

  // Load products if not cached
  (S.products.length ? Promise.resolve(S.products) : apiGetProducts().then(p => { S.products = p; return p; }))
    .then(products => {
      const saved = products.filter(p => S.wishlist.has(p.id));
      if (!saved.length) {
        app.innerHTML = `<div class="page"><div class="page-header"><h1>♥ Mes Favoris</h1></div><div class="wishlist-empty"><div class="wish-icon">♥</div><p>Aucun produit trouvé.</p></div></div>`;
        return;
      }
      const cards = saved.map((p, i) => {
        const imgSrc = getProductImage(p);
        const cond   = conditionBadge(p.id);
        return `
          <div class="product-card fade-up stagger-${Math.min((i%5)+1,5)}" data-tilt
               onclick="navigate('marche-decentralise', {productId: ${p.id}})">
            <div class="product-img">
              <img src="${imgSrc}" alt="${p.name}"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div class="product-img-placeholder" style="display:none">${categoryEmoji(p.category)}</div>
              <div class="product-img-overlay"></div>
              <div class="product-quickview" onclick="event.stopPropagation(); openQuickView(${p.id})">
                <span>Quick View</span>
              </div>
              <button class="product-wish active" data-wish="${p.id}"
                      onclick="event.stopPropagation(); toggleWishlist(${p.id})">♥</button>
            </div>
            <div class="product-body">
              <div class="product-brand">${p.brand || p.category || '—'}</div>
              <div class="product-name">${p.name}</div>
              <div class="product-seller">Par ${p.sellerName || '—'} &nbsp; ${cond}</div>
              <div class="product-prices">
                <div class="price-block"><label>Min</label><div class="price">${fmt(p.priceMin)}</div></div>
                <div class="price-block"><label>Max</label><div class="price gold">${fmt(p.priceMax)}</div></div>
              </div>
            </div>
            <div class="product-footer">
              <span>Stock : ${p.stockQuantity ?? '—'}</span>
              <span class="tag">${p.category || '—'}</span>
            </div>
          </div>`;
      }).join('');
      app.innerHTML = `
        <div class="page">
          <div class="page-header">
            <h1>♥ Mes Favoris</h1>
            <p>${saved.length} article${saved.length > 1 ? 's' : ''} sauvegardé${saved.length > 1 ? 's' : ''}</p>
          </div>
          <div class="grid grid-3">${cards}</div>
        </div>`;
      setTimeout(() => { initScrollReveal(); initTilt(); }, 60);
    });
}

// ==================== QUICK VIEW ====================

function openQuickView(productId) {
  const p = S.products.find(x => x.id === productId);
  if (!p) { toast('Produit introuvable', 'error'); return; }

  const imgSrc = getProductImage(p);
  const cond   = conditionBadge(p.id);
  const wished = S.wishlist.has(productId);

  const modal = document.getElementById('quick-view-modal');
  modal.innerHTML = `
    <div class="qv-backdrop" onclick="closeQuickView()"></div>
    <div class="qv-panel">
      <button class="qv-close" onclick="closeQuickView()" title="Fermer">✕</button>
      <div class="qv-img">
        <img src="${imgSrc}" alt="${p.name}"
             onerror="this.style.display='none'">
        <div class="qv-img-overlay"></div>
        <button class="qv-wish ${wished ? 'active' : ''}" data-wish="${p.id}"
                onclick="toggleWishlist(${p.id})">♥</button>
      </div>
      <div class="qv-body">
        <div class="qv-brand">${p.brand || p.category || '—'}</div>
        <h2 class="qv-title">${p.name}</h2>
        <div class="qv-seller">Vendu par <span>${p.sellerName || '—'}</span> &nbsp; ${cond}</div>
        <div class="qv-prices">
          <div class="qv-price-block">
            <label>Prix minimum</label>
            <div class="qv-price">${fmt(p.priceMin)}</div>
          </div>
          <div class="qv-price-block">
            <label>Prix maximum</label>
            <div class="qv-price gold">${fmt(p.priceMax)}</div>
          </div>
        </div>
        <div class="qv-stock">Stock disponible : <strong>${p.stockQuantity ?? '—'}</strong> unité${(p.stockQuantity||0) > 1 ? 's' : ''}</div>
        <div class="qv-actions">
          <button class="btn btn-primary"
                  onclick="closeQuickView(); navigate('marche-decentralise', {productId: ${p.id}})">
            Lancer la négociation →
          </button>
          <button class="btn btn-ghost qv-wish-btn ${wished ? 'wished' : ''}"
                  onclick="toggleWishlist(${p.id})">
            ${wished ? '♥ Dans la wishlist' : '♡ Ajouter aux favoris'}
          </button>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== HIGH CONTRAST ====================

function toggleHighContrast() {
  const isHC = document.body.classList.toggle('high-contrast');
  localStorage.setItem('sa7_high_contrast', isHC ? '1' : '0');
  const label = document.getElementById('contrast-label');
  if (label) label.textContent = isHC ? 'Contraste normal' : 'Contraste élevé';
}

function initHighContrast() {
  if (localStorage.getItem('sa7_high_contrast') === '1') {
    document.body.classList.add('high-contrast');
    const label = document.getElementById('contrast-label');
    if (label) label.textContent = 'Contraste normal';
  }
}

// ==================== ANIMATIONS & EFFECTS ====================

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-up, .fade-left, .line-reveal').forEach(el => observer.observe(el));
}

function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) scale(1.025)`;
      el.style.transition = 'transform 0.1s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      el.style.transition = 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });
}

function initScrollProgress() {
  const fill = document.getElementById('scroll-progress-fill');
  const dot  = document.getElementById('scroll-progress-dot');
  if (!fill || !dot) return;

  let scrollTimer = null;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.min((window.scrollY / max) * 100, 100);
    fill.style.height = pct + '%';
    dot.style.top     = pct + '%';
    dot.classList.remove('paused');

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => dot.classList.add('paused'), 180);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Reset app padding when navigating away from hero page
function resetAppPadding() {
  const app = document.getElementById('app');
  if (app) app.style.paddingTop = '';
}

// ==================== FEATURE 1: CONVERGENCE CHART ====================
function drawConvergenceChart(negotiations, maxRounds) {
  const W = 600, H = 220;
  const PAD = { top: 18, right: 20, bottom: 32, left: 44 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  // Gather all prices for Y scale
  const allPrices = [];
  negotiations.forEach(n => {
    n.offers.forEach(o => allPrices.push(o.price));
    if (n.priceMin) allPrices.push(n.priceMin);
    if (n.priceMax) allPrices.push(n.priceMax);
  });
  if (!allPrices.length) return '';

  const yMin = Math.min(...allPrices) * 0.93;
  const yMax = Math.max(...allPrices) * 1.05;
  const xMax = maxRounds || Math.max(...negotiations.flatMap(n => n.offers.map(o => o.round || 1)));

  function xScale(r) { return PAD.left + ((r - 1) / Math.max(xMax - 1, 1)) * iW; }
  function yScale(v) { return PAD.top + iH - ((v - yMin) / (yMax - yMin)) * iH; }

  const COLORS = ['#C41230', '#C9A84C', '#7ECCE8'];

  let lines = '';
  let dots  = '';

  // Grid lines
  let gridLines = '';
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const v = yMin + (yMax - yMin) * (i / ySteps);
    const y = yScale(v);
    const kVal = Math.round(v / 1000);
    gridLines += `<line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
    gridLines += `<text x="${PAD.left - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#6b6b6b">${kVal}k</text>`;
  }

  // X axis labels
  let xLabels = '';
  const xStep = Math.max(1, Math.floor(xMax / 5));
  for (let r = 1; r <= xMax; r += xStep) {
    xLabels += `<text x="${xScale(r)}" y="${H - PAD.bottom + 14}" text-anchor="middle" font-size="9" fill="#6b6b6b">R${r}</text>`;
  }

  // priceMin / priceMax reference lines (use first nego)
  const refNego = negotiations[0];
  if (refNego && refNego.priceMin) {
    const yRef = yScale(refNego.priceMin);
    lines += `<line x1="${PAD.left}" y1="${yRef}" x2="${W - PAD.right}" y2="${yRef}" stroke="#C41230" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`;
  }
  if (refNego && refNego.priceMax) {
    const yRef = yScale(refNego.priceMax);
    lines += `<line x1="${PAD.left}" y1="${yRef}" x2="${W - PAD.right}" y2="${yRef}" stroke="#C9A84C" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`;
  }

  // Per-negotiation lines
  negotiations.forEach((n, ni) => {
    const col = COLORS[ni % COLORS.length];
    const buyerOffers  = n.offers.filter(o => o.side === 'buyer');
    const sellerOffers = n.offers.filter(o => o.side === 'seller');

    if (buyerOffers.length > 1) {
      const pts = buyerOffers.map(o => `${xScale(o.round || 1)},${yScale(o.price)}`).join(' ');
      lines += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" opacity="0.9"/>`;
    }
    if (sellerOffers.length > 1) {
      const pts = sellerOffers.map(o => `${xScale(o.round || 1)},${yScale(o.price)}`).join(' ');
      lines += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.75"/>`;
    }

    // Agreement dot
    if (n.status === 'AGREED' && n.finalPrice) {
      const lastRound = n.offers.length ? n.offers[n.offers.length - 1].round || 1 : 1;
      const cx = xScale(lastRound);
      const cy = yScale(n.finalPrice);
      dots += `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${col}" stroke-width="2"/>`;
      dots += `<circle cx="${cx}" cy="${cy}" r="2" fill="${col}"/>`;
    }
  });

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:var(--surface2);display:block">
    <rect width="${W}" height="${H}" fill="#181818"/>
    ${gridLines}
    <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${H - PAD.bottom}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="${PAD.left}" y1="${H - PAD.bottom}" x2="${W - PAD.right}" y2="${H - PAD.bottom}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    ${xLabels}
    ${lines}
    ${dots}
  </svg>`;
}

// ==================== FEATURE 3: AGENT REASONING ====================
function agentReasoning(stratKey, round, maxRounds, buyerPrice, sellerPrice, priceMin, priceMax) {
  const pct = round / maxRounds;
  const gap = Math.round((sellerPrice - buyerPrice) / 1000);
  const mid = Math.round((priceMin + priceMax) / 2 / 1000);

  if (stratKey === 'GREEDY') {
    if (pct < 0.30) {
      const abovePct = Math.round(((sellerPrice / priceMax) - 1) * 100);
      return `Phase d'ancrage agressif — maintien à ${abovePct}% au-dessus pour ancrer haut`;
    } else if (pct <= 0.65) {
      return `Résistance calculée (-3%/round) — écart restant : ${gap}k€`;
    } else {
      return `Round critique (${round}/${maxRounds}) — dernière concession avant rupture`;
    }
  } else if (stratKey === 'FRUGAL') {
    if (pct < 0.40) {
      return `Exploration prudente vers le point médian estimé (~${mid}k€)`;
    } else {
      const offerPct = Math.round(((sellerPrice / buyerPrice) - 1) * 100);
      return `Convergence stable — objectif accord à +${Math.max(0, offerPct)}% de l'offre courante`;
    }
  } else {
    // COOL_HEADED
    if (pct < 0.30) {
      return `Modélisation adversaire — observation des patterns (${round}/${maxRounds} rounds)`;
    } else if (pct <= 0.65) {
      const diff = Math.round(((sellerPrice - buyerPrice) / sellerPrice) * 100);
      return `Convergence calculée — offre à ${diff}% de la demande vendeur`;
    } else {
      const sacrifice = Math.round(((sellerPrice - buyerPrice) / 2 / 1000));
      return `Maximisation probabilité d'accord — sacrifice ${sacrifice}k€ marge pour conclure avant round ${maxRounds}`;
    }
  }
}

// ==================== FEATURE 2: COMPARATEUR DE STRATÉGIES ====================
function simulateNego(stratKey, priceMin, priceMax, buyerStart, rounds) {
  const strats = {
    GREEDY:       { sellerStart: priceMax * 1.30, sellerDrop: 0.03 },
    FRUGAL:       { sellerStart: priceMax * 1.10, sellerDrop: 0.06 },
    COOL_HEADED:  { sellerStart: priceMax * 1.15, sellerDrop: 0.05 },
  };
  const cfg = strats[stratKey] || strats.COOL_HEADED;
  let buyer  = buyerStart;
  let seller = cfg.sellerStart;
  const offers = [];

  for (let r = 1; r <= rounds; r++) {
    buyer  = Math.round(buyer * 1.04);
    seller = Math.round(seller * (1 - cfg.sellerDrop));
    offers.push({ side: 'buyer',  price: buyer,  round: r });
    offers.push({ side: 'seller', price: seller, round: r });
    if (buyer >= seller) {
      const finalPrice = Math.round((buyer + seller) / 2);
      return { offers, status: 'AGREED', finalPrice, round: r, priceMin, priceMax };
    }
  }
  return { offers, status: 'FAILED', finalPrice: null, round: rounds, priceMin, priceMax };
}

async function renderComparateur(params = {}) {
  const app = document.getElementById('app');
  const products = S.products.length ? S.products : await apiGetProducts();
  S.products = products;

  const productId = params.productId;
  const p = productId ? products.find(x => x.id == productId) : products[0];

  if (!p) {
    app.innerHTML = `<div class="page"><div class="empty-state"><p>Sélectionnez un produit</p></div></div>`;
    return;
  }

  const buyerStart = params.offer ? parseFloat(params.offer) : Math.round(p.priceMin * 0.88);
  const rounds = 8;

  const strategies = [
    { key: 'GREEDY',      label: 'Agressif',    color: '#E8203E', desc: 'Ancrage haut, concessions lentes' },
    { key: 'FRUGAL',      label: 'Conservateur', color: '#888888', desc: 'Prudent, descente régulière' },
    { key: 'COOL_HEADED', label: 'Adaptatif',   color: '#C41230', desc: 'Équilibré, convergence optimale' },
  ];

  const results = strategies.map(s => {
    const sim = simulateNego(s.key, p.priceMin, p.priceMax, buyerStart, rounds);
    const surplus = sim.finalPrice ? p.priceMax - sim.finalPrice : 0;
    const surplusPct = sim.finalPrice ? Math.round((surplus / p.priceMax) * 100) : 0;
    const negoData = [{ ...sim, sellerName: s.label, productName: p.name }];
    const chart = drawConvergenceChart(negoData, rounds);
    return { ...s, sim, surplus, surplusPct, chart };
  });

  const cols = results.map(r => `
    <div class="comp-col">
      <div class="comp-col-header" style="border-color:${r.color}">
        <div class="comp-badge" style="background:${r.color}">${r.label}</div>
        <div class="comp-desc">${r.desc}</div>
      </div>
      <div class="comp-chart">${r.chart}</div>
      <div class="comp-result ${r.sim.status === 'AGREED' ? 'comp-agreed' : 'comp-failed'}">
        ${r.sim.status === 'AGREED'
          ? `<div class="comp-res-price">${fmt(r.sim.finalPrice)}</div>
             <div class="comp-res-label">Accord — Round ${r.sim.round}</div>
             <div class="comp-res-surplus">+${fmt(r.surplus)} économisé (${r.surplusPct}%)</div>`
          : `<div class="comp-res-price fail">Échec</div>
             <div class="comp-res-label">Aucun accord en ${rounds} rounds</div>`
        }
      </div>
    </div>`).join('');

  app.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div class="section-label">Analyse Stratégique</div>
        <h1>Comparateur de Stratégies</h1>
        <p>${p.name} — Budget acheteur de départ : ${fmt(buyerStart)}</p>
      </div>
      <div class="comparateur-grid">${cols}</div>
      <div style="margin-top:24px">
        <button class="btn btn-secondary btn-sm" onclick="navigate('marche-decentralise', {productId:${p.id}})">← Retour à la négociation</button>
      </div>
    </div>`;
}
window.renderComparateur = renderComparateur;

// ==================== FEATURE 4: DASHBOARD ANALYTIQUE ====================
async function renderDashboard() {
  const app = document.getElementById('app');

  let negos = [];
  if (S.activeAgent && S.activeAgent.id) {
    try {
      const data = await apiGetBuyerNegos(S.activeAgent.id);
      negos = data.content || data || [];
    } catch(e) { negos = []; }
  }

  const centralise = JSON.parse(localStorage.getItem('sa7_centralise_history') || '[]');
  const agreed     = negos.filter(n => n.status === 'AGREED');
  const totalTx    = agreed.length + centralise.length;
  const totalVol   = agreed.reduce((s,n) => s + (n.finalPrice||0), 0) + centralise.reduce((s,t) => s + (t.price||0), 0);
  const surplus    = agreed.reduce((s,n) => s + Math.max(0,(n.priceMax||0)-(n.finalPrice||0)), 0);
  const avgSurplusPct = agreed.length ? Math.round((surplus / agreed.reduce((s,n) => s + (n.priceMax||0), 0)) * 100) : 0;
  const bestDeal   = agreed.length ? agreed.reduce((best,n) => {
    const pct = n.priceMax ? ((n.priceMax - n.finalPrice) / n.priceMax) : 0;
    const bestPct = best.priceMax ? ((best.priceMax - best.finalPrice) / best.priceMax) : 0;
    return pct > bestPct ? n : best;
  }) : null;

  // Bar chart: strategy success rates
  const barData = [
    { label: 'COOL_HEADED', name: 'Adaptatif',    pct: 78, col: '#C41230' },
    { label: 'FRUGAL',      name: 'Conservateur', pct: 65, col: '#888888' },
    { label: 'GREEDY',      name: 'Agressif',     pct: 42, col: '#E8203E' },
  ];
  const bW = 400, bH = 160;
  const bPad = { top: 24, right: 20, bottom: 40, left: 20 };
  const barW  = 60, barGap = 40;
  const totalBarW = barData.length * (barW + barGap) - barGap;
  const startX    = (bW - totalBarW) / 2;
  let barSvg = `<svg viewBox="0 0 ${bW} ${bH}" style="width:100%;height:auto;display:block;background:#181818">`;
  barData.forEach((b, i) => {
    const x     = startX + i * (barW + barGap);
    const barH2 = ((b.pct / 100) * (bH - bPad.top - bPad.bottom));
    const y     = bH - bPad.bottom - barH2;
    barSvg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH2}" fill="${b.col}" opacity="0.85"/>`;
    barSvg += `<text x="${x + barW/2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="${b.col}" font-weight="600">${b.pct}%</text>`;
    barSvg += `<text x="${x + barW/2}" y="${bH - bPad.bottom + 14}" text-anchor="middle" font-size="9" fill="#6b6b6b">${b.name}</text>`;
  });
  barSvg += '</svg>';

  // Line chart: centralise transactions
  let lineSvg = '';
  const last10 = centralise.slice(-10);
  if (last10.length < 2) {
    lineSvg = `<div class="dash-empty-chart">Lancez une enchère centralisée pour voir les données</div>`;
  } else {
    const lW = 500, lH = 140;
    const lPad = { top: 16, right: 16, bottom: 32, left: 56 };
    const prices = last10.map(t => t.price);
    const pMin = Math.min(...prices) * 0.92;
    const pMax = Math.max(...prices) * 1.06;
    function lx(i) { return lPad.left + (i / (last10.length - 1)) * (lW - lPad.left - lPad.right); }
    function ly(v) { return lPad.top + (lH - lPad.top - lPad.bottom) - ((v - pMin) / (pMax - pMin)) * (lH - lPad.top - lPad.bottom); }
    let pts = last10.map((t, i) => `${lx(i)},${ly(t.price)}`).join(' ');
    let gridL = '';
    for (let i = 0; i <= 3; i++) {
      const v = pMin + (pMax - pMin) * (i / 3);
      const y = ly(v);
      gridL += `<line x1="${lPad.left}" y1="${y}" x2="${lW - lPad.right}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
      gridL += `<text x="${lPad.left - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#6b6b6b">${Math.round(v/1000)}k</text>`;
    }
    let circlesDash = last10.map((t, i) => `<circle cx="${lx(i)}" cy="${ly(t.price)}" r="3" fill="#C9A84C"/>`).join('');
    lineSvg = `<svg viewBox="0 0 ${lW} ${lH}" style="width:100%;height:auto;display:block;background:#181818">
      <rect width="${lW}" height="${lH}" fill="#181818"/>
      ${gridL}
      <polyline points="${pts}" fill="none" stroke="#C9A84C" stroke-width="2"/>
      ${circlesDash}
    </svg>`;
  }

  app.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📊 Tableau de Bord Analytique</h1>
        <p>Vue d'ensemble des négociations et performances</p>
      </div>

      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-value">${totalTx}</div></div>
        <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold">${totalVol ? fmt(totalVol) : '—'}</div></div>
        <div class="stat-card"><div class="stat-label">Meilleur Accord</div><div class="stat-value text-crimson">${bestDeal ? fmt(bestDeal.finalPrice) : '—'}</div></div>
        <div class="stat-card"><div class="stat-label">Surplus Moyen</div><div class="stat-value text-green">${avgSurplusPct ? avgSurplusPct + '%' : '—'}</div></div>
      </div>

      <div class="dashboard-charts">
        <div class="dash-chart-section">
          <div class="dash-chart-title">Taux de succès par stratégie</div>
          ${barSvg}
        </div>
        <div class="dash-chart-section">
          <div class="dash-chart-title">Volume des transactions Centralisé</div>
          ${lineSvg}
        </div>
      </div>

      ${bestDeal ? `
      <div class="dash-best-deal">
        <div class="dash-chart-title" style="margin-bottom:12px">Meilleure négociation</div>
        <div class="card" style="max-width:500px">
          <div style="font-family:var(--font-display);font-style:italic;font-size:18px;margin-bottom:8px">${bestDeal.productName || '—'}</div>
          <div style="display:flex;gap:24px;font-size:13px">
            <span>Vendeur : <strong>${bestDeal.sellerName || '—'}</strong></span>
            <span>Prix : <strong style="color:var(--gold)">${fmt(bestDeal.finalPrice)}</strong></span>
            <span>Économie : <strong style="color:#4ade80">+${fmt((bestDeal.priceMax||0) - (bestDeal.finalPrice||0))}</strong></span>
          </div>
        </div>
      </div>` : ''}
    </div>`;
}

// ==================== FEATURE 5: EXPORT CSV ====================
function exportHistoriqueCSV(negos, centralise) {
  const rows = [['#','Produit','Vendeur','Type','Prix Final','Rounds','Statut','Date']];
  negos.forEach((n,i) => rows.push([n.id, n.productName||'—', n.sellerName||'—', 'Décentralisé', n.finalPrice||'', n.offers?.length||'', n.status, n.startedAt ? new Date(n.startedAt).toLocaleDateString('fr-FR') : '']));
  centralise.forEach((t,i) => rows.push(['C'+(i+1), t.product||'—', t.sellerShort||'—', 'Centralisé', t.price||'', t.rounds||'', 'AGREED', t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '']));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='historique-negociations.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Export CSV téléchargé', 'success');
}
window.exportHistoriqueCSV = exportHistoriqueCSV;

// ==================== FEATURE 7: REPLAY MODAL ====================
function showReplayModal(productName, sellerName, priceMin, priceMax, finalPrice, rounds) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  // Generate synthetic convergence data
  const syntheticNego = {
    offers: [],
    status: 'AGREED',
    finalPrice,
    priceMin,
    priceMax,
    sellerName,
    productName,
  };

  const roundCount = rounds || 5;
  const buyerStart  = Math.round(priceMin * 0.85);
  const sellerStart = Math.round(priceMax * 1.10);
  for (let r = 1; r <= roundCount; r++) {
    const t = (r - 1) / (roundCount - 1);
    const buyerP  = Math.round(buyerStart  + (finalPrice - buyerStart)  * t);
    const sellerP = Math.round(sellerStart + (finalPrice - sellerStart) * t);
    syntheticNego.offers.push({ side: 'buyer',  price: buyerP,  round: r });
    syntheticNego.offers.push({ side: 'seller', price: sellerP, round: r });
  }

  const chart = drawConvergenceChart([syntheticNego], roundCount);

  modal.innerHTML = `
    <div class="qv-backdrop" onclick="closeQuickView()"></div>
    <div class="qv-panel" style="grid-template-columns:1fr;max-width:700px">
      <button class="qv-close" onclick="closeQuickView()" title="Fermer">✕</button>
      <div class="qv-body" style="padding:36px 40px">
        <div class="qv-brand">Replay de Négociation</div>
        <h2 class="qv-title">${productName}</h2>
        <div class="qv-seller">Vendeur : <span>${sellerName}</span></div>
        <div class="conv-chart-wrap" style="margin:20px 0">
          <div class="conv-chart-title">Convergence des Offres — ${roundCount} rounds</div>
          ${chart}
          <div class="conv-legend">
            <span class="conv-leg-solid">— acheteur</span>
            <span class="conv-leg-dash">- - vendeur</span>
            <span class="conv-leg-dot">⊙ accord</span>
          </div>
        </div>
        <div style="display:flex;gap:24px;font-size:13px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <span>Prix final : <strong style="color:var(--gold)">${fmt(finalPrice)}</strong></span>
          <span>Économie : <strong style="color:#4ade80">+${fmt(priceMax - finalPrice)}</strong></span>
          <span>Rounds : <strong>${roundCount}</strong></span>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.showReplayModal = showReplayModal;

// ==================== INIT ====================
window.navigate         = navigate;
window.openQuickView    = openQuickView;
window.closeQuickView   = closeQuickView;
window.toggleWishlist   = toggleWishlist;
window.toggleHighContrast = toggleHighContrast;

// Patch navigate: add page transition + cleanup
const _origNavigate = navigate;
window.navigate = function(page, params) {
  // Clear hero interval if exists
  const app = document.getElementById('app');
  if (app && app._heroInterval) {
    clearInterval(app._heroInterval);
    app._heroInterval = null;
  }
  if (page !== 'accueil') resetAppPadding();

  pageTransition(() => _origNavigate(page, params));
};

document.addEventListener('DOMContentLoaded', () => {
  initHighContrast();
  initCursor();
  initSwingBar();
  updateWishlistBadge();

  // Close quick view on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeQuickView();
  });

  initPreloader(() => {
    updateNavAgent();
    initScrollProgress();
    _origNavigate('accueil');
    setTimeout(() => { initScrollReveal(); initTilt(); initCounters(); }, 300);
  });
});
