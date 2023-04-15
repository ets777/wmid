-- Проверка назначения задания на время при конечном времени периода равном NULL (кейс 1)
INSERT INTO `tasks` (`id`, `text`, `next_task_id`, `next_task_break`, `creation_date`, `end_date`, `category_id`, `offset`, `duration`, `active`, `deleted`, `cooldown`, `important`) VALUES
(26, 'Задание 26 (разовое, на время)', NULL, NULL, '2001-01-01 06:00:00', NULL, 1, 1, 1, 1, 0, 0, 0);

INSERT INTO `periods` (`id`, `type_id`, `task_id`, `start_time`, `end_time`, `weekday`, `day`, `month`, `date`) VALUES
(26, 5, 26, '06:00:00', NULL, NULL, NULL, NULL, NULL);

INSERT INTO `appointments` (`id`, `start_date`, `end_date`, `status_id`, `task_id`) VALUES
(12, '2001-01-01 06:00:00', '2001-01-01 06:01:00', 2, 26);
