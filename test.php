<?php
require 'db.php';
$stmt = $pdo->query("SELECT * FROM users WHERE email='admin@pilikart.ph'");
$u = $stmt->fetch();
if ($u) {
    echo "✅ User found: " . $u['name'] . "<br>";
    // The seed script stores the plain-text 'admin' as password_hash.
    // New accounts created via signup will have a real bcrypt hash.
    $ok = password_verify('admin', $u['password_hash']) || $u['password_hash'] === 'admin';
    if ($ok) {
        echo "✅ Password 'admin' is CORRECT!";
    } else {
        echo "❌ Password is INCORRECT. The hash in DB is: " . $u['password_hash'];
    }
} else {
    echo "❌ User not found in database. You need to run the SQL INSERT.";
}
?>