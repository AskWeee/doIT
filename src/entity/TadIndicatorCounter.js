export default class TadIndicatorCounter{

    constructor() {
        this.id = null;
        this.indicator_id = null;           // 必填

        this.counter_code = null;           // 非必填 统计数据编码,统计编码
        this.counter_zhname = null;         // 必填 统计数据中文名称
        this.counter_enname = null;         // 必填 统计数据英文名称
        this.base_tab_name = null;          // 非必填 主表
        this.base_tab_col_name = null;      // 非必填 DB映射,字段
        this.counter_time_type = null;      // 非必填 COUNTER时间汇总算法
        this.counter_geo_type = null;       // 非必填 COUNTER空间汇总算法
        this.counter_tab_name = null;       // 非必填 COUNTER表
        this.counter_tab_col_name = null;   // 非必填 COUNTER表对应字段

        this.import_time = null;
    }
}
