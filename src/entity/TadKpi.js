export default class TadKpi{

    constructor() {
        this.kpi_id = null;
        this.schema_id = null;
        this.kpi_zhname = null;
        this.kpi_enname = null;
        this.kpi_field = null;
        this.kpi_exp = null;
        this.kpi_alarm = null;
        this.kpi_format = null;
        this.kpi_min_value = null;
        this.kpi_max_value = null;
        this.used_info = null;

        let t = "TadKpi_" + Math.floor(Math.random()*100000);
        this.key = t;
        this.title = t;
        this.children = [];
    }
}
