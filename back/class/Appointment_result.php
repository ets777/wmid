<?php

class Appointment_result
{
    public int $appointed_task_id;
    public int $postponed_task_id;
    public int $postponed_task_break;
    public string $nearest_task_start_time;

    function __construct(
        int $appointed_task_id = 0,
        int $postponed_task_id = 0,
        int $postponed_task_break = 0,
        string $nearest_task_start_time = ''
    )
    {
        $this->appointed_task_id = $appointed_task_id;
        $this->postponed_task_id = $postponed_task_id;
        $this->postponed_task_break = $postponed_task_break;
        $this->nearest_task_start_time = $nearest_task_start_time;
    }
}