export default class TadTable{

  constructor() {
    this.table_id = null;
    this.table_name = null;
    this.table_desc = null;
    this.table_type_id = null;
    this.table_label_id = null;
    this.db_user_id = null;
    this.module_id = null;
    this.create_user_id = null;
    this.create_time = null;
    this.modify_user_id = null;
    this.modify_time = null;
    this.partition_type = null;
    this.partition_column = null;

    this.columns = [];
  }
}

