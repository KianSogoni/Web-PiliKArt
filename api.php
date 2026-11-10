<?php
session_start();
require __DIR__ . '/db.php';
header('Content-Type: application/json');
 
$action = $_GET['action'] ?? '';
$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
 
function out(array $data, int $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function resetGroupPayments(PDO $pdo, int $gid) {
    $pdo->prepare('UPDATE group_cart_members SET paid=0, paid_amount=0, payer_verified=0 WHERE group_cart_id=?')
        ->execute([$gid]);
}

function notify(PDO $pdo, int $userId, int $orderId, string $message) {
    if (!$userId) return;
    try {
        $pdo->prepare('INSERT INTO notifications (user_id, order_id, message) VALUES (?,?,?)')
            ->execute([$userId, $orderId, $message]);
    } catch (Exception $e) {}
}

function notifyAdmins(PDO $pdo, int $orderId, string $message) {
    try {
        $admins = $pdo->query("SELECT id FROM users WHERE role='admin' AND is_archived=0")->fetchAll(PDO::FETCH_COLUMN);
        foreach ($admins as $aid) notify($pdo, $aid, $orderId, $message);
    } catch (Exception $e) {}
}

function isValidPassword($pw) {
    return strlen($pw) >= 8 && 
           preg_match('/[A-Z]/', $pw) && 
           preg_match('/[a-z]/', $pw) && 
           preg_match('/[0-9]/', $pw) && 
           preg_match('/[^A-Za-z0-9]/', $pw);
}
 
if (strpos($action, 'admin-') === 0 && ($_SESSION['role'] ?? '') !== 'admin') {
    out(['error' => 'Admins only'], 403);
}
 
switch ($action) {
    case 'load':
        $user = null;
        if (!empty($_SESSION['user_id'])) {
            $stmt = $pdo->prepare('SELECT id, name, email, role, phone, address FROM users WHERE id=?');
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
        }
        
        $products = $pdo->query("SELECT * FROM products WHERE is_archived=0 ORDER BY RAND()")->fetchAll();
        
        $imageMap = [
            'Chicken Adobo with Rice' => 'assets/paso/Chicken Adobo with Rice.png',
            'Chicken Inasal with Rice' => 'assets/paso/Chicken Inasal with Rice.png',
            'Pork Sisig with Rice' => 'assets/paso/Pork Sisig with Rice.jpg',
            'Leche Flan Cup' => 'assets/paso/Leche Plan Cup.jpg',
            'Turon (2 Pieces)' => 'assets/paso/Turon (2 pcs) .jpg',
            'Lumpiang Shanghai (5 Pieces)' => 'assets/paso/Lumpiang Shanghai (5 pcs) .jpg',
            'Buko Pandan Cup' => 'assets/paso/Buko Pandan.jpg',
            'Cheese Sticks (8 Pieces)' => 'assets/paso/Cheese Sticks (8 pcs) .jpg',
            'Chicken Curry with Rice' => 'assets/paso/Chicken Curry with Rice.png',
            'Crispy Porkchop with Rice' => 'assets/paso/Crispy Porkchop with Rice.jpg'
        ];

        foreach ($products as &$p) {
            if (empty($p['image']) && isset($imageMap[$p['name']])) {
                $p['image'] = $imageMap[$p['name']];
            }
        }
        unset($p);

        $fee = (int)$pdo->query("SELECT `value` FROM settings WHERE `key`='delivery_fee'")->fetchColumn();
        $deliveryFees = $pdo->query("SELECT id, city, barangay, fee FROM delivery_fees ORDER BY city, barangay")->fetchAll();
        $orders = [];
        $notifs = [];
        if ($user) {
            if ($user['role'] === 'admin') {
                $orders = $pdo->query('SELECT * FROM orders WHERE is_archived=0 ORDER BY id DESC LIMIT 50')->fetchAll();
            } else {
                $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id=? AND is_archived=0 ORDER BY id DESC');
                $stmt->execute([$user['id']]);
                $orders = $stmt->fetchAll();
            }
            foreach ($orders as &$o) {
                $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
                $stmt->execute([$o['id']]);
                $o['items'] = $stmt->fetchAll();
                if (!empty($o['group_contributors'])) {
                    try { $o['contributors'] = json_decode($o['group_contributors'], true) ?: []; }
                    catch (Exception $e) { $o['contributors'] = []; }
                }
            }
            unset($o);
            
            try {
                $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC, id DESC LIMIT 50');
                $stmt->execute([$user['id']]);
                $notifs = $stmt->fetchAll();
            } catch (Exception $e) {
                $notifs = []; 
            }
        }
        $groups = [];
        if ($user) {
            try {
                $stmt = $pdo->prepare("
                    SELECT gc.id, gc.name, gc.code, gc.status, gc.host_id,
                           m.role AS my_role, m.status AS my_status
                    FROM group_carts gc
                    INNER JOIN group_cart_members m ON m.group_cart_id = gc.id AND m.user_id = ?
                    WHERE gc.status IN ('open','locked','ordered')
                    ORDER BY gc.created_at DESC LIMIT 20
                ");
                $stmt->execute([$user['id']]);
                $groups = $stmt->fetchAll();
            } catch (Exception $e) { $groups = []; }
        }
        out(['user' => $user, 'products' => $products, 'orders' => $orders,
             'fee' => $fee, 'notifications' => $notifs, 'groups' => $groups, 'deliveryFees' => $deliveryFees]);

    case 'signup':
        $name  = trim($in['name'] ?? '');
        $email = trim(strtolower($in['email'] ?? ''));
        $pw    = (string)($in['password'] ?? '');
        
        // 🟢 Extract new fields
        $confirm_pw = (string)($in['confirm_password'] ?? '');
        $city = trim($in['city'] ?? '');
        $brgy = trim($in['brgy'] ?? '');
        $street = trim($in['street'] ?? '');

        if ($name === '') out(['error' => 'Ilagay ang buong pangalan mo.'], 400);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(['error' => 'Mali ang email format.'], 400);
        if (!isValidPassword($pw)) {
            out(['error' => 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'], 400);
        }

        if ($pw !== $confirm_pw) out(['error' => 'Hindi nagtutugma ang password at confirm password.'], 400);
        if ($city === '' || $brgy === '' || $street === '') {
            out(['error' => 'Kumpletuhin ang address (Lungsod, Barangay, at Street).'], 400);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email=?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) out(['error' => 'Ginagamit na ang email na ito. Mag-sign in na lang.'], 409);

        $hash = password_hash($pw, PASSWORD_DEFAULT);

        $address = json_encode(['street' => $street, 'brgy' => $brgy, 'city' => $city]);

        $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, address, password_hash, role) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$name, $email, '', $address, $hash, 'customer']);
        $uid = (int)$pdo->lastInsertId();

        session_regenerate_id(true);
        $_SESSION = ['user_id' => $uid, 'role' => 'customer', 'name' => $name];
        notify($pdo, $uid, 0, 'Maligayang pagdating sa PiliKart, suki! Ang account mo ay handa na. Salamat sa pagsali!');
        out(['ok' => true, 'role' => 'customer']);

    case 'login':
        $email = trim(strtolower($in['email'] ?? ''));
        $pw = (string)($in['password'] ?? '');
        
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email=? AND is_archived=0');
        $stmt->execute([$email]);
        $u = $stmt->fetch();
        
        if (!$u) out(['error' => 'Walang account na naka-register sa email na ito.'], 401);
        
        $db_pass = $u['password_hash'];
        
        if ($db_pass === $pw || password_verify($pw, $db_pass)) {
            session_regenerate_id(true);
            $_SESSION = ['user_id' => $u['id'], 'role' => $u['role'], 'name' => $u['name']];
            out(['ok' => true, 'role' => $u['role']]);
        } else {
            out(['error' => 'Mali ang password. Subukan ulit.'], 401);
        }
 
    case 'logout':
        session_destroy();
        out(['ok' => true]);

    case 'update-profile':
        if (empty($_SESSION['user_id'])) out(['error' => 'Not logged in'], 401);
        
        $name = trim($in['name'] ?? '');
        $email = trim(strtolower($in['email'] ?? ''));
        $phone = trim($in['phone'] ?? '');
        $address = trim($in['address'] ?? '');

        if ($name === '') out(['error' => 'Ilagay ang pangalan mo.'], 400);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(['error' => 'Mali ang email format.'], 400);

        // Phone validation (Backend)
        $cleanPhone = str_replace([' ', '-'], '', $phone);
        if ($cleanPhone && !preg_match('/^(09|\+639)\d{9}$/', $cleanPhone)) {
            out(['error' => 'Mali ang format ng contact number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.'], 400);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email=? AND id!=?');
        $stmt->execute([$email, $_SESSION['user_id']]);
        if ($stmt->fetch()) out(['error' => 'Ginagamit na ang email na ito ng ibang account.'], 409);

        $stmt = $pdo->prepare('UPDATE users SET name=?, email=?, phone=?, address=? WHERE id=?');
        $stmt->execute([$name, $email, $cleanPhone, $address, $_SESSION['user_id']]);
        
        $_SESSION['name'] = $name;
        notify($pdo, (int)$_SESSION['user_id'], 0, 'Na-update na ang iyong profile information.');
        out(['ok' => true]);

    case 'change-password':
        if (empty($_SESSION['user_id'])) out(['error' => 'Not logged in'], 401);
        
        $current = (string)($in['current'] ?? '');
        $new = (string)($in['new'] ?? '');

        if (!isValidPassword($new)) {
            out(['error' => 'New Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'], 400);
        }
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id=?');
        $stmt->execute([$_SESSION['user_id']]);
        $u = $stmt->fetch();

        if (!$u || !password_verify($current, $u['password_hash'])) {
            out(['error' => 'Mali ang kasalukuyang password.'], 401);
        }

        $hash = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?');
        $stmt->execute([$hash, $_SESSION['user_id']]);
        notify($pdo, (int)$_SESSION['user_id'], 0, 'Matagumpay na nabago ang password ng iyong account.');
        out(['ok' => true]);
 
    case 'place-order':
        try {
            $items = $in['items'] ?? [];
            if (!$items) out(['error' => 'Walang laman ang cart.'], 400);

            // Phone validation (Backend)
            $phone = trim($in['phone'] ?? '');
            $cleanPhone = str_replace([' ', '-'], '', $phone);
            if (!preg_match('/^(09|\+639)\d{9}$/', $cleanPhone)) {
                out(['error' => 'Mali ang format ng contact number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.'], 400);
            }

            $ids = array_column($items, 'id');
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($ph)");
            $stmt->execute($ids);
            $prods = array_column($stmt->fetchAll(), null, 'id');
 
            $subtotal = 0; $lines = [];
            $hasPaso = false;
            foreach ($items as $it) {
                $p = $prods[$it['id']] ?? null;
                if (!$p || $p['sold_out'] || $p['stock'] < $it['qty']) {
                    $itemName = $p ? $p['name'] : 'Item';
                    out(['error' => "Kulang ang stock para sa $itemName. (Available: " . ($p['stock'] ?? 0) . ")"], 400);
                }
                if (strtolower($p['category']) === 'paso') $hasPaso = true;
                
                // 🟢 SECURE VARIATION PRICE CALCULATION
                $unitPrice = (float)$p['price'];
                $varStr = $it['variation'] ?? '';
                if (!empty($p['options']) && !empty($varStr)) {
                    $optionsObj = json_decode($p['options'], true);
                    if ($optionsObj) {
                        $parts = explode(', ', $varStr);
                        foreach ($parts as $part) {
                            $kv = explode(': ', $part);
                            if (count($kv) === 2) {
                                $group = $kv[0];
                                $choice = $kv[1];
                                if (isset($optionsObj[$group])) {
                                    // Check if it's an object with prices (like Size) instead of a simple array (like Color)
                                    if (!is_array($optionsObj[$group]) || array_keys($optionsObj[$group]) !== range(0, count($optionsObj[$group]) - 1)) {
                                        if (isset($optionsObj[$group][$choice])) {
                                            $unitPrice += (float)$optionsObj[$group][$choice];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                $subtotal += $unitPrice * $it['qty'];
                $lines[] = [
                    'id' => $p['id'], 
                    'name' => $p['name'], 
                    'price' => $unitPrice, 
                    'qty' => $it['qty'],
                    'variation' => $varStr 
                ];
            }

            // PASO restriction — food items deliverable only within Calamba
            $address = (string)($in['address'] ?? '');
            if ($hasPaso && stripos($address, 'Calamba') === false) {
                out(['error' => 'Ang BANGA (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna.'], 400);}

            $fee = isset($in['fee']) ? (int)$in['fee'] : (int)$pdo->query("SELECT `value` FROM settings WHERE `key`='delivery_fee'")->fetchColumn();
            $protectionFee = 0;
            if (!empty($in['protection_fee_enabled'])) {
                $protectionFee = ceil($subtotal / 200) * 50;
            }
            $total = $subtotal + $fee + $protectionFee;

 
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, phone, address, payment, payment_proof, subtotal, delivery_fee, protection_fee, total) VALUES (?,?,?,?,?,?,?,?,?,?)');
            $stmt->execute([
                $_SESSION['user_id'] ?? null,
                $in['name'],
                $cleanPhone,
                $address,
                ($in['payment'] ?? 'cod') === 'gcash' ? 'gcash' : 'cod',
                $in['proof'] ?? '',
                $subtotal,
                $fee,
                $protectionFee,
                $total
            ]);
            $oid = $pdo->lastInsertId();
 
            $oiStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, variation) VALUES (?,?,?,?,?,?)'); // NEW
            $upStmt = $pdo->prepare('UPDATE products SET stock = stock - ?, sold_out = (stock <= 0) WHERE id = ?');
            foreach ($lines as $l) {
                $oiStmt->execute([$oid, $l['id'], $l['name'], $l['price'], $l['qty'], $l['variation']]); // NEW
                $upStmt->execute([$l['qty'], $l['id']]);
            }
            if (!empty($_SESSION['user_id'])) {
                try {
                    $pdo->prepare('INSERT INTO notifications (user_id, order_id, message) VALUES (?,?,?)')->execute([$_SESSION['user_id'], $oid, "Salamat, suki! Natanggap na namin ang order #$oid — inihahanda na namin ito nang buong puso."]);
                } catch (Exception $e) {}
            }
            $pdo->commit();
            out(['ok' => true, 'order_id' => $oid]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            out(['error' => 'Database Error: ' . $e->getMessage()], 500);
        }
        notifyAdmins($pdo, $oid, "Bagong order #$oid mula kay {$in['name']} — total ₱$total.");
 
    case 'admin-update-order':
        $oid = (int)$in['order_id'];
        $status = $in['status'];

        if ($status === 'Delivered') {
            $stmt = $pdo->prepare('UPDATE orders SET status=?, delivered_at=NOW() WHERE id=?');
        } else {
            $stmt = $pdo->prepare('UPDATE orders SET status=?, delivered_at=NULL WHERE id=?');
        }
        $stmt->execute([$status, $oid]);
        
        $stmt = $pdo->prepare('SELECT user_id FROM orders WHERE id=?');
        $stmt->execute([$oid]);
        $uid = $stmt->fetchColumn();

        if ($uid) {
            notify($pdo, (int)$uid, $oid, "Update sa order #$oid: ngayon ay $status.");
        }

        out(['ok' => true]);
 
    case 'admin-archive-order':
        $oid = (int)$in['order_id'];
        $s = $pdo->prepare('SELECT user_id FROM orders WHERE id=?');
        $s->execute([$oid]);
        $uid = $s->fetchColumn();
        $pdo->prepare('UPDATE orders SET is_archived=1 WHERE id=?')->execute([$oid]);
        if ($uid) notify($pdo, (int)$uid, 0, "Ang order #$oid ay na-delete na ng admin.");
        out(['ok' => true]);
 
    case 'admin-edit-product':
        $pid = (int)($in['id'] ?? 0);
        if ($pid <= 0) out(['error' => 'Invalid product.'], 400);

        $name = trim($in['name'] ?? '');
        if ($name === '') out(['error' => 'Ilagay ang pangalan ng produkto.'], 400);

        $price = (int)($in['price'] ?? 0);
        $stock = (int)($in['stock'] ?? 0);
        if ($price < 0 || $stock < 0) out(['error' => 'Hindi pwedeng negatibo ang presyo o stock.'], 400);

        $cat = strtolower(trim($in['category'] ?? 'paso'));
        if (!in_array($cat, ['paso', 'nipa', 'habi', 'apollo'], true)) $cat = 'paso';

        $stmt = $pdo->prepare('UPDATE products SET name=?, tagline=?, description=?, price=?, category=?, image=?, stock=?, sold_out=?, best_seller=?, tags=?, options=? WHERE id=?');
        $stmt->execute([
            $name,
            trim($in['tagline'] ?? ''),
            trim($in['description'] ?? ''),
            $price,
            $cat,
            trim($in['image'] ?? ''),
            $stock,
            $stock <= 0 ? 1 : 0,
            (int)($in['best_seller'] ?? 0),
            trim($in['tags'] ?? ''),
            trim($in['options'] ?? ''),
            $pid
        ]);
        notifyAdmins($pdo, 0, "Na-update ang product: $name.");
        out(['ok' => true]);
 
    case 'admin-delete-product':
        $pdo->prepare('UPDATE products SET is_archived=1 WHERE id=?')->execute([$in['id']]);
        $s = $pdo->prepare('SELECT name FROM products WHERE id=?');
        $s->execute([$in['id']]);
        $pname = $s->fetchColumn() ?: 'Item';
        notifyAdmins($pdo, 0, "Na-archive ang product: $pname.");
        out(['ok' => true]);
 
    case 'admin-add-product':
        $stmt = $pdo->prepare('INSERT INTO products (name,tagline,description,price,category,image,stock,best_seller,tags,options) VALUES (?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $in['name'], 
            $in['tagline'], 
            $in['description'], 
            $in['price'], 
            $in['category'], 
            $in['image'], 
            $in['stock'], 
            (int)($in['best_seller'] ?? 0),
            $in['tags'],
            $in['options'] ?? ''
        ]);
        notifyAdmins($pdo, 0, "Naidagdag ang bagong product: {$in['name']}.");
        out(['ok' => true]);
    
    case 'admin-get-analytics':
        $limit = $_GET['limit'] ?? 5;
        $sort = $_GET['sort'] ?? 'total_sold';
        
        if ($sort !== 'total_revenue') $sort = 'total_sold';
        $limitClause = ($limit === 'all') ? '' : "LIMIT " . (int)$limit;

        $stmt = $pdo->query("
            SELECT p.name, SUM(oi.qty) AS total_sold, SUM(oi.qty * oi.price) AS total_revenue
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE o.is_archived = 0
            GROUP BY p.id, p.name
            HAVING total_sold > 0
            ORDER BY $sort DESC
            $limitClause
        ");
        out($stmt->fetchAll());
    
    case 'admin-get-dept-analytics':
        $stmt = $pdo->query("
            SELECT p.category AS name, 
                   SUM(oi.qty) AS total_sold, 
                   SUM(oi.qty * oi.price) AS total_revenue
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE o.is_archived = 0
            GROUP BY p.category
        ");
        out($stmt->fetchAll());

    case 'admin-search-orders':
        // Uses: LIKE, WHERE, OR, ORDER BY
        $q = '%' . ($_GET['q'] ?? '') . '%';
        $stmt = $pdo->prepare("
            SELECT * FROM orders 
            WHERE customer_name LIKE ? OR address LIKE ? OR id LIKE ?
            ORDER BY id DESC
        ");
        $stmt->execute([$q, $q, $q]);
        $orders = $stmt->fetchAll();
        
        // Fetch items for each order so they render properly
        foreach ($orders as &$o) {
            $stmtItems = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
            $stmtItems->execute([$o['id']]);
            $o['items'] = $stmtItems->fetchAll();
        }
        out($orders);

    case 'admin-get-users':
        $stmt = $pdo->query("
            SELECT u.id, u.name, u.email, u.phone, u.address, u.role, u.created_at, 
                   (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.is_archived = 0) AS order_count
            FROM users u
            WHERE u.is_archived = 0
            ORDER BY u.id ASC
        ");
        out($stmt->fetchAll());

    case 'admin-update-user-role':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $targetUserId = (int)($in['user_id'] ?? 0);
        $newRole = $in['new_role'] ?? '';
        $adminPass = (string)($in['admin_password'] ?? '');
        $confirmPass = (string)($in['confirm_password'] ?? '');

        if (!$targetUserId) out(['error' => 'Invalid user.'], 400);
        if (!in_array($newRole, ['admin', 'customer'], true)) out(['error' => 'Invalid role.'], 400);
        if ($adminPass !== $confirmPass) out(['error' => 'Passwords do not match.'], 400);
        
        if ($targetUserId === $uid) out(['error' => 'You cannot change your own role to avoid locking yourself out.'], 400);

        $stmt = $pdo->prepare('SELECT password_hash, name FROM users WHERE id=?');
        $stmt->execute([$uid]);
        $admin = $stmt->fetch();

        $isValid = false;
        if ($admin) {
            if (password_verify($adminPass, $admin['password_hash']) || $admin['password_hash'] === $adminPass) {
                $isValid = true;
            }
        }

        if (!$isValid) {
            out(['error' => 'Incorrect password. Verification failed.'], 401);
        }

        $pdo->prepare('UPDATE users SET role=? WHERE id=?')->execute([$newRole, $targetUserId]);

        $stmt = $pdo->prepare('SELECT name FROM users WHERE id=?');
        $stmt->execute([$targetUserId]);
        $targetName = $stmt->fetchColumn() ?: 'User';

        notifyAdmins($pdo, 0, "Nagbago ang role ni $targetName to " . strtoupper($newRole) . " (Verified by {$admin['name']}).");
        notify($pdo, $targetUserId, 0, "Ang iyong account role ay nabago sa " . strtoupper($newRole) . " ng admin.");

        out(['ok' => true]);

    case 'admin-archive-user':
        $targetUserId = (int)($in['user_id'] ?? 0);
        if (!$targetUserId) out(['error' => 'Invalid user.'], 400);
        
        $pdo->prepare('UPDATE users SET is_archived=1 WHERE id=?')->execute([$targetUserId]);
        notifyAdmins($pdo, 0, "Na-delete ang isang user account (ID: #$targetUserId).");
        out(['ok' => true]);

    case 'mark-read':
        if (!empty($_SESSION['user_id'])) {
            try {
                $pdo->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?')->execute([$_SESSION['user_id']]);
            } catch (Exception $e) {}
        }
        out(['ok' => true]);

        case 'get-notifications':
            $uid = (int)($_SESSION['user_id'] ?? 0);
            if (!$uid) out([]);
            try {
                $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC, id DESC LIMIT 50');
                $stmt->execute([$uid]);
                out($stmt->fetchAll());
            } catch (Exception $e) { out([]); }
    
    // ============================================================
    // BAYANIHAN CART
    // ============================================================
    case 'group-list':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        if (!$uid) out(['error' => 'Not logged in'], 401);
        $stmt = $pdo->prepare("
            SELECT gc.*, u.name AS host_name, m.role AS my_role, m.status AS my_status,
                   m.paid AS my_paid, m.paid_amount AS my_paid_amount, m.payer_verified AS my_verified,
                   o.status AS order_status
            FROM group_carts gc
            INNER JOIN users u ON gc.host_id = u.id
            INNER JOIN group_cart_members m ON m.group_cart_id = gc.id AND m.user_id = ?
            LEFT JOIN orders o ON gc.order_id = o.id
            WHERE gc.status != 'cancelled'
            ORDER BY gc.created_at DESC
        ");
        $stmt->execute([$uid]);
        $groups = $stmt->fetchAll();
        foreach ($groups as &$g) {
            $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND status="approved"');
            $s->execute([$g['id']]);
            $g['member_count'] = (int)$s->fetchColumn();
            $s = $pdo->prepare('SELECT COALESCE(SUM(price*qty),0) FROM group_cart_items WHERE group_cart_id=?');
            $s->execute([$g['id']]);
            $g['subtotal'] = (int)$s->fetchColumn();
        }
        unset($g);
        out($groups);

    case 'group-create':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        if (!$uid) out(['error' => 'Not logged in'], 401);
        $name = trim($in['name'] ?? '') ?: 'Bayanihan Cart';
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $code = '';
        for ($attempt = 0; $attempt < 25; $attempt++) {
            $code = '';
            for ($i = 0; $i < 6; $i++) $code .= $chars[random_int(0, strlen($chars)-1)];
            $s = $pdo->prepare('SELECT id FROM group_carts WHERE code=?');
            $s->execute([$code]);
            if (!$s->fetch()) break;
        }
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO group_carts (host_id, code, name, status) VALUES (?,?,?,?)')
            ->execute([$uid, $code, $name, 'open']);
        $gid = (int)$pdo->lastInsertId();
        $pdo->prepare('INSERT INTO group_cart_members (group_cart_id, user_id, role, status) VALUES (?,?,?,?)')
            ->execute([$gid, $uid, 'host', 'approved']);
        $pdo->commit();
        notify($pdo, $uid, 0, "Nagawa na ang iyong Bayanihan Cart \"$name\"! I-share ang code na $code sa mga kaibigan.");
        out(['ok' => true, 'id' => $gid, 'code' => $code, 'name' => $name]);

    case 'group-get':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        if (!$uid) out(['error' => 'Not logged in'], 401);
        $gid = (int)($in['id'] ?? $_GET['id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Not found'], 404);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=?');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not a member'], 403);
        $s = $pdo->prepare("
            SELECT m.*, u.name, u.email, u.phone
            FROM group_cart_members m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.group_cart_id=?
            ORDER BY FIELD(m.role,'host','member'), m.joined_at ASC
        ");
        $s->execute([$gid]);
        $g['members'] = $s->fetchAll();
        $s = $pdo->prepare("
            SELECT i.*, u.name AS user_name
            FROM group_cart_items i
            INNER JOIN users u ON i.user_id = u.id
            WHERE i.group_cart_id=?
            ORDER BY i.added_at ASC
        ");
        $s->execute([$gid]);
        $g['items'] = $s->fetchAll();

        // Calculate order status
        $g['order_status'] = null;
        if ($g['order_id']) {
            $s = $pdo->prepare('SELECT status FROM orders WHERE id=?');
            $s->execute([$g['order_id']]);
            $g['order_status'] = $s->fetchColumn();
        }

        // Determine Payment Summary
        $s = $pdo->prepare('SELECT DISTINCT payment_method FROM group_cart_members WHERE group_cart_id=? AND paid=1');
        $s->execute([$gid]);
        $methods = $s->fetchAll(PDO::FETCH_COLUMN);
        if (count($methods) === 0) $g['payment_summary'] = 'Unpaid';
        elseif (count($methods) > 1) $g['payment_summary'] = 'Mixed';
        else $g['payment_summary'] = strtoupper($methods[0]);

        // Check if everyone has at least 1 item (for 'by_adder' validation)
        $g['all_have_items'] = true;
        $approved = array_filter($g['members'], fn($m) => $m['status'] === 'approved');
        foreach ($approved as $m) {
            $hasItem = false;
            foreach ($g['items'] as $it) {
                if ($it['user_id'] == $m['user_id']) { $hasItem = true; break; }
            }
            if (!$hasItem) { $g['all_have_items'] = false; break; }
        }

        $s = $pdo->prepare("
            SELECT m.*, u.name, u.email, u.phone, u.address 
            FROM group_cart_members m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.group_cart_id=?
            ORDER BY FIELD(m.role,'host','member'), m.joined_at ASC
        ");
        $s->execute([$gid]);
        $g['members'] = $s->fetchAll();

        out($g);

    case 'group-join-request':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        if (!$uid) out(['error' => 'Not logged in'], 401);
        $code = strtoupper(trim($in['code'] ?? ''));
        if (strlen($code) !== 6) out(['error' => 'Kailangan ng 6-character code.'], 400);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE code=?');
        $s->execute([$code]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Walang Bayanihan Cart na may ganitong code. Check mo ulit.'], 404);
        if ($g['status'] !== 'open') out(['error' => 'Sarado na ang Bayanihan Cart na ito.'], 409);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=?');
        $s->execute([$g['id'], $uid]);
        $ex = $s->fetch();
        if ($ex) {
            if ($ex['status'] === 'pending')  out(['error' => 'Pending na ang request mo.'], 409);
            if ($ex['status'] === 'approved') out(['error' => 'Miyembro ka na ng cart na ito.'], 409);
            if ($ex['status'] === 'invited')  out(['error' => 'Ini-invite ka na ng host! Tingnan ang invitations.'], 409);
            $pdo->prepare('UPDATE group_cart_members SET status="pending" WHERE id=?')->execute([$ex['id']]);
        } else {
            $pdo->prepare('INSERT INTO group_cart_members (group_cart_id, user_id, role, status) VALUES (?,?,?,?)')
                ->execute([$g['id'], $uid, 'member', 'pending']);
        }
        $s_user = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_user->execute([$uid]); $reqName = $s_user->fetchColumn() ?: 'May isang user';
        notify($pdo, (int)$g['host_id'], 0, "Si $reqName ay nag-request sumali sa iyong Bayanihan Cart \"{$g['name']}\". I-approve o i-reject sa cart detail.");
        out(['ok' => true, 'id' => (int)$g['id']]);

    case 'group-approve-member':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $mid = (int)($in['member_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $pdo->prepare('UPDATE group_cart_members SET status="approved" WHERE id=? AND group_cart_id=?')
            ->execute([$mid, $gid]);
        $s2 = $pdo->prepare('SELECT user_id FROM group_cart_members WHERE id=?');
        $s2->execute([$mid]);
        if ($uid2 = $s2->fetchColumn()) {
            $s_cart = $pdo->prepare('SELECT name FROM group_carts WHERE id=?'); $s_cart->execute([$gid]); $cname = $s_cart->fetchColumn();
            notify($pdo, (int)$uid2, 0, "Na-approve ka na sa Bayanihan Cart \"$cname\"! Makakapag-add ka na ng items.");
        }
        resetGroupPayments($pdo, $gid);
        out(['ok' => true]);

    case 'group-reject-member':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $mid = (int)($in['member_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE id=? AND group_cart_id=?');
        $s->execute([$mid, $gid]);
        $tgt = $s->fetch();
        if (!$tgt) out(['error' => 'Member not found'], 404);
        if ($tgt['role'] === 'host') out(['error' => 'Cannot remove host'], 400);
        if ($tgt['status'] === 'approved') {
            if ($tgt['paid'] == 1 && $tgt['payment_method'] === 'gcash') {
                out(['error' => 'Hindi ma-remove: nagbayad na via GCash. Kailangang i-refund muna.'], 400);
            }
            $pdo->prepare('DELETE FROM group_cart_items WHERE group_cart_id=? AND user_id=?')
                ->execute([$gid, $tgt['user_id']]);
            resetGroupPayments($pdo, $gid);
        }
        $pdo->prepare('DELETE FROM group_cart_members WHERE id=? AND group_cart_id=?')
            ->execute([$mid, $gid]);
        $s_cart = $pdo->prepare('SELECT name FROM group_carts WHERE id=?'); $s_cart->execute([$gid]); $cname = $s_cart->fetchColumn() ?: 'Bayanihan Cart';
        if ($tgt && $tgt['status'] !== 'invited') notify($pdo, (int)$tgt['user_id'], 0, "Hindi na-approve ang join request mo sa Bayanihan Cart \"$cname\".");
        elseif ($tgt) notify($pdo, (int)$tgt['user_id'], 0, "Kinansela ang invite mo sa Bayanihan Cart \"$cname\".");
        out(['ok' => true]);

    case 'group-invite':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $email = trim(strtolower($in['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(['error' => 'Invalid email'], 400);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $s = $pdo->prepare('SELECT id FROM users WHERE email=? AND is_archived=0');
        $s->execute([$email]);
        $target = $s->fetchColumn();
        if (!$target) out(['error' => 'Walang account na may ganitong email.'], 404);
        $target = (int)$target;
        if ($target === $uid) out(['error' => 'Cannot invite yourself'], 400);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=?');
        $s->execute([$gid, $target]);
        $ex = $s->fetch();
        if ($ex && $ex['status'] !== 'rejected') out(['error' => 'User already a member or invited.'], 409);
        if ($ex) {
            $pdo->prepare('UPDATE group_cart_members SET status="invited" WHERE id=?')->execute([$ex['id']]);
        } else {
            $pdo->prepare('INSERT INTO group_cart_members (group_cart_id, user_id, role, status) VALUES (?,?,?,?)')
                ->execute([$gid, $target, 'member', 'invited']);
        }
        notify($pdo, (int)$target, 0, "Iniimbitahan ka ni host na sumali sa isang Bayanihan Cart. Tingnan ang invites sa Bayanihan page.");
        out(['ok' => true]);

    case 'group-my-invites':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        if (!$uid) out([]);
        $s = $pdo->prepare("
            SELECT gc.id AS group_id, gc.name AS group_name, gc.code, u.name AS host_name
            FROM group_cart_members m
            INNER JOIN group_carts gc ON m.group_cart_id = gc.id
            INNER JOIN users u ON gc.host_id = u.id
            WHERE m.user_id=? AND m.status='invited' AND gc.status='open'
        ");
        $s->execute([$uid]);
        out($s->fetchAll());

    case 'group-accept-invite':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $pdo->prepare('UPDATE group_cart_members SET status="approved" WHERE group_cart_id=? AND user_id=? AND status="invited"')
            ->execute([$gid, $uid]);
        resetGroupPayments($pdo, $gid);
        $s2 = $pdo->prepare('SELECT host_id, name FROM group_carts WHERE id=?');
        $s2->execute([$gid]);
        if ($g2 = $s2->fetch()) {
            $s_u = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_u->execute([$uid]); $uname = $s_u->fetchColumn();
            notify($pdo, (int)$g2['host_id'], 0, "Tinanggap ni $uname ang invite sa iyong Bayanihan Cart \"{$g2['name']}\".");
        }
        out(['ok' => true]);

    case 'group-decline-invite':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $pdo->prepare('DELETE FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND status="invited"')
            ->execute([$gid, $uid]);
        $s2 = $pdo->prepare('SELECT host_id, name FROM group_carts WHERE id=?');
        $s2->execute([$gid]);
        if ($g2 = $s2->fetch()) {
            $s_u = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_u->execute([$uid]); $uname = $s_u->fetchColumn();
            notify($pdo, (int)$g2['host_id'], 0, "Tinanggihan ni $uname ang invite sa iyong Bayanihan Cart \"{$g2['name']}\".");
        }
        out(['ok' => true]);

    case 'group-add-item':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND status="approved"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Not approved'], 403);
        $s = $pdo->prepare('SELECT status FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        if ($s->fetchColumn() !== 'open') out(['error' => 'Cart locked'], 400);
        $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND paid=1');
        $s->execute([$gid]);
        if ((int)$s->fetchColumn() > 0) {
            out(['error' => 'Hindi na mababago ang items: may nagbayad na. Kailangang i-unverify muna ang mga bayad.'], 400);
        }
        $pid = (int)($in['product_id'] ?? 0);
        $qty = max(1, (int)($in['qty'] ?? 1));
        $var = trim($in['variation'] ?? '');
        $s = $pdo->prepare('SELECT * FROM products WHERE id=? AND is_archived=0');
        $s->execute([$pid]);
        $p = $s->fetch();
        if (!$p) out(['error' => 'Product not found'], 404);
        
        $s = $pdo->prepare('SELECT id, qty FROM group_cart_items WHERE group_cart_id=? AND user_id=? AND product_id=? AND variation=?');
        $s->execute([$gid, $uid, $pid, $var]);
        $ex = $s->fetch();
        
        if ($ex) {
            // 🟢 Fix: Check combined quantity against stock
            $newQty = $ex['qty'] + $qty;
            if ($p['sold_out'] || $p['stock'] < $newQty) out(['error' => 'Kulang ang stock'], 400);
            $pdo->prepare('UPDATE group_cart_items SET qty=? WHERE id=?')->execute([$newQty, $ex['id']]);
        } else {
            if ($p['sold_out'] || $p['stock'] < $qty) out(['error' => 'Kulang ang stock'], 400);
            $pdo->prepare('INSERT INTO group_cart_items (group_cart_id,user_id,product_id,name,price,qty,variation) VALUES (?,?,?,?,?,?,?)')
                ->execute([$gid, $uid, $pid, $p['name'], $p['price'], $qty, $var]);
        }

        $s_cart = $pdo->prepare('SELECT name, host_id FROM group_carts WHERE id=?'); $s_cart->execute([$gid]); $cart = $s_cart->fetch();
        if ($cart && $cart['host_id'] != $uid) {
            $s_u = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_u->execute([$uid]); $uname = $s_u->fetchColumn();
            notify($pdo, (int)$cart['host_id'], 0, "Idinagdag ni $uname ang $qty x {$p['name']} sa iyong Bayanihan Cart \"{$cart['name']}\".");
        }
        out(['ok' => true]);

    case 'group-update-qty':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $iid = (int)($in['item_id'] ?? 0);
        $delta = (int)($in['delta'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND status="approved"');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not approved'], 403);
        $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND paid=1');
        $s->execute([$gid]);
        if ((int)$s->fetchColumn() > 0) {
            out(['error' => 'Hindi na mababago ang items: may nagbayad na. Kailangang i-unverify muna ang mga bayad.'], 400);
        }
        $s = $pdo->prepare('SELECT * FROM group_cart_items WHERE id=? AND group_cart_id=?');
        $s->execute([$iid, $gid]);
        $it = $s->fetch();
        if (!$it) out(['error' => 'Item not found'], 404);
        if ($it['user_id'] != $uid && $me['role'] !== 'host') out(['error' => 'Not allowed'], 403);
        $new = $it['qty'] + $delta;
        if ($new <= 0) {
            $pdo->prepare('DELETE FROM group_cart_items WHERE id=?')->execute([$iid]);
        } else {
            $s = $pdo->prepare('SELECT stock, sold_out FROM products WHERE id=? AND is_archived=0');
            $s->execute([$it['product_id']]);
            $prod = $s->fetch();
            if (!$prod || $prod['sold_out'] || $prod['stock'] < $new) {
                out(['error' => 'Kulang ang stock para sa item na ito.'], 400);
            }
            $pdo->prepare('UPDATE group_cart_items SET qty=? WHERE id=?')->execute([$new, $iid]);
        }
        out(['ok' => true]);
        

    case 'group-set-split':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $m = $in['method'] ?? 'equal';
        if (!in_array($m, ['equal','by_adder','fixed_contribution','one_payer'], true)) $m = 'equal';
        $fa = max(0, (int)($in['fixed_amount'] ?? 0));
        $pdo->prepare('UPDATE group_carts SET split_method=?, fixed_amount=? WHERE id=?')->execute([$m, $fa, $gid]);
        resetGroupPayments($pdo, $gid);
        out(['ok' => true]);

    case 'group-set-member-flag':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $mid = (int)($in['member_id'] ?? 0);
        $field = $in['field'] ?? '';
        if (!in_array($field, ['is_fixed','is_payer'], true)) out(['error' => 'Invalid field'], 400);
        $val = (int)($in['value'] ?? 0) ? 1 : 0;
        $pdo->prepare("UPDATE group_cart_members SET $field=? WHERE id=? AND group_cart_id=?")
            ->execute([$val, $mid, $gid]);
        resetGroupPayments($pdo, $gid);
        out(['ok' => true]);

    case 'group-set-member-fixed-amount':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $mid = (int)($in['member_id'] ?? 0);
        $amount = max(0, (int)($in['amount'] ?? 0));
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $pdo->prepare('UPDATE group_cart_members SET fixed_share_amount=? WHERE id=? AND group_cart_id=?')
            ->execute([$amount, $mid, $gid]);
        resetGroupPayments($pdo, $gid);
        out(['ok' => true]);

    case 'group-mark-paid':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $mid = (int)($in['member_id'] ?? 0);
        $paid = (int)($in['paid'] ?? 1) ? 1 : 0;
        $amount = max(0, (int)($in['amount'] ?? 0));
        $method = ($in['method'] ?? 'cash') === 'gcash' ? 'gcash' : 'cash';
        $proof  = (string)($in['proof'] ?? '');

        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=?');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not a member'], 403);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE id=? AND group_cart_id=?');
        $s->execute([$mid, $gid]);
        $tgt = $s->fetch();
        if (!$tgt) out(['error' => 'Member not found'], 404);
        if ($me['role'] !== 'host' && $tgt['user_id'] !== $uid) out(['error' => 'Not allowed'], 403);
        
        if ($paid) {
            if ($method === 'gcash' && strlen($proof) < 50) {
                out(['error' => 'I-upload muna ang GCash screenshot.'], 400);
            }
            // If host is the one marking, it auto-verifies.
            $verify = ($me['role'] === 'host') ? 1 : 0;
            $pdo->prepare('UPDATE group_cart_members SET paid=1, paid_amount=?, payment_method=?, payment_proof=?, payer_verified=? WHERE id=?')
                ->execute([$amount, $method, $method === 'gcash' ? $proof : '', $verify, $mid]);
        } else {
            $pdo->prepare('UPDATE group_cart_members SET paid=0, paid_amount=0, payer_verified=0 WHERE id=?')
                ->execute([$mid]);
        }
        out(['ok' => true]);

    case 'group-member-pay':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $method = ($in['method'] ?? 'cash') === 'gcash' ? 'gcash' : 'cash';
        $proof  = (string)($in['proof'] ?? '');
        $amount = max(0, (int)($in['amount'] ?? 0));
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND status="approved"');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not approved'], 403);
        if ($method === 'gcash' && strlen($proof) < 50) {
            out(['error' => 'I-upload muna ang GCash screenshot.'], 400);
        }
        
        $verified = ($me['role'] === 'host') ? 1 : 0;
        
        $pdo->prepare('UPDATE group_cart_members SET payment_method=?, payment_proof=?, paid=1, paid_amount=?, payer_verified=? WHERE group_cart_id=? AND user_id=?')
            ->execute([$method, $method === 'gcash' ? $proof : '', $amount, $verified, $gid, $uid]);
        $s2 = $pdo->prepare('SELECT host_id, name FROM group_carts WHERE id=?');
        $s2->execute([$gid]);
        if ($g2 = $s2->fetch()) {
            $s_u = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_u->execute([$uid]); $uname = $s_u->fetchColumn();
            notify($pdo, (int)$g2['host_id'], 0, "Si $uname ay nagbayad ng ".number_format($amount)." para sa Bayanihan Cart \"{$g2['name']}\". Paki-verify sa cart detail.");
        }
        out(['ok' => true]);

    case 'group-verify-payment':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $mid = (int)($in['member_id'] ?? 0);
        $verify = (int)($in['verify'] ?? 1) ? 1 : 0;
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $s = $pdo->prepare('SELECT paid FROM group_cart_members WHERE id=? AND group_cart_id=?');
        $s->execute([$mid, $gid]);
        if (!$s->fetch()) out(['error' => 'Member not found'], 404);
        $pdo->prepare('UPDATE group_cart_members SET payer_verified=?, paid=? WHERE id=?')
            ->execute([$verify, $verify ? 1 : 0, $mid]);
        $s2 = $pdo->prepare('SELECT user_id FROM group_cart_members WHERE id=?');
        $s2->execute([$mid]);
        if ($memberUid = $s2->fetchColumn()) {
            $s_host = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_host->execute([$uid]); $hname = $s_host->fetchColumn();
            $s_cart = $pdo->prepare('SELECT name FROM group_carts WHERE id=?'); $s_cart->execute([$gid]); $cname = $s_cart->fetchColumn();
            if ($verify) notify($pdo, (int)$memberUid, 0, "Na-verify ni $hname ang iyong bayad sa Bayanihan Cart \"$cname\". Salamat!");
            else notify($pdo, (int)$memberUid, 0, "Na-unverify ni $hname ang iyong bayad sa Bayanihan Cart \"$cname\". Kontakin ang host.");
        }
        out(['ok' => true]);

    case 'group-set-delivery':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Not found'], 404);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        
        $name = trim($in['name'] ?? '');
        $phone = trim(str_replace([' ','-'], '', $in['phone'] ?? ''));
        $addr = trim($in['address'] ?? '');
        $fee = max(0, (int)($in['fee'] ?? 0));
        $oldFee = (int)$g['delivery_fee'];
        
        $pdo->prepare('UPDATE group_carts SET customer_name=?, phone=?, delivery_address=?, delivery_fee=? WHERE id=?')
            ->execute([$name, $phone, $addr, $fee, $gid]);
        if ($fee !== $oldFee) resetGroupPayments($pdo, $gid);
        out(['ok' => true]);

    case 'group-edit-item':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $iid = (int)($in['item_id'] ?? 0);
        $qty = (int)($in['qty'] ?? 1);
        $var = trim($in['variation'] ?? '');
        
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND status="approved"');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not approved'], 403);
        $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND paid=1');
        $s->execute([$gid]);
        if ((int)$s->fetchColumn() > 0) {
            out(['error' => 'Hindi na mababago ang items: may nagbayad na. Kailangang i-unverify muna ang mga bayad.'], 400);
        }
        $s = $pdo->prepare('SELECT * FROM group_cart_items WHERE id=? AND group_cart_id=?');
        $s->execute([$iid, $gid]);
        $it = $s->fetch();
        if (!$it) out(['error' => 'Item not found'], 404);
        if ($it['user_id'] != $uid && $me['role'] !== 'host') out(['error' => 'Not allowed'], 403);

        if ($qty <= 0) {
            $pdo->prepare('DELETE FROM group_cart_items WHERE id=?')->execute([$iid]);
        } else {
            $s = $pdo->prepare('SELECT stock, sold_out FROM products WHERE id=? AND is_archived=0');
            $s->execute([$it['product_id']]);
            $prod = $s->fetch();
            if (!$prod || $prod['sold_out'] || $prod['stock'] < $qty) {
                out(['error' => 'Kulang ang stock para sa item na ito.'], 400);
            }
            $pdo->prepare('UPDATE group_cart_items SET qty=?, variation=? WHERE id=?')->execute([$qty, $var, $iid]);
        }
        out(['ok' => true]);

    case 'group-confirm-order':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Not found'], 404);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND status="approved"');
        $s->execute([$gid]);
        if ((int)$s->fetchColumn() < 2) {
            out(['error' => 'Kailangan ng hindi bababa sa 2 miyembro para ma-confirm ang Bayanihan Cart.'], 400);
        }

        if ($g['status'] !== 'open') out(['error' => 'Already processed'], 400);
        if (!$g['customer_name'] || !$g['phone'] || !$g['delivery_address']) {
            out(['error' => 'Kumpletuhin muna ang delivery details.'], 400);
        }
        $s = $pdo->prepare('SELECT * FROM group_cart_items WHERE group_cart_id=?');
        $s->execute([$gid]);
        $items = $s->fetchAll();
        if (!$items) out(['error' => 'Walang laman ang cart'], 400);
        
        $hasPaso = false;
        foreach ($items as $it) {
            $p = $pdo->prepare('SELECT category FROM products WHERE id=?');
            $p->execute([$it['product_id']]);
            if (strtolower($p->fetchColumn()) === 'paso') { $hasPaso = true; break; }
        }
        if ($hasPaso && stripos($g['delivery_address'], 'Calamba') === false) {
            out(['error' => 'Ang BANGA (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna. Palitan ang delivery address ng group cart.'], 400);}

        $subtotal = 0; $pids = [];
        foreach ($items as $it) { $subtotal += $it['price'] * $it['qty']; $pids[] = $it['product_id']; }
        
        $fee = (int)$g['delivery_fee'];
        $total = $subtotal + $fee;
        $s = $pdo->prepare('SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND status="approved" AND (paid=0 OR payer_verified=0)');
        $s->execute([$gid]);
        if ((int)$s->fetchColumn() > 0) out(['error' => 'May hindi pa bayad o hindi pa na-verify ng host.'], 400);
        
        $s = $pdo->prepare('SELECT COALESCE(SUM(paid_amount),0) FROM group_cart_members WHERE group_cart_id=? AND status="approved"');
        $s->execute([$gid]);
        $sumPaid = (int)$s->fetchColumn();
        if ($sumPaid < $total) out(['error' => 'Kulang ang bayad ng grupo ng ₱' . ($total - $sumPaid) . '.'], 400);

        // 🟢 "By Items" restriction check
        if ($g['split_method'] === 'by_adder') {
            $s = $pdo->prepare('SELECT user_id FROM group_cart_members WHERE group_cart_id=? AND status="approved"');
            $s->execute([$gid]);
            $approvedUids = $s->fetchAll(PDO::FETCH_COLUMN);
            $itemUids = array_unique(array_column($items, 'user_id'));
            if (count(array_diff($approvedUids, $itemUids)) > 0) {
                out(['error' => 'Cannot confirm: "By Items" split is chosen but someone has not added any items yet.'], 400);
            }
        }

        // 🟢 Determine dynamic payment method
        $s = $pdo->prepare('SELECT DISTINCT payment_method FROM group_cart_members WHERE group_cart_id=? AND paid=1');
        $s->execute([$gid]);
        $methods = $s->fetchAll(PDO::FETCH_COLUMN);
        $finalPayment = 'cod';
        if (count($methods) > 1) $finalPayment = 'mixed';
        elseif (count($methods) === 1) $finalPayment = $methods[0] === 'gcash' ? 'gcash' : 'cod';

        $s = $pdo->prepare("
            SELECT m.user_id, u.name, m.paid_amount, m.role, m.payment_method
            FROM group_cart_members m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.group_cart_id=? AND m.status='approved'
        ");
        $s->execute([$gid]);
        $contribs = $s->fetchAll();
        
        $aggregatedItems = [];
        foreach ($items as $it) {
            $key = $it['product_id'] . '|' . $it['variation'];
            if (!isset($aggregatedItems[$key])) {
                $aggregatedItems[$key] = $it;
            } else {
                $aggregatedItems[$key]['qty'] += $it['qty'];
            }
        }

        foreach ($aggregatedItems as $it) {
            $s = $pdo->prepare('SELECT * FROM products WHERE id=? AND is_archived=0');
            $s->execute([$it['product_id']]);
            $p = $s->fetch();
            if (!$p || $p['sold_out'] || $p['stock'] < $it['qty']) {
                out(['error' => "Kulang ang stock para sa item na {$it['name']}. (Available: " . ($p['stock'] ?? 0) . ")"], 400);
            }
        }

        $pdo->beginTransaction();
        try {
            $pdo->prepare('INSERT INTO orders (user_id, customer_name, phone, address, payment, payment_proof, subtotal, delivery_fee, protection_fee, total, is_group_order, group_cart_id, group_contributors, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
                ->execute([$uid, $g['customer_name'], $g['phone'], $g['delivery_address'],
                           $finalPayment, '', $subtotal, $fee, 0, $total, 1, $gid,
                           json_encode($contribs), 'Pending']);
            $oid = (int)$pdo->lastInsertId();
            
            $oi = $pdo->prepare('INSERT INTO order_items (order_id,product_id,name,price,qty,variation) VALUES (?,?,?,?,?,?)');
            $up = $pdo->prepare('UPDATE products SET stock=stock-?, sold_out=(stock<=0) WHERE id=?');
            // Loop through the aggregated items instead of the raw $items array
            foreach ($aggregatedItems as $it) {
                $oi->execute([$oid, $it['product_id'], $it['name'], $it['price'], $it['qty'], $it['variation']]);
                $up->execute([$it['qty'], $it['product_id']]);
            }
            $pdo->prepare('UPDATE group_carts SET status="ordered", order_id=? WHERE id=?')->execute([$oid, $gid]);
            foreach ($contribs as $c) {
                notify($pdo, (int)$c['user_id'], (int)$oid, "Bayanihan order #$oid ay nakumpirma na! Track it in My Orders.");
            }
            $pdo->commit();
            out(['ok' => true, 'order_id' => $oid]);
        } catch (Exception $e) {
            $pdo->rollBack();
            out(['error' => 'Error: ' . $e->getMessage()], 500);
        }

    case 'group-leave':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=?');
        $s->execute([$gid, $uid]);
        $me = $s->fetch();
        if (!$me) out(['error' => 'Not a member'], 404);
        if ($me['role'] === 'host') out(['error' => 'Host cannot leave; cancel instead'], 400);
        // 🛡️ GCash protection: paid members cannot leave
        if ($me['paid'] == 1 && $me['payment_method'] === 'gcash') {
            out(['error' => 'Hindi ka pwedeng umalis: nagbayad ka na via GCash. Kailangang i-refund muna ng host.'], 400);
        }
        $pdo->prepare('DELETE FROM group_cart_members WHERE id=?')->execute([$me['id']]);
        $pdo->prepare('DELETE FROM group_cart_items WHERE group_cart_id=? AND user_id=?')->execute([$gid, $uid]);
        resetGroupPayments($pdo, $gid);
        $s2 = $pdo->prepare('SELECT host_id, name FROM group_carts WHERE id=?');
        $s2->execute([$gid]);
        if ($g2 = $s2->fetch()) notify($pdo, (int)$g2['host_id'], 0, "May miyembrong umalis sa iyong Bayanihan Cart \"{$g2['name']}\".");
        out(['ok' => true]);

    case 'group-cancel':
        $uid = (int)($_SESSION['user_id'] ?? 0);
        $gid = (int)($in['group_id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Not found'], 404);
        if ($g['status'] === 'ordered') out(['error' => 'Ordered na ang group na ito — hindi na pwede i-cancel.'], 400);
        if ($g['status'] === 'cancelled') out(['error' => 'Cancelled na.'], 400);
        $s = $pdo->prepare('SELECT * FROM group_cart_members WHERE group_cart_id=? AND user_id=? AND role="host"');
        $s->execute([$gid, $uid]);
        if (!$s->fetch()) out(['error' => 'Only host'], 403);
        $s = $pdo->prepare("SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=? AND paid=1 AND payment_method='gcash'");
        $s->execute([$gid]);
        $gcashPaid = (int)$s->fetchColumn();
        if ($gcashPaid > 0) {
            out(['error' => "Hindi ma-cancel: may $gcashPaid member na nagbayad via GCash. Kailangang i-refund muna."], 400);
        }
        $pdo->prepare('UPDATE group_carts SET status="cancelled", is_archived=1 WHERE id=?')->execute([$gid]);
        $s2 = $pdo->prepare('SELECT user_id FROM group_cart_members WHERE group_cart_id=? AND status="approved"');
        $s2->execute([$gid]);
        $s_host = $pdo->prepare('SELECT name FROM users WHERE id=?'); $s_host->execute([$uid]); $hname = $s_host->fetchColumn();
        foreach ($s2->fetchAll(PDO::FETCH_COLUMN) as $memberUid) {
            notify($pdo, (int)$memberUid, 0, "Kinansela ni $hname ang Bayanihan Cart \"{$g['name']}\".");
        }
        out(['ok' => true]);
    // ============================================================
    // ADMIN: Bayanihan monitoring (read-only)
    // ============================================================
    case 'admin-list-groups':
        $stmt = $pdo->query("
            SELECT gc.*, u.name AS host_name,
                (SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=gc.id AND status='approved') AS member_count,
                (SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=gc.id AND status='pending') AS pending_count,
                (SELECT COALESCE(SUM(price*qty),0) FROM group_cart_items WHERE group_cart_id=gc.id) AS subtotal,
                (SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=gc.id AND paid=1 AND payment_method='gcash') AS gcash_paid_count,
                (SELECT COUNT(*) FROM group_cart_members WHERE group_cart_id=gc.id AND paid=1 AND payer_verified=1) AS verified_count
            FROM group_carts gc
            INNER JOIN users u ON gc.host_id = u.id
            ORDER BY gc.created_at DESC
        ");
        out($stmt->fetchAll());

    case 'admin-get-group':
        $gid = (int)($in['id'] ?? $_GET['id'] ?? 0);
        $s = $pdo->prepare('SELECT * FROM group_carts WHERE id=?');
        $s->execute([$gid]);
        $g = $s->fetch();
        if (!$g) out(['error' => 'Not found'], 404);
        $s = $pdo->prepare("
            SELECT m.*, u.name, u.email FROM group_cart_members m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.group_cart_id=?
            ORDER BY FIELD(m.role,'host','member'), m.joined_at ASC
        ");
        $s->execute([$gid]);
        $g['members'] = $s->fetchAll();
        $s = $pdo->prepare("
            SELECT i.*, u.name AS user_name FROM group_cart_items i
            INNER JOIN users u ON i.user_id = u.id
            WHERE i.group_cart_id=? ORDER BY i.added_at ASC
        ");
        $s->execute([$gid]);
        $g['items'] = $s->fetchAll();
        out($g); 

    case 'request-refund':
        try {
            $uid = (int)($_SESSION['user_id'] ?? 0);
            if (!$uid) out(['error' => 'Not logged in'], 401);
            
            $oid = (int)($in['order_id'] ?? 0);
            $reason = trim($in['reason'] ?? '');
            $proof = (string)($in['proof'] ?? '');

            if (!$oid || !$reason) out(['error' => 'Kulang ang detalye ng refund.'], 400);
            if (strlen($proof) < 50) out(['error' => 'Kailangang mag-upload ng litrato bilang patunay.'], 400);

            $s = $pdo->prepare('SELECT status, refund_status, delivered_at, created_at FROM orders WHERE id=? AND user_id=?');
            $s->execute([$oid, $uid]);
            $order = $s->fetch();

            if (!$order) out(['error' => 'Order not found.'], 404);
            if ($order['status'] !== 'Delivered') out(['error' => 'Pwede lang mag-refund kapag Delivered na ang order.'], 400);
            if ($order['refund_status'] !== 'none' && $order['refund_status'] !== null) out(['error' => 'May existing refund request na ang order na ito.'], 400);

            $s = $pdo->prepare("
                SELECT COUNT(*) FROM order_items oi 
                INNER JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ? AND p.category = 'paso'
            ");
            $s->execute([$oid]);
            $hasPaso = (int)$s->fetchColumn() > 0;

            $deliveryTime = $order['delivered_at'] ? strtotime($order['delivered_at']) : strtotime($order['created_at']);
            if ($deliveryTime === false) $deliveryTime = time(); // Fallback
            $hoursElapsed = (time() - $deliveryTime) / 3600;

            if ($hasPaso && $hoursElapsed > 24) {
                out(['error' => 'Lumipas na ang 24-oras na refund window para sa BANGA (pagkain) items.'], 400);
            } elseif (!$hasPaso && $hoursElapsed > (24 * 7)) {
                out(['error' => 'Lumipas na ang 7-araw na refund window para sa mga item na ito.'], 400);
            }

            // Save the refund request (Using single quotes for SQL ENUM)
            $pdo->prepare("UPDATE orders SET refund_status='requested', refund_reason=?, refund_proof=? WHERE id=?")
                ->execute([$reason, $proof, $oid]);
            
            notifyAdmins($pdo, $oid, "Refund Request: May nag-request ng refund sa Order #$oid.");
            notify($pdo, $uid, $oid, "Natanggap na namin ang refund request mo para sa Order #$oid. Hintayin ang approval ng admin.");

            out(['ok' => true]);
        } catch (Exception $e) {
            out(['error' => 'Database Error: ' . $e->getMessage()], 500);
        }

    case 'admin-handle-refund':
        $oid = (int)($in['order_id'] ?? 0);
        $action = $in['action'] ?? '';
        
        if (!in_array($action, ['approve', 'reject'], true)) {
            out(['error' => 'Invalid action'], 400);
        }

        $newStatus = $action === 'approve' ? 'approved' : 'rejected';
        
        $pdo->prepare('UPDATE orders SET refund_status=? WHERE id=?')->execute([$newStatus, $oid]);

        // Optional: Notify the user about the refund update
        $s = $pdo->prepare('SELECT user_id FROM orders WHERE id=?');
        $s->execute([$oid]);
        if ($uid = $s->fetchColumn()) {
            $msg = $action === 'approve' 
                ? "Magandang balita! Na-approve na ang refund request mo para sa Order #$oid." 
                : "Paumanhin, pero na-reject ang refund request mo para sa Order #$oid. Kontakin kami kung may tanong ka.";
            notify($pdo, (int)$uid, (int)$oid, $msg);
        }
        
        out(['ok' => true]);

    case 'admin-update-fee':
        $stmt = $pdo->prepare('UPDATE delivery_fees SET fee=? WHERE id=?');
        $stmt->execute([$in['fee'], $in['id']]);
        out(['ok' => true]);

    case 'admin-add-fee':
        try {
            $stmt = $pdo->prepare('INSERT INTO delivery_fees (city, barangay, fee) VALUES (?,?,?)');
            $stmt->execute([$in['city'], $in['barangay'], $in['fee']]);
            out(['ok' => true]);
        } catch(Exception $e) {
            out(['error' => 'Location already exists or DB error.'], 400);
        }

    case 'admin-delete-fee':
        $pdo->prepare('DELETE FROM delivery_fees WHERE id=?')->execute([$in['id']]);
        out(['ok' => true]);

}

out(['error' => 'Unknown action'], 400);
?>