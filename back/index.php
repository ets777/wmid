<?php
header('Access-Control-Allow-Origin: *');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
require_once('./lib/db.php');

$result = $mysqli->query('SELECT text FROM tasks');
$tasks = [];

while ($row = $result->fetch_row()) {
    $tasks[] = [
        'text' => $row[0]
    ];
}

echo json_encode($tasks[0]);