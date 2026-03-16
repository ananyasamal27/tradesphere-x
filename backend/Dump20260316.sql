-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: tradesphere
-- ------------------------------------------------------
-- Server version	9.6.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '018aa66e-2038-11f1-8d32-d8d0900d2ffe:1-20342';

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `broker`
--

LOCK TABLES `broker` WRITE;
/*!40000 ALTER TABLE `broker` DISABLE KEYS */;
INSERT INTO `broker` VALUES (1,'TradeSphere Broker','TSB001',0.0020,'2026-03-15 08:52:42');
/*!40000 ALTER TABLE `broker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,'Reliance Industries','Energy','Largest conglomerate in India',NULL,NULL,NULL,'2026-03-15 08:52:42'),(2,'Tata Consultancy Services','Technology','Largest IT company in India',NULL,NULL,NULL,'2026-03-15 08:52:42'),(3,'Infosys','Technology','Global IT services company',NULL,NULL,NULL,'2026-03-15 08:52:42'),(4,'HDFC Bank','Finance','Leading private sector bank',NULL,NULL,NULL,'2026-03-15 08:52:42'),(5,'Bajaj Finance','Finance','Consumer finance company',NULL,NULL,NULL,'2026-03-15 08:52:42'),(6,'Hindustan Unilever','FMCG','FMCG market leader',NULL,NULL,NULL,'2026-03-15 08:52:42'),(7,'Wipro','Technology','IT services and consulting',NULL,NULL,NULL,'2026-03-15 08:52:42'),(8,'ITC Limited','FMCG','Diversified conglomerate',NULL,NULL,NULL,'2026-03-15 08:52:42'),(9,'Larsen & Toubro','Infrastructure','Engineering conglomerate',NULL,NULL,NULL,'2026-03-15 08:52:42'),(10,'Asian Paints','Consumer','Paint and coatings company',NULL,NULL,NULL,'2026-03-15 08:52:42');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `dividend`
--

LOCK TABLES `dividend` WRITE;
/*!40000 ALTER TABLE `dividend` DISABLE KEYS */;
/*!40000 ALTER TABLE `dividend` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `investor`
--

LOCK TABLES `investor` WRITE;
/*!40000 ALTER TABLE `investor` DISABLE KEYS */;
/*!40000 ALTER TABLE `investor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `portfolio`
--

LOCK TABLES `portfolio` WRITE;
/*!40000 ALTER TABLE `portfolio` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `portfoliostock`
--

LOCK TABLES `portfoliostock` WRITE;
/*!40000 ALTER TABLE `portfoliostock` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfoliostock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,1,1,'RELIANCE',4203.40,2440.00,4329.52,2435.00,4197.52,5823000,16600000000000.00,'2026-03-15 17:51:22'),(2,2,1,'TCS',7644.13,3950.00,7678.39,3940.00,7636.09,3210000,14500000000000.00,'2026-03-15 17:51:22'),(3,3,1,'INFY',2279.94,1555.00,2307.81,1476.55,2265.97,8900000,6500000000000.00,'2026-03-15 17:51:22'),(4,4,1,'HDFCBANK',3541.76,1640.00,3579.35,1596.21,3551.82,12300000,12500000000000.00,'2026-03-15 17:51:22'),(5,5,1,'BAJFINANCE',10745.89,7150.00,11147.26,7130.00,10805.98,1890000,4370000000000.00,'2026-03-15 17:51:22'),(6,6,1,'HINDUNILVR',4767.10,2760.00,4780.08,2734.72,4780.08,2100000,6550000000000.00,'2026-03-15 17:51:22'),(7,7,1,'WIPRO',833.68,482.00,851.42,479.00,837.19,9800000,2670000000000.00,'2026-03-15 17:51:22'),(8,8,1,'ITC',799.97,450.00,822.93,447.00,802.68,18700000,5700000000000.00,'2026-03-15 17:51:22'),(9,9,1,'LT',6219.89,3420.00,6460.12,3400.00,6249.55,2340000,4870000000000.00,'2026-03-15 17:51:22'),(10,10,1,'ASIANPAINT',4145.68,2950.00,4415.17,2930.00,4133.93,1760000,2860000000000.00,'2026-03-15 17:51:22');
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stockexchange`
--

LOCK TABLES `stockexchange` WRITE;
/*!40000 ALTER TABLE `stockexchange` DISABLE KEYS */;
INSERT INTO `stockexchange` VALUES (1,'NSE','India','Asia/Kolkata','09:15:00','15:30:00'),(2,'BSE','India','Asia/Kolkata','09:15:00','15:30:00');
/*!40000 ALTER TABLE `stockexchange` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tradingaccount`
--

LOCK TABLES `tradingaccount` WRITE;
/*!40000 ALTER TABLE `tradingaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `tradingaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-16 17:06:05
