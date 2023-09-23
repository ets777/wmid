DROP TABLE IF EXISTS `usr_userRoles`;
CREATE TABLE `usr_userRoles` (
  `roleId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`roleId`,`userId`),
  UNIQUE KEY `usr_userRoles_userId_roleId_unique` (`roleId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `usr_userRoles_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `usr_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usr_userRoles_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `usr_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);