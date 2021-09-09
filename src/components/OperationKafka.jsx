import React from 'react'
import './OperationKafka.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Tooltip, Tree} from 'antd'
import {CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CloseOutlined, PlusSquareOutlined, QuestionCircleOutlined,} from '@ant-design/icons'
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

        this.x6Move = this.x6Move.bind(this);
        this.x6Update = this.x6Update.bind(this);
        this.x6AddEntityTable = this.x6AddEntityTable.bind(this);
        this.x6SetFormItems = this.x6SetFormItems.bind(this);
        this.onFormX6PropertiesFinish = this.onFormX6PropertiesFinish.bind(this);
        this.onButtonX6ToPng = this.onButtonX6ToPng.bind(this);
        this.onButtonX6Save = this.onButtonX6Save.bind(this);
        this.x6LoadModels = this.x6LoadModels.bind(this);
        this.x6LoadTransformers = this.x6LoadTransformers.bind(this);

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

    g6Init() {
        const data = {
            // 点集
            nodes: [
                {
                    id: 'node1', // String，该节点存在则必须，节点的唯一标识
                    x: 100, // Number，可选，节点位置的 x 值
                    y: 200, // Number，可选，节点位置的 y 值
                },
                {
                    id: 'node2', // String，该节点存在则必须，节点的唯一标识
                    x: 300, // Number，可选，节点位置的 x 值
                    y: 200, // Number，可选，节点位置的 y 值
                },
            ],
            // 边集
            edges: [
                {
                    source: 'node1', // String，必须，起始点 id
                    target: 'node2', // String，必须，目标点 id
                },
            ],
        };

        const graph = new G6.Graph({
            container: this.gRef.x6GraphContainer.current,
            width: 400, // Number，必须，图的宽度
            height: 300, // Number，必须，图的高度
        });

        graph.data(data);
        graph.render();
    }


    //todo <<<<< now >>>> x6 init
    x6Init() {
        EditableCellTool.config({
            tagName: 'div',
            isSVGElement: false,
        });

        Graph.registerConnector('algo-edge',
            (source, target) => {
                const offset = 4
                const control = 80
                const v1 = {x: source.x, y: source.y + offset + control}
                const v2 = {x: target.x, y: target.y - offset - control}

                return `
                    M ${source.x} ${source.y}
                    L ${source.x} ${source.y + offset}
                    C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${target.x} ${target.y - offset}
                    L ${target.x} ${target.y}
                `;
            },
            true,
        );

        Graph.registerNodeTool('editableCell', EditableCellTool, true);

        this.x6Graph = new Graph({
            container: this.gRef.x6GraphContainer.current,
            grid: true,
            snapline: {
                enabled: true,
            },
            scroller: {
                enabled: true,
                pageVisible: false,
                pageBreak: false,
                pannable: true,
            },
            connecting: {
                snap: true,
                allowBlank: false,
                allowLoop: false,
                highlight: true,
                validateMagnet: ({cell, magnet}) => {
                    let count = 0;
                    let connectionCount = magnet.getAttribute("connection-count");
                    let max = connectionCount ? parseInt(connectionCount, 10) : Number.MAX_SAFE_INTEGER
                    const outgoingEdges = this.x6Graph.getOutgoingEdges(cell)
                    if (outgoingEdges) {
                        outgoingEdges.forEach((edge) => {
                            const edgeView = this.x6Graph.findViewByCell(edge);
                            if (edgeView.sourceMagnet === magnet) {
                                count += 1
                            }
                        })
                    }

                    return count < max
                },
                createEdge: (source, target) => {
                    let edge = this.x6Graph.createEdge({
                        source,
                        target,
                        router: {
                            name: 'manhattan',
                            args: {
                                startDirections: ['right'],
                                endDirections: ['left'],
                            },
                        },
                        attrs: {
                            line: {
                                stroke: '#722ed1',
                            },
                        },
                    });

                    this.gDynamic.edge = edge;

                    return edge;
                },

            },
            translating: {
                restrict: this.x6Move,
            },
        });

        this.x6Graph.on('blank:click', () => {
            this.setState({
                nodeType: "unknown"
            });

            // 恢复上一次选中 node 的样式
            if (this.gCurrent.node !== null && this.gCurrent.node !== undefined) {
                this.gCurrent.node.attr('body', {
                    stroke: this.gCurrent.nodeAttrs.rect.stroke,
                })
            }
            this.gCurrent.node = null;
        });

        // >>>>> x6Graph on node:click
        this.x6Graph.on('node:click', ({node}) => {
            let nodeData = node.getData();

            // 恢复上一次选中 node 的样式
            if (this.gCurrent.node !== null && this.gCurrent.node !== undefined) {
                this.gCurrent.node.attr('body', {
                    stroke: this.gCurrent.nodeAttrs.rect.stroke,
                })
            }
            this.gCurrent.node = node;
            this.gCurrent.nodeAttrs = node.getAttrs();

            // 设置选中 node 的样式
            node.attr('body', {
                stroke: '#ffa940',
            })

            if (nodeData.nodeType === "table") {
                node.toFront({deep: true});
                this.setState({
                    nodeType: "table"
                });
            } else if (nodeData.nodeType === "table_column") {
                this.setState({
                    nodeType: "table_column"
                });
            } else if (nodeData.nodeType === "table_button_add_column") {
                this.setState({
                    nodeType: "table_button_add_column"
                });

                let nodeTable = node.getParent();
                let cc = nodeTable.getChildren().length;
                let h = nodeTable.size().height;
                let hAdd = 30;

                if (cc === 1) hAdd = 40;

                nodeTable.resize(160, h + hAdd);

                let newColumnName = "new_table_column";
                let myNodeColumn = this.x6Graph.createNode({
                    width: 140,
                    height: 30,
                    shape: 'rect',
                    attrs: {
                        body: {
                            fill: 'rgba(95,159,255,.2)',
                            stroke: 'gray',
                            strokeWidth: 1,
                        },
                        label: {
                            fill: 'rgba(95,159,255,1)',
                            fontSize: 14,
                            fontWeight: "bold",
                            text: newColumnName,
                        },
                    },
                    ports: {
                        groups: {
                            groupLeft: {
                                position: {
                                    name: "left",
                                }
                            },
                            groupRight: {
                                position: {
                                    name: "right",
                                }
                            }
                        },
                    },
                });

                myNodeColumn.setData({
                    x: 0,
                    y: 0,
                    nodeType: "table_column",
                    columnName: newColumnName,
                });

                myNodeColumn.position(nodeTable.position().x + 10, nodeTable.position().y + h + hAdd - 40 - hAdd);

                nodeTable.addChild(myNodeColumn);

                node.position(nodeTable.position().x + 10, nodeTable.position().y + h + hAdd - 40);
            }

            this.x6SetFormItems();
        });

        this.x6Graph.on('node:mouseenter', ({node}) => {
            let nodeData = node.getData();

            this.gDynamic.node = node;

            if (nodeData.nodeType === "table") {
                node.addTools([
                    {
                        name: 'button-remove',
                        args: {x: "100%", y: 0, offset: {x: -10, y: 10}},
                    },
                ]);
                // node.toFront({deep: true});
            } else if (nodeData.nodeType === "table_column") {
                node.addTools([
                    {
                        name: 'button-remove',
                        args: {x: "100%", y: "50%", offset: {x: -20, y: 0}},
                    },
                ]);
            }

        });

        this.x6Graph.on('node:mouseleave', ({cell}) => {
            cell.removeTools()
        })

        this.x6Graph.on('edge:click', ({edge}) => {

        });

        this.x6Graph.on('edge:mouseenter', ({cell}) => {
            cell.addTools([
                {
                    name: 'button-remove',
                    args: {distance: -40},
                },
                {
                    name: 'source-arrowhead',
                },
                {
                    name: 'target-arrowhead',
                    args: {
                        attrs: {
                            fill: 'red',
                        },
                    },
                },
            ])

            cell.attr('line/strokeWidth', '3');

            cell.toFront({deep: true});

        });

        this.x6Graph.on('edge:mouseleave', ({cell}) => {
            cell.removeTools()
            cell.attr('line/strokeWidth', '1');
        })

        //todo <<<<< now >>>>> x6 on node:dblclick
        this.x6Graph.on("node:dblclick", ({cell, e}) => {
            let nodeData = cell.getData();
            let tableId = nodeData.nodeId;
            let myTable = this.gMap.tables.get(tableId);
            let myDbUser = this.gMap.dbUsers.get(myTable.db_user_id);
            let myModule = this.gMap.modules.get(myTable.module_id);
            let myProduct = this.gMap.products.get(myModule.product_id);
            let myProductLine = this.gMap.productLines.get(myDbUser.product_line_id);
            let tableFirstLetter = myTable.table_name[0].toUpperCase();

            this.gCurrent.productLineId = myProductLine.product_line_id;
            this.gCurrent.productId = myProduct.product_id;
            this.gCurrent.moduleId = myModule.module_id;
            this.gCurrent.dbUserId = myDbUser.user_id;
            this.gCurrent.productsNodeSelectedType = "module";
            this.gCurrent.letterSelected = tableFirstLetter;
            this.gCurrent.tableId = myTable.table_id;

            let keys = [
                myProductLine.product_line_id,
                myProductLine.product_line_id + "_" + myProduct.product_id,
                myProductLine.product_line_id + "_" + myProduct.product_id + "_" + myModule.module_id,
            ];

            this.showProductDbUsers();
            this.showModuleTables();
            this.showTableDetail();

            let tablesTreeData = this.doGetTablesByLetter("known", tableFirstLetter);

            this.setState({
                treeSelectedKeysProducts: [keys[2]],
                treeExpandedKeysProducts: keys,
                isErDiagram: false,
                tabNavSelected: "tabNavOne",
                treeDataTablesKnown: tablesTreeData,
                treeSelectedKeysTableFirstLetters: tableFirstLetter,
                treeSelectedKeysTables: [myTable.table_id],
                productLineDbUserId: myDbUser.user_id
            })
        });

        this.x6Graph.on('edge:dblclick', ({edge}) => {
            alert(
                `边ID:${edge.id}, 起始节点: ${edge.source.cell},目标节点: ${edge.target.cell}`
            )
        });

        this.x6Graph.centerContent();

        this.x6Stencil = new Stencil({
            // title: '组件库',
            target: this.x6Graph,
            // collapsable: true,
            stencilGraphWidth: 140,
            stencilGraphHeight: 120,
            layoutOptions: {
                columns: 1,
                columnWidth: 140,
                rowHeight: 50,
                center: true,
                dx: 0,
                dy: 10,
            },
            groups: [
                {
                    name: 'groupModels',
                    title: '对象模型',
                },
                {
                    name: 'groupTransformers',
                    title: '转换器',
                },
            ],
            getDragNode: (node) => {
                let myNode = this.x6Graph.createNode({
                    width: 160,
                    height: 40,
                    shape: 'rect',
                    attrs: {
                        body: {
                            fill: 'transparent',
                            stroke: 'transparent',
                            strokeWidth: 1,
                        }
                    },
                });

                myNode.setData({
                    x: 0,
                    y: 0,
                    nodeType: "NODE_SHADOW",
                });

                this.x6Graph.addNode(myNode);

                myNode.on('change:position', this.x6Update);

                let nodeClone = node.clone();
                this.gDynamic.nodeShadow = myNode;
                nodeClone.on("change:position", (args) => {
                    this.gDynamic.x = args.current.x;
                    this.gDynamic.y = args.current.y;
                });

                this.gDynamic.timerMove = setInterval(() => {
                    this.gDynamic.nodeShadow.position(this.gDynamic.x, this.gDynamic.y)
                }, 10);

                return nodeClone
            },
            getDropNode: (node) => {
                clearInterval(this.gDynamic.timerMove);

                let nodeData = node.getData();
                switch(nodeData.nodeType) {
                    case "NODE_MODEL":
                        this.gDynamic.nodeShadow.size(160, 70);
                        this.gDynamic.nodeShadow.attr('body/stroke', '#5F9FFF');
                        this.gDynamic.nodeShadow.attr('body/fill', '#2F2F2F');
                        this.gDynamic.nodeShadow.attr('label/fill', '#EFEFEF');
                        this.gDynamic.nodeShadow.attr('label/fontSize', '14')
                        this.gDynamic.nodeShadow.attr('label/fontWeight', 'bold')
                        this.gDynamic.nodeShadow.attr('label/refX', '0.5')
                        this.gDynamic.nodeShadow.attr('label/refY', '5')
                        this.gDynamic.nodeShadow.attr('label/textAnchor', 'middle')
                        this.gDynamic.nodeShadow.attr('label/textVerticalAnchor', 'top')
                        this.gDynamic.nodeShadow.attr('label/text', '告警模型');

                        let myNodeChild = this.x6Graph.createNode({
                            width: 140,
                            height: 30,
                            shape: 'rect',
                            attrs: {
                                body: {
                                    fill: 'rgba(95,159,255,.2)',
                                    stroke: 'gray',
                                    strokeWidth: 1,
                                },
                                label: {
                                    fill: 'rgba(95,159,255,1)',
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    text: "告警标题",
                                },
                            },
                        });

                        myNodeChild.setData({
                            x: 0,
                            y: 0,
                            nodeName: "MODEL_PROPERTY_ALARM_TITLE",
                            nodeType: "NODE_MODEL_PROPERTY",
                        });

                        myNodeChild.position(this.gDynamic.x + 10, this.gDynamic.y + 30);

                        this.gDynamic.nodeShadow.addChild(myNodeChild);

                        this.gDynamic.nodeShadow.setData({
                            nodeName: "MODEL_ALARM",
                            nodeType: "NODE_MODEL"
                        })

                        this.setState({
                            nodeType: "NODE_MODEL"
                        });

                        this.gCurrent.node = this.gDynamic.nodeShadow;
                        this.gCurrent.nodeAttrs = this.gDynamic.nodeShadow.getAttrs();
                        break
                    case "NODE_TRANSFORMER":
                        this.gDynamic.nodeShadow.size(160, 70);
                        this.gDynamic.nodeShadow.attr('body/stroke', '#5F9FFF');
                        this.gDynamic.nodeShadow.attr('body/fill', '#2F2F2F');
                        this.gDynamic.nodeShadow.attr('label/fill', '#EFEFEF');
                        this.gDynamic.nodeShadow.attr('label/fontSize', '14')
                        this.gDynamic.nodeShadow.attr('label/fontWeight', 'bold')
                        this.gDynamic.nodeShadow.attr('label/refX', '0.5')
                        this.gDynamic.nodeShadow.attr('label/refY', '5')
                        this.gDynamic.nodeShadow.attr('label/textAnchor', 'middle')
                        this.gDynamic.nodeShadow.attr('label/textVerticalAnchor', 'top')
                        this.gDynamic.nodeShadow.attr('label/text', '转换器');

                        let myNodeTransformerChild = this.x6Graph.createNode({
                            width: 140,
                            height: 30,
                            shape: 'rect',
                            attrs: {
                                body: {
                                    fill: 'rgba(95,159,255,.2)',
                                    stroke: 'gray',
                                    strokeWidth: 1,
                                },
                                label: {
                                    fill: 'rgba(95,159,255,1)',
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    text: "请选择转换方法",
                                },
                            },
                        });

                        myNodeTransformerChild.setData({
                            x: 0,
                            y: 0,
                            nodeName: "TRANSFORMER_PROPERTY_FUNCTION",
                            nodeType: "NODE_TRANSFORMER_PROPERTY",
                        });
                        myNodeTransformerChild.position(this.gDynamic.x + 10, this.gDynamic.y + 30);

                        this.gDynamic.nodeShadow.addChild(myNodeTransformerChild);

                        this.gDynamic.nodeShadow.setData({
                            nodeName: "TRANSFORMER_UNKNOWN",
                            nodeType: "NODE_TRANSFORMER"
                        })

                        this.setState({
                            nodeName: "TRANSFORMER_UNKNOWN",
                            nodeType: "NODE_TRANSFORMER"
                        });

                        this.gCurrent.node = this.gDynamic.nodeShadow;
                        this.gCurrent.nodeAttrs = this.gDynamic.nodeShadow.getAttrs();
                        break
                    default:
                        break
                }

                this.x6SetFormItems();

                return node.clone();
            },
            validateNode: (node, options) => {
                let pos = node.position();

                node.setData({
                    x: pos.x,
                    y: pos.y,
                });

                return false
            }
        })

        this.gRef.x6StencilContainerBox.current.appendChild(this.x6Stencil.container);

        this.x6LoadModels();
        this.x6LoadTransformers();
    }

    x6LoadModels() {
        const nodeModel = new Rect({
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#AFAFAF',
                    stroke: '#4B4A67',
                    strokeWidth: 1,
                },
                text: {
                    text: '告警模型',
                    fill: 'black',
                    fontWeight: "bold",
                },
            },
        })
        nodeModel.setData({nodeName: "MODEL_UNKNOWN", nodeType: "NODE_MODEL"});

        this.x6Stencil.load([nodeModel], 'groupModels')
    }

    x6LoadTransformers() {
        const nodeTransformer = new Rect({
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#AFAFAF',
                    stroke: '#4B4A67',
                    strokeWidth: 1,
                },
                text: {
                    text: '转化器',
                    fill: 'black',
                    fontWeight: "bold",
                },
            },
        })
        nodeTransformer.setData({nodeName: "TRANSFORMER_UNKNOWN", nodeType: "NODE_TRANSFORMER"});

        this.x6Stencil.load([nodeTransformer], 'groupTransformers')
    }

    x6Move() {
        let view = this.x6Graph.findViewByCell(this.gDynamic.node);

        if ((view !== null) && (view !== undefined)) {
            if ((this.gDynamic.node.data.nodeType === "table_column") || (this.gDynamic.node.data.nodeType === "table_button_add_column")) {
                return view.cell.getBBox();
            }

            return null
        }
    }

    x6Update() {
        let edgeView = this.x6Graph.findViewByCell(this.gDynamic.edge);

        if ((edgeView !== null) && (edgeView !== undefined)) {
            edgeView.update()
        }
    }

    //todo <<<<< now >>>>> x6 add Entity Table
    x6AddEntityTable(table) {
        let x = 50;
        let y = 50;
        let hTitle = 30;
        let wc = 120;
        let hc = 30;
        let wt = wc + 20;
        let ht = hc + 20;

        let enTable = this.x6Graph.addNode({
            x: x,
            y: y,
            width: wt,
            height: ht,
            label: table.table_name,
            attrs: {
                body: {
                    connectionCount: 0,
                    stroke: "#0F0F0F",
                    strokeWidth: 1,
                    fill: '#AFAFAF',
                    magnet: true,
                },
                label: {
                    fill: '#000000',
                    fontSize: 14,
                    fontWeight: "bold",
                    refX: 0.5,
                    refY: 5,
                    textAnchor: 'middle',
                    textVerticalAnchor: 'top',
                },
            },
        })
        enTable.on('change:position', this.x6Update);

        let n = 0;
        table.columns.forEach((item) => {
            let myColumn = this.gMap.columns.get(item);
            let enColumn = this.x6Graph.addNode({
                x: x,
                y: y + n * (hc + 2),
                width: wc,
                height: hc,
                label: myColumn.column_name,
                attrs: {
                    body: {
                        connectionCount: 0,
                        stroke: "#2F2F2F",
                        strokeWidth: 1,
                        fill: '#8F8F8F',
                        magnet: true,
                    },
                    label: {
                        fill: '#fff',
                        fontSize: 12,
                    },
                },
                ports: {
                    groups: {
                        groupLeft: {
                            position: {
                                name: "left",
                            }
                        },
                        groupRight: {
                            position: {
                                name: "right",
                            }
                        }
                    },
                },
            });

            if ((myColumn.data_type === "int") || (myColumn.data_type === "number")) {
                enColumn.addPort({
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

                enColumn.addPort({
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
            }

            enColumn.setData({
                nodeType: "table_column",
                nodeId: item,
            });

            enTable.addChild(enColumn);

            // let view = this.x6Graph.findViewByCell(enColumn);
            // view.can("nodeMovable", false);

            n++;
        });


        // let columnButton = this.x6Graph.addNode({
        //     x: x,
        //     y: y + n * (hc + 2),
        //     width: wc,
        //     height: hc,
        //     label: "+",
        //     attrs: {
        //         body: {
        //             connectionCount: 0,
        //             stroke: "#2F2F2F",
        //             strokeWidth: 1,
        //             fill: '#8F8F8F',
        //             magnet: true,
        //         },
        //         label: {
        //             fill: '#fff',
        //             fontSize: 12,
        //         },
        //     },
        // });
        //
        // columnButton.setData({
        //     nodeType: "table_column_button_add",
        //     nodeId: "column_button_add",
        // });
        //
        // columnButton.position(0, 0, {relative: true});
        // enTable.addChild(columnButton);

        enTable.fit({padding: {top: hTitle + 10, bottom: 10, left: 10, right: 10}});

        enTable.setData({
            nodeType: "table",
            nodeId: table.table_id
        });

        return enTable;
    }

    x6AddEntityTableColumn(table, column) {
        // let nodeTable = this.x6GetTable(table);

        if (column === undefined) {
        }
    }

    x6GetTable(table) {
        const nodes = this.x6Graph.getNodes();
        let myNode;

        for (let i = 0; i < nodes.length; i++) {
            let nodeData = nodes[i].getData();

            if (nodeData.nodeType === "table") {
                myNode = nodes[i];
                break
            }
        }

        return myNode
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
                        <div className="BoxTitle" />
                    </div>
                    <div className="BoxContent">
                        <div className={"BoxKafkas"}>
                        <div className={"BoxUpDown"}>
                            <div className="BoxToolbarErDiagram">
                                <div className="box-properties-title-bar">
                                    <div className="box-properties-title">监控对象列表</div>
                                </div>
                                <div className={"BoxSearch"}>
                                    <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                            </div>
                            <div className={"BoxTreeErDiagram"}>
                                <div className={"BoxTree"}>
                                    <div className={"BoxTreeInstance"}>
                                        <Tree ref={this.gRef.treeTadMddTree}
                                              treeData={this.state.treeDataMddTree}
                                              // onSelect={this.onTreeMddTreeSelected}
                                              selectable={!this.state.isMddTreeEditing}
                                              className={"TreeKnown"} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={true} showIcon={true}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={"box-box-canvas"}>
                            <div className={"box-box-canvas-toolbar"}>
                                <div className={"box-box-canvas-toolbar-title"}>&nbsp;</div>
                                <div className={"box-box-canvas-toolbar-buttons"}>
                                    <Button size={"small"} type={"primary"} onClick={this.onButtonX6ToPng}>导出</Button>
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
                                    <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                                </div>
                                <div className={"box-properties-content"}>
                                    <div className={this.state.nodeType === "table" ? "box-form-items-table" : "BoxHidden"}>
                                        <Form.Item className="box-form-item-input">
                                            <Form.Item name="tableName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="请输入表名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                    </div>
                                    <div className={this.state.nodeType === "table_column" ? "box-form-items-table-column" : "BoxHidden"}>
                                        <Form.Item className="box-form-item-input">
                                            <Form.Item name="tableColumnName" noStyle><Input/></Form.Item>
                                            <Tooltip placement="topLeft" title="请输入表字段名称" arrowPointAtCenter>
                                                <div className="input-icon"><QuestionCircleOutlined/></div>
                                            </Tooltip>
                                        </Form.Item>
                                        <Form.Item className="box-form-item-input">
                                            {/*<Form.Item name="tableColumnDataType" noStyle><Input/></Form.Item>*/}
                                            <Form.Item name="tableColumnDataType" noStyle>
                                                <Select options={optionsDataType} onChange={this.onSelectX6TableColumnDataTypeChanged}/>
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
                                    <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
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

