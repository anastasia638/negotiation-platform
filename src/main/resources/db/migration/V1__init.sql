-- ============================================================
-- V1 - Schéma initial SA7 Marketplace
-- ============================================================

-- Table users
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)                                    NOT NULL,
    email       VARCHAR(255)                                    NOT NULL UNIQUE,
    user_type   VARCHAR(20) CHECK (user_type IN ('BUYER', 'SELLER', 'ADMIN')),
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP          NOT NULL,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP          NOT NULL
);

-- Table products
CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    seller_id       BIGINT          NOT NULL REFERENCES users(id),
    name            VARCHAR(255)    NOT NULL,
    category        VARCHAR(100),
    brand           VARCHAR(100),
    price_min       DECIMAL(10, 2),
    price_max       DECIMAL(10, 2),
    base_price      DECIMAL(10, 2),
    stock_quantity  INT             DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (seller_id, name)
);

-- Table negotiations
CREATE TABLE negotiations (
    id              BIGSERIAL PRIMARY KEY,
    buyer_id        BIGINT          NOT NULL REFERENCES users(id),
    seller_id       BIGINT          NOT NULL REFERENCES users(id),
    product_id      BIGINT          NOT NULL REFERENCES products(id),
    status          VARCHAR(20)     DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'NEGOTIATING', 'AGREED', 'FAILED'))
                        NOT NULL,
    final_price     DECIMAL(10, 2),
    final_quantity  INT,
    started_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at        TIMESTAMP
);

-- Table offers
CREATE TABLE offers (
    id                  BIGSERIAL PRIMARY KEY,
    negotiation_id      BIGINT          NOT NULL REFERENCES negotiations(id),
    sender_id           BIGINT          NOT NULL REFERENCES users(id),
    proposed_price      DECIMAL(10, 2)  NOT NULL,
    proposed_quantity   INT             DEFAULT 1,
    round_number        INT             NOT NULL,
    status              VARCHAR(20)     DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED'))
                            NOT NULL,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_products_seller_id        ON products(seller_id);
CREATE INDEX idx_negotiations_buyer_id     ON negotiations(buyer_id);
CREATE INDEX idx_negotiations_seller_id    ON negotiations(seller_id);
CREATE INDEX idx_negotiations_product_id   ON negotiations(product_id);
CREATE INDEX idx_negotiations_status       ON negotiations(status);
CREATE INDEX idx_offers_negotiation_id     ON offers(negotiation_id);
CREATE INDEX idx_offers_created_at         ON offers(created_at);
