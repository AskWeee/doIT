import React, {Fragment} from 'react'
import './ServicePerformance.scss'
import moment from 'moment';
import axios from "axios";
import lodash from "lodash";
import GCtx from "../GCtx";
import {Button, Input, Select, Table, Tree, Modal, Form, Tooltip} from 'antd'
import {
    BranchesOutlined,
    CaretDownOutlined,
    CaretLeftOutlined,
    CaretRightOutlined,
    CaretUpOutlined,
    CloudDownloadOutlined,
    CloudUploadOutlined,
    CopyOutlined,
    MinusSquareOutlined,
    PlusOutlined,
    PlusSquareOutlined,
    SaveOutlined,
    LayoutOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import Mock from 'mockjs'
import {produce} from 'immer';
import XLSX from 'xlsx';
import KColumnTitle from "./KColumnTitle";
import TadDbConnection from "../entity/TadDbConnection";
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";
import TadIndicator from "../entity/TadIndicator";
import TadIndicatorCounter from "../entity/TadIndicatorCounter";

const {Option} = Select;
const {TextArea} = Input;
const {Column} = Table;

export default class ServicePerformance extends React.PureComponent {
    static contextType = GCtx;

    gUi = {
        tableIndicatorsColumnWidths: {
            key: 4,
            esn: 5,
            izn: 20,
            iu: 5,
            itt: 5,
            igt: 5,
            idef: 50,
            iexp: 50,
            czn: 10,
            cen: 10,
            cbtn: 10,
            cbtcn: 10,
            ctn: 10,
            ctcn: 10,
            ctt: 7,
            cgt: 7,
        },
    };
    // gMap = { schemas: new Map(), kpis : new Map() };
    // schemas.kpis为数组，只存放kpi的id（简写为：kid，注意不是kpi_id）
    gMap = {};

    gData = {};
    gCurrent = {
        schema: null,
        kpi: null,
        counter: null,
        indicatorCounters: []
    };
    gRef = {};
    refBoxDetail = React.createRef();
    refTreeSchema = React.createRef();
    refFormSchemaProperties = React.createRef();
    refFormKpiProperties = React.createRef();
    gDynamic = {
        schemaId: {
            a1: -99999,
            a2: -99999,
            b1: -99999,
            b2: -99999,
            index: 0
        }
    }
    ids = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 99, 150, 151, 152, 153, 154, 155, 156, 157, 199];

    constructor(props) {
        super(props);

        this.state = {
            message: "",
            isModalVisible: false,
            modalWhat: "",
            modalMessage: "",
            styleLayoutLeftRight: "NN",
            styleLayoutUpDown: "NN",
            styleLayout4Edit: "NN",
            treeDataKpiSchemas: [],
            treeDataKpis: [],
            treeDataKpiCounters: [],

            optionsSchemaIdA1: [{label: "业务分类", value: -99999}],
            optionsSchemaIdA2: [{label: "时间粒度", value: -99999}],
            optionsSchemaIdB1: [{label: "空间粒度", value: -99999}],
            optionsSchemaIdB2: [{label: "网元类型", value: -99999}],
            pageSizeIndicators: 50,
            columnsIndicator: [],
            columnWidths: {
                key: 4 * 15,
                esn: 5 * 15,
                izn: 20 * 15,
                iu: 5 * 15,
                itt: 5 * 15,
                igt: 5 * 15,
                idef: 50 * 15,
                iexp: 50 * 15,
                czn: 20 * 15,
                cen: 20 * 15,
                cbtn: 20 * 15,
                cbtcn: 20 * 15,
                ctn: 20 * 15,
                ctcn: 20 * 15,
                ctt: 7 * 15,
                cgt: 7 * 15,
            },
            tableIndicatorsIsLoading: true,
            dsIndicators: [],
            selectedSchema: {
                id: -1,
                schema_id: "",
                schemaIdA1: -99999,
                schemaIdA2: -99999,
                schemaIdB1: -99999,
                schemaIdB2: -99999,
                schema_zhname: "指标组名称",
                schema_vendor_id: -1,
                schema_object_class: -1,
                schema_sub_class: -1,
                schema_interval_flag: -1,
                schema_counter_tab_name: "COUNTER表名称",
            },
            selectedKpi: {
                id: -1,
                sid: -1,
                kpi_id: "",
                kpi_field: "",
                kpi_zhname: "指标中文名称",
                kpi_enname: "指标英文名称",
                kpi_alarm: 1, // 默认告警
                kpi_format: 1, // 默认格式R2
                kpi_min_value: "最小值",
                kpi_max_value: "最大值",
                kpi_exp: "指标计算表达式",
                kpi_used_info: "",
                kpi_used_product: -1,
                kpi_used_module: -1,
                kpi_used_title: "界面呈现标题",
            },
            tablePropertiesScrollX: 1920,
            tableIndicatorCountersScrollX: 1920,
            tablePropertiesScrollY: 200,

        }
        //TODO:BM: >>>>> bind(this)
        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);
        this.doGetAll = this.doGetAll.bind(this);
        this.doGetKpiDict = this.doGetKpiDict.bind(this);
        this.doGetKpis = this.doGetKpis.bind(this);
        this.doGetKpiSchemas = this.doGetKpiSchemas.bind(this);
        this.doGetIndicators = this.doGetIndicators.bind(this);
        this.doGetIndicatorCounters = this.doGetIndicatorCounters.bind(this);
        this.doGetKpiCounters = this.doGetKpiCounters.bind(this);
        this.doGetExcel = this.doGetExcel.bind(this);

        this.restAddSchema = this.restAddSchema.bind(this);
        this.restDeleteSchema = this.restDeleteSchema.bind(this);

        this.restAddKpi = this.restAddKpi.bind(this);
        this.restDeleteKpi = this.restDeleteKpi.bind(this);
        this.restUpdateKpi = this.restUpdateKpi.bind(this);

        this.restDeleteCounter = this.restDeleteCounter.bind(this);

        this.doAddSchema = this.doAddSchema.bind(this);
        this.doDeleteSchema = this.doDeleteSchema.bind(this);
        this.doUpdateSchema = this.doUpdateSchema.bind(this);

        this.doAddKpi = this.doAddKpi.bind(this);
        this.doDeleteKpi = this.doDeleteKpi.bind(this);
        this.doUpdateKpi = this.doUpdateKpi.bind(this);

        this.doDeleteCounter = this.doDeleteCounter.bind(this);

        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);

        this.onTreeKpisSelected = this.onTreeKpisSelected.bind(this);
        this.onTreeKpisDrop = this.onTreeKpisDrop.bind(this);

        this.onButtonProductsChangeComponentSizeClicked = this.onButtonProductsChangeComponentSizeClicked.bind(this);
        this.onButtonChangeComponentLayoutUpDownClicked = this.onButtonChangeComponentLayoutUpDownClicked.bind(this);
        this.onButtonChangeComponentLayout4EditClicked = this.onButtonChangeComponentLayout4EditClicked.bind(this);

        this.onButtonSchemasAddClicked = this.onButtonSchemasAddClicked.bind(this);
        this.onButtonSchemasCopyPasteClicked = this.onButtonSchemasCopyPasteClicked.bind(this);
        this.onButtonSchemasExportClicked = this.onButtonSchemasExportClicked.bind(this);
        this.onButtonSchemasResetClicked = this.onButtonSchemasResetClicked.bind(this);
        this.onButtonSchemasCommitClicked = this.onButtonSchemasCommitClicked.bind(this);

        this.onButtonKpisAddClicked = this.onButtonKpisAddClicked.bind(this);
        this.onButtonKpisCopyPasteClicked = this.onButtonKpisCopyPasteClicked.bind(this);
        this.onButtonKpisDeleteClicked = this.onButtonKpisDeleteClicked.bind(this);

        this.onButtonIndicatorsCopy2CountersClicked = this.onButtonIndicatorsCopy2CountersClicked.bind(this);
        this.onButtonIndicatorsRefreshClicked = this.onButtonIndicatorsRefreshClicked.bind(this);
        this.onButtonIndicatorsImportClicked = this.onButtonIndicatorsImportClicked.bind(this);
        this.onButtonIndicatorsExportClicked = this.onButtonIndicatorsExportClicked.bind(this);
        this.onModalButtonOkClicked = this.onModalButtonOkClicked.bind(this);
        this.onModalButtonCancelClicked = this.onModalButtonCancelClicked.bind(this);

        this.onInputSchemaZhNameChanged = this.onInputSchemaZhNameChanged.bind(this);

        this.onInputSearchSchemaChange = this.onInputSearchSchemaChange.bind(this);
        this.onInputSearchSchemasSearched = this.onInputSearchSchemasSearched.bind(this);
        this.onInputSearchKpiChange = this.onInputSearchKpiChange.bind(this);
        this.onInputSearchIndicatorsChanged = this.onInputSearchIndicatorsChanged.bind(this);
        this.onInputSearchIndicatorsSearched = this.onInputSearchIndicatorsSearched.bind(this);

        this.onTableIndicatorsExpandedRowRender = this.onTableIndicatorsExpandedRowRender.bind(this);

        this.onSelectSchemaIdChanged = this.onSelectSchemaIdChanged.bind(this);

        this.data2UiTable = this.data2UiTable.bind(this);
        this.toUiSchemas = this.toUiSchemas.bind(this);
        this.isFoundKpis = this.isFoundKpis.bind(this);
        this.uiUpdateSchema = this.uiUpdateSchema.bind(this);
        this.dsUpdateSchema = this.dsUpdateSchema.bind(this);
        this.uiUpdateKpi = this.uiUpdateKpi.bind(this);
        this.dsUpdateKpi = this.dsUpdateKpi.bind(this);
        this.uiUpdateCounter = this.uiUpdateCounter.bind(this);
        this.dsUpdateCounter = this.dsUpdateCounter.bind(this);

        this.uiUpdateCounter = this.uiUpdateCounter.bind(this);
        this.showModal = this.showModal.bind(this);

        this.onFormSchemaPropertiesFinish = this.onFormSchemaPropertiesFinish.bind(this);
        this.onFormSchemaPropertiesFinishFailed = this.onFormSchemaPropertiesFinishFailed.bind(this);
        this.onFormKpiPropertiesFinish = this.onFormKpiPropertiesFinish.bind(this);
        this.onFormKpiPropertiesFinishFailed = this.onFormKpiPropertiesFinishFailed.bind(this);
        this.onFormSchemaPropertiesFill = this.onFormSchemaPropertiesFill.bind(this);
        this.onFormKpiPropertiesFill = this.onFormKpiPropertiesFill.bind(this);
    }

    test() {

    }

    componentDidMount() {
        // this.doMock();
        this.doPrepare();
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

    doPrepare() {

    }

    doInit() {
        let columnWidths = lodash.cloneDeep(this.gUi.tableIndicatorsColumnWidths);

        columnWidths.key = columnWidths.key * 15;
        columnWidths.esn = columnWidths.esn * 15;
        columnWidths.izn = columnWidths.izn * 15;
        columnWidths.iu = columnWidths.iu * 15;
        columnWidths.itt = columnWidths.itt * 15;
        columnWidths.igt = columnWidths.igt * 15;
        columnWidths.idef = columnWidths.idef * 15;
        columnWidths.iexp = columnWidths.iexp * 15;
        columnWidths.czn = columnWidths.czn * 15;
        columnWidths.cen = columnWidths.cen * 15;
        columnWidths.cbtn = columnWidths.cbtn * 15;
        columnWidths.cbtcn = columnWidths.cbtcn * 15;
        columnWidths.ctn = columnWidths.ctn * 15;
        columnWidths.ctcn = columnWidths.ctcn * 15;
        columnWidths.ctt = columnWidths.ctt * 15;
        columnWidths.cgt = columnWidths.cgt * 15;

        let tablePropertiesScrollX = columnWidths.key +
            columnWidths.esn +
            columnWidths.izn +
            columnWidths.iu +
            columnWidths.itt +
            columnWidths.igt +
            columnWidths.idef +
            columnWidths.iexp + 500;

        let tableIndicatorCountersScrollX = columnWidths.czn +
            columnWidths.cen +
            columnWidths.cbtn +
            columnWidths.cbtcn +
            columnWidths.ctn +
            columnWidths.ctcn +
            columnWidths.ctt +
            columnWidths.cgt + 200;

        this.setState({
            columnWidths: columnWidths,
            tableIndicatorCountersScrollX: tableIndicatorCountersScrollX,
            tablePropertiesScrollX: tablePropertiesScrollX,
            tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 39 - 16,
        })
    }

    isFoundKpis(ds, sv) {
        let myResult = false;

        for (let i = 0; i < ds.length; i++) {
            if (ds[i].kpi_zhname?.toLowerCase().indexOf(sv) >= 0
                || ds[i].kpi_enname?.toLowerCase().indexOf(sv) >= 0
                || ds[i].kpi_id?.toString().indexOf(sv) >= 0) {
                myResult = true;
                break;
            }
        }

        return myResult
    }

    toUiSchemas(ds, sv) {
        let myResult = {mapDs: new Map(), uiDs: [], mapRelation: new Map()}

        for (let i = 0; i < ds.length; i++) {
            let item = ds[i];
            let id = item.id;
            let schemaId = item.schema_id === null ? (99260000261 + item.id).toString() : item.schema_id;
            let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

            if (schemaId !== -1 &&
                schemaName !== "" &&
                schemaName.length > 0 &&
                schemaName[0] !== "?" &&
                schemaName[schemaName.length - 1] !== "?") {

                if (sv
                    && (sv !== "")
                    && schemaName.toLowerCase().indexOf(sv) < 0
                    && schemaId.toString().indexOf(sv) < 0) {
                    if (this.gMap.schemas.has(schemaId)) {
                        if (!this.isFoundKpis(this.gMap.schemas.get(schemaId).kpis, sv)) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }

                if (!myResult.mapDs.has(id)) {
                    let schemaClone = lodash.cloneDeep(item);

                    schemaClone.schema_id = schemaId;
                    schemaClone.kpis = [];
                    myResult.mapDs.set(id, schemaClone)

                    let uiSchema = {
                        key: schemaClone.id,
                        title: <div className={"BoxSchemaTitle"}>{schemaClone.schema_id + " - " + schemaClone.schema_zhname}</div>,
                        children: []
                    }
                    myResult.uiDs.push(uiSchema);
                }

                if (!myResult.mapRelation.has(schemaId)) {
                    myResult.mapRelation.set(schemaId, id);
                }
            }
        }

        return myResult;
    }

    uiUpdateSchema(schema, what) {
        const {selectedSchema} = this.state;
        let sid = selectedSchema.id;

        let treeDataKpiSchemas = lodash.cloneDeep(this.state.treeDataKpiSchemas);

        console.log(schema, what);
        switch (what) {
            case "add":
                    treeDataKpiSchemas.push({
                        key: schema.id,
                        title: schema.schema_id + " - " + schema.schema_zhname,
                    });
                break
            case "clone":
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    if (treeDataKpiSchemas[i].key === sid) {
                        treeDataKpiSchemas.splice(i + 1, 0, {
                            key: schema.id,
                            title: schema.schema_id + " - " + schema.schema_zhname,
                        });
                        break
                    }
                }
                break
            case "update":
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    let item = treeDataKpiSchemas[i];
                    if (item.key === selectedSchema.id) {
                        item.title = <div className="BoxSchemaTitle">{this.state.selectedSchema.schema_id + " - " + this.state.selectedSchema.schema_zhname}</div>
                        break
                    }
                }
                break
            case "delete":
                let index = -1;
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    let item = treeDataKpiSchemas[i];
                    if (item.key === selectedSchema.id) {
                        index = i;
                        break
                    }
                }
                treeDataKpiSchemas.splice(index, 1);
                let schemaNew = new TadKpiSchema();
                schemaNew.init();
                this.setState({
                    selectedSchema: schemaNew
                });
                break
            default:
                break;
        }


        this.setState({
            treeDataKpiSchemas: treeDataKpiSchemas
        })
    }

    dsUpdateSchema(schema, what) {
        switch (what) {
            case "add":
                this.gMap.schemas.set(schema.id, schema);
                break
            case "update":
                if (this.gMap.schemas.has(schema.id)) {
                    let oldSchema = this.gMap.schemas.get(schema.id);
                    oldSchema.schema_id = schema.schema_id;
                    oldSchema.schema_zhname = schema.schema_zhname;
                    oldSchema.vendor_id = schema.vendor_id;
                    oldSchema.object_class = schema.object_class;
                    oldSchema.sub_class = schema.sub_class;
                    oldSchema.interval_flag = schema.interval_flag;

                    this.gMap.schemas.get(schema.id).kpis.forEach((kpi) => {
                        if (this.gMap.schemas.get(schema.id).kpis.has(kpi.id)) {
                            let mapKpi = this.gMap.schemas.get(schema.id).kpis.get(kpi.id);
                            let oldSchemaId = oldSchema.schema_id;
                            let newSchemaId = schema.schema_id;
                            let oldKpiIndex = mapKpi.kpi_id.split(oldSchemaId)[1]
                            mapKpi.kpi_id = newSchemaId + oldKpiIndex;
                        }
                    })
                }
                break
            case "delete":
                if (this.gMap.schemas.has(schema.id)) {

                    this.gMap.schemas.get(schema.id).kpis.forEach((kpi) => {
                        if (this.gMap.schemas.get(schema.id).kpis.has(kpi.id)) {
                            this.gMap.schemas.get(schema.id).kpis.delete(kpi.id);
                        }
                    })
                    this.gMap.schemas.delete(schema.id);
                }
                break
            default:
                break;
        }
    }

    uiUpdateKpi(kpi, what) {
        let treeDataKpis;

        switch (what) {
            case "add":
                let uiKpi = {
                    key: kpi.id,
                    title: kpi.kpi_id + " - " + kpi.kpi_zhname,
                    children: []
                }

                this.setState((prevState) => {
                    return produce(prevState, draftState => {
                        draftState.treeDataKpis.push(uiKpi);
                    })
                })
                break
            case "clone":
                break
            case "update":
                treeDataKpis = lodash.cloneDeep(this.state.treeDataKpis);

                for (let i = 0; i < treeDataKpis.length; i++) {
                    let item = treeDataKpis[i];
                    if (item.key === kpi.id) {
                        item.title = <div className="BoxKpiTitle">{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>
                        break
                    }
                }
                this.setState({
                    treeDataKpis: treeDataKpis
                })
                break
            case "delete":
                treeDataKpis = lodash.cloneDeep(this.state.treeDataKpis);
                let index = -1;
                for (let i = 0; i < treeDataKpis.length; i++) {
                    let item = treeDataKpis[i];
                    if (item.key === kpi.id) {
                        index = i;
                        break
                    }
                }
                treeDataKpis.splice(index, 1);
                let newKpi = new TadKpi();
                newKpi.init();
                this.setState({
                    selectedKpi: newKpi
                });
                this.setState({
                    treeDataKpis: treeDataKpis
                })
                break
            default:
                break;
        }
    }

    dsUpdateKpi(kpi, what) {
        switch (what) {
            case "add":
                if (this.gMap.schemas.has(kpi.sid)) {
                    this.gMap.schemas.get(kpi.sid).kpis.push(lodash.cloneDeep(kpi));
                }
                break
            case "update":
                if (this.gMap.schemas.has(kpi.sid)) {
                    let kpis = this.gMap.schemas.get(kpi.sid).kpis;
                    for (let i = 0; i < kpis.length; i++) {
                        if (kpis[i].id === kpi.id) {
                            kpis[i].kpi_zhname = kpi.kpi_zhname;
                            kpis[i].kpi_enname = kpi.kpi_enname;
                            kpis[i].kpi_field = kpi.kpi_field;
                            kpis[i].kpi_alarm = kpi.kpi_alarm;
                            kpis[i].kpi_format = kpi.kpi_format;
                            kpis[i].kpi_min_value = kpi.kpi_min_value;
                            kpis[i].kpi_max_value = kpi.kpi_max_value;
                            kpis[i].kpi_exp = kpi.kpi_exp;
                            kpis[i].used_info = kpi.used_info;
                            break
                        }
                    }
                }
                break
            case "delete":
                if (this.gMap.schemas.has(kpi.sid)) {
                    let kpis = this.gMap.schemas.get(kpi.sid).kpis;
                    for (let i = 0; i < kpis.length; i++) {
                        if (kpis[i].id === kpi.id) {
                            kpis.splice(i, 1);
                            break
                        }
                    }
                }
                break
            default:
                break;
        }
    }

    uiUpdateCounter(what) {
        // const {selectedSchema} = this.state;
        //
        // let treeDataKpiSchemas = lodash.cloneDeep(this.state.treeDataKpiSchemas);
        //
        // switch (what) {
        //     case "update":
        //         for (let i = 0; i < treeDataKpiSchemas.length; i++) {
        //             let item = treeDataKpiSchemas[i];
        //             if (item.key === selectedSchema.id) {
        //                 item.title = <div className="BoxSchemaTitle">{this.state.selectedSchema.schema_id + " - " + this.state.selectedSchema.schema_zhname}</div>
        //                 break
        //             }
        //         }
        //         break
        //     case "delete":
        //         let index = -1;
        //         for (let i = 0; i < treeDataKpiSchemas.length; i++) {
        //             let item = treeDataKpiSchemas[i];
        //             if (item.key === selectedSchema.id) {
        //                 index = i;
        //                 break
        //             }
        //         }
        //         treeDataKpiSchemas.splice(index, 1);
        //         let schema = new TadKpiSchema();
        //         schema.init();
        //         this.setState({
        //             selectedSchema: schema
        //         });
        //         break
        //     default:
        //         break;
        // }
        //
        //
        //
        // this.setState({
        //     treeDataKpiSchemas: treeDataKpiSchemas
        // })
    }

    dsUpdateCounter(counter, what) {

    }

    data2UiTable(data) {
        let myResult = [];
        let arrWidths = {izn: 13, czn: 13, cen: 13};

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let myIndicator = lodash.cloneDeep(item);

            myIndicator.index = i;
            if (myIndicator.indicator_zhname && myIndicator.indicator_zhname.length > arrWidths.izn) {
                arrWidths.izn = myIndicator.indicator_zhname.length
            }
            myResult.push(myIndicator);
        }

        return myResult;
    }

    toCellValue(cell) {
        let myValue = null;

        if (cell && cell.t) myValue = XLSX.utils.format_cell(cell);

        return myValue;
    }

    getColumnIndex(columnName, mapColumns) {
        let myResult = -1;
        let names = columnName.split(",");

        for (let i = 0; i < names.length; i++) {
            if (mapColumns.has(names[i])) {
                myResult = mapColumns.get(names[i]);
                break
            }
        }

        return myResult;
    }

    showModal(what) {
        this.setState({
            isModalVisible: true,
            modalWhat: what
        })
    };

    //TODO:BM: >>>>> doGetAll
    doGetAll() {
        axios.all([
            this.doGetKpiDict(),
            this.doGetKpis(),
            this.doGetKpiSchemas(),
            this.doGetKpiCounters(),
            this.doGetIndicators(),
            this.doGetIndicatorCounters(),
        ]).then(axios.spread((
            kpiDict,
            kpis,
            schemas,
            counters,
            // indicators,
            indicatorCounters) => {
            let mapKpiDict = new Map();
            let mapKpis = new Map();
            // let mapIndicators = new Map();

            this.gData.kpiDict = kpiDict.data.data;
            this.gData.kpis = kpis.data.data;
            this.gData.schemas = schemas.data.data;
            this.gData.counters = counters.data.data;
            // this.gData.indicators = indicators.data.data;
            this.gData.indicatorCounters = indicatorCounters.data.data;

            // kpi dict ...
            this.gData.kpiDict.forEach((item) => {
                if (!mapKpiDict.has(item.type)) {
                    mapKpiDict.set(item.type, [item]);
                } else {
                    mapKpiDict.get(item.type).push(item);
                }
            });
            this.gMap.kpiDict = mapKpiDict;
            if (this.gMap.kpiDict.has(1021)) {
                let options = [{label: "业务分类", value: -99999}];
                this.gMap.kpiDict.get(1021).forEach((value, key) => {
                    options.push({label: value.txt, value: value.id});
                });
                this.setState({
                    optionsSchemaIdA1: options
                })
            }
            if (this.gMap.kpiDict.has(1022)) {
                let options = [{label: "时间粒度", value: -99999}];
                this.gMap.kpiDict.get(1022).forEach((value, key) => {
                    options.push({label: value.txt, value: value.id});
                });
                this.setState({
                    optionsSchemaIdA2: options
                })
            }
            if (this.gMap.kpiDict.has(1023)) {
                let options = [{label: "空间粒度", value: -99999}];
                this.gMap.kpiDict.get(1023).forEach((value, key) => {
                    if (this.ids.includes(value.id)) {
                        options.push({label: value.txt + "-" + value.id, value: value.id});
                    }
                });
                this.setState({
                    optionsSchemaIdB1: options
                })
            }
            if (this.gMap.kpiDict.has(1023)) {
                let options = [{label: "网元类型", value: -99999}];
                this.gMap.kpiDict.get(1023).forEach((value, key) => {
                    if (!this.ids.includes(value.id)) {
                        options.push({label: value.txt, value: value.id});
                    }
                });
                this.setState({
                    optionsSchemaIdB2: options
                })
            }

            // indicator ...
            /*
            let dsIndicators = [];
            let nKey = 0;
            let columnWidths = lodash.cloneDeep(this.gUi.tableIndicatorsColumnWidths);
            for (let i = 0; i < this.gData.indicators.length; i++) {
                let indicator = this.gData.indicators[i];

                indicator.counters = [];
                if (indicator.indicator_zhname && indicator.indicator_zhname !== "") {
                    let myIndicator = lodash.cloneDeep(indicator);
                    myIndicator.counters = [];
                    myIndicator.index = ++nKey;
                    if (myIndicator.indicator_zhname && myIndicator.indicator_zhname.length > columnWidths.izn) {
                        columnWidths.izn = myIndicator.indicator_zhname.length
                    }

                    let mKey = 0;
                    this.gData.indicatorCounters.forEach((counter) => {
                        if (counter.indicator_id === indicator.id) {
                            let myCounter = lodash.cloneDeep(counter);
                            // myIndicator.counter_zhname = counter.counter_zhname;
                            // myIndicator.counter_enname = counter.counter_enname;
                            if (myCounter.counter_zhname && myCounter.counter_zhname.length > columnWidths.czn) {
                                columnWidths.czn = myCounter.counter_zhname.length
                            }
                            if (myCounter.counter_enname && myCounter.counter_enname.length > columnWidths.cen) {
                                columnWidths.cen = myCounter.counter_enname.length
                            }
                            myCounter.key = ++mKey;
                            indicator.counters.push(myCounter);
                            myIndicator.counters.push(myCounter);
                        }
                    });
                    mapIndicators.set(myIndicator.id, myIndicator);
                    dsIndicators.push(myIndicator);
                }
            }

            this.gUi.dsIndicators = dsIndicators;
            this.gMap.indicators = mapIndicators;
            this.gUi.tableIndicatorsColumnWidths = columnWidths;

            this.setState({
                pageSizeIndicators: this.gUi.dsIndicators.length,
                dsIndicators: this.gUi.dsIndicators
            }, () => {
                this.setState({
                    tableIndicatorsIsLoading: false,
                    message: "共加载：" + this.state.dsIndicators.length + " 个指标"
                })
            })
            */

            // schemas to gMap.schemas
            let mySchemas = this.toUiSchemas(this.gData.schemas);

            // kpis to gMap.kpis and gMap.schemas.kpis
            for (let iKpi = 0; iKpi < this.gData.kpis.length; iKpi++) {
                let item = this.gData.kpis[iKpi];
                let kid = item.id;
                let kpiName = item.kpi_zhname === null ? "" : item.kpi_zhname;

                if (kpiName !== "" &&
                    kpiName.length > 0 &&
                    kpiName[0] !== "?" &&
                    kpiName[kpiName.length - 1] !== "?") {

                    let myKpi = item;

                    if (!mapKpis.has(kid)) {
                        mapKpis.set(kid, myKpi);
                    }

                    if (mySchemas.mapDs.has(item.sid)) {
                        // mySchemas.mapDs.get(item.sid).kpis.push(myKpi)
                        mySchemas.mapDs.get(item.sid).kpis.push(myKpi.id);
                    }
                }

            }

            this.gMap.schemas = mySchemas.mapDs;
            this.gMap.kpis = mapKpis;

            this.gUi.schemas = mySchemas.uiDs;
            this.setState({
                treeDataKpiSchemas: mySchemas.uiDs
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

    doGetIndicatorCounters() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_indicator_counters", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetKpiDict() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_dict", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetExcel() {
        axios.get('data/counter_001.xlsx', {responseType: 'arraybuffer'}).then(res => {
            let wb = XLSX.read(res.data, {type: 'array'});
            let mapColumns = new Map();
            let mapIndicators = new Map();

            for (let i = 0; i < wb.SheetNames.length; i++) {
                let range = XLSX.utils.decode_range(wb.Sheets[wb.SheetNames[i]]['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    mapColumns.set(this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: 0})]), C);
                }

                let C;
                let lastIndicator = new TadIndicator();
                for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                    let myIndicator = new TadIndicator();
                    let myIndicatorCounter = new TadIndicatorCounter();

                    myIndicator.excel_name = "counter_001.xlsx";
                    myIndicator.excel_sheet_name = wb.SheetNames[i];
                    C = this.getColumnIndex("设备类型,网元类型", mapColumns);
                    myIndicator.indicator_object_class = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标来源,字段：VoLTE引入指标=是", mapColumns);
                    myIndicator.indicator_datasource = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标分级", mapColumns);
                    myIndicator.indicator_level = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标编码", mapColumns);
                    myIndicator.indicator_code = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标名称", mapColumns);
                    myIndicator.indicator_zhname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("英文名称", mapColumns);
                    myIndicator.indicator_enname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("业务需求", mapColumns);
                    myIndicator.indicator_desc = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标定义", mapColumns);
                    myIndicator.indicator_definition = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("中文映射算法", mapColumns);
                    myIndicator.indicator_zhexp = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("英文映射算法", mapColumns);
                    myIndicator.indicator_enexp = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("单位", mapColumns);
                    myIndicator.indicator_unit = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("空间粒度", mapColumns);
                    myIndicator.indicator_geo_type = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("时间粒度", mapColumns);
                    myIndicator.indicator_time_type = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("备注", mapColumns);
                    myIndicator.indicator_memo = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("KPI表", mapColumns);
                    myIndicator.kpi_tab_name = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("指标名称（待删除）", mapColumns);
                    myIndicator.kpi_zhname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("KPI_DB映射,KPI指标", mapColumns);
                    myIndicator.kpi_enname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("DB映射算法,KPI映射算法", mapColumns);
                    myIndicator.kpi_exp = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("DB映射备注", mapColumns);
                    myIndicator.kpi_exp_desc = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("自动编号", mapColumns);
                    myIndicator.kpi_index = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("KPI数据格式", mapColumns);
                    myIndicator.kpi_value_format = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("KPI最小值", mapColumns);
                    myIndicator.kpi_value_min = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("KPI最大值", mapColumns);
                    myIndicator.kpi_value_max = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    myIndicator.import_time = moment().format("yyyy-MM-DD HH:mm:ss");
                    myIndicator.import_desc = "版本：" + myIndicator.import_time;

                    myIndicatorCounter.indicator_id = "???";
                    C = this.getColumnIndex("统计数据编码,统计编码", mapColumns);
                    myIndicatorCounter.counter_code = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("统计数据中文名称", mapColumns);
                    myIndicatorCounter.counter_zhname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("统计数据英文名称", mapColumns);
                    myIndicatorCounter.counter_enname = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("主表", mapColumns);
                    myIndicatorCounter.base_tab_name = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("DB映射,字段", mapColumns);
                    myIndicatorCounter.base_tab_col_name = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("COUNTER时间汇总算法", mapColumns);
                    myIndicatorCounter.counter_time_type = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("COUNTER空间汇总算法", mapColumns);
                    myIndicatorCounter.counter_geo_type = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("COUNTER表", mapColumns);
                    myIndicatorCounter.counter_tab_name = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    C = this.getColumnIndex("COUNTER表对应字段", mapColumns);
                    myIndicatorCounter.counter_tab_col_name = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                    myIndicatorCounter.import_time = myIndicator.import_time;

                    if (myIndicator.indicator_object_class !== null) lastIndicator.indicator_object_class = myIndicator.indicator_object_class; else myIndicator.indicator_object_class = lastIndicator.indicator_object_class;
                    if (myIndicator.indicator_datasource !== null) lastIndicator.indicator_datasource = myIndicator.indicator_datasource; else myIndicator.indicator_datasource = lastIndicator.indicator_datasource;
                    if (myIndicator.indicator_level !== null) lastIndicator.indicator_level = myIndicator.indicator_level; else myIndicator.indicator_level = lastIndicator.indicator_level;
                    if (myIndicator.indicator_code !== null) lastIndicator.indicator_code = myIndicator.indicator_code; else myIndicator.indicator_code = lastIndicator.indicator_code;
                    if (myIndicator.indicator_zhname !== null) lastIndicator.indicator_zhname = myIndicator.indicator_zhname; else myIndicator.indicator_zhname = lastIndicator.indicator_zhname;
                    if (myIndicator.indicator_enname !== null) lastIndicator.indicator_enname = myIndicator.indicator_enname; else myIndicator.indicator_enname = lastIndicator.indicator_enname;
                    if (myIndicator.indicator_desc !== null) lastIndicator.indicator_desc = myIndicator.indicator_desc; else myIndicator.indicator_desc = lastIndicator.indicator_desc;
                    if (myIndicator.indicator_definition !== null) lastIndicator.indicator_definition = myIndicator.indicator_definition; else myIndicator.indicator_definition = lastIndicator.indicator_definition;
                    if (myIndicator.indicator_zhexp !== null) lastIndicator.indicator_zhexp = myIndicator.indicator_zhexp; else myIndicator.indicator_zhexp = lastIndicator.indicator_zhexp;
                    if (myIndicator.indicator_enexp !== null) lastIndicator.indicator_enexp = myIndicator.indicator_enexp; else myIndicator.indicator_enexp = lastIndicator.indicator_enexp;
                    if (myIndicator.indicator_unit !== null) lastIndicator.indicator_unit = myIndicator.indicator_unit; else myIndicator.indicator_unit = lastIndicator.indicator_unit;
                    if (myIndicator.indicator_geo_type !== null) lastIndicator.indicator_geo_type = myIndicator.indicator_geo_type; else myIndicator.indicator_geo_type = lastIndicator.indicator_geo_type;
                    if (myIndicator.indicator_time_type !== null) lastIndicator.indicator_time_type = myIndicator.indicator_time_type; else myIndicator.indicator_time_type = lastIndicator.indicator_time_type;
                    if (myIndicator.kpi_tab_name !== null) lastIndicator.kpi_tab_name = myIndicator.kpi_tab_name; else myIndicator.kpi_tab_name = lastIndicator.kpi_tab_name;
                    if (myIndicator.kpi_zhname !== null) lastIndicator.kpi_zhname = myIndicator.kpi_zhname; else myIndicator.kpi_zhname = lastIndicator.kpi_zhname;
                    if (myIndicator.kpi_enname !== null) lastIndicator.kpi_enname = myIndicator.kpi_enname; else myIndicator.kpi_enname = lastIndicator.kpi_enname;
                    if (myIndicator.kpi_exp !== null) lastIndicator.kpi_exp = myIndicator.kpi_exp; else myIndicator.kpi_exp = lastIndicator.kpi_exp;
                    if (myIndicator.kpi_exp_desc !== null) lastIndicator.kpi_exp_desc = myIndicator.kpi_exp_desc; else myIndicator.kpi_exp_desc = lastIndicator.kpi_exp_desc;
                    if (myIndicator.kpi_index !== null) lastIndicator.kpi_index = myIndicator.kpi_index; else myIndicator.kpi_index = lastIndicator.kpi_index;
                    if (myIndicator.kpi_value_format !== null) lastIndicator.kpi_value_format = myIndicator.kpi_value_format; else myIndicator.kpi_value_format = lastIndicator.kpi_value_format;
                    if (myIndicator.kpi_value_min !== null) lastIndicator.kpi_value_min = myIndicator.kpi_value_min; else myIndicator.kpi_value_min = lastIndicator.kpi_value_min;
                    if (myIndicator.kpi_value_max !== null) lastIndicator.kpi_value_max = myIndicator.kpi_value_max; else myIndicator.kpi_value_max = lastIndicator.kpi_value_max;

                    if (!mapIndicators.has(myIndicator.indicator_zhname)) {
                        mapIndicators.set(myIndicator.indicator_zhname, {indicator: myIndicator, counters: [myIndicatorCounter]});
                    } else {
                        mapIndicators.get(myIndicator.indicator_zhname).counters.push(myIndicatorCounter);
                    }
                }
            }

            mapIndicators.forEach((value, key) => {
                let myIndicator = value.indicator;
                axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_indicator",
                    myIndicator,
                    {headers: {'Content-Type': 'application/json'}}
                ).then((response) => {
                    let data = response.data;

                    if (data.success) {
                        let indicatorZhName = data.data.indicator_zhname;
                        let indicatorId = data.data.id;
                        if (mapIndicators.has(indicatorZhName)) {
                            mapIndicators.get(indicatorZhName).counters.forEach((counter) => {
                                let myCounter = counter;
                                myCounter.indicator_id = indicatorId;

                                axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_indicator_counter",
                                    myCounter,
                                    {headers: {'Content-Type': 'application/json'}}
                                ).then((response) => {
                                    let data = response.data;

                                    if (data.success) {
                                        // message.info("成功导入指标COUNTER：" + data.data.counter_zhname).then(r => {});
                                        this.context.showMessage("成功导入指标COUNTER：" + data.data.counter_zhname);
                                    }
                                });
                            })
                        }
                        // message.info("成功导入指标：" + data.data.indicator_zhname).then(r => {});
                        this.context.showMessage("成功导入指标：" + data.data.indicator_zhname);
                    }
                });
            })
        });
    }

    doSleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    restAddSchema(schema) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_kpi_schema",
            schema,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    doUpdateSchema(schema) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/update_kpi_schema",
            schema,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    restAddKpi(kpi) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_kpi",
            kpi,
            {headers: {'Content-Type': 'application/json'}});
    }

    restDeleteSchema(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/delete_kpi_schema",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restDeleteKpi(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/delete_kpi",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restDeleteCounter(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/delete_kpi_counter",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restUpdateKpi(kpi) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/update_kpi",
            kpi,
            {headers: {'Content-Type': 'application/json'}});
    }

    doAddSchema(schema, what) {
        this.restAddSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    if (what === "clone") {
                        schema.kpis.forEach((item) => {
                            let kpi = this.gMap.kpis.get(item);
                            kpi.id = null;
                            kpi.sid = result.data.data.id;
                            kpi.kpi_id = result.data.data.schema_id + kpi.kpi_id.substr(kpi.kpi_id.length - 2, 2);
                            this.doAddKpi(kpi, "clone");
                        })
                    }
                    this.uiUpdateSchema(result.data.data, what);
                    this.dsUpdateSchema(result.data.data, "add");
                    this.context.showMessage("创建成功，新增指标组内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    //TODO:BM >>>>> 数据库克隆SCHEMA
    doCloneSchema(schema) {
        let schemaId = schema.schema_id;
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
            schemaIdNew = idObjectClassFirst + idFixed + idType + "0" + idObjectClassSecond + idIndex;
        } else {
            schemaIdNew = idObjectClassFirst + idFixed + idType + "0" + idObjectClassSecond + idIndex;
        }

        console.log("add schema...", idType, idTime, idObjectClassFirst + idObjectClassSecond, idIndex, schemaIdNew);
        schema.id = null;
        schema.schema_id = schemaIdNew;
        schema.schema_zhname += "-副本";
        this.doAddSchema(schema, "clone");
    }

    doDeleteSchema() {
        let schema = new TadKpiSchema();
        const {selectedSchema} = this.state;
        schema.id = selectedSchema.id;

        this.restDeleteSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateSchema(result.data.data, "delete");
                    this.context.showMessage("保存成功，指标组ID为：" + result.data.schema_id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    //TODO:BM >>>>> 数据库新增KPI
    doAddKpi(kpi, what) {
        this.restAddKpi(kpi).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateKpi(result.data.data, what);
                    this.dsUpdateKpi(result.data.data, "add");
                    this.context.showMessage("创建成功，新增指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    //TODO:BM >>>>> 数据库删除KPI
    doDeleteKpi(kpi) {
        // db delete
        this.restDeleteKpi(kpi).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateKpi(result.data.data, "delete");
                    this.dsUpdateKpi(result.data.data, "delete");
                    this.context.showMessage("删除成功，被删除指标ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

        // current delete
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            if (this.gCurrent.schema.kpis[i].id === kpi.id) {
                this.gCurrent.schema.kpis.splice(i, 1);
                break
            }
        }

        // db update index
        let sid = this.gCurrent.schema.id;
        let schema_id = this.gMap.schemas.get(sid).schema_id;
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            let kid = this.gCurrent.schema.kpis[i].id;
            let kpi = this.gMap.kpis.get(kid);
            kpi.kpi_id = schema_id + (i + 1).toString().padStart(2, "0");
            kpi.kpi_field = "field" + (i + 1).toString().padStart(2, "0");

            this.doUpdateKpi(kpi);
        }
    }

    //TODO::BM >>>>> 数据库更新KPI
    doUpdateKpi(kpi) {
        this.restAddKpi(kpi).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateKpi(result.data.data, "update");
                    this.dsUpdateKpi(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doDeleteCounter() {
        this.context.showMessage("移除统计数据，开发中...");

        // let schema = new TadKpiSchema();
        // const {selectedSchema} = this.state;
        // schema.id = selectedSchema.id;
        //
        // this.restDeleteSchema(schema).then((result) => {
        //     if (result.status === 200) {
        //         if (result.data.success) {
        //             this.uiUpdateSchema("delete");
        //             this.context.showMessage("保存成功，指标组ID为：" + result.data.schema_id);
        //         } else {
        //             this.context.showMessage("调用服务接口出现问题，详情：" + result.message);
        //         }
        //     } else {
        //         this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
        //     }
        // });
    }

    onTreeKpiSchemasSelected(selectedKeys, info) {
        if (info.selected) {
            let id = selectedKeys[0];
            let schema;
            let uiKpiCounters = [];

            if (this.gMap.schemas.has(id)) {
                schema = this.gMap.schemas.get(id);
                this.gCurrent.schema = schema;
                let schemaId = schema.schema_id;

                let uiKpis = [];
                schema.kpis.forEach((item) => {
                    if (this.gMap.kpis.has(item)) {
                        let kpi = this.gMap.kpis.get(item);
                        let uiKpi = {
                            key: kpi.id,
                            title: <div className={"BoxKpiTitle"}>{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
                            children: []
                        }
                        let index = parseInt(kpi.kpi_id?.substr(kpi.kpi_id.length - 2, 2)) - 1;
                        uiKpis[index] = uiKpi;
                    }
                });

                this.gData.counters.forEach((item) => {
                    if (item.schema_id === schema.schema_id) {
                        uiKpiCounters.push({
                            key: item.counter_enname,
                            title: <div className={"BoxCounterTitle"}>{item.counter_zhname + " - " + item.counter_enname}</div>,
                            children: []
                        })
                    }
                })

                let schemaIdA1 = -99999;
                let schemaIdA2 = -99999;
                let schemaIdB1 = -99999;
                let schemaIdB2 = -99999;
                let schemaIdIndex = 0;
                let ids = schemaId.split("260");

                if ((ids[0] !== "") && (ids[0] !== "99")) {
                    schemaIdA1 = parseInt(schemaId.substr(4, 1));
                    schemaIdA2 = parseInt(schemaId.substr(5, 1));
                    schemaIdB1 = parseInt(schemaId.substr(0, 1) + schemaId.substr(6, 2));
                    if (this.ids.includes(schemaIdB1)) {
                        schemaIdB2 = parseInt(schemaId.substr(8, 2));
                    } else {
                        schemaIdB2 = schemaIdB1;
                        schemaIdB1 = -99999;
                        schemaIdIndex = parseInt(schemaId.substr(8, 2));
                    }
                } else if (ids[0] === "") {
                    schemaIdA1 = parseInt(schemaId.substr(3, 1));
                    schemaIdA2 = parseInt(schemaId.substr(4, 1));
                    schemaIdB1 = parseInt(schemaId.substr(5, 2));
                    if (this.ids.includes(schema.schema_id)) {
                        schemaIdB2 = parseInt(schemaId.substr(7, 2));
                    } else {
                        schemaIdB2 = schemaIdB1;
                        schemaIdB1 = -99999;
                        schemaIdIndex = parseInt(schemaId.substr(7, 2));
                    }
                }

                this.gDynamic.schemaId.a1 = schemaIdA1;
                this.gDynamic.schemaId.a2 = schemaIdA2;
                this.gDynamic.schemaId.b1 = schemaIdB1;
                this.gDynamic.schemaId.b2 = schemaIdB2;
                this.gDynamic.schemaId.index = schemaIdIndex;

                this.onFormSchemaPropertiesFill(schema);
                let newKpi = new TadKpi();
                newKpi.init();
                this.onFormKpiPropertiesFill(newKpi);

                this.setState({
                    treeDataKpis: uiKpis,
                    treeDataKpiCounters: uiKpiCounters,
                    selectedSchema: {
                        id: id,
                        schema_id: schema.schema_id, // 必填
                        schemaIdA1: schemaIdA1,
                        schemaIdA2: schemaIdA2,
                        schemaIdB1: schemaIdB1,
                        schemaIdB2: schemaIdB2,
                        schema_zhname: schema.schema_zhname, // 必填
                        schema_vendor_id: schema.vendor_id, // 默认 -1
                        schema_object_class: schema.object_class,  // 必填
                        schema_sub_class: schema.sub_class,  // 必填
                        schema_interval_flag: schema.interval_flag,  // 必填
                        schema_counter_tab_name: schema.counter_tab_name, // 必填
                    },
                    selectedKpi: {
                        id: -1,
                        kpi_id: "",
                        kpi_zhname: "指标中文名称",
                        kpi_enname: "指标英文名称",
                        kpi_exp: "指标计算表达式",
                        kpi_alarm: 1, // 默认告警
                        kpi_format: 1, // 默认格式R2
                        kpi_min_value: "最小值",
                        kpi_max_value: "最大值",
                        kpi_used_product: -1,
                        kpi_used_module: -1,
                        kpi_used_title: "界面呈现标题",
                    }
                })
            }
        } else {
            this.setState({
                treeDataKpis: [],
                treeDataKpiCounters: [],
                selectedSchema: {
                    id: -1,
                    schema_id: "",
                    schemaIdA1: -99999,
                    schemaIdA2: -99999,
                    schemaIdB1: -99999,
                    schemaIdB2: -99999,
                    schema_zhname: "指标组名称",
                    schema_vendor_id: -1,
                    schema_object_class: -1,
                    schema_sub_class: -1,
                    schema_interval_flag: -1,
                    schema_counter_tab_name: "COUNTER表名称",
                },
                selectedKpi: {
                    id: -1,
                    kpi_id: "",
                    kpi_zhname: "指标中文名称",
                    kpi_enname: "指标英文名称",
                    kpi_exp: "指标计算表达式",
                    kpi_alarm: 1, // 默认告警
                    kpi_format: 1, // 默认格式R2
                    kpi_min_value: "最小值",
                    kpi_max_value: "最大值",
                    kpi_used_product: -1,
                    kpi_used_module: -1,
                    kpi_used_title: "界面呈现标题",
                }
            });
        }


    };

    onTreeKpisSelected(selectedKeys, info) {
        if (info.selected) {
            let kid = selectedKeys[0];

            if (this.gMap.kpis.has(kid)) {
                let selectedKpi = lodash.cloneDeep(this.state.selectedKpi);
                let kpi = this.gMap.kpis.get(kid);
                this.gCurrent.kpi = kpi;

                selectedKpi.id = kpi.id;
                selectedKpi.kpi_id = kpi.kpi_id;
                selectedKpi.kpi_zhname = kpi.kpi_zhname;
                selectedKpi.kpi_enname = kpi.kpi_enname;
                selectedKpi.kpi_exp = kpi.kpi_exp;
                selectedKpi.kpi_alarm = kpi.kpi_alarm; // 默认告
                selectedKpi.kpi_format = kpi.kpi_format; // 默认格式R2
                selectedKpi.kpi_min_value = kpi.kpi_min_value;
                selectedKpi.kpi_max_value = kpi.kpi_max_value;
                selectedKpi.kpi_used_product = -1;
                selectedKpi.kpi_used_module = -1;
                selectedKpi.kpi_used_title = "界面呈现标题";

                this.onFormKpiPropertiesFill(kpi);
                this.setState({
                    selectedKpi: selectedKpi
                })
            }
        } else {
            let selectedKpi = lodash.cloneDeep(this.state.selectedKpi);
            selectedKpi.id = -1;
            selectedKpi.kpi_id = "";
            selectedKpi.kpi_zhname = "指标中文名称";
            selectedKpi.kpi_enname = "指标英文名称";
            selectedKpi.kpi_exp = "指标计算表达式";
            selectedKpi.kpi_alarm = 1;
            selectedKpi.kpi_format = 1;
            selectedKpi.kpi_min_value = "最小值";
            selectedKpi.kpi_max_value = "最大值";
            selectedKpi.kpi_used_product = -1;
            selectedKpi.kpi_used_module = -1;
            selectedKpi.kpi_used_title = "界面呈现标题";

            let newKpi = new TadKpi();
            newKpi.init();
            this.onFormKpiPropertiesFill(newKpi);
            this.setState({
                    selectedKpi: selectedKpi
                }
            )
        }
    }

    //TODO:BM >>>>> 拖拽KPI，改变顺序
    onTreeKpisDrop(info) {
        let dragKey = info.dragNode.key;
        let dropKey = info.node.key;
        let dragNodeClone = lodash.cloneDeep(this.gMap.kpis.get(dragKey));

        // 0 - 拖拽逻辑
        if (info.dropPosition === -1) {
            this.gCurrent.schema.kpis.unshift(dragNodeClone);
        } else {
            for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
                if (this.gCurrent.schema.kpis[i].id === dropKey) {
                    this.gCurrent.schema.kpis.splice(i + 1, 0, dragNodeClone);
                    break
                }
            }
        }
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            if (this.gCurrent.schema.kpis[i].id === dragKey) {
                this.gCurrent.schema.kpis.splice(i, 1);
                break
            }
        }

        let treeDataKpis = [];
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            let kpi = this.gMap.kpis.get(this.gCurrent.schema.kpis[i].id);
            treeDataKpis.push({
                key: this.gCurrent.schema.kpis[i].id,
                title: kpi.kpi_id + " - " + kpi.kpi_zhname,
            })
        }

        this.setState({
            treeDataKpis: treeDataKpis
        })

        // db update
        let sid = this.gCurrent.schema.id;
        let schema_id = this.gMap.schemas.get(sid).schema_id;
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            let kid = this.gCurrent.schema.kpis[i].id;
            let kpi = this.gMap.kpis.get(kid);
            kpi.kpi_id = schema_id + (i + 1).toString().padStart(2, "0");
            kpi.kpi_field = "field" + (i + 1).toString().padStart(2, "0");
            this.doUpdateKpi(kpi);
        }
    }

    // >>> SELECT <<<

    onSelectSchemaIdChanged(e, sender) {
        let schemaId = "";
        const {selectedSchema} = this.state;

        switch (sender) {
            case "a1":
                this.gDynamic.schemaId.a1 = e;
                selectedSchema.schemaIdA1 = e;
                break
            case "a2":
                this.gDynamic.schemaId.a2 = e;
                selectedSchema.schemaIdA2 = e;
                break
            case "b1":
                this.gDynamic.schemaId.b1 = e;
                selectedSchema.schemaIdB1 = e;
                break
            case "b2":
                this.gDynamic.schemaId.b2 = e;
                selectedSchema.schemaIdB2 = e;
                break
            default:
                break
        }
        let strA1 = "", strA2 = "", strBb = "", strB = "", strC = "";
        if (this.gDynamic.schemaId.a1 !== -99999) strA1 = this.gDynamic.schemaId.a1.toString();
        if (this.gDynamic.schemaId.a2 !== -99999) strA2 = this.gDynamic.schemaId.a2.toString();
        if (this.gDynamic.schemaId.b1 !== -99999) {  // 空间 + 网元
            if (this.gDynamic.schemaId.b1 > 99) {
                strBb = this.gDynamic.schemaId.b1.toString()[0];
                strB = this.gDynamic.schemaId.b1.toString().substr(1, 2);
            } else {
                strB = this.gDynamic.schemaId.b1.toString();
            }
            if (this.gDynamic.schemaId.b2 !== -99999) {
                strC = this.gDynamic.schemaId.b2.toString()
            }
        } else if (this.gDynamic.schemaId.b2 !== -99999) { // 网元 + 序号
            if (this.gDynamic.schemaId.b2 > 99) {
                strBb = this.gDynamic.schemaId.b2.toString()[0];
                strB = this.gDynamic.schemaId.b2.toString().substr(1, 2);
            } else {
                strB = this.gDynamic.schemaId.b2.toString();
            }
            strC = (++this.gDynamic.schemaId.index).toString();

        }
        // schemaId = strBb + "-260-" + strA1 + "-" + strA2 + "-" + strB + "-" + strC;
        schemaId = strBb + "260" + strA1 + strA2 + strB + strC;

        selectedSchema.schema_id = schemaId;

        this.setState({selectedSchema: selectedSchema});
    }

    // >>> CHECKBOX <<<

    // >>> BUTTON <<<

    onButtonProductsChangeComponentSizeClicked(e) {

        let styleLayoutLeftRight = "NN";

        if (this.state.styleLayoutLeftRight !== "SN") styleLayoutLeftRight = "SN";

        this.setState({
            styleLayoutLeftRight: styleLayoutLeftRight
        })
    }

    onButtonChangeComponentLayoutUpDownClicked(e) {

        let styleLayoutUpDown = "NN";

        if (this.state.styleLayoutUpDown !== "SN") styleLayoutUpDown = "SN";

        this.setState({
            styleLayoutUpDown: styleLayoutUpDown
        }, () => {
            this.setState({
                tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 39 - 16,
            })
        })
    }

    onButtonChangeComponentLayout4EditClicked(e) {
        let styleLayoutLeftRight = "NN";
        let styleLayoutUpDown = "NN";

        if (this.state.styleLayoutUpDown !== "NS") {
            styleLayoutLeftRight = "SN";
            styleLayoutUpDown = "NS";
        }

        this.setState({
            styleLayoutLeftRight: styleLayoutLeftRight,
            styleLayoutUpDown: styleLayoutUpDown
        }, () => {
            if (this.state.styleLayoutUpDown !== "NS") {
                this.setState({
                    tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 39 - 16,
                })
            }
        })
    }

    //TODO:BM >>>>> 点击按钮，新增 SCHEMA
    onButtonSchemasAddClicked(e) {
        let schema = new TadKpiSchema();
        schema.schema_zhname = "新增指标组";
        schema.schema_id = "0260000000";

        this.doAddSchema(schema, "add");
    }

    onButtonSchemasCopyPasteClicked(e) {
        let sid = this.gCurrent.schema.id;
        if (this.gMap.schemas.has(sid)) {
            let schema = this.gMap.schemas.get(sid);
            this.doCloneSchema(schema);
        }
    }

    onButtonSchemasExportClicked(e) {
        this.context.showMessage("导出指标组，开发中...");
    }

    onButtonSchemasResetClicked(e) {
        this.context.showMessage("重置指标组属性，开发中... 2021-06-18");
    }

    onButtonSchemasCommitClicked(e) {
        this.context.showMessage("提交近期指标组变更，开发中...");
    }

    //TODO:BM >>>>> 点击按钮，新增KPI
    onButtonKpisAddClicked(e) {
        let kpi = new TadKpi();
        const {selectedSchema} = this.state;
        let index = this.gCurrent.schema.kpis.length + 1;
        kpi.sid = selectedSchema.id;
        kpi.kpi_id = selectedSchema.schema_id + index.toString().padStart(2, "0");
        kpi.kpi_zhname = "新增指标";
        kpi.kpi_enname = "newIndicator" + index.toString().padStart(2, "0");
        kpi.kpi_field = "field" + index.toString().padStart(2, "0");
        this.doAddKpi(kpi, "add");
    }

    onButtonKpisCopyPasteClicked(e) {

        this.context.showMessage("开发中...");
    }

    onButtonKpisDeleteClicked(e) {
        this.context.showMessage("删除指标，开发中...");
    }

    onButtonCountersDeleteClicked(e) {
        this.context.showMessage("移除原始指标，开发中...");
    }

    onButtonIndicatorsCopy2CountersClicked(e) {
        this.context.showMessage("移入原始指标统计数据，开发中...");
    }

    onButtonIndicatorsRefreshClicked(e) {
        this.setState({
            tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 39 - 16,
        })

    }

    onButtonIndicatorsImportClicked() {
        this.context.showMessage("导入规范指标，已经开发完成，暂时屏蔽...");

        //this.doGetExcel();
    }

    onButtonIndicatorsExportClicked(e) {
        this.context.showMessage("导出规范指标，开发中...");
    }

    //TODO:BM >>>>> 确认对话框
    onModalButtonOkClicked() {
        const {modalWhat} = this.state;

        switch (modalWhat) {
            case "删除指标组":
                this.doDeleteSchema();
                break
            case "删除指标":
                let kid = this.gCurrent.kpi.id;
                let kpi = this.gMap.kpis.get(kid);
                this.doDeleteKpi(kpi);
                break
            case "删除统计数据":
                this.doDeleteCounter();
                break
            default:
                break
        }

        this.setState({
            isModalVisible: false
        });
    }

    onModalButtonCancelClicked() {
        this.setState({
            isModalVisible: false,
            modalWhat: ""
        })
    }


    // >>> TABLE <<<

    onRowIndicatorCounterSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    onTableIndicatorsExpandedRowRender(record) {
        if (record.counters.length > 0) {
            const columns = [
                {title: "统计数据中文名称", dataIndex: "counter_zhname", key: "counter_zhname", width: this.state.columnWidths.czn},
                {title: "统计数据中文名称", dataIndex: "counter_enname", key: "counter_enname", width: this.state.columnWidths.cen},
                {title: "主表", dataIndex: "base_tab_name", key: "base_tab_name", width: this.state.columnWidths.cbtn},
                {title: "主表列", dataIndex: "base_tab__col_name", key: "base_tab__col_name", width: this.state.columnWidths.cbtcn},
                {title: "COUNTER表", dataIndex: "counter_tab_name", key: "counter_tab_name", width: this.state.columnWidths.ctn},
                {title: "COUNTER表列", dataIndex: "counter_tab__col_name", key: "counter_tab__col_name", width: this.state.columnWidths.ctcn},
                {title: "时间汇总算法", dataIndex: "counter_time_type", key: "counter_time_type", width: this.state.columnWidths.ctt},
                {title: "空间汇总算法", dataIndex: "counter_geo_type", key: "counter_geo_type", width: this.state.columnWidths.cgt},
                // {title: "统计数据中文名称", dataIndex: "counter_zhname", key: "counter_zhname"},
                // {title: "统计数据中文名称", dataIndex: "counter_enname", key: "counter_enname"},
                // {title: "主表", dataIndex: "base_tab_name", key: "base_tab_name"},
                // {title: "主表列", dataIndex: "base_tab__col_name", key: "base_tab__col_name"},
                // {title: "COUNTER表", dataIndex: "counter_tab_name", key: "counter_tab_name"},
                // {title: "COUNTER表列", dataIndex: "counter_tab__col_name", key: "counter_tab__col_name"},
                // {title: "时间汇总算法", dataIndex: "counter_time_type", key: "counter_time_type"},
                // {title: "空间汇总算法", dataIndex: "counter_geo_type", key: "counter_geo_type"},
                {title: "导入时间", dataIndex: "import_time", key: "import_time"},
            ]

            return <Table
                bordered={true}
                size={"small"}
                columns={columns}
                dataSource={record.counters}
                pagination={false}
                scroll={{
                    x: this.state.tableIndicatorCountersScrollX
                }}
                rowSelection={{
                    type: "checkbox",
                    ...this.onRowIndicatorCounterSelected
                }}
            />;
        } else {
            return null;
        }
    }

    // >>> INPUT <<<

    onInputSchemaZhNameChanged(e) {

    }

    onInputSearchSchemaChange(e) {

    }

    onInputSearchKpiChange(e) {
        const {value} = e.target;

        let uiSchemas = [];
        let uiKpis = [];
        let n = 0;
        let setSchemas = new Set();

        if (value !== "") {
            this.gData.kpis.forEach(function (item) {
                let kid = item.id;
                let kpiId = item.kpi_id === null ? -1 : item.kpi_id;
                let kpiName = item.kpi_zhname === null ? "" : item.kpi_zhname;
                let schemaId = item.sid === null ? -1 : item.sid;
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
                            key: kid,
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

    onInputSearchIndicatorsChanged(e) {
        const {value} = e.target;

        this.gCurrent.searchTextOfIndicators = value;
    }

    onInputSearchIndicatorsSearched(value, event) {
        let sv = value;
        let mapIndicators = this.gMap.indicators;
        let dsIndicators = [];
        let setIndicators = new Set();

        if (sv && sv !== "") {
            sv = sv.toLowerCase();
            this.gData.indicators.forEach(function (item) {
                let iZhName = item.indicator_zhname === null ? "" : item.indicator_zhname.toLowerCase();
                let iEnName = item.indicator_enname === null ? "" : item.indicator_enname.toLowerCase();
                let iDef = item.indicator_definition === null ? "" : item.indicator_definition.toLowerCase();
                let iZhExp = item.indicator_zhexp === null ? "" : item.indicator_zhexp.toLowerCase();
                let iEnExp = item.indicator_enexp === null ? "" : item.indicator_enexp.toLowerCase();
                let ikZhName = item.kpi_zhname === null ? "" : item.kpi_zhname.toLowerCase();
                let ikEnName = item.kpi_enname === null ? "" : item.kpi_enname.toLowerCase();
                let ikExp = item.kpi_exp === null ? "" : item.kpi_exp.toLowerCase();
                let ikExpDesc = item.kpi_exp_desc === null ? "" : item.kpi_exp_desc.toLowerCase();

                if ((iZhName.indexOf(sv) >= 0) ||
                    (iEnName.indexOf(sv) >= 0) ||
                    (iDef.indexOf(sv) >= 0) ||
                    (iZhExp.indexOf(sv) >= 0) ||
                    (iEnExp.indexOf(sv) >= 0) ||
                    (ikZhName.indexOf(sv) >= 0) ||
                    (ikEnName.indexOf(sv) >= 0) ||
                    (ikExp.indexOf(sv) >= 0) ||
                    (ikExpDesc.indexOf(sv) >= 0)) {
                    dsIndicators.push(item);
                    setIndicators.add(item.id);
                }
            });

            for (let i = 0; i < this.gData.indicatorCounters.length; i++) {
                let item = this.gData.indicatorCounters[i];
                let iId = item.indicator_id;
                let cZhName = item.counter_zhname === null ? "" : item.counter_zhname.toLowerCase();
                let cEnName = item.counter_enname === null ? "" : item.counter_enname.toLowerCase();

                if ((cZhName.indexOf(sv) >= 0) || (cEnName.indexOf(sv) >= 0)) {
                    let indicator = mapIndicators.has(iId) ? mapIndicators.get(iId) : null;
                    if (indicator) {
                        if (!setIndicators.has(iId)) {
                            dsIndicators.push(indicator);
                            setIndicators.add(iId);
                        }
                    }
                }
            }

            this.setState({
                dsIndicators: dsIndicators
            })
        } else {
            this.setState({
                dsIndicators: this.gUi.dsIndicators
            })
        }

    }

    onInputSearchSchemasSearched(value, event) {
        let sv = value;

        if (sv && sv !== "") {
            sv = sv.toLowerCase();
            let mySchemas = this.toUiSchemas(this.gData.schemas, sv);
            // let uiSchemas = [];
            // let n = 0;
            // this.gData.schemas.forEach(function (item) {
            //     let schemaId = item.schema_id === null ? -1 : item.schema_id;
            //     let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;
            //
            //     if (schemaId !== -1 &&
            //         schemaName !== "" &&
            //         schemaName.length > 0 &&
            //         schemaName[0] !== "?" &&
            //         schemaName[schemaName.length - 1] !== "?") {
            //         if ((schemaName.indexOf(value) >= 0) || (item.schema_id.toString().indexOf(value) >= 0)) {
            //             n++;
            //             let uiSchema = {
            //                 key: n + "_" + item.schema_id,
            //                 title: n + " - " + item.schema_id + "-" + item.schema_zhname,
            //                 children: []
            //             }
            //             uiSchemas.push(uiSchema);
            //         }
            //     }
            // });

            this.setState({
                treeDataKpiSchemas: mySchemas.uiDs
            })
        } else {
            this.setState({
                treeDataKpiSchemas: this.gUi.schemas
            })
        }
    }

    onFormSchemaPropertiesFinish(values) {
        let schema = new TadKpiSchema();
        const {selectedSchema} = this.state;
        schema.id = selectedSchema.id;
        schema.schema_id = selectedSchema.schema_id;

        schema.schema_zhname = values.schemaZhName;
        schema.counter_tab_name = values.counterTabName;

        this.doUpdateSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateSchema(result.data.data, "update");
                    //todo:: this.dsUpdateKpi(result.data.data, "update");
                    this.context.showMessage("更新成功，更新指标组内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    onFormSchemaPropertiesFinishFailed(errorInfo) {

    }

    onFormKpiPropertiesFinish(values) {
        let kpi = lodash.cloneDeep(this.gCurrent.kpi);

        // kpi.id = this.gCurrent.kpi.id;
        // kpi.sid = this.gCurrent.schema.id;
        // kpi.kpi_id = this.gCurrent.kpi.kpi_id;
        // kpi.kpi_field = this.gCurrent.kpi.kpi_field;
        kpi.kpi_zhname = values.kpiZhName;
        kpi.kpi_enname = values.kpiEnName;
        kpi.kpi_alarm = values.kpiAlarm;
        kpi.kpi_format = values.kpiFormat;
        kpi.kpi_min_value = values.kpiMinValue;
        kpi.kpi_max_value = values.kpiMaxValue;
        kpi.used_info = values.kpiUsedProduct + "," + values.kpiUsedModule + "," + values.kpiUsedTitle + ";"

        this.restUpdateKpi(kpi).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateKpi(result.data.data, "update");
                    this.dsUpdateKpi(result.data.data, "update");
                    this.context.showMessage("保存成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    onFormKpiPropertiesFinishFailed(errorInfo) {

    }

    onFormSchemaPropertiesFill(schema) {
        this.refFormSchemaProperties.current.setFieldsValue({
            schemaZhName: schema.schema_zhname,
        });
    }

    onFormKpiPropertiesFill(kpi) {
        this.refFormKpiProperties.current.setFieldsValue({
            kpiZhName: kpi.kpi_zhname,
            kpiEnName: kpi.kpi_enname,
        });
    }

    //TODO:BM >>>>> render
    render() {
        return (
            <div key="ComponentServicePerformance"
                 className={this.state.styleLayoutLeftRight === "NN" ? "ServicePerformance" : "ServicePerformance BoxServicePerformanceSmall"}>
                <div className={"BoxKpiSchemas"}>
                    <div className={"BoxTitleBar"}>
                        {this.state.styleLayoutLeftRight === "NN" ? (
                            <Fragment>
                                <div className={"BoxTitle"}>指标组</div>
                                <div className={"BoxButtons"}>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<PlusSquareOutlined/>}
                                        onClick={this.onButtonSchemasAddClicked}>新增</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<CopyOutlined/>}
                                        onClick={this.onButtonSchemasCopyPasteClicked}>复制</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<MinusSquareOutlined/>}
                                        // onClick={this.onButtonSchemasDeleteClicked}
                                        onClick={() => {
                                            this.showModal("删除指标组")
                                        }}>删除</Button>
                                    <Button
                                        size={"small"}
                                        type={"primary"}
                                        icon={<CloudDownloadOutlined/>}
                                        onClick={this.onButtonSchemasExportClicked}>导出</Button>
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
                                icon={this.state.styleLayoutLeftRight === "NN" ? <CaretLeftOutlined/> : <CaretRightOutlined/>}
                                onClick={this.onButtonProductsChangeComponentSizeClicked}/>
                        </div>
                    </div>
                    {this.state.styleLayoutLeftRight === "NN" ? (
                        <Fragment>
                            <div className={"BoxTree"}>
                                <div className={"BoxCommit"}>
                                    <Select defaultValue="-1">
                                        <Option value="-1">变更：全集</Option>
                                        <Option value="1">变更：K - 新增话务指标 - 2021-07-01</Option>
                                    </Select>
                                    <Button
                                        // size={"small"}
                                        type={"primary"}
                                        icon={<BranchesOutlined/>}
                                        onClick={this.onButtonSchemasCommitClicked}>提交变更</Button>

                                </div>
                                <Input.Search
                                    className={"BoxSearch"}
                                    placeholder="Search"
                                    enterButton
                                    onChange={this.onInputSearchSchemaChange}
                                    onSearch={this.onInputSearchSchemasSearched}
                                />
                                <div className={"BoxTreeInstance"}>
                                    <Tree
                                        ref={this.refTreeSchema}
                                        // checkable
                                        // onCheck={this.onTreeKpiSchemasChecked}
                                        blockNode={true}
                                        showLine={{showLeafIcon: false}}
                                        showIcon={true}
                                        switcherIcon={<CaretDownOutlined/>}
                                        onSelect={this.onTreeKpiSchemasSelected}
                                        treeData={this.state.treeDataKpiSchemas}
                                    />
                                </div>
                            </div>
                        </Fragment>
                    ) : (<Fragment>
                            <div className="BoxKpiSchemasSmall">指<br/>标<br/>组</div>
                        </Fragment>
                    )}
                </div>
                <div
                    className={this.state.styleLayoutUpDown === "NN" ? "BoxKpiRelated" : this.state.styleLayoutUpDown === "SN" ? "BoxKpiRelated BoxKpiRelatedSmall" : "BoxKpiRelated BoxKpiRelatedSmaller"}>
                    <div className={"BoxKpisAndProperties"}>
                        <div
                            className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxKpisAndCounterTab" : "BoxKpisAndCounterTab BoxKpisAndCounterTabSmall"}>
                            <div className={"BoxKpis"}>
                                <div className={"BoxTitleBar"}>
                                    <div className={"BoxTitle"}>指标</div>
                                    {((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? (
                                        <Fragment>
                                            <div className={"BoxButtons"}>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<PlusSquareOutlined/>}
                                                    onClick={this.onButtonKpisAddClicked}>新增</Button>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<MinusSquareOutlined/>}
                                                    onClick={() => {
                                                        this.showModal("删除指标")
                                                    }}>删除</Button>
                                            </div>
                                        </Fragment>) : (<Fragment>
                                            <div>&nbsp;</div>
                                        </Fragment>
                                    )}
                                    <div>
                                        <Button
                                            size={"small"}
                                            type={"ghost"}
                                            icon={<LayoutOutlined/>}
                                            onClick={this.onButtonChangeComponentLayout4EditClicked}/>
                                    </div>
                                </div>
                                {((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? (
                                    <Fragment>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTreeInstance"}>
                                                <Tree treeData={this.state.treeDataKpis}
                                                      blockNode
                                                      draggable
                                                      showIcon
                                                      showLine={{showLeafIcon: false}}
                                                      switcherIcon={<CaretDownOutlined/>}
                                                      onSelect={this.onTreeKpisSelected}
                                                      onDrop={this.onTreeKpisDrop}/>
                                            </div>
                                        </div>
                                    </Fragment>
                                ) : (<Fragment>
                                </Fragment>)}
                            </div>
                            {((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? (
                                <Fragment>
                                    <div className={"BoxCounterTab"}>
                                        <div className={"BoxTitleBar"}>
                                            <div className={"BoxTitle"}>原始指标</div>
                                            <div className={"BoxButtons"}>
                                                <Button
                                                    size={"small"}
                                                    type={"primary"}
                                                    icon={<MinusSquareOutlined/>}
                                                    onClick={() => {
                                                        this.showModal("删除统计数据")
                                                    }}>删除</Button>
                                            </div>
                                            <div>
                                                <Button
                                                    size={"small"}
                                                    type={"ghost"}
                                                    icon={<LayoutOutlined/>}
                                                    onClick={this.onButtonChangeComponentLayout4EditClicked}/>
                                            </div>
                                        </div>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTreeInstance"}>
                                                <Tree
                                                    blockNode={true}
                                                    showLine={{showLeafIcon: false}}
                                                    showIcon={true}
                                                    switcherIcon={<CaretDownOutlined/>}
                                                    onSelect={this.onTreeKpisSelected}
                                                    treeData={this.state.treeDataKpiCounters}
                                                /></div>
                                        </div>
                                    </div>
                                </Fragment>
                            ) : (<Fragment>
                            </Fragment>)}
                        </div>
                        <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxPropertiesBorder" : "BoxPropertiesBorder BoxPropertiesBorderSmall"}>
                            <Form ref={this.refFormSchemaProperties} name="formSchemaProperties" initialValues={{remember: true}} onFinish={this.onFormSchemaPropertiesFinish}
                                  onFinishFailed={this.onFormSchemaPropertiesFinishFailed}>
                                <div className={"BoxTitleBar"}>
                                    <div className={"BoxTitle"}>指标组属性 - {this.state.selectedSchema.schema_id}</div>
                                    <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxButtons" : "BoxButtons BoxHidden"}>
                                        <Button size={"small"} type={"primary"} icon={<SaveOutlined/>} htmlType="submit">保存</Button>
                                        {/*<Button size={"small"} type={"primary"} icon={<UndoOutlined />} onClick={this.onButtonSchemasResetClicked}>恢复</Button>*/}
                                    </div>
                                    <div>
                                        <Button size={"small"} type={"ghost"} icon={<LayoutOutlined/>} onClick={this.onButtonChangeComponentLayout4EditClicked}/>
                                    </div>
                                </div>
                                <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxPropertiesSchema" : "BoxPropertiesSchema BoxHidden"}>
                                    <div className={"BoxSchemaIds"}>
                                        <Select
                                            defaultValue={-99999}
                                            value={this.state.selectedSchema.schemaIdA1}
                                            options={this.state.optionsSchemaIdA1}
                                            onChange={(e) => {
                                                this.onSelectSchemaIdChanged(e, "a1")
                                            }}/>
                                        <Select
                                            defaultValue={-99999}
                                            value={this.state.selectedSchema.schemaIdA2}
                                            options={this.state.optionsSchemaIdA2}
                                            onChange={(e) => {
                                                this.onSelectSchemaIdChanged(e, "a2")
                                            }}/>
                                        <Select
                                            defaultValue={-99999}
                                            value={this.state.selectedSchema.schemaIdB1}
                                            options={this.state.optionsSchemaIdB1}
                                            onChange={(e) => {
                                                this.onSelectSchemaIdChanged(e, "b1")
                                            }}/>
                                        <Select
                                            defaultValue={-99999}
                                            value={this.state.selectedSchema.schemaIdB2}
                                            options={this.state.optionsSchemaIdB2}
                                            onChange={(e) => {
                                                this.onSelectSchemaIdChanged(e, "b2")
                                            }}/>
                                    </div>
                                    <div>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="schemaZhName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标组中文名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                    </div>
                                    <div className={"BoxVendorObjectClass"}>
                                        <Select defaultValue="-1">
                                            <Option value="-1">不区分厂家</Option>
                                        </Select>
                                        <Select defaultValue="-1">
                                            <Option value="-1">网元类型</Option>
                                        </Select>
                                        <Select defaultValue="-1">
                                            <Option value="-1">网元细分类型</Option>
                                        </Select>
                                        <Select defaultValue="-1">
                                            <Option value="-1">采集粒度</Option>
                                        </Select>
                                    </div>
                                    <div>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="counterTabName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标组统计数据存储表名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                    </div>
                                </div>
                            </Form>
                            <Form ref={this.refFormKpiProperties} name="formKpiProperties" initialValues={{remember: true}} onFinish={this.onFormKpiPropertiesFinish}
                                  onFinishFailed={this.onFormKpiPropertiesFinishFailed}>
                                <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxTitleBar" : "BoxTitleBar BoxHidden"}>
                                    <div className={"BoxTitle"}>指标属性 - {this.state.selectedKpi.kpi_id}</div>
                                    <div className={"BoxButtons"}>
                                        <Button size={"small"} type={"primary"} icon={<SaveOutlined/>} htmlType="submit">保存</Button>
                                        {/*<Button size={"small"} type={"primary"} icon={<UndoOutlined />} onClick={this.onButtonKpisResetClicked}>恢复</Button>*/}
                                    </div>
                                    <div>
                                        <Button size={"small"} type={"ghost"} icon={<LayoutOutlined/>} onClick={this.onButtonChangeComponentLayout4EditClicked}/>
                                    </div>
                                </div>
                                <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxPropertiesKpi" : "BoxPropertiesKpi BoxHidden"}>
                                    <div className={"BoxNames"}>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="kpiZhName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标中文名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="kpiEnName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标英文名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                    </div>
                                    <div className={"BoxKpiValues"}>
                                        <Form.Item name="kpiAlarm" className="BoxFormItemInput">
                                            <Select>
                                                <Option value="0">不发告警</Option>
                                                <Option value="1">发送告警</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="kpiFormat" className="BoxFormItemInput">
                                            <Select>
                                                <Option value="0">不指定格式</Option>
                                                <Option value="1">格式：R2</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="kpiMinValue" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标最小值" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                        <Form.Item className="BoxFormItemInput">
                                            <Form.Item name="kpiMaxValue" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="输入指标最大值" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                    </div>
                                    <div className={"BoxUsedInfo"}>
                                        <div className={"BoxProductModuleName"}>
                                            <Form.Item name="kpiUsedProduct" className="BoxFormItemInput">
                                                <Select>
                                                    <Option value="-1">使用该指标的产品</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item name="kpiUsedModule" className="BoxFormItemInput">
                                                <Select>
                                                    <Option value="-1">使用该指标的模块</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item className="BoxFormItemInput">
                                                <Form.Item name="kpiUsedTitle" noStyle><Input/></Form.Item>
                                                <Tooltip placement="topLeft" title="输入该指标在界面上的显示标题" arrowPointAtCenter>
                                                    <div className="input-icon"><QuestionCircleOutlined/></div>
                                                </Tooltip>
                                            </Form.Item>
                                            <Button icon={<PlusOutlined/>}/>
                                        </div>
                                    </div>
                                </div>
                                <div className={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? "BoxKpiExp" : "BoxKpiExp BoxHidden"}>
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="kpiExp" noStyle><TextArea autoSize={{minRows: 3, maxRows: 5}}/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标计算表达式" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                            </Form>
                        </div>
                    </div>
                    <div className={"BoxKpisStandard"}>
                        <div className={"BoxTitleBar"}>
                            <div className={"BoxTitle"}>规范指标</div>
                            {((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "SN")) ? (
                                <Fragment>
                                    <div className={"BoxButtons"}>
                                        <Button
                                            size={"small"}
                                            type={"primary"}
                                            icon={<CloudUploadOutlined/>}
                                            onClick={this.onButtonIndicatorsCopy2CountersClicked}>移入指标组</Button>
                                        <Button
                                            size={"small"}
                                            type={"primary"}
                                            icon={<CloudUploadOutlined/>}
                                            onClick={this.onButtonIndicatorsRefreshClicked}>刷新</Button>
                                        <Button
                                            size={"small"}
                                            type={"primary"}
                                            icon={<CloudUploadOutlined/>}
                                            onClick={this.onButtonIndicatorsImportClicked}>导入</Button>
                                        <Button
                                            size={"small"}
                                            type={"primary"}
                                            icon={<CloudDownloadOutlined/>}
                                            onClick={this.onButtonIndicatorsExportClicked}>导出</Button>
                                    </div>
                                </Fragment>) : (<Fragment>
                                <div>&nbsp;</div>
                            </Fragment>)}
                            <div>
                                <Button
                                    size={"small"}
                                    type={"ghost"}
                                    icon={((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "NS")) ? <CaretUpOutlined/> : <CaretDownOutlined/>}
                                    onClick={this.onButtonChangeComponentLayoutUpDownClicked}/>
                            </div>
                        </div>
                        {((this.state.styleLayoutUpDown === "NN") || (this.state.styleLayoutUpDown === "SN")) ? (
                            <Fragment>
                                <div className={"BoxTableIndicators"}>
                                    <div className={"BoxSearch"}>
                                        <Input.Search
                                            placeholder="Search"
                                            enterButton
                                            onChange={this.onInputSearchIndicatorsChanged}
                                            onSearch={this.onInputSearchIndicatorsSearched}
                                        />
                                    </div>
                                    <div ref={this.refBoxDetail} className={"BoxAuto"}>
                                        <div className={"Box2"}>
                                            <Table rowKey="id"
                                                // title={() => this.state.tableIndicatorsTitle}
                                                   loading={this.state.tableIndicatorsIsLoading}
                                                   dataSource={this.state.dsIndicators}
                                                // columns={this.state.columnsIndicator}
                                                   bordered={true}
                                                   size={"small"}
                                                   scroll={{
                                                       x: this.state.tablePropertiesScrollX,
                                                       y: this.state.tablePropertiesScrollY
                                                   }}
                                                   pagination={{
                                                       pageSize: this.state.pageSizeIndicators,
                                                       position: ["none", "none"]
                                                   }}
                                                   rowSelection={{
                                                       type: "checkbox",
                                                       ...this.onRowIndicatorCounterSelected
                                                   }}
                                                   expandedRowRender={this.onTableIndicatorsExpandedRowRender}
                                                   expandable={{
                                                       rowExpandable: (record) => record.counters.length > 0
                                                   }}
                                            >
                                                <Column title=<KColumnTitle content="序号" className="clsColumnTitle"/>
                                                className="ColumnKey"
                                                dataIndex='index'
                                                key='index'
                                                align='center'
                                                width={this.state.columnWidths.key}
                                                fixed={true}
                                                />
                                                <Column title=<KColumnTitle content="来自表单" className="clsColumnTitle"/>
                                                className="ColumnIesn"
                                                dataIndex='excel_sheet_name'
                                                key='excel_sheet_name'
                                                align='center'
                                                width={this.state.columnWidths.esn}
                                                fixed={true}
                                                />
                                                <Column title=<KColumnTitle content="指标中文名称" className="clsColumnTitle"/>
                                                dataIndex='indicator_zhname'
                                                key='indicator_zhname'
                                                width={this.state.columnWidths.izn}
                                                sorter={(a, b) => a.indicator_zhname > b.indicator_zhname}
                                                sortDirections={['descend', 'ascend']}
                                                fixed={true}
                                                />
                                                <Column title=<KColumnTitle content="指标单位" className="clsColumnTitle"/>
                                                dataIndex='indicator_unit'
                                                key='indicator_unit'
                                                align='center'
                                                width={this.state.columnWidths.iu}/>
                                                <Column title=<KColumnTitle content="时间粒度" className="clsColumnTitle"/>
                                                dataIndex='indicator_time_type'
                                                key='indicator_time_type'
                                                align='center'
                                                width={this.state.columnWidths.itt}/>
                                                <Column title=<KColumnTitle content="空间粒度" className="clsColumnTitle"/>
                                                dataIndex='indicator_geo_type'
                                                key='indicator_geo_type'
                                                align='center'
                                                width={this.state.columnWidths.igt}/>
                                                <Column title=<KColumnTitle content="指标定义" className="clsColumnTitle"/>
                                                dataIndex='indicator_definition' key='indicator_definition' width={this.state.columnWidths.idef}/>
                                                {/*<Column title=<KColumnTitle content="指标业务需求" className="clsColumnTitle"/>*/}
                                                {/*dataIndex='indicator_desc' key='indicator_desc' width={this.state.columnWidths.idesc}/>*/}
                                                <Column title=<KColumnTitle content="中文映射算法" className="clsColumnTitle"/>
                                                dataIndex='indicator_zhexp'
                                                key='indicator_zhexp'
                                                render={(zhexp, record) => {
                                                return <div>
                                                    <div>{record.indicator_zhexp}</div>
                                                    <div>{record.indicator_enexp}</div>
                                                </div>
                                            }}
                                                />
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>) : (<Fragment></Fragment>
                        )}
                    </div>
                </div>
                <Modal title="系统提示窗口" visible={this.state.isModalVisible} onOk={this.onModalButtonOkClicked} onCancel={this.onModalButtonCancelClicked}>
                    <p>{this.state.modalMessage}</p>
                </Modal>
            </div>
        )
    }
}

