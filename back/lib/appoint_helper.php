<?php

require_once('./enum/Mode.php');
require_once('./class/Appointment_result.php');

// TODO: refactoring - put $current_time and $current_date into one object
function appoint_task($mysqli, $mode, $current_time = null, $current_date = null, $last_appointment_id = null)
{
    $logs = '';
    $data = file_get_contents('php://input');

    if (is_null($current_time)) {
        $current_time = date("G:i:s");
    }

    if (is_null($current_date)) {
        $current_date = date("Y-m-d");
    }

    if (is_null($last_appointment_id)) {
        $last_appointment_id = json_decode($data);
    }

    if ($last_appointment_id) {
        $result = $mysqli->query("SELECT t.next_task_id, t.next_task_break
        FROM appointments a 
        JOIN tasks t 
        ON t.id = a.task_id 
        WHERE a.id = $last_appointment_id");

        $row = $result->fetch_row();

        $next_task_id = $row[0] ?? '';

        // Проверка всей цепочки, если есть id следующего задания
        $appointed_result = appoint_next_task(
            $mysqli,
            $next_task_id,
            $mode,
            $logs,
            $current_time,
            $current_date
        );

        if ($appointed_result->appointed_task_id > 0) {
            save_logs($mysqli, $mode, $logs);
            return $appointed_result;
        }
    }

    // Поиск ближайшего задания на время
    $appointed_result = appoint_time_task($mysqli, $mode, $logs, $current_time, $current_date);
    $nearest_task_start_time = $appointed_result->nearest_task_start_time;

    if ($appointed_result->appointed_task_id > 0) {
        save_logs($mysqli, $mode, $logs);
        return $appointed_result;
    }

    // Поиск заданий с конкретной датой
    $appointed_result = appoint_dated_task(
        $mysqli,
        $nearest_task_start_time,
        $mode,
        $logs,
        $current_time,
        $current_date
    );

    if ($appointed_result->appointed_task_id > 0) {
        save_logs($mysqli, $mode, $logs);
        return $appointed_result;
    }

    // Поиск отложенных заданий, на выполнение которых не будет затрачено больше, чем осталось до задания на время
    $appointed_result = appoint_postponed_task(
        $mysqli,
        $nearest_task_start_time,
        $mode,
        $logs,
        $current_time,
        $current_date
    );

    if ($appointed_result->appointed_task_id > 0) {
        save_logs($mysqli, $mode, $logs);
        return $appointed_result;
    }

    // Выбираем из пула доступных заданий
    $appointed_result = appoint_random_task(
        $mysqli,
        $nearest_task_start_time,
        $mode,
        $logs,
        $current_time,
        $current_date
    );

    if ($appointed_result->appointed_task_id > 0) {
        save_logs($mysqli, $mode, $logs);
        return $appointed_result;
    }

    if ($mode == Mode::Debug) {
        echo "<pre>$logs</pre>";
    }

    return new Appointment_result();
}

function insert_appointment($mysqli, $task_id, $status, $hour_interval = 0)
{
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

function appoint_next_task(
    $mysqli,
    $next_task_id,
    $mode,
    &$logs,
    $current_time,
    $current_date
): Appointment_result
{
    $logs .= "Проверяем, есть ли следующее задание\n";

    if (!empty($next_task_id)) {

        $logs .= "Есть следующее задание с id $next_task_id \n";

        $row = check_next_task($mysqli, $next_task_id, $logs);

        $next_task_id = $row[0];
        $next_task_break = $row[1] ?? 0;

        if (!empty($next_task_id)) {

            if ($next_task_break == 0) {
                // проверка, достаточно ли времени до ближайшего задания на время
                $query = "SELECT 
                    TIMESTAMPDIFF(
                        MINUTE, 
                        TIME(TIME('$current_time')), 
                        p.start_time - INTERVAL(
                            SELECT offset FROM tasks WHERE id = p.task_id
                        ) MINUTE
                    ) > t.duration 
                    or t.duration IS NULL
                from periods p
                JOIN tasks t ON t.id = $next_task_id
                JOIN tasks tp ON p.task_id = tp.id AND tp.deleted = 0 AND tp.active = 1
                WHERE p.start_time > TIME('$current_time') 
                    AND (p.date IS NULL OR p.date = '$current_date') 
                    AND (p.month IS NULL OR p.month = MONTH('$current_date')) 
                    AND (p.day IS NULL OR p.day = DAY('$current_date'))  
                    AND (p.weekday IS NULL OR p.weekday = WEEKDAY('$current_date') + 1) 
                ORDER BY p.start_time ASC 
                LIMIT 1";

                $result = $mysqli->query($query);
                $row = $result->fetch_row();

                $is_enough_time = ($row[0] ?? '1') == '1';

                if ($is_enough_time) {
                    $logs .= "Задание можно успеть выполнить до ближайшего задания на время\n";
                } else {
                    $logs .= "До ближайшего задания на время выполнить не получится\n";
                }

                $query = "SELECT pc.periods_count > ac.appointments_count OR ac.appointments_count IS NULL
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
                        WHERE (DATE(a.start_date) = '$current_date' AND pt.type_id = 1)
                            OR (WEEK(a.start_date) = WEEK('$current_date') AND pt.type_id = 2)
                            OR (MONTH(a.start_date) = MONTH('$current_date') AND pt.type_id = 3)
                            OR (YEAR(a.start_date) = YEAR('$current_date') AND pt.type_id = 4)
                            OR pt.type_id = 5
                        GROUP BY a.task_id
                    ) ac ON pc.task_id = ac.task_id";

                $result = $mysqli->query($query);
                $row = $result->fetch_row();

                $is_period_completed = ($row[0] ?? null) == '0';

                if ($is_period_completed) {
                    $logs .= "Задание больше нельзя назначить в текущем периоде\n";
                } else {
                    $logs .= "Задание ещё можно назначить в текущем периоде\n";
                }

                if ($is_period_completed) {

                    $result = $mysqli->query("SELECT next_task_id
                        FROM tasks
                        WHERE id = $next_task_id");

                    $row = $result->fetch_row();

                    $next_task_id = $row[0];

                    return appoint_next_task(
                        $mysqli,
                        $next_task_id,
                        $mode,
                        $logs,
                        $current_time,
                        $current_date
                    );
                }

                if ($is_enough_time && !$is_period_completed) {

                    appoint_additional_tasks($mysqli, $next_task_id, $mode, $logs, $current_time, $current_date);

                    $logs .= "Назначаю задание с id $next_task_id \n";

                    if ($mode == Mode::Prod) {
                        $result = insert_appointment($mysqli, $next_task_id, 1);
                    }

                    return new Appointment_result($next_task_id);
                }
            } else {

                $logs .= "Назначаю задание с id $next_task_id с отсрочкой в $next_task_break ч.\n";

                if ($mode == Mode::Prod) {
                    $result = insert_appointment($mysqli, $next_task_id, 3, (int) $next_task_break);
                }

                return new Appointment_result(0, $next_task_id, $next_task_break);
            }
        }
    }

    return new Appointment_result();
}

function appoint_time_task(
    $mysqli,
    $mode,
    &$logs,
    $current_time,
    $current_date
): Appointment_result
{
    $query = "SELECT 
            TIME('$current_time') > p.start_time - INTERVAL t.offset MINUTE 
            AND TIME('$current_time') < IFNULL(p.end_time, p.start_time) + INTERVAL t.offset MINUTE
            AND p.start_time < IFNULL(p.end_time, p.start_time + INTERVAL t.offset MINUTE)
            OR (
                TIME('$current_time') > p.start_time - INTERVAL t.offset MINUTE 
                AND TIME('$current_time') < TIME('23:59:59') 
                AND TIME('$current_time') > TIME('12:00:00')
                OR TIME('$current_time') < IFNULL(p.end_time, p.start_time) + INTERVAL t.offset MINUTE 
                AND TIME('$current_time') > TIME('00:00:00') 
                AND TIME('$current_time') < TIME('12:00:00')
            ) AND p.start_time > IFNULL(p.end_time, p.start_time + INTERVAL t.offset MINUTE) can_be_appointed,
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
            AND (a.start_date > TIMESTAMP('$current_date', p.start_time) - INTERVAL t.offset MINUTE 
            AND a.start_date < TIMESTAMP('$current_date', p.end_time) + INTERVAL t.offset MINUTE
            AND p.start_time < p.end_time 
            OR (
                a.start_date > TIMESTAMP('$current_date', p.start_time) - INTERVAL t.offset MINUTE 
                AND a.start_date < TIMESTAMP('$current_date', '23:59:59')
                AND TIME('$current_time') < TIME('23:59:59') 
                AND TIME('$current_time') > TIME('12:00:00')
                OR a.start_date < TIMESTAMP('$current_date', p.end_time) + INTERVAL t.offset MINUTE
                AND a.start_date > TIMESTAMP('$current_date', '00:00:00')
                AND TIME('$current_time') > TIME('00:00:00') 
                AND TIME('$current_time') < TIME('12:00:00')
            ) AND p.start_time > p.end_time)
        WHERE (
            IFNULL(p.end_time, p.start_time) + INTERVAL t.offset MINUTE > TIME('$current_time') 
            AND p.start_time < IFNULL(p.end_time, p.start_time + INTERVAL t.offset MINUTE)
            OR (
                p.start_time > TIME('$current_time') - INTERVAL t.offset MINUTE 
                AND TIME('$current_time') < TIME ('23:59:59') 
                AND TIME('$current_time') > TIME ('12:00:00')
                OR IFNULL(p.end_time, p.start_time) + INTERVAL t.offset MINUTE > TIME('$current_time')
                AND TIME('$current_time') > TIME ('00:00:00') 
                AND TIME('$current_time') < TIME ('12:00:00')
            ) AND p.start_time > IFNULL(p.end_time, p.start_time + INTERVAL t.offset MINUTE))
            AND (p.date IS NULL OR p.date = '$current_date') 
            AND (p.month IS NULL OR p.month = MONTH('$current_date')) 
            AND (p.day IS NULL OR p.day = DAY('$current_date'))  
            AND (p.weekday IS NULL OR p.weekday = WEEKDAY('$current_date') + 1)
            AND a.id IS NULL 
            AND t.active = 1
            AND t.deleted = 0
            AND (NOW() < t.end_date OR t.end_date IS NULL)
        ORDER BY can_be_appointed DESC, p.start_time ASC 
        LIMIT 1";

    $result = $mysqli->query($query);
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

        $periods_count = get_periods_count_sql();
        $appointments_count = get_appointments_count_sql([2, 3, 4, 8], $current_time, $current_date);

        $query = "SELECT 
                TIME('$current_time') > (TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE) - INTERVAL $nearest_task_offset MINUTE 
                AND TIME('$current_time') < TIME('$nearest_task_end_time') + INTERVAL $nearest_task_offset MINUTE
                AND TIME('$nearest_task_start_time') < TIME('$nearest_task_end_time')
                OR (
                    TIME('$current_time') > (TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE) - INTERVAL 30 MINUTE 
                    AND TIME('$current_time') < TIME('23:59:59') 
                    AND TIME('$current_time') > TIME('12:00:00')
                    OR TIME('$current_time') < TIME('$nearest_task_end_time') + INTERVAL 30 MINUTE
                    AND TIME('$current_time') > TIME('00:00:00') 
                    AND TIME('$current_time') < TIME('12:00:00')
                ) AND TIME('$nearest_task_start_time') > TIME('$nearest_task_end_time') can_be_appointed,
                t3.id, 
                TIME('$nearest_task_start_time') - INTERVAL SUM(t3.duration) MINUTE
            FROM (
                SELECT t1.lvl, t2.id, t2.next_task_id, t2.duration, t2.offset, t2.deleted, t2.active, t2.end_date
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
                LEFT JOIN (
                    $periods_count
                ) pc ON pc.task_id = t2.id
                LEFT JOIN (
                    $appointments_count
                ) ac ON pc.task_id = ac.task_id
                WHERE t2.id != $nearest_task_id 
                    AND t2.active = 1 
                    AND t2.deleted = 0
                    AND (ac.appointments_count < pc.periods_count OR ac.appointments_count IS NULL)
                    AND (NOW() < t2.end_date OR t2.end_date IS NULL)
                ORDER BY t1.lvl DESC
            ) t3";

        $result = $mysqli->query($query);

        $row = $result->fetch_row();

        $nearest_task_can_be_appointed = $row[0] ? $row[0] == '1' : $nearest_task_can_be_appointed;
        $nearest_task_id = $row[1] ?? $nearest_task_id;
        $nearest_task_start_time = $row[2] ?? $nearest_task_start_time;

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

    if ($nearest_task_start_time) {
        if ($nearest_task_can_be_appointed && $nearest_task_id) {

            appoint_additional_tasks($mysqli, $nearest_task_id, $mode, $logs, $current_time, $current_date);

            $logs .= "Назначаю задание на время\n";

            if ($mode == Mode::Prod) {
                $result = $mysqli->query("INSERT INTO appointments
                    (status_id, task_id)
                    VALUES
                    (1, $nearest_task_id)");
            }

            return new Appointment_result($nearest_task_id);
        }

        return new Appointment_result(0, 0, 0, $nearest_task_start_time);
    }

    return new Appointment_result();
}

function appoint_postponed_task($mysqli, $nearest_task_start_time, $mode, &$logs, $current_time, $current_date)
{
    $result = $mysqli->query("SELECT 
        TIMESTAMPDIFF(MINUTE, TIME('$current_time'), TIME('$nearest_task_start_time')) > t.duration 
        OR t.duration IS NULL,
        a.id,
        t.id
        FROM appointments a
        JOIN tasks t
        ON t.id = a.task_id 
            AND t.deleted = 0
            AND t.active = 1
            AND (NOW() < t.end_date OR t.end_date IS NULL)
        WHERE a.status_id = 3
            AND NOW() > a.start_date
        ORDER BY a.start_date ASC 
        LIMIT 1");

    $row = $result->fetch_row();

    $postponed_can_be_appointed = ($row[0] ?? null) == '1';
    $postponed_appointment_id = $row[1] ?? null;
    $postponed_task_id = $row[2] ?? null;

    $logs .= "Ищу задания в ожидании\n";

    if ($postponed_appointment_id) {
        $logs .= "Задание с id $postponed_appointment_id найдено ";

        if ($postponed_can_be_appointed) {
            $logs .= ", и оно может быть назначено\n";
        } else {
            $logs .= ", и оно не может быть назначено\n";
        }
    }

    if ($postponed_can_be_appointed && $postponed_appointment_id && $postponed_task_id) {

        appoint_additional_tasks($mysqli, $postponed_task_id, $mode, $logs, $current_time, $current_date);

        $logs .= "Назначаю задание $postponed_task_id \n";

        if ($mode == Mode::Prod) {
            $result = $mysqli->query("UPDATE appointments
                SET start_date = NOW(), status_id = 1
                WHERE id = $postponed_appointment_id");
        }

        return new Appointment_result($postponed_task_id);
    }

    return new Appointment_result();
}

function get_periods_count_sql()
{
    return "SELECT p.task_id, COUNT(*) periods_count
        FROM periods p
        WHERE p.start_time IS NULL
        GROUP BY p.task_id";
}

function get_appointments_count_sql($statuses, $current_time, $current_date)
{
    $statuses_str = implode(",", $statuses);

    return "SELECT a.task_id, COUNT(*) appointments_count
        FROM appointments a
        JOIN (
            SELECT p.type_id, p.task_id, COUNT(*)
            FROM periods p
            GROUP BY p.type_id, p.task_id
        ) pt ON pt.task_id = a.task_id
        WHERE a.status_id IN ($statuses_str)
        AND (DATE(a.start_date) = '$current_date' AND pt.type_id = 1
            OR WEEK(a.start_date, 1) = WEEK('$current_date', 1) AND pt.type_id = 2
            OR MONTH(a.start_date) = MONTH('$current_date') AND pt.type_id = 3
            OR YEAR(a.start_date) = YEAR('$current_date') AND pt.type_id = 4
            OR pt.type_id = 5)
        GROUP BY a.task_id";
}

function appoint_random_task(
    $mysqli,
    $nearest_task_start_time,
    $mode,
    &$logs,
    $current_time,
    $current_date
): Appointment_result
{
    $periods_count = get_periods_count_sql();
    $appointments_count = get_appointments_count_sql([2, 3, 4, 8], $current_time, $current_date);

    $query = "SELECT 
            t.id, 
            pc.periods_count, 
            ac.appointments_count, 
            t.duration, 
            a.start_date, 
            t.cooldown,
            p.type_id        
        FROM (
            $periods_count
        ) pc 
        LEFT JOIN (
            $appointments_count
        ) ac ON pc.task_id = ac.task_id
        JOIN tasks t ON pc.task_id = t.id
        LEFT JOIN appointments a ON a.task_id = t.id
        JOIN periods p ON p.task_id = t.id
        WHERE (ac.appointments_count < pc.periods_count OR ac.appointments_count IS NULL)
        AND t.duration < TIMESTAMPDIFF(MINUTE, TIME('$current_time'), TIME('$nearest_task_start_time'))
        AND NOT EXISTS (
            SELECT * FROM tasks WHERE next_task_id = t.id
        )
        AND t.active = 1
        AND t.deleted = 0
        AND (NOW() < t.end_date OR t.end_date IS NULL)
        AND (a.status_id IN (2, 3, 4, 8) or a.status_id IS NULL)
        AND (DATE_FORMAT(a.start_date, '%Y-%m-%d %H:00') + INTERVAL t.cooldown HOUR < NOW() AND p.type_id = 1
            OR DATE_FORMAT(a.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown DAY < NOW() AND p.type_id = 2
            OR DATE_FORMAT(a.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown WEEK < NOW() AND p.type_id = 3
            OR DATE_FORMAT(a.start_date, '%Y-%m-01 00:00') + INTERVAL t.cooldown MONTH < NOW() AND p.type_id = 4
            OR a.start_date IS NULL
            OR p.type_id = 5
            OR t.cooldown = 0)
        AND (DAY('$current_date') IN (SELECT day FROM periods WHERE task_id = t.id) 
            OR (SELECT day FROM periods WHERE task_id = t.id LIMIT 1) IS NULL)
        AND (a.start_date = (SELECT MAX(start_date) FROM appointments WHERE task_id = t.id AND status_id IN (2, 3, 4, 8)) 
            OR a.start_date IS NULL)
        AND p.id = (SELECT id FROM periods WHERE task_id = t.id LIMIT 1)
        AND ((p.weekday IS NULL OR WEEKDAY('$current_date') + 1 = p.weekday)
            AND (p.day IS NULL OR DAY('$current_date') = p.day)
            AND (p.month IS NULL OR MONTH('$current_date') = p.month)
            AND (p.date IS NULL OR '$current_date' = p.date))
        AND t.id NOT IN (
            SELECT et.excluded_task_id 
            FROM excluded_tasks et 
            LEFT JOIN appointments a2
            ON a2.task_id = et.task_id
            AND DATE(a2.start_date) = '$current_date'
            WHERE a2.id IS NOT NULL    	
        )";

    $result = $mysqli->query($query);

    $logs .= "Составляю пул доступных заданий\n";

    $tasks_id_filtered = filter_tasks($mysqli, $result);
    $task_list = implode(',', $tasks_id_filtered);

    $logs .= "Получился такой список: $task_list \n";

    if (count($tasks_id_filtered) > 0) {
        $random_task_index = array_rand($tasks_id_filtered, 1);
        $random_task_id = $tasks_id_filtered[$random_task_index];

        $logs .= "Назначаю задание с id $random_task_id \n";

        appoint_additional_tasks($mysqli, $random_task_id, $mode, $logs, $current_time, $current_date);

        if ($mode == Mode::Prod) {
            $result = $mysqli->query("INSERT INTO appointments
                (status_id, task_id)
                VALUES
                (1, $random_task_id)");
        }

        return new Appointment_result($random_task_id);
    }

    return new Appointment_result();
}

function check_next_task($mysqli, $next_task_id, &$logs)
{
    do {

        $logs .= "Проверяем, является ли задание $next_task_id удалённым или неактивным\n";

        $result = $mysqli->query("SELECT deleted, active, end_date, next_task_id, (SELECT next_task_break FROM tasks WHERE next_task_id = $next_task_id)
        FROM tasks 
        WHERE id = $next_task_id");

        $row = $result->fetch_row();
        $deleted = $row[0];
        $active = $row[1];
        $end_date = $row[2];
        $next_task_break = $row[4] ?? 0;

        if ($end_date) {
            $end_date = new DateTime($end_date);
            $current_date = new DateTime();
            $actual = $end_date <= $current_date;
        } else {
            $actual = true;
        }

        if ($deleted == 1 || $active == 0 || !$actual) {
            $logs .= "Задание удалено, неактивно или закончен срок его действия, проверяем, есть ли следующее\n";

            if ($row[3]) {
                $logs .= "Есть следующее задание с id $row[3] \n";
            } else {
                $logs .= "Следующего задания нет, цепочка окончена\n";
            }
        } else {
            $logs .= "Задание активно\n";
        }
    } while (($deleted == 1 || $active == 0 || !$actual) && $next_task_id = $row[3]);

    return [$next_task_id, $next_task_break];
}

function appoint_dated_task(
    $mysqli,
    $nearest_task_start_time,
    $mode,
    &$logs,
    $current_time,
    $current_date
): Appointment_result
{
    $result = $mysqli->query("SELECT 
        t.id
    FROM periods p
    JOIN tasks t ON p.task_id = t.id
    LEFT JOIN appointments a ON a.task_id = t.id AND DATE(a.start_date) = '$current_date'
    WHERE t.duration < TIMESTAMPDIFF(MINUTE, TIME('$current_time'), TIME('$nearest_task_start_time'))
    AND NOT EXISTS (
        SELECT * FROM tasks WHERE next_task_id = t.id
    )
    AND t.deleted = 0
    AND t.active = 1
    AND (NOW() < t.end_date OR t.end_date IS NULL)
    AND (
        p.weekday IS NOT NULL AND WEEKDAY('$current_date') + 1 = p.weekday
        OR p.day IS NOT NULL AND p.month IS NULL AND DAY('$current_date') = p.day
        OR p.day IS NOT NULL AND p.month IS NOT NULL AND MONTH('$current_date') = p.month AND DAY('$current_date') = p.day
        OR p.date IS NOT NULL AND '$current_date' = p.date
    )
    AND a.id IS NULL
    LIMIT 1");

    $logs .= "Ищу задания с датой\n";

    $tasks_id_filtered = filter_tasks($mysqli, $result);

    if (count($tasks_id_filtered) > 0) {

        $task_id = $tasks_id_filtered[0];

        $logs .= "Это задание с id $task_id \n";

        appoint_additional_tasks($mysqli, $task_id, $mode, $logs, $current_time, $current_date);

        $logs .= "Назначаю задание $task_id \n";

        if ($mode == Mode::Prod) {
            $result = $mysqli->query("INSERT INTO appointments
                (status_id, task_id)
                VALUES
                (1, $task_id)");
        }

        return new Appointment_result($task_id);
    }

    return new Appointment_result();
}

function save_logs($mysqli, $mode, $logs)
{
    if ($mode == Mode::Debug) {
        echo "<pre>$logs</pre>";
    } else {
        $mysqli->query("INSERT INTO logs
        (action, text)
        VALUES
        ('appoint_task', '$logs')");
    }
}

function filter_tasks($mysqli, $result)
{
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

function appoint_additional_tasks($mysqli, $main_task_id, $mode, &$logs, $current_time, $current_date)
{
    $logs .= "Ищу дополнительные задания\n";

    $periods_count = get_periods_count_sql();
    $appointments_count = get_appointments_count_sql([2, 8], $current_time, $current_date);

    $inserts_sql = [];
    $update_tasks_id = [];

    $sql = "SELECT 
            at.additional_task_id, 
            a2.status_id,
            a.id IS NULL AND EXISTS (SELECT id FROM appointments WHERE task_id = t.id), 
            COUNT(*)
        FROM additional_tasks at
        JOIN tasks t ON t.id = at.additional_task_id
        JOIN periods p ON p.task_id = at.additional_task_id
        LEFT JOIN appointments a ON a.task_id = at.additional_task_id 
	        AND (a.status_id IN (2, 3, 8) OR a.status_id IS NULL)
	        AND (DATE_FORMAT(a.start_date, '%Y-%m-%d %H:00') + INTERVAL t.cooldown HOUR < NOW() AND p.type_id = 1
	            OR DATE_FORMAT(a.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown DAY < NOW() AND p.type_id = 2
	            OR DATE_FORMAT(a.start_date, '%Y-%m-%d 00:00') + INTERVAL t.cooldown WEEK < NOW() AND p.type_id = 3
	            OR DATE_FORMAT(a.start_date, '%Y-%m-01 00:00') + INTERVAL t.cooldown MONTH < NOW() AND p.type_id = 4
	            OR a.start_date IS NULL
	            OR (a.start_date < NOW() and a.status_id = 3)
	            OR p.type_id = 5
	            OR t.cooldown = 0)
	        AND (a.start_date = (SELECT MAX(start_date) FROM appointments WHERE task_id = t.id AND status_id IN (2, 3, 8)) 
            	OR a.start_date IS NULL)
        LEFT JOIN (
            SELECT task_id, status_id, COUNT(*) 
            FROM appointments 
            GROUP BY task_id, status_id
        ) a2 ON a2.task_id = at.additional_task_id 
            AND a2.status_id IN (2, 3, 8)
        LEFT JOIN (
            $periods_count
        ) pc on pc.task_id = at.additional_task_id
        LEFT JOIN (
            $appointments_count
        ) ac on ac.task_id = at.additional_task_id
        WHERE at.main_task_id = $main_task_id
        AND (ac.appointments_count < pc.periods_count OR ac.appointments_count IS NULL)
        AND t.active = 1
        AND t.deleted = 0
        AND (NOW() < t.end_date OR t.end_date IS NULL)
        AND (a.status_id IN (2, 3, 8) OR a.status_id IS NULL)
        AND (DAY('$current_date') IN (SELECT day FROM periods WHERE task_id = t.id) 
            OR (SELECT day FROM periods WHERE task_id = t.id LIMIT 1) IS NULL)
        AND p.id = (SELECT id FROM periods WHERE task_id = t.id LIMIT 1)
        GROUP BY at.additional_task_id";
    $result = $mysqli->query($sql);

    $insert_tasks_id = [];

    while ($row = $result->fetch_row()) {
        $task_id = $row[0];
        $status_id = $row[1];
        $can_be_appointed = !$row[2];

        if ($task_id && $can_be_appointed) {
            if ((int) $status_id == 3) {
                $update_tasks_id[] = $task_id;
            } else {
                $insert_tasks_id[] = $task_id;
                $inserts_sql[] = "(NOW(), 7, $task_id)";
            }
        }
    }

    if (count($update_tasks_id) || count($insert_tasks_id)) {
        $tasks_id_str = implode(",", array_merge($insert_tasks_id, $update_tasks_id));

        $logs .= "Найдены дополнительные задания: $tasks_id_str\n";
    } else {
        $logs .= "Дополнительных заданий не найдено\n";
    }

    if (count($inserts_sql) > 0 && $mode == Mode::Prod) {
        $insert_sql = implode(",", $inserts_sql);

        $mysqli->query("INSERT INTO appointments
            (start_date, status_id, task_id)
            VALUES 
            $insert_sql");
    }

    if (count($update_tasks_id) > 0 && $mode == Mode::Prod) {
        $updates_sql = implode(",", $update_tasks_id);

        $mysqli->query("UPDATE appointments
            SET status_id = 7, start_date = NOW()
            WHERE task_id IN ($updates_sql) AND status_id = 3");
    }
}