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

// ==================== STRATÉGIE ACHETEUR — concession adaptative ====================
// Calcule la prochaine offre selon la stratégie réelle de l'agent actif.
// FRUGAL : petits pas (+2-3%), ne cède qu'un tiers de l'écart
// COOL_HEADED : midpoint classique (+5%)
// GREEDY : grands sauts (+8-10%), cède 70 % de l'écart pour conclure vite
function buyerConcession(current, lowestCounter) {
  const strat = S.activeAgent?.strategyKey || 'COOL_HEADED';
  if (strat === 'FRUGAL') {
    if (lowestCounter && lowestCounter <= current * 1.12)
      return Math.round(current + (lowestCounter - current) * 0.28);
    return Math.round(current * 1.025);
  } else if (strat === 'GREEDY') {
    if (lowestCounter && lowestCounter <= current * 1.18)
      return Math.round(current + (lowestCounter - current) * 0.72);
    return Math.round(current * 1.09);
  } else {
    // COOL_HEADED
    if (lowestCounter && lowestCounter <= current * 1.07)
      return Math.round((current + lowestCounter) / 2);
    return Math.round(current * 1.05);
  }
}

// ==================== STATS — enregistrement réel par stratégie ====================
function recordNegoStat(result /* 'AGREED' | 'FAILED' */) {
  const strat = S.activeAgent?.strategyKey || 'COOL_HEADED';
  const stats = JSON.parse(localStorage.getItem('sa7_strat_stats') || '[]');
  stats.push({ strat, result, ts: Date.now() });
  localStorage.setItem('sa7_strat_stats', JSON.stringify(stats.slice(-500)));
}

// ==================== RATING — notation post-accord ====================
function showRatingPrompt(context /* {product, seller, finalPrice, market} */) {
  const existing = document.getElementById('rating-prompt');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'rating-prompt';
  el.className = 'rating-prompt';
  el.innerHTML = `
    <div class="rating-prompt-inner">
      <div class="rating-title">Comment s'est passée cette négociation ?</div>
      <div class="rating-sub">${context.product} · ${context.seller} · <strong>${fmt(context.finalPrice)}</strong></div>
      <div class="rating-stars" id="rating-stars">
        ${[1,2,3,4,5].map(n=>`<span class="rating-star" data-v="${n}" onclick="submitRating(${n},'${context.product}','${context.seller}',${context.finalPrice},'${context.market}')">★</span>`).join('')}
      </div>
      <div class="rating-hint">Cliquez sur une étoile pour noter</div>
      <button class="rating-skip" onclick="document.getElementById('rating-prompt')?.remove()">Ignorer</button>
    </div>`;

  // Hover effect
  el.querySelectorAll('.rating-star').forEach((s, i) => {
    s.addEventListener('mouseenter', () => {
      el.querySelectorAll('.rating-star').forEach((x, j) => x.classList.toggle('lit', j <= i));
    });
    s.addEventListener('mouseleave', () => {
      el.querySelectorAll('.rating-star').forEach(x => x.classList.remove('lit'));
    });
  });
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 50);
}

window.submitRating = function(value, product, seller, finalPrice, market) {
  const ratings = JSON.parse(localStorage.getItem('sa7_ratings') || '[]');
  ratings.push({ value, product, seller, finalPrice, market, date: new Date().toISOString() });
  localStorage.setItem('sa7_ratings', JSON.stringify(ratings.slice(-200)));
  const el = document.getElementById('rating-prompt');
  if (el) {
    el.querySelectorAll('.rating-star').forEach((s, i) => s.classList.toggle('lit', i < value));
    el.querySelector('.rating-hint').textContent = 'Merci pour votre avis !';
    el.querySelector('.rating-skip').textContent = 'Fermer';
    setTimeout(() => el.remove(), 1800);
  }
  toast(`Note enregistrée : ${'★'.repeat(value)}${'☆'.repeat(5-value)}`, 'success');
};

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

async function apiAutoRespond(negoId, responderId, strategy, maxRounds = 10) {
  return post(`/api/negotiations/${negoId}/auto-respond?responderId=${responderId}&strategy=${strategy}&maxRounds=${maxRounds}`);
}

async function apiGetNego(negoId) {
  return get(`/api/negotiations/${negoId}`);
}

async function apiGetBuyerNegos(buyerId) {
  return get(`/api/negotiations/buyer/${buyerId}?page=0&size=50`);
}

async function apiAcceptOffer(negoId, offerId) {
  return patch(`/api/negotiations/${negoId}/offers/${offerId}/accept`);
}

