<?php

require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query("SELECT mt.*, breakfast + snack1 + lanch + snack2 + dinner total FROM (SELECT 
m.date,
IFNULL(ROUND((SELECT SUM(meal_weight / 100 * p.calories) FROM meals JOIN products p ON p.id = product_id WHERE date = m.date AND meal_type_id = 1)), 0) breakfast,
IFNULL(ROUND((SELECT SUM(meal_weight / 100 * p.calories) FROM meals JOIN products p ON p.id = product_id WHERE date = m.date AND meal_type_id = 2)), 0) snack1,
IFNULL(ROUND((SELECT SUM(meal_weight / 100 * p.calories) FROM meals JOIN products p ON p.id = product_id WHERE date = m.date AND meal_type_id = 3)), 0) lanch,
IFNULL(ROUND((SELECT SUM(meal_weight / 100 * p.calories) FROM meals JOIN products p ON p.id = product_id WHERE date = m.date AND meal_type_id = 4)), 0) snack2,
IFNULL(ROUND((SELECT SUM(meal_weight / 100 * p.calories) FROM meals JOIN products p ON p.id = product_id WHERE date = m.date AND meal_type_id = 5)), 0) dinner
FROM meals m 
GROUP BY m.date) mt
ORDER BY mt.date DESC 
LIMIT 5");

$meals = [];

while ($row = $result->fetch_row()) {
    $meals[] = [
        'date' => $row[0],
        'breakfast' => $row[1],
        'snack1' => $row[2],
        'lanch' => $row[3],
        'snack2' => $row[4],
        'dinner' => $row[5],
        'total' => $row[6]
    ];
}

echo json_encode($meals);