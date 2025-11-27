<?php

session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../html/login.html");
    exit();
}

// Return user info as JSON
header('Content-Type: application/json');
echo json_encode([
    'user_id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'role' => $_SESSION['role'],
    'fullname' => $_SESSION['fullname'] ?? ''
]);

?>

