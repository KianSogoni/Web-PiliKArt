# 🧺 PiliKart — E-Commerce System

**PiliKart** (*pumili ka + cart*) is a fully-featured, custom-built e-commerce platform celebrating Filipino heritage. It features four distinct departments named after pieces of Philippine history: **BANGA** (Food), **NIPA** (Home), **HABI** (Fashion & Beauty), and **APOLLO** (Tech).

Built entirely with **Vanilla PHP**, **MySQL**, and **Vanilla JavaScript**, it offers a smooth, app-like experience without the overhead of heavy frameworks. It includes a fully functional storefront, an interactive shopping cart, a rule-based chatbot assistant (**PiliBot**), a robust Admin Dashboard, an immutable order snapshot system, and a unique group-ordering system called **Bayanihan Cart**.

---

## ✨ Key Features

*   **🛒 Dynamic Shopping Experience:** Browse 64 products across 4 departments. Users can pick variations (Size, Spice Level, Add-ons, Color, Model, etc.) that dynamically update pricing and stock, then add to a persistent cart saved via `localStorage`.
*   **🧠 3NF Database Architecture:** Fully normalized database. Tags live in `tags` + `product_tags`, options in `product_options` + `product_option_choices`, and variations in `product_variants` + `variant_option_choices`. The legacy `options` JSON and `tags` string are **reconstructed on the fly** in `api.php` for backwards compatibility with the frontend.
*   **📦 Immutable Order Snapshots:** Orders reference `order_shipping_snapshots` and `order_item_snapshots` — admin price changes or product edits **never alter historical receipts**.
*   **🏘️ Bayanihan Cart (Group Ordering):**
    *   Create a cart → get a 6-character share code (e.g., `ABC123`).
    *   **4 Split Methods:** `Equal`, `By Items`, `Fixed + Equal`, `One Payer`.
    *   Host approves/rejects joins, invites via email, verifies payments.
    *   GCash payments **lock the cart** from being cancelled/mutated — refunds must happen first.
    *   Auto-computed dynamic split breakdown with per-member "Amount Due".
    *   Minimum **2 approved members** to confirm the master order.
*   **🛡️ Malasakit Policy (Refunds):** Users can request refunds with image proof. **24-hour window** for BANGA (food), **7-day window** for everything else. Admin approves → stock auto-restored.
*   **📦 Delivery Protection (Opt-in Insurance):** ₱50 per ₱200 of subtotal. Toggle at checkout.
*   **⚖️ Order Appeal System:** If an admin cancels an order (with a mandatory reason), the customer can appeal. Admin can approve (restores order + deducts stock again) or reject.
*   **📍 Dynamic Delivery Fees:** Rates live in `delivery_fees` (2 per barangay × 6 Laguna cities = 200+ rates). Auto-loaded into dropdowns. **BANGA food items are restricted to Calamba only** (enforced by UI, frontend modal, and backend).
*   **💰 Budget Mode:** Type a max price → products exceeding it are auto-hidden. Cart total warns when you go over.
*   **🔍 Advanced Menu Filters:** Price range, sort, in-stock-only, best-seller-only, and multi-select tag chips.
*   **🔔 Real-time Notifications:** In-app bell + slide-out drawer. Polled every 10s. Toast triggers + PiliBot body animation.
*   **📊 Admin Dashboard:**
    *   Order management (status flow, cancel with reason, appeal review, refund approve/reject)
    *   Inventory editor with dynamic spec groups + per-combination stock
    *   Analytics: Top products, Top departments, Top cities, Top barangays
    *   User role management (requires password verification)
    *   Delivery fee editor (CRUD)
    *   Contact inbox
    *   Bayanihan Cart monitoring (read-only)
