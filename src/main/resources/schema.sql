-- Schema SQL complet (PostgreSQL compatible)

-- Créer les types ENUM d'abord
CREATE TYPE user_type_enum AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE negotiation_status_enum AS ENUM ('PENDING', 'NEGOTIATING', 'AGREED', 'FAILED');
CREATE TYPE offer_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type user_type_enum,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    attributes JSONB,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, name)
);

-- Table negotiations
CREATE TABLE negotiations (
    id SERIAL PRIMARY KEY,
    buyer_agent_id INT NOT NULL,
    seller_agent_id INT NOT NULL,
    product_id INT NOT NULL REFERENCES products(id),
    status negotiation_status_enum DEFAULT 'PENDING',
    final_price DECIMAL(10, 2),
    final_quantity INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Table offers
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    negotiation_id INT NOT NULL REFERENCES negotiations(id),
    sender_id INT NOT NULL,
    proposed_price DECIMAL(10, 2) NOT NULL,
    proposed_quantity INT DEFAULT 1,
    round_number INT NOT NULL,
    status offer_status_enum DEFAULT 'PENDING',
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer les INDEX séparément (pas inline)
CREATE INDEX idx_offers_negotiation_id ON offers(negotiation_id);
CREATE INDEX idx_offers_created_at ON offers(created_at);
