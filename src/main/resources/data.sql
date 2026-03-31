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
('Sophie Vendeur',    'sophie@sa7.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER');

-- Produits Anastasia (spécialiste sacs)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel Classic Flap Vintage', 'bags', 'Chanel', 800, 1500, 5 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Louis Vuitton Neverfull MM', 'bags', 'Louis Vuitton', 900, 1600, 4 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Birkin 30', 'bags', 'Hermès', 8000, 15000, 2 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Prada Re-Edition 2000', 'bags', 'Prada', 500, 1100, 6 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Kelly 20 Sellier Framboise & Doblis Suede Noir', 'bags', 'Hermès', 12000, 28000, 1 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel Classic Flap Cherry Red Medium', 'bags', 'Chanel', 7000, 14000, 2 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel 25 Classic Flap Black', 'bags', 'Chanel', 8500, 16000, 2 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Lady Dior Cherry Red Medium', 'bags', 'Dior', 4500, 9000, 3 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu Black Leather Aventure Satchel', 'bags', 'Miu Miu', 1200, 2500, 4 FROM users WHERE email = 'anastasia@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Birkin 25 Cherry Red Crocodile', 'bags', 'Hermès', 45000, 95000, 1 FROM users WHERE email = 'anastasia@sa7.com';

-- Produits Trystan (spécialiste montres)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Rolex Datejust 36', 'watches', 'Rolex', 5000, 12000, 2 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Tank Française', 'watches', 'Cartier', 3000, 7000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Cape Cod Watch', 'watches', 'Hermès', 2000, 5000, 4 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Bvlgari Serpenti Seduttori', 'watches', 'Bvlgari', 8000, 18000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Panthère de Cartier', 'watches', 'Cartier', 6500, 15000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Rolex Lady-Datejust 28', 'watches', 'Rolex', 7000, 14000, 2 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Tank Louis', 'watches', 'Cartier', 4500, 9500, 4 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Richard Mille RM 07-01', 'watches', 'Richard Mille', 90000, 180000, 1 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Audemars Piguet Royal Oak Lady', 'watches', 'Audemars Piguet', 25000, 55000, 2 FROM users WHERE email = 'trystan@sa7.com';

-- Produits Sophie (vêtements, parfums, chaussures, sacs)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Dior Bar Jacket', 'clothing', 'Dior', 2500, 4500, 3 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Gucci Silk Maxi Dress', 'clothing', 'Gucci', 1500, 3000, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel No.5 Parfum 100ml', 'perfumes', 'Chanel', 150, 350, 20 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Vanilla Powder Intense — Matière Première', 'perfumes', 'Matière Première', 180, 320, 12 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Byredo Mojave Ghost Intense', 'perfumes', 'Byredo', 160, 290, 15 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Le Labo Santal 33', 'perfumes', 'Le Labo', 140, 260, 18 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Guerlain Absolus Allegoria Rose Amira', 'perfumes', 'Guerlain', 200, 380, 10 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Baccarat Rouge 540 — Maison Francis Kurkdjian', 'perfumes', 'Maison Francis Kurkdjian', 280, 520, 8 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Parfum de Marly Athalia', 'perfumes', 'Parfum de Marly', 220, 400, 10 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Christian Louboutin Pigalle 120', 'shoes', 'Christian Louboutin', 400, 750, 8 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu x New Balance Sneakers', 'shoes', 'Miu Miu', 380, 750, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Miu Miu Cherry Red Kitten Heels', 'shoes', 'Miu Miu', 550, 1100, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'YSL Opyum Black Heels', 'shoes', 'Saint Laurent', 480, 900, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cesare Paciotti Crystal Heels', 'shoes', 'Cesare Paciotti', 320, 680, 7 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Jimmy Choo Azia 100 Heels', 'shoes', 'Jimmy Choo', 420, 820, 6 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Christian Louboutin So Kate 120', 'shoes', 'Christian Louboutin', 500, 950, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Balenciaga City Bag', 'bags', 'Balenciaga', 700, 1400, 5 FROM users WHERE email = 'sophie@sa7.com';

-- ============================================================
-- Nouveaux vendeurs : Rory (montres), August (vêtements), Saint Levant (parfums), Meriem (chaussures)
-- ============================================================
INSERT INTO users (name, email, password, user_type) VALUES
('Rory Vendeur',         'rory@sa7.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('August Vendeur',       'august@sa7.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Saint Levant Vendeur', 'saintlevant@sa7.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Meriem Vendeur',       'meriem@sa7.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER');

-- Produits Rory (montres)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Patek Philippe Calatrava', 'watches', 'Patek Philippe', 18000, 38000, 1 FROM users WHERE email = 'rory@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'IWC Portugieser Chronograph', 'watches', 'IWC', 6000, 13000, 2 FROM users WHERE email = 'rory@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Jaeger-LeCoultre Reverso', 'watches', 'Jaeger-LeCoultre', 7500, 16000, 2 FROM users WHERE email = 'rory@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Omega Constellation 38mm', 'watches', 'Omega', 4500, 9500, 3 FROM users WHERE email = 'rory@sa7.com';

-- Produits August (vêtements)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Valentino Cape Blazer', 'clothing', 'Valentino', 2800, 5200, 3 FROM users WHERE email = 'august@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Balenciaga Oversized Coat', 'clothing', 'Balenciaga', 2200, 4500, 4 FROM users WHERE email = 'august@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Bottega Veneta Knit Dress', 'clothing', 'Bottega Veneta', 1800, 3500, 5 FROM users WHERE email = 'august@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Prada Nylon Windbreaker', 'clothing', 'Prada', 1500, 2800, 6 FROM users WHERE email = 'august@sa7.com';

-- Produits Saint Levant (parfums)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Tom Ford Oud Wood 100ml', 'perfumes', 'Tom Ford', 220, 420, 10 FROM users WHERE email = 'saintlevant@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Creed Aventus 100ml', 'perfumes', 'Creed', 280, 520, 8 FROM users WHERE email = 'saintlevant@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Xerjoff Naxos 100ml', 'perfumes', 'Xerjoff', 180, 360, 12 FROM users WHERE email = 'saintlevant@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Amouage Interlude Man 100ml', 'perfumes', 'Amouage', 200, 400, 9 FROM users WHERE email = 'saintlevant@sa7.com';

-- Produits Meriem (chaussures)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Manolo Blahnik Hangisi 105', 'shoes', 'Manolo Blahnik', 580, 1100, 5 FROM users WHERE email = 'meriem@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Roger Vivier Buckle Heels', 'shoes', 'Roger Vivier', 620, 1200, 4 FROM users WHERE email = 'meriem@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Aquazzura Coquette 105', 'shoes', 'Aquazzura', 450, 900, 6 FROM users WHERE email = 'meriem@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Gianvito Rossi Plexi 105', 'shoes', 'Gianvito Rossi', 520, 980, 5 FROM users WHERE email = 'meriem@sa7.com';
