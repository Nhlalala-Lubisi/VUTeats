<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// File to store users (in same directory as script)
$usersFile = __DIR__ . '/users.json';

// Helper: Load users from JSON file
function loadUsers($file) {
    if (!file_exists($file)) return [];
    $data = file_get_contents($file);
    return $data ? json_decode($data, true) : [];
}

// Helper: Save users to JSON file
function saveUsers($file, $users) {
    file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'OPTIONS') {
    exit();
}

// Simulate user ID auto-increment
function getNextUserId($users) {
    if (empty($users)) return 1;
    return max(array_keys($users)) + 1;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'signup') {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email']);
            exit();
        }

        $users = loadUsers($usersFile);

        // Check if email exists
        foreach ($users as $user) {
            if ($user['email'] === $email) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit();
            }
        }

        $userId = getNextUserId($users);
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $users[$userId] = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => $hashedPassword,
            'created_at' => date('c')
        ];

        saveUsers($usersFile, $users);

        // Auto-login after signup
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;

        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone
            ]
        ]);
    }
    elseif ($action === 'signin') {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            exit();
        }

        $users = loadUsers($usersFile);
        $user = null;

        foreach ($users as $u) {
            if ($u['email'] === $email) {
                $user = $u;
                break;
            }
        }

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];

            echo json_encode([
                'success' => true,
                'message' => 'Signed in successfully',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone' => $user['phone']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    }
    elseif ($action === 'signout') {
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Signed out successfully']);
    }
}
elseif ($method === 'GET' && $action === 'check') {
    if (isset($_SESSION['user_id'])) {
        $users = loadUsers($usersFile);
        $user = $users[$_SESSION['user_id']] ?? null;

        if ($user) {
            echo json_encode([
                'success' => true,
                'loggedIn' => true,
                'user' => $user
            ]);
        } else {
            session_destroy();
            echo json_encode(['success' => true, 'loggedIn' => false]);
        }
    } else {
        echo json_encode(['success' => true, 'loggedIn' => false]);
    }
}
?>