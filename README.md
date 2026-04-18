# SA7 — Couture Marketplace

![Language](https://img.shields.io/badge/language-Java%2017-ED8B00?style=flat-square&logo=openjdk)
![Framework](https://img.shields.io/badge/framework-Spring%20Boot%203.2-6DB33F?style=flat-square&logo=springboot)
![Database](https://img.shields.io/badge/database-PostgreSQL%2016-316192?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/container-Docker-2496ED?style=flat-square&logo=docker)
![Security](https://img.shields.io/badge/security-Spring%20Security%20%2B%20JWT-6DB33F?style=flat-square&logo=spring)
![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS%20SPA-F7DF1E?style=flat-square&logo=javascript)

> A multi-agent negotiation marketplace for luxury fashion goods — buyers and sellers interact through structured, strategy-driven negotiation protocols across four distinct market types.

**Forge:** [forge.univ-lyon1.fr/p2308249/sa7-marketplace](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)

---

## Table of Contents

- [Overview](#overview)
- [Market Types](#market-types)
- [Architecture](#architecture)
- [Code Organisation](#code-organisation)
- [Technologies](#technologies)
- [Installation & Build](#installation--build)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Features Checklist](#features-checklist)

---

## Overview

**SA7 — Couture Marketplace** is a full-stack web application that simulates a luxury fashion marketplace where autonomous buyer agents negotiate product prices against seller agents using different strategic profiles.

Unlike fixed-price e-commerce, every transaction goes through a **negotiation lifecycle**: initial offer → counter-offer rounds → acceptance or rejection, following an alternating-offer protocol. Four market structures are available, each with distinct rules and agent behaviours.

The project demonstrates:
- **Backend:** REST API design, JPA/Hibernate ORM, Spring Security + JWT authentication, layered architecture, Flyway migrations
- **Frontend:** Single-page application (vanilla JS), dynamic rendering, localStorage persistence, animated chat-based negotiation UI
- **Agents:** Three seller strategy profiles (Greedy, Frugal, Cool-headed) and buyer concession logic adapted per strategy

---

## Market Types

| Market | Description |
|--------|-------------|
| **Marché Centralisé** | Double-auction: multiple buyers bid up, sellers ask down; price converges at equilibrium |
| **Marché Décentralisé** | Bilateral negotiation across multiple simultaneous sellers; buyer compares and chooses the best deal |
| **Achat Groupé** | A coalition of buyers pools demand for volume discounts; seller responds to group dynamics |
| **Négociation 1v1** | Direct, single buyer vs. single seller negotiation with full round history and convergence chart |
| **Comparateur** | Simulates all three seller strategies on the same product and compares outcomes side-by-side |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (SPA)                            │
│  index.html + app.js + style.css  (served from /static)      │
│  Navigate → renderPage() → REST calls → update DOM           │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / JSON
┌─────────────────────────▼────────────────────────────────────┐
│                  Spring Boot 3.2                              │
│  Controllers  →  Services  →  Repositories (JPA)             │
│  Spring Security (JWT Bearer token)                          │
└─────────────────────────┬────────────────────────────────────┘
                          │ JDBC / Hibernate
┌─────────────────────────▼────────────────────────────────────┐
│   PostgreSQL 16 (prod)  │  H2 in-memory (dev)                │
│   Flyway migrations     │  data.sql seed                      │
└──────────────────────────────────────────────────────────────┘
          All services run inside Docker Compose containers
```

---

## Code Organisation

```
sa7-marketplace/
│
├── src/main/java/com/marketplace/
│   │
│   ├── controller/          ← REST endpoints (HTTP layer)
│   │   ├── ProductController.java        GET/POST/PUT/DELETE /api/products
│   │   ├── UserController.java           GET/POST/PUT/DELETE /api/users
│   │   ├── NegotiationController.java    POST/GET/PATCH      /api/negotiations
│   │   ├── OfferController.java          POST/GET/PATCH      /api/negotiations/{id}/offers
│   │   ├── HealthController.java         GET                 /api/health
│   │   └── GlobalExceptionHandler.java   Unified error responses
│   │
│   ├── service/             ← Business logic (negotiation rules, offer validation)
│   │   ├── ProductService.java
│   │   ├── UserService.java
│   │   ├── NegotiationService.java       ← Alternating-offer protocol
│   │   └── OfferService.java             ← Accept / reject / counter logic
│   │
│   ├── repository/          ← Spring Data JPA (database access)
│   │   ├── ProductRepository.java
│   │   ├── UserRepository.java
│   │   ├── NegotiationRepository.java
│   │   └── OfferRepository.java
│   │
│   ├── model/               ← JPA entities
│   │   ├── User.java         (BUYER | SELLER | ADMIN)
│   │   ├── Product.java      (priceMin, priceMax, basePrice, stock)
│   │   ├── Negotiation.java  (status, finalPrice, rounds)
│   │   ├── Offer.java        (proposedPrice, quantity, roundNumber, status)
│   │   ├── UserType.java
│   │   ├── NegotiationStatus.java
│   │   └── OfferStatus.java
│   │
│   ├── dto/                 ← Data Transfer Objects (API payloads)
│   │   ├── ProductDTO.java
│   │   ├── UserDTO.java
│   │   ├── NegotiationDTO.java
│   │   └── OfferDTO.java
│   │
│   └── MarketplaceApplication.java       ← Spring Boot entry point
│
├── src/main/resources/
│   ├── application.properties            ← Base config (port 8080, profile=dev)
│   ├── application-dev.properties        ← H2 in-memory, DDL auto-create
│   ├── application-prod.properties       ← PostgreSQL, Flyway migrations
│   ├── data.sql                          ← Seed data (users, products)
│   └── db/migration/
│       └── V1__init.sql                  ← Flyway schema creation
│
├── src/main/resources/static/            ← Frontend (SPA, served by Spring Boot)
│   ├── index.html                        ← Shell: navbar, modals, script tag
│   ├── app.js                            ← All page renderers, API helpers, agent logic (~3800 lines)
│   └── style.css                         ← Full design system: tokens, layout, animations (~3600 lines)
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── pom.xml
```

### Finding specific features in `app.js`

| Feature | Search for |
|---------|-----------|
| Page routing | `navigate(` / `const routes =` |
| Marché Centralisé | `renderMarcheCentralise` |
| Marché Décentralisé | `renderMarcheDecentralise` |
| Achat Groupé | `renderAchatGroupe` |
| Négociation 1v1 | `renderNegociation1v1` |
| Comparateur | `renderComparateur` |
| Dashboard | `renderDashboard` |
| Buyer concession strategy | `buyerConcession(` |
| Seller auto-response | `apiAutoRespond(` |
| Convergence chart | `drawConvergenceChart(` |
| Rating system | `showRatingPrompt(` / `submitRating(` |
| Wishlist | `sa7_wishlist` |

---

## Technologies

| Technology | Version | Role |
|------------|---------|------|
| Java | 17 | Backend language |
| Spring Boot | 3.2 | Web framework, DI, auto-configuration |
| Spring Data JPA | 3.2 | ORM layer, repository pattern |
| Spring Security | 6 | Authentication & authorisation |
| JWT (jjwt) | 0.12.3 | Stateless token-based auth |
| PostgreSQL | 16 | Production relational database |
| H2 | — | In-memory database for development |
| Flyway | 9.x | Database schema migrations |
| Docker | latest | Containerisation |
| Docker Compose | v3 | Multi-container orchestration |
| Maven | 3.x | Build tool & dependency management |
| Vanilla JS | ES2020 | Frontend SPA (no framework) |

---

## Installation & Build

### Prerequisites

- Java 17+
- Maven 3.x
- Docker & Docker Compose (for production mode)

### Run in development mode (H2 in-memory, no Docker needed)

```bash
# Clone the repository
git clone https://forge.univ-lyon1.fr/p2308249/sa7-marketplace.git
cd sa7-marketplace

# Start with dev profile (H2 auto-creates schema, seeds data.sql)
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Open browser at:
# http://localhost:8080
```

The dev profile uses an H2 in-memory database — no external dependencies required. The application seeds itself with users and products on startup.

### Run with Docker Compose (PostgreSQL, production-like)

```bash
# Copy and fill in environment variables
cp .env.example .env
# Edit .env: set DB_PASSWORD and JWT_SECRET

# Build and start all containers
docker-compose up --build

# API + frontend available at:
# http://localhost:8080
```

### Build standalone JAR

```bash
mvn clean package -DskipTests
java -jar target/sa7-marketplace-*.jar --spring.profiles.active=dev
```

---

## API Reference

All endpoints are prefixed `/api`. Authentication uses **JWT Bearer tokens** — obtain a token via `POST /api/auth/login`.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Liveness check |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/{id}` | Update a user |
| DELETE | `/api/users/{id}` | Delete a user |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (paginated) |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

### Negotiations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/negotiations` | Open a negotiation (buyer + product) |
| GET | `/api/negotiations/{id}` | Get negotiation status and offer history |
| GET | `/api/negotiations/buyer/{buyerId}` | All negotiations for a buyer |
| GET | `/api/negotiations/seller/{sellerId}` | All negotiations for a seller |
| PATCH | `/api/negotiations/{id}/cancel` | Cancel a negotiation |

### Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/negotiations/{id}/offers` | All offers in a negotiation |
| POST | `/api/negotiations/{id}/offers` | Submit an offer or counter-offer |
| PATCH | `/api/negotiations/{id}/offers/{offerId}/accept` | Accept an offer |
| PATCH | `/api/negotiations/{id}/offers/{offerId}/reject` | Reject an offer definitively |

---

## Database Schema

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

## Features Checklist

### Negotiation Markets
- [x] Marché Centralisé — double auction with convergence chart
- [x] Marché Décentralisé — multi-seller bilateral negotiation
- [x] Achat Groupé — coalition buying with volume dynamics
- [x] Négociation 1v1 — direct human vs. agent negotiation
- [x] Comparateur — side-by-side strategy comparison

### Agent System
- [x] Three seller strategies: Greedy, Frugal, Cool-headed
- [x] Buyer concession logic adapted per active strategy
- [x] Strategy success tracking (real data in Dashboard)
- [x] Agent profiles with authentication (JWT)

### UX & Data
- [x] Animated chat interface for all negotiation types
- [x] Convergence chart (dual-bar: buyer gold / seller crimson)
- [x] Wishlist with localStorage persistence
- [x] Negotiation history with CSV export
- [x] Post-negotiation star rating system
- [x] Analytical dashboard with live strategy stats
- [x] Admin panel for user/product management
- [x] High-contrast accessibility toggle

---

## Author

**Meriem Silmi** — Computer Science Student, Université Claude Bernard Lyon 1

[![Forge](https://img.shields.io/badge/Forge-p2308249-orange?style=flat-square)](https://forge.univ-lyon1.fr/p2308249/sa7-marketplace)
