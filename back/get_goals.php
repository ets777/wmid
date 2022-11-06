<?php

require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query("SELECT 
    g.text,
    CASE type_id 
    WHEN 1 THEN 
        greatest(current_value - start_value, 0)
    WHEN 2 THEN 
        greatest(TIMESTAMPDIFF(HOUR, start_value, (least(NOW(), end_value))), 0)
    END completed,
    CASE type_id 
    WHEN 1 THEN 
        end_value - start_value
    WHEN 2 THEN 
        TIMESTAMPDIFF(HOUR, start_value, end_value)
    END goal
    FROM goals g 
    WHERE hidden = 0 
    AND cancelled = 0");

$goals = [];

while ($row = $result->fetch_row()) {
    $goals[] = [
        'text' => $row[0],
        'completed' => $row[1],
        'total' => $row[2]
    ];
}

echo json_encode($goals);