*   **📮 Contact Form:** Saves to `contact_messages` + notifies admins. Optional PHPMailer email if online.
*   **🌗 Oak / Forest Theme Toggle:** Custom CSS variables, saved to `localStorage`.
*   **🤖 PiliBot:** Rule-based chatbot with Tagalog + English keyword matching, easter eggs, and dynamic barangay fee lookup.
*   **🗑️ Self-Service Account Deletion:** Password-confirmed soft-delete. Last remaining admin is blocked from self-deleting.
*   **🖱️ Image Protection:** Right-click, drag, and Ctrl+S are disabled globally.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8+ (Vanilla, no framework) |
| Database | MySQL / MariaDB |
| Frontend | Vanilla JavaScript (ES6+) |
| Styling | CSS3 (custom properties, `color-mix()`, `clamp()`) |
| Email | PHPMailer (Gmail SMTP) |
| Server | XAMPP (Apache + MySQL) |

---

## 📋 Prerequisites

1. **XAMPP** (or WAMP / MAMP) with Apache + MySQL
2. **PHP 8.0+**
3. **MySQL Workbench** (recommended for running the SQL script)
4. **PHPMailer** (already in repo under `PHPMailer/`)
5. Modern web browser

---

## 📁 File Structure

```
pilikart/
├── index.html              # Single-page app (all views)
├── main.js                 # All frontend JS (app object)
├── styles.css              # All styling (theme system + responsive)
├── api.php                 # THE backend — all API endpoints
├── api_backup.php          # Older snapshot of api.php (kept for reference)
├── db.php                  # PDO connection (creds here!)
├── database.sql            # Full schema + seed data (3NF)
├── test.php                # Quick admin login sanity check
├── README.md
├── PHPMailer/
│   ├── Exception.php
│   ├── PHPMailer.php
│   └── SMTP.php
└── assets/
    ├── general/
    │   ├── landingpagekubo.png
    │   ├── Dear Alice.mp4
    │   └── gcash-qr.png
    ├── paso/       (16 food images)
    ├── nipa/       (16 home images)
    ├── habi/       (16 fashion/beauty images)
    └── apollo/     (16 tech images)
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Place Project Files

1. Copy the entire `pilikart/` folder into your XAMPP `htdocs`:
   ```
   C:\xampp\htdocs\pilikart\
   ```
2. Create the `assets/` folder with the 4 subfolders above and drop in the product images (names must match those in `database.sql`, e.g. `Chicken Adobo with Rice.png`).

### Step 2 — Create MySQL User & Database

The provided `db.php` uses a **dedicated MySQL user**, not `root`:

```php
$host = '127.0.0.1';
$db   = 'pilikart';
$user = 'pilikart_user';
$pass = 'Marc14';
```

Create the user first (in MySQL Workbench or phpMyAdmin):

```sql
CREATE USER 'pilikart_user'@'127.0.0.1' IDENTIFIED BY 'Marc14';
GRANT ALL PRIVILEGES ON *.* TO 'pilikart_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

> 💡 **Simpler alternative:** Edit `db.php` and replace `pilikart_user` / `Marc14` with your own MySQL credentials (e.g. `root` / `""` on default XAMPP).

### Step 3 — Import the Database

1. Open **MySQL Workbench** → connect to `127.0.0.1` → new query tab.
2. Paste the entire contents of **`database.sql`** and run it.

The SQL script:

- Creates the `pilikart` database and all 20 tables.
- Seeds **5 demo users** (3 admins, 2 customers).
- Seeds **200+ delivery fee rates** across 6 Laguna cities.
- Seeds **64 products** across the 4 departments.
- Seeds **150+ tags** and their product mappings.
- Seeds **99 spec groups** and **250+ option choices**.
- Runs a stored procedure (`SeedVariants`) that auto-generates every possible variant combination with **5 stock each**, then recalculates `products.stock` as the sum of variant stocks.

### Step 4 — Verify db.php

Confirm credentials in `db.php` match your MySQL setup.

### Step 5 — (Optional) Configure PHPMailer

`api.php` sends contact-form emails using **Gmail SMTP**. Find this block inside `case 'contact_submit':` and replace with your own Gmail address + App Password:

