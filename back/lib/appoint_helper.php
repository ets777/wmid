<?php

function insert_appointment($mysqli, $task_id, $status, $hour_interval = 0) {
    $start_date = "";

    if ($hour_interval > 0) {
        $start_date = "NOW() + INTERVAL $hour_interval HOUR";
    } else {
        $start_date = "NOW()";
    }

    $result = $mysqli->query("INSERT INTO appointments
        (start_date, status_id, task_id)
        VALUES
        ($start_date, $status, $task_id)");

    return $result;
}

function appoint_next_task($mysqli, $next_task_id, $debug, &$logs) {

    $logs .= "Проверяем, есть ли следующее задание\n";

    if (!empty($next_task_id)) {

        $logs .= "Есть следующее задание с id $next_task_id \n";

        $row = check_next_task($mysqli, $next_task_id, $logs);

        $next_task_id = $row[0];
        $next_task_break = $row[1] ?? 0;
    
        if (!empty($next_task_id)) {
    
            if ($next_task_break == 0) {
                // проверка, достаточно ли времени до ближайшего задания на время
                $result = $mysqli->query("SELECT 
                    TIMESTAMPDIFF(
                        MINUTE, 
                        current_time(), 
                        p.start_time + INTERVAL (
                            select offset from tasks where id = p.task_id
                        ) MINUTE
                    ) > t.duration 
                    OR t.duration IS NULL
                    OR t.next_task_id IS NULL
                FROM periods p
                JOIN tasks t ON t.id = $next_task_id
                WHERE p.start_time > current_time() 
                    AND (p.date IS NULL OR p.date = CURDATE()) 
                    AND (p.month IS NULL OR p.month = MONTH(CURDATE())) 
                    AND (p.day IS NULL OR p.day = DAY(CURDATE()))  
                    AND (p.weekday IS NULL OR p.weekday = WEEKDAY(CURDATE()) + 1) 
                ORDER BY p.start_time ASC 
                LIMIT 1");
    
                $row = $result->fetch_row();
    
                $is_enough_time = ($row[0] ?? null) == '1';

                if ($is_enough_time) {
                    $logs .= "Задание можно успеть выполнить до ближайшего задания на время\n";
                } else {
                    $logs .= "До ближайшего задания на время выполнить не получится\n";
                }
    
                $result = $mysqli->query("SELECT pc.periods_count > ac.appointments_count OR ac.appointments_count IS NULL
                FROM (
                    SELECT p.task_id, COUNT(*) periods_count
                    FROM periods p
                    WHERE p.task_id = $next_task_id
                    GROUP BY p.task_id
                ) pc LEFT JOIN (
                    SELECT a.task_id, COUNT(*) appointments_count
                    FROM appointments a
                    JOIN (
                        SELECT p.type_id, p.task_id
                        FROM periods p
                        WHERE p.task_id = $next_task_id
                        LIMIT 1
                    ) pt ON pt.task_id = a.task_id
                    WHERE (DATE(a.start_date) = CURDATE() AND pt.type_id = 1)
                        OR (WEEK(a.start_date) = WEEK(CURDATE()) AND pt.type_id = 2)
                        OR (MONTH(a.start_date) = MONTH(CURDATE()) AND pt.type_id = 3)
                        OR (YEAR(a.start_date) = YEAR(CURDATE()) AND pt.type_id = 4)
                        OR pt.type_id = 5
                    GROUP BY a.task_id
                ) ac ON pc.task_id = ac.task_id");
    
                $row = $result->fetch_row();
    
                $is_period_not_completed = ($row[0] ?? null) == '1';

                if ($is_period_not_completed) {
                    $logs .= "Задание ещё можно назначить в текущем периоде\n";
                } else {
                    $logs .= "Задание больше нельзя назначить в текущем периоде\n";
                }

                if (!$is_period_not_completed) {

                    $result = $mysqli->query("SELECT next_task_id
                        FROM tasks
                        WHERE id = $next_task_id");
        
                    $row = $result->fetch_row();

                    $next_task_id = $row[0];

                    return appoint_next_task($mysqli, $next_task_id, $debug, $logs);

                }
    
                if ($is_enough_time && $is_period_not_completed) {

                    $logs .= "Назначаю задание с id $next_task_id \n";
                        
                    if (!$debug) {

                        $result = insert_appointment($mysqli, $next_task_id, 1);
        
                        $output = [];
                        $output['success'] = $result;
                        echo json_encode($output);
                    }
    
                    return true;
                }
            } else {

                $logs .= "Назначаю задание с id $next_task_id с отсрочкой в $next_task_break ч.\n";

                if (!$debug) {
                    $result = insert_appointment($mysqli, $next_task_id, 5, (int)$next_task_break);
                }

                return false;
            }
        }
    }

    return false;
}

function appoint_time_task($mysqli, $debug, &$logs) {
    $result = $mysqli->query("SELECT 
        current_time() > p.start_time - INTERVAL t.offset MINUTE 
        AND current_time() < p.end_time + INTERVAL t.offset MINUTE
        AND p.start_time < p.end_time 
        OR (
            current_time() > p.start_time - INTERVAL t.offset MINUTE 
            AND current_time() < TIME('23:59:59') 
            AND current_time() > TIME('12:00:00')
            OR current_time() < p.end_time - INTERVAL t.offset MINUTE 
            AND current_time() > TIME('00:00:00') 
            AND current_time() < TIME('12:00:00')
        ) AND p.start_time > p.end_time can_be_appointed,
        t.id,
        p.start_time,
        p.end_time,
        EXISTS(SELECT * FROM tasks WHERE next_task_id = t.id),
        t.offset
    FROM periods p
    JOIN tasks t 
        ON t.id = p.task_id
    LEFT JOIN appointments a 
        ON a.task_id = t.id 
        AND (a.start_date > TIMESTAMP(CURDATE(), p.start_time) - INTERVAL t.offset MINUTE 
        AND a.start_date < TIMESTAMP(CURDATE(), p.end_time) + INTERVAL t.offset MINUTE
        AND p.start_time < p.end_time 
        OR (
            a.start_date > TIMESTAMP(CURDATE(), p.start_time) - INTERVAL t.offset MINUTE 
            AND a.start_date < TIMESTAMP(CURDATE(), '23:59:59')
            AND current_time() < TIME('23:59:59') 
            AND current_time() > TIME('12:00:00')
            OR a.start_date < TIMESTAMP(CURDATE(), p.end_time) + INTERVAL t.offset MINUTE
            AND a.start_date > TIMESTAMP(CURDATE(), '00:00:00')
            AND current_time() > TIME('00:00:00') 
            AND current_time() < TIME('12:00:00')
        ) AND p.start_time > p.end_time)
    WHERE (p.end_time > current_time() - INTERVAL t.offset MINUTE AND p.start_time < p.end_time 
        OR (
            p.start_time > current_time() - INTERVAL t.offset MINUTE 
            AND current_time() < TIME ('23:59:59') 
            AND current_time() > TIME ('12:00:00')
            OR p.end_time > current_time() - INTERVAL t.offset MINUTE 
            AND current_time() > TIME ('00:00:00') 
            AND current_time() < TIME ('12:00:00')
        ) AND p.start_time > p.end_time)
        AND (p.date IS NULL OR p.date = CURDATE()) 
        AND (p.month IS NULL OR p.month = MONTH(CURDATE())) 
        AND (p.day IS NULL OR p.day = DAY(CURDATE()))  
        AND (p.weekday IS NULL OR p.weekday = WEEKDAY(CURDATE()) + 1)
        AND a.id IS NULL 
    ORDER BY can_be_appointed DESC, p.start_time ASC 
    LIMIT 1");

    $row = $result->fetch_row();

    $logs .= "Ищу ближайшее задание на время\n";

    $nearest_task_can_be_appointed = ($row[0] ?? null) == '1';
    $nearest_task_id = $row[1] ?? null;
    $nearest_task_start_time = $row[2] ?? null;
    $nearest_task_end_time = $row[3] ?? null;
    $nearest_task_in_chain = ($row[4] ?? null) == '1';
    $nearest_task_offset = $row[5] ?? null;

    if ($nearest_task_id) {
        $logs .= "Это задание с id $nearest_task_id на $nearest_task_start_time";

        if ($nearest_task_can_be_appointed) {
            $logs .= ", и оно может быть назначено\n";
        } else {
            $logs .= ", и оно не может быть назначено\n";
        }
    }
    
    // если задание является частью цепочки, то ищем первое и назначаем его
    if ($nearest_task_in_chain) {

        $result = $mysqli->query("SELECT 
            current_time() > (TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE) - INTERVAL $nearest_task_offset MINUTE 
            AND current_time() < TIME('$nearest_task_end_time') + INTERVAL $nearest_task_offset MINUTE
            AND TIME('$nearest_task_start_time') < TIME('$nearest_task_end_time')
            OR (
                current_time() > (TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE) - INTERVAL 30 MINUTE 
                AND current_time() < TIME('23:59:59') 
                AND current_time() > TIME('12:00:00')
                OR current_time() < TIME('$nearest_task_end_time') + INTERVAL 30 MINUTE
                AND current_time() > TIME('00:00:00') 
                AND current_time() < TIME('12:00:00')
            ) AND TIME('$nearest_task_start_time') > TIME('$nearest_task_end_time') can_be_appointed,
            t3.id, 
            TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE
        FROM (
            SELECT t1.lvl, t2.id, t2.next_task_id, t2.duration, t2.offset, t2.deleted, t2.active
            FROM (
                SELECT
                    @r AS _id,
                    @l := @l + 1 AS lvl,
                    (SELECT @r := (SELECT id FROM tasks WHERE next_task_id = t.id) FROM tasks t WHERE id = _id) AS next_task_id
                FROM
                    (SELECT @r := $nearest_task_id, @l := 0) vars,
                    tasks h
                WHERE @r IS NOT NULL
                ) t1
            JOIN tasks t2
            ON t1._id = t2.id
            WHERE t2.id != $nearest_task_id and t2.active = 1 and t2.deleted = 0
            ORDER BY t1.lvl DESC
        ) t3");

        $row = $result->fetch_row();

        $nearest_task_can_be_appointed = ($row[0] ?? null) == '1';
        $nearest_task_id = $row[1] ?? null;
        $nearest_task_start_time = $row[2] ?? null;

        $logs .= "Так как задание находится в цепочке, то ищем первое задание этой цепочки\n";

        if ($nearest_task_id) {
            $logs .= "Это задание с id $nearest_task_id на $nearest_task_start_time";
    
            if ($nearest_task_can_be_appointed) {
                $logs .= ", и оно может быть назначено\n";
            } else {
                $logs .= ", и оно не может быть назначено\n";
            }
        }
    }

    if ($nearest_task_can_be_appointed && $nearest_task_id && $nearest_task_start_time) {

        appoint_additional_tasks($mysqli, $nearest_task_id, $debug, $logs);
        
        $logs .= "Назначаю задание на время\n";

        if (!$debug) {

            $result = $mysqli->query('INSERT INTO appointments
            (status_id, task_id)
            VALUES
            (1, ' . $nearest_task_id . ')');

            $output = [];
            $output['success'] = $result;
            echo json_encode($output);
        }

        return false;
    }

    return $nearest_task_start_time;
}

function appoint_postponed_task($mysqli, $nearest_task_start_time, $debug, &$logs) {
    $result = $mysqli->query("SELECT 
    TIMESTAMPDIFF(MINUTE, current_time(), TIME('$nearest_task_start_time')) > t.duration 
    OR t.duration IS NULL,
    a.id
    FROM appointments a
    JOIN tasks t
    ON t.id = a.task_id
    WHERE a.status_id IN (3, 5)
        AND NOW() > a.start_date
    ORDER BY a.start_date ASC 
    LIMIT 1");

    $row = $result->fetch_row();

    $postponed_can_be_appointed = ($row[0] ?? null) == '1';
    $postponed_appointment_id = $row[1] ?? null;

    $logs .= "Ищу задания в ожидании\n";

    if ($postponed_appointment_id) {
        $logs .= "Задание с id $postponed_appointment_id найдено ";

        if ($postponed_can_be_appointed) {
            $logs .= ", и оно может быть назначено\n";
        } else {
            $logs .= ", и оно не может быть назначено\n";
        }
    }

    if ($postponed_can_be_appointed && $postponed_appointment_id) {

        $logs .= "Назначаю задание $postponed_appointment_id \n";

        if (!$debug) {
            $result = $mysqli->query("UPDATE appointments
            SET start_date = NOW(), status_id = 1
            WHERE id = $postponed_appointment_id");

            $output = [];
            $output['success'] = $result;
            echo json_encode($output);
        }

        return true;
    }
}

function get_periods_count_sql() {
    return "SELECT p.task_id, COUNT(*) periods_count
        FROM periods p
        WHERE p.start_time IS NULL
        GROUP BY p.task_id";
}

function get_appointments_count_sql() {
    return "SELECT a.task_id, COUNT(*) appointments_count
        FROM appointments a
        JOIN (
            SELECT p.type_id, p.task_id, COUNT(*)
            FROM periods p
            GROUP BY p.type_id, p.task_id
        ) pt ON pt.task_id = a.task_id
        WHERE DATE(a.start_date) = CURDATE() AND pt.type_id = 1
            OR WEEK(a.start_date, 1) = WEEK(CURDATE(), 1) AND pt.type_id = 2
            OR MONTH(a.start_date) = MONTH(CURDATE()) AND pt.type_id = 3
            OR YEAR(a.start_date) = YEAR(CURDATE()) AND pt.type_id = 4
            OR pt.type_id = 5
        GROUP BY a.task_id, pt.type_id";
}

function appoint_random_task($mysqli, $nearest_task_start_time, $debug, &$logs) {
    $periods_count = get_periods_count_sql();
    $appointments_count = get_appointments_count_sql();

    $result = $mysqli->query("SELECT 
        t.id, 
        pc.periods_count, 
        ac.appointments_count, 
        t.duration, 
        al.start_date, 
        t.cooldown,
        p.type_id        
    FROM (
        $periods_count
    ) pc 
    LEFT JOIN (
        $appointments_count
    ) ac ON pc.task_id = ac.task_id
    JOIN tasks t ON pc.task_id = t.id
    LEFT JOIN appointments al ON al.task_id = t.id
    LEFT JOIN periods p ON p.task_id = t.id
    WHERE (ac.appointments_count < pc.periods_count OR ac.appointments_count IS NULL)
    AND t.duration < TIMESTAMPDIFF(MINUTE, current_time(), TIME('$nearest_task_start_time'))
    AND NOT EXISTS (
        SELECT * FROM tasks WHERE next_task_id = t.id
    )
    AND t.active = 1
    AND t.deleted = 0
    AND (DATE_FORMAT(al.start_date, '%Y-%m-%d %H:00') + INTERVAL t.cooldown HOUR < NOW() AND p.type_id = 1
        OR DATE_FORMAT(al.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown DAY < NOW() AND p.type_id = 2
        OR DATE_FORMAT(al.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown WEEK < NOW() AND p.type_id = 3
        OR DATE_FORMAT(al.start_date, '%Y-%m-01 00:00') + INTERVAL t.cooldown MONTH < NOW() AND p.type_id = 4
        OR al.start_date IS NULL
        OR p.type_id = 5
        OR t.cooldown = 0)
    AND (DAY(CURDATE()) IN (SELECT day FROM periods WHERE task_id = t.id) 
        OR (SELECT day FROM periods WHERE task_id = t.id LIMIT 1) IS NULL)
    AND (al.start_date = (SELECT MAX(start_date) FROM appointments WHERE task_id = t.id) 
        OR al.start_date IS NULL)
    AND p.id = (SELECT id FROM periods WHERE task_id = t.id LIMIT 1)");

    $logs .= "Составляю пул доступных заданий\n";

    $tasks_id_filtered = filter_tasks($mysqli, $result);

    $task_list = implode(',', $tasks_id_filtered);

    $logs .= "Получился такой список: $task_list \n";

    if (count($tasks_id_filtered) > 0) {
        $random_task_index = array_rand($tasks_id_filtered, 1);
        $random_task_id = $tasks_id_filtered[$random_task_index];

        $logs .= "Назначаю задание с id $random_task_id \n";

        appoint_additional_tasks($mysqli, $random_task_id, $debug, $logs);
        
        if (!$debug) {
            $result = $mysqli->query("INSERT INTO appointments
            (status_id, task_id)
            VALUES
            (1, $random_task_id)");

            $output = [];
            $output['success'] = $result;
            echo json_encode($output);
        }

        return true;
    }

    return false;

}

function check_next_task($mysqli, $next_task_id, &$logs) {
    do {

        $logs .= "Проверяем, является ли задание $next_task_id удалённым или неактивным\n";

        $result = $mysqli->query("SELECT deleted, active, next_task_id, (SELECT next_task_break FROM tasks WHERE next_task_id = $next_task_id)
        FROM tasks 
        WHERE id = $next_task_id");

        $row = $result->fetch_row();
        $deleted = $row[0];
        $active = $row[1];
        $next_task_break = $row[3] ?? 0;

        if ($deleted == 1 || $active == 0) {
            $logs .= "Задание удалено или неактивно, проверяем, есть ли следующее\n";

            if ($row[2]) {
                $logs .= "Есть следующее задание с id $row[2] \n";
            } else {
                $logs .= "Следующего задания нет, цепочка окончена\n";
            }
        } else {
            $logs .= "Задание активно\n";
        }

    } while (($deleted == 1 || $active == 0) && $next_task_id = $row[2]);

    return [$next_task_id, $next_task_break];
}

function appoint_dated_task($mysqli, $nearest_task_start_time, $debug, &$logs) {
    $result = $mysqli->query("SELECT 
        t.id
    FROM periods p
    JOIN tasks t ON p.task_id = t.id
    LEFT JOIN appointments a ON a.task_id = t.id AND DATE(a.start_date) = CURDATE()
    WHERE t.duration < TIMESTAMPDIFF(MINUTE, current_time(), TIME('$nearest_task_start_time'))
    AND NOT EXISTS (
        SELECT * FROM tasks WHERE next_task_id = t.id
    )
    AND t.deleted = 0
    AND t.active = 1
    AND (
        p.weekday IS NOT NULL AND WEEKDAY(CURDATE()) + 1 = p.weekday
        OR p.day IS NOT NULL AND p.month IS NULL AND DAY(CURDATE()) = p.day
        OR p.day IS NOT NULL AND p.month IS NOT NULL AND MONTH(CURDATE()) = p.month AND DAY(CURDATE()) = p.day
        OR p.date IS NOT NULL AND CURDATE() = p.date
    )
    AND a.id IS NULL
    LIMIT 1");

    $logs .= "Ищу задания с датой\n";

    $tasks_id_filtered = filter_tasks($mysqli, $result);

    if (count($tasks_id_filtered) > 0) {

        $task_id = $tasks_id_filtered[0];

        $logs .= "Это задание с id $task_id \n";        
        $logs .= "Назначаю задание $task_id \n";        
        
        if (!$debug) {
            $result = $mysqli->query("INSERT INTO appointments
            (status_id, task_id)
            VALUES
            (1, $task_id)");

            $output = [];
            $output['success'] = $result;
            echo json_encode($output);
        }

        return true;
        
    }

    return false;

}

function save_logs($mysqli, $debug, $logs) {

    if ($debug) {
        echo "<pre>$logs</pre>";
    } else {
        $mysqli->query("INSERT INTO logs
        (action, text)
        VALUES
        ('appoint_task', '$logs')");
    }

    exit();
}

function filter_tasks($mysqli, $result) {
    $tasks_id = [];
    $tasks_id_filtered = [];

    while ($row = $result->fetch_row()) {
        $tasks_id[] = $row[0];
    }

    // проверка, есть ли в цепочке задания на время, чтобы первое задание в таких цепочках не назначалось рандомно
    foreach ($tasks_id as $task_id) {

        $result = $mysqli->query("SELECT MAX(p.start_time) FROM (SELECT
            @r AS _id,
            @l := @l + 1 AS lvl,
            (SELECT @r := (SELECT next_task_id FROM tasks WHERE id = t.id) FROM tasks t WHERE id = _id) AS next_task_id
        FROM
            (SELECT @r := $task_id, @l := 0) vars,
            tasks t
        WHERE @r IS NOT NULL) tc
        JOIN periods p on p.task_id = tc._id
        WHERE p.start_time IS NOT NULL");

        $row = $result->fetch_row();

        if (!$row[0]) {
            $tasks_id_filtered[] = $task_id;
        }
    }

    return $tasks_id_filtered;
}

function appoint_additional_tasks($mysqli, $main_task_id, $debug, &$logs) {
    $logs .= "Ищу дополнительные задания\n";

    $periods_count = get_periods_count_sql();
    $appointments_count = get_appointments_count_sql();
    $insert_sql = "INSERT INTO appointments
        (start_date, status_id, task_id)
        VALUES ";
    $inserts = [];

    $result = $mysqli->query("SELECT at.additional_task_id
        FROM additional_tasks at
        LEFT JOIN (
            $periods_count
        ) pc on pc.task_id = at.additional_task_id
        LEFT JOIN (
            $appointments_count
        ) ac on ac.task_id = at.additional_task_id
        WHERE at.main_task_id = $main_task_id
            AND (ac.appointments_count < pc.periods_count OR ac.appointments_count IS NULL)");

    $tasks_id = [];

    while ($row = $result->fetch_row()) {
        $task_id = $row[0];
        $tasks_id[] = $task_id;
        $inserts[] = "(NOW(), 7, $task_id)";
    }

    if (count($tasks_id)) {
        $tasks_id_str = implode(",", $tasks_id);

        $logs .= "Найдены дополнительные задания: $tasks_id_str\n";
    } else {
        $logs .= "Дополнительных заданий не найдено\n";
    }

    if (count($inserts) > 0 && !$debug) {
        $insert_sql .= implode(",", $inserts);
        $result = $mysqli->query($insert_sql);
    } 
}