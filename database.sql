-- ==========================================================
-- 1. CREATE DATABASE & DROP OLD TABLES
-- ==========================================================
CREATE DATABASE IF NOT EXISTS pilikart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilikart;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS variant_option_choices;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_option_choices;
DROP TABLE IF EXISTS product_options;
DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS order_contributors;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_shipping_snapshots;
DROP TABLE IF EXISTS order_item_snapshots;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS group_cart_items;
DROP TABLE IF EXISTS group_cart_members;
DROP TABLE IF EXISTS group_carts;
DROP TABLE IF EXISTS delivery_fees;
DROP TABLE IF EXISTS contact_messages;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 2. CREATE TABLES (Final 3NF Structure)
-- ==========================================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  street VARCHAR(255) NOT NULL DEFAULT '',
  brgy VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  tagline VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  price INT NOT NULL,
  category ENUM('paso','nipa','habi','apollo') NOT NULL,
  image VARCHAR(255) NOT NULL,
  stock INT NOT NULL DEFAULT 20,
  sold_out TINYINT(1) NOT NULL DEFAULT 0,
  best_seller TINYINT(1) NOT NULL DEFAULT 0,
  is_archived TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE product_tags (
  product_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE product_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_name VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_prod_spec (product_id, spec_name),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_option_choices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  option_id INT NOT NULL,
  choice_name VARCHAR(64) NOT NULL,
  price_modifier INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_opt_choice (option_id, choice_name),
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE
);

-- 3NF Variant Tables
CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE variant_option_choices (
  variant_id INT NOT NULL,
  choice_id INT NOT NULL,
  PRIMARY KEY (variant_id, choice_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (choice_id) REFERENCES product_option_choices(id) ON DELETE CASCADE
);

-- Immutable Snapshot Tables
CREATE TABLE order_shipping_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  delivery_street VARCHAR(255) NOT NULL,
  delivery_brgy VARCHAR(100) NOT NULL,
  delivery_city VARCHAR(100) NOT NULL
);

CREATE TABLE order_item_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  price INT NOT NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  shipping_snapshot_id INT NOT NULL,
  payment ENUM('cod','gcash','mixed') NOT NULL DEFAULT 'cod',
  payment_proof MEDIUMTEXT NOT NULL,
  delivery_fee INT NOT NULL,
  protection_fee INT NOT NULL DEFAULT 0,
  status ENUM('Pending','Preparing','Shipping','Out for Delivery','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  delivered_at TIMESTAMP NULL DEFAULT NULL,
  refund_status ENUM('none','requested','approved','rejected') DEFAULT 'none',
  refund_reason TEXT DEFAULT NULL,
  refund_proof MEDIUMTEXT DEFAULT NULL,
  is_group_order TINYINT(1) DEFAULT 0,
  group_cart_id INT DEFAULT NULL,
  stock_restored TINYINT(1) NOT NULL DEFAULT 0,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancel_reason TEXT DEFAULT NULL,
  appeal_status ENUM('none','requested','approved','rejected') DEFAULT 'none',
  appeal_reason TEXT DEFAULT NULL,
  FOREIGN KEY (shipping_snapshot_id) REFERENCES order_shipping_snapshots(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  item_snapshot_id INT NOT NULL,
  qty INT NOT NULL,
  variation VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (item_snapshot_id) REFERENCES order_item_snapshots(id)
);

CREATE TABLE order_contributors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  amount_paid INT NOT NULL DEFAULT 0,
  role ENUM('host','member') DEFAULT 'member',
  payment_method ENUM('cash','gcash') DEFAULT 'cash',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE settings (
  `key` VARCHAR(64) PRIMARY KEY,
  `value` VARCHAR(255) NOT NULL
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_id INT NOT NULL,
  code VARCHAR(6) NOT NULL UNIQUE,
  name VARCHAR(60) NOT NULL,
  status ENUM('open','ordered','cancelled') DEFAULT 'open',
  split_method ENUM('equal','by_adder','fixed_contribution','one_payer') DEFAULT 'equal',
  fixed_amount INT DEFAULT 0,
  customer_name VARCHAR(150) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  delivery_street VARCHAR(255) NOT NULL DEFAULT '',
  delivery_brgy VARCHAR(100) NOT NULL DEFAULT '',
  delivery_city VARCHAR(100) NOT NULL DEFAULT '',
  delivery_fee INT DEFAULT 0,
  order_id INT DEFAULT NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_cart_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_cart_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('host','member') DEFAULT 'member',
  status ENUM('pending','approved','invited','rejected') DEFAULT 'pending',
  paid TINYINT(1) DEFAULT 0,
  paid_amount INT DEFAULT 0,
  payment_method ENUM('cash','gcash') DEFAULT NULL,
  payment_proof MEDIUMTEXT DEFAULT '',
  payer_verified TINYINT(1) DEFAULT 0,
  fixed_share_amount INT DEFAULT 0,
  is_fixed TINYINT(1) DEFAULT 0,
  is_payer TINYINT(1) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_cart_id) REFERENCES group_carts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE group_cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_cart_id INT NOT NULL,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL,
  variation VARCHAR(255) DEFAULT '',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_cart_id) REFERENCES group_carts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE delivery_fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  fee INT NOT NULL,
  UNIQUE KEY unique_location (city, barangay)
);

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. INSERT DEFAULT DATA (Users & Settings)
-- ==========================================================
INSERT INTO settings (`key`, `value`) VALUES ('delivery_fee', '50');

INSERT INTO users (name, email, phone, street, brgy, city, password_hash, role) VALUES
('Store Owner', 'admin@pilikart.ph', '09171234567', 'Main St.', 'Poblacion', 'Calamba', 'admin', 'admin'),
('Customer Demo', 'customer@example.com', '09189876543', '123 Rizal St', 'Poblacion', 'Calamba', 'customer', 'customer'),
('Marc Arambulo', 'marc@pilikart.ph', '09170000001', 'Bossing St., Arambulo Ave.', 'San juan', 'Calamba', 'marc', 'customer'),
('Bryan Flores', 'bryan@pilikart.ph', '09170000002', 'LC St., Mabangis Ave.', 'Siranglupa', 'Calamba', 'bryan', 'admin'),
('Kian Sogoni', 'kian@pilikart.ph', '09170000003', '123 St., December Ave.', 'Looc', 'Calamba', 'kian', 'admin');

