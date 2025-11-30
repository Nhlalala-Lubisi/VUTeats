<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Start session
session_start();

// Mock user login for testing (since no real session exists)
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 123; // Simulate a logged-in user
}

$userId = $_SESSION['user_id'];
$ordersFile = __DIR__ . '/orders.json';

// Helper: Load orders from file
function loadOrders($file) {
    if (!file_exists($file)) {
        return [];
    }
    $data = file_get_contents($file);
    return $data ? json_decode($data, true) : [];
}

// Helper: Save orders to file
function saveOrders($file, $orders) {
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $items = $data['items'] ?? [];
    $total = $data['total'] ?? 0;
    $deliveryMethod = $data['deliveryMethod'] ?? 'pickup';
    $paymentMethod = $data['paymentMethod'] ?? 'cash';
    $location = $data['location'] ?? '';
    $instructions = $data['instructions'] ?? '';
    $estimatedTime = $data['estimatedTime'] ?? '';

    if (empty($items) || $total <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid order data']);
        exit();
    }

    $orderId = 'ORD-' . time() . '-' . $userId;

    $newOrder = [
        'order_id' => $orderId,
        'user_id' => $userId,
        'items' => $items,
        'total' => $total,
        'delivery_method' => $deliveryMethod,
        'payment_method' => $paymentMethod,
        'location' => $location,
        'instructions' => $instructions,
        'status' => 'preparing',
        'estimated_time' => $estimatedTime,
        'created_at' => date('c')
    ];

    $orders = loadOrders($ordersFile);
    $orders[] = $newOrder;
    saveOrders($ordersFile, $orders);

    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully',
        'order' => $newOrder
    ]);
}
elseif ($method === 'GET') {
    $orders = loadOrders($ordersFile);
    $userOrders = array_filter($orders, fn($order) => $order['user_id'] == $userId);

    if ($action === 'list') {
        echo json_encode(['success' => true, 'orders' => array_values($userOrders)]);
    }
    elseif ($action === 'get' && isset($_GET['id'])) {
        $orderId = $_GET['id'];
        $order = null;
        foreach ($userOrders as $o) {
            if ($o['order_id'] === $orderId) {
                $order = $o;
                break;
            }
        }
        if ($order) {
            echo json_encode(['success' => true, 'order' => $order]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
        }
    }
}
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $orderId = $data['orderId'] ?? '';
    $status = $data['status'] ?? '';

    $validStatuses = ['preparing', 'ready', 'on-the-way', 'delivered'];
    if (!in_array($status, $validStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        exit();
    }

    $orders = loadOrders($ordersFile);
    $found = false;
    foreach ($orders as &$order) {
        if ($order['order_id'] === $orderId && $order['user_id'] == $userId) {
            $order['status'] = $status;
            $order['updated_at'] = date('c');
            $found = true;
            break;
        }
    }

    if ($found) {
        saveOrders($ordersFile, $orders);
        echo json_encode(['success' => true, 'message' => 'Order status updated', 'status' => $status]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Order not found or not owned']);
    }
}
?>
