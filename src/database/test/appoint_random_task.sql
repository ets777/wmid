-- Проверка назначения еженедельного задания в следующем году, но в ту же неделю по счёту (кейс 3.1)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, startDate, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(36, 'Задание 36 (еженедельное)', null, null, '2002-01-01', '2003-01-01', 1, 1, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(36, 2, 36, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(17, '2002-01-01 06:00:00', '2002-01-01 06:01:00', 2, 36, 0);
