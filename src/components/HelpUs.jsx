import React from 'react'
import './HelpUs.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Tree} from 'antd'
import {CaretDownOutlined, CloseOutlined, PlusSquareOutlined,} from '@ant-design/icons'
import TadOlcEvent from "../entity/TadOlcEvent";
import TadHelpTree from "../entity/TadHelpTree";

export default class HelpUs extends React.PureComponent {
    static contextType = GCtx;

    /*
     * 命名规范：
     *
     */
    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {
        boxTreeOlcEvents: React.createRef(),
        treeOlcEvents: React.createRef(),
        inputValueTitle: React.createRef(),
        inputValueCustomer: React.createRef(),
        inputValueDeveloper: React.createRef(),
        selectValueStatus: React.createRef(),
        formProperties: React.createRef(),
    };
    gDynamic = {
        treeOlcEventsScrollTo: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            treeDataOlcEvents: [],
            treeOlcEventsHeight: 100,
            isOlcEventEditing: false,
        }

        //todo >>>>> bind(this)
        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);

        this.restGetOlcEvents = this.restGetOlcEvents.bind(this);
        this.restAddOlcEvent = this.restAddOlcEvent.bind(this);
        this.restUpdateOlcEvent = this.restUpdateOlcEvent.bind(this);

        this.restGetHelpTrees = this.restGetHelpTrees.bind(this);
        this.restAddHelpTree = this.restAddHelpTree.bind(this);
        this.restUpdateHelpTree = this.restUpdateHelpTree.bind(this);
        this.restDeleteHelpTree = this.restDeleteHelpTree.bind(this);
        this.doGetHelpTrees = this.doGetHelpTrees.bind(this);
        this.doAddHelpTree = this.doAddHelpTree.bind(this);
        this.doUpdateHelpTree = this.doUpdateHelpTree.bind(this);
        this.doDeleteHelpTree = this.doDeleteHelpTree.bind(this);

        this.doGetOlcEvents = this.doGetOlcEvents.bind(this);
        this.doAddOlcEvent = this.doAddOlcEvent.bind(this);
        this.doUpdateOlcEvent = this.doUpdateOlcEvent.bind(this);
        this.doDeleteOlcEvent = this.doDeleteOlcEvent.bind(this);

        this.getHelpTreeNode = this.getHelpTreeNode.bind(this);
        this.getHelpTreeNodeLeaf = this.getHelpTreeNodeLeaf.bind(this);
        this.helpTrees2antdTree = this.helpTrees2antdTree.bind(this);
        this.setDirTitle = this.setDirTitle.bind(this);

        this.uiUpdateOlcEvent = this.uiUpdateOlcEvent.bind(this);
        this.dsUpdateOlcEvent = this.dsUpdateOlcEvent.bind(this);

        this.doGetAll = this.doGetAll.bind(this);

        this.onTreeOlcEventsSelected = this.onTreeOlcEventsSelected.bind(this);

        this.onButtonAddReqClicked = this.onButtonAddReqClicked.bind(this);
        this.onButtonAddDesignClicked = this.onButtonAddDesignClicked.bind(this);
        this.onButtonAddTaskClicked = this.onButtonAddTaskClicked.bind(this);
        this.onButtonAddBugClicked = this.onButtonAddBugClicked.bind(this);
        this.onButtonRenameClicked = this.onButtonRenameClicked.bind(this);
        this.onButtonDeleteClicked = this.onButtonDeleteClicked.bind(this);
        this.onButtonSaveClicked = this.onButtonSaveClicked.bind(this);
        this.onButtonRecoverClicked = this.onButtonRecoverClicked.bind(this);
        this.onButtonAddOlcEventsTreeNodeClicked = this.onButtonAddOlcEventsTreeNodeClicked.bind(this);

        this.onInputValueTitleChanged = this.onInputValueTitleChanged.bind(this);
        this.onInputValueDeveloperChanged = this.onInputValueDeveloperChanged.bind(this);
        this.onInputValueDescChanged = this.onInputValueDescChanged.bind(this);

        this.onSelectValueStatusChanged = this.onSelectValueStatusChanged.bind(this);
    }

    componentDidMount() {
        this.doPrepare();
        this.doGetAll();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.gDynamic.treeOlcEventsScrollTo !== null) {
            this.gRef.treeOlcEvents.current.scrollTo({key: this.gDynamic.treeOlcEventsScrollTo});
            this.gDynamic.treeOlcEventsScrollTo = null;
        }
    }

    doPrepare() {

    }

    doInit() {
        this.setState({
            treeOlcEventsHeight: this.gRef.boxTreeOlcEvents.current.offsetHeight,
        })
    }

    restGetHelpTrees() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_help_trees",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }
    restAddHelpTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_help_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }
    restUpdateHelpTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_help_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }
    restDeleteHelpTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/delete_help_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }
    doGetHelpTrees(params) {
        this.restGetHelpTrees(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }
    doAddHelpTree(params) {
        this.restAddHelpTree(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateHelpTree(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }
    doUpdateHelpTree(params) {
        this.restUpdateHelpTree(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateHelpTree(result.data.data, "update");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.uuid);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }
    doDeleteHelpTree(params) {
        this.restDeleteHelpTree(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    getHelpTreeNode(treeNodes, id, uiTree) {
        console.log(id, uiTree);
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                treeNodes[i].children.push(uiTree);
                return
            } else {
                this.getHelpTreeNode(treeNodes[i].children, id, uiTree);
            }
        }
    }

    getHelpTreeNodeLeaf(treeNodes, id, oe) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                for(let j = 0; j < treeNodes[i].children.length; j++) {
                    if (treeNodes[i].children[j].key === oe.dir_id + "_" + oe.uuid) {
                        let nodeClassName = this.getOeClassName(oe);

                        treeNodes[i].children[j].title = <div className={nodeClassName}>{oe.type.toUpperCase() + moment(oe.time_created).format("YYYYMMDD") + " - " + oe.title}</div>;
                        break
                    }
                }

                return
            } else {
                this.getHelpTreeNodeLeaf(treeNodes[i].children, id, oe);
            }
        }
    }

    helpTrees2antdTree(treeNodes, pId, uiTrees) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].node_parent_id === pId) {
                let uiTree = {
                    key: treeNodes[i].uuid,
                    title: treeNodes[i].node_zhname,
                    children: [],
                    tag: {
                        nodeType: "NODE_DIR"
                    }
                }
                uiTrees.children.push(uiTree);
                this.helpTrees2antdTree(treeNodes, treeNodes[i].uuid, uiTree);
            }
        }

        return uiTrees;
    }

    setDirTitle(treeNodes, id, title) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                treeNodes[i].title = title;
                return
            } else {
                this.setDirTitle(treeNodes[i].children, id, title);
            }
        }
    }

    uiUpdateOlcEvent(oe, what) {
        let treeDataOlcEvents;

        switch (what) {
            case "add":
                treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);
                let nodeClassName = this.getOeClassName(oe);

                let uiOe = {
                    key: oe.dir_id + "_" + oe.uuid,
                    title: <div className={nodeClassName}>{oe.type.toUpperCase() + moment(oe.time_created).format("YYYYMMDD") + " - " + oe.title}</div>,
                    children: [],
                    tag: {
                        nodeType: "NODE_" + oe.type
                    }
                }

                // treeDataOlcEvents.push(uiOe);
                this.getHelpTreeNode(treeDataOlcEvents, oe.dir_id, uiOe);

                this.setState({
                    treeDataOlcEvents: treeDataOlcEvents
                })
                break
            case "update":
                treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);

                this.getHelpTreeNodeLeaf(treeDataOlcEvents, oe.dir_id, oe);

                this.setState({
                    treeDataOlcEvents: treeDataOlcEvents
                })
                // for(let i = 0; i < treeDataOlcEvents.length; i++) {
                //     if (treeDataOlcEvents[i].key === oe.dir_id + "_" + oe.uuid) {
                //         let nodeClassName = this.getOeClassName(oe);
                //
                //         treeDataOlcEvents[i].title = <div className={nodeClassName}>{oe.type.toUpperCase() + moment(oe.time_created).format("YYYYMMDD") + " - " + oe.title}</div>;
                //         break
                //     }
                // }
                //
                // this.setState({
                //     treeDataOlcEvents: treeDataOlcEvents
                // })
                break
            case "delete":
                // treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);
                //
                // this.setState({
                //     treeDataOlcEvents: treeDataOlcEvents
                // })
                break
            default:
                break;
        }
    }

    dsUpdateOlcEvent(oe, what) {
        switch (what) {
            case "add":
                this.gMap.olcEvents.set(oe.uuid, lodash.cloneDeep(oe));
                break
            case "update":
                if (this.gMap.olcEvents.has(oe.uuid)) {
                    let myOe = this.gMap.olcEvents.get(oe.uuid);
                    myOe.title = oe.title;
                    myOe.developer = oe.developer;
                    myOe.status = oe.status;
                    myOe.desc = oe.desc;
                    myOe.time_closed = oe.time_closed;
                }
                break
            case "delete":
                break
            default:
                break;
        }
    }

    uiUpdateHelpTree(treeNode, what) {
        let treeDataOlcEvents;

        switch (what) {
            case "add":
                treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);

                let uiTree = {
                    key: treeNode.uuid,
                    title: treeNode.node_zhname,
                    children: [],
                    tag: {
                        nodeType: treeNode.node_type
                    }
                }

                if (treeNode.node_type === "NODE_DIR") {
                    if (treeNode.node_parent_id === -1) {
                        treeDataOlcEvents.push(uiTree);
                    } else {
                        this.getHelpTreeNode(treeDataOlcEvents, this.gCurrent.helpTreeNode.uuid, uiTree);
                    }
                } else {
                    if (treeNode.node_parent_id === -1) {
                        uiTree.key = "-1_" + treeNode.uuid;
                        treeDataOlcEvents.push(uiTree);
                    } else {
                        uiTree.key = this.gCurrent.helpTreeNode.uuid + "_" + treeNode.uuid;
                        this.getHelpTreeNode(treeDataOlcEvents, this.gCurrent.helpTreeNode.uuid, uiTree);
                    }
                }

                this.setState({
                    treeDataOlcEvents: treeDataOlcEvents
                })
                break
            case "update":
                console.log(treeNode);
                treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);

                this.setDirTitle(treeDataOlcEvents, treeNode.uuid, treeNode.node_zhname);

                this.setState({
                    isTableErTreeEditing: false,
                    treeDataOlcEvents: treeDataOlcEvents
                })
                break
            case "delete":
                treeDataOlcEvents = lodash.cloneDeep(this.state.treeDataOlcEvents);

                // this.deleteProject(treeDataTableErTrees, this.gCurrent.project.id);
                this.gCurrent.helpTreeNode = null;

                this.setState({
                    treeDataOlcEvents: treeDataOlcEvents
                })
                break
            default:
                break;
        }
    }

    async doSleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    getOeClassName(oe) {
        let nodeClassName = "";

        if (oe.type.toUpperCase() === "BUG") {
            switch (oe.status.toUpperCase()) {
                case "NEW":
                    nodeClassName = "BoxBugNew";
                    break
                case "WAIT":
                    nodeClassName = "BoxBugWait";
                    break
                case "DOING":
                    nodeClassName = "BoxBugDoing";
                    break
                case "DONE":
                    nodeClassName = "BoxBugDone";
                    break
                case "CLOSED":
                    nodeClassName = "BoxBugClosed";
                    break
                default:
                    break
            }
        } else {
            switch (oe.status.toUpperCase()) {
                case "NEW":
                    nodeClassName = "BoxReqNew";
                    break
                case "WAIT":
                    nodeClassName = "BoxReqWait";
                    break
                case "DOING":
                    nodeClassName = "BoxReqDoing";
                    break
                case "DONE":
                    nodeClassName = "BoxReqDone";
                    break
                case "CLOSED":
                    nodeClassName = "BoxReqClosed";
                    break
                default:
                    break
            }
        }

        return nodeClassName;
    }

    //todo >>>>> do Get All
    doGetAll() {
        axios.all([
            this.restGetHelpTrees(),
            this.restGetOlcEvents(),
        ]).then(axios.spread((
            helpTrees,
            olcEvents,
        ) => {
            let dsHelpTrees = helpTrees.data.data;
            let mapOlcEvents = new Map();
            let treeDataOlcEvents = [];

            for (let i = 0; i < dsHelpTrees.length; i++) {
                if (dsHelpTrees[i].node_parent_id === -1) {
                    let nodeRoot = {
                        key: dsHelpTrees[i].uuid,
                        title: dsHelpTrees[i].node_zhname,
                        children: [],
                        tag: {
                            nodeType: "NODE_DIR"
                        }
                    }
                    let nodeTrees = this.helpTrees2antdTree(dsHelpTrees, dsHelpTrees[i].uuid, nodeRoot);
                    treeDataOlcEvents.push(nodeTrees);
                }
            }

            for (let i = 0; i < olcEvents.data.data.length; i++) {
                let oe = olcEvents.data.data[i];
                let nodeClassName = this.getOeClassName(oe);
                let uiOe = {
                    key: oe.dir_id + "_" + oe.uuid,
                    title: <div className={nodeClassName}>{oe.type.toUpperCase() + moment(oe.time_created).format("YYYYMMDD") + " - " + oe.title}</div>,
                    children: [],
                    tag: {
                        nodeType: "NODE_" + oe.type.toUpperCase()
                    }
                }

                this.getHelpTreeNode(treeDataOlcEvents, oe.dir_id, uiOe);
                //treeDataOlcEvents.push(uiOe);
                mapOlcEvents.set(oe.uuid, oe);
            }

            this.setState({
                treeDataOlcEvents: treeDataOlcEvents
            })


            // for (let i = 0; i < olcEvents.data.data.length; i++) {
            //     let oe = olcEvents.data.data[i];
            //     let nodeClassName = this.getOeClassName(oe);
            //     let uiOe = {
            //         key: oe.dir_id + "_" + oe.uuid,
            //         title: <div className={nodeClassName}>{oe.type.toUpperCase() + moment(oe.time_created).format("YYYYMMDD") + " - " + oe.title}</div>,
            //         children: [],
            //         tag: {
            //             nodeType: "NODE_" + oe.type.toUpperCase()
            //         }
            //     }
            //
            //     treeDataOlcEvents.push(uiOe);
            //     mapOlcEvents.set(oe.uuid, oe);
            // }

            this.gMap.olcEvents = mapOlcEvents;

            this.setState({
                treeDataOlcEvents: treeDataOlcEvents
            });
        })).then(() => {
            this.doInit();
        });
    }

    restGetOlcEvents() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/get_olc_events",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddOlcEvent(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/add_olc_event",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateOlcEvent(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/core/update_olc_event",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetOlcEvents(params) {
        this.restGetOlcEvents(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateOlcEvent(result.data.data, "add");
                    this.dsUpdateOlcEvent(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doAddOlcEvent(params) {
        this.restAddOlcEvent(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateOlcEvent(result.data.data, "add");
                    this.dsUpdateOlcEvent(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.uuid);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doUpdateOlcEvent(params) {
        this.restUpdateOlcEvent(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateOlcEvent(result.data.data, "update");
                    this.dsUpdateOlcEvent(result.data.data, "update");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    doDeleteOlcEvent(params) {
        this.restUpdateOlcEvent(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateProjectKpi(result.data.data, "delete");
                    this.dsUpdateProjectKpi(result.data.data, "delete");

                    this.gCurrent.projectKpi = null;
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });

    }

    onTreeOlcEventsSelected(selectedKeys, info) {
        console.log(info.node);
        if (info.selected) {
            this.gCurrent.helpTreeNode = {
                uuid: selectedKeys[0],
                title: info.node.title,
                nodeType: info.node.tag.nodeType,
            }

        }

        if (info.selected) {
            let nodeType = info.node.tag.nodeType;
            if (nodeType !== "NODE_DIR") {
                let ids = selectedKeys[0].split("_");
                let oeId = parseInt(ids[ids.length - 1]);
                let oe = this.gMap.olcEvents.get(oeId);

                this.gCurrent.olcEvent = oe;

                if (oe.desc === null) oe.desc = "";

                this.gRef.inputValueTitle.current.setValue(oe.title);
                this.gRef.inputValueCustomer.current.setValue(oe.customer);
                this.gRef.inputValueDeveloper.current.setValue(oe.developer);

                this.gRef.formProperties.current.setFieldsValue({
                    valueDesc: oe.desc,
                });

                this.setState({
                    valueStatus: oe.status
                });
            } else {
                this.gRef.inputValueTitle.current.setValue(this.gCurrent.helpTreeNode.title);
            }

        } else {
            this.gRef.inputValueTitle.current.setValue("");
            this.gRef.inputValueCustomer.current.setValue("");
            this.gRef.inputValueDeveloper.current.setValue("");

            this.gRef.formProperties.current.setFieldsValue({
                valueDesc: "",
            });

            this.setState({
                valueStatus: null
            })
        }

    }

    onButtonAddReqClicked(e) {
        let olcEvent = new TadOlcEvent();

        if ((this.gCurrent.helpTreeNode !== null) && (this.gCurrent.helpTreeNode !== undefined)) {
            if (this.gCurrent.helpTreeNode.nodeType !== "NODE_DIR") return

            olcEvent.dir_id = parseInt(this.gCurrent.helpTreeNode.uuid);
            olcEvent.type = "REQ";
            olcEvent.status = "NEW";
            olcEvent.title = "新需求 - " + moment().format("YYYYMMDDHHmmss");
            olcEvent.customer = this.context.user.name;
            olcEvent.time_created = moment().format("YYYY-MM-DD HH:mm:ss");

            this.doAddOlcEvent(olcEvent);
        }
    }

    onButtonAddDesignClicked(e) {
        let olcEvent = new TadOlcEvent();

        if ((this.gCurrent.helpTreeNode !== null) && (this.gCurrent.helpTreeNode !== undefined)) {
            if (this.gCurrent.helpTreeNode.nodeType !== "NODE_DIR") return

            olcEvent.dir_id = parseInt(this.gCurrent.helpTreeNode.uuid);
            olcEvent.type = "DEV";
            olcEvent.status = "NEW";
            olcEvent.title = "新设计 - " + moment().format("YYYYMMDDHHmmss");
            olcEvent.customer = this.context.user.name;
            olcEvent.time_created = moment().format("YYYY-MM-DD HH:mm:ss");

            this.doAddOlcEvent(olcEvent);
        }
    }

    onButtonAddTaskClicked(e) {
        let olcEvent = new TadOlcEvent();

        if ((this.gCurrent.helpTreeNode !== null) && (this.gCurrent.helpTreeNode !== undefined)) {
            if (this.gCurrent.helpTreeNode.nodeType !== "NODE_DIR") return

            olcEvent.dir_id = parseInt(this.gCurrent.helpTreeNode.uuid);
            olcEvent.type = "WBS";
            olcEvent.status = "NEW";
            olcEvent.title = "新任务 - " + moment().format("YYYYMMDDHHmmss");
            olcEvent.customer = this.context.user.name;
            olcEvent.time_created = moment().format("YYYY-MM-DD HH:mm:ss");

            this.doAddOlcEvent(olcEvent);
        }
    }

    onButtonAddBugClicked(e) {
        let olcEvent = new TadOlcEvent();

        olcEvent.type = "BUG";
        olcEvent.status = "NEW";
        olcEvent.title = "新BUG - " + moment().format("YYYYMMDDHHmmss");
        olcEvent.customer = this.context.user.name;
        olcEvent.time_created = moment().format("YYYY-MM-DD HH:mm:ss");

        this.doAddOlcEvent(olcEvent);
    }

    onButtonRenameClicked(e) {

    }

    onButtonDeleteClicked(e) {

    }

    onButtonSaveClicked(e) {
        if (this.gCurrent.helpTreeNode.nodeType !== "NODE_DIR") {
            let oe = new TadOlcEvent();

            oe.uuid = this.gCurrent.olcEvent.uuid;
            if (this.gDynamic.valueTitle !== undefined && this.gDynamic.valueTitle.trim() !== "") {
                oe.title = this.gDynamic.valueTitle;
            }

            if (this.gDynamic.valueCustomer !== undefined && this.gDynamic.valueCustomer.trim() !== "") {
                oe.customer = this.gDynamic.valueCustomer;
            }

            if (this.gDynamic.valueDeveloper !== undefined && this.gDynamic.valueDeveloper.trim() !== "") {
                oe.developer = this.gDynamic.valueDeveloper;
            }

            if (this.gDynamic.valueStatus !== undefined && this.gDynamic.valueStatus.trim() !== "") {
                oe.status = this.gDynamic.valueStatus;
            }

            if (this.gDynamic.valueDesc !== undefined && this.gDynamic.valueDesc.trim() !== "") {
                oe.desc = this.gDynamic.valueDesc;
            }

            this.doUpdateOlcEvent(oe);
            this.gDynamic = {};
            this.setState({
                isOlcEventEditing: false
            })
        } else {
            let nodeDir = new TadHelpTree();

            nodeDir.uuid = this.gCurrent.helpTreeNode.uuid;
            if (this.gDynamic.valueTitle !== undefined && this.gDynamic.valueTitle.trim() !== "") {
                nodeDir.node_zhname = this.gDynamic.valueTitle;
            }
            this.doUpdateHelpTree(nodeDir);
            this.gDynamic = {};
            this.setState({
                isOlcEventEditing: false
            })
        }
    }

    onButtonRecoverClicked(e) {

    }

    onButtonAddOlcEventsTreeNodeClicked(e) {
        let helpTree = new TadHelpTree();

        if ((this.gCurrent.helpTreeNode !== null) && (this.gCurrent.helpTreeNode !== undefined)) {
            if (this.gCurrent.helpTreeNode.nodeType !== "NODE_DIR") return
            helpTree.node_parent_id = parseInt(this.gCurrent.helpTreeNode.uuid);
        } else {
            helpTree.node_parent_id = -1;
        }

        helpTree.node_zhname = "新增目录";
        helpTree.node_enname = "newHelpDir";
        helpTree.node_type = "NODE_DIR";

        this.doAddHelpTree(helpTree);
    }

    onInputValueTitleChanged(e) {
        this.gDynamic.valueTitle = e.target.value;

        this.setState({
            isOlcEventEditing: true
        })
    }

    onInputValueDeveloperChanged(e) {
        this.gDynamic.valueDeveloper = e.target.value;

        this.setState({
            isOlcEventEditing: true
        })
    }

    onInputValueDescChanged(e) {
        this.gDynamic.valueDesc = e.target.value;

        this.setState({
            isOlcEventEditing: true
        })
    }

    onSelectValueStatusChanged(v) {
        this.gDynamic.valueStatus = v;

        this.setState({
            valueStatus: v
        });

        this.setState({
            isOlcEventEditing: true
        });
    }

    //todo >>>>> render
    render() {
        const optionsType = [
            {label: "新建", value: "NEW"},
            {label: "排队", value: "WAIT"},
            {label: "开干", value: "DOING"},
            {label: "搞定", value: "DONE"},
            {label: "废弃", value: "CLOSED"},
        ];
        return (
            <div className="HelpUs">
                <div className="BoxTreeOlcEvents">
                    <div className="BoxTitleBar">
                        <div className="BoxTitle">产品需求及问题列表</div>
                        <div className="BoxButtons">
                            <Button onClick={this.onButtonAddOlcEventsTreeNodeClicked} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>新建目录</Button>
                            <Button onClick={this.onButtonAddReqClicked} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>新建需求</Button>
                            <Button onClick={this.onButtonAddDesignClicked} size={"small"} type={"primary"} icon={<PlusSquareOutlined/>}>新建设计</Button>
                            <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddTaskClicked}>新建任务</Button>
                            <Button size={"small"} type={"primary"} icon={<PlusSquareOutlined/>} onClick={this.onButtonAddBugClicked}>上报BUG</Button>
                        </div>
                    </div>
                    <div ref={this.gRef.boxTreeOlcEvents} className={"BoxTreeInstance"}>
                        <Tree ref={this.gRef.treeOlcEvents}
                              treeData={this.state.treeDataOlcEvents}
                              onSelect={this.onTreeOlcEventsSelected}
                              height={this.state.treeOlcEventsHeight}
                              defaultExpandAll={true} blockNode={true} showLine={{showLeafIcon: false}} showIcon={true} switcherIcon={<CaretDownOutlined/>}/>
                    </div>
                </div>
                <div className="BoxOlcEventProperties">
                    <div className="BoxTitleBar">
                        <div className="BoxTitle">详情</div>
                        <div className="BoxButtons">
                            <Button size={"small"} type={"primary"} icon={<CloseOutlined/>} onClick={this.onButtonSaveClicked} disabled={!this.state.isOlcEventEditing}>保存</Button>
                            <Button size={"small"} type={"primary"} icon={<CloseOutlined/>} onClick={this.onButtonRecoverClicked} disabled={!this.state.isOlcEventEditing}>恢复</Button>
                        </div>
                    </div>
                    <Form className="BoxProperties" ref={this.gRef.formProperties} name="formProperties"
                          // onFinish={this.onFormPropertiesFinish}
                          // onFinishFailed={this.onFormPropertiesFinishFailed}
                    >
                        <div className="BoxRow">
                            <div className="BoxTitle">标题：</div>
                            <div className="BoxValueTitle"><Input ref={this.gRef.inputValueTitle} onChange={this.onInputValueTitleChanged}/></div>
                        </div>
                        <div className="BoxRow">
                            <div className="BoxTitle">用户：</div>
                            <div className="BoxValueCustomer">
                                <Input ref={this.gRef.inputValueCustomer} readOnly="readonly"/>
                            </div>
                        </div>
                        <div className="BoxRow">
                            <div className="BoxTitle">码农：</div>
                            <div className="BoxValueDeveloper"><Input ref={this.gRef.inputValueDeveloper} onChange={this.onInputValueDeveloperChanged}/></div>
                        </div>
                        <div className="BoxRow">
                            <div className="BoxTitle">状态：</div>
                            <div className="BoxValueStatus">
                                <Select options={optionsType} onChange={this.onSelectValueStatusChanged} value={this.state.valueStatus}/>
                            </div>
                        </div>
                        <div className="BoxRow">&nbsp;</div>
                        <div className="BoxRow">
                            <div className="BoxTitle">简述：</div>
                            <Form.Item name="valueDesc" className="BoxFormItemInput">
                                <Input.TextArea className="clsTextArea" autoSize={{ minRows: 13, maxRows: 13 }} onChange={this.onInputValueDescChanged}/>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
                <button id="shadowButton" className="shadowElement">shadow button</button>
            </div>
        )
    }
}

