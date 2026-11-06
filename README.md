# 🧺 PiliKart - E-Commerce System

**PiliKart** (pumili ka + cart) is a lightweight, custom-built e-commerce platform celebrating Filipino heritage. It features four distinct departments named after pieces of Philippine history: **PASO** (Food), **NIPA** (Home), **HABI** (Fashion), and **APOLLO** (Tech). 

Built entirely with **Vanilla PHP**, **MySQL**, and **Vanilla JavaScript**, it offers a smooth, app-like experience without the overhead of heavy frameworks. It includes a fully functional storefront, an interactive shopping cart, a chatbot assistant (PiliBot), and a comprehensive admin dashboard.

## ✨ Key Features (Latest Version)
*   **Dynamic UI & Themes:** Features a custom "Day Mode" and a warm, dark "Sunset Mode" toggle that saves to the user's local storage.
*   **Local Video Hero:** The homepage features a looping, muted local video background (`Dear Alice.mp4`) that scales perfectly to any screen size.
*   **Dedicated Cart Page:** Users can now view a full-page cart, use "Select All" checkboxes, and choose specific items to checkout while leaving others in the cart.
*   **Interactive FAQ & Recipe Box:** Redesigned with smooth accordion-style animations, using custom SVG icons instead of emojis.
*   **Admin Dashboard:** A complete backend interface to manage orders (update statuses, delete), track sales, and edit products via a detailed pop-up modal.
*   **PiliBot Assistant:** A built-in chatbot that answers common customer questions about delivery, GCash, and order tracking.
*   **Dynamic Search & Budget Mode:** Users can filter products instantly by searching keywords or setting a maximum price budget.

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
   * `assets/paso/` (Food images, e.g., `Chicken Adobo with Rice.png`)

### Step 2: Set Up the Database (MySQL)
1. Open **XAMPP Control Panel** and start **MySQL**.
2. Open **MySQL Workbench** (or phpMyAdmin) and connect to your local instance (`127.0.0.1:3306`).
3. Open a new SQL tab and paste the entire SQL script below. This script will create the database, set up all tables (including the `notifications` table required for order updates), and insert the final set of products and user accounts.

<details>
<summary><b>👉 Click here to view the full SQL Setup Script</b></summary>