async function apiRejectOffer(negoId, offerId) {
  return patch(`/api/negotiations/${negoId}/offers/${offerId}/reject`);
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
    'negociation-1v1':   renderNegociation1v1,
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
      const grid = document.getElementById('product-grid');
      grid.innerHTML = productGrid(fp);
      grid.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
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
      const catMeta = {
        bags:     { icon: '👜', label: 'Sacs' },
        watches:  { icon: '⌚', label: 'Montres' },
        clothing: { icon: '👗', label: 'Vêtements' },
        perfumes: { icon: '🌸', label: 'Parfums' },
        shoes:    { icon: '👠', label: 'Chaussures' }
      };
      const categories = [...new Set(products.map(p => p.category))];

      app.innerHTML = `
        <div class="cfg-wrap">
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
          <div class="cfg-body">
            <div class="cfg-card">
              <div class="cfg-agent-row">
                <div class="cfg-agent-dot-wrap"><span class="agent-dot"></span></div>
                <div class="cfg-agent-info">
                  <div class="cfg-agent-name">${S.activeAgent.name}</div>
                  <div class="cfg-agent-meta">Budget · ${fmt(S.activeAgent.budget || 0)}</div>
                </div>
                <div class="cfg-strategy-badge cfg-strat-${(S.activeAgent.strategyKey||'').toLowerCase()}">${S.activeAgent.strategy}</div>
              </div>
              <div class="cfg-sep"></div>
              <div class="cfg-field">
                <label class="cfg-label">Catégorie</label>
                <div class="cat-chips" id="cat-chips">
                  ${categories.map(c => `<button class="cat-chip ${c === (S.negoProduct?.category || categories[0]) ? 'active' : ''}" onclick="selectCat('${c}')">${catMeta[c]?.icon || '◆'} ${catMeta[c]?.label || c}</button>`).join('')}
                </div>
              </div>
              <div class="cfg-field">
                <label class="cfg-label">Article <span id="cat-count" style="color:var(--text3);font-size:11px;font-weight:400;letter-spacing:0"></span></label>
                <div class="product-carousel" id="product-carousel"></div>
              </div>
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
              <div class="cfg-info-box">
                <span class="cfg-info-icon">ℹ</span>
                <span>Le système négocie simultanément avec <strong>tous les vendeurs</strong> de la catégorie — mettez-les en concurrence pour le meilleur prix.</span>
              </div>
              <button class="cfg-cta" onclick="startDecentralise()">
                <span class="cfg-cta-gem">◆</span>
                Lancer la négociation
                <span class="cfg-cta-arrow">→</span>
              </button>
              <div id="cfg-comparateur-btn" style="display:none;margin-top:12px">
                <button class="btn btn-secondary" style="width:100%" onclick="window._launchComparateur && window._launchComparateur()">⚖ Comparer les stratégies →</button>
              </div>
            </div>
          </div>
        </div>`;

      window.selectCat = (cat) => {
        document.querySelectorAll('.cat-chip').forEach(c =>
          c.classList.toggle('active', c.textContent.trim().startsWith(catMeta[cat]?.icon || cat))
        );
        const catProds = products.filter(p => p.category === cat);
        const countEl = document.getElementById('cat-count');
        if (countEl) countEl.textContent = `(${catProds.length} article${catProds.length > 1 ? 's' : ''})`;
        const carousel = document.getElementById('product-carousel');
        if (!carousel) return;

        // Build cards once, duplicate for infinite loop (like the ticker)
        const makeCard = (p, withId) => `
          <div class="pcarousel-card ${S.negoProduct?.id == p.id ? 'pcarousel-selected' : ''}"
               onclick="selectProduct(${p.id})"
               data-pid="${p.id}"
               ${withId ? `id="pc-${p.id}"` : ''}>
            <div class="pcarousel-img" style="background-image:url('${getProductImage(p)}')"></div>
            <div class="pcarousel-body">
              <div class="pcarousel-brand">${p.brand || cat}</div>
              <div class="pcarousel-name">${p.name}</div>
              <div class="pcarousel-range">${fmt(p.priceMin)} — ${fmt(p.priceMax)}</div>
            </div>
            <div class="pcarousel-check">✓</div>
          </div>`;

        const cards     = catProds.map(p => makeCard(p, true)).join('');
        const cardsDupe = catProds.map(p => makeCard(p, false)).join('');
        // Adjust speed: more cards = slower scroll
        const duration = Math.max(18, catProds.length * 4);
        carousel.innerHTML = `<div class="pcarousel-track" style="animation-duration:${duration}s">${cards}${cardsDupe}</div>`;
      };

      window.selectProduct = (pid) => {
        const p = products.find(x => x.id == pid);
        if (!p) return;
        S.negoProduct = p;
        // Update all copies (original + duplicate in infinite loop)
        document.querySelectorAll('.pcarousel-card').forEach(c => c.classList.remove('pcarousel-selected'));
        document.querySelectorAll(`[data-pid="${pid}"]`).forEach(c => c.classList.add('pcarousel-selected'));
        const offerInput = document.getElementById('initial-offer');
        if (offerInput) {
          offerInput.value = Math.round(p.priceMax * 0.78).toLocaleString('fr-FR');
          updatePriceEstimate();
        }
        const compBtn = document.getElementById('cfg-comparateur-btn');
        if (compBtn) compBtn.style.display = 'block';
        window._launchComparateur = () => {
          const offer = document.getElementById('initial-offer')?.value;
          navigate('comparateur', { productId: p.id, offer: offer || Math.round(p.priceMin * 0.88) });
        };
      };

      window.updatePriceEstimate = () => {
        if (!S.negoProduct) return;
        const p = S.negoProduct;
        const estimateEl = document.getElementById('cfg-estimate');
        if (!estimateEl) return;
        const userOffer = parseFloat(String(document.getElementById('initial-offer')?.value || '0').replace(/\s/g,'').replace(',','.')) || 0;
        const goodOffer = Math.round(p.priceMax * 0.78);
        const estimate  = Math.round(p.priceMin * 0.95 + p.priceMax * 0.35);
        const strategy  = S.activeAgent ? S.activeAgent.strategy : 'Adaptatif';
        const pct       = userOffer > 0 ? Math.round((userOffer / p.priceMax) * 100) : null;
        estimateEl.style.display = 'block';
        if (userOffer > 0 && userOffer < p.priceMin * 0.6) {
          estimateEl.innerHTML = `⚠️ Offre trop basse (${pct}% du max) — refus probable. Recommandé : <strong>${goodOffer.toLocaleString('fr-FR')} €</strong>`;
          estimateEl.style.borderLeftColor = 'var(--crimson)';
          estimateEl.style.background = 'rgba(196,18,48,0.08)';
          estimateEl.style.color = 'var(--crimson2)';
        } else if (userOffer > 0 && userOffer < p.priceMin) {
          estimateEl.innerHTML = `⚠️ Offre inférieure au minimum (${fmt(p.priceMin)}) — risque d'échec.`;
          estimateEl.style.borderLeftColor = '#C9A84C';
          estimateEl.style.background = 'rgba(201,168,76,0.08)';
          estimateEl.style.color = 'var(--gold)';
        } else {
          const pctStr = pct !== null ? ` (${pct}% du max)` : '';
          estimateEl.innerHTML = `◆ Accord probable autour de <strong>${estimate.toLocaleString('fr-FR')} €</strong>${pctStr} · ${strategy}`;
          estimateEl.style.borderLeftColor = 'var(--gold)';
          estimateEl.style.background = 'var(--gold-dim)';
          estimateEl.style.color = 'var(--gold)';
        }
      };

      selectCat(S.negoProduct?.category || categories[0]);
      if (S.negoProduct) selectProduct(S.negoProduct.id);
    }

    renderSetup();

    window.startDecentralise = async () => {
      if (!S.negoProduct) { toast('Sélectionnez un article', 'error'); return; }
      const offer = parseFloat(String(document.getElementById('initial-offer')?.value || '').replace(/\s/g, '').replace(',', '.'));
      const maxR  = parseInt(document.getElementById('max-rounds')?.value) || 10;

      if (!offer || offer <= 0) {
        toast('Entrez une offre initiale valide', 'error');
        return;
      }
      S.negoMaxRounds = maxR;
      S.negoRound     = 0;
      S.negoNegotiations = [];

      app.innerHTML = loader();

      try {
        // Re-login pour garantir un token frais
        try {
          const auth = await apiLogin(S.activeAgent.email, 'password');
          S.token = auth.token;
          localStorage.setItem('sa7_token', auth.token);
        } catch(loginErr) {
          app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">🔐</div><p>Session expirée — veuillez re-sélectionner votre agent depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
          return;
        }

        // Resolve buyer id (null si agent custom)
        let buyerId = S.activeAgent.id;
        if (!buyerId) {
          const allUsers = await apiGetUsers();
          S.users = allUsers;
          const matched = allUsers.find(u => u.email === S.activeAgent.email);
          if (!matched) {
            app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Agent introuvable en base — sélectionnez un agent acheteur depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
            return;
          }
          buyerId = matched.id;
          S.activeAgent.id = buyerId;
          localStorage.setItem('sa7_agent', JSON.stringify(S.activeAgent));
        }

        // Marché décentralisé = comparaison compétitive :
        // l'acheteur négocie simultanément avec tous les vendeurs de la catégorie
        // (chaque vendeur propose son propre produit — le meilleur prix gagne)
        const sameCat = products.filter(p =>
          p.category === S.negoProduct.category && p.sellerId !== S.negoProduct.sellerId
        );
        const vendors = [S.negoProduct, ...sameCat.slice(0, 2)]; // produit choisi + 2 concurrents max
        const sellerStrategyMap = (name) => {
          const n = (name || '').toLowerCase();
          if (n.includes('trystan')     ) return 'GREEDY';
          if (n.includes('rory')        ) return 'COOL_HEADED';
          if (n.includes('sophie')      ) return 'FRUGAL';
          if (n.includes('august')      ) return 'GREEDY';
          if (n.includes('saint levant')) return 'COOL_HEADED';
          if (n.includes('meriem')      ) return 'FRUGAL';
          return 'COOL_HEADED'; // Anastasia + défaut
        };

        // Create negotiations
        for (let vi = 0; vi < vendors.length; vi++) {
          const prod = vendors[vi];
          const nego = await apiStartNego(buyerId, prod.id);
          S.negoNegotiations.push({
            negId: nego.id,
            sellerId: prod.sellerId,
            sellerName: prod.sellerName || 'Vendeur',
            productName: prod.name,
            priceMin: prod.priceMin,
            priceMax: prod.priceMax,
            status: 'NEGOTIATING',
            sellerStrategy: sellerStrategyMap(prod.sellerName),
            offers: [],
          });
        }

        // Make initial offer for all
        for (const n of S.negoNegotiations) {
          await apiMakeOffer(n.negId, buyerId, offer);
          n.offers.push({ side: 'buyer', price: offer, round: 1 });
        }

        S.negoRound = 1;
        // Afficher d'abord le chat avec l'offre initiale (sans barre de réponse)
        renderNegoView(offer, true);
        scrollOfferLists();

        // Faire répondre chaque vendeur à l'offre initiale AVANT de montrer la barre de réponse
        for (let i = 0; i < S.negoNegotiations.length; i++) {
          const n = S.negoNegotiations[i];
          if (n.status !== 'NEGOTIATING') continue;
          n.pending = true;
          renderNegoView(offer, true);
          scrollOfferLists();
          await delay(2400);

          const negoAfterSeller = await apiAutoRespond(n.negId, n.sellerId, n.sellerStrategy, S.negoMaxRounds);
          n.pending = false;
          n.status = negoAfterSeller.status;
          if (n.status === 'NEGOTIATING') {
            const lastOff = (negoAfterSeller.offers || []).slice(-1)[0];
            if (lastOff?.proposedPrice) {
              n.offers.push({ side: 'seller', price: lastOff.proposedPrice, round: S.negoRound });
            }
          }
          if (n.status === 'AGREED') {
            n.finalPrice = negoAfterSeller.finalPrice;
            n.offerCount = S.negoRound;
            const acceptPhrases = [
              `Votre offre de <strong>${fmt(offer)}</strong> me convient pour <strong>${n.productName}</strong>. Marché conclu ! 🤝`,
              `<strong>${fmt(offer)}</strong> pour <strong>${n.productName}</strong> — c'est d'accord ! Bonne affaire pour vous. ✅`,
              `J'accepte <strong>${fmt(offer)}</strong>. Je vous cède <strong>${n.productName}</strong> avec plaisir. 🎉`,
            ];
            n.sellerFinalMsg = acceptPhrases[S.negoRound % acceptPhrases.length];
          }
          if (n.status === 'FAILED') {
            const refusePhrases = [
              `Je suis désolé, <strong>${fmt(offer)}</strong> est trop bas pour <strong>${n.productName}</strong>. Je ne peux pas accepter. ❌`,
              `<strong>${fmt(offer)}</strong> ne couvre pas mon prix minimal de <strong>${fmt(n.priceMin)}</strong> pour <strong>${n.productName}</strong>. Négociation rompue. ❌`,
              `Après réflexion, je dois refuser <strong>${fmt(offer)}</strong>. Nos positions sont trop éloignées. ❌`,
            ];
            n.sellerFinalMsg = refusePhrases[S.negoRound % refusePhrases.length];
          }
          renderNegoView(offer, true);
          scrollOfferLists();
          await delay(2500); // temps de lire la réponse vendeur
        }

        // Maintenant afficher la barre de réponse
        renderNegoView(offer, false);
        scrollOfferLists();

      } catch(e) {
        app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">❌</div>
          <p><strong>Erreur lors du lancement :</strong><br><code style="color:var(--crimson2);font-size:13px">${e.message || 'Erreur inconnue'}</code></p>
          <button class="btn btn-secondary" style="margin-top:20px" onclick="navigate('marche-decentralise')">← Réessayer</button>
        </div></div>`;
      }
    };

    function renderNegoView(lastBuyerOffer, waitForSeller = false) {
      const doneAll = S.negoNegotiations.every(n => n.status === 'AGREED' || n.status === 'FAILED');
      const STRAT_LABELS = { COOL_HEADED: 'Adaptatif', FRUGAL: 'Prudent', GREEDY: 'Agressif' };

      // Build base layout once — reuse DOM between re-renders for smooth chat
      if (!document.getElementById('nego-chat-grid')) {
        const chatWindows = S.negoNegotiations.map((n, i) => {
          const isMain = i === 0;
          const tagHtml = isMain
            ? `<span style="font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);padding:1px 6px;margin-left:6px">Votre choix</span>`
            : `<span style="font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--grey);border:1px solid var(--border);padding:1px 6px;margin-left:6px">Concurrent</span>`;
          return `
          <div class="nego-chat-window" id="chatwin-${n.negId}" style="${isMain ? 'border-color:rgba(201,168,76,.35)' : ''}">
            <div class="chat-win-header">
              <div class="chat-win-avatar" style="${isMain ? 'background:rgba(201,168,76,.15);color:var(--gold);border-color:rgba(201,168,76,.4)' : ''}">${n.sellerName[0].toUpperCase()}</div>
              <div class="chat-win-meta">
                <div class="chat-win-name">${n.sellerName}${tagHtml}</div>
                <div class="chat-win-product">📦 ${n.productName} · ${fmt(n.priceMin)} — ${fmt(n.priceMax)}</div>
              </div>
              <div id="badge-${n.negId}">${statusBadge(n.status)}</div>
            </div>
            <div class="chat-messages" id="chat-${n.negId}">
              <div class="chat-sys-msg">💎 Négociation ouverte · Stratégie vendeur : <strong>${STRAT_LABELS[n.sellerStrategy] || n.sellerStrategy}</strong></div>
              <div class="chat-msg chat-seller-msg">
                <div class="chat-bubble chat-bubble-seller">
                  <span class="chat-text">Bonjour ! Je vous propose <strong>${n.productName}</strong> (${fmt(n.priceMin)} – ${fmt(n.priceMax)}). En attente de votre offre... 👀</span>
                </div>
              </div>
            </div>
          </div>`;
        }).join('');

        const catLabel = { bags:'sacs', watches:'montres', clothing:'vêtements', perfumes:'parfums', shoes:'chaussures' };
        app.innerHTML = `
          <div class="page" id="nego-page">
            <div class="page-header">
              <h1>🔀 Marché Décentralisé</h1>
              <p>Comparaison de <strong>${vendors.length} ${catLabel[S.negoProduct?.category] || S.negoProduct?.category || 'articles'}</strong> — <em>${S.activeAgent.name}</em> (${S.activeAgent.strategy})</p>
              <p style="font-size:12px;color:var(--grey);margin-top:4px">Tu proposes un budget : chaque vendeur répond avec son propre article · le meilleur deal gagne</p>
            </div>
            <div class="round-progress" id="nego-progress-bar">
              <div class="progress-bar"><div class="progress-fill" id="nego-pfill" style="width:0%"></div></div>
              <div class="round-label">
                <span id="nego-round-label">Tour 0 / ${S.negoMaxRounds}</span>
                <span id="nego-accord-label">0 accord(s) / ${S.negoNegotiations.length} vendeur(s)</span>
              </div>
            </div>
            <div class="nego-chat-grid" id="nego-chat-grid">${chatWindows}</div>
            <div id="nego-bottom-section"></div>
            <div id="nego-conv-chart-wrap" style="display:none;padding:0 0 40px">
              <div class="conv-chart-wrap">
                <div class="conv-chart-title">Convergence des Offres</div>
                <div id="nego-conv-chart"></div>
                <div class="conv-legend">
                  <span class="conv-leg-solid">— acheteur</span>
                  <span class="conv-leg-dash">- - vendeur</span>
                  <span class="conv-leg-dot">⊙ accord</span>
                </div>
              </div>
            </div>
          </div>`;
      }

      // Update progress bar
      const agreed = S.negoNegotiations.filter(n => n.status === 'AGREED');
      const fillEl = document.getElementById('nego-pfill');
      if (fillEl) fillEl.style.width = Math.round((S.negoRound / S.negoMaxRounds) * 100) + '%';
      const roundLbl = document.getElementById('nego-round-label');
      if (roundLbl) roundLbl.textContent = `Tour ${S.negoRound} / ${S.negoMaxRounds}`;
      const accordLbl = document.getElementById('nego-accord-label');
      if (accordLbl) accordLbl.textContent = `${agreed.length} accord(s) / ${S.negoNegotiations.length} vendeur(s)`;


      // Update each chat window — append only new messages
      S.negoNegotiations.forEach((n, i) => {
        const chatEl = document.getElementById(`chat-${n.negId}`);
        if (!chatEl) return;

        const badgeEl = document.getElementById(`badge-${n.negId}`);
        if (badgeEl) badgeEl.innerHTML = statusBadge(n.status);

        n.offers.forEach((o, idx) => {
          const mid = `msg-${n.negId}-${idx}`;
          if (document.getElementById(mid)) return; // already rendered

          const msgEl = document.createElement('div');
          msgEl.id = mid;

          if (o.side === 'buyer') {
            const buyerEmojis = ['💰','🤝','✨','💼','🎯','💡'];
            const emoji = buyerEmojis[Math.floor(idx / 2) % buyerEmojis.length];
            msgEl.className = 'chat-msg chat-buyer-msg';
            msgEl.innerHTML = `
              <div class="chat-bubble chat-bubble-buyer">
                <span class="chat-text">${emoji} Je propose <strong>${fmt(o.price)}</strong></span>
                <span class="chat-time">Round ${o.round}</span>
              </div>`;
          } else if (o.side === 'seller') {
            const buyerRef = n.offers.filter(x => x.side === 'buyer' && x.round === o.round)[0]?.price
              || n.offers.filter(x => x.side === 'buyer').slice(-1)[0]?.price;
            const reasoning = agentReasoning(n.sellerStrategy || 'COOL_HEADED', o.round || 1, S.negoMaxRounds, buyerRef || o.price, o.price, n.priceMin || 0, n.priceMax || 0);
            const diff = buyerRef ? Math.abs(o.price - buyerRef) : 0;
            const sellerEmoji = o.price > (buyerRef || 0) * 1.5 ? '😤' : o.price > (buyerRef || 0) * 1.1 ? '🤨' : '🙏';
            msgEl.className = 'chat-msg chat-seller-msg';
            msgEl.innerHTML = `
              <div class="chat-bubble chat-bubble-seller">
                <span class="chat-text">${sellerEmoji} Je contre-propose <strong>${fmt(o.price)}</strong></span>
                ${buyerRef ? `<span class="chat-detail">${o.price > buyerRef ? '+' : '-'}${fmt(diff)} ${o.price >= buyerRef ? 'au-dessus' : 'en dessous'} de votre offre</span>` : ''}
                <span class="chat-reasoning-inline">◆ ${reasoning}</span>
                <span class="chat-time">Round ${o.round}</span>
              </div>`;
          }
          chatEl.appendChild(msgEl);
        });

        // Typing indicator
        document.getElementById(`typing-${n.negId}`)?.remove();
        if (n.pending) {
          const typingEl = document.createElement('div');
          typingEl.id = `typing-${n.negId}`;
          typingEl.className = 'chat-msg chat-seller-msg';
          typingEl.innerHTML = `<div class="chat-bubble chat-bubble-seller chat-typing-bubble">
            <span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>
            <span class="chat-typing-label">${n.sellerName} réfléchit...</span>
          </div>`;
          chatEl.appendChild(typingEl);
        }

        // Message vendeur avant conclusion (accord ou échec) — une seule fois
        if (n.sellerFinalMsg && !document.getElementById(`seller-final-${n.negId}`)) {
          const fmEl = document.createElement('div');
          fmEl.id = `seller-final-${n.negId}`;
          fmEl.className = 'chat-msg chat-seller-msg';
          fmEl.innerHTML = `<div class="chat-bubble chat-bubble-seller">
            <span class="chat-text">${n.sellerFinalMsg}</span>
            <span class="chat-time">Round ${n.offerCount || S.negoRound}</span>
          </div>`;
          chatEl.appendChild(fmEl);
        }

        // Message système de conclusion (once)
        if (!document.getElementById(`final-${n.negId}`)) {
          if (n.status === 'AGREED') {
            const el = document.createElement('div');
            el.id = `final-${n.negId}`;
            el.className = 'chat-sys-msg chat-sys-agreed';
            el.innerHTML = `✅ Accord conclu à <strong>${fmt(n.finalPrice)}</strong> · ${n.offerCount} round(s) 🎉`;
            chatEl.appendChild(el);
          } else if (n.status === 'FAILED') {
            const el = document.createElement('div');
            el.id = `final-${n.negId}`;
            el.className = 'chat-sys-msg chat-sys-failed';
            el.innerHTML = `❌ Négociation échouée`;
            chatEl.appendChild(el);
          }
        }

        chatEl.scrollTop = chatEl.scrollHeight;
      });

      // Update bottom section
      const bottomEl = document.getElementById('nego-bottom-section');
      if (!bottomEl) return;

      if (waitForSeller) {
        bottomEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--grey);font-size:14px;letter-spacing:.05em">
          ⏳ &nbsp; En attente des réponses vendeurs...
        </div>`;
        return;
      }

      if (doneAll) {
        // Enregistrer stats réelles par stratégie
        S.negoNegotiations.forEach(n => recordNegoStat(n.status));
        // Rating prompt si au moins un accord
        const firstAgreed = S.negoNegotiations.find(n => n.status === 'AGREED');
        if (firstAgreed) {
          setTimeout(() => showRatingPrompt({
            product: firstAgreed.productName,
            seller:  firstAgreed.sellerName,
            finalPrice: firstAgreed.finalPrice,
            market: 'decentralise',
          }), 1200);
        }
        const surplusSummary = agreed.length > 0 ? `
          <div class="surplus-summary">
            ${agreed.map(n => {
              const surplus = (n.priceMax || 0) - (n.finalPrice || 0);
              const pct2 = n.priceMax ? Math.round((surplus / n.priceMax) * 100) : 0;
              return `<div class="surplus-row">
                <span class="surplus-label">Économie — ${n.sellerName}</span>
                <span class="surplus-amount">+${fmt(surplus)}</span>
                <span class="surplus-bar-wrap"><span class="surplus-bar-fill" style="width:${pct2}%"></span></span>
                <span class="surplus-pct">${pct2}% sous le max</span>
              </div>`;
            }).join('')}
          </div>` : '';
        const decChartHtml = drawConvergenceChart(S.negoNegotiations, S.negoMaxRounds);
        const oldDecWrap = document.getElementById('nego-conv-chart-wrap');
        if (oldDecWrap) oldDecWrap.style.display = 'none';

        bottomEl.innerHTML = `
          <div class="${agreed.length > 0 ? 'result-card' : 'result-card failed'}" style="margin-top:24px">
            <div class="result-icon">${agreed.length > 0 ? '✅' : '❌'}</div>
            <div class="result-title ${agreed.length > 0 ? 'success' : 'fail'}">
              ${agreed.length > 0 ? agreed.length + ' accord(s) trouvé(s) !' : 'Aucun accord'}
            </div>
            ${agreed.map(n => `<div style="font-size:14px;margin-top:8px">• ${n.sellerName} — <strong style="color:var(--gold)">${fmt(n.finalPrice)}</strong> — ${n.offerCount || '—'} round(s)</div>`).join('')}
            ${surplusSummary}
            <div class="conv-chart-wrap" style="margin-top:28px">
              <div class="conv-chart-title">Convergence des Offres</div>
              ${decChartHtml}
              <div class="conv-legend">
                <span class="conv-leg-solid">— acheteur</span>
                <span class="conv-leg-dash">- - vendeur</span>
                <span class="conv-leg-dot">⊙ accord</span>
              </div>
            </div>
            <div class="btn-row" style="margin-top:20px;justify-content:center">
              <button class="btn btn-primary" onclick="navigate('historique')">Voir dans l'historique</button>
              <button class="btn btn-secondary" onclick="navigate('marche-decentralise')">Nouvelle négociation</button>
            </div>
          </div>`;
      } else {
        // Smart suggestion: converge toward lowest seller counter
        const activeNegos = S.negoNegotiations.filter(n => n.status === 'NEGOTIATING');
        const sellerCounters = activeNegos
          .map(n => n.offers.filter(o => o.side === 'seller').slice(-1)[0]?.price)
          .filter(Boolean);
        const lowestCounter = sellerCounters.length ? Math.min(...sellerCounters) : null;
        const suggestedNext = lowestCounter
          ? Math.round((lastBuyerOffer + lowestCounter) / 2)
          : Math.round(lastBuyerOffer * 1.05);

        bottomEl.innerHTML = `
          <div class="chat-offer-bar">
            <div class="chat-offer-bar-title">💬 Votre réponse — Tour ${S.negoRound + 1}</div>
            ${lowestCounter ? `<div class="chat-offer-hint">💡 Contre-offre la plus basse : <strong>${fmt(lowestCounter)}</strong> — suggestion : <strong>${fmt(suggestedNext)}</strong></div>` : ''}
            <div class="chat-offer-inputs">
              <input type="number" id="next-offer" class="chat-offer-input" value="${suggestedNext}" min="1">
              <span class="chat-offer-unit">€</span>
              <button class="chat-offer-send" onclick="nextRound()">Envoyer 📨</button>
            </div>
            <div class="chat-offer-actions">
              <button class="chat-action-btn chat-action-auto" onclick="autoMode()">⚡ Mode Auto</button>
              <button class="chat-action-btn chat-action-withdraw" onclick="withdrawOffer()">↩ Retirer l'offre <small>(pénalité 2%)</small></button>
              <button class="chat-action-btn chat-action-cancel" onclick="navigate('marche-decentralise')">✕ Annuler</button>
            </div>
          </div>`;

        window.nextRound = async () => {
          const v = parseFloat(document.getElementById('next-offer')?.value);
          if (!v || v <= 0) { toast('Entrez un prix valide', 'error'); return; }
          await runRound(v);
        };

        window.withdrawOffer = () => {
          const penalty = Math.round(lastBuyerOffer * 0.02);
          toast(`↩ Offre retirée — Pénalité : ${fmt(penalty)} (2% de ${fmt(lastBuyerOffer)})`, 'warning');
          S.negoNegotiations.filter(n => n.status === 'NEGOTIATING').forEach(n => { n.status = 'FAILED'; });
          renderNegoView(lastBuyerOffer);
        };

        window.autoMode = async () => {
          if (S.negoAutoMode) return;
          S.negoAutoMode = true;
          const strat = S.activeAgent?.strategy || 'Adaptatif';
          toast(`⚡ Mode auto — stratégie ${strat}`, 'info');
          let currentOffer = lastBuyerOffer;
          while (S.negoNegotiations.some(n => n.status === 'NEGOTIATING') && S.negoRound < S.negoMaxRounds) {
            const active = S.negoNegotiations.filter(n => n.status === 'NEGOTIATING');
            const counters = active.map(n => n.offers.filter(o => o.side === 'seller').slice(-1)[0]?.price).filter(Boolean);
            const lowest = counters.length ? Math.min(...counters) : null;
            currentOffer = buyerConcession(currentOffer, lowest);
            await runRound(currentOffer);
            await new Promise(r => setTimeout(r, 400));
          }
          S.negoAutoMode = false;
        };
      }
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function runRound(buyerOffer) {
      if (S.negoNegotiations.every(n => n.status !== 'NEGOTIATING')) return;
      S.negoRound++;
      const activeNegos = S.negoNegotiations.filter(n => n.status === 'NEGOTIATING');
      for (let i = 0; i < activeNegos.length; i++) {
        const n = activeNegos[i];
        try {
          // 1. L'acheteur envoie d'abord sa nouvelle offre (protocole alternant)
          await apiMakeOffer(n.negId, S.activeAgent.id, buyerOffer);
          n.offers.push({ side: 'buyer', price: buyerOffer, round: S.negoRound });
          renderNegoView(buyerOffer, true);
          scrollOfferLists();
          await delay(2600);

          // 2. Le vendeur reçoit l'offre et réfléchit
          n.pending = true;
          renderNegoView(buyerOffer, true);
          scrollOfferLists();
          await delay(2600);

          // 3. Le vendeur répond automatiquement à l'offre de l'acheteur
          const negoAfterSeller = await apiAutoRespond(n.negId, n.sellerId, n.sellerStrategy || 'COOL_HEADED', S.negoMaxRounds);
          n.pending = false;
          n.status = negoAfterSeller.status;

          if (n.status === 'NEGOTIATING') {
            const lastOffer = (negoAfterSeller.offers || []).slice(-1)[0];
            if (lastOffer?.proposedPrice) {
              n.offers.push({ side: 'seller', price: lastOffer.proposedPrice, round: S.negoRound });
            }
          }
          if (n.status === 'AGREED') {
            n.finalPrice = negoAfterSeller.finalPrice;
            n.offerCount = S.negoRound;
            const ap = [
              `Votre offre de <strong>${fmt(buyerOffer)}</strong> me convient pour <strong>${n.productName}</strong>. Marché conclu ! 🤝`,
              `<strong>${fmt(buyerOffer)}</strong> pour <strong>${n.productName}</strong> — j'accepte ! C'est une bonne affaire. ✅`,
              `J'accepte <strong>${fmt(buyerOffer)}</strong>. Je vous cède <strong>${n.productName}</strong> avec plaisir. 🎉`,
              `C'est d'accord à <strong>${fmt(buyerOffer)}</strong> — <strong>${n.productName}</strong> est à vous ! 🎊`,
            ];
            n.sellerFinalMsg = ap[S.negoRound % ap.length];
          }
          if (n.status === 'FAILED') {
            const rp = [
              `Je suis désolé, <strong>${fmt(buyerOffer)}</strong> est trop bas pour <strong>${n.productName}</strong>. Je ne peux pas accepter. ❌`,
              `<strong>${fmt(buyerOffer)}</strong> ne couvre pas mon prix minimal de <strong>${fmt(n.priceMin)}</strong> pour <strong>${n.productName}</strong>. ❌`,
              `Après ${S.negoRound} rounds, nos positions restent trop éloignées. Je dois mettre fin à cette négociation. ❌`,
            ];
            n.sellerFinalMsg = rp[S.negoRound % rp.length];
          }

          renderNegoView(buyerOffer, true);
          scrollOfferLists();

          if (n.status === 'AGREED') {
            await delay(2800);
            continue;
          }
          if (n.status === 'FAILED') {
            await delay(1500);
            continue;
          }

          // Laisser le temps de lire la réponse du vendeur
          await delay(2800);

        } catch(e) {
          console.error('runRound error:', e);
          n.pending = false;
          n.status = 'FAILED';
          renderNegoView(buyerOffer, true);
        }
      }

      renderNegoView(buyerOffer, false);
      scrollOfferLists();
    }

    function scrollOfferLists() {
      document.querySelectorAll('.chat-messages').forEach(el => {
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

      const selectedBuyers = buyers.slice(0, nbB);

      // FIX: déduplication sur catProds déjà filtré par catégorie
      const seenSellers = new Set();
      const selectedSellers = catProds.filter(p => {
        if (seenSellers.has(p.sellerId)) return false;
        seenSellers.add(p.sellerId);
        return true;
      }).slice(0, 3);

      const nbSellers = selectedSellers.length;
      const maxRounds = 15;
      const resultEl  = document.getElementById('centralise-result');
      const refProd   = catProds[0];

      // L'indicateur de round est initialement masqué ; JS l'active après construction du DOM
      resultEl.innerHTML = `
        <div style="margin-top:28px">
          <div class="process-steps" id="steps">
            <div class="step active" id="step1"><div class="step-num">1</div><div class="step-label">Collection des Offres</div><div class="step-sub">(Bids)</div></div>
            <div class="step" id="step2"><div class="step-num">2</div><div class="step-label">Collection des Demandes</div><div class="step-sub">(Asks)</div></div>
            <div class="step" id="step3"><div class="step-num">3</div><div class="step-label">Enchère par Rounds</div><div class="step-sub">(Matching)</div></div>
          </div>
          <div id="round-indicator" style="display:none;margin:20px 0;align-items:center;gap:16px;flex-wrap:wrap">
            <span id="round-badge" style="font-size:18px;font-weight:600;font-family:var(--font-serif)">🔄 Round 0/${maxRounds}</span>
            <span id="sellers-matched" style="font-size:14px;padding:4px 12px;border:1px solid var(--border)">Vendeurs 0/${nbSellers}</span>
            <span id="transactions-count" style="font-size:14px;color:var(--gold)">Transactions : 0</span>
          </div>
          <div id="step-content" style="margin-top:8px">${loader()}</div>
          <div id="tx-history" style="display:none;margin-top:20px">
            <h4 style="font-family:var(--font-serif);margin-bottom:12px;font-size:15px">📜 Historique de transactions</h4>
            <div id="tx-list" style="display:flex;flex-direction:column;gap:8px"></div>
          </div>
        </div>`;

      // Étape 1 — collecte bids
      await sleep(1800);
      document.getElementById('step1').classList.add('done');
      document.getElementById('step2').classList.add('active');

      // Les bids démarrent à 72-84 % de priceMax pour garantir la convergence en quelques rounds
      let currentBids = selectedBuyers.map((u, i) => {
        const p    = AGENT_PROFILES[i] || AGENT_PROFILES[0];
        const base = refProd.priceMax * (0.72 + i * 0.03 + Math.random() * 0.04);
        return { buyer: u.name, buyerShort: 'Acheteur'+(i+1), bid: Math.round(base), budgetMax: p.budget, matched: false };
      });

      // Étape 2 — collecte asks
      await sleep(1800);
      document.getElementById('step2').classList.add('done');
      document.getElementById('step3').classList.add('active');

      // Les asks démarrent à 108-115 % de priceMin pour laisser une marge de convergence réaliste
      let currentAsks = selectedSellers.map((p, i) => {
        const base = p.priceMin * (1.10 - i * 0.02 + Math.random() * 0.04);
        return { seller: p.sellerName || ('Vendeur'+(i+1)), sellerShort: 'Vendeur'+(i+1), product: p.name, ask: Math.round(base), floor: p.priceMin, matched: false };
      });

      await sleep(1500);
      document.getElementById('step3').classList.add('done');

      document.getElementById('round-indicator').style.display = 'flex';
      document.getElementById('step-content').innerHTML = '';

      const transactions = [];
      const roundHistory = []; // pour le schéma de convergence
      let   actualRound  = 0;  // compteur indépendant de la variable de boucle (évite off-by-one à l'affichage)

      function refreshRoundUI() {
        const matchedSellers = currentAsks.filter(a => a.matched).length;
        document.getElementById('round-badge').textContent        = `🔄 Round ${actualRound}/${maxRounds}`;
        document.getElementById('sellers-matched').textContent    = `Vendeurs ${matchedSellers}/${nbSellers}`;
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
              ${currentAsks.map(a=>`
                <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--surface3);margin-bottom:4px;${a.matched?'opacity:.4;text-decoration:line-through':''}">
                  <span>${a.seller}</span><span style="color:${a.matched?'var(--grey)':'var(--crimson)'};font-weight:600">${a.matched?'✓ Vendu':fmt(a.ask)}</span>
                </div>`).join('')}
            </div>
          </div>`;
      }

      // Boucle d'enchère
      for (let r = 1; r <= maxRounds; r++) {
        actualRound = r;

        const availBids = currentBids.filter(b => !b.matched).sort((a,b) => b.bid - a.bid);
        const availAsks = currentAsks.filter(a => !a.matched).sort((a,b) => a.ask - b.ask);

        // Enregistre meilleur bid / ask pour le schéma de convergence
        if (availBids.length && availAsks.length) {
          roundHistory.push({ round: r, buyer: availBids[0].bid, seller: availAsks[0].ask });
        }

        // Matching : bid le plus haut vs ask le plus bas
        for (let i = 0; i < Math.min(availBids.length, availAsks.length); i++) {
          if (availBids[i].bid >= availAsks[i].ask) {
            const price = Math.round((availBids[i].bid + availAsks[i].ask) / 2);
            transactions.push({
              round: r,
              buyer: availBids[i].buyer, buyerShort: availBids[i].buyerShort,
              seller: availAsks[i].seller, sellerShort: availAsks[i].sellerShort,
              product: availAsks[i].product, price,
            });
            availBids[i].matched = true;
            availAsks[i].matched = true;
          }
        }

        refreshRoundUI();

        if (currentAsks.every(a => a.matched) || currentBids.every(b => b.matched)) break;

        // Convergence : +3 % bids, −3 % asks
        currentBids.forEach(b => { if (!b.matched) b.bid = Math.min(Math.round(b.bid * 1.03), b.budgetMax); });
        currentAsks.forEach(a => { if (!a.matched) a.ask = Math.max(Math.round(a.ask * 0.97), a.floor); });

        await sleep(1600);
      }

      // Schéma de convergence — synthétise meilleur bid / ask par round
      const avgFinal  = transactions.length
        ? Math.round(transactions.reduce((s,t) => s+t.price, 0) / transactions.length)
        : null;
      const chartNego = {
        offers: roundHistory.flatMap(rh => [
          { side: 'buyer',  price: rh.buyer,  round: rh.round },
          { side: 'seller', price: rh.seller, round: rh.round },
        ]),
        status:     transactions.length > 0 ? 'AGREED' : 'FAILED',
        finalPrice: avgFinal,
        priceMin:   Math.min(...selectedSellers.map(s => s.floor)),
        priceMax:   refProd.priceMax,
      };
      const chartHtml = roundHistory.length >= 2 ? drawConvergenceChart([chartNego], actualRound) : '';

      // Résumé final
      const totalVol = transactions.reduce((s,t) => s+t.price, 0);
      const avgPrice = avgFinal || 0;
      document.getElementById('step-content').innerHTML += `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px">
          <div class="stat-card"><div class="stat-label">Transactions</div><div class="stat-value">${transactions.length}</div></div>
          <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold">${fmt(totalVol)}</div></div>
          <div class="stat-card"><div class="stat-label">Prix Moyen</div><div class="stat-value">${avgPrice ? fmt(avgPrice) : '—'}</div></div>
        </div>
        ${transactions.length === 0 ? `<div class="empty-state" style="padding:24px;margin-top:16px"><p>Aucun accord après ${actualRound} round(s) — prix trop éloignés</p></div>` : ''}
        ${chartHtml ? `
          <div class="conv-chart-wrap" style="margin-top:32px">
            <div class="conv-chart-title">Convergence Bid / Ask — meilleure paire par round</div>
            ${chartHtml}
          </div>` : ''}`;

      // FIX Bug 1 : affiche le bon nombre de rounds
      toast(`Enchère terminée en ${actualRound} round(s) — ${transactions.length} transaction(s)`, 'success');

      if (transactions.length > 0) {
        const hist = JSON.parse(localStorage.getItem('sa7_centralise_history') || '[]');
        transactions.forEach(tx => hist.push({
          ...tx,
          type: 'CENTRALISE',
          date: new Date().toISOString(),
          agentName: S.activeAgent?.name || '—',
          rounds: actualRound,
        }));
        localStorage.setItem('sa7_centralise_history', JSON.stringify(hist.slice(-200)));
      }
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: ACHAT GROUPÉ ====================
// ==================== PAGE: ACHAT GROUPÉ ====================
async function renderAchatGroupe() {
  const app = document.getElementById('app');

  try {
    const users    = S.users.length ? S.users : await apiGetUsers();
    const products = S.products.length ? S.products : await apiGetProducts();
    S.users = users; S.products = products;

    const buyers = users.filter(u => u.userType === 'BUYER');
    const cats   = [...new Set(products.map(p => p.category).filter(Boolean))];
    const CAT_EMOJI   = { bags:'👜', watches:'⌚', clothing:'👗', perfumes:'🌹', shoes:'👠' };
    const STRAT_COLORS = { COOL_HEADED:'var(--crimson)', GREEDY:'#E8203E', FRUGAL:'var(--grey)' };

    // State — quantité = nombre de membres sélectionnés
    let groupMembers = new Set(buyers.slice(0,3).map(u => u.id));
    let groupProduct = null;
    let groupCat     = cats[0];

    function getCatProds() { return products.filter(p => p.category === groupCat); }
    function groupQty()    { return groupMembers.size; }
    function discount()    { return Math.min(15, (groupQty() - 1) * 3); }

    function renderGroupSetup() {
      const catProds = getCatProds();
      if (!groupProduct && catProds.length) groupProduct = catProds[0];

      const qty      = groupQty();
      const disc     = discount();
      const refPrice = groupProduct ? Math.round(groupProduct.priceMax * (1 - disc / 100)) : 0;
      const total    = groupProduct ? refPrice * qty : 0;

      const memberRows = buyers.slice(0,5).map((u, i) => {
        const prof   = AGENT_PROFILES[i] || AGENT_PROFILES[0];
        const col    = STRAT_COLORS[prof.strategyKey] || 'var(--grey)';
        const init   = u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        const active = groupMembers.has(u.id);
        const isLeader = active && [...groupMembers][0] === u.id;
        return `
          <div class="ag-member-row ${active ? 'ag-member-active' : ''}" onclick="toggleAgMember(${u.id})">
            <div class="cfg-p-avatar" style="background:${col}22;color:${col};border-color:${col}44;width:36px;height:36px;font-size:11px;flex-shrink:0">${init}</div>
            <div class="cfg-p-info" style="flex:1">
              <div class="cfg-p-name">${u.name} ${isLeader ? '<span style="color:var(--gold);font-size:10px;margin-left:4px">Leader</span>' : ''}</div>
              <div class="cfg-p-strat" style="color:${col}">${prof.strategy} · ${fmt(prof.budget)}</div>
            </div>
            <div class="ag-member-check">${active ? '✓' : ''}</div>
          </div>`;
      }).join('');

      app.innerHTML = `
        <div class="cfg-wrap">
          <div class="cfg-hero">
            <div class="cfg-hero-bg" style="background-image:url('${HERO_IMAGES[3]}')"></div>
            <div class="cfg-hero-veil"></div>
            <div class="cfg-hero-content">
              <div class="cfg-eyebrow">◆ &nbsp; Achat Groupé &nbsp; ◆</div>
              <h1 class="cfg-title">Négociation<br><em>Collective</em></h1>
              <p class="cfg-sub">plusieurs acheteurs · force collective · remise quantité</p>
            </div>
            <div class="cfg-deco cfg-d1">◆</div>
            <div class="cfg-deco cfg-d2">◇</div>
            <div class="cfg-deco cfg-d3">◆</div>
          </div>
          <div class="cfg-body" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:860px">

            <!-- Colonne gauche : produit -->
            <div class="cfg-card" style="margin:0">
              <div class="cfg-label" style="margin-bottom:12px">Catégorie</div>
              <div class="cat-chips">
                ${cats.map(c => `<button class="cat-chip ${c===groupCat?'active':''}" onclick="agSelectCat('${c}')">${CAT_EMOJI[c]||'◆'} ${c}</button>`).join('')}
              </div>
              <div class="cfg-sep"></div>
              <div class="cfg-label" style="margin-bottom:10px">Article à négocier</div>
              <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto">
                ${getCatProds().map(p => `
                  <div class="ag-prod-item ${groupProduct?.id===p.id?'ag-prod-selected':''}" onclick="agSelectProd(${p.id})">
                    <div style="font-size:13px;font-weight:500">${p.name}</div>
                    <div style="font-size:11px;color:var(--grey)">${fmt(p.priceMin)} — ${fmt(p.priceMax)} · ${p.sellerName||''}</div>
                  </div>`).join('')}
              </div>
              ${groupProduct ? `
              <div class="cfg-estimate" style="margin-top:16px;display:block">
                <div style="margin-bottom:4px">Groupe de <strong>${qty} acheteurs</strong> → remise <strong style="color:var(--gold)">−${disc}%</strong></div>
                <div>Prix / unité estimé : <strong>${fmt(refPrice)}</strong></div>
                <div style="margin-top:2px">Total groupe : <strong style="color:var(--gold)">${fmt(total)}</strong></div>
              </div>` : ''}
            </div>

            <!-- Colonne droite : membres -->
            <div class="cfg-card" style="margin:0">
              <div class="cfg-label" style="margin-bottom:4px">Membres du groupe</div>
              <div style="font-size:12px;color:var(--grey);margin-bottom:12px">
                Cochez/décochez les acheteurs. Plus il y a de membres, plus la remise est grande.<br>
                Le <span style="color:var(--gold)">Leader</span> (1er coché) mène la négociation.
              </div>
              <div id="ag-members">${memberRows}</div>
              <div class="ag-discount-bar" style="margin-top:14px;padding:10px 14px;background:var(--surface3);border-left:2px solid var(--gold)">
                <span style="font-size:12px;color:var(--grey)">Remise actuelle :</span>
                <strong style="color:var(--gold);font-size:18px;margin-left:8px">−${disc}%</strong>
                <span style="font-size:11px;color:var(--grey);margin-left:6px">(${qty} unités)</span>
              </div>
              <div class="cfg-sep"></div>
              <button class="cfg-cta" onclick="startAchatGroupe()">
                <span class="cfg-cta-gem">◆</span>
                Lancer l'achat groupé
                <span class="cfg-cta-arrow">→</span>
              </button>
            </div>
          </div>
        </div>`;

      window.agSelectCat = (cat) => {
        groupCat = cat;
        groupProduct = getCatProds()[0] || null;
        renderGroupSetup();
      };
      window.agSelectProd = (pid) => {
        groupProduct = products.find(p => p.id === pid) || groupProduct;
        renderGroupSetup();
      };
      window.toggleAgMember = (uid) => {
        if (groupMembers.has(uid)) {
          if (groupMembers.size <= 2) { toast('Minimum 2 membres', 'error'); return; }
          groupMembers.delete(uid);
        } else {
          if (groupMembers.size >= 5) { toast('Maximum 5 membres', 'error'); return; }
          groupMembers.add(uid);
        }
        renderGroupSetup();
      };
    }

    renderGroupSetup();

    window.startAchatGroupe = async () => {
      if (!groupProduct) { toast('Sélectionnez un article', 'error'); return; }
      if (groupMembers.size < 2) { toast('Minimum 2 membres', 'error'); return; }

      const memberList   = buyers.filter(u => groupMembers.has(u.id));
      const leader       = memberList[0];
      const qty          = groupQty();
      const disc         = discount();

      // Offre initiale agressive : entre 15% et 35% au-dessus du priceMin
      // → oblige plusieurs tours de négociation
      const _range      = groupProduct.priceMax - groupProduct.priceMin;
      const _aggr       = 0.15 + Math.random() * 0.20; // 15–35% au-dessus du min
      const groupPrice  = Math.round(groupProduct.priceMin + _range * _aggr);

      // Stratégie vendeur aléatoire → résultats variés (accepte / refuse / multi-rounds)
      const _strats     = ['GREEDY', 'FRUGAL', 'COOL_HEADED'];
      const sellerStrat = _strats[Math.floor(Math.random() * _strats.length)];

      app.innerHTML = `<div class="page" id="ag-nego-page">
        <div class="page-header">
          <h1>👥 Achat Groupé en cours</h1>
          <p>${groupProduct.name} · ${memberList.length} acheteurs · ${qty} unités · −${disc}%</p>
        </div>
        <div id="ag-members-strip" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
          ${memberList.map((u,i) => {
            const prof = AGENT_PROFILES[i] || AGENT_PROFILES[0];
            const col  = STRAT_COLORS[prof.strategyKey] || 'var(--grey)';
            const init = u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
            return `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--surface2);border:1px solid var(--border);font-size:12px">
              <div style="width:24px;height:24px;border-radius:50%;background:${col}22;color:${col};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600">${init}</div>
              <span>${u.name.split(' ')[0]}</span>
              ${i===0?'<span style="color:var(--gold);font-size:10px">Leader</span>':''}
            </div>`;
          }).join('')}
        </div>
        <div class="nego-chat-grid" style="grid-template-columns:1fr">
          <div class="nego-chat-window" id="ag-chat-win">
            <div class="chat-win-header">
              <div class="chat-win-avatar">${(groupProduct.sellerName||'V')[0].toUpperCase()}</div>
              <div class="chat-win-meta">
                <div class="chat-win-name">${groupProduct.sellerName || 'Vendeur'}</div>
                <div class="chat-win-product">📦 ${groupProduct.name} · ${qty} unités demandées</div>
              </div>
              <div id="ag-nego-badge"></div>
            </div>
            <div class="chat-messages" id="ag-chat-msgs">
              <div class="chat-sys-msg">👥 Achat groupé · ${memberList.length} acheteurs · ${qty} unités · Remise −${disc}%</div>
            </div>
          </div>
        </div>
        <div id="ag-bottom"></div>
        <div id="ag-chart-wrap" style="display:none;padding:0 0 40px">
          <div class="conv-chart-wrap">
            <div class="conv-chart-title">Convergence des Offres (par unité)</div>
            <div id="ag-chart"></div>
            <div class="conv-legend">
              <span class="conv-leg-solid">— groupe</span>
              <span class="conv-leg-dash">- - vendeur</span>
            </div>
          </div>
        </div>
      </div>`;

      const chatEl   = document.getElementById('ag-chat-msgs');
      const badgeEl  = document.getElementById('ag-nego-badge');
      const bottomEl = document.getElementById('ag-bottom');
      const delay    = ms => new Promise(r => setTimeout(r, ms));

      // Track state
      const agState = {
        negoId: null, sellerId: groupProduct.sellerId,
        offers: [], status: 'NEGOTIATING',
        round: 0, maxRounds: 10, finalPrice: null,
        lastSellerOfferId: null,
      };

      function appendMsg(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        chatEl.appendChild(d.firstElementChild);
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      function setBadge(status) {
        if (badgeEl) badgeEl.innerHTML = statusBadge(status);
      }

      function showBottom() {
        if (agState.status !== 'NEGOTIATING') return;
        const sellerCounters = agState.offers.filter(o=>o.side==='seller');
        const lastSeller = sellerCounters[sellerCounters.length-1];
        const suggested  = lastSeller
          ? Math.round((agState.offers.filter(o=>o.side==='buyer').slice(-1)[0]?.price + lastSeller.price) / 2)
          : Math.round(groupPrice * 1.04);
        bottomEl.innerHTML = `
          <div class="chat-offer-bar">
            <div class="chat-offer-bar-title">💬 Réponse du groupe — Tour ${agState.round + 1}</div>
            ${lastSeller ? `<div class="chat-offer-hint">💡 Contre-offre vendeur : <strong>${fmt(lastSeller.price)}</strong> / unité · Suggestion : <strong>${fmt(suggested)}</strong></div>` : ''}
            <div class="chat-offer-inputs">
              <input type="number" id="ag-offer-input" class="chat-offer-input" value="${suggested}" min="1">
              <span class="chat-offer-unit">€/unité</span>
              <button class="chat-offer-send" onclick="agNextRound()">Envoyer 📨</button>
            </div>
            ${lastSeller ? `<div class="chat-offer-actions">
              <button class="chat-action-btn" style="background:rgba(74,222,128,0.1);color:#4ade80;border-color:rgba(74,222,128,0.3)" onclick="agAccept()">✓ Accepter ${fmt(lastSeller.price)}/unité</button>
              <button class="chat-action-btn chat-action-auto" onclick="agAutoMode()">⚡ Mode Auto</button>
              <button class="chat-action-btn chat-action-cancel" onclick="navigate('achat-groupe')">✕ Annuler</button>
            </div>` : `<div class="chat-offer-actions">
              <button class="chat-action-btn chat-action-auto" onclick="agAutoMode()">⚡ Mode Auto</button>
              <button class="chat-action-btn chat-action-cancel" onclick="navigate('achat-groupe')">✕ Annuler</button>
            </div>`}
          </div>`;

        window.agNextRound = async () => {
          const v = parseFloat(document.getElementById('ag-offer-input')?.value);
          if (!v || v<=0) { toast('Prix invalide','error'); return; }
          await agRunRound(v);
        };
        window.agAccept = async () => {
          if (!agState.lastSellerOfferId) return;
          try {
            await apiAcceptOffer(agState.negoId, agState.lastSellerOfferId);
            agState.status = 'AGREED';
            agState.finalPrice = lastSeller.price;
            showAgResult();
          } catch(e) { toast(e.message,'error'); }
        };
        window.agAutoMode = async () => {
          let cur = agState.offers.filter(o=>o.side==='buyer').slice(-1)[0]?.price || groupPrice;
          while (agState.status === 'NEGOTIATING' && agState.round < agState.maxRounds) {
            const sc = agState.offers.filter(o=>o.side==='seller').slice(-1)[0]?.price;
            cur = buyerConcession(cur, sc || null);
            await agRunRound(cur);
            await delay(300);
          }
        };
      }

      function showAgResult() {
        setBadge(agState.status);
        bottomEl.innerHTML = '';
        // Cacher le chart-wrap séparé (on l'intègre dans la carte résultat)
        const oldWrap = document.getElementById('ag-chart-wrap');
        if (oldWrap) oldWrap.style.display = 'none';

        const chartHtml = drawConvergenceChart([{
          offers: agState.offers, status: agState.status,
          finalPrice: agState.finalPrice,
          priceMin: groupProduct.priceMin, priceMax: groupProduct.priceMax,
          sellerName: groupProduct.sellerName,
        }], agState.maxRounds);

        const agResEl = document.createElement('div');

        if (agState.status === 'AGREED') {
          const fp       = agState.finalPrice;
          const total    = fp * qty;
          const saved    = (groupProduct.priceMax - fp) * qty;
          const pct      = Math.round(((groupProduct.priceMax - fp) / groupProduct.priceMax) * 100);
          const shareRows = memberList.map(u => `
            <div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--surface3);margin-bottom:4px;font-size:13px">
              <span>${u.name}</span>
              <strong style="color:var(--gold)">${fmt(fp)}</strong>
            </div>`).join('');
          agResEl.innerHTML = `
            <div class="result-card" style="margin-top:24px">
              <div class="result-icon">✅</div>
              <div class="result-title success">Accord groupé conclu !</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0">
                <div class="stat-card"><div class="stat-label">Prix / unité</div><div class="stat-value text-gold">${fmt(fp)}</div></div>
                <div class="stat-card"><div class="stat-label">Total groupe</div><div class="stat-value">${fmt(total)}</div></div>
                <div class="stat-card"><div class="stat-label">Économie totale</div><div class="stat-value" style="color:#4ade80">+${fmt(saved)} (${pct}%)</div></div>
              </div>
              <div style="margin:12px 0 8px;font-size:12px;letter-spacing:.08em;color:var(--grey)">RÉPARTITION PAR MEMBRE</div>
              ${shareRows}
              <div class="btn-row" style="margin-top:20px;justify-content:center">
                <button class="btn btn-primary" onclick="navigate('historique')">Voir dans l'historique</button>
                <button class="btn btn-secondary" onclick="navigate('achat-groupe')">Nouvelle session</button>
              </div>
              <div class="ag-rating-inline">
                <div class="ag-rating-label">Notez cette négociation</div>
                <div class="ag-rating-stars">
                  ${[1,2,3,4,5].map(n=>`<span class="rating-star" data-v="${n}" onclick="submitRating(${n},'${groupProduct.name}','${groupProduct.sellerName||'Vendeur'}',${fp},'achat-groupe')" onmouseenter="this.parentElement.querySelectorAll('.rating-star').forEach((s,j)=>s.classList.toggle('lit',j<${n}))" onmouseleave="this.parentElement.querySelectorAll('.rating-star').forEach(s=>s.classList.remove('lit'))">★</span>`).join('')}
                </div>
              </div>
              <div class="conv-chart-wrap" style="margin-top:32px">
                <div class="conv-chart-title">Convergence des Offres (par unité)</div>
                ${chartHtml}
                <div class="conv-legend">
                  <span class="conv-leg-solid">— groupe</span>
                  <span class="conv-leg-dash">- - vendeur</span>
                  <span class="conv-leg-dot">⊙ accord</span>
                </div>
              </div>
            </div>`;
        } else {
          agResEl.innerHTML = `
            <div class="result-card failed" style="margin-top:24px">
              <div class="result-icon">❌</div>
              <div class="result-title fail">Aucun accord après ${agState.round} rounds</div>
              <div class="conv-chart-wrap" style="margin-top:24px">
                <div class="conv-chart-title">Convergence des Offres</div>
                ${chartHtml}
                <div class="conv-legend">
                  <span class="conv-leg-solid">— groupe</span>
                  <span class="conv-leg-dash">- - vendeur</span>
                </div>
              </div>
              <div class="btn-row" style="margin-top:20px;justify-content:center">
                <button class="btn btn-secondary" onclick="navigate('achat-groupe')">Réessayer</button>
              </div>
            </div>`;
        }
        document.getElementById('ag-nego-page').appendChild(agResEl.firstElementChild);
      }

      async function agRunRound(buyerPrice) {
        if (agState.status !== 'NEGOTIATING') return;
        agState.round++;
        const buyerEmojis = ['💰','🤝','✨','💼','🎯','💡'];
        appendMsg(`<div class="chat-msg chat-buyer-msg">
          <div class="chat-bubble chat-bubble-buyer">
            <span class="chat-text">${buyerEmojis[agState.round%6]} Le groupe propose <strong>${fmt(buyerPrice)}</strong> / unité × ${qty} = <strong>${fmt(buyerPrice*qty)}</strong></span>
            <span class="chat-time">Round ${agState.round}</span>
          </div></div>`);
        agState.offers.push({ side:'buyer', price:buyerPrice, round:agState.round });
        bottomEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--grey);font-size:14px">⏳ Le vendeur réfléchit...</div>`;

        try {
          await apiMakeOffer(agState.negoId, leader.id, buyerPrice, qty);
        } catch(e) { /* may already exist */ }

        // typing indicator
        const typEl = document.createElement('div');
        typEl.className = 'chat-msg chat-seller-msg';
        typEl.id = 'ag-typing';
        typEl.innerHTML = `<div class="chat-bubble chat-bubble-seller chat-typing-bubble">
          <span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>
          <span class="chat-typing-label">${groupProduct.sellerName||'Vendeur'} réfléchit...</span>
        </div>`;
        chatEl.appendChild(typEl);
        chatEl.scrollTop = chatEl.scrollHeight;
        await delay(2400);
        document.getElementById('ag-typing')?.remove();

        const negoResp = await apiAutoRespond(agState.negoId, agState.sellerId, sellerStrat, agState.maxRounds);
        agState.status = negoResp.status;

        if (agState.status === 'NEGOTIATING') {
          const lastOff = (negoResp.offers||[]).slice(-1)[0];
          if (lastOff?.proposedPrice) {
            const sp = Number(lastOff.proposedPrice);
            agState.lastSellerOfferId = lastOff.id;
            agState.offers.push({ side:'seller', price:sp, round:agState.round });
            const reasoning = agentReasoning(sellerStrat, agState.round, agState.maxRounds, buyerPrice, sp, groupProduct.priceMin, groupProduct.priceMax);
            const diff = Math.abs(sp - buyerPrice);
            const sellerEmoji = sp > buyerPrice * 1.5 ? '😤' : sp > buyerPrice * 1.1 ? '🤨' : '🙏';
            appendMsg(`<div class="chat-msg chat-seller-msg">
              <div class="chat-bubble chat-bubble-seller">
                <span class="chat-text">${sellerEmoji} Je contre-propose <strong>${fmt(sp)}</strong> / unité × ${qty} = <strong>${fmt(sp*qty)}</strong></span>
                <span class="chat-detail">${sp > buyerPrice ? '+' : '-'}${fmt(diff)} par rapport à votre offre</span>
                <span class="chat-reasoning-inline">◆ ${reasoning}</span>
                <span class="chat-time">Round ${agState.round}</span>
              </div></div>`);
          }
          await delay(2800);
          setBadge('NEGOTIATING');
          showBottom();
        } else if (agState.status === 'AGREED') {
          agState.finalPrice = Number(negoResp.finalPrice);
          bottomEl.innerHTML = ''; // Effacer "Le vendeur réfléchit..."
          const acceptPhrases = [
            `Votre offre de <strong>${fmt(buyerPrice)}</strong> / unité me convient. J'accepte ! 🤝`,
            `Pour ${qty} unités à <strong>${fmt(buyerPrice)}</strong> chacune — c'est d'accord. Marché conclu ! ✅`,
            `Bien joué. <strong>${fmt(buyerPrice)}</strong> / unité pour votre groupe, j'accepte. 🎉`,
            `C'est une bonne offre pour les deux parties — j'accepte <strong>${fmt(buyerPrice)}</strong> / unité. 🤝`,
          ];
          const phrase = acceptPhrases[agState.round % acceptPhrases.length];
          appendMsg(`<div class="chat-msg chat-seller-msg">
            <div class="chat-bubble chat-bubble-seller">
              <span class="chat-text">😊 ${phrase}</span>
              <span class="chat-time">Round ${agState.round}</span>
            </div></div>`);
          await delay(1200);
          appendMsg(`<div class="chat-sys-msg chat-sys-agreed">✅ Accord groupé conclu à <strong>${fmt(agState.finalPrice)}</strong> / unité 🎉</div>`);
          setBadge('AGREED');
          recordNegoStat('AGREED');
          await delay(700);
          bottomEl.innerHTML = `
            <div class="chat-offer-bar" style="text-align:center">
              <div style="font-size:18px;margin-bottom:12px">🎉 Accord trouvé !</div>
              <div style="font-size:14px;color:var(--white-dim);margin-bottom:16px">
                Le vendeur accepte <strong style="color:var(--gold)">${fmt(agState.finalPrice)}</strong> / unité
                × ${qty} membres = <strong style="color:var(--gold)">${fmt(agState.finalPrice * qty)}</strong> au total
              </div>
              <button class="cfg-cta" style="max-width:320px;margin:0 auto" onclick="showAgResult()">
                Voir le résultat complet →
              </button>
            </div>`;
          window.showAgResult = showAgResult;
        } else if (agState.status === 'FAILED') {
          bottomEl.innerHTML = ''; // Effacer "Le vendeur réfléchit..."
          const refusePhrases = [
            `Je suis désolé, cette offre est trop basse pour moi. Je ne peux pas aller plus loin. ❌`,
            `Après ${agState.round} rounds, nos positions sont trop éloignées. Je dois décliner. ❌`,
            `${fmt(buyerPrice)} / unité ne couvre pas mes coûts — je retire ma participation. ❌`,
          ];
          appendMsg(`<div class="chat-msg chat-seller-msg">
            <div class="chat-bubble chat-bubble-seller">
              <span class="chat-text">😔 ${refusePhrases[agState.round % refusePhrases.length]}</span>
            </div></div>`);
          await delay(2600);
          appendMsg(`<div class="chat-sys-msg chat-sys-failed">❌ Négociation échouée après ${agState.round} round(s)</div>`);
          recordNegoStat('FAILED');
          await delay(2000);
          showAgResult();
        }
      }

      // Boot: login + start nego
      bottomEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--grey)">⏳ Lancement de la négociation...</div>`;
      try {
        const auth = await apiLogin(leader.email, 'password');
        S.token = auth.token;
        localStorage.setItem('sa7_token', auth.token);
      } catch(e) {
        app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">🔐</div><p>Sélectionnez un agent depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
        return;
      }
      const nego = await apiStartNego(leader.id, groupProduct.id);
      agState.negoId = nego.id;

      // Initial group offer
      appendMsg(`<div class="chat-msg chat-seller-msg">
        <div class="chat-bubble chat-bubble-seller">
          <span class="chat-text">Bonjour ! Intéressant — une commande groupée de ${qty} unités ? Je vous écoute 👀</span>
        </div></div>`);
      await delay(2600);

      await agRunRound(groupPrice);
    };

  } catch(e) {
    document.getElementById('app').innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
}

