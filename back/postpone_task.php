<?php
require_once('./lib/init.php');
require_once('./lib/db.php');

$data = file_get_contents('php://input');
$data = json_decode($data);

$main_appointment_id = $data->mainTaskAppointmentId;
$additional_tasks = $data->additionalTasks;

$result = $mysqli->query("UPDATE appointments 
SET status_id = 3, start_date = DATE(start_date) + INTERVAL 1 DAY
WHERE status_id = 1
AND id = $main_appointment_id");

$additional_appointments_id = [];

foreach ($additional_tasks as $additional_task) {
    $additional_appointments_id[] = $additional_task->appointmentId;
}

$additional_appointments_id_str = implode(",", $additional_appointments_id);

if (!empty($additional_appointments_id_str)) {
    $result = $mysqli->query("UPDATE appointments 
    SET status_id = 9, end_date = NOW()
    WHERE id IN ($additional_appointments_id_str)");
}

$output = [];

$output['success'] = $result;

echo json_encode($output);