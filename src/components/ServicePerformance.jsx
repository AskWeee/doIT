import React, {Fragment} from 'react'
import './ServicePerformance.scss'
import GCtx from "../GCtx";
import Mock from 'mockjs'
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import XLSX from 'xlsx';
import JSZip from "jszip";
import fs from "file-saver";
import {Button, Input, Select, Tree, Modal, Form, Tooltip, Checkbox, Upload} from 'antd'
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CloudDownloadOutlined, CloudUploadOutlined, CopyOutlined, MinusSquareOutlined, PlusSquareOutlined, SaveOutlined, QuestionCircleOutlined, EditOutlined,} from '@ant-design/icons'
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";
import TadIndicator from "../entity/TadIndicator";
import TadIndicatorCounter from "../entity/TadIndicatorCounter";
import TadKpiCounter from "../entity/TadKpiCounter";
import KpiOlogParams from "../params/KpiOlogParams";

const {Option} = Select;
const {TextArea} = Input;

export default class ServicePerformance extends React.PureComponent {
    static contextType = GCtx;

    gMap = {};
    gData = {};
    gCurrent = {
        schema: null,
        kpi: null,
        counter: null,
        indicator: null,
        indicatorCounter: null,
        indicatorsChecked: [],
        kpisChecked: [],
        //counterNames: [],                       // 当前指标组所包含的可用的counter英文名称，也可以直接使用schema.counters ???
        initForSchema: function () {
            this.schema = null;
            this.kpi = null;
            this.counter = null;
            // this.indicator = null;
            // this.indicatorCounter = null;
            // this.indicatorsChecked = [];
            this.kpisChecked = [];
            //this.counterNames = [];
        },
        schemasChecked: new Map(),
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
        treeSchemas: React.createRef(),
        treeIndicators: React.createRef(),
        treeKpis: React.createRef(),
        treeCounters: React.createRef(),
        formSchemaProperties: React.createRef(),
        formKpiProperties: React.createRef(),
    };
    gShoppingCart = {
        kpis: [],
        clear: function () {
            this.kpis = [];
        }
    }
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
            treeDataKpiSchemas: [],
            treeDataIndicators: [],
            treeDataKpis: [],
            treeDataKpiCounters: [],
            treeSchemasHeight: 100,
            treeSchemasScroll: 1,
            optionsSchemaIdA1: [{label: "业务分类", value: -99999}],
            optionsSchemaIdA2: [{label: "时间粒度", value: -99999}],
            optionsSchemaIdB1: [{label: "空间粒度", value: -99999}],
            optionsSchemaIdB2: [{label: "网元类型", value: -99999}],
            optionsVendor: [{label: "不区分厂家", value: -1}],
            optionsObjectSubClass: [{label: "不区分网元细分类型", value: -1}],
            optionsIntervalFlag: [{label: "采集粒度", value: -99999}],
            // optionsProduct: [{label: "使用该指标的产品", value: -99999}],
            // optionsModule: [{label: "使用该指标的模块", value: -99999}],
            formSchemaInitialValues: {
                schemaId: "",
                schemaIdA1: -99999,
                schemaIdA2: -99999,
                schemaIdB1: -99999,
                schemaIdB2: -99999,
                schemaZhName: "",
                schemaVendor: -1,
                schemaObjectClass: -99999,
                schemaIsMo: 0,
                schemaObjectSubClass: -1,
                schemaIntervalFlag: -99999,
                tabName: "",
                counterTabName: "",
                kpiTabName: "",
            },
            formKpiInitialValues: {
                kpiId: "",
                kpiZhName: "",
                kpiEnName: "",
                kpiAlarm: 1,
                kpiFormat: "",
                kpiMinValue: "",
                kpiMaxValue: "",
                kpiUnit: "",
                // kpiUsedProduct: -99999,
                // kpiUsedModule: -99999,
                // kpiUsedTitle: "",
                kpiExp: "",
            },

