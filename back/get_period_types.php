<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, name FROM period_types');
$period_types = [];

while ($row = $result->fetch_row()) {
    $period_types[] = [
        'id' => $row[0],
        'name' => $row[1]
    ];
}

echo json_encode($period_types);