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

-- Produits Trystan (spécialiste montres)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Rolex Datejust 36', 'watches', 'Rolex', 5000, 12000, 2 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Cartier Tank Française', 'watches', 'Cartier', 3000, 7000, 3 FROM users WHERE email = 'trystan@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Hermès Cape Cod Watch', 'watches', 'Hermès', 2000, 5000, 4 FROM users WHERE email = 'trystan@sa7.com';

-- Produits Sophie (vêtements, parfums, chaussures, sacs)
INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Dior Bar Jacket', 'clothing', 'Dior', 2500, 4500, 3 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Gucci Silk Maxi Dress', 'clothing', 'Gucci', 1500, 3000, 5 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Chanel No.5 Parfum 100ml', 'perfumes', 'Chanel', 150, 350, 20 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Christian Louboutin Pigalle 120', 'shoes', 'Christian Louboutin', 400, 750, 8 FROM users WHERE email = 'sophie@sa7.com';

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity)
SELECT id, 'Balenciaga City Bag', 'bags', 'Balenciaga', 700, 1400, 5 FROM users WHERE email = 'sophie@sa7.com';
