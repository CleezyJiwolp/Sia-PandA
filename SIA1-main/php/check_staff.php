<?php

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'staff') {
    header("Location: ../html/login.html");
    exit();
}

?>

