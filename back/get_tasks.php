<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, text FROM tasks');
$tasks = [];

while ($row = $result->fetch_row()) {
    $tasks[] = [
        'id' => $row[0],
        'text' => $row[1]
    ];
}

$output = [];
$output['data'] = $tasks;

echo json_encode($output);