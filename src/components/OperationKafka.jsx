import React from 'react'
import './OperationKafka.scss'
import GCtx from "../GCtx";
import K3 from "../utils/k3";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Tooltip, Tree} from 'antd'
import {
    CaretDownOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import G6 from '@antv/g6';
import TadMddTree from "../entity/TadMddTree";

export default class OperationKafka extends React.PureComponent {
    static contextType = GCtx;

    gMap = {
        containers: new Map(),
        zookeepers: new Map(),
        brokers: new Map(),
        topics: new Map(),
        partitions: new Map(),
        consumers: new Map(),
        consumerGroups: new Map(),
        producers: new Map()
    };
    gData = {};
    gCurrent = {};
    gRef = {
        g6GraphContainerBox: React.createRef(),
        g6GraphContainer: React.createRef(),
        formG6Properties: React.createRef(),
    };
    gDynamic = {};

    g6Graph = null;
    g6Data = {};
    g6Config = {
        s: 10
    }
    g6DataContainers = [
        {
            name: "brokers",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50
            },
            size: {
                w: 100,
                h: 50
            }
        },
        {
            name: "zookeepers",
            children: [],
            position: {
                x: 1000,
                y: (100 + 100 + 50) + (( 300 + 10 * (1+1)) - (200 + 10*2))/2
            },
            size: {
                w: 200,
                h: 200 + 10*2
            }
        },
        {
            name: "consumers",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50 + 300 + 10 * (1+1) + 50
            },
            size: {
                w: 500,
                h: 100
            }
        },
        {
            name: "producers",
            children: [],
            position: {
                x: 100,
                y: 100
            },
            size: {
                w: 150*3 + 10*(3+1),
                h: 100
            }
        },
    ];
    g6DataBrokers = [
        {
            name: "broker_1",
            children: [],
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 200,
                h: 300
            }
        },
        {
            name: "broker_2",
            children: [],
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 200,
                h: 300
            }
        },
        {
            name: "broker_3",
            children: [],
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 200,
                h: 300
            }
        },
    ];
    g6DataBrokers2 = [
        {
            name: "broker_4",
            children: [],
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 200,
                h: 300
            }
        }
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
            broker: "broker_1",
            type: "leader",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 180,
                h: 30
            }
        },
        {
            name: "topic_d-part_0",
            broker: "broker_1",
            type: "follower",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 180,
                h: 30
            }
        },
        {
            name: "topic_a-part_1",
            broker: "broker_2",
            type: "follower",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 100,
                h: 30
            }
        },
        {
            name: "topic_b-part_0",
            broker: "broker_2",
            type: "leader",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 180,
                h: 30
            }
        },
        {
            name: "topic_b-part_1",
            broker: "broker_3",
            type: "follower",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 160,
                h: 30
            }
        },
        {
            name: "topic_c-part_0",
            broker: "broker_3",
            type: "leader",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 180,
                h: 30
            }
        },
        {
            name: "topic_c-part_1",
            broker: "broker_1",
            type: "follower",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 120,
                h: 30
            }
        },
    ];
    g6DataPartitions2 = [
        {
            name: "topic_a-part_2",
            broker: "broker_4",
            type: "follower",
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 180,
                h: 30
            }
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
        this.doGetRecords = this.doGetRecords.bind(this);
        this.doGetRecords2 = this.doGetRecords2.bind(this);

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

        this.addContainers = this.addContainers.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.updateContainer = this.updateContainer.bind(this);
        this.addBroker = this.addBroker.bind(this);
        this.updateBroker = this.updateBroker.bind(this);
        this.addZookeeper = this.addZookeeper.bind(this);
        this.addProducer = this.addProducer.bind(this);
        this.addConsumer = this.addConsumer.bind(this);
        this.addPartition = this.addPartition.bind(this);
        this.updatePartition = this.updatePartition.bind(this);

        this.onG6ButtonAddBroker = this.onG6ButtonAddBroker.bind(this);

        this.onButtonG6ToPng = this.onButtonG6ToPng.bind(this);
        this.onButtonG6Save = this.onButtonG6Save.bind(this);

        this.onButtonAddMddDirClicked = this.onButtonAddMddDirClicked.bind(this);
        this.onButtonAddMddFlowClicked = this.onButtonAddMddFlowClicked.bind(this);

        this.onSelectG6TableColumnDataTypeChanged = this.onSelectG6TableColumnDataTypeChanged.bind(this);
        this.onTreeMddTreeSelected = this.onTreeMddTreeSelected.bind(this);
    }

    componentDidMount() {
        this.doPrepare();
        this.doGetAll();
    }

    doPrepare() {

    }

    async doInit() {
        this.g6Init();

        this.g6DataContainers.forEach((c) => {
            this.gMap.containers.set(c.name, c);
        })

        this.addContainers();
        this.g6Graph.changeData(this.g6Data);
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        await K3.sleep(1000);
        this.doGetRecords();
        this.g6Graph.changeData(this.g6Data);
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        await K3.sleep(1000);
        this.doGetRecords2();
        this.g6Graph.changeData(this.g6Data);
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        await K3.sleep(1000);
        this.updatePartition("topic_a-part_0");
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

    doGetRecords() {
        this.g6DataBrokers.forEach((b) => {
            if (!this.gMap.brokers.has(b.name)) {
                this.gMap.brokers.set(b.name, b);
                this.addBroker(b);
            } else {
                // do ...
            }
        })
        this.updateContainer("brokers");

        this.g6DataPartitions.forEach((p) => {
            if (!this.gMap.partitions.has(p.name)) {
                this.gMap.partitions.set(p.name, p);
                this.addPartition(p);
            } else {
                // do ...
            }
        })
    }

    doGetRecords2() {
        this.g6DataBrokers2.forEach((b) => {
            if (!this.gMap.brokers.has(b.name)) {
                this.gMap.brokers.set(b.name, b);
                this.addBroker(b);
            } else {
                // do ...
            }
        })

        this.updateContainer("brokers");

        this.g6DataPartitions2.forEach((p) => {
            if (!this.gMap.partitions.has(p.name)) {
                this.gMap.partitions.set(p.name, p);
                this.addPartition(p);
            } else {
                // do ...
            }
        })
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

    //todo <<<<< now >>>>> G6 初始化
    g6Init() {
        let wg = this.gRef.g6GraphContainer.current.scrollWidth;
        let hg = this.gRef.g6GraphContainer.current.scrollHeight || 500;
        this.g6Graph = new G6.Graph({
            container: this.gRef.g6GraphContainer.current,
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
        });

        this.g6Data.combos = [];
        this.g6Data.nodes = [];
        this.g6Data.edges = [];

        this.g6Graph.data(this.g6Data);
        this.g6Graph.render();
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        // let indexOfBrokers = 0;
        // this.g6DataBrokers.forEach((itemBroker) => {
        //     this.addBroker(itemBroker, indexOfBrokers);
        //     indexOfBrokers++;
        // })
        //
        // let indexOfZookeepers = 0;
        // this.g6DataZookeepers.forEach((itemZookeeper) => {
        //     this.addZookeeper(itemZookeeper, indexOfZookeepers);
        //     indexOfZookeepers++;
        // })
        // this.g6Graph.changeData(this.g6Data);
    }

    addContainers() {
        this.gMap.containers.forEach((value) => {
            this.addContainer(value);
        });
    }

    //todo <<<<< now >>>>> 添加容器
    addContainer(container) {
        let modelContainer = {
            id: container.name,
            type: "rect",
            label: container.name,
            size: [container.size.w, container.size.h],
            x: container.position.x + container.size.w/2,
            y: container.position.y + container.size.h/2,
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
            },
            tag: {
                name: container.name
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelContainer);
    }

    updateContainer(containerId) {
        this.g6Data.nodes.forEach((node) => {
            if (node.tag.name === containerId) {
                let container = this.gMap.containers.get(containerId);
                let wNew = 0;
                let hNew = 0;
                container.children.forEach((b) => {
                    let broker = this.gMap.brokers.get(b);
                    wNew += broker.size.w
                    if (hNew < broker.size.h) hNew = broker.size.h;
                })
                wNew += (container.children.length + 1) * this.g6Config.s;
                hNew += 2 * this.g6Config.s;
                let w = node.size[0];
                let h = node.size[1];
                node.x += (wNew - w)/2;
                node.y += (hNew - h)/2;
                node.size[0] = wNew;
                node.size[1] = hNew;
            }
        })
    }

    //todo <<<<< now >>>>> 绘制 broker
    addBroker(broker) {
        let container = this.gMap.containers.get("brokers");
        let index = container.children.length;
        let xb = container.position.x + this.g6Config.s, yb = container.position.y + this.g6Config.s;
        let modelBroker = {
            id: broker.name,
            type: "rect",
            label: broker.name,
            size: [broker.size.w, broker.size.h],
            x: xb + broker.size.w/2 + (broker.size.w + this.g6Config.s) * index,
            y: yb + broker.size.h/2,
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
            },
            tag: {
                name: broker.name
            }
        }

        broker.position.x = modelBroker.x - broker.size.w/2;
        broker.position.y = modelBroker.y - broker.size.h/2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelBroker);
        this.gMap.containers.get("brokers").children.push(broker.name);
    }

    updateBroker(broker) {

    }

    //todo <<<<< now >>>>> 绘制 zookeeper
    addZookeeper(broker, index) {
        let container = this.g6Graph.findById("zookeepers");
        let containerModel = container.getModel();
        console.log(containerModel);
        let xb = containerModel.x - containerModel.size[0]/2 + this.g6Config.s, yb = containerModel.y - containerModel.size[1]/2 + this.g6Config.s;
        let w = 100, h = 200;
        let modelZookeeper = {
            id: broker.name,
            comboId: "comboZookeepers",
            type: "rect",
            label: broker.name,
            size: [w, h],
            x: xb + w / 2 + (w + this.g6Config.s) * index,
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

    //todo <<<<< now >>>>> add partition
    addPartition(partition) {
        let broker = this.gMap.brokers.get(partition.broker);
        let index = broker.children.length;
        let xb = broker.position.x + this.g6Config.s, yb = broker.position.y + this.g6Config.s;
        let modelPartition = {
            id: partition.name,
            type: "rect",
            label: partition.name,
            size: [partition.size.w, partition.size.h],
            x: xb + partition.size.w / 2,
            y: yb + (partition.size.h + this.g6Config.s) * index + partition.size.h / 2,
            style: {
                fill: "lightblue",
                radius: 2,
            },
            labelCfg: {
                offset: 100,
                style: {
                    fill: "black",
                    fontSize: 12,
                }
            },
            tag: {
                name: broker.name
            }
        }

        partition.position.x = modelPartition.x - partition.size.w/2;
        partition.position.y = modelPartition.y - partition.size.h/2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartition);
        this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    updatePartition(partitionId) {
        let nodePartition = this.g6Graph.findById(partitionId);
        console.log(nodePartition.getContainer().get("children")[0]);
        // this.g6Graph.setItemState(partitionId, 'selected', true);
        nodePartition.getContainer().get("children")[0].animate(
            {
                opacity: 0.1,
            },
            {
                repeat: true, // 循环
                duration: 1000,
                easing: 'easeCubic',
                delay: 0, // 无延迟
            },
        );
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

    //todo <<<<< now >>>>> on button G6 Save clicked
    onButtonG6Save(e) {

    }

    onButtonG6ToPng(e) {

    }

    onSelectG6TableColumnDataTypeChanged(v) {
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
                                                onClick={this.onButtonG6ToPng}>导出</Button>
                                    </div>
                                </div>
                                <div ref={this.gRef.g6GraphContainerBox} className="box-canvas">
                                    <div ref={this.gRef.g6GraphContainer}/>
                                </div>
                            </div>
                            <div className={"box-properties"}>
                                <div
                                    className={"form-g6-properties"}>
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
                                                            onChange={this.onSelectG6TableColumnDataTypeChanged}/>
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

