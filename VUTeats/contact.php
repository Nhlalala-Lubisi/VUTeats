<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

// Validate input
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Email configuration
$to = 'info@vuteats.co.za'; // 👈 Replace with your actual email
$emailSubject = "VUTeats Contact Form: $subject";
$emailBody = "New contact form submission:\n\n"
           . "Name: $name\n"
           . "Email: $email\n"
           . "Subject: $subject\n\n"
           . "Message:\n$message";

$headers = [
    "From: noreply@vuteats.co.za", // Use a real domain if possible
    "Reply-To: $email",
    "Content-Type: text/plain; charset=UTF-8"
];

// Try to send email
if (mail($to, $emailSubject, $emailBody, implode("\r\n", $headers))) {
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully. We will get back to you soon!'
    ]);
} else {
    // Note: mail() may return true even if not delivered—depends on server config
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, we could not deliver your message. Please try again later.'
    ]);
}
?>