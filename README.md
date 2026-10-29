# 🧺 PiliKart - E-Commerce System

A lightweight, custom-built e-commerce platform for local Filipino products (Paso, Nipa, Habi, Apollo). This system uses **Vanilla PHP**, **MySQL**, and **Vanilla JavaScript** with a clean, responsive UI.

## 🛠️ Prerequisites
Before you begin, ensure you have the following installed:
1. **XAMPP** (with Apache and MySQL)
2. **VS Code** (for editing code)
3. **MySQL Workbench** (for database management)
4. **Web Browser** (Chrome, Edge, Firefox, etc.)

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Place the Project Files
1. Locate your XAMPP `htdocs` folder (usually `C:\xampp\htdocs\`).
2. Create a folder named `pilikart`.
3. Place all project files inside: `db.php`, `api.php`, and `index.html`.

### Step 2: Set Up the Database (MySQL Workbench)
1. Open **XAMPP Control Panel** and start **MySQL**.
2. Open **MySQL Workbench** and connect to your local instance (`127.0.0.1:3306` or `localhost`).
3. Open a new SQL tab and paste the entire SQL script below. This will create the database, tables, and seed the initial users and products.

*(Click to expand the SQL script)*
<details>
<summary><b>👉 Click here to view the full SQL Setup Script</b></summary>

```sql
-- 1. Create Database
CREATE DATABASE IF NOT EXISTS pilikart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilikart;

-- 2. Drop tables if they exist (Clean slate)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- 3. Create Tables
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
  total INT NOT NULL,
  status ENUM('Pending','Shipping','Out for Delivery','Delivered') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL
);

CREATE TABLE settings (
  `key` VARCHAR(64) PRIMARY KEY, 
  `value` VARCHAR(255) NOT NULL
);

-- 4. Insert Settings & Users (Plain Text Passwords for testing)
INSERT INTO settings (`key`, `value`) VALUES ('delivery_fee', '50');

INSERT INTO users (name, email, phone, address, password_hash, role) VALUES
('Tindahan Owner', 'admin@pilikart.ph', '09171234567', 'Calamba, Laguna', 'admin', 'admin'),
('Maria Santos', 'maria@example.com', '09189876543', '123 Rizal St., Calamba', 'maria', 'customer');

