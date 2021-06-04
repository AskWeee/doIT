import React, {Fragment} from 'react'
import './ServicePerformance.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {Button, Select, Tree, Checkbox, Table, Input, Tabs} from 'antd'
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined} from '@ant-design/icons'
import Mock from 'mockjs'
import TadDbConnection from "../entity/TadDbConnection";
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";

const {TabPane} = Tabs;

export default class ServicePerformance extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {};

    constructor(props) {
        super(props);

        this.state = {
            styleLayout: "NNN",
            treeDataKpiSchemas: [],
            treeDataKpis: [],
        }

        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doInit = this.doInit.bind(this);
        this.doGetAll = this.doGetAll.bind(this);
        this.doGetKpis = this.doGetKpis.bind(this);

        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);
    }

    test(s) {
        console.log(s);
    }

    componentDidMount() {
        // this.doMock();
        this.doGetAll();
    }

    doMock() {
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_relations", {
            code: "200-200",
            success: true,
            "data": [{
                "product_rel_id": 1,
                "product_line_id": 1,
                "product_id": 1,
                "product_manager_id": 1
            }]
        });
    }

    doInit() {
    }

    doGetAll() {
        axios.all([
            this.doGetKpis()
        ]).then(axios.spread((
            kpis) => {
            let mapSchemas = new Map();
            let uiSchemas = [];

            this.gData.kpiSchemas = kpis.data.data;

            let n = 0;
            kpis.data.data[0].data.rows.forEach(function (item) {
                let schemaId = item[0] === null ? -1 : item[0];
                let schemaName = item[2] === null ? "" : item[2];

                if (schemaId !== -1 &&
                    schemaName !== "" &&
                    schemaName.length > 0 &&
                    schemaName[0] !== "?" &&
                    schemaName[schemaName.length - 1] !== "?") {

                    let myKpi = new TadKpi();
                    myKpi.kpi_id = item[10] === null ? -1 : item[10];
                    myKpi.schema_id = schemaId;
                    myKpi.kpi_zhname = item[11] === null ? "" : item[11];
                    myKpi.kpi_enname = item[12] === null ? "" : item[12];
                    myKpi.kpi_field = item[13] === null ? "" : item[13];
                    myKpi.kpi_exp = item[14] === null ? "" : item[14];
                    myKpi.kpi_alarm = item[15] === null ? "" : item[15];
                    myKpi.kpi_format = item[16] === null ? "" : item[16];
                    myKpi.kpi_min_value = item[17] === null ? "" : item[17];
                    myKpi.kpi_max_value = item[18] === null ? "" : item[18];

                    if (!mapSchemas.has(schemaId)) {
                        let mySchema = new TadKpiSchema();
                        mySchema.schema_id = schemaId;
                        mySchema.schema_ns = item[1] === null ? "" : item[1];
                        mySchema.schema_zhname = item[2] === null ? "" : item[2];
                        mySchema.schema_enname = item[3] === null ? "" : item[3];
                        mySchema.counter_tab_name = item[4] === null ? "" : item[4];
                        mySchema.tab_name = item[5] === null ? "" : item[5];
                        mySchema.vendor_id = item[6] === null ? "" : item[6];
                        mySchema.object_class = item[7] === null ? "" : item[7];
                        mySchema.sub_class = item[8] === null ? "" : item[8];
                        mySchema.interval_flag = item[9] === null ? "" : item[9];
                        if (myKpi.kpi_id !== -1) {
                            mySchema.kpis.push(myKpi);
                            mapSchemas.set(schemaId, mySchema)

                            n++;
                            let uiSchema = {
                                key: mySchema.schema_id,
                                title: n + " - " + mySchema.schema_zhname,
                                children: [
                                    // {key: mySchema.schema_id + "_schema_ns", title: mySchema.schema_ns, children: []},
                                    // {key: mySchema.schema_id + "_schema_enname", title: mySchema.schema_enname, children: []},
                                    // {
                                    //     key: mySchema.schema_id + "_tab_name",
                                    //     title: "kpi表：" + mySchema.tab_name,
                                    //     children: []
                                    // },
                                    // {
                                    //     key: mySchema.schema_id + "_counter_tab_name",
                                    //     title: "counter表：" + mySchema.counter_tab_name,
                                    //     children: []
                                    // },
                                    // {
                                    //     key: mySchema.schema_id + "_object_class",
                                    //     title: "网元类型：" + mySchema.object_class + " 细分类型：" + mySchema.sub_class,
                                    //     children: []
                                    // },
                                    // {
                                    //     key: mySchema.schema_id + "_vendor_id",
                                    //     title: "设备厂家：" + mySchema.vendor_id,
                                    //     children: []
                                    // },
                                    // {
                                    //     key: mySchema.schema_id + "_interval_flag",
                                    //     title: "采集粒度：" + mySchema.interval_flag,
                                    //     children: []
                                    // },
                                ]
                            }
                            uiSchemas.push(uiSchema);
                        }
                    } else {
                        mapSchemas.get(schemaId).kpis.push(myKpi);
                    }
                }
            });

            this.gMap.kpiSchemas = mapSchemas;

            this.setState({
                treeDataKpiSchemas: uiSchemas
            })

        })).then(() => {
            this.doInit();
        });
    }

    doGetKpis() {
        let params = new TadDbConnection();
        params.db_type = "oracle";
        params.db_host = "10.10.1.170";
        params.db_port = "1521";
        params.db_sid = "wnms";
        params.db_username = "nmosdb";
        params.db_password = "nmosoptr";

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpis", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    // ****************************************************************************************************
    // show or hide...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // TREE...
    // ****************************************************************************************************

    onTreeKpiSchemasSelected(selectedKeys, info) {

        if (info.selected) {
            let schemaId = selectedKeys[0];
            let uiKpis = [];

            if (this.gMap.kpiSchemas.has(schemaId)) {
                this.gMap.kpiSchemas.get(schemaId).kpis.forEach((item) => {
                    // myKpi.kpi_enname = item[12] === null ? "" : item[12];
                    // myKpi.kpi_field = item[13] === null ? "" : item[13];
                    let uiKpi = {
                        key: item.kpi_id,
                        title: item.kpi_id + " - " + item.kpi_zhname, // + "(" + item.kpi_alarm + ")",
                        children: [
                            // {
                            //     key: item.kpi_id + "_kpi_exp",
                            //     title: "数值运算：" + item.kpi_exp,
                            //     children: []
                            // },
                            // {
                            //     key: item.kpi_id + "_kpi_value",
                            //     title: "数据格式：" + item.kpi_format + " 最小值：" + item.kpi_min_value + " 最大值：" + item.kpi_max_value,
                            //     children: []
                            // },
                        ]
                    }
                    uiKpis.push(uiKpi);
                });
            }

            this.setState({
                treeDataKpis: uiKpis
            })
        } else {
            this.setState({
                treeDataKpis: []
            })
        }


    };

    // ****************************************************************************************************
    // SELECT...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // CHECKBOX...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // BUTTON...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // TABLE ROW...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // INPUT...
    // ****************************************************************************************************

    render() {
        return <Fragment>
            <div className={this.state.styleLayout === "NNN" ? "ServicePerformance BoxNormal" :
                this.state.styleLayout === "SNN" ? "ServicePerformance BoxSmall" :
                    this.state.styleLayout === "SSN" ? "ServicePerformance BoxSmallSmall" : "ServicePerformance BoxNormal"}>
                <div className={"BoxKpiSchemas"}>
                    <div className={"BoxTitleBar"}>
                        <Button
                            size={"small"}
                            type={"ghost"}
                            icon={this.state.styleLayout === "NNN" ? <CaretLeftOutlined/> : <CaretRightOutlined/>}
                            onClick={this.onButtonProductsChangeComponentSizeClicked}/>
                    </div>
                    {this.state.styleLayout === "NNN" ? (
                        <Fragment>
                            <div className={"BoxTree"}>
                                <Tree
                                    blockNode={true}
                                    showLine={{showLeafIcon: false}}
                                    showIcon={true}
                                    switcherIcon={<CaretDownOutlined/>}
                                    onSelect={this.onTreeKpiSchemasSelected}
                                    treeData={this.state.treeDataKpiSchemas}
                                />
                            </div>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <div>&nbsp;</div>
                            <div>&nbsp;</div>
                        </Fragment>
                    )}
                < /div>
                <div className={"BoxKpis"}>
                    <div className={"BoxTitleBar"}>
                        <Button
                            size={"small"}
                            type={"ghost"}
                            icon={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ?
                                <CaretLeftOutlined/> : <CaretRightOutlined/>}
                            onClick={this.onButtonTablesChangeComponentSizeClicked}/>
                    </div>
                    {(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? (
                        <Fragment>
                            <div className={"BoxTree"}>
                                <div className={"BoxTree2"}>
                                    <Tree
                                        blockNode={true}
                                        showLine={{showLeafIcon: false}}
                                        showIcon={true}
                                        switcherIcon={<CaretDownOutlined/>}
                                        // onSelect={this.onTreeTablesKnownSelected}
                                        treeData={this.state.treeDataKpis}
                                    /></div>
                            </div>
                        </Fragment>
                    ) : (<Fragment>
                        <div>&nbsp;</div>
                        <div>&nbsp;</div>
                        <div>&nbsp;</div>
                    </Fragment>)}
                </div>
                <div className={"BoxPropertiesBorder"}>
                    <div>
                        1 schema_name
                    </div>
                    <div>
                        2 vendor_id, object_class, sub_class
                    </div>
                    <div>
                        3 kpi_name：
                    </div>
                    <div>
                        4 字段数值运算：
                    </div>
                    <div>
                        5 kpi_format, kpi_min_value, kpi_max_value
                    </div>
                    <div>
                        6 real_table_name/table desc (column desc)/columns/...
                        提供模糊搜索！！！
                    </div>
                </div>
            </div>
        </Fragment>
    }
}
