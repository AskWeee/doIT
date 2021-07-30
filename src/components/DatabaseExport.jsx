import React from 'react'
import './DatabaseExport.scss'
import GCtx from "../GCtx";
import lodash from "lodash";
import axios from "axios";
import moment from 'moment';
import JSZip from "jszip";
import fs from "file-saver";
import {Button, Select, Tree, Input, Checkbox} from 'antd';
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, PlusSquareOutlined} from '@ant-design/icons';
import TadTableColumn from '../entity/TadTableColumn';
import TadTableIndex from "../entity/TadTableIndex";
import TadTablePartition from "../entity/TadTablePartition";
import TadTableRelation from "../entity/TadTableRelation";
import TadTableIndexColumn from "../entity/TadTableIndexColumn";
import KBoxClass from "../eui/KBoxClass";

export default class DatabaseExport extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {
        selectDynamicColumnDataType: React.createRef()
    };
    gDynamic = {};

    constructor(props) {
        super(props);

        //todo >>>>> state
        this.state = {
            dbUsersSelectOptions: [{value: -1, label: "请选择产品线数据库用户"}],
            dbUserSelected: -1,
            treeDataProducts: [],
            treeDataLettersKnown: [],
            treeDataTablesKnown: [],
            treeDataTablesExport: [],
            tableSql: "",
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
        this.doGetTablePropertyIndexColumns = this.doGetTablePropertyIndexColumns.bind(this);

        this.getTableId = this.getTableId.bind(this);

        this.uiUpdateTable = this.uiUpdateTable.bind(this);
        this.dsUpdateTable = this.dsUpdateTable.bind(this);
        this.uiUpdateTableColumn = this.uiUpdateTableColumn.bind(this);
        this.dsUpdateTableColumn = this.dsUpdateTableColumn.bind(this);

        this.onSelectDbUsersChanged = this.onSelectDbUsersChanged.bind(this);
        this.onSelectDbTypesChanged = this.onSelectDbTypesChanged.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);
        this.onTreeTablesKnownSelected = this.onTreeTablesKnownSelected.bind(this);
        this.onTreeTablesExportSelected = this.onTreeTablesExportSelected.bind(this);
        this.onTreeProductsChecked = this.onTreeProductsChecked.bind(this);
        this.onTreeTablesKnownChecked = this.onTreeTablesKnownChecked.bind(this);
        this.onTreeTablesExportChecked = this.onTreeTablesExportChecked.bind(this);
        this.onTreeLettersKnownSelected = this.onTreeLettersKnownSelected.bind(this);

        this.showProductDbUsers = this.showProductDbUsers.bind(this);
        this.showProductTables = this.showProductTables.bind(this);
        this.showModuleTables = this.showModuleTables.bind(this);

        this.onButtonAddClicked = this.onButtonAddClicked.bind(this);
        this.onButtonDeleteClicked = this.onButtonDeleteClicked.bind(this);
        this.onButtonExportClicked = this.onButtonExportClicked.bind(this);
    }

    componentDidMount() {
        // this.doMock();
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

        this.setState({
            treeDataProducts: this.gUi.treeProductsData,
        })
    }

    getTableSql(table) {
        let strSql = "CREATE TABLE ";

        strSql += table.schema + "." + table.table_name + "(\n";

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
                for (let i = 0; i < treeDataTablesKnown.length; i++) {
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
                for (let i = 0; i < dsColumns.length; i++) {
                    if (dsColumns[i].column_id === column.column_id) {
                        dsColumns[i].column_name = column.column_name;
                        dsColumns[i].data_type = column.data_type;
                        dsColumns[i].data_length = column.data_length;
                        dsColumns[i].primary_flag = column.primary_flag;
                        dsColumns[i].nullable_flag = column.nullable_flag;
                        dsColumns[i].data_default = column.data_default;
                        dsColumns[i].split_flag = column.split_flag;
                        dsColumns[i].repeat_flag = column.repeat_flag;
                        dsColumns[i].column_desc = column.column_desc;
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
                let myColumn = this.gMap.columns.get(column.column_id);
                myColumn.column_name = column.column_name;
                myColumn.data_type = column.data_type;
                myColumn.data_length = column.data_length;
                myColumn.primary_flag = column.primary_flag;
                myColumn.nullable_flag = column.nullable_flag;
                myColumn.data_default = column.data_default;
                myColumn.split_flag = column.split_flag;
                myColumn.repeat_flag = column.repeat_flag;
                myColumn.column_desc = column.column_desc;
                break
            case "delete":
                break
            default:
                break
        }
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

    onTreeTablesExportSelected(selectedKeys, info) {

    }

    onSelectDbUsersChanged(value, option) {

        this.gCurrent.dbUserId = value;
        if (this.gCurrent.productsNodeSelectedType === "product") {
            this.showProductTables()
        } else if (this.gCurrent.productsNodeSelectedType === "module") {
            this.showModuleTables()
        }
    }

    onSelectDbTypesChanged(value, option) {
        this.gCurrent.dbTypeId = value;
    }

    onTreeProductsChecked(checkedKeys, info) {
        this.gCurrent.productsChecked = checkedKeys;
    };

    onTreeTablesKnownChecked(checkedKeys, info) {
        this.gCurrent.tablesKnownChecked = checkedKeys;
    };

    onTreeTablesExportChecked(checkedKeys, info) {
        this.gCurrent.tablesExportChecked = checkedKeys;
    };

    onButtonAddClicked(e) {
        // nodeKey = dbUserId - tableId
        let treeDataTablesExport = lodash.cloneDeep(this.state.treeDataTablesExport);

        let nodeDbUser;

        for (let i = 0; i < treeDataTablesExport.length; i++) {
            if (treeDataTablesExport[i].key === this.gCurrent.dbUserId) {
                nodeDbUser = treeDataTablesExport[i];
                break
            }
        }

        if (nodeDbUser === undefined) {
            nodeDbUser = {
                key: this.gCurrent.dbUserId,
                title: this.gMap.dbUsers.get(this.gCurrent.dbUserId).user_name,
                children: []
            }
            treeDataTablesExport.push(nodeDbUser);
        }

        this.gCurrent.tablesKnownChecked.forEach((item) => {
            let uiTable = {
                key: this.gCurrent.dbUserId + "_" + item,
                title: this.gMap.tables.get(item).table_name,
                children: []
            }

            nodeDbUser.children.push(uiTable);
        });


        this.setState({
            treeDataTablesExport: treeDataTablesExport
        })
    }

    onButtonDeleteClicked(e) {
        // nodeKey = dbUserId - tableId
        let treeDataTablesExport = lodash.cloneDeep(this.state.treeDataTablesExport);

        let nodeDbUser;

        for (let i = 0; i < treeDataTablesExport.length; i++) {
            if (treeDataTablesExport[i].key === this.gCurrent.dbUserId) {
                nodeDbUser = treeDataTablesExport[i];
                break
            }
        }

        if (nodeDbUser === undefined) {
            nodeDbUser = {
                key: this.gCurrent.dbUserId,
                title: this.gMap.dbUsers.get(this.gCurrent.dbUserId).user_name,
                children: []
            }
            treeDataTablesExport.push(nodeDbUser);
        }

        this.gCurrent.tablesKnownChecked.forEach((item) => {
            let uiTable = {
                key: item,
                title: this.gMap.tables.get(item).table_name,
                children: []
            }

            nodeDbUser.children.push(uiTable);
        });


        this.setState({
            treeDataTablesExport: treeDataTablesExport
        })
    }

    download(filename, type, content) {
        let element = document.createElement('a');

        if (type === "text") {
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        } else if (type === "bolb") {
            element.setAttribute('href', URL.createObjectURL(content));
        }
        element.setAttribute('download', filename);

        element.style.display = 'none';
        // if firefox
        // document.body.appendChild(element);
        element.click();
        // if firefox
        // document.body.removeChild(element);
    }

    onButtonExportClicked(e) {
        // nodeKey = dbUserId_tableId
        let treeDataTablesExport = lodash.cloneDeep(this.state.treeDataTablesExport);
        let strSql = "";

        treeDataTablesExport.forEach((nodeDbUser) => {
            let dbUserId = nodeDbUser.key;
            let dbUser = this.gMap.dbUsers.get(dbUserId);
            nodeDbUser.children.forEach((nodeTable) => {
                let tableId = parseInt(nodeTable.key.split("_")[1]);
                let table = this.gMap.tables.get(tableId);
                table.schema = dbUser.user_name;

                strSql += this.getTableSql(table) + "\n";
            });

        });

        let zip = new JSZip();
        zip.file("doIT-建库脚本-1_sql.txt", strSql);
        zip.file("doIT-建库脚本-2_sql.txt", strSql);
        zip.generateAsync({type: "blob"})
            .then((content) => {
                fs.saveAs(content, "doIT-建库脚本.zip");
                // this.download("doIT-建库脚本.zip", content);
            });
    }

    //todo >>>>> render
    render() {
        // const BoxTest = KBox(<div>test</div>);

        const optionsDbType = [
            {label: "请选择目标数据库类型", value: -99999},
            {label: "Oracle", value: "oracle"},
            {label: "MySQL", value: "mysql"},
            {label: "Informix", value: "informix"},
            {label: "Sybase", value: "sybase"},
        ];

        return (
            <div className="DatabaseExport">
                <div className={"BoxProducts"}>
                    <div className={"BoxTitleBar"}>
                        <div className="BoxTitle">产品信息：</div>
                    </div>
                    <KBoxClass className="euiKBox">
                        <div className="BoxTreeInstance">
                            <Tree treeData={this.state.treeDataProducts} onSelect={this.onTreeProductsSelected} checkable onCheck={this.onTreeProductsChecked} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true}/>
                        </div>
                    </KBoxClass>
                </div>
                <div className={"BoxKnown"}>
                    <div className={"BoxTitleBar"}>
                        <div className="BoxTitle">库表信息：</div>
                    </div>
                    <div className="BoxSelect">
                        <Select onChange={this.onSelectDbUsersChanged} defaultValue={this.state.dbUserSelected} options={this.state.dbUsersSelectOptions} size="small"/>
                    </div>
                    <div className="BoxToolbar">
                        <div className="BoxButtons">
                            {/*<div className="BoxCheckbox">*/}
                            <Checkbox style={{color: "white"}}>全选</Checkbox>
                            {/*</div>*/}
                            <Button onClick={this.onButtonAddClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>待导出</Button>
                        </div>
                        <div className={"BoxSearch"}>
                            <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                        </div>
                    </div>
                    <div className="BoxTreeAndTable">
                        <KBoxClass className="euiKBox" size={"small"}>
                            <div className="BoxTreeInstance">
                                {this.state.treeDataLettersKnown.length ? (
                                    <Tree treeData={this.state.treeDataLettersKnown} onSelect={this.onTreeLettersKnownSelected} defaultSelectedKeys={this.state.lettersKnownSelectedKeys} checkable className={"TreeLetters"} blockNode={true} />
                                ) : (<div>&nbsp;</div>)}
                            </div>
                        </KBoxClass>
                        <KBoxClass className="euiKBox">
                            {/*<div className={"BoxTree"}>*/}
                            <div className="BoxTreeInstance">
                                <Tree className={"TreeKnown"} treeData={this.state.treeDataTablesKnown} onSelect={this.onTreeTablesKnownSelected} checkable onCheck={this.onTreeTablesKnownChecked}
                                       blockNode={true} showLine={true}/>
                                {/*showLine={true}*/}
                                {/*switcherIcon={<CaretDownOutlined/>}*/}
                                {/*showIcon={true} icon={<PlusSquareOutlined/>}*/}
                                {/*showLine={{showLeafIcon: false}} showIcon={false}*/}
                            </div>
                            {/*</div>*/}
                        </KBoxClass>
                    </div>
                </div>
                <div className={"BoxExport"}>
                    <div className={"BoxTitleBar"}>
                        <div className="BoxTitle">待导出库表信息：</div>
                    </div>
                    <div className="BoxSelect">
                        <Select options={optionsDbType} onChange={this.onSelectDbTypesChanged} size="small"/>
                    </div>
                    <div className="BoxToolbar">
                        <div className="BoxButtons">
                            <Checkbox style={{color: "white"}}>全选</Checkbox>
                            <Button onClick={this.onButtonDeleteClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>移除</Button>
                            <Button onClick={this.onButtonExportClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>导出</Button>
                        </div>
                        <div className={"BoxSearch"}>
                            <Input.Search placeholder="Search" size="small" enterButton onSearch={this.onInputSearchSchemasSearched}/>
                        </div>
                    </div>
                    {/*<div className="BoxTree">*/}
                    <KBoxClass className="euiKBox">
                        <div className={"BoxTreeInstance"}>
                            <Tree className={"TreeExport"} treeData={this.state.treeDataTablesExport} onSelect={this.onTreeTablesExportSelected} checkable onCheck={this.onTreeTablesExportChecked} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true}/>
                        </div>
                    </KBoxClass>
                    {/*</div>*/}
                </div>
            </div>
        )
    }
}
