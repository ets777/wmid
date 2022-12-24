<?php
require_once('./lib/init.php');
require_once('./lib/appoint_helper.php');
require_once('./lib/db.php');
require_once('./enum/Mode.php');

$appointment_result = appoint_task($mysqli, Mode::Prod);

$appointment_response;
$appointment_response['success'] = $appointment_result->appointed_task_id > 0;

echo json_encode($appointment_response);