-- ==========================================================
-- 4. INSERT DELIVERY FEES
-- ==========================================================
INSERT INTO delivery_fees (city, barangay, fee) VALUES
('Biñan', 'Biñan (Poblacion)', 25), ('Biñan', 'Bungahan', 19), ('Biñan', 'Canlalay', 45), ('Biñan', 'Casile', 44), ('Biñan', 'De La Paz', 54), ('Biñan', 'Ganado', 47), ('Biñan', 'Langkiwa', 90), ('Biñan', 'Loma', 144), ('Biñan', 'Malaban', 43), ('Biñan', 'Malamig', 113), ('Biñan', 'Mampalasan', 58), ('Biñan', 'Platero', 20), ('Biñan', 'San Antonio', 40), ('Biñan', 'San Francisco', 52), ('Biñan', 'San Jose', 35), ('Biñan', 'San Vicente', 28), ('Biñan', 'Santo Domingo', 42), ('Biñan', 'Santo Niño', 28), ('Biñan', 'Soro-soro', 45), ('Biñan', 'Timbao', 50), ('Biñan', 'Tubigan', 35), ('Biñan', 'Zapote', 2),
('Cabuyao', 'Baclaran', 86), ('Cabuyao', 'Banaybanay', 26), ('Cabuyao', 'Banlic', 55), ('Cabuyao', 'Barangay Dos', 12), ('Cabuyao', 'Barangay Tres', 8), ('Cabuyao', 'Barangay Uno', 10), ('Cabuyao', 'Bigaa', 19), ('Cabuyao', 'Butong', 44), ('Cabuyao', 'Casile', 90), ('Cabuyao', 'Diezmo', 77), ('Cabuyao', 'Gulod', 54), ('Cabuyao', 'Mamatid', 71), ('Cabuyao', 'Marinig', 31), ('Cabuyao', 'Niugan', 15), ('Cabuyao', 'Pittland', 70), ('Cabuyao', 'Pulo', 25), ('Cabuyao', 'Sala', 10), ('Cabuyao', 'San Isidro', 30),
('Calamba', 'Bagong Kalsada', 35), ('Calamba', 'Banadero', 14), ('Calamba', 'Banlic', 47), ('Calamba', 'Barandal', 59), ('Calamba', 'Barangay 1', 15), ('Calamba', 'Barangay 2', 4), ('Calamba', 'Barangay 3', 8), ('Calamba', 'Barangay 4', 4), ('Calamba', 'Barangay 5', 5), ('Calamba', 'Barangay 6', 2), ('Calamba', 'Barangay 7', 8), ('Calamba', 'Batino', 44), ('Calamba', 'Bubuyan', 40), ('Calamba', 'Bucal', 30), ('Calamba', 'Bunggo', 80), ('Calamba', 'Burol', 60), ('Calamba', 'Camaligan', 70), ('Calamba', 'Canlubang', 100), ('Calamba', 'Halang', 25), ('Calamba', 'Hornalan', 90), ('Calamba', 'Kay-Anlog', 80), ('Calamba', 'La Mesa', 120), ('Calamba', 'Laguerta', 90), ('Calamba', 'Lawa', 60), ('Calamba', 'Lecheria', 15), ('Calamba', 'Lingga', 50), ('Calamba', 'Looc', 40), ('Calamba', 'Mabato', 100), ('Calamba', 'Majada Labas', 70), ('Calamba', 'Makiling', 70), ('Calamba', 'Mapagong', 50), ('Calamba', 'Masili', 30), ('Calamba', 'Maunong', 70), ('Calamba', 'Mayapa', 80), ('Calamba', 'Milagrosa', 80), ('Calamba', 'Paciano Rizal', 40), ('Calamba', 'Palingon', 40), ('Calamba', 'Palo-Alto', 120), ('Calamba', 'Pansol', 70), ('Calamba', 'Parian', 30), ('Calamba', 'Prinza', 70), ('Calamba', 'Punta', 60), ('Calamba', 'Puting Lupa', 80), ('Calamba', 'Real', 20), ('Calamba', 'Saimsim', 90), ('Calamba', 'Sampiruhan', 30), ('Calamba', 'San Cristobal', 50), ('Calamba', 'San Jose', 30), ('Calamba', 'San Juan', 20), ('Calamba', 'Sirang Lupa', 60), ('Calamba', 'Sucol', 80), ('Calamba', 'Turbina', 50), ('Calamba', 'Ulango', 90), ('Calamba', 'Uwisan', 40),
('San Pablo', 'Atisan', 170), ('San Pablo', 'Bagong Bayan II-A', 14), ('San Pablo', 'Bagong Pook VI-C', 8), ('San Pablo', 'Barangay I-A', 11), ('San Pablo', 'Barangay I-B', 6), ('San Pablo', 'Barangay II-A', 22), ('San Pablo', 'Barangay II-B', 15), ('San Pablo', 'Barangay II-C', 12), ('San Pablo', 'Barangay II-D', 10), ('San Pablo', 'Barangay II-E', 13), ('San Pablo', 'Barangay II-F', 20), ('San Pablo', 'Barangay III-A', 10), ('San Pablo', 'Barangay III-B', 12), ('San Pablo', 'Barangay III-C', 15), ('San Pablo', 'Barangay III-D', 18), ('San Pablo', 'Barangay III-E', 20), ('San Pablo', 'Barangay III-F', 22), ('San Pablo', 'Barangay IV-A', 10), ('San Pablo', 'Barangay IV-B', 12), ('San Pablo', 'Barangay IV-C', 15), ('San Pablo', 'Barangay V-A', 22), ('San Pablo', 'Barangay V-B', 25), ('San Pablo', 'Barangay V-C', 28), ('San Pablo', 'Barangay V-D', 10), ('San Pablo', 'Barangay VI-A', 15), ('San Pablo', 'Barangay VI-B', 18), ('San Pablo', 'Barangay VI-D', 20), ('San Pablo', 'Barangay VI-E', 22), ('San Pablo', 'Barangay VII-A', 15), ('San Pablo', 'Barangay VII-B', 18), ('San Pablo', 'Barangay VII-C', 20), ('San Pablo', 'Barangay VII-D', 22), ('San Pablo', 'Barangay VII-E', 25), ('San Pablo', 'Bautista', 130), ('San Pablo', 'Concepcion', 23), ('San Pablo', 'Del Remedio', 17), ('San Pablo', 'Dolores', 36), ('San Pablo', 'San Antonio 1', 83), ('San Pablo', 'San Antonio 2', 110), ('San Pablo', 'San Bartolome', 72), ('San Pablo', 'San Buenaventura', 51), ('San Pablo', 'San Crispin', 61), ('San Pablo', 'San Cristobal', 130), ('San Pablo', 'San Diego', 73), ('San Pablo', 'San Francisco', 22), ('San Pablo', 'San Gabriel', 25), ('San Pablo', 'San Gregorio', 35), ('San Pablo', 'San Ignacio', 44), ('San Pablo', 'San Joaquin', 61), ('San Pablo', 'San Jose', 93), ('San Pablo', 'San Juan', 42), ('San Pablo', 'San Lorenzo', 69), ('San Pablo', 'San Lucas 1', 12), ('San Pablo', 'San Lucas 2', 13), ('San Pablo', 'San Marcos', 50), ('San Pablo', 'San Mateo', 57), ('San Pablo', 'San Miguel', 57), ('San Pablo', 'San Nicolas', 36), ('San Pablo', 'San Pedro', 29), ('San Pablo', 'San Rafael', 23), ('San Pablo', 'San Roque', 29), ('San Pablo', 'San Vicente', 69), ('San Pablo', 'Santa Ana', 91), ('San Pablo', 'Santa Catalina', 69), ('San Pablo', 'Santa Cruz', 80), ('San Pablo', 'Santa Elena', 73), ('San Pablo', 'Santa Felomina', 55), ('San Pablo', 'Santa Isabel', 66), ('San Pablo', 'Santa Maria', 66), ('San Pablo', 'Santa Maria Magdalena', 45), ('San Pablo', 'Santa Monica', 43), ('San Pablo', 'Santa Veronica', 64), ('San Pablo', 'Santiago I', 82), ('San Pablo', 'Santiago II', 110), ('San Pablo', 'Santisimo Rosario', 90), ('San Pablo', 'Santo Angel', 73), ('San Pablo', 'Santo Cristo', 20), ('San Pablo', 'Santo Niño', 66), ('San Pablo', 'Soledad', 42),
('San Pedro', 'Bagong Silang', 70), ('San Pedro', 'Calendola', 42), ('San Pedro', 'Chrysant', 46), ('San Pedro', 'Cuyab', 18), ('San Pedro', 'Estrella', 79), ('San Pedro', 'Fatima', 15), ('San Pedro', 'G.S.I.S.', 53), ('San Pedro', 'Landayan', 23), ('San Pedro', 'Langgam', 86), ('San Pedro', 'Laram', 72), ('San Pedro', 'Magsaysay', 48), ('San Pedro', 'Maharlika', 32), ('San Pedro', 'Narra', 68), ('San Pedro', 'Nueva', 6), ('San Pedro', 'Pacita 1', 29), ('San Pedro', 'Pacita 2', 34), ('San Pedro', 'Riverside', 66), ('San Pedro', 'Rosario', 52), ('San Pedro', 'Sampaguita Village', 46), ('San Pedro', 'San Lorenzo Ruiz', 24), ('San Pedro', 'San Roque', 11), ('San Pedro', 'San Vicente', 79), ('San Pedro', 'Santo Niño', 8), ('San Pedro', 'United Bayanihan', 66), ('San Pedro', 'United Better Living', 79),
('Santa Rosa', 'Aplaya', 50), ('Santa Rosa', 'Balibago', 45), ('Santa Rosa', 'Caingin', 30), ('Santa Rosa', 'Dila', 25), ('Santa Rosa', 'Dita', 40), ('Santa Rosa', 'Don Jose', 70), ('Santa Rosa', 'Ibaba', 15), ('Santa Rosa', 'Kanluran', 15), ('Santa Rosa', 'Labas', 25), ('Santa Rosa', 'Macabling', 40), ('Santa Rosa', 'Malitlit', 60), ('Santa Rosa', 'Malusak', 10), ('Santa Rosa', 'Market Area', 10), ('Santa Rosa', 'Pooc', 30), ('Santa Rosa', 'Pulong Santa Cruz', 60), ('Santa Rosa', 'Santo Domingo', 50), ('Santa Rosa', 'Sinalhan', 45), ('Santa Rosa', 'Tagapo', 20);