-- 5. Insert Products (With placeholder images)
INSERT INTO products (name, tagline, description, price, category, image, stock, best_seller, tags) VALUES
('Chicken Adobo with Rice', 'Pinoy comfort meal', 'Tender chicken cooked in soy sauce, vinegar, and garlic with rice.', 90, 'paso', 'https://placehold.co/400x400/eee/333?text=Adobo+Rice', 30, 1, 'Chicken, Manok, Ulam, Rice Meal'),
('Chicken Inasal with Rice', 'Inihaw na manok', 'Grilled chicken with calamansi and spices.', 95, 'paso', 'https://placehold.co/400x400/eee/333?text=Inasal+Rice', 25, 0, 'Grilled, Inihaw, Manok'),
('Pork Sisig with Rice', 'Malutong at malinamnam', 'Chopped pork with onions and calamansi.', 85, 'paso', 'https://placehold.co/400x400/eee/333?text=Pork+Sisig', 20, 0, 'Pork, Baboy, Ulam'),
('Leche Flan Cup', 'Smooth caramel custard', 'Creamy caramel custard in a cup.', 35, 'paso', 'https://placehold.co/400x400/eee/333?text=Leche+Flan', 40, 0, 'Dessert, Panghimagas'),
('Turon (2 Pieces)', 'Crispy banana rolls', 'Banana spring rolls with caramelized sugar.', 30, 'paso', 'https://placehold.co/400x400/eee/333?text=Turon', 50, 0, 'Dessert, Saging, Merienda'),
('Lumpiang Shanghai (5 Pieces)', 'Crispy pork rolls', 'Spring rolls with ground pork and vegetables.', 40, 'paso', 'https://placehold.co/400x400/eee/333?text=Lumpia', 45, 1, 'Appetizer, Pork, Crispy'),
('Plastic Storage Box', 'Ayos ang gamit', 'Durable storage box for organizing.', 130, 'nipa', 'https://placehold.co/400x400/eee/333?text=Storage+Box', 35, 0, 'Storage, Lalagyan, Home'),
('Broom and Dustpan Set', 'Panglinis ng sahig', 'Practical cleaning set.', 85, 'nipa', 'https://placehold.co/400x400/eee/333?text=Broom+Set', 28, 0, 'Cleaning, Walis, Home'),
('Plastic Water Pitcher', 'Pang-inumin', 'Lightweight water pitcher with handle.', 75, 'nipa', 'https://placehold.co/400x400/eee/333?text=Water+Pitcher', 40, 0, 'Kitchen, Pitsel, Drinkware'),
('Bath Towel', 'Malambot at sumipsip', 'Soft absorbent towel.', 100, 'nipa', 'https://placehold.co/400x400/eee/333?text=Bath+Towel', 50, 0, 'Bathroom, Tuwalya, Towels'),
('Scrub Brush', 'Pantanggal ng mantsa', 'Cleaning brush for floors and tiles.', 35, 'nipa', 'https://placehold.co/400x400/eee/333?text=Scrub+Brush', 60, 0, 'Cleaning, Kuskos, Bathroom'),
('Plastic Food Cover', 'Proteksyon sa pagkain', 'Lightweight food cover.', 25, 'nipa', 'https://placehold.co/400x400/eee/333?text=Food+Cover', 80, 1, 'Kitchen, Takip, Dining'),
('Velvet Matte Lipstick', 'Kulay na tumatagal', 'Smooth matte lipstick.', 199, 'habi', 'https://placehold.co/400x400/eee/333?text=Lipstick', 30, 0, 'Makeup, Beauty, Lips'),
('Dewy Liquid Foundation', 'Makinis na kutis', 'Lightweight liquid foundation.', 299, 'habi', 'https://placehold.co/400x400/eee/333?text=Foundation', 25, 0, 'Makeup, Face'),
('Glow Blush', 'Natural pink glow', 'Soft cheek blush.', 159, 'habi', 'https://placehold.co/400x400/eee/333?text=Blush', 35, 0, 'Makeup, Cheeks'),
('Waterproof Mascara', 'Mahahabang pilikmata', 'Waterproof mascara.', 189, 'habi', 'https://placehold.co/400x400/eee/333?text=Mascara', 40, 0, 'Makeup, Eyes'),
('Barong Tagalog', 'Burdang Pinoy', 'Hand-embroidered piña barong.', 1850, 'habi', 'https://placehold.co/400x400/eee/333?text=Barong', 12, 1, 'Fashion, Barong, Filipino Attire'),
('Mini Karaoke Machine', 'Kantahan kahit saan', 'Portable karaoke with 2 mics.', 2490, 'apollo', 'https://placehold.co/400x400/eee/333?text=Karaoke', 15, 1, 'Tech, Audio, Karaoke'),
('SD Card (64GB)', 'Mabilis na imbakan', 'High-speed memory card.', 1799, 'apollo', 'https://placehold.co/400x400/eee/333?text=SD+Card', 25, 0, 'Tech, Storage, Memory Card'),
('Powerbank (10,000mAh)', 'Laging may karga', 'Fast-charging powerbank.', 2799, 'apollo', 'https://placehold.co/400x400/eee/333?text=Powerbank', 20, 0, 'Tech, Charging'),
('Wireless Mouse', 'Tahimik na click', 'Ergonomic wireless mouse.', 450, 'apollo', 'https://placehold.co/400x400/eee/333?text=Mouse', 40, 0, 'Tech, Computer, Mouse'),
('Mechanical Keyboard', 'RGB at mabilis', 'RGB backlit mechanical keyboard.', 1250, 'apollo', 'https://placehold.co/400x400/eee/333?text=Keyboard', 18, 0, 'Tech, Computer, Keyboard'); 