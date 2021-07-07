import React, {Fragment} from 'react'
import './ServicePerformance.scss'
import GCtx from "../GCtx";
import Mock from 'mockjs'
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import './github.css';
import XLSX from 'xlsx';
import TadKpiSchema from "../entity/TadKpiSchema";
import TadKpi from "../entity/TadKpi";
import TadIndicator from "../entity/TadIndicator";
import TadIndicatorCounter from "../entity/TadIndicatorCounter";
import TadKpiCounter from "../entity/TadKpiCounter";
import TimePairs from "../params/TimePairs";
import {Button, Input, Select, Tree, Modal, Form, Tooltip,} from 'antd'
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CloudDownloadOutlined, CloudUploadOutlined, CopyOutlined, MinusSquareOutlined, PlusOutlined, PlusSquareOutlined, SaveOutlined, QuestionCircleOutlined, EllipsisOutlined, EditOutlined, ShoppingCartOutlined,} from '@ant-design/icons'

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
            optionsVendor: [{label: "厂家", value: -99999}],
            optionsObjectClass: [{label: "网元类型", value: -99999}],
            optionsObjectSubClass: [{label: "网元细分类型", value: -99999}],
            optionsIntervalFlag: [{label: "采集粒度", value: -99999}],
            optionsProduct: [{label: "使用该指标的产品", value: -99999}],
            optionsModule: [{label: "使用该指标的模块", value: -99999}],
            formSchemaInitialValues: {
                schemaId: "",
                schemaIdA1: -99999,
                schemaIdA2: -99999,
                schemaIdB1: -99999,
                schemaIdB2: -99999,
                schemaZhName: "",
                schemaVendor: -99999,
                schemaObjectClass: -99999,
                schemaObjectSubClass: -99999,
                schemaIntervalFlag: -99999,
                counterTabName: "",
            },
            formKpiInitialValues: {
                kpiId: "",
                kpiZhName: "",
                kpiEnName: "",
                kpiAlarm: 1,
                kpiFormat: 1,
                kpiMinValue: "",
                kpiMaxValue: "",
                kpiUsedProduct: -99999,
                kpiUsedModule: -99999,
                kpiUsedTitle: "",
                kpiExp: "",
            },

            kpiExpDisplay: "",
        }

        //todo >>>>> bind(this)
        this.test = this.test.bind(this);
        this.doMock = this.doMock.bind(this);

        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);

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

        this.doAddSchema = this.doAddSchema.bind(this);
        this.doDeleteSchema = this.doDeleteSchema.bind(this);
        this.doUpdateSchema = this.doUpdateSchema.bind(this);
        this.doAddKpi = this.doAddKpi.bind(this);
        this.doDeleteKpi = this.doDeleteKpi.bind(this);
        this.doUpdateKpi = this.doUpdateKpi.bind(this);
        this.doAddCounter = this.doAddCounter.bind(this);
        this.doDeleteCounter = this.doDeleteCounter.bind(this);
        this.doFixKpiCounters = this.doFixKpiCounters.bind(this);

        this.onTreeKpiSchemasSelected = this.onTreeKpiSchemasSelected.bind(this);
        this.onTreeIndicatorsChecked = this.onTreeIndicatorsChecked.bind(this);
        this.onTreeKpisSelected = this.onTreeKpisSelected.bind(this);
        this.onTreeKpisDrop = this.onTreeKpisDrop.bind(this);
        this.onTreeKpiCountersSelected = this.onTreeKpiCountersSelected.bind(this);

        this.onButtonChangeStyleLayoutClicked = this.onButtonChangeStyleLayoutClicked.bind(this);
        this.onButtonSchemasAddClicked = this.onButtonSchemasAddClicked.bind(this);
        this.onButtonSchemasCopyPasteClicked = this.onButtonSchemasCopyPasteClicked.bind(this);
        this.onButtonSchemasExportClicked = this.onButtonSchemasExportClicked.bind(this);
        this.onButtonSchemasResetClicked = this.onButtonSchemasResetClicked.bind(this);
        this.onButtonSchemasCommitClicked = this.onButtonSchemasCommitClicked.bind(this);
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
        this.onSelectSchemaObjectClassChanged = this.onSelectSchemaObjectClassChanged.bind(this);
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
                    title: myIndicator.indicator_zhname,
                    children: []
                }

                if (mapCountersTemp.has(indicator.id)) {
                    mapCountersTemp.get(indicator.id).counters.forEach((counter) => {
                        uiIndicator.children.push({
                            key: indicator.id + "_" + counter.id,
                            title: counter.counter_zhname,
                            children: []
                        });
                    });
                }

                myResult.uiTree.push(uiIndicator);
            }
        }

        return myResult;
    }

    //todo <<<<< now >>>>> dataSchemas to DsMap and UiTree
    dataSchemas2DsMapUiTree(ds, sv) {
        let myResult = {mapDs: new Map(), uiDs: []}; //, mapRelation: new Map()}

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
                    title: <div className={"BoxSchemaTitle"}>{schemaClone.schema_id + " - " + schemaClone.schema_zhname}</div>,
                    children: []
                }
                myResult.uiDs.push(uiSchema);
            }

            // if (!myResult.mapRelation.has(schemaId)) {
            //     myResult.mapRelation.set(schemaId, id);
            // }
            //}
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
                        item.title = <div className="BoxSchemaTitle">{schema.schema_id + " - " + schema.schema_zhname}</div>;
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
                //todo delete kpis
                //todo delete counters
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
                    title: counters.counter_zhname + " - " + counters.counter_enname,
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
                this.gCurrent.counterNames.push(counter.counter_enname);
                this.gMap.counters.set(counter.id, counter);
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
            let mapProducts = new Map();
            let mapKpis = new Map();
            // let mapIndicators = new Map();

            this.gData.kpiDict = kpiDict.data.data;
            this.gData.objectDefs = objectDefs.data.data;
            this.gData.vendors = vendors.data.data;
            this.gData.products = products.data.data;
            this.gData.modules = modules.data.data;
            this.gData.kpis = kpis.data.data;
            this.gData.schemas = schemas.data.data;
            this.gData.counters = counters.data.data;
            this.gData.indicators = indicators.data.data;
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
            for (let i = 0; i < this.gData.vendors.length; i++) {
                if (this.gData.vendors[i].type >= 0 && this.gData.vendors[i].type <= 99) {
                    optionsVendor.push({label: this.gData.vendors[i].zh_name, value: this.gData.vendors[i].type});
                }
            }

            // 网元类型，网元细分类型控件
            let optionsObjectClass = [{label: "网元类型", value: -99999}];
            for (let i = 0; i < this.gData.objectDefs.length; i++) {
                let item = this.gData.objectDefs[i];
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
            for (let i = 0; i < this.gData.products.length; i++) {
                let item = this.gData.products[i];
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
            for (let i = 0; i < this.gData.modules.length; i++) {
                let item = this.gData.modules[i];
                if (mapProducts.has(item.product_id)) {
                    mapProducts.get(item.product_id).modules.push({
                        module_name: item.module_name,
                        module_id: item.module_id
                    });
                }
            }
            this.gMap.products = mapProducts;

            // 规范指标集
            let myIndicators = this.dataIndicators2DsMapUiTree(this.gData.indicators, this.gData.indicatorCounters);
            this.gMap.indicators = myIndicators.mapIndicators;
            this.gMap.indicatorCounters = myIndicators.mapCounters;
            this.gUi.indicators = myIndicators.uiTree;

            // schemas to gMap.schemas
            let mySchemas = this.dataSchemas2DsMapUiTree(this.gData.schemas);

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

            let mapCounters = new Map();
            this.gData.counters.forEach((item) => {
                mapCounters.set(item.id, item);

                if (mySchemas.mapDs.has(item.sid)) {
                    mySchemas.mapDs.get(item.sid).counters.push(item.id);
                }
            });

            this.gMap.schemas = mySchemas.mapDs;
            this.gMap.kpis = mapKpis;
            this.gMap.counters = mapCounters;
            this.gUi.schemas = mySchemas.uiDs;

            // 尝试垃圾回收
            this.gData.kpiDict = null;
            this.gData.objectDefs = null;
            // this.gData.vendors = vendors;
            this.gData.products = null;
            this.gData.modules = null;
            // this.gData.kpis = null;
            // this.gData.schemas = null;
            this.gData.counters = null;
            // this.gData.indicators = null;
            // this.gData.indicatorCounters = null;

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
                treeDataIndicators: myIndicators.uiTree,
            });
        })).then(() => {
            this.doInit();
        });
    }

    //todo <<<<< noew >>>>> do Get My Schemas
    doGetMySchemas(user, dtPairs) {
        console.log(user, dtPairs);

        let myResult = this.gUi.schemas;

        return myResult;
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

    restGetKpiCounters() {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/service/get_kpi_counters",
            {},
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

    //todo >>>>> click schema
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
                        title: <div className={"BoxKpiTitle"}>{kpi.kpi_id + " - " + kpi.kpi_zhname}</div>,
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
                        title: <div className={"BoxCounterTitle"}>{counter.counter_zhname + " - " + counter.counter_enname}</div>,
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

    onButtonSchemasExportClicked(e) {
        this.context.showMessage("导出指标组，开发中...");
    }

    onButtonSchemasResetClicked(e) {
        this.context.showMessage("重置指标组属性，开发中... 2021-06-18");
    }

    onButtonSchemasCommitClicked(e) {
        this.context.showMessage("提交近期指标组变更，开发中...");
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

    //todo <<<<< now >>>>> 搜索 SCHEMA & KPI
    onInputSearchSchemasSearched(value, event) {
        let sv = value;

        if (sv !== null && sv !== undefined && sv.trim() !== "") {
            let mySchemas;

            if (sv.trim().startsWith("变更：") || sv.trim().startsWith("变更:")) {
                let svs = sv.trim().toLowerCase().replace(/\s+/g, " " ).replace(/[：|:]+\s*/g, "： " ).split(" ");
                let user = "KKK";
                let timeBegin = "";
                let timeEnd = "";
                if (svs.length === 3) {
                    timeBegin = this.str2Time4ParamTimePairs(svs[1]);
                    timeEnd = this.str2Time4ParamTimePairs(timeBegin, svs[2]);
                } else if (svs.length === 2) {
                    timeBegin = moment().format("yyyy-MM-DD");
                    timeEnd = this.str2Time4ParamTimePairs(timeBegin, svs[1]);
                } else {
                    this.context.showMessage("error");

                    return
                }

                if ((timeBegin !== "无效") && (timeEnd !== "无效")) {
                    let dtPairs = new TimePairs();
                    if (timeBegin < timeEnd) {
                        dtPairs.tb = timeBegin;
                        dtPairs.te = timeEnd;
                    } else {
                        dtPairs.tb = timeEnd;
                        dtPairs.te = timeBegin;
                    }

                    mySchemas = this.doGetMySchemas(user, dtPairs);

                    this.doGetMySchemas("KKK", dtPairs);
                } else {
                    this.context.showMessage("error");

                    return
                }

            } else {
                sv = sv.trim().toLowerCase();
                mySchemas = this.dataSchemas2DsMapUiTree(this.gData.schemas, sv);
            }

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

        schema.id = this.gCurrent.schema.id;
        schema.schema_id = values.schemaId;
        schema.schema_zhname = values.schemaZhName;
        schema.vendor_id = values.schemaVendor === -99999 ? null : values.schemaVendor;
        schema.object_class = values.schemaObjectClass === -99999 ? null : values.schemaObjectClass;
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
            schemaObjectClass: schema.object_class,
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
        return (
            <div className={this.state.styleLayout === "NN" ? "ServicePerformance" : "ServicePerformance ServicePerformanceSmall"}>
                <div className={"BoxSchemasAndIndicators"}>
                    <div className={"BoxSchemas"}>
                        <div className={"BoxTitleBar"}>
                            <div className={this.state.styleLayout === "NN" ? "BoxTitle" : "BoxTitle BoxHidden"}>指标组</div>
                            <div className={this.state.styleLayout === "NN" ? "BoxButtons" : "BoxButtons BoxHidden"}>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonSchemasAddClicked}>新增</Button>
                                <Button size={"small"} type={"primary"} icon={<CopyOutlined/>} onClick={this.onButtonSchemasCopyPasteClicked}>复制</Button>
                                <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                    this.showModal("删除指标组")
                                }}>删除</Button>
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
                            <div ref={this.gRef.boxTreeSchemas} className={"BoxTreeInstance"}>
                                <Tree ref={this.gRef.treeSchemas} treeData={this.state.treeDataKpiSchemas} onSelect={this.onTreeKpiSchemasSelected} height={this.state.treeSchemasHeight} defaultExpandAll={true} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                            </div>
                        </div>
                    </div>
                    <div className="BoxIndicators">
                        <div className="BoxTitleBar">
                            <div className={this.state.styleLayout === "NN" ? "BoxTitle" : "BoxTitle BoxHidden"}>规范指标集</div>
                            <div className={this.state.styleLayout === "NN" ? "BoxButtons" : "BoxButtons BoxHidden"}>
                                <Button size="small" type={"primary"} icon={<CloudUploadOutlined/>} onClick={this.onButtonIndicatorsCopy2CountersClicked}>移入指标组</Button>
                                <Button size="small" type={"primary"} icon={<CloudUploadOutlined/>} onClick={this.onButtonIndicatorsImportClicked}>导入</Button>
                                <Button size="small" type={"primary"} icon={<CloudDownloadOutlined/>} onClick={this.onButtonIndicatorsExportClicked}>导出</Button>
                            </div>
                            <div>
                                <Button size="small" type={"ghost"} icon={<EllipsisOutlined/>}/>
                            </div>
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
                                <div className={"BoxTitle"}>指标</div>
                                <div className={"BoxButtons"}>
                                    <Button size={"small"} type={"primary"} icon={<ShoppingCartOutlined/>} onClick={this.onButtonKpisShoppingClicked}>购物车</Button>
                                    <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonKpisAddClicked}>新增</Button>
                                    <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                        this.showModal("删除指标")
                                    }}>删除</Button>
                                </div>
                            </div>
                            <div className={"BoxTree"}>
                                <div className={"BoxTreeInstance"}>
                                    <Tree ref={this.gRef.treeKpis} treeData={this.state.treeDataKpis} onSelect={this.onTreeKpisSelected} onDrop={this.onTreeKpisDrop} checkable blockNode draggable showIcon showLine={{showLeafIcon: false}} switcherIcon={<CaretDownOutlined/>}/>
                                </div>
                            </div>
                        </div>
                        <div className={"BoxCounters"}>
                            <div className={"BoxTitleBar"}>
                                <div className={"BoxTitle"}>原始指标</div>
                                <div className={"BoxButtons"}>
                                    <Button size={"small"} type={"primary"} icon={<EditOutlined/>} onClick={this.onButtonInsertIntoKpiExpClicked}>复制到剪贴板</Button>
                                    <Button size={"small"} type={"primary"} icon={<MinusSquareOutlined/>} onClick={() => {
                                        this.showModal("删除统计数据")
                                    }}>删除</Button>
                                </div>
                            </div>
                            <div className={"BoxTree"}>
                                <div className={"BoxTreeInstance"}>
                                    <Tree ref={this.gRef.treeCounters} treeData={this.state.treeDataKpiCounters} onSelect={this.onTreeKpiCountersSelected} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
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
                                    <Form.Item name="schemaIdB2" className="BoxFormItemInput">
                                        <Select options={this.state.optionsSchemaIdB2} onChange={(e) => {
                                            this.onSelectSchemaIdChanged(e, "b2");
                                        }}/>
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
                                <div>
                                    <Form.Item className="BoxFormItemInput">
                                        <Form.Item name="schemaZhName" noStyle><Input/></Form.Item>
                                        <Tooltip placement="topLeft" title="输入指标组中文名称" arrowPointAtCenter>
                                            <div className="input-icon"><QuestionCircleOutlined/></div>
                                        </Tooltip>
                                    </Form.Item>
                                </div>
                                <div className={"BoxVendorObjectClass"}>
                                    <Form.Item name="schemaVendor" className="BoxFormItemInput">
                                        <Select options={this.state.optionsVendor}/>
                                    </Form.Item>
                                    <Form.Item name="schemaObjectClass" className="BoxFormItemInput">
                                        <Select options={this.state.optionsObjectClass}
                                                onChange={this.onSelectSchemaObjectClassChanged}/>
                                    </Form.Item>
                                    <Form.Item name="schemaObjectSubClass" className="BoxFormItemInput">
                                        <Select options={this.state.optionsObjectSubClass}/>
                                    </Form.Item>
                                    <Form.Item name="schemaIntervalFlag" className="BoxFormItemInput">
                                        <Select options={this.state.optionsIntervalFlag}/>
                                    </Form.Item>
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
                                    <Form.Item name="kpiFormat" className="BoxFormItemInput">
                                        <Select>
                                            <Option value={0}>不指定格式</Option>
                                            <Option value={1}>格式：R2</Option>
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
                                            <Select options={this.state.optionsProduct} onChange={this.onSelectKpiUsedProductChanged}/>
                                        </Form.Item>
                                        <Form.Item name="kpiUsedModule" className="BoxFormItemInput">
                                            <Select options={this.state.optionsModule}/>
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

