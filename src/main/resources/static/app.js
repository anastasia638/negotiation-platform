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
const PRODUCT_IMAGES = {
  'Chanel Classic Flap Vintage':       'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85',
  'Louis Vuitton Neverfull MM':        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=85',
  'Hermès Birkin 30':                  'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=85',
  'Prada Re-Edition 2000':             'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&q=85',
  'Balenciaga City Bag':               'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85',
  'Rolex Datejust 36':                 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=85',
  'Cartier Tank Française':            'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=85',
  'Hermès Cape Cod Watch':             'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
  'Dior Bar Jacket':                   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
  'Gucci Silk Maxi Dress':             'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=85',
  'Chanel No.5 Parfum 100ml':          'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=85',
  'Christian Louboutin Pigalle 120':   'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85',
};

const CATEGORY_IMAGES = {
  bags:     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85',
  watches:  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=85',
  clothing: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
  perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=85',
  shoes:    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85',
  default:  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
};

// Hero background images (luxury fashion slideshow)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=90',  // fashion model dark
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=90',     // Chanel bag
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&q=90',  // luxury watch
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90',  // runway fashion
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
  };

  const fn = pages[page];
  if (fn) {
    Promise.resolve(fn(params)).finally(() => {
      setTimeout(() => { initScrollReveal(); initTilt(); }, 80);
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
          <div class="hero-label">Marketplace · Intelligence Artificielle · Luxe</div>
          <h1 class="hero-title">SA7</h1>
          <p class="hero-sub">Luxury Agents — Négociation Automatique</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" onclick="document.getElementById('agents-section').scrollIntoView({behavior:'smooth'})">Choisir un agent</button>
            <button class="btn btn-outline btn-lg" onclick="navigate('marketplace')">Explorer le Marketplace</button>
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
          <span class="ticker-text">SA7 Luxury Agents &nbsp;•&nbsp; Négociation Automatique &nbsp;•&nbsp; Marché Centralisé &nbsp;•&nbsp; Marché Décentralisé &nbsp;•&nbsp; Achat Groupé &nbsp;•&nbsp; Enchère Double &nbsp;•&nbsp; Protocole Alternating-Offer &nbsp;•&nbsp; Chanel &nbsp;•&nbsp; Hermès &nbsp;•&nbsp; Rolex &nbsp;•&nbsp; Dior &nbsp;•&nbsp; Louis Vuitton &nbsp;•&nbsp;</span>
          <span class="ticker-text">SA7 Luxury Agents &nbsp;•&nbsp; Négociation Automatique &nbsp;•&nbsp; Marché Centralisé &nbsp;•&nbsp; Marché Décentralisé &nbsp;•&nbsp; Achat Groupé &nbsp;•&nbsp; Enchère Double &nbsp;•&nbsp; Protocole Alternating-Offer &nbsp;•&nbsp; Chanel &nbsp;•&nbsp; Hermès &nbsp;•&nbsp; Rolex &nbsp;•&nbsp; Dior &nbsp;•&nbsp; Louis Vuitton &nbsp;•&nbsp;</span>
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
        return catOk && brandOk && searchOk;
      });
    }

    function productGrid(list) {
      if (!list.length) return '<div class="empty-state"><div class="empty-icon">🔍</div><p>Aucun produit trouvé</p></div>';
      return `<div class="grid grid-3">${list.map((p, i) => {
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
        <div class="page">
          <div class="page-header">
            <h1>🔀 Marché Décentralisé</h1>
            <p>Négociation exclusive — 1 Acheteur vs plusieurs Vendeurs de luxe</p>
          </div>

          <div class="card" style="max-width:640px">
            <h3 style="margin-bottom:20px;color:var(--text2)">⚙️ Configuration</h3>

            <div class="form-group">
              <label>Agent Acheteur</label>
              <input type="text" value="${S.activeAgent.name} — ${S.activeAgent.strategy}" disabled style="opacity:0.7">
            </div>

            <div class="form-group">
              <label>Produit à négocier</label>
              <select id="product-select">
                <option value="">— Sélectionner un produit —</option>
                ${productOptions}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Votre offre initiale (€)</label>
                <input type="number" id="initial-offer" placeholder="ex: 900" min="1">
              </div>
              <div class="form-group">
                <label>Rounds maximum</label>
                <input type="number" id="max-rounds" value="${S.negoMaxRounds}" min="1" max="20">
              </div>
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%" onclick="startDecentralise()">
              ▶ Démarrer la négociation
            </button>
          </div>
        </div>`;

      if (S.negoProduct) {
        document.getElementById('product-select').value = S.negoProduct.id;
        document.getElementById('initial-offer').value = Math.round(S.negoProduct.priceMin * 0.9);
      }
    }

    renderSetup();

    window.startDecentralise = async () => {
      const productId = document.getElementById('product-select').value;
      const offer     = parseFloat(document.getElementById('initial-offer').value);
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

      const vendorCards = S.negoNegotiations.map(n => {
        const offerBubbles = n.offers.map(o => `
          <div class="offer-bubble ${o.side} ${o.side === 'seller' && o.rejected ? 'rejected' : ''}">
            <div class="offer-price">${fmt(o.price)}</div>
            <div class="offer-label">${o.side === 'buyer' ? '🛒 Acheteur — Round ' + o.round : '🏪 ' + n.sellerName + ' — Round ' + o.round}</div>
          </div>`).join('');

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
      const resultSection = doneAll ? `
        <div class="${agreed.length > 0 ? 'result-card' : 'result-card failed'}" style="margin-top:24px">
          <div class="result-icon">${agreed.length > 0 ? '✅' : '❌'}</div>
          <div class="result-title ${agreed.length > 0 ? 'success' : 'fail'}">
            ${agreed.length > 0 ? agreed.length + ' accord(s) trouvé(s) !' : 'Aucun accord'}
          </div>
          ${agreed.map(n => `<div style="font-size:14px;margin-top:8px">• ${n.sellerName} — <strong style="color:var(--gold)">${fmt(n.finalPrice)}</strong> — ${n.offerCount || '—'} round(s)</div>`).join('')}
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

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>🏛 Marché Centralisé</h1>
          <p>Enchère double — Plusieurs acheteurs et vendeurs en simultané</p>
        </div>

        <div class="card" style="max-width:800px">
          <h3 style="margin-bottom:20px;color:var(--text2)">⚙️ Configuration des stratégies</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Catégorie produit</label>
              <select id="cc-cat">
                ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Nombre d'acheteurs</label>
              <select id="cc-nb-buyers">
                ${[2,3,4,5].map(n => `<option value="${n}" ${n===3?'selected':''}>${n}</option>`).join('')}
              </select>
            </div>
          </div>

          <div id="strategy-grid" style="margin:16px 0">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <h4 style="color:var(--text2);font-size:13px;margin-bottom:12px">ACHETEURS</h4>
                ${buyers.slice(0,3).map((u, i) => {
                  const p = AGENT_PROFILES[i] || AGENT_PROFILES[0];
                  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:13px">
                    <span>${u.name}</span>
                    <select style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:12px">
                      <option ${p.strategyKey==='COOL_HEADED'?'selected':''}>Adaptatif</option>
                      <option ${p.strategyKey==='GREEDY'?'selected':''}>Agressif</option>
                      <option ${p.strategyKey==='FRUGAL'?'selected':''}>Conservateur</option>
                    </select>
                  </div>`;
                }).join('')}
              </div>
              <div>
                <h4 style="color:var(--text2);font-size:13px;margin-bottom:12px">VENDEURS</h4>
                ${sellers.map((u, i) => {
                  const strats = ['Adaptatif','Flexible','Ferme'];
                  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:13px">
                    <span>${u.name}</span>
                    <select style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:12px">
                      <option>${strats[i % strats.length]}</option>
                      <option>Adaptatif</option>
                      <option>Ferme</option>
                    </select>
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" style="width:100%" onclick="runCentralise()">▶ Démarrer</button>
        </div>

        <div id="centralise-result"></div>
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
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;padding:8px 12px;background:var(--white);border-left:3px solid var(--gold)">
              <span style="color:var(--grey);min-width:70px">Round ${tx.round}</span>
              <span style="font-weight:600">${tx.buyerShort}</span>
              <span style="color:var(--grey)">→</span>
              <span style="font-weight:600">${tx.sellerShort}</span>
              <span style="color:var(--grey)">:</span>
              <span style="color:var(--gold);font-weight:700;margin-left:auto">${fmt(tx.price)}</span>
            </div>`).join('');
        }

        // Live bids/asks table in step-content
        document.getElementById('step-content').innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px">
            <div>
              <div style="font-size:11px;letter-spacing:.1em;color:var(--grey);margin-bottom:8px">OFFRES ACHETEURS</div>
              ${currentBids.filter(b=>!b.matched).map(b=>`
                <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--cream2);margin-bottom:4px">
                  <span>${b.buyer}</span><span style="color:var(--gold);font-weight:600">${fmt(b.bid)}</span>
                </div>`).join('') || '<div style="color:var(--grey);padding:8px">Tous les acheteurs ont conclu</div>'}
            </div>
            <div>
              <div style="font-size:11px;letter-spacing:.1em;color:var(--grey);margin-bottom:8px">DEMANDES VENDEURS</div>
              ${currentAsks.map((a,i)=>`
                <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--cream2);margin-bottom:4px;${a.matched?'opacity:.4;text-decoration:line-through':''}">
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

    const totalVol  = negos.filter(n=>n.status==='AGREED').reduce((s,n) => s + (n.finalPrice || 0), 0);
    const avgPrice  = negos.filter(n=>n.status==='AGREED').length
      ? Math.round(totalVol / negos.filter(n=>n.status==='AGREED').length) : 0;
    const surplus   = negos.filter(n=>n.status==='AGREED').reduce((s,n) => {
      return s + Math.max(0, (n.priceMax || 0) - (n.finalPrice || 0));
    }, 0);

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>📋 Historique des Négociations</h1>
          <p>Agent : ${S.activeAgent.name}</p>
        </div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-value">${negos.filter(n=>n.status==='AGREED').length}</div></div>
          <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold">${fmt(totalVol)}</div></div>
          <div class="stat-card"><div class="stat-label">Prix Moyen</div><div class="stat-value">${fmt(avgPrice)}</div></div>
          <div class="stat-card"><div class="stat-label">Surplus Moyen</div><div class="stat-value text-green">${negos.filter(n=>n.status==='AGREED').length ? '+' + fmt(Math.round(surplus / Math.max(1, negos.filter(n=>n.status==='AGREED').length))) : '—'}</div></div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Produit</th>
                <th>Vendeur</th>
                <th>Type</th>
                <th>Prix Final</th>
                <th>Rounds</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${negos.length === 0 ? `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:40px">Aucune négociation</td></tr>` :
                negos.map(n => `<tr>
                  <td class="text-muted">#${n.id}</td>
                  <td>${n.productName || '—'}</td>
                  <td>${n.sellerName || '—'}</td>
                  <td><span class="tag">Décentralisé</span></td>
                  <td class="${n.finalPrice ? 'text-gold font-bold' : 'text-muted'}">${fmt(n.finalPrice)}</td>
                  <td>${n.offers ? n.offers.length : '—'}</td>
                  <td>${statusBadge(n.status)}</td>
                  <td class="text-muted">${n.startedAt ? new Date(n.startedAt).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
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

// ==================== ANIMATIONS & EFFECTS ====================

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
      el.style.transition = 'transform 0.1s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });
}

// Reset app padding when navigating away from hero page
function resetAppPadding() {
  const app = document.getElementById('app');
  if (app) app.style.paddingTop = '';
}

// ==================== INIT ====================
window.navigate = navigate;

// Patch navigate to reset padding on non-accueil pages
const _origNavigate = navigate;
window.navigate = function(page, params) {
  if (page !== 'accueil') resetAppPadding();
  // Clear hero interval if exists
  const app = document.getElementById('app');
  if (app && app._heroInterval) {
    clearInterval(app._heroInterval);
    app._heroInterval = null;
  }
  _origNavigate(page, params);
};

document.addEventListener('DOMContentLoaded', () => {
  updateNavAgent();
  window.navigate('accueil');
});
