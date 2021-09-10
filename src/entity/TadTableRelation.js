export default class TadTableRelation {

    constructor() {
        this.uuid = null;
        this.s_table_id = null;
        this.s_column_id = null;
        this.a_table_id = null;
        this.a_column_id = null;
        this.relation_type = "";
        this.relation_desc = "";

        this.s_db_user_id = null;
        this.a_db_user_id = null;
        this.data_flow = "";
    }
}
