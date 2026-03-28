/* ================================================================
   SA7 LUXURY AGENTS — SPA FRONTEND
   Connecté à Spring Boot API sur le même serveur (port 8080)
   ================================================================ */

// ==================== CONFIG ====================
const API = '';   // même origine → pas de CORS

const AGENT_PROFILES = [
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 257500, color: '#22c55e' },
  { strategy: 'Agressif',     strategyKey: 'GREEDY',      budget: 312500, color: '#ef4444' },
  { strategy: 'Conservateur', strategyKey: 'FRUGAL',      budget: 255000, color: '#3b82f6' },
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 335000, color: '#22c55e' },
  { strategy: 'Adaptatif',    strategyKey: 'COOL_HEADED', budget: 285000, color: '#22c55e' },
];

const CATEGORY_EMOJI = {
  bags: '👜', watches: '⌚', clothing: '👗',
  perfumes: '🌹', shoes: '👠', default: '💎'
};

const CONDITIONS = ['Excellent', 'Très bon', 'Bon'];

// ==================== STATE ====================
const S = {
  activeAgent:     null,   // { id, name, email, strategy, strategyKey, budget, solde }
  token:           localStorage.getItem('sa7_token') || null,
  users:           [],
  products:        [],
  currentPage:     'accueil',
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
  if (fn) fn(params);
  else app.innerHTML = '<div class="page"><h1>Page non trouvée</h1></div>';
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
        <div class="agent-card ${isActive ? 'active' : ''}" onclick="selectAgent(${u.id}, '${u.name}', '${u.email}', '${profile.strategy}', '${profile.strategyKey}', ${profile.budget})">
          ${isActive ? '<span class="agent-badge badge-actif">Actif</span>' : '<span class="agent-badge badge-libre">Libre</span>'}
          <div class="agent-card-header">
            <div class="agent-avatar" style="background: linear-gradient(135deg, ${profile.color}, #333)">${initial}</div>
            <div>
              <div class="agent-name">${u.name}</div>
              <div class="agent-id">ID: buyer_${u.id}</div>
            </div>
          </div>
          <div class="agent-row">
            <span class="agent-row-label">Stratégie</span>
            <span class="agent-row-value">${profile.strategy}</span>
          </div>
          <div class="agent-row">
            <span class="agent-row-label">Budget max</span>
            <span class="agent-row-value">${fmt(profile.budget)}</span>
          </div>
          <div class="agent-row">
            <span class="agent-row-label">Solde actuel</span>
            <span style="color: var(--text)">${fmt(solde)}</span>
          </div>
          <div class="budget-bar">
            <div class="budget-bar-fill" style="width:${Math.round((solde/profile.budget)*100)}%"></div>
          </div>
        </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>◆ Sélectionner votre agent</h1>
          <p>Choisissez un agent acheteur pour commencer à négocier</p>
        </div>

        <div class="grid grid-3">${agentCards || '<div class="empty-state"><div class="empty-icon">👤</div><p>Aucun agent disponible</p></div>'}</div>

        <div class="protocol-section">
          <h2>Choisissez un protocole de négociation</h2>
          <div class="protocol-cards">
            <div class="protocol-card" onclick="navigate('marche-decentralise')">
              <div class="protocol-icon">🔀</div>
              <div class="protocol-name">Marché Décentralisé</div>
              <div class="protocol-desc">1 Acheteur négocie avec plusieurs vendeurs simultanément via protocole Alternating-Offer.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card" onclick="navigate('marche-centralise')">
              <div class="protocol-icon">🏛</div>
              <div class="protocol-name">Marché Centralisé</div>
              <div class="protocol-desc">Enchère double avec plusieurs acheteurs et vendeurs. Matching optimal par round.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card" onclick="navigate('achat-groupe')">
              <div class="protocol-icon">👥</div>
              <div class="protocol-name">Achat Groupé</div>
              <div class="protocol-desc">Plusieurs acheteurs s'unissent pour négocier un meilleur prix collectif.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
            <div class="protocol-card" onclick="navigate('marketplace')">
              <div class="protocol-icon">🛍</div>
              <div class="protocol-name">Négociation 1v1</div>
              <div class="protocol-desc">Sélectionnez un produit dans la marketplace et négociez directement avec un vendeur.</div>
              <div class="protocol-cta">→ Accéder</div>
            </div>
          </div>
        </div>
      </div>`;
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
      return `<div class="grid grid-3">${list.map(p => {
        const emoji = categoryEmoji(p.category);
        const cond  = conditionBadge(p.id);
        return `
          <div class="product-card" onclick="navigate('marche-decentralise', {productId: ${p.id}})">
            <div class="product-img">${emoji}</div>
            <div class="product-body">
              <div class="product-brand">${p.brand || p.category || '—'}</div>
              <div class="product-name">${p.name}</div>
              <div class="product-seller">Vendeur : ${p.sellerName || '—'} &nbsp; ${cond}</div>
              <div class="product-prices">
                <div class="price-block">
                  <label>Prix min</label>
                  <div class="price">${fmt(p.priceMin)}</div>
                </div>
                <div class="price-block">
                  <label>Prix max</label>
                  <div class="price gold">${fmt(p.priceMax)}</div>
                </div>
              </div>
            </div>
            <div class="product-footer">
              <span>Stock: ${p.stockQuantity ?? '—'}</span>
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

    window.runCentralise = async () => {
      const cat     = document.getElementById('cc-cat').value;
      const nbB     = parseInt(document.getElementById('cc-nb-buyers').value);
      const catProds= products.filter(p => p.category === cat);

      if (!catProds.length) { toast('Aucun produit dans cette catégorie', 'error'); return; }

      const selectedBuyers  = buyers.slice(0, nbB);
      const selectedSellers = catProds.slice(0, 3);
      const resultEl = document.getElementById('centralise-result');
      resultEl.innerHTML = loader();

      // Show 3-step process animation
      resultEl.innerHTML = `
        <div style="margin-top:28px">
          <div class="process-steps" id="steps">
            <div class="step active" id="step1">
              <div class="step-num">1</div>
              <div class="step-label">Collection des Offres</div>
              <div class="step-sub">(Bids)</div>
            </div>
            <div class="step" id="step2">
              <div class="step-num">2</div>
              <div class="step-label">Collection des Demandes</div>
              <div class="step-sub">(Asks)</div>
            </div>
            <div class="step" id="step3">
              <div class="step-num">3</div>
              <div class="step-label">Matching & Transaction</div>
              <div class="step-sub"></div>
            </div>
          </div>
          <div id="step-content" style="margin-top:16px">${loader()}</div>
        </div>`;

      // Simulate Step 1: Collect bids from buyers
      await sleep(1200);
      document.getElementById('step1').classList.add('done');
      document.getElementById('step2').classList.add('active');

      const bids = selectedBuyers.map((u, i) => {
        const p = AGENT_PROFILES[i] || AGENT_PROFILES[0];
        const bid = Math.round(catProds[0].priceMax * (0.6 + Math.random() * 0.25));
        return { buyer: u.name, strategy: p.strategy, bid };
      });

      // Simulate Step 2: Collect asks from sellers
      await sleep(1000);
      document.getElementById('step2').classList.add('done');
      document.getElementById('step3').classList.add('active');

      const asks = selectedSellers.map(p => {
        const ask = Math.round(p.priceMin * (1.05 + Math.random() * 0.15));
        return { seller: p.sellerName, product: p.name, ask, priceMin: p.priceMin };
      });

      // Simulate Step 3: Matching
      await sleep(1200);
      document.getElementById('step3').classList.add('done');

      // Simple matching: sort bids desc, asks asc, match pairs
      const sortedBids = [...bids].sort((a,b) => b.bid - a.bid);
      const sortedAsks = [...asks].sort((a,b) => a.ask - b.ask);
      const matches = [];
      for (let i = 0; i < Math.min(sortedBids.length, sortedAsks.length); i++) {
        if (sortedBids[i].bid >= sortedAsks[i].ask) {
          const price = Math.round((sortedBids[i].bid + sortedAsks[i].ask) / 2);
          const surplus = sortedBids[i].bid - price;
          matches.push({ buyer: sortedBids[i].buyer, seller: sortedAsks[i].seller, product: sortedAsks[i].product, price, surplus });
        }
      }

      const matchTable = matches.length ? `
        <div class="table-wrap" style="margin-top:16px">
          <table>
            <thead><tr><th>Acheteur</th><th>Vendeur</th><th>Produit</th><th>Prix Final</th><th>Surplus Acheteur</th></tr></thead>
            <tbody>
              ${matches.map(m => `<tr>
                <td>${m.buyer}</td>
                <td>${m.seller}</td>
                <td>${m.product}</td>
                <td class="text-gold font-bold">${fmt(m.price)}</td>
                <td class="text-green">+${fmt(m.surplus)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<div class="empty-state" style="padding:30px"><p>Aucun accord trouvé — prix trop éloignés</p></div>';

      document.getElementById('step-content').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
          <div class="stat-card"><div class="stat-label">Transactions</div><div class="stat-value">${matches.length}</div></div>
          <div class="stat-card"><div class="stat-label">Volume Total</div><div class="stat-value text-gold">${fmt(matches.reduce((s,m)=>s+m.price,0))}</div></div>
          <div class="stat-card"><div class="stat-label">Prix Moyen</div><div class="stat-value">${matches.length ? fmt(Math.round(matches.reduce((s,m)=>s+m.price,0)/matches.length)) : '—'}</div></div>
        </div>
        ${matchTable}`;
    };

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

    const totalBudget = AGENT_PROFILES.slice(0, buyers.length).reduce((s, p) => s + p.budget, 0);

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
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:var(--green)">✅ Vente via Négociation (${Math.floor(Math.random()*6)} produits)</span>
            </div>
            <div class="budget-bar" style="margin-top:8px">
              <div class="budget-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>

          <div class="agent-row"><span class="agent-row-label">Stratégie</span><span class="agent-row-value">${p.strategy}</span></div>
          <div class="agent-row"><span class="agent-row-label">Budget</span><span class="agent-row-value">${fmt(p.budget)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Solde</span><span style="color:var(--text)">${fmt(solde)}</span></div>
          <div class="agent-row"><span class="agent-row-label">Pénalités</span><span style="color:var(--red)">0 €</span></div>
        </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>👤 Profil des Agents Acheteurs</h1>
          <p>Consultez les soldes, pénalités et produits possédés par chaque agent</p>
        </div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-label">Total Agents</div><div class="stat-value">${buyers.length}</div></div>
          <div class="stat-card"><div class="stat-label">Budget Total</div><div class="stat-value text-gold">${fmt(totalBudget)}</div></div>
          <div class="stat-card"><div class="stat-label">Pénalités Totales</div><div class="stat-value text-red">0 €</div></div>
        </div>

        <div class="grid grid-2">${agentCards}</div>
      </div>`;
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

// ==================== INIT ====================
window.navigate = navigate;

document.addEventListener('DOMContentLoaded', () => {
  updateNavAgent();
  navigate('accueil');
});