-- ==========================================================
-- 5. INSERT 64 PRODUCTS
-- ==========================================================
INSERT INTO products (name, tagline, description, price, category, image, stock, best_seller) VALUES
('Chicken Adobo with Rice', 'Ang paboritong ulam ng bayan', 'Tender chicken simmered in soy sauce, vinegar, and garlic, served over steamed rice. A classic, filling Filipino meal.', 90, 'paso', 'assets/paso/Chicken Adobo with Rice.png', 30, 1),
('Pork Sisig with Rice', 'Sarap na tiyak na babalik-balikan', 'Chopped pork with onions and calamansi, served sizzling with rice. Crispy, savory, and slightly tangy.', 85, 'paso', 'assets/paso/Pork sisig with rice.png', 20, 0),
('Chicken Inasal with Rice', 'Smoky na lasa, puno ng pagmamahal', 'Grilled chicken marinated in calamansi, garlic, and lemongrass. Smoky, juicy, and best eaten with rice.', 95, 'paso', 'assets/paso/Chicken Inasal with Rice.png', 25, 0),
('Pancit Bihon Guisado', 'Pampaswerte at pampasaya sa handaan', 'Stir-fried rice noodles with fresh vegetables, pork, and shrimp. A staple for birthdays and family gatherings.', 75, 'paso', 'assets/paso/Pancit Bihon Guisado.png', 25, 0),
('Beefsilog', 'Simula ng araw na puno ng pag-asa', 'Savory beef tapa served with garlic fried rice and a fried egg. A classic Filipino breakfast to start your day.', 100, 'paso', 'assets/paso/Beefsilog.png', 25, 0),
('Lumpiang Shanghai', 'Paboritong meryenda ng buong pamilya', 'Crispy spring rolls filled with seasoned ground pork and carrots. Served with a sweet and sour dipping sauce.', 40, 'paso', 'assets/paso/Lumpiang Shanghai.png', 45, 0),
('Leche Flan Cup', 'Tamis na laging hinahanap', 'A smooth caramel custard made from egg yolks, evaporated milk, and sugar. Rich and perfectly sweet.', 35, 'paso', 'assets/paso/Leche Flan Cup.jpg', 40, 0),
('Buko Pandan Cup', 'Preskong kaginhawahan sa bawat subo', 'A chilled dessert with sweet coconut strips, pandan jelly, and cream. Refreshing and great for a hot day.', 35, 'paso', 'assets/paso/Buko Pandan Cup.jpg', 35, 0),
('Turon', 'Sarap ng kabataan sa bawat kagat', 'Crispy banana spring rolls coated in caramelized brown sugar. A popular sweet snack for merienda.', 30, 'paso', 'assets/paso/Turon.png', 50, 0),
('Classic Fried Chicken with Egg', 'Lutong bahay na hatid ay ginhawa', 'Crispy fried chicken served with steamed rice and a fried egg. Simple, filling, and comforting.', 105, 'paso', 'assets/paso/Classic Fried Chicken.png', 25, 0),
('Cheese Sticks', 'Kada kagat, puno ng sarap', 'Crispy spring roll wrappers filled with gooey melted cheese. A great snack to share.', 35, 'paso', 'assets/paso/Cheese Sticks.png', 40, 0),
('French Fries', 'Crispy na pang-meryenda', 'Golden-fried potato cuts lightly dusted with salt. The perfect side dish or quick snack.', 50, 'paso', 'assets/paso/French Fries.png', 40, 0),
('Fudgy Brownies', 'Tsokolateng tamis ng pagmamahal', 'Dense, chocolatey brownies baked to a fudgy texture. Rich and not overly sweet.', 45, 'paso', 'assets/paso/Fudgy Brownies.png', 35, 0),
('Wintermelon Milk Tea', 'Tamang-tama para sa chill na hapon', 'Creamy wintermelon tea blended with milk and chewy tapioca pearls. Sweet and refreshing.', 65, 'paso', 'assets/paso/Wintermelon Milk Tea.png', 40, 0),
('Chicken Pastil', 'Pantawid gutom ng kolehiyo', 'Shredded chicken simmered in soy, vinegar, and garlic, paired with hot rice and placed in banana leaf.', 25, 'paso', 'assets/paso/pastil.png', 30, 0),
('Arroz Caldo', 'Init ng sabaw, hagod ng pagmamahal', 'A warm rice porridge cooked with ginger, tender chicken, and a hint of fish sauce. Comforting and filling.', 85, 'paso', 'assets/paso/arrozcaldo.png', 30, 0),
('Classic Plastic Tabo', 'Kasama sa bawat ligo, kasama sa tahanan', 'A sturdy plastic dipper with a handle. A basic, reliable bathroom essential for every Filipino home.', 45, 'nipa', 'assets/nipa/Classic Plastic Tabo.png', 60, 1),
('Banig', 'Himbing ng tulog sa banig ng probinsya', 'A traditional sleeping mat hand-woven from dried pandan leaves. Cool, breathable, and durable.', 350, 'nipa', 'assets/nipa/Banig.png', 15, 0),
('Abaca Scrubbing Pad', 'Malinis ang bahay, alaga pa ang kalikasan', 'A tough cleaning pad made from woven abaca fibers. Cuts through grease without scratching your pans.', 55, 'nipa', 'assets/nipa/Abaca Scrubbing Pad.png', 40, 0),
('Bamboo Utensil Set', 'Kubyertos na gawa ng kalikasan', 'A fork, spoon, and knife carved from sustainable bamboo. Lightweight, durable, and eco-friendly.', 120, 'nipa', 'assets/nipa/Bamboo Utensil Set.png', 30, 0),
('Coconut Shell Bowl', 'Gawang likas, espesyal ang dating', 'A unique bowl polished from real coconut shells. Great for serving soups, desserts, or for decor.', 150, 'nipa', 'assets/nipa/Coconut Shell Bowl.png', 25, 0),
('Capiz Shell Lamp', 'Ilaw na nagbibigay ng init sa tahanan', 'A hanging lamp made with translucent Capiz shells. Casts a warm, soft glow in any room.', 450, 'nipa', 'assets/nipa/Capiz Shell Lamp.png', 10, 0),
('Wooden Serving Tray', 'Paghahain nang may karangalan', 'A sturdy serving tray carved from Acacia wood. Perfect for presenting dishes or organizing items.', 280, 'nipa', 'assets/nipa/Wooden Serving Tray.png', 15, 0),
('Sampaguita Air Freshener', 'Halimuyak ng tahanang Pinoy', 'A room spray that captures the sweet, familiar scent of fresh Sampaguita flowers.', 180, 'nipa', 'assets/nipa/Sampaguita Air Freshener.png', 35, 0),
('Palayok', 'Mabagal lutuin, puno ng lasa at alaala', 'A traditional clay pot that distributes heat slowly and evenly. Brings out the best flavors in stews.', 320, 'nipa', 'assets/nipa/Palayok.png', 12, 0),
('Broom and Dustpan Set', 'Katuwang sa pagpapanatili ng linis', 'A lightweight and practical cleaning set. Makes sweeping floors quick and easy.', 85, 'nipa', 'assets/nipa/Broom and Dustpan Set.png', 28, 0),
('Plastic Water Pitcher', 'Sariwang tubig para sa buong angkan', 'A durable pitcher with an easy-pour spout. Keeps water or juice ready on the dining table.', 75, 'nipa', 'assets/nipa/Plastic Water Pitcher.png', 40, 0),
('Plastic Clothes Hangers', 'Ayos at maaliwalas na pamamahay', 'A set of ten sturdy plastic hangers. A simple solution to keep your wardrobe organized.', 60, 'nipa', 'assets/nipa/Plastic Clothes Hangers.png', 30, 0),
('Bath Towel', 'Lambot na yakap pagkatapos maligo', 'A soft and highly absorbent cotton towel. Dries you off quickly and stays comfortable.', 100, 'nipa', 'assets/nipa/Bath Towel.png', 50, 0),
('Small Waste Bin', 'Maliit na basurahan, malaking tulong', 'A compact waste bin that fits perfectly in bedrooms or bathrooms. Keeps small spaces tidy.', 65, 'nipa', 'assets/nipa/Small Waste Bin.png', 40, 0),
('Plastic Laundry Basket', 'Organisado at maayos na labahan', 'A ventilated laundry basket that keeps clothes organized and allows air to circulate.', 120, 'nipa', 'assets/nipa/Plastic Laundry Basket.png', 40, 0),
('Woven Bayong', 'Mabisang katuwang sa pamimili', 'A sturdy market bag handwoven from dried palm leaves. An eco-friendly and stylish alternative to plastic.', 150, 'nipa', 'assets/nipa/Woven Bayong.png', 25, 0),
('Indigenous Woven Scarf', 'Habi ng kultura, suot ng lahi', 'A unisex scarf handwoven by indigenous Filipino tribes. Soft, warm, and rich in cultural history.', 450, 'habi', 'assets/habi/scarf.png', 20, 1),
('Barot Saya', 'Proud na suot, yaman ng kultura', 'A traditional Filipiniana dress woven with grace and history. Elegant and perfect for formal occasions.', 850, 'habi', 'assets/habi/barotsaya.png', 15, 0),
('Inabel Woven Tote Bag', 'Gawang Ilocos, yaman na dala-dala', 'A durable tote bag made from authentic Inabel fabric from Ilocos. Spacious enough for your daily essentials.', 450, 'habi', 'assets/habi/tote.png', 20, 0),
('Pina Fabric Scarf', 'Pinong habi, marangal na ganda', 'A lightweight scarf woven from fine pineapple leaf fibers. Delicate, elegant, and uniquely Filipino.', 350, 'habi', 'assets/habi/fabric scarf.png', 15, 0),
('Calamansi Lip & Cheek Tint', 'Natural na ganda mula sa kalikasan', 'A lightweight makeup tint made from calamansi extract. Gives a natural, healthy flush to your lips and cheeks.', 149, 'habi', 'assets/habi/cheek tint.png', 40, 0),
('Virgin Coconut Oil', 'Likas na lunas para sa kutis at buhok', 'Cold-pressed pure coconut oil. Versatile and nourishing for your hair, skin, or even cooking.', 199, 'habi', 'assets/habi/coconut oil.png', 50, 0),
('Sampaguita Perfume', 'Amoy ng bulaklak, alaala ng bayan', 'A light floral perfume that captures the nostalgic scent of the national flower.', 250, 'habi', 'assets/habi/sampaguitaperfume.png', 25, 0),
('Banig Slide Slippers', 'Sarap ng pambahay sa bawat hakbang', 'Comfortable slippers made from traditional woven banig material. Soft, lightweight, and great for home.', 120, 'habi', 'assets/habi/slippers.png', 30, 0),
('Tnalak Coin Purse', 'Gawang kamay, pusong Pilipino', 'A handwoven coin purse made from authentic Tnalak fabric by Tboli artisans. Small, vibrant, and meaningful.', 150, 'habi', 'assets/habi/coinpurse.png', 25, 0),
('Barong-inspired Polo', 'Modernong suot, may pusong Pinoy', 'A modern take on the classic Barong Tagalog. Lightweight, breathable, and subtly embroidered.', 650, 'habi', 'assets/habi/barongpolo.png', 12, 0),
('Sinamay Hat', 'Proteksyon sa araw, may klasikong ganda', 'A wide-brimmed hat woven from fine sinamay fibers. Provides good shade and adds elegance to any outfit.', 280, 'habi', 'assets/habi/hat.png', 15, 0),
('Velvet Matte Lipstick', 'Kulay na may kumpiyansa', 'A highly pigmented, smooth matte lipstick. Glides on easily and stays vibrant all day.', 199, 'habi', 'assets/habi/lipstick.png', 30, 0),
('Dewy Liquid Foundation', 'Kutis na puno ng ningning', 'A lightweight liquid foundation that evens out skin tone. Gives a fresh, natural, dewy finish.', 299, 'habi', 'assets/habi/foundation.png', 25, 0),
('Glow Blush', 'Ningning ng pisngi, hatid ay ngiti', 'A silky, blendable blush that adds a natural pop of color to your cheeks.', 159, 'habi', 'assets/habi/blush.png', 35, 0),
('Waterproof Mascara', 'Titig na hindi kakalas', 'A smudge-proof mascara that lengthens and volumizes your lashes. Lasts through long days and happy tears.', 189, 'habi', 'assets/habi/mascara.png', 40, 0),
('Soft Focus Concealer', 'Tagong kapaguran, liwanag ang bida', 'A creamy, full-coverage concealer for dark circles and blemishes. Blends easily for a smooth finish.', 179, 'habi', 'assets/habi/concealer.png', 30, 0),
('Mini Karaoke Machine', 'Kantahan na, buong pamilya ay masaya!', 'A portable machine that brings the videoke experience anywhere. Perfect for parties and family gatherings.', 1500, 'apollo', 'assets/apollo/minikaraokemachine.png', 20, 1),
('Bamboo Bluetooth Speaker', 'Musika at saya, kahit saan dalhin', 'A powerful Bluetooth speaker housed in real bamboo. Delivers rich sound with a natural, elegant look.', 1250, 'apollo', 'assets/apollo/bamboobluetoothspeaker.png', 20, 0),
('Handwoven Inabel Phone Case', 'Gadget na may pusong Pinoy', 'A durable phone case wrapped in authentic Inabel fabric. Protects your phone while showing off Filipino culture.', 350, 'apollo', 'assets/apollo/handwoveninabelphonecase.png', 30, 0),
('Wooden Powerbank', 'Laging handa, laging may karga', 'A fast-charging power bank with a sleek wooden casing. Durable, stylish, and reliable on the go.', 899, 'apollo', 'assets/apollo/woodenpowerbank.png', 15, 0),
('Abaca Laptop Sleeve', 'Likas na proteksyon sa iyong gadget', 'A padded laptop sleeve handwoven from durable abaca fiber. Eco-friendly protection for your device.', 650, 'apollo', 'assets/apollo/abacalaptopsleeve.png', 12, 0),
('Acacia Wood Phone Stand', 'Tibay ng kahoy, suporta sa''yo', 'A sturdy phone stand carved from Acacia wood. Holds your phone at the perfect angle for videos or calls.', 250, 'apollo', 'assets/apollo/acaciawoodphonestand.png', 25, 0),
('Rattan Cable Organizer', 'Ayos ang kable, ayos ang espasyo', 'A hand-woven rattan basket to keep your charging cables and adapters neatly organized.', 180, 'apollo', 'assets/apollo/rattancableorganizer.png', 20, 0),
('Capiz Shell Mousepad', 'Swabeng galaw, Pinoy na karangyaan', 'A smooth mousepad layered with Capiz shells. Provides precise tracking and a unique look for your desk.', 220, 'apollo', 'assets/apollo/capizshellmousepad.png', 15, 0),
('Bamboo Tripod', 'Kuha ng alaala, tibay ng kawayan', 'A lightweight, adjustable tripod made from sustainable bamboo. Stable support for photos and content creation.', 450, 'apollo', 'assets/apollo/bambootripod.png', 18, 0),
('Woven Tablet Case', 'Proteksyon na gawa sa kulturang Pinoy', 'A padded tablet case made with vibrant native woven textiles. Offers reliable protection and style.', 550, 'apollo', 'assets/apollo/woventabletcase.png', 14, 0),
('Charging Cord (Type-C)', 'Mabilis na karga, tuloy ang saya', 'A durable, high-speed braided Type-C cable. Built to withstand daily wear and tear.', 199, 'apollo', 'assets/apollo/chargingcord.png', 50, 0),
('USB Flash Drive', 'Bitbit ang alaala at dokumento', 'A compact and reliable USB drive for carrying documents, photos, and videos.', 289, 'apollo', 'assets/apollo/usbflashdrive.png', 30, 0),
('Wireless Mouse', 'Tahimik na galaw, tumpak na aksyon', 'An ergonomic wireless mouse with silent click buttons. Comfortable grip and precise tracking.', 499, 'apollo', 'assets/apollo/wirelessmouse.png', 40, 0),
('Mechanical Keyboard', 'Sarap mag-type, sarap magtrabaho', 'A responsive mechanical keyboard with tactile switches. Makes typing for work, coding, or gaming feel great.', 1299, 'apollo', 'assets/apollo/mechanicalkeyboard.png', 18, 0),
('Wireless Microphone', 'Boses ay malinaw, mensahe ay malinaw', 'A high-quality, clip-on wireless microphone. Captures crystal-clear audio for vlogging or meetings.', 499, 'apollo', 'assets/apollo/wirelessmicrophone.png', 20, 0),
('Solar-Powered Lamp', 'Liwanag sa gitna ng dilim', 'A reliable solar-powered lamp. Provides bright light during emergencies, brownouts, or outdoor use.', 550, 'apollo', 'assets/apollo/solarpoweredlamp.png', 30, 0);

