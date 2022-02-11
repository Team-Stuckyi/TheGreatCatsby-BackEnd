-- MySQL dump 10.13  Distrib 8.0.17, for macos10.14 (x86_64)
--
-- Host: localhost    Database: thegreatcatsby
-- ------------------------------------------------------
-- Server version	8.0.26

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
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `email` varchar(40) NOT NULL COMMENT '회원 이메일',
  `password` varchar(500) NOT NULL COMMENT '비밀번호',
  `name` varchar(20) NOT NULL COMMENT '이름',
  `status` enum('Y','N') NOT NULL COMMENT '계정 상태',
  `tel` varchar(11) DEFAULT NULL COMMENT '휴대전화',
  `reg_date` datetime NOT NULL COMMENT '가입일자',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'bm0531@mail.com','bmbm9605','이병민','Y','01031314040','2022-02-11 14:50:55');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `email` varchar(40) NOT NULL COMMENT '회원 이메일',
  `password` varchar(500) NOT NULL COMMENT '비밀번호',
  `name` varchar(20) NOT NULL COMMENT '이름',
  `status` enum('Y','N') NOT NULL COMMENT '계정 상태',
  `tel` varchar(11) DEFAULT NULL COMMENT '휴대전화',
  `addr1` varchar(100) DEFAULT NULL COMMENT '우편번호 api로 받은 주소',
  `addr2` varchar(100) DEFAULT NULL COMMENT '상세 주소',
  `reg_date` datetime NOT NULL COMMENT '가입일자',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'wy0613@mail.com','wywy0006','김우영','Y','01023235050',NULL,NULL,'2022-02-11 14:50:55');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `order_price` int NOT NULL COMMENT '판매가+배송비',
  `order_date` datetime NOT NULL COMMENT '주문 날짜',
  `order_select` enum('T','K') NOT NULL COMMENT '결제 방식',
  `order_count` int NOT NULL COMMENT '상품 수량',
  `prod_id` int NOT NULL COMMENT '상품 일련번호',
  `user_id` int NOT NULL COMMENT '회원 일련번호',
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_prod_id` (`prod_id`),
  KEY `fk_orders_user_id` (`user_id`),
  CONSTRAINT `fk_orders_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `products` (`prod_id`),
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `members` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,35000,'2022-02-11 14:50:55','T',3,1,1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `prod_id` int NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `name` varchar(40) NOT NULL COMMENT '상품명',
  `stock` int NOT NULL COMMENT '재고',
  `status` enum('Y','N') NOT NULL COMMENT '판매 가능 여부',
  `price` int NOT NULL COMMENT '판매 가격',
  `category` varchar(15) NOT NULL COMMENT '카테고리',
  `thumbnail_photo` varchar(500) NOT NULL COMMENT '상품 썸네일 사진',
  `info_photo` varchar(500) NOT NULL COMMENT '상품 정보 사진',
  `prod_info` varchar(500) NOT NULL COMMENT '상품 정보 설명',
  `prod_feature` varchar(500) NOT NULL COMMENT '상품 특징',
  `reg_date` datetime NOT NULL COMMENT '상품 등록 날짜',
  `review_count` int DEFAULT NULL COMMENT '리뷰 갯수',
  `stars_avg` float DEFAULT NULL COMMENT '평점',
  PRIMARY KEY (`prod_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'츄통령 바삭츄 동결건조 닭가슴살 55g',213,'Y',6500,'간식','./img/basakchu.jpg','./img/basakchu_info.jpg','츄통령 바삭츄 동결건조 닭가슴살은 닭가슴살 100%를 사용하여 만든 동결건조 간식입니다. 동결 과정을 거쳐 원물의 영양소 및 풍미를 유지하고 있으며, 동결 후 2단계 진공 건조를 통해 보존성, 안전성, 신선함을 더했습니다. 저지방 고단백으로 풍부한 영양 공급이 가능하며, 필수 아미노산이 풍부하여 면역력 강화에 도움을 줍니다. 비타민 A,B가 피부, 눈 점막, 방광을 건강하게 세포재생을 도와주며, 풍부한 타우린이 심장을 튼튼하게 만들어 줍니다. 국내 제조 간식으로 믿고 급여 가능하며, 반려동물의 건강을 위해 첨가물 및 부산물을 넣지 않았습니다. 직사광선을 피해 건조하고 서늘한 곳에 보관해주시기 바랍니다. 개봉 후에는 밀봉하여 냉장보관해주시고, 가급적 빠른 시일 내에 급여해주시기 바랍니다. 본 상품은 통 원물로 만든 간식으로 모양이 일정하지 않으며, 주의사항은 상세페이지를 참고해주시기를 바랍니다.','닭가슴살 100%를 사용하여 만든 동결건조 간식, 저지방 고단백으로 풍부한 영양 공급 가능, 필수 아미노산, 타우린, 비타민A, B 함유, 국내 제조 간식, 첨가물, 부산물 무첨가','2022-02-11 14:50:55',12,4.1),(2,'마이베프 생유베리마치 펫밀크 200ml',72,'Y',2700,'간식','./img/milk.jpg','./img/milk_info.jpg','마이베프 생유베리마치 펫밀크는 1A 등급의 생유를 특수 공정을 통해 유당분해하여 반려동물에게 맞춘 우유입니다. HACCP 인증 목장에서 무항생제로 키운 건강한 젖소에서 착유한 우유를 사용하며, 유당분해된 우유에 크랜베리를 추가하여 음수량 증진에 효과적입니다. 또한, 글루코사민과 타우린 등의 영양소 함유로 신장건강에 도움을 주며, 유화제 및 합성보존료, 항생제를 사용하지 않았습니다.','1A 등급의 생유를 특수 공정하여 유당을 분해한 반려동물 우유, 유당분해된 우유에 크랜베리를 추가해 음수량 증진에 효과적, 클루코사민, 타우린 등의 영양소 함유로 신장건강에 도움','2021-09-21 13:30:00',7,4.3),(3,'에버크린 ES UN 19kg',0,'N',29000,'모래','./img/everclean.jpg','./img/everclean_info.jpg','프리미엄 에버크린 ES UN은 펫 선진국인 미국의 고양이 모래시장에서 정상을 지키고 있는 최고급 브랜드로, 에버크린의 우수한 품질은 세계의 고양이 애호가들이 널리 인정하고 있습니다. 99.9% 티끌가루가 없고, 수분을 응고하는 힘이 아주 강력하여 모래소비가 매우 적고 경제적이며, 소변이 모래통 바닥까지 고여서 분해되어 냄새가 나는 일이 없습니다. 또한, 활성탄이 첨가되어 탈취효과가 더욱 좋아졌고, 항균제가 첨가되어 악취의 원인인 박테리아의 생장을 억제하므로 냄새의 발생을 줄여줍니다. 강력한 탈취효과로 두마리가 같이 사용해도 충분한 기능을 하고 향이 없는 제품입니다. 용변덩어리는 변기에 버리지 마시고 쓰레기봉투에 넣어 버려주시기 바랍니다. 사용방법은 다음과 같습니다. 고양이 화장실에 5~7cm정도 높이로 모래를 부어줍니다. 청소시에는 모래삽으로 굳은 용변 덩어리만 걸러냅니다. 높이를 유지하기 위해 모래를 조금 더 부어줍니다.','99.9% 먼지감소 최소화, 탈취효과에 탁월한 활성탄 첨가, 향균제 첨가로 박테리아 억제','2021-09-19 13:30:00',35,4.8),(4,'로얄캐닌 인도어 7 + 3.5kg 변냄새 감소',7,'Y',49500,'사료','./img/royal.jpg','./img/royal_info.jpg','로얄캐닌 인도어 7+은 항산화 영양소를 포함하여 생후 7년 이후의 실내생활을 하는 노령묘 활력유지를 돕는 사료입니다. 높은 단백질 함량은 빛나는 피모의 상태를 향상하는데 도움을 주고, 적절한 인함량으로 신장건강에 도움을주어 변냄새를 감소시켜주며, 노화를 예방시켜 줍니다.','노령묘의 노화예방 및 활력유지, 균형잡힌 영양소 조합으로 소화건강에 도움, 면밀한 검사와 분석이 이루어진 원료 사용','2021-11-19 10:30:00',41,4.7),(5,'웰니스 코어 시그니쳐 셀렉트 플레이크 참치와 연어 캔 79g',108,'Y',2200,'사료','./img/wellness.jpg','./img/wellness_info.jpg','웰니스 코어 시그니쳐 셀렉트는 고양이의 습성을 생각한 그레인프리 습식 사료입니다. 슈레드, 청키, 플레이크 3가지 형태의 다양한 맛과 질감으로 반려묘의 욕구를 충족시켜주며, 신선한 육류와 필수 지방산이 풍부한 해바라기씨유를 기본으로 건강한 모질을 형성하는데 도움을 줍니다. 건사료와 같이 급여시 1캔 마다 약 16g씩 줄여주시기 바랍니다.','고양이의 습성을 고려한 그레인프리 습식 사료, 수분 공급으로 요로계 질병 예방, 건강한 모질을 위한 해바라기씨유 함유','2022-01-11 11:30:00',32,3.8),(6,'뉴트리나 리얼오플러스 캣 인도어 6kg',97,'Y',43000,'사료','./img/real_o.jpg','./img/real_o_info.jpg','뉴트리나 리얼오플러스 캣 인도어는 실내에서 주로 생활하는 고양이를 위한 기능성을 강화한 자연 그대로의 유기농 인증 사료입니다. 필수 영양분인 타우린, 아르기닌을 함유하여 눈과 심장 건강에 도움을 주며, 방광염 등 요로계 질환 예방에 보조적인 도움을 주는 크랜베리를 첨가하였습니다. 장내 환경 개선에 효과적인 섬유소와 유산균을 함유하고 있으며, 지방 함량이 낮아 체중 조절에도 효과적입니다. 또한 GM0, 항생제, 화학보존료 등 6가지 화학 첨가물을 넣지않은 순수한 원료만을 사용하였습니다.','실내에서 생활하는 고양이를 위한 유기농 인증 사료, 필수 영양분 타우린 함유로 눈과 심장 건강에 도움, 크랜베리를 첨가하여 방광염 등 요로계 질환 예방','2022-01-13 11:30:00',41,4.3),(7,'알모네이쳐 내츄럴 대서양참치 캔 70g',22,'Y',2500,'사료','./img/almo_tuna.jpg','./img/almo_tuna_info.jpg','알모네이쳐 내츄럴 대서양참치 캔은 휴먼그레이드 원료로 제조한 주식용 캔입니다. 육류나 생선살 등 동물성 원료를 사용하였으며, 인공감미료 및 보존제, 향미증진제, 착색제 무첨가로 건강하게 급여 가능합니다. 또한 고단백 저칼로리로 체중관리에 도움이 되며, 고수분으로 음수량이 부족한 반려묘에게 효과적입니다. 직사광선을 피하여 서늘하고 건조한 곳에 보관해주시길 바라며, 개봉한 제품은 냉장보관 해주시고 24시간 이내에 모두 급여해 주십시오. 제품의 들어있는 육수를 버리지말고 함께 급여해주세요.','휴먼그레이드 원료로 제조한 주식용 캔, 육류나 생선살 등 동물성 단백질 원료 사용','2022-01-13 11:30:00',33,4.1),(8,'아보덤 내추럴 그레인프리 참치&새우 캔 85g',33,'Y',1800,'사료','./img/avo_nat.jpg','./img/avo_nat_info.jpg','아보덤 내추럴 그레인프리 참치&새우 캔은 부드러운 그레이비 타입 그레인프리 주식 캔입니다. 건강한 피부와 윤기있는 모질을 위해 필요한 불포화 지방산, 비타민가 무기질이 풍부하여 불필요한 떨빠짐과 피부의 각질화를 예방해주는 슈퍼푸드 아보카도를 첨가하였으며, 수분이 가득하여 평소 수분 섭취를 잘 하지 않는 반려묘에게도 충분한 수분 섭취를 도와주어 결석과 방광염 등 요로계 질환 예방에 도움을 줍니다.','부드러운 그레이비 타입 그레인프리 주식 캔, 충분한 수분 섭취를 통해 요로계 질환 예방 효과','2022-01-13 11:30:00',77,3.8),(9,'로얄캐닌 라이트 웨이트 케어 3kg 체중 관리',55,'Y',44500,'사료','./img/royal_light.jpg','./img/royal_light_info.jpg','로얄캐닌 라이트 웨이트 케어는 풍부한 식이섬유가 포만감을 주는 과체중 방지 사료입니다. 라이트의 풍부한 식이섬유와 차전자피가 포만감을 느끼게 해주면서 칼로리는 17% 낮게 만들었습니다.','풍부한 식이섬유로 포만감을 주는 과체중 방지 사료, 지방의 축적을 예방하는 L-카르니틴 함유','2022-01-13 11:30:00',34,3.3),(10,'오리젠 캣앤키튼 340g',11,'Y',9900,'사료','./img/orijen_catnkitten.jpg','./img/orijen_catnkitten_info.jpg','오리젠 캣앤키튼은 신경계 발달에 도움을 주는 DHA, EPA, 지방산이 풍부한 전연령, 전묘종 사료입니다. 닭, 칠면조, 자연란, 대서양 청어, 가자미를 주원료로 사용했으며, 자체 육즙만을 사용하여 만들어졌습니다.','천연 영양분을 보존하기 위해 스팀공법으로 제조, 미국 AAFCO의 식품 영양 요구량 기준을 충족','2022-01-13 11:30:00',13,4.5),(11,'보레알 치킨&연어 캔 80g',0,'N',2200,'사료','./img/boreal.jpg','./img/boreal_info.jpg','로우즈 캣 슈레디드 참치&연어 캔은 부드러운 식감과 소화 흡수율을 높인 슈레디드 주식캔입니다. 최소한의 가공을 통해 영양소를 유지하며, 풍부한 수분을 함유하고 있습니다. 높은 단백질 효율과 AAFCO(미국 사료 협회)가 요구하는 최적의 영양으로 영양공급에 탁월하며, 소화 흡수를 방해하는 구아검, 잔탄검, 카시아검 등 겔화제를 넣지 않았습니다. 또한, 반려묘의 건강을 위해 그레인 프리, 감자, 독성 플라스틱, 비스페놀, 프탈레이트를 넣지 않았습니다.','부드러운 식감과 소화 흡수율 높인 슈레디드 주식캔, 균형잡힌 영양 공급 및 풍부한 수분 함유','2022-01-13 11:30:00',22,4.4),(12,'캐츠랑 전연령 5kg',0,'N',13900,'사료','./img/catsrang.jpg','./img/catsrang_info.jpg','캐츠랑 전연령은 동물성 단백질원을 80% 이상 사용하여 단백질원이 풍부한 전연령 사료입니다. 균형잡힌 영양소를 바탕으로 피부 모질 향상 및 야맹증 예방에 효과적이며, 유카추출물과 프락토올리고당이 함유되어 장 건강과 변 냄새 감소에 효과적입니다.','동물성 단백질원을 사용하여 만든 전연령 사료, 균형잡힌 영양소로 피모개선 및 야맹증 예방','2022-01-13 11:30:00',7,4.7),(13,'뉴트로 내추럴 초이스 인도어 어덜트 닭고기와 현미 2.27kg',38,'Y',27400,'사료','./img/nutro.jpg','./img/nutro_info.jpg','뉴트로 내추럴 초이스 인도어 어덜트 닭고기와 현미는 1세 이상 실내 거주 성묘를 위한 식품입니다. 혼합 천연 섬유소로 헤어볼 형성을 억제해주고, 천연 오일이 풍부하게 함유되어 건강한 피부와 부드럽고 윤기 나는 모질을 만들어 줍니다.','고소화율의 단백질원인 닭고기 사용, 헤어볼 형성 억제를 위한 혼합 천연 섬유소 함유','2022-01-13 11:30:00',73,4.2),(14,'이나바 챠오 츄르 가다랑어 4개입',21,'Y',2000,'간식','./img/ciao.jpg','./img/ciao_info.jpg','챠오 츄르 가다랑어는 일본에서 참치통조림 생산부터 시작하여 150년간 3대째 이어온 통조림 전문기업 이나바의 제품으로, 파우치 형태로 급여하기에 좋으며 개별포장으로 외출시에 휴대하기에도 편리하고, 100% 저지방 생선육만을 사용하여 고양이 입맛을 사로잡을 간식입니다.','100% 저지방 생선육을 사용한 간식, 대소변 냄새 감소에 도움을 주는 녹차엑기스 함유','2022-01-11 11:30:00',77,4.7),(15,'그리니즈 필라인 덴탈 트릿 닭고기맛 130g',37,'Y',7200,'간식','./img/greenies.jpg','./img/greenies_info.jpg','그리니즈 필라인 덴탈 트릿은 고양이들이 좋아하는 맛은 물론 씹는 동안 치아를 깨끗이 닦아주는 독특한 모양으로 치석과 플라그 형성 억제 효과가 입증된 제품입니다. 비타민과 미네랄, 타우린이 첨가된 영양적으로 균형 잡힌 구성으로 꼭 필요한 영양소를 완벽하게 제공합니다.','100% 균형 잡힌 영양 간식, 치석과 플라그 생성 억제 효과','2022-01-11 11:30:00',13,4.1),(16,'버박 C.E.T. 치약 닭고기맛 70g',11,'Y',9800,'건강관리','./img/virbac.jpg','./img/virbac_info.jpg','버박 C.E.T. 치약 닭고기맛 70g은 이중 효소 시스템이 플러그 생성을 감소시키고 구취개선과 이빨을 청결히 하는데 효과적이며, 잇몸에 영양을 공급하여 줍니다.','플라그생성균을 억제하는 C.E.T 이중효소의 특허공법 적용, 세균억제 및 세균의 산 생성 억제로 치주질환 예방','2022-12-11 11:30:00',23,4.5),(17,'인트라젠 플러스 종합영양제 분말형 30개입',22,'Y',8000,'건강관리','./img/intragen.jpg','./img/intragen_info.jpg','인트라젠 위장건강 면역증강은 첨단 바이오공학 제품으로 선진국에서 어린애완동물의 초기 생존율을 거의 100%에 가깝게 끌어올려, 이미 오래전부터 그 효능이 입증되어 오고 있는 기능성 유익활성미생물제제를 기본으로 한 제품입니다.','미국 FDA에서 효능과 안정성이 입증된 기능성 유익균, 생체기능 활성화를 통한 각종 질병예방 및 면역력 증강 효과','2022-12-11 09:30:00',11,3.9),(18,'M&C 헬시 바이트 헤어볼 레미디 영양제 65g',23,'Y',3800,'건강관리','./img/mnc.jpg','./img/mnc_info.jpg','M&C 헬시 바이트 헤어볼 리메디 영양제는 헤어볼 제거 및 예방에 도움을 주는 기능성 건강보조 식품입니다. 간식이 아닌 기능성 영양제입니다.','헤어볼 제거와 예방 및 소화기능 강화, 오메가 3와 오메가 6 지방산 성분 함유','2022-10-11 09:30:00',13,3.2),(19,'구루머스 천연 두부모래 오리지날 7L',11,'Y',5000,'모래','./groomers.jpg','./groomers_info.jpg','모래의 색소가 반려묘의 털에 이염될 수 있으나 식용색소를 사용하기에 반려묘에게 무해합니다. 유통 과정 중 진공 압축 풀림이 발생할 수 있으나, 이는 품질의 이상이 아니므로 해당 사유로 인한 교환 및 반품이 불가능한 점 참고 부탁드립니다.','완두섬유를 사용한 친환경 두부모래, 인체에 무해한 100% 식품 재료 사용','2022-10-13 09:30:00',21,3.4),(20,'캣토리 모래 무향 15L',13,'Y',8500,'모래','./img/cattory.jpg','./img/cattory_info.jpg','캣토리 모래 무향은 가장 품질 좋은 100% 천연 벤토나이트만 엄선하여 고양이 화장실 전용 모래만 생산하는 첨단 설비 공장에서 원료를 만들었습니다.','100% 천연 벤토나이트를 엄선한 모래, 특화된 기술로 먼지와 분진 제거','2022-09-11 09:30:00',14,3.7),(21,'벅시캣 모래 7.26kg',9,'Y',19000,'모래','./img/boxiecat.jpg','./img/boxiecat_info.jpg','벅시캣 모래는 미국 소비자 만족도 1위로 각종 언론사 워싱턴 포스트, 뉴스투데이, 동물보호소, 수의사들이 권장하며, 미국내 반려동물 잡지중 가장 영향력있는 CATFANCY에서 품질, 독창성, 안전기능, 혁신성 및 소비자들의 욕구를 충족시키는 가장 우수한 고양이 화장실 제품으로 선정되어 에디터 초이스상을 수상했습니다.','천연 광물인 프리미엄 소듐 벤토나이트 사용, 강력한 응고력으로 청소가 용이','2021-10-11 09:30:00',22,3.1),(22,'캐티맨 날아올라 헬리콥터',11,'Y',2300,'장난감','./img/cattyman.jpg','./img/cattyman_info.jpg','캐티맨 날아올라 헬리콥터는 고양이와 함께 액션놀이를 할 수 있는 제품입니다.','고양이와 함께 액션놀이를 할 수 있는 상품, 팽이 또는 헬리콥터 형식의 두 가지 방법으로 사용 가능','2022-10-11 09:30:00',3,4.5),(23,'냥냥이 롤링 캣닢볼 15g',13,'Y',2600,'장난감','./img/catleaf.jpg','./img/catleaf_.jpg','냥냥이 롤링 캣닢볼은 벽에 붙여 사용하는 캣닢입니다.','벽에 붙여 쓸 수 있는 롤링 캣닢볼, 캣닢을 뭉쳐서 만든 형태로 가루없이 사용 가능','2022-10-11 09:30:00',5,4.9),(24,'캐티맨 카샤카샤 낚싯대 꿀벌',15,'Y',2800,'장난감','./img/cashacasha.jpg','./img/cashacasha_info.jpg','캐티맨 카샤카샤 붕붕 낚싯대 꿀벌은 특유의 필름 소리와 반짝임으로, 고양이들이 정말 좋아하는 카샤카샤 시리즈의 베스트셀러 입니다.','카샤카샤 시리즈의 베스트셀러, 고양이에게 호기심을 갖게 하는 특유의 필름소리','2022-10-11 09:30:00',7,4.6),(25,'유로펫 베르니나 스프래시 캐리어 그린 ML',0,'N',32000,'이동장','./img/europet.jpg','./img/europet_info.jpg','유로펫 베르니나 스프래시 캐리어는 양 옆 각각 두개와 뒷쪽까지 총 5개의 클립으로 상하부를 연결하여 견고함을 자랑합니다.','편리한 2개의 입구, 어깨끈을 걸 수 있는 고리 장착','2022-12-21 13:30:00',11,4.8),(26,'퓨리테일 글램핑 백팩 이동장',31,'Y',39800,'이동장','./img/furrytail.jpg','./img/furrytail_info.jpg','퓨리테일 글램핑 백팩 이동장은 넉넉한 수납 공간이 갖춰진 백팩형 이동 가방입니다. 미니파우치는 추가 상품으로 구매가 가능하며, 간식과 배변봉투 등 보관이 가능합니다.','넉넉한 수납 공간의 백팩형 이동 가방, 부피를 3분의 1로 줄일 수 있어 수납 용이','2021-11-21 13:30:00',9,3.9),(27,'해피파우 러블리 플러스 숄더백 베이지',15,'Y',43000,'이동장','./img/happypaw.jpg','./img/happypaw_info.jpg','해피포우 러블리 숄더백은 가볍고 예쁘고 실용적인 펫 캐리어입니다. 지퍼로 분리가 가능하므로 이물질 제거와 청소가 편리하며, 가볍고 힘이 덜드는 소프트한 소재입니다.','가볍고 패션가방처럼 연출되는 실용적인 캐리어, 가볍고 부드러운 소프트 소재로 피부자극 최소화','2021-10-21 15:30:00',11,4.1),(28,'캣 그루밍 제로 티슈 30매',41,'Y',3000,'미용/목욕','./img/grooming.jpg','./img/grooming_info.jpg','캣 그루밍 제로 티슈는 연약한 고양이의 피부를 위한 고양이 전용 프리미엄 물티슈 입니다.','그루밍을 해도 안심할 수 있는 무향, 무독성 물티슈, 콜로이드 실버 함유로 천연살균 항균 99.9%','2022-10-21 15:30:00',3,4.5),(29,'트루터치 글러브',11,'Y',3000,'미용/목욕','./img/truetouch.jpg','./img/truetouch_info.jpg','트루터치 글러브는 장갑모양의 브러쉬로 손을 끼워서 편리하게 빗질이 가능한 상품입니다.','장갑모양의 브러쉬로 편리하게 브러싱 가능, 아프고 거친 브러쉬가 아닌 실리콘 재질','2022-11-19 15:30:00',6,4.3),(30,'케어펫 사랑빗 E1',8,'Y',26000,'미용/목욕','./img/carepet.jpg','./img/carepet_info.jpg','케어펫 사랑빗의 빗살은 털이 부드러운 대부분의 단모 고양이가 사용가능합니다.','고탄력의 빗살구조 및 인체공학적인 손잡이, 조개껍질 모양의 깜찍한 디자인','2022-09-22 15:30:00',11,4.6),(31,'럽펍캣 슈슈 식기 핑크',13,'Y',11000,'급식기/급수기','./img/luvcat.jpg','./img/luvcat_info.jpg','럽펍캣 슈슈 식기는 밥그릇과 물그릇으로 모두 활용이 가능한 도자기 식기입니다.','높이감과 무게감으로 편안한 식사자세가 가능한 식기, 고급스럽고 위생적인 도자기 소재','2022-09-22 15:30:00',2,4.7),(32,'래핑찰리 헬시스쿱',21,'Y',13800,'급식기/급수기','./img/scoop.jpg','./img/scoop_info.jpg','래핑찰리 헬시스쿱은 정확한 사료량을 측정할 수 있는 계랑스쿱입니다.','정확한 사료량을 측정할 수 있는 계량스쿱, 유해물질 걱정없이 안전하여 안심하고 사용','2022-02-11 14:50:55',7,4.4),(33,'에코펫위드 자동 정수기 필터 6개입',3,'Y',12000,'급식기/급수기','./img/ecopet.jpg','./img/ecopet_info.jpg','에코펫위드 자동 정수기 필터 6개입은 에코펫위드 정수기 전용 필터입니다.','1.8L 용량의 에코펫위드 정수기 전용 필터, 코코넛껍질 활성탄으로 깨끗한 정수 효과','2022-02-11 14:50:55',2,4.2),(34,'도트캣 밀크 스크래쳐 하우스 흰우유',20,'Y',6800,'하우스','./img/milkhouse.jpg','./img/milkhouse_info.jpg','도트캣 밀크 스크래쳐 하우스는 넉넉한 크기의 밀크 스크래쳐 하우스입니다.','넉넉한 크기의 밀크 스크래쳐 하우스, 아늑한 공간으로 편안한 휴식 공간 제공','2022-02-11 14:50:55',4,4.1),(35,'키트니 코튼 바스켓 화이트',13,'Y',27000,'하우스','./img/cotton.jpg','./img/cotton_info.jpg','키트니 코튼 바스켓은 탄탄한 짜임의 핸드메이드 코튼 바스켓입니다.','탄탄한 짜임의 핸드메이드 코튼 바스켓, 원형 구조로 아늑하고 편안한 공간 제공','2022-02-11 14:50:55',6,3.9);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `review_text` varchar(500) NOT NULL COMMENT '리뷰 내용',
  `review_photo` varchar(500) DEFAULT NULL COMMENT '리뷰 사진',
  `stars` int NOT NULL COMMENT '평점',
  `write_date` datetime NOT NULL COMMENT '작성 날짜',
  `order_id` int NOT NULL COMMENT '구매 일련번호',
  PRIMARY KEY (`review_id`),
  KEY `fk_review_order_id` (`order_id`),
  CONSTRAINT `fk_review_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'코난이랑 모카가 서로 먹겠다고 싸워요~ 인기만점^^*',NULL,5,'2022-02-11 14:50:55',1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-11 14:56:15
