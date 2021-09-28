import React from 'react'
import './OperationKafka.scss'
import GCtx from "../GCtx";
import K3 from "../utils/k3";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Table, Tooltip, Tree} from 'antd'
import {
    CaretDownOutlined, PlusSquareOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import G6 from '@antv/g6';
import TadMddTree from "../entity/TadMddTree";
import TadDbConnection from "../entity/TadDbConnection";

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
        boxTableAlarms: React.createRef(),
        splitter: React.createRef(),
        splitterUp: React.createRef(),
    };
    gDynamic = {
        isMouseDown: false
    };

    g6Graph = null;
    g6Data = {};
    g6Config = {
        s: 10,
        sH: 80,
        sV: 100,
        workflow: [
            {
                name: "app_alarms_center",
                type: "NODE_APPLICATION",
                parentNode: "ROOT",
                direction: "BEGIN"
            },
            {
                name: "queue_alarms_collector",
                type: "NODE_QUEUE",
                parentNode: "app_alarms_center",
                direction: "RIGHT"
            },
            {
                name: "service_alarms_transfer",
                type: "NODE_SERVICE",
                parentNode: "queue_alarms_collector",
                direction: "RIGHT"
            },
            {
                name: "queue_alarms_transfer",
                type: "NODE_QUEUE",
                parentNode: "service_alarms_transfer",
                direction: "RIGHT"
            },
            {
                name: "service_alarms_filter",
                type: "NODE_SERVICE",
                parentNode: "queue_alarms_transfer",
                direction: "UP"
            },
            {
                name: "service_alarms_eoms",
                type: "NODE_SERVICE",
                parentNode: "service_alarms_filter",
                direction: "UP"
            },
            // {name: "service_alarms_filter2", type: "NODE_SERVICE", parentNode: "queue_alarms_transfer", direction: "DOWN"},
            {
                name: "app_eoms",
                type: "NODE_APPLICATION",
                parentNode: "service_alarms_eoms",
                direction: "UP"
            },
            {
                name: "queue_alarms_matcher",
                type: "NODE_QUEUE",
                parentNode: "service_alarms_filter",
                direction: "LEFT"
            },
            {
                name: "service_alarms_cache",
                type: "NODE_SERVICE",
                parentNode: "queue_alarms_matcher",
                direction: "LEFT"
            },
            {
                name: "queue_alarms_client_worker",
                type: "NODE_QUEUE",
                parentNode: "service_alarms_cache",
                direction: "LEFT"
            },
            {
                name: "service_alarms_view",
                type: "NODE_SERVICE",
                parentNode: "queue_alarms_client_worker",
                direction: "UP"
            },
            {
                name: "app_alarms_monitor",
                type: "NODE_APPLICATION",
                parentNode: "service_alarms_view",
                direction: "UP"
            },
        ]
    }
    g6DataApplications = [
        {
            name: "app_alarms_monitor",
            label: "告警流水窗",
            type: "NODE_APPLICATION",
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
            name: "app_alarms_center",
            label: "故障中心",
            type: "NODE_APPLICATION",
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
            name: "app_eoms",
            label: "电子运维",
            type: "NODE_APPLICATION",
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
    ];
    g6DataServices = [
        {
            name: "service_alarms_transfer",
            label: "告警接入服务\nJfmHandler",
            type: "NODE_SERVICE",
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
            name: "service_alarms_filter",
            label: "告警过滤服务\nMatcher",
            type: "NODE_SERVICE",
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
            name: "service_alarms_filter2",
            label: "告警过滤服务-2",
            type: "NODE_SERVICE",
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
            name: "service_alarms_eoms",
            label: "告警派单服务",
            type: "NODE_SERVICE",
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
            name: "service_alarms_cache",
            label: "告警缓存服务\nDataworker",
            type: "NODE_SERVICE",
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
            name: "service_alarms_view",
            label: "告警视图服务\nViewServer",
            type: "NODE_SERVICE",
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
    ];
    g6DataQueues = [
        {
            name: "queue_alarms_collector",
            label: "告警接入队列",
            type: "NODE_QUEUE",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50
            },
            size: {
                w: 400,
                h: 200
            }
        },
        {
            name: "queue_alarms_transfer",
            label: "TRANS.Q",
            type: "NODE_QUEUE",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50
            },
            size: {
                w: 400,
                h: 200
            }
        },
        {
            name: "queue_alarms_matcher",
            label: "MAT_AGENT.Q",
            type: "NODE_QUEUE",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50
            },
            size: {
                w: 400,
                h: 200
            }
        },
        {
            name: "queue_alarms_client_worker",
            label: "CW_1.Q",
            type: "NODE_QUEUE",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50
            },
            size: {
                w: 400,
                h: 200
            }
        },
    ]

    g6DataContainers = [
        {
            name: "brokers",
            type: "brokers",
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
            name: "consumers",
            type: "consumers",
            children: [],
            position: {
                x: 100,
                y: 100 + 100 + 50 + 300 + 10 * (1 + 1) + 50
            },
            size: {
                w: 500,
                h: 100
            }
        },
        {
            name: "producers",
            types: "producers",
            children: [],
            position: {
                x: 100,
                y: 100
            },
            size: {
                w: 150 * 3 + 10 * (3 + 1),
                h: 100
            }
        },
    ];
    g6DataBrokers = [
        {
            name: "broker_1",
            label: "KAFKA broker 1",
            children: [],
            position: {
                x: 0,
                y: 0
            },
            size: {
                w: 200,
                h: 300
            },
        },
        {
            name: "broker_2",
            label: "KAFKA broker 2",
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
            label: "KAFKA broker 3",
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
            label: "KAFKA broker 4",
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

    constructor(props) {
        super(props);

        this.state = {
            treeDataMddTree: [],
            dataSourceAlarms: [],
            columnsAlarms: [],
            tablePropertiesScrollY: 0,
            pageSizeRecords: 0,
            isMddTreeEditing: false,
            selectedKeysObjects: [],
            height: 300,
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

        this.restGetAlarmsStatus = this.restGetAlarmsStatus.bind(this);
        this.doGetAlarmsStatus = this.doGetAlarmsStatus.bind(this);
        this.restGetAlarmsQueue = this.restGetAlarmsQueue.bind(this);
        this.doGetAlarmsQueue = this.doGetAlarmsQueue.bind(this);

        this.doGetTadMddFlow = this.doGetTadMddFlow.bind(this);
        this.doAddTadMddFlow = this.doAddTadMddFlow.bind(this);
        this.doUpdateTadMddFlow = this.doUpdateTadMddFlow.bind(this);
        this.doDeleteTadMddFlow = this.doDeleteTadMddFlow.bind(this);

        this.getApplication = this.getApplication.bind(this);
        this.getService = this.getService.bind(this);
        this.getQueue = this.getQueue.bind(this);
        this.addLine = this.addLine.bind(this);

        this.g6ChangeData = this.g6ChangeData.bind(this);
        this.drawWorkflow = this.drawWorkflow.bind(this);
        this.addApplication = this.addApplication.bind(this);
        this.addService = this.addService.bind(this);
        this.addQueue = this.addQueue.bind(this);

        this.addContainers = this.addContainers.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.updateContainer = this.updateContainer.bind(this);
        this.addBroker = this.addBroker.bind(this);
        this.updateBroker = this.updateBroker.bind(this);
        this.addProducer = this.addProducer.bind(this);
        this.addConsumer = this.addConsumer.bind(this);
        this.addPartitionBak01 = this.addPartitionBak01.bind(this);
        this.addPartition = this.addPartition.bind(this);
        this.updatePartition = this.updatePartition.bind(this);
        this.updateLine = this.updateLine.bind(this);

        this.addPartitionValue = this.addPartitionValue.bind(this);
        this.addPartitionValueCurrent = this.addPartitionValueCurrent.bind(this);
        this.addTopicValue = this.addTopicValue.bind(this);

        this.onG6ButtonAddBroker = this.onG6ButtonAddBroker.bind(this);

        this.onButtonG6ToPng = this.onButtonG6ToPng.bind(this);
        this.onButtonG6Save = this.onButtonG6Save.bind(this);

        this.onButtonAddMddDirClicked = this.onButtonAddMddDirClicked.bind(this);
        this.onButtonAddMddFlowClicked = this.onButtonAddMddFlowClicked.bind(this);
        this.onButtonGetAlarmsStatusClicked = this.onButtonGetAlarmsStatusClicked.bind(this);

        this.onSelectG6TableColumnDataTypeChanged = this.onSelectG6TableColumnDataTypeChanged.bind(this);
        this.onTreeMddTreeSelected = this.onTreeMddTreeSelected.bind(this);

        this.onMouseDownSplitter = this.onMouseDownSplitter.bind(this);
        this.onMouseMoveSplitter = this.onMouseMoveSplitter.bind(this);
        this.onMouseUpSplitter = this.onMouseUpSplitter.bind(this);
    }

    componentDidMount() {
        this.doPrepare();
        this.doGetAll();
    }

    doPrepare() {
        let treeDataMddTree = [];

        this.g6Config.nodes = new Map();
        this.g6DataApplications.forEach((itemApplication) => {
            this.g6Config.nodes.set(itemApplication.name, itemApplication);
        });
        this.g6DataServices.forEach((itemService) => {
            this.g6Config.nodes.set(itemService.name, itemService);
        });
        this.g6DataQueues.forEach((itemQueue) => {
            this.g6Config.nodes.set(itemQueue.name, itemQueue);
        });

        this.g6Config.workflow.forEach((itemNode) => {
            let uiNode = {
                key: itemNode.name,
                title: this.g6Config.nodes.get(itemNode.name).label.replace(/\n/g, " - "),
                children: [],
                tag: {
                    nodeType: itemNode.type,
                    nodeParent: itemNode.parentNode
                }
            }
            treeDataMddTree.push(uiNode);
        });

        this.setState({
            treeDataMddTree: treeDataMddTree
        })
    }

    async doInit() {
        this.g6Init();

        this.g6DataContainers.forEach((c) => {
            this.gMap.containers.set(c.name, c);
        })

        // this.addContainers();
        // this.g6ChangeData();

        this.drawWorkflow();
        this.g6ChangeData();

        this.setState({
            tablePropertiesScrollY: this.gRef.boxTableAlarms.current.scrollHeight - 40,
        })
    }

    //todo >>>>> do Get All
    doGetAll() {
        let dbConn = new TadDbConnection();
        dbConn.db_type = "mysql";
        dbConn.db_host = "10.12.2.104";
        dbConn.db_port = "3306";
        dbConn.db_sid = "nmosdb";
        dbConn.db_username = "root";
        dbConn.db_password = "root123";

        axios.all([
            this.restGetAlarmsStatus(dbConn)
        ]).then(axios.spread((
            resultAlarms,
        ) => {
            let dsAlarms = resultAlarms.data.data.data[0];

            dsAlarms.forEach((itemAlarm) => {
                itemAlarm.flow.forEach((itemFlow) => {

                });
            });
        })).then(() => {
            this.doInit().then(async (r) => {
                this.context.showMessage("KAFKA监控模块初始化完成");

                // await K3.sleep(1000);
                // this.doGetRecords();
                // this.g6ChangeData();
                //
                // await K3.sleep(1000);
                // this.doGetRecords2();
                // this.g6ChangeData();
                //
                // await K3.sleep(1000);
                // this.updatePartition("topic_a-part_0");
            });
        });
    }

    drawWorkflow() {
        let xd = 1;
        let yd = 1;
        let wSelf = 0;
        let hSelf = 0;
        let wParent = 0;
        let hParent = 0;
        let node1, node2, anchor1, anchor2;

        let mapNodes = new Map();
        this.g6DataApplications.forEach((itemApplication) => {
            mapNodes.set(itemApplication.name, itemApplication)
        })

        this.g6DataServices.forEach((itemService) => {
            mapNodes.set(itemService.name, itemService)
        })

        this.g6DataQueues.forEach((itemQueue) => {
            mapNodes.set(itemQueue.name, itemQueue)
        })

        this.gMap.nodes = mapNodes;

        this.g6Config.workflow.forEach((itemNode) => {
            switch (itemNode.direction) {
                case "BEGIN":
                    xd = 0;
                    yd = 0;
                    wSelf = 0;
                    hSelf = 0;
                    wParent = 0;
                    hParent = 0;
                    break
                case "LEFT":
                    xd = -1;
                    yd = 0;
                    wSelf = 1;
                    hSelf = 0;
                    wParent = 1;
                    hParent = 0;
                    break
                case "RIGHT":
                    xd = 1;
                    yd = 0;
                    wSelf = 1;
                    hSelf = 0;
                    wParent = 1;
                    hParent = 1;
                    break
                case "UP":
                    xd = 0;
                    yd = -1;
                    wSelf = 0;
                    hSelf = 1;
                    wParent = 0;
                    hParent = 1;
                    break
                case "DOWN":
                    xd = 0;
                    yd = 1;
                    wSelf = 0;
                    hSelf = 1;
                    wParent = 0;
                    hParent = 1;
                    break
                default:
                    break
            }

            let nodeParent = this.gMap.nodes.get(itemNode.parentNode);
            if (nodeParent === undefined) {
                nodeParent = {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        w: 0,
                        h: 0
                    }
                }
            }

            switch (itemNode.type) {
                case "NODE_APPLICATION":
                    let app = this.gMap.nodes.get(itemNode.name);
                    app.position.x = nodeParent.position.x + xd * wSelf * app.size.w / 2 + xd * wParent * nodeParent.size.w / 2 + xd * this.g6Config.sH;
                    app.position.y = nodeParent.position.y + yd * hSelf * app.size.h / 2 + yd * hParent * nodeParent.size.h / 2 + yd * this.g6Config.sV;
                    // xbLast = xb;
                    // xb += xd * (app.size.w + 100);
                    this.addApplication(app);
                    break
                case "NODE_SERVICE":
                    let service = this.gMap.nodes.get(itemNode.name);
                    service.position.x = nodeParent.position.x + xd * wSelf * service.size.w / 2 + xd * wParent * nodeParent.size.w / 2 + xd * this.g6Config.sH;
                    service.position.y = nodeParent.position.y + yd * hSelf * service.size.h / 2 + yd * hParent * nodeParent.size.h / 2 + yd * this.g6Config.sV;
                    // xbLast = xb;
                    // xb += direction * (service.size.w + 100);
                    this.addService(service);
                    break
                case "NODE_QUEUE":
                    let queue = this.gMap.nodes.get(itemNode.name);
                    queue.position.x = nodeParent.position.x + xd * wSelf * queue.size.w / 2 + xd * wParent * nodeParent.size.w / 2 + xd * this.g6Config.sH;
                    queue.position.y = nodeParent.position.y + yd * hSelf * queue.size.h / 2 + yd * hParent * nodeParent.size.h / 2 + yd * this.g6Config.sV;
                    // xbLast = xb;
                    // xb += direction * (queue.size.w + 100);
                    this.addQueue(queue);
                    break
                default:
                    break
            }

            if (itemNode.parentNode !== "ROOT") {
                node1 = itemNode.parentNode;
                node2 = itemNode.name;
                switch (itemNode.direction) {
                    case "UP":
                        anchor1 = 0;
                        anchor2 = 2;
                        break
                    case "RIGHT":
                        anchor1 = 1;
                        anchor2 = 3;
                        break
                    case "DOWN":
                        anchor1 = 2;
                        anchor2 = 0;
                        break
                    case "LEFT":
                        anchor1 = 3;
                        anchor2 = 1;
                        break
                    default:
                        break
                }

                this.addLine(node1, node2, anchor1, anchor2);
            }
        })
    }

    getApplication(name) {
        let myResult;

        for (let i = 0; i < this.g6DataApplications.length; i++) {
            if (this.g6DataApplications[i].name === name) {
                myResult = this.g6DataApplications[i];
                break
            }
        }

        return myResult
    }

    getService(name) {
        let myResult;

        for (let i = 0; i < this.g6DataServices.length; i++) {
            if (this.g6DataServices[i].name === name) {
                myResult = this.g6DataServices[i];
                break
            }
        }

        return myResult
    }

    getQueue(name) {
        let myResult;

        for (let i = 0; i < this.g6DataQueues.length; i++) {
            if (this.g6DataQueues[i].name === name) {
                myResult = this.g6DataQueues[i];
                break
            }
        }

        return myResult
    }

    //todo <<<<<< now >>>>> 绘制 应用 节点
    addApplication(app) {
        let modelApp = {
            id: app.name,
            type: "rect",
            label: app.label,
            size: [app.size.w, app.size.h],
            x: app.position.x, // + app.size.w / 2,
            y: app.position.y, // + app.size.h / 2,
            anchorPoints: [
                [0.5, 0],
                [1, 0.5],
                [0.5, 1],
                [0, 0.5],
            ],
            style: {
                fill: "darkgray",
                radius: 10,
            },
            // labelCfg: {
            //     position: "top",
            //     offset: 50,
            //     style: {
            //         fill: "white",
            //         fontSize: 16,
            //     }
            // },
            tag: {
                name: app.name,
                type: app.type,
            }
        }

        this.g6Data.nodes.push(modelApp);
    }

    addService(app) {
        let modelApp = {
            id: app.name,
            type: "rect",
            label: app.label,
            size: [app.size.w, app.size.h],
            x: app.position.x, // + app.size.w / 2,
            y: app.position.y, // + app.size.h / 2,
            anchorPoints: [
                [0.5, 0],
                [1, 0.5],
                [0.5, 1],
                [0, 0.5],
            ],
            style: {
                fill: "darkgray",
                radius: 10,
            },
            // labelCfg: {
            //     position: "top",
            //     offset: 50,
            //     style: {
            //         fill: "white",
            //         fontSize: 16,
            //     }
            // },
            tag: {
                name: app.name,
                type: app.type,
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelApp);
    }

    addQueue(app) {
        let modelApp = {
            id: app.name,
            type: "rect",
            label: app.label,
            size: [app.size.w, app.size.h],
            x: app.position.x, // + app.size.w / 2,
            y: app.position.y, // + app.size.h / 2,
            anchorPoints: [
                [0.5, 0],
                [1, 0.5],
                [0.5, 1],
                [0, 0.5],
            ],
            style: {
                fill: "darkgray",
                radius: 10,
            },
            // labelCfg: {
            //     position: "top",
            //     offset: 50,
            //     style: {
            //         fill: "white",
            //         fontSize: 16,
            //     }
            // },
            tag: {
                name: app.name,
                type: app.type,
            }
        }

        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelApp);
    }

    addLine(node1, node2, anchor1, anchor2) {
        let modelLine = {
            id: node1 + "_EDGE_" + node2,
            type: "edge",
            source: node1,
            target: node2,
            sourceAnchor: anchor1,
            targetAnchor: anchor2,
            label: "300条/S",
            // labelCfg: {
            //     position: "start"
            // },
            style: {
                // stroke: "transparent",
                // lineWidth: 20,
                endArrow: true
            },
            autoRotate: true,
            // tag: {
            //     name: partition.name + "_EDGE",
            //     type: "NODE_PARTITION_EDGE",
            // }
        }

        this.g6Data.edges.push(modelLine);
    }

    g6ChangeData() {
        this.g6Graph.changeData(this.g6Data);
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();

        // this.g6Data.nodes.forEach((itemNode) => {
        //     if (itemNode.tag.type === "NODE_PARTITION") {
        //         //if (!itemNode.tag.isRotated) {
        //             itemNode.tag.isRotated = true;
        //             let nodeInstance = this.g6Graph.findById(itemNode.tag.name);
        //             let g = nodeInstance.getContainer();
        //             let textInstance = g.get("children")[1];
        //             textInstance.rotate(-Math.PI / 2);
        //             console.log(itemNode);
        //             let hR = itemNode.size[1];
        //             let wT = itemNode.label.length * 7;
        //             // let x = textInstance.attr("x");
        //             textInstance.attr("x", - (hR - wT) / 2);
        //             console.log(hR, wT);
        //        //}
        //     }
        // });
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
        // this.updateContainer("brokers");

        this.g6DataPartitions.forEach((p) => {
            if (!this.gMap.partitions.has(p.name)) {
                this.gMap.partitions.set(p.name, p);
                this.addPartitionBak01(p, "DIRECTION_VERTICAL");
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
                this.addPartitionBak01(p, "DIRECTION_VERTICAL");
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

    restGetAlarmsStatus(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/alarms/get_alarms_status_1407",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetAlarmsStatus(params) {
        this.restGetAlarmsStatus(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    // title: itemColumn.column_name,
                    //     dataIndex: itemColumn.column_name,
                    //     key: itemColumn.column_name,

                    let columnsAlarms = [
                        {
                            key: "fp",
                            dataIndex: "fp",
                            title: "告警指纹"
                        },
                        {
                            key: "event_time_matcher",
                            dataIndex: "event_time_matcher",
                            title: "Matcher时间",
                            width: 150
                        },
                        {
                            key: "topic_name_matcher",
                            dataIndex: "topic_name_matcher",
                            title: "TRANS.Q",
                            width: 150
                        },
                        // {
                        //     key: "service_name_matcher",
                        //     dataIndex: "service_name_matcher",
                        //     title: "Matcher"
                        // },
                        {
                            key: "event_time_dataworker",
                            dataIndex: "event_time_dataworker",
                            title: "Dataworker时间",
                            width: 150
                        },
                        {
                            key: "topic_name_dataworker",
                            dataIndex: "topic_name_dataworker",
                            title: "MAT_AGENT.Q",
                            width: 150
                        },
                        // {
                        //     key: "service_name_dataworker",
                        //     dataIndex: "service_name_dataworker",
                        //     title: "Dataworker"
                        // },
                        {
                            key: "event_time_viewserver",
                            dataIndex: "event_time_viewserver",
                            title: "View Server时间",
                            width: 150
                        },
                        {
                            key: "topic_name_viewserver",
                            dataIndex: "topic_name_viewserver",
                            title: "CW_1.Q",
                            width: 150
                        },
                        // {
                        //     key: "service_name_viewserver",
                        //     dataIndex: "service_name_viewserver",
                        //     title: "View Server"
                        // },
                    ];
                    let records = result.data.data.data;
                    let dataSourceAlarms = [];
                    let n = 0;

                    records[0].forEach((itemRecord) => {
                        itemRecord.flow.forEach((itemFlow) => {
                            n++;
                            let alarm = {
                                fp: itemRecord.fp,
                                event_time_matcher: "",
                                topic_name_matcher: "丢",
                                event_time_dataworker: "",
                                topic_name_dataworker: "丢",
                                event_time_viewserver: "",
                                topic_name_viewserver: "丢",
                            }
                            if (itemFlow.service_name.toUpperCase() === "MATCHER") {
                                alarm.event_time_matcher = itemFlow.event_time;
                                alarm.topic_name_matcher = "YES";
                            } else if (itemFlow.service_name.toUpperCase() === "DATAWORKER") {
                                alarm.event_time_dataworker = itemFlow.event_time;
                                alarm.topic_name_dataworker = "YES";
                            } else if (itemFlow.service_name.toUpperCase() === "VIEW") {
                                alarm.event_time_viewserver = itemFlow.event_time;
                                alarm.topic_name_viewserver = "YES";
                            }

                            if (alarm.topic_name_viewserver !== "YES") {
                                if (alarm.topic_name_dataworker === "YES") {
                                    alarm.topic_name_matcher = "yes";
                                    alarm.event_time_matcher = alarm.event_time_dataworker;
                                }
                                dataSourceAlarms.push(alarm);
                            }

                            if ((alarm.topic_name_matcher === "丢")
                                && (alarm.topic_name_dataworker === "丢")
                                && (alarm.topic_name_viewserver === "丢")) {
                            }
                        })
                    })
                    this.setState({
                        columnsAlarms: columnsAlarms,
                        dataSourceAlarms: dataSourceAlarms,
                        pageSizeRecords: n
                    })

                    this.context.showMessage("成功，内部ID为：" + result.data.data.id);
                } else {
                    this.context.showMessage("调用服务接口出现问题，详情：" + result.data.message);
                }
            } else {
                this.context.showMessage("调用服务接口出现问题，详情：" + result.statusText);
            }
        });
    }

    restGetAlarmsQueue(params) {
        return axios.post("http://" + this.context.serviceIp + ":" + this.context.servicePort + "/api/alarms/get_alarms_queue_monitor",
            params,
            {headers: {'Content-Type': 'application/json'}})
    }

    doGetAlarmsQueue(params) {
        this.restGetAlarmsQueue(params).then((result) => {
            if (result.status === 200) {
                if (result.data.success) {
                    let records = result.data.data.data[0];
                    let treeDataObjects = lodash.cloneDeep(this.state.treeDataMddTree);
                    let mapQueues = new Map();
                    records.forEach((record) => {
                        let topic = record.topic.toUpperCase();
                        let topicNodeName = "";
                        if (topic === "TRANS.Q") {
                            topicNodeName = "queue_alarms_transfer";
                        } else if (topic === "MAT_AGENT.Q") {
                            topicNodeName = "queue_alarms_matcher";
                        } else if (topic === "CLIENTWORKER_1.Q") {
                            topicNodeName = "queue_alarms_client_worker";
                        }

                        let partition = record.partition;

                        if (!mapQueues.has(topic)) {
                            let mapPartitions = new Map();
                            mapPartitions.set(partition, {
                                log_end_offset: record.log_end_offset,
                                current_offset: record.current_offset,
                                topicNodeName: topicNodeName
                            });
                            mapQueues.set(topic, mapPartitions);
                        } else {
                            let mapPartitions = mapQueues.get(topic);
                            mapPartitions.set(partition, {
                                log_end_offset: record.log_end_offset,
                                current_offset: record.current_offset,
                                topicNodeName: topicNodeName
                            });
                        }

                        let myPartition = {
                            name: topicNodeName + "_" + partition,
                            label: partition,
                            broker: "broker_1",
                            topic: topic,
                            topicNodeName: topicNodeName,
                            type: "leader",
                            position: {
                                x: 0,
                                y: 0
                            },
                            size: {
                                w: 180,
                                h: 30
                            },
                            tag: {
                                maxOffset: 30000,
                                log_end_offset: record.log_end_offset,
                                current_offset: record.current_offset,
                                topicNodeName: topicNodeName
                            }

                        };

                        let uiPartiton = {
                            key: myPartition.name,
                            title: myPartition.name,
                            children: [],
                            tag: {
                                nodeType: "NODE_PARTITION",
                            }
                        }

                        treeDataObjects.forEach((object) => {
                            if (object.key === myPartition.topicNodeName) {
                                object.children.push(uiPartiton);
                            }
                        })
                        this.gMap.nodes.set(myPartition.name, myPartition);
                        this.addPartition(myPartition, "DIRECTION_VERTICAL");
                        this.addPartitionValue(myPartition, "DIRECTION_VERTICAL");
                        this.addPartitionValueCurrent(myPartition, "DIRECTION_VERTICAL");
                        let myTopic = this.gMap.nodes.get(topicNodeName);
                        myTopic.totalAlarms = Math.floor(Math.random()*1000);
                        this.addTopicValue(myTopic);

                        // this.g6Config.nodes.set(myPartition.name, myPartition);
                    });
                    this.updateLine();
                    console.log("01", this.gMap.nodes);
                    this.setState({treeDataMddTree: treeDataObjects});
                    this.g6ChangeData();

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
            defaultEdge: {
                style: {
                    stroke: "#fff",
                    lineWidth: 2
                },
                labelCfg: {
                    autoRotate: true,
                }
            },
        });

        this.g6Graph.on('combo:click', (evt) => {
            // const item = evt.item;
            // const target = evt.target;
        });

        this.g6Data.combos = [];
        this.g6Data.nodes = [];
        this.g6Data.edges = [];

        this.g6Graph.data(this.g6Data);
        this.g6Graph.render();
        this.g6Graph.fitCenter();
        this.g6Graph.fitView();
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
            label: container.label,
            size: [container.size.w, container.size.h],
            x: container.position.x + container.size.w / 2,
            y: container.position.y + container.size.h / 2,
            style: {
                fill: "darkgray",
                radius: 10,
            },
            labelCfg: {
                position: "top",
                offset: 50,
                style: {
                    fill: "white",
                    fontSize: 16,
                }
            },
            tag: {
                name: container.name,
                type: "NODE_CONTAINER",
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
                node.x += (wNew - w) / 2;
                node.y += (hNew - h) / 2;
                node.size[0] = wNew;
                node.size[1] = hNew;
            }
        })
    }

    //todo <<<<< now >>>>> 绘制 broker
    addBroker(broker) {
        let container = this.gMap.nodes.get("queue_alarms_collector");
        let index = container.children.length;

        container.children.push(broker.name);
        broker.size.w = 120;
        broker.size.h = container.size.h - this.g6Config.s * 2;
        this.gMap.nodes.set(broker.name, broker);
        let xb = container.position.x - container.size.w / 2 + broker.size.w / 2 + this.g6Config.s + (broker.size.w + this.g6Config.s) * index,
            yb = container.position.y;
        let modelBroker = {
            id: broker.name,
            type: "rect",
            label: broker.label,
            size: [broker.size.w, broker.size.h],
            x: xb,
            y: yb,
            style: {
                fill: "darkgreen",
                radius: 10,
            },
            labelCfg: {
                position: "top",
                offset: -30,
                style: {
                    fill: "white",
                    fontSize: 16,
                }
            },
            tag: {
                name: broker.name,
                type: "NODE_BROKER",
            }
        }

        broker.position.x = modelBroker.x - broker.size.w / 2;
        broker.position.y = modelBroker.y - broker.size.h / 2;
        this.g6Data.nodes.push(modelBroker);
    }

    updateBroker(broker) {

    }

    addProducer(producer, index) {

    }

    addConsumer(consumer, index) {

    }

    //todo <<<<< now >>>>> add partition
    addPartitionBak01(partition, direction) {
        if (direction === undefined) {
            direction = "DIRECTION_HORIZONTAL";
        } else {
            if (direction !== "DIRECTION_HORIZONTAL" && direction !== "DIRECTION_VERTICAL") {
                direction = "DIRECTION_VERTICAL";
            }
        }
        let broker = this.gMap.nodes.get(partition.broker);
        partition.size.w = (broker.size.h - this.g6Config.s * 2 - 30) * (partition.size.w / 200);
        partition.size.h = 25;
        let index = broker.children.length;
        let w, h, xb, yb, x1, y1, x2, y2, x3, y3;

        if (direction === "DIRECTION_HORIZONTAL") {
            w = partition.size.w;
            h = partition.size.h;
            xb = broker.position.x + this.g6Config.s;
            yb = broker.position.y + this.g6Config.s;
            x1 = xb;
            y1 = yb + (h + this.g6Config.s) * index + h / 2;
        } else if (direction === "DIRECTION_VERTICAL") {
            w = partition.size.h;
            h = partition.size.w;
            xb = broker.position.x + w * index + this.g6Config.s * (index + 1);
            yb = broker.position.y + broker.size.h - h - this.g6Config.s;
            x1 = xb + w / 2;
            y1 = yb + 10 / 2;
            x2 = x1;
            y2 = yb + h / 2;
            x3 = x1;
            y3 = yb + (h - 10) + 10 / 2;
        }
        let modelPartitionTop = {
            id: partition.name + "_TOP",
            type: "rect",
            size: [w, 10],
            x: x1,
            y: y1,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_TOP",
                type: "NODE_PARTITION_TOP",
            }
        }
        let modelPartitionBody = {
            id: partition.name,
            type: "rect",
            size: [w, h],
            x: x2,
            y: y2,
            style: {
                fill: "lightblue",
                radius: [5, 5, 0, 0],
            },
            tag: {
                name: partition.name,
                type: "NODE_PARTITION",
                isRotated: false,
            }
        }
        let modelPartitionBottom = {
            id: partition.name + "_BOTTOM",
            type: "rect",
            size: [w, 10],
            x: x3,
            y: y3,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_BOTTOM",
                type: "NODE_PARTITION_BOTTOM",
            }
        }
        let modelPartitionEdge = {
            id: partition.name + "_EDGE",
            type: "edge",
            source: partition.name + "_BOTTOM",
            target: partition.name + "_TOP",
            sourceAnchor: 0,
            targetAnchor: 0,
            label: partition.name,
            labelCfg: {
                position: "start"
            },
            style: {
                stroke: "transparent",
            },
            autoRotate: true,
            tag: {
                name: partition.name + "_EDGE",
                type: "NODE_PARTITION_EDGE",
            }
        }

        partition.position.x = x1 - w / 2;
        partition.position.y = y1 - h / 2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartitionTop);
        this.g6Data.nodes.push(modelPartitionBottom);
        this.g6Data.nodes.push(modelPartitionBody);
        this.g6Data.edges.push(modelPartitionEdge);
        this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    addPartition(partition, direction) {
        if (direction === undefined) {
            direction = "DIRECTION_HORIZONTAL";
        } else {
            if (direction !== "DIRECTION_HORIZONTAL" && direction !== "DIRECTION_VERTICAL") {
                direction = "DIRECTION_VERTICAL";
            }
        }
        let container = this.gMap.nodes.get(partition.topicNodeName);

        partition.size.w = (container.size.h - this.g6Config.s * 2 - 30);
        partition.size.h = 50;
        let index = container.children.length;
        let w, h, xb, yb, x1, y1, x2, y2, x3, y3;

        if (direction === "DIRECTION_HORIZONTAL") {
            w = partition.size.w;
            h = partition.size.h;
            xb = container.position.x + this.g6Config.s;
            yb = container.position.y + this.g6Config.s;
            x1 = xb;
            y1 = yb + (h + this.g6Config.s) * index + h / 2;
        } else if (direction === "DIRECTION_VERTICAL") {
            w = partition.size.h;
            h = partition.size.w;
            xb = container.position.x - container.size.w / 2 + w * index + this.g6Config.s * (index + 1);
            yb = container.position.y - container.size.h / 2 + container.size.h - h - this.g6Config.s;
            x1 = xb + w / 2;
            y1 = yb + 10 / 2;
            x2 = x1;
            y2 = yb + h / 2;
            x3 = x1;
            y3 = yb + (h - 10) + 10 / 2;
        }
        let modelPartitionTop = {
            id: partition.name + "_TOP",
            type: "rect",
            size: [w, 10],
            x: x1,
            y: y1,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_TOP",
                type: "NODE_PARTITION_TOP",
            }
        }
        let modelPartitionBody = {
            id: partition.name,
            type: "rect",
            size: [w, h],
            x: x2,
            y: y2,
            style: {
                fill: "#2F5FAF",
                radius: [5, 5, 0, 0],
            },
            tag: {
                name: partition.name,
                type: "NODE_PARTITION",
                isRotated: false,
            }
        }
        let modelPartitionBottom = {
            id: partition.name + "_BOTTOM",
            type: "rect",
            size: [w, 10],
            x: x3,
            y: y3,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_BOTTOM",
                type: "NODE_PARTITION_BOTTOM",
            }
        }
        let modelPartitionEdge = {
            id: partition.name + "_EDGE",
            type: "edge",
            source: partition.name + "_BOTTOM",
            target: partition.name + "_TOP",
            sourceAnchor: 0,
            targetAnchor: 0,
            label: partition.label,
            labelCfg: {
                position: "start"
            },
            style: {
                stroke: "transparent",
            },
            autoRotate: true,
            tag: {
                name: partition.name + "_EDGE",
                type: "NODE_PARTITION_EDGE",
            }
        }

        partition.position.x = x1 - w/2;
        partition.position.y = y1 - 10/2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartitionTop);
        this.g6Data.nodes.push(modelPartitionBottom);
        this.g6Data.nodes.push(modelPartitionBody);
        this.g6Data.edges.push(modelPartitionEdge);
        container.children.push(partition.name);
        // this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    addPartitionValue(partition, direction) {
        if (direction === undefined) {
            direction = "DIRECTION_HORIZONTAL";
        } else {
            if (direction !== "DIRECTION_HORIZONTAL" && direction !== "DIRECTION_VERTICAL") {
                direction = "DIRECTION_VERTICAL";
            }
        }
        let partitionRoot = this.gMap.nodes.get(partition.name);
        partitionRoot.tag.maxOffset = 30000000;

        let w, h, xb, yb, x1, y1, x2, y2, x3, y3;

        if (direction === "DIRECTION_HORIZONTAL") {
            // ...
        } else if (direction === "DIRECTION_VERTICAL") {
            w = partition.size.h/2-5;
            let hRoot = partition.size.w;
            // h = Math.floor(hRoot * (partition.tag.log_end_offset / partitionRoot.tag.maxOffset));
            h = Math.floor(hRoot * (partition.tag.log_end_offset / (partitionRoot.tag.log_end_offset + 1000)));
            console.log("h = ", h);
            // hCurrent = Math.floor(hRoot * (partition.tag.current_offset / partitionRoot.tag.maxOffset));
            if (h > 0 && h < 50) h = 50; else if (h === 0) h = 20;
            xb = partitionRoot.position.x;
            yb = partitionRoot.position.y + (hRoot - h);
            x1 = xb + w / 2;
            y1 = yb + 10 / 2;
            x2 = x1;
            y2 = yb + h / 2;
            x3 = x1;
            y3 = yb + (h - 10) + 10 / 2;
        }

        let bodyColor = "#4FAF4F";
        if (partition.tag.log_end_offset === 0) {
            bodyColor = "#AF0000";
        } else {
            let rateOffset = Math.floor(((partition.tag.log_end_offset - partition.tag.current_offset) / partition.tag.log_end_offset)*10000)/10000;
            console.log(rateOffset);
            if (rateOffset*100 > 0.3 ) {
                bodyColor = "#AF5F00";
            }
        }

        let modelPartitionTop = {
            id: partition.name + "_VALUE_TOP",
            type: "rect",
            size: [w, 10],
            x: x1,
            y: y1,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_VALUE_TOP",
                type: "NODE_PARTITION_VALUE_TOP",
            }
        }
        let modelPartitionBody = {
            id: partition.name + "_VALUE",
            type: "rect",
            size: [w, h],
            x: x2,
            y: y2,
            style: {
                fill: bodyColor,
                radius: [5, 5, 0, 0],
            },
            tag: {
                name: partition.name,
                type: "NODE_PARTITION_VALUE",
                isRotated: false,
            }
        }
        let modelPartitionBottom = {
            id: partition.name + "_VALUE_BOTTOM",
            type: "rect",
            size: [w, 10],
            x: x3,
            y: y3,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_VALUE_BOTTOM",
                type: "NODE_PARTITION_VALUE_BOTTOM",
            }
        }
        let modelPartitionEdge = {
            id: partition.name + "_VALUE_EDGE",
            type: "edge",
            source: partition.name + "_VALUE_BOTTOM",
            target: partition.name + "_VALUE_TOP",
            sourceAnchor: 0,
            targetAnchor: 0,
            label: partition.tag.log_end_offset,
            labelCfg: {
                position: "start"
            },
            style: {
                stroke: "transparent",
            },
            autoRotate: true,
            tag: {
                name: partition.name + "_VALUE_EDGE",
                type: "NODE_PARTITION_VALUE_EDGE",
            }
        }

        // partition.position.x = x1 - w / 2;
        // partition.position.y = y1 - h / 2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartitionTop);
        this.g6Data.nodes.push(modelPartitionBottom);
        this.g6Data.nodes.push(modelPartitionBody);
        this.g6Data.edges.push(modelPartitionEdge);
        // container.children.push(partition.name);
        // this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    addPartitionValueCurrent(partition, direction) {
        if (direction === undefined) {
            direction = "DIRECTION_HORIZONTAL";
        } else {
            if (direction !== "DIRECTION_HORIZONTAL" && direction !== "DIRECTION_VERTICAL") {
                direction = "DIRECTION_VERTICAL";
            }
        }
        let partitionRoot = this.gMap.nodes.get(partition.name);
        partitionRoot.tag.maxOffset = 30000000;

        let w, h, xb, yb, x1, y1, x2, y2, x3, y3;

        if (direction === "DIRECTION_HORIZONTAL") {
            // ...
        } else if (direction === "DIRECTION_VERTICAL") {
            w = partition.size.h/2-5;
            let hRoot = partition.size.w;
            // h = Math.floor(hRoot * (partition.tag.current_offset / partitionRoot.tag.maxOffset));
            h = Math.floor(hRoot * (partition.tag.log_end_offset*Math.random() / (partitionRoot.tag.log_end_offset + 1000)));
            console.log("h2 = ", h);
            if (h > 0 && h < 50) h = 50; else if (h === 0) h = 20;
            xb = partitionRoot.position.x + partition.size.h/2+5;
            yb = partitionRoot.position.y + (hRoot - h);
            x1 = xb + w / 2;
            y1 = yb + 10 / 2;
            x2 = x1;
            y2 = yb + h / 2;
            x3 = x1;
            y3 = yb + (h - 10) + 10 / 2;
        }

        let bodyColor = "#FFFFFF";
        // if (partition.tag.log_end_offset === 0) {
        //     bodyColor = "#AF0000";
        // } else {
        //     let rateOffset = Math.floor(((partition.tag.log_end_offset - partition.tag.current_offset) / partition.tag.log_end_offset)*10000)/10000;
        //     console.log(rateOffset);
        //     if (rateOffset*100 > 0.3 ) {
        //         bodyColor = "#AF5F00";
        //     }
        // }

        let modelPartitionTop = {
            id: partition.name + "_VALUE_CURRENT_TOP",
            type: "rect",
            size: [w, 10],
            x: x1,
            y: y1,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_VALUE_CURRENT_TOP",
                type: "NODE_PARTITION_VALUE_CURRENT_TOP",
            }
        }
        let modelPartitionBody = {
            id: partition.name + "_VALUE_CURRENT",
            type: "rect",
            size: [w, h],
            x: x2,
            y: y2,
            style: {
                fill: bodyColor,
                radius: [5, 5, 0, 0],
            },
            tag: {
                name: partition.name + "_VALUE_CURRENT",
                type: "NODE_PARTITION_VALUE_CURRENT",
                isRotated: false,
            }
        }
        let modelPartitionBottom = {
            id: partition.name + "_VALUE_CURRENT_BOTTOM",
            type: "rect",
            size: [w, 10],
            x: x3,
            y: y3,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "transparent",
                stroke: 'transparent',
            },
            tag: {
                name: partition.name + "_VALUE_CURRENT_BOTTOM",
                type: "NODE_PARTITION_VALUE_CURRENT_BOTTOM",
            }
        }
        let modelPartitionEdge = {
            id: partition.name + "_VALUE_CURRENT_EDGE",
            type: "edge",
            source: partition.name + "_VALUE_CURRENT_BOTTOM",
            target: partition.name + "_VALUE_CURRENT_TOP",
            sourceAnchor: 0,
            targetAnchor: 0,
            label: partition.tag.current_offset,
            labelCfg: {
                position: "start"
            },
            style: {
                stroke: "transparent",
            },
            autoRotate: true,
            tag: {
                name: partition.name + "_VALUE_CURRENT_EDGE",
                type: "NODE_PARTITION_VALUE_CURRENT_EDGE",
            }
        }

        // partition.position.x = x1 - w / 2;
        // partition.position.y = y1 - h / 2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartitionTop);
        this.g6Data.nodes.push(modelPartitionBottom);
        this.g6Data.nodes.push(modelPartitionBody);
        this.g6Data.edges.push(modelPartitionEdge);
        // container.children.push(partition.name);
        // this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    addTopicValue(queue) {
        let queueRoot = this.gMap.nodes.get(queue.name);
        let w, h, xb, yb, x1, y1, x2, y2, x3, y3;

        w = 100;
        h = 40;
        xb = queueRoot.position.x - queueRoot.size.w/2 + (queueRoot.size.w - w) - 5;
        yb = queueRoot.position.y - queueRoot.size.h /2 - h - 5;
        x1 = xb + w / 2;
        y1 = yb + 10 / 2;
        x2 = x1;
        y2 = yb + h / 2;
        x3 = x1;
        y3 = yb + (h - 10) + 10 / 2;

        let bodyColor = "#4FAF4F";

        let modelPartitionTop = {
            id: queue.name + "_VALUE_TOP",
            type: "rect",
            size: [10, h],
            x: xb + 10/2,
            y: yb + h/2,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "#00000000",
                stroke: '#00000000',
            },
            tag: {
                name: queue.name + "_VALUE_TOP",
                type: "NODE_PARTITION_VALUE_TOP",
            }
        }
        let modelPartitionBody = {
            id: queue.name + "_VALUE",
            type: "rect",
            size: [w, h],
            x: xb + w/2,
            y: yb + h/2,
            style: {
                fill: bodyColor,
                radius: [5, 5, 5, 5],
            },
            tag: {
                name: queue.name,
                type: "NODE_PARTITION_VALUE",
                isRotated: false,
            }
        }
        let modelPartitionBottom = {
            id: queue.name + "_VALUE_BOTTOM",
            type: "rect",
            size: [10, h],
            x: xb + w - 10/2,
            y: yb + h/2,
            anchorPoints: [
                [0.5, 0.5],
                [1, 1],
            ],
            style: {
                fill: "#00000000",
                stroke: '#00000000',
            },
            tag: {
                name: queue.name + "_VALUE_BOTTOM",
                type: "NODE_PARTITION_VALUE_BOTTOM",
            }
        }
        let modelPartitionEdge = {
            id: queue.name + "_VALUE_EDGE",
            type: "edge",
            source: queue.name + "_VALUE_BOTTOM",
            target: queue.name + "_VALUE_TOP",
            sourceAnchor: 0,
            targetAnchor: 0,
            label: queue.totalAlarms,
            labelCfg: {
                position: "center",
                style: {
                    fontSize: 24,
                    fontWeight: "bold",
                }
            },
            style: {
                stroke: "transparent",
            },
            autoRotate: true,
            tag: {
                name: queue.name + "_VALUE_EDGE",
                type: "NODE_PARTITION_VALUE_EDGE",
            }
        }

        // partition.position.x = x1 - w / 2;
        // partition.position.y = y1 - h / 2;
        // this.g6Graph.addItem("node", modelBroker);
        this.g6Data.nodes.push(modelPartitionTop);
        this.g6Data.nodes.push(modelPartitionBottom);
        this.g6Data.nodes.push(modelPartitionBody);
        this.g6Data.edges.push(modelPartitionEdge);
        // container.children.push(partition.name);
        // this.gMap.brokers.get(partition.broker).children.push(partition.name);
    }

    updatePartition(partitionId) {
        let nodePartition = this.g6Graph.findById(partitionId);

        nodePartition.getContainer().get("children")[0].animate(
            {
                fill: "red",
                stroke: "red"
            },
            {
                repeat: true,
                duration: 1000,
                easing: 'easeLinear',
                delay: 0,
            },
        );
    }

    updateLine() {
        console.log("yyyy");
        this.g6Config.workflow.forEach((itemNode) => {
            console.log("xxxx");
            if (itemNode.parentNode !== "ROOT") {
                let node1 = itemNode.parentNode;
                let node2 = itemNode.name;

                let myLine = this.g6Graph.findById(node1 + "_EDGE_" + node2);
                console.log(myLine);
                let myGroup = myLine.getContainer();
                let myShape = myGroup.get("children")[0];
                let startPoint = myShape.getPoint(0);
                const myCircle = myGroup.addShape('circle', {
                    attrs: {
                        x: startPoint.x,
                        y: startPoint.y,
                        fill: '#1890ff',
                        r: 5,
                    },
                    name: node1.name + "_EDGE_" + node2 + "_CIRCLE",
                });

                myCircle.animate(
                    (ratio) => {
                        // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                        // get the position on the edge according to the ratio
                        const tmpPoint = myShape.getPoint(ratio);
                        // returns the modified configurations here, x and y here
                        return {
                            x: tmpPoint.x,
                            y: tmpPoint.y,
                        };
                    },
                    {
                        repeat: true, // Whether executes the animation repeatly
                        duration: 1000, // the duration for executing once
                    },
                );
            }
        })
        //
        //
        // nodePartition.getContainer().get("children")[0].animate(
        //     {
        //         fill: "red",
        //         stroke: "red"
        //     },
        //     {
        //         repeat: true,
        //         duration: 1000,
        //         easing: 'easeLinear',
        //         delay: 0,
        //     },
        // );
    }

    //todo <<<<< now >>>>> 新增 broker
    onG6ButtonAddBroker(e) {
        this.g6Graph.fitView();
        // let indexBroker = this.g6DataBrokers.length;
        // let nodeBroker = {
        //     name: "broker_" + (indexBroker + 1)
        // }
        //
        // this.addBroker(nodeBroker, indexBroker);
        // this.g6ChangeData();
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

    //todo <<<<< now >>>>> on button 刷新告警状态数据 clicked
    onButtonGetAlarmsStatusClicked(e) {
        let dbConn = new TadDbConnection();
        dbConn.db_type = "mysql";
        dbConn.db_host = "10.12.2.104";
        dbConn.db_port = "3306";
        dbConn.db_sid = "nmosdb";
        dbConn.db_username = "root";
        dbConn.db_password = "root123";

        this.doGetAlarmsStatus(dbConn);
        this.doGetAlarmsQueue(dbConn);
    }

    onTreeMddTreeSelected(selectedKeys, info) {
        if (info.selected) {
            this.gCurrent.selectedKeysObjects = selectedKeys;
        }

        let selectedKeysObjects = info.selected ? selectedKeys : this.gCurrent.selectedKeysObjects;
        this.setState({
            selectedKeysObjects: selectedKeysObjects
        });

        if (this.gCurrent.nodeCurrent !== undefined) {
            let node = this.g6Config.nodes.get(this.gCurrent.nodeCurrent.id);
            let g6Node = this.g6Graph.findById(node.name);
            g6Node.clearStates(['selected']);
        }

        if (info.selected) {
            this.gCurrent.nodeCurrent = {
                id: selectedKeys[0],
                nodeType: info.node.tag.nodeType,
            }
        }

        let node = this.g6Config.nodes.get(this.gCurrent.nodeCurrent.id);

        let g6Node = this.g6Graph.findById(node.name);
        g6Node.setState('selected', true);
        this.g6Graph.zoomTo(1);
        this.g6Graph.focusItem(g6Node);
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

    onMouseDownSplitter(e) {
        this.gDynamic.isMouseDown = true;
        this.gDynamic.x = e.clientX;
        this.gDynamic.y = e.clientY;
    }

    onMouseMoveSplitter(e) {
        if (this.gDynamic.isMouseDown) {
            console.log(e.clientY - this.gDynamic.y);
            // let height = this.state.height;
            // this.setState({
            //     height: height + e.clientY - this.gDynamic.y
            // });
        }
    }

    onMouseUpSplitter(e) {
        this.gDynamic.isMouseDown = false;
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
                        <div ref={this.gRef.splitterUp} className={"BoxKafkas"}>
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
                                                  onSelect={this.onTreeMddTreeSelected}
                                                  selectable={!this.state.isMddTreeEditing}
                                                  selectedKeys={this.state.selectedKeysObjects}
                                                  className={"TreeKnown"}
                                                  switcherIcon={<CaretDownOutlined/>}
                                                  blockNode={true}
                                                  showLine={true}
                                                  showIcon={true}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"box-box-canvas"}>
                                <div className={"box-box-canvas-toolbar"}>
                                    <div className={"box-box-canvas-toolbar-title"}>&nbsp;</div>
                                    <div className={"box-box-canvas-toolbar-buttons"}>
                                        <Button size={"small"} type={"primary"}
                                                onClick={this.onG6ButtonAddBroker}>适应屏幕大小</Button>
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
                        <div ref={this.gRef.splitter}
                             className={"K3Splitter"}
                             onMouseDown={this.onMouseDownSplitter}
                             onMouseMove={this.onMouseMoveSplitter}
                             onMouseUp={this.onMouseUpSplitter}
                        >&nbsp;</div>
                        <div className={"box-alarms"} style={{height: this.state.height}}>
                            <div className="box-alarms-titlebar">
                                <div className="box-alarms-title">活动告警列表</div>
                            </div>
                            <div className={"box-alarms-toolbar"}>
                                <div className={"box-search"}>
                                    <Input.Search placeholder="Search" size="small" enterButton
                                                  onChange={this.onInputSearchSchemasChanged}
                                                  onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                                <Button onClick={this.onButtonGetAlarmsStatusClicked}
                                        icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>刷新</Button>
                            </div>
                            <div ref={this.gRef.boxTableAlarms} className={"box-alarms-content"}>
                                <Table
                                    dataSource={this.state.dataSourceAlarms}
                                    columns={this.state.columnsAlarms}
                                    scroll={{y: this.state.tablePropertiesScrollY}}
                                    bordered={true}
                                    size={"small"}
                                    pagination={{
                                        pageSize: this.state.pageSizeRecords,
                                        position: ["none", "none"]
                                    }}
                                    // rowSelection={{
                                    //     type: "radio",
                                    //     ...this.onRowRecordSelected
                                    // }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

