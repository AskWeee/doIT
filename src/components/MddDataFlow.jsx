import React from 'react'
import './MddDataFlow.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import {Button, Form, Input, Select, Tooltip, Tree, Upload} from 'antd'
import {CaretDownOutlined, CloudUploadOutlined, PlusSquareOutlined, QuestionCircleOutlined,} from '@ant-design/icons'
import EditableCellTool from "./EditableCellTool";
import {Addon, DataUri, Graph, Shape} from "@antv/x6";
import TadMddFlow from "../entity/TadMddFlow";
import TadMddTree from "../entity/TadMddTree";

const {Stencil} = Addon;
const {Rect} = Shape;

export default class MddDataFlow extends React.PureComponent {
    static contextType = GCtx;

    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {
        x6StencilContainerBox: React.createRef(),
        x6GraphContainerBox: React.createRef(),
        x6GraphContainer: React.createRef(),
        formX6Properties: React.createRef(),
        treeModelProperties: React.createRef(),
        treeTransformerProperties: React.createRef(),
    };
    gDynamic = {};

    constructor(props) {
        super(props);

        this.state = {
            treeDataMddTree: [],
            treeDataModels: [],
            treeDataTransformers: [],
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
        this.onButtonX6ImportModels = this.onButtonX6ImportModels.bind(this);
        this.onButtonX6ImportTransformers = this.onButtonX6ImportTransformers.bind(this);

        this.onButtonX6FormConfirmClicked = this.onButtonX6FormConfirmClicked.bind(this);
        this.onButtonX6FormCancelClicked = this.onButtonX6FormCancelClicked.bind(this);
        this.onButtonAddMddDirClicked = this.onButtonAddMddDirClicked.bind(this);
        this.onButtonAddMddFlowClicked = this.onButtonAddMddFlowClicked.bind(this);

        this.beforeUploadImportModels = this.beforeUploadImportModels.bind(this);
        this.beforeUploadImportTransformers = this.beforeUploadImportTransformers.bind(this);

        this.onChangeImportModels = this.onChangeImportModels.bind(this);
        this.onChangeImportTransformers = this.onChangeImportTransformers.bind(this);

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
        this.x6Init();
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

    // now >>>> x6 init
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

        //todo <<<<< now >>>>> x6Graph on node:click
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

            console.log(nodeData.nodeType);
            if (nodeData.nodeType === "NODE_MODEL") {
                node.toFront({deep: true});
                this.setState({
                    nodeType: "NODE_MODEL"
                });
            } else if (nodeData.nodeType === "NODE_MODEL_PROPERTY") {
                this.setState({
                    nodeType: "NODE_MODEL_PROPERTY"
                });
            } else if (nodeData.nodeType === "NODE_TRANSFORMER") {
                this.setState({
                    nodeType: "NODE_TRANSFORMER"
                });
            } else if (nodeData.nodeType === "NODE_TRANSFORMER_PROPERTY") {
                this.setState({
                    nodeType: "NODE_TRANSFORMER_PROPERTY"
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

        // >>>>> x6 on node:dblclick
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

    // >>>>> x6 add Entity Table
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

    onButtonX6ImportModels(e) {

    }

    onButtonX6ImportTransformers(e) {

    }

    // >>>>> on button X6 Save clicked
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

    // >>>>> on button Add Table Er Dir clicked
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

    // >>>>> upload and import excel
    beforeUploadImportModels(file) {
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let data = e.target.result;
                    //console.log(data);
                    //let re = new RegExp("", "ig")
                    // let re = /^[\s\t]*def[\s\t]+([\s\t]*\w+,)*([\s\t]*\w+[\s\t]*);$/gm;
                    // 方法名：
                    let mapMethod = new Map();
                    let setMethod = new Set();
                    let reMethod = /^[\s\t]*private[\s\t]+\w+[\s\t]+\w+\(([\s\t]*\w+[\s\t]+\w+[,]*)*\)[\s\t\n]*{/gm;
                    let resultMethod = reMethod[Symbol.matchAll](data);
                    let arrMethod = Array.from(resultMethod, x => x[0]);
                    arrMethod.forEach((itemMethod) => {
                        let reName = /^[\s\t]*private[\s\t]+\w+[\s\t]+(\w+)\(([\s\t]*\w+[\s\t]+\w+[,]*)*\)[\s\t\n]*{/g;
                        let methodName = itemMethod.replace(reName, "$1");
                        setMethod.add(methodName);
                    });
                    let arrMethodNew = Array.from(setMethod);
                    arrMethodNew.sort();

                    let treeDataTransformers = [];
                    arrMethodNew.forEach((itemMethod) => {
                        let uiTree = {
                            key: itemMethod,
                            title: itemMethod,
                            children: []
                        } ;
                        treeDataTransformers.push(uiTree);
                    });
                    this.setState({
                        treeDataTransformers: treeDataTransformers
                    })

                    // let reClass = /^[\s\t]*class[\s\t]+\w+[\s\t\n]*{[\s\t\n]*(.*!(private void).*\n)*[\s\t]+private[\s\t]+void/gm;
                    // let resultClass = reClass[Symbol.matchAll](data);
                    // console.log(Array.from(resultClass, x => x[0]));

                    let reDef = /[\s\t]+[oi]+_\w+[\s\t]*[,;]+/gm;
                    let resultDef = reDef[Symbol.matchAll](data);
                    let arrDef = Array.from(resultDef, x => x[0]);
                    let setOutDefs = new Set();
                    let setInDefs = new Set();
                    arrDef.forEach((itemDef) => {
                        let defName = itemDef.replace(/[\s\t]+/g, "");
                        defName = defName.replace(/[,;]+/g, "");
                        if (defName.startsWith("o")) {
                            setOutDefs.add(defName);
                        } else {
                            setInDefs.add(defName);
                        }
                    });
                    let arrInDef = Array.from(setInDefs);
                    let arrOutDef = Array.from(setOutDefs);
                    arrInDef.sort();
                    arrOutDef.sort();
                    let treeDataModels = [];
                    arrInDef.forEach((itemDef) => {
                        let uiTree = {
                            key: itemDef,
                            title: itemDef,
                            children: []
                        } ;
                        treeDataModels.push(uiTree);
                    });
                    arrOutDef.forEach((itemDef) => {
                        let uiTree = {
                            key: itemDef,
                            title: itemDef,
                            children: []
                        } ;
                        treeDataModels.push(uiTree);
                    });
                    this.setState({
                        treeDataModels: treeDataModels
                    })


                    // exp = exp.replace(/^\s+|\s+$/g, "");                // 去除前后端空格
                    // exp = exp.replace(/[\w.*]*\w[.]*/g, "__KV__$&");    // 标识counter名称，范例：((nmosdb....table_name.field01+nmosdb.test.field + a01 +abce_test 0.0.5) ..100. 100..200))
                    // exp = exp.replace(/[.]/g, "__KD__");                // 标识符号：“.”
                    // exp = exp.replace(/\s+/g, "");                      // 清除内部空格
                    // let arrExp = exp.match(/(\W?\w*)/g);                // 分解出代码段

                    // let wb = XLSX.read(data, {type: "binary"});
                    // if (wb.SheetNames.length < 3) reject("文件格式不正确-SHEET数量少于3");

                    resolve();
                } catch (e) {
                    reject(e.message);
                }
            }
            reader.readAsBinaryString(file);
        }).then((r) => {
            this.context.showMessage("文件解析完毕");
        })

        return Upload.LIST_IGNORE;
    }

    onChangeImportModels(info) {
        if (info.file.status !== 'uploading') {
            console.log("!== uploading");
        }
        if (info.file.status === 'done') {
            console.log("done");
        } else if (info.file.status === 'error') {
            console.log("error");
        }
    }

    beforeUploadImportTransformers(file) {
        // new Promise((resolve, reject) => {
        //     const reader = new FileReader();
        //     reader.onload = (e) => {
        //         try {
        //             let data = e.target.result;
        //             console.log(data);
        //             // let wb = XLSX.read(data, {type: "binary"});
        //             // if (wb.SheetNames.length < 3) reject("文件格式不正确-SHEET数量少于3");
        //
        //             resolve();
        //         } catch (e) {
        //             reject(e.message);
        //         }
        //     }
        //     reader.readAsBinaryString(file);
        // }).then((r) => {
        //     this.context.showMessage("文件解析完毕");
        // })

        return Upload.LIST_IGNORE;
    }

    onChangeImportTransformers(info) {
        // if (info.file.status !== 'uploading') {
        //     console.log("!== uploading");
        // }
        // if (info.file.status === 'done') {
        //     console.log("done");
        // } else if (info.file.status === 'error') {
        //     console.log("error");
        // }
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

        const {treeTadMddTree, x6StencilContainerBox, treeModelProperties, treeTransformerProperties} = this.gRef;
        const {treeDataMddTree, treeDataModels, treeDataTransformers, isMddTreeEditing, nodeType} = this.state;

        return (
            <div className="MddDataFlow">
                <div className={"BoxErDiagram"}>
                    <div className="BoxTitleBar">
                        <div className="BoxTitle" />
                    </div>
                    <div className="BoxContent">
                        <div className={"BoxUpDown"}>
                            <div className="BoxToolbarErDiagram">
                                <div className={"BoxSearch"}>
                                    <Input.Search placeholder="Search" size="small" enterButton onChange={this.onInputSearchSchemasChanged} onSearch={this.onInputSearchSchemasSearched}/>
                                </div>
                                <Button onClick={this.onButtonAddMddDirClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>建目录</Button>
                                <Button onClick={this.onButtonAddMddFlowClicked} icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>建流程</Button>
                            </div>
                            <div className={"BoxTreeErDiagram"}>
                                <div className={"BoxTree"}>
                                    <div className={"BoxTreeInstance"}>
                                        <Tree ref={treeTadMddTree}
                                              treeData={treeDataMddTree}
                                              onSelect={this.onTreeMddTreeSelected}
                                              selectable={!isMddTreeEditing}
                                              className={"TreeKnown"} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={true} showIcon={true}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div ref={x6StencilContainerBox} className="BoxEntities"/>
                        <div className={"box-box-canvas"}>
                            <div className={"box-box-canvas-toolbar"}>
                                <div className={"box-box-canvas-toolbar-title"}>&nbsp;</div>
                                <div className={"box-box-canvas-toolbar-buttons"}>
                                    <Upload name='file'
                                            accept=".groovy"
                                            beforeUpload={this.beforeUploadImportModels}
                                            onChange={this.onChangeImportModels}>
                                        <Button size={"small"} type={"primary"} icon={<CloudUploadOutlined/>}>导入对象模型</Button>
                                    </Upload>
                                    <Upload name='file'
                                            accept=".groovy"
                                            beforeUpload={this.beforeUploadImportTransformers}
                                            onChange={this.onChangeImportTransformers}>
                                        <Button size={"small"} type={"primary"} icon={<CloudUploadOutlined/>}>导入转化器</Button>
                                    </Upload>
                                    <Button size={"small"} type={"primary"} onClick={this.onButtonX6Save}>保存</Button>
                                    <Button size={"small"} type={"primary"} onClick={this.onButtonX6ToPng}>导出</Button>
                                </div>
                            </div>
                            <div ref={this.gRef.x6GraphContainerBox} className="box-canvas">
                                <div ref={this.gRef.x6GraphContainer}/>
                            </div>
                        </div>
                        <div className={"box-properties"}>
                            <div className={"form-x6-properties"}>
                                <div className="box-properties-title-bar">
                                    <div className="box-properties-title">属性编辑</div>
                                    <div className="box-properties-buttons">
                                        <Button htmlType="submit" disabled={false}
                                                icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>确认</Button>
                                        <Button onClick={this.onButtonX6FormCancelClicked} disabled={false}
                                                icon={<PlusSquareOutlined/>} size={"small"} type={"primary"}>放弃</Button>
                                    </div>
                                </div>
                                <div className={"box-properties-content"}>
                                    <div className={nodeType === "NODE_MODEL" ? "box-form-items-table" : "BoxHidden"}>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTreeInstance"}>
                                                <Tree ref={treeModelProperties}
                                                      treeData={treeDataModels}
                                                      //onSelect={this.onTreeMddTreeSelected}
                                                      //selectable={!isMddTreeEditing}
                                                      className={"TreeKnown"} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={true} showIcon={true}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={nodeType === "NODE_TRANSFORMER" ? "box-form-items-table-column" : "BoxHidden"}>
                                        <div className={"BoxTree"}>
                                            <div className={"BoxTreeInstance"}>
                                                <Tree ref={treeTransformerProperties}
                                                      treeData={treeDataTransformers}
                                                      //onSelect={this.onTreeMddTreeSelected}
                                                      //selectable={!isMddTreeEditing}
                                                      className={"TreeKnown"} switcherIcon={<CaretDownOutlined/>} blockNode={true} showLine={true} showIcon={true}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

