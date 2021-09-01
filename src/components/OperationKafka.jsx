import React from 'react'
import './OperationKafka.scss'
import GCtx from "../GCtx";
import axios from "axios";
import lodash from "lodash";
import moment from 'moment';
import {Button, Form, Input, Select, Tree} from 'antd'
import {CaretDownOutlined, CloseOutlined, PlusSquareOutlined,} from '@ant-design/icons'

export default class OperationKafka extends React.PureComponent {
    static contextType = GCtx;

    gMap = {};
    gData = {};
    gCurrent = {};
    gRef = {};
    gDynamic = {};

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

        this.doGetAll = this.doGetAll.bind(this);

    }

    componentDidMount() {
        this.doPrepare();
        this.doGetAll();
    }

    doPrepare() {

    }

    doInit() {
    }

    //todo >>>>> do Get All
    doGetAll() {
        this.doInit();
    }

    //todo >>>>> render
    render() {
        return (
            <div className="OperationKafka">
                Hello World.
            </div>
        )
    }
}

