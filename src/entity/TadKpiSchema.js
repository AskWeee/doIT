export default class TadKpiSchema {

    constructor() {
        this.id = null;
        this.schema_id = null;
        this.schema_ns = null;
        this.schema_zhname = null;
        this.schema_enname = null;
        this.schema_desc = null;
        this.tab_name = null;
        this.vendor_id = null;
        this.object_class = null;
        this.sub_class = null;
        this.disp_order = null;
        this.enable_flag = null;
        this.cauculate_flag = null;
        this.sum_type = null;
        this.module_wr_flag = null;
        this.data_source_flag = null;
        this.query_datasource = null;
        this.interval_flag = null;
        this.used_type = null;
        this.with_mo = null;
        this.filter_where = null;
        this.task_flag = null;
        this.counter_tab_name = null;

        this.kpis = [];
        this.counters = [];
        this.kpis2 = [];
        this.counters2 = [];

        this.schemaIdA1 = null;
        this.schemaIdA2 = null;
        this.schemaIdB1 = null;
        this.schemaIdB2 = null;
    }

    init() {
        this.id = -1;
        this.schema_id = "";
        this.schemaIdA1 = -99999;
        this.schemaIdA2 = -99999;
        this.schemaIdB1 = -99999;
        this.schemaIdB2 = -99999;
        this.schema_zhname = "指标组名称";
        this.vendor_id = -99999;
        this.object_class = -99999;
        this.sub_class = -99999;
        this.interval_flag = -99999;
        this.counter_tab_name = "COUNTER表名称";
    }
}
