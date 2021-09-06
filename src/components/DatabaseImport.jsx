import React from 'react'
import './DatabaseImport.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import {Button, Select, Table, Tree, Tabs, Input} from 'antd'
import {
    CaretDownOutlined,
    DeleteOutlined,
    LeftOutlined,
    RightOutlined,
    CheckOutlined
} from '@ant-design/icons'
import TadTable from '../entity/TadTable'
import TadTableColumn from '../entity/TadTableColumn'
import TadTableIgnore from '../entity/TadTableIgnore'
import TadTablePartition from "../entity/TadTablePartition";
import TadTableIndex from "../entity/TadTableIndex";
import TadTableIndexColumn from "../entity/TadTableIndexColumn";

const {TabPane} = Tabs;

export default class DatabaseImport extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {
        /*
        columns
             key: 804
             value:
             column_desc: null
             column_id: 804
             column_name: "column_desc"
             column_type_id: null
             data_default: null
             data_length: 256
             data_type: "varchar"
             nullable_flag: null
             primary_flag: null
             repeat_flag: null
             split_flag: null
             table_id: 52
        connections
             key: 3
             value:
             connection_id: 3
             connection_name: "dev oracle"
             db_host: "10.10.1.170"
             db_password: "nrmoptr"
             db_port: "1521"
             db_sid: "wnms"
             db_type: "oracle"
             db_username: "nrmdb"
        dbUsers

        managers
        modules
        productLines
        productRelations
        products
        tableIndexes
        tablePartitions
        tables 所有已归档的表
             key: 53
             value:
             columns: (9) [816, 817, 818, 819, 820, 821, 822, 823, 824]
             db_user_id: 1
             module_id: 3
             table_desc: null
             table_id: 53
             table_label_id: null
             table_name: "tad_publish_table_column"
             table_type_id: null
        tablesKnownByLetter 当前所选择模块及用户所包含的表
            key: "t"
            value:
            tables: Map(20)
                key: "tad_publish_table_column"
                value:
                columns: Array(9)
                    length: null
                    name: "column_id"
                    type: "int"
        tablesArchivedByLetter
        tablesUnknownByLetter 所有未归档的表
        tablesByName 所有已归档的表
             key: "tad_publish_table_column"
             value:
             table_id: 53
        tablesIgnoredByLetter
        tablesIgnoredByName
        tablesKnowByLetter
        types
        versions
        */
    };
    gData = {
        /*
        columns
        connections
        dbUsers
        managers
        modules
        productLines
        productRelations
        products
        tables 所有已归档表
            create_time: null
            create_user_id: null
            db_user_id: 1
            modify_time: null
            modify_user_id: null
            module_id: 3
            partition_column: null
            partition_type: null
            table_desc: null
            table_id: 53
            table_label_id: null
            table_name: "tad_publish_table_column"
            table_type_id: null
        tablesIgnored
        types
        versions
         */
    };
    gCurrent = {
        productLineId: undefined,
        productId: undefined,
        moduleId: undefined,
        dbUserId: undefined,
        productsNodeSelectedId: undefined,
        productsNodeSelectedType: undefined, // product_line product module
        tablesKnownSelected: [],
        tablesUnknownSelected: [],
        tablesArchivedSelected: [],
        tablesIgnoredSelected: [],
        letterKnownSelected: undefined,
        letterUnknownSelected: undefined,
        letterArchivedSelected: undefined,
        letterIgnoredSelected: undefined,
    };
    gRef = {
        selectDbUsers: React.createRef(),
        treeTablesKnown: React.createRef(),
        treeTablesUnknown: React.createRef(),
        treeTablesArchived: React.createRef(),
        treeTablesIgnored: React.createRef(),
    };
    //
    timerUnknown = undefined;
    timerKnown = undefined;
    gSpliterTableColumn = "SPLITER_TC"

    constructor(props) {
        super(props);

        // this.refTree = React.createRef();
        // this.gRef.set("tree", this.refTree);

        this.state = {
            productsTreeData: [],
            lettersKnownSelectedKeys: [],
            treeDataLettersKnown: [],
            treeDataTablesKnown: [],
            treeDataTablesUnknown: [],
            lettersUnknownSelectedKeys: [],
            lettersUnknownTreeData: [],
            lettersArchivedSelectedKeys: [],
            lettersArchivedTreeData: [],
            tablesArchivedTreeData: [],
            lettersIgnoredSelectedKeys: [],
            lettersIgnoredTreeData: [],
            tablesIgnoredTreeData: [],

            dbUsersSelectOptions: [{value: -1, label: "请选择产品线数据库用户"}],
            connectionsSelectOptions: [{value: -1, label: "请选择来源数据库"}],
            dbUsersSelected: -1,
            connectionsSelected: -1,

            showKnownTable: false,
            showUnknownTable: false,
            uiTableKnownDisplay: "none",
            uiTableUnknownDisplay: "none",
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
        this.doGetTablesIgnore = this.doGetTablesIgnore.bind(this);

        this.doGetSchemas = this.doGetSchemas.bind(this);
        this.uiGetTablesByLetter = this.uiGetTablesByLetter.bind(this);

        this.dsAddTablesByLetter = this.dsAddTablesByLetter.bind(this);
        this.dsDeleteTablesByLetter = this.dsDeleteTablesByLetter.bind(this);

        this.showProductDbUsers = this.showProductDbUsers.bind(this);
        this.showProductTables = this.showProductTables.bind(this);
        this.showModuleTables = this.showModuleTables.bind(this);
        this.uiAddTablesByLetter = this.uiAddTablesByLetter.bind(this);
        this.uiDeleteTablesByLetter = this.uiDeleteTablesByLetter.bind(this);

        this.getTableId = this.getTableId.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);
        this.onTreeProductsExpanded = this.onTreeProductsExpanded.bind(this);
        this.onTreeLettersKnownSelected = this.onTreeLettersKnownSelected.bind(this);
        this.onTreeLettersUnknownSelected = this.onTreeLettersUnknownSelected.bind(this);
        this.onTreeLettersArchivedSelected = this.onTreeLettersArchivedSelected.bind(this);
        this.onTreeLettersIgnoredSelected = this.onTreeLettersIgnoredSelected.bind(this);
        this.onTreeTablesKnownChecked = this.onTreeTablesKnownChecked.bind(this);
        this.onTreeTablesUnknownChecked = this.onTreeTablesUnknownChecked.bind(this);
        this.onTreeTablesArchivedChecked = this.onTreeTablesArchivedChecked.bind(this);
        this.onTreeTablesIgnoredChecked = this.onTreeTablesIgnoredChecked.bind(this);

        this.onSelectDbUsersChanged = this.onSelectDbUsersChanged.bind(this);
        this.onSelectConnectionsChanged = this.onSelectConnectionsChanged.bind(this);
        this.onCheckboxKnownTableDisplayChanged = this.onCheckboxKnownTableDisplayChanged.bind(this);
        this.onCheckboxUnknownTableDisplayChanged = this.onCheckboxUnknownTableDisplayChanged.bind(this);


        this.onButtonIsTempClicked = this.onButtonIsTempClicked.bind(this);
        this.onButtonIsNotTempClicked = this.onButtonIsNotTempClicked.bind(this);
        this.onButtonInClicked = this.onButtonInClicked.bind(this);
        this.onButtonOutClicked = this.onButtonOutClicked.bind(this);
    }

    test() {

    }

    componentDidMount() {
        this.doNewGetAll();
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
                if (this.gMap.products.has(item)) {
                    this.gMap.products.get(item).modules.forEach(item => {
                        let mId = item;
                        let nodeModule = {
                            key: plId + "_" + pId + "_" + mId,
                            title: this.gMap.modules.get(mId).module_name,
                            children: [],
                            nodeType: "module"
                        }
                        nodeProduct.children.push(nodeModule);
                    });
                }
            })
        });

        this.gUi.treeProductsData = dataTreeProducts;

        let connectionsSelectOptions = [{value: -1, label: "请选择来源数据库"}];
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
            this.doGetTablesIgnore(),
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
            types,
            connections,
            tablesIgnored) => {
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
            let mapTablesIgnoredByName = new Map();

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
            this.gData.tablesIgnored = tablesIgnored.data.data;

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

            tablesIgnored.data.data.forEach((item) => {
                let myKey = item.table_name;
                if (!mapTablesIgnoredByName.has(myKey)) {
                    mapTablesIgnoredByName.set(myKey, {
                        table_name: myKey,
                        desc: item.desc
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
            this.gMap.tablesIgnoredByName = mapTablesIgnoredByName;

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

    doGetSchemas(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_connection", params,
            {headers: {'Content-Type': 'application/json'}}).then((response) => {
        });
    }

    //todo >>>>> ui update 已导入表 by table first letter
    uiGetTablesByLetter(source, letter) {
        let myResult = [];

        if (letter === undefined) return myResult

        let tables;
        switch (source) {
            case "known":
                tables = this.gMap.tablesKnownByLetter;
                break
            case "unknown":
                tables = this.gMap.tablesUnknownByLetter;
                break
            case "archived":
                tables = this.gMap.tablesArchivedByLetter;
                break
            case "ignored":
                tables = this.gMap.tablesIgnoredByLetter;
                break
            default:
                break
        }

        if (!tables.has(letter)) return myResult;

        tables.get(letter).tables.forEach((value, key) => {
            let tableName = key;

            let nodeTable = {
                key: tableName,
                title: tableName,
                children: [],
                tag: {
                    nodeType: "table",
                    tableId: value.tableId,
                },
            }

            value.columns.forEach((item) => {
                let nodeColumn = {
                    key: tableName + this.gSpliterTableColumn + item.name,
                    title: item.name + " : " + item.type,
                    children: [],
                    tag: {
                        nodeType: "table_column",
                        dataType: item.type,
                        dataLength: item.length
                    },
                }
                nodeTable.children.push(nodeColumn);
            })
            myResult.push(nodeTable);
        });

        return myResult;
    }

    //todo >>>>> ui update 已导入表 by table name
    uiGetTableByName(source, name) {
        let myResult;
        let letter = name[0].toUpperCase();
        let tables;

        switch (source) {
            case "known":
                if (this.gCurrent.letterKnownSelected !== letter) return myResult;
                tables = this.gMap.tablesKnownByLetter;
                break
            case "unknown":
                if (this.gCurrent.letterUnknownSelected !== letter) return myResult;
                tables = this.gMap.tablesUnknownByLetter;
                break
            case "archived":
                if (this.gCurrent.letterArchivedSelected !== letter) return myResult;
                tables = this.gMap.tablesArchivedByLetter;
                break
            case "ignored":
                if (this.gCurrent.letterIgnoredSelected !== letter) return myResult;
                tables = this.gMap.tablesIgnoredByLetter;
                break
            default:
                break
        }

        if (!tables.has(letter)) return myResult;

        tables.get(letter).tables.forEach((value, key) => {

            let tableName = key;

            console.log(tableName, name);
            if (tableName === name) {

                let nodeTable = {
                    key: tableName,
                    title: tableName,
                    children: [],
                    tag: {
                        nodeType: "table",
                        tableId: value.tableId,
                    },
                }

                value.columns.forEach((item) => {
                    let nodeColumn = {
                        key: tableName + this.gSpliterTableColumn + item.name,
                        title: item.name + " : " + item.type,
                        children: [],
                        tag: {
                            nodeType: "table_column",
                            dataType: item.type,
                            dataLength: item.length
                        },
                    }
                    nodeTable.children.push(nodeColumn);
                })
                myResult = nodeTable;
            }
        });

        return myResult;
    }

    doGetTablesIgnore() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_ignores", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    //todo >>>>> ds add gMap.tablesByLetter
    dsAddTablesByLetter(source, tableName) {
        if (tableName === undefined) return

        let tables;
        switch (source) {
            case "known":
                tables = this.gMap.tablesKnownByLetter;
                break
            case "unknown":
                tables = this.gMap.tablesUnknownByLetter;
                break
            case "archived":
                tables = this.gMap.tablesArchivedByLetter;
                break
            case "ignored":
                tables = this.gMap.tablesIgnoredByLetter;
                break
            default:
                break
        }

        if (tables === undefined) return

        let letter = tableName[0].toUpperCase();
        if (tables.has(letter)) {
            if (!tables.get(letter).tables.has(tableName)) {
                tables.get(letter).tables.set(tableName, {columns: []})
            }
        } else {
            let mapTables = new Map();
            mapTables.set(tableName, {columns: []});
            tables.set(letter, {tables: mapTables});
        }

        if (this.gMap.tablesUnknownByLetter.has(letter)) {
            if (this.gMap.tablesUnknownByLetter.get(letter).tables.has(tableName)) {
                let columns = this.gMap.tablesUnknownByLetter.get(letter).tables.get(tableName).columns;
                columns.forEach((item) => {
                    tables.get(letter).tables.get(tableName).columns.push({
                        name: item.name,
                        type: item.type,
                        length: item.length
                    });
                })
            }
        }
    }

    //todo <<<<< now >>>>> ds delete gMap.tablesByLetter
    dsDeleteTablesByLetter(source, tableName) {

        console.log(this.gMap);
        let myResult = false;

        if (tableName === undefined) return myResult

        let tables;
        switch (source) {
            case "known":
                tables = this.gMap.tablesKnownByLetter;
                break
            case "unknown":
                tables = this.gMap.tablesUnknownByLetter;
                break
            case "archived":
                tables = this.gMap.tablesArchivedByLetter;
                break
            case "ignored":
                tables = this.gMap.tablesIgnoredByLetter;
                break
            default:
                break
        }

        let letter = tableName[0].toUpperCase();
        if (tables.has(letter)) {
            tables.get(letter).tables.delete(tableName);
            if (tables.get(letter).tables.size <= 0) {
                tables.delete(letter);
            }
        }

        return myResult;
    }

    // ****************************************************************************************************
    // show or hide...
    // ****************************************************************************************************

    // 获取当前产品线-产品-模块-用户，所归属的库表
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
                    setLetters.add(firstLetter);

                    let mapTable = new Map();
                    if (!mapTablesByLetter.has(firstLetter)) {
                        mapTable.set(itemTable.table_name, {tableId: tId, columns: []});
                        mapTablesByLetter.set(firstLetter, {tables: mapTable});
                    } else {
                        mapTable = mapTablesByLetter.get(firstLetter).tables;
                        mapTable.set(itemTable.table_name, {tableId: tId, columns: []});
                    }
                    this.gMap.tables.get(tId).columns.forEach((itemColumn) => {
                        let tcId = itemColumn;
                        let column = this.gMap.columns.get(tcId);
                        mapTable.get(itemTable.table_name).columns.push({
                            name: column.column_name,
                            type: column.data_type,
                            length: column.data_length
                        });
                    })
                }

            });

            this.gMap.tablesKnownByLetter = mapTablesByLetter;

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

            let treeDataTablesKnown = this.uiGetTablesByLetter("known", letters[0]);
            this.gCurrent.letterKnownSelected = letters[0];

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
            dbUsersSelected: -1,
            dbUsersSelectOptions: dbUsersSelectOptions
        })

    }

    showProductTables() {
        this.setState({
            treeDataTablesKnown: []
        })
    }

    //todo <<<<< now >>>>> ui add letter and table
    uiAddTablesByLetter(source, tableNames) {
        if (tableNames.length <= 0) return

        let letterSelected;
        let treeDataTables;
        let treeDataLetters;

        switch (source) {
            case "known":
                letterSelected = this.gCurrent.letterKnownSelected;
                treeDataTables = lodash.cloneDeep(this.state.treeDataTablesKnown);
                treeDataLetters = lodash.cloneDeep(this.state.treeDataLettersKnown);

                for (let i = 0; i < tableNames.length; i++) {
                    let isLetterFound = false;
                    let firstLetter = tableNames[i][0].toUpperCase();
                    treeDataLetters.forEach((item) => {
                        console.log(item.key,firstLetter);
                        if (item.key === firstLetter) {
                            isLetterFound = true;
                        }
                    });

                    if (!isLetterFound) {
                        let uiLetter = {
                            key: firstLetter,
                            title: firstLetter,
                            children: []
                        }
                        treeDataLetters.push(uiLetter);
                    }

                    let nodeTable = this.uiGetTableByName("known", tableNames[i]);
                    if (nodeTable !== undefined) treeDataTables.push(nodeTable);
                }

                this.setState({
                    treeDataLettersKnown: treeDataLetters,
                    treeDataTablesKnown: treeDataTables
                });

                break
            case "unknown":
                letterSelected = this.gCurrent.letterUnknownSelected;
                treeDataTables = lodash.cloneDeep(this.state.treeDataTablesUnknown);
                for (let i = 0; i < tableNames.length; i++) {
                    let tableName = tableNames[i];
                    let letter = tableName[0].toUpperCase();
                    if (letter !== letterSelected) continue

                    let nodeTable = {
                        key: tableName,
                        title: tableName,
                        children: []
                    }
                    treeDataTables.push(nodeTable);
                }
                this.setState({
                    treeDataTablesUnknown: treeDataTables
                })
                break
            case "archived":
                letterSelected = this.gCurrent.letterArchivedSelected;
                treeDataTables = lodash.cloneDeep(this.state.tablesArchivedTreeData);
                for (let i = 0; i < tableNames.length; i++) {
                    let tableName = tableNames[i];
                    let letter = tableName[0].toUpperCase();
                    if (letter !== letterSelected) continue

                    let nodeTable = {
                        key: tableName,
                        title: tableName,
                        children: []
                    }
                    treeDataTables.push(nodeTable);
                }
                this.setState({
                    tablesArchivedTreeData: treeDataTables
                })
                break
            case "ignored":
                letterSelected = this.gCurrent.letterIgnoredSelected;
                treeDataTables = lodash.cloneDeep(this.state.tablesIgnoredTreeData);
                for (let i = 0; i < tableNames.length; i++) {
                    let tableName = tableNames[i];
                    let letter = tableName[0].toUpperCase();
                    if (letter !== letterSelected) continue

                    let nodeTable = {
                        key: tableName,
                        title: tableName,
                        children: []
                    }
                    treeDataTables.push(nodeTable);
                }
                this.setState({
                    tablesIgnoredTreeData: treeDataTables
                })
                break
            default:
                break
        }

        // for (let i = 0; i < tableNames.length; i++) {
        //     let tableName = tableNames[i];
        //     let letter = tableName[0].toUpperCase();
        //     if (letter !== letterSelected) continue
        //
        //     let nodeTable = {
        //         key: tableName,
        //         title: tableName,
        //         children: []
        //     }
        //     treeDataTables.push(nodeTable);
        // }

        switch (source) {
            case "known":
                // this.setState({
                //     treeDataTablesKnown: treeDataTables
                // })

                break
            case "unknown":
                // this.setState({
                //     treeDataTablesUnknown: treeDataTables
                // })

                break
            case "archived":
                // this.setState({
                //     tablesArchivedTreeData: treeDataTables
                // })

                break
            case "ignored":
                // this.setState({
                //     tablesIgnoredTreeData: treeDataTables
                // })

                break
            default:
                break
        }
    }

    //todo >>>>> ui delete letter and table
    uiDeleteTablesByLetter(source, tableNames) {
        if (tableNames.length <= 0) return

        let letterSelected;
        let treeDataTables;

        switch (source) {
            case "known":
                letterSelected = this.gCurrent.letterKnownSelected;
                treeDataTables = lodash.cloneDeep(this.state.treeDataTablesKnown);
                break
            case "unknown":
                letterSelected = this.gCurrent.letterUnknownSelected;
                treeDataTables = lodash.cloneDeep(this.state.treeDataTablesUnknown);
                break
            case "archived":
                letterSelected = this.gCurrent.letterArchivedSelected;
                treeDataTables = lodash.cloneDeep(this.state.tablesArchivedTreeData);
                break
            case "ignored":
                letterSelected = this.gCurrent.letterIgnoredSelected;
                treeDataTables = lodash.cloneDeep(this.state.tablesIgnoredTreeData);
                break
            default:
                break
        }

        for (let i = 0; i < tableNames.length; i++) {
            let tableName = tableNames[i];
            let letter = tableName[0].toUpperCase();
            if (letter !== letterSelected) continue

            treeDataTables.forEach((item, index) => {
                console.log(item.key, tableName);
                if (item.key === tableName) {
                    treeDataTables.splice(index, 1);
                }
            })
        }

        switch (source) {
            case "known":
                this.gRef.treeTablesKnown.current.state.checkedKeys = [];
                this.gRef.treeTablesKnown.current.state.selectedKeys = [];
                this.setState({
                    treeDataTablesKnown: treeDataTables
                });

                break
            case "unknown":
                this.gRef.treeTablesUnknown.current.state.checkedKeys = [];
                this.gRef.treeTablesUnknown.current.state.selectedKeys = [];
                this.setState({
                    treeDataTablesUnknown: treeDataTables
                });

                break
            case "archived":
                this.gRef.treeTablesArchived.current.state.checkedKeys = [];
                this.gRef.treeTablesArchived.current.state.selectedKeys = [];
                this.setState({
                    tablesArchivedTreeData: treeDataTables
                });

                break
            case "ignored":
                this.gRef.treeTablesIgnored.current.state.checkedKeys = [];
                this.gRef.treeTablesIgnored.current.state.selectedKeys = [];
                this.setState({
                    tablesIgnoredTreeData: treeDataTables
                });

                break
            default:
                break
        }
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

    //todo <<<<< now >>>>> 选择目标数据源，并获取目标数据库结构信息
    onSelectConnectionsChanged(value, option) {

        this.gCurrent.connectionId = value;
        let connection = this.gMap.connections.get(value);

        // if (connection.db_type === "oracle") {

            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_schemas", connection,
                {headers: {'Content-Type': 'application/json'}}).then((response) => {

                let mapTablesByLetter = new Map();
                let setLetters = new Set();
                let mapTablesArchivedByLetter = new Map();
                let setLettersArchived = new Set();
                let mapTablesIgnoredByLetter = new Map();
                let setLettersIgnored = new Set();
                let data = response.data.data[0].data;
                let dataIndex = response.data.data[1].data;
                let dataPartition = response.data.data[2].data;
                let lettersUnknown;
                let lettersArchived;
                let lettersIgnored;
                console.log(dataIndex, dataPartition);

                for (let i = 0; i < data.rows.length; i++) {
                    let item = data.rows[i];
                    let tableName = item[0].toLowerCase();
                    let columnName = item[1].toLowerCase();
                    let dataType = item[2].toLowerCase();
                    let dataLength = item[3];

                    if (tableName.startsWith("temp_") || tableName.endsWith("$")) continue
                    if (this.gMap.tablesIgnoredByName.has(tableName)) {
                        let firstLetter = tableName[0].toUpperCase();
                        setLettersIgnored.add(firstLetter);
                        if (!mapTablesIgnoredByLetter.has(firstLetter)) {
                            let mapTables = new Map();
                            mapTables.set(tableName, {columns: [{name: columnName, type: dataType, length: dataLength}]});
                            mapTablesIgnoredByLetter.set(firstLetter, {tables: mapTables});
                        } else {
                            if (!mapTablesIgnoredByLetter.get(firstLetter).tables.has(tableName)) {
                                mapTablesIgnoredByLetter.get(firstLetter).tables.set(tableName, {
                                    columns: [{
                                        name: columnName,
                                        type: dataType,
                                        length: dataLength
                                    }]
                                });
                            } else {
                                mapTablesIgnoredByLetter.get(firstLetter).tables.get(tableName).columns.push({
                                    name: columnName,
                                    type: dataType,
                                    length: dataLength
                                });
                            }
                        }
                        continue
                    }
                    if (this.gMap.tablesByName.has(tableName)) {
                        let firstLetter = tableName[0].toUpperCase();
                        setLettersArchived.add(firstLetter);
                        if (!mapTablesArchivedByLetter.has(firstLetter)) {
                            let mapTables = new Map();
                            mapTables.set(tableName, {columns: [{name: columnName, type: dataType, length: dataLength}]});
                            mapTablesArchivedByLetter.set(firstLetter, {tables: mapTables});
                        } else {
                            if (!mapTablesArchivedByLetter.get(firstLetter).tables.has(tableName)) {
                                mapTablesArchivedByLetter.get(firstLetter).tables.set(tableName, {
                                    columns: [{
                                        name: columnName,
                                        type: dataType,
                                        length: dataLength
                                    }]
                                });
                            } else {
                                mapTablesArchivedByLetter.get(firstLetter).tables.get(tableName).columns.push({
                                    name: columnName,
                                    type: dataType,
                                    length: dataLength
                                });
                            }
                        }
                        continue
                    }

                    let firstLetter = tableName[0].toUpperCase();
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
                this.gMap.tablesUnknownByLetter = mapTablesByLetter;
                this.gMap.tablesArchivedByLetter = mapTablesArchivedByLetter;
                this.gMap.tablesIgnoredByLetter = mapTablesIgnoredByLetter;

                // 生成UI数据
                lettersUnknown = Array.from(setLetters).sort();
                let lettersUnknownTreeData = [];
                lettersUnknown.forEach((item) => {
                    lettersUnknownTreeData.push({
                        key: item,
                        title: item,
                        children: []
                    })
                })

                let treeDataTablesUnknown = this.uiGetTablesByLetter("unknown", lettersUnknown[0]);
                this.gCurrent.letterUnknownSelected = lettersUnknown[0];

                lettersArchived = Array.from(setLettersArchived);
                let lettersArchivedTreeData = [];
                lettersArchived.forEach((item) => {
                    lettersArchivedTreeData.push({
                        key: item,
                        title: item,
                        children: []
                    })
                })

                let tablesArchivedTreeData = this.uiGetTablesByLetter("archived", lettersArchived[0]);
                this.gCurrent.letterArchivedSelected = lettersArchived[0];

                lettersIgnored = Array.from(setLettersIgnored);
                let lettersIgnoredTreeData = [];
                lettersIgnored.forEach((item) => {
                    lettersIgnoredTreeData.push({
                        key: item,
                        title: item,
                        children: []
                    })
                })

                let tablesIgnoredTreeData = this.uiGetTablesByLetter("ignored", lettersIgnored[0]);
                this.gCurrent.letterIgnoredSelected = lettersIgnored[0];

                if (connection.db_type === "oracle") {
                    // index information
                    let mapTableIndexes = new Map();
                    for (let i = 0; i < dataIndex.rows.length; i++) {
                        let item = dataIndex.rows[i];
                        let tableName = item[0] ? item[0].toLowerCase() : item[0]; //0: {name: "TABLE_NAME"}
                        let indexName = item[1]; //1: {name: "INDEX_NAME"}
                        let indexType = item[2] ? item[2].toLowerCase() : item[2]; //2: {name: "INDEX_TYPE"}
                        let uniqueness = item[3] ? item[3].toLowerCase() : item[3]; //3: {name: "UNIQUENESS"}
                        let columnName = item[4] ? item[4].toLowerCase() : item[4]; //4: {name: "COLUMN_NAME"}
                        let columnPosition = item[5]; //5: {name: "COLUMN_POSITION"}
                        let descend = item[6] ? item[6].toLowerCase() : item[6]; //6: {name: "DESCEND"}
                        if (!mapTableIndexes.has(tableName)) {
                            let mapIndex = new Map();
                            mapIndex.set(indexName, {
                                indexType: indexType, uniqueness: uniqueness, columns: [{
                                    indexName: indexName,
                                    columnName: columnName,
                                    columnPosition: columnPosition,
                                    descend: descend
                                }]
                            });
                            mapTableIndexes.set(tableName, mapIndex);
                        } else {
                            if (!mapTableIndexes.get(tableName).has(indexName)) {
                                mapTableIndexes.get(tableName).set(indexName, {
                                    indexType: indexType, uniqueness: uniqueness, columns: [{
                                        indexName: indexName,
                                        columnName: columnName,
                                        columnPosition: columnPosition,
                                        descend: descend
                                    }]
                                })
                            } else {
                                mapTableIndexes.get(tableName).get(indexName).columns.push({
                                    indexName: indexName,
                                    columnName: columnName,
                                    columnPosition: columnPosition,
                                    descend: descend
                                })
                            }
                        }
                    }
                    this.gMap.tableIndexes = mapTableIndexes;
                    console.log(mapTableIndexes);

                    // partition information
                    let mapTablePartitions = new Map();
                    for (let i = 0; i < dataPartition.rows.length; i++) {
                        let item = dataPartition.rows[i];
                        let tableName = item[0] ? item[0].toLowerCase() : item[0]; //0: {name: "TABLE_NAME"}
                        let partitionType = item[1] ? item[1].toLowerCase() : item[1]; //1: {name: "PARTITION_TYPE"}
                        let partitionName = item[2]; //2: {name: "PARTITION_NAME"}
                        let highValue = item[3] ? item[3].toLowerCase() : item[3]; //3: {name: "HIGH_VALUE"}
                        let partitionPosition = item[4]; //4: {name: "PARTITION_POSITION"}
                        let columnName = item[5] ? item[5].toLowerCase() : item[5]; //5: {name: "COLUMN_NAME"}

                        if (!mapTablePartitions.has(tableName)) {
                            mapTablePartitions.set(tableName, {
                                partitionType: partitionType, columnName: columnName, partitions: [{
                                    partitionName: partitionName, highValue: highValue, partitionPosition: partitionPosition
                                }]
                            });
                        } else {
                            mapTablePartitions.get(tableName).partitions.push({
                                partitionName: partitionName, highValue: highValue, partitionPosition: partitionPosition
                            })
                        }
                    }
                    this.gMap.tablePartitions = mapTablePartitions;
                } else if (connection.db_type === "mysql") {
                    // 索引信息
                    // 目前rest服务返回内容有问题，需要修正
                    this.gMap.tableIndexes = new Map();
                    // 分区信息
                    // 目前rest服务返回内容有问题，需要修正
                    this.gMap.tablePartitions = new Map();
                }

                this.setState({
                    lettersUnknownSelectedKeys: [],
                    lettersUnknownTreeData: [],
                    treeDataTablesUnknown: [],
                    lettersArchivedSelectedKeys: [],
                    lettersArchivedTreeData: [],
                    tablesArchivedTreeData: [],
                    lettersIgnoredSelectedKeys: [],
                    lettersIgnoredTreeData: [],
                    tablesIgnoredTreeData: [],
                }, () => {
                    this.setState({
                        lettersUnknownSelectedKeys: [lettersUnknown[0]],
                        lettersUnknownTreeData: lettersUnknownTreeData,
                        treeDataTablesUnknown: treeDataTablesUnknown,
                        lettersArchivedSelectedKeys: [lettersArchived[0]],
                        lettersArchivedTreeData: lettersArchivedTreeData,
                        tablesArchivedTreeData: tablesArchivedTreeData,
                        lettersIgnoredSelectedKeys: [lettersIgnored[0]],
                        lettersIgnoredTreeData: lettersIgnoredTreeData,
                        tablesIgnoredTreeData: tablesIgnoredTreeData,
                    });
                });
            });
        // } else if (connection.db_type === "mysql") {
        //     this.context.showMessage("MySQL数据源的接入正在开发中，请稍后。");
        // }
    }

    onSelectDbUsersChanged(value, option) {

        this.gCurrent.dbUserId = value;
        if (this.gCurrent.productsNodeSelectedType === "product") {
            this.showProductTables()
        } else if (this.gCurrent.productsNodeSelectedType === "module") {
            this.showModuleTables()
        }
    }

    // ****************************************************************************************************
    // TREE...
    // ****************************************************************************************************

    // 产品树节点被选中
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
                        treeDataTablesKnown: []
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
                        treeDataTablesKnown: []
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
                        treeDataTablesKnown: []
                    }, this.showModuleTables);

                    break
                default:
                    break
            }
        } else {
            this.gCurrent.productLineId = undefined;
            this.gCurrent.productId = undefined;
            this.gCurrent.moduleId = undefined;

            this.setState({
                lettersKnownSelectedKeys: [],
                treeDataLettersKnown: [],
                treeDataTablesKnown: []
            })
        }


    };

    onTreeProductsExpanded(expandedKeys) {

    }

    //todo >>>>> on Tree 已导入表名首字母 selected
    onTreeLettersKnownSelected(selectedKeys) {
        if (selectedKeys[0] === undefined) return;

        this.gCurrent.letterKnownSelected = selectedKeys[0];

        let treeDataTables = this.uiGetTablesByLetter("known", selectedKeys[0]);

        this.setState({
            treeDataTablesKnown: treeDataTables
        })
    }

    onTreeLettersUnknownSelected(selectedKeys) {
        if (selectedKeys[0] === undefined) return;

        this.gCurrent.letterUnknownSelected = selectedKeys[0];

        let tablesTreeData = this.uiGetTablesByLetter("unknown", selectedKeys[0]);
        this.setState({
            treeDataTablesUnknown: tablesTreeData
        })
    }

    onTreeLettersArchivedSelected(selectedKeys) {
        if (selectedKeys[0] === undefined) return;

        this.gCurrent.letterArchivedSelected = selectedKeys[0];

        let tablesTreeData = this.uiGetTablesByLetter("archived", selectedKeys[0]);
        this.setState({
            tablesArchivedTreeData: tablesTreeData
        })
    }

    onTreeLettersIgnoredSelected(selectedKeys) {
        if (selectedKeys[0] === undefined) return;

        this.gCurrent.letterIgnoredSelected = selectedKeys[0];

        let tablesTreeData = this.uiGetTablesByLetter("ignored", selectedKeys[0]);
        this.setState({
            tablesIgnoredTreeData: tablesTreeData
        })
    }

    onTreeTablesKnownChecked(checkedKeys, info) {

        this.gCurrent.tablesKnownSelected = info.checkedNodes;
    }

    onTreeTablesUnknownChecked(checkedKeys, info) {
        this.gCurrent.tablesUnknownSelected = info.checkedNodes;
    }

    onTreeTablesArchivedChecked(checkedKeys, info) {
        this.gCurrent.tablesArchivedSelected = info.checkedNodes;
    }

    onTreeTablesIgnoredChecked(checkedKeys, info) {
        this.gCurrent.tablesIgnoredSelected = info.checkedNodes;
    };

    // ****************************************************************************************************
    // CHECKBOX...
    // ****************************************************************************************************

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

    // ****************************************************************************************************
    // BUTTON...
    // ****************************************************************************************************

    // 忽略
    onButtonIsTempClicked() {
        for (let i = 0; i < this.gCurrent.tablesUnknownSelected.length; i++) {
            if (this.gCurrent.tablesUnknownSelected[i].tag.nodeType === "table_column") continue

            let tableName = this.gCurrent.tablesUnknownSelected[i].title;

            let myObject = new TadTableIgnore();
            myObject.table_name = tableName;
            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_ignore",
                myObject,
                {headers: {'Content-Type': 'application/json'}}
            ).then((response) => {
                let data = response.data;

                if (data.success) {
                    // const {treeDataTablesUnknown} = this.state;
                    let treeDataTablesUnknown = JSON.parse(JSON.stringify(this.state.treeDataTablesUnknown));
                    treeDataTablesUnknown.forEach((item, index) => {
                        if (item.key === data.data.table_name) {
                            treeDataTablesUnknown.splice(index, 1)
                        }
                    })
                    this.setState({
                        treeDataTablesUnknown: treeDataTablesUnknown
                    })
                }
            });
        }
    }

    // 还原
    onButtonIsNotTempClicked() {
        //todo::isNotTemp
    }

    //todo <<<<< now >>>>> on Button 导入结构 clicked
    onButtonInClicked() {
        let mapTimers = new Map();
        let nTimers = 0;

        for (let i = 0; i < this.gCurrent.tablesUnknownSelected.length; i++) {
            if (this.gCurrent.tablesUnknownSelected[i].tag.nodeType === "table_column") continue
            nTimers++;
        }

        this.timerUnknown = setInterval(() => {
            if (mapTimers.size === nTimers) {
                let isAllDone = true;
                mapTimers.forEach(value => {
                    isAllDone = value.isDone;
                });

                if (isAllDone) {
                    clearInterval(this.timerUnknown)

                    let tableNames = [];
                    for (let i = 0; i < this.gCurrent.tablesUnknownSelected.length; i++) {
                        if (this.gCurrent.tablesUnknownSelected[i].tag.nodeType === "table_column") continue

                        let tableName = this.gCurrent.tablesUnknownSelected[i].title;
                        tableNames.push(tableName);
                        this.dsAddTablesByLetter("known", tableName);
                        this.dsDeleteTablesByLetter("unknown", tableName);
                    }

                    this.uiAddTablesByLetter("known", tableNames);
                    this.uiDeleteTablesByLetter("unknown", tableNames);
                }

            }
        }, 100);

        for (let i = 0; i < this.gCurrent.tablesUnknownSelected.length; i++) {
            if (this.gCurrent.tablesUnknownSelected[i].tag.nodeType === "table_column") continue

            let tableName = this.gCurrent.tablesUnknownSelected[i].title;

            mapTimers.set(tableName, {isDone: false});

            let myTable = new TadTable();
            myTable.table_name = tableName;
            myTable.db_user_id = this.gCurrent.dbUserId;
            myTable.module_id = this.gCurrent.moduleId;

            if (this.gMap.tablePartitions.has(tableName)) {
                myTable.partition_type = this.gMap.tablePartitions.get(tableName).partitionType;
                myTable.partition_column = this.gMap.tablePartitions.get(tableName).columnName;
            }

            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table",
                myTable,
                {headers: {'Content-Type': 'application/json'}}
            ).then((response) => {
                let data = response.data;
                if (data.success) {

                    // 全局数据添加表
                    this.gData.tables.push(data.data);
                    this.gMap.tables.set(data.data.table_id, {
                        table_id: data.data.table_id,
                        table_name: data.data.table_name,
                        table_desc: data.data.table_desc,
                        table_type_id: data.data.table_type_id,
                        table_label_id: data.data.table_label_id,
                        db_user_id: data.data.db_user_id,
                        module_id: data.data.module_id,
                        columns: [] // 此时没有column_id
                    });

                    // 通知表插入完成
                    mapTimers.get(data.data.table_name).isDone = true;

                    // 导入字段信息
                    for (let j = 0; j < this.gCurrent.tablesUnknownSelected[i].children.length; j++) {
                        let tableColumnName = this.gCurrent.tablesUnknownSelected[i].children[j].key.split(this.gSpliterTableColumn)[1];
                        let tableColumnDataType = this.gCurrent.tablesUnknownSelected[i].children[j].tag.dataType;
                        let tableColumnDataLength = this.gCurrent.tablesUnknownSelected[i].children[j].tag.dataLength;

                        let myTableColumn = new TadTableColumn();
                        myTableColumn.table_id = data.data.table_id;
                        myTableColumn.column_name = tableColumnName;
                        myTableColumn.data_type = tableColumnDataType;
                        myTableColumn.data_length = tableColumnDataLength;

                        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_column",
                            myTableColumn,
                            {headers: {'Content-Type': 'application/json'}}
                        ).then((response2) => {
                            let data2 = response2.data;

                            if (data2.success) {
                                this.gData.columns.push(data2.data);
                                this.gMap.columns.set(data2.data.column_id, {
                                    column_id: data2.data.column_id,
                                    table_id: data2.data.table_id,
                                    column_name: data2.data.column_name,
                                    column_desc: data2.data.column_desc,
                                    column_type_id: data2.data.column_type_id,
                                    data_type: data2.data.data_type,
                                    data_length: data2.data.data_length,
                                    data_default: data2.data.data_default,
                                    nullable_flag: data2.data.nullable_flag,
                                    primary_flag: data2.data.primary_flag,
                                    split_flag: data2.data.split_flag,
                                    repeat_flag: data2.data.repeat_flag
                                });
                                // 界面添加字段：
                                let treeDataTablesKnown = lodash.cloneDeep(this.state.treeDataTablesKnown);
                                let nodeTableColumn = {
                                    key: data2.data.table_id + "_" + data2.data.column_id,
                                    title: data2.data.column_name,
                                    children: []
                                }
                                treeDataTablesKnown.forEach((item) => {
                                    if (item.key === data2.data.table_id) {
                                        item.children.push(nodeTableColumn);
                                    }
                                });
                                this.setState({
                                    treeDataTablesKnown: treeDataTablesKnown
                                })

                                // 全局数据添加字段
                                this.gMap.tables.get(data2.data.table_id).columns.push(data2.data.column_id);
                            }
                        });
                    }

                    // 导入索引信息
                    //todo::import index
                    if (this.gMap.tableIndexes.has(tableName)) {
                        this.gMap.tableIndexes.get(tableName).forEach((value, key) => {
                            let myIndex = new TadTableIndex();
                            myIndex.table_id = data.data.table_id;
                            myIndex.index_name = key;
                            myIndex.index_type = value.indexType;
                            myIndex.uniqueness = value.uniqueness;

                            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index",
                                myIndex,
                                {headers: {'Content-Type': 'application/json'}}
                            ).then((responseIndex) => {
                                let dataIndex = responseIndex.data;

                                if (dataIndex.success) {

                                }
                            })

                            for (let j = 0; j < value.columns.length; j++) {
                                let item = value.columns[j];
                                let myIndexColumn = new TadTableIndexColumn();
                                myIndexColumn.table_id = data.data.table_id;
                                myIndexColumn.index_id = item.id;
                                myIndexColumn.index_name = item.indexName;
                                myIndexColumn.column_name = item.columnName;
                                myIndexColumn.column_position = item.columnPosition;
                                myIndexColumn.descend = item.descend;

                                axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_index_column",
                                    myIndexColumn,
                                    {headers: {'Content-Type': 'application/json'}}
                                ).then((responseIndexColumn) => {
                                    let dataIndexColumn = responseIndexColumn.data;

                                    if (dataIndexColumn.success) {

                                    }
                                })
                            }
                        })
                    }

                    // 导入分区信息
                    if (this.gMap.tablePartitions.has(tableName)) {
                        for (let j = 0; j < this.gMap.tablePartitions.get(tableName).partitions.length; j++) {
                            let item = this.gMap.tablePartitions.get(tableName).partitions[j];
                            let partitionName = item.partitionName;
                            let highValue = item.highValue;
                            let partitionPosition = item.partitionPosition;

                            let myPartition = new TadTablePartition();
                            myPartition.table_id = data.data.table_id;
                            myPartition.partition_name = partitionName;
                            myPartition.high_value = highValue;
                            myPartition.partition_position = partitionPosition;

                            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_partition",
                                myPartition,
                                {headers: {'Content-Type': 'application/json'}}
                            ).then((responsePartition) => {
                                let dataPartition = responsePartition.data;

                                if (dataPartition.success) {

                                }
                            })
                        }
                    }
                }
            });
        }
    }

    //todo <<<<< now >>>>> on Button 移除结构 clicked
    onButtonOutClicked() {
        let mapTimers = new Map();
        let nTimers = 0;

        for (let i = 0; i < this.gCurrent.tablesKnownSelected.length; i++) {
            if (this.gCurrent.tablesKnownSelected[i].tag.nodeType === "table_column") continue
            nTimers++;
        }

        this.timerKnown = setInterval(() => {
            if (mapTimers.size === nTimers) {
                let isAllDone = true;
                mapTimers.forEach(value => {
                    isAllDone = value.isDone;
                });

                if (isAllDone) {
                    clearInterval(this.timerKnown)

                    let tableNames = [];
                    for (let i = 0; i < this.gCurrent.tablesKnownSelected.length; i++) {
                        if (this.gCurrent.tablesKnownSelected[i].tag.nodeType === "table_column") continue

                        let tableName = this.gCurrent.tablesKnownSelected[i].title;
                        tableNames.push(tableName);
                        this.dsAddTablesByLetter("unknown", tableName);
                        this.dsDeleteTablesByLetter("known", tableName);
                    }

                    this.uiAddTablesByLetter("unknown", tableNames);
                    this.uiDeleteTablesByLetter("known", tableNames);
                }
            }
        }, 100);

        for (let i = 0; i < this.gCurrent.tablesKnownSelected.length; i++) {
            let item = this.gCurrent.tablesKnownSelected[i];
            if (item.tag.nodeType !== "table") continue

            let tId = item.tag.tableId;
            let myTable = new TadTable();
            let tableName = this.gCurrent.tablesKnownSelected[i].title;

            mapTimers.set(tableName, {isDone: false});
            myTable.table_id = tId;

            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table",
                myTable,
                {headers: {'Content-Type': 'application/json'}}
            ).then((response) => {
                let data = response.data;
                if (data.success) {
                    console.log(data.data);
                    mapTimers.get(data.data[0].table_name).isDone = true;
                    // axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_column",
                    //     myColumn,
                    //     {headers: {'Content-Type': 'application/json'}}
                    // ).then((response) => {
                    //     let data = response.data;
                    //     if (data.success) {
                    //     }
                    // });
                    // axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_index",
                    //     myIndex,
                    //     {headers: {'Content-Type': 'application/json'}}
                    // ).then((response) => {
                    //     let data = response.data;
                    //     if (data.success) {
                    //     }
                    // });
                    // axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_index_column",
                    //     myIndexColumn,
                    //     {headers: {'Content-Type': 'application/json'}}
                    // ).then((response) => {
                    //     let data = response.data;
                    //     if (data.success) {
                    //     }
                    // });
                    // axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_table_partition",
                    //     myPartition,
                    //     {headers: {'Content-Type': 'application/json'}}
                    // ).then((response) => {
                    //     let data = response.data;
                    //     if (data.success) {
                    //     }
                    // });
                }
            });
        }
    }

    // 导入数据
    onButtonImportClicked() {

    }

    // 移除数据
    onButtonDeleteClicked() {

    }

    render() {

        return <div className="DatabaseImport">
            <div className={"BoxProductsInfo"}>
                <div className={"BoxTree"}>
                    <Tree treeData={this.state.productsTreeData} onSelect={this.onTreeProductsSelected} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                </div>
                <div className={"BoxDescription"}>information</div>
            </div>
            <div className={"BoxKnown"}>
                <div className={"BoxSelect"}>
                    <Select ref={this.gRef.selectDbUsers} onChange={this.onSelectDbUsersChanged} defaultValue={this.state.dbUsersSelected} options={this.state.dbUsersSelectOptions}/>
                </div>
                <div className={"BoxToolbar"}>
                    <div className={"BoxSearch"}>
                        <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                    </div>
                    <Button size={"small"} type={"primary"} onClick={this.onButtonOutClicked} icon={<RightOutlined/>}>移除</Button>
                </div>
                <div className={"BoxTreeAndTable"}>
                    <div className={"BoxList"}>
                        {this.state.treeDataLettersKnown.length ? (
                            <Tree className={"TreeLetters"} treeData={this.state.treeDataLettersKnown} defaultSelectedKeys={this.state.lettersKnownSelectedKeys} onSelect={this.onTreeLettersKnownSelected} blockNode={true} showLine={{showLeafIcon: false}} showIcon={false}/>
                        ) : (<div>&nbsp;</div>)}
                    </div>
                    <div className={"BoxTree"}>
                        <div className={"BoxTree2"}>
                            <Tree ref={this.gRef.treeTablesKnown} className={"TreeKnown"} treeData={this.state.treeDataTablesKnown} onCheck={this.onTreeTablesKnownChecked} checkable blockNode={true} showLine={true} showIcon={true} switcherIcon={<CaretDownOutlined/>}/></div>
                        <div className={"HLine"}
                             style={{display: this.state.uiTableKnownDisplay}}>&nbsp;</div>
                        <div className={"BoxTable"} style={{display: this.state.uiTableKnownDisplay}}>
                            <Table></Table>
                        </div>
                    </div>
                </div>
            </div>
            <div className={"BoxUnknown"}>
                <div className={"BoxSelect"}>
                    <Select onChange={this.onSelectConnectionsChanged} defaultValue={this.state.connectionsSelected} options={this.state.connectionsSelectOptions}/>
                </div>
                <div className={"BoxUnknownToolbar"}>
                    <div className={"BoxSearch"}>
                        <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                    </div>
                    <Button onClick={this.onButtonInClicked} size={"small"} type={"primary"} icon={<LeftOutlined/>}>导入</Button>
                    <Button size={"small"} type={"primary"} onClick={this.onButtonIsTempClicked} icon={<DeleteOutlined/>}>忽略</Button>
                    <Button size={"small"} type={"primary"} onClick={this.onButtonIsNotTempClicked} icon={<CheckOutlined/>}>还原</Button>
                </div>
                <div className={"BoxUnknownTabs"}>
                    <Tabs defaultActiveKey="1" type="card" tabBarGutter={5} animated={false}>
                        <TabPane tab="未归档" key="1">
                            <div className={"BoxUnknownListAndTree"}>
                                <div className={"BoxUnknownList"}>
                                    {this.state.lettersUnknownTreeData.length ? (
                                        <Tree treeData={this.state.lettersUnknownTreeData} onSelect={this.onTreeLettersUnknownSelected} defaultSelectedKeys={this.state.lettersUnknownSelectedKeys} blockNode={true} showLine={{showLeafIcon: false}} showIcon={false}/>
                                    ) : (<div>&nbsp;</div>)}
                                </div>
                                <div className={"BoxUnknownTree"}>
                                    <div className={"BoxUnknownTree2"}>
                                        <Tree ref={this.gRef.treeTablesUnknown} treeData={this.state.treeDataTablesUnknown} onCheck={this.onTreeTablesUnknownChecked} checkable blockNode={true} showLine={true} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                                    </div>
                                    <div className={"HLine"} style={{display: this.state.uiTableUnknownDisplay}}>&nbsp;</div>
                                    <div className={"BoxTable"} style={{display: this.state.uiTableUnknownDisplay}}>
                                        <Table></Table>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="已归档" key="2">
                            <div className={"BoxUnknownListAndTree"}>
                                <div className={"BoxUnknownList"}>
                                    {this.state.lettersArchivedTreeData.length ? (
                                        <Tree className={"TreeLetters"} treeData={this.state.lettersArchivedTreeData} onSelect={this.onTreeLettersArchivedSelected} defaultSelectedKeys={this.state.lettersArchivedSelectedKeys} blockNode={true} showLine={{showLeafIcon: false}} showIcon={false}/>
                                    ) : (<div>&nbsp;</div>)}
                                </div>
                                <div className={"BoxUnknownTree"}>
                                    <div className={"BoxUnknownTree2"}>
                                        <Tree ref={this.gRef.treeTablesArchived} treeData={this.state.tablesArchivedTreeData} onCheck={this.onTreeTablesArchivedChecked} checkable blockNode={true} showLine={true} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="已忽略" key="3">
                            <div className={"BoxUnknownListAndTree"}>
                                <div className={"BoxUnknownList"}>
                                    {this.state.lettersIgnoredTreeData.length ? (
                                        <Tree className={"TreeLetters"} treeData={this.state.lettersIgnoredTreeData} onSelect={this.onTreeLettersIgnoredSelected} defaultSelectedKeys={this.state.lettersIgnoredSelectedKeys} blockNode={true} showLine={{showLeafIcon: false}} showIcon={false}/>
                                    ) : (<div>&nbsp;</div>)}
                                </div>
                                <div className={"BoxUnknownTree"}>
                                    <div className={"BoxUnknownTree2"}>
                                        <Tree ref={this.gRef.treeTablesIgnored} treeData={this.state.tablesIgnoredTreeData} onCheck={this.onTreeTablesIgnoredChecked} checkable blockNode={true} showLine={true} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    }
}
