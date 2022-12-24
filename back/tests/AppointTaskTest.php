<?php

declare(strict_types=1);

echo getcwd() . "\n";

require_once('./lib/appoint_helper.php');
require_once('./enum/Mode.php');
require_once('./class/Appointment_result.php');

use PHPUnit\Framework\TestCase;

final class AppointTaskTest extends TestCase
{
    /**
     * @dataProvider providerAppointTask
     */
    public function testAppointTask($mysqli, $current_time, $current_date, $last_appointment_id, $result, $message): void
    {
        $this->assertEquals(
            $result,
            appoint_task($mysqli, Mode::Test, $current_time, $current_date, $last_appointment_id),
            $message
        );
    }

    public function providerAppointTask()
    {
        $test_db = new mysqli('localhost', 'root', '', 'wmid_test');
        return array(
            array($test_db, '06:01:00', '2000-01-01', 1, new Appointment_result(2), "Проверка назначения следующего задания"),
            array($test_db, '06:01:00', '2000-01-01', 2, new Appointment_result(6), "Проверка назначения следующего задания с промежуточными удалённым и неактивным"),
            array($test_db, '06:39:00', '2000-01-01', 3, new Appointment_result(8), "Проверка назначения следующего задания с наличием задания на время, когда времени достаточно"),
            array($test_db, '06:40:00', '2000-01-01', 3, new Appointment_result(0), "Проверка назначения следующего задания с наличием задания на время, когда времени не достаточно, но выполнять задание на время ещё рано"),
            array($test_db, '06:51:00', '2000-01-01', 3, new Appointment_result(9), "Проверка назначения следующего задания с наличием задания на время, когда времени не достаточно, и можно начать выполнять задание на время"),
            array($test_db, '07:01:00', '2000-01-01', 4, new Appointment_result(11), "Проверка назначения следующего задания при разных периодичностях, задание может быть назначено"),
            array($test_db, '07:01:00', '2000-01-03', 5, new Appointment_result(0), "Проверка назначения следующего задания при разных периодичностях, задание не может быть назначено")
        );
    }
}
