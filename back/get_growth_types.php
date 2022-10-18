<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, name FROM growth_types');
$growth_types = [];

while ($row = $result->fetch_row()) {
    $growth_types[] = [
        'id' => $row[0],
        'name' => $row[1]
    ];
}

echo json_encode($growth_types);