// ==================== PAGE: NÉGOCIATION 1V1 ====================
async function renderNegociation1v1(params = {}) {
  const app = document.getElementById('app');

  if (!S.activeAgent) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">👤</div><p>Sélectionnez un agent depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
    return;
  }

  try {
    const products = S.products.length ? S.products : await apiGetProducts();
    S.products = products;

    const catMeta = { bags:{icon:'👜',label:'Sacs'}, watches:{icon:'⌚',label:'Montres'}, clothing:{icon:'👗',label:'Vêtements'}, perfumes:{icon:'🌸',label:'Parfums'}, shoes:{icon:'👠',label:'Chaussures'} };
    const categories = [...new Set(products.map(p => p.category))];

    let n1Product = params.productId ? products.find(p => p.id == params.productId) : null;
    let n1MaxRounds = 10;

    function renderSetup() {
      app.innerHTML = `
        <div class="cfg-wrap">
          <div class="cfg-hero">
            <div class="cfg-hero-bg" style="background-image:url('${HERO_IMAGES[1]}')"></div>
            <div class="cfg-hero-veil"></div>
            <div class="cfg-hero-content">
              <div class="cfg-eyebrow">◆ &nbsp; Négociation 1v1 &nbsp; ◆</div>
              <h1 class="cfg-title">Face-à-Face<br><em>Direct</em></h1>
              <p class="cfg-sub">1 acheteur · 1 vendeur · protocole alterné</p>
            </div>
            <div class="cfg-deco cfg-d1">◆</div>
            <div class="cfg-deco cfg-d2">◇</div>
            <div class="cfg-deco cfg-d3">◆</div>
          </div>
          <div class="cfg-body">
            <div class="cfg-card">
              <div class="cfg-agent-row">
                <div class="cfg-agent-dot-wrap"><span class="agent-dot"></span></div>
                <div class="cfg-agent-info">
                  <div class="cfg-agent-name">${S.activeAgent.name}</div>
                  <div class="cfg-agent-meta">Stratégie · ${S.activeAgent.strategy} · Budget ${fmt(S.activeAgent.budget||0)}</div>
                </div>
                <div class="cfg-strategy-badge cfg-strat-${(S.activeAgent.strategyKey||'').toLowerCase()}">${S.activeAgent.strategy}</div>
              </div>
              <div class="cfg-sep"></div>
              <div class="cfg-field">
                <label class="cfg-label">Catégorie</label>
                <div class="cat-chips" id="n1-cat-chips">
                  ${categories.map(c => `<button class="cat-chip ${c===(n1Product?.category||categories[0])?'active':''}" onclick="n1SelectCat('${c}')">${catMeta[c]?.icon||'◆'} ${catMeta[c]?.label||c}</button>`).join('')}
                </div>
              </div>
              <div class="cfg-field">
                <label class="cfg-label">Article <span id="n1-cat-count" style="color:var(--text3);font-size:11px;font-weight:400;letter-spacing:0"></span></label>
                <div class="product-carousel" id="n1-product-carousel"></div>
              </div>
              <div id="n1-seller-info" style="display:none;padding:12px;background:var(--surface3);border-left:2px solid var(--crimson);margin-bottom:16px;font-size:13px"></div>
              <div class="cfg-two-col">
                <div class="cfg-field">
                  <label class="cfg-label">Offre initiale</label>
                  <div class="cfg-euro-wrap">
                    <input class="cfg-input" type="text" inputmode="numeric" id="n1-offer" placeholder="ex : 9 000" oninput="n1UpdateEstimate()">
                    <span class="cfg-euro-sign">€</span>
                  </div>
                  <div id="n1-estimate" class="cfg-estimate" style="display:none"></div>
                </div>
                <div class="cfg-field">
                  <label class="cfg-label">Rounds maximum</label>
                  <input class="cfg-input" type="number" id="n1-max-rounds" value="${n1MaxRounds}" min="1" max="20">
                </div>
              </div>
              <div class="cfg-info-box">
                <span class="cfg-info-icon">🎯</span>
                <span>Négociation directe avec <strong>un seul vendeur</strong>. Vous pouvez accepter ou refuser l'offre du vendeur à tout moment.</span>
              </div>
              <button class="cfg-cta" onclick="startN1Nego()">
                <span class="cfg-cta-gem">◆</span>
                Lancer la négociation
                <span class="cfg-cta-arrow">→</span>
              </button>
            </div>
          </div>
        </div>`;

      window.n1SelectCat = (cat) => {
        document.querySelectorAll('#n1-cat-chips .cat-chip').forEach(c =>
          c.classList.toggle('active', c.textContent.trim().startsWith(catMeta[cat]?.icon||cat))
        );
        const catProds = products.filter(p => p.category === cat);
        const countEl  = document.getElementById('n1-cat-count');
        if (countEl) countEl.textContent = `(${catProds.length} article${catProds.length>1?'s':''})`;
        const carousel = document.getElementById('n1-product-carousel');
        if (!carousel) return;
        const makeCard = (p, withId) => `
          <div class="pcarousel-card ${n1Product?.id==p.id?'pcarousel-selected':''}"
               onclick="n1SelectProd(${p.id})" data-pid="${p.id}" ${withId?`id="n1pc-${p.id}"`:''}>
            <div class="pcarousel-img" style="background-image:url('${getProductImage(p)}')"></div>
            <div class="pcarousel-body">
              <div class="pcarousel-brand">${p.brand||cat}</div>
              <div class="pcarousel-name">${p.name}</div>
              <div class="pcarousel-range">${fmt(p.priceMin)} — ${fmt(p.priceMax)}</div>
            </div>
            <div class="pcarousel-check">✓</div>
          </div>`;
        const cards = catProds.map(p=>makeCard(p,true)).join('');
        const dupe  = catProds.map(p=>makeCard(p,false)).join('');
        const dur   = Math.max(18, catProds.length*4);
        carousel.innerHTML = `<div class="pcarousel-track" style="animation-duration:${dur}s">${cards}${dupe}</div>`;
      };

      window.n1SelectProd = (pid) => {
        n1Product = products.find(x => x.id==pid);
        if (!n1Product) return;
        document.querySelectorAll('.pcarousel-card').forEach(c => c.classList.remove('pcarousel-selected'));
        document.querySelectorAll(`[data-pid="${pid}"]`).forEach(c => c.classList.add('pcarousel-selected'));
        const offerInput = document.getElementById('n1-offer');
        if (offerInput) { offerInput.value = Math.round(n1Product.priceMax*0.78).toLocaleString('fr-FR'); n1UpdateEstimate(); }
        const sellerInfo = document.getElementById('n1-seller-info');
        if (sellerInfo && n1Product.sellerName) {
          sellerInfo.style.display = 'block';
          const strat = (() => {
            const nm = (n1Product.sellerName||'').toLowerCase();
            if (nm.includes('trystan')||nm.includes('august')) return 'Agressif 😤';
            if (nm.includes('sophie')||nm.includes('meriem')) return 'Conservateur 🧘';
            return 'Adaptatif 🎯';
          })();
          sellerInfo.innerHTML = `<strong>${n1Product.sellerName}</strong> · Stratégie vendeur : <span style="color:var(--gold)">${strat}</span>`;
        }
      };

      window.n1UpdateEstimate = () => {
        if (!n1Product) return;
        const p = n1Product;
        const estimateEl = document.getElementById('n1-estimate');
        if (!estimateEl) return;
        const userOffer = parseFloat(String(document.getElementById('n1-offer')?.value||'0').replace(/\s/g,'').replace(',','.')) || 0;
        const goodOffer = Math.round(p.priceMax*0.78);
        const estimate  = Math.round(p.priceMin*0.95 + p.priceMax*0.35);
        const pct       = userOffer>0 ? Math.round((userOffer/p.priceMax)*100) : null;
        estimateEl.style.display = 'block';
        if (userOffer>0 && userOffer<p.priceMin*0.6) {
          estimateEl.innerHTML = `⚠️ Offre trop basse (${pct}% du max) — refus probable. Recommandé : <strong>${goodOffer.toLocaleString('fr-FR')} €</strong>`;
          estimateEl.style.borderLeftColor='var(--crimson)'; estimateEl.style.background='rgba(196,18,48,0.08)'; estimateEl.style.color='var(--crimson2)';
        } else if (userOffer>0 && userOffer<p.priceMin) {
          estimateEl.innerHTML = `⚠️ Offre inférieure au minimum (${fmt(p.priceMin)}) — risque d'échec.`;
          estimateEl.style.borderLeftColor='#C9A84C'; estimateEl.style.background='rgba(201,168,76,0.08)'; estimateEl.style.color='var(--gold)';
        } else {
          estimateEl.innerHTML = `◆ Accord probable autour de <strong>${estimate.toLocaleString('fr-FR')} €</strong>${pct!==null?` (${pct}% du max)`:''} · ${S.activeAgent.strategy}`;
          estimateEl.style.borderLeftColor='var(--gold)'; estimateEl.style.background='var(--gold-dim)'; estimateEl.style.color='var(--gold)';
        }
      };

      n1SelectCat(n1Product?.category || categories[0]);
      if (n1Product) n1SelectProd(n1Product.id);
    }

    renderSetup();

    window.startN1Nego = async () => {
      if (!n1Product) { toast('Sélectionnez un article','error'); return; }
      const offer = parseFloat(String(document.getElementById('n1-offer')?.value||'').replace(/\s/g,'').replace(',','.'));
      const maxR  = parseInt(document.getElementById('n1-max-rounds')?.value) || 10;
      if (!offer||offer<=0) { toast('Entrez une offre valide','error'); return; }
      n1MaxRounds = maxR;

      app.innerHTML = `<div class="page" id="n1-nego-page">
        <div class="page-header">
          <h1>🎯 Négociation 1v1</h1>
          <p>${n1Product.name} — <em>${S.activeAgent.name}</em> vs <em>${n1Product.sellerName||'Vendeur'}</em></p>
        </div>
        <div class="round-progress">
          <div class="progress-bar"><div class="progress-fill" id="n1-pfill" style="width:0%"></div></div>
          <div class="round-label">
            <span id="n1-round-lbl">Tour 0 / ${maxR}</span>
            <span id="n1-status-lbl">En cours</span>
          </div>
        </div>
        <div class="nego-chat-grid" style="grid-template-columns:1fr">
          <div class="nego-chat-window">
            <div class="chat-win-header">
              <div class="chat-win-avatar">${(n1Product.sellerName||'V')[0].toUpperCase()}</div>
              <div class="chat-win-meta">
                <div class="chat-win-name">${n1Product.sellerName||'Vendeur'}</div>
                <div class="chat-win-product">📦 ${n1Product.name} · ${fmt(n1Product.priceMin)} — ${fmt(n1Product.priceMax)}</div>
              </div>
              <div id="n1-badge"></div>
            </div>
            <div class="chat-messages" id="n1-chat"></div>
          </div>
        </div>
        <div id="n1-bottom"></div>
        <div id="n1-chart-wrap" style="display:none;padding:0 0 40px">
          <div class="conv-chart-wrap">
            <div class="conv-chart-title">Convergence des Offres</div>
            <div id="n1-chart"></div>
            <div class="conv-legend">
              <span class="conv-leg-solid">— acheteur</span>
              <span class="conv-leg-dash">- - vendeur</span>
              <span class="conv-leg-dot">⊙ accord</span>
            </div>
          </div>
        </div>
      </div>`;

      const chatEl   = document.getElementById('n1-chat');
      const badgeEl  = document.getElementById('n1-badge');
      const bottomEl = document.getElementById('n1-bottom');
      const delay    = ms => new Promise(r => setTimeout(r, ms));

      const sellerStrat = (() => {
        const nm = (n1Product.sellerName||'').toLowerCase();
        if (nm.includes('trystan')||nm.includes('august')) return 'GREEDY';
        if (nm.includes('sophie')||nm.includes('meriem')) return 'FRUGAL';
        return 'COOL_HEADED';
      })();

      const n1State = {
        negoId:null, round:0, maxRounds:maxR, status:'NEGOTIATING',
        offers:[], finalPrice:null, lastSellerOfferId:null,
      };

      function setBadge(st) { if(badgeEl) badgeEl.innerHTML = statusBadge(st); }
      function updateProgress() {
        const fill = document.getElementById('n1-pfill');
        if (fill) fill.style.width = Math.round((n1State.round/n1State.maxRounds)*100)+'%';
        const rl = document.getElementById('n1-round-lbl');
        if (rl) rl.textContent = `Tour ${n1State.round} / ${n1State.maxRounds}`;
      }

      function appendMsg(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        chatEl.appendChild(d.firstElementChild);
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      function showBottom(lastBuyerOffer) {
        if (n1State.status !== 'NEGOTIATING') return;
        const sellerOffers = n1State.offers.filter(o=>o.side==='seller');
        const lastSeller   = sellerOffers[sellerOffers.length-1];
        const suggested    = lastSeller
          ? Math.round((lastBuyerOffer + lastSeller.price)/2)
          : Math.round(lastBuyerOffer*1.05);

        bottomEl.innerHTML = `
          <div class="chat-offer-bar">
            <div class="chat-offer-bar-title">💬 Votre réponse — Tour ${n1State.round+1}</div>
            ${lastSeller ? `<div class="chat-offer-hint">💡 Contre-offre vendeur : <strong>${fmt(lastSeller.price)}</strong> · Suggestion : <strong>${fmt(suggested)}</strong></div>` : ''}
            <div class="chat-offer-inputs">
              <input type="number" id="n1-next-offer" class="chat-offer-input" value="${suggested}" min="1">
              <span class="chat-offer-unit">€</span>
              <button class="chat-offer-send" onclick="n1NextRound()">Envoyer 📨</button>
            </div>
            <div class="chat-offer-actions">
              ${lastSeller ? `<button class="chat-action-btn" style="background:rgba(74,222,128,0.1);color:#4ade80;border-color:rgba(74,222,128,0.3)" onclick="n1Accept()">✓ Accepter ${fmt(lastSeller.price)}</button>` : ''}
              <button class="chat-action-btn chat-action-auto" onclick="n1AutoMode(${lastBuyerOffer})">⚡ Mode Auto</button>
              <button class="chat-action-btn chat-action-withdraw" onclick="n1Reject()">↩ Refuser &amp; quitter</button>
              <button class="chat-action-btn chat-action-cancel" onclick="navigate('negociation-1v1')">✕ Annuler</button>
            </div>
          </div>`;

        window.n1NextRound = async () => {
          const v = parseFloat(document.getElementById('n1-next-offer')?.value);
          if (!v||v<=0) { toast('Prix invalide','error'); return; }
          await runN1Round(v);
        };
        window.n1Accept = async () => {
          if (!n1State.lastSellerOfferId) return;
          try {
            await apiAcceptOffer(n1State.negoId, n1State.lastSellerOfferId);
            n1State.status = 'AGREED';
            n1State.finalPrice = lastSeller.price;
            appendMsg(`<div class="chat-sys-msg chat-sys-agreed">✅ Vous avez accepté l'offre de <strong>${fmt(lastSeller.price)}</strong> 🎉</div>`);
            showN1Result();
          } catch(e) { toast(e.message,'error'); }
        };
        window.n1Reject = async () => {
          if (n1State.lastSellerOfferId) {
            try { await apiRejectOffer(n1State.negoId, n1State.lastSellerOfferId); } catch(e) {}
          }
          n1State.status = 'FAILED';
          appendMsg(`<div class="chat-sys-msg chat-sys-failed">↩ Vous avez refusé la négociation</div>`);
          showN1Result();
        };
        window.n1AutoMode = async (cur) => {
          while (n1State.status==='NEGOTIATING' && n1State.round<n1State.maxRounds) {
            const sc = n1State.offers.filter(o=>o.side==='seller').slice(-1)[0]?.price;
            cur = buyerConcession(cur, sc || null);
            await runN1Round(cur);
            await delay(300);
          }
        };
      }

      function showN1Result() {
        recordNegoStat(n1State.status);
        setBadge(n1State.status);
        updateProgress();
        bottomEl.innerHTML = '';
        const oldWrap = document.getElementById('n1-chart-wrap');
        if (oldWrap) oldWrap.style.display = 'none';

        const statusLbl = document.getElementById('n1-status-lbl');
        if (statusLbl) statusLbl.textContent = n1State.status==='AGREED' ? `✅ Accord à ${fmt(n1State.finalPrice)}` : '❌ Aucun accord';

        const chartHtml = drawConvergenceChart([{
          offers: n1State.offers, status: n1State.status,
          finalPrice: n1State.finalPrice,
          priceMin: n1Product.priceMin, priceMax: n1Product.priceMax,
          sellerName: n1Product.sellerName,
        }], n1State.maxRounds);

        const fp      = n1State.finalPrice;
        const isOk    = n1State.status==='AGREED';
        const surplus = isOk ? (n1Product.priceMax - fp) : 0;
        const pct     = isOk && n1Product.priceMax ? Math.round((surplus/n1Product.priceMax)*100) : 0;
        const resEl   = document.createElement('div');

        resEl.innerHTML = isOk
          ? `<div class="result-card" style="margin-top:24px">
              <div class="result-icon">✅</div>
              <div class="result-title success">Accord conclu !</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0">
                <div class="stat-card"><div class="stat-label">Prix final</div><div class="stat-value text-gold">${fmt(fp)}</div></div>
                <div class="stat-card"><div class="stat-label">Économie</div><div class="stat-value" style="color:#4ade80">+${fmt(surplus)}</div></div>
                <div class="stat-card"><div class="stat-label">% sous le max</div><div class="stat-value">${pct}%</div></div>
              </div>
              <div class="conv-chart-wrap" style="margin-top:24px">
                <div class="conv-chart-title">Convergence des Offres</div>
                ${chartHtml}
                <div class="conv-legend">
                  <span class="conv-leg-solid">— acheteur</span>
                  <span class="conv-leg-dash">- - vendeur</span>
                  <span class="conv-leg-dot">⊙ accord</span>
                </div>
              </div>
              <div class="ag-rating-inline" style="margin-top:20px">
                <div class="ag-rating-label">Notez cette négociation</div>
                <div class="ag-rating-stars" id="n1-stars">
                  ${[1,2,3,4,5].map(n=>`<span class="rating-star" data-v="${n}"
                    onclick="submitRating(${n},'${n1Product.name}','${n1Product.sellerName||'Vendeur'}',${fp},'1v1'); document.querySelectorAll('#n1-stars .rating-star').forEach((s,i)=>{s.style.color=i<${n}?'var(--gold)':'var(--grey)';})"
                    onmouseenter="document.querySelectorAll('#n1-stars .rating-star').forEach((s,i)=>{s.style.color=i<${n}?'var(--gold)':'var(--grey)';})"
                    onmouseleave="document.querySelectorAll('#n1-stars .rating-star').forEach(s=>s.style.color='var(--grey)')">★</span>`).join('')}
                </div>
              </div>
              <div class="btn-row" style="margin-top:20px;justify-content:center">
                <button class="btn btn-primary" onclick="navigate('historique')">Voir dans l'historique</button>
                <button class="btn btn-secondary" onclick="navigate('negociation-1v1')">Nouvelle négociation</button>
                <button class="btn btn-secondary" onclick="navigate('comparateur',{productId:${n1Product.id}})">⚖ Comparer stratégies</button>
              </div>
            </div>`
          : `<div class="result-card failed" style="margin-top:24px">
              <div class="result-icon">❌</div>
              <div class="result-title fail">Aucun accord en ${n1State.round} round(s)</div>
              <div class="conv-chart-wrap" style="margin-top:24px">
                <div class="conv-chart-title">Convergence des Offres</div>
                ${chartHtml}
                <div class="conv-legend">
                  <span class="conv-leg-solid">— acheteur</span>
                  <span class="conv-leg-dash">- - vendeur</span>
                </div>
              </div>
              <div class="btn-row" style="margin-top:20px;justify-content:center">
                <button class="btn btn-secondary" onclick="navigate('negociation-1v1')">Réessayer</button>
              </div>
            </div>`;
        document.getElementById('n1-nego-page').appendChild(resEl.firstElementChild);
      }

      async function runN1Round(buyerOffer) {
        if (n1State.status !== 'NEGOTIATING') return;
        n1State.round++;
        updateProgress();
        const buyerEmojis = ['💰','🤝','✨','💼','🎯','💡'];
        appendMsg(`<div class="chat-msg chat-buyer-msg">
          <div class="chat-bubble chat-bubble-buyer">
            <span class="chat-text">${buyerEmojis[n1State.round%6]} Je propose <strong>${fmt(buyerOffer)}</strong></span>
            <span class="chat-time">Round ${n1State.round}</span>
          </div></div>`);
        n1State.offers.push({side:'buyer',price:buyerOffer,round:n1State.round});
        bottomEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--grey);font-size:14px">⏳ En attente de la réponse vendeur...</div>`;

        try { await apiMakeOffer(n1State.negoId, S.activeAgent.id, buyerOffer); } catch(e) {}

        // Typing
        const typEl = document.createElement('div');
        typEl.className='chat-msg chat-seller-msg'; typEl.id='n1-typing';
        typEl.innerHTML=`<div class="chat-bubble chat-bubble-seller chat-typing-bubble">
          <span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>
          <span class="chat-typing-label">${n1Product.sellerName||'Vendeur'} réfléchit...</span></div>`;
        chatEl.appendChild(typEl); chatEl.scrollTop=chatEl.scrollHeight;
        await delay(2400);
        document.getElementById('n1-typing')?.remove();

        const negoResp = await apiAutoRespond(n1State.negoId, n1Product.sellerId, sellerStrat, n1State.maxRounds);
        n1State.status = negoResp.status;

        if (n1State.status==='NEGOTIATING') {
          const lastOff = (negoResp.offers||[]).slice(-1)[0];
          if (lastOff?.proposedPrice) {
            const sp = Number(lastOff.proposedPrice);
            n1State.lastSellerOfferId = lastOff.id;
            n1State.offers.push({side:'seller',price:sp,round:n1State.round});
            const reasoning = agentReasoning(sellerStrat, n1State.round, n1State.maxRounds, buyerOffer, sp, n1Product.priceMin, n1Product.priceMax);
            const diff = Math.abs(sp-buyerOffer);
            const emoji = sp > buyerOffer*1.5 ? '😤' : sp > buyerOffer*1.1 ? '🤨' : '🙏';
            appendMsg(`<div class="chat-msg chat-seller-msg">
              <div class="chat-bubble chat-bubble-seller">
                <span class="chat-text">${emoji} Je contre-propose <strong>${fmt(sp)}</strong></span>
                <span class="chat-detail">${sp>buyerOffer?'+':'-'}${fmt(diff)} ${sp>=buyerOffer?'au-dessus':'en dessous'} de votre offre</span>
                <span class="chat-reasoning-inline">◆ ${reasoning}</span>
                <span class="chat-time">Round ${n1State.round}</span>
              </div></div>`);
          }
          setBadge('NEGOTIATING');
          await delay(2000);
          showBottom(buyerOffer);
        } else if (n1State.status==='AGREED') {
          n1State.finalPrice = Number(negoResp.finalPrice);
          bottomEl.innerHTML = ''; // Effacer "En attente de la réponse vendeur..."
          const acceptPhrases = [
            `Votre offre de <strong>${fmt(buyerOffer)}</strong> me convient. J'accepte — affaire conclue ! 🤝`,
            `<strong>${fmt(buyerOffer)}</strong>, c'est honnête. J'accepte votre proposition. ✅`,
            `Vous avez été de bonne foi — j'accepte <strong>${fmt(buyerOffer)}</strong>. Marché ! 🎉`,
            `Après réflexion, <strong>${fmt(buyerOffer)}</strong> est acceptable pour moi. On conclut ! 🤝`,
          ];
          const phrase = acceptPhrases[n1State.round % acceptPhrases.length];
          appendMsg(`<div class="chat-msg chat-seller-msg">
            <div class="chat-bubble chat-bubble-seller">
              <span class="chat-text">😊 ${phrase}</span>
              <span class="chat-time">Round ${n1State.round}</span>
            </div></div>`);
          await delay(1200);
          appendMsg(`<div class="chat-sys-msg chat-sys-agreed">✅ Accord conclu à <strong>${fmt(n1State.finalPrice)}</strong> 🎉</div>`);
          await delay(700);
          showN1Result();
        } else if (n1State.status==='FAILED') {
          bottomEl.innerHTML = ''; // Effacer "En attente de la réponse vendeur..."
          const refusePhrases = [
            `Je suis désolé, cette offre est trop basse. Je ne peux pas aller plus bas. ❌`,
            `Après ${n1State.round} rounds, je dois décliner — nos prix sont trop éloignés. ❌`,
            `<strong>${fmt(buyerOffer)}</strong> ne couvre pas ma marge minimum. Je retire mon offre. ❌`,
          ];
          appendMsg(`<div class="chat-msg chat-seller-msg">
            <div class="chat-bubble chat-bubble-seller">
              <span class="chat-text">😔 ${refusePhrases[n1State.round % refusePhrases.length]}</span>
            </div></div>`);
          await delay(2600);
          appendMsg(`<div class="chat-sys-msg chat-sys-failed">❌ Négociation échouée après ${n1State.round} round(s)</div>`);
          await delay(2600);
          showN1Result();
        }
      }

      // Boot
      bottomEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--grey)">⏳ Lancement...</div>`;
      try {
        const auth = await apiLogin(S.activeAgent.email, 'password');
        S.token = auth.token;
        localStorage.setItem('sa7_token', auth.token);
      } catch(e) {
        app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">🔐</div><p>Session expirée — re-sélectionnez votre agent depuis <a onclick="navigate('accueil')" style="color:var(--gold);cursor:pointer">l'Accueil</a>.</p></div></div>`;
        return;
      }

      let buyerId = S.activeAgent.id;
      if (!buyerId) {
        const allUsers = await apiGetUsers();
        const matched  = allUsers.find(u=>u.email===S.activeAgent.email);
        if (!matched) { app.innerHTML=`<div class="page"><div class="empty-state"><p>Agent introuvable.</p></div></div>`; return; }
        buyerId = matched.id; S.activeAgent.id = buyerId;
        localStorage.setItem('sa7_agent', JSON.stringify(S.activeAgent));
      }

      const nego = await apiStartNego(buyerId, n1Product.id);
      n1State.negoId = nego.id;

      appendMsg(`<div class="chat-sys-msg">🎯 Négociation ouverte · Stratégie vendeur : <strong>${sellerStrat==='GREEDY'?'Agressif':sellerStrat==='FRUGAL'?'Conservateur':'Adaptatif'}</strong></div>`);
      appendMsg(`<div class="chat-msg chat-seller-msg">
        <div class="chat-bubble chat-bubble-seller">
          <span class="chat-text">Bonjour ! Je suis prêt à négocier. Quelle est votre offre ? 👀</span>
        </div></div>`);
      await delay(1400);

      await runN1Round(offer);
    };

  } catch(e) {
    app.innerHTML = `<div class="page"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div></div>`;
  }
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
  // Gather all prices for scale
  const allPrices = [];
  negotiations.forEach(n => {
    n.offers.forEach(o => allPrices.push(o.price));
    if (n.priceMin) allPrices.push(n.priceMin);
    if (n.priceMax) allPrices.push(n.priceMax);
  });
  if (!allPrices.length) return '';

  const pMin = Math.min(...allPrices);
  const pMax = Math.max(...allPrices);
  const range = pMax - pMin || 1;

  // buyer bar = % from left, seller bar = % from right
  function buyerW(p) { return Math.max(3, Math.min(97, ((p - pMin) / range) * 100)); }
  function sellerW(p) { return Math.max(3, Math.min(97, ((pMax - p) / range) * 100)); }

  function trackRow(buyerP, sellerP, isAccord, roundLabel) {
    const bw = buyerW(buyerP);
    const sw = sellerW(sellerP !== undefined ? sellerP : pMax);
    const gapLeft  = bw;
    const gapWidth = Math.max(0, 100 - bw - sw);
    const ecart    = sellerP !== undefined && sellerP !== buyerP
      ? `<span class="cv-ecart-val">Écart ${fmt(Math.abs(sellerP - buyerP))}</span>` : '';

    return `
    <div class="cv-row${isAccord ? ' cv-row-accord' : ''}">
      <div class="cv-row-meta">
        <span class="cv-row-label${isAccord ? ' cv-label-accord' : ''}">${roundLabel}</span>
        ${ecart}
      </div>
      <div class="cv-prices-line">
        <span class="cv-p-buyer">${fmt(buyerP)}</span>
        ${sellerP !== undefined ? `<span class="cv-p-seller">${fmt(sellerP)}</span>` : ''}
      </div>
      <div class="cv-track">
        <div class="cv-track-b" style="width:${bw}%"></div>
        ${gapWidth > 0 ? `<div class="cv-track-gap" style="left:${gapLeft}%;width:${gapWidth}%"></div>` : ''}
        <div class="cv-track-s" style="width:${sw}%"></div>
      </div>
    </div>`;
  }

  let output = '';

  negotiations.forEach((n, ni) => {
    if (!n.offers || !n.offers.length) return;

    let negoHeader = '';
    if (negotiations.length > 1) {
      const badge = n.status === 'AGREED'
        ? `<span class="cv-badge cv-badge-ok">✓ Accord</span>`
        : n.status === 'FAILED'
          ? `<span class="cv-badge cv-badge-fail">✗ Échoué</span>`
          : '';
      negoHeader = `<div class="cv-nego-title">${n.buyerName || `Acheteur ${ni + 1}`} ${badge}</div>`;
    }

    // Group by round
    const roundMap = {};
    n.offers.forEach(o => {
      const r = o.round || 1;
      if (!roundMap[r]) roundMap[r] = {};
      if (o.side === 'buyer') roundMap[r].buyer = o.price;
      else if (o.side === 'seller') roundMap[r].seller = o.price;
    });

    const roundNums = Object.keys(roundMap).map(Number).sort((a, b) => a - b);
    if (!roundNums.length) return;

    let rows = '';
    roundNums.forEach((r, i) => {
      const rd = roundMap[r];
      if (rd.buyer === undefined) return;
      const isLast  = i === roundNums.length - 1;
      const agreed  = isLast && n.status === 'AGREED';
      const label   = agreed ? '✓ Accord' : `Tour ${r}`;
      rows += trackRow(rd.buyer, rd.seller, agreed, label);
    });

    if (n.status === 'FAILED') {
      rows += `<div class="cv-failed-row">Positions trop éloignées — aucun accord</div>`;
    }

    const scaleRow = `
      <div class="cv-scale">
        <span class="cv-scale-end cv-scale-buy">◆ ${fmt(pMin)}</span>
        <span class="cv-scale-mid">Acheteur ←————→ Vendeur</span>
        <span class="cv-scale-end cv-scale-sell">${fmt(pMax)} ◆</span>
      </div>`;

    output += `<div class="cv-nego-section">${negoHeader}${rows}${scaleRow}</div>`;
  });

  return `<div class="cv-chart">${output}</div>`;
}