```php
$mail->Username = 'pilikartph@gmail.com';
$mail->Password = 'wuocpwsctekjxskw';
```

> ⚠️ If you leave these as-is, the contact form **still works** (messages save to `contact_messages`), but the email step will silently fail. Log errors are written to your PHP error log.

### Step 6 — Run

1. Start **Apache** + **MySQL** in XAMPP.
2. Visit `http://localhost/pilikart/`.
3. (Optional) Visit `http://localhost/pilikart/test.php` to confirm the admin seed account exists.

---

## 👤 Demo Accounts

Passwords are stored **plain-text** in the seed data, but `api.php` supports both `password_verify()` AND plain-text fallback, so you can log in with either format immediately.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pilikart.ph` | `admin` |
| Admin | `bryan@pilikart.ph` | `bryan` |
| Admin | `kian@pilikart.ph` | `kian` |
| Customer | `customer@example.com` | `customer` |
| Customer | `marc@pilikart.ph` | `marc` |

> 🔐 **Production note:** The plain-text fallback in `login` should be removed before going live. New accounts created through the signup flow are hashed with `PASSWORD_DEFAULT`.

---

## 🗄️ Database Architecture (3NF)

The system follows **Third Normal Form**. Key design decisions:

| Old (denormalized) | New (3NF) |
|---|---|
| `products.tags VARCHAR(300)` | `tags` + `product_tags` (M:N) |
| `products.options TEXT` (JSON blob) | `product_options` + `product_option_choices` + `product_variants` + `variant_option_choices` |
| `orders.customer_name/address/phone/subtotal/total` | `order_shipping_snapshots` + computed totals |
| `order_items.name/price` | `order_item_snapshots` |
| `orders.group_contributors JSON` | `order_contributors` table |

**Why snapshots?** If admin changes a product's price today, yesterday's receipt must still show the original price. Snapshot tables are written **once** at checkout time and never updated.

**Backward compatibility:** `api.php` still returns a legacy `p['options']` JSON string and `p['tags']` comma-string to the frontend, but they're **reconstructed on-the-fly** via `buildOptionsJson()` and `getProductTags()`. This means `main.js` needs zero changes.

---

## 🧩 Feature Deep Dive

### 🏘️ Bayanihan Cart

1. Host creates a cart → auto-generates a unique 6-char code.
2. Friends join via code (approval required) or get invited via email.
3. Each approved member adds items from the shared cart.
4. Host picks a **split method**:
   * **Equal** — everyone pays `total / n` (₱1 remainder handled).
   * **By Items** — pay for what you added + equal delivery share. Blocks confirmation if someone has 0 items.
   * **Fixed + Equal** — set a ₱ amount per "fixed" member; rest split equally.
   * **One Payer** — designated payer(s) cover everything.
5. Members pay via **Cash** or **GCash** (screenshot upload, base64 stored). Host verifies.
6. When all verified & `sumPaid >= total`, host clicks **Confirm Order**.

**Lock rules:**

- Any member paying via GCash → cart becomes read-only (no item edits, no cancels, no leaves) until refunded.
- Any `paid=1` member → split method changes and item edits are blocked (host must unverify first).

### 🛡️ Malasakit Refund Policy

| Item category | Refund window | Proof required |
|---|---|---|
| `paso` (Food) | 24 hours after `delivered_at` | Image |
| All others | 7 days after `delivered_at` | Image |

Admin approves → `restoreOrderStock()` runs idempotently via the `stock_restored` flag.

### ⚖️ Order Appeal System

When an admin cancels an order (mandatory reason text), the customer sees an **Appeal Cancellation** button in My Orders. If approved, the order resets to `Pending`, `stock_restored=0`, and stock is re-deducted (with a live availability check first).

### 📍 Delivery Fee Engine

- 200+ rates loaded from `delivery_fees`.
- Frontend builds `lagunaData[city][brgy] = fee` on load.
- Checkout dropdowns cascade: `city` → `brgy` → `fee`.
- **PASO restriction** is enforced in three places: the checkout dropdown disables non-Calamba cities, a red warning banner appears, and the backend rejects the order with `"Ang BANGA (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna."`.

### 💰 Budget Mode

Type any max value in the sidebar or the advanced filter → `app.budget` is set → `renderMenu()` filters `p.price <= budget` and `renderCart()` warns when selected subtotal exceeds it. Persists until cleared.

### 📬 Contact Inbox

- `contact_submit` → saves to DB → notifies admins → tries PHPMailer if `fsockopen('www.google.com', 80)` succeeds.
- Admin sees a live "Inbox" tab in the Dashboard.

### 🗑️ Self-Service Account Deletion

`delete-account` soft-archives the user (`is_archived=1`) after password verification. The **last remaining admin** is blocked from doing this to prevent lock-out.

---

## 🎨 Theme System

Two themes via `data-theme` attribute on `<html>`:

- **Oak (default)** — warm wood/paper palette, `#e5cfa6` background.
- **Forest (dark)** — dark green/charcoal palette, `#0d1611` background.