-- ==========================================================
-- 6. INSERT product_options (one row per spec group)
-- ==========================================================
INSERT INTO product_options (product_id, spec_name, sort_order) VALUES
(1, 'Size', 0), (1, 'Spice Level', 1),
(2, 'Size', 0), (2, 'Add Egg', 1),
(3, 'Size', 0), (3, 'Spice Level', 1),
(4, 'Size', 0), (4, 'Add Calamansi', 1),
(5, 'Egg Style', 0), (5, 'Add Extra Rice', 1),
(6, 'Pack Size', 0),
(7, 'Size', 0),
(8, 'Size', 0), (8, 'Sweetness', 1),
(9, 'Pack Size', 0),
(10, 'Chicken Part', 0), (10, 'Add Gravy', 1),
(11, 'Pack Size', 0), (11, 'Dip', 1),
(12, 'Size', 0), (12, 'Flavor', 1),
(13, 'Pack Size', 0), (13, 'Add Walnuts', 1),
(14, 'Size', 0), (14, 'Sugar Level', 1), (14, 'Ice Level', 2), (14, 'Add Pearls', 3),
(15, 'Size', 0), (15, 'Spice Level', 1), (15, 'Add Egg', 2),
(16, 'Size', 0), (16, 'Add Egg', 1), (16, 'Extra Chicharon', 2),
(17, 'Color', 0), (17, 'Size', 1),
(18, 'Size', 0), (18, 'Pattern', 1),
(19, 'Pack Size', 0),
(20, 'Set Type', 0), (20, 'Add Bamboo Straw', 1),
(21, 'Size', 0),
(22, 'Size', 0), (22, 'Bulb Included', 1),
(23, 'Size', 0),
(24, 'Size', 0),
(25, 'Size', 0),
(26, 'Color', 0),
(27, 'Size', 0),
(28, 'Color', 0), (28, 'Pack Size', 1),
(29, 'Color', 0), (29, 'Size', 1),
(30, 'Color', 0),
(31, 'Size', 0), (31, 'Color', 1),
(32, 'Size', 0), (32, 'Design', 1),
(33, 'Color', 0),
(34, 'Size', 0),
(35, 'Design', 0),
(36, 'Color', 0),
(37, 'Shade', 0),
(38, 'Size', 0),
(39, 'Size', 0),
(40, 'Size', 0), (40, 'Color', 1),
(41, 'Design', 0),
(42, 'Size', 0), (42, 'Color', 1),
(43, 'Size', 0), (43, 'Color', 1),
(44, 'Shade', 0),
(45, 'Shade', 0),
(46, 'Shade', 0),
(47, 'Color', 0),
(48, 'Shade', 0),
(49, 'Color', 0), (49, 'Extra Mic', 1),
(50, 'Color', 0),
(51, 'Model', 0),
(52, 'Capacity', 0), (52, 'Wood Type', 1),
(53, 'Size', 0),
(54, 'Finish', 0),
(55, 'Size', 0),
(56, 'Shape', 0),
(57, 'Height', 0), (57, 'Color', 1),
(58, 'Size', 0),
(59, 'Length', 0), (59, 'Color', 1),
(60, 'Capacity', 0), (60, 'Color', 1),
(61, 'Color', 0), (61, 'DPI', 1),
(62, 'Switch Type', 0), (62, 'Color', 1),
(63, 'Type', 0),
(64, 'Color', 0);

