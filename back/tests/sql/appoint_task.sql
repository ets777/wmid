-- Проверка назначения следующего задания
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`) VALUES
(1, 'Задание 1 (ежедневное, есть следующее)', 2, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0),
(2, 'Задание 2 (ежедневное, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(1, '2000-01-01 06:00:00', '2000-01-01 06:01:00', 2, 1);

-- Проверка назначения следующего задания с промежуточными удалённым и неактивным
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`) VALUES
(3, 'Задание 3 (ежедневное, есть следующее неактивное)', 4, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0),
(4, 'Задание 4 (ежедневное, есть следующее удалённое)', 5, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 0, 0, 0),
(5, 'Задание 5 (ежедневное, есть следующее)', 6, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 0, 1, 0),
(6, 'Задание 6 (ежедневное, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(3, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 1, 6, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(2, '2000-01-01 06:01:00', '2000-01-01 06:02:00', 2, 3);

-- Проверка назначения следующего задания с наличием задания на время
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`) VALUES
(7, 'Задание 7 (ежедневное, есть следующее)', 8, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 10, 1, 0, 0),
(8, 'Задание 8 (ежедневное, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 10, 1, 0, 0),
(9, 'Задание 9 (разовое, со временем)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 10, 10, 1, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(7, 1, 7, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 1, 8, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 5, 9, '07:00:00', NULL, NULL, NULL, NULL, '2000-01-01');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(3, '2000-01-01 06:40:00', '2000-01-01 06:50:00', 2, 7);

-- Проверка назначения следующего задания при разной периодичности заданий
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`) VALUES
(10, 'Задание 10 (ежедневное, есть следующее)', 11, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0),
(11, 'Задание 11 (еженедельное, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, NULL, 1, 1, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(10, 1, 10, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 2, 11, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(4, '2000-01-01 07:00:00', '2000-01-01 07:01:00', 2, 10),
(5, '2000-01-03 07:00:00', '2000-01-03 07:01:00', 2, 10),
(6, '2000-01-03 06:00:00', '2000-01-03 06:01:00', 2, 11);

-- ///////////////////////////////////////////////////////////// --

