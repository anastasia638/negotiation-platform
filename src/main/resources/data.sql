-- Données de test (profil dev uniquement)
-- Mots de passe : tous "password" hashés avec BCrypt
INSERT INTO users (name, email, password, user_type) VALUES
('Meriem Buyer',     'meriem@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER'),
('Anastasia Seller', 'anastasia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER'),
('Trystan Seller',   'trystan@example.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER');

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity) VALUES
(2, 'Vintage Chanel Bag', 'bags',    'Chanel', 800,  1500, 5),
(3, 'Hermes Watch',       'watches', 'Hermes', 2000, 5000, 3);
