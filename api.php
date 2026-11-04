<?php
session_start();
require __DIR__ . '/db.php';
header('Content-Type: application/json');
 
$action = $_GET['action'] ?? '';
$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
 
function out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
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
        
        $products = $pdo->query("SELECT * FROM products WHERE is_archived=0 ORDER BY category, id")->fetchAll();
        
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
        
        $orders = [];
        $notifs = [];
        if ($user) {
            if ($user['role'] === 'admin') {
                $orders = $pdo->query('SELECT * FROM orders ORDER BY id DESC LIMIT 50')->fetchAll();
            } else {
                $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC');
                $stmt->execute([$user['id']]);
                $orders = $stmt->fetchAll();
            }
            foreach ($orders as &$o) {
                $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
                $stmt->execute([$o['id']]);
                $o['items'] = $stmt->fetchAll();
            }
            unset($o);
            
            try {
                $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id=? AND is_read=0');
                $stmt->execute([$user['id']]);
                $notifs = $stmt->fetchAll();
            } catch (Exception $e) {
                $notifs = []; 
            }
        }
        out(['user' => $user, 'products' => $products, 'orders' => $orders, 'fee' => $fee, 'notifications' => $notifs]);
 
    case 'signup':
        $name  = trim($in['name'] ?? '');
        $email = trim(strtolower($in['email'] ?? ''));
        $pw    = (string)($in['password'] ?? '');

        if ($name === '') out(['error' => 'Ilagay ang buong pangalan mo.'], 400);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(['error' => 'Mali ang email format.'], 400);
        if (strlen($pw) < 6) out(['error' => 'Password: hindi bababa sa 6 characters.'], 400);

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email=?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) out(['error' => 'Ginagamit na ang email na ito. Mag-sign in na lang.'], 409);

        $hash = password_hash($pw, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, address, password_hash, role) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$name, $email, '', '', $hash, 'customer']);
        $uid = (int)$pdo->lastInsertId();

        session_regenerate_id(true);
        $_SESSION = ['user_id' => $uid, 'role' => 'customer', 'name' => $name];
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

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email=? AND id!=?');
        $stmt->execute([$email, $_SESSION['user_id']]);
        if ($stmt->fetch()) out(['error' => 'Ginagamit na ang email na ito ng ibang account.'], 409);

        $stmt = $pdo->prepare('UPDATE users SET name=?, email=?, phone=?, address=? WHERE id=?');
        $stmt->execute([$name, $email, $phone, $address, $_SESSION['user_id']]);
        
        $_SESSION['name'] = $name;
        out(['ok' => true]);

    case 'change-password':
        if (empty($_SESSION['user_id'])) out(['error' => 'Not logged in'], 401);
        
        $current = (string)($in['current'] ?? '');
        $new = (string)($in['new'] ?? '');

        if (strlen($new) < 6) out(['error' => 'New Password: hindi bababa sa 6 characters.'], 400);

        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id=?');
        $stmt->execute([$_SESSION['user_id']]);
        $u = $stmt->fetch();

        if (!$u || !password_verify($current, $u['password_hash'])) {
            out(['error' => 'Mali ang kasalukuyang password.'], 401);
        }

        $hash = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?');
        $stmt->execute([$hash, $_SESSION['user_id']]);
        out(['ok' => true]);
 
    case 'place-order':
        try {
            $items = $in['items'] ?? [];
            if (!$items) out(['error' => 'Walang laman ang cart.'], 400);
            $ids = array_column($items, 'id');
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($ph)");
            $stmt->execute($ids);
            $prods = array_column($stmt->fetchAll(), null, 'id');
 
            $subtotal = 0; $lines = [];
            foreach ($items as $it) {
                $p = $prods[$it['id']] ?? null;
                if (!$p || $p['sold_out'] || $p['stock'] < $it['qty']) out(['error' => "Kulang ang stock."], 400);
                $subtotal += $p['price'] * $it['qty'];
                $lines[] = ['id' => $p['id'], 'name' => $p['name'], 'price' => $p['price'], 'qty' => $it['qty']];
            }
            $fee = (int)$pdo->query("SELECT `value` FROM settings WHERE `key`='delivery_fee'")->fetchColumn();
 
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, phone, address, payment, payment_proof, subtotal, delivery_fee, total) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->execute([$_SESSION['user_id'] ?? null, $in['name'], $in['phone'] ?? '', $in['address'], ($in['payment'] ?? 'cod') === 'gcash' ? 'gcash' : 'cod', $in['proof'] ?? '', $subtotal, $fee, $subtotal + $fee]);
            $oid = $pdo->lastInsertId();
 
            $oiStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)');
            $upStmt = $pdo->prepare('UPDATE products SET stock = stock - ?, sold_out = (stock <= 0) WHERE id = ?');
            foreach ($lines as $l) {
                $oiStmt->execute([$oid, $l['id'], $l['name'], $l['price'], $l['qty']]);
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
 
    case 'admin-update-order':
        $stmt = $pdo->prepare('UPDATE orders SET status=? WHERE id=?');
        $stmt->execute([$in['status'], $in['order_id']]);
        $stmt = $pdo->prepare('SELECT user_id FROM orders WHERE id=?');
        $stmt->execute([$in['order_id']]);
        if($uid = $stmt->fetchColumn()){
            try {
                $pdo->prepare('INSERT INTO notifications (user_id, order_id, message) VALUES (?,?,?)')->execute([$uid, $in['order_id'], "Update sa order #{$in['order_id']}: ngayon ay {$in['status']}."]);
            } catch (Exception $e) {}
        }
        out(['ok' => true]);
 
    case 'admin-delete-order':
        $pdo->prepare('DELETE FROM order_items WHERE order_id=?')->execute([$in['order_id']]);
        $pdo->prepare('DELETE FROM orders WHERE id=?')->execute([$in['order_id']]);
        out(['ok' => true]);
 
    case 'admin-update-product':
        $stmt = $pdo->prepare('UPDATE products SET stock=?, price=?, sold_out=? WHERE id=?');
        $stmt->execute([$in['stock'], $in['price'], $in['stock'] == 0 ? 1 : 0, $in['id']]);
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

        $stmt = $pdo->prepare('UPDATE products SET name=?, tagline=?, description=?, price=?, category=?, image=?, stock=?, sold_out=?, best_seller=?, tags=? WHERE id=?');
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
            $pid
        ]);
        out(['ok' => true]);
 
    case 'admin-delete-product':
        $pdo->prepare('UPDATE products SET is_archived=1 WHERE id=?')->execute([$in['id']]);
        out(['ok' => true]);
 
    case 'admin-add-product':
        $stmt = $pdo->prepare('INSERT INTO products (name,tagline,description,price,category,image,stock,best_seller,tags) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $in['name'], 
            $in['tagline'], 
            $in['description'], 
            $in['price'], 
            $in['category'], 
            $in['image'], 
            $in['stock'], 
            (int)($in['best_seller'] ?? 0),
            $in['tags']
        ]);
        out(['ok' => true]);
 
    case 'mark-read':
        if (!empty($_SESSION['user_id'])) {
            try {
                $pdo->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?')->execute([$_SESSION['user_id']]);
            } catch (Exception $e) {}
        }
        out(['ok' => true]);
}
 
out(['error' => 'Unknown action'], 400);
?>