```sql
-- 1. Create Database
CREATE DATABASE IF NOT EXISTS pilikart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pilikart;

-- 2. Drop tables if they exist (Clean slate)
DROP TABLE IF EXISTS notifications;
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

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Settings & Users
INSERT INTO settings (`key`, `value`) VALUES ('delivery_fee', '50');

INSERT INTO users (name, email, phone, address, password_hash, role) VALUES
('Store Owner', 'admin@pilikart.ph', '09171234567', 'Calamba, Laguna', 'admin', 'admin'),
('Customer Demo', 'customer@example.com', '09189876543', '123 Rizal St, Calamba', 'customer', 'customer');

-- 5. Insert Products (40 Items Total)
INSERT INTO products (name, tagline, description, price, category, image, stock, best_seller, tags) VALUES

-- ==========================================
-- PASO (Food Essentials) - 10 Items
-- ==========================================
('Chicken Adobo with Rice', 'Pinoy comfort meal', 'Tender chicken cooked in soy sauce, vinegar, and garlic, served with steamed rice. A classic Filipino meal for lunch or dinner.', 90, 'paso', 'assets/paso/Chicken Adobo with Rice.png', 30, 1, 'Filipino Food, Chicken, Rice Meal, Budget Friendly'),
('Chicken Inasal with Rice', 'Inihaw na manok', 'Grilled chicken marinated with garlic, calamansi, and spices, served with rice. It has a smoky flavor and a juicy texture.', 95, 'paso', 'assets/paso/Chicken Inasal with Rice.png', 25, 0, 'Grilled, Chicken, Rice Meal, Filipino Food'),
('Pork Sisig with Rice', 'Malutong at malinamnam', 'Chopped pork mixed with onions, calamansi, and seasonings, served with steamed rice. A savory meal for bold flavors.', 85, 'paso', 'assets/paso/Pork Sisig with Rice.jpg', 20, 0, 'Pork, Filipino Food, Rice Meal'),
('Chicken Curry with Rice', 'Creamy at rich', 'Chicken simmered in a creamy curry sauce with potatoes and carrots, served with steamed rice. A filling meal with a rich flavor.', 90, 'paso', 'assets/paso/Chicken Curry with Rice.png', 25, 0, 'Curry, Chicken, Rice Meal, Filipino Food'),
('Crispy Porkchop with Rice', 'Golden and crispy', 'A seasoned pork chop coated in crispy breading and fried until golden brown. Served with steamed rice for a simple, satisfying meal.', 85, 'paso', 'assets/paso/Crispy Porkchop with Rice.jpg', 20, 0, 'Pork, Crispy, Rice Meal, Budget Friendly'),
('Leche Flan Cup', 'Smooth caramel custard', 'A smooth and creamy caramel custard made with eggs, milk, and sugar. Packed in an individual container for easy ordering.', 35, 'paso', 'assets/paso/Leche Plan Cup.jpg', 40, 0, 'Dessert, Filipino Sweets, Ready to Eat'),
('Turon (2 Pieces)', 'Crispy banana rolls', 'Two crispy banana spring rolls coated with caramelized sugar. A sweet Filipino snack that is easy to order and share.', 30, 'paso', 'assets/paso/Turon (2 pcs) .jpg', 50, 0, 'Dessert, Banana, Filipino Snack'),
('Buko Pandan Cup', 'Chilled coconut delight', 'A chilled dessert made with young coconut, pandan jelly, and sweet cream. Served in a cup for a refreshing after-meal treat.', 35, 'paso', 'assets/paso/Buko Pandan.jpg', 35, 0, 'Dessert, Chilled, Coconut, Filipino Sweets'),
('Lumpiang Shanghai (5 Pieces)', 'Crispy pork rolls', 'Five crispy spring rolls filled with seasoned ground pork and vegetables. Served with dipping sauce as a starter or snack.', 40, 'paso', 'assets/paso/Lumpiang Shanghai (5 pcs) .jpg', 45, 1, 'Appetizer, Pork, Crispy, Shareable'),
('Cheese Sticks (8 Pieces)', 'Melted cheese inside', 'Eight crispy wrappers filled with melted cheese, fried until golden brown. A simple snack that customers can enjoy before or between meals.', 35, 'paso', 'assets/paso/Cheese Sticks (8 pcs) .jpg', 40, 0, 'Appetizer, Cheese, Snack, Shareable'),

-- ==========================================
-- NIPA (Home Essentials) - 10 Items
-- ==========================================
('Plastic Storage Box', 'Ayos ang gamit', 'A durable plastic storage box for organizing clothes, toys, accessories, and other household items. Its lightweight design makes it easy to move and store around the house.', 130, 'nipa', 'https://placehold.co/400x400/eee/333?text=Storage+Box', 35, 0, 'Home Essentials, Storage, Organization, Plastic'),
('Microfiber Cleaning Cloth', 'Malambot at madaling linisin', 'A soft and reusable microfiber cloth for cleaning tables, windows, appliances, and other household surfaces. It helps remove dust and dirt without easily scratching surfaces.', 35, 'nipa', 'https://placehold.co/400x400/eee/333?text=Microfiber+Cloth', 50, 0, 'Cleaning, Home Essentials, Reusable, Household'),
('Broom and Dustpan Set', 'Panglinis ng sahig', 'A practical cleaning set for sweeping dust, dirt, and small pieces of trash from floors. Its lightweight design makes everyday household cleaning easier.', 85, 'nipa', 'https://placehold.co/400x400/eee/333?text=Broom+Set', 28, 0, 'Cleaning, Home Essentials, Floor Care, Household'),
('Small Waste Bin', 'Para sa maliliit na basura', 'A lightweight waste bin suitable for bedrooms, bathrooms, and study areas. Its compact design helps keep small spaces clean and makes everyday waste disposal convenient.', 65, 'nipa', 'https://placehold.co/400x400/eee/333?text=Waste+Bin', 40, 0, 'Cleaning, Waste Management, Home Essentials, Household'),
('Plastic Water Pitcher (1.5L)', 'Pang-inumin', 'A lightweight water pitcher with a handle and pouring spout for serving drinking water, juice, and other beverages. Its reusable design makes it practical for everyday meals.', 75, 'nipa', 'https://placehold.co/400x400/eee/333?text=Water+Pitcher', 40, 0, 'Kitchen Essentials, Drinkware, Food Service, Household'),
('Plastic Clothes Hangers (10 Pieces)', 'Pang-organize ng damit', 'A set of ten plastic hangers for hanging shirts, pants, dresses, and other clothing. They help keep clothes neat and organized inside wardrobes and closets.', 60, 'nipa', 'https://placehold.co/400x400/eee/333?text=Hangers', 30, 0, 'Laundry, Clothing Storage, Organization, Household'),
('Bath Towel', 'Malambot at sumipsip', 'A soft and absorbent towel for drying the body after bathing. It is suitable for everyday use at home and can be easily washed after use.', 100, 'nipa', 'https://placehold.co/400x400/eee/333?text=Bath+Towel', 50, 0, 'Bathroom Essentials, Personal Care, Towels, Household'),
('Plastic Clothes Clips (20 Pieces)', 'Pantanggal ng hanger', 'A set of twenty clothes clips for securing wet laundry on clotheslines. They help prevent clothes from falling while drying outdoors.', 30, 'nipa', 'https://placehold.co/400x400/eee/333?text=Clothes+Clips', 60, 0, 'Laundry, Clothes Care, Home Essentials, Household'),
('Scrub Brush', 'Pantanggal ng mantsa', 'A handheld cleaning brush for scrubbing floors, bathroom tiles, sinks, and other washable surfaces. Its sturdy bristles help remove dirt and stubborn stains.', 35, 'nipa', 'https://placehold.co/400x400/eee/333?text=Scrub+Brush', 60, 0, 'Cleaning, Home Essentials, Bathroom Essentials, Household'),
('Plastic Food Cover', 'Proteksyon sa pagkain', 'A lightweight food cover designed to protect prepared meals from dust and insects. It is useful for covering plates and bowls during mealtimes.', 25, 'nipa', 'https://placehold.co/400x400/eee/333?text=Food+Cover', 80, 1, 'Kitchen Essentials, Food Protection, Dining Essentials, Household'),

-- ==========================================
-- HABI (Fashion & Beauty) - 10 Items
-- ==========================================
('Velvet Matte Lipstick', 'Kulay na tumatagal', 'A smooth matte lipstick that gives your lips a rich color and a soft finish. It is perfect for everyday makeup and special occasions.', 199, 'habi', 'https://placehold.co/400x400/eee/333?text=Lipstick', 30, 0, 'Makeup, Lips, Lipstick'),
('Dewy Liquid Foundation', 'Makinis na kutis', 'A lightweight liquid foundation that helps even out skin tone and gives your face a fresh, natural-looking finish.', 299, 'habi', 'https://placehold.co/400x400/eee/333?text=Foundation', 25, 0, 'Makeup, Face, Foundation'),
('Glow Blush', 'Natural pink glow', 'A soft blush that adds a natural pink glow to your cheeks. Its blendable formula makes it easy to use for daily makeup.', 159, 'habi', 'https://placehold.co/400x400/eee/333?text=Blush', 35, 0, 'Makeup, Cheeks, Blush'),
('Waterproof Mascara', 'Mahahabang pilikmata', 'A mascara that helps make your eyelashes look longer, darker, and fuller. Its waterproof formula helps your eye makeup last longer.', 189, 'habi', 'https://placehold.co/400x400/eee/333?text=Mascara', 40, 0, 'Makeup, Eyes, Mascara'),
('Hydrating Lip Gloss', 'Shiny at basa ang labi', 'A glossy lip product that gives your lips a shiny finish while helping them feel soft and moisturized. It can be worn alone or over lipstick.', 129, 'habi', 'https://placehold.co/400x400/eee/333?text=Lip+Gloss', 45, 0, 'Makeup, Lips, Lip Gloss'),
('Soft Focus Concealer', 'Tagong peklat at eyebags', 'A creamy concealer that covers dark spots and blemishes. It blends easily and stays smooth all day long.', 179, 'habi', 'https://placehold.co/400x400/eee/333?text=Concealer', 30, 0, 'Makeup, Face, Concealer'),
('Shimmer Highlighter', 'Glowing look', 'A glowing highlighter that gives bright shine to your cheekbones, nose, and brow area. Great for day or night look.', 219, 'habi', 'https://placehold.co/400x400/eee/333?text=Highlighter', 25, 0, 'Makeup, Cheeks, Highlighter'),
('Brow Definer Pencil', 'Kilay na laging maayos', 'A slim pencil to fill in thin brow spots. It is long-lasting and easy to shape for natural-looking eyebrows.', 149, 'habi', 'https://placehold.co/400x400/eee/333?text=Brow+Pencil', 40, 0, 'Makeup, Eyes, Brows'),
('Tinted Sun Balm', 'Proteksyon sa araw', 'A light tinted balm that protects skin from sun while giving soft natural color to your face.', 239, 'habi', 'https://placehold.co/400x400/eee/333?text=Sun+Balm', 20, 0, 'Skincare-Makeup, Face, Sun care'),
('Lip Scrub Sugar', 'Malambot na labi', 'A gentle sugar scrub that removes dry skin on lips to make them soft and ready for lipstick.', 139, 'habi', 'https://placehold.co/400x400/eee/333?text=Lip+Scrub', 35, 0, 'Lip care, Lips, Scrub'),

-- ==========================================
-- APOLLO (Technologies) - 10 Items
-- ==========================================
('SD Card (64GB)', 'Mabilis na imbakan', 'A small, removable flash memory card used to store digital data and expand storage capacity across various electronic devices.', 1799, 'apollo', 'https://placehold.co/400x400/eee/333?text=SD+Card', 25, 0, 'Tech, Storage, Memory Card'),
('Charging Cord (Type-C)', 'Mabilis mag-charge', 'A durable cord that delivers power to your device. Available in USB to Type-C.', 150, 'apollo', 'https://placehold.co/400x400/eee/333?text=Charging+Cord', 50, 0, 'Tech, Accessories, Charging'),
('USB Flash Drive (64GB)', 'Dalhin ang files kahit saan', 'A compact USB drive for storing and transferring documents, photos, and videos.', 450, 'apollo', 'https://placehold.co/400x400/eee/333?text=Flash+Drive', 30, 0, 'Tech, Storage, USB'),
('JBL Portable Speaker', 'Kantahan kahit saan', 'A portable Bluetooth speaker delivering rich sound, perfect for outdoor gatherings.', 2490, 'apollo', 'https://placehold.co/400x400/eee/333?text=JBL+Speaker', 15, 1, 'Tech, Audio, Speaker'),
('Wireless Microphone', 'Malinaw na boses', 'A wireless microphone system for karaoke, presentations, and events.', 850, 'apollo', 'https://placehold.co/400x400/eee/333?text=Wireless+Mic', 20, 0, 'Tech, Audio, Microphone'),
('Mechanical Keyboard', 'RGB at mabilis', 'An RGB backlit mechanical keyboard with blue switches, offering a satisfying typing experience.', 1250, 'apollo', 'https://placehold.co/400x400/eee/333?text=Keyboard', 18, 0, 'Tech, Computer, Keyboard'),
('Wireless Mouse', 'Tahimik na click', 'An ergonomic wireless mouse with a silent click feature and long battery life.', 450, 'apollo', 'https://placehold.co/400x400/eee/333?text=Mouse', 40, 0, 'Tech, Computer, Mouse'),
('Tripod', 'Stable na kuhaan ng litrato', 'An adjustable tripod for phones and cameras, perfect for vlogging or taking group photos.', 350, 'apollo', 'https://placehold.co/400x400/eee/333?text=Tripod', 25, 0, 'Tech, Photography, Tripod'),
('Powerbank (10,000mAh)', 'Laging may karga', 'A fast-charging powerbank with 10,000mAh capacity to keep your devices charged on the go.', 2799, 'apollo', 'https://placehold.co/400x400/eee/333?text=Powerbank', 20, 0, 'Tech, Charging, Portable, Powerbank'),
('Drawing Tablet', 'Digital na pagguhit', 'A digital drawing tablet with a stylus, perfect for digital artists and designers.', 1500, 'apollo', 'https://placehold.co/400x400/eee/333?text=Drawing+Tablet', 10, 0, 'Tech, Arts, Tablet');
```
</details>

