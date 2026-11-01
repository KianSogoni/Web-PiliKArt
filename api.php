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

switch ($action) {
    case 'load':
        $user = null;
        if (!empty($_SESSION['user_id'])) {
            $stmt = $pdo->prepare('SELECT id, name, email, role, phone, address FROM users WHERE id=?');
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
        }
        $products = $pdo->query("SELECT * FROM products WHERE is_archived=0 ORDER BY category, id")->fetchAll();
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
            $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id=? AND is_read=0');
            $stmt->execute([$user['id']]);
            $notifs = $stmt->fetchAll();
        }
        out(['user' => $user, 'products' => $products, 'orders' => $orders, 'fee' => $fee, 'notifications' => $notifs]);

    case 'login':
        $email = trim(strtolower($in['email'] ?? ''));
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email=?');
        $stmt->execute([$email]);
        $u = $stmt->fetch();
        if (!$u || ($in['password'] ?? '') !== $u['password_hash']) {
            out(['error' => 'Mali ang email o password.'], 401);
        }
        $_SESSION = ['user_id' => $u['id'], 'role' => $u['role'], 'name' => $u['name']];
        out(['ok' => true]);

    case 'signup':
        $stmt = $pdo->prepare('INSERT INTO users (name,email,password_hash,phone,address) VALUES (?,?,?,?,?)');
        try {
            $stmt->execute([$in['name'], $in['email'], $in['password'], $in['phone'] ?? '', $in['address']]);
            $_SESSION = ['user_id' => $pdo->lastInsertId(), 'role' => 'customer', 'name' => $in['name']];
            out(['ok' => true]);
        } catch(Exception $e) { out(['error' => 'Email already exists.'], 400); }

    case 'logout':
        session_destroy();
        out(['ok' => true]);

    case 'place-order':
        try {
            $items = $in['items'] ?? [];
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
            $fee = (int)$in['fee'];

            $pdo->beginTransaction();
            $stmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, phone, address, payment, payment_proof, subtotal, delivery_fee, total) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->execute([$_SESSION['user_id'] ?? null, $in['name'], $in['phone'], $in['address'], $in['payment'], $in['proof'], $subtotal, $fee, $subtotal + $fee]);
            $oid = $pdo->lastInsertId();

            $oiStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)');
            $upStmt = $pdo->prepare('UPDATE products SET stock = stock - ?, sold_out = (stock - ? <= 0) WHERE id = ?');
            foreach ($lines as $l) {
                $oiStmt->execute([$oid, $l['id'], $l['name'], $l['price'], $l['qty']]);
                $upStmt->execute([$l['qty'], $l['qty'], $l['id']]);
            }
            if($_SESSION['user_id']){
                $pdo->prepare('INSERT INTO notifications (user_id, order_id, message) VALUES (?,?,?)')->execute([$_SESSION['user_id'], $oid, "Order #$oid received! Preparing your food."]);
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
            $pdo->prepare('INSERT INTO notifications (user_id, order_id, message) VALUES (?,?,?)')->execute([$uid, $in['order_id'], "Your order #{$in['order_id']} is now {$in['status']}."]);
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

    case 'admin-delete-product':
        $pdo->prepare('UPDATE products SET is_archived=1 WHERE id=?')->execute([$in['id']]);
        out(['ok' => true]);

    case 'admin-add-product':
        $stmt = $pdo->prepare('INSERT INTO products (name,tagline,description,price,category,image,stock,tags) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$in['name'], $in['tagline'], $in['description'], $in['price'], $in['category'], $in['image'], $in['stock'], $in['tags']]);
        out(['ok' => true]);

    case 'mark-read':
        if (!empty($_SESSION['user_id'])) {
            $pdo->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?')->execute([$_SESSION['user_id']]);
        }
        out(['ok' => true]);
}
?>