import React from "react";

const GCtx = React.createContext({
    author: '管理员',
    message: "message from global context",
    serviceIp: "10.50.12.5",
    servicePort: "8090",
    reactElementKey: 0,
    mapMenus: new Map(),
    gRefLine: React.createRef(),
    gRefDivToy: React.createRef(),
    isSubMenuEntered: false,
    menus: [
        {
            id: 'menu_database', label: '数据库管理', desc: '数据库管理', ref: null, children: [
                {id: 'menu_database_import', label: '库表结构及数据导入', desc: '库表结构及数据导入', ref: null},
                {id: 'menu_database_maintain', label: '库表结构及数据维护', desc: '库表结构及数据维护', ref: null},
                {id: 'menu_database_compare', label: '库表结构及数据对比', desc: '库表结构及数据对比', ref: null},
                {id: 'menu_database_export', label: '库表结构及数据导出', desc: '库表结构及数据导出', ref: null},
                {id: 'menu_divider', label: '', desc: '', ref: null},
                {id: 'menu_database_config', label: '基础信息配置管理', desc: '基础信息配置管理', ref: null},
                // {id: 'menu_database_data', label: '库表基础数据维护', desc: '库表基础数据维护', ref: null},
                // {id: 'menu_database_relation', label: '库表及字段关系维护', desc: '库表及字段关系维护', ref: null},
                // {id: 'menu_database_data_compare', label: '库表基础数据对比', desc: '库表基础数据对比', ref: null},
            ]
        },
        {
            id: 'menu_service', label: '服务管理', desc: '', ref: null, children: [
                {id: 'menu_service_performance', label: '性能指标服务管理', desc: '', ref: null},
                {id: 'menu_service_fault', label: '故障指标服务管理', desc: '', ref: null},
                {id: 'menu_service_resource', label: '资源指标服务管理', desc: '', ref: null},
                {id: 'menu_service_view', label: '视图指标服务管理', desc: '', ref: null}
            ]
        },
        {
            id: 'menu_lowcode', label: '低代码管理', desc: '', ref: null, children: [
                {id: 'menu_lowcode_single_table', label: '单表维护页面生成', desc: '', ref: null},
                {id: 'menu_lowcode_multi_table', label: '级联表维护页面生成', desc: '', ref: null},
                {id: 'menu_lowcode_report', label: '报表页面生成', desc: '', ref: null},
                {id: 'menu_lowcode_business_datasource', label: '业务组件数据源生成', desc: '', ref: null},
                {id: 'menu_lowcode_business_object', label: '业务对象维护页面生成', desc: '', ref: null},
                {id: 'menu_lowcode_component', label: '业务组件管理', desc: '', ref: null},
                {id: 'menu_lowcode_business', label: '业务对象管理', desc: '', ref: null},
                {id: 'menu_lowcode_dataflow', label: '数据处理逻辑管理', desc: '', ref: null}
            ]
        },
        {
            id: 'menu_operation', label: '运维管理', desc: '', ref: null, children: [
                {id: 'menu_operation_network', label: '网络拓扑发现', desc: '', ref: null},
                {id: 'menu_operation_disk', label: '主机磁盘空间专项监控', desc: '', ref: null},
                {id: 'menu_operation_kafka', label: 'Kafka专项监控', desc: '', ref: null},
                {id: 'menu_operation_system_fault', label: '故障系统业务数据专项监控', desc: '', ref: null},
            ]
        },
        {
            id: 'menu_help', label: '帮助', desc: '', ref: null, children: [
                {id: 'menu_help_guide', label: '系统使用指南', desc: '', ref: null},
                {id: 'menu_divider', label: '', desc: '', ref: null},
                {id: 'menu_help_about', label: '关于本系统', desc: '', ref: null}
            ]
        }],
    subMenus: [],
    getElementKey: () => {
        let key = this.reactElementKey++;
        return key.toString();
    },
    onMenuClicked: () => {
    },
    changeData: () => {
    },
    changeSubMenus: () => {
    },
    changeContentChildren: () => {
    },
    changeSubMenus2: () => {
    }
});

export default GCtx;

export class KMenu {
    id = '';
    label = '';
}

export class KSubMenu {
    id = '';
    label = '';
}

export class KDataSet {
    menus = [];
    jsxMenus = [];
}
