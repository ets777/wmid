DROP TABLE IF EXISTS `tsk_periods`;
CREATE TABLE `tsk_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `typeId` int NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `weekday` int DEFAULT NULL,
  `day` int DEFAULT NULL,
  `month` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `taskId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `tsk_periods_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tsk_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);