Theme is stored in `localStorage.pk_theme` and applied by `app.checkTheme()` on init. A `theme-switching` class triggers a 0.9s crossfade on all color properties.

---

## 🤖 PiliBot

A rule-based assistant matching ~150 keyword sets. It:

- Answers delivery/GCash/refund/track/budget questions.
- **Dynamically looks up real delivery fees** when you mention a barangay name.
- Opens product modals via action buttons (`openBotProduct`).
- Reacts to toasts (`bot-toast-active`) and new notifications (`bot-notif-active`).
- Has easter eggs: try `"sino si rizal"`, `"human ka ba"`, `"mahal kita"`, `"tanginamo"`.

To extend, add rows to `app.botBrain` in `main.js`.

---

## 🔐 Security Notes

- All admin actions gated by `$_SESSION['role'] === 'admin'` at the top of `api.php`.
- All user-supplied text passed through `htmlspecialchars()` on output, or `app.esc()` on the JS side.
- Admin reason fields (cancel order, delete product, archive group) are `htmlspecialchars`'d before DB insert to prevent stored XSS via admin notifications.
- Password change requires current password. Role change requires the **acting admin's** password (double-entry confirmation).
- Account deletion requires current password + explicit checkbox.
- GCash proofs are compressed to ≤800px, base64, stored in DB (cap ~10MB raw).
- Right-click / drag / Ctrl+S disabled on all `<img>` tags.

**Not production-ready as-is:** plain-text password fallback, hardcoded PHPMailer credentials, no CSRF tokens on state-changing GETs. Harden before deploying.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| `Database connection failed: SQLSTATE[HY000]` | Check `db.php` credentials match your MySQL user. If using `root`, set `$pass = ''`. |
| Login fails with correct password | Run `test.php` — if it says `password_hash` is not `'admin'`, your seed didn't insert. Re-run the SQL. |
| Products show "Ubos na" but have stock | `database.sql` recalculates `products.stock = SUM(product_variants.stock)`. If you add variants manually, do this manually. |
| Contact form says "naka-save sa Local Mailbox" | Normal — it means `fsockopen('www.google.com')` timed out. Message is still in `contact_messages`. |
| Variants not showing in Add-to-Cart modal | Product has no `product_variants` rows. Run `CALL SeedVariants()` (already done by `database.sql`). |
| `PHPMailer` class not found | Verify the `PHPMailer/` folder sits at the project root next to `api.php`. |
| Cart persists between users | Each user has `pk_cart_{id}` in localStorage. Guests use `pk_cart_guest`. Logging out doesn't wipe carts by design — intended for session continuity. |
| Admin dashboard is empty | Seed only inserts 0 orders. Use the storefront to place test orders, or script `INSERT INTO orders ...` manually (must include a valid `shipping_snapshot_id`). |

---

Enjoy PiliKart! 🇵🇭 — *Pumili ka + Cart.*