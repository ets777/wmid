<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$result = $mysqli->query("SELECT 
        t.text, 
        g.type_id, 
        DATE(gh.date),
        gh.new_value
    FROM growth_history gh 
    LEFT JOIN tasks t on t.id = gh.task_id
    LEFT JOIN growth g on g.id = gh.growth_id
    ORDER BY gh.date DESC
    LIMIT 5");
$growth_history = [];

while ($row = $result->fetch_row()) {
    $growth_history[] = [
        'task' => $row[0],
        'type' => $row[1],
        'date' => $row[2],
        'value' => $row[3]
    ];
}

echo json_encode($growth_history);