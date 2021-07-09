import React, {Fragment} from 'react'
import './ServiceProject.scss'
import GCtx from "../GCtx";
import Mock from 'mockjs'
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import XLSX from 'xlsx';
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";
import KpiOlogParams from "../params/KpiOlogParams";
import {Button, Input, Select, Tree, Modal, Table,} from 'antd'
import {
    CaretDownOutlined,
    CheckOutlined,
    CloseOutlined,
    CloudDownloadOutlined,
    CopyOutlined,
    MinusSquareOutlined,
    PlusSquareOutlined,
} from '@ant-design/icons'
import KColumnTitle from "./KColumnTitle";

export default class ServiceProject extends React.PureComponent {
    static contextType = GCtx;

    gMap = {};
    gData = {};
    gCurrent = {
        schema: null,
        kpi: null,
        kpisChecked: [],
        initForSchema: function () {
            this.schema = null;
            this.kpi = null;
            this.kpisChecked = [];
        }
    };
    gUi = {};
    gDynamic = {
        schemaId: {
            a1: -99999,
            a2: -99999,
            b1: -99999,
            b2: -99999,
            index: 0
        }
    }
    gRef = {
        boxTreeSchemas: React.createRef(),
        textAreaKpiExp: React.createRef(),
        treeProjects: React.createRef(),
        treeSchemas: React.createRef(),
        treeKpis: React.createRef(),
        tableProjectKpis: React.createRef(),
    };
    gSchemaIdRegionCodes = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 99, 150, 151, 152, 153, 154, 155, 156, 157, 199];
    gSchemaIdDefault = "260959975"; // 通用-天-全国-保留
    gTreeSchemasScrollTo = null;

    constructor(props) {
        super(props);

        this.state = {
            message: "",
            isModalVisible: false,
            modalWhat: "",
            modalMessage: "",
            styleLayout: "NN",
            treeDataProjects: [],
            treeDataKpiSchemas: [],
            treeDataKpis: [],
            treeProjectsHeight: 100,
            treeSchemasHeight: 100,
            treeSchemasScroll: 1,
            optionsSchemaIdA1: [{label: "业务分类", value: -99999}],
            optionsSchemaIdA2: [{label: "时间粒度", value: -99999}],
            optionsSchemaIdB1: [{label: "空间粒度", value: -99999}],
            optionsSchemaIdB2: [{label: "网元类型", value: -99999}],
            optionsVendor: [{label: "厂家", value: -99999}],
            optionsObjectClass: [{label: "网元类型", value: -99999}],
            optionsObjectSubClass: [{label: "网元细分类型", value: -99999}],
            optionsIntervalFlag: [{label: "采集粒度", value: -99999}],
            optionsProduct: [{label: "使用该指标的产品", value: -99999}],
            optionsModule: [{label: "使用该指标的模块", value: -99999}],
            kpiExpDisplay: "",
            schema: {
                schema_id: "",
            },
            kpi: {
                kpi_id: "",
            },
            dsProjectKpis: [],
            tableProjectKpisScrollX: "auto",
            tableProjectKpisScrollY: "auto",
            pageSizeProjectKpis: 50,
        }

        //todo >>>>> bind(this)
        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);

        this.searchKpis = this.searchKpis.bind(this);
        this.dataSchemas2DsMapUiTree = this.dataSchemas2DsMapUiTree.bind(this);
        this.isFoundKpis = this.isFoundKpis.bind(this);
        this.uiUpdateSchema = this.uiUpdateSchema.bind(this);
        this.dsUpdateSchema = this.dsUpdateSchema.bind(this);
        this.uiUpdateKpi = this.uiUpdateKpi.bind(this);
        this.dsUpdateKpi = this.dsUpdateKpi.bind(this);
        this.doDisplayExpression = this.doDisplayExpression.bind(this);

        this.doGetAll = this.doGetAll.bind(this);
        this.doGetKpiDict = this.doGetKpiDict.bind(this);
        this.doGetObjectDefs = this.doGetObjectDefs.bind(this);
        this.doGetVendors = this.doGetVendors.bind(this);
        this.doGetKpis = this.doGetKpis.bind(this);
        this.doGetKpiSchemas = this.doGetKpiSchemas.bind(this);
        this.doGetMySchemas = this.doGetMySchemas.bind(this);

        this.restGetKpiCounters = this.restGetKpiCounters.bind(this);
        this.restGetProducts = this.restGetProducts.bind(this);
        this.restGetModules = this.restGetModules.bind(this);
        this.restAddSchema = this.restAddSchema.bind(this);
        this.restDeleteSchema = this.restDeleteSchema.bind(this);
        this.restAddKpi = this.restAddKpi.bind(this);
        this.restDeleteKpi = this.restDeleteKpi.bind(this);
        this.restUpdateKpi = this.restUpdateKpi.bind(this);
        this.restGetKpiOlogs = this.restGetKpiOlogs.bind(this);

        this.doAddSchema = this.doAddSchema.bind(this);
        this.doDeleteSchema = this.doDeleteSchema.bind(this);
        this.doUpdateSchema = this.doUpdateSchema.bind(this);
        this.doAddKpi = this.doAddKpi.bind(this);
        this.doDeleteKpi = this.doDeleteKpi.bind(this);
        this.doUpdateKpi = this.doUpdateKpi.bind(this);

        this.onTreeProjectsSelected = this.onTreeProjectsSelected.bind(this);
        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);
        this.onTreeKpisSelected = this.onTreeKpisSelected.bind(this);
        this.onTreeKpisDrop = this.onTreeKpisDrop.bind(this);

        this.onButtonChangeStyleLayoutClicked = this.onButtonChangeStyleLayoutClicked.bind(this);
        this.onButtonSchemasAddClicked = this.onButtonSchemasAddClicked.bind(this);
        this.onButtonSchemasCopyPasteClicked = this.onButtonSchemasCopyPasteClicked.bind(this);
        this.onButtonSchemasExportClicked = this.onButtonSchemasExportClicked.bind(this);
        this.onButtonSchemasResetClicked = this.onButtonSchemasResetClicked.bind(this);
        this.onButtonKpisAddClicked = this.onButtonKpisAddClicked.bind(this);
        this.onButtonKpisCopyPasteClicked = this.onButtonKpisCopyPasteClicked.bind(this);
        this.onButtonKpisDeleteClicked = this.onButtonKpisDeleteClicked.bind(this);
        this.onButtonKpisShoppingClicked = this.onButtonKpisShoppingClicked.bind(this);

        this.onInputSchemaZhNameChanged = this.onInputSchemaZhNameChanged.bind(this);
        this.onInputSearchSchemasSearched = this.onInputSearchSchemasSearched.bind(this);

        this.onSelectSchemaIdChanged = this.onSelectSchemaIdChanged.bind(this);
        this.onSelectSchemaObjectClassChanged = this.onSelectSchemaObjectClassChanged.bind(this);
        this.onSelectKpiUsedProductChanged = this.onSelectKpiUsedProductChanged.bind(this);

        this.showModal = this.showModal.bind(this);
        this.onModalButtonOkClicked = this.onModalButtonOkClicked.bind(this);
        this.onModalButtonCancelClicked = this.onModalButtonCancelClicked.bind(this);
    }

    test() {

    }

    componentDidMount() {
        // this.doMock();
        this.doPrepare();
        this.doGetAll();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.gTreeSchemasScrollTo !== null) {
            this.gRef.treeSchemas.current.scrollTo({key: this.gTreeSchemasScrollTo});
            this.gTreeSchemasScrollTo = null;
        }
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
        let treeDataProjects = [{
            key: 1,
            title: "北京移动综合网管",
            children: [{
                key: 1 - 1,
                title: "故障分析系统",
                children: []
            }]
        }];

        let dsProjectKpis = [
            {
                key: 1,
                kpi_id: "260999901",
                kpi_zhname: "掉话率",
                kpi_ui_title: "5G掉话率（%）"
            },
            {
                key: 2,
                kpi_id: "260999901",
                kpi_zhname: "掉话率",
                kpi_ui_title: "5G掉话率（%）"
            }, {
                key: 3,
                kpi_id: "260999901",
                kpi_zhname: "掉话率",
                kpi_ui_title: "5G掉话率（%）"
            }, {
                key: 4,
                kpi_id: "260999901",
                kpi_zhname: "掉话率",
                kpi_ui_title: "5G掉话率（%）"
            }]

        this.setState({
            treeDataProjects: treeDataProjects,
            dsProjectKpis: dsProjectKpis
        })
    }

    doInit() {
        this.setState({
            treeSchemasHeight: this.gRef.boxTreeSchemas.current.offsetHeight
        })
    }

    onTableProjectKpisRowSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
            /*
            let isShownButtonAlterIndexConfirm = this.state.isShownButtonAlterIndexConfirm;
            if (isShownButtonAlterIndexConfirm === "block") return false;

            let arrPropertyName = Object.keys(selectedRows[0]);
            let mapValues = new Map();
            for (let item of arrPropertyName) {
                mapValues.set(item, selectedRows[0][item])
            }

            this.gCurrent.selectedRowsTablePropertyIndex = selectedRows[0];

            let editingIndex = JSON.parse(JSON.stringify(this.state.editingIndex));

            editingIndex.key = selectedRows[0].key;
            editingIndex.id = selectedRows[0].id;
            editingIndex.table_id = selectedRows[0].table_id;
            editingIndex.name = selectedRows[0].index_name;
            editingIndex.type = selectedRows[0].index_type;
            editingIndex.columns = selectedRows[0].index_columns;
            editingIndex.attributes = selectedRows[0].index_attributes;
            editingIndex.desc = selectedRows[0].index_desc;

            this.setState({
                editingIndex: editingIndex,
                isEditingKeyIndex: selectedRows[0].key
            })
             */
        },
        renderCell: (checked, record, index, originNode) => {
            /*
            return (
                <Fragment>
                    {this.state.isShownButtonAlterColumnConfirm === "none" && (originNode)}
                </Fragment>
            )

             */
        }
    }

    isFoundKpis(ds, sv) {
        let myResult = false;

        for (let i = 0; i < ds.length; i++) {
            let kpi = this.gMap.kpis.get(ds[i]);
            if (kpi.kpi_zhname?.toLowerCase().indexOf(sv) >= 0
                || kpi.kpi_enname?.toLowerCase().indexOf(sv) >= 0
                || kpi.kpi_id?.toString().indexOf(sv) >= 0) {
                myResult = true;
                break;
            }
        }

        return myResult
    }

    // >>>>> search Kpis in mapSchemas and mapKpis
    searchKpis(sv) {
        let treeDataSchemas = [];
        let arrTitleIds = [];

        this.gMap.schemas.forEach((value, key) => {
            arrTitleIds.push({schema_zhname: value.schema_zhname, id: key, schema_id: value.schema_id});
        })

        arrTitleIds.sort((a, b) => {
            if (a.schema_zhname === b.schema_zhname) {
                if (a.schema_id === b.schema_id) {
                    return a.id >= b.id
                } else {
                    return a.schema_id >= b.schema_id
                }
            } else {
                return a.schema_zhname >= b.schema_zhname
            }
        })

        for (let i = 0; i < arrTitleIds.length; i++) {
            let item = arrTitleIds[i];
            let sid = item.id;
            // 新增指标组，默认schema_id为空
            let schemaId = item.schema_id === null ? this.gSchemaIdDefault : item.schema_id;
            let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

            if (schemaName === "") continue

            if ((sv !== undefined) || (sv !== "")) {
                if (schemaName.toLowerCase().indexOf(sv) < 0 && schemaId.toString().indexOf(sv) < 0) {
                    if (!this.isFoundKpis(this.gMap.schemas.get(sid).kpis, sv)) continue
                }
            }

            let uiSchema = {
                key: item.id,
                title: <div className={"BoxSchemaTitle"}>{item.schema_id + " - " + item.schema_zhname}</div>,
                children: []
            }

            treeDataSchemas.push(uiSchema);
        }

        return treeDataSchemas;
    }

    // >>>>> dataSchemas to DsMap and UiTree
    dataSchemas2DsMapUiTree(ds, sv) {

        let myResult = {mapDs: new Map(), uiDs: []};

        for (let i = 0; i < ds.length; i++) {
            let item = ds[i];
            let sid = item.id;
            // 新增指标组，默认schema_id为空
            let schemaId = item.schema_id === null ? this.gSchemaIdDefault : item.schema_id;
            let schemaName = item.schema_zhname === null ? "" : item.schema_zhname;

            if (schemaName === "") continue

            if (sv !== undefined) {
                if (schemaName.toLowerCase().indexOf(sv) < 0 && schemaId.toString().indexOf(sv) < 0) {
                    if (!this.isFoundKpis(this.gMap.schemas.get(sid).kpis, sv)) continue
                }
            }

            if (!myResult.mapDs.has(sid)) {
                let schemaClone = lodash.cloneDeep(item);

                schemaClone.schema_id = schemaId;
                schemaClone.kpis = [];
                schemaClone.counters = [];
                myResult.mapDs.set(sid, schemaClone)

                let uiSchema = {
                    key: schemaClone.id,
                    title: <div
                        className={"BoxSchemaTitle"}>{schemaClone.schema_id + " - " + schemaClone.schema_zhname}</div>,
                    children: []
                }
                myResult.uiDs.push(uiSchema);
            }
        }

        return myResult;
    }

    // >>>>> ui Update Schema
    uiUpdateSchema(schema, what) {
        let sid = schema.id;
        let treeDataKpiSchemas = lodash.cloneDeep(this.state.treeDataKpiSchemas);

        switch (what) {
            case "add":
                treeDataKpiSchemas.push({
                    key: schema.id,
                    title: <div className="BoxSchemaTitle">{schema.schema_id + " - " + schema.schema_zhname}</div>,
                });
                break
            case "clone":
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    if (treeDataKpiSchemas[i].key === this.gCurrent.schema.id) {
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
                    if (item.key === sid) {
                        item.title =
                            <div className="BoxSchemaTitle">{schema.schema_id + " - " + schema.schema_zhname}</div>;
                        break
                    }
                }

                let treeDataKpis = lodash.cloneDeep(this.state.treeDataKpis);

                for (let i = 0; i < treeDataKpis.length; i++) {
                    let item = treeDataKpis[i];
                    let kid = item.key;
                    let kpi = this.gMap.kpis.get(kid);
                    let kpi_id = schema.schema_id + kpi.kpi_id.substr(kpi.kpi_id.length - 2, 2);
                    item.title = <div className="BoxKpiTitle">{kpi_id + " - " + kpi.kpi_zhname}</div>
                }
                this.setState({
                    treeDataKpis: treeDataKpis
                })

                break
            case "delete":
                let index = -1;

                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    let item = treeDataKpiSchemas[i];
                    if (item.key === this.gCurrent.schema.id) {
                        index = i;
                        break
                    }
                }
                treeDataKpiSchemas.splice(index, 1);

                this.setState({
                    treeDataKpis: [],
                });
                break
            default:
                break;
        }

        this.setState({
                treeDataKpiSchemas: treeDataKpiSchemas
            }, () => {
                if (what === "add") {
                    this.gTreeSchemasScrollTo = schema.id;
                    this.setState({
                        treeSchemasScroll: this.state.treeSchemasScroll + 1
                    })
                }
            }
        )
    }

    // >>>>> ds Update Schema
    dsUpdateSchema(schema, what) {
        switch (what) {
            case "add":
                this.gMap.schemas.set(schema.id, lodash.cloneDeep(schema));
                break
            case "clone":
                let schemaCopy = lodash.cloneDeep(schema);
                schemaCopy.kpis = [];
                schemaCopy.counters = [];
                this.gMap.schemas.set(schema.id, schemaCopy);

                break
            case "update":
                let oldSchema = this.gMap.schemas.get(schema.id);
                oldSchema.schema_id = schema.schema_id;
                oldSchema.schema_zhname = schema.schema_zhname;
                oldSchema.vendor_id = schema.vendor_id;
                oldSchema.object_class = schema.object_class;
                oldSchema.sub_class = schema.sub_class;
                oldSchema.interval_flag = schema.interval_flag;
                oldSchema.counter_tab_name = schema.counter_tab_name;

                this.gMap.schemas.get(schema.id).kpis.forEach((kid) => {
                    let kpi = this.gMap.kpis.get(kid);
                    let newKpi = new TadKpi();

                    newKpi.id = kid;
                    newKpi.kpi_id = schema.schema_id + kpi.kpi_id.substr(kpi.kpi_id.length - 2, 2);

                    this.doUpdateKpi(newKpi);
                })
                break
            case "delete":
                this.gMap.schemas.delete(schema.id);
                break
            default:
                break;
        }
    }

    // >>>>> ui Update Kpi
    uiUpdateKpi(kpi, what) {
        let treeDataKpis;

        switch (what) {
            case "add":
                treeDataKpis = lodash.cloneDeep(this.state.treeDataKpis);

                let uiKpi = {
                    key: kpi.id,
                    title: <div className="BoxKpiTitle">{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
                    children: []
                }

                treeDataKpis.push(uiKpi);

                this.setState({
                    treeDataKpis: treeDataKpis
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
                this.gMap.kpis.set(kpi.id, lodash.cloneDeep(kpi));
                this.gMap.schemas.get(kpi.sid).kpis.push(kpi.id);
                break
            case "update":
                let oldKpi = this.gMap.kpis.get(kpi.id);
                oldKpi.kpi_id = kpi.kpi_id;
                oldKpi.kpi_zhname = kpi.kpi_zhname;
                oldKpi.kpi_enname = kpi.kpi_enname;
                oldKpi.kpi_field = kpi.kpi_field;
                oldKpi.kpi_alarm = kpi.kpi_alarm;
                oldKpi.kpi_format = kpi.kpi_format;
                oldKpi.kpi_min_value = kpi.kpi_min_value;
                oldKpi.kpi_max_value = kpi.kpi_max_value;
                oldKpi.kpi_exp = kpi.kpi_exp;
                oldKpi.used_info = kpi.used_info;
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

    doSleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // >>>>> split schema id
    splitSchemaId(sid) {
        let ids = {
            id: sid,
            a1: "",
            a2: "",
            b1: "",
            b2: "",
            index: "",
            hasRegion: false
        }

        let idFixed = "260";
        let sids = sid.split(idFixed);
        let idObjectClassFirst = sids[0];
        let idType = sids[1][0];
        let idTime = sids[1][1];
        let regionCode = "";
        let idObjectClassSecond = sids[1].substr(2, 2);
        let idIndex = sids[1].substr(sids[1].length - 2, 2);
        let objectClass = parseInt(idObjectClassFirst + idObjectClassSecond);
        if (this.gSchemaIdRegionCodes.includes(objectClass)) {
            ids.hasRegion = true;
            regionCode = objectClass;
            objectClass = sids[1].substr(4, sids[1].length - 4);
            idIndex = "";
        }
        let schemaIdNew = "";
        if (regionCode === "") {
            schemaIdNew = idObjectClassFirst + idFixed + idType + idTime + idObjectClassSecond + idIndex;
        } else {
            schemaIdNew = idObjectClassFirst + idFixed + idType + idTime + idObjectClassSecond + objectClass;
        }

        ids.id = schemaIdNew;
        ids.a1 = parseInt(idType);
        ids.a2 = parseInt(idTime);
        if (ids.hasRegion) {
            ids.b1 = parseInt(regionCode);
            ids.b2 = parseInt(objectClass);
        } else {
            ids.b1 = parseInt(objectClass);
            ids.b2 = parseInt(idIndex);
        }

        return ids;
    }

    showModal(what) {
        this.setState({
            isModalVisible: true,
            modalWhat: what
        })
    };

    //todo >>>>> do Get All
    doGetAll() {
        axios.all([
            this.doGetKpiDict(),
            this.doGetObjectDefs(),
            this.doGetVendors(),
            this.restGetProducts(),
            this.restGetModules(),
            this.doGetKpis(),
            this.doGetKpiSchemas(),
            this.restGetKpiCounters(),
        ]).then(axios.spread((
            kpiDict,
            objectDefs,
            vendors,
            products,
            modules,
            kpis,
            schemas,
            counters,
        ) => {
            let mapKpiDict = new Map();
            let mapObjectDefs = new Map();
            let mapProducts = new Map();
            let mapKpis = new Map();

            let dsKpiDict = kpiDict.data.data;
            let dsObjectDefs = objectDefs.data.data;
            let dsVendors = vendors.data.data;
            let dsProducts = products.data.data;
            let dsModules = modules.data.data;
            let dsKpis = kpis.data.data;
            let dsSchemas = schemas.data.data;
            let dsCounters = counters.data.data;

            // kpi dict ...
            dsKpiDict.forEach((item) => {
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
                    if (this.gSchemaIdRegionCodes.includes(value.id)) {
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
                    if (!this.gSchemaIdRegionCodes.includes(value.id)) {
                        options.push({label: value.txt, value: value.id});
                    }
                });
                this.setState({
                    optionsSchemaIdB2: options
                })
            }

            // 厂家控件
            let optionsVendor = [{label: "厂家", value: -99999}, {label: "不区分厂家", value: -1}];
            for (let i = 0; i < dsVendors.length; i++) {
                if (dsVendors[i].type >= 0 && dsVendors[i].type <= 99) {
                    optionsVendor.push({label: dsVendors[i].zh_name, value: dsVendors[i].type});
                }
            }

            // 网元类型，网元细分类型控件
            let optionsObjectClass = [{label: "网元类型", value: -99999}];
            for (let i = 0; i < dsObjectDefs.length; i++) {
                let item = dsObjectDefs[i];
                if (!mapObjectDefs.has(item.network_type)) {
                    mapObjectDefs.set(item.network_type, {
                        className: item.network_type_name,
                        subClasses: [{
                            objectClass: item.object_class,
                            className: item.object_name,
                        }]
                    });
                    optionsObjectClass.push({label: item.network_type_name, value: item.network_type});
                } else {
                    mapObjectDefs.get(item.network_type).subClasses.push({
                        objectClass: item.object_class,
                        className: item.object_name,
                    });
                }
            }
            this.gMap.objectDefs = mapObjectDefs;

            let optionsObjectSubClass = [{label: "网元细分类型", value: -99999}];

            // 采集粒度控件
            let optionsIntervalFlag = [{label: "采集粒度", value: -99999}];

            // 使用该指标的产品控件
            let optionsProduct = [{label: "使用该指标的产品", value: -99999}];
            for (let i = 0; i < dsProducts.length; i++) {
                let item = dsProducts[i];
                if (!mapProducts.has(item.product_id)) {
                    mapProducts.set(item.product_id, {
                        product_name: item.product_name,
                        modules: []
                    });
                    optionsProduct.push({label: item.product_name, value: item.product_id});
                }
            }

            // 使用该指标的模块控件
            let optionsModule = [{label: "使用该指标的模块", value: -99999}];
            for (let i = 0; i < dsModules.length; i++) {
                let item = dsModules[i];
                if (mapProducts.has(item.product_id)) {
                    mapProducts.get(item.product_id).modules.push({
                        module_name: item.module_name,
                        module_id: item.module_id
                    });
                }
            }
            this.gMap.products = mapProducts;

            // schemas to gMap.schemas
            let mySchemas = this.dataSchemas2DsMapUiTree(dsSchemas);

            // kpis to gMap.kpis and gMap.schemas.kpis
            for (let iKpi = 0; iKpi < dsKpis.length; iKpi++) {
                let item = dsKpis[iKpi];
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

            let mapCounters = new Map();
            dsCounters.forEach((item) => {
                mapCounters.set(item.id, item);

                if (mySchemas.mapDs.has(item.sid)) {
                    mySchemas.mapDs.get(item.sid).counters.push(item.id);
                }
            });

            this.gMap.schemas = mySchemas.mapDs;
            this.gMap.kpis = mapKpis;
            this.gMap.counters = mapCounters;

            // 尝试垃圾回收
            dsKpiDict = null;
            dsObjectDefs = null;
            dsVendors = vendors;
            dsProducts = null;
            dsModules = null;
            dsKpis = null;
            dsSchemas = null;
            dsCounters = null;

            this.setState({
                optionsVendor: optionsVendor,
                optionsObjectClass: optionsObjectClass,
                optionsObjectSubClass: optionsObjectSubClass,
                optionsIntervalFlag: optionsIntervalFlag,
                optionsProduct: optionsProduct,
                optionsModule: optionsModule,
            });

            this.setState({
                treeDataKpiSchemas: mySchemas.uiDs,
            });
        })).then(() => {
            this.doInit();
        });
    }

    doGetObjectDefs() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_object_defs", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetVendors() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_vendors", params,
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

    doGetKpiDict() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_dict", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doUpdateSchema(schema) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/update_kpi_schema",
            schema,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    restAddSchema(schema) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_kpi_schema",
            schema,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    restGetProducts() {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_products",
            {},
            {headers: {'Content-Type': 'application/json'}});
    }

    restGetModules() {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_modules",
            {},
            {headers: {'Content-Type': 'application/json'}});
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

    restFixKpiCounter(counter) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/fix_kpi_counter",
            counter,
            {headers: {'Content-Type': 'application/json'}});
    }

    restAddCounter(counter) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_kpi_counter",
            counter,
            {headers: {'Content-Type': 'application/json'}});
    }

    restUpdateKpi(kpi) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/update_kpi",
            kpi,
            {headers: {'Content-Type': 'application/json'}});
    }

    restGetKpiCounters() {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_counters",
            {},
            {headers: {'Content-Type': 'application/json'}})
    }

    restGetKpiOlogs(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_ologs",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    // >>>>> do Get My Schemas
    doGetMySchemas(user, params) {
        this.restGetKpiOlogs(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    let ologs = result.data.data;
                    let arrSchemas = [];
                    let arrSchemasDeleted = [];
                    let mapSchemas = new Map();
                    ologs.forEach((item) => {
                        switch (item.object_type) {
                            case "schema":
                                if (item.operation !== "delete") {
                                    if (!mapSchemas.has(item.object_id)) {
                                        mapSchemas.set(item.object_id, {});
                                        arrSchemas.push({
                                            id: item.object_id,
                                            un: item.user_name,
                                            op: item.operation,
                                            et: item.event_time
                                        })
                                    }
                                } else {
                                    arrSchemasDeleted.push({
                                        id: item.object_id,
                                        un: item.user_name,
                                        op: item.operation,
                                        et: item.event_time
                                    })
                                }
                                break
                            case "kpi":
                                if (this.gMap.kpis.has(item.object_id)) {
                                    let sid = this.gMap.kpis.get(item.object_id).sid;
                                    if (!mapSchemas.has(sid)) {
                                        mapSchemas.set(sid, {});
                                        arrSchemas.push({
                                            id: sid,
                                            un: item.user_name,
                                            op: "kpi_update",
                                            et: item.event_time
                                        })
                                    }
                                }
                                break
                            case "counter":
                                if (this.gMap.counters.has(item.object_id)) {
                                    let sid = this.gMap.counters.get(item.object_id).sid;
                                    if (!mapSchemas.has(sid)) {
                                        mapSchemas.set(sid, {});
                                        arrSchemas.push({
                                            id: sid,
                                            un: item.user_name,
                                            op: "counter_update",
                                            et: item.event_time
                                        })
                                    }
                                }
                                break
                            default:
                                break
                        }
                    });

                    let mySchemas = [];

                    arrSchemasDeleted.forEach((schemaDeleted) => {
                        for (let i = 0; i < arrSchemas.length; i++) {
                            let schema = arrSchemas[i];
                            if (schema.id === schemaDeleted.id) {
                                arrSchemas.splice(i, 1);
                                break
                            }
                        }
                    });

                    arrSchemas.forEach((item) => {
                        let schema = this.gMap.schemas.get(item.id);
                        let uiSchema = {
                            key: item.id,
                            title: schema.schema_id + " - " + schema.schema_zhname,
                            children: []
                        }
                        mySchemas.push(uiSchema);
                    })

                    this.setState({
                        treeDataKpiSchemas: mySchemas
                    })
                    this.context.showMessage("保存成功，指标组ID为：" + result.data.schema_id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    // >>>>> do Add Schema
    doAddSchema(schema, what) {
        this.restAddSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateSchema(result.data.data, what);
                    this.dsUpdateSchema(result.data.data, what);

                    if (what === "clone") {
                        schema.kpis.forEach((item) => {
                            let kpi = lodash.cloneDeep(this.gMap.kpis.get(item));
                            kpi.id = null;
                            kpi.sid = result.data.data.id;
                            kpi.kpi_id = result.data.data.schema_id + kpi.kpi_id.substr(kpi.kpi_id.length - 2, 2);
                            this.doAddKpi(kpi, "clone");
                        })
                        schema.counters.forEach((item) => {
                            let counter = lodash.cloneDeep(this.gMap.counters.get(item));

                            counter.id = null;
                            counter.sid = result.data.data.id;
                            this.doAddCounter(counter, "clone");
                        })
                    }
                    this.context.showMessage("创建成功，新增指标组内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    // >>>>> do Clone Schema
    doCloneSchema(schema) {
        schema.id = null;
        schema.schema_zhname += "-副本-" + moment().format("MMDDHHmmss");

        this.doAddSchema(schema, "clone");
    }

    // >>>>> do Delete Schema
    doDeleteSchema() {
        let schema = new TadKpiSchema();
        schema.id = this.gCurrent.schema.id;

        this.restDeleteSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateSchema(result.data.data, "delete");
                    this.dsUpdateSchema(result.data.data, "delete");
                    this.context.showMessage("保存成功，指标组ID为：" + result.data.schema_id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    // >>>>> do Add KPI
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

    // >>>>> 数据库删除KPI
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
            if (this.gCurrent.schema.kpis[i] === kpi.id) {
                this.gCurrent.schema.kpis.splice(i, 1);
                break
            }
        }

        // db update index
        let sid = this.gCurrent.schema.id;
        let schema_id = this.gMap.schemas.get(sid).schema_id;
        for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
            let kid = this.gCurrent.schema.kpis[i];
            let kpi = lodash.cloneDeep(this.gMap.kpis.get(kid));
            kpi.kpi_id = schema_id + (i + 1).toString().padStart(2, "0");
            kpi.kpi_field = "field" + (i + 1).toString().padStart(2, "0");

            this.doUpdateKpi(kpi);
        }
    }

    // >>>>> 数据库更新KPI
    doUpdateKpi(kpi) {
        this.restUpdateKpi(kpi).then((result) => {
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

    onTreeProjectsSelected(selectedKeys, info) {

    }
    // >>>>> click schema
    onTreeKpiSchemasSelected(selectedKeys, info) {
        this.gCurrent.counterNames = [];

        if (info.selected) {
            this.gRef.treeKpis.current.state.selectedKeys = [];     // 清除之前的选中项

            let sid = selectedKeys[0];
            let schema;
            let uiKpis = [];

            schema = this.gMap.schemas.get(sid);
            this.gCurrent.schema = schema;

            schema.kpis.forEach((kid) => {
                if (this.gMap.kpis.has(kid)) {

                    let kpi = this.gMap.kpis.get(kid);
                    let uiKpi = {
                        key: kpi.id,
                        title: <div className={"BoxKpiTitle"}>{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
                        children: []
                    }
                    let index = parseInt(kpi.kpi_id?.substr(kpi.kpi_id.length - 2, 2)) - 1;
                    uiKpis[index] = uiKpi;
                }
            });

            this.setState({
                treeDataKpis: uiKpis,
            });
        } else {
            this.setState({
                treeDataKpis: [],
            });
        }
    };

    // >>>>> check KPI
    onTreeKpisChecked(checkedKeys, info) {
        this.gCurrent.kpisChecked = checkedKeys;
    }

    // >>>>> click KPI
    onTreeKpisSelected(selectedKeys, info) {
        if (info.selected) {
            let kid = selectedKeys[0];

            let kpi = this.gMap.kpis.get(kid);
            this.gCurrent.kpi = kpi;
        } else {
            this.gCurrent.kpi = null;
        }
    }

    // >>>>> 拖拽KPI，改变顺序
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
            let kpi = lodash.cloneDeep(this.gMap.kpis.get(kid));

            kpi.kpi_id = schema_id + (i + 1).toString().padStart(2, "0");
            kpi.kpi_field = "field" + (i + 1).toString().padStart(2, "0");

            this.doUpdateKpi(kpi);
        }
    }

    // >>>>> on Select SchemaId Changed
    onSelectSchemaIdChanged(e, sender) {
        let schemaId = "";

        switch (sender) {
            case "a1":
                this.gDynamic.schemaId.a1 = e;
                break
            case "a2":
                this.gDynamic.schemaId.a2 = e;
                break
            case "b1":
                this.gDynamic.schemaId.b1 = e;
                break
            case "b2":
                this.gDynamic.schemaId.b2 = e;
                break
            default:
                break
        }
        let strA1 = "", strA2 = "", strBb = "", strB = "", strC = "";

        strA1 = (this.gDynamic.schemaId.a1 === -99999) ? "9" : this.gDynamic.schemaId.a1.toString();
        strA2 = (this.gDynamic.schemaId.a2 === -99999) ? "5" : this.gDynamic.schemaId.a2.toString();
        if (this.gDynamic.schemaId.b1 !== -99999) {  // 空间 + 网元
            if (this.gDynamic.schemaId.b1 > 99) {
                strBb = this.gDynamic.schemaId.b1.toString()[0];
                strB = this.gDynamic.schemaId.b1.toString().substr(1, 2);
            } else {
                strB = this.gDynamic.schemaId.b1.toString();
            }
            if (this.gDynamic.schemaId.b2 !== -99999) {
                strC = this.gDynamic.schemaId.b2.toString()
            } else {
                strC = "75";
            }
        } else if (this.gDynamic.schemaId.b2 !== -99999) { // 网元 + 序号
            if (this.gDynamic.schemaId.b2 > 99) {
                strBb = this.gDynamic.schemaId.b2.toString()[0];
                strB = this.gDynamic.schemaId.b2.toString().substr(1, 2);
            } else {
                strB = this.gDynamic.schemaId.b2.toString();
            }
            let sidHead = strBb + "260" + strA1 + strA2 + strB;
            let sidIndexes = [];
            for (let item of this.gMap.schemas.values()) {
                let sidTemp = item.schema_id;
                if (sidTemp.startsWith(sidHead)) {
                    let i = sidTemp.substr(sidHead.length, sidTemp.length - sidHead.length);
                    sidIndexes.push(parseInt(i));
                }
            }
            let sidIndex = 1;
            for (let i = 0; i < sidIndexes.length; i++) {
                if (sidIndexes.includes(sidIndex)) {
                    sidIndex++;
                    continue
                }
            }
            strC = sidIndex.toString().padStart(2, "0");
        } else {
            strC = "75";
        }
        // schemaId = strBb + "260" + strA1 + strA2 + strB + strC;
    }

    onButtonChangeStyleLayoutClicked(e) {
        let styleLayout = "NN";

        if (this.state.styleLayout !== "SN") styleLayout = "SN";

        this.setState({
            styleLayout: styleLayout
        })
    }

    // >>>>> 点击按钮，新增 SCHEMA
    onButtonSchemasAddClicked(e) {
        let schema = new TadKpiSchema();

        schema.schema_zhname = "新增指标组";
        schema.schema_id = this.gSchemaIdDefault;

        this.doAddSchema(schema, "add");
    }

    // >>>>> 点击按钮，复制 SCHEMA
    onButtonSchemasCopyPasteClicked(e) {
        let sid = this.gCurrent.schema.id;
        let schema = lodash.cloneDeep(this.gMap.schemas.get(sid));
        this.doCloneSchema(schema);
    }

    onButtonSchemasExportClicked(e) {
        this.context.showMessage("导出指标组，开发中...");
    }

    onButtonSchemasResetClicked(e) {
        this.context.showMessage("重置指标组属性，开发中... 2021-06-18");
    }

    //>>>>> 点击按钮，新增KPI
    onButtonKpisAddClicked(e) {
        let kpi = new TadKpi();
        let index = this.gCurrent.schema.kpis.length + 1;

        kpi.sid = this.gCurrent.schema.id;
        kpi.kpi_id = this.gCurrent.schema.schema_id + index.toString().padStart(2, "0");
        kpi.kpi_zhname = "新增指标";
        kpi.kpi_enname = "newKpi" + index.toString().padStart(2, "0");
        kpi.kpi_field = "field" + index.toString().padStart(2, "0");
        kpi.kpi_alarm = 1;
        kpi.kpi_format = 1;

        this.doAddKpi(kpi, "add");
    }

    onButtonKpisCopyPasteClicked(e) {

        this.context.showMessage("开发中...");
    }

    onButtonKpisDeleteClicked(e) {
        this.context.showMessage("删除指标，开发中...");
    }

    onButtonKpisShoppingClicked(e) {
        this.context.showMessage("开发中，目标：将选中指标添加到购物车中，以备导出使用。");
    }

    // 判断是否为有效数值
    isNumber(strValue) {
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;//负浮点数

        return regPos.test(strValue) || regNeg.test(strValue);
    }

    // 表达式格式化及算法验证
    doDisplayExpression(exp) {
        if (exp === null) return;
        if (exp.trim() === "" || exp === "指标计算表达式") return;

        // 自动将中文符号，转为英文符号：( ) . + - * /
        // 自动将连写符号，转为单个符号：. + - * /
        // 限定有效字符，可用：( ) . + - * / a-z 0-9 _
        let hasError = false;
        let expVarNames = [];
        let expTestNew = "";
        exp = exp.replace(/^\s+|\s+$/g, "");                // 去除前后端空格
        exp = exp.replace(/[\w.*]*\w[.]*/g, "__KV__$&");    // 标识counter名称，范例：((nmosdb....table_name.field01+nmosdb.test.field + a01 +abce_test 0.0.5) ..100. 100..200))
        exp = exp.replace(/[.]/g, "__KD__");                // 标识符号：“.”
        exp = exp.replace(/\s+/g, "");                      // 清除内部空格
        let arrExp = exp.match(/(\W?\w*)/g);                // 分解出代码段
        arrExp.pop();
        let kIndex = 0;
        let kpiExpDisplay = <div className="Expression">
            {arrExp.map((item, index) => {
                let ov = item.split("__KV__");
                let operator = ov[0];
                let className = "";
                switch (operator) {
                    case "(":
                        kIndex++;
                        className = "expKb_" + kIndex.toString().padStart(2, "0");
                        break
                    case ")":
                        if (kIndex > 0) {
                            className = "expKb_" + kIndex.toString().padStart(2, "0");
                            kIndex--;
                        } else {
                            kIndex = 0;
                            className = "expKb_error";
                            hasError = true;
                        }
                        break
                    default:
                        className = "expOperator";
                        break
                }
                if (ov.length === 1) {
                    expTestNew += operator;
                    return <Fragment>
                        <div key={index} className={className}>{operator}</div>
                    </Fragment>
                } else if (ov.length === 2) {
                    let varName = ov[1].replace(/__KD__/g, ".");
                    let classNameV = "expVar";
                    if ((index + 1) < arrExp.length) {
                        if (!(arrExp[index + 1].startsWith("+") ||
                            arrExp[index + 1].startsWith("-") ||
                            arrExp[index + 1].startsWith("*") ||
                            arrExp[index + 1].startsWith("/") ||
                            arrExp[index + 1].startsWith(")"))) {
                            classNameV = "expVarError";
                            hasError = true;
                        }
                    }

                    if (this.isNumber(varName)) {
                        varName = varName.replace(/\./g, "__KDN__");
                    } else {
                        if (!this.gCurrent.counterNames.includes(varName)) {
                            classNameV = "expVarError";
                            hasError = true;
                        } else {
                            expVarNames.push(varName);
                        }
                    }

                    expTestNew += operator + varName;
                    varName = varName.replace(/__KDN__/g, ".");
                    return <Fragment>
                        <div key={"operator_" + index} className={className}>{operator}</div>
                        <div key={"value_" + index} className={classNameV}>{varName}</div>
                    </Fragment>
                } else {
                    hasError = true;
                    let v = "";
                    for (let i = 1; i < ov.length; i++) {
                        v += ov[i] + " ";
                    }
                    v = v.replace(/\s+$/, "");
                    v = v.replace(/__KD__/g, ".");

                    expTestNew += operator + v;
                    return <Fragment>
                        <div key={"operator_" + index} className={className}>{operator}</div>
                        <div key={"value_" + index} className="expVarError">{v}</div>
                    </Fragment>
                }
            })}
        </div>;
        this.setState({
            kpiExpDisplay: kpiExpDisplay
        }, () => {
            if (!hasError) {
                try {
                    let _dynamicTest;
                    let strLets = "() => {\n";

                    expTestNew = expTestNew.replace(/\./g, "_");

                    expVarNames.forEach((item) => {
                        if (!this.isNumber(item)) {
                            strLets += "let " + item.replace(/\./g, "_") + " = 1;\n";
                        }
                    });
                    expTestNew = strLets + "let test = " + expTestNew + ";\nreturn test;\n}";
                    expTestNew = expTestNew.replace(/__KDN__/g, ".");

                    _dynamicTest = eval(expTestNew);
                    let r = _dynamicTest();
                    this.context.showMessage("模拟运算结果 = " + r + "（所有变量赋值为 1）");
                } catch (err) {
                    this.context.showMessage(err.toString());
                }
            }
        });
    }

    // >>>>> 复制到剪贴板
    doCopyToClipboard(text) {
        let input = document.getElementById("shadowInputForClipboard");
        input.value = text;
        input.select();
        document.execCommand("copy");
    }

    onInputKpiExpChanged = lodash.debounce((e) => {
        this.doDisplayExpression(e.target.value);
    }, 500);

    // >>>>> 确认对话框
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

    // >>> INPUT <<<

    onInputSchemaZhNameChanged(e) {

    }

    str2Time4ParamTimePairs(tb, te) {
        let myResult = "无效";

        if (te === undefined) {
            let cb = tb.length;
            if (cb <= 2) {
                try {
                    let ntb = parseInt(tb);
                    if ((ntb > 0) && (ntb <= 31)) {
                        myResult = moment().format("yyyy-MM-") + tb.padStart(2, "0");
                    }
                } catch (e) {
                    myResult = "无效";
                }
            } else if (cb === 3) {
                let month = tb.substr(0, 1);
                let day = tb.substr(1, 2);
                myResult = moment().format("yyyy-") + month.padStart(2, "0") + "-" + day;

            } else if (cb === 4) {
                let month = tb.substr(0, 2);
                let day = tb.substr(2, 2);
                myResult = moment().format("yyyy-") + month.padStart(2, "0") + "-" + day.padStart(2, "0");

            } else if (cb === 6) {
                let year = tb.substr(0, 2);
                let month = tb.substr(2, 2);
                let day = tb.substr(4, 2);
                myResult = moment().format("yy") + year + "-" + month + "-" + day;

            } else if (cb === 8) {
                let year = tb.substr(0, 4);
                let month = tb.substr(4, 2);
                let day = tb.substr(6, 2);
                myResult = year + "-" + month + "-" + day;

            }
        } else {
            let ce = te.length;
            if (ce <= 2) {
                try {
                    let nte = parseInt(te);
                    myResult = moment(tb, "YYYY-MM-DD").add(nte, "days").format("YYYY-MM-DD");
                } catch (e) {
                    myResult = "无效";
                }
            } else if (ce === 3) {
                let month = te.substr(0, 1);
                let day = te.substr(1, 2);
                myResult = moment().format("yyyy-") + month.padStart(2, "0") + "-" + day;

            } else if (ce === 4) {
                let month = te.substr(0, 2);
                let day = te.substr(2, 2);
                myResult = moment().format("yyyy-") + month.padStart(2, "0") + "-" + day.padStart(2, "0");
            } else if (ce === 6) {
                let year = te.substr(0, 2);
                let month = te.substr(2, 2);
                let day = te.substr(4, 2);
                myResult = moment().format("yy") + year + "-" + month + "-" + day;

            } else if (ce === 8) {
                let year = te.substr(0, 4);
                let month = te.substr(4, 2);
                let day = te.substr(6, 2);
                myResult = year + "-" + month + "-" + day;
            }
        }

        return myResult;
    }

    // >>>>> 搜索 SCHEMA & KPI
    onInputSearchSchemasSearched(value, event) {
        let sv = value;

        if (sv !== null && sv !== undefined && sv.trim() !== "") {
            if (sv.trim().startsWith("变更：") || sv.trim().startsWith("变更:")) {
                let svs = sv.trim().toLowerCase().replace(/\s+/g, " ").replace(/[：|:]+\s*/g, "： ").split(" ");
                let timeBegin = "";
                let timeEnd = "";

                if (svs.length === 3) {
                    timeBegin = this.str2Time4ParamTimePairs(svs[1]);
                    timeEnd = this.str2Time4ParamTimePairs(timeBegin, svs[2]);
                } else if (svs.length === 2) {
                    timeBegin = moment().format("yyyy-MM-DD");
                    if (svs[1] === "") svs[1] = "0";
                    timeEnd = this.str2Time4ParamTimePairs(timeBegin, svs[1]);
                } else {
                    this.context.showMessage("error");

                    return
                }

                if ((timeBegin !== "无效") && (timeEnd !== "无效")) {
                    let paramsKpiOlog = new KpiOlogParams();
                    if (timeBegin < timeEnd) {
                        paramsKpiOlog.tb = timeBegin;
                        paramsKpiOlog.te = timeEnd;
                    } else {
                        paramsKpiOlog.tb = timeEnd;
                        paramsKpiOlog.te = timeBegin;
                    }

                    paramsKpiOlog.te = moment(paramsKpiOlog.te, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD");
                    this.doGetMySchemas(this.context.user.name, paramsKpiOlog);
                } else {
                    this.context.showMessage("error");

                    return
                }
            } else {
                sv = sv.trim().toLowerCase();
                let mySchemas = this.searchKpis(sv);

                this.setState({
                    treeDataKpiSchemas: mySchemas
                })
            }

        } else {
            this.setState({
                treeDataKpiSchemas: this.searchKpis("")
            })
        }
    }

    onSelectSchemaObjectClassChanged(v) {
        let optionsObjectSubClass = [{label: "网元细分类型", value: -99999}];
        if (this.gMap.objectDefs.has(v)) {
            this.gMap.objectDefs.get(v).subClasses.forEach((item) => {
                optionsObjectSubClass.push({
                    label: item.className,
                    value: item.objectClass
                })
            });
        }
        this.setState({
            optionsObjectSubClass: optionsObjectSubClass
        })
    }

    onSelectKpiUsedProductChanged(v) {
        let optionsModule = [{label: "使用该指标的模块", value: -99999}];

        if (this.gMap.products.has(v)) {
            this.gMap.products.get(v).modules.forEach((item) => {
                optionsModule.push({
                    label: item.module_name,
                    value: item.module_id
                })
            });
        }
        this.setState({
            optionsModule: optionsModule
        })
    }

    //todo >>>>> render
    render() {
        const columnsColumn = [
            {
                title: <KColumnTitle content='指标编码' className={'clsColumnTitle'}/>,
                dataIndex: 'kpi_id',
                key: 'kpi_id',
                width: 200,
                align: 'center',
            },
            {
                title: <KColumnTitle content='中文名称' className={'clsColumnTitle'}/>,
                dataIndex: 'kpi_zhname',
                key: 'kpi_zhname',
                width: 200,
                align: 'center',
            },
            {
                title: <KColumnTitle content='界面显示标题' className={'clsColumnTitle'}/>,
                dataIndex: 'kpi_ui_title',
                key: 'kpi_ui_title',
                width: 200,
                align: 'center',
            },
        ];

        return (
            <div className="ServiceProject">
                <div className="BoxProject">
                    <div className="BoxTreeProject">
                        <div className="BoxTitleBar">
                            <div className="BoxTitle">【项目组】</div>
                            <div className="BoxButtons">
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>新建</Button>
                                <Button size={"small"} type={"primary"} icon={<CopyOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>复制</Button>
                                <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>删除</Button>
                                <Button size={"small"} type={"primary"} icon={<CloudDownloadOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>导出</Button>
                            </div>
                        </div>
                        <div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>
                            <Tree ref={this.gRef.treeProjects} treeData={this.state.treeDataProjects}
                                  onSelect={this.onTreeProjectsSelected} height={this.state.treeProjectsHeight}
                                  defaultExpandAll={true} blockNode={true} showLine={{showLeafIcon: false}}
                                  showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                        </div>
                    </div>
                    <div className="BoxTreeKpi">
                        <div className="BoxTitleBar">
                            <div className="BoxTitle">【项目组指标】</div>
                            <div className="BoxButtons">
                                <Button size={"small"} type={"primary"} icon={<CloseOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>移出</Button>
                            </div>
                        </div>
                        <div ref={this.gRef.tableProjectKpis} className="BoxTableProjectKpis">
                            <Table
                                dataSource={this.state.dsProjectKpis}
                                columns={columnsColumn}
                                scroll={{
                                    x: this.state.tableProjectKpisScrollX,
                                    y: this.state.tableProjectKpisScrollY
                                }}
                                bordered={true}
                                size={"small"}
                                pagination={{
                                    pageSize: this.state.pageSizeProjectKpis,
                                    position: ["none", "none"]
                                }}
                                rowSelection={{
                                    type: "radio",
                                    // ...this.onTableProjectKpisRowSelected
                                }}/>
                        </div>
                        {/*<div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>*/}
                        {/*    <Tree ref={this.gRef.treeKpis} treeData={this.state.treeDataKpis}*/}
                        {/*          onSelect={this.onTreeKpisSelected} onDrop={this.onTreeKpisDrop} checkable blockNode*/}
                        {/*          draggable showIcon showLine={{showLeafIcon: false}}*/}
                        {/*          switcherIcon={<CaretDownOutlined/>}/>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="BoxSourceKpis">
                    <div className="BoxTreeSchema">
                        <div className="BoxTitleBar">
                            <div className="BoxTitle">【指标组】</div>
                            <div className={"BoxButtons"}>
                                <div className="BoxTitle">筛选：</div>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdA1} defaultValue={-99999} onChange={(e) => {
                                    this.onSelectSchemaIdChanged(e, "a1");
                                }}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdA2} defaultValue={-99999} onChange={(e) => {
                                    this.onSelectSchemaIdChanged(e, "a2");
                                }}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdB1} defaultValue={-99999} onChange={(e) => {
                                    this.onSelectSchemaIdChanged(e, "b1");
                                }}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdB2} defaultValue={-99999} onChange={(e) => {
                                    this.onSelectSchemaIdChanged(e, "b2");
                                }}/>
                            </div>
                        </div>
                        <div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>
                            <Tree ref={this.gRef.treeSchemas} treeData={this.state.treeDataKpiSchemas}
                                  onSelect={this.onTreeKpiSchemasSelected} height={this.state.treeSchemasHeight}
                                  defaultExpandAll={true} blockNode={true} showLine={{showLeafIcon: false}}
                                  showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                        </div>
                    </div>
                    <div className="BoxTreeKpi">
                        <div className="BoxTitleBar">
                            <div className="BoxTitle">【指标组指标】</div>
                            <div className="BoxButtons">
                                <div className={"BoxSearch"}>
                                    <Input.Search placeholder="Search" size="small" enterButton onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                                <Button size={"small"} type={"primary"} icon={<CheckOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>移入</Button>
                            </div>
                        </div>
                        <div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>
                            <Tree ref={this.gRef.treeKpis} treeData={this.state.treeDataKpis}
                                  onSelect={this.onTreeKpisSelected} onDrop={this.onTreeKpisDrop} checkable blockNode
                                  draggable showIcon showLine={{showLeafIcon: false}}
                                  switcherIcon={<CaretDownOutlined/>}/>
                        </div>
                    </div>
                    <div className="BoxProperties">
                        <div className="BoxTitleBarSchema">
                            <div className="BoxTitle">【指标组属性】 - {this.state.schema.schema_id} - {this.state.schema.schema_enname}</div>
                        </div>
                        <div className="BoxPropertiesSchema">
                            <div className="BoxSchemaIds">
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                            </div>
                            <div className="BoxVendorObjectClass">
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                            </div>
                            <div>
                                <Input className="InputReadonly" readOnly="readonly"/>
                            </div>
                        </div>
                        <div className="BoxTitleBarKpi">
                            <div className="BoxTitle">【指标属性】 - {this.state.kpi.kpi_id} - {this.state.kpi.kpi_enname}</div>
                        </div>
                        <div className="BoxPropertiesKpi">
                            <div className="BoxKpiValues">
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                                <Input className="InputReadonly" readOnly="readonly"/>
                            </div>
                            <div className="BoxUsedInfo">
                                <div className="BoxProductModuleName">
                                    <Select options={this.state.optionsModule} size="small"/>
                                </div>
                            </div>
                        </div>
                        <div className="BoxKpiExp">
                            <div className="BoxKpiExpDisplay">
                                {this.state.kpiExpDisplay}
                            </div>
                        </div>
                    </div>
                </div>
                <Modal title="系统提示窗口" visible={this.state.isModalVisible} onOk={this.onModalButtonOkClicked} onCancel={this.onModalButtonCancelClicked}>
                    <p>{this.state.modalMessage}</p>
                </Modal>
                <input id="shadowInputForClipboard" className="shadowElement"/>
                <button id="shadowButton" className="shadowElement">shadow button</button>
            </div>
        )
    }
}

