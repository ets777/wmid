<?php
require_once('./lib/init.php');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');

require_once('./lib/common.php');

$data = file_get_contents('php://input');
$data = json_decode($data);

require_once('./lib/db.php');

if (empty($data->text)) die();

if (check_var($data->nextTaskId)) {
    $next_task_id = (int)$data->nextTaskId;
}

if (check_var($data->prevTaskId)) {
    $prev_task_id = (int)$data->prevTaskId;
}

$result = $mysqli->query('INSERT INTO tasks 
(
    id, 
    text, 
    next_task_id,
    category_id, 
    offset, 
    duration, 
    active,
    next_task_break,
    cooldown
) VALUES (
    NULL, 
    "' . $data->text . '", 
    ' . (isset($next_task_id) ? $next_task_id : 'NULL') . ', 
    ' . (int)$data->categoryId . ', 
    ' . (int)$data->offset . ', 
    ' . (int)$data->duration . ', 
    ' . ((bool)$data->active ? '1' : '0') . ',
    ' . (int)$data->nextTaskBreak . ', 
    ' . (int)$data->cooldown . '
)');

$task_id = $mysqli->insert_id;

if (isset($prev_task_id)) {
    $result = $mysqli->query('UPDATE tasks 
    SET next_task_id = ' . $task_id . '
    WHERE id = ' . $prev_task_id);
}

if (isset($data->dailyData)) {
    for ($i = 0; $i < count($data->dailyData); $i++) {

        $start_time = get_time_string(
            $data->dailyData[$i]->hour,
            $data->dailyData[$i]->minute
        );

        $result = $mysqli->query('INSERT INTO periods 
            (
                id, 
                type_id, 
                task_id,
                start_time
            ) VALUES (
                NULL, 
                ' . (int)$data->periodId . ', 
                ' . $task_id . ', 
                ' . $start_time . '
            )');
    }
}

if (isset($data->weeklyData)) {
    $weekdays = [];

    $by_weekdays = $data->weeklyData->byWeekdays ?? null;

    if ($by_weekdays) {
        if (check_var($data->weeklyData->monday)) $weekdays[] = 1;
        if (check_var($data->weeklyData->thuesday)) $weekdays[] = 2;
        if (check_var($data->weeklyData->wednesday)) $weekdays[] = 3;
        if (check_var($data->weeklyData->thursday)) $weekdays[] = 4;
        if (check_var($data->weeklyData->friday)) $weekdays[] = 5;
        if (check_var($data->weeklyData->saturday)) $weekdays[] = 6;
        if (check_var($data->weeklyData->sunday)) $weekdays[] = 7;

        $time = get_time_string(
            $data->weeklyData->hour,
            $data->weeklyData->minute
        );

        for ($i = 0; $i < count($weekdays); $i++) {
            $result = $mysqli->query('INSERT INTO periods 
                (
                    type_id, 
                    task_id,
                    start_time,
                    weekday
                ) VALUES (
                    ' . (int)$data->periodId . ', 
                    ' . $task_id . ', 
                    ' . $time . ',
                    ' . $weekdays[$i] . '
                )');
        }
    } else {
        $periods = (int)$data->weeklyData->periods;

        for ($i = 0; $i < $periods; $i++) {
            $result = $mysqli->query('INSERT INTO periods 
            (
                type_id, 
                task_id
            ) VALUES (
                ' . (int)$data->periodId . ', 
                ' . $task_id . '
            )');
        }
    }

    
}

if (isset($data->monthlyData)) {
    for ($i = 0; $i < count($data->monthlyData); $i++) {

        $time = get_time_string(
            $data->monthlyData[$i]->hour,
            $data->monthlyData[$i]->minute
        );

        $day = $data->monthlyData[$i]->day ?? null;

        $result = $mysqli->query('INSERT INTO periods 
            (
                type_id, 
                task_id,
                start_time,
                day
            ) VALUES (
                ' . (int)$data->periodId . ', 
                ' . $task_id . ', 
                ' . $time . ', 
                ' . ($day ?? 'NULL') .  '
            )');
    }
}

if (isset($data->yearlyData)) {
    for ($i = 0; $i < count($data->yearlyData); $i++) {

        $time = get_time_string(
            $data->yearlyData[$i]->hour,
            $data->yearlyData[$i]->minute
        );

        $day = $data->yearlyData[$i]->day;
        $month = $data->yearlyData[$i]->month;

        $result = $mysqli->query('INSERT INTO periods 
            (
                id, 
                type_id, 
                task_id,
                start_time,
                day,
                month
            ) VALUES (
                NULL, 
                ' . (int)$data->periodId . ', 
                ' . (int)$task_id . ', 
                ' . $time . ', 
                ' . ($day ?? 'NULL') .  ',
                ' . ($month ?? 'NULL') .  '
            )');
    }
}

if (isset($data->onceData)) {
    $time = get_time_string(
        $data->onceData->hour,
        $data->onceData->minute
    );

    $date = $data->onceData->date;
    $period_type_id = (int)$data->periodId;


    $result = $mysqli->query("INSERT INTO periods 
        (
            type_id, 
            task_id,
            start_time,
            date
        ) VALUES (
            $period_type_id, 
            $task_id, 
            $time, 
            " . (!empty($date) ? "'$date'" : "NULL") . "
        )");
}

if (isset($data->growthData)) {
    for ($i = 0; $i < count($data->growthData); $i++) {

        $type_id = $data->growthData[$i]->typeId;
        $goal = $data->growthData[$i]->goal;
        $step = $data->growthData[$i]->step;

        $result = $mysqli->query('INSERT INTO growth 
            ( 
                type_id, 
                task_id,
                step,
                goal
            ) VALUES (
                ' . (int)$type_id . ', 
                ' . (int)$task_id . ', 
                ' . (int)$step . ', 
                "' . $goal .  '"
            )');
    }
}

echo json_encode($result);