# 🧺 PiliKart - E-Commerce System

**PiliKart** (pumili ka + cart) is a fully-featured, custom-built e-commerce platform celebrating Filipino heritage. It features four distinct departments named after pieces of Philippine history: **PASO** (Food), **NIPA** (Home), **HABI** (Fashion), and **APOLLO** (Tech). 

Built entirely with **Vanilla PHP**, **MySQL**, and **Vanilla JavaScript**, it offers a smooth, app-like experience without the overhead of heavy frameworks. It includes a fully functional storefront, an interactive shopping cart, a chatbot assistant (PiliBot), a robust Admin Dashboard, and a unique group-ordering system called **Bayanihan Cart**.

## ✨ Key Features

*   **🛒 Dynamic Shopping Experience:** Users can browse products, select variations (e.g., Size, Spice Level, Add-ons), and add them to a persistent cart that saves via LocalStorage.
*   **🏘️ Bayanihan Cart (Group Ordering):** A unique feature allowing multiple users to order together. 
    *   Supports invites and join requests via a 6-character code.
    *   **4 Split Methods:** Equal, By Items (users pay for what they add + equal delivery), Fixed + Equal, and One Payer.
    *   Group members can pay via Cash or GCash (with receipt upload), and the Host verifies payments before confirming the master order.
*   **🛡️ Malasakit Policy (Refunds):** Users can request refunds for delivered items with image proof. PASO (food) items have a 24-hour window, while others have a 7-day window.
*   **📦 Delivery Protection:** Users can opt-in for a protection fee (₱50 per ₱200 subtotal) during checkout for added peace of mind.
*   **📍 Dynamic Delivery Fees:** Delivery fees automatically calculate based on the specific Barangay in Laguna. Note: PASO (food) items are restricted to Calamba, Laguna only.
*   **🔔 Real-time Notifications:** Users and Admins receive in-app notifications for order updates, Bayanihan invites, payment verifications, and refund status changes.
*   **📊 Comprehensive Admin Dashboard:** Manage orders, monitor real-time inventory, add new products, change user roles, track sales analytics (Top Products, Top Departments, Top Locations), and manage Bayanihan Carts.
*   **🌗 Day & Sunset Modes:** A custom UI theme toggle saving to local storage, featuring a warm dark mode ("Sunset").
*   **🤖 PiliBot Assistant:** A built-in chatbot that answers common customer questions about delivery, GCash, orders, and even throws in some Filipino easter eggs.

---

