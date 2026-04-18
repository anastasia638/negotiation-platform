# SA7 — Couture Marketplace

![Language](https://img.shields.io/badge/language-Java%2017-ED8B00?style=flat-square&logo=openjdk)
![Framework](https://img.shields.io/badge/framework-Spring%20Boot%203.2-6DB33F?style=flat-square&logo=springboot)
![Database](https://img.shields.io/badge/database-PostgreSQL%2016-316192?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/container-Docker-2496ED?style=flat-square&logo=docker)
![Security](https://img.shields.io/badge/security-Spring%20Security%20%2B%20JWT-6DB33F?style=flat-square&logo=spring)
![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS%20SPA-F7DF1E?style=flat-square&logo=javascript)

> Une marketplace de négociation multi-agents pour la mode de luxe — acheteurs et vendeurs interagissent via des protocoles de négociation structurés et stratégiques sur quatre types de marchés distincts.

**Forge :** [forge.univ-lyon1.fr/p2308249/sa7-marketplace](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)

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
- **Backend :** conception d'API REST, ORM JPA/Hibernate, authentification Spring Security + JWT, architecture en couches, migrations Flyway
- **Frontend :** application monopage (vanilla JS), rendu dynamique, persistance localStorage, interface de négociation animée sous forme de chat
- **Agents :** trois profils de stratégie vendeur (Agressif, Conservateur, Adaptatif) et logique de concession acheteur adaptée par stratégie

---

## Types de marchés

| Marché | Description |
|--------|-------------|
| **Marché Centralisé** | Double enchère : les acheteurs montent leurs offres, les vendeurs baissent leurs prix ; convergence vers un équilibre |
| **Marché Décentralisé** | Négociation bilatérale simultanée avec plusieurs vendeurs ; l'acheteur compare et choisit la meilleure offre |
| **Achat Groupé** | Une coalition d'acheteurs mutualise la demande pour obtenir des remises sur volume |
| **Négociation 1v1** | Négociation directe acheteur contre vendeur avec historique complet des rounds et graphique de convergence |
| **Comparateur** | Simule les trois stratégies vendeur sur le même produit et compare les résultats côte à côte |

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
│  Spring Security (JWT Bearer token)                          │
└─────────────────────────┬────────────────────────────────────┘
                          │ JDBC / Hibernate
┌─────────────────────────▼────────────────────────────────────┐
│   PostgreSQL 16 (prod)  │  H2 en mémoire (dev)               │
│   Migrations Flyway     │  données initiales data.sql         │
└──────────────────────────────────────────────────────────────┘
        Tous les services tournent dans des conteneurs Docker Compose
```

---

## Organisation du code

```
sa7-marketplace/
│
├── src/main/java/com/marketplace/
│   │
│   ├── controller/          ← Points d'entrée REST (couche HTTP)
│   │   ├── ProductController.java        GET/POST/PUT/DELETE /api/products
│   │   ├── UserController.java           GET/POST/PUT/DELETE /api/users
│   │   ├── NegotiationController.java    POST/GET/PATCH      /api/negotiations
│   │   ├── OfferController.java          POST/GET/PATCH      /api/negotiations/{id}/offers
│   │   ├── HealthController.java         GET                 /api/health
│   │   └── GlobalExceptionHandler.java   Réponses d'erreur unifiées
│   │
│   ├── service/             ← Logique métier (règles de négociation, validation des offres)
│   │   ├── ProductService.java
│   │   ├── UserService.java
│   │   ├── NegotiationService.java       ← Protocole d'offres alternées
│   │   └── OfferService.java             ← Accepter / refuser / contre-offre
│   │
│   ├── repository/          ← Spring Data JPA (accès base de données)
│   │   ├── ProductRepository.java
│   │   ├── UserRepository.java
│   │   ├── NegotiationRepository.java
│   │   └── OfferRepository.java
│   │
│   ├── model/               ← Entités JPA
│   │   ├── User.java         (BUYER | SELLER | ADMIN)
│   │   ├── Product.java      (priceMin, priceMax, basePrice, stock)
│   │   ├── Negotiation.java  (status, finalPrice, rounds)
│   │   ├── Offer.java        (proposedPrice, quantity, roundNumber, status)
│   │   ├── UserType.java
│   │   ├── NegotiationStatus.java
│   │   └── OfferStatus.java
│   │
│   ├── dto/                 ← Objets de transfert de données (payloads API)
│   │   ├── ProductDTO.java
│   │   ├── UserDTO.java
│   │   ├── NegotiationDTO.java
│   │   └── OfferDTO.java
│   │
│   └── MarketplaceApplication.java       ← Point d'entrée Spring Boot
│
├── src/main/resources/
│   ├── application.properties            ← Config de base (port 8080, profil=dev)
│   ├── application-dev.properties        ← H2 en mémoire, DDL auto-create
│   ├── application-prod.properties       ← PostgreSQL, migrations Flyway
│   ├── data.sql                          ← Données initiales (utilisateurs, produits)
│   └── db/migration/
│       └── V1__init.sql                  ← Création du schéma par Flyway
│
├── src/main/resources/static/            ← Frontend (SPA servi par Spring Boot)
│   ├── index.html                        ← Squelette : navbar, modales, balise script
│   ├── app.js                            ← Tous les rendus de pages, helpers API, logique agents (~3800 lignes)
│   └── style.css                         ← Système de design complet : tokens, layout, animations (~3600 lignes)
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── pom.xml
```

### Retrouver une fonctionnalité dans `app.js`

| Fonctionnalité | Chercher |
|----------------|---------|
| Routage des pages | `navigate(` / `const routes =` |
| Marché Centralisé | `renderMarcheCentralise` |
| Marché Décentralisé | `renderMarcheDecentralise` |
| Achat Groupé | `renderAchatGroupe` |
| Négociation 1v1 | `renderNegociation1v1` |
| Comparateur | `renderComparateur` |
| Dashboard | `renderDashboard` |
| Concession acheteur | `buyerConcession(` |
| Réponse automatique vendeur | `apiAutoRespond(` |
| Graphique de convergence | `drawConvergenceChart(` |
| Système de notation | `showRatingPrompt(` / `submitRating(` |
| Liste de favoris | `sa7_wishlist` |

---

## Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 17 | Langage backend |
| Spring Boot | 3.2 | Framework web, injection de dépendances |
| Spring Data JPA | 3.2 | Couche ORM, pattern repository |
| Spring Security | 6 | Authentification et autorisation |
| JWT (jjwt) | 0.12.3 | Authentification sans état par token |
| PostgreSQL | 16 | Base de données relationnelle (production) |
| H2 | — | Base de données en mémoire (développement) |
| Flyway | 9.x | Migrations de schéma |
| Docker | latest | Conteneurisation |
| Docker Compose | v3 | Orchestration multi-conteneurs |
| Maven | 3.x | Outil de build et gestion des dépendances |
| Vanilla JS | ES2020 | SPA frontend (sans framework) |

---

## Installation & Lancement

### Prérequis

- Java 17+
- Maven 3.x
- Docker & Docker Compose (pour le mode production)

### Mode développement (H2 en mémoire, sans Docker)

```bash
# Cloner le dépôt
git clone https://forge.univ-lyon1.fr/p2308249/sa7-marketplace.git
cd sa7-marketplace

# Lancer avec le profil dev (H2 crée le schéma automatiquement et charge data.sql)
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Ouvrir dans le navigateur :
# http://localhost:8080
```

Le profil dev utilise une base H2 en mémoire — aucune dépendance externe requise. L'application se peuple automatiquement avec des utilisateurs et des produits au démarrage.

### Mode production avec Docker Compose (PostgreSQL)

```bash
# Copier et renseigner les variables d'environnement
cp .env.example .env
# Éditer .env : définir DB_PASSWORD et JWT_SECRET

# Construire et démarrer tous les conteneurs
docker-compose up --build

# API + frontend disponibles sur :
# http://localhost:8080
```

### Construire un JAR autonome

```bash
mvn clean package -DskipTests
java -jar target/sa7-marketplace-*.jar --spring.profiles.active=dev
```

---

## Référence API

Tous les endpoints sont préfixés `/api`. L'authentification utilise des **tokens JWT Bearer** — obtenir un token via `POST /api/auth/login`.

### Santé

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Vérification de disponibilité |

### Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Lister tous les utilisateurs |
| GET | `/api/users/{id}` | Obtenir un utilisateur par ID |
| POST | `/api/users` | Créer un utilisateur |
| PUT | `/api/users/{id}` | Modifier un utilisateur |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur |

### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Lister les produits (paginé) |
| GET | `/api/products/{id}` | Obtenir un produit par ID |
| POST | `/api/products` | Créer un produit |
| PUT | `/api/products/{id}` | Modifier un produit |
| DELETE | `/api/products/{id}` | Supprimer un produit |

### Négociations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/negotiations` | Ouvrir une négociation (acheteur + produit) |
| GET | `/api/negotiations/{id}` | Statut et historique des offres |
| GET | `/api/negotiations/buyer/{buyerId}` | Toutes les négociations d'un acheteur |
| GET | `/api/negotiations/seller/{sellerId}` | Toutes les négociations d'un vendeur |
| PATCH | `/api/negotiations/{id}/cancel` | Annuler une négociation |

### Offres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/negotiations/{id}/offers` | Toutes les offres d'une négociation |
| POST | `/api/negotiations/{id}/offers` | Soumettre une offre ou contre-offre |
| PATCH | `/api/negotiations/{id}/offers/{offerId}/accept` | Accepter une offre |
| PATCH | `/api/negotiations/{id}/offers/{offerId}/reject` | Refuser définitivement une offre |

---

## Schéma de base de données

```sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  user_type  VARCHAR(20) CHECK (user_type IN ('BUYER', 'SELLER', 'ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
- [x] Négociation 1v1 — négociation directe humain contre agent
- [x] Comparateur — comparaison des stratégies côte à côte

### Système d'agents
- [x] Trois stratégies vendeur : Agressif, Conservateur, Adaptatif
- [x] Logique de concession acheteur adaptée par stratégie active
- [x] Suivi du taux de succès par stratégie (données réelles dans le Dashboard)
- [x] Profils d'agents avec authentification JWT

### UX & Données
- [x] Interface de chat animée pour tous les types de négociation
- [x] Graphique de convergence (double barre : acheteur or / vendeur cramoisi)
- [x] Liste de favoris avec persistance localStorage
- [x] Historique des négociations avec export CSV
- [x] Système de notation post-négociation (étoiles)
- [x] Tableau de bord analytique avec statistiques stratégiques en direct
- [x] Panneau d'administration pour la gestion des utilisateurs et produits
- [x] Bascule d'accessibilité contraste élevé

---

## Auteur

**Meriem Silmi** — Étudiante en Informatique, Université Claude Bernard Lyon 1

[![Forge](https://img.shields.io/badge/Forge-p2308249-orange?style=flat-square)](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)
