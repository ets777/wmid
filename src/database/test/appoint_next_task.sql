-- Проверка назначения следующего задания (кейс 1.1)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(2, 'Задание 2 (разовое, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(1, 'Задание 1 (разовое, есть следующее)', 2, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(1, 5, 1, null, null, null, null, null, null),
(2, 5, 2, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(1, '2000-01-01 06:00:00', '2000-01-01 06:01:00', 2, 1, 0);

-- Проверка назначения следующего задания с промежуточными удалённым и неактивным (кейс 1.2)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(6, 'Задание 6 (разовое, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(5, 'Задание 5 (разовое, есть следующее)', 6, null, null, 1, 0, 1, 0, 1, 0, 0, 1),
(4, 'Задание 4 (разовое, есть следующее удалённое)', 5, null, null, 1, 0, 1, 0, 0, 0, 0, 1),
(3, 'Задание 3 (разовое, есть следующее неактивное)', 4, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(3, 5, 3, null, null, null, null, null, null),
(4, 5, 4, null, null, null, null, null, null),
(5, 5, 5, null, null, null, null, null, null),
(6, 5, 6, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(2, '2000-01-01 06:01:00', '2000-01-01 06:02:00', 2, 3, 0);

-- Проверка назначения следующего задания с наличием важного задания на время (кейсы 1.3-1.5)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(9, 'Задание 9 (разовое, со временем, важное)', null, null, null, 1, 10, 10, 1, 0, 0, 1, 1),
(8, 'Задание 8 (разовое, есть предыдущее)', null, null, null, 1, 0, 10, 1, 0, 0, 0, 1),
(7, 'Задание 7 (разовое, есть следующее)', 8, null, null, 1, 0, 10, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(7, 5, 7, null, null, null, null, null, null),
(8, 5, 8, null, null, null, null, null, null),
(9, 5, 9, '07:00:00', null, null, null, null, '2000-01-01');

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(3, '2000-01-01 06:40:00', '2000-01-01 06:50:00', 2, 7, 0);

-- Проверка назначения следующего задания при разной периодичности заданий (кейсы 1.6-1.7)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(11, 'Задание 11 (еженедельное, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(10, 'Задание 10 (ежедневное, есть следующее)', 11, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(11, 2, 11, null, null, null, null, null, null),
(10, 1, 10, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(4, '2000-01-01 07:00:00', '2000-01-01 07:01:00', 2, 10, 0),
(5, '2000-01-03 07:00:00', '2000-01-03 07:01:00', 2, 10, 0),
(6, '2000-01-03 06:00:00', '2000-01-03 06:01:00', 2, 11, 0);

-- Проверка назначения следующего задания при наличии в цепочке важного задания на время (кейсы 1.8-1.10)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(14, 'Задание 14 (разовое, важное, со временем, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 1, 1),
(13, 'Задание 13 (разовое, есть следующее)', 14, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(12, 'Задание 12 (разовое, есть следующее)', 13, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(14, 5, 14, '07:00:00', null, null, null, null, '2000-01-02'),
(13, 5, 13, null, null, null, null, null, null),
(12, 5, 12, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(7, '2000-01-02 06:58:00', '2000-01-02 06:59:00', 2, 12, 0);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке важного задания на время (кейсы 1.11-1.12)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(17, 'Задание 17 (разовое, важное, со временем, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 1, 1),
(16, 'Задание 16 (разовое, есть следующее)', 17, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(15, 'Задание 15 (разовое, есть следующее)', 16, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(17, 5, 17, '23:59:00', null, null, null, null, '2000-01-02'),
(16, 5, 16, null, null, null, null, null, null),
(15, 5, 15, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(8, '2000-01-02 23:58:00', '2000-01-02 23:59:00', 2, 15, 0);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке важного задания на время (кейсы 1.13-1.15)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(19, 'Задание 19 (разовое)', null, null, null, 1, 0, 5, 1, 0, 0, 0, 1),
(18, 'Задание 18 (разовое, со временем, есть следующее)', 19, null, 0, 1, 10, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(19, 5, 19, null, null, null, null, null, null),
(18, 5, 18, '09:00:00', null, null, null, null, '2000-01-02');

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(9, '2000-01-02 08:50:00', '2000-01-02 08:56:00', 2, 18, 0);

-- Проверка назначения следующего задания при наличии в цепочке неважного задания на время (кейсы 1.16-1.18)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(22, 'Задание 22 (разовое, неважное, со временем, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(21, 'Задание 21 (разовое, есть следующее)', 22, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(20, 'Задание 20 (разовое, есть следующее)', 21, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(22, 5, 22, '07:00:00', null, null, null, null, '2000-01-03'),
(21, 5, 21, null, null, null, null, null, null),
(20, 5, 20, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(10, '2000-01-03 06:58:00', '2000-01-03 06:59:00', 2, 20, 0);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке неважного задания на время (кейсы 1.19-1.20)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(25, 'Задание 25 (разовое, неважное, со временем, есть предыдущее)', null, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(24, 'Задание 24 (разовое, есть следующее)', 25, null, null, 1, 0, 1, 1, 0, 0, 0, 1),
(23, 'Задание 23 (разовое, есть следующее)', 24, null, null, 1, 0, 1, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(25, 5, 25, '23:59:00', null, null, null, null, '2000-01-03'),
(24, 5, 24, null, null, null, null, null, null),
(23, 5, 23, null, null, null, null, null, null);

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(11, '2000-01-03 23:58:00', '2000-01-03 23:59:00', 2, 23, 0);

-- Проверка назначения следующего задания с наличием неважного задания на время (кейсы 1.21-1.23)
insert into tsk_tasks (id, text, nextTaskId, nextTaskBreak, endDate, categoryId, offset, duration, isActive, isDeleted, cooldown, isImportant, userId) values
(29, 'Задание 29 (разовое, со временем, неважное)', null, null, null, 1, 10, 10, 1, 0, 0, 0, 1),
(28, 'Задание 28 (разовое, есть предыдущее)', null, null, null, 1, 0, 10, 1, 0, 0, 0, 1),
(27, 'Задание 27 (разовое, есть следующее)', 28, null, null, 1, 0, 10, 1, 0, 0, 0, 1);

insert into tsk_periods (id, typeId, taskId, startTime, endTime, weekday, day, month, date) values
(29, 5, 29, '07:00:00', null, null, null, null, '2000-01-04'),
(28, 5, 28, null, null, null, null, null, '2000-01-04'),
(27, 5, 27, null, null, null, null, null, '2000-01-04');

insert into tsk_appointments (id, startDate, endDate, statusId, taskId, isAdditional) values
(13, '2000-01-04 06:40:00', '2000-01-04 06:50:00', 2, 27, 0);