## 🛠️ Prerequisites
Before you begin, ensure you have the following installed:
1. **XAMPP** (with Apache and MySQL)
2. **VS Code** (or any code editor)
3. **MySQL Workbench** (optional, but highly recommended for database management)
4. **Web Browser** (Chrome, Edge, Firefox, etc.)

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Place the Project Files
1. Locate your XAMPP `htdocs` folder (usually `C:\xampp\htdocs\`).
2. Create a folder named `pilikart`.
3. Place all project files inside this folder: `db.php`, `api.php`, `index.html`, `main.js`, and `styles.css`.
4. **Create the Assets Folder:** Create a folder named `assets` in the same directory. Inside it, create the following subfolders and add the corresponding files:
   * `assets/general/` 
     * `landingpagekubo.png` (Landing page background)
     * `Dear Alice.mp4` (Hero video background)
     * `gcash-qr.png` (Mockup GCash QR code)
   * `assets/paso/`, `assets/nipa/`, `assets/habi/`, `assets/apollo/` (Add product images matching the names in the SQL script, e.g., `Chicken Adobo with Rice.png`)

### Step 2: Set Up the Database (MySQL)
1. Open **XAMPP Control Panel** and start **MySQL**.
2. Open **MySQL Workbench** (or phpMyAdmin) and connect to your local instance (`127.0.0.1:3306`).
3. Open a new SQL tab and paste the entire SQL script below. This script will create the database, set up all tables (including Bayanihan Carts, Delivery Fees, and Refunds), and insert the final set of 64 products, options, and user accounts.

<details>
<summary><b>👉 Click here to view the full SQL Setup Script</b></summary>

```sql
-- 1. Create Database & Clean Slate
CREATE DATABASE IF NOT EXISTS pilikart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilikart;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS group_cart_items;
DROP TABLE IF EXISTS group_cart_members;
DROP TABLE IF EXISTS group_carts;
DROP TABLE IF EXISTS delivery_fees;

-- 2. Create Tables
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  address TEXT NOT NULL,
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
  tags VARCHAR(300) NOT NULL DEFAULT '',
  options TEXT NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  payment ENUM('cod','gcash') NOT NULL DEFAULT 'cod',
  payment_proof MEDIUMTEXT NOT NULL,
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL,
  protection_fee INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  status ENUM('Pending','Shipping','Out for Delivery','Delivered') NOT NULL DEFAULT 'Pending',
  delivered_at TIMESTAMP NULL DEFAULT NULL,
  refund_status ENUM('none','requested','approved','rejected') DEFAULT 'none',
  refund_reason TEXT DEFAULT NULL,
  refund_proof MEDIUMTEXT DEFAULT NULL,
  is_group_order TINYINT(1) DEFAULT 0,
  group_cart_id INT DEFAULT NULL,
  group_contributors JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL,
  variation VARCHAR(255) NOT NULL DEFAULT ''
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

CREATE TABLE IF NOT EXISTS group_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_id INT NOT NULL,
  code VARCHAR(6) NOT NULL UNIQUE,
  name VARCHAR(60) NOT NULL,
  status ENUM('open','ordered','cancelled') DEFAULT 'open',
  split_method ENUM('equal','by_adder','fixed_contribution','one_payer') DEFAULT 'equal',
  fixed_amount INT DEFAULT 0,
  customer_name VARCHAR(150) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  delivery_address TEXT DEFAULT '',
  delivery_fee INT DEFAULT 0,
  order_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_cart_members (
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

CREATE TABLE IF NOT EXISTS group_cart_items (
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

-- 3. Insert Default Data & Users
INSERT INTO settings (`key`, `value`) VALUES ('delivery_fee', '50');

INSERT INTO users (name, email, phone, address, password_hash, role) VALUES
('Store Owner', 'admin@pilikart.ph', '09171234567', '{"street": "Main St.", "brgy": "Poblacion", "city": "Calamba"}', 'admin', 'admin'),
('Customer Demo', 'customer@example.com', '09189876543', '{"street": "123 Rizal St", "brgy": "Poblacion", "city": "Calamba"}', 'customer', 'customer'),
('Marc Arambulo', 'marc@pilikart.ph', '09170000001', '{"street": "Bossing St., Arambulo Ave.", "brgy": "San juan", "city": "Calamba"}', 'marc', 'customer'),
('Bryan Flores', 'bryan@pilikart.ph', '09170000002', '{"street": "LC St., Mabangis Ave.", "brgy": "Siranglupa", "city": "Calamba"}', 'bryan', 'admin'),
('Kian Sogoni', 'kian@pilikart.ph', '09170000003', '{"street": "123 St., December Ave.", "brgy": "Looc", "city": "Calamba"}', 'kian', 'admin');

-- Inserting Delivery Fees
INSERT INTO delivery_fees (city, barangay, fee) VALUES
('Biñan', 'Biñan (Poblacion)', 25), ('Biñan', 'Bungahan', 19), ('Biñan', 'Canlalay', 45), ('Biñan', 'Casile', 44), ('Biñan', 'De La Paz', 54), ('Biñan', 'Ganado', 47), ('Biñan', 'Langkiwa', 90), ('Biñan', 'Loma', 144), ('Biñan', 'Malaban', 43), ('Biñan', 'Malamig', 113), ('Biñan', 'Mampalasan', 58), ('Biñan', 'Platero', 20), ('Biñan', 'San Antonio', 40), ('Biñan', 'San Francisco', 52), ('Biñan', 'San Jose', 35), ('Biñan', 'San Vicente', 28), ('Biñan', 'Santo Domingo', 42), ('Biñan', 'Santo Niño', 28), ('Biñan', 'Soro-soro', 45), ('Biñan', 'Timbao', 50), ('Biñan', 'Tubigan', 35), ('Biñan', 'Zapote', 2),
('Cabuyao', 'Baclaran', 86), ('Cabuyao', 'Banaybanay', 26), ('Cabuyao', 'Banlic', 55), ('Cabuyao', 'Barangay Dos', 12), ('Cabuyao', 'Barangay Tres', 8), ('Cabuyao', 'Barangay Uno', 10), ('Cabuyao', 'Bigaa', 19), ('Cabuyao', 'Butong', 44), ('Cabuyao', 'Casile', 90), ('Cabuyao', 'Diezmo', 77), ('Cabuyao', 'Gulod', 54), ('Cabuyao', 'Mamatid', 71), ('Cabuyao', 'Marinig', 31), ('Cabuyao', 'Niugan', 15), ('Cabuyao', 'Pittland', 70), ('Cabuyao', 'Pulo', 25), ('Cabuyao', 'Sala', 10), ('Cabuyao', 'San Isidro', 30),
('Calamba', 'Bagong Kalsada', 35), ('Calamba', 'Banadero', 14), ('Calamba', 'Banlic', 47), ('Calamba', 'Barandal', 59), ('Calamba', 'Barangay 1', 15), ('Calamba', 'Barangay 2', 4), ('Calamba', 'Barangay 3', 8), ('Calamba', 'Barangay 4', 4), ('Calamba', 'Barangay 5', 5), ('Calamba', 'Barangay 6', 2), ('Calamba', 'Barangay 7', 8), ('Calamba', 'Batino', 44), ('Calamba', 'Bubuyan', 40), ('Calamba', 'Bucal', 30), ('Calamba', 'Bunggo', 80), ('Calamba', 'Burol', 60), ('Calamba', 'Camaligan', 70), ('Calamba', 'Canlubang', 100), ('Calamba', 'Halang', 25), ('Calamba', 'Hornalan', 90), ('Calamba', 'Kay-Anlog', 80), ('Calamba', 'La Mesa', 120), ('Calamba', 'Laguerta', 90), ('Calamba', 'Lawa', 60), ('Calamba', 'Lecheria', 15), ('Calamba', 'Lingga', 50), ('Calamba', 'Looc', 40), ('Calamba', 'Mabato', 100), ('Calamba', 'Majada Labas', 70), ('Calamba', 'Makiling', 70), ('Calamba', 'Mapagong', 50), ('Calamba', 'Masili', 30), ('Calamba', 'Maunong', 70), ('Calamba', 'Mayapa', 80), ('Calamba', 'Milagrosa', 80), ('Calamba', 'Paciano Rizal', 40), ('Calamba', 'Palingon', 40), ('Calamba', 'Palo-Alto', 120), ('Calamba', 'Pansol', 70), ('Calamba', 'Parian', 30), ('Calamba', 'Prinza', 70), ('Calamba', 'Punta', 60), ('Calamba', 'Puting Lupa', 80), ('Calamba', 'Real', 20), ('Calamba', 'Saimsim', 90), ('Calamba', 'Sampiruhan', 30), ('Calamba', 'San Cristobal', 50), ('Calamba', 'San Jose', 30), ('Calamba', 'San Juan', 20), ('Calamba', 'Sirang Lupa', 60), ('Calamba', 'Sucol', 80), ('Calamba', 'Turbina', 50), ('Calamba', 'Ulango', 90), ('Calamba', 'Uwisan', 40),
('San Pablo', 'Atisan', 170), ('San Pablo', 'Bagong Bayan II-A', 14), ('San Pablo', 'Bagong Pook VI-C', 8), ('San Pablo', 'Barangay I-A', 11), ('San Pablo', 'Barangay I-B', 6), ('San Pablo', 'Barangay II-A', 22), ('San Pablo', 'Barangay II-B', 15), ('San Pablo', 'Barangay II-C', 12), ('San Pablo', 'Barangay II-D', 10), ('San Pablo', 'Barangay II-E', 13), ('San Pablo', 'Barangay II-F', 20), ('San Pablo', 'Barangay III-A', 10), ('San Pablo', 'Barangay III-B', 12), ('San Pablo', 'Barangay III-C', 15), ('San Pablo', 'Barangay III-D', 18), ('San Pablo', 'Barangay III-E', 20), ('San Pablo', 'Barangay III-F', 22), ('San Pablo', 'Barangay IV-A', 10), ('San Pablo', 'Barangay IV-B', 12), ('San Pablo', 'Barangay IV-C', 15), ('San Pablo', 'Barangay V-A', 22), ('San Pablo', 'Barangay V-B', 25), ('San Pablo', 'Barangay V-C', 28), ('San Pablo', 'Barangay V-D', 10), ('San Pablo', 'Barangay VI-A', 15), ('San Pablo', 'Barangay VI-B', 18), ('San Pablo', 'Barangay VI-D', 20), ('San Pablo', 'Barangay VI-E', 22), ('San Pablo', 'Barangay VII-A', 15), ('San Pablo', 'Barangay VII-B', 18), ('San Pablo', 'Barangay VII-C', 20), ('San Pablo', 'Barangay VII-D', 22), ('San Pablo', 'Barangay VII-E', 25), ('San Pablo', 'Bautista', 130), ('San Pablo', 'Concepcion', 23), ('San Pablo', 'Del Remedio', 17), ('San Pablo', 'Dolores', 36), ('San Pablo', 'San Antonio 1', 83), ('San Pablo', 'San Antonio 2', 110), ('San Pablo', 'San Bartolome', 72), ('San Pablo', 'San Buenaventura', 51), ('San Pablo', 'San Crispin', 61), ('San Pablo', 'San Cristobal', 130), ('San Pablo', 'San Diego', 73), ('San Pablo', 'San Francisco', 22), ('San Pablo', 'San Gabriel', 25), ('San Pablo', 'San Gregorio', 35), ('San Pablo', 'San Ignacio', 44), ('San Pablo', 'San Joaquin', 61), ('San Pablo', 'San Jose', 93), ('San Pablo', 'San Juan', 42), ('San Pablo', 'San Lorenzo', 69), ('San Pablo', 'San Lucas 1', 12), ('San Pablo', 'San Lucas 2', 13), ('San Pablo', 'San Marcos', 50), ('San Pablo', 'San Mateo', 57), ('San Pablo', 'San Miguel', 57), ('San Pablo', 'San Nicolas', 36), ('San Pablo', 'San Pedro', 29), ('San Pablo', 'San Rafael', 23), ('San Pablo', 'San Roque', 29), ('San Pablo', 'San Vicente', 69), ('San Pablo', 'Santa Ana', 91), ('San Pablo', 'Santa Catalina', 69), ('San Pablo', 'Santa Cruz', 80), ('San Pablo', 'Santa Elena', 73), ('San Pablo', 'Santa Felomina', 55), ('San Pablo', 'Santa Isabel', 66), ('San Pablo', 'Santa Maria', 66), ('San Pablo', 'Santa Maria Magdalena', 45), ('San Pablo', 'Santa Monica', 43), ('San Pablo', 'Santa Veronica', 64), ('San Pablo', 'Santiago I', 82), ('San Pablo', 'Santiago II', 110), ('San Pablo', 'Santisimo Rosario', 90), ('San Pablo', 'Santo Angel', 73), ('San Pablo', 'Santo Cristo', 20), ('San Pablo', 'Santo Niño', 66), ('San Pablo', 'Soledad', 42),
('San Pedro', 'Bagong Silang', 70), ('San Pedro', 'Calendola', 42), ('San Pedro', 'Chrysant', 46), ('San Pedro', 'Cuyab', 18), ('San Pedro', 'Estrella', 79), ('San Pedro', 'Fatima', 15), ('San Pedro', 'G.S.I.S.', 53), ('San Pedro', 'Landayan', 23), ('San Pedro', 'Langgam', 86), ('San Pedro', 'Laram', 72), ('San Pedro', 'Magsaysay', 48), ('San Pedro', 'Maharlika', 32), ('San Pedro', 'Narra', 68), ('San Pedro', 'Nueva', 6), ('San Pedro', 'Pacita 1', 29), ('San Pedro', 'Pacita 2', 34), ('San Pedro', 'Riverside', 66), ('San Pedro', 'Rosario', 52), ('San Pedro', 'Sampaguita Village', 46), ('San Pedro', 'San Lorenzo Ruiz', 24), ('San Pedro', 'San Roque', 11), ('San Pedro', 'San Vicente', 79), ('San Pedro', 'Santo Niño', 8), ('San Pedro', 'United Bayanihan', 66), ('San Pedro', 'United Better Living', 79),
('Santa Rosa', 'Aplaya', 50), ('Santa Rosa', 'Balibago', 45), ('Santa Rosa', 'Caingin', 30), ('Santa Rosa', 'Dila', 25), ('Santa Rosa', 'Dita', 40), ('Santa Rosa', 'Don Jose', 70), ('Santa Rosa', 'Ibaba', 15), ('Santa Rosa', 'Kanluran', 15), ('Santa Rosa', 'Labas', 25), ('Santa Rosa', 'Macabling', 40), ('Santa Rosa', 'Malitlit', 60), ('Santa Rosa', 'Malusak', 10), ('Santa Rosa', 'Market Area', 10), ('Santa Rosa', 'Pooc', 30), ('Santa Rosa', 'Pulong Santa Cruz', 60), ('Santa Rosa', 'Santo Domingo', 50), ('Santa Rosa', 'Sinalhan', 45), ('Santa Rosa', 'Tagapo', 20);

-- 4. Insert ALL 64 Products (Options integrated directly)
INSERT INTO products (name, tagline, description, price, category, image, stock, best_seller, tags, options) VALUES

-- ==========================================
-- PASO (Food) - 16 Items
-- ==========================================
('Chicken Adobo with Rice', 'Ang paboritong ulam ng bayan', 'Tender chicken slowly simmered in a harmonious blend of soy sauce, vinegar, and garlic, served over a bed of warm steamed rice. This classic Filipino comfort food evokes the fondest memories of home-cooked meals, bringing a sense of belonging with every bite.', 90, 'paso', 'assets/paso/Chicken Adobo with Rice.png', 30, 1, 'Filipino Food, Chicken, Rice Meal, Ulam', '{"Size": {"Small": 0, "Medium": 20, "Large": 40}, "Spice Level": ["Mild", "Spicy"]}'),
('Pork Sisig with Rice', 'Sarap na tiyak na babalik-balikan', 'A sizzling culinary masterpiece featuring finely chopped pork, onions, and a hint of calamansi. Each savory and crispy bite offers a delightful celebration of local flavors, crafted to bring an authentic and satisfying warmth to your dining experience.', 85, 'paso', 'assets/paso/Pork sisig with rice.png', 20, 0, 'Pork, Filipino Food, Rice Meal, Sizzling', '{"Size": {"Regular": 0, "Large": 25}, "Add Egg": {"No": 0, "Yes": 15}}'),
('Chicken Inasal with Rice', 'Smoky na lasa, puno ng pagmamahal', 'Grilled chicken meticulously marinated in a fragrant infusion of calamansi, garlic, and lemongrass. Smoky, juicy, and rich in cultural heritage, this beloved Visayan classic is prepared to warm your heart and fill your table with joy.', 95, 'paso', 'assets/paso/Chicken Inasal with Rice.png', 25, 0, 'Grilled, Chicken, Rice Meal, Filipino Food', '{"Size": {"Regular": 0, "Large": 20}, "Spice Level": ["Mild", "Spicy"]}'),
('Pancit Bihon Guisado', 'Pampaswerte at pampasaya sa handaan', 'Stir-fried rice noodles gracefully tossed with fresh vegetables, savory pork, and shrimp. A quintessential centerpiece at Filipino celebrations, it symbolizes long life and the enduring warmth of family bonds shared around a table.', 75, 'paso', 'assets/paso/Pancit Bihon Guisado.png', 25, 0, 'Noodles, Pancit, Filipino Food, Handaan', '{"Size": {"Regular": 0, "Party Tray": 150}, "Add Calamansi": {"No": 0, "Yes": 5}}'),
('Beefsilog', 'Simula ng araw na puno ng pag-asa', 'A quintessential Filipino breakfast featuring tender, savory beef tapa, paired with fragrant garlic fried rice and a perfectly cooked farm-fresh egg. It is a comforting embrace to start your day with a smile and a full heart.', 100, 'paso', 'assets/paso/Beefsilog.png', 25, 0, 'Beef, Filipino Food, Rice Meal, Breakfast', '{"Egg Style": ["Sunny-side up", "Scrambled", "Hard-boiled"], "Add Extra Rice": {"No": 0, "Yes": 15}}'),
('Lumpiang Shanghai', 'Paboritong meryenda ng buong pamilya', 'Crispy, golden-brown spring rolls generously packed with seasoned ground pork and sweet carrots. Served with a classic sweet and sour dip, these delightful treats are crafted to be the heart of your gatherings, bringing people together in joyful bites.', 40, 'paso', 'assets/paso/Lumpiang Shanghai.png', 45, 0, 'Appetizer, Pork, Crispy, Shareable', '{"Pack Size": {"5 pcs": 0, "10 pcs": 35, "15 pcs": 65}}'),
('Leche Flan Cup', 'Tamis na laging hinahanap', 'A rich, velvety caramel custard meticulously prepared from egg yolks, evaporated milk, and pure sugar. Smooth and perfectly sweet, this crown jewel of Filipino desserts is a loving indulgence that never fails to uplift the spirit.', 35, 'paso', 'assets/paso/Leche Flan Cup.jpg', 40, 0, 'Dessert, Filipino Sweets, Ready to Eat, Kakanin', '{"Size": {"Regular": 0, "Large": 15}}'),
('Buko Pandan Cup', 'Preskong kaginhawahan sa bawat subo', 'A refreshing, chilled dessert delicately crafted with sweet young coconut strips, fragrant pandan jelly, and rich, creamy milk. It offers a revitalizing embrace, bringing a cool and comforting joy to your dining table on any day.', 35, 'paso', 'assets/paso/Buko Pandan Cup.jpg', 35, 0, 'Dessert, Chilled, Coconut, Filipino Sweets', '{"Size": {"Regular": 0, "Large": 15}, "Sweetness": ["Normal", "Less Sweet"]}'),
('Turon', 'Sarap ng kabataan sa bawat kagat', 'Sweet saba bananas gently wrapped in crispy spring roll pastry and coated in caramelized brown sugar. This classic street food merienda is prepared to bring back fond, warm memories of carefree childhood afternoons with every crunchy bite.', 30, 'paso', 'assets/paso/Turon.png', 50, 0, 'Dessert, Banana, Filipino Snack, Merienda', '{"Pack Size": {"2 pcs": 0, "4 pcs": 25, "6 pcs": 50}}'),
('Classic Fried Chicken with Egg', 'Lutong bahay na hatid ay ginhawa', 'Crispy, golden fried chicken served alongside a generous portion of steamed rice and a fresh egg. A simple, nourishing meal that brings the deep, comforting essence of home right to your plate.', 105, 'paso', 'assets/paso/Classic Fried Chicken.png', 25, 0, 'Chicken, Fried Chicken, Egg, Rice Meal', '{"Chicken Part": {"Leg & Thigh": 0, "Breast": 20}, "Add Gravy": {"No": 0, "Yes": 10}}'),
('Cheese Sticks', 'Kada kagat, puno ng sarap', 'Golden, crispy wrappers filled with rich, gooey melted cheese. Whether shared on a rainy afternoon or during a cozy evening with loved ones, these warmly familiar treats are always a welcomed delight.', 35, 'paso', 'assets/paso/Cheese Sticks.png', 40, 0, 'Appetizer, Cheese, Snack, Shareable', '{"Pack Size": {"8 pcs": 0, "12 pcs": 20}, "Dip": ["Ketchup", "Mayo"]}'),
('French Fries', 'Crispy na pang-meryenda', 'Perfectly cut, golden-fried potatoes lightly dusted with sea salt. A universally loved side dish, thoughtfully prepared to bring a simple, crispy, and heartwarming happiness to your meal.', 50, 'paso', 'assets/paso/French Fries.png', 40, 0, 'Snack, Potatoes, Crispy, Side Dish', '{"Size": {"Regular": 0, "Large": 20}, "Flavor": {"Sea Salt": 0, "Cheese": 15, "Sour Cream": 15}}'),
('Fudgy Brownies', 'Tsokolateng tamis ng pagmamahal', 'Rich, dense, and intensely chocolatey brownies baked to fudgy perfection. A warm, sweet treat crafted to melt in your mouth, offering a moment of comforting indulgence that warms the heart.', 45, 'paso', 'assets/paso/Fudgy Brownies.png', 35, 0, 'Dessert, Chocolate, Baked Goods, Sweets', '{"Pack Size": {"2 pcs": 0, "4 pcs": 40, "6 pcs": 75}, "Add Walnuts": {"No": 0, "Yes": 20}}'),
('Wintermelon Milk Tea', 'Tamang-tama para sa chill na hapon', 'Creamy wintermelon tea gently blended with milk and delightfully chewy tapioca pearls. A refreshing and sweet pick-me-up, perfectly balanced to brighten your day and bring a comforting chill to your senses.', 65, 'paso', 'assets/paso/Wintermelon Milk Tea.png', 40, 0, 'Beverage, Milk Tea, Drinks, Tapioca Pearls', '{"Size": {"Medium": 0, "Large": 20}, "Sugar Level": ["0%", "50%", "100%"], "Ice Level": ["Regular", "Less Ice", "No Ice"], "Add Pearls": {"No": 0, "Yes": 15}}'),
('Classic Cheeseburger', 'Busog at saya sa bawat kagat', 'A juicy, savory beef patty topped with melted cheese and fresh vegetables, tucked inside a soft, toasted bun. A warmly familiar favorite, prepared to provide a deeply satisfying and comforting meal.', 85, 'paso', 'assets/paso/Classic Cheeseburger.png', 30, 0, 'Burger, Fast Food, Beef, Sandwich', '{"Add Bacon": {"No": 0, "Yes": 30}, "Add Cheese": {"No": 0, "Yes": 10}, "Add Egg": {"No": 0, "Yes": 15}}'),
('Arroz Caldo', 'Init ng sabaw, hagod ng pagmamahal', 'A comforting, savory rice porridge cooked with ginger, tender chicken, and a hint of fish sauce. It is a deeply nourishing dish, thoughtfully prepared to warm your body and soothe your soul on any rainy day.', 85, 'paso', 'assets/paso/arrozcaldo.png', 30, 0, 'Filipino Food, Rice Porridge, Comfort Food, Breakfast', '{"Size": {"Regular": 0, "Large": 20}, "Add Egg": {"No": 0, "Yes": 15}, "Extra Chicharon": {"No": 0, "Yes": 10}}'),

-- ==========================================
-- NIPA (Home) - 16 Items
-- ==========================================
('Classic Plastic Tabo', 'Kasama sa bawat ligo, kasama sa tahanan', 'More than just a bathroom essential, it is the trusted companion of Filipino hygiene. Sturdy, reliable, and ready to scoop the perfect amount of water, it brings a refreshing sense of practical comfort to your daily routine.', 45, 'nipa', 'assets/nipa/Classic Plastic Tabo.png', 60, 1, 'Bathroom Essentials, Tabo, Pinoy Culture, Plastic', '{"Color": ["Blue", "Red", "Green", "Pink"], "Size": {"Regular": 0, "Large": 10}}'),
('Banig', 'Himbing ng tulog sa banig ng probinsya', 'A traditional hand-woven sleeping mat meticulously crafted from dried pandan leaves. It provides a cool, breathable surface for rest, thoughtfully connecting you to the refreshing and simple comforts of provincial living.', 350, 'nipa', 'assets/nipa/Banig.png', 15, 0, 'Home Essentials, Banig, Woven, Heritage', '{"Size": {"Single": 0, "Double": 100, "Queen": 200}, "Pattern": ["Geometric", "Floral"]}'),
('Abaca Scrubbing Pad', 'Malinis ang bahay, alaga pa ang kalikasan', 'An eco-friendly cleaning companion made from durable, hand-woven abaca fibers. It effortlessly tackles tough grease while being gentle on the environment, ensuring a clean home and a cared-for planet.', 55, 'nipa', 'assets/nipa/Abaca Scrubbing Pad.png', 40, 0, 'Kitchen Essentials, Abaca, Eco-Friendly, Cleaning', '{"Pack Size": {"1 pc": 0, "3 pcs": 100, "5 pcs": 150}}'),
('Bamboo Utensil Set', 'Kubyertos na gawa ng kalikasan', 'A beautiful set of fork, spoon, and knife carved from sustainable bamboo. Lightweight and stylish, it is a thoughtful, earth-friendly choice designed to bring a touch of natural warmth to your daily meals.', 120, 'nipa', 'assets/nipa/Bamboo Utensil Set.png', 30, 0, 'Kitchen, Bamboo, Eco-Friendly, Zero Waste', '{"Set Type": ["Fork & Spoon", "Full Set"], "Add Bamboo Straw": {"No": 0, "Yes": 30}}'),
('Coconut Shell Bowl', 'Gawang likas, espesyal ang dating', 'A uniquely crafted bowl polished from real coconut shells. Serving your favorite soups or desserts in these bowls adds a rustic, tropical elegance, bringing the gentle beauty of nature to your dining experience.', 150, 'nipa', 'assets/nipa/Coconut Shell Bowl.png', 25, 0, 'Kitchen, Coconut, Handcrafted, Decor', '{"Size": {"Small": 0, "Medium": 20, "Large": 50}}'),
('Capiz Shell Lamp', 'Ilaw na nagbibigay ng init sa tahanan', 'An elegant hanging lamp meticulously crafted with translucent Capiz shells. It casts a warm, soothing glow, instantly transforming any room into a cozy sanctuary and providing a loving embrace of light.', 450, 'nipa', 'assets/nipa/Capiz Shell Lamp.png', 10, 0, 'Decor, Lighting, Capiz, Heritage', '{"Size": {"Small": 0, "Medium": 100, "Large": 200}, "Bulb Included": {"No": 0, "Yes": 50}}'),
('Wooden Serving Tray', 'Paghahain nang may karangalan', 'A sturdy and beautifully grained serving tray carved from local Acacia wood. Perfect for presenting your signature dishes, it adds a touch of dignified hospitality to every shared meal.', 280, 'nipa', 'assets/nipa/Wooden Serving Tray.png', 15, 0, 'Kitchen, Wood, Serving, Home', '{"Size": {"Small": 0, "Medium": 50, "Large": 100}}'),
('Sampaguita Air Freshener', 'Halimuyak ng tahanang Pinoy', 'A room spray that thoughtfully captures the sweet, nostalgic scent of fresh Sampaguita flowers. It gently freshens your space, wrapping your home in the familiar and deeply comforting fragrance of the Philippines.', 180, 'nipa', 'assets/nipa/Sampaguita Air Freshener.png', 35, 0, 'Home Fragrance, Sampaguita, Fresh, Spray', '{"Size": {"250ml": 0, "500ml": 80}}'),
('Palayok', 'Mabagal lutuin, puno ng lasa at alaala', 'A traditional clay pot designed to slowly and evenly distribute heat, bringing out the rich, deep flavors of your favorite stews. It honors the time-honored culinary traditions that have nourished families for generations.', 320, 'nipa', 'assets/nipa/Palayok.png', 12, 0, 'Kitchen, Palayok, Clay, Cooking', '{"Size": {"3L": 0, "5L": 100}}'),
('Broom and Dustpan Set', 'Katuwang sa pagpapanatili ng linis', 'A practical and sturdy cleaning set designed to make sweeping floors effortless. Its thoughtful, lightweight design ensures that keeping your household spaces clean is a smooth and manageable daily task.', 85, 'nipa', 'assets/nipa/Broom and Dustpan Set.png', 28, 0, 'Cleaning, Home Essentials, Floor Care, Household', '{"Color": ["Blue", "Green", "Pink"]}'),
('Plastic Water Pitcher', 'Sariwang tubig para sa buong angkan', 'A lightweight and durable pitcher with an easy-pour spout. Keep your family comfortably hydrated by having refreshing beverages elegantly ready on the dining table every day.', 75, 'nipa', 'assets/nipa/Plastic Water Pitcher.png', 40, 0, 'Kitchen Essentials, Drinkware, Food Service, Household', '{"Size": {"1.5L": 0, "2.5L": 20}}'),
('Plastic Clothes Hangers', 'Ayos at maaliwalas na pamamahay', 'A set of sturdy hangers designed to keep your garments neatly organized. A simple yet highly effective solution to maintain a clean, welcoming, and hassle-free wardrobe.', 60, 'nipa', 'assets/nipa/Plastic Clothes Hangers.png', 30, 0, 'Laundry, Clothing Storage, Organization, Household', '{"Color": ["White", "Black", "Assorted"], "Pack Size": {"10 pcs": 0, "20 pcs": 40}}'),
('Bath Towel', 'Lambot na yakap pagkatapos maligo', 'Wrap yourself in absolute comfort with this ultra-soft and highly absorbent cotton towel. It gently and efficiently dries your skin, providing a warm, refreshing embrace after a relaxing bath.', 100, 'nipa', 'assets/nipa/Bath Towel.png', 50, 0, 'Bathroom Essentials, Personal Care, Towels, Household', '{"Color": ["White", "Beige", "Blue", "Pink"], "Size": {"Standard": 0, "Large": 30}}'),
('Small Waste Bin', 'Maliit na basurahan, malaking tulong', 'A compact, lightweight waste bin that fits perfectly in personal spaces. It thoughtfully helps you maintain a tidy and peaceful environment, keeping your home free from unnecessary clutter.', 65, 'nipa', 'assets/nipa/Small Waste Bin.png', 40, 0, 'Cleaning, Waste Management, Home Essentials, Household', '{"Color": ["White", "Grey", "Black"]}'),
('Plastic Laundry Basket', 'Organisado at maayos na labahan', 'A durable, ventilated laundry basket that keeps garments organized and allows air to circulate. A practical, reliable helper that brings order and ease to your weekly laundry routine.', 120, 'nipa', 'assets/nipa/Plastic Laundry Basket.png', 40, 0, 'Home Essentials, Laundry, Basket, Plastic', '{"Size": {"25L": 0, "40L": 40}, "Color": ["White", "Blue"]}'),
('Woven Bayong', 'Mabisang katuwang sa pamimili', 'A traditional Filipino market bag, robustly handwoven from dried palm leaves. It is an eco-friendly and stylish alternative to plastic, thoughtfully crafted to carry your daily essentials with pride and heritage.', 150, 'nipa', 'assets/nipa/Woven Bayong.png', 25, 0, 'Home Essentials, Bayong, Woven, Eco-Friendly', '{"Size": {"Small": 0, "Medium": 50, "Large": 100}, "Design": ["Checkered", "Striped"]}'),

-- ==========================================
-- HABI (Fashion & Beauty) - 16 Items
-- ==========================================
('Indigenous Woven Scarf', 'Habi ng kultura, suot ng lahi', 'A beautiful, unisex scarf meticulously handwoven by indigenous Filipino tribes. Each vibrant thread tells a story of heritage, resilience, and the timeless artistry of our ancestors, warmly wrapping you in the soul of the Philippines.', 450, 'habi', 'assets/habi/scarf.png', 20, 1, 'Fashion, Indigenous, Woven, Scarf, Heritage', '{"Color": ["Red", "Blue", "Green", "Yellow"]}'),
('Barot Saya', 'Proud na suot, yaman ng kultura', 'The prestigious pride of the Filipiniana wardrobe. Woven with immense grace and profound history, this beautiful ensemble connects you to the elegance of our ancestors, allowing you to wear your heritage with dignity and pride.', 850, 'habi', 'assets/habi/barotsaya.png', 15, 0, 'Fashion, Heritage, Filipiniana, Dress, Traditional', '{"Size": ["Small", "Medium", "Large", "XL"]}'),
('Inabel Woven Tote Bag', 'Gawang Ilocos, yaman na dala-dala', 'A beautifully crafted tote bag made from authentic Inabel fabric, handwoven by dedicated artisans in Ilocos. It is a tangible piece of Filipino artistry, thoughtfully created to accompany you with elegance through your daily life.', 450, 'habi', 'assets/habi/tote.png', 20, 0, 'Fashion, Inabel, Woven Bag, Heritage', '{"Design": ["Stripe A", "Stripe B", "Solid"]}'),
('Pina Fabric Scarf', 'Pinong habi, marangal na ganda', 'Delicately woven from the fine fibers of pineapple leaves, this lightweight scarf exudes timeless elegance. It is a breathtaking symbol of fine Filipino craftsmanship, offering a touch of graceful warmth to your attire.', 350, 'habi', 'assets/habi/fabric scarf.png', 15, 0, 'Fashion, Piña, Scarf, Traditional', '{"Color": ["Natural", "White"]}'),
('Calamansi Lip & Cheek Tint', 'Natural na ganda mula sa kalikasan', 'A fresh, lightweight beauty tint gently made from local calamansi extract. It provides your lips and cheeks with a natural, healthy flush, thoughtfully embracing the simple, vibrant beauty of natural Filipino ingredients.', 149, 'habi', 'assets/habi/cheek tint.png', 40, 0, 'Makeup, Local Beauty, Calamansi, Tint', '{"Shade": ["Peach", "Rose", "Berry"]}'),
('Virgin Coconut Oil VCO', 'Likas na lunas para sa kutis at buhok', 'Cold-pressed from the finest local coconuts, this pure VCO is a versatile and nourishing miracle oil. Thoughtfully prepared for deep hair conditioning or skin moisturizing, it brings the gentle, healing power of nature to your self-care routine.', 199, 'habi', 'assets/habi/coconut oil.png', 50, 0, 'Skincare, Hair Care, VCO, Local Produce', '{"Size": {"250ml": 0, "500ml": 80}}'),
('Sampaguita Perfume', 'Amoy ng bulaklak, alaala ng bayan', 'A gentle, floral scent that beautifully captures the essence of the national flower. Wearing this perfume is a heartwarming experience, wrapping you in the familiar, comforting, and elegant aroma of home.', 250, 'habi', 'assets/habi/sampaguitaperfume.png', 25, 0, 'Fragrance, Perfume, Sampaguita, Local', '{"Size": {"30ml": 0, "50ml": 50, "100ml": 100}}'),
('Banig Slide Slippers', 'Sarap ng pambahay sa bawat hakbang', 'Step into absolute comfort with these casual slippers made from traditional woven banig material. Soft on the feet and thoughtfully designed, they are perfect for relaxing and finding peace around the house.', 120, 'habi', 'assets/habi/slippers.png', 30, 0, 'Footwear, Slippers, Banig, Woven', '{"Size": ["6", "7", "8", "9", "10"], "Color": ["Natural", "Black"]}'),
('Tnalak Coin Purse', 'Gawang kamay, pusong Pilipino', 'A vibrant, handwoven coin purse meticulously crafted from authentic T''nalak fabric by skilled T''boli artisans. It is a small but deeply meaningful way to carry a piece of indigenous Filipino artistry and support local heritage.', 150, 'habi', 'assets/habi/coinpurse.png', 25, 0, 'Accessories, Tnalak, Woven, Purse', '{"Design": ["Motif A", "Motif B"]}'),
('Barong-inspired Polo', 'Modernong suot, may pusong Pinoy', 'A modern, refined take on the classic Barong Tagalog. Lightweight, breathable, and subtly embroidered, it is thoughtfully designed to be perfect for both formal occasions and elegant everyday wear.', 650, 'habi', 'assets/habi/barongpolo.png', 12, 0, 'Clothing, Polo, Barong, Fashion', '{"Size": {"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 50}, "Color": ["White", "Cream"]}'),
('Sinamay Hat', 'Proteksyon sa araw, may klasikong ganda', 'A wide-brimmed hat skillfully woven from fine sinamay fibers. It adds a touch of timeless elegance to your summer attire while providing comfortable, cool shade from the sun.', 280, 'habi', 'assets/habi/hat.png', 15, 0, 'Accessories, Hat, Sinamay, Woven', '{"Size": ["Small", "Medium", "Large"], "Color": {"Natural": 0, "Black": 20}}'),
('Velvet Matte Lipstick', 'Kulay na may kumpiyansa', 'A highly pigmented, smooth matte lipstick that glides on effortlessly. It delivers rich, long-lasting color, thoughtfully crafted to keep you looking and feeling confidently beautiful all day.', 199, 'habi', 'assets/habi/lipstick.png', 30, 0, 'Makeup, Lips, Lipstick, Cosmetic', '{"Shade": ["Red", "Nude", "Pink", "Mauve"]}'),
('Dewy Liquid Foundation', 'Kutis na puno ng ningning', 'A lightweight, breathable liquid foundation that seamlessly evens out your skin tone. It provides a fresh, natural, and radiant finish, offering a smooth, flawless, and comfortable canvas for everyday wear.', 299, 'habi', 'assets/habi/foundation.png', 25, 0, 'Makeup, Face, Foundation, Cosmetic', '{"Shade": ["Light", "Medium", "Tan", "Deep"]}'),
('Glow Blush', 'Ningning ng pisngi, hatid ay ngiti', 'A silky, blendable blush that adds a healthy, natural pop of color to your cheeks. A gentle sweep instantly brightens your face, adding a heartwarming glow to your daily beauty routine.', 159, 'habi', 'assets/habi/blush.png', 35, 0, 'Makeup, Cheeks, Blush, Cosmetic', '{"Shade": ["Peach", "Pink", "Coral"]}'),
('Waterproof Mascara', 'Titig na hindi kakalas', 'A smudge-proof, waterproof mascara that effectively lengthens and volumizes your lashes. It is thoughtfully crafted to keep your eye makeup flawless through long days, happy tears, and joyful moments.', 189, 'habi', 'assets/habi/mascara.png', 40, 0, 'Makeup, Eyes, Mascara, Cosmetic', '{"Color": ["Black", "Brown"]}'),
('Soft Focus Concealer', 'Tagong kapaguran, liwanag ang bida', 'A creamy, full-coverage concealer that effortlessly hides dark circles and blemishes. Its blendable formula ensures a smooth, flawless finish, helping you feel your most confident and rested self.', 179, 'habi', 'assets/habi/concealer.png', 30, 0, 'Makeup, Face, Concealer, Cosmetic', '{"Shade": ["Light", "Medium", "Tan"]}'),

-- ==========================================
-- APOLLO (Tech) - 16 Items
-- ==========================================
('Mini Karaoke Machine', 'Kantahan na, buong pamilya ay masaya!', 'Because no Filipino celebration is complete without a microphone in hand! Bring the deeply loved videoke experience anywhere with this portable machine that guarantees laughter, shared joy, and unforgettable memories.', 1500, 'apollo', 'assets/apollo/minikaraokemachine.png', 20, 1, 'Tech, Audio, Karaoke, Party, Videoke', '{"Color": ["Black", "Pink", "Blue"], "Extra Mic": {"No": 0, "Yes": 300}}'),
('Bamboo Bluetooth Speaker', 'Musika at saya, kahit saan dalhin', 'A powerful Bluetooth speaker elegantly housed in real bamboo wood. It delivers rich, warm sound while showcasing the beautiful, sustainable craftsmanship of local artisans, blending modern tech with natural warmth.', 1250, 'apollo', 'assets/apollo/bamboobluetoothspeaker.png', 20, 0, 'Tech, Audio, Bamboo, Speaker', '{"Color": ["Light Bamboo", "Dark Bamboo"]}'),
('Handwoven Inabel Phone Case', 'Gadget na may pusong Pinoy', 'Protect your phone while proudly displaying your Filipino heritage. This durable case is thoughtfully wrapped in authentic Inabel fabric, elegantly blending modern, practical tech with traditional, meaningful culture.', 350, 'apollo', 'assets/apollo/handwoveninabelphonecase.png', 30, 0, 'Tech, Accessories, Inabel, Phone Case', '{"Model": ["iPhone 13", "iPhone 14", "iPhone 15", "Samsung S22", "Samsung S23"]}'),
('Wooden Powerbank (10,000mAh)', 'Laging handa, laging may karga', 'Never run out of battery while on the go. This fast-charging power bank features a sleek, beautifully crafted wooden casing, giving your modern gadget a warm, natural aesthetic and a touch of local artistry.', 899, 'apollo', 'assets/apollo/woodenpowerbank.png', 15, 0, 'Tech, Charging, Wood, Powerbank', '{"Capacity": {"10,000mAh": 0, "20,000mAh": 400}, "Wood Type": ["Acacia", "Mahogany"]}'),
('Abaca Laptop Sleeve (14-inch)', 'Likas na proteksyon sa iyong gadget', 'Keep your laptop safe and scratch-free with this padded sleeve. Handwoven from durable abaca fiber, it is an eco-friendly and stylish way to carry your technology, crafted with care for the environment.', 650, 'apollo', 'assets/apollo/abacalaptopsleeve.png', 12, 0, 'Tech, Accessories, Abaca, Laptop Sleeve', '{"Size": {"13-inch": 0, "14-inch": 0, "15-inch": 50}}'),
('Acacia Wood Phone Stand', 'Tibay ng kahoy, suporta sa''yo', 'A sturdy desk companion carved from genuine Philippine Acacia wood. It holds your phone at the perfect angle for watching videos or connecting with loved ones, adding a warm, natural touch to your workspace.', 250, 'apollo', 'assets/apollo/acaciawoodphonestand.png', 25, 0, 'Tech, Accessories, Wood, Phone Stand', '{"Finish": ["Natural", "Dark Walnut"]}'),
('Rattan Cable Organizer', 'Ayos ang kable, ayos ang espasyo', 'Tired of tangled wires? This beautifully hand-woven rattan basket thoughtfully keeps your charging cables and adapters neatly organized, bringing an elegant, natural order to your space.', 180, 'apollo', 'assets/apollo/rattancableorganizer.png', 20, 0, 'Tech, Accessories, Rattan, Organizer', '{"Size": {"Small": 0, "Large": 50}}'),
('Capiz Shell Mousepad', 'Swabeng galaw, Pinoy na karangyaan', 'Upgrade your workspace with this unique mousepad elegantly layered with Capiz shells. It provides a smooth, precise surface for your mouse while adding a touch of timeless Filipino charm to your daily tasks.', 220, 'apollo', 'assets/apollo/capizshellmousepad.png', 15, 0, 'Tech, Computer, Capiz, Mousepad', '{"Shape": ["Round", "Rectangular"]}'),
('Bamboo Tripod', 'Kuha ng alaala, tibay ng kawayan', 'Capture life''s best moments with this lightweight, adjustable tripod made from sustainable bamboo. Perfect for group photos or content creation, it offers stable support with an earth-friendly, elegant design.', 450, 'apollo', 'assets/apollo/bambootripod.png', 18, 0, 'Tech, Photography, Bamboo, Tripod', '{"Height": {"50-inch": 0, "70-inch": 100}, "Color": ["Natural", "Black"]}'),
('Woven Tablet Case', 'Proteksyon na gawa sa kulturang Pinoy', 'A stylish, padded case made with vibrant native woven textiles. It offers reliable protection for your tablet while allowing you to carry a piece of rich Filipino culture with you every day.', 550, 'apollo', 'assets/apollo/woventabletcase.png', 14, 0, 'Tech, Accessories, Woven, Tablet', '{"Size": {"10-inch": 0, "11-inch": 0, "12-inch": 50}}'),
('Charging Cord (Type-C)', 'Mabilis na karga, tuloy ang saya', 'A durable, high-speed braided Type-C cable. Built to withstand daily wear and tear, it ensures your devices power up quickly and safely, providing reliable energy for your daily life.', 199, 'apollo', 'assets/apollo/chargingcord.png', 50, 0, 'Tech, Accessories, Charging, Type-C', '{"Length": {"1m": 0, "1.5m": 0, "2m": 50}, "Color": ["Black", "White"]}'),
('USB Flash Drive (32GB)', 'Bitbit ang alaala at dokumento', 'A compact and highly reliable storage drive to carry your important documents, photos, and videos wherever you go. Fast, secure, and thoughtfully designed, it keeps your digital memories safe.', 289, 'apollo', 'assets/apollo/usbflashdrive.png', 30, 0, 'Tech, Storage, USB, Flash Drive', '{"Capacity": {"32GB": 0, "64GB": 150}, "Color": ["Silver", "Black"]}'),
('Wireless Mouse', 'Tahimik na galaw, tumpak na aksyon', 'An ergonomic wireless mouse with silent click buttons. It provides precise tracking and a comfortable grip, making your long work hours much more pleasant and perfectly peaceful.', 499, 'apollo', 'assets/apollo/wirelessmouse.png', 40, 0, 'Tech, Computer, Mouse, Wireless', '{"Color": ["Black", "White", "Grey"], "DPI": {"1600": 0, "2400": 100}}'),
('Mechanical Keyboard', 'Sarap mag-type, sarap magtrabaho', 'A responsive mechanical keyboard with tactile switches that makes typing feel incredibly satisfying. Thoughtfully crafted for heavy work, coding, or gaming, it provides a deeply comforting and efficient experience.', 1299, 'apollo', 'assets/apollo/mechanicalkeyboard.png', 18, 0, 'Tech, Computer, Keyboard, Mechanical', '{"Switch Type": {"Blue": 0, "Red": 100, "Brown": 100}, "Color": ["Black", "White"]}'),
('Wireless Microphone', 'Boses ay malinaw, mensahe ay malinaw', 'A high-quality, clip-on wireless microphone that captures crystal-clear audio. Perfect for vlogging or online meetings, it ensures your voice is heard with perfect clarity and warmth.', 499, 'apollo', 'assets/apollo/wirelessmicrophone.png', 20, 0, 'Tech, Audio, Microphone, Wireless', '{"Type": {"Lavalier": 0, "Handheld": 200}}'),
('Solar-Powered Lamp', 'Liwanag sa gitna ng dilim', 'A reliable, eco-friendly solar-powered lamp designed to provide bright illumination during emergencies or outdoor gatherings. It is a practical, dependable companion that ensures your home remains warmly lit.', 550, 'apollo', 'assets/apollo/solarpoweredlamp.png', 30, 0, 'Tech, Solar, Lamp, Emergency, Eco-Friendly', '{"Color": ["Black", "Orange"]}');