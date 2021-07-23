import React, {Fragment} from 'react'
import './DatabaseConfig.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Select, Tree, Table, Input} from 'antd'
import {CaretDownOutlined, PlusSquareOutlined} from '@ant-design/icons'
import TadProductLine from "../entity/TadProductLine";
import TadProduct from "../entity/TadProduct";
import TadProductRelation from "../entity/TadProductRelation";
import TadModule from "../entity/TadModule";
import TadDbUser from "../entity/TadDbUser";

export default class DatabaseConfig extends React.Component {
    static contextType = GCtx;

    gUi = {};
    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {
        treeProducts: React.createRef(),
        inputProductLineName: React.createRef(),
        inputProductName: React.createRef(),
        inputModuleName: React.createRef(),
        boxTableProductManagers: React.createRef(),
        boxTableDbUsers: React.createRef(),
    }
    gDynamic = {};

    constructor(props) {
        super(props);

        this.state = {
            treeDataProducts: [],
            nodeTypeSelected: "NODE_UNKNOWN",
            isShownProductLineProperties: "grid",
            isShownProductProperties: "none",
            isShownModuleProperties: "none",
            dataSourceProductManagers: [],
            tableDataDbUsers: [],
            pageSizeProductManagers: 0,
            pageSizeDbUsers: 0,
            tableProductManagersScrollY: 100,
            tableDbUsersScrollY: 100,
            dbUserEditing: {
                user_id: null
            },
            managerEditing: {
                manager_id: null
            },
        }

        //todo >>>>> bind
        this.test = this.test.bind(this);

        this.doInit = this.doInit.bind(this);

        this.restUpdateProductLine = this.restUpdateProductLine.bind(this);
        this.restUpdateProduct = this.restUpdateProduct.bind(this);
        this.restUpdateModule = this.restUpdateModule.bind(this);
        this.restGetDbUsers = this.restGetDbUsers.bind(this);
        this.restAddDbUser = this.restAddDbUser.bind(this);
        this.restUpdateDbUser = this.restUpdateDbUser.bind(this);
        this.restDeleteDbUser = this.restDeleteDbUser.bind(this);

        this.doNewGetAll = this.doNewGetAll.bind(this);
        this.doGetProductRelations = this.doGetProductRelations.bind(this);
        this.doNewGetProductLines = this.doNewGetProductLines.bind(this);
        this.doNewGetProducts = this.doNewGetProducts.bind(this);
        this.doNewGetProductModules = this.doNewGetProductModules.bind(this);
        this.doNewGetProductVersions = this.doNewGetProductVersions.bind(this);
        this.doNewGetProductManagers = this.doNewGetProductManagers.bind(this);
        this.doUpdateProductLine = this.doUpdateProductLine.bind(this);
        this.doUpdateProduct = this.doUpdateProduct.bind(this);
        this.doUpdateModule = this.doUpdateModule.bind(this);
        this.doAddDbUser = this.doAddDbUser.bind(this);
        this.doUpdateDbUser = this.doUpdateDbUser.bind(this);
        this.doDeleteDbUser = this.doDeleteDbUser.bind(this);

        this.uiUpdateProductLine = this.uiUpdateProductLine.bind(this);
        this.uiUpdateProduct = this.uiUpdateProduct.bind(this);
        this.uiUpdateModule = this.uiUpdateModule.bind(this);

        this.onTreeProductsSelected = this.onTreeProductsSelected.bind(this);

        this.onButtonAddProductLineClicked = this.onButtonAddProductLineClicked.bind(this);
        this.onButtonAddProductClicked = this.onButtonAddProductClicked.bind(this);
        this.onButtonAddModuleClicked = this.onButtonAddModuleClicked.bind(this);
        this.onButtonDeleteClicked = this.onButtonDeleteClicked.bind(this);
        this.onButtonSavePropertiesClicked = this.onButtonSavePropertiesClicked.bind(this);
        this.onButtonAddDbUserClicked = this.onButtonAddDbUserClicked.bind(this);
        this.onButtonUpdateDbUserClicked = this.onButtonUpdateDbUserClicked.bind(this);
        this.onButtonDeleteDbUserClicked = this.onButtonDeleteDbUserClicked.bind(this);
        this.onButtonDbUserEditConfirmClicked = this.onButtonDbUserEditConfirmClicked.bind(this);
        this.onButtonDbUserEditCancelClicked = this.onButtonDbUserEditCancelClicked.bind(this);

        this.onInputProductLineNameChanged = this.onInputProductLineNameChanged.bind(this);
        this.onInputDbUserNameChanged = this.onInputDbUserNameChanged.bind(this);
        this.onInputDbUserDescChanged = this.onInputDbUserDescChanged.bind(this);
        this.onInputProductNameChanged = this.onInputProductNameChanged.bind(this);
        this.onInputModuleNameChanged = this.onInputModuleNameChanged.bind(this);
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

        let dataTreeProducts = [];
        this.gMap.productLines.forEach((valuePl, key) => {
            let plId = valuePl.product_line_id;
            let nodeProductLine = {
                key: plId,
                title: valuePl.product_line_name,
                children: [],
                tag: {
                    nodeType: "NODE_PRODUCT_LINE"
                }
            }
            dataTreeProducts.push(nodeProductLine);
            valuePl.products.forEach(item => {
                let pId = item;
                let nodeProduct = {
                    key: plId + "_" + pId,
                    title: this.gMap.products.get(pId).product_name,
                    children: [],
                    tag: {
                        nodeType: "NODE_PRODUCT"
                    }
                }
                nodeProductLine.children.push(nodeProduct);
                this.gMap.products.get(item).modules.forEach(item => {
                    let mId = item;
                    let nodeModule = {
                        key: plId + "_" + pId + "_" + mId,
                        title: this.gMap.modules.get(mId).module_name,
                        children: [],
                        tag: {
                            nodeType: "NODE_MODULE"
                        }
                    }
                    nodeProduct.children.push(nodeModule);
                })
            })
        });

        this.gUi.treeProductsData = dataTreeProducts;

        this.setState({
            treeDataProducts: this.gUi.treeProductsData,
        });

        this.setState({
            tableProductManagersScrollY: this.gRef.boxTableProductManagers.current.scrollHeight - 40,
            tableDbUsersScrollY: this.gRef.boxTableDbUsers.current.scrollHeight - 40,
        })

    }

