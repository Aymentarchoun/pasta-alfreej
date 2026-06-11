<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u427121666_pasta_orders');
define('DB_USER', 'u427121666_pasta_user');
define('DB_PASS', 'PastaDb2017!');

function getDB() {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    return $pdo;
}

function initTable() {
    $pdo = getDB();
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        branch VARCHAR(20),
        total DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        timestamp VARCHAR(30),
        raw_order JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    // Add raw_order column if upgrading from old schema
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN raw_order JSON");
    } catch (Exception $e) { /* column already exists */ }
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
