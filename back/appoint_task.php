<?php
require_once('./lib/init.php');
require_once('./lib/appoint_helper.php');
require_once('./lib/db.php');

$debug = false;
$debug_last_appointment_id = 505;
$logs = '';

$data = file_get_contents('php://input');

if ($debug) {
    $last_appointment_id = $debug_last_appointment_id;
} else {
    $last_appointment_id = json_decode($data);
}

$result = $mysqli->query("SELECT t.next_task_id, t.next_task_break
FROM appointments a 
JOIN tasks t 
ON t.id = a.task_id 
WHERE a.id = $last_appointment_id");

$row = $result->fetch_row();

$next_task_id = $row[0] ?? '';
$next_task_break = $row[1] ?? 0;

if ($last_appointment_id) {
    // Проверка всей цепочки, если есть id следующего задания
    if (appoint_next_task($mysqli, $next_task_id, $debug, $logs)) save_logs($mysqli, $debug, $logs);
}

// Ищем ближайшее задание на время и тут же проверяем можно ли его назначить
$nearest_task_start_time = appoint_time_task($mysqli, $debug, $logs);

if ($nearest_task_start_time === false) save_logs($mysqli, $debug, $logs);

// Поиск заданий с конкретной датой
if (appoint_dated_task($mysqli, $nearest_task_start_time, $debug, $logs)) save_logs($mysqli, $debug, $logs);

// Ищем отложенные задания, на выполнение которых не будет затрачено больше, чем осталось до задания на время
if (appoint_postponed_task($mysqli, $nearest_task_start_time, $debug, $logs)) save_logs($mysqli, $debug, $logs);

// Выбираем из пула доступных заданий
if (appoint_random_task($mysqli, $nearest_task_start_time, $debug, $logs)) save_logs($mysqli, $debug, $logs);
