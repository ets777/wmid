DROP TABLE IF EXISTS `task_periods`;
CREATE TABLE `task_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `typeId` int NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `weekday` int DEFAULT NULL,
  `day` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `taskId` int NOT NULL,
  `offset` int DEFAULT NULL,
  `cooldown` int DEFAULT NULL,
  `isImportant` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `task_periods_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);