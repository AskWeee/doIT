import React, {Fragment} from 'react'
import './DatabaseMaintain.scss'
import GCtx from "../GCtx";
import lodash from "lodash";
import axios from "axios";
import moment from 'moment';
import {Button, Select, Tree, Table, Input, Tabs} from 'antd'
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, PlusSquareOutlined} from '@ant-design/icons'
import TadTableColumn from '../entity/TadTableColumn'
import Mock from 'mockjs'
import TadTableIndex from "../entity/TadTableIndex";
import TadTablePartition from "../entity/TadTablePartition";
import TadTableRelation from "../entity/TadTableRelation";
import KColumnTitle from "./KColumnTitle";
import TadTableIndexColumn from "../entity/TadTableIndexColumn";
import TadTable from "../entity/TadTable";

const {TabPane} = Tabs;

export default class DatabaseMaintain extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};
    refBoxDetail = React.createRef();
    gDynamic = {};

    gTableUnknownSelected = [];
    gTableKnownSelected = [];

    constructor(props) {
        super(props);

        //todo >>>>> state
        this.state = {
            dbUsersSelectOptions: [{value: -1, label: "请选择产品线数据库用户"}],
            dbUserSelected: -1,
            treeDataProducts: [],
            treeDataLettersKnown: [],
            treeDataTablesKnown: [],
            dsColumns: [],
            dsIndexes: [],
            dsPartitions: [],
            dsRelations: [],
            dsRecords: [],
            tableSql: "",
            domTableSql: [],
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
            styleLayout: "NNN",
            tablePropertiesScrollX: 1366,
            tablePropertiesScrollY: 400,
            isTableNameEditing: false,
            tableColumnEditingKey: null,
        }

        //todo >>>>> bind
        this.doInit = this.doInit.bind(this);

        this.restAddTable = this.restAddTable.bind(this);
        this.restUpdateTable = this.restUpdateTable.bind(this);
        this.restDeleteTable = this.restDeleteTable.bind(this);
        this.restAddTableColumn = this.restAddTableColumn.bind(this);
        this.restUpdateTableColumn = this.restUpdateTableColumn.bind(this);
        this.restDeleteTableColumn = this.restDeleteTableColumn.bind(this);
        this.restAddTableIndex = this.restAddTableIndex.bind(this);
        this.restUpdateTableIndex = this.restUpdateTableIndex.bind(this);
        this.restDeleteTableIndex = this.restDeleteTableIndex.bind(this);
        this.restAddTableIndexColumn = this.restAddTableIndexColumn.bind(this);
        this.restUpdateTableIndexColumn = this.restUpdateTableIndexColumn.bind(this);
        this.restDeleteTableIndexColumn = this.restDeleteTableIndexColumn.bind(this);

        this.doAddTable = this.doAddTable.bind(this);
        this.doUpdateTable = this.doUpdateTable.bind(this);
        this.doDeleteTable = this.doDeleteTable.bind(this);
        this.doAddTableColumn = this.doAddTableColumn.bind(this);
        this.doUpdateTableColumn = this.doUpdateTableColumn.bind(this);
        this.doDeleteTableColumn = this.doDeleteTableColumn.bind(this);
        this.doAddTableIndex = this.doAddTableIndex.bind(this);
        this.doUpdateTableIndex = this.doUpdateTableIndex.bind(this);
        this.doDeleteTableIndex = this.doDeleteTableIndex.bind(this);
        this.doAddTableIndexColumn = this.doAddTableIndexColumn.bind(this);
        this.doUpdateTableIndexColumn = this.doUpdateTableIndexColumn.bind(this);
        this.doDeleteTableIndexColumn = this.doDeleteTableIndexColumn.bind(this);

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
        this.doGetTablesByLetter = this.doGetTablesByLetter.bind(this);
        this.doMock = this.doMock.bind(this);
        this.doGetTablePropertyIndexColumns = this.doGetTablePropertyIndexColumns.bind(this);

        this.uiUpdateTable = this.uiUpdateTable.bind(this);
        this.dsUpdateTable = this.dsUpdateTable.bind(this);
        this.uiUpdateTableColumn = this.uiUpdateTableColumn.bind(this);
        this.dsUpdateTableColumn = this.dsUpdateTableColumn.bind(this);
        this.uiUpdateTableIndex = this.uiUpdateTableIndex.bind(this);
        this.dsUpdateTableIndex = this.dsUpdateTableIndex.bind(this);
        this.uiUpdateTableIndexColumn = this.uiUpdateTableIndexColumn.bind(this);
        this.dsUpdateTableIndexColumn = this.dsUpdateTableIndexColumn.bind(this);

        this.onSelectDbUsersChanged = this.onSelectDbUsersChanged.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onTableUnknownChecked = this.onTableUnknownChecked.bind(this);
        this.onTableKnownChecked = this.onTableKnownChecked.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);
        this.onTreeTablesKnownSelected = this.onTreeTablesKnownSelected.bind(this);

        this.showProductDbUsers = this.showProductDbUsers.bind(this);
        this.showProductTables = this.showProductTables.bind(this);
        this.showModuleTables = this.showModuleTables.bind(this);
        this.onTreeLettersKnownSelected = this.onTreeLettersKnownSelected.bind(this);
        this.getTableId = this.getTableId.bind(this);

        this.onButtonAddTableClicked = this.onButtonAddTableClicked.bind(this);
        this.onButtonRenameTableClicked = this.onButtonRenameTableClicked.bind(this);
        this.onButtonDeleteTableClicked = this.onButtonDeleteTableClicked.bind(this);
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
        this.onButtonProductsChangeComponentSizeClicked = this.onButtonProductsChangeComponentSizeClicked.bind(this);
        this.onButtonTablesChangeComponentSizeClicked = this.onButtonTablesChangeComponentSizeClicked.bind(this);
        this.onButtonTableNameEditingConfirmClicked = this.onButtonTableNameEditingConfirmClicked.bind(this);
        this.onButtonTableNameEditingCancelClicked = this.onButtonTableNameEditingCancelClicked.bind(this);
        this.onButtonColumnEditingConfirmClicked = this.onButtonColumnEditingConfirmClicked.bind(this);
        this.onButtonColumnEditingCancelClicked = this.onButtonColumnEditingCancelClicked.bind(this);

        this.onInputIndexNameChanged = this.onInputIndexNameChanged.bind(this);
        this.onInputPartitionNameChanged = this.onInputPartitionNameChanged.bind(this);
        this.onInputTableNameChanged = this.onInputTableNameChanged.bind(this);
        this.onInputColumnNameChanged = this.onInputColumnNameChanged.bind(this);

        this.onTabsTablePropertiesChanged = this.onTabsTablePropertiesChanged.bind(this);
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
    }

    doInit() {
        this.gCurrent.productLineId = undefined;
        this.gCurrent.productId = undefined;
        this.gCurrent.moduleId = undefined;
        this.gCurrent.dbUserId = -1;

        this.setState({
            tablePropertiesScrollY: this.refBoxDetail.current.scrollHeight - 40,
        })

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

        this.setState({
            treeDataProducts: this.gUi.treeProductsData,
        })
    }

    restAddTable(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTable(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTable(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddTableColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTableColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTableColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddTableIndex(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTableIndex(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTableIndex(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_index",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddTableIndexColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTableIndexColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_table_index_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTableIndexColumn(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_index_column",
            params,
            {headers: {'Content-Type': 'application/json'}})
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
        ]).then(axios.spread((
            productRelations,
            productLines,
            dbUsers,
            products,
            modules,
            versions,
            managers,
            tables,
            columns,
            types) => {
            let mapProductRelations = new Map();
            let mapProductLines = new Map();
            let mapDbUsers = new Map();
            let mapProducts = new Map();
            let mapModules = new Map();
            let mapVersions = new Map();
            let mapManagers = new Map();
            let mapTables = new Map();
            // let mapTablesByName = new Map();
            let mapColumns = new Map();
            let mapTypes = new Map();

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
                if (mapProducts.has(item.product_id)) {
                    mapProducts.get(item.product_id).modules.push(myKey);
                }
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
                if (mapProducts.has(item.product_id)) {
                    mapProducts.get(item.product_id).versions.push(myKey);
                }
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
                        partition_column: item.partition_column,
                        partition_type: item.partition_type,
                        columns: []
                    });
                    // mapTablesByName.set(item.table_name, {
                    //     table_id: myKey
                    // })
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

            this.gMap.productRelations = mapProductRelations;
            this.gMap.productLines = mapProductLines;
            this.gMap.dbUsers = mapDbUsers;
            this.gMap.products = mapProducts;
            this.gMap.modules = mapModules;
            this.gMap.versions = mapVersions;
            this.gMap.managers = mapManagers;
            this.gMap.tables = mapTables;
            // this.gMap.tablesByName = mapTablesByName;
            this.gMap.columns = mapColumns;
            this.gMap.types = mapTypes;

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

    doGetTablePropertyColumns(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_column", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyIndexes(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_index", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTablePropertyIndexColumns(params) {

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_index_column", params,
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

    // >>>>> 获取某字母开头的表
    doGetTablesByLetter(source, letter) {
        let myResult = [];

        if (letter === undefined) return myResult

        if (!this.gMap.tablesByLetter.has(letter)) return myResult;

        this.gMap.tablesByLetter.get(letter).tables.forEach((item) => {
            let table = this.gMap.tables.get(item);
            let nodeTable = {
                key: table.table_id,
                title: table.table_name,
                children: [],
                tag: {
                    nodeType: "table",
                },
            }

            myResult.push(nodeTable);
        });

        return myResult;
    }

    doAddTable(params) {
        this.restAddTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTable(result.data.data, "add");
                    this.dsUpdateTable(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateTable(params) {
        this.restUpdateTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTable(result.data.data, "update");
                    this.dsUpdateTable(result.data.data, "update");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doDeleteTable(params) {
        this.restDeleteTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    //todo >>>>> ui update table
    uiUpdateTable(table, what) {
        let treeDataTablesKnown = lodash.cloneDeep(this.state.treeDataTablesKnown);

        switch (what) {
            case "add":
                let uiTable = {
                    key: table.table_id,
                    title: table.table_name,
                    children: [],
                    tag: {
                        nodeType: "table"
                    }
                };
                treeDataTablesKnown.push(uiTable);

                this.setState({
                    treeDataTablesKnown: treeDataTablesKnown
                }, () => {
                    this.gCurrent.tableId = table.table_id;
                })
                break
            case "update":
                for(let i = 0; i < treeDataTablesKnown.length; i++) {
                    if (treeDataTablesKnown[i].key === table.table_id) {
                        treeDataTablesKnown[i].title = table.table_name;
                        break
                    }
                }

                this.setState({
                    treeDataTablesKnown: treeDataTablesKnown
                });
                break
            case "delete":
                break
            default:
                break
        }
    }

    //todo >>>>> ds update table
    dsUpdateTable(table, what) {
        switch (what) {
            case "add":
                table.columns = [];
                table.indexes = [];
                table.partitions = [];
                table.relations = [];
                this.gMap.tables.set(table.table_id, table);
                if (this.gMap.tablesByLetter.has(this.gCurrent.letterSelected)) {
                    this.gMap.tablesByLetter.get(this.gCurrent.letterSelected).tables.push(table.table_id);
                } else {
                    this.gMap.tablesByLetter.set(this.gCurrent.letterSelected, {tables: [table.table_id]});
                }
                break
            case "update":
                this.gMap.tables.get(table.table_id).table_name = table.table_name;
                break
            case "delete":
                break
            default:
                break
        }
    }

    doAddTableColumn(params) {
        this.restAddTableColumn(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTableColumn(result.data.data, "add");
                    this.dsUpdateTableColumn(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateTableColumn(params) {
        this.restUpdateTableColumn(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTableColumn(result.data.data, "update");
                    this.dsUpdateTableColumn(result.data.data, "update");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doDeleteTableColumn(params) {
        this.restDeleteTableColumn(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    //todo >>>>> ui update table column
    uiUpdateTableColumn(column, what) {
        let dsColumns = lodash.cloneDeep(this.state.dsColumns);

        switch (what) {
            case "add":
                column.key = column.column_id;

                dsColumns.push(lodash.cloneDeep(column));

                this.setState({
                    pageSizeColumns: dsColumns.length,
                    dsColumns: dsColumns
                })
                break
            case "update":
                for(let i = 0; i < dsColumns.length; i++) {
                    if (dsColumns[i].column_id === column.column_id) {
                        dsColumns[i].column_name = column.column_name;
                        break
                    }
                }
                this.setState({
                    dsColumns: dsColumns
                })
                break
            case "delete":
                break
            default:
                break
        }
    }

    //todo >>>>> ds update table column
    dsUpdateTableColumn(column, what) {
        switch (what) {
            case "add":
                this.gMap.columns.set(column.column_id, column);
                if (this.gMap.tables.has(column.table_id)) {
                    this.gMap.tables.get(column.table_id).columns.push(column.column_id);
                }
                break
            case "update":
                this.gMap.columns.get(column.column_id).column_name = column.column_name;
                break
            case "delete":
                break
            default:
                break
        }
    }

    doAddTableIndex(params) {
        this.restAddTableIndex(params).then((result) => {
            console.log(result);
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTableIndex(result.data.data, "add");
                    //this.dsUpdateTableIndex(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateTableIndex(params) {
        this.restUpdateTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doDeleteTableIndex(params) {
        this.restDeleteTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doAddTableIndexColumn(params) {
        this.restAddTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTable(result.data.data, "add");
                    this.dsUpdateTable(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateTableIndexColumn(params) {
        this.restUpdateTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doDeleteTableIndexColumn(params) {
        this.restDeleteTable(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // this.uiUpdateProjectKpi(result.data.data, "add");
                    // this.dsUpdateProjectKpi(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    uiUpdateTableIndex(index, what) {
        console.log(index);
        switch (what) {
            case "add":
                let dsIndexes = lodash.cloneDeep(this.state.dsIndexes);
                index.key = index.id;

                dsIndexes.push(lodash.cloneDeep(index));

                this.setState({
                    pageSizeIndexes: dsIndexes.length,
                    dsIndexes: dsIndexes
                })
                break
            case "update":
                break
            case "delete":
                break
            default:
                break
        }
    }

    dsUpdateTableIndex(table, what) {
        switch (what) {
            case "add":
                this.gMap.tables.set(table.table_id, table);
                this.gMap.tablesByLetter.get(this.gCurrent.letterSelected).tables.push(table.table_id);
                break
            case "update":
                break
            case "delete":
                break
            default:
                break
        }
    }

    uiUpdateTableIndexColumn(column, what) {
        switch (what) {
            case "add":
                let dsColumns = lodash.cloneDeep(this.state.dsColumns);
                column.key = column.column_id;

                dsColumns.push(lodash.cloneDeep(column));

                this.setState({
                    pageSizeColumns: dsColumns.length,
                    dsColumns: dsColumns
                })
                break
            case "update":
                break
            case "delete":
                break
            default:
                break
        }
    }

    dsUpdateTableIndexColumn(table, what) {
        switch (what) {
            case "add":
                this.gMap.tables.set(table.table_id, table);
                this.gMap.tablesByLetter.get(this.gCurrent.letterSelected).tables.push(table.table_id);
                break
            case "update":
                break
            case "delete":
                break
            default:
                break
        }
    }

    showProductTables() {
        this.setState({
            treeDataTablesKnown: []
        })
    }

    showModuleTables() {
        //todo::一个big bug, wow, 数据来源可能不对，需要好好查证一下！！！
        if ((this.gCurrent.productsNodeSelectedType === "module") && (this.gCurrent.dbUserId !== -1)) {
            let setLetters = new Set();
            let mapTablesByLetter = new Map();

            this.gData.tables.forEach((itemTable) => {
                let uId = itemTable.db_user_id;
                let mId = itemTable.module_id;
                if ((mId === this.gCurrent.moduleId) && (uId === this.gCurrent.dbUserId)) {
                    let tId = itemTable.table_id;
                    let firstLetter = itemTable.table_name[0].toUpperCase();

                    //itemTable.columns = [];
                    setLetters.add(firstLetter);

                    if (!mapTablesByLetter.has(firstLetter)) {
                        // mapTable.set(itemTable.table_name, {tableId: tId, columns: []});
                        // mapTablesByLetter.set(firstLetter, {tables: mapTable});
                        mapTablesByLetter.set(firstLetter, {tables: [itemTable.table_id]});
                    } else {
                        // mapTable = mapTablesByLetter.get(firstLetter).tables;
                        // mapTable.set(itemTable.table_name, {tableId: tId, columns: []});
                        mapTablesByLetter.get(firstLetter).tables.push(itemTable.table_id);
                    }

                    // this.gMap.tables.get(tId).columns.forEach((itemColumn) => {
                    //     let tcId = itemColumn;
                    //     let column = this.gMap.columns.get(tcId);
                    //     mapTable.get(itemTable.table_id).columns.push({
                    //         name: column.column_name,
                    //         type: column.data_type,
                    //         length: column.data_length
                    //     });
                    // })
                }

            });

            this.gMap.tablesByLetter = mapTablesByLetter;

            // 生成UI数据
            let letters = Array.from(setLetters).sort();
            let treeDataLettersKnown = [];
            letters.forEach((item) => {
                treeDataLettersKnown.push({
                    key: item,
                    title: item,
                    children: []
                })
            })

            let treeDataTablesKnown = this.doGetTablesByLetter("known", letters[0]);
            this.gCurrent.letterSelected = letters[0];

            this.setState({
                lettersKnownSelectedKeys: [letters[0]],
                treeDataLettersKnown: treeDataLettersKnown,
                treeDataTablesKnown: treeDataTablesKnown
            })
        }
    }

    showProductDbUsers() {
        let dbUsersSelectOptions = [{value: -1, label: "请选择产品线数据库用户"}];

        this.gData.dbUsers.forEach((item) => {
            if (item.product_line_id === this.gCurrent.productLineId) {
                let option = {
                    value: item.user_id,
                    label: item.user_name
                }
                dbUsersSelectOptions.push(option);
            }
        });

        this.setState({
            dbUserSelected: -1,
            dbUsersSelectOptions: dbUsersSelectOptions
        })

    }

    getTableId(tableName) {

        let myResult = undefined;

        for (let i = 0; i < this.gData.tables.length; i++) {
            let table = this.gData.tables[i];
            if (table.table_name === tableName) {
                myResult = table.table_id;
            }
        }

        return myResult;
    }

    //todo >>>>> on tree 表名首字母 selected
    onTreeLettersKnownSelected(selectedKeys, info) {
        if (info.selected) {
            this.gCurrent.letterSelected = selectedKeys[0];

            let tablesTreeData = this.doGetTablesByLetter("known", selectedKeys[0]);
            this.setState({
                treeDataTablesKnown: tablesTreeData
            })
        } else {
            this.gCurrent.letterSelected = undefined;
        }
    }

    //todo >>>>> on Tree 产品 selected
    onTreeProductsSelected(selectedKeys, info) {
        if (info.selected) {
            let ids = selectedKeys[0].toString().split("_");
            let nodeType = info.node.nodeType;
            this.gCurrent.productsNodeSelectedType = nodeType;

            switch (nodeType) {
                case "product_line":
                    this.gCurrent.productLineId = parseInt(ids[0]);
                    this.gCurrent.productId = undefined;
                    this.gCurrent.moduleId = undefined;

                    this.setState({
                        lettersKnownSelectedKeys: [],
                        treeDataLettersKnown: [],
                        treeDataTablesKnown: [],
                        pageSizeColumns: 0,
                        dsColumns: [],
                        pageSizeIndexes: 0,
                        dsIndexes: [],
                        pageSizePartitions: 0,
                        dsPartitions: [],
                        pageSizeRelations: 0,
                        dsRelations: [],
                        tableSql: "",
                    }, this.showProductDbUsers);

                    break
                case "product":
                    this.gCurrent.productId = parseInt(ids[1]);
                    this.gCurrent.moduleId = undefined;
                    if (this.gCurrent.productLineId === undefined) {
                        this.gCurrent.productLineId = parseInt(ids[0]);
                        this.showProductDbUsers();
                    }

                    this.setState({
                        lettersKnownSelectedKeys: [],
                        treeDataLettersKnown: [],
                        treeDataTablesKnown: [],
                        pageSizeColumns: 0,
                        dsColumns: [],
                        pageSizeIndexes: 0,
                        dsIndexes: [],
                        pageSizePartitions: 0,
                        dsPartitions: [],
                        pageSizeRelations: 0,
                        dsRelations: [],
                        tableSql: "",
                    });

                    break
                case "module":
                    this.gCurrent.moduleId = parseInt(ids[2]);
                    if (this.gCurrent.productId === undefined) {
                        this.gCurrent.productId = parseInt(ids[1]);
                    }
                    if (this.gCurrent.productLineId === undefined) {
                        this.gCurrent.productLineId = parseInt(ids[0]);
                        this.showProductDbUsers();
                    }

                    this.setState({
                        lettersKnownSelectedKeys: [],
                        treeDataLettersKnown: [],
                        treeDataTablesKnown: [],
                        pageSizeColumns: 0,
                        dsColumns: [],
                        pageSizeIndexes: 0,
                        dsIndexes: [],
                        pageSizePartitions: 0,
                        dsPartitions: [],
                        pageSizeRelations: 0,
                        dsRelations: [],
                        tableSql: "",
                    }, this.showModuleTables);

                    break
                default:
                    break
            }
        } else {
            this.gCurrent.productLineId = undefined;
            this.gCurrent.productId = undefined;
            this.gCurrent.moduleId = undefined;
            this.gCurrent.letterSelected = undefined;
            this.gCurrent.tableId = undefined;

            this.setState({
                lettersKnownSelectedKeys: [],
                treeDataLettersKnown: [],
                treeDataTablesKnown: [],
                pageSizeColumns: 0,
                dsColumns: [],
                pageSizeIndexes: 0,
                dsIndexes: [],
                pageSizePartitions: 0,
                dsPartitions: [],
                pageSizeRelations: 0,
                dsRelations: [],
                tableSql: "",
            });
        }


    };

    //todo >>>>> on Tree 表 selected
    onTreeTablesKnownSelected(selectedKeys, info) {
        // if (selectedKeys[0] === undefined) return;
        // if (info.node.tag.nodeType !== "table") return;

        if (info.selected && info.node.tag.nodeType === "table") {
            this.gCurrent.tableId = info.node.key;

            let myColumn = new TadTableColumn();
            let myIndex = new TadTableIndex();
            let myIndexColumn = new TadTableIndexColumn();
            let myPartition = new TadTablePartition();
            let myRelation = new TadTableRelation();

            let tableId = this.gCurrent.tableId;
            myColumn.table_id = tableId;
            myIndex.table_id = tableId;
            myIndexColumn.table_id = tableId;
            myPartition.table_id = tableId;
            myPartition.key = tableId;
            myPartition.partitionColumn = this.gMap.tables.get(tableId).partition_column;
            myPartition.partitionType = this.gMap.tables.get(tableId).partition_type;
            myPartition.partitionNames = [];
            myPartition.partitionHighValues = [];
            myRelation.s_table_id = this.gCurrent.tableId;

            axios.all([
                this.doGetTablePropertyColumns(myColumn),
                this.doGetTablePropertyIndexes(myIndex),
                this.doGetTablePropertyIndexColumns(myIndexColumn),
                this.doGetTablePropertyPartitions(myPartition),
                this.doGetTablePropertyRelations(myRelation)
            ]).then(axios.spread((
                columns,
                indexes,
                indexColumns,
                partitions,
                relations) => {

                let pageSizeColumns = columns.data.data.length;
                let dsColumns = [];
                let pageSizeIndexes = indexes.data.data.length;
                let dsIndexes = [];
                let dsIndexColumns = [];
                let pageSizePartitions = partitions.data.data.length;
                let dsPartitions = [];
                let pageSizeRelations = relations.data.data.length;
                let dsRelations = [];

                let table = this.gMap.tables.get(this.gCurrent.tableId);

                columns.data.data.forEach((item) => {
                    let uiObject = item;
                    uiObject.key = item.column_id;
                    dsColumns.push(uiObject);
                })

                let indexSql = "";
                if (indexes.data.data.length > 0) {
                    indexes.data.data.forEach((item) => {
                        let uiObject = item;
                        uiObject.key = item.id;
                        uiObject.columns = [];

                        indexSql += 'CREATE INDEX "' + item.index_name + '" ON "' + table.table_name + '" (\n';
                        for (let i = 0; i < indexColumns.data.data.length; i++) {
                            let indexName = indexColumns.data.data[i].index_name;
                            if (indexName === item.index_name) {
                                let columnName = indexColumns.data.data[i].column_name;
                                let descend = indexColumns.data.data[i].descend;
                                let columnPosition = indexColumns.data.data[i].column_position;
                                uiObject.columns.push({
                                    columnName: columnName,
                                    descend: descend,
                                    columnPosition: columnPosition
                                });
                                indexSql += '\t"' + columnName + '",\n';
                            }
                        }
                        dsIndexes.push(uiObject);
                        indexSql = indexSql.substr(0, indexSql.length - 2);
                        indexSql += '\n);\n\n'
                    });

                    indexColumns.data.data.forEach((item) => {
                        dsIndexColumns.push(item);
                    });
                }

                let partitionSql = "";
                if (partitions.data.data.length > 0) {
                    switch (myPartition.partition_type) {
                        case "range":
                            partitionSql += 'PARTITION BY ' + myPartition.partition_type.toUpperCase() + '(' + myPartition.partition_column + ') (\n';
                            partitions.data.data.forEach((item) => {
                                myPartition.partitionNames.push(item.partition_name);
                                myPartition.partitionHighValues.push(item.high_value);
                                partitionSql += '\tPARTITION "' + item.partition_name + '" VALUES LESS THAN (' + item.high_value + '),\n';
                            })
                            break
                        case "list":
                            break
                        case "hash":
                            break
                        default:
                            break
                    }
                    dsPartitions.push(myPartition);
                    partitionSql = partitionSql.substr(0, partitionSql.length - 2);
                    partitionSql += '\n);\n\n';
                }

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
                    tableSql: this.getTableSql(table),
                    // domTableSql: domTableSql
                })
            }));
        } else {
            this.gCurrent.tableId = undefined;

            this.setState({
                pageSizeColumns: 0,
                dsColumns: [],
                pageSizeIndexes: 0,
                dsIndexes: [],
                pageSizePartitions: 0,
                dsPartitions: [],
                pageSizeRelations: 0,
                dsRelations: [],
                tableSql: "",
            });
        }

    };

    onSelectDbUsersChanged(value, option) {

        this.gCurrent.dbUserId = value;
        if (this.gCurrent.productsNodeSelectedType === "product") {
            this.showProductTables()
        } else if (this.gCurrent.productsNodeSelectedType === "module") {
            this.showModuleTables()
        }
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

    //todo <<<<< now >>>>> on button 添加表 clicked
    onButtonAddTableClicked(e) {
        let myTable = new TadTable();

        if (this.gCurrent.letterSelected === undefined) {
            this.gCurrent.letterSelected = "T";

            let treeDataTablesKnown = this.doGetTablesByLetter("known", this.gCurrent.letterSelected);

            this.setState({
                treeDataTablesKnown: treeDataTablesKnown
            })
        }
        myTable.table_name = this.gCurrent.letterSelected + "_TABLE_NEW_" + moment().format("YYYYMMDDHHmmss");
        myTable.module_id = this.gCurrent.moduleId;
        myTable.db_user_id = this.gCurrent.dbUserId;

        this.doAddTable(myTable);
    }

    onInputTableNameChanged(e) {
        this.gDynamic.tableName = e.target.value;
    }

    onButtonTableNameEditingConfirmClicked(e) {
        let table = new TadTable();

        table.table_id = this.gCurrent.tableId;
        table.table_name = this.gDynamic.tableName;

        this.doUpdateTable(table);

        this.gDynamic.tableName = undefined;
        this.setState({
            isTableNameEditing: false
        })
    }

    onButtonTableNameEditingCancelClicked(e) {
        let treeDataTablesKnown = lodash.cloneDeep(this.state.treeDataTablesKnown);
        let title = this.gMap.tables.get(this.gCurrent.tableId).table_name;

        this.setTableTitle(treeDataTablesKnown, this.gCurrent.tableId, title);

        this.setState({
            isTableNameEditing: false,
            treeDataTablesKnown: treeDataTablesKnown
        })

    }

    onInputColumnNameChanged(e) {
        this.gDynamic.columnName = e.target.value;
    }

    onButtonColumnEditingConfirmClicked(e) {
        // let table = new TadTable();
        //
        // table.table_id = this.gCurrent.tableId;
        // table.table_name = this.gDynamic.tableName;
        //
        // this.doUpdateTable(table);
        //
        this.gDynamic.tableName = undefined;
        this.setState({
            isColumnEditing: false
        })
    }

    onButtonColumnEditingCancelClicked(e) {
        // let treeDataTablesKnown = lodash.cloneDeep(this.state.treeDataTablesKnown);
        // let title = this.gMap.tables.get(this.gCurrent.tableId).table_name;
        //
        // this.setTableTitle(treeDataTablesKnown, this.gCurrent.tableId, title);

        this.setState({
            isColumnEditing: false,
            // treeDataTablesKnown: treeDataTablesKnown
        })

    }

    setTableTitle(treeNodes, id, title) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                treeNodes[i].title = title;
                return
            }
        }
    }

    //todo <<<<< now >>>>> set table name editable
    setTableNameEditable(treeNodes, id) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                treeNodes[i].title = <div className="tableNameEditing">
                    <Input defaultValue={treeNodes[i].title} onChange={this.onInputTableNameChanged} size={"small"}/>
                    <Button onClick={this.onButtonTableNameEditingConfirmClicked} size={"small"} type={"primary"}>确认</Button>
                    <Button onClick={this.onButtonTableNameEditingCancelClicked} size={"small"} type={"primary"}>放弃</Button></div>;
                break
            }
        }
    }

    onButtonRenameTableClicked(e) {
        if (this.gCurrent.tableId !== undefined) {
            let treeDataTablesKnown = lodash.cloneDeep(this.state.treeDataTablesKnown);
            this.setTableNameEditable(treeDataTablesKnown, this.gCurrent.tableId);

            this.setState({
                isTableNameEditing: true,
                treeDataTablesKnown: treeDataTablesKnown
            })
        }

    }

    onButtonDeleteTableClicked(e) {

    }

    //todo <<<<< now >>>>> on button 添加表字段 clicked
    onButtonAddColumnClicked() {
        let myTableColumn = new TadTableColumn();
        myTableColumn.table_id = this.gCurrent.tableId;
        myTableColumn.column_name = "TABLE_COLUMN_NEW";

        this.doAddTableColumn(myTableColumn);
    }

    //todo >>>>> on Button 修改字段属性 clicked
    onButtonAlterColumnClicked() {

        this.setState({
            isColumnEditing: true,
            tableColumnEditingKey: this.gCurrent.columnId,
            isShownButtonAddIndex: "none",
            isShownButtonDeleteIndex: "none",
            isShownButtonAlterIndexConfirm: "block",
            isShownButtonAlterIndexCancel: "block",
        })
    }

    onButtonAlterColumnConfirmClicked() {
        let column = new TadTableColumn();

        column.column_id = this.gCurrent.columnId;
        column.column_name = this.gDynamic.columnName;

        this.doUpdateTableColumn(column);

        this.setState({
            isColumnEditing: false,
            tableColumnEditingKey: null,
        })
        /*
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
        */
    }

    onButtonAlterColumnCancelClicked() {

        this.setState({
            tableColumnEditingKey: null,
            isColumnEditing: false,
        })
    }

    onButtonDeleteColumnClicked() {

    }

    //todo <<<<< now >>>>> on button 添加表索引 clicked
    onButtonAddIndexClicked() {
        // let tableId = this.gCurrent.tableId;
        // let indexId = null;


        let myIndex = new TadTableIndex();
        myIndex.table_id = this.gCurrent.tableId;
        myIndex.index_name = "NEW_TABLE_INDEX";

        console.log(myIndex);
        //     {
        //     id: indexId,
        //     table_id: tableId,
        //     index_name: "新增索引",
        //     index_type: "normal",
        //     index_columns: "",
        //     index_attributes: "",
        //     index_desc: ""
        // }

        this.doAddTableIndex(myIndex);
        // axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index",
        //     myIndex,
        //     {headers: {'Content-Type': 'application/json'}}
        // ).then((response) => {
        //     let data = response.data;
        //
        //     if (data.success) {
        //         indexId = data.data.id;
        //         let uiIndex = {
        //             key: indexId,
        //             index_name: "新增索引",
        //             index_type: "normal",
        //             index_columns: "",
        //             index_attributes: "",
        //             index_desc: ""
        //         }
        //
        //         let dsIndexes = JSON.parse(JSON.stringify(this.state.dsIndexes));
        //
        //         dsIndexes.push(uiIndex);
        //         this.setState({
        //             pageSizeTableIndexes: this.state.pageSizeTableIndexes + 1,
        //             dsIndexes: dsIndexes
        //         })
        //     }
        // });
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

    onButtonAddPartitionClicked() {

        let tableId = this.gCurrent.tableId;
        let partitionId = undefined;

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

    onButtonAddRelationClicked() {
        let tableId = this.gCurrent.tableId;
        let relationId = undefined;

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

    onButtonProductsChangeComponentSizeClicked(e) {
        let styleLayout = "NNN";

        if (this.state.styleLayout === "NNN")
            styleLayout = "SNN";
        else if (this.state.styleLayout === "SNN")
            styleLayout = "NNN";
        else if (this.state.styleLayout === "SSN")
            styleLayout = "NNN";

        this.setState({
            styleLayout: styleLayout
        })
    }

    onButtonTablesChangeComponentSizeClicked(e) {
        let styleLayout = "NNN";

        if (this.state.styleLayout === "NNN")
            styleLayout = "SSN";
        else if (this.state.styleLayout === "SNN")
            styleLayout = "SSN";
        else if (this.state.styleLayout === "SSN")
            styleLayout = "SNN";

        this.setState({
            styleLayout: styleLayout
        })
    }

    onButtonAddRecordClicked() {
        let tableId = this.gCurrent.tableId;
        let indexId = undefined;

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

    onRowColumnSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.gCurrent.columnId = selectedRowKeys[0];
            console.log(this.gCurrent);
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

    getTableSql(table) {
        let strSql = "CREATE TABLE ";

        strSql += table.table_name + "(\n";

        table.columns.forEach((item) => {
            if (this.gMap.columns.has(item)) {
                let column = this.gMap.columns.get(item);
                let dataType = column.data_type === null ? "UNKNOWN" : column.data_type.toLowerCase();

                switch (dataType) {
                    case "varchar":
                    case "varchar2":
                    case "string":
                        strSql += "\t" + column.column_name + " VARCHAR(" + column.data_length + "),\n";
                        break
                    case "number":
                    case "int":
                    case "float":
                    case "double":
                        strSql += "\t" + column.column_name + " INT,\n";
                        break
                    case "date":
                    case "datetime":
                        strSql += "\t" + column.column_name + " DATETIME,\n";
                        break
                    default:
                        strSql += "\t" + column.column_name + " " + dataType + ",\n"
                        break
                }

            }
        });

        strSql += ");\n";

        return strSql;
    }

    getTableSqlHtml(table) {
        /*
                        //let tableSql = 'CREATE TABLE "' + table.table_name + '"(\n';
                //let domTableSql = [];

                //domTableSql.push(<Fragment>create table {table.table_name}(<br/></Fragment>);
                switch (item.data_type) {
                    case "varchar":
                    case "varchar2":
                        //tableSql += '\t"' + item.column_name + '" ' + item.data_type.toUpperCase() + '(' + item.data_length + '),\n';
                        //domTableSql.push(
                        //    <Fragment>{item.column_name} {item.data_type.toUpperCase()}(item.data_length),<br/></Fragment>);
                        break
                    default:
                        if (item.data_type !== null) {
                            //tableSql += '\t"' + item.column_name + '" ' + item.data_type.toUpperCase() + ',\n';
                            //domTableSql.push(<Fragment>{item.column_name} {item.data_type.toUpperCase()},<br/></Fragment>);
                        }
                        break
                }

                //tableSql = tableSql.substr(0, tableSql.length - 2);
                //tableSql += "\n);\n\n";
                //domTableSql.push(<Fragment>);<br/></Fragment>);


         */
    }

    onTabsTablePropertiesChanged(key) {
        switch (key) {
            case "tablePaneSql":
                if (this.gMap.tables.has(this.gCurrent.tableId)) {
                    let table = this.gMap.tables.get(this.gCurrent.tableId)
                    let strSql = this.getTableSql(table);

                    this.setState({
                        tableSql: strSql
                    });
                }
                break
            default:
                break
        }
    }

    //todo >>>>> render
    render() {
        const columnsColumn = [
            {
                title: <KColumnTitle content='字段名称' className={'clsColumnTitle'}/>,
                dataIndex: 'column_name',
                key: 'column_name',
                className: 'clsColumnColumnName',
                width: 200,
                render: (text, record, index) => {
                    return (
                        (this.state.tableColumnEditingKey === record.key) ? (
                            <div className="clsProjectKpiUiTitleEditor">
                                <Input defaultValue={record.column_name} onChange={this.onInputColumnNameChanged}/>
                            </div>
                        ) : (
                            <div className="clsProjectKpiUiTitle">
                                {record.column_name}
                            </div>
                        )
                    )
                }
            },
            {
                title: <KColumnTitle content='数据类型' className={'clsColumnTitle'}/>,
                dataIndex: 'data_type',
                key: 'data_type',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='数据长度' className={'clsColumnTitle'}/>,
                dataIndex: 'data_length',
                key: 'data_length',
                align: 'right',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='主键' className={'clsColumnTitle'}/>,
                dataIndex: 'primary_flag',
                key: 'primary_flag',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='可空' className={'clsColumnTitle'}/>,
                dataIndex: 'nullable_flag',
                key: 'nullable_flag',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='缺省值' className={'clsColumnTitle'}/>,
                dataIndex: 'data_default',
                key: 'data_default',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 200,
            },
            {
                title: <KColumnTitle content='分隔符' className={'clsColumnTitle'}/>,
                dataIndex: 'split_flag',
                key: 'split_flag',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='重复标识' chong className={'clsColumnTitle'}/>,
                dataIndex: 'repeat_flag',
                key: 'repeat_flag',
                align: 'center',
                className: 'clsColumnColumnName',
                width: 100,
            },
            {
                title: <KColumnTitle content='字段简述' className={'clsColumnTitle'}/>,
                dataIndex: 'column_desc',
                key: 'column_desc',
                className: 'clsColumnColumnName',
                width: 200,
            },
        ];
        const columnsIndex = [
            {
                title: <KColumnTitle content='索引名称' className={'clsColumnTitle'}/>,
                dataIndex: 'index_name',
                key: 'index_name',
                width: 300,
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
                title: <KColumnTitle content='索引类型' className={'clsColumnTitle'}/>,
                dataIndex: 'index_type',
                key: 'index_type',
                width: 100,
            },
            {
                title: <KColumnTitle content='索引字段' className={'clsColumnTitle'}/>,
                dataIndex: 'index_columns',
                key: 'index_columns',
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            {this.state.isEditingKeyIndex !== record.key && (
                                <div className={"clsIndexColumns"}>
                                    {record.columns.map((item, index) => {
                                        return <div className={"clsIndexColumn"}>
                                            <div>{item.columnName}</div>
                                            <div>({item.descend})</div>
                                        </div>
                                    })}
                                </div>
                            )}
                            {this.state.isEditingKeyIndex === record.key && (
                                <div className={"clsIndexColumns"} style={{display: this.state.isShownButtonAddIndex}}>
                                    {record.columns.map((item, index) => {
                                        return <div className={"clsIndexColumn"}>
                                            <div>{item.columnName}</div>
                                            <div>({item.descend})</div>
                                        </div>
                                    })}
                                </div>
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
        ];
        const columnsPartition = [
            {
                title: <KColumnTitle content='分区类型' className={'clsColumnTitle'}/>,
                dataIndex: 'partition_type',
                key: 'partition_type',
                width: 100,
                align: 'center',
            },
            {
                title: <KColumnTitle content='分区字段' className={'clsColumnTitle'}/>,
                dataIndex: 'partition_column',
                key: 'partition_column',
                width: 200,
                align: 'center',
            },
            {
                title: <KColumnTitle content='分区名称' className={'clsColumnTitle'}/>,
                dataIndex: 'partitionNames',
                key: 'partitionNames',
                width: 200,
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            {this.state.isEditingKeyPartition !== record.key && (
                                <div className={"clsPartitionNames"}>
                                    {record.partitionNames.map((item, index) => {
                                        return <div className={"clsPartitionName"}>
                                            <div>{item}</div>
                                        </div>
                                    })}
                                </div>
                            )}
                            {this.state.isEditingKeyPartition === record.key && (
                                <div className={"clsPartitionNames"}
                                     style={{display: this.state.isShownButtonAddPartition}}>
                                    {record.partitionNames.map((item, index) => {
                                        return <div className={"clsPartitionName"}>
                                            <div>{item}</div>
                                        </div>
                                    })}
                                </div>

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
                title: <KColumnTitle content='分区表达式' className={'clsColumnTitle'}/>,
                dataIndex: 'partitionHighValues',
                key: 'partitionHighValues',
                width: 800,
                render: (text, record, index) => {
                    return (
                        <Fragment>
                            {this.state.isEditingKeyPartition !== record.key && (
                                <div className={"clsPartitionHighValues"}>
                                    {record.partitionHighValues.map((item, index) => {
                                        return <div className={"clsPartitionHighValue"}>
                                            <div>{item}</div>
                                        </div>
                                    })}
                                </div>
                            )}
                            {this.state.isEditingKeyPartition === record.key && (
                                <div className={"clsPartitionHighValues"}
                                     style={{display: this.state.isShownButtonAddPartition}}>
                                    {record.partitionHighValues.map((item, index) => {
                                        return <div className={"clsPartitionHighValue"}>
                                            <div>{item}</div>
                                        </div>
                                    })}
                                </div>

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
                title: <KColumnTitle content='分区简述' className={'clsColumnTitle'}/>,
                dataIndex: 'partition_desc',
                key: 'partition_desc',
                width: 200,
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
        // const indexTypes = ["普通索引", "唯一索引", "位图索引"];
        // const typesPartition = [
        //     {value: "range", name: "范围分区"},
        //     {value: "hash", name: "散列分区"},
        //     {value: "list", name: "列表分区"},
        //     {value: "wow", name: "复合分区"},
        // ]

        return (
            <div className={this.state.styleLayout === "NNN" ? "DatabaseMaintain BoxNormal" : this.state.styleLayout === "SNN" ? "DatabaseMaintain BoxSmall" : this.state.styleLayout === "SSN" ? "DatabaseMaintain BoxSmallSmall" : "DatabaseMaintain BoxNormal"}>
                <div className={"BoxProductsInfo"}>
                    <div className={"BoxTitleBar"}>
                        <div className={this.state.styleLayout === "NNN" ? "BoxTitle" : "BoxTitle BoxHidden"}>产品信息：</div>
                        <Button onClick={this.onButtonProductsChangeComponentSizeClicked} icon={this.state.styleLayout === "NNN" ? <CaretLeftOutlined/> : <CaretRightOutlined/>} size={"small"} type={"ghost"}/>
                    </div>
                    <div className={this.state.styleLayout === "NNN" ? "BoxTree" : "BoxTree BoxHidden"}>
                        <Tree treeData={this.state.treeDataProducts} onSelect={this.onTreeProductsSelected} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true}/>
                    </div>
                    <div className={this.state.styleLayout === "NNN" ? "BoxDescription" : "BoxDescription BoxHidden"}>information</div>
                </div>
                <div className={"BoxKnown"}>
                    <div className={"BoxTitleBar"}>
                        <div className={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? "BoxTitle" : "BoxTitle BoxHidden"}>库表信息：</div>
                        <Button onClick={this.onButtonTablesChangeComponentSizeClicked} icon={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? <CaretLeftOutlined/> : <CaretRightOutlined/>} size={"small"} type={"ghost"}/>
                    </div>
                    <div className={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? "BoxSelect" : "BoxSelect BoxHidden"}>
                        <Select ref={this.refSelectDbUsers} onChange={this.onSelectDbUsersChanged} defaultValue={this.state.dbUserSelected} options={this.state.dbUsersSelectOptions}/>
                    </div>
                    <div className={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? "BoxToolbar" : "BoxToolbar BoxHidden"}>
                        <div className={"BoxSearch"}>
                            <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                        </div>
                        <Button onClick={this.onButtonAddTableClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>新增</Button>
                        <Button onClick={this.onButtonRenameTableClicked} disabled={this.state.isTableNameEditing} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>修改</Button>
                        {/*<Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditConfirmClicked}>确认</Button>*/}
                        {/*<Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditCancelClicked}>放弃</Button>*/}
                        <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>删除</Button>
                        {/*<Checkbox>分组显示</Checkbox>*/}
                    </div>
                    <div className={(this.state.styleLayout === "NNN") || (this.state.styleLayout === "SNN") ? "BoxTreeAndTable" : "BoxTreeAndTable BoxHidden"}>
                        <div className={"BoxList"}>
                            {this.state.treeDataLettersKnown.length ? (
                                <Tree treeData={this.state.treeDataLettersKnown} onSelect={this.onTreeLettersKnownSelected} defaultSelectedKeys={this.state.lettersKnownSelectedKeys} className={"TreeLetters"} blockNode={true} showLine={{showLeafIcon: false}} showIcon={false}/>
                            ) : (<div>&nbsp;</div>)}
                        </div>
                        <div className={"BoxTree"}>
                            <div className={"BoxTree2"}>
                                <Tree className={"TreeKnown"} treeData={this.state.treeDataTablesKnown} onSelect={this.onTreeTablesKnownSelected} selectable={!this.state.isTableNameEditing} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={true} showIcon={true}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"BoxPropertiesBorder"}>
                    <div className={"BoxProperties"}>
                        <div className={"BoxTableProperties"}>
                            <Input placeholder="请输该表用途的简单描述"/>
                            <Select/>
                            <Select/>
                        </div>
                        <div className={"BoxOtherProperties"}>
                            <Tabs defaultActiveKey="tablePaneColumns" type="card" tabBarGutter={5} animated={false} onChange={this.onTabsTablePropertiesChanged}>
                                <TabPane tab="表字段" key="tablePaneColumns">
                                    <div className={"BoxTableColumnProperties"}>
                                        <div className={"BoxToolbar"}>
                                            <div className={"BoxLabel"}>&nbsp;</div>
                                            <Button onClick={this.onButtonAddColumnClicked} disabled={this.state.isColumnEditing} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>新增</Button>
                                            <Button onClick={this.onButtonAlterColumnClicked} disabled={this.state.isColumnEditing} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>修改</Button>
                                            <Button onClick={this.onButtonAlterColumnConfirmClicked} disabled={!this.state.isColumnEditing} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>确认</Button>
                                            <Button onClick={this.onButtonAlterColumnCancelClicked} disabled={!this.state.isColumnEditing} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>放弃</Button>
                                            <Button onClick={this.onButtonDeleteColumnClicked} disabled={this.state.isColumnEditing} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>删除</Button>
                                        </div>
                                        <div ref={this.refBoxDetail} className={"BoxDetail"}>
                                            <Table
                                                dataSource={this.state.dsColumns}
                                                columns={columnsColumn}
                                                scroll={{
                                                    x: this.state.tablePropertiesScrollX,
                                                    y: this.state.tablePropertiesScrollY
                                                }}
                                                bordered={true}
                                                size={"small"}
                                                pagination={{
                                                    pageSize: this.state.pageSizeColumns,
                                                    position: ["none", "none"]
                                                }}
                                                rowSelection={(this.state.tableColumnEditingKey === null) && {type: "radio", ...this.onRowColumnSelected}}
                                                // rowSelection={{
                                                //     type: "radio",
                                                //     ...this.onRowColumnSelected
                                                // }}
                                            />
                                        </div>
                                    </div>
                                </TabPane>
                                <TabPane tab="表索引" key="tablePaneIndexes">
                                    <div className={"BoxTableIndexProperties"}>
                                        <div className={"BoxToolbar"}>
                                            <div className={"BoxLabel"}>&nbsp;</div>
                                            <Button onClick={this.onButtonAddIndexClicked} style={{display: this.state.isShownButtonAddIndex}} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>新增</Button>
                                            <Button onClick={this.onButtonAlterIndexClicked} disabled={this.state.isShownButtonAlterIndexConfirm === "block"} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>修改</Button>
                                            <Button onClick={this.onButtonDeleteIndexClicked} style={{display: this.state.isShownButtonDeleteIndex}} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>删除</Button>
                                            <Button onClick={this.onButtonAlterIndexConfirmClicked} style={{display: this.state.isShownButtonAlterIndexConfirm}} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>确认</Button>
                                            <Button onClick={this.onButtonAlterIndexCancelClicked} style={{display: this.state.isShownButtonAlterIndexCancel}} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>放弃</Button>
                                        </div>
                                        <div className={"BoxDetail"}>
                                            <Table
                                                dataSource={this.state.dsIndexes}
                                                columns={columnsIndex}
                                                scroll={{y: this.state.tablePropertiesScrollY}}
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
                                <TabPane tab="表分区" key="tablePanePartitions">
                                    <div className={"BoxTablePartitionProperties"}>
                                        <div className={"BoxToolbar"}>
                                            <div className={"BoxLabel"}>&nbsp;</div>
                                            <Button
                                                onClick={this.onButtonAddPartitionClicked}
                                                style={{display: this.state.isShownButtonAddPartition}}>新增</Button>
                                            <Button
                                                onClick={this.onButtonAlterPartitionClicked}
                                                disabled={this.state.isShownButtonAlterPartitionConfirm === "block"}>修改</Button>
                                            <Button
                                                onClick={this.onButtonDeletePartitionClicked}
                                                style={{display: this.state.isShownButtonDeletePartition}}>删除</Button>
                                            <Button
                                                onClick={this.onButtonAlterPartitionConfirmClicked}
                                                style={{display: this.state.isShownButtonAlterPartitionConfirm}}>确认</Button>
                                            <Button
                                                onClick={this.onButtonAlterPartitionCancelClicked}
                                                style={{display: this.state.isShownButtonAlterPartitionCancel}}>放弃</Button>
                                        </div>
                                        <div className={"BoxDetail"}>
                                            <Table
                                                dataSource={this.state.dsPartitions}
                                                columns={columnsPartition}
                                                scroll={{x: 1920, y: this.state.tablePropertiesScrollY}}
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
                                <TabPane tab="表关联" key="tablePaneRelations">
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
                                <TabPane tab="表数据" key="tablePaneData">
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
                                <TabPane tab="表SQL" key="tablePaneSql">
                                    <div className={"BoxTableSqlProperties"}>
                                        <div className={"BoxDetail"}>
                                            <pre>{this.state.tableSql}</pre>
                                            {/*<div>*/}
                                            {/*    {this.state.domTableSql.map((item, index) => {*/}
                                            {/*        return item*/}
                                            {/*    })}*/}
                                            {/*</div>*/}
                                        </div>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