-- ==========================================================
-- 7. INSERT product_option_choices
-- ==========================================================
INSERT INTO product_option_choices (option_id, choice_name, price_modifier, sort_order) VALUES
(1, 'Small', 0, 0), (1, 'Medium', 20, 1), (1, 'Large', 40, 2),
(2, 'Mild', 0, 0), (2, 'Spicy', 0, 1),
(3, 'Regular', 0, 0), (3, 'Large', 25, 1),
(4, 'No', 0, 0), (4, 'Yes', 15, 1),
(5, 'Regular', 0, 0), (5, 'Large', 20, 1),
(6, 'Mild', 0, 0), (6, 'Spicy', 0, 1),
(7, 'Regular', 0, 0), (7, 'Party Tray', 150, 1),
(8, 'No', 0, 0), (8, 'Yes', 5, 1),
(9, 'Sunny-side up', 0, 0), (9, 'Scrambled', 0, 1), (9, 'Hard-boiled', 0, 2),
(10, 'No', 0, 0), (10, 'Yes', 15, 1),
(11, '5 pcs', 0, 0), (11, '10 pcs', 35, 1), (11, '15 pcs', 65, 2),
(12, 'Regular', 0, 0), (12, 'Large', 15, 1),
(13, 'Regular', 0, 0), (13, 'Large', 15, 1),
(14, 'Normal', 0, 0), (14, 'Less Sweet', 0, 1),
(15, '2 pcs', 0, 0), (15, '4 pcs', 25, 1), (15, '6 pcs', 50, 2),
(16, 'Leg & Thigh', 0, 0), (16, 'Breast', 20, 1),
(17, 'No', 0, 0), (17, 'Yes', 10, 1),
(18, '8 pcs', 0, 0), (18, '12 pcs', 20, 1),
(19, 'Ketchup', 0, 0), (19, 'Mayo', 0, 1),
(20, 'Regular', 0, 0), (20, 'Large', 20, 1),
(21, 'Sea Salt', 0, 0), (21, 'Cheese', 15, 1), (21, 'Sour Cream', 15, 2),
(22, '2 pcs', 0, 0), (22, '4 pcs', 40, 1), (22, '6 pcs', 75, 2),
(23, 'No', 0, 0), (23, 'Yes', 20, 1),
(24, 'Medium', 0, 0), (24, 'Large', 20, 1),
(25, '0%', 0, 0), (25, '50%', 0, 1), (25, '100%', 0, 2),
(26, 'Regular', 0, 0), (26, 'Less Ice', 0, 1), (26, 'No Ice', 0, 2),
(27, 'No', 0, 0), (27, 'Yes', 15, 1),
(28, 'Regular', 0, 0), (28, 'Large', 20, 1),
(29, 'Mild', 0, 0), (29, 'Spicy', 0, 1),
(30, 'No', 0, 0), (30, 'Yes', 15, 1),
(31, 'Regular', 0, 0), (31, 'Large', 20, 1),
(32, 'No', 0, 0), (32, 'Yes', 15, 1),
(33, 'No', 0, 0), (33, 'Yes', 10, 1),
(34, 'Blue', 0, 0), (34, 'Red', 0, 1), (34, 'Green', 0, 2), (34, 'Pink', 0, 3),
(35, 'Regular', 0, 0), (35, 'Large', 10, 1),
(36, 'Single', 0, 0), (36, 'Double', 100, 1), (36, 'Queen', 200, 2),
(37, 'Geometric', 0, 0), (37, 'Floral', 0, 1),
(38, '1 pc', 0, 0), (38, '3 pcs', 100, 1), (38, '5 pcs', 150, 2),
(39, 'Fork & Spoon', 0, 0), (39, 'Full Set', 0, 1),
(40, 'No', 0, 0), (40, 'Yes', 30, 1),
(41, 'Small', 0, 0), (41, 'Medium', 20, 1), (41, 'Large', 50, 2),
(42, 'Small', 0, 0), (42, 'Medium', 100, 1), (42, 'Large', 200, 2),
(43, 'No', 0, 0), (43, 'Yes', 50, 1),
(44, 'Small', 0, 0), (44, 'Medium', 50, 1), (44, 'Large', 100, 2),
(45, '250ml', 0, 0), (45, '500ml', 80, 1),
(46, '3L', 0, 0), (46, '5L', 100, 1),
(47, 'Blue', 0, 0), (47, 'Green', 0, 1), (47, 'Pink', 0, 2),
(48, '1.5L', 0, 0), (48, '2.5L', 20, 1),
(49, 'White', 0, 0), (49, 'Black', 0, 1), (49, 'Assorted', 0, 2),
(50, '10 pcs', 0, 0), (50, '20 pcs', 40, 1),
(51, 'White', 0, 0), (51, 'Beige', 0, 1), (51, 'Blue', 0, 2), (51, 'Pink', 0, 3),
(52, 'Standard', 0, 0), (52, 'Large', 30, 1),
(53, 'White', 0, 0), (53, 'Grey', 0, 1), (53, 'Black', 0, 2),
(54, '25L', 0, 0), (54, '40L', 40, 1),
(55, 'White', 0, 0), (55, 'Blue', 0, 1),
(56, 'Small', 0, 0), (56, 'Medium', 50, 1), (56, 'Large', 100, 2),
(57, 'Checkered', 0, 0), (57, 'Striped', 0, 1),
(58, 'Red', 0, 0), (58, 'Blue', 0, 1), (58, 'Green', 0, 2), (58, 'Yellow', 0, 3),
(59, 'Small', 0, 0), (59, 'Medium', 0, 1), (59, 'Large', 0, 2), (59, 'XL', 0, 3),
(60, 'Stripe A', 0, 0), (60, 'Stripe B', 0, 1), (60, 'Solid', 0, 2),
(61, 'Natural', 0, 0), (61, 'White', 0, 1),
(62, 'Peach', 0, 0), (62, 'Rose', 0, 1), (62, 'Berry', 0, 2),
(63, '250ml', 0, 0), (63, '500ml', 80, 1),
(64, '30ml', 0, 0), (64, '50ml', 50, 1), (64, '100ml', 100, 2),
(65, '6', 0, 0), (65, '7', 0, 1), (65, '8', 0, 2), (65, '9', 0, 3), (65, '10', 0, 4),
(66, 'Natural', 0, 0), (66, 'Black', 0, 1),
(67, 'Motif A', 0, 0), (67, 'Motif B', 0, 1),
(68, 'S', 0, 0), (68, 'M', 0, 1), (68, 'L', 0, 2), (68, 'XL', 0, 3), (68, 'XXL', 50, 4),
(69, 'White', 0, 0), (69, 'Cream', 0, 1),
(70, 'Small', 0, 0), (70, 'Medium', 0, 1), (70, 'Large', 0, 2),
(71, 'Natural', 0, 0), (71, 'Black', 20, 1),
(72, 'Red', 0, 0), (72, 'Nude', 0, 1), (72, 'Pink', 0, 2), (72, 'Mauve', 0, 3),
(73, 'Light', 0, 0), (73, 'Medium', 0, 1), (73, 'Tan', 0, 2), (73, 'Deep', 0, 3),
(74, 'Peach', 0, 0), (74, 'Pink', 0, 1), (74, 'Coral', 0, 2),
(75, 'Black', 0, 0), (75, 'Brown', 0, 1),
(76, 'Light', 0, 0), (76, 'Medium', 0, 1), (76, 'Tan', 0, 2),
(77, 'Black', 0, 0), (77, 'Pink', 0, 1), (77, 'Blue', 0, 2),
(78, 'No', 0, 0), (78, 'Yes', 300, 1),
(79, 'Light Bamboo', 0, 0), (79, 'Dark Bamboo', 0, 1),
(80, 'iPhone 13', 0, 0), (80, 'iPhone 14', 0, 1), (80, 'iPhone 15', 0, 2), (80, 'Samsung S22', 0, 3), (80, 'Samsung S23', 0, 4),
(81, '10,000mAh', 0, 0), (81, '20,000mAh', 400, 1),
(82, 'Acacia', 0, 0), (82, 'Mahogany', 0, 1),
(83, '13-inch', 0, 0), (83, '14-inch', 0, 1), (83, '15-inch', 50, 2),
(84, 'Natural', 0, 0), (84, 'Dark Walnut', 0, 1),
(85, 'Small', 0, 0), (85, 'Large', 50, 1),
(86, 'Round', 0, 0), (86, 'Rectangular', 0, 1),
(87, '50-inch', 0, 0), (87, '70-inch', 100, 1),
(88, 'Natural', 0, 0), (88, 'Black', 0, 1),
(89, '10-inch', 0, 0), (89, '11-inch', 0, 1), (89, '12-inch', 50, 2),
(90, '1m', 0, 0), (90, '1.5m', 0, 1), (90, '2m', 50, 2),
(91, 'Black', 0, 0), (91, 'White', 0, 1),
(92, '32GB', 0, 0), (92, '64GB', 150, 1),
(93, 'Silver', 0, 0), (93, 'Black', 0, 1),
(94, 'Black', 0, 0), (94, 'White', 0, 1), (94, 'Grey', 0, 2),
(95, '1600', 0, 0), (95, '2400', 100, 1),
(96, 'Blue', 0, 0), (96, 'Red', 100, 1), (96, 'Brown', 100, 2),
(97, 'Black', 0, 0), (97, 'White', 0, 1),
(98, 'Lavalier', 0, 0), (98, 'Handheld', 200, 1),
(99, 'Black', 0, 0), (99, 'Orange', 0, 1);

