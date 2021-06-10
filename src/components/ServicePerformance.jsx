import React, {Fragment} from 'react'
import './ServicePerformance.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {message, Button, Tree, Input, Table, Select} from 'antd'
import {
    CaretDownOutlined,
    CaretLeftOutlined,
    CaretRightOutlined,
    PlusSquareOutlined,
    CopyOutlined,
    MinusSquareOutlined,
    EllipsisOutlined,
    CloudDownloadOutlined,
    CaretUpOutlined,
    BranchesOutlined,
    CloudUploadOutlined,
    PlusOutlined,
    UndoOutlined,
    SaveOutlined,
} from '@ant-design/icons'
import Mock from 'mockjs'
import TadDbConnection from "../entity/TadDbConnection";
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";
import XLSX from 'xlsx';
import TadIndicator from "../entity/TadIndicator";

const {Option} = Select;
const {TextArea} = Input;

export default class ServicePerformance extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {};
    refBoxDetail = React.createRef();
    gIndex = 10000;

    constructor(props) {
        super(props);

        this.state = {
            styleLayout: "NNN",
            styleLayoutUpDown: "NN",
            treeDataKpiSchemas: [],
            pageSizeIndicators: 50,
            treeDataKpis: [],
            treeDataKpiCounters: [],
            dsIndicators: [],
            selected: {
                schema_id: "",
                schema_zhname: "请输入指标组名称",
                schema_vendor_id: -1,
                schema_object_class: -1,
                schema_sub_class: -1,
                schema_interval_flag: -1,
                schema_counter_tab_name: "请输入COUNTER表名称",
                kpi_id: "",
                kpi_zhname: "请输入指标中文名称",
                kpi_enname: "请输入指标英文名称",
                kpi_exp: "请输入指标计算表达式",
                kpi_alarm: 1, // 默认告警
                kpi_format: 1, // 默认格式R2
                kpi_min_value: "请输入最小值",
                kpi_max_value: "请输入最大值",
                kpi_used_product: -1,
                kpi_used_module: -1,
                kpi_used_title: "请输入界面呈现标题",
            },
            tablePropertiesScrollY: 200,
        }

        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doInit = this.doInit.bind(this);
        this.doGetAll = this.doGetAll.bind(this);
        this.doGetKpis = this.doGetKpis.bind(this);
        this.doGetKpiSchemas = this.doGetKpiSchemas.bind(this);
        this.doGetIndicators = this.doGetIndicators.bind(this);
        this.doGetKpiCounters = this.doGetKpiCounters.bind(this);
        this.doGetExcel = this.doGetExcel.bind(this);

        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);
        this.onTreeKpisSelected = this.onTreeKpisSelected.bind(this);
        this.onTreeKpiSchemasChecked = this.onTreeKpiSchemasChecked.bind(this);
        this.onTreeKpisChecked = this.onTreeKpisChecked.bind(this);

        this.onButtonProductsChangeComponentSizeClicked = this.onButtonProductsChangeComponentSizeClicked.bind(this);
        this.onButtonChangeComponentLayoutUpDownClicked = this.onButtonChangeComponentLayoutUpDownClicked.bind(this);
        this.onButtonSchemasCopyPasteClicked = this.onButtonSchemasCopyPasteClicked.bind(this);
        this.onButtonKpisCopyPasteClicked = this.onButtonKpisCopyPasteClicked.bind(this);

        this.onInputSearchSchemaChange = this.onInputSearchSchemaChange.bind(this);
        this.onInputSearchKpiChange = this.onInputSearchKpiChange.bind(this);
    }

    test() {

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
        this.setState({
            tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 40,
        })
    }

    doGetAll() {
        axios.all([
            this.doGetKpis(),
            this.doGetKpiSchemas(),
            this.doGetKpiCounters(),
            this.doGetIndicators(),
        ]).then(axios.spread((
            kpis,
            schemas,
            counters,
            indicators) => {
            let mapSchemas = new Map();
            let mapKpis = new Map();
            let uiSchemas = [];

            this.gData.kpis = kpis.data.data;
            this.gData.schemas = schemas.data.data;
            this.gData.counters = counters.data.data;
            this.gData.indicators = indicators.data.data;

            let dsIndicators = [];
            let pageSizeIndicators = this.gData.indicators.length;
            this.gData.indicators.forEach((item) => {
                let indicator = new TadIndicator();
                indicator.indicator_code = item.indicator_code;
                indicator.indicator_name = item.indicator_name;
                indicator.counter_code = item.counter_code;
                indicator.counter_zhname = item.counter_zhname;
                indicator.counter_enname = item.counter_enname;

                dsIndicators.push(indicator);
            });

            this.setState({
                pageSizeIndicators: pageSizeIndicators,
                dsIndicators: dsIndicators
            })

            let n = 0;
            this.gData.schemas.forEach(function (item) {
                let schemaId = item.schema_id === null ? -1 : item.schema_id;
                let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

                if (schemaId !== -1 &&
                    schemaName !== "" &&
                    schemaName.length > 0 &&
                    schemaName[0] !== "?" &&
                    schemaName[schemaName.length - 1] !== "?") {

                    if (!mapSchemas.has(schemaId)) {
                        let mySchema = item;

                        mySchema.kpis = [];
                        mapSchemas.set(schemaId, mySchema)

                        n++;
                        let uiSchema = {
                            key: n + "_" + mySchema.schema_id,
                            title: n + " - " + mySchema.schema_id + "-" + mySchema.schema_zhname,
                            children: []
                        }
                        uiSchemas.push(uiSchema);
                    }
                }
            });

            this.gData.kpis.forEach(function (item) {
                let kpiId = item.kpi_id === null ? -1 : item.kpi_id;
                let kpiName = item.kpi_zhname === null ? "" : item.kpi_zhname;

                if (kpiId !== -1 &&
                    kpiName !== "" &&
                    kpiName.length > 0 &&
                    kpiName[0] !== "?" &&
                    kpiName[kpiName.length - 1] !== "?") {

                    let myKpi = item;

                    if (!mapKpis.has(kpiId)) {
                        mapKpis.set(kpiId, myKpi);
                    }

                    if (mapSchemas.has(item.schema_id)) {
                        mapSchemas.get(item.schema_id).kpis.push(myKpi)
                    }
                }
            });

            this.gMap.schemas = mapSchemas;
            this.gMap.kpis = mapKpis;

            this.setState({
                treeDataKpiSchemas: uiSchemas
            })
        })).then(() => {
            this.doInit();
        });
    }

    doGetKpisOracle() {
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

    doGetKpis() {
        let params = new TadKpi();

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpis", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetKpiSchemas() {
        let params = new TadKpiSchema();

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_schemas", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetKpiCounters() {
        let params = new TadKpiSchema();

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_counters", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetIndicators() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_indicators", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetExcel() {
        axios.get('data/counter_001.xlsx', {responseType: 'arraybuffer'}).then(res => {
            let wb = XLSX.read(res.data, {type: 'array'});
            let range = XLSX.utils.decode_range(wb.Sheets[wb.SheetNames[2]]['!ref']);
            let lastIndicator = new TadIndicator();

            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                let myIndicator = new TadIndicator();
                myIndicator.indicator_code = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 0, r: R})]);
                myIndicator.indicator_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 1, r: R})]);
                myIndicator.indicator_desc = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 2, r: R})]);
                myIndicator.indicator_definition = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 3, r: R})]);
                myIndicator.counter_code = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 4, r: R})]);
                myIndicator.counter_enname = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 5, r: R})]);
                myIndicator.counter_zhname = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 6, r: R})]);
                myIndicator.real_tab_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 7, r: R})]);
                myIndicator.real_tab_col_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 8, r: R})]);
                myIndicator.counter_time_type = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 9, r: R})]);
                myIndicator.counter_geo_type = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 10, r: R})]);
                myIndicator.counter_tab_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 11, r: R})]);
                myIndicator.kpi_tab_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 12, r: R})]);
                myIndicator.kpi_tab_col_name = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 14, r: R})]);
                myIndicator.kpi_exp = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 15, r: R})]);
                myIndicator.kpi_exp_desc = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 16, r: R})]);
                myIndicator.counter_zhexp = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 17, r: R})]);
                myIndicator.counter_enexp = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 18, r: R})]);
                myIndicator.counter_unit = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 19, r: R})]);
                myIndicator.counter_geo = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 20, r: R})]);
                myIndicator.counter_time = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 21, r: R})]);
                myIndicator.counter_desc = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 22, r: R})]);
                myIndicator.kpi_index = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 23, r: R})]);
                myIndicator.kpi_value_format = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 24, r: R})]);
                // myIndicator.kpi_value_min = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c:22, r:R})]);
                myIndicator.kpi_value_max = this.toCellValue(wb.Sheets[wb.SheetNames[2]][XLSX.utils.encode_cell({c: 25, r: R})]);

                if (myIndicator.indicator_code !== null) lastIndicator.indicator_code = myIndicator.indicator_code; else myIndicator.indicator_code = lastIndicator.indicator_code;
                if (myIndicator.indicator_name !== null) lastIndicator.indicator_name = myIndicator.indicator_name; else myIndicator.indicator_name = lastIndicator.indicator_name;
                if (myIndicator.indicator_desc !== null) lastIndicator.indicator_desc = myIndicator.indicator_desc; else myIndicator.indicator_desc = lastIndicator.indicator_desc;
                if (myIndicator.indicator_definition !== null) lastIndicator.indicator_definition = myIndicator.indicator_definition; else myIndicator.indicator_definition = lastIndicator.indicator_definition;
                if (myIndicator.counter_zhexp !== null) lastIndicator.counter_zhexp = myIndicator.counter_zhexp; else myIndicator.counter_zhexp = lastIndicator.counter_zhexp;
                if (myIndicator.counter_enexp !== null) lastIndicator.counter_enexp = myIndicator.counter_enexp; else myIndicator.counter_enexp = lastIndicator.counter_enexp;
                if (myIndicator.counter_unit !== null) lastIndicator.counter_unit = myIndicator.counter_unit; else myIndicator.counter_unit = lastIndicator.counter_unit;
                if (myIndicator.counter_geo !== null) lastIndicator.counter_geo = myIndicator.counter_geo; else myIndicator.counter_geo = lastIndicator.counter_geo;
                if (myIndicator.counter_time !== null) lastIndicator.counter_time = myIndicator.counter_time; else myIndicator.counter_time = lastIndicator.counter_time;
                if (myIndicator.counter_desc !== null) lastIndicator.counter_desc = myIndicator.counter_desc; else myIndicator.counter_desc = lastIndicator.counter_desc;

                axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_indicator",
                    myIndicator,
                    {headers: {'Content-Type': 'application/json'}}
                ).then((response) => {
                    let data = response.data;

                    if (data.success) {
                        message.info("成功导入指标：" + data.data.indicator_name);
                    }
                });
            }
        })

    }

    toCellValue(cell) {
        let myValue = null;

        if (cell && cell.t) myValue = XLSX.utils.format_cell(cell);

        return myValue;
    }

    // ****************************************************************************************************
    // show or hide...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // TREE...
    // ****************************************************************************************************

    onTreeKpiSchemasSelected(selectedKeys, info) {

        if (info.selected) {
            let schemaId = parseInt(selectedKeys[0].split("_")[1]);
            let schema;
            // let schemaName = "";
            // let vendorId = -1;
            // let objectClass = -1;
            // let subClass = -1;
            let uiKpis = [];
            let uiKpiCounters = [];

            if (this.gMap.schemas.has(schemaId)) {
                schema = this.gMap.schemas.get(schemaId);
                // schemaName = this.gMap.schemas.get(schemaId).schema_zhname;
                // vendorId = this.gMap.schemas.get(schemaId).vendor_id;
                // objectClass = this.gMap.schemas.get(schemaId).object_class;
                // subClass = this.gMap.schemas.get(schemaId).sub_class;

                schema.kpis.forEach((item) => {
                    let uiKpi = {
                        key: item.kpi_id,
                        title: item.kpi_id + " - " + item.kpi_zhname,
                        children: []
                    }
                    uiKpis.push(uiKpi);
                });

                this.gData.counters.forEach((item) => {
                    if (item.schema_id === schemaId) {
                        uiKpiCounters.push({
                            key: item.counter_enname,
                            title: item.counter_zhname + " - " + item.counter_enname,
                            children: []
                        })
                    }
                })
            }

            this.setState({
                treeDataKpis: uiKpis,
                treeDataKpiCounters: uiKpiCounters,
                selected: {
                    schema_id: schemaId, // 必填
                    schema_zhname: schema.schema_zhname, // 必填
                    schema_vendor_id: schema.vendor_id, // 默认 -1
                    schema_object_class: schema.object_class,  // 必填
                    schema_sub_class: schema.sub_class,  // 必填
                    schema_interval_flag: schema.interval_flag,  // 必填
                    schema_counter_tab_name: schema.counter_tab_name, // 必填
                    kpi_id: "",
                    kpi_zhname: "请输入指标中文名称",
                    kpi_enname: "请输入指标英文名称",
                    kpi_exp: "请输入指标计算表达式",
                    kpi_alarm: 1, // 默认告警
                    kpi_format: 1, // 默认格式R2
                    kpi_min_value: "请输入最小值",
                    kpi_max_value: "请输入最大值",
                    kpi_used_product: -1,
                    kpi_used_module: -1,
                    kpi_used_title: "请输入界面呈现标题",
                    // schema_used_type: schema.used_type, // ???
                    // kpi_used_type: -1, // ???
                    // schema.schema_ns 内部产生
                    // tab_name: schema.tab_name, // 内部产生
                    // kpi_field: "", // 内部产生
                    // schema.desc // 忽略
                    // schema.schema_enname
                    // schema.enable_flag
                    // schema.calculate_flag
                    // schema.sum_type
                    // schema.module_wr_flag
                    // schema.data_source_flag
                    // schema.query_datasource
                    // schema.with_mo
                    // schema.filter_where
                    // schema.task_flag
                    // kpi_used_type: -1, // 被用于某个产品-模块-名称
                    // kpi.disp_order: -1, // 忽略
                    // kpi.notes: "", // 忽略
                    // kpi.baseline:
                    // kpi.algorithm:
                    // kpi.isshow:
                    // kpi.baseline_flag:
                    // kpi.pecdata:
                    // kpi.automark:
                    // kpi.kpi_gradechg_type:
                    // kpi.divzerodefault:
                    // kpi.indicator_type:
                    // kpi.sv_cat_id:

                }
            })
        } else {
            this.setState({
                treeDataKpis: [],
                treeDataKpiCounters: [],
                selected: {
                    schema_id: "",
                    schema_zhname: "请输入指标组名称",
                    schema_vendor_id: -1,
                    schema_object_class: -1,
                    schema_sub_class: -1,
                    schema_interval_flag: -1,
                    schema_counter_tab_name: "请输入COUNTER表名称",
                    kpi_id: "",
                    kpi_zhname: "请输入指标中文名称",
                    kpi_enname: "请输入指标英文名称",
                    kpi_exp: "请输入指标计算表达式",
                    kpi_alarm: 1, // 默认告警
                    kpi_format: 1, // 默认格式R2
                    kpi_min_value: "请输入最小值",
                    kpi_max_value: "请输入最大值",
                    kpi_used_product: -1,
                    kpi_used_module: -1,
                    kpi_used_title: "请输入界面呈现标题",
                }
            })
        }


    };

    onTreeKpisSelected(selectedKeys, info) {
        if (info.selected) {
            let kpiId = selectedKeys[0];

            if (this.gMap.kpis.has(kpiId)) {
                let selected = JSON.parse(JSON.stringify(this.state.selected));
                let kpi = this.gMap.kpis.get(kpiId);

                selected.kpi_id = kpiId;
                selected.kpi_zhname = kpi.kpi_zhname;
                selected.kpi_enname = kpi.kpi_enname;
                selected.kpi_exp = kpi.kpi_exp;
                selected.kpi_alarm = kpi.kpi_alarm; // 默认告
                selected.kpi_format = kpi.kpi_format; // 默认格式R2
                selected.kpi_min_value = kpi.kpi_min_value;
                selected.kpi_max_value = kpi.kpi_max_value;
                selected.kpi_used_product = -1;
                selected.kpi_used_module = -1;
                selected.kpi_used_title = "请输入界面呈现标题";

                this.setState({
                    selected: selected
                })
            }
        } else {
            let selected = JSON.parse(JSON.stringify(this.state.selected));
            selected.kpi_id = "";
            selected.kpi_zhname = "请输入指标中文名称";
            selected.kpi_enname = "请输入指标英文名称";
            selected.kpi_exp = "请输入指标计算表达式";
            selected.kpi_alarm = 1;
            selected.kpi_format = 1;
            selected.kpi_min_value = "请输入最小值";
            selected.kpi_max_value = "请输入最大值";
            selected.kpi_used_product = -1;
            selected.kpi_used_module = -1;
            selected.kpi_used_title = "请输入界面呈现标题";

            this.setState({
                    selected: selected
                }
            )
        }
    }

    onTreeKpiSchemasChecked(checkedKeys, info) {
        this.gCurrent.schemasChecked = info.checkedNodes;
    }

    onTreeKpisChecked(checkedKeys, info) {
        this.gCurrent.kpisChecked = info.checkedNodes;
    }

    // ****************************************************************************************************
    // SELECT...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // CHECKBOX...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // BUTTON...
    // ****************************************************************************************************

    onButtonProductsChangeComponentSizeClicked(e) {

        let styleLayout = "NNN";

        if (this.state.styleLayout !== "SNN") styleLayout = "SNN";

        this.setState({
            styleLayout: styleLayout
        })
    }

    onButtonChangeComponentLayoutUpDownClicked(e) {

        let styleLayoutUpDown = "NN";

        if (this.state.styleLayoutUpDown !== "SN") styleLayoutUpDown = "SN";

        this.setState({
            styleLayoutUpDown: styleLayoutUpDown
        }, () => {
            this.setState({
                tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 40,
            })
        })
    }

    onButtonImportExcel() {

    }

    onButtonSchemasCopyPasteClicked(e) {
        let treeDataKpiSchemas = JSON.parse(JSON.stringify(this.state.treeDataKpiSchemas));

        let n = treeDataKpiSchemas.length;
        this.gCurrent.schemasChecked.forEach((itemSchema) => {
            let schemaId = itemSchema.key.split("_")[1];
            let ids = schemaId.split("260");
            let idObjectClassFirst = ids[0];
            let idFixed = "260";
            let idType = ids[1][0];
            let idTime = ids[1][1];
            let regionClass = "";
            let idObjectClassSecond = ids[1].substr(2, 2);
            let idIndex = ids[1].substr(4, 2);
            let objectClass = parseInt(idObjectClassFirst + idObjectClassSecond);
            if (((objectClass >= 50) && (objectClass <= 59)) || ((objectClass >= 50) && (objectClass <= 59)) || (objectClass === 99) || (objectClass === 199)) {
                regionClass = objectClass;
                objectClass = idIndex;
                idIndex = "";
            }
            let schemaIdNew = "";
            if (regionClass === "") {
                schemaIdNew = idObjectClassFirst + "260" + idType + "X" + idObjectClassSecond + idIndex;
            } else {
                schemaIdNew = idObjectClassFirst + "260" + idType + "X" + idObjectClassSecond + idIndex;
            }

            schemaId = parseInt(schemaId);

            let schema = this.gMap.schemas.get(schemaId);
            console.log("add schema...", idType, idTime, idObjectClassFirst + idObjectClassSecond, idIndex, schemaIdNew);
            n++;
            treeDataKpiSchemas.push({
                key: n + "_" + schemaId,
                title: n + " - " + schemaId + " - " + schema.schema_zhname + " - 副本",
                children: []
            })


            schema.kpis.forEach((kpi) => {
                console.log("add kpi...", kpi.kpi_id);
                // todo:: add kpi
            })
        });

        this.setState({
            treeDataKpiSchemas: treeDataKpiSchemas
        });
    }

    onButtonKpisCopyPasteClicked(e) {

    }

    // ****************************************************************************************************
    // TABLE ROW...
    // ****************************************************************************************************

    // ****************************************************************************************************
    // INPUT...
    // ****************************************************************************************************

    onInputSearchSchemaChange(e) {
        const {value} = e.target;

        let uiSchemas = [];
        let n = 0;
        this.gData.schemas.forEach(function (item) {
            let schemaId = item.schema_id === null ? -1 : item.schema_id;
            let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

            if (schemaId !== -1 &&
                schemaName !== "" &&
                schemaName.length > 0 &&
                schemaName[0] !== "?" &&
                schemaName[schemaName.length - 1] !== "?") {
                if ((schemaName.indexOf(value) >= 0) || (item.schema_id.toString().indexOf(value) >= 0)) {
                    n++;
                    let uiSchema = {
                        key: n + "_" + item.schema_id,
                        title: n + " - " + item.schema_id + "-" + item.schema_zhname,
                        children: []
                    }
                    uiSchemas.push(uiSchema);
                }
            }
        });

        this.setState({
            treeDataKpiSchemas: uiSchemas
        })
        // const expandedKeys = dataList
        //     .map(item => {
        //         if (item.title.indexOf(value) > -1) {
        //             return getParentKey(item.key, gData);
        //         }
        //         return null;
        //     })
        //     .filter((item, i, self) => item && self.indexOf(item) === i);
        // this.setState({
        //     searchValueSchemaName: value
        // });
    }

    onInputSearchKpiChange(e) {
        const {value} = e.target;

        let uiSchemas = [];
        let uiKpis = [];
        let n = 0;
        let setSchemas = new Set();

        if (value !== "") {
            this.gData.kpis.forEach(function (item) {
                let kpiId = item.kpi_id === null ? -1 : item.kpi_id;
                let kpiName = item.kpi_zhname === null ? "" : item.kpi_zhname;
                let schemaId = item.schema_id === null ? -1 : item.schema_id;
                // let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

                if (kpiId !== -1 &&
                    schemaId !== -1 &&
                    kpiName !== "" &&
                    kpiName.length > 0 &&
                    kpiName[0] !== "?" &&
                    kpiName[kpiName.length - 1] !== "?") {
                    if ((kpiName.indexOf(value) >= 0) || (kpiId.toString().indexOf(value) >= 0)) {
                        setSchemas.add(schemaId);
                        let uiKpi = {
                            key: kpiId,
                            title: kpiId + " - " + kpiName,
                            children: []
                        }
                        uiKpis.push(uiKpi);
                    }
                }
            });

            setSchemas.forEach((value, key) => {
                n++;
                if (this.gMap.schemas.has(key)) {
                    let schema = this.gMap.schemas.get(key);
                    let uiSchema = {
                        key: n + "_" + key,
                        title: n + " - " + schema.schema_id + "-" + schema.schema_zhname,
                        children: []
                    }
                    uiSchemas.push(uiSchema);
                }
            })
            this.setState({
                treeDataKpiSchemas: uiSchemas,
                treeDataKpis: uiKpis,
            })
        } else {
            this.gMap.schemas.forEach((value, key) => {
                n++;
                //let schema = this.gMap.schemas.get(key);
                let uiSchema = {
                    key: n + "_" + key,
                    title: n + " - " + value.schema_id + "-" + value.schema_zhname,
                    children: []
                }
                uiSchemas.push(uiSchema);
            })
            this.setState({
                treeDataKpiSchemas: uiSchemas,
                treeDataKpis: uiKpis,
            })

        }

        // const expandedKeys = dataList
        //     .map(item => {
        //         if (item.title.indexOf(value) > -1) {
        //             return getParentKey(item.key, gData);
        //         }
        //         return null;
        //     })
        //     .filter((item, i, self) => item && self.indexOf(item) === i);
        // this.setState({
        //     searchValueSchemaName: value
        // });
    }

    render() {
        const columnsIndicator = [
            {
                title: '指标名称',
                dataIndex: 'indicator_name',
                key: 'indicator_name',
            },
            {
                title: '统计数据中文名称',
                dataIndex: 'counter_zhname',
                key: 'counter_zhname',
            },
            {
                title: '统计数据英文名称',
                dataIndex: 'counter_enname',
                key: 'counter_enname',
            },
        ];

        return <Fragment>
            <div className={this.state.styleLayout === "NNN" ? "ServicePerformance BoxServicePerformanceNormal" : "ServicePerformance BoxServicePerformanceSmall"}>
                <div className={"BoxKpiSchemas"}>
                    <div className={"BoxTitleBar"}>
                        {this.state.styleLayout === "NNN" ? (
                            <Fragment>
                                <div className={"BoxTitle"}>指标组</div>
                                <div className={"BoxButtons"}>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<BranchesOutlined/>}>提交变更</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<PlusSquareOutlined/>}>新增</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<CopyOutlined/>}
                                        onClick={this.onButtonSchemasCopyPasteClicked}>复制</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<MinusSquareOutlined/>}>删除</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<CloudDownloadOutlined/>}>导出</Button>
                                </div>
                            </Fragment>) : (
                            <Fragment>
                                <div></div>
                                <div></div>
                            </Fragment>
                        )}
                        <div>
                            <Button
                                size={"small"}
                                type={"ghost"}
                                icon={this.state.styleLayout === "NNN" ? <CaretLeftOutlined/> : <CaretRightOutlined/>}
                                onClick={this.onButtonProductsChangeComponentSizeClicked}/>
                        </div>
                    </div>
                    {this.state.styleLayout === "NNN" ? (
                        <Fragment>
                            <div className={"BoxTree"}>
                                <Select defaultValue="-1">
                                    <Option value="-1">变更：全集</Option>
                                    <Option value="1">变更：K - 新增话务指标 - 2021-07-01</Option>
                                </Select>
                                <Input.Search className={"BoxSearch"} placeholder="Search" onChange={this.onInputSearchSchemaChange}/>
                                <div className={"BoxTreeInstance"}>
                                    <Tree
                                        checkable
                                        blockNode={true}
                                        showLine={{showLeafIcon: false}}
                                        showIcon={true}
                                        switcherIcon={<CaretDownOutlined/>}
                                        onSelect={this.onTreeKpiSchemasSelected}
                                        onCheck={this.onTreeKpiSchemasChecked}
                                        treeData={this.state.treeDataKpiSchemas}
                                    />
                                </div>
                            </div>
                        </Fragment>
                    ) : (<Fragment>
                            <div>&nbsp;</div>
                        </Fragment>
                    )}
                < /div>
                <div className={this.state.styleLayoutUpDown === "NN" ? "BoxKpiRelated BoxKpiRelatedNormal" : "BoxKpiRelated BoxKpiRelatedSmall"}>
                    <div className={"BoxKpisAndProperties"}>
                        <div className={this.state.styleLayoutUpDown === "NN" ? "BoxKpisAndCounterTab BoxKpisAndCounterTabNormal" : "BoxKpisAndCounterTab BoxKpisAndCounterTabSmall"}>
                            <div className={"BoxKpis"}>
                                <div className={"BoxTitleBar"}>
                                    <div className={"BoxTitle"}>指标</div>
                                    {(this.state.styleLayoutUpDown === "NN") ? (
                                        <Fragment>
                                            <div className={"BoxButtons"}>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<PlusSquareOutlined/>}>新增</Button>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<CopyOutlined/>}
                                                    onClick={this.onButtonKpisCopyPasteClicked}>复制</Button>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<MinusSquareOutlined/>}>删除</Button>
                                            </div>
                                        </Fragment>) : (<Fragment>
                                            <div>&nbsp;</div>
                                        </Fragment>
                                    )}
                                    <div>
                                        <Button size={"small"} type={"ghost"} icon={<EllipsisOutlined/>}/>
                                    </div>
                                </div>
                                {(this.state.styleLayoutUpDown === "NN") ? (
                                    <Fragment>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTree2"}>
                                                <Tree
                                                    checkable
                                                    blockNode={true}
                                                    showLine={{showLeafIcon: false}}
                                                    showIcon={true}
                                                    switcherIcon={<CaretDownOutlined/>}
                                                    onSelect={this.onTreeKpisSelected}
                                                    onCheck={this.onTreeKpisChecked}
                                                    treeData={this.state.treeDataKpis}
                                                /></div>
                                        </div>
                                    </Fragment>
                                ) : (<Fragment>
                                    <div>&nbsp;</div>
                                </Fragment>)}
                            </div>
                            {(this.state.styleLayoutUpDown === "NN") ? (
                                <Fragment>
                                    <div className={"BoxCounterTab"}>
                                        <div className={"BoxTitleBar"}>
                                            <div className={"BoxTitle"}>原始指标</div>
                                            <div className={"BoxButtons"}>
                                                {/*<Button*/}
                                                {/*    size={"small"}*/}
                                                {/*    type={"primary"}*/}
                                                {/*    icon={<SaveOutlined/>}>保存</Button>*/}
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<MinusSquareOutlined/>}>删除</Button>
                                            </div>
                                            <div>
                                                <Button size={"small"} type={"ghost"} icon={<EllipsisOutlined/>}/>
                                            </div>
                                        </div>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTree2"}>
                                                <Tree
                                                    checkable
                                                    blockNode={true}
                                                    showLine={{showLeafIcon: false}}
                                                    showIcon={true}
                                                    switcherIcon={<CaretDownOutlined/>}
                                                    onSelect={this.onTreeKpisSelected}
                                                    onCheck={this.onTreeKpisChecked}
                                                    treeData={this.state.treeDataKpiCounters}
                                                /></div>
                                        </div>
                                    </div>
                                </Fragment>
                            ) : (<Fragment>
                                <div>&nbsp;</div>
                            </Fragment>)}
                        </div>
                        <div className={"BoxPropertiesBorder"}>
                            <div className={"BoxTitleBar"}>
                                <div className={"BoxTitle"}>指标组属性 - {this.state.selected.schema_id}</div>
                                {(this.state.styleLayoutUpDown === "NN") ? (
                                    <Fragment>
                                        <div className={"BoxButtons"}>
                                            <Button
                                                size={"small"}
                                                type={"primary"}
                                                icon={<SaveOutlined/>}>保存</Button>
                                            <Button
                                                size={"small"}
                                                type={"primary"}
                                                icon={<UndoOutlined/>}>恢复</Button>
                                        </div>
                                    </Fragment>
                                ) : (<Fragment>
                                        <div>&nbsp;</div>
                                    </Fragment>
                                )}
                                <div>
                                    <Button
                                        size={"small"}
                                        type={"ghost"}
                                        icon={<EllipsisOutlined/>}/></div>
                            </div>
                            {(this.state.styleLayoutUpDown === "NN") ? (
                                <Fragment>
                                    <div className={"BoxPropertiesSchema"}>
                                        <div className={"BoxSchemaIds"}>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择分类</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择时间粒度</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择空间粒度</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择组网元类型</Option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Input value={this.state.selected.schema_zhname}/>
                                        </div>
                                        <div className={"BoxVendorObjectClass"}>
                                            <Select defaultValue="-1">
                                                <Option value="-1">不区分厂家</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择网元类型</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">请选择网元细分类型</Option>
                                            </Select>
                                            <Select defaultValue="-1">
                                                <Option value="-1">采集粒度</Option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Input value={this.state.selected.schema_counter_tab_name}/>
                                        </div>
                                    </div>
                                    <div className={"BoxTitleBar"}>
                                        <div className={"BoxTitle"}>指标属性 - {this.state.selected.kpi_id}</div>
                                        <div className={"BoxButtons"}>
                                            <Button
                                                size={"small"}
                                                type={"primary"}
                                                icon={<SaveOutlined/>}>保存</Button>
                                            <Button
                                                size={"small"}
                                                type={"primary"}
                                                icon={<UndoOutlined/>}>恢复</Button>
                                        </div>
                                        <div>
                                            <Button
                                                size={"small"}
                                                type={"ghost"}
                                                icon={<EllipsisOutlined/>}/></div>
                                    </div>
                                    <div className={"BoxPropertiesKpi"}>
                                        <div className={"BoxNames"}>
                                            <Input value={this.state.selected.kpi_zhname}/>
                                            <Input value={this.state.selected.kpi_enname}/>
                                        </div>
                                        <div className={"BoxKpiValues"}>
                                            <Select defaultValue="1">
                                                <Option value="0">不发告警</Option>
                                                <Option value="1">发送告警</Option>
                                            </Select>
                                            <Select defaultValue="1">
                                                <Option value="0">不指定格式</Option>
                                                <Option value="1">格式：R2</Option>
                                            </Select>
                                            <Input value={this.state.selected.kpi_min_value}/>
                                            <Input value={this.state.selected.kpi_max_value}/>
                                        </div>
                                        <div className={"BoxUsedInfo"}>
                                            <div className={"BoxProductModuleName"}>
                                                <Select defaultValue="-1">
                                                    <Option value="-1">请选择使用该指标的产品</Option>
                                                </Select>
                                                <Select defaultValue="-1">
                                                    <Option value="-1">请选择使用该指标的模块</Option>
                                                </Select>
                                                <Input value={this.state.selected.kpi_used_title}/>
                                                <Button icon={<PlusOutlined/>}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"BoxKpiExp"}>
                                        <TextArea autoSize={{minRows: 3, maxRows: 5}} value={this.state.selected.kpi_exp}/>
                                    </div>
                                </Fragment>
                            ) : (<Fragment>
                                <div>&nbsp;</div>
                            </Fragment>)}
                        </div>
                    </div>
                    <div className={"BoxKpisStandard"}>
                        <div className={"BoxTitleBar"}>
                            <div className={"BoxTitle"}>规范指标</div>
                            <div className={"BoxButtons"}>
                                <Button
                                    size={"small"}
                                    type={"primary"}
                                    icon={<CloudUploadOutlined/>}>移入指标组</Button>
                                <Button
                                    size={"small"}
                                    type={"primary"}
                                    icon={<CloudUploadOutlined/>}>导入</Button>
                                <Button
                                    size={"small"}
                                    type={"primary"}
                                    icon={<CloudDownloadOutlined/>}>导出</Button>
                            </div>
                            <div>
                                <Button
                                    size={"small"}
                                    type={"ghost"}
                                    icon={this.state.styleLayoutUpDown === "NN" ? <CaretUpOutlined/> : <CaretDownOutlined/>}
                                    onClick={this.onButtonChangeComponentLayoutUpDownClicked}/>
                            </div>
                        </div>
                        <div className={"BoxTableIndicators"}>
                            <Input.Search className={"BoxSearch"} placeholder="Search" onChange={this.onChange}/>
                            <div ref={this.refBoxDetail} className={"BoxAuto"}>
                                <Table
                                    dataSource={this.state.dsIndicators}
                                    columns={columnsIndicator}
                                    bordered={true}
                                    size={"small"}
                                    scroll={{
                                        // x: this.state.tablePropertiesScrollX,
                                        y: this.state.tablePropertiesScrollY
                                    }}
                                    pagination={{
                                        pageSize: this.state.pageSizeIndicators,
                                        position: ["none", "none"]
                                    }}
                                    // rowSelection={{
                                    //     type: "radio",
                                    //     ...this.onRowRelationSelected
                                    // }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    }
}
