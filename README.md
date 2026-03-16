# Negotiation Platform

![Language](https://img.shields.io/badge/language-Java-ED8B00?style=flat-square&logo=openjdk)
![Framework](https://img.shields.io/badge/framework-Spring%20Boot-6DB33F?style=flat-square&logo=spring-boot)
![Database](https://img.shields.io/badge/database-PostgreSQL-316192?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/container-Docker-2496ED?style=flat-square&logo=docker)

> A web platform allowing buyers and sellers to negotiate product prices through structured offers and counter-offers, built with Java Spring Boot and PostgreSQL.

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

The **Negotiation Platform** is a RESTful web application that facilitates price negotiation between users. Instead of fixed prices, sellers can post products with an initial price, and buyers can submit offers. The system manages the full negotiation lifecycle: initial offer, counter-offer, acceptance, and rejection.

This project demonstrates skills in **backend web development**, **REST API design**, **relational database modelling**, and **containerisation** with Docker.

---

## Features

- User registration and authentication
- Product listing with base price
- Offer submission by buyers
- Counter-offer mechanism for sellers
- Offer acceptance / rejection workflow
- Negotiation history and status tracking
- RESTful API with JSON responses
- Containerised deployment with Docker Compose

---

## Architecture

```
┌─────────────┐      HTTP       ┌────────────────┐      JPA      ┌────────────┐
│   Client    │ ───────────> │  Spring Boot API   │ ─────────> │ PostgreSQL │
│ (REST/JSON) │            │  (Controllers,     │           │  Database  │
└─────────────┘            │   Services, Repos) │           └────────────┘
                           └────────────────┘
                           │ Docker Container   │
```

---

## Project Structure

```
negotiation-platform/
├── src/
│   └── main/
│       ├── java/com/negotiation/
│       │   ├── controller/
│       │   │   ├── UserController.java
│       │   │   ├── ProductController.java
│       │   │   └── NegotiationController.java
│       │   ├── service/
│       │   │   ├── UserService.java
│       │   │   ├── ProductService.java
│       │   │   └── NegotiationService.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── ProductRepository.java
│       │   │   └── OfferRepository.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Product.java
│       │   │   ├── Offer.java
│       │   │   └── NegotiationStatus.java (enum)
│       │   └── NegotiationApplication.java
│       └── resources/
│           ├── application.properties
│           └── application-docker.properties
├── docker-compose.yml
├── Dockerfile
├── pom.xml
└── README.md
```

---

## Technologies

| Technology | Version | Role |
|------------|---------|------|
| Java | 17 | Core programming language |
| Spring Boot | 3.x | Web framework, dependency injection |
| Spring Data JPA | 3.x | ORM layer, database access |
| PostgreSQL | 15 | Relational database |
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

# Build and start all services (Spring Boot + PostgreSQL)
docker-compose up --build

# API is available at http://localhost:8080
```

### Run locally

```bash
# Configure database in src/main/resources/application.properties
# Then build and run
mvn clean install
mvn spring-boot:run
```

---

## API Reference

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| GET | `/api/users/{id}` | Get user by ID |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a new product |
| GET | `/api/products/{id}` | Get product details |

### Negotiations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/negotiations` | Start a negotiation (submit offer) |
| PUT | `/api/negotiations/{id}/counter` | Submit a counter-offer |
| PUT | `/api/negotiations/{id}/accept` | Accept the current offer |
| PUT | `/api/negotiations/{id}/reject` | Reject the current offer |
| GET | `/api/negotiations/{id}` | Get negotiation status |

---

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  seller_id INT REFERENCES users(id)
);

CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  buyer_id INT REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, COUNTER, ACCEPTED, REJECTED
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Author

**Meriem Silmi** — Computer Science Student, France

[![GitHub](https://img.shields.io/badge/GitHub-anastasia638-black?style=flat-square&logo=github)](https://github.com/anastasia638)