-- ==========================================================
-- 8. INSERT TAGS (NATIVE 3NF)
-- ==========================================================
INSERT INTO tags (name) VALUES
('Accessories'), ('Abaca'), ('Appetizer'), ('Audio'), ('Baked Goods'),
('Banana'), ('Banana Leaf'), ('Bamboo'), ('Banig'), ('Barong'),
('Basket'), ('Bathroom Essentials'), ('Bayong'), ('Beef'), ('Beverage'),
('Blush'), ('Breakfast'), ('Budget'), ('Calamansi'), ('Capiz'),
('Charging'), ('Cheese'), ('Cheeks'), ('Chicken'), ('Chilled'),
('Chocolate'), ('Clay'), ('Cleaning'), ('Clothing'), ('Clothing Storage'),
('Coconut'), ('Comfort Food'), ('Computer'), ('Concealer'), ('Cooking'),
('Cosmetic'), ('Crispy'), ('Decor'), ('Dessert'), ('Dress'),
('Drinks'), ('Drinkware'), ('Eco-Friendly'), ('Egg'), ('Emergency'),
('Eyes'), ('Face'), ('Fashion'), ('Filipino Food'), ('Filipino Snack'),
('Filipino Sweets'), ('Filipiniana'), ('Flash Drive'), ('Floor Care'), ('Food Service'),
('Footwear'), ('Foundation'), ('Fragrance'), ('Fresh'), ('Fried Chicken'),
('Grilled'), ('Hair Care'), ('Halal'), ('Handaan'), ('Handcrafted'),
('Hat'), ('Heritage'), ('Home'), ('Home Essentials'), ('Home Fragrance'),
('Household'), ('Indigenous'), ('Inabel'), ('Karaoke'), ('Keyboard'),
('Kitchen'), ('Kitchen Essentials'), ('Kakanin'), ('Lamp'), ('Laundry'),
('Laptop Sleeve'), ('Lighting'), ('Lips'), ('Lipstick'), ('Local'),
('Local Beauty'), ('Local Produce'), ('Makeup'), ('Mechanical'), ('Merienda'),
('Microphone'), ('Milk Tea'), ('Mindanao'), ('Mouse'), ('Mousepad'),
('Noodles'), ('Organization'), ('Organizer'), ('Pancit'), ('Palayok'),
('Party'), ('Personal Care'), ('Perfume'), ('Phone Case'), ('Phone Stand'),
('Photography'), ('Piña'), ('Pinoy Culture'), ('Plastic'), ('Polo'),
('Pork'), ('Potatoes'), ('Powerbank'), ('Purse'), ('Ready to Eat'),
('Rattan'), ('Rice Meal'), ('Rice Porridge'), ('Sampaguita'), ('Scarf'),
('Serving'), ('Shareable'), ('Side Dish'), ('Sinamay'), ('Sizzling'),
('Skincare'), ('Slippers'), ('Snack'), ('Solar'), ('Spray'),
('Speaker'), ('Storage'), ('Student-Friendly'), ('Sulit'), ('Sweets'),
('Tabo'), ('Tablet'), ('Tapioca Pearls'), ('Tech'), ('Tint'),
('Towels'), ('Tnalak'), ('Traditional'), ('Tripod'), ('Type-C'),
('Ulam'), ('USB'), ('Videoke'), ('VCO'), ('Waste Management'),
('Wireless'), ('Wood'), ('Woven'), ('Woven Bag'), ('Zero Waste');

