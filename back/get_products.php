<?php
require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query('SELECT id, name, calories FROM products');
$products = [];

while ($row = $result->fetch_row()) {
    $products[] = [
        'id' => $row[0],
        'name' => $row[1],
        'calories' => $row[2]
    ];
}

echo json_encode($products);