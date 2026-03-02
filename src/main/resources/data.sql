-- Inserts test data
INSERT INTO users (name, email, user_type) VALUES
('Meriem Buyer', 'meriem@example.com', 'BUYER'),
('Anastasia Seller', 'anastasia@example.com', 'SELLER'),
('trystan Seller', 'trystan@example.com', 'SELLER');

INSERT INTO products (seller_id, name, category, brand, price_min, price_max, stock_quantity) VALUES
(2, 'Vintage Chanel Bag', 'bags', 'Chanel', 800, 1500, 5),
(3, 'Hermes Watch', 'watches', 'Hermes', 2000, 5000, 3);