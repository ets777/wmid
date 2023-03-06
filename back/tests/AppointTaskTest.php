<?php

// ./vendor/bin/phpunit tests/AppointTaskTest.php

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
            array($test_db, '06:01:00', '2000-01-01', 1, new Appointment_result(2), "1. Назначение следующего задания"),
            array($test_db, '06:01:00', '2000-01-01', 2, new Appointment_result(6), "2. Назначение следующего задания с промежуточными удалённым и неактивным"),
            array($test_db, '06:39:00', '2000-01-01', 3, new Appointment_result(8), "3. Назначение следующего задания с наличием задания на время, когда времени достаточно"),
            array($test_db, '06:40:00', '2000-01-01', 3, new Appointment_result(0), "4. Назначение следующего задания с наличием задания на время, когда времени не достаточно, но выполнять задание на время ещё рано"),
            array($test_db, '06:51:00', '2000-01-01', 3, new Appointment_result(9), "5. Назначение следующего задания с наличием задания на время, когда времени не достаточно, и можно начать выполнять задание на время"),
            array($test_db, '07:01:00', '2000-01-01', 4, new Appointment_result(11), "6. Назначение следующего задания при разных периодичностях, задание может быть назначено"),
            array($test_db, '07:01:00', '2000-01-03', 5, new Appointment_result(0), "7. Назначение следующего задания при разных периодичностях, задание не может быть назначено"),
            array($test_db, '06:58:00', '2000-01-02', 7, new Appointment_result(13), "8. Назначение следующего задания при наличии важного задания на время в цепочке и достаточном времени"),
            array($test_db, '06:59:00', '2000-01-02', 7, new Appointment_result(14), "9. Назначение следующего задания при наличии важного задания на время в цепочке и недостаточном времени"),
            array($test_db, '07:01:00', '2000-01-02', 7, new Appointment_result(14), "10. Назначение следующего задания при наличии важного задания на время в цепочке и просрочке"),
            array($test_db, '23:59:00', '2000-01-02', 8, new Appointment_result(17), "11. Назначение следующего задания при наличии важного задания на время в цепочке до полуночи"),
            array($test_db, '00:01:00', '2000-01-03', 8, new Appointment_result(17), "12. Назначение следующего задания при наличии важного задания на время в цепочке после полуночи"),
            array($test_db, '08:56:00', '2000-01-02', 9, new Appointment_result(19), "13. Назначение следующего задания при выполнении задания на время раньше времени, но времени до него недостаточно"),
            array($test_db, '08:54:00', '2000-01-02', 9, new Appointment_result(19), "14. Назначение следующего задания при выполнении задания на время раньше времени, времени до него достаточно"),
            array($test_db, '09:01:00', '2000-01-03', 9, new Appointment_result(19), "15. Назначение следующего задания при выполнении задания на время с опозданием"),
            array($test_db, '06:58:00', '2000-01-03', 10, new Appointment_result(21), "16. Назначение следующего задания при наличии неважного задания на время в цепочке и достаточном времени"),
            array($test_db, '06:59:00', '2000-01-03', 10, new Appointment_result(21), "17. Назначение следующего задания при наличии неважного задания на время в цепочке и недостаточном времени"),
            array($test_db, '07:01:00', '2000-01-03', 10, new Appointment_result(21), "18. Назначение следующего задания при наличии неважного задания на время в цепочке и просрочке"),
            array($test_db, '23:59:00', '2000-01-03', 11, new Appointment_result(24), "19. Назначение следующего задания при наличии неважного задания на время в цепочке до полуночи"),
            array($test_db, '00:01:00', '2000-01-04', 11, new Appointment_result(24), "20. Назначение следующего задания при наличии неважного задания на время в цепочке после полуночи"),
        );
    }
}
