<?php
header('Access-Control-Allow-Origin: *');

require_once('./lib/db.php');

$tasks = [];
$output = [];
$success = false;

$result = $mysqli->query('SELECT t.text, a.id, a.status_id FROM appointments a
    JOIN tasks t ON t.id = a.task_id
    WHERE a.status_id IN (1, 7)');

if ($result) {
    while ($row = $result->fetch_row()) {
        $tasks[] = [
            'text' => $row[0],
            'appointmentId' => $row[1],
            'statusId' => $row[2]
        ];
    }

    $success = true;
}

$output['success'] = $success;
$output['data'] = $tasks;

echo json_encode($output);