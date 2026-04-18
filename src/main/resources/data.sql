-- Données de test (profil dev uniquement)
-- Mots de passe : tous "password" hashés avec BCrypt
INSERT INTO users (name, email, password, user_type) VALUES
('Alice Acheteur',    'alice@sa7.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('Bruno Acheteur',    'bruno@sa7.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('Clara Acheteur',    'clara@sa7.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('David Acheteur',    'david@sa7.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('Emma Acheteur',     'emma@sa7.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('Anastasia Vendeur', 'anastasia@sa7.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Trystan Vendeur',   'trystan@sa7.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Sophie Vendeur',    'sophie@sa7.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Admin',             'admin@sa7.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- ============================================================
-- SACS — Anastasia
-- ============================================================
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel Classic Flap Vintage', 'bags', 'Chanel', 800, 1800, 5 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel 25 Cherry Red Medium', 'bags', 'Chanel', 5500, 12000, 3 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel Denim Pink Flap', 'bags', 'Chanel', 3500, 8000, 4 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Birkin 30', 'bags', 'Hermès', 8000, 15000, 2 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Birkin 25', 'bags', 'Hermès', 9000, 18000, 2 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Kelly 20 Sellier Framboise', 'bags', 'Hermès', 12000, 28000, 1 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Lady Dior Cherry Red Medium', 'bags', 'Dior', 4500, 9000, 3 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Louis Vuitton Capucines Mini', 'bags', 'Louis Vuitton', 4000, 7500, 4 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Louis Vuitton Speedy 30', 'bags', 'Louis Vuitton', 1800, 3500, 6 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Saint Laurent Sac de Jour', 'bags', 'Saint Laurent', 2500, 5000, 5 FROM users WHERE email = 'anastasia@sa7.com';

-- ============================================================
-- MONTRES — Trystan
-- ============================================================
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Bvlgari Serpenti Seduttori', 'watches', 'Bvlgari', 8000, 18000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Panthère de Cartier', 'watches', 'Cartier', 6500, 15000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Tank Louis', 'watches', 'Cartier', 4500, 9500, 4 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Patek Philippe Calatrava', 'watches', 'Patek Philippe', 18000, 38000, 1 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Richard Mille RM 07-01', 'watches', 'Richard Mille', 90000, 180000, 1 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Rolex Datejust 36', 'watches', 'Rolex', 5000, 12000, 2 FROM users WHERE email = 'trystan@sa7.com';

-- ============================================================
-- VÊTEMENTS — Sophie
-- ============================================================
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Dior Bar Jacket', 'clothing', 'Dior', 2500, 4500, 3 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel Tweed Dress', 'clothing', 'Chanel', 3200, 6500, 4 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Louis Vuitton Tailored Trousers', 'clothing', 'Louis Vuitton', 1800, 3500, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu Mohair Cardigan', 'clothing', 'Miu Miu', 1200, 2800, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Prada A-Line Mini Skirt', 'clothing', 'Prada', 900, 2000, 7 FROM users WHERE email = 'sophie@sa7.com';

-- ============================================================
-- PARFUMS — Sophie
-- ============================================================
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Byredo Mojave Ghost Intense', 'perfumes', 'Byredo', 160, 290, 15 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Parfum de Marly Athalia', 'perfumes', 'Parfum de Marly', 220, 400, 10 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Tom Ford Oud Wood 100ml', 'perfumes', 'Tom Ford', 220, 420, 10 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Vanilla Powder Intense — Matière Première', 'perfumes', 'Matière Première', 180, 320, 12 FROM users WHERE email = 'sophie@sa7.com';

-- ============================================================
-- CHAUSSURES — Sophie
-- ============================================================
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cesare Paciotti Crystal Heels', 'shoes', 'Cesare Paciotti', 320, 680, 7 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Jimmy Choo Azia 100 Heels', 'shoes', 'Jimmy Choo', 420, 820, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Christian Louboutin Pigalle 120', 'shoes', 'Christian Louboutin', 400, 750, 8 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu Cherry Red Kitten Heels', 'shoes', 'Miu Miu', 550, 1100, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu x New Balance Sneakers', 'shoes', 'Miu Miu', 380, 750, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'YSL Opyum Black Heels', 'shoes', 'Saint Laurent', 480, 900, 6 FROM users WHERE email = 'sophie@sa7.com';