            kpiExpDisplay: "",
        }

        //todo >>>>> bind(this)
        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);

        this.searchKpis = this.searchKpis.bind(this);
        this.dataSchemas2DsMapUiTree = this.dataSchemas2DsMapUiTree.bind(this);
        this.isFoundKpis = this.isFoundKpis.bind(this);
        this.isFoundIndicatorCounters = this.isFoundIndicatorCounters.bind(this);
        this.uiUpdateSchema = this.uiUpdateSchema.bind(this);
        this.dsUpdateSchema = this.dsUpdateSchema.bind(this);
        this.uiUpdateKpi = this.uiUpdateKpi.bind(this);
        this.dsUpdateKpi = this.dsUpdateKpi.bind(this);
        this.uiUpdateCounter = this.uiUpdateCounter.bind(this);
        this.dsUpdateCounter = this.dsUpdateCounter.bind(this);
        this.doInsertIntoKpiExp = this.doInsertIntoKpiExp.bind(this);
        this.doDisplayExpression = this.doDisplayExpression.bind(this);

        this.doGetAll = this.doGetAll.bind(this);
        this.doGetKpiDict = this.doGetKpiDict.bind(this);
        this.doGetObjectDefs = this.doGetObjectDefs.bind(this);
        this.doGetVendors = this.doGetVendors.bind(this);
        this.doGetKpis = this.doGetKpis.bind(this);
        this.doGetKpiSchemas = this.doGetKpiSchemas.bind(this);
        this.doGetIndicators = this.doGetIndicators.bind(this);
        this.doGetIndicatorCounters = this.doGetIndicatorCounters.bind(this);
        this.doGetExcel = this.doGetExcel.bind(this);
        this.doGetMySchemas = this.doGetMySchemas.bind(this);

        this.restGetKpiCounters = this.restGetKpiCounters.bind(this);
        this.restGetProducts = this.restGetProducts.bind(this);
        this.restGetModules = this.restGetModules.bind(this);
        this.restAddSchema = this.restAddSchema.bind(this);
        this.restDeleteSchema = this.restDeleteSchema.bind(this);
        this.restAddKpi = this.restAddKpi.bind(this);
        this.restDeleteKpi = this.restDeleteKpi.bind(this);
        this.restUpdateKpi = this.restUpdateKpi.bind(this);
        this.restAddCounter = this.restAddCounter.bind(this);
        this.restDeleteCounter = this.restDeleteCounter.bind(this);
        this.restFixKpiCounter = this.restFixKpiCounter.bind(this);
        this.restGetKpiOlogs = this.restGetKpiOlogs.bind(this);

        this.doAddSchema = this.doAddSchema.bind(this);
        this.doDeleteSchema = this.doDeleteSchema.bind(this);
        this.doUpdateSchema = this.doUpdateSchema.bind(this);
        this.doAddKpi = this.doAddKpi.bind(this);
        this.doDeleteKpi = this.doDeleteKpi.bind(this);
        this.doUpdateKpi = this.doUpdateKpi.bind(this);
        this.doAddCounter = this.doAddCounter.bind(this);
        this.doDeleteCounter = this.doDeleteCounter.bind(this);
        this.doFixKpiCounters = this.doFixKpiCounters.bind(this);

        this.importExcelKpisBeforeUpload = this.importExcelKpisBeforeUpload.bind(this);
        this.importExcelKpisOnChange = this.importExcelKpisOnChange.bind(this);
        this.verifySchemaImported = this.verifySchemaImported.bind(this);
        this.exportSchemas2excel = this.exportSchemas2excel.bind(this);

        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);
        this.onTreeKpiSchemasChecked = this.onTreeKpiSchemasChecked.bind(this);
        this.onTreeIndicatorsChecked = this.onTreeIndicatorsChecked.bind(this);
        this.onTreeKpisSelected = this.onTreeKpisSelected.bind(this);
        this.onTreeKpisChecked = this.onTreeKpisChecked.bind(this);
        this.onTreeKpisDrop = this.onTreeKpisDrop.bind(this);
        this.onTreeKpiCountersSelected = this.onTreeKpiCountersSelected.bind(this);

        this.onButtonChangeStyleLayoutClicked = this.onButtonChangeStyleLayoutClicked.bind(this);
        this.onButtonSchemasAddClicked = this.onButtonSchemasAddClicked.bind(this);
        this.onButtonSchemasCopyPasteClicked = this.onButtonSchemasCopyPasteClicked.bind(this);
        this.onButtonSchemasExportClicked = this.onButtonSchemasExportClicked.bind(this);
        this.onButtonSchemasResetClicked = this.onButtonSchemasResetClicked.bind(this);
        this.onButtonKpisAddClicked = this.onButtonKpisAddClicked.bind(this);
        this.onButtonKpisCopyPasteClicked = this.onButtonKpisCopyPasteClicked.bind(this);
        this.onButtonKpisDeleteClicked = this.onButtonKpisDeleteClicked.bind(this);
        this.onButtonIndicatorsCopy2CountersClicked = this.onButtonIndicatorsCopy2CountersClicked.bind(this);
        this.onButtonIndicatorsImportClicked = this.onButtonIndicatorsImportClicked.bind(this);
        this.onButtonIndicatorsExportClicked = this.onButtonIndicatorsExportClicked.bind(this);
        this.onButtonInsertIntoKpiExpClicked = this.onButtonInsertIntoKpiExpClicked.bind(this);
        this.onButtonKpisShoppingClicked = this.onButtonKpisShoppingClicked.bind(this);

        this.onInputSchemaZhNameChanged = this.onInputSchemaZhNameChanged.bind(this);
        this.onInputSearchSchemasSearched = this.onInputSearchSchemasSearched.bind(this);
        this.onInputSearchIndicatorsSearched = this.onInputSearchIndicatorsSearched.bind(this);
        this.onInputKpiExpChanged = this.onInputKpiExpChanged.bind(this);

        this.onSelectSchemaIdChanged = this.onSelectSchemaIdChanged.bind(this);
        //this.onSelectSchemaObjectClassChanged = this.onSelectSchemaObjectClassChanged.bind(this);
        this.onSelectKpiUsedProductChanged = this.onSelectKpiUsedProductChanged.bind(this);

        this.onFormSchemaPropertiesFinish = this.onFormSchemaPropertiesFinish.bind(this);
        this.onFormSchemaPropertiesFinishFailed = this.onFormSchemaPropertiesFinishFailed.bind(this);
        this.onFormKpiPropertiesFinish = this.onFormKpiPropertiesFinish.bind(this);
        this.onFormKpiPropertiesFinishFailed = this.onFormKpiPropertiesFinishFailed.bind(this);
        this.onFormSchemaPropertiesFill = this.onFormSchemaPropertiesFill.bind(this);
        this.onFormKpiPropertiesFill = this.onFormKpiPropertiesFill.bind(this);

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

    }

    doInit() {
        this.setState({
            treeSchemasHeight: this.gRef.boxTreeSchemas.current.offsetHeight
        })
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

    isFoundIndicatorCounters(ds, sv) {
        let myResult = false;

        for (let i = 0; i < ds.length; i++) {
            let item = this.gMap.indicatorCounters.get(ds[i]);
            if (item.counter_zhname?.toLowerCase().indexOf(sv) >= 0
                || item.counter_enname?.toLowerCase().indexOf(sv) >= 0) {
                myResult = true;
                break;
            }
        }

        return myResult
    }

    dataIndicators2DsMapUiTree(indicators, counters, sv) {
        let myResult = {
            mapIndicators: new Map(),
            mapCounters: new Map(),
            uiTree: []
        }
        let mapCountersTemp = new Map();

        counters.forEach((counter) => {
            if (!mapCountersTemp.has(counter.indicator_id)) {
                mapCountersTemp.set(counter.indicator_id, {counters: [counter]});
            } else {
                mapCountersTemp.get(counter.indicator_id).counters.push(counter);
            }
            myResult.mapCounters.set(counter.id, counter);
        });

        for (let i = 0; i < indicators.length; i++) {
            let indicator = indicators[i];

            if (indicator.indicator_zhname && indicator.indicator_zhname !== "") {
                //         let iZhName = item.indicator_zhname === null ? "" : item.indicator_zhname.toLowerCase();
                //         let iEnName = item.indicator_enname === null ? "" : item.indicator_enname.toLowerCase();
                //         let iDef = item.indicator_definition === null ? "" : item.indicator_definition.toLowerCase();
                //         let iZhExp = item.indicator_zhexp === null ? "" : item.indicator_zhexp.toLowerCase();
                //         let iEnExp = item.indicator_enexp === null ? "" : item.indicator_enexp.toLowerCase();
                //         let ikZhName = item.kpi_zhname === null ? "" : item.kpi_zhname.toLowerCase();
                //         let ikEnName = item.kpi_enname === null ? "" : item.kpi_enname.toLowerCase();
                //         let ikExp = item.kpi_exp === null ? "" : item.kpi_exp.toLowerCase();
                //         let ikExpDesc = item.kpi_exp_desc === null ? "" : item.kpi_exp_desc.toLowerCase();

                let indicatorEnName = indicator.indicator_enname;
                if (indicatorEnName === null) indicatorEnName = "";
                if (sv
                    && (sv !== "")
                    && indicator.indicator_zhname.toLowerCase().indexOf(sv) < 0
                    && indicatorEnName.toLowerCase().indexOf(sv) < 0) {
                    if (this.gMap.indicators.has(indicator.id)) {
                        if (!this.isFoundIndicatorCounters(this.gMap.indicators.get(indicator.id).counters, sv)) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }

                let myIndicator = lodash.cloneDeep(indicator);
                myIndicator.counters = [];
                if (mapCountersTemp.has(indicator.id)) {
                    mapCountersTemp.get(indicator.id).counters.forEach((item) => {
                        myIndicator.counters.push(item.id);
                    });
                }
                myResult.mapIndicators.set(myIndicator.id, myIndicator);

                let uiIndicator = {
                    key: myIndicator.id.toString(),
                    title: <div className="BoxTreeNodeTitle">{myIndicator.indicator_zhname}</div>,
                    children: []
                }

                if (mapCountersTemp.has(indicator.id)) {
                    mapCountersTemp.get(indicator.id).counters.forEach((counter) => {
                        uiIndicator.children.push({
                            key: indicator.id + "_" + counter.id,
                            title: <div className="BoxTreeNodeTitle">{counter.counter_zhname + " - " + counter.counter_enname}</div>,
                            children: []
                        });
                    });
                }

                myResult.uiTree.push(uiIndicator);
            }
        }

        return myResult;
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
                title: <div className={"BoxTreeNodeTitle"}>{item.schema_id + " - " + item.schema_zhname}</div>,
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
                    title: <div className={"BoxTreeNodeTitle"}>{schemaClone.schema_id + " - " + schemaClone.schema_zhname}</div>,
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
                    title: <div className="BoxTreeNodeTitle">{schema.schema_id + " - " + schema.schema_zhname}</div>,
                });
                break
            case "clone":
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    if (treeDataKpiSchemas[i].key === this.gCurrent.schema.id) {
                        treeDataKpiSchemas.splice(i + 1, 0, {
                            key: schema.id,
                            title: <div className={"BoxTreeNodeTitle"}>{schema.schema_id + " - " + schema.schema_zhnam}</div>,
                        });
                        break
                    }
                }
                break
            case "update":
                for (let i = 0; i < treeDataKpiSchemas.length; i++) {
                    let item = treeDataKpiSchemas[i];
                    if (item.key === sid) {
                        item.title = <div className="BoxTreeNodeTitle">{schema.schema_id + " - " + schema.schema_zhname}</div>;
                        break
                    }
                }

                let treeDataKpis = lodash.cloneDeep(this.state.treeDataKpis);

                for (let i = 0; i < treeDataKpis.length; i++) {
                    let item = treeDataKpis[i];
                    let kid = item.key;
                    let kpi = this.gMap.kpis.get(kid);
                    let kpi_id = schema.schema_id + kpi.kpi_id.substr(kpi.kpi_id.length - 2, 2);
                    item.title = <div className="BoxTreeNodeTitle">{kpi_id + " - " + kpi.kpi_zhname}</div>
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

                this.gCurrent.initForSchema();
                let emptySchema = new TadKpiSchema();
                emptySchema.init();
                this.onFormSchemaPropertiesFill(emptySchema);
                let emptyKpi = new TadKpi();
                emptyKpi.init();
                this.onFormKpiPropertiesFill(emptyKpi);

                this.setState({
                    treeDataKpis: [],
                    treeDataKpiCounters: [],
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
            case "import":
                let schemaImported = lodash.cloneDeep(schema);
                // schemaImported.kpis.length = 0;
                // schemaImported.counters.length = 0;
                this.gMap.schemas.set(schema.id, schemaImported);
                break
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
                    title: <div className="BoxTreeNodeTitle">{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
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
                        item.title = <div className="BoxTreeNodeTitle">{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>
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

                // if (this.gMap.schemas.has(kpi.sid)) {
                //     let kpis = this.gMap.schemas.get(kpi.sid).kpis;
                //     for (let i = 0; i < kpis.length; i++) {
                //         if (kpis[i].id === kpi.id) {
                //             kpis[i].kpi_zhname = kpi.kpi_zhname;
                //             kpis[i].kpi_enname = kpi.kpi_enname;
                //             kpis[i].kpi_field = kpi.kpi_field;
                //             kpis[i].kpi_alarm = kpi.kpi_alarm;
                //             kpis[i].kpi_format = kpi.kpi_format;
                //             kpis[i].kpi_min_value = kpi.kpi_min_value;
                //             kpis[i].kpi_max_value = kpi.kpi_max_value;
                //             kpis[i].kpi_exp = kpi.kpi_exp;
                //             kpis[i].used_info = kpi.used_info;
                //             break
                //         }
                //     }
                // }
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

    uiUpdateCounter(counters, what) {
        let treeDataCounters;

        switch (what) {
            case "add":
                treeDataCounters = lodash.cloneDeep(this.state.treeDataKpiCounters);

                let uiCounter = {
                    key: counters.id,
                    // title: <div className={"BoxTreeNodeTitle"}>{counters.counter_zhname + " - " + counters.counter_enname}</div>,
                    title: <div className={"BoxTreeNodeTitle"}>{counters.counter_field + " - " + counters.counter_enname}</div>,
                    children: []
                }

                treeDataCounters.push(uiCounter);
                this.setState({
                    treeDataKpiCounters: treeDataCounters
                });
                break
            case "clone":
                break
            case "delete":
                treeDataCounters = lodash.cloneDeep(this.state.treeDataKpiCounters);
                let index = -1;
                counters.forEach((counter) => {
                    for (let i = 0; i < treeDataCounters.length; i++) {
                        let item = treeDataCounters[i];
                        if (item.key === counter.id) {
                            index = i;
                            break
                        }
                    }
                    treeDataCounters.splice(index, 1);
                });
                let newKpi = new TadKpi();
                newKpi.init();
                this.setState({
                    selectedKpi: newKpi
                });
                this.setState({
                    treeDataKpiCounters: treeDataCounters
                })
                break
            default:
                break;
        }
    }

    // ds Update Counter
    dsUpdateCounter(counter, what) {
        switch (what) {
            case "add":
                this.gMap.schemas.get(counter.sid).counters.push(counter.id);
                this.gMap.counters.set(counter.id, counter);

                if (this.gCurrent.counterNames !== undefined) {
                    this.gCurrent.counterNames.push(counter.counter_enname);
                }
                break
            case "delete":
                if (this.gMap.schemas.has(counter.sid)) {
                    let counters = this.gMap.schemas.get(counter.sid).counters;
                    for (let i = 0; i < counters.length; i++) {
                        if (counters[i] === counter.id) {
                            counters.splice(i, 1);
                            break
                        }
                    }
                }

                this.gCurrent.counterNames.splice(this.gCurrent.counterNames.indexOf(counter.counter_enname), 1);
                break
            default:
                break;
        }
    }

    doFixKpiCounters(mapSchemas) {
        mapSchemas.forEach((value, key) => {
            let counter = new TadKpiCounter();
            counter.sid = key;
            counter.schema_id2 = value.schema_id;
            this.restFixKpiCounter(counter).then((result) => {
                this.context.showMessage("result");
            });
        })
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

    // >>>>> import indicator form excel
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

    // >>>>> do Get All
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
            this.doGetIndicators(),
            this.doGetIndicatorCounters(),
        ]).then(axios.spread((
            kpiDict,
            objectDefs,
            vendors,
            products,
            modules,
            kpis,
            schemas,
            counters,
            indicators,
            indicatorCounters
        ) => {
            let mapKpiDict = new Map();
            let mapObjectDefs = new Map();
            // let mapProducts = new Map();
            let mapKpis = new Map();
            // let mapIndicators = new Map();

            let dsKpiDict = kpiDict.data.data;
            let dsObjectDefs = objectDefs.data.data;
            let dsVendors = vendors.data.data;
            // let dsProducts = products.data.data;
            // let dsModules = modules.data.data;
            let dsKpis = kpis.data.data;
            let dsSchemas = schemas.data.data;
            let dsCounters = counters.data.data;
            let dsIndicators = this.gData.indicators = indicators.data.data;
            let dsIndicatorCounters = this.gData.indicatorCounters = indicatorCounters.data.data;

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
            let optionsObjectSubClass = [{label: "不区分网元细分类型", value: -1}];
            if (this.gMap.kpiDict.has(1023)) {
                let options = [{label: "网元类型", value: -99999}];
                this.gMap.kpiDict.get(1023).forEach((value, key) => {
                    if (!this.gSchemaIdRegionCodes.includes(value.id)) {
                        options.push({label: value.txt, value: value.id});
                        optionsObjectSubClass.push({label: value.txt, value: value.id});
                    }
                });
                this.setState({
                    optionsSchemaIdB2: options
                })
            }

            // 厂家控件
            let optionsVendor = [{label: "不区分厂家", value: -1}];
            for (let i = 0; i < dsVendors.length; i++) {
                if (dsVendors[i].type >= 0 && dsVendors[i].type <= 99) {
                    optionsVendor.push({label: dsVendors[i].zh_name, value: dsVendors[i].type});
                }
            }

            // 网元类型，网元细分类型控件
            // let optionsIsMo = [{label: "MO指标组", value: -99999}];
            // optionsIsMo.push({label: "非MO指标组", value: 0});
            // optionsIsMo.push({label: "是MO指标组", value: 1});
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
                    //optionsIsMo.push({label: item.network_type_name, value: item.network_type});
                } else {
                    mapObjectDefs.get(item.network_type).subClasses.push({
                        objectClass: item.object_class,
                        className: item.object_name,
                    });
                }
            }
            this.gMap.objectDefs = mapObjectDefs;


            // 采集粒度控件
            // let optionsIntervalFlag = [{label: "采集粒度", value: -99999}];

            // 使用该指标的产品控件
            // let optionsProduct = [{label: "使用该指标的产品", value: -99999}];
            // for (let i = 0; i < dsProducts.length; i++) {
            //     let item = dsProducts[i];
            //     if (!mapProducts.has(item.product_id)) {
            //         mapProducts.set(item.product_id, {
            //             product_name: item.product_name,
            //             modules: []
            //         });
            //         optionsProduct.push({label: item.product_name, value: item.product_id});
            //     }
            // }

            // 使用该指标的模块控件
            // let optionsModule = [{label: "使用该指标的模块", value: -99999}];
            // for (let i = 0; i < dsModules.length; i++) {
            //     let item = dsModules[i];
            //     if (mapProducts.has(item.product_id)) {
            //         mapProducts.get(item.product_id).modules.push({
            //             module_name: item.module_name,
            //             module_id: item.module_id
            //         });
            //     }
            // }
            // this.gMap.products = mapProducts;

            // 规范指标集
            let myIndicators = this.dataIndicators2DsMapUiTree(dsIndicators, dsIndicatorCounters);
            this.gMap.indicators = myIndicators.mapIndicators;
            this.gMap.indicatorCounters = myIndicators.mapCounters;
            this.gUi.indicators = myIndicators.uiTree;

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
            // dsProducts = null;
            // dsModules = null;
            dsKpis = null;
            dsSchemas = null;
            dsCounters = null;

            this.setState({
                optionsVendor: optionsVendor,
                // optionsIsMo: optionsIsMo,
                optionsObjectSubClass: optionsObjectSubClass,
                // optionsIntervalFlag: optionsIntervalFlag,
                // optionsProduct: optionsProduct,
                // optionsModule: optionsModule,
            });

            this.setState({
                treeDataKpiSchemas: mySchemas.uiDs,
                treeDataIndicators: myIndicators.uiTree,
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
                                        arrSchemas.push({id: item.object_id, un: item.user_name, op: item.operation, et: item.event_time})
                                    }
                                } else {
                                    arrSchemasDeleted.push({id: item.object_id, un: item.user_name, op: item.operation, et: item.event_time})
                                }
                                break
                            case "kpi":
                                if (this.gMap.kpis.has(item.object_id)) {
                                    let sid = this.gMap.kpis.get(item.object_id).sid;
                                    if (!mapSchemas.has(sid)) {
                                        mapSchemas.set(sid, {});
                                        arrSchemas.push({id: sid, un: item.user_name, op: "kpi_update", et: item.event_time})
                                    }
                                }
                                break
                            case "counter":
                                if (this.gMap.counters.has(item.object_id)) {
                                    let sid = this.gMap.counters.get(item.object_id).sid;
                                    if (!mapSchemas.has(sid)) {
                                        mapSchemas.set(sid, {});
                                        arrSchemas.push({id: sid, un: item.user_name, op: "counter_update", et: item.event_time})
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
                            title: <div className={"BoxTreeNodeTitle"}>{schema.schema_id + " - " + schema.schema_zhname}</div>,
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
                    } else if (what === "import") {
                        schema.kpis2.forEach((itemKpi) => {
                            itemKpi.sid = result.data.data.id;
                            this.doAddKpi(itemKpi, "import");
                        })
                        schema.counters2.forEach((itemCounter) => {
                            itemCounter.sid = result.data.data.id;
                            this.doAddCounter(itemCounter, "import");
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

    // >>>>> do Add KPI Counter
    doAddCounter(counter, what) {
        this.restAddCounter(counter).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateCounter(result.data.data, what);
                    this.dsUpdateCounter(result.data.data, "add");
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

    doDeleteCounter(counter) {
        // db delete
        this.restDeleteCounter(counter).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateCounter(result.data.data, "delete");
                    this.dsUpdateCounter(result.data.data, "delete");
                    this.context.showMessage("删除成功，被删除指标ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

        // current delete
        for (let i = 0; i < this.gCurrent.schema.counters.length; i++) {
            if (this.gCurrent.schema.counters[i] === counter.id) {
                this.gCurrent.schema.counters.splice(i, 1);
                break
            }
        }

        // db update index
        // let sid = this.gCurrent.schema.id;
        // let schema_id = this.gMap.schemas.get(sid).schema_id;
        // for (let i = 0; i < this.gCurrent.schema.kpis.length; i++) {
        //     let kid = this.gCurrent.schema.kpis[i].id;
        //     let kpi = this.gMap.kpis.get(kid);
        //     kpi.kpi_id = schema_id + (i + 1).toString().padStart(2, "0");
        //     kpi.kpi_field = "field" + (i + 1).toString().padStart(2, "0");
        //
        //     this.doUpdateKpi(kpi);
        // }
    }

    // >>>>> check Indicators
    onTreeIndicatorsChecked(checkedKeys, info) {
        this.gCurrent.indicatorsChecked = checkedKeys;
    }

    // >>>>> click Indicators
    onTreeIndicatorsSelected(selectedKeys, info) {

    }

    // >>>>> click schema
    onTreeKpiSchemasSelected(selectedKeys, info) {
        this.gCurrent.counterNames = [];

        if (info.selected) {
            this.gRef.treeKpis.current.state.selectedKeys = [];     // 清除之前的选中项
            this.gRef.treeCounters.current.state.selectedKeys = []; // 清除之前的选中项

            let sid = selectedKeys[0];
            let schema;
            let uiKpis = [];
            let uiKpiCounters = [];

            schema = this.gMap.schemas.get(sid);
            this.gCurrent.schema = schema;

            schema.kpis.forEach((kid) => {
                if (this.gMap.kpis.has(kid)) {

                    let kpi = this.gMap.kpis.get(kid);
                    let uiKpi = {
                        key: kpi.id,
                        title: <div className={"BoxTreeNodeTitle"}>{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
                        children: []
                    }
                    let index = parseInt(kpi.kpi_id?.substr(kpi.kpi_id.length - 2, 2)) - 1;
                    uiKpis[index] = uiKpi;
                }
            });

            schema.counters.forEach((cid) => {
                if (this.gMap.counters.has(cid)) {
                    let counter = this.gMap.counters.get(cid);
                    uiKpiCounters.push({
                        key: counter.id,
                        // title: <div className={"BoxTreeNodeTitle"}>{counter.counter_zhname + " - " + counter.counter_enname}</div>,
                        title: <div className={"BoxTreeNodeTitle"}>{counter.counter_field + " - " + counter.counter_enname}</div>,
                        children: []
                    })
                    this.gCurrent.counterNames.push(counter.counter_enname);
                }
            })

            this.onFormSchemaPropertiesFill(schema);
            let newKpi = new TadKpi();
            newKpi.init();
            this.onFormKpiPropertiesFill(newKpi);

            this.setState({
                treeDataKpis: uiKpis,
                treeDataKpiCounters: uiKpiCounters,
            });

            if (this.gCurrent.schemasChecked.has(sid)) {
                let checkedKeys = [];
                this.gCurrent.schemasChecked.get(sid).kpis.forEach((value, key) => {
                    checkedKeys.push(key);
                })

                //console.log(checkedKeys);
                //this.gRef.treeKpis.current.checkedKeys = checkedKeys;
                this.setState({
                    checkedKeysKpis: checkedKeys
                })
            }
        } else {
            this.gCurrent.initForSchema();
            let emptySchema = new TadKpiSchema();
            emptySchema.init();
            this.onFormSchemaPropertiesFill(emptySchema);
            let emptyKpi = new TadKpi();
            emptyKpi.init();
            this.onFormKpiPropertiesFill(emptyKpi);

            this.setState({
                treeDataKpis: [],
                treeDataKpiCounters: [],
            });
        }
    };

    onTreeKpiSchemasChecked(checkedKeys, info) {
        checkedKeys.forEach((sid) => {
            if (!this.gCurrent.schemasChecked.has(sid)) {
                this.gCurrent.schemasChecked.set(sid, {status: "new", kpis: new Map()});
            } else {
                this.gCurrent.schemasChecked.get(sid).status = "added";
            }
        })

        this.gCurrent.schemasChecked.forEach((value, key) => {
            if (value.status === "new") {
                value.status = "add"

                console.log(this.gMap);
                this.gMap.schemas.get(key).kpis.forEach((kid) => {
                    value.kpis.set(kid, {status: "new"});
                })
            } else if (value.status === "added") {
                value.status = "add"
            } else {
                value.status = "unchecked"
            }
        });

        this.gCurrent.schemasChecked.forEach((value, key) => {
            if (value.status === "unchecked") {
                this.gCurrent.schemasChecked.delete(key);
            } else {
            }
        });
    }

    // >>>>> check KPI
    onTreeKpisChecked(checkedKeys, info) {
        this.setState({
            checkedKeysKpis: checkedKeys
        });

        let sid = this.gCurrent.schema.id;
        console.log(sid);
        if (this.gCurrent.schemasChecked.has(sid)) {

            checkedKeys.forEach((kid) => {
                this.gCurrent.schemasChecked.get(sid).kpis.forEach((value, key) => {
                    if (kid === key) {
                        value.status = "added"
                    }
                });
            });

            this.gCurrent.schemasChecked.get(sid).kpis.forEach((value, key) => {
                if (value.status === "new") {
                    value.status = "add"
                } else if (value.status === "added") {
                    value.status = "add"
                } else {
                    value.status = "unchecked"
                }
            });

            this.gCurrent.schemasChecked.get(sid).kpis.forEach((value, key) => {
                if (value.status === "unchecked") {
                    this.gCurrent.schemasChecked.get(sid).kpis.delete(key);
                } else {
                }
            });

            console.log(lodash.cloneDeep(this.gCurrent.schemasChecked));

        } else {

            this.gCurrent.schemasChecked.set(sid, {status: "add", kpis: new Map()});

            checkedKeys.forEach((kid) => {
                this.gCurrent.schemasChecked.get(sid).kpis.set(kid, {status: "add"})
            });

        }
    }

    // >>>>> click KPI
    onTreeKpisSelected(selectedKeys, info) {
        if (info.selected) {
            let kid = selectedKeys[0];

            let kpi = this.gMap.kpis.get(kid);
            this.gCurrent.kpi = kpi;

            this.onFormKpiPropertiesFill(kpi);
        } else {
            this.gCurrent.kpi = null;

            let newKpi = new TadKpi();
            newKpi.init();
            this.onFormKpiPropertiesFill(newKpi);
        }
    }

    // >>>>> click counter
    onTreeKpiCountersSelected(selectedKeys, info) {
        if (info.selected) {
            let cid = selectedKeys[0];
            let counter = this.gMap.counters.get(cid);
            this.gCurrent.counter = counter;
        } else {
            this.gCurrent.counter = null;
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
                title: <div className={"BoxTreeNodeTitle"}>{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
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
        schemaId = strBb + "260" + strA1 + strA2 + strB + strC;

        this.gRef.formSchemaProperties.current.setFieldsValue({
            schemaId: schemaId,
        });
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

    getCellWidth(value) {
        // 判断是否为null或undefined
        if (value == null) {
            return 10
        } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
            // 判断是否包含中文
            return value.toString().length * 2.1
        } else {
            return value.toString().length * 1.1
            /* 另一种方案
            value = value.toString()
            return value.replace(/[\u0391-\uFFE5]/g, 'aa').length
            */
        }
    }

    generateSqlCreateCounterTable(schema) {
        let strSql = "create table " + schema.counter_tab_name + "(\n" +
            "\t ne_id number(20, 0) not null,\n" +
            "\t unit_id varchar2(255) not null,\n" +
            "\t timestamp data,\n" +
            "\t scan_start_time date not null,\n" +
            "\t scan_stop_time date,\n" +
            "\t province_id integer,\n" +
            "\t region_id integer,\n" +
            "\t city_id integer,\n" +
            "\t sv_id number(20, 0),\n" +
            "\t sv_cat_id integer,\n" +
            "\t scan_date varchar2(10),\n" +
            "\t scan_time varchar2(4),\n";

        schema.counters.forEach((cid) => {
            let counter = this.gMap.counters.get(cid);
            strSql += "\t " + counter.counter_field + " float, \n";
        });

        let c = schema.counters.length
        let iMax = 20;
        if (c > 79) iMax = 99 - c;

        for (let i = 1; i <= iMax; i++) {
            strSql += "\t counter" + (c + i) + " float, \n";
        }

        strSql += "\t counter_notes varchar2(255)\n" +
            ");\n" +
            "create unique index ix_" + schema.counter_tab_name + " on " + schema.counter_tab_name + "( scan_start_time, ne_id, unit_id, sv_cat_id);\n\n";

        return strSql;
    }

    generateSqlCreateKpiTable(schema) {
        let strSql = "create table " + schema.tab_name + "(\n" +
            "\t ne_id number(20, 0) not null,\n" +
            "\t unit_id varchar2(255) not null,\n" +
            "\t timestamp data,\n" +
            "\t scan_start_time date not null,\n" +
            "\t scan_stop_time date,\n" +
            "\t sv_id number(20, 0),\n" +
            "\t sv_cat_id integer,\n" +
            "\t scan_date varchar2(10),\n" +
            "\t scan_time varchar2(4),\n";

        schema.kpis.forEach((kid) => {
            let kpi = this.gMap.kpis.get(kid);
            strSql += "\t " + kpi.kpi_field + " float,\n" +
                "\t " + kpi.kpi_field + "_status integer,\n";
        });

        let c = schema.kpis.length
        let iMax = 20;
        if (c > 79) iMax = 99 - c;

        for (let i = 1; i <= iMax; i++) {
            strSql += "\t kpi" + (c + i) + " float,\n" +
                "\t kpi" + (c + i) + "_status integer,\n";
        }

        strSql += "\t kpi_notes varchar2(255)\n" +
            ");\n" +
            "create unique index ix_" + schema.tab_name + " on " + schema.tab_name + "( scan_start_time, ne_id, unit_id, sv_cat_id);\n\n";

        return strSql;
    }

    generateSqlInsertKpiSchema(schema) {
        let strSql = "insert into tai_rtkpischema(schema_id, schema_ns, schema_zhname, tab_name, vendor_id, object_class, sub_class, sum_type, counter_tab_name, used_type, interval_flag, enable_flag)\n" +
            "\t values(" +
            "'" + schema.schema_id + "', " +
            "'" + schema.schema_ns + "', " +
            "'" + schema.schema_zhname + "', " +
            "'" + schema.tab_name + "', " +
            "'" + schema.vendor_id + "', " +
            "'" + schema.object_class + "', " +
            "'" + schema.sub_class + "', " +
            "'" + schema.sum_type + "', " +
            "'" + schema.counter_tab_name + "', " +
            "'" + schema.used_type + "', " +
            "'" + schema.interval_flag + "', " +
            "'" + schema.enable_flag + "');\n\n";

        return strSql;
    }

    generateSqlInsertKpiCounter(schema) {
        let strSql = "";

        schema.counters.forEach((cid) => {
            let counter = this.gMap.counters.get(cid);
            strSql += "insert into tai_rtkpicounter(schema_id, counter_enname, counter_zhname, counter_filed)\n" +
                "\t values(" +
                "'" + schema.schema_id + "', " +
                "'" + counter.counter_enname + "', " +
                "'" + counter.counter_zhname + "', " +
                "'" + schema.counter_field + "');\n\n";
        });

        return strSql;
    }

    generateSqlInsertKpi(schema) {
        let strSql = "";

        schema.kpis.forEach((kid) => {
            let kpi = this.gMap.kpis.get(kid);
            strSql += "insert into tai_rtkpis(schema_id, kpi_id, kpi_enname, kpi_zhname, kpi_exp, kpi_alarm, kpi_format, kpi_min_value, kpi_max_value, used_type, disp_order, kpi_field, baseline)\n" +
                "\t values(" +
                "'" + schema.schema_id + "', " +
                "'" + kpi.kpi_id + "', " +
                "'" + kpi.kpi_enname + "', " +
                "'" + kpi.kpi_zhname + "', " +
                "'" + kpi.kpi_exp + "', " +
                "'" + kpi.kpi_alarm + "', " +
                "'" + kpi.kpi_format + "', " +
                "'" + kpi.kpi_min_value + "', " +
                "'" + kpi.kpi_max_value + "', " +
                "'" + kpi.used_type + "', " +
                "'" + kpi.disp_order + "', " +
                "'" + kpi.kpi_field + "', " +
                "'" + kpi.baseline + "');\n\n";
        });

        return strSql;
    }

    //todo <<<<< now >>>>> on button Schemas Export clicked
    onButtonSchemasExportClicked(e) {
        let worksheetValues = [[]];
        let worksheetNames = ['消息号与名空间的对应'];
        let worksheetHeaders = [
            ["消息号", "名空间", "中文名称", "对应表名", "厂家ID", "网元类型", "网元详细分类", "采集粒度", "COUNTER_TAB_NAME"],
            ["原始指标名", "原始字段", "原始字段名称", "   ", "KPI指标名", "KPI指标", "算法", "KPI_ID", "是否告警", "数据格式", "最小值", "最大值"]
        ];
        let strSqlCreateCounterTable = "";
        let strSqlCreateKpiTable = "";
        let strSqlInsertKpiSchema = "";
        let strSqlInsertKpiCounter = "";
        let strSqlInsertKpi = "";

        // worksheetValues[0] = [];
        let iSchema = 1;
        this.gCurrent.schemasChecked.forEach((value, key) => {
            let mySchema = this.gMap.schemas.get(key);
            strSqlCreateCounterTable += this.generateSqlCreateCounterTable(mySchema);
            strSqlCreateKpiTable += this.generateSqlCreateKpiTable(mySchema);
            strSqlInsertKpiSchema += this.generateSqlInsertKpiSchema(mySchema);
            strSqlInsertKpiCounter += this.generateSqlInsertKpiCounter(mySchema);
            strSqlInsertKpi += this.generateSqlInsertKpi(mySchema);

            let dataSchema = ["", "", "", "", "", "", "", "", ""];

            dataSchema[0] = mySchema.schema_id;
            dataSchema[1] = mySchema.schema_ns;
            dataSchema[2] = mySchema.schema_zhname;
            dataSchema[3] = mySchema.tab_name;
            dataSchema[4] = mySchema.vendor_id;
            dataSchema[5] = mySchema.object_class;
            dataSchema[6] = mySchema.sub_class;
            dataSchema[7] = mySchema.interval_flag;
            dataSchema[8] = mySchema.counter_tab_name;

            worksheetValues[0].push(dataSchema);

            worksheetValues[iSchema] = [];
            let sheetName = mySchema.schema_ns;
            if ((sheetName !== null) && (sheetName !== undefined)) {
                let i = sheetName.lastIndexOf("/");
                if (i >= 0) {
                    sheetName = sheetName.substr(i + 1, sheetName.length - i);
                }
            } else {
                sheetName = mySchema.schema_id;
            }
            console.log(sheetName);
            worksheetNames[iSchema] = iSchema.toString().padStart(2, "0") + "_" + sheetName;
            // console.log(mySchema);
            let cKpis = mySchema.kpis.length;
            let cCounters = mySchema.counters.length;
            let cMax = cKpis > cCounters ? cKpis : cCounters;

            let data = [mySchema.schema_ns, "", "", "", "", "", "", "", "", "", "", ""];
            worksheetValues[iSchema].push(data);
            for (let i = 0; i < cMax; i++) {
                let data = ["", "", "", "", "", "", "", "", "", "", "", ""];
                if (i < cCounters) {
                    let myCounter = this.gMap.counters.get(mySchema.counters[i]);
                    // console.log("counter = ", myCounter);
                    data[0] = myCounter.counter_zhname;
                    data[1] = myCounter.counter_enname;
                    data[2] = myCounter.counter_field;
                }

                if (i < cKpis) {
                    let myKpi = this.gMap.kpis.get(mySchema.kpis[i]);
                    // console.log("kpi = ", myKpi);
                    data[4] = myKpi.kpi_zhname;
                    data[5] = myKpi.kpi_enname;
                    data[6] = myKpi.kpi_exp;
                    data[7] = myKpi.kpi_id;
                    data[8] = myKpi.kpi_alarm;
                    data[9] = myKpi.kpi_format;
                    data[10] = myKpi.kpi_min_value;
                    data[11] = myKpi.kpi_max_value;
                }

                worksheetValues[iSchema].push(data);
            }
            iSchema++;
        });

        console.log(worksheetValues);
        ///*
        try {
            if (!XLSX) {
                console.log('exportTo: the plug-in "XLSX" is undefined.');
                return
            }
            if (!worksheetValues || worksheetValues.length === 0) {
                console.log('exportTo: data is null or undefined.');
                return
            }

            let myWorkbook = XLSX.utils.book_new();

            let i = 0;
            let fitWidth = true;
            worksheetNames.forEach((wsName) => {
                // worksheetValues[i].unshift(worksheetHeaders[i === 0 ? 0 : 1]);
                if (i === 0)
                    worksheetValues[i].unshift(worksheetHeaders[0]);
                else
                    worksheetValues[i].splice(1, 0, worksheetHeaders[1]);

                let myWorksheet = XLSX.utils.json_to_sheet(worksheetValues[i], {skipHeader: true});

                if (fitWidth) {
                    let colWidths = [];
                    let colNames = worksheetValues[i][0]; // Object.keys(data[0])  所有列的名称数组

                    // 计算每一列的所有单元格宽度
                    // 先遍历行
                    worksheetValues[i].forEach((row) => {
                        // 列序号
                        let index = 0
                        // 遍历列
                        for (const key in row) {
                            if (colWidths[index] == null) colWidths[index] = []

                            switch (typeof row[key]) {
                                case 'string':
                                case 'number':
                                case 'boolean':
                                    colWidths[index].push(this.getCellWidth(row[key]))
                                    break
                                case 'object':
                                case 'function':
                                    colWidths[index].push(0)
                                    break
                                default:
                                    break
                            }
                            index++
                        }
                    })

                    myWorksheet['!cols'] = []
                    // 每一列取最大值最为列宽
                    colWidths.forEach((widths, index) => {
                        // 计算列头的宽度
                        widths.push(this.getCellWidth(colNames[index]))
                        // 设置最大值为列宽
                        myWorksheet['!cols'].push({wch: Math.max(...widths)})
                    })
                }

                XLSX.utils.book_append_sheet(myWorkbook, myWorksheet, worksheetNames[i]);
                i++;
            });

            let strNow = moment().format("YYYYMMDDHHmmss");
            let fileName = "kpis_" + strNow + '.xlsx';
            XLSX.writeFile(myWorkbook, fileName);

            let zip = new JSZip();
            zip.file("kpis_create_counter_table_sql.txt", strSqlCreateCounterTable);
            zip.file("kpis_create_kpi_table_sql.txt", strSqlCreateKpiTable);
            zip.file("kpis_insert_kpi_schema_sql.txt", strSqlInsertKpiSchema);
            zip.file("kpis_insert_kpi_counter_sql.txt", strSqlInsertKpiCounter);
            zip.file("kpis_insert_kpi_sql.txt", strSqlInsertKpi);
            zip.generateAsync({type: "blob"})
                .then((content) => {
                    fs.saveAs(content, "kpis_" + strNow + ".zip");
                });

        } catch (error) {
            console.error('exportTo: ', error)
        }
        //*/
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

    onButtonCountersDeleteClicked(e) {
        this.context.showMessage("移除原始指标，开发中...");
    }

    // >>>>> 移入指标组
    onButtonIndicatorsCopy2CountersClicked(e) {
        if (this.gCurrent.schema) {
            this.gCurrent.indicatorsChecked.forEach((key) => {
                let ids = key.split("_");
                if (ids.length === 2) {
                    let indicatorCounter = this.gMap.indicatorCounters.get(parseInt(ids[1]));
                    let counter = new TadKpiCounter();
                    counter.sid = this.gCurrent.schema.id;
                    counter.counter_zhname = indicatorCounter.counter_zhname;
                    counter.counter_enname = indicatorCounter.counter_enname;
                    counter.counter_field = "COUNTER" + (this.gCurrent.schema.counters.length).toString().padStart(2, "0");

                    this.doAddCounter(counter, "add");
                }
            });
        } else {
            this.context.showMessage("请选择指标组");
        }
    }

    onButtonIndicatorsImportClicked() {
        this.context.showMessage("导入规范指标，已经开发完成，暂时屏蔽...");
        //this.doGetExcel();
    }

    onButtonIndicatorsExportClicked(e) {
        this.context.showMessage("导出规范指标，开发中...");
    }

    onButtonKpisShoppingClicked(e) {
        this.context.showMessage("开发中，目标：将选中指标添加到购物车中，以备导出使用。");
    }

    // >>>>> do copy counter name and InsertInto KpiExp
    doInsertIntoKpiExp(counter) {
        this.doCopyToClipboard(counter.counter_enname);
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
        ;

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

    onButtonInsertIntoKpiExpClicked(e) {
        if (this.gCurrent.counter) {
            this.doInsertIntoKpiExp(this.gCurrent.counter);
        }
    }

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
            case "删除统计数据":
                let cid = this.gCurrent.counter.id;
                let counter = lodash.cloneDeep(this.gMap.counters.get(cid));
                counter.sid = null;
                this.doDeleteCounter(counter);
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

    // >>>>> 搜索 INDICATOR & COUNTER
    onInputSearchIndicatorsSearched(value, event) {
        let sv = value;

        if (sv && sv !== "") {
            sv = sv.toLowerCase();

            let myIndicators = this.dataIndicators2DsMapUiTree(this.gData.indicators, this.gData.indicatorCounters, sv);

            this.setState({
                treeDataIndicators: myIndicators.uiTree
            })
        } else {
            this.setState({
                treeDataIndicators: this.gUi.indicators
            })
        }

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

    onFormSchemaPropertiesFinish(values) {
        let schema = new TadKpiSchema();

        schema.id = this.gCurrent.schema.id;
        schema.schema_id = values.schemaId;
        schema.schema_zhname = values.schemaZhName;
        schema.vendor_id = values.schemaVendor;
        //schema.object_class = values.schemaObjectClass === -99999 ? null : values.schemaObjectClass;
        schema.sub_class = values.schemaObjectSubClass === -99999 ? null : values.schemaObjectSubClass;
        schema.interval_flag = values.schemaIntervalFlag === -99999 ? null : values.schemaIntervalFlag;
        schema.counter_tab_name = values.counterTabName;

        this.doUpdateSchema(schema).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateSchema(result.data.data, "update");
                    this.dsUpdateSchema(result.data.data, "update");
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
        if (values.kpiZhName !== null) kpi.kpi_zhname = values.kpiZhName.trim();
        if (values.kpiEnName !== null) kpi.kpi_enname = values.kpiEnName.trim();
        kpi.kpi_alarm = values.kpiAlarm;
        kpi.kpi_format = values.kpiFormat;
        if (values.kpiMinValue !== null) kpi.kpi_min_value = values.kpiMinValue.trim();
        if (values.kpiMaxValue !== null) kpi.kpi_max_value = values.kpiMaxValue.trim();
        if ((values.kpiUsedProduct !== -99999) && (values.kpiUsedModule !== -99999)) {
            let kpiUsedTitle = values.kpiUsedTitle ? values.kpiUsedTitle.trim() : "";
            kpi.used_info = values.kpiUsedProduct + "," + values.kpiUsedModule + "," + kpiUsedTitle + ";"
        }

        if (values.kpiExp !== null) kpi.kpi_exp = values.kpiExp.trim();

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

    // >>>>> 为 SCHEMA FROM.ITEM 赋值
    onFormSchemaPropertiesFill(schema) {
        let schemaId = schema.schema_id.toString();
        let schemaIdA1 = -99999;
        let schemaIdA2 = -99999;
        let schemaIdB1 = -99999;
        let schemaIdB2 = -99999;
        let schemaIdIndex = 0;

        if (schemaId !== "") {
            let sids = this.splitSchemaId(schemaId);

            schemaIdA1 = sids.a1;
            schemaIdA2 = sids.a2;
            if (sids.hasRegion) {
                schemaIdB1 = sids.b1;
                schemaIdB2 = sids.b2;
            } else {
                schemaIdB2 = sids.b1;
                schemaIdIndex = sids.index;
            }

            this.gDynamic.schemaId.a1 = schema.schemaIdA1 = schemaIdA1;
            this.gDynamic.schemaId.a2 = schema.schemaIdA2 = schemaIdA2;
            this.gDynamic.schemaId.b1 = schema.schemaIdB1 = schemaIdB1;
            this.gDynamic.schemaId.b2 = schema.schemaIdB2 = schemaIdB2;
            this.gDynamic.schemaId.index = schemaIdIndex;
        }

        if (schema.vendor_id === null) schema.vendor_id = -99999;
        if (schema.object_class === null) schema.object_class = -99999;
        if (schema.sub_class === null) schema.sub_class = -99999;
        if (schema.interval_flag === null) schema.interval_flag = -99999;

        this.gRef.formSchemaProperties.current.setFieldsValue({
            schemaId: schema.schema_id,
            schemaIdA1: schema.schemaIdA1,
            schemaIdA2: schema.schemaIdA2,
            schemaIdB1: schema.schemaIdB1,
            schemaIdB2: schema.schemaIdB2,
            schemaZhName: schema.schema_zhname,
            schemaVendor: schema.vendor_id,
            //schemaObjectClass: schema.object_class,
            schemaObjectSubClass: schema.sub_class,
            schemaIntervalFlag: schema.interval_flag,
            counterTabName: schema.counter_tab_name,
        });
    }

    // >>>>> 为 KPI FROM.ITEM 赋值
    onFormKpiPropertiesFill(kpi) {
        this.gRef.formKpiProperties.current.setFieldsValue({
            kpiZhName: kpi.kpi_zhname,
            kpiEnName: kpi.kpi_enname,
            kpiAlarm: kpi.kpi_alarm,
            kpiFormat: kpi.kpi_format,
            kpiMinValue: kpi.kpi_min_value,
            kpiMaxValue: kpi.kpi_max_value,
            kpiUsedProduct: -99999,
            kpiUsedModule: -99999,
            kpiUsedTitle: "",
            kpiExp: kpi.kpi_exp
        });
        this.doDisplayExpression(kpi.kpi_exp);
    }

    // onSelectSchemaObjectClassChanged(v) {
    //     let optionsObjectSubClass = [{label: "网元细分类型", value: -99999}];
    //     if (this.gMap.objectDefs.has(v)) {
    //         this.gMap.objectDefs.get(v).subClasses.forEach((item) => {
    //             optionsObjectSubClass.push({
    //                 label: item.className,
    //                 value: item.objectClass
    //             })
    //         });
    //     }
    //     this.setState({
    //         optionsObjectSubClass: optionsObjectSubClass
    //     })
    // }

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

    //todo <<<<< now >>>>> upload and import excel
    importExcelKpisBeforeUpload(file) {
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let data = e.target.result;
                    let wb = XLSX.read(data, {type: "binary"});
                    let dsSchemas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[2]]);
                    let isFirst = true;
                    let propertyNames = [];
                    let schemas = [];

                    dsSchemas.forEach((schema) => {
                        if (isFirst) {
                            propertyNames = Object.keys(schema);
                            isFirst = false;
                        }

                        let propNameVendorId = "厂家ID";
                        let propNameCounterTabName = "COUNTER_TAB_NAME";
                        for (let i = 0; i < propertyNames.length; i++) {
                            if (propNameVendorId.toLowerCase() === propertyNames[i].toLowerCase()) {
                                propNameVendorId = propertyNames[i];
                            }
                            if (propNameCounterTabName.toLowerCase() === propertyNames[i].toLowerCase()) {
                                propNameCounterTabName = propertyNames[i];
                            }
                        }
                        let mySchema = new TadKpiSchema();

                        mySchema.schema_id = schema["消息号"].toString();
                        mySchema.schema_ns = schema["名空间"].toUpperCase();
                        mySchema.schema_zhname = schema["中文名称"].toUpperCase();
                        mySchema.tab_name = schema["对应表名"].toUpperCase();
                        mySchema.vendor_id = schema[propNameVendorId];
                        mySchema.object_class = schema["网元类型"];
                        mySchema.sub_class = schema["网元详细分类"];
                        mySchema.interval_flag = schema["采集粒度"];
                        mySchema.counter_tab_name = schema[propNameCounterTabName].toUpperCase();
                        mySchema.status = "NORMAL";

                        schemas.push(mySchema);
                    });

                    for (let i = 3; i < wb.SheetNames.length; i++) {
                        let sNs = "";
                        let mapColumns = new Map();
                        let range = XLSX.utils.decode_range(wb.Sheets[wb.SheetNames[i]]['!ref']);

                        let counters = [];
                        let kpis = [];
                        for (let R = range.s.r; R <= range.e.r; ++R) {
                            if (R === 0) {
                                sNs = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 0, r: R})]).toUpperCase();
                            } else if (R === 1) {
                                for (let C = range.s.c; C <= range.e.c; ++C) {
                                    let cFieldName = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
                                    mapColumns.set(cFieldName, C);
                                }
                            } else {
                                let strCounterZhName = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 0, r: R})]);
                                let strCounterEnName = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 1, r: R})]);
                                let strCounterField = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 2, r: R})]);
                                let strKpiZhName = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 4, r: R})]);
                                let strKpiEnName = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 5, r: R})]);
                                let strKpiExp = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 6, r: R})]);
                                let strKpiId = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 7, r: R})]);
                                let strKpiAlarm = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 8, r: R})]);
                                let strKpiFormat = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 9, r: R})]);
                                let strKpiMinValue = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 10, r: R})]);
                                let strKpiMaxValue = this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: 11, r: R})]);

                                if ((strCounterZhName !== null) && (strCounterZhName !== "null")) {
                                    let counter = new TadKpiCounter();
                                    counter.counter_zhname = strCounterZhName.toUpperCase();
                                    counter.counter_enname = strCounterEnName.toUpperCase();
                                    counter.counter_field = strCounterField.toUpperCase();
                                    counters.push(counter);
                                }

                                if ((strKpiZhName !== null) && (strKpiZhName !== "null")) {
                                    let kpi = new TadKpi();
                                    kpi.kpi_zhname = strKpiZhName.toUpperCase();
                                    kpi.kpi_enname = strKpiEnName.toUpperCase();
                                    kpi.kpi_exp = strKpiExp.toUpperCase();
                                    kpi.kpi_id = strKpiId;
                                    kpi.kpi_alarm = strKpiAlarm === "是" ? 1 : 0;
                                    kpi.kpi_format = strKpiFormat.toUpperCase();
                                    kpi.kpi_min_value = strKpiMinValue;
                                    kpi.kpi_max_value = strKpiMaxValue;
                                    kpi.kpi_field = "FIELD" + kpi.kpi_id;
                                    kpis.push(kpi);
                                }
                            }
                        }

                        for(let j = 0; j < schemas.length; j++) {
                            if (schemas[j].schema_ns === sNs) {
                                counters.forEach((itemCounter) => {
                                    schemas[j].counters2.push(itemCounter);
                                });

                                kpis.forEach((itemKpi) => {
                                    schemas[j].kpis2.push(itemKpi);
                                });
                                break
                            }
                        };
                    }

                    let gMapSchemas = Array.from(this.gMap.schemas.values());
                    let errorSchemas = [];

                    schemas.forEach((itemSchema) => {
                        itemSchema.status = this.verifySchemaImported(gMapSchemas, itemSchema);
                        console.log(itemSchema.status);
                        if (itemSchema.status === "NORMAL") {
                            this.doAddSchema(itemSchema, "import");
                        } else if (itemSchema.status === "DUPLICATE") {
                            errorSchemas.push(itemSchema);
                        } else if (itemSchema.status === "ERROR_COUNTER_FIELD") {

                        } else if (itemSchema.status === "ERROR_KPI_FIELD") {

                        } else if (itemSchema.status === "ERROR_KPI_EXP") {

                        }
                    });

                    this.exportSchemas2excel(errorSchemas);

                    resolve();
                } catch (e) {
                    reject(e.message);
                }
            }
            reader.readAsBinaryString(file);
        })

        return Upload.LIST_IGNORE;
    }

    importExcelKpisOnChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            console.log("uploading done");
        } else if (info.file.status === 'error') {
            console.log("upload failed.");
        }
    }

    verifySchemaImported(schemas, schema) {
        let myResult = schema.status;

        for(let i = 0; i < schemas.length; i++) {
            if (schemas[i].schema_id === schema.schema_id) {
                myResult = "DUPLICATE";
                break
            }
        }

        return myResult
    }

    exportSchemas2excel(schemas) {
        let worksheetValues = [[]];
        let worksheetNames = ['消息号与名空间的对应'];
        let worksheetHeaders = [
            ["消息号", "名空间", "中文名称", "对应表名", "厂家ID", "网元类型", "网元详细分类", "采集粒度", "COUNTER_TAB_NAME"],
            ["原始指标名", "原始字段", "原始字段名称", "   ", "KPI指标名", "KPI指标", "算法", "KPI_ID", "是否告警", "数据格式", "最小值", "最大值"]
        ];

        let iSchema = 1;
        schemas.forEach((mySchema) => {
            let dataSchema = ["", "", "", "", "", "", "", "", ""];

            dataSchema[0] = mySchema.schema_id;
            dataSchema[1] = mySchema.schema_ns;
            dataSchema[2] = mySchema.schema_zhname;
            dataSchema[3] = mySchema.tab_name;
            dataSchema[4] = mySchema.vendor_id;
            dataSchema[5] = mySchema.object_class;
            dataSchema[6] = mySchema.sub_class;
            dataSchema[7] = mySchema.interval_flag;
            dataSchema[8] = mySchema.counter_tab_name;

            worksheetValues[0].push(dataSchema);

            worksheetValues[iSchema] = [];
            let sheetName = mySchema.schema_ns;
            if ((sheetName !== null) && (sheetName !== undefined)) {
                let i = sheetName.lastIndexOf("/");
                if (i >= 0) {
                    sheetName = sheetName.substr(i + 1, sheetName.length - i);
                }
            } else {
                sheetName = mySchema.schema_id;
            }

            worksheetNames[iSchema] = iSchema.toString().padStart(2, "0") + "_" + sheetName;

            let cKpis = mySchema.kpis2.length;
            let cCounters = mySchema.counters2.length;
            let cMax = cKpis > cCounters ? cKpis : cCounters;

            let data = [mySchema.schema_ns, "", "", "", "", "", "", "", "", "", "", ""];
            worksheetValues[iSchema].push(data);
            for (let i = 0; i < cMax; i++) {
                let data = ["", "", "", "", "", "", "", "", "", "", "", ""];
                if (i < cCounters) {
                    let myCounter = mySchema.counters2[i];

                    data[0] = myCounter.counter_zhname;
                    data[1] = myCounter.counter_enname;
                    data[2] = myCounter.counter_field;
                }

                if (i < cKpis) {
                    let myKpi = mySchema.kpis2[i];

                    data[4] = myKpi.kpi_zhname;
                    data[5] = myKpi.kpi_enname;
                    data[6] = myKpi.kpi_exp;
                    data[7] = myKpi.kpi_id;
                    data[8] = myKpi.kpi_alarm;
                    data[9] = myKpi.kpi_format;
                    data[10] = myKpi.kpi_min_value;
                    data[11] = myKpi.kpi_max_value;
                }

                worksheetValues[iSchema].push(data);
            }
            iSchema++;
        });

        try {
            if (!XLSX) {
                console.log('exportTo: the plug-in "XLSX" is undefined.');
                return
            }
            if (!worksheetValues || worksheetValues.length === 0) {
                console.log('exportTo: data is null or undefined.');
                return
            }

            let myWorkbook = XLSX.utils.book_new();

            let i = 0;
            let fitWidth = true;
            worksheetNames.forEach((wsName) => {
                if (i === 0)
                    worksheetValues[i].unshift(worksheetHeaders[0]);
                else
                    worksheetValues[i].splice(1, 0, worksheetHeaders[1]);

                let myWorksheet = XLSX.utils.json_to_sheet(worksheetValues[i], {skipHeader: true});

                if (fitWidth) {
                    let colWidths = [];
                    let colNames = worksheetValues[i][0]; // Object.keys(data[0])  所有列的名称数组

                    // 计算每一列的所有单元格宽度
                    // 先遍历行
                    worksheetValues[i].forEach((row) => {
                        // 列序号
                        let index = 0
                        // 遍历列
                        for (const key in row) {
                            if (colWidths[index] == null) colWidths[index] = []

                            switch (typeof row[key]) {
                                case 'string':
                                case 'number':
                                case 'boolean':
                                    colWidths[index].push(this.getCellWidth(row[key]))
                                    break
                                case 'object':
                                case 'function':
                                    colWidths[index].push(0)
                                    break
                                default:
                                    break
                            }
                            index++
                        }
                    })

                    myWorksheet['!cols'] = []
                    // 每一列取最大值最为列宽
                    colWidths.forEach((widths, index) => {
                        // 计算列头的宽度
                        widths.push(this.getCellWidth(colNames[index]))
                        // 设置最大值为列宽
                        myWorksheet['!cols'].push({wch: Math.max(...widths)})
                    })
                }

                XLSX.utils.book_append_sheet(myWorkbook, myWorksheet, worksheetNames[i]);
                i++;
            });

            let strNow = moment().format("YYYYMMDDHHmmss");
            let fileName = "kpis_" + strNow + '.xlsx';
            XLSX.writeFile(myWorkbook, fileName);
        } catch (error) {
            console.error('exportTo: ', error)
        }
    }


    // uploadKpisProps = {
    //     name: 'file',
    //     // action: '',
    //     // headers: {
    //     //     authorization: 'authorization-text',
    //     // },
    //     accept: ".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //     beforeUpload: file => {
    //         new Promise(function (resolve, reject) {
    //             const reader = new FileReader();
    //             reader.onload = (e) => {
    //                 try {
    //                     let data = e.target.result;
    //                     let wb = XLSX.read(data, {type: "binary"});
    //
    //                     for (let i = 0; i < wb.SheetNames.length; i++) {
    //                         let range = XLSX.utils.decode_range(wb.Sheets[wb.SheetNames[i]]['!ref']);
    //                         for (let C = range.s.c; C <= range.e.c; ++C) {
    //                             //console.log(this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: 0})]), C);
    //
    //                             // let C;
    //                             //let lastIndicator = new TadIndicator();
    //                             for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    //                                 //let myIndicator = new TadIndicator();
    //                                 //let myIndicatorCounter = new TadIndicatorCounter();
    //
    //                                 //myIndicator.excel_name = "counter_001.xlsx";
    //                                 //myIndicator.excel_sheet_name = wb.SheetNames[i];
    //                                 //C = this.getColumnIndex("设备类型,网元类型", mapColumns);
    //                                 //myIndicator.indicator_object_class = (C === -1) ? null : this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]);
    //                                 console.log(this.toCellValue(wb.Sheets[wb.SheetNames[i]][XLSX.utils.encode_cell({c: C, r: R})]));
    //                             }
    //                         }
    //                     }
    //
    //                     /*
    //                     mapIndicators.forEach((value, key) => {
    //                         let myIndicator = value.indicator;
    //                         axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_indicator",
    //                             myIndicator,
    //                             {headers: {'Content-Type': 'application/json'}}
    //                         ).then((response) => {
    //                             let data = response.data;
    //
    //                             if (data.success) {
    //                                 let indicatorZhName = data.data.indicator_zhname;
    //                                 let indicatorId = data.data.id;
    //                                 if (mapIndicators.has(indicatorZhName)) {
    //                                     mapIndicators.get(indicatorZhName).counters.forEach((counter) => {
    //                                         let myCounter = counter;
    //                                         myCounter.indicator_id = indicatorId;
    //
    //                                         axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/add_indicator_counter",
    //                                             myCounter,
    //                                             {headers: {'Content-Type': 'application/json'}}
    //                                         ).then((response) => {
    //                                             let data = response.data;
    //
    //                                             if (data.success) {
    //                                                 // message.info("成功导入指标COUNTER：" + data.data.counter_zhname).then(r => {});
    //                                                 this.context.showMessage("成功导入指标COUNTER：" + data.data.counter_zhname);
    //                                             }
    //                                         });
    //                                     })
    //                                 }
    //                                 // message.info("成功导入指标：" + data.data.indicator_zhname).then(r => {});
    //                                 this.context.showMessage("成功导入指标：" + data.data.indicator_zhname);
    //                             }
    //                         });
    //                     })
    //                     */
    //
    //                     const sName = wb.SheetNames[2];
    //                     const sData = XLSX.utils.sheet_to_json(wb.Sheets[sName]);
    //                     console.log(sData);
    //                     resolve();
    //                     //return Upload.LIST_IGNORE;
    //                 } catch (e) {
    //                     reject(e.message);
    //                     //return Upload.LIST_IGNORE;
    //                 }
    //             }
    //             reader.readAsBinaryString(file);
    //         })
    //
    //         return Upload.LIST_IGNORE;
    //     },
    //     onChange(info) {
    //         if (info.file.status !== 'uploading') {
    //             console.log(info.file, info.fileList);
    //         }
    //         if (info.file.status === 'done') {
    //             console.log("uploading done");
    //         } else if (info.file.status === 'error') {
    //             console.log("upload failed.");
    //         }
    //     },
    // };

    //todo >>>>> render
    render() {

        return (
            <div className={this.state.styleLayout === "NN" ? "ServicePerformance" : "ServicePerformance ServicePerformanceSmall"}>
                <div className={"BoxSchemasAndIndicators"}>
                    <div className={"BoxSchemas"}>
                        <div className={"BoxTitleBar"}>
                            <div className={this.state.styleLayout === "NN" ? "BoxTitle" : "BoxTitle BoxHidden"}><Checkbox>指标组</Checkbox></div>
                            <div className={this.state.styleLayout === "NN" ? "BoxButtons" : "BoxButtons BoxHidden"}>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonSchemasAddClicked}>新增</Button>
                                <Button size={"small"} type={"primary"} icon={<CopyOutlined/>} onClick={this.onButtonSchemasCopyPasteClicked}>复制</Button>
                                <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                    this.showModal("删除指标组")
                                }}>删除</Button>
                                {/*<Upload {...this.uploadKpisProps}>*/}
                                <Upload name='file'
                                        accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        beforeUpload={this.importExcelKpisBeforeUpload}
                                        onChange={this.importExcelKpisBeforeUpload}>
                                    <Button size={"small"} type={"primary"} icon={<CloudUploadOutlined/>}>导入</Button>
                                </Upload>
                                <Button size={"small"} type={"primary"} icon={<CloudDownloadOutlined/>} onClick={this.onButtonSchemasExportClicked}>导出</Button>
                            </div>
                            <div>
                                <Button size={"small"} type={"ghost"} icon={this.state.styleLayout === "NN" ? <CaretLeftOutlined/> : <CaretRightOutlined/>} onClick={this.onButtonChangeStyleLayoutClicked}/>
                            </div>
                        </div>
                        <div className={this.state.styleLayout === "NN" ? "BoxTree" : "BoxTree BoxHidden"}>
                            <div className={"BoxSearch"}>
                                <Input.Search placeholder="Search" enterButton onSearch={this.onInputSearchSchemasSearched}/>
                            </div>
                            <div className={"BoxButtons"}>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdA1} defaultValue={-99999} onChange={this.onSelectFilterBusinessChanged}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdA2} defaultValue={-99999} onChange={this.onSelectFilterTimeChanged}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdB1} defaultValue={-99999} onChange={this.onSelectFilterRegionChanged}/>
                                <Select className="clsSelect" size="small" options={this.state.optionsSchemaIdB2} defaultValue={-99999} onChange={this.onSelectFilterObjectChanged}/>
                            </div>

                            <div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>
                                <Tree ref={this.gRef.treeSchemas}
                                      treeData={this.state.treeDataKpiSchemas}
                                      onSelect={this.onTreeKpiSchemasSelected}
                                      onCheck={this.onTreeKpiSchemasChecked}
                                      height={this.state.treeSchemasHeight}
                                      checkable={true} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                            </div>
                        </div>
                    </div>
                    <div className="BoxIndicators">
                        <div className="BoxTitleBar">
                            {this.state.styleLayout !== "NN" && <div className="clsHSpace">&nbsp;</div>}
                            <div className={this.state.styleLayout === "NN" ? "BoxTitle" : "BoxTitle BoxHidden"}><Checkbox>规范指标集</Checkbox></div>
                            <div className={this.state.styleLayout === "NN" ? "BoxButtons" : "BoxButtons BoxHidden"}>
                                <Button size="small" type={"primary"} icon={<CloudUploadOutlined/>} onClick={this.onButtonIndicatorsCopy2CountersClicked}>移入指标组</Button>
                                <Button size="small" type={"primary"} icon={<CloudUploadOutlined/>} onClick={this.onButtonIndicatorsImportClicked}>导入</Button>
                                <Button size="small" type={"primary"} icon={<CloudDownloadOutlined/>} onClick={this.onButtonIndicatorsExportClicked}>导出</Button>
                            </div>
                            {/*<div>*/}
                            {/*    <Button size="small" type={"ghost"} icon={<EllipsisOutlined/>}/>*/}
                            {/*</div>*/}
                        </div>
                        <div className={this.state.styleLayout === "NN" ? "BoxTree" : "BoxTree BoxHidden"}>
                            <div className={"BoxSearch"}>
                                <Input.Search placeholder="Search" enterButton onSearch={this.onInputSearchIndicatorsSearched}/>
                            </div>
                            <div className="BoxTreeInstance">
                                <Tree ref={this.gRef.treeIndicators} treeData={this.state.treeDataIndicators} onCheck={this.onTreeIndicatorsChecked} switcherIcon={<CaretDownOutlined/>} checkable blockNode={true} showLine={{showLeafIcon: false}} showIcon={true}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"BoxKpisAndProperties"}>
                    <div className="BoxKpisAndCounters">
                        <div className={"BoxKpis"}>
                            <div className={"BoxTitleBar"}>
                                <div className={"BoxTitle"}><Checkbox>指标</Checkbox></div>
                                <div className={"BoxButtons"}>
                                    {/*<Button size={"small"} type={"primary"} icon={<ShoppingCartOutlined/>} onClick={this.onButtonKpisShoppingClicked}>加入导出</Button>*/}
                                    <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonKpisAddClicked}>新增</Button>
                                    <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                        this.showModal("删除指标")
                                    }}>删除</Button>
                                </div>
                            </div>
                            <div className={"BoxTree"}>
                                <div className={"BoxTreeInstance"}>
                                    <Tree ref={this.gRef.treeKpis}
                                          treeData={this.state.treeDataKpis}
                                          onSelect={this.onTreeKpisSelected}
                                          onCheck={this.onTreeKpisChecked}
                                          onDrop={this.onTreeKpisDrop}
                                          checkedKeys={this.state.checkedKeysKpis}
                                          checkable={true} blockNode={true} showIcon={true} showLine={{showLeafIcon: false}} switcherIcon={<CaretDownOutlined/>}/>
                                </div>
                            </div>
                        </div>
                        <div className={"BoxCounters"}>
                            <div className={"BoxTitleBar"}>
                                <div className={"BoxTitle"}><Checkbox>原始统计项</Checkbox></div>
                                <div className={"BoxButtons"}>
                                    <Button size={"small"} type={"primary"} icon={<EditOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>复制到剪贴板</Button>
                                    <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                        this.showModal("删除统计数据")
                                    }}>删除</Button>
                                </div>
                            </div>
                            <div className={"BoxTree"}>
                                <div className={"BoxTreeInstance"}>
                                    <Tree ref={this.gRef.treeCounters} treeData={this.state.treeDataKpiCounters} onSelect={this.onTreeKpiCountersSelected} checkable={true} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="BoxProperties">
                        <Form className="FormOne" ref={this.gRef.formSchemaProperties} name="formSchemaProperties" initialValues={this.state.formSchemaInitialValues} onFinish={this.onFormSchemaPropertiesFinish} onFinishFailed={this.onFormSchemaPropertiesFinishFailed}>
                            <div className={"BoxTitleBar"}>
                                <div className={"BoxTitle"}>指标组属性 -</div>
                                <Form.Item name="schemaId" className="BoxFormItemInput">
                                    <Input className="InputReadonly" bordered={false} readOnly="readonly"/>
                                </Form.Item>
                                <div className="BoxButtons">
                                    <Button size={"small"} type={"primary"} icon={<SaveOutlined/>} htmlType="submit">保存</Button>
                                </div>
                            </div>
                            <div className="BoxPropertiesSchema">
                                <div>
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="schemaZhName" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标组中文名称" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                                <div className={"BoxSchemaIds"}>
                                    <Form.Item name="schemaIdA1" className="BoxFormItemInput">
                                        <Select options={this.state.optionsSchemaIdA1} onChange={(e) => {
                                            this.onSelectSchemaIdChanged(e, "a1");
                                        }}/>
                                    </Form.Item>
                                    <Form.Item name="schemaIdA2" className="BoxFormItemInput">
                                        <Select options={this.state.optionsSchemaIdA2} onChange={(e) => {
                                            this.onSelectSchemaIdChanged(e, "a2");
                                        }}/>
                                    </Form.Item>
                                    <Form.Item name="schemaIdB1" className="BoxFormItemInput">
                                        <Select options={this.state.optionsSchemaIdB1} onChange={(e) => {
                                            this.onSelectSchemaIdChanged(e, "b1");
                                        }}/>
                                    </Form.Item>
                                </div>
                                <div className={"BoxSchemaIds"}>

                                    <Form.Item name="schemaIdB2" className="BoxFormItemInput">
                                        <Select options={this.state.optionsSchemaIdB2} onChange={(e) => {
                                            this.onSelectSchemaIdChanged(e, "b2");
                                        }}/>
                                    </Form.Item>
                                    <Form.Item name="schemaObjectSubClass" className="BoxFormItemInput">
                                        <Select options={this.state.optionsObjectSubClass}/>
                                    </Form.Item>
                                    <Form.Item name="schemaVendor" className="BoxFormItemInput">
                                        <Select options={this.state.optionsVendor}/>
                                    </Form.Item>
                                    {/*<Select defaultValue={-99999} value={this.state.selectedSchema.schemaIdA1} options={this.state.optionsSchemaIdA1} onChange={(e) => {*/}
                                    {/*    this.onSelectSchemaIdChanged(e, "a1")*/}
                                    {/*}}/>*/}
                                    {/*<Select defaultValue={-99999} value={this.state.selectedSchema.schemaIdA2} options={this.state.optionsSchemaIdA2} onChange={(e) => {*/}
                                    {/*    this.onSelectSchemaIdChanged(e, "a2")*/}
                                    {/*}}/>*/}
                                    {/*<Select defaultValue={-99999} value={this.state.selectedSchema.schemaIdB1} options={this.state.optionsSchemaIdB1} onChange={(e) => {*/}
                                    {/*    this.onSelectSchemaIdChanged(e, "b1")*/}
                                    {/*}}/>*/}
                                    {/*<Select defaultValue={-99999} value={this.state.selectedSchema.schemaIdB2} options={this.state.optionsSchemaIdB2} onChange={(e) => {*/}
                                    {/*    this.onSelectSchemaIdChanged(e, "b2")*/}
                                    {/*}}/>*/}
                                </div>
                                <div className="BoxSchemaName">
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="schemaZhName2" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标组中文名称" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                    <Form.Item name="schemaIsMo" className="BoxFormItemInput">
                                        <Select>
                                            <Option value={0}>非MO指标组</Option>
                                            <Option value={1}>是MO指标组</Option>
                                        </Select>
                                        {/*<Checkbox className="antdCheckbox">MO指标组</Checkbox>*/}
                                    </Form.Item>
                                </div>
                                {/*<div className={"BoxVendorObjectClass"}>*/}
                                {/*    /!*<Form.Item name="schemaIntervalFlag" className="BoxFormItemInput">*!/*/}
                                {/*    /!*    <Select options={this.state.optionsIntervalFlag}/>*!/*/}
                                {/*    /!*</Form.Item>*!/*/}
                                {/*</div>*/}
                                <div className="BoxTabNames">
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="baseTabName" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标组统计数据存储表名称" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="counterTabName" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标组统计数据存储表名称" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                            </div>
                        </Form>
                        <Form className="FormTwo" ref={this.gRef.formKpiProperties} name="formKpiProperties" initialValues={this.state.formKpiInitialValues} onFinish={this.onFormKpiPropertiesFinish} onFinishFailed={this.onFormKpiPropertiesFinishFailed}>
                            <div className="BoxTitleBar">
                                <div className={"BoxTitle"}>指标属性 -</div>
                                <Form.Item name="kpiId" className="BoxFormItemInput">
                                    <Input className="InputReadonly" bordered={false} readOnly="readonly"/>
                                </Form.Item>
                                <div className={"BoxButtons"}>
                                    <Button size={"small"} type={"primary"} icon={<SaveOutlined/>} htmlType="submit">保存</Button>
                                </div>
                            </div>
                            <div className="BoxPropertiesKpi">
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
                                            <Option value={0}>不发告警</Option>
                                            <Option value={1}>发送告警</Option>
                                        </Select>
                                    </Form.Item>
                                    {/*<Form.Item name="kpiFormat" className="BoxFormItemInput">*/}
                                    {/*    <Select>*/}
                                    {/*        <Option value={0}>不指定格式</Option>*/}
                                    {/*        <Option value={1}>格式：R2</Option>*/}
                                    {/*    </Select>*/}
                                    {/*</Form.Item>*/}
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="kpiFormat" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标数据格式" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
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
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="kpiUnit" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标数据单位" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                                {/*<div className={"BoxUsedInfo"}>*/}
                                {/*    <div className={"BoxProductModuleName"}>*/}
                                {/*        <Form.Item name="kpiUsedProduct" className="BoxFormItemInput">*/}
                                {/*            <Select options={this.state.optionsProduct} onChange={this.onSelectKpiUsedProductChanged}/>*/}
                                {/*        </Form.Item>*/}
                                {/*        <Form.Item name="kpiUsedModule" className="BoxFormItemInput">*/}
                                {/*            <Select options={this.state.optionsModule}/>*/}
                                {/*        </Form.Item>*/}
                                {/*        <Form.Item className="BoxFormItemInput">*/}
                                {/*            <Form.Item name="kpiUsedTitle" noStyle><Input/></Form.Item>*/}
                                {/*            <Tooltip placement="topLeft" title="输入该指标在界面上的显示标题" arrowPointAtCenter>*/}
                                {/*                <div className="input-icon"><QuestionCircleOutlined/></div>*/}
                                {/*            </Tooltip>*/}
                                {/*        </Form.Item>*/}
                                {/*        <Button icon={<PlusOutlined/>}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>
                            <div className="BoxKpiExp">
                                <Form.Item className="BoxFormItemInput">
                                    <Form.Item name="kpiExp" noStyle>
                                        <TextArea id="textKpiExp" ref={this.gRef.textAreaKpiExp} autoSize={{minRows: 3, maxRows: 5}} onChange={this.onInputKpiExpChanged}/>
                                    </Form.Item>
                                    <Tooltip placement="topLeft" title="输入指标计算表达式" arrowPointAtCenter>
                                        <div className="input-icon"><QuestionCircleOutlined/></div>
                                    </Tooltip>
                                </Form.Item>
                                <div className="BoxKpiExpDisplay">
                                    {this.state.kpiExpDisplay}
                                </div>
                            </div>
                        </Form>
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

