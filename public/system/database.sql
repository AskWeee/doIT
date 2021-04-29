CREATE TABLE `tad_module_info` (
  `module_id` int NOT NULL,
  `module_name` varchar(256) DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `module_desc` varchar(1024) DEFAULT NULL,
  `module_leader` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`module_id`)
);

CREATE TABLE `tad_product_info` (
  `product_id` int NOT NULL,
  `product_name` varchar(256) DEFAULT NULL,
  `product_desc` varchar(1024) DEFAULT NULL,
  `product_create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`)
);

CREATE TABLE `tad_product_line_info` (
  `product_line_id` int NOT NULL,
  `product_line_name` varchar(256) DEFAULT NULL,
  `product_line_desc` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`product_line_id`)
);

CREATE TABLE `tad_product_manager_info` (
  `product_manager_id` int NOT NULL,
  `product_manager_name` varchar(64) DEFAULT NULL,
  `tel_no` varchar(16) DEFAULT NULL,
  `email_addr` varchar(64) DEFAULT NULL,
  `work_addr` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`product_manager_id`)
);

CREATE TABLE `tad_product_rel` (
  `product_id` int NOT NULL,
  `product_manager_id` int DEFAULT NULL,
  `product_line_id` int DEFAULT NULL,
  PRIMARY KEY (`product_id`)
);

CREATE TABLE `tad_product_version_info` (
  `product_id` int NOT NULL,
  `version_id` int DEFAULT NULL,
  `version_name` varchar(256) DEFAULT NULL,
  `version_desc` varchar(1024) DEFAULT NULL,
  `version_create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`)
);

insert into tad_product_info(product_id,product_name,product_desc,product_create_time) values(5,'测试系统','测试系统不能卡','2021-04-21 16:06:55')