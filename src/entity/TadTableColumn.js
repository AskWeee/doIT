export default class TadTableColumn {
  column_id;
  table_id;
  column_name;
  column_desc;
  column_type_id;
  data_length;
  default_value;
  is_null;
  primary_flag;
  split_flag;
  repeat_flag;


  constructor() {
    this.column_id = null;
    this.table_id = null;
    this.column_name = null;
    this.column_desc = null;
    this.column_type_id = null;
    this.data_length = null;
    this.default_value = null;
    this.is_null = null;
    this.primary_flag = null;
    this.split_flag = null;
    this.repeat_flag = null;
  }
}

