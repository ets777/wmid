-- Проверка назначения задания на время при конечном времени периода равном null (кейс 2.1)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, startDate, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(26, 'Задание 26 (разовое, на время)', null, null, '2001-01-01', '2001-01-01', 1, 1, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(26, 5, 26, '06:00:00', null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(12, '2001-01-01 06:00:00', '2001-01-01 06:01:00', 2, 26, 0);
