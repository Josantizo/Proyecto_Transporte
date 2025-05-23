-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: transporte
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `generartransporte`
--

DROP TABLE IF EXISTS `generartransporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `generartransporte` (
  `idGenerarTransporte` bigint NOT NULL,
  `HoraEntrada` datetime DEFAULT NULL,
  `HoraSalida` datetime DEFAULT NULL,
  `PuntoReferencia` varchar(45) NOT NULL,
  `FechaSolicitud` date NOT NULL,
  `DireccionAlternativa` varchar(255) DEFAULT NULL,
  `estado` enum('En Proceso','aceptado','cancelado','rechazado') DEFAULT NULL,
  `idDetalle_GenerarTransporte` bigint NOT NULL,
  PRIMARY KEY (`idGenerarTransporte`),
  KEY `idDetalle_GenerarTransporte_fk2_idx` (`idDetalle_GenerarTransporte`),
  CONSTRAINT `idDetalle_GenerarTransporte_fk2` FOREIGN KEY (`idDetalle_GenerarTransporte`) REFERENCES `detalle_generartransporte` (`idDetalle_GenerarTransporte`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generartransporte`
--

LOCK TABLES `generartransporte` WRITE;
/*!40000 ALTER TABLE `generartransporte` DISABLE KEYS */;
INSERT INTO `generartransporte` VALUES (2,'2025-05-22 04:41:00','2025-05-22 05:41:00','Lat: 14.651839, Lng: -90.484829','2025-05-22',NULL,'aceptado',2),(3,'2025-05-22 04:42:00','2025-05-22 05:42:00','Lat: 14.644531, Lng: -90.480881','2025-05-22',NULL,'En Proceso',3),(4,'2025-05-22 05:11:00','2025-05-21 06:11:00','Lat: 14.651673, Lng: -90.489464','2025-05-22',NULL,'En Proceso',4);
/*!40000 ALTER TABLE `generartransporte` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-22 23:23:30
