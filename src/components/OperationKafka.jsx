import React from 'react'
import './OperationKafka.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Tooltip, Tree} from 'antd'
import {
    CaretDownOutlined,
    CaretLeftOutlined,
    CaretRightOutlined,
    CloseOutlined,
    PlusSquareOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import EditableCellTool from "./EditableCellTool";
import {Graph, Addon, Shape, DataUri} from "@antv/x6";
import G6 from '@antv/g6';
import TadMddFlow from "../entity/TadMddFlow";
import TadMddTree from "../entity/TadMddTree";
import TadTableErTree from "../entity/TadTableErTree";
import TadTableEr from "../entity/TadTableEr";

const {Stencil} = Addon;
const {Rect} = Shape;

export default class OperationKafka extends React.PureComponent {
    static contextType = GCtx;

    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {
        x6StencilContainerBox: React.createRef(),
        x6GraphContainerBox: React.createRef(),
        x6GraphContainer: React.createRef(),
        formX6Properties: React.createRef(),
    };
    gDynamic = {};

    g6Graph = null;
    g6Data = {};
    g6DataContainers = [
        {
            name: "container_1",
            type: "brokers"
        },
        {
            name: "container_2",
            type: "zookeepers"
        },
        {
            name: "container_3",
            type: "consumers"
        },
        {
            name: "container_4",
            type: "producers"
        },
    ];
    g6DataBrokers = [
        {
            name: "broker_1",
        },
        {
            name: "broker_2",
        },
        {
            name: "broker_3",
        },
    ];
    g6DataTopics = [
        {
            name: "topic_a",
            partitions: ["topic_a-part_0", "topic_a-part_1", "topic_a-part_2"]
        }
    ]
    g6DataPartitions = [
        {
            name: "topic_a-part_0",
            broker: "broker1",
            type: "leader"
        },
        {
            name: "topic_a-part_0",
            broker: "broker2",
            type: "follower"
        },
        {
            name: "topic_a-part_1",
            broker: "broker2",
            type: "leader"
        },
        {
            name: "topic_a-part_1",
            broker: "broker3",
            type: "follower"
        },
        {
            name: "topic_b-part_2",
            broker: "broker3",
            type: "leader"
        },
        {
            name: "topic_b-part_2",
            broker: "broker1",
            type: "follower"
        },
    ];
    g6DataProducers = [
        {
            name: "producer_1"
        },
        {
            name: "producer_2"
        },
        {
            name: "producer_3"
        },
        {
            name: "producer_4"
        },
    ]
    g6DataConsumerGroups = [
        {
            name: "group_1",
            consumers: ["consumer_1", "consumer_2", "consumer_3"]
        },
        {
            name: "group_2",
            consumers: ["consumer_4", "consumer_5"]
        }
    ]
    g6DataConsumers = [
        {
            name: "consumer_1"
        },
        {
            name: "consumer_2"
        },
        {
            name: "consumer_3"
        },
        {
            name: "consumer_4"
        },
        {
            name: "consumer_5"
        },
    ]
    g6DataZookeepers = [
        {
            name: "zookeeper_1"
        },
        {
            name: "zookeeper_2"
        },
        {
            name: "zookeeper_3"
        }
    ]

    constructor(props) {
        super(props);

        this.state = {
            treeDataMddTree: [],
            isMddTreeEditing: false,
        }

        //todo >>>>> bind(this)
        this.doPrepare = this.doPrepare.bind(this);
        this.doInit = this.doInit.bind(this);

        this.doGetAll = this.doGetAll.bind(this);

        this.commTrees2antdTree = this.commTrees2antdTree.bind(this);

        this.restGetTadMddTrees = this.restGetTadMddTrees.bind(this);
        this.restAddTadMddTree = this.restAddTadMddTree.bind(this);
        this.restUpdateTadMddTree = this.restUpdateTadMddTree.bind(this);
        this.restDeleteTadMddTree = this.restDeleteTadMddTree.bind(this);
        this.doAddTadMddTree = this.doAddTadMddTree.bind(this);
        this.doUpdateTadMddTree = this.doUpdateTadMddTree.bind(this);
        this.doDeleteTadMddTree = this.doDeleteTadMddTree.bind(this);
        this.uiUpdateTadMddTree = this.uiUpdateTadMddTree.bind(this);

        this.restGetTadMddFlow = this.restGetTadMddFlow.bind(this);
        this.restAddTadMddFlow = this.restAddTadMddFlow.bind(this);
        this.restUpdateTadMddFlow = this.restUpdateTadMddFlow.bind(this);
        this.restDeleteTadMddFlow = this.restDeleteTadMddFlow.bind(this);

        this.doGetTadMddFlow = this.doGetTadMddFlow.bind(this);
        this.doAddTadMddFlow = this.doAddTadMddFlow.bind(this);
        this.doUpdateTadMddFlow = this.doUpdateTadMddFlow.bind(this);
        this.doDeleteTadMddFlow = this.doDeleteTadMddFlow.bind(this);

        this.addContainer = this.addContainer.bind(this);
        this.updateContainer = this.updateContainer.bind(this);
        this.addBroker = this.addBroker.bind(this);
        this.addZookeeper = this.addZookeeper.bind(this);
        this.addProducer = this.addProducer.bind(this);
        this.addConsumer = this.addConsumer.bind(this);
        this.addTopicPartition = this.addTopicPartition.bind(this);

        this.onG6ButtonAddBroker = this.onG6ButtonAddBroker.bind(this);

        this.x6SetFormItems = this.x6SetFormItems.bind(this);
        this.onFormX6PropertiesFinish = this.onFormX6PropertiesFinish.bind(this);
        this.onButtonX6ToPng = this.onButtonX6ToPng.bind(this);
        this.onButtonX6Save = this.onButtonX6Save.bind(this);

        this.onButtonX6FormConfirmClicked = this.onButtonX6FormConfirmClicked.bind(this);
        this.onButtonX6FormCancelClicked = this.onButtonX6FormCancelClicked.bind(this);
        this.onButtonAddMddDirClicked = this.onButtonAddMddDirClicked.bind(this);
        this.onButtonAddMddFlowClicked = this.onButtonAddMddFlowClicked.bind(this);

        this.onSelectX6TableColumnDataTypeChanged = this.onSelectX6TableColumnDataTypeChanged.bind(this);
        this.onTreeMddTreeSelected = this.onTreeMddTreeSelected.bind(this);
    }

    componentDidMount() {
        this.doPrepare();
        this.doGetAll();
    }

    doPrepare() {

    }

    doInit() {
        // this.x6Init();
        this.g6Init();
    }

    //todo >>>>> do Get All
    doGetAll() {
        axios.all([
            this.restGetTadMddTrees(),
        ]).then(axios.spread((
            mddTrees,
        ) => {
            let dsMddTrees = mddTrees.data.data;
            //let mapErTables = new Map();

            let treeDataMddTree = [];
            for (let i = 0; i < dsMddTrees.length; i++) {
                if (dsMddTrees[i].node_parent_id === -1) {
                    let nodeRoot = {
                        key: dsMddTrees[i].uuid,
                        title: dsMddTrees[i].node_zhname,
                        children: [],
                        tag: {
                            nodeType: "NODE_DIR"
                        }
                    }
                    let nodeTrees = this.commTrees2antdTree(dsMddTrees, dsMddTrees[i].uuid, nodeRoot);
                    treeDataMddTree.push(nodeTrees);
                }
            }
            this.setState({
                treeDataMddTree: treeDataMddTree
            })

        })).then(() => {
            this.doInit();
        });
    }

    restGetTadMddTrees() {
        let params = {};

        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/get_mdd_trees",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddTadMddTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/add_mdd_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTadMddTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/update_mdd_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTadMddTree(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/delete_mdd_tree",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doAddTadMddTree(params) {
        this.restAddTadMddTree(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    this.uiUpdateTadMddTree(result.data.data, "add");
                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    doUpdateTadMddTree(params) {
        this.restUpdateTadMddTree(params).then((result) => {
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

    doDeleteTadMddTree(params) {
        this.restDeleteTadMddTree(params).then((result) => {
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

    restGetTadMddFlow(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/get_mdd_flow",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restAddTadMddFlow(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/add_mdd_flow",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restUpdateTadMddFlow(params) {
        console.log(params);
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/update_mdd_flow",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    restDeleteTadMddFlow(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/mdd/delete_mdd_flow",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetTadMddFlow(params) {
        this.restGetTadMddFlow(params).then((result) => {
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

    doAddTadMddFlow(params) {
        this.restAddTadMddFlow(params).then((result) => {
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

    doUpdateTadMddFlow(params) {
        this.restUpdateTadMddFlow(params).then((result) => {
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

    doDeleteTadMddFlow(params) {
        this.restDeleteTadMddFlow(params).then((result) => {
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


    onButtonX6FormConfirmClicked() {

    }

    onButtonX6FormCancelClicked() {

    }

    onFormX6PropertiesInitialValues() {

    }

    onFormX6PropertiesFinish(values) {
        let nodeData = this.gCurrent.node.getData();

        if (nodeData.nodeType === "table") {
            let newTableName = values.tableName;

            this.gCurrent.node.attr('label/text', newTableName);
            this.gCurrent.node.setData({tableName: newTableName})
        } else if (nodeData.nodeType === "table_column") {
            let newColumnName = values.tableColumnName;

            this.gCurrent.node.attr('label/text', newColumnName);
            this.gCurrent.node.setData({columnName: newColumnName});
        }
    }

    x6SetFormItems() {
        let nodeData = this.gCurrent.node.getData();

        if (nodeData.nodeType === "table") {
            let tableName = this.gCurrent.nodeAttrs.label.text;

            this.gRef.formX6Properties.current.setFieldsValue({
                tableName: tableName,
            });
        } else if (nodeData.nodeType === "table_column") {
            let columnName = nodeData.columnName;
            let dataType = nodeData.dataType === undefined ? -99999 : nodeData.dataType;

            this.gRef.formX6Properties.current.setFieldsValue({
                tableColumnName: columnName,
                tableColumnDataType: dataType,
            });
        }
    }

    x6ElementsStyleReset() {
        const nodes = this.x6Graph.getNodes();
        const edges = this.x6Graph.getEdges();

        nodes.forEach(node => {
            node.attr('body/stroke', '#000')
        })

        edges.forEach(edge => {
            edge.attr('line/stroke', 'black')
            edge.prop('labels/0', {
                attrs: {
                    body: {
                        stroke: 'black'
                    }
                }
            })
        })
    }

    //todo <<<<< now >>>>> G6 初始化
    g6Init() {


        let wg = this.gRef.x6GraphContainer.current.scrollWidth;
        let hg = this.gRef.x6GraphContainer.current.scrollHeight || 500;
        this.g6Graph = new G6.Graph({
            container: this.gRef.x6GraphContainer.current,
            width: wg,
            height: hg,
            groupByTypes: false,
            modes: {
                default: ['drag-canvas'],
            },
        });

        this.g6Graph.on('combo:click', (evt) => {
            const item = evt.item;
            const target = evt.target;
            console.log(item, target);
        });

        this.g6Data.combos = [];
        this.g6Data.nodes = [];
        this.g6Data.edges = [];

        this.g6DataContainers.forEach((itemContainer) => {
            let position = {
                x: 0,
                y: 0
            };
            let size = {
                width: 100,
                height: 100
            }
            switch (itemContainer.type) {
                case "producers":
                    position.x = 100;
                    position.y = 100;
                    size.width = 150*3 + 10*(3+1);
                    size.height = 100;
                    break
                case "brokers":
                    position.x = 100;
                    position.y = 100 + 100 + 50;
                    size.width = 150*3 + 10*(3+1);
                    size.height = 300 + 10 * (1+1);
                    break
                case "zookeepers":
                    position.x = 100 + 500 + 50;
                    position.y = (100 + 100 + 50) + (( 300 + 10 * (1+1)) - (200 + 10*2))/2;
                    size.width = 100*3 + 10*4;
                    size.height = 200 + 10*2;
                    break
                case "consumers":
                    position.x = 100;
                    position.y = 100 + 100 + 50 + 300 + 10 * (1+1) + 50;
                    size.width = 500;
                    size.height = 100;
                    break
                default:
                    break
            }
            this.addContainer(itemContainer, position, size);
        })

        this.g6Graph.data(this.g6Data);
        this.g6Graph.render();
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        let indexOfBrokers = 0;
        this.g6DataBrokers.forEach((itemBroker) => {
            this.addBroker(itemBroker, indexOfBrokers);
            indexOfBrokers++;
        })

        let indexOfZookeepers = 0;
        this.g6DataZookeepers.forEach((itemZookeeper) => {
            this.addZookeeper(itemZookeeper, indexOfZookeepers);
            indexOfZookeepers++;
        })
        this.g6Graph.changeData(this.g6Data);
    }

    //todo <<<<< now >>>>> 添加容器
    addContainer(container, position, size) {
        let modelContainer = {
            id: container.name,
            type: "rect",
            label: container.name,
            size: [size.width, size.height],
            x: position.x + size.width/2,
            y: position.y + size.height/2,
            style: {
                fill: "darkgray",
                radius: 10,
            },
            labelCfg: {
                offset: 100,
                style: {
                    fill: "white",
                    fontSize: 16,
                }
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelContainer);
    }


    updateContainer(containerId) {

    }

    //todo <<<<< now >>>>> 绘制 broker
    addBroker(broker, index) {
        let container = this.g6Graph.findById("container_1");
        let containerModel = container.getModel();
        let s = 10;
        let xb = containerModel.x - containerModel.size[0]/2 + 10, yb = containerModel.y - containerModel.size[1]/2 + 10;
        let w = 150, h = 300;
        let modelBroker = {
            id: broker.name,
            comboId: "comboBrokers",
            type: "rect",
            label: broker.name,
            size: [w, h],
            x: xb + w/2 + (w + s) * index,
            y: yb + h/2,
            style: {
                fill: "darkgreen",
                radius: 10,
            },
            labelCfg: {
                offset: 100,
                style: {
                    fill: "white",
                    fontSize: 16,
                }
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelBroker);
    }

    //todo <<<<< now >>>>> 绘制 zookeeper
    addZookeeper(broker, index) {
        let container = this.g6Graph.findById("container_2");
        let containerModel = container.getModel();
        console.log(containerModel);
        let s = 10;
        let xb = containerModel.x - containerModel.size[0]/2 + 10, yb = containerModel.y - containerModel.size[1]/2 + 10;
        let w = 100, h = 200;
        let modelZookeeper = {
            id: broker.name,
            comboId: "comboZookeepers",
            type: "rect",
            label: broker.name,
            size: [w, h],
            x: xb + w / 2 + (w + s) * index,
            y: yb + h / 2,
            style: {
                fill: "darkgreen",
                radius: 10,
            },
            labelCfg: {
                offset: 100,
                style: {
                    fill: "white",
                    fontSize: 16,
                }
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelZookeeper);
    }

    addProducer(producer, index) {

    }

    addConsumer(consumer, index) {

    }

    addTopicPartition(partition, index) {

    }

    //todo <<<<< now >>>>> 新增 broker
    onG6ButtonAddBroker(e) {
        let indexBroker = this.g6DataBrokers.length;
        let nodeBroker = {
            name: "broker_" + (indexBroker + 1)
        }
        this.g6DataBrokers.push(nodeBroker);
        this.addBroker(nodeBroker, indexBroker);
        this.g6Graph.changeData(this.g6Data);
        let nodes = this.g6Graph.getNodes();
        nodes.forEach((itemNode) => {
            itemNode.toFront();
        })
    }

    onButtonX6ToPng(e) {
        this.x6Graph.toPNG((dataUri) => {
            DataUri.downloadDataUri(dataUri, "x6ErInstance.png");
        }, {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        })
    }

    //todo <<<<< now >>>>> on button X6 Save clicked
    onButtonX6Save(e) {
        this.myJson = this.x6Graph.toJSON();
        let strJson = JSON.stringify(this.myJson);
        let myMddFlow = new TadMddFlow();
        myMddFlow.mdd_flow_id = this.gCurrent.mddTreeNode.id;
        myMddFlow.mdd_flow_content = strJson;
        console.log(myMddFlow);
        this.doUpdateTadMddFlow(myMddFlow);
    }

    onSelectX6TableColumnDataTypeChanged(v) {
        // this.gDynamic.x6TableColumnDataType = v;
        let nodeType = v;
        this.gCurrent.node.setData({
            dataType: v
        })

        switch (nodeType) {
            case "int":
                this.gCurrent.node.addPort({
                    id: 'portLeft',
                    group: "groupLeft",
                    attrs: {
                        circle: {
                            connectionCount: 1,
                            r: 5,
                            magnet: true,
                            stroke: '#AFDEFF',
                            fill: '#FFF',
                            strokeWidth: 1,
                        },
                    },
                });

                this.gCurrent.node.addPort({
                    id: 'portRight',
                    group: "groupRight",
                    attrs: {
                        circle: {
                            connectionCount: 2,
                            r: 5,
                            magnet: true,
                            stroke: '#AFDEFF',
                            fill: '#FFF',
                            strokeWidth: 1,
                        },
                    },
                });
                break
            default:
                this.gCurrent.node.removePort("portLeft");
                this.gCurrent.node.removePort("portRight");
                break
        }
    }

    //todo <<<<< now >>>>> on button Add Table Er Dir clicked
    onButtonAddMddDirClicked(e) {
        let erTree = new TadMddTree();

        if ((this.gCurrent.mddTreeNode !== null) && (this.gCurrent.mddTreeNode !== undefined)) {
            if (this.gCurrent.mddTreeNode.nodeType !== "NODE_DIR") return
            erTree.node_parent_id = this.gCurrent.mddTreeNode.id;
        } else {
            erTree.node_parent_id = -1;
        }

        erTree.node_zhname = "新增目录";
        erTree.node_enname = "newErDir";
        erTree.node_type = "NODE_DIR";

        this.doAddTadMddTree(erTree);
    }

    onButtonAddMddFlowClicked(e) {
        let erTree = new TadMddTree();

        if ((this.gCurrent.mddTreeNode !== null) && (this.gCurrent.mddTreeNode !== undefined)) {
            if (this.gCurrent.mddTreeNode.nodeType !== "NODE_DIR") return

            erTree.node_parent_id = this.gCurrent.mddTreeNode.id;
        } else {
            erTree.node_parent_id = -1;
        }

        erTree.node_zhname = "新增模型驱动数据流图";
        erTree.node_enname = "newMddFlow";
        erTree.node_type = "NODE_MDD_FLOW";

        this.doAddTadMddTree(erTree);
    }

    onTreeMddTreeSelected(selectedKeys, info) {
        if (info.selected) {
            this.gCurrent.mddTreeNode = {
                id: selectedKeys[0],
                nodeType: info.node.tag.nodeType,
            }
        }

        console.log(this.gCurrent);

        if (info.selected && info.node.tag.nodeType === "NODE_MDD_MODEL") {
            /*
            const nodes = this.x6Graph.getNodes();
            nodes.forEach((itemNode) => {
                let nodeData = itemNode.getData();
                if (nodeData.nodeType.toUpperCase() === "TABLE") {
                    if (nodeData.nodeId === selectedKeys[0]) {
                        this.x6Graph.scrollToCell(itemNode);
                    }
                }
            })
             */
        }

        if (info.selected && info.node.tag.nodeType === "NODE_MDD_FLOW") {
            let nodeId = selectedKeys[0];
            let myMddFlow = new TadMddFlow();
            myMddFlow.mdd_flow_id = nodeId;
            this.restGetTadMddFlow(myMddFlow).then((result) => {
                if (result.status === 200) {
                    if (result.data.success) {
                        if ((result.data.data !== null) && (result.data.data !== undefined)) {
                            let content = result.data.data.mdd_flow_content;
                            if (content !== null) {
                                let buffer = new Uint8Array(content.data);
                                let strJson = new TextDecoder('utf-8').decode(buffer);
                                let myJson = JSON.parse(strJson);
                                this.x6Graph.fromJSON(myJson);
                                this.x6Graph.scrollToContent();

                                //todo <<<<< now >>>>> 监测表结构是否变化，如果变化，增更新ER图
                                let tables = [];
                                const nodes = this.x6Graph.getNodes();
                                nodes.forEach((itemNode) => {
                                    let nodeData = itemNode.getData();

                                    if (nodeData.nodeType.toUpperCase() === "TABLE") {
                                        tables.push({id: nodeData.nodeId, columns: []});
                                        if (nodeData.nodeId === selectedKeys[0]) {
                                            // itemNode.setAttrs({
                                            //     body: { fill: '#f5f5f5' },
                                            // })
                                            this.x6Graph.scrollToCell(itemNode);
                                        }
                                        const nodeChildren = itemNode.getChildren();
                                        nodeChildren.forEach((itemNodeChild) => {
                                            const nodeChildData = itemNodeChild.getData();
                                            if (nodeChildData.nodeType.toUpperCase() === "TABLE_COLUMN") {
                                                tables[tables.length - 1].columns.push(nodeChildData.nodeId);
                                            }
                                        })
                                    }
                                })
                                console.log("用于检测表格字段是否发生变化", tables);

                                this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                            }
                        }
                    } else {
                        this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                    }
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
                }
            });
        }
    };

    uiUpdateTadMddTree(erTree, what) {
        let treeDataMddTree;

        switch (what) {
            case "add":
                treeDataMddTree = lodash.cloneDeep(this.state.treeDataMddTree);

                let uiTree = {
                    key: erTree.uuid,
                    title: erTree.node_zhname,
                    children: [],
                    tag: {
                        nodeType: erTree.node_type
                    }
                }

                if (erTree.node_parent_id === -1) {
                    treeDataMddTree.push(uiTree);
                } else {
                    this.getCommTreeNode(treeDataMddTree, this.gCurrent.mddTreeNode.id, uiTree);
                }

                this.setState({
                    treeDataMddTree: treeDataMddTree
                })
                break
            case "adds":
                treeDataMddTree = lodash.cloneDeep(this.state.treeDataMddTree);

                erTree.forEach((itemErTreeNode) => {
                    let uiTree = {
                        key: itemErTreeNode.uuid,
                        title: itemErTreeNode.node_zhname,
                        children: [],
                        tag: {
                            nodeType: itemErTreeNode.node_type
                        }
                    }

                    if (itemErTreeNode.node_parent_id === -1) {
                        treeDataMddTree.push(uiTree);
                    } else {
                        this.getCommTreeNode(treeDataMddTree, this.gCurrent.mddTreeNode.id, uiTree);
                    }
                });

                this.setState({
                    treeDataTableErs: treeDataMddTree
                })
                break
            case "update":
                treeDataMddTree = lodash.cloneDeep(this.state.treeDataMddTree);

                // this.setProjectTitle(treeDataTableErTrees, erTree.id, erTree.node_zhname);

                this.setState({
                    isMddTreeEditing: false,
                    treeDataMddTree: treeDataMddTree
                })
                break
            case "delete":
                treeDataMddTree = lodash.cloneDeep(this.state.treeDataMddTree);

                // this.deleteProject(treeDataTableErTrees, this.gCurrent.project.id);
                this.gCurrent.mddTreeNode = null;

                this.setState({
                    treeDataMddTree: treeDataMddTree
                })
                break
            default:
                break;
        }
    }

    commTrees2antdTree(treeNodes, pId, uiTrees) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].node_parent_id === pId) {
                let uiTree = {
                    key: treeNodes[i].uuid,
                    title: treeNodes[i].node_zhname,
                    children: [],
                    tag: {
                        nodeType: treeNodes[i].node_type
                    }
                }
                uiTrees.children.push(uiTree);
                this.commTrees2antdTree(treeNodes, treeNodes[i].uuid, uiTree);
            }
        }

        return uiTrees;
    }

    getCommTreeNode(treeNodes, id, uiTree) {
        for (let i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].key === id) {
                treeNodes[i].children.push(uiTree);
                return
            } else {
                this.getCommTreeNode(treeNodes[i].children, id, uiTree);
            }
        }
    }

    //todo >>>>> render
    render() {
        const optionsDataType = [
            {label: "请选择", value: -99999},
            {label: "字符串", value: "string"},
            {label: "整数", value: "int"},
            {label: "浮点数", value: "double"},
            {label: "日期", value: "datetime"},
        ];

        return (
            <div className="OperationKafka">
                <div className={"BoxErDiagram"}>
                    <div className="BoxTitleBar">
                        <div className="BoxTitle"/>
                    </div>
                    <div className="BoxContent">
                        <div className={"BoxKafkas"}>
                            <div className={"BoxUpDown"}>
                                <div className="BoxToolbarErDiagram">
                                    <div className="box-properties-title-bar">
                                        <div className="box-properties-title">监控对象列表</div>
                                    </div>
                                    <div className={"BoxSearch"}>
                                        <Input.Search placeholder="Search" size="small" enterButton
                                                      onChange={this.onInputSearchSchemasChanged}
                                                      onSearch={this.onInputSearchSchemasSearched}/>
                                    </div>
                                </div>
                                <div className={"BoxTreeErDiagram"}>
                                    <div className={"BoxTree"}>
                                        <div className={"BoxTreeInstance"}>
                                            <Tree ref={this.gRef.treeTadMddTree}
                                                  treeData={this.state.treeDataMddTree}
                                                // onSelect={this.onTreeMddTreeSelected}
                                                  selectable={!this.state.isMddTreeEditing}
                                                  className={"TreeKnown"} switcherIcon={<CaretDownOutlined/>}
                                                  blockNode={true} showLine={true} showIcon={true}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"box-box-canvas"}>
                                <div className={"box-box-canvas-toolbar"}>
                                    <div className={"box-box-canvas-toolbar-title"}>&nbsp;</div>
                                    <div className={"box-box-canvas-toolbar-buttons"}>
                                        <Button size={"small"} type={"primary"}
                                                onClick={this.onG6ButtonAddBroker}>新增Broker</Button>
                                        <Button size={"small"} type={"primary"}
                                                onClick={this.onButtonX6ToPng}>导出</Button>
                                    </div>
                                </div>
                                <div ref={this.gRef.x6GraphContainerBox} className="box-canvas">
                                    <div ref={this.gRef.x6GraphContainer}/>
                                </div>
                            </div>
                            <div className={"box-properties"}>
                                <div
                                    className={"form-x6-properties"}>
                                    <div className="BoxToolbarErDiagram">
                                        <div className="box-properties-title-bar">
                                            <div className="box-properties-title">对象属性列表</div>
                                        </div>
                                        <div className={"BoxSearch"}>
                                            <Input.Search placeholder="Search" size="small" enterButton
                                                          onChange={this.onInputSearchSchemasChanged}
                                                          onSearch={this.onInputSearchSchemasSearched}/>
                                        </div>
                                    </div>
                                    <div className={"box-properties-content"}>
                                        <div
                                            className={this.state.nodeType === "table" ? "box-form-items-table" : "BoxHidden"}>
                                            <Form.Item className="box-form-item-input">
                                                <Form.Item name="tableName" noStyle><Input/></Form.Item>
                                                <Tooltip placement="topLeft" title="请输入表名称" arrowPointAtCenter>
                                                    <div className="input-icon"><QuestionCircleOutlined/></div>
                                                </Tooltip>
                                            </Form.Item>
                                        </div>
                                        <div
                                            className={this.state.nodeType === "table_column" ? "box-form-items-table-column" : "BoxHidden"}>
                                            <Form.Item className="box-form-item-input">
                                                <Form.Item name="tableColumnName" noStyle><Input/></Form.Item>
                                                <Tooltip placement="topLeft" title="请输入表字段名称" arrowPointAtCenter>
                                                    <div className="input-icon"><QuestionCircleOutlined/></div>
                                                </Tooltip>
                                            </Form.Item>
                                            <Form.Item className="box-form-item-input">
                                                {/*<Form.Item name="tableColumnDataType" noStyle><Input/></Form.Item>*/}
                                                <Form.Item name="tableColumnDataType" noStyle>
                                                    <Select options={optionsDataType}
                                                            onChange={this.onSelectX6TableColumnDataTypeChanged}/>
                                                </Form.Item>
                                                <Tooltip placement="topLeft" title="请选择表字段数据类型" arrowPointAtCenter>
                                                    <div className="input-icon"><QuestionCircleOutlined/></div>
                                                </Tooltip>
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={"BoxAlarms"}>
                            <div className="BoxToolbarErDiagram">
                                <div className="box-properties-title-bar">
                                    <div className="box-properties-title">活动告警列表</div>
                                </div>
                                <div className={"BoxSearch"}>
                                    <Input.Search placeholder="Search" size="small" enterButton
                                                  onChange={this.onInputSearchSchemasChanged}
                                                  onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                            </div>
                            <div className={"box-properties-content"}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

