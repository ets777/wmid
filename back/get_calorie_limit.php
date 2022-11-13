<?php

require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query("SELECT 
(SELECT value FROM params WHERE code = 'weight') weight,
(SELECT value FROM params WHERE code = 'height') height,
(SELECT value FROM params WHERE code = 'age') age,
(SELECT value FROM params WHERE code = 'calorie_deficit') calorie_deficit");

$row = $result->fetch_row();

$weight = (int)$row[0];
$height = (int)$row[1];
$age = (int)$row[2];
$calorie_deficit = (float)$row[3];

$calorie_deficit = 1 - $calorie_deficit / 100;
$calorie_limit = round($calorie_deficit * 1.2 * (10 * $weight + 6.25 * $height - 5 * $age + 5));

echo json_encode($calorie_limit);
