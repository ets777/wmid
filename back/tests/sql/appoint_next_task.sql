-- Проверка назначения следующего задания (кейс 1.1)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(1, 'Задание 1 (разовое, есть следующее)', 2, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(2, 'Задание 2 (разовое, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 5, 2, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(1, '2000-01-01 06:00:00', '2000-01-01 06:01:00', 2, 1);

-- Проверка назначения следующего задания с промежуточными удалённым и неактивным (кейс 1.2)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(3, 'Задание 3 (разовое, есть следующее неактивное)', 4, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(4, 'Задание 4 (разовое, есть следующее удалённое)', 5, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 0, 0, 0, 0),
(5, 'Задание 5 (разовое, есть следующее)', 6, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 0, 1, 0, 0),
(6, 'Задание 6 (разовое, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(3, 5, 3, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 5, 4, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 5, 6, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(2, '2000-01-01 06:01:00', '2000-01-01 06:02:00', 2, 3);

-- Проверка назначения следующего задания с наличием важного задания на время (кейсы 1.3-1.5)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(7, 'Задание 7 (разовое, есть следующее)', 8, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 10, 1, 0, 0, 0),
(8, 'Задание 8 (разовое, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 10, 1, 0, 0, 0),
(9, 'Задание 9 (разовое, со временем, важное)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 10, 10, 1, 0, 0, 1);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(7, 5, 7, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 5, 8, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 5, 9, '07:00:00', NULL, NULL, NULL, NULL, '2000-01-01');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(3, '2000-01-01 06:40:00', '2000-01-01 06:50:00', 2, 7);

-- Проверка назначения следующего задания при разной периодичности заданий (кейсы 1.6-1.7)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(10, 'Задание 10 (ежедневное, есть следующее)', 11, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(11, 'Задание 11 (еженедельное, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(10, 1, 10, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 2, 11, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(4, '2000-01-01 07:00:00', '2000-01-01 07:01:00', 2, 10),
(5, '2000-01-03 07:00:00', '2000-01-03 07:01:00', 2, 10),
(6, '2000-01-03 06:00:00', '2000-01-03 06:01:00', 2, 11);

-- Проверка назначения следующего задания при наличии в цепочке важного задания на время (кейсы 1.8-1.10)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(12, 'Задание 12 (разовое, есть следующее)', 13, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(13, 'Задание 13 (разовое, есть следующее)', 14, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(14, 'Задание 14 (разовое, важное, со временем, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 1);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(12, 1, 12, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 1, 13, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 1, 14, '07:00:00', NULL, NULL, NULL, NULL, '2000-01-02');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(7, '2000-01-02 06:58:00', '2000-01-02 06:59:00', 2, 12);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке важного задания на время (кейсы 1.11-1.12)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(15, 'Задание 15 (разовое, есть следующее)', 16, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(16, 'Задание 16 (разовое, есть следующее)', 17, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(17, 'Задание 17 (разовое, важное, со временем, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 1);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(15, 1, 15, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 1, 16, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 1, 17, '23:59:00', NULL, NULL, NULL, NULL, '2000-01-02');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(8, '2000-01-02 23:58:00', '2000-01-02 23:59:00', 2, 15);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке важного задания на время (кейсы 1.13-1.15)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(18, 'Задание 18 (разовое, со временем, есть следующее)', 19, NULL, '2000-01-01 06:00:00', 0, 1, 10, 1, 1, 0, 0, 0),
(19, 'Задание 19 (разовое)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 5, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(18, 1, 18, '09:00:00', NULL, NULL, NULL, NULL, '2000-01-02'),
(19, 1, 19, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(9, '2000-01-02 08:50:00', '2000-01-02 08:56:00', 2, 18);

-- Проверка назначения следующего задания при наличии в цепочке неважного задания на время (кейсы 1.16-1.18)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(20, 'Задание 20 (разовое, есть следующее)', 21, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(21, 'Задание 21 (разовое, есть следующее)', 22, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(22, 'Задание 22 (разовое, неважное, со временем, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(20, 1, 20, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 1, 21, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 1, 22, '07:00:00', NULL, NULL, NULL, NULL, '2000-01-03');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(10, '2000-01-03 06:58:00', '2000-01-03 06:59:00', 2, 20);

-- Проверка назначения следующего задания после полуночи при наличии в цепочке неважного задания на время (кейсы 1.19-1.20)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(23, 'Задание 23 (разовое, есть следующее)', 24, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(24, 'Задание 24 (разовое, есть следующее)', 25, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0),
(25, 'Задание 25 (разовое, неважное, со временем, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(23, 1, 23, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 1, 24, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 1, 25, '23:59:00', NULL, NULL, NULL, NULL, '2000-01-03');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(11, '2000-01-03 23:58:00', '2000-01-03 23:59:00', 2, 23);

-- Проверка назначения следующего задания с наличием неважного задания на время (кейсы 1.21-1.23)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(27, 'Задание 27 (разовое, есть следующее)', 28, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 10, 1, 0, 0, 0),
(28, 'Задание 28 (разовое, есть предыдущее)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 0, 10, 1, 0, 0, 0),
(29, 'Задание 29 (разовое, со временем, неважное)', NULL, NULL, '2000-01-01 06:00:00', NULL, 1, 10, 10, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(27, 5, 27, NULL, NULL, NULL, NULL, NULL, '2000-01-04'),
(28, 5, 28, NULL, NULL, NULL, NULL, NULL, '2000-01-04'),
(29, 5, 29, '07:00:00', NULL, NULL, NULL, NULL, '2000-01-04');

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(13, '2000-01-04 06:40:00', '2000-01-04 06:50:00', 2, 27);
