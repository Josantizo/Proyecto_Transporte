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
-- Table structure for table `detalle_generartransporte`
--

DROP TABLE IF EXISTS `detalle_generartransporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_generartransporte` (
  `idDetalle_GenerarTransporte` bigint NOT NULL,
  `idGenerarTransporte_fk2` bigint DEFAULT NULL,
  `idPasajero_fk2` int NOT NULL,
  PRIMARY KEY (`idDetalle_GenerarTransporte`),
  KEY `idPasajero_fk2_idx` (`idPasajero_fk2`),
  KEY `idGenerarTransporte_fk2_idx` (`idGenerarTransporte_fk2`),
  CONSTRAINT `idGenerarTransporte_fk2` FOREIGN KEY (`idGenerarTransporte_fk2`) REFERENCES `generartransporte` (`idGenerarTransporte`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `idPasajero_fk2` FOREIGN KEY (`idPasajero_fk2`) REFERENCES `pasajeros` (`idPasajero`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_generartransporte`
--

LOCK TABLES `detalle_generartransporte` WRITE;
/*!40000 ALTER TABLE `detalle_generartransporte` DISABLE KEYS */;
INSERT INTO `detalle_generartransporte` VALUES (2,2,1),(3,3,2),(4,4,1);
/*!40000 ALTER TABLE `detalle_generartransporte` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-22 23:23:31