-- Map Products to Tags
INSERT INTO product_tags (product_id, tag_id) SELECT 1, id FROM tags WHERE name IN ('Filipino Food', 'Chicken', 'Rice Meal', 'Ulam');
INSERT INTO product_tags (product_id, tag_id) SELECT 2, id FROM tags WHERE name IN ('Pork', 'Filipino Food', 'Rice Meal', 'Sizzling');
INSERT INTO product_tags (product_id, tag_id) SELECT 3, id FROM tags WHERE name IN ('Grilled', 'Chicken', 'Rice Meal', 'Filipino Food');
INSERT INTO product_tags (product_id, tag_id) SELECT 4, id FROM tags WHERE name IN ('Noodles', 'Pancit', 'Filipino Food', 'Handaan');
INSERT INTO product_tags (product_id, tag_id) SELECT 5, id FROM tags WHERE name IN ('Beef', 'Filipino Food', 'Rice Meal', 'Breakfast');
INSERT INTO product_tags (product_id, tag_id) SELECT 6, id FROM tags WHERE name IN ('Appetizer', 'Pork', 'Crispy', 'Shareable');
INSERT INTO product_tags (product_id, tag_id) SELECT 7, id FROM tags WHERE name IN ('Dessert', 'Filipino Sweets', 'Ready to Eat', 'Kakanin');
INSERT INTO product_tags (product_id, tag_id) SELECT 8, id FROM tags WHERE name IN ('Dessert', 'Chilled', 'Coconut', 'Filipino Sweets');
INSERT INTO product_tags (product_id, tag_id) SELECT 9, id FROM tags WHERE name IN ('Dessert', 'Banana', 'Filipino Snack', 'Merienda');
INSERT INTO product_tags (product_id, tag_id) SELECT 10, id FROM tags WHERE name IN ('Chicken', 'Fried Chicken', 'Egg', 'Rice Meal');
INSERT INTO product_tags (product_id, tag_id) SELECT 11, id FROM tags WHERE name IN ('Appetizer', 'Cheese', 'Snack', 'Shareable');
INSERT INTO product_tags (product_id, tag_id) SELECT 12, id FROM tags WHERE name IN ('Snack', 'Potatoes', 'Crispy', 'Side Dish');
INSERT INTO product_tags (product_id, tag_id) SELECT 13, id FROM tags WHERE name IN ('Dessert', 'Chocolate', 'Baked Goods', 'Sweets');
INSERT INTO product_tags (product_id, tag_id) SELECT 14, id FROM tags WHERE name IN ('Beverage', 'Milk Tea', 'Drinks', 'Tapioca Pearls');
INSERT INTO product_tags (product_id, tag_id) SELECT 15, id FROM tags WHERE name IN ('Chicken', 'Filipino Food', 'Rice Meal', 'Mindanao', 'Halal', 'Student-Friendly', 'Budget', 'Banana Leaf', 'Sulit');
INSERT INTO product_tags (product_id, tag_id) SELECT 16, id FROM tags WHERE name IN ('Filipino Food', 'Rice Porridge', 'Comfort Food', 'Breakfast');
INSERT INTO product_tags (product_id, tag_id) SELECT 17, id FROM tags WHERE name IN ('Bathroom Essentials', 'Tabo', 'Pinoy Culture', 'Plastic');
INSERT INTO product_tags (product_id, tag_id) SELECT 18, id FROM tags WHERE name IN ('Home Essentials', 'Banig', 'Woven', 'Heritage');
INSERT INTO product_tags (product_id, tag_id) SELECT 19, id FROM tags WHERE name IN ('Kitchen Essentials', 'Abaca', 'Eco-Friendly', 'Cleaning');
INSERT INTO product_tags (product_id, tag_id) SELECT 20, id FROM tags WHERE name IN ('Kitchen', 'Bamboo', 'Eco-Friendly', 'Zero Waste');
INSERT INTO product_tags (product_id, tag_id) SELECT 21, id FROM tags WHERE name IN ('Kitchen', 'Coconut', 'Handcrafted', 'Decor');
INSERT INTO product_tags (product_id, tag_id) SELECT 22, id FROM tags WHERE name IN ('Decor', 'Lighting', 'Capiz', 'Heritage');
INSERT INTO product_tags (product_id, tag_id) SELECT 23, id FROM tags WHERE name IN ('Kitchen', 'Wood', 'Serving', 'Home');
INSERT INTO product_tags (product_id, tag_id) SELECT 24, id FROM tags WHERE name IN ('Home Fragrance', 'Sampaguita', 'Fresh', 'Spray');
INSERT INTO product_tags (product_id, tag_id) SELECT 25, id FROM tags WHERE name IN ('Kitchen', 'Palayok', 'Clay', 'Cooking');
INSERT INTO product_tags (product_id, tag_id) SELECT 26, id FROM tags WHERE name IN ('Cleaning', 'Home Essentials', 'Floor Care', 'Household');
INSERT INTO product_tags (product_id, tag_id) SELECT 27, id FROM tags WHERE name IN ('Kitchen Essentials', 'Drinkware', 'Food Service', 'Household');
INSERT INTO product_tags (product_id, tag_id) SELECT 28, id FROM tags WHERE name IN ('Laundry', 'Clothing Storage', 'Organization', 'Household');
INSERT INTO product_tags (product_id, tag_id) SELECT 29, id FROM tags WHERE name IN ('Bathroom Essentials', 'Personal Care', 'Towels', 'Household');
INSERT INTO product_tags (product_id, tag_id) SELECT 30, id FROM tags WHERE name IN ('Cleaning', 'Waste Management', 'Home Essentials', 'Household');
INSERT INTO product_tags (product_id, tag_id) SELECT 31, id FROM tags WHERE name IN ('Home Essentials', 'Laundry', 'Basket', 'Plastic');
INSERT INTO product_tags (product_id, tag_id) SELECT 32, id FROM tags WHERE name IN ('Home Essentials', 'Bayong', 'Woven', 'Eco-Friendly');
INSERT INTO product_tags (product_id, tag_id) SELECT 33, id FROM tags WHERE name IN ('Fashion', 'Indigenous', 'Woven', 'Scarf', 'Heritage');
INSERT INTO product_tags (product_id, tag_id) SELECT 34, id FROM tags WHERE name IN ('Fashion', 'Heritage', 'Filipiniana', 'Dress', 'Traditional');
INSERT INTO product_tags (product_id, tag_id) SELECT 35, id FROM tags WHERE name IN ('Fashion', 'Inabel', 'Woven Bag', 'Heritage');
INSERT INTO product_tags (product_id, tag_id) SELECT 36, id FROM tags WHERE name IN ('Fashion', 'Piña', 'Scarf', 'Traditional');
INSERT INTO product_tags (product_id, tag_id) SELECT 37, id FROM tags WHERE name IN ('Makeup', 'Local Beauty', 'Calamansi', 'Tint');
INSERT INTO product_tags (product_id, tag_id) SELECT 38, id FROM tags WHERE name IN ('Skincare', 'Hair Care', 'VCO', 'Local Produce');
INSERT INTO product_tags (product_id, tag_id) SELECT 39, id FROM tags WHERE name IN ('Fragrance', 'Perfume', 'Sampaguita', 'Local');
INSERT INTO product_tags (product_id, tag_id) SELECT 40, id FROM tags WHERE name IN ('Footwear', 'Slippers', 'Banig', 'Woven');
INSERT INTO product_tags (product_id, tag_id) SELECT 41, id FROM tags WHERE name IN ('Accessories', 'Tnalak', 'Woven', 'Purse');
INSERT INTO product_tags (product_id, tag_id) SELECT 42, id FROM tags WHERE name IN ('Clothing', 'Polo', 'Barong', 'Fashion');
INSERT INTO product_tags (product_id, tag_id) SELECT 43, id FROM tags WHERE name IN ('Accessories', 'Hat', 'Sinamay', 'Woven');
INSERT INTO product_tags (product_id, tag_id) SELECT 44, id FROM tags WHERE name IN ('Makeup', 'Lips', 'Lipstick', 'Cosmetic');
INSERT INTO product_tags (product_id, tag_id) SELECT 45, id FROM tags WHERE name IN ('Makeup', 'Face', 'Foundation', 'Cosmetic');
INSERT INTO product_tags (product_id, tag_id) SELECT 46, id FROM tags WHERE name IN ('Makeup', 'Cheeks', 'Blush', 'Cosmetic');
INSERT INTO product_tags (product_id, tag_id) SELECT 47, id FROM tags WHERE name IN ('Makeup', 'Eyes', 'Mascara', 'Cosmetic');
INSERT INTO product_tags (product_id, tag_id) SELECT 48, id FROM tags WHERE name IN ('Makeup', 'Face', 'Concealer', 'Cosmetic');
INSERT INTO product_tags (product_id, tag_id) SELECT 49, id FROM tags WHERE name IN ('Tech', 'Audio', 'Karaoke', 'Party', 'Videoke');
INSERT INTO product_tags (product_id, tag_id) SELECT 50, id FROM tags WHERE name IN ('Tech', 'Audio', 'Bamboo', 'Speaker');
INSERT INTO product_tags (product_id, tag_id) SELECT 51, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Inabel', 'Phone Case');
INSERT INTO product_tags (product_id, tag_id) SELECT 52, id FROM tags WHERE name IN ('Tech', 'Charging', 'Wood', 'Powerbank');
INSERT INTO product_tags (product_id, tag_id) SELECT 53, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Abaca', 'Laptop Sleeve');
INSERT INTO product_tags (product_id, tag_id) SELECT 54, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Wood', 'Phone Stand');
INSERT INTO product_tags (product_id, tag_id) SELECT 55, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Rattan', 'Organizer');
INSERT INTO product_tags (product_id, tag_id) SELECT 56, id FROM tags WHERE name IN ('Tech', 'Computer', 'Capiz', 'Mousepad');
INSERT INTO product_tags (product_id, tag_id) SELECT 57, id FROM tags WHERE name IN ('Tech', 'Photography', 'Bamboo', 'Tripod');
INSERT INTO product_tags (product_id, tag_id) SELECT 58, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Woven', 'Tablet');
INSERT INTO product_tags (product_id, tag_id) SELECT 59, id FROM tags WHERE name IN ('Tech', 'Accessories', 'Charging', 'Type-C');
INSERT INTO product_tags (product_id, tag_id) SELECT 60, id FROM tags WHERE name IN ('Tech', 'Storage', 'USB', 'Flash Drive');
INSERT INTO product_tags (product_id, tag_id) SELECT 61, id FROM tags WHERE name IN ('Tech', 'Computer', 'Mouse', 'Wireless');
INSERT INTO product_tags (product_id, tag_id) SELECT 62, id FROM tags WHERE name IN ('Tech', 'Computer', 'Keyboard', 'Mechanical');
INSERT INTO product_tags (product_id, tag_id) SELECT 63, id FROM tags WHERE name IN ('Tech', 'Audio', 'Microphone', 'Wireless');
INSERT INTO product_tags (product_id, tag_id) SELECT 64, id FROM tags WHERE name IN ('Tech', 'Solar', 'Lamp', 'Emergency', 'Eco-Friendly');