### Step 3: Configure Database Credentials
1. Open `db.php` in your code editor.
2. Ensure the database credentials match your local MySQL setup:
```php
$host = '127.0.0.1';
$db   = 'pilikart';
$user = 'root';
$pass = ''; // Update this if your local MySQL root has a password (e.g., 'browny000')
```

### Step 4: Run the Application
1. In **XAMPP Control Panel**, start **Apache** and **MySQL**.
2. Open your web browser and navigate to: `http://localhost/pilikart/index.html`
3. You should see the PiliKart landing page!

---

## 🔑 Default Accounts
Use these credentials to log in and test the system:

**Admin Account (Owner Dashboard):**
*   **Email:** `admin@pilikart.ph`
*   **Password:** `admin`

**Customer Account:**
*   **Email:** `customer@example.com`
*   **Password:** `customer`

---

## 📝 Important Notes
*   **Sign Up Feature:** The current `api.php` does not have a `signup` action implemented. The "Sign Up" button on the frontend will fail unless you implement the backend logic for it. For now, use the default accounts or the "Continue as Guest" option.
*   **Images:** The product image paths in the database are pre-mapped for the `paso` category to the `assets/paso/` folder. Ensure your images are named exactly as they appear in the SQL script (e.g., `Chicken Adobo with Rice.png`). For the other categories, the script uses placeholder images, which you can update later via the Admin Dashboard.
*   **GCash Payment:** The system allows uploading a receipt. In a real-world scenario, you would need to integrate the actual GCash API, but for this project, it is a visual mock-up stored as Base64 in the database.


- Update 1
