<?php
require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, name FROM meal_types ORDER BY id ASC');
$meal_types = [];

while ($row = $result->fetch_row()) {
    $meal_types[] = [
        'id' => $row[0],
        'name' => $row[1]
    ];
}

echo json_encode($meal_types);