-- ==========================================================
-- 9. AUTOMATED VARIANT GENERATOR (STOCK = 5)
-- ==========================================================

-- Clear existing variants
DELETE FROM variant_option_choices;
DELETE FROM product_variants;

-- Create a temporary table to hold all the combinations
DROP TEMPORARY TABLE IF EXISTS tmp_combos;
CREATE TEMPORARY TABLE tmp_combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    c1 INT, c2 INT, c3 INT, c4 INT
);

-- Generate combinations for 1-option products
INSERT INTO tmp_combos (product_id, c1)
SELECT po.product_id, poc.id
FROM product_options po
JOIN product_option_choices poc ON po.id = poc.option_id
WHERE po.product_id IN (SELECT product_id FROM product_options GROUP BY product_id HAVING COUNT(*) = 1);

-- Generate combinations for 2-option products
INSERT INTO tmp_combos (product_id, c1, c2)
SELECT po1.product_id, poc1.id, poc2.id
FROM product_options po1
JOIN product_option_choices poc1 ON po1.id = poc1.option_id
JOIN product_options po2 ON po1.product_id = po2.product_id AND po2.sort_order = 1
JOIN product_option_choices poc2 ON po2.id = poc2.option_id
WHERE po1.product_id IN (SELECT product_id FROM product_options GROUP BY product_id HAVING COUNT(*) = 2) AND po1.sort_order = 0;

-- Generate combinations for 3-option products
INSERT INTO tmp_combos (product_id, c1, c2, c3)
SELECT po1.product_id, poc1.id, poc2.id, poc3.id
FROM product_options po1
JOIN product_option_choices poc1 ON po1.id = poc1.option_id
JOIN product_options po2 ON po1.product_id = po2.product_id AND po2.sort_order = 1
JOIN product_option_choices poc2 ON po2.id = poc2.option_id
JOIN product_options po3 ON po1.product_id = po3.product_id AND po3.sort_order = 2
JOIN product_option_choices poc3 ON po3.id = poc3.option_id
WHERE po1.product_id IN (SELECT product_id FROM product_options GROUP BY product_id HAVING COUNT(*) = 3) AND po1.sort_order = 0;

-- Generate combinations for 4-option products
INSERT INTO tmp_combos (product_id, c1, c2, c3, c4)
SELECT po1.product_id, poc1.id, poc2.id, poc3.id, poc4.id
FROM product_options po1
JOIN product_option_choices poc1 ON po1.id = poc1.option_id
JOIN product_options po2 ON po1.product_id = po2.product_id AND po2.sort_order = 1
JOIN product_option_choices poc2 ON po2.id = poc2.option_id
JOIN product_options po3 ON po1.product_id = po3.product_id AND po3.sort_order = 2
JOIN product_option_choices poc3 ON po3.id = poc3.option_id
JOIN product_options po4 ON po1.product_id = po4.product_id AND po4.sort_order = 3
JOIN product_option_choices poc4 ON po4.id = poc4.option_id
WHERE po1.product_id IN (SELECT product_id FROM product_options GROUP BY product_id HAVING COUNT(*) = 4) AND po1.sort_order = 0;

-- Create and execute a Stored Procedure to insert into the 3NF tables
DROP PROCEDURE IF EXISTS SeedVariants;
DELIMITER //
CREATE PROCEDURE SeedVariants()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_pid, v_c1, v_c2, v_c3, v_c4, v_vid INT;
    DECLARE cur CURSOR FOR SELECT product_id, c1, c2, c3, c4 FROM tmp_combos;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_pid, v_c1, v_c2, v_c3, v_c4;
        IF done THEN LEAVE read_loop; END IF;

        -- Insert into product_variants with default stock of 5
        INSERT INTO product_variants (product_id, stock) VALUES (v_pid, 5);
        SET v_vid = LAST_INSERT_ID();

        -- Link the combinations to variant_option_choices
        INSERT INTO variant_option_choices (variant_id, choice_id) VALUES (v_vid, v_c1);
        IF v_c2 IS NOT NULL THEN INSERT INTO variant_option_choices (variant_id, choice_id) VALUES (v_vid, v_c2); END IF;
        IF v_c3 IS NOT NULL THEN INSERT INTO variant_option_choices (variant_id, choice_id) VALUES (v_vid, v_c3); END IF;
        IF v_c4 IS NOT NULL THEN INSERT INTO variant_option_choices (variant_id, choice_id) VALUES (v_vid, v_c4); END IF;

    END LOOP;
    CLOSE cur;
END //
DELIMITER ;

-- Run the procedure and clean up
CALL SeedVariants();
DROP PROCEDURE SeedVariants;
DROP TEMPORARY TABLE IF EXISTS tmp_combos;

UPDATE products p
SET p.stock = (
    SELECT COALESCE(SUM(pv.stock), 0)
    FROM product_variants pv
    WHERE pv.product_id = p.id
)
WHERE p.id IN (SELECT DISTINCT product_id FROM product_variants);