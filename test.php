<?php
require 'db.php';
$stmt = $pdo->query("SELECT * FROM users WHERE email='admin@pilikart.ph'");
$u = $stmt->fetch();
if ($u) {
    echo "✅ User found: " . $u['name'] . "<br>";
    if (password_verify('password', $u['password_hash'])) {
        echo "✅ Password 'password' is CORRECT! You can log in.";
    } else {
        echo "❌ Password is INCORRECT. The hash in DB is: " . $u['password_hash'];
    }
} else {
    echo "❌ User not found in database. You need to run the SQL INSERT.";
}
?>