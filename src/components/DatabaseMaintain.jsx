import React, {Fragment} from 'react'
import './DatabaseMaintain.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {Button, Select, Tree, Checkbox, Table, Input, Tabs} from 'antd'
import {CaretDownOutlined} from '@ant-design/icons'
import TadTableColumn from '../entity/TadTableColumn'
import Mock from 'mockjs'
import TadTableIndex from "../entity/TadTableIndex";
import TadTablePartition from "../entity/TadTablePartition";
import TadTableRelation from "../entity/TadTableRelation";

const {TabPane} = Tabs;

export default class DatabaseMaintain extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};

    gTableUnknownSelected = [];
    gTableKnownSelected = [];
    gTablesUnknown = [];


    constructor(props) {
        super(props);

        this.state = {
            productsTreeData: [],
            tablesKnownTreeData: [],
            tablesUnknownTreeData: [],
            optionsDbUsers: [{value: -1, label: "请选择"}],
            connectionsSelectOptions: [{value: -1, label: "请选择"}],
            dbUserSelected: -1,
            showKnownTable: false,
            showUnknownTable: false,
            uiRadioUnknownSelected: 0,
            uiTableKnownDisplay: "none",
            uiTableUnknownDisplay: "none",
            message: '',
            tablesAll: [],
            tablesUnknown: [],
            tablesKnown: [],
            letters: ["a", "b"],
            tableTableColumnsColumns: [],

            dsColumns: [],
            dsIndexes: [],
            dsPartitions: [],
            dsRelations: [],
            dsRecords: [],
            tableDDL: "",

            pageSizeColumns: 0,
            pageSizeIndexes: 0,
            pageSizePartitions: 0,
            pageSizeRelations: 0,
            pageSizeRecords: 0,

            isShownButtonAddColumn: "block",
            isShownButtonDeleteColumn: "block",
            isShownButtonAlterColumnConfirm: "none",
            isShownButtonAlterColumnCancel: "none",
            isShownButtonAddIndex: "block",
            isShownButtonDeleteIndex: "block",
            isShownButtonAlterIndexConfirm: "none",
            isShownButtonAlterIndexCancel: "none",
            isShownButtonAddPartition: "block",
            isShownButtonDeletePartition: "block",
            isShownButtonAlterPartitionConfirm: "none",
            isShownButtonAlterPartitionCancel: "none",
            isShownButtonAddRelation: "block",
            isShownButtonDeleteRelation: "block",
            isShownButtonAlterRelationConfirm: "none",
            isShownButtonAlterRelationCancel: "none",
            isShownButtonAddRecord: "block",
            isShownButtonDeleteRecord: "block",
            isShownButtonAlterRecordConfirm: "none",
            isShownButtonAlterRecordCancel: "none",

            isEditingKeyColumn: -1,
            isEditingKeyIndex: -1,
            isEditingKeyPartition: -1,
            isEditingKeyRelation: -1,
            isEditingKeyData: -1,

            editingColumn: {
                key: -1,
                column_id: -1,
                table_id: -1,
                name: "",
                data_type: "",
                data_length: -1,
                data_default: "",
                nullable_flag: "",
                primary_flag: "",
                split_flag: "",
                repeat_flag: "",
                desc: ""
            },
            editingIndex: {
                key: -1,
                id: -1,
                table_id: -1,
                name: "",
                type: "",
                columns: "",
                attributes: "",
                desc: ""
            },
            editingPartition: {
                key: -1,
                id: -1,
                table_id: -1,
                type: "",
                column: -1,
                name: "",
                operator: "",
                expression: "",
                tablespace: "",
                desc: ""
            },
            editingRelation: {
                key: -1,
                id: -1,
                type: "",
                s_db_user_id: -1,
                s_table_id: -1,
                s_column_id: -1,
                a_db_user_id: -1,
                a_table_id: -1,
                a_column_id: -1,
                data_flow: "",
                desc: ""
            },
        }


        this.test = this.test.bind(this);

        this.doInit = this.doInit.bind(this);
        this.doNewGetAll = this.doNewGetAll.bind(this);
        this.doGetProductRelations = this.doGetProductRelations.bind(this);
        this.doNewGetProductLines = this.doNewGetProductLines.bind(this);
        this.doNewGetProductLineDbUsers = this.doNewGetProductLineDbUsers.bind(this);
        this.doNewGetProducts = this.doNewGetProducts.bind(this);
        this.doNewGetProductModules = this.doNewGetProductModules.bind(this);
        this.doNewGetProductVersions = this.doNewGetProductVersions.bind(this);
        this.doNewGetProductManagers = this.doNewGetProductManagers.bind(this);
        this.doNewGetTables = this.doNewGetTables.bind(this);
        this.doNewGetTableColumns = this.doNewGetTableColumns.bind(this);
        this.doNewGetTypes = this.doNewGetTypes.bind(this);
        this.doNewGetDbConnections = this.doNewGetDbConnections.bind(this);
        this.doGetTablesByLetter = this.doGetTablesByLetter.bind(this);
        this.doMock = this.doMock.bind(this);
        this.onTreeLettersSelected = this.onTreeLettersSelected.bind(this);

        this.onSelectDbUsersChanged = this.onSelectDbUsersChanged.bind(this);
        this.onSelectConnectionsChanged = this.onSelectConnectionsChanged.bind(this);

        this.onRadioUnknownChanged = this.onRadioUnknownChanged.bind(this);

        this.onCheckboxKnownTableDisplayChanged = this.onCheckboxKnownTableDisplayChanged.bind(this);
        this.onCheckboxUnknownTableDisplayChanged = this.onCheckboxUnknownTableDisplayChanged.bind(this);

        this.onSelect = this.onSelect.bind(this);
        this.onTableUnknownChecked = this.onTableUnknownChecked.bind(this);
        this.onTableKnownChecked = this.onTableKnownChecked.bind(this);
        this.doTablesCompare = this.doTablesCompare.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);
        this.onTreeTablesSelected = this.onTreeTablesSelected.bind(this);

        this.onButtonAddColumnClicked = this.onButtonAddColumnClicked.bind(this);
        this.onButtonAlterColumnClicked = this.onButtonAlterColumnClicked.bind(this);
        this.onButtonDeleteColumnClicked = this.onButtonDeleteColumnClicked.bind(this);
        this.onButtonAlterColumnConfirmClicked = this.onButtonAlterColumnConfirmClicked.bind(this);
        this.onButtonAlterColumnCancelClicked = this.onButtonAlterColumnCancelClicked.bind(this);
        this.onButtonAddIndexClicked = this.onButtonAddIndexClicked.bind(this);
        this.onButtonAlterIndexClicked = this.onButtonAlterIndexClicked.bind(this);
        this.onButtonDeleteIndexClicked = this.onButtonDeleteIndexClicked.bind(this);
        this.onButtonAlterIndexConfirmClicked = this.onButtonAlterIndexConfirmClicked.bind(this);
        this.onButtonAlterIndexCancelClicked = this.onButtonAlterIndexCancelClicked.bind(this);
        this.onButtonAddPartitionClicked = this.onButtonAddPartitionClicked.bind(this);
        this.onButtonAlterPartitionClicked = this.onButtonAlterPartitionClicked.bind(this);
        this.onButtonDeletePartitionClicked = this.onButtonDeletePartitionClicked.bind(this);
        this.onButtonAlterPartitionConfirmClicked = this.onButtonAlterPartitionConfirmClicked.bind(this);
        this.onButtonAlterPartitionCancelClicked = this.onButtonAlterPartitionCancelClicked.bind(this);
        this.onButtonAddRelationClicked = this.onButtonAddRelationClicked.bind(this);
        this.onButtonAlterRelationClicked = this.onButtonAlterRelationClicked.bind(this);
        this.onButtonDeleteRelationClicked = this.onButtonDeleteRelationClicked.bind(this);
        this.onButtonAlterRelationConfirmClicked = this.onButtonAlterRelationConfirmClicked.bind(this);
        this.onButtonAlterRelationCancelClicked = this.onButtonAlterRelationCancelClicked.bind(this);
        this.onButtonAddRecordClicked = this.onButtonAddRecordClicked.bind(this);
        this.onButtonAlterRecordClicked = this.onButtonAlterRecordClicked.bind(this);
        this.onButtonDeleteRecordClicked = this.onButtonDeleteRecordClicked.bind(this);
        this.onButtonAlterRecordConfirmClicked = this.onButtonAlterRecordConfirmClicked.bind(this);
        this.onButtonAlterRecordCancelClicked = this.onButtonAlterRecordCancelClicked.bind(this);

        this.onInputIndexNameChanged = this.onInputIndexNameChanged.bind(this);
        this.onInputPartitionNameChanged = this.onInputPartitionNameChanged.bind(this);
    }

    test(s) {
        console.log(s);
    }

    componentDidMount() {
        // this.doMock();
        this.doNewGetAll();
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
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_lines", {
            code: "200-200",
            success: true,
            "data": [{
                "product_line_id": 1,
                "product_line_name": "OSS",
                "product_line_desc": "",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_products", {
            code: "200-200",
            success: true,
            "data": [{
                "product_id": 1,
                "product_name": "OLC",
                "product_desc": "",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_users", {
            code: "200-200",
            success: true,
            "data": [{
                "uer_id": 1,
                "product_line_id": 1,
                "user_name": "nrmdb",
                "user_desc": "",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_modules", {
            code: "200-200",
            success: true,
            "data": [{
                "module_id": 1,
                "product_id": 1,
                "module_name": "USER",
                "module_leader": "K",
                "module_desc": "",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_tables", {
            code: "200-200",
            success: true,
            "data": [{
                "table_id": 1,
                "db_user_id": 1,
                "module_id": 1,
                "table_name": "tad_dict",
                "table_desc": ""
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_columns", {
            code: "200-200",
            success: true,
            "data": [{
                "column_id": 1,
                "table_id": 1,
                "column_name": "id",
                "column_type_id": 2,
                "column_desc": "",
            },
                {
                    "column_id": 2,
                    "table_id": 1,
                    "column_name": "type",
                    "column_type_id": 3,
                    "column_desc": "",
                },
                {
                    "column_id": 3,
                    "table_id": 1,
                    "column_name": "name",
                    "column_type_id": 3,
                    "column_desc": "",
                }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_managers", {
            code: "200-200",
            success: true,
            "data": [{
                "product_manager_id": 1,
                "product_manager_name": "TESTER",
                "tel_no": "",
                "email_addr": "",
                "work_addr": "",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_types", {
            code: "200-200",
            success: true,
            "data": [{
                "id": 1,
                "type": "table_type",
                "name": "DICT",
            },
                {
                    "id": 2,
                    "type": "data_type",
                    "name": "number",
                }, {
                    "id": 3,
                    "type": "table_type",
                    "name": "string",
                }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_versions", {
            code: "200-200",
            success: true,
            "data": [{
                "version_id": 1,
                "product_id": 1,
                "version_name": "3.0",
            }]
        });
        Mock.mock("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_connections", {
            code: "200-200",
            success: true,
            "data": [{
                "mtime": "@datetime",//随机生成日期时间
                "score|1-800": 800,//随机生成1-800的数字
                "rank|1-100": 100,//随机生成1-100的数字
                "stars|1-5": 5,//随机生成1-5的数字
                "nickname": "@cname",//随机生成中文名字
            }]
        });
    }

    doInit() {
        this.gCurrent.productLineId = undefined;
        this.gCurrent.productId = undefined;
        this.gCurrent.moduleId = undefined;
        this.gCurrent.dbUserId = -1;

        let dataTreeProducts = [];
        this.gMap.productLines.forEach((valuePl, key) => {
            let plId = valuePl.product_line_id;
            let nodeProductLine = {
                key: plId,
                title: valuePl.product_line_name,
                children: [],
                nodeType: "product_line"
            }
            dataTreeProducts.push(nodeProductLine);
            valuePl.products.forEach(item => {
                let pId = item;
                let nodeProduct = {
                    key: plId + "_" + pId,
                    title: this.gMap.products.get(pId).product_name,
                    children: [],
                    nodeType: "product"
                }
                nodeProductLine.children.push(nodeProduct);
                this.gMap.products.get(item).modules.forEach(item => {
                    let mId = item;
                    let nodeModule = {
                        key: plId + "_" + pId + "_" + mId,
                        title: this.gMap.modules.get(mId).module_name,
                        children: [],
                        nodeType: "module"
                    }
                    nodeProduct.children.push(nodeModule);
                })
            })
        });

        this.gUi.treeProductsData = dataTreeProducts;

        let connectionsSelectOptions = [{value: -1, label: "请选择"}];
        this.gData.connections.forEach((item) => {
            let option = {
                value: item.connection_id,
                label: item.connection_name
            }
            connectionsSelectOptions.push(option);
        })

        this.setState({
            productsTreeData: this.gUi.treeProductsData,
            connectionsSelectOptions: connectionsSelectOptions
        })
    }

    doNewGetAll() {
        axios.all([
            this.doGetProductRelations(),
            this.doNewGetProductLines(),
            this.doNewGetProductLineDbUsers(),
            this.doNewGetProducts(),
            this.doNewGetProductModules(),
            this.doNewGetProductVersions(),
            this.doNewGetProductManagers(),
            this.doNewGetTables(),
            this.doNewGetTableColumns(),
            this.doNewGetTypes(),
            this.doNewGetDbConnections(),
        ]).then(axios.spread((productRelations, productLines, dbUsers, products, modules, versions, managers, tables, columns, types, connections) => {
            let mapProductRelations = new Map();
            let mapProductLines = new Map();
            let mapDbUsers = new Map();
            let mapProducts = new Map();
            let mapModules = new Map();
            let mapVersions = new Map();
            let mapManagers = new Map();
            let mapTables = new Map();
            let mapTablesByName = new Map();
            let mapColumns = new Map();
            let mapTypes = new Map();
            let mapConnections = new Map();

            this.gData.productRelations = productRelations.data.data;
            this.gData.productLines = productLines.data.data;
            this.gData.dbUsers = dbUsers.data.data;
            this.gData.products = products.data.data;
            this.gData.modules = modules.data.data;
            this.gData.versions = versions.data.data;
            this.gData.managers = managers.data.data;
            this.gData.tables = tables.data.data;
            this.gData.columns = columns.data.data;
            this.gData.types = types.data.data;
            this.gData.connections = connections.data.data;

            productLines.data.data.forEach(function (item) {
                let myKey = item.product_line_id;
                if (!mapProductLines.has(myKey)) {
                    mapProductLines.set(myKey, {
                        product_line_id: myKey,
                        product_line_name: item.product_line_name,
                        product_line_desc: item.product_line_desc,
                        products: [],
                        dbUsers: []
                    });
                }
            });

            dbUsers.data.data.forEach(function (item) {
                let myKey = item.user_id;
                if (!mapDbUsers.has(myKey)) {
                    mapDbUsers.set(myKey, {
                        user_id: myKey,
                        product_line_id: item.product_line_id,
                        user_name: item.user_name,
                        user_desc: item.user_desc
                    });
                }
                mapProductLines.get(item.product_line_id).dbUsers.push(myKey);
            });

            products.data.data.forEach(function (item) {
                let myKey = item.product_id;
                if (!mapProducts.has(myKey)) {
                    mapProducts.set(myKey, {
                        product_id: myKey,
                        product_name: item.product_name,
                        product_desc: item.product_desc,
                        modules: [],
                        versions: [],
                        managers: []
                    });
                }
            });

            modules.data.data.forEach(function (item) {
                let myKey = item.module_id;
                if (!mapModules.has(myKey)) {
                    mapModules.set(myKey, {
                        module_id: myKey,
                        product_id: item.product_id,
                        module_name: item.module_name,
                        module_desc: item.module_desc,
                        module_leader: item.module_leader
                    });
                }
                mapProducts.get(item.product_id).modules.push(myKey);
            });

            versions.data.data.forEach(function (item) {
                let myKey = item.version_id;
                if (!mapVersions.has(myKey)) {
                    mapVersions.set(myKey, {
                        version_id: myKey,
                        product_id: item.product_id,
                        version_name: item.user_name,
                        version_desc: item.user_desc
                    });
                }
                mapProducts.get(item.product_id).versions.push(myKey);
            });

            managers.data.data.forEach(function (item) {
                let myKey = item.product_manager_id;
                if (!mapManagers.has(myKey)) {
                    mapManagers.set(myKey, {
                        product_manager_id: myKey,
                        product_manager_name: item.product_manager_name,
                        tel_no: item.tel_no,
                        email_addr: item.email_addr,
                        work_addr: item.work_addr
                    });
                }
            });

            tables.data.data.forEach(function (item) {
                let myKey = item.table_id;
                if (!mapTables.has(myKey)) {
                    mapTables.set(myKey, {
                        table_id: myKey,
                        table_name: item.table_name,
                        table_desc: item.table_desc,
                        table_type_id: item.table_type_id,
                        table_label_id: item.table_label_id,
                        db_user_id: item.db_user_id,
                        module_id: item.module_id,
                        columns: []
                    });
                    mapTablesByName.set(item.table_name, {
                        table_id: myKey
                    })
                }
            });

            columns.data.data.forEach(function (item) {
                let myKey = item.column_id;
                if (!mapColumns.has(myKey)) {
                    mapColumns.set(myKey, {
                        column_id: myKey,
                        table_id: item.table_id,
                        column_name: item.column_name,
                        column_desc: item.column_desc,
                        column_type_id: item.column_type_id,
                        data_type: item.data_type,
                        data_length: item.data_length,
                        data_default: item.data_default,
                        nullable_flag: item.nullable_flag,
                        primary_flag: item.primary_flag,
                        split_flag: item.split_flag,
                        repeat_flag: item.repeat_flag
                    });
                }
                if (mapTables.has(item.table_id)) {
                    mapTables.get(item.table_id).columns.push(myKey);
                }
            });

            types.data.data.forEach(function (item) {
                let myKey = item.id;
                if (!mapTypes.has(myKey)) {
                    mapTypes.set(myKey, {
                        id: myKey,
                        type: item.type,
                        name: item.name,
                        desc: item.desc
                    });
                }
            });

            productRelations.data.data.forEach(function (item) {
                let myKey = item.product_rel_id;
                if (!mapProductRelations.has(myKey)) {
                    mapProductRelations.set(myKey, {
                        product_rel_id: myKey,
                        product_line_id: item.product_line_id,
                        product_id: item.product_id,
                        product_manager_id: item.product_manager_id
                    });

                    mapProductLines.get(item.product_line_id).products.push(item.product_id);
                    mapProducts.get(item.product_id).managers.push(item.product_manager_id)
                } else {
                    if (!mapProductLines.get(item.product_line_id).products.find(element => element === item.product_id)) {
                        mapProductLines.get(item.product_line_id).products.push(item.product_id);
                    }
                    if (!mapProducts.get(item.product_id).managers.find(element => element === item.product_manager_id)) {
                        mapProducts.get(item.product_id).managers.push(item.product_manager_id);
                    }
                }
            });

            connections.data.data.forEach(function (item) {
                let myKey = item.connection_id;
                if (!mapConnections.has(myKey)) {
                    mapConnections.set(myKey, {
                        connection_id: myKey,
                        connection_name: item.connection_name,
                        db_host: item.db_host,
                        db_port: item.db_port,
                        db_sid: item.db_sid,
                        db_username: item.db_username,
                        db_password: item.db_password,
                        db_type: item.db_type
                    });
                }
            });

            this.gMap.productRelations = mapProductRelations;
            this.gMap.productLines = mapProductLines;
            this.gMap.dbUsers = mapDbUsers;
            this.gMap.products = mapProducts;
            this.gMap.modules = mapModules;
            this.gMap.versions = mapVersions;
            this.gMap.managers = mapManagers;
            this.gMap.tables = mapTables;
            this.gMap.tablesByName = mapTablesByName;
            this.gMap.columns = mapColumns;
            this.gMap.types = mapTypes;
            this.gMap.connections = mapConnections;

        })).then(() => {
            this.doInit();
        });
    }

    doGetProductRelations() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_relations", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProductLines() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_lines", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProductLineDbUsers() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_users", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProducts() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_products", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProductModules() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_modules", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProductVersions() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_versions", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetProductManagers() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_product_managers", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetTables() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_tables", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetTableColumns() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_columns", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetTypes() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_types", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doNewGetDbConnections() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_connections", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetSpecialTables() {

        if ((this.gCurrent.nodeSelectedType === "module") && (this.gCurrent.dbUserId !== -1)) {
            let tablesKnownTreeData = [];
            this.gData.tables.forEach((itemTable) => {
                let uId = itemTable.db_user_id;
                let mId = itemTable.module_id;
                if ((mId === this.gCurrent.moduleId) && (uId === this.gCurrent.dbUserId)) {
                    let tId = itemTable.table_id;
                    let nodeTable = {
                        key: tId,
                        title: itemTable.table_name,
                        children: []
                    }
                    tablesKnownTreeData.push(nodeTable);
                }
            });
            this.setState({
                tablesKnownTreeData: tablesKnownTreeData
            })
        } else {
            //
        }
    }

    // get table properties...

    doGetTablePropertyColumns(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_column", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyIndexes(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_index", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyPartitions(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_partition", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyRelations(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_relation", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyRecords(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_records", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    // ********** ********** ********** ********** **********
    // TREE...
    // ********** ********** ********** ********** **********

    onTreeProductsSelected(selectedKeys, info) {
        if (selectedKeys[0] === undefined) return;

        this.setState({
            tablesKnownTreeData: []
        })

        let nodeType = info.node.nodeType;
        this.gCurrent.nodeSelectedType = nodeType;

        switch (nodeType) {
            case "product_line":
                this.gCurrent.productLineId = selectedKeys[0];

                let optionsDbUsers = [{value: -1, label: "请选择"}];

                this.gData.dbUsers.forEach((item) => {
                    if (item.product_line_id === this.gCurrent.productLineId) {
                        let option = {
                            value: item.user_id,
                            label: item.user_name
                        }
                        optionsDbUsers.push(option);
                    }
                });

                this.setState({
                    dbUserSelected: -1,
                    optionsDbUsers: optionsDbUsers
                })

                break
            case "product":
                this.gCurrent.productId = parseInt(selectedKeys[0].split("_")[1]);
                break
            case "module":
                this.gCurrent.moduleId = parseInt(selectedKeys[0].split("_")[2]);
                this.doGetSpecialTables();
                break
            default:
                break
        }
    };

    onTreeTablesSelected(selectedKeys, info) {

        if (selectedKeys[0] === undefined) return;

        this.gCurrent.nodeSelectedType = info.node.nodeType;
        this.gCurrent.tableId = parseInt(selectedKeys[0]);

        let myColumn = new TadTableColumn();
        let myIndex = new TadTableIndex();
        let myPartition = new TadTablePartition();
        let myRelation = new TadTableRelation();

        myColumn.table_id = this.gCurrent.tableId;
        myIndex.table_id = this.gCurrent.tableId;
        myPartition.table_id = this.gCurrent.tableId;
        myRelation.s_table_id = this.gCurrent.tableId;

        axios.all([
            this.doGetTablePropertyColumns(myColumn),
            this.doGetTablePropertyIndexes(myIndex),
            this.doGetTablePropertyPartitions(myPartition),
            this.doGetTablePropertyRelations(myRelation)
        ]).then(axios.spread((
            columns,
            indexes,
            partitions,
            relations) => {
            console.log(columns);
            let pageSizeColumns = columns.data.data.length;
            let dsColumns = [];
            let pageSizeIndexes = indexes.data.data.length;
            let dsIndexes = [];
            let pageSizePartitions = partitions.data.data.length;
            let dsPartitions = [];
            let pageSizeRelations = relations.data.data.length;
            let dsRelations = [];

            let table = this.gMap.tables.get(this.gCurrent.tableId);
            let tableDDL = "CREATE TABLE " + table.table_name + "(\n";

            columns.data.data.forEach((item) => {
                console.log(item);
                let uiObject = item;
                uiObject.key = item.column_id;
                dsColumns.push(uiObject);

                switch (item.data_type) {
                    case "varchar":
                    case "varchar2":
                        tableDDL += "\t" + item.column_name + " " + item.data_type + "(" + item.data_length + "),\n"
                        break
                    default:
                        tableDDL += "\t" + item.column_name + " " + item.data_type + ",\n"
                        break
                }

            })
            tableDDL = tableDDL.substr(0, tableDDL.length - 2);
            tableDDL += "\n);\n\n";

            indexes.data.data.forEach((item) => {
                let uiObject = item;
                uiObject.key = item.id;
                dsIndexes.push(uiObject);
            })

            partitions.data.data.forEach((item) => {
                let uiObject = item;
                uiObject.key = item.id;
                dsPartitions.push(uiObject);
            })

            relations.data.data.forEach((item) => {
                let uiObject = item;
                uiObject.key = item.id;
                dsRelations.push(uiObject);
            })


            this.setState({
                pageSizeColumns: pageSizeColumns,
                dsColumns: dsColumns,
                pageSizeIndexes: pageSizeIndexes,
                dsIndexes: dsIndexes,
                pageSizePartitions: pageSizePartitions,
                dsPartitions: dsPartitions,
                pageSizeRelations: pageSizeRelations,
                dsRelations: dsRelations,
                tableDDL: tableDDL
            })
        }));
    };

    // ********** ********** ********** ********** **********
    // SELECT...
    // ********** ********** ********** ********** **********

    onSelectDbUsersChanged(value, option) {

        this.gCurrent.dbUserId = value;
        this.doGetSpecialTables();
    }

    // 选择目标数据源
    onSelectConnectionsChanged(value, option) {

        this.gCurrent.connectionId = value;
        let connection = this.gMap.connections.get(value);

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_schemas", connection,
            {headers: {'Content-Type': 'application/json'}}).then((response) => {

            let mapTablesByLetter = new Map();
            let setLetters = new Set();

            for (let i = 0; i < response.data.data.rows.length; i++) {
                let item = response.data.data.rows[i];
                let tableName = item[0].toLowerCase();
                let columnName = item[1].toLowerCase();
                let dataType = item[2].toLowerCase();
                let dataLength = item[3];

                if (tableName.startsWith("temp_") || tableName.endsWith("$")) continue

                let firstLetter = tableName[0];
                setLetters.add(firstLetter);
                if (!mapTablesByLetter.has(firstLetter)) {
                    let mapTables = new Map();
                    mapTables.set(tableName, {columns: [{name: columnName, type: dataType, length: dataLength}]});
                    mapTablesByLetter.set(firstLetter, {tables: mapTables});
                } else {
                    if (!mapTablesByLetter.get(firstLetter).tables.has(tableName)) {
                        mapTablesByLetter.get(firstLetter).tables.set(tableName, {
                            columns: [{
                                name: columnName,
                                type: dataType,
                                length: dataLength
                            }]
                        });
                    } else {
                        mapTablesByLetter.get(firstLetter).tables.get(tableName).columns.push({
                            name: columnName,
                            type: dataType,
                            length: dataLength
                        });
                    }
                }
            }
            this.gMap.mapTablesbyLetter = mapTablesByLetter;

            let letters = Array.from(setLetters);
            let lettersTreeData = [];
            letters.forEach((item) => {
                lettersTreeData.push({
                    key: item,
                    title: item,
                    children: []
                })
            })

            let tablesUnknownTreeData = this.doGetTablesByLetter(letters[0]);

            this.setState({
                letters: letters,
                lettersTreeData: lettersTreeData,
                tablesUnknownTreeData: tablesUnknownTreeData
            })
        });
    }

    onCheckboxKnownTableDisplayChanged(e) {

        let display = "none";
        if (e.target.checked) {
            display = "block";
        }
        this.setState({
            showKnownTable: e.target.checked,
            uiTableKnownDisplay: display
        })
    }

    onCheckboxUnknownTableDisplayChanged(e) {

        let display = "none";
        if (e.target.checked) {
            display = "block";
        }
        this.setState({
            showUnknownTable: e.target.checked,
            uiTableUnknownDisplay: display
        })
    }

    onRadioUnknownChanged(e) {

        this.setState({
            uiRadioUnknownSelected: e.target.value
        })
    }

    // 获取某字母开头的表
    doGetTablesByLetter(letter) {

        let myResult = [];
        this.gMap.mapTablesbyLetter.get(letter).tables.forEach((value, key) => {
            let tableName = key;

            if (!this.gMap.tablesByName.has(tableName)) {
                let nodeTable = {
                    key: tableName,
                    title: tableName,
                    children: [],
                    olc: {
                        nodeType: "table"
                    },
                }

                value.columns.forEach((item) => {
                    let nodeColumn = {
                        key: tableName + "." + item.name,
                        title: item.name + " : " + item.type,
                        children: [],
                        olc: {
                            nodeType: "table_column"
                        },
                    }
                    nodeTable.children.push(nodeColumn);
                })
                myResult.push(nodeTable);
            }
        });

        return myResult;
    }

    onTreeLettersSelected(selectedKeys) {
        if (selectedKeys[0] === undefined) return;

        let tablesUnknownTreeData = this.doGetTablesByLetter(selectedKeys[0]);
        this.setState({
            tablesUnknownTreeData: tablesUnknownTreeData
        })
    }

    onSelect(selectedKeys, info) {
        //
    };

    onTableUnknownChecked(checkedKeys, info) {

        this.gTableUnknownSelected = info.checkedNodes;
    };

    onTableKnownChecked(checkedKeys, info) {

        this.gTableKnownSelected = info.checkedNodes;
    };

    doTablesCompare() {
        const {tablesKnown, tablesAll} = this.state;
        for (let i = 0; i < tablesAll.length; i++) {
            let isFound = false;
            for (let j = 0; j < tablesKnown.length; j++) {
                if (tablesAll[i].title === tablesKnown[j].title) {
                    isFound = true;
                    break;
                }
            }
            if (!isFound) {
                this.gTablesUnknown.push(tablesAll[i]);
            }
        }

        this.setState({
            tablesUnknown: this.gTablesUnknown
        })
    }

    // ********** ********** ********** ********** **********
    // BUTTON...
    // ********** ********** ********** ********** **********

    // Column...
    onButtonAddColumnClicked() {
        let tableId = this.gCurrent.tableId;
        let objectId = null;

        let myObject = new TadTableColumn();
        myObject.table_id = tableId;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_column",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                objectId = data.data.column_id;
                let uiObject = data.data;
                uiObject.key = objectId;

                let dsColumns = JSON.parse(JSON.stringify(this.state.dsColumns));

                dsColumns.push(uiObject);
                this.setState({
                    pageSizeColumns: this.state.pageSizeColumns + 1,
                    dsColumns: dsColumns
                })
            }
        });
    }

    onButtonAlterColumnClicked() {

        this.setState({
            isShownButtonAddIndex: "none",
            isShownButtonDeleteIndex: "none",
            isShownButtonAlterIndexConfirm: "block",
            isShownButtonAlterIndexCancel: "block",
        })
    }

    onButtonAlterColumnConfirmClicked() {

        let myIndex = new TadTableIndex();
        myIndex.id = this.state.editingIndex.id;
        myIndex.table_id = this.state.editingIndex.table_id;
        myIndex.index_name = this.state.editingIndex.name;
        myIndex.index_type = this.state.editingIndex.type;
        myIndex.index_columns = this.state.editingIndex.columns;
        myIndex.index_attributes = this.state.editingIndex.attributes;
        myIndex.index_desc = this.state.editingIndex.desc;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                for (let i = 0; i < dsIndexes.length; i++) {
                    let record = dsIndexes[i];
                    if (record.key === this.state.editingIndex.key) {
                        record.index_name = this.state.editingIndex.name;
                        record.index_type = this.state.editingIndex.type;
                        record.index_columns = this.state.editingIndex.columns;
                        record.index_attributes = this.state.editingIndex.attributes;

                        break
                    }
                }

                this.setState({
                    dsIndexes: dsIndexes,
                    isShownButtonAddIndex: "block",
                    isShownButtonDeleteIndex: "block",
                    isShownButtonAlterIndexConfirm: "none",
                    isShownButtonAlterIndexCancel: "none",
                })
            }
        });

    }

    onButtonAlterColumnCancelClicked() {

        this.setState({
            isShownButtonAddIndex: "block",
            isShownButtonDeleteIndex: "block",
            isShownButtonAlterIndexConfirm: "none",
            isShownButtonAlterIndexCancel: "none",
        })
    }

    onButtonDeleteColumnClicked() {

    }

    // Index...
    onButtonAddIndexClicked() {
        let tableId = this.gCurrent.tableId;
        let indexId = null;

        let myIndex = {
            id: indexId,
            table_id: tableId,
            index_name: "新增索引",
            index_type: "normal",
            index_columns: "",
            index_attributes: "",
            index_desc: ""
        }

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                indexId = data.data.id;
                let uiIndex = {
                    key: indexId,
                    index_name: "新增索引",
                    index_type: "normal",
                    index_columns: "",
                    index_attributes: "",
                    index_desc: ""
                }

                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                dsIndexes.push(uiIndex);
                this.setState({
                    pageSizeTableIndexes: this.state.pageSizeTableIndexes + 1,
                    dsIndexes: dsIndexes
                })
            }
        });
    }

    onButtonAlterIndexClicked() {

        this.setState({
            isShownButtonAddIndex: "none",
            isShownButtonDeleteIndex: "none",
            isShownButtonAlterIndexConfirm: "block",
            isShownButtonAlterIndexCancel: "block",
        })
    }

    onButtonAlterIndexConfirmClicked() {

        let myIndex = new TadTableIndex();
        myIndex.id = this.state.editingIndex.id;
        myIndex.table_id = this.state.editingIndex.table_id;
        myIndex.index_name = this.state.editingIndex.name;
        myIndex.index_type = this.state.editingIndex.type;
        myIndex.index_columns = this.state.editingIndex.columns;
        myIndex.index_attributes = this.state.editingIndex.attributes;
        myIndex.index_desc = this.state.editingIndex.desc;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                for (let i = 0; i < dsIndexes.length; i++) {
                    let record = dsIndexes[i];
                    if (record.key === this.state.editingIndex.key) {
                        record.index_name = this.state.editingIndex.name;
                        record.index_type = this.state.editingIndex.type;
                        record.index_columns = this.state.editingIndex.columns;
                        record.index_attributes = this.state.editingIndex.attributes;

                        break
                    }
                }

                this.setState({
                    dsIndexes: dsIndexes,
                    isShownButtonAddIndex: "block",
                    isShownButtonDeleteIndex: "block",
                    isShownButtonAlterIndexConfirm: "none",
                    isShownButtonAlterIndexCancel: "none",
                })
            }
        });

    }

    onButtonAlterIndexCancelClicked() {

        this.setState({
            isShownButtonAddIndex: "block",
            isShownButtonDeleteIndex: "block",
            isShownButtonAlterIndexConfirm: "none",
            isShownButtonAlterIndexCancel: "none",
        })
    }

    onButtonDeleteIndexClicked() {

    }

    // Partition...
    onButtonAddPartitionClicked() {

        let tableId = this.gCurrent.tableId;
        let partitionId = null;

        let myObject = new TadTablePartition();
        myObject.table_id = tableId;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_partition",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                partitionId = data.data.id;
                let uiPartition = data.data;
                uiPartition.key = partitionId;

                let dsPartitions = JSON.parse(JSON.stringify(this.state.dsPartitions));

                dsPartitions.push(uiPartition);
                this.setState({
                    pageSizePartitions: this.state.pageSizePartitions + 1,
                    dsPartitions: dsPartitions
                })
            }
        });
    }

    onButtonAlterPartitionClicked() {

        this.setState({
            isShownButtonAddPartition: "none",
            isShownButtonDeletePartition: "none",
            isShownButtonAlterPartitionConfirm: "block",
            isShownButtonAlterPartitionCancel: "block",
        })
    }

    onButtonAlterPartitionConfirmClicked() {

        let myObject = new TadTablePartition();
        myObject.id = this.state.editingPartition.id;
        myObject.table_id = this.state.editingPartition.table_id;
        myObject.partition_type = this.state.editingPartition.type;
        myObject.partition_column = this.state.editingPartition.column;
        myObject.partition_name = this.state.editingPartition.name;
        myObject.partition_operator = this.state.editingPartition.operator;
        myObject.partition_tablespace = this.state.editingPartition.tablespace;
        myObject.partition_desc = this.state.editingPartition.desc;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_partition",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let dsPartitions = JSON.parse(JSON.stringify(this.state.dsPartitions));

                for (let i = 0; i < dsPartitions.length; i++) {
                    let record = dsPartitions[i];
                    if (record.key === this.state.editingPartition.key) {
                        record.id = this.state.editingPartition.id;
                        record.table_id = this.state.editingPartition.table_id;
                        record.partition_type = this.state.editingPartition.type;
                        record.partition_column = this.state.editingPartition.column;
                        record.partition_name = this.state.editingPartition.name;
                        record.partition_operator = this.state.editingPartition.operator;
                        record.partition_tablespace = this.state.editingPartition.tablespace;
                        record.partition_desc = this.state.editingPartition.desc;

                        break
                    }
                }

                this.setState({
                    dsPartitions: dsPartitions,
                    isShownButtonAddPartition: "block",
                    isShownButtonDeletePartition: "block",
                    isShownButtonAlterPartitionConfirm: "none",
                    isShownButtonAlterPartitionCancel: "none",
                })
            }
        });

    }

    onButtonAlterPartitionCancelClicked() {

        this.setState({
            isShownButtonAddPartition: "block",
            isShownButtonDeletePartition: "block",
            isShownButtonAlterPartitionConfirm: "none",
            isShownButtonAlterPartitionCancel: "none",
        })
    }

    onButtonDeletePartitionClicked() {

    }

    // Relation...
    onButtonAddRelationClicked() {
        let tableId = this.gCurrent.tableId;
        let relationId = null;

        let myRelation = new TadTableRelation();
        myRelation.s_table_id = tableId;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_relation",
            myRelation,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                relationId = data.data.id;
                let uiRelation = data.data;
                uiRelation.key = relationId;

                let dsRelations = JSON.parse(JSON.stringify(this.state.dsRelations));

                dsRelations.push(uiRelation);
                this.setState({
                    pageSizeRelations: this.state.pageSizeRelations + 1,
                    dsRelations: dsRelations
                })
            }
        });
    }

    onButtonAlterRelationClicked() {

        this.setState({
            isShownButtonAddIndex: "none",
            isShownButtonDeleteIndex: "none",
            isShownButtonAlterIndexConfirm: "block",
            isShownButtonAlterIndexCancel: "block",
        })
    }

    onButtonAlterRelationConfirmClicked() {

        let myIndex = new TadTableIndex();
        myIndex.id = this.state.editingIndex.id;
        myIndex.table_id = this.state.editingIndex.table_id;
        myIndex.index_name = this.state.editingIndex.name;
        myIndex.index_type = this.state.editingIndex.type;
        myIndex.index_columns = this.state.editingIndex.columns;
        myIndex.index_attributes = this.state.editingIndex.attributes;
        myIndex.index_desc = this.state.editingIndex.desc;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                for (let i = 0; i < dsIndexes.length; i++) {
                    let record = dsIndexes[i];
                    if (record.key === this.state.editingIndex.key) {
                        record.index_name = this.state.editingIndex.name;
                        record.index_type = this.state.editingIndex.type;
                        record.index_columns = this.state.editingIndex.columns;
                        record.index_attributes = this.state.editingIndex.attributes;

                        break
                    }
                }

                this.setState({
                    dsIndexes: dsIndexes,
                    isShownButtonAddIndex: "block",
                    isShownButtonDeleteIndex: "block",
                    isShownButtonAlterIndexConfirm: "none",
                    isShownButtonAlterIndexCancel: "none",
                })
            }
        });

    }

    onButtonAlterRelationCancelClicked() {

        this.setState({
            isShownButtonAddIndex: "block",
            isShownButtonDeleteIndex: "block",
            isShownButtonAlterIndexConfirm: "none",
            isShownButtonAlterIndexCancel: "none",
        })
    }

    onButtonDeleteRelationClicked() {

    }

    // Record...
    onButtonAddRecordClicked() {
        let tableId = this.gCurrent.tableId;
        let indexId = null;

        let myIndex = {
            id: indexId,
            table_id: tableId,
            index_name: "新增索引",
            index_type: "normal",
            index_columns: "",
            index_attributes: "",
            index_desc: ""
        }

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                indexId = data.data.id;
                let uiIndex = {
                    key: indexId,
                    index_name: "新增索引",
                    index_type: "normal",
                    index_columns: "",
                    index_attributes: "",
                    index_desc: ""
                }

                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                dsIndexes.push(uiIndex);
                this.setState({
                    pageSizeTableIndexes: this.state.pageSizeTableIndexes + 1,
                    dsIndexes: dsIndexes
                })
            }
        });
    }

    onButtonAlterRecordClicked() {

        this.setState({
            isShownButtonAddIndex: "none",
            isShownButtonDeleteIndex: "none",
            isShownButtonAlterIndexConfirm: "block",
            isShownButtonAlterIndexCancel: "block",
        })
    }

    onButtonAlterRecordConfirmClicked() {

        let myIndex = new TadTableIndex();
        myIndex.id = this.state.editingIndex.id;
        myIndex.table_id = this.state.editingIndex.table_id;
        myIndex.index_name = this.state.editingIndex.name;
        myIndex.index_type = this.state.editingIndex.type;
        myIndex.index_columns = this.state.editingIndex.columns;
        myIndex.index_attributes = this.state.editingIndex.attributes;
        myIndex.index_desc = this.state.editingIndex.desc;

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index",
            myIndex,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));

                for (let i = 0; i < dsIndexes.length; i++) {
                    let record = dsIndexes[i];
                    if (record.key === this.state.editingIndex.key) {
                        record.index_name = this.state.editingIndex.name;
                        record.index_type = this.state.editingIndex.type;
                        record.index_columns = this.state.editingIndex.columns;
                        record.index_attributes = this.state.editingIndex.attributes;

                        break
                    }
                }

                this.setState({
                    dsIndexes: dsIndexes,
                    isShownButtonAddIndex: "block",
                    isShownButtonDeleteIndex: "block",
                    isShownButtonAlterIndexConfirm: "none",
                    isShownButtonAlterIndexCancel: "none",
                })
            }
        });

    }

    onButtonAlterRecordCancelClicked() {

        this.setState({
            isShownButtonAddIndex: "block",
            isShownButtonDeleteIndex: "block",
            isShownButtonAlterIndexConfirm: "none",
            isShownButtonAlterIndexCancel: "none",
        })
    }

    onButtonDeleteRecordClicked() {

    }

    // ********** ********** ********** ********** **********
    // TABLE ROW...
    // ********** ********** ********** ********** **********

    onRowColumnSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
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
        },
        renderCell: (checked, record, index, originNode) => {
            return (
                <Fragment>
                    {this.state.isShownButtonAlterColumnConfirm === "none" && (originNode)}
                </Fragment>
            )
        }
    }

    onRowIndexSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
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
        },
        renderCell: (checked, record, index, originNode) => {
            return (
                <Fragment>
                    {this.state.isShownButtonAlterIndexConfirm === "none" && (originNode)}
                </Fragment>
            )
        }
    }

    onRowPartitionSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
            let isShownButtonAlterPartitionConfirm = this.state.isShownButtonAlterPartitionConfirm;
            if (isShownButtonAlterPartitionConfirm === "block") return false;

            // let arrPropertyName = Object.keys(selectedRows[0]);
            // let mapValues = new Map();
            // for (let item of arrPropertyName) {
            //     mapValues.set(item, selectedRows[0][item])
            // }

            this.gCurrent.selectedRowsPartition = selectedRows[0];

            let editingPartition = JSON.parse(JSON.stringify(this.state.editingPartition));

            editingPartition.key = selectedRows[0].key;
            editingPartition.id = selectedRows[0].id;
            editingPartition.table_id = selectedRows[0].table_id;
            editingPartition.type = selectedRows[0].partition_type;
            editingPartition.column = selectedRows[0].partition_column;
            editingPartition.name = selectedRows[0].partition_name;
            editingPartition.operator = selectedRows[0].partition_operator;
            editingPartition.expression = selectedRows[0].partition_expression;
            editingPartition.tablespace = selectedRows[0].partition_tablespace;
            editingPartition.desc = selectedRows[0].partition_desc;

            this.setState({
                editingPartition: editingPartition,
                isEditingKeyPartition: selectedRows[0].key
            })
        },
        renderCell: (checked, record, index, originNode) => {
            return (
                <Fragment>
                    {this.state.isShownButtonAlterPartitionConfirm === "none" && (originNode)}
                </Fragment>
            )
        }
    }

    onRowRelationSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
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
        },
        renderCell: (checked, record, index, originNode) => {
            return (
                <Fragment>
                    {this.state.isShownButtonAlterRelationConfirm === "none" && (originNode)}
                </Fragment>
            )
        }
    }

    onRowRecordSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
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
        },
        renderCell: (checked, record, index, originNode) => {
            return (
                <Fragment>
                    {this.state.isShownButtonAlterIndexConfirm === "none" && (originNode)}
                </Fragment>
            )
        }
    }

    // ********** ********** ********** ********** **********
    // INPUT...
    // ********** ********** ********** ********** **********

    onInputIndexNameChanged(e) {

        let editingIndex = JSON.parse(JSON.stringify(this.state.editingIndex));
        editingIndex.name = e.target.value;
        this.setState({
            editingIndex: editingIndex
        })
    }

    onInputPartitionNameChanged(e) {

        let editingPartition = JSON.parse(JSON.stringify(this.state.editingPartition));
        editingPartition.name = e.target.value;
        this.setState({
            editingPartition: editingPartition
        })
    }

    render() {
        const columnsColumn = [
            {
                title: '字段名称',
                dataIndex: 'column_name',
                key: 'column_name',
            },
            {
                title: '数据类型',
                dataIndex: 'data_type',
                key: 'data_type',
            },
            {
                title: '数据长度',
                dataIndex: 'data_length',
                key: 'data_length',
            },
            {
                title: '是否为主键',
                dataIndex: 'primary_flag',
                key: 'primary_flag',
            },
            {
                title: '是否可为空',
                dataIndex: 'nullable_flag',
                key: 'nullable_flag',
            },
            {
                title: '缺省值',
                dataIndex: 'data_default',
                key: 'data_default',
            },
            {
                title: '数值分隔符',
                dataIndex: 'split_flag',
                key: 'split_flag',
            },
            {
                title: '是否可重复',
                dataIndex: 'repeat_flag',
                key: 'repeat_flag',
            },
            {
                title: '字段简述',
                dataIndex: 'column_desc',
                key: 'column_desc',
            },
        ];
        const columnsIndex = [
            {
                title: '索引名称',
                dataIndex: 'index_name',
                key: 'index_name',
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            {this.state.isEditingKeyIndex !== record.key && (
                                <span>
                                {text}
                                </span>
                            )}
                            {this.state.isEditingKeyIndex === record.key && (
                                <span style={{display: this.state.isShownButtonAddIndex}}>
                                {text}
                                </span>
                            )}
                            {this.state.isEditingKeyIndex === record.key && (
                                <Input
                                    style={{display: this.state.isShownButtonAlterIndexConfirm}}
                                    value={this.state.editingIndex.name}
                                    onChange={this.onInputIndexNameChanged}
                                />
                            )}
                        </Fragment>
                    )
                }
            },
            {
                title: '索引类型',
                dataIndex: 'index_type',
                key: 'index_type',
            },
            {
                title: '索引字段',
                dataIndex: 'index_columns',
                key: 'index_columns',
            },
        ];
        const columnsPartition = [
            {
                title: '分区类型', // RANGE/LIST/HASH/LINEAR HASH
                dataIndex: 'partition_type',
                key: 'partition_type',
            },
            {
                title: '分区字段',
                dataIndex: 'partition_column',
                key: 'partition_column',
            },
            {
                title: '分区名称',
                dataIndex: 'partition_name',
                key: 'partition_name',
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            {this.state.isEditingKeyPartition !== record.key && (
                                <span>
                                {text}
                                </span>
                            )}
                            {this.state.isEditingKeyPartition === record.key && (
                                <span style={{display: this.state.isShownButtonAddPartition}}>
                                {text}
                                </span>
                            )}
                            {this.state.isEditingKeyPartition === record.key && (
                                <Input
                                    style={{display: this.state.isShownButtonAlterPartitionConfirm}}
                                    value={this.state.editingPartition.name}
                                    onChange={this.onInputPartitionNameChanged}
                                />
                            )}
                        </Fragment>
                    )
                }
            },
            {
                title: '操作符',
                dataIndex: 'partition_operator',
                key: 'partition_operator',
            },
            {
                title: '表达式',
                dataIndex: 'partition_expression',
                key: 'partition_expression',
            },
            {
                title: '表空间名称',
                dataIndex: 'partition_tablespace',
                key: 'partition_tablespace',
            },
            {
                title: '分区简述',
                dataIndex: 'partition_desc',
                key: 'partition_desc',
            },
        ];
        const columnsRelation = [
            {
                title: '关系类型', //
                dataIndex: 'relation_type',
                key: 'relation_type',
            },
            {
                title: '源表字段',
                dataIndex: 's_column_id',
                key: 's_column_id',
            },
            {
                title: '数据流向', //
                dataIndex: 'data_flow',
                key: 'data_flow',
            },
            {
                title: '关联表',
                dataIndex: 'a_table_id',
                key: 'a_table_id',
            },
            {
                title: '关联表字段',
                dataIndex: 'a_column_id',
                key: 'a_column_id',
            },
            {
                title: '关系简述',
                dataIndex: 'relation_desc',
                key: 'relation_desc',
            },
        ];
        const indexTypes = ["普通索引", "唯一索引", "位图索引"];

        return <div className="DatabaseMaintain">
            {/*1-1*/}
            <div className={"BoxProductsInfo"}>
                <div className={"BoxTree"}>
                    <Tree
                        blockNode={true}
                        showLine={true}
                        showIcon={true}
                        switcherIcon={<CaretDownOutlined/>}
                        onSelect={this.onTreeProductsSelected}
                        treeData={this.state.productsTreeData}
                    />
                </div>
                <div className={"BoxDescription"}>information</div>
            </div>
            {/*1-2*/}
            <div className={"BoxTables"}>
                <div className={"BoxSelect"}>
                    <Select
                        defaultValue={-1}
                        onChange={this.onSelectDbUsersChanged}
                        options={this.state.optionsDbUsers}>
                    </Select>
                </div>
                <div className={"BoxToolbar"}>
                    <Checkbox>分组显示</Checkbox>
                </div>
                <div className={"BoxTreeAndTable"}>
                    <div className={"BoxTree"}>
                        <Tree
                            // checkable
                            blockNode={true}
                            // showLine={true}
                            showIcon={true}
                            // switcherIcon={<CaretDownOutlined/>}
                            onSelect={this.onTreeTablesSelected}
                            // onCheck={this.onTableKnownChecked}
                            treeData={this.state.tablesKnownTreeData}
                        />
                    </div>
                </div>
            </div>
            {/*1-3*/}
            <div className={"BoxPropertiesBorder"}>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div className={"BoxProperties"}>
                    <div className={"BoxTableProperties"}>
                        <Input placeholder="请输该表用途的简单描述"/>
                        <Select/>
                        <Select/>
                    </div>
                    <div className={"BoxOtherProperties"}>
                        <Tabs defaultActiveKey="1" type="card" tabBarGutter={5} animated={false}>
                            <TabPane tab="表字段" key="1">
                                <div className={"BoxTableColumnProperties"}>
                                    <div className={"BoxToolbar"}>
                                        <div className={"BoxLabel"}>&nbsp;</div>
                                        <Button onClick={this.onButtonAddColumnClicked}
                                                style={{display: this.state.isShownButtonAddColumn}}>新增</Button>
                                        <Button
                                            onClick={this.onButtonAlterColumnClicked}
                                            disabled={this.state.isShownButtonAlterColumnConfirm === "block"}>修改</Button>
                                        <Button onClick={this.onButtonDeleteColumnClicked}
                                                style={{display: this.state.isShownButtonDeleteColumn}}>删除</Button>
                                        <Button onClick={this.onButtonAlterColumnConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterColumnConfirm}}>确认</Button>
                                        <Button onClick={this.onButtonAlterColumnCancelClicked}
                                                style={{display: this.state.isShownButtonAlterColumnCancel}}>放弃</Button>
                                    </div>
                                    <div className={"BoxDetail"}>
                                        <Table
                                            dataSource={this.state.dsColumns}
                                            columns={columnsColumn}
                                            scroll={{y: 400}}
                                            bordered={true}
                                            size={"small"}
                                            pagination={{
                                                pageSize: this.state.pageSizeColumns,
                                                position: ["none", "none"]
                                            }}
                                            rowSelection={{
                                                type: "radio",
                                                ...this.onRowColumnSelected
                                            }}/>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="表索引" key="2">
                                <div className={"BoxTableIndexProperties"}>
                                    <div className={"BoxToolbar"}>
                                        <div className={"BoxLabel"}>&nbsp;</div>
                                        <Button onClick={this.onButtonAddIndexClicked}
                                                style={{display: this.state.isShownButtonAddIndex}}>新增</Button>
                                        <Button
                                            onClick={this.onButtonAlterIndexClicked}
                                            disabled={this.state.isShownButtonAlterIndexConfirm === "block"}>修改</Button>
                                        <Button onClick={this.onButtonDeleteIndexClicked}
                                                style={{display: this.state.isShownButtonDeleteIndex}}>删除</Button>
                                        <Button onClick={this.onButtonAlterIndexConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterIndexConfirm}}>确认</Button>
                                        <Button onClick={this.onButtonAlterIndexCancelClicked}
                                                style={{display: this.state.isShownButtonAlterIndexCancel}}>放弃</Button>
                                    </div>
                                    <div className={"BoxDetail"}>
                                        <Table
                                            dataSource={this.state.dsIndexes}
                                            columns={columnsIndex}
                                            scroll={{y: 400}}
                                            bordered={true}
                                            size={"small"}
                                            pagination={{
                                                pageSize: this.state.pageSizeIndexes,
                                                position: ["none", "none"]
                                            }}
                                            rowSelection={{
                                                type: "radio",
                                                ...this.onRowIndexSelected
                                            }}/>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="表分区" key="3">
                                <div className={"BoxTablePartitionProperties"}>
                                    <div className={"BoxToolbar"}>
                                        <div className={"BoxLabel"}>&nbsp;</div>
                                        <Button onClick={this.onButtonAddPartitionClicked}
                                                style={{display: this.state.isShownButtonAddPartition}}>新增</Button>
                                        <Button
                                            onClick={this.onButtonAlterPartitionClicked}
                                            disabled={this.state.isShownButtonAlterPartitionConfirm === "block"}>修改</Button>
                                        <Button onClick={this.onButtonDeletePartitionClicked}
                                                style={{display: this.state.isShownButtonDeletePartition}}>删除</Button>
                                        <Button onClick={this.onButtonAlterPartitionConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterPartitionConfirm}}>确认</Button>
                                        <Button onClick={this.onButtonAlterPartitionCancelClicked}
                                                style={{display: this.state.isShownButtonAlterPartitionCancel}}>放弃</Button>
                                    </div>
                                    <div className={"BoxDetail"}>
                                        <Table
                                            dataSource={this.state.dsPartitions}
                                            columns={columnsPartition}
                                            scroll={{y: 400}}
                                            bordered={true}
                                            size={"small"}
                                            pagination={{
                                                pageSize: this.state.pageSizePartitions,
                                                position: ["none", "none"]
                                            }}
                                            rowSelection={{
                                                type: "radio",
                                                ...this.onRowPartitionSelected
                                            }}/>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="表关联" key="4">
                                <div className={"BoxTableRelationProperties"}>
                                    <div className={"BoxToolbar"}>
                                        <div className={"BoxLabel"}>&nbsp;</div>
                                        <Button onClick={this.onButtonAddRelationClicked}
                                                style={{display: this.state.isShownButtonAddRelation}}>新增</Button>
                                        <Button
                                            onClick={this.onButtonAlterRelationClicked}
                                            disabled={this.state.isShownButtonAlterRelationConfirm === "block"}>修改</Button>
                                        <Button onClick={this.onButtonDeleteRelationClicked}
                                                style={{display: this.state.isShownButtonDeleteRelation}}>删除</Button>
                                        <Button onClick={this.onButtonAlterRelationConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterRelationConfirm}}>确认</Button>
                                        <Button onClick={this.onButtonAlterRelationCancelClicked}
                                                style={{display: this.state.isShownButtonAlterRelationCancel}}>放弃</Button>
                                    </div>
                                    <div className={"BoxDetail"}>
                                        <Table
                                            dataSource={this.state.dsRelations}
                                            columns={columnsRelation}
                                            scroll={{y: 400}}
                                            bordered={true}
                                            size={"small"}
                                            pagination={{
                                                pageSize: this.state.pageSizeRelations,
                                                position: ["none", "none"]
                                            }}
                                            rowSelection={{
                                                type: "radio",
                                                ...this.onRowRelationSelected
                                            }}/>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="表数据" key="5">
                                <div className={"BoxTableRelationProperties"}>
                                    <div className={"BoxToolbar"}>
                                        <div className={"BoxLabel"}>&nbsp;</div>
                                        <Button onClick={this.onButtonAddIndexClicked}
                                                style={{display: this.state.isShownButtonAddRecord}}>新增</Button>
                                        <Button
                                            onClick={this.onButtonAlterIndexClicked}
                                            disabled={this.state.isShownButtonAlterRecordConfirm === "block"}>修改</Button>
                                        <Button onClick={this.onButtonDeleteIndexClicked}
                                                style={{display: this.state.isShownButtonDeleteRecord}}>删除</Button>
                                        <Button onClick={this.onButtonAlterIndexConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterRecordConfirm}}>确认</Button>
                                        <Button onClick={this.onButtonAlterIndexCancelClicked}
                                                style={{display: this.state.isShownButtonAlterRecordCancel}}>放弃</Button>
                                    </div>
                                    <div className={"BoxDetail"}>
                                        <Table
                                            dataSource={this.state.dsRecords}
                                            columns={this.state.columnsRecord}
                                            scroll={{y: 400}}
                                            bordered={true}
                                            size={"small"}
                                            pagination={{
                                                pageSize: this.state.pageSizeRecords,
                                                position: ["none", "none"]
                                            }}
                                            rowSelection={{
                                                type: "radio",
                                                ...this.onRowRecordSelected
                                            }}/>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab="表DDL" key="6">
                                <div className={"BoxTableRelationProperties"}>
                                    <pre>{this.state.tableDDL}</pre>
                                    {/*{this.state.domTableSql.map((item, index) => {*/}
                                    {/*    return item*/}
                                    {/*})}*/}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
            </div>
        </div>
    }
}
