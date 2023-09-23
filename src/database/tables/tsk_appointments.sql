DROP TABLE IF EXISTS `tsk_appointments`;
CREATE TABLE `tsk_appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `statusId` int NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime DEFAULT NULL,
  `isAdditional` tinyint(1) NOT NULL DEFAULT 0,
  `taskId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `tsk_appointments_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tsk_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);