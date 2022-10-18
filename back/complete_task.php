<?php
require_once('./lib/init.php');
require_once('./lib/db.php');

$data = file_get_contents('php://input');
$data = json_decode($data);

$main_appointment_id = $data->mainTaskAppointmentId;
$additional_tasks = $data->additionalTasks;

$result = $mysqli->query("UPDATE appointments 
SET status_id = 2, end_date = NOW()
WHERE id = $main_appointment_id");

$additional_completed_appointments_id = [];
$additional_rejected_appointments_id = [];

foreach ($additional_tasks as $additional_task) {
    if ($additional_task->completed) {
        $additional_completed_appointments_id[] = $additional_task->appointmentId;
    } else {
        $additional_rejected_appointments_id[] = $additional_task->appointmentId;
    }
}

$additional_completed_appointments_id_str = implode(",", $additional_completed_appointments_id);
$additional_rejected_appointments_id_str = implode(",", $additional_rejected_appointments_id);

if (!empty($additional_completed_appointments_id_str)) {
    $result = $mysqli->query("UPDATE appointments 
    SET status_id = 8, end_date = NOW()
    WHERE id IN ($additional_completed_appointments_id_str)");
}

if (!empty($additional_rejected_appointments_id_str)) {
    $result = $mysqli->query("UPDATE appointments 
    SET status_id = 9, end_date = NOW()
    WHERE id IN ($additional_rejected_appointments_id_str)");
}

$output = [];

$output['success'] = $result;

echo json_encode($output);
