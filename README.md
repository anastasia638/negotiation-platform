<div align="center">

# ◆ SA7 — Couture Marketplace

*Une marketplace de négociation multi-agents pour la mode de luxe*

<br/>

[![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg?style=flat-square)](LICENSE)
[![Forge](https://img.shields.io/badge/Forge_Lyon_1-p2308249-blueviolet?style=flat-square)](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)

<br/>

> Acheteurs et vendeurs autonomes interagissent via des protocoles de négociation structurés  
> sur quatre types de marchés distincts — le tout dans une interface de luxe animée.

</div>

---

## Table des matières

- [Présentation](#présentation)
- [Types de marchés](#types-de-marchés)
- [Architecture](#architecture)
- [Organisation du code](#organisation-du-code)
- [Technologies](#technologies)
- [Installation & Lancement](#installation--lancement)
- [Référence API](#référence-api)
- [Schéma de base de données](#schéma-de-base-de-données)
- [Fonctionnalités](#fonctionnalités)

---

## Présentation

**SA7 — Couture Marketplace** est une application web full-stack simulant une marketplace de mode de luxe où des agents acheteurs autonomes négocient les prix de produits face à des agents vendeurs dotés de profils stratégiques différents.

Contrairement à un e-commerce à prix fixe, chaque transaction passe par un **cycle de négociation complet** : offre initiale → tours de contre-offres → acceptation ou refus, selon un protocole d'offres alternées. Quatre structures de marché sont disponibles, chacune avec ses propres règles et comportements d'agents.

Le projet illustre :
- **Backend :** conception d'API REST, ORM JPA/Hibernate, authentification Spring Security + JWT, architecture en couches (Controller → Service → Repository), validation des participants et des transitions d'état
- **Frontend :** application monopage (vanilla JS), rendu dynamique, persistance localStorage, interface de négociation animée sous forme de chat
- **Agents :** trois profils de stratégie vendeur (Agressif, Conservateur, Adaptatif) et logique de concession acheteur adaptée par stratégie active

---

## Types de marchés

| Marché | Mécanisme | Participants |
|--------|-----------|-------------|
| 🏛 **Marché Centralisé** | Double enchère — les acheteurs montent, les vendeurs baissent ; convergence vers l'équilibre | N acheteurs × N vendeurs |
| 🔀 **Marché Décentralisé** | Négociation bilatérale simultanée ; l'acheteur compare et choisit la meilleure offre | 1 acheteur × N vendeurs |
| 👥 **Achat Groupé** | Coalition d'acheteurs qui mutualise la demande pour obtenir des remises sur volume | N acheteurs × 1 vendeur |
| 🎯 **Négociation 1v1** | Duel direct avec historique complet des rounds et graphique de convergence | 1 acheteur × 1 vendeur |
| ⚖ **Comparateur** | Simulation des trois stratégies vendeur sur le même produit, résultats côte à côte | Analyse comparative |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Navigateur (SPA)                         │
│  index.html + app.js + style.css  (servis depuis /static)    │
│  navigate() → renderPage() → appels REST → mise à jour DOM   │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / JSON
┌─────────────────────────▼────────────────────────────────────┐
│                  Spring Boot 3.2                              │
│  Controllers  →  Services  →  Repositories (JPA)             │
│  Spring Security  ·  JWT Bearer token                        │
└─────────────────────────┬────────────────────────────────────┘
                          │ JDBC / Hibernate
┌─────────────────────────▼────────────────────────────────────┐
│   PostgreSQL 16 (prod)  │  H2 en mémoire (dev)               │
│   schéma via Hibernate  │  données initiales data.sql         │
└──────────────────────────────────────────────────────────────┘
        Tous les services tournent dans des conteneurs Docker Compose
```

---

## Organisation du code

```
sa7-marketplace/
│
├── src/main/java/com/marketplace/
│   ├── controller/        ← Couche HTTP — points d'entrée REST
│   │   ├── ProductController.java          /api/products
│   │   ├── UserController.java             /api/users
│   │   ├── NegotiationController.java      /api/negotiations
│   │   ├── OfferController.java            /api/negotiations/{id}/offers
│   │   ├── HealthController.java           /api/health
│   │   └── GlobalExceptionHandler.java     Erreurs unifiées
│   │
│   ├── service/           ← Logique métier — protocole de négociation
│   │   ├── NegotiationService.java         Protocole d'offres alternées
│   │   └── OfferService.java               Accepter / refuser / contre-offre
│   │
│   ├── repository/        ← Spring Data JPA — accès base de données
│   ├── model/             ← Entités JPA (User, Product, Negotiation, Offer)
│   ├── dto/               ← Objets de transfert (payloads API)
│   └── MarketplaceApplication.java
│
├── src/main/resources/
│   ├── application-dev.properties          H2 en mémoire, DDL auto
│   ├── application-prod.properties         PostgreSQL, schéma via Hibernate
│   └── data.sql                            Données initiales (vendeurs, produits)
│
├── src/main/resources/static/             ← Frontend SPA
│   ├── index.html          Squelette : navbar, modales
│   ├── app.js              Rendus de pages, helpers API, agents  (~3 800 lignes)
│   └── style.css           Système de design, tokens, animations (~3 600 lignes)
│
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

### Retrouver une fonctionnalité dans `app.js`

Les sections sont délimitées par des commentaires de la forme `//— NOM —`.

| Fonctionnalité | Rechercher dans `app.js` |
|----------------|--------------------------|
| Routage des pages | `//— ROUTER —` |
| Marché Centralisé | `//— PAGE: MARCHÉ CENTRALISÉ —` |
| Marché Décentralisé | `//— PAGE: MARCHÉ DÉCENTRALISÉ —` |
| Achat Groupé | `//— PAGE: ACHAT GROUPÉ —` |
| Négociation 1v1 | `//— PAGE: NÉGOCIATION 1V1 —` |
| Comparateur | `renderComparateur` |
| Dashboard analytique | `//— FEATURE 4: DASHBOARD ANALYTIQUE —` |
| Concession acheteur | `buyerConcession(` |
| Réponse automatique vendeur | `apiAutoRespond(` |
| Graphique de convergence | `drawConvergenceChart(` |
| Système de notation | `showRatingPrompt(` |

---

## Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 17 | Langage backend |
| Spring Boot | 3.2 | Framework web, injection de dépendances |
| Spring Data JPA | 3.2 | Couche ORM, pattern repository |
| Spring Security | 6 | Authentification et autorisation |
| JWT (jjwt) | 0.12.3 | Tokens sans état (Bearer) |
| PostgreSQL | 16 | Base de données relationnelle (production) |
| H2 | — | Base de données en mémoire (développement) |
| Docker | latest | Conteneurisation |
| Docker Compose | v3 | Orchestration multi-conteneurs |
| Maven | 3.x | Build et gestion des dépendances |
| Vanilla JS | ES2020 | SPA frontend (sans framework) |

---

## Installation & Lancement

### Prérequis

- Java 17+
- Maven 3.x
- Docker & Docker Compose *(mode production uniquement)*

### Mode développement — H2 en mémoire, sans Docker

```bash
# Cloner le dépôt
git clone https://forge.univ-lyon1.fr/p2308249/sa7-marketplace.git
cd sa7-marketplace

# Compiler et lancer avec le profil dev
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

L'application est disponible sur **http://localhost:8080**

> Le profil `dev` utilise une base H2 en mémoire et se peuple automatiquement via `data.sql` — aucune configuration externe requise.

### Mode production — PostgreSQL + Docker Compose

```bash
cp .env.example .env
# Renseigner DB_PASSWORD et JWT_SECRET dans .env

docker-compose up --build
```

### Construire un JAR autonome

```bash
mvn clean package -DskipTests
java -jar target/sa7-marketplace-*.jar --spring.profiles.active=dev
```

### Comptes de démonstration

En profil `dev`, la base est peuplée automatiquement via `data.sql`. Tous les comptes utilisent le mot de passe `password` (BCrypt) — ce mot de passe est intentionnel pour faciliter les tests et l'évaluation, il ne doit pas être utilisé en production.

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Acheteur | alice@sa7.com | `password` |
| Acheteur | bob@sa7.com | `password` |
| Vendeur | trystan@sa7.com | `password` |
| Admin | admin@sa7.com | `password` |

> L'interface permet de sélectionner un profil directement depuis l'accueil — la connexion JWT est gérée automatiquement.

---

## Notes de sécurité

Ce projet est une démonstration académique. Plusieurs mesures de sécurité sont volontairement simplifiées pour faciliter le test local :

| Mesure | Valeur en dev | Raison |
|--------|---------------|--------|
| CSRF | Désactivé | SPA sans cookies de session |
| CORS | Désactivé | Accès local uniquement |
| JWT secret | Valeur fixe dans `application-dev.properties` | Pas de secrets en production dans ce profil |
| Tokens JWT | Stockés en `localStorage` | Standard SPA, acceptable hors production |

En profil `prod` (Docker Compose), le secret JWT est injecté via variable d'environnement `.env` et ne figure pas dans le code.

---

## Référence API

Tous les endpoints sont préfixés `/api`. L'authentification utilise des **tokens JWT Bearer** obtenus via `POST /api/auth/login`.

### Santé

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Vérification de disponibilité |

### Utilisateurs `/api/users`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/users` | Lister tous les utilisateurs |
| `GET` | `/api/users/{id}` | Obtenir un utilisateur par ID |
| `POST` | `/api/users` | Créer un utilisateur |
| `PUT` | `/api/users/{id}` | Modifier un utilisateur |
| `DELETE` | `/api/users/{id}` | Supprimer un utilisateur |

### Produits `/api/products`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/products` | Lister les produits (paginé) |
| `GET` | `/api/products/{id}` | Obtenir un produit par ID |
| `POST` | `/api/products` | Créer un produit |
| `PUT` | `/api/products/{id}` | Modifier un produit |
| `DELETE` | `/api/products/{id}` | Supprimer un produit |

### Négociations `/api/negotiations`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/negotiations` | Ouvrir une négociation |
| `GET` | `/api/negotiations/{id}` | Statut et historique des offres |
| `GET` | `/api/negotiations/buyer/{buyerId}` | Négociations d'un acheteur |
| `GET` | `/api/negotiations/seller/{sellerId}` | Négociations d'un vendeur |
| `PATCH` | `/api/negotiations/{id}/cancel` | Annuler une négociation |

### Offres `/api/negotiations/{id}/offers`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/negotiations/{id}/offers` | Toutes les offres |
| `POST` | `/api/negotiations/{id}/offers` | Soumettre une offre |
| `PATCH` | `.../offers/{offerId}/accept` | Accepter une offre |
| `PATCH` | `.../offers/{offerId}/reject` | Refuser définitivement |

---

## Schéma de base de données

```sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  user_type  VARCHAR(20)  CHECK (user_type IN ('BUYER','SELLER','ADMIN')),
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id             BIGSERIAL PRIMARY KEY,
  seller_id      BIGINT REFERENCES users(id),
  name           VARCHAR(255) NOT NULL,
  category       VARCHAR(100),
  brand          VARCHAR(100),
  price_min      DECIMAL(10,2),
  price_max      DECIMAL(10,2),
  base_price     DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE negotiations (
  id             BIGSERIAL PRIMARY KEY,
  buyer_id       BIGINT REFERENCES users(id),
  seller_id      BIGINT REFERENCES users(id),
  product_id     BIGINT REFERENCES products(id),
  status         VARCHAR(20) DEFAULT 'PENDING',
  final_price    DECIMAL(10,2),
  final_quantity INT,
  started_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at       TIMESTAMP
);

CREATE TABLE offers (
  id                BIGSERIAL PRIMARY KEY,
  negotiation_id    BIGINT REFERENCES negotiations(id),
  sender_id         BIGINT REFERENCES users(id),
  proposed_price    DECIMAL(10,2) NOT NULL,
  proposed_quantity INT DEFAULT 1,
  round_number      INT NOT NULL,
  status            VARCHAR(20) DEFAULT 'PENDING',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Fonctionnalités

### Marchés de négociation
- [x] Marché Centralisé — double enchère avec graphique de convergence
- [x] Marché Décentralisé — négociation bilatérale multi-vendeurs
- [x] Achat Groupé — achat coalitionnel avec dynamique de volume
- [x] Négociation 1v1 — duel humain contre agent
- [x] Comparateur — comparaison des trois stratégies côte à côte

### Système d'agents
- [x] Trois stratégies vendeur : Agressif (`GREEDY`), Conservateur (`FRUGAL`), Adaptatif (`COOL_HEADED`)
- [x] Logique de concession acheteur adaptée par stratégie active (`buyerConcession`)
- [x] Validation des participants à chaque round (acheteur / vendeur uniquement)
- [x] Suivi du taux de succès par stratégie (données réelles dans le Dashboard)
- [x] Profils d'agents avec authentification JWT automatique

### UX & Données
- [x] Interface de chat animée pour tous les types de négociation
- [x] Graphique de convergence (double barre : acheteur or / vendeur cramoisi)
- [x] Liste de favoris avec persistance localStorage
- [x] Historique des négociations avec export CSV
- [x] Système de notation post-négociation (étoiles)
- [x] Tableau de bord analytique avec statistiques en direct
- [x] Panneau d'administration pour la gestion des utilisateurs et produits
- [x] Bascule d'accessibilité contraste élevé

---

<div align="center">

**Meriem Silmi** — Étudiante en Informatique, Université Claude Bernard Lyon 1

[![Forge](https://img.shields.io/badge/Forge-p2308249/sa7--marketplace-blueviolet?style=for-the-badge&logo=gitlab)](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>