// ==================== FEATURE 3: AGENT REASONING ====================
function agentReasoning(stratKey, round, maxRounds, buyerPrice, sellerPrice, priceMin, priceMax) {
  const pct = round / maxRounds;
  const gap = Math.round(sellerPrice - buyerPrice);
  const mid = Math.round((priceMin + priceMax) / 2);

  if (stratKey === 'GREEDY') {
    if (pct < 0.30) {
      return `Je reste ferme sur mon prix — je ne baisse pas encore`;
    } else if (pct <= 0.65) {
      return `Il reste ${fmt(gap)} d'écart — je baisse un peu mais pas trop`;
    } else {
      return `On approche de la fin (tour ${round}/${maxRounds}) — c'est ma dernière concession`;
    }
  } else if (stratKey === 'FRUGAL') {
    if (pct < 0.40) {
      return `Je vise un accord autour de ${fmt(mid)} — je descends doucement`;
    } else {
      return `On se rapproche — encore ${fmt(gap)} à combler`;
    }
  } else {
    // COOL_HEADED
    if (pct < 0.30) {
      return `J'observe comment tu négocie avant de concéder`;
    } else if (pct <= 0.65) {
      return `On se rapproche — il reste ${fmt(gap)} entre nos deux prix`;
    } else {
      return `Je veux conclure avant le tour ${maxRounds} — je fais un effort`;
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

  // Bar chart: strategy success rates — from real recorded data
  const stratRaw = JSON.parse(localStorage.getItem('sa7_strat_stats') || '[]');
  function stratRate(key) {
    const entries = stratRaw.filter(e => e.strat === key);
    if (!entries.length) return null;
    return Math.round((entries.filter(e => e.result === 'AGREED').length / entries.length) * 100);
  }
  const barData = [
    { label: 'COOL_HEADED', name: 'Adaptatif',    pct: stratRate('COOL_HEADED') ?? 78, real: stratRate('COOL_HEADED') !== null, col: '#C41230' },
    { label: 'FRUGAL',      name: 'Conservateur', pct: stratRate('FRUGAL')      ?? 65, real: stratRate('FRUGAL') !== null,      col: '#888888' },
    { label: 'GREEDY',      name: 'Agressif',     pct: stratRate('GREEDY')      ?? 42, real: stratRate('GREEDY') !== null,      col: '#E8203E' },
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
    barSvg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH2}" fill="${b.col}" opacity="${b.real ? '1' : '0.45'}"/>`;
    barSvg += `<text x="${x + barW/2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="${b.col}" font-weight="600">${b.pct}%${b.real ? '' : '*'}</text>`;
    barSvg += `<text x="${x + barW/2}" y="${bH - bPad.bottom + 14}" text-anchor="middle" font-size="9" fill="#6b6b6b">${b.name}</text>`;
  });
  const hasAnyReal = barData.some(b => b.real);
  if (!hasAnyReal) barSvg += `<text x="${bW/2}" y="${bH - 2}" text-anchor="middle" font-size="8" fill="#555">* données de référence — lancez des négociations pour voir vos stats réelles</text>`;
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
