DROP TABLE IF EXISTS `tsk_relations`;
CREATE TABLE `tsk_relations` (
  `relationType` int NOT NULL,
  `relatedTaskId` int NOT NULL,
  `mainTaskId` int NOT NULL,
  PRIMARY KEY (`relatedTaskId`,`mainTaskId`),
  KEY `mainTaskId` (`mainTaskId`),
  CONSTRAINT `tsk_relations_ibfk_1` FOREIGN KEY (`relatedTaskId`) REFERENCES `tsk_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tsk_relations_ibfk_2` FOREIGN KEY (`mainTaskId`) REFERENCES `tsk_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);