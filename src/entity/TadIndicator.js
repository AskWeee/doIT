export default class TadIndicator{

    constructor() {
        this.id = null;
        this.excel_name = null;
        this.excel_sheet_name = null;

        this.indicator_object_class = null; // 非必填 设备类型,网元类型
        this.indicator_datasource = null;   // 非必填 指标来源,字段：VoLTE引入指标=是
        this.indicator_level = null;        // 非必填 指标分级
        this.indicator_code = null;         // 非必填 指标编码
        this.indicator_zhname = null;       // 必填 指标名称
        this.indicator_enname = null;       // 必填 英文名称
        this.indicator_desc = null;         // 非必填 业务需求
        this.indicator_definition = null;   // 必填 指标定义
        this.indicator_zhexp = null;        // 必填 中文映射算法
        this.indicator_enexp = null;        // 必填 英文映射算法
        this.indicator_unit = null;         // 必填 单位
        this.indicator_geo_type = null;     // 必填 空间粒度
        this.indicator_time_type = null;    // 必填 时间粒度
        this.indicator_memo = null;         // 非必填 备注

        this.kpi_tab_name = null;           // 非必填 KPI表
        this.kpi_zhname = null;             // 非必填 KPI指标名称
        this.kpi_enname = null;             // 非必填 KPI_DB映射,KPI指标
        this.kpi_exp = null;                // 非必填 DB映射算法,KPI映射算法
        this.kpi_exp_desc = null;           // 非必填 DB映射备注
        this.kpi_index = null;              // 非必填 自动编号
        this.kpi_value_format = null;       // 非必填 KPI数据格式
        this.kpi_value_min = null;          // 非必填 KPI最小值
        this.kpi_value_max = null;          // 非必填 KPI最大值

        this.import_time = null;
        this.import_desc = null;
    }
}
