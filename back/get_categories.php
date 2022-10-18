<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, name FROM categories');
$categories = [];

while ($row = $result->fetch_row()) {
    $categories[] = [
        'id' => $row[0],
        'name' => $row[1]
    ];
}

echo json_encode($categories);