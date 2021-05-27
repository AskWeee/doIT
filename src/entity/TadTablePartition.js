export default class TadTablePartition {

    constructor() {
        this.id = null;
        this.table_id = null;
        this.partition_type = "range";
        this.partition_column = null;
        this.partition_name = "新增分区";
        this.partition_operator = null;
        this.partition_expression = null;
        this.partition_tablespace = null;
        this.partition_desc = null;
    }
}
