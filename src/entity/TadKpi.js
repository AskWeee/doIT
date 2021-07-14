export default class TadKpi{

    constructor() {
        this.id = null;
        this.sid = null;
        this.kpi_id = null;
        this.kpi_field = null;
        this.kpi_zhname = null;
        this.kpi_enname = null;
        this.kpi_alarm = null;
        this.kpi_format = null;
        this.kpi_min_value = null;
        this.kpi_max_value = null;
        this.kpi_exp = null;
        this.used_info = null;
        this.kpiUiTitles = [];
    }

    init() {
        this.id = -1;
        this.sid = -1;
        this.kpi_id = "";
        this.kpi_field = "";
        this.kpi_zhname = "指标中文名称";
        this.kpi_enname = "指标英文名称";
        this.kpi_alarm = 1; // 默认告警
        this.kpi_format = 1; // 默认格式R2
        this.kpi_min_value = "最小值";
        this.kpi_max_value = "最大值";
        this.kpi_exp = "指标计算表达式";
        this.used_info = "";
        this.kpiUiTitles = [];
    }
}
