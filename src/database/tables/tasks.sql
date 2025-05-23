DROP TABLE IF EXISTS `tsk_tasks`;
CREATE TABLE `tsk_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  `nextTaskBreak` int DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `duration` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `willBeAppointedIfOverdue` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `nextTaskId` int DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `nextTaskId` (`nextTaskId`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `tsk_tasks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `usr_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tsk_tasks_ibfk_2` FOREIGN KEY (`nextTaskId`) REFERENCES `tsk_tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tsk_tasks_ibfk_3` FOREIGN KEY (`categoryId`) REFERENCES `tsk_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);