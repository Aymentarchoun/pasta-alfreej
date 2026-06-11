<?php
require_once __DIR__ . '/db.php';
initTable();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $branch = $_GET['branch'] ?? null;
    $date   = $_GET['date']   ?? null;

    $sql = 'SELECT * FROM orders WHERE 1=1';
    $params = [];

    if ($branch) {
        $sql .= ' AND branch = ?';
        $params[] = $branch;
    }
    if ($date) {
        $sql .= ' AND DATE(created_at) = ?';
        $params[] = $date;
    }

    $sql .= ' ORDER BY created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['items'] = json_decode($row['items'], true);
        $row['total'] = (float)$row['total'];
    }

    echo json_encode($rows);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO orders (id, branch, items, total, status, timestamp, customer_name, table_number, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status=VALUES(status)');

    $stmt->execute([
        $data['id'],
        $data['branch']        ?? null,
        json_encode($data['items'] ?? []),
        $data['total']         ?? 0,
        $data['status']        ?? 'pending',
        $data['timestamp']     ?? date('c'),
        $data['customerName']  ?? null,
        $data['tableNumber']   ?? null,
        $data['notes']         ?? null,
    ]);

    echo json_encode(['success' => true]);

} elseif ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([$data['status'], $data['id']]);
    echo json_encode(['success' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
