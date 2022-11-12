<?php
require_once('./lib/init.php');
require_once('./lib/db.php');

$result = $mysqli->query("SELECT 
SUM(completed) completed,
SUM(goal / step - (current_value / step - completed)) total
FROM (
    SELECT 
        g.type_id,
        CASE 
            WHEN g.type_id = 1 THEN
                (SELECT COUNT(*) FROM growth_history WHERE type_id = 1 and task_id = t.id)
            WHEN g.type_id = 2 THEN
                ExtractNumber(t.text)
            WHEN g.type_id = 4 THEN
                (SELECT COUNT(*) FROM periods WHERE task_id = t.id)
        END current_value,
        (SELECT COUNT(*) FROM growth_history gh WHERE growth_id = g.id) completed,
        CASE 
            WHEN g.type_id = 1 THEN
                (SELECT CAST(TIME_TO_SEC(TIMEDIFF(start_time, g.goal)) / 60 AS UNSIGNED) FROM periods WHERE task_id = t.id LIMIT 1)
            ELSE
                g.goal
        END goal,
        g.step
    FROM tasks t
    JOIN growth g ON t.id = g.task_id 
    UNION ALL
    SELECT
        3 type_id,
        t.active current_value,
        (SELECT COUNT(*) FROM growth_history gh WHERE task_id = t.id AND growth_id IS NULL) completed,
        1 goal,
        1 step
    FROM tasks t
    UNION ALL
    SELECT
        NULL,
        c.calorie_deficit current_value,
        c.calorie_deficit / 0.1 completed,
        30 goal,
        0.1 step
    FROM (SELECT
        (SELECT value FROM params WHERE code = 'calorie_deficit') calorie_deficit,
        (SELECT value FROM params WHERE code = 'calorie_deficit_max') calorie_deficit_max
    ) c
) p");

$row = $result->fetch_row();

$growth_progress = [
    'completed' => $row[0],
    'total' => $row[1]
];

echo json_encode($growth_progress);