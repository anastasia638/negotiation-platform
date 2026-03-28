# Negotiation Platform

![Language](https://img.shields.io/badge/language-Java-ED8B00?style=flat-square&logo=openjdk)
![Framework](https://img.shields.io/badge/framework-Spring%20Boot-6DB33F?style=flat-square&logo=spring-boot)
![Database](https://img.shields.io/badge/database-PostgreSQL-316192?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/container-Docker-2496ED?style=flat-square&logo=docker)
![Security](https://img.shields.io/badge/security-Spring%20Security-6DB33F?style=flat-square&logo=spring)

> A web platform allowing buyers and sellers to negotiate product prices through
> structured offers and counter-offers, built with Java Spring Boot and PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Build & Run](#build--run)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

The **Negotiation Platform** is a RESTful web application that facilitates price negotiation between users. Instead of fixed prices, sellers can post products with a price range, and buyers can submit offers. The system manages the full negotiation lifecycle: initial offer, counter-offer, acceptance, and rejection — following an **alternating-offer protocol**.

This project demonstrates skills in **backend web development**, **REST API design**, **relational database modelling**, **layered architecture**, and **containerisation** with Docker.

---

## Features

- User management (buyers, sellers, admins)
- Product listing with price range and stock
- Negotiation lifecycle management (start, track, cancel)
- Alternating-offer protocol (propose, counter-offer, accept, reject)
- Negotiation history per buyer and seller
- Input validation with detailed error messages
- RESTful API with JSON responses
- Database migrations with Flyway
- Containerised deployment with Docker Compose

---

## Architecture

```
┌─────────────┐      HTTP      ┌──────────────────────┐      JPA      ┌────────────┐
│   Client    │ ────────────> │   Spring Boot API      │ ───────────> │ PostgreSQL │
│ (REST/JSON) │               │  Controllers           │              │  Database  │
└─────────────┘               │  Services              │              └────────────┘
                              │  Repositories          │
                              └──────────────────────-─┘
                                     Docker Container
```

---

## Project Structure

```
sa7-marketplace/
├── src/
│   └── main/
│       ├── java/com/marketplace/
│       │   ├── controller/
│       │   │   ├── ProductController.java
│       │   │   ├── UserController.java
│       │   │   ├── NegotiationController.java
│       │   │   ├── OfferController.java
│       │   │   ├── HealthController.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── service/
│       │   │   ├── ProductService.java
│       │   │   ├── UserService.java
│       │   │   ├── NegotiationService.java
│       │   │   └── OfferService.java
│       │   ├── repository/
│       │   │   ├── ProductRepository.java
│       │   │   ├── UserRepository.java
│       │   │   ├── NegotiationRepository.java
│       │   │   └── OfferRepository.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Product.java
│       │   │   ├── Negotiation.java
│       │   │   ├── Offer.java
│       │   │   ├── UserType.java
│       │   │   ├── NegotiationStatus.java
│       │   │   └── OfferStatus.java
│       │   ├── dto/
│       │   │   ├── ProductDTO.java
│       │   │   ├── UserDTO.java
│       │   │   ├── NegotiationDTO.java
│       │   │   └── OfferDTO.java
│       │   └── MarketplaceApplication.java
│       └── resources/
│           ├── application.properties
│           ├── application-dev.properties
│           ├── application-prod.properties
│           ├── data.sql
│           └── db/migration/
│               └── V1__init.sql
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── pom.xml
```

---

## Technologies

| Technology | Version | Role |
|------------|---------|------|
| Java | 17 | Core programming language |
| Spring Boot | 3.2 | Web framework, dependency injection |
| Spring Data JPA | 3.2 | ORM layer, database access |
| Spring Security | 6 | Authentication and authorisation |
| PostgreSQL | 16 | Relational database (production) |
| H2 | - | In-memory database (development) |
| Flyway | 9.x | Database migrations |
| JWT (jjwt) | 0.12.3 | Token-based authentication |
| Docker | latest | Containerisation |
| Docker Compose | v3 | Multi-container orchestration |
| Maven | 3.x | Build and dependency management |

---

## Build & Run

### Prerequisites

- Java 17+
- Maven 3.x
- Docker & Docker Compose

### Run with Docker Compose (recommended)

```bash
# Clone the repository
git clone https://github.com/anastasia638/negotiation-platform.git
cd negotiation-platform

# Create your environment file
cp .env.example .env
# Edit .env and fill in DB_PASSWORD and JWT_SECRET

# Build and start all services (Spring Boot + PostgreSQL)
docker-compose up --build

# API is available at http://localhost:8080
```

### Run locally (dev mode with H2)

```bash
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

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
| POST | `/api/negotiations` | Start a negotiation |
| GET | `/api/negotiations/{id}` | Get negotiation status + offer history |
| GET | `/api/negotiations/buyer/{buyerId}` | Get negotiations by buyer |
| GET | `/api/negotiations/seller/{sellerId}` | Get negotiations by seller |
| PATCH | `/api/negotiations/{id}/cancel` | Cancel a negotiation |

### Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/negotiations/{id}/offers` | List all offers for a negotiation |
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

## Author

**Meriem Silmi** — Computer Science Student, France

[![GitHub](https://img.shields.io/badge/GitHub-anastasia638-black?style=flat-square&logo=github)](https://github.com/anastasia638)