    restUpdateProductLine(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_product_line",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restUpdateProduct(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_product",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restUpdateModule(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_module",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restGetDbUsers() {
        let params = {};
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_db_users", params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddDbUser(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_db_user",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restUpdateDbUser(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_db_user",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    restDeleteDbUser(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_db_user",
            params,
            {headers: {'Content-Type': 'application/json'}});
    }

    doNewGetAll() {
        axios.all([
            this.doGetProductRelations(),
            this.doNewGetProductLines(),
            this.restGetDbUsers(),
            this.doNewGetProducts(),
            this.doNewGetProductModules(),
            this.doNewGetProductVersions(),
            this.doNewGetProductManagers(),
        ]).then(axios.spread((
            productRelations,
            productLines,
            dbUsers,
            products,
            modules,
            versions,
            managers) => {
            let mapProductRelations = new Map();
            let mapProductLines = new Map();
            let mapDbUsers = new Map();
            let mapProducts = new Map();
            let mapModules = new Map();
            let mapVersions = new Map();
            let mapManagers = new Map();

            this.gData.productRelations = productRelations.data.data;
            this.gData.productLines = productLines.data.data;
            this.gData.dbUsers = dbUsers.data.data;
            this.gData.products = products.data.data;
            this.gData.modules = modules.data.data;
            this.gData.versions = versions.data.data;
            this.gData.managers = managers.data.data;

            productLines.data.data.forEach(function (item) {
                let myKey = item.product_line_id;
                if (!mapProductLines.has(myKey)) {
                    mapProductLines.set(myKey, {
                        product_line_id: myKey,
                        product_line_name: item.product_line_name,
                        product_line_desc: item.product_line_desc,
                        products: [],
                        dbUsers: [],
                        managers: []
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
                if (mapProductLines.has(item.product_line_id)) {
                    mapProductLines.get(item.product_line_id).dbUsers.push(myKey);
                }
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

            productRelations.data.data.forEach(function (item) {
                let myKey = item.product_rel_id;
                if (!mapProductRelations.has(myKey)) {
                    mapProductRelations.set(myKey, {
                        product_rel_id: myKey,
                        product_line_id: item.product_line_id,
                        product_id: item.product_id,
                        product_manager_id: item.product_manager_id
                    });

                    if (mapProductLines.has(item.product_line_id)) {
                        mapProductLines.get(item.product_line_id).products.push(item.product_id);
                    }
                    if (mapProducts.get(item.product_id)) {
                        mapProducts.get(item.product_id).managers.push(item.product_manager_id);
                    }
                } else {
                    if (mapProductLines.has(item.product_line_id)) {
                        if (!mapProductLines.get(item.product_line_id).products.find(element => element === item.product_id)) {
                            mapProductLines.get(item.product_line_id).products.push(item.product_id);
                        }
                    }

                    if (mapProducts.has(item.product_id)) {
                        if (!mapProducts.get(item.product_id).managers.find(element => element === item.product_manager_id)) {
                            mapProducts.get(item.product_id).managers.push(item.product_manager_id);
                        }
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

    doUpdateProductLine(params) {
        this.restUpdateProductLine(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateProductLine(result.data.data, "update");
                    //this.dsUpdateProductLine(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doUpdateProduct(params) {
        this.restUpdateProduct(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateProduct(result.data.data, "update");
                    //this.dsUpdateProductLine(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doUpdateModule(params) {
        this.restUpdateModule(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateModule(result.data.data, "update");
                    //this.dsUpdateProductLine(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doAddDbUser(params) {
        this.restAddDbUser(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateDbUser(result.data.data, "add");
                    this.dsUpdateDbUser(result.data.data, "add");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateDbUser(params) {
        this.restUpdateDbUser(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateDbUser(result.data.data, "update");
                    this.dsUpdateDbUser(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doDeleteDbUser(params) {
        this.restDeleteDbUser(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateDbUser(result.data.data, "delete");
                    //this.dsUpdateProductLine(result.data.data, "update");
                    this.context.showMessage("更新成功，指标内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    uiUpdateProductLine(productLine) {
        let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts);

        for (let i = 0; i < treeDataProducts.length; i++) {
            if (treeDataProducts[i].key === this.gCurrent.productLineId) {
                treeDataProducts[i].title = productLine.product_line_name;
                break
            }
        }

        this.setState({
            treeDataProducts: treeDataProducts
        })
    }

    uiUpdateProduct(product) {
        let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts);

        for (let i = 0; i < treeDataProducts.length; i++) {
            if (treeDataProducts[i].key === this.gCurrent.productLineId) {
                for (let j = 0; j < treeDataProducts[i].children.length; j++) {
                    let ids = treeDataProducts[i].children[j].key.split("_");
                    console.log(treeDataProducts[i].children[j].key, ids[1], this.gCurrent.productId);
                    if ( ids[1] === this.gCurrent.productId.toString()) {
                        console.log(product.product_name);
                        treeDataProducts[i].children[j].title = product.product_name;
                        break
                    }
                }
            }
        }

        this.setState({
            treeDataProducts: treeDataProducts
        })
    }

    uiUpdateModule(module) {
        let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts);

        for (let i = 0; i < treeDataProducts.length; i++) {
            if (treeDataProducts[i].key === this.gCurrent.productLineId) {
                for (let j = 0; j < treeDataProducts[i].children.length; j++) {
                    let ids = treeDataProducts[i].children[j].key.split("_");
                    if ( ids[1] === this.gCurrent.productId.toString()) {
                        for (let k = 0; k < treeDataProducts[i].children[j].children.length; k++) {
                            let mids = treeDataProducts[i].children[j].children[k].key.split("_");
                            if ( mids[2] === this.gCurrent.moduleId.toString()) {
                                treeDataProducts[i].children[j].children[k].title = module.module_name;
                                break
                            }
                        }
                        break
                    }
                }
            }
        }

        this.setState({
            treeDataProducts: treeDataProducts
        })
    }

    uiUpdateDbUser(dbUser, what) {
        let tableDataDbUsers = lodash.cloneDeep(this.state.tableDataDbUsers);

        switch (what) {
            case "add":
                tableDataDbUsers.push(dbUser);
                break
            case "update":
                for (let i = 0; i < tableDataDbUsers.length; i++) {
                    if (tableDataDbUsers[i].user_id === dbUser.user_id) {
                        tableDataDbUsers[i].user_name = dbUser.user_name;
                        tableDataDbUsers[i].user_desc = dbUser.user_desc;
                        break
                    }
                }
                break
            case "delete":
                break
            default:
                break
        }

        this.setState({
            pageSizeDbUsers: tableDataDbUsers.length,
            tableDataDbUsers: tableDataDbUsers
        })
    }

    dsUpdateDbUser(dbUser, what) {
        switch (what) {
            case "add":
                dbUser.key = dbUser.user_id;
                this.gMap.dbUsers.set(dbUser.user_id, dbUser);
                if (this.gMap.productLines.has(dbUser.product_line_id)) {
                    this.gMap.productLines.get(dbUser.product_line_id).dbUsers.push(dbUser.user_id);
                }
                break
            case "update":
                if (this.gMap.dbUsers.has(dbUser.user_id)) {
                    let myDbUser = this.gMap.dbUsers.get(dbUser.user_id);
                    myDbUser.user_name = dbUser.user_name;
                    myDbUser.user_desc = dbUser.user_desc;
                }
                break
            case "delete":
                break
            default:
                break
        }
    }

    //todo on tree 产品 selected
    onTreeProductsSelected(selectedKeys, info) {
        if (info.selected) {
            let nodeType = info.node.tag.nodeType;

            this.gCurrent.nodeTypeSelected = nodeType;

            this.setState({
                nodeTypeSelected: nodeType
            })


            switch (nodeType) {
                case "NODE_PRODUCT_LINE":
                    this.setState({
                        isShownProductLineProperties: "grid",
                        isShownProductProperties: "none",
                        isShownModuleProperties: "none"
                    });

                    let plId = selectedKeys[0];
                    this.gCurrent.productLineId = plId;
                    if (this.gMap.productLines.has(plId)) {
                        let productLine = this.gMap.productLines.get(plId);
                        this.gRef.inputProductLineName.current.setValue(productLine.product_line_name);

                        let tableDataDbUsers = [];
                        productLine.dbUsers.forEach((item) => {
                            if (this.gMap.dbUsers.has(item)) {
                                let dbUser = this.gMap.dbUsers.get(item);
                                dbUser.key = dbUser.user_id
                                tableDataDbUsers.push(dbUser);
                            }
                        })
                        this.setState({
                            pageSizeDbUsers: productLine.dbUsers.length,
                            tableDataDbUsers: tableDataDbUsers
                        })
                    }

                    // let dbUsersSelectOptions = [{value: -1, label: "请选择"}];
                    //
                    // this.gData.dbUsers.forEach((item) => {
                    //     if (item.product_line_id === this.gCurrent.productLineId) {
                    //         let option = {
                    //             value: item.user_id,
                    //             label: item.user_name
                    //         }
                    //         dbUsersSelectOptions.push(option);
                    //     }
                    // });


                    break
                case "NODE_PRODUCT":
                    this.setState({
                        isShownProductLineProperties: "none",
                        isShownProductProperties: "grid",
                        isShownModuleProperties: "none"
                    })
                    this.gCurrent.productLineId = parseInt(selectedKeys[0].split("_")[0]);
                    this.gCurrent.productId = parseInt(selectedKeys[0].split("_")[1]);

                    if (this.gMap.products.has(this.gCurrent.productId)) {
                        let product = this.gMap.products.get(this.gCurrent.productId);
                        this.gRef.inputProductName.current.setValue(product.product_name);
                    }
                        break
                case "NODE_MODULE":
                    this.setState({
                        isShownProductLineProperties: "none",
                        isShownProductProperties: "none",
                        isShownModuleProperties: "grid"
                    })
                    this.gCurrent.productLineId = parseInt(selectedKeys[0].split("_")[0]);
                    this.gCurrent.productId = parseInt(selectedKeys[0].split("_")[1]);
                    this.gCurrent.moduleId = parseInt(selectedKeys[0].split("_")[2]);

                    if (this.gMap.modules.has(this.gCurrent.moduleId)) {
                        let module = this.gMap.modules.get(this.gCurrent.moduleId);
                        this.gRef.inputModuleName.current.setValue(module.module_name);
                    }

                    break
                default:
                    this.setState({
                        isShownProductLineProperties: "grid",
                        isShownProductProperties: "none",
                        isShownModuleProperties: "none"
                    })
                    break
            }
        } else {
            this.setState({
                nodeTypeSelected: "NODE_UNKNOWN"
            })
        }

        // if (selectedKeys[0] === undefined) return;
        //
        // this.setState({
        //     tablesKnownTreeData: []
        // })
        //
    };

    onSelect(selectedKeys, info) {
        // console.log('selected', selectedKeys, info);
    };

    //todo <<<<< now >>>>> on button 添加产品线 clicked
    onButtonAddProductLineClicked() {
        let myObject = new TadProductLine();
        myObject.product_line_name = "新建产品线 - " + moment().format("YYYYMMDDHHmmss");

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_product_line",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let uiObject = {
                    key: data.data.product_line_id,
                    title: data.data.product_line_name + "-" + data.data.product_line_id,
                    children: []
                }

                let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts);
                treeDataProducts.push(uiObject);
                this.setState({
                    treeDataProducts: treeDataProducts
                })
            }
        });
    }

    //todo <<<<< now >>>>> on button 添加产品 clicked
    onButtonAddProductClicked() {
        let myObject = new TadProduct();
        myObject.product_name = "新建产品 - " + moment().format("YYYYMMDDHHmmss");

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_product",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let productLineId = this.gCurrent.productLineId;
                let productId = data.data.product_id;
                let uiObject = {
                    key: productLineId + "_" + productId,
                    title: data.data.product_name + "-" + productId,
                    children: [],
                    tag: {
                        nodeType: "NODE_PRODUCT"
                    }
                }

                let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts)
                console.log(treeDataProducts);

                treeDataProducts.forEach((item) => {
                    if (item.key === productLineId) {
                        item.children.push(uiObject);
                    }
                })
                this.setState({
                    treeDataProducts: treeDataProducts
                })

                let myObject2 = new TadProductRelation();
                myObject2.product_line_id = productLineId;
                myObject2.product_id = productId;
                axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_product_relation",
                    myObject2,
                    {headers: {'Content-Type': 'application/json'}}
                ).then((response2) => {
                    this.context.log("成功添加产品线及产品关系");
                });
            }
        });

    }

    //todo <<<<< now >>>>> on button 添加模块 clicked
    onButtonAddModuleClicked() {
        console.log(this.gCurrent);

        let productLineId = this.gCurrent.productLineId;
        let productId = this.gCurrent.productId;

        let myObject = new TadModule();
        myObject.product_id = productId;
        myObject.module_name = "新建模块 - " + moment().format("YYYYMMDDHHmmss");

        axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_module",
            myObject,
            {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            let data = response.data;

            if (data.success) {
                let moduleId = data.data.module_id;

                let myModule = {
                    key: productLineId + "_" + productId + "_" + moduleId,
                    title: data.data.module_name + "-" + moduleId,
                    children: [],
                    tag: {
                        nodeType: "NODE_MODULE"
                    }
                }

                let treeDataProducts = lodash.cloneDeep(this.state.treeDataProducts);

                treeDataProducts.forEach((item) => {
                    if (item.key === productLineId) {
                        item.children.forEach((item2) => {
                            if (item2.key === productLineId + "_" + productId) {
                                item2.children.push(myModule);
                            }
                        })
                    }
                })
                this.setState({
                    treeDataProducts: treeDataProducts
                })
            }
        });

    }

    //todo <<<<< now >>>>> on button 删除节点 clicked
    onButtonDeleteClicked() {
        console.log(this.gCurrent);

    }

    //todo <<<<< now >>>>> on button 保存属性值 clicked
    onButtonSavePropertiesClicked(e) {
        switch (this.gCurrent.nodeTypeSelected) {
            case "NODE_PRODUCT_LINE":
                let productLine = new TadProductLine();
                productLine.product_line_id = this.gCurrent.productLineId;
                productLine.product_line_name = this.gDynamic.productLineName;

                this.doUpdateProductLine(productLine);
                break
            case "NODE_PRODUCT":
                let product = new TadProduct();

                product.product_id = this.gCurrent.productId;
                product.product_name = this.gDynamic.productName;
                // product.product_desc = this.gDynamic.productDesc;

                this.doUpdateProduct(product);
                break
            case "NODE_MODULE":
                let module = new TadModule();

                module.module_id = this.gCurrent.moduleId;
                module.module_name = this.gDynamic.moduleName;
                // product.product_desc = this.gDynamic.productDesc;

                this.doUpdateModule(module);
                break
            case "NODE_UNKNOWN":
            default:
                break
        }
    }

    //todo <<<<< now >>>>> on button 新增数据库用户 clicked
    onButtonAddDbUserClicked(e) {
        let dbUser = new TadDbUser();

        dbUser.init4add();
        dbUser.product_line_id = this.gCurrent.productLineId;

        this.doAddDbUser(dbUser);
    }

    onButtonUpdateDbUserClicked(e) {
        this.setState({
            dbUserEditing: {
                user_id: this.gCurrent.dbUser.user_id
            }
        })
    }

    onButtonDeleteDbUserClicked(e) {
        // let dbUser = new TadDbUser();
        //
        // dbUser.init4add();
        // dbUser.product_line_id = this.gCurrent.productLineId;
        //
        // this.doAddDbUser(dbUser);
    }

    onButtonDbUserEditConfirmClicked(e) {
        let dbUser = new TadDbUser();

        dbUser.user_id = this.gCurrent.dbUser.user_id;
        dbUser.product_line_id = this.gCurrent.dbUser.product_line_id;
        dbUser.user_name = this.gCurrent.dbUser.user_name_new;
        dbUser.user_desc = this.gCurrent.dbUser.user_desc_new;

        this.doUpdateDbUser(dbUser);

        this.gCurrent.dbUser = null;
        this.setState({
            dbUserEditing: {
                user_id: null
            }
        });

    }

    onButtonDbUserEditCancelClicked(e) {
        this.gCurrent.dbUser = null;
        this.setState({
            dbUserEditing: {
                user_id: null
            }
        })
    }

    onInputProductLineNameChanged(e) {
        this.gDynamic.productLineName = e.target.value;
    }

    onInputProductNameChanged(e) {
        this.gDynamic.productName = e.target.value;
    }

    onInputModuleNameChanged(e) {
        this.gDynamic.moduleName = e.target.value;
    }

    onInputDbUserNameChanged(e) {
        this.gCurrent.dbUser.user_name_new = e.target.value;
    }

    onInputDbUserDescChanged(e) {
        this.gCurrent.dbUser.user_desc_new = e.target.value;
    }

    onRowProductManagersSelected = {
        onChange: (selectedRowKeys, selectedRows) => {

        },
        // renderCell: (checked, record, index, originNode) => {
        //     return (
        //         <Fragment>
        //             {this.state.isShownButtonAlterColumnConfirm === "none" && (originNode)}
        //         </Fragment>
        //     )
        // }
    }

    onRowDbUsersSelected = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.gCurrent.dbUser = {
                key: selectedRows[0].key,
                user_id: selectedRows[0].key,
                product_line_id: this.gCurrent.productLineId,
                user_name: selectedRows[0].user_name,
                user_desc: selectedRows[0].user_desc,
            };
        },
    }

    //todo >>>>> render
    render() {
        // const managers = [
        //     {
        //         key: 1,
        //         name: "赵钱孙李",
        //         tel_no: "13801381380",
        //         work_addr: "北京"
        //     }
        // ];
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
                title: '用户名',
                dataIndex: 'user_name',
                key: 'user_name',
                render: (text, record, index) => {
                    return (
                        (this.state.dbUserEditing.user_id === record.key) ? (
                            <div className="clsProjectKpiUiTitleEditor">
                                <Input defaultValue={record.user_name} onChange={this.onInputDbUserNameChanged}/>
                            </div>
                        ) : (
                            <div className="clsProjectKpiUiTitle">
                                {record.user_name}
                            </div>
                        )
                    )
                }
            },
            {
                title: '简述',
                dataIndex: 'user_desc',
                key: 'user_desc',
                render: (text, record, index) => {
                    return (
                        (this.state.dbUserEditing.user_id === record.key) ? (
                            <div className="clsProjectKpiUiTitleEditor">
                                <Input defaultValue={record.user_desc} onChange={this.onInputDbUserDescChanged}/>
                            </div>
                        ) : (
                            <div className="clsProjectKpiUiTitle">
                                {record.user_desc}
                            </div>
                        )
                    )
                }
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

        return (
            <div className="BoxDatabaseConfig">
                <div>&nbsp;</div>
                <div className="DatabaseConfig">
                    <div className={"BoxProductsInfo"}>
                        <div className={"BoxToolbar"}>
                            <div className="Title">基础信息配置管理</div>
                            <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddProductLineClicked}>添加产品线</Button>
                            <Button disabled={this.state.nodeTypeSelected === "NODE_UNKNOWN"} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddProductClicked}>添加产品</Button>
                            <Button disabled={this.state.nodeTypeSelected === "NODE_UNKNOWN" || this.state.nodeTypeSelected === "NODE_PRODUCT_LINE"} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddModuleClicked}>添加模块</Button>
                            <div className={"Right"}>
                                <Button disabled={this.state.nodeTypeSelected === "NODE_UNKNOWN"} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDeleteClicked}>删除</Button>
                            </div>
                        </div>
                        <div className={"BoxTree"}>
                            <Tree ref={this.gRef.treeProducts} treeData={this.state.treeDataProducts} onSelect={this.onTreeProductsSelected} blockNode={true} showLine={true} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                        </div>
                    </div>
                    <div className={"BoxProperties"}>
                        <div className={"BoxToolbar"}>
                            <div className={"Title"}>属性编辑</div>
                            <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonSavePropertiesClicked}>保存</Button>
                        </div>
                        <div className={"BoxProductLineProperties"} style={{display: this.state.isShownProductLineProperties}}>
                            <div className="PropertyName">产品线名称：</div>
                            <Input ref={this.gRef.inputProductLineName} className="InputPropertyValue" onChange={this.onInputProductLineNameChanged}/>
                            <div className={"BoxToolbar2"}>
                                <div className="ToolbarTitle">产品线产品经理：</div>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>新增</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>修改</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditConfirmClicked}>确认</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditCancelClicked}>放弃</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>删除</Button>
                            </div>
                            <div ref={this.gRef.boxTableProductManagers} className="BoxTable">

                                <Table
                                    dataSource={this.state.tableDataProductManagers}
                                    columns={columnsManager} bordered={true} size={"small"}
                                    rowSelection={{
                                        type: "radio",
                                        ...this.onRowProductManagersSelected
                                    }}
                                    scroll={{y: this.state.tableProductManagersScrollY}}
                                    pagination={{
                                        pageSize: this.state.pageSizeProductManagers,
                                        position: ["none", "none"]
                                    }}
                                />
                            </div>
                            <div className={"BoxToolbar2"}>
                                <div className="ToolbarTitle">产品线数据库用户：</div>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddDbUserClicked}>新增</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonUpdateDbUserClicked}>修改</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditConfirmClicked}>确认</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditCancelClicked}>放弃</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>删除</Button>
                            </div>
                            <div ref={this.gRef.boxTableDbUsers} className="BoxTable">
                                <Table dataSource={this.state.tableDataDbUsers} columns={columnsDbUser} bordered={true} size="small" scroll={{y: this.state.tableDbUsersScrollY}} pagination={{pageSize: this.state.pageSizeDbUsers, position: ["none", "none"]}} rowSelection={(this.state.dbUserEditing.user_id === null) && {type: "radio", ...this.onRowDbUsersSelected}}
                                />
                            </div>
                            <div className="PropertyName">产品线简述：</div>
                            <Input className="InputPropertyValue"/>
                        </div>
                        <div className={"BoxProductProperties"} style={{display: this.state.isShownProductProperties}}>
                            <div className="PropertyName">产品名称：</div>
                            <Input ref={this.gRef.inputProductName} className="InputPropertyValue" onChange={this.onInputProductNameChanged}/>
                            <div className="PropertyName">产品经理：</div>
                            <Select className="SelectPropertyValue"/>
                            <div className={"BoxToolbar2"}>
                                <div className="ToolbarTitle">产品版本信息：</div>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddDbUserClicked}>新增</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonUpdateDbUserClicked}>修改</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditConfirmClicked}>确认</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonDbUserEditCancelClicked}>放弃</Button>
                                <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>删除</Button>
                            </div>
                            <div className="BoxTable">
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
                            </div>
                            <div className="PropertyName">产品简述：</div>
                            <Input className="InputPropertyValue"/>
                        </div>
                        <div className={"BoxModuleProperties"} style={{display: this.state.isShownModuleProperties}}>
                            <div className="PropertyName">模块名称：</div>
                            <Input ref={this.gRef.inputModuleName} className="InputPropertyValue" onChange={this.onInputModuleNameChanged}/>
                            <div className="PropertyName">模块负责人：</div>
                            <Input className="InputPropertyValue"/>
                            <div>&nbsp;</div>
                            <div className="PropertyName">模块简述：</div>
                            <Input className="InputPropertyValue"/>
                        </div>
                    </div>
                </div>
                <div>&nbsp;</div>
            </div>
        )
    }
}
