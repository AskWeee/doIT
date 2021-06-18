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

        // let t = "TadKpiSchema_" + Math.floor(Math.random()*100000);
        // this.key = t;
        // this.title = t;
        // this.children = [];
    }

    init() {
        this.id = -1;
        this.schema_id = "";
        this.schemaIdA1 = -99999;
        this.schemaIdA2 = -99999;
        this.schemaIdB1 = -99999;
        this.schemaIdB2 = -99999;
        this.schema_zhname = "指标组名称";
        this.schema_vendor_id = -1;
        this.schema_object_class = -1;
        this.schema_sub_class = -1;
        this.schema_interval_flag = -1;
        this.schema_counter_tab_name = "COUNTER表名称";
        // this.kpi_id = "";
        // this.kpi_zhname = "指标中文名称";
        // this.kpi_enname = "指标英文名称";
        // this.kpi_exp = "指标计算表达式";
        // this.kpi_alarm = 1; // 默认告警
        // this.kpi_format = 1; // 默认格式R2
        // this.kpi_min_value = "最小值";
        // this.kpi_max_value = "最大值";
        // this.kpi_used_product = -1;
        // this.kpi_used_module = -1;
        // this.kpi_used_title = "界面呈现标题";
    }
}
