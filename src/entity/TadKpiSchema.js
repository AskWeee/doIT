export default class TadKpiSchema{

    constructor() {
        this.schema_id = null;
        this.schema_zhname = null;
        this.schema_enname = null;
        this.schema_ns = null;
        this.counter_tab_name = null;
        this.tab_name = null;
        this.vendor_id = null;
        this.object_class = null;
        this.sub_class = null;
        this.interval_flag = null;
        this.used_type = null;

        this.kpis = [];

        let t = "TadKpiSchema_" + Math.floor(Math.random()*100000);
        this.key = t;
        this.title = t;
        this.children = [];

    }
}
