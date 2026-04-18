-- Schema SQL pour H2 (tests unitaires)
-- IF NOT EXISTS évite le conflit avec ddl-auto=create-drop de Hibernate

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    user_type  VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id      BIGINT NOT NULL,
    name           VARCHAR(255) NOT NULL,
    category       VARCHAR(100),
    brand          VARCHAR(100),
    price_min      DECIMAL(10, 2),
    price_max      DECIMAL(10, 2),
    base_price     DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    UNIQUE(seller_id, name)
);

CREATE TABLE IF NOT EXISTS negotiations (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id       BIGINT NOT NULL,
    seller_id      BIGINT NOT NULL,
    product_id     BIGINT NOT NULL,
    status         VARCHAR(20) DEFAULT 'PENDING',
    final_price    DECIMAL(10, 2),
    final_quantity INT,
    started_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at       TIMESTAMP,
    FOREIGN KEY (buyer_id)   REFERENCES users(id),
    FOREIGN KEY (seller_id)  REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS offers (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    negotiation_id    BIGINT NOT NULL,
    sender_id         BIGINT NOT NULL,
    proposed_price    DECIMAL(10, 2) NOT NULL,
    proposed_quantity INT DEFAULT 1,
    round_number      INT NOT NULL,
    status            VARCHAR(20) DEFAULT 'PENDING',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negotiation_id) REFERENCES negotiations(id),
    FOREIGN KEY (sender_id)      REFERENCES users(id)
);
