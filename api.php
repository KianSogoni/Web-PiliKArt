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
            $stmt = $pdo->prepare('SELECT id, name, email, role, phone, address FROM users WHERE id=? AND is_archived=0');
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            if (!$user) session_destroy();
        }

        $products = $pdo->query("SELECT * FROM products WHERE is_archived=0 ORDER BY category, id")->fetchAll();
        $fee = (int)$pdo->query("SELECT `value` FROM settings WHERE `key`='delivery_fee'")->fetchColumn();

        $orders = [];
        if ($user && $user['role'] === 'admin') {
            $orders = $pdo->query('SELECT * FROM orders ORDER BY id DESC LIMIT 50')->fetchAll();
            foreach ($orders as &$o) {
                $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
                $stmt->execute([$o['id']]);
                $o['items'] = $stmt->fetchAll();
            }
        } elseif ($user) {
            $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC');
            $stmt->execute([$user['id']]);
            $orders = $stmt->fetchAll();
            foreach ($orders as &$o) {
                $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
                $stmt->execute([$o['id']]);
                $o['items'] = $stmt->fetchAll();
            }
        }

        out(['user' => $user, 'products' => $products, 'orders' => $orders, 'fee' => $fee]);

    case 'login':
        $email = trim(strtolower($in['email'] ?? ''));
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email=? AND is_archived=0');
        $stmt->execute([$email]);
        $u = $stmt->fetch();
        
        if (!$u || ($in['password'] ?? '') !== $u['password_hash']) {
            out(['error' => 'Mali ang email o password.'], 401);
        }
        
        session_regenerate_id(true);
        $_SESSION = ['user_id' => $u['id'], 'role' => $u['role'], 'name' => $u['name']];
        out(['ok' => true]);

    case 'logout':
        session_destroy();
        out(['ok' => true]);

    case 'place-order':
        try {
            $items = $in['items'] ?? [];
            if (!$items || empty($in['name']) || empty($in['address'])) {
                out(['error' => 'Kulang ang details.'], 400);
            }
            
            $ids = array_column($items, 'id');
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($ph)");
            $stmt->execute($ids);
            $prods = array_column($stmt->fetchAll(), null, 'id');

            $subtotal = 0; $lines = [];
            foreach ($items as $it) {
                $p = $prods[$it['id']] ?? null;
                $qty = max(1, (int)$it['qty']);
                if (!$p || $p['sold_out'] || $p['stock'] < $qty) {
                    out(['error' => "Kulang ang stock ng " . ($p['name'] ?? 'item')], 400);
                }
                $subtotal += $p['price'] * $qty;
                $lines[] = ['id' => $p['id'], 'name' => $p['name'], 'price' => $p['price'], 'qty' => $qty];
            }
            $fee = (int)$pdo->query("SELECT `value` FROM settings WHERE `key`='delivery_fee'")->fetchColumn();

            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare('INSERT INTO orders (user_id, customer_name, phone, address, payment, payment_proof, subtotal, delivery_fee, total) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->execute([$_SESSION['user_id'] ?? null, $in['name'], $in['phone'] ?? '', $in['address'], $in['payment'] ?? 'cod', '', $subtotal, $fee, $subtotal + $fee]);
            $oid = $pdo->lastInsertId();

            $oiStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)');
            $upStmt = $pdo->prepare('UPDATE products SET stock = stock - ?, sold_out = (stock - ? <= 0) WHERE id = ?');
            foreach ($lines as $l) {
                $oiStmt->execute([$oid, $l['id'], $l['name'], $l['price'], $l['qty']]);
                $upStmt->execute([$l['qty'], $l['qty'], $l['id']]);
            }
            
            $pdo->commit();
            out(['ok' => true, 'order_id' => $oid]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            out(['error' => 'Database Error: ' . $e->getMessage()], 500);
        }

    case 'delete-order':
        if (($_SESSION['role'] ?? '') !== 'admin') out(['error' => 'Admins only'], 403);
        try {
            $pdo->beginTransaction();
            $oid = (int)$in['order_id'];
            
            $stmt1 = $pdo->prepare('DELETE FROM order_items WHERE order_id = ?');
            $stmt1->execute([$oid]);
            
            $stmt2 = $pdo->prepare('DELETE FROM orders WHERE id = ?');
            $stmt2->execute([$oid]);
            
            if ($stmt2->rowCount() === 0) {
                $pdo->rollBack();
                out(['error' => 'Order not found.'], 404);
            }
            
            $pdo->commit();
            out(['ok' => true]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            out(['error' => 'Delete failed: ' . $e->getMessage()], 500);
        }

    case 'update-order':
        if (($_SESSION['role'] ?? '') !== 'admin') out(['error' => 'Admins only'], 403);
        $stmt = $pdo->prepare('UPDATE orders SET status=? WHERE id=?');
        $stmt->execute([$in['status'], (int)$in['order_id']]);
        out(['ok' => true]);
        
    case 'update-product':
        if (($_SESSION['role'] ?? '') !== 'admin') out(['error' => 'Admins only'], 403);
        $stock = max(0, (int)$in['stock']);
        $stmt = $pdo->prepare('UPDATE products SET stock=?, price=?, sold_out=? WHERE id=?');
        $stmt->execute([$stock, max(1, (int)$in['price']), $stock === 0 ? 1 : 0, (int)$in['product_id']]);
        out(['ok' => true]);

    case 'delete-product':
        if (($_SESSION['role'] ?? '') !== 'admin') out(['error' => 'Admins only'], 403);
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('DELETE FROM products WHERE id=?');
            $stmt->execute([(int)$in['product_id']]);

            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                out(['error' => 'Product not found.'], 404);
            }
            $pdo->commit();
            out(['ok' => true]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            out(['error' => 'Delete failed: ' . $e->getMessage()], 500);
        }
        
    case 'add-product':
        if (($_SESSION['role'] ?? '') !== 'admin') out(['error' => 'Admins only'], 403);
        $stmt = $pdo->prepare('INSERT INTO products (name,tagline,description,price,category,image,stock,sold_out,tags) VALUES (?,?,?,?,?,?,?,?,?)');
        $stock = max(0, (int)$in['stock']);
        $stmt->execute([
            trim($in['name']), $in['tagline'] ?? '', $in['description'] ?? '',
            max(1, (int)$in['price']), $in['category'],
            $in['image'] ?: 'https://placehold.co/400x400/eee/333?text=New+Item',
            $stock, $stock === 0 ? 1 : 0, $in['tags'] ?? ''
        ]);
        out(['ok' => true]);
}

out(['error' => 'Unknown action'], 400);