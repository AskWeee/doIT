create table tad_db_col_type
(
    db_id            int          null,
    column_type      varchar(32)  null,
    column_type_name varchar(256) null
);

create table tad_db_connection_info
(
    db_host     varchar(64) null,
    db_port     varchar(64) null,
    db_sid      varchar(64) null,
    db_username varchar(64) null,
    db_password varchar(64) null
);

create table tad_db_partition
(
    db_id          int          null,
    partition_type varchar(64)  null,
    partition_sql  varchar(256) null
);

create table tad_db_type_info
(
    db_id   int          null,
    db_name varchar(256) null
);

create table tad_db_user
(
    user_id         int           null,
    product_line_id int           null,
    user_name       varchar(256)  null,
    user_desc       varchar(1024) null
);

create table tad_label_info
(
    label_id   int           null,
    label_name varchar(256)  null,
    label_desc varchar(1024) null
);

create table tad_module_info
(
    module_id     int           not null
        primary key,
    module_name   varchar(256)  null,
    product_id    int           null,
    module_desc   varchar(1024) null,
    module_leader varchar(64)   null
);

create table tad_partition_info
(
    partition_type varchar(64)  null,
    partition_name varchar(256) null
);

create table tad_product_info
(
    product_id          int           not null
        primary key,
    product_name        varchar(256)  null,
    product_desc        varchar(1024) null,
    product_create_time datetime      null
);

create table tad_product_line_info
(
    product_line_id   int           not null
        primary key,
    product_line_name varchar(256)  null,
    product_line_desc varchar(1024) null
);

create table tad_product_manager_info
(
    product_manager_id   int         not null
        primary key,
    product_manager_name varchar(64) null,
    tel_no               varchar(16) null,
    email_addr           varchar(64) null,
    work_addr            varchar(64) null
);

create table tad_product_rel
(
    product_id         int not null
        primary key,
    product_manager_id int null,
    product_line_id    int null
);

create table tad_product_version_info
(
    product_id          int           not null
        primary key,
    version_id          int           null,
    version_name        varchar(256)  null,
    version_desc        varchar(1024) null,
    version_create_time datetime      null
);

create table tad_publish_db_partition
(
    db_id          int          null,
    partition_type varchar(64)  null,
    partition_sql  varchar(256) null
);

create table tad_publish_index_column
(
    table_name  varchar(32) null,
    index_name  varchar(32) null,
    column_name varchar(32) null
);

create table tad_publish_info
(
    publish_id   int      null,
    user_id      int      null,
    publish_time datetime null
);

create table tad_publish_table
(
    table_name       varchar(32)   null,
    table_desc       varchar(1024) null,
    partition_type   varchar(64)   null,
    db_user_id       int           null,
    module_id        int           null,
    table_type       varchar(64)   null,
    label_id         int           null,
    partition_column varchar(64)   null,
    create_time      datetime      null,
    modify_time      datetime      null,
    user_id          int           null
);

create table tad_publish_table_column
(
    table_name    varchar(32) null,
    column_id     int         null,
    column_type   varchar(64) null,
    data_length   int         null,
    primary_flag  int         null,
    is_null       varchar(64) null,
    split_flag    varchar(64) null,
    repeat_flag   varchar(64) null,
    default_value varchar(64) null
);

create table tad_publish_table_index
(
    table_name varchar(32) null,
    index_name varchar(32) null,
    index_type varchar(64) null
);

create table tad_table
(
    table_name       varchar(32)   null,
    table_desc       varchar(1024) null,
    partition_type   varchar(64)   null,
    db_user_id       int           null,
    module_id        int           null,
    table_type       varchar(64)   null,
    label_id         int           null,
    partition_column varchar(64)   null,
    create_time      datetime      null,
    modify_time      datetime      null,
    user_id          int           null
);

create table tad_table_column
(
    table_name    varchar(32) null,
    column_id     int         null,
    column_type   varchar(64) null,
    data_length   int         null,
    primary_flag  int         null,
    is_null       varchar(64) null,
    split_flag    varchar(64) null,
    repeat_flag   varchar(64) null,
    default_value varchar(64) null
);

create table tad_table_index
(
    table_name varchar(32) null,
    index_name varchar(32) null,
    index_type varchar(64) null
);

create table tad_table_index_column
(
    table_name  varchar(32) null,
    index_name  varchar(32) null,
    column_name varchar(32) null
);

create table tad_table_rel
(
    rel_id        int           null,
    s_db_user_id  int           null,
    s_table_name  varchar(32)   null,
    s_column_name varchar(32)   null,
    a_db_user_id  int           null,
    a_table_name  varchar(32)   null,
    a_column_name varchar(32)   null,
    data_flow     int           null,
    rel_type      int           null,
    rel_desc      varchar(1024) null
);

