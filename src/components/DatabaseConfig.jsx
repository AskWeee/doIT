import React from 'react'
import './DatabaseConfig.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {Button, Select, Tree, Table, Input} from 'antd'
import {
    CaretDownOutlined,
} from '@ant-design/icons'
import TadTable from '../entity/TadTable'
import TadTableColumn from '../entity/TadTableColumn'
import TadTableIgnore from '../entity/TadTableIgnore'

export default class DatabaseConfig extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};
    refSelectDbUsers = React.createRef();

    gTableUnknownSelected = [];
    gTableKnownSelected = [];
    gTablesUnknown = [];

    constructor(props) {
        super(props);

        this.state = {
            productsTreeData: [],
            tablesKnownTreeData: [],
            tablesUnknownTreeData: [],
            dbUsersSelectOptions: [{value: -1, label: "请选择"}],
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
            isShownProductLineProperties: "grid",
            isShownProductProperties: "none",
            isShownModuleProperties: "none"
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
        this.doGetTablesByLetter = this.doGetTablesByLetter.bind(this);

        this.onTreeLettersSelected = this.onTreeLettersSelected.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);
        this.onSelectDbUsersChanged = this.onSelectDbUsersChanged.bind(this);
        this.onSelectConnectionsChanged = this.onSelectConnectionsChanged.bind(this);
        this.onRadioUnknownChanged = this.onRadioUnknownChanged.bind(this);
        this.onCheckboxKnownTableDisplayChanged = this.onCheckboxKnownTableDisplayChanged.bind(this);
        this.onCheckboxUnknownTableDisplayChanged = this.onCheckboxUnknownTableDisplayChanged.bind(this);

        this.onSelect = this.onSelect.bind(this);
        this.onTableUnknownChecked = this.onTableUnknownChecked.bind(this);
        this.onTableKnownChecked = this.onTableKnownChecked.bind(this);
        this.doTablesCompare = this.doTablesCompare.bind(this);

        this.onButtonIsTempClicked = this.onButtonIsTempClicked.bind(this);
        this.onButtonInClicked = this.onButtonInClicked.bind(this);
        this.onButtonOutClicked = this.onButtonOutClicked.bind(this);
        this.onButtonAddProductLineClicked = this.onButtonAddProductLineClicked.bind(this);
        this.onButtonAddProductClicked = this.onButtonAddProductClicked.bind(this);
        this.onButtonAddModuleClicked = this.onButtonAddModuleClicked.bind(this);
        this.onButtonDeleteClicked = this.onButtonDeleteClicked.bind(this);
    }

    test(s) {
        console.log(s);
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
            tablesIgnore) => {
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
            let mapTablesIgnore = new Map();

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
            this.gData.tablesIgnore = tablesIgnore.data.data;

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
                        is_null: item.is_null,
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

            tablesIgnore.data.data.forEach((item) => {
                let myKey = item.table_name;
                if (!mapTablesIgnore.has(myKey)) {
                    mapTablesIgnore.set(myKey, {
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
            this.gMap.tablesIgnore = mapTablesIgnore;

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

    doGetTablesIgnore() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_table_ignores", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    // 获取当前产品线-产品-模块-用户，所归属的库表
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
                    this.gMap.tables.get(tId).columns.forEach((itemColumn) => {
                        let tcId = itemColumn;
                        let column = this.gMap.columns.get(tcId);
                        let nodeColumn = {
                            key: tId + "_" + tcId,
                            title: column.column_name + " : " + column.column_type_id,
                            children: []
                        }
                        nodeTable.children.push(nodeColumn);
                    })
                }
            });
            this.setState({
                tablesKnownTreeData: tablesKnownTreeData
            })
        } else {
            console.log("do nothing");
        }
    }

    onTreeProductsSelected(selectedKeys, info) {
        if (selectedKeys[0] === undefined) return;

        this.setState({
            tablesKnownTreeData: []
        })

        let nodeType = info.node.nodeType;
        this.gCurrent.nodeSelectedType = nodeType;


        switch (nodeType) {
            case "product_line":
                this.setState({
                    isShownProductLineProperties: "grid",
                    isShownProductProperties: "none",
                    isShownModuleProperties: "none"
                })
                this.gCurrent.productLineId = selectedKeys[0];

                let dbUsersSelectOptions = [{value: -1, label: "请选择"}];

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

                break
            case "product":
                this.setState({
                    isShownProductLineProperties: "none",
                    isShownProductProperties: "grid",
                    isShownModuleProperties: "none"
                })
                this.gCurrent.productId = parseInt(selectedKeys[0].split("_")[1]);
                break
            case "module":
                this.setState({
                    isShownProductLineProperties: "none",
                    isShownProductProperties: "none",
                    isShownModuleProperties: "grid"
                })
                this.gCurrent.moduleId = parseInt(selectedKeys[0].split("_")[2]);
                this.doGetSpecialTables();
                break
            default:
                this.setState({
                    isShownProductLineProperties: "grid",
                    isShownProductProperties: "none",
                    isShownModuleProperties: "none"
                })
                break
        }
    };

    onSelectDbUsersChanged(value, option) {
        this.gCurrent.dbUserId = value;
        this.doGetSpecialTables();
    }

    // 选择目标数据源，并获取目标数据库结构信息
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

                if (tableName.startsWith("temp_")
                    || tableName.endsWith("$")
                    || this.gMap.tablesIgnore.has(tableName)
                    || this.gMap.tablesByName.has(tableName)) continue

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

        if (letter === undefined) return myResult;
        if (!this.gMap.mapTablesbyLetter.has(letter)) return myResult;

        this.gMap.mapTablesbyLetter.get(letter).tables.forEach((value, key) => {
            let tableName = key;

            //if (!this.gMap.tablesByName.has(tableName)) {
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
                        nodeType: "table_column",
                        dataType: item.type,
                        dataLength: item.length
                    },
                }
                nodeTable.children.push(nodeColumn);
            })
            myResult.push(nodeTable);
            //}
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
        // console.log('selected', selectedKeys, info);
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

    onButtonIsTempClicked() {
        for (let i = 0; i < this.gTableUnknownSelected.length; i++) {
            if (this.gTableUnknownSelected[i].olc.nodeType === "table_column") continue

            let tableName = this.gTableUnknownSelected[i].title;

            let myObject = new TadTableIgnore();
            myObject.table_name = tableName;
            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table_ignore",
                myObject,
                {headers: {'Content-Type': 'application/json'}}
            ).then((response) => {
                let data = response.data;

                if (data.success) {
                    // const {tablesUnknownTreeData} = this.state;
                    let tablesUnknownTreeData = JSON.parse(JSON.stringify(this.state.tablesUnknownTreeData));
                    tablesUnknownTreeData.forEach((item, index) => {
                        if (item.key === data.data.table_name) {
                            tablesUnknownTreeData.splice(index, 1)
                        }
                    })
                    this.setState({
                        tablesUnknownTreeData: tablesUnknownTreeData
                    })
                }
            });
        }
    }

    getColumnDataType(name) {
    }

    // 导入结构
    onButtonInClicked() {
        for (let i = 0; i < this.gTableUnknownSelected.length; i++) {
            if (this.gTableUnknownSelected[i].olc.nodeType === "table_column") continue

            let tableName = this.gTableUnknownSelected[i].title;

            let myTable = new TadTable();
            myTable.table_name = tableName;
            myTable.db_user_id = this.gCurrent.dbUserId;
            myTable.module_id = this.gCurrent.moduleId;

            axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_table",
                myTable,
                {headers: {'Content-Type': 'application/json'}}
            ).then((response) => {
                let data = response.data;
                if (data.success) {
                    console.log(this.gTableUnknownSelected[i].children);
                    for (let j = 0; j < this.gTableUnknownSelected[i].children.length; j++) {
                        let tableColumnName = this.gTableUnknownSelected[i].children[j].key.split(".")[1];
                        let tableColumnDataType = this.gTableUnknownSelected[i].children[j].olc.dataType;
                        let tableColumnDataLength = this.gTableUnknownSelected[i].children[j].olc.dataLength;

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
                            console.log(data2);
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
                                    is_null: data2.data.is_null,
                                    primary_flag: data2.data.primary_flag,
                                    split_flag: data2.data.split_flag,
                                    repeat_flag: data2.data.repeat_flag
                                });
                                // 界面添加字段：
                                let tablesKnownTreeData = JSON.parse(JSON.stringify(this.state.tablesKnownTreeData));
                                let nodeTableColumn = {
                                    key: data2.data.table_id + "_" + data2.data.column_id,
                                    title: data2.data.column_name,
                                    children: []
                                }
                                tablesKnownTreeData.forEach((item) => {
                                    if (item.key === data2.data.table_id) {
                                        item.children.push(nodeTableColumn);
                                    }
                                });
                                this.setState({
                                    tablesKnownTreeData: tablesKnownTreeData
                                })

                                // 全局数据添加字段
                                this.gMap.tables.get(data2.data.table_id).columns.push(data2.data.column_id);
                            }
                        });
                    }

                    // 从界面移除
                    let tablesUnknownTreeData = JSON.parse(JSON.stringify(this.state.tablesUnknownTreeData));
                    tablesUnknownTreeData.forEach((item, index) => {
                        if (item.key === data.data.table_name) {
                            tablesUnknownTreeData.splice(index, 1)
                        }
                    })
                    // 界面添加表
                    let tablesKnownTreeData = JSON.parse(JSON.stringify(this.state.tablesKnownTreeData));
                    let nodeTable = {
                        key: data.data.table_id,
                        title: data.data.table_name,
                        children: []
                    }
                    tablesKnownTreeData.push(nodeTable);

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
                        columns: []
                    });
                    this.setState({
                        tablesKnownTreeData: tablesKnownTreeData,
                        tablesUnknownTreeData: tablesUnknownTreeData
                    })
                }
            });
        }
    }

    onButtonOutClicked() {

        /*
        let tablesKnown = JSON.parse(JSON.stringify(this.state.tablesKnown));
        let tablesUnknown = JSON.parse(JSON.stringify(this.state.tablesUnknown));

        this.gTableKnownSelected.forEach(function (item) {
            tablesUnknown.push(item);
            for (let i = 0; i < tablesKnown.length; i++) {
                if (tablesKnown[i].title === item.title) {
                    tablesKnown.splice(i, 1);
                    break
                }
            }
        })

        this.setState({
            tablesKnown: tablesKnown,
            tablesUnknown: tablesUnknown
        })

         */
    }

    onButtonImportClicked() {

    }

    onButtonAddProductLineClicked() {
        console.log(this.gCurrent);
    }

    onButtonAddProductClicked() {
        console.log(this.gCurrent);

    }

    onButtonAddModuleClicked() {
        console.log(this.gCurrent);

    }

    onButtonDeleteClicked() {
        console.log(this.gCurrent);

    }

    doGetSchemas(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_connection", params,
            {headers: {'Content-Type': 'application/json'}}).then((response) => {
        });
    }

    render() {
        const managers = [
            {
                key: 1,
                name: "赵钱孙李",
                tel_no: "13801381380",
                work_addr: "北京"
            }
        ];
        // const dbUsers = [
        //     {
        //         key: 1,
        //         name: "nrmdb",
        //         desc: "资源管理相关产品使用该用户"
        //     }
        // ]
        const columnsManager = [
            {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '电话',
                dataIndex: 'tel_no',
                key: 'tel_no',
            },
            {
                title: '办公地点',
                dataIndex: 'work_addr',
                key: 'work_addr',
            },
        ];
        const columnsDbUser = [
            {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '简述',
                dataIndex: 'desc',
                key: 'desc',
            },
        ];
        const columnsVersions = [
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '简述',
                dataIndex: 'desc',
                key: 'desc',
            },
        ];

        return <div className="BoxDatabaseConfig">
            <div>&nbsp;</div>
            <div className="DatabaseConfig">
                <div className={"BoxProductsInfo"}>
                    <div className={"BoxToolbar"}>
                        <Button onClick={this.onButtonAddProductLineClicked}>添加产品线</Button>
                        <Button onClick={this.onButtonAddProductClicked}>添加产品</Button>
                        <Button onClick={this.onButtonAddModuleClicked}>添加模块</Button>
                        <div className={"Right"}>
                            <Button onClick={this.onButtonDeleteClicked}>删除</Button>
                        </div>
                    </div>
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
                </div>
                <div className={"BoxProperties"}>
                    <div className={"BoxToolbar"}>
                        <div className={"Title"}>属性编辑</div>
                    </div>
                    <div className={"BoxProductLineProperties"} style={{display: this.state.isShownProductLineProperties}}>
                        <div>产品线名称：</div>
                        <Input/>
                        <div className={"BoxToolbar"}>
                            <div>产品线产品经理：</div>
                            <div className={"Right"}>
                                <Button>新增</Button>
                                <Button>修改</Button>
                                <Button>删除</Button>
                            </div>
                        </div>
                        <Table
                            dataSource={managers}
                            columns={columnsManager}
                            bordered={true}
                            size={"small"}
                            rowSelection={{
                                type: "radio"
                            }}
                            scroll={{y: 100}}
                        />
                        <div className={"BoxToolbar"}>
                            <div>产品线数据库用户：</div>
                            <div className={"Right"}>
                                <Button>新增</Button>
                                <Button>修改</Button>
                                <Button>删除</Button>
                            </div>
                        </div>
                        <Table
                            dataSource={[]}
                            columns={columnsDbUser}
                            bordered={true}
                            size={"small"}
                            rowSelection={{
                                type: "radio"
                            }}
                            scroll={{y: 100}}
                        />
                        <div>产品线简述：</div>
                        <Input/>
                    </div>
                    <div className={"BoxProductProperties"} style={{display: this.state.isShownProductProperties}}>
                        <div>产品名称：</div>
                        <Input/>
                        <div>产品经理：</div>
                        <Select/>
                        <div className={"BoxToolbar"}>
                            <div>产品版本信息：</div>
                            <div className={"Right"}>
                                <Button>新增</Button>
                                <Button>修改</Button>
                                <Button>删除</Button>
                            </div>
                        </div>
                        <Table
                            dataSource={[]}
                            columns={columnsVersions}
                            bordered={true}
                            size={"small"}
                            rowSelection={{
                                type: "radio"
                            }}
                            scroll={{y: 100}}
                        />
                        <div>产品简述：</div>
                        <Input/>
                    </div>
                    <div className={"BoxModuleProperties"} style={{display: this.state.isShownModuleProperties}}>
                        <div>模块名称：</div>
                        <Input/>
                        <div>模块负责人：</div>
                        <Input/>
                        <div>&nbsp;</div>
                        <div>模块简述：</div>
                        <Input/>
                    </div>
                </div>
            </div>
            <div>&nbsp;</div>
        </div>
    }
}
