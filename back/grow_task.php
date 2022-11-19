<?php
require_once('/home/e/ets777/etsbox.ru/public_html/wmid/back/lib/init.php');
require_once('/home/e/ets777/etsbox.ru/public_html/wmid/back/lib/db.php');

$result = $mysqli->query("SELECT 
        t.id, 
        NULL growth_id, 
        3 type_id, 
        1 step,
        NULL start_time,
        NULL end_time,
        NULL num,
        t.active,
        NULL periods_count,
        NULL period_type_id
    FROM tasks t
        WHERE t.active = 0
        AND t.deleted = 0
    UNION
    SELECT 
        g.task_id, 
        g.id growth_id,
        g.type_id, 
        g.step,
        p.start_time,
        p.end_time,
        ExtractNumber(t.text) num,
        t.active,
        p.periods_count,
        p.type_id
    FROM growth g
    JOIN tasks t ON g.task_id = t.id
    JOIN (
        SELECT type_id, task_id, start_time, end_time, COUNT(*) periods_count
        FROM periods
        GROUP BY type_id, task_id, start_time, end_time
    ) p ON t.id = p.task_id
    WHERE t.active = 1 
        AND t.deleted = 0 
        AND (g.type_id = 1 AND DATE_FORMAT(p.start_time, '%H:%i') != g.goal
        OR g.type_id = 2 AND ExtractNumber(t.text) != g.goal
        OR g.type_id = 4 AND p.periods_count != g.goal)
    UNION
    SELECT 
        NULL, 
        NULL,
        NULL, 
        0.1 step,
        NULL,
        NULL,
        p.value num,
        NULL,
        NULL,
        NULL
    FROM params p
    WHERE p.code = 'calorie_deficit'
    AND p.value != (SELECT p2.value FROM params p2 WHERE p2.code = 'calorie_deficit_max')
    ORDER BY rand() LIMIT 1");

$row = $result->fetch_row();

$task_id = $row[0] ?? null;
$growth_id = $row[1] ?? null;
$growth_type_id = $row[2] ?? null;
$growth_step = $row[3] ?? null;
$start_time = $row[4] ?? null;
$end_time = $row[5] ?? null;
$numeric = $row[6] ?? null;
$active = $row[7] ?? null;
$periods_count = $row[8] ?? null;
$period_type_id = $row[9] ?? null;

if ($growth_type_id == 1) {
    $result = $mysqli->query("UPDATE periods
    SET 
        start_time = start_time - INTERVAL $growth_step MINUTE,
        end_time = end_time - INTERVAL $growth_step MINUTE
    WHERE task_id = $task_id");

    $result = $mysqli->query("INSERT INTO growth_history
    (task_id, growth_id, new_value)
    VALUES
    ($task_id, $growth_id, STR_TO_DATE('$start_time', '%H:%i:%s') - INTERVAL $growth_step MINUTE)");
}

if ($growth_type_id == 2) {
    $result = $mysqli->query('UPDATE tasks
    SET text = REPLACE(text, ExtractNumber(text), CAST((ExtractNumber(text) + ' . $growth_step . ') AS UNSIGNED))
    WHERE id = ' . $task_id);

    $result = $mysqli->query('INSERT INTO growth_history
    (task_id, growth_id, new_value)
    VALUES
    (' . $task_id . ', ' . $growth_id . ', ' . ($numeric + $growth_step) . ')');
}

if ($growth_type_id == 3) {
    $result = $mysqli->query('UPDATE tasks
    SET active = 1
    WHERE id = ' . $task_id);

    $result = $mysqli->query('INSERT INTO growth_history
    (task_id, new_value)
    VALUES
    (' . $task_id . ', 1)');
}

if ($growth_type_id == 4) {
    if ((int)$growth_step > 0) {

        $start_time = is_null($start_time) ? 'NULL' : $start_time;
        $end_time = is_null($end_time) ? 'NULL' : $end_time;

        $result = $mysqli->query("INSERT INTO periods
        (type_id, task_id, start_time, end_time)
        VALUES
        (
            $period_type_id, 
            $task_id, 
            '$start_time', 
            '$end_time'
        )");
    } else {
        $result = $mysqli->query("DELETE FROM periods
        WHERE type_id = $period_type_id AND task_id = $task_id
        LIMIT 1");
    }

    $periods_count = $periods_count + (int)$growth_step;

    $result = $mysqli->query("INSERT INTO growth_history
    (task_id, growth_id, new_value)
    VALUES
    ($task_id, $growth_id, $periods_count)");
}

if (is_null($growth_type_id)) {
    $new_calorie_deficit = $numeric + $growth_step;

    $mysqli->query("UPDATE params
        SET value = $new_calorie_deficit
    WHERE code = 'calorie_deficit'");

    $mysqli->query("INSERT INTO growth_history
    (task_id, growth_id, new_value)
    VALUES
    (NULL, NULL, $new_calorie_deficit)");
}

$output = [];
$output['success'] = $result;

echo json_encode($output);
