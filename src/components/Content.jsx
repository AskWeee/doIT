import React from 'react';
import './Content.scss'
import GCtx from "../GCtx";
import {CloseOutlined} from '@ant-design/icons';
import DatabaseImport from "./DatabaseImport";
import DatabaseMaintain from "./DatabaseMaintain";
import DatabaseCompare from "./DatabaseCompare";
import DatabaseExport from "./DatabaseExport";
import DatabaseWorkspace from "./DatabaseWorkspace";
import DatabaseConfig from "./DatabaseConfig";
import LowcodeSingleTable from "./LowcodeSingleTable";
import ServicePerformance from "./ServicePerformance";
import ServiceProject from "./ServiceProject";
import HelpUs from "./HelpUs";
import MddDataFlow from "./MddDataFlow";
import OperationKafka from "./OperationKafka";

class Content extends React.Component {
    static contextType = GCtx;

    gChildren = [];

    constructor(props) {
        super(props);
        this.state = {
            message: "message from content",
            current: null,
            tabs: [],
            children: [],
        }

        this.props.onRef(this);

        this.onTabTitleClicked = this.onTabTitleClicked.bind(this);
        this.onTabIconClicked = this.onTabIconClicked.bind(this);
        this.getMenuItem = this.getMenuItem.bind(this);
    }

    showComponentDatabaseImport() {
        this.showComponent("库表结构及数据导入", <DatabaseImport key="menu_database_import"/>);
    }

    showComponentDatabaseMaintain() {
        this.showComponent("库表结构及数据维护", <DatabaseMaintain key="menu_database_maintain"/>);
    }

    showComponentDatabaseCompare() {
        this.showComponent("库表结构及数据对比", <DatabaseCompare key="menu_database_compare"/>);
    }

    showComponentDatabaseExport() {
        this.showComponent("库表结构及数据导出", <DatabaseExport key="menu_database_export"/>);
    }

    showComponentDatabaseWorkspace() {
        this.showComponent("数据库工作台", <DatabaseWorkspace key="menu_database_workspace"/>);
    }

    showComponentDatabaseConfig() {
        this.showComponent("基础信息配置管理", <DatabaseConfig key="menu_database_config"/>)
    }

    showComponentLowcodeSingleTable() {
        this.showComponent("单表维护页面生成", <LowcodeSingleTable key="menu_lowcode_single_table"/>)
    }

    // ****************************************************************************************************
    // 装载功能模块：指标服务（性能指标相关服务）
    // ****************************************************************************************************
    showComponentServicePerformance() {
        this.showComponent("性能指标服务管理", <ServicePerformance key="menu_service_performance"/>)
    }

    showComponentServiceProject() {
        this.showComponent("指标项目应用管理", <ServiceProject key="menu_service_project"/>)
    }

    showComponentHelpUs(menuId) {
        let menuItem = this.getMenuItem(menuId);

        this.showComponent(menuItem.label, <HelpUs key={menuId}/>);
    }

    showComponentMddDataFlow(menuId) {
        let menuItem = this.getMenuItem(menuId);

        this.showComponent(menuItem.label, <MddDataFlow key={menuId}/>);
    }

    showComponentOperationKafka(menuId) {
        let menuItem = this.getMenuItem(menuId);

        this.showComponent(menuItem.label, <OperationKafka key={menuId}/>);
    }

    getMenuItem(menuId) {
        let myResult;

        this.context.menus.forEach((menuMain) => {
            menuMain.children.forEach((menuItem) => {
                if (menuItem.id === menuId) {
                    myResult = menuItem;
                }
            })
        });

        return myResult
    }

    showComponent(title, jsxCom) {
        let {tabs} = this.state;
        let current;

        if (tabs.includes(title)) {
            current = tabs.indexOf(title);
        } else {
            tabs.push(title);
            this.gChildren.push(jsxCom);
            current = this.gChildren.length - 1;
        }

        this.setState({
            tabs: tabs,
            current: current
        })
    }

    componentDidMount() {

    }

    onContentMouseEnter(e) {

    }

    onTabTitleClicked(e) {
        let tabIndex = parseInt(e.target.id.split("_")[1]);

        if (tabIndex !== this.state.current) {
            this.setState({
                current: tabIndex
            })
        }
    }

    onTabIconClicked(e) {
        let tabIndex = parseInt(e.currentTarget.id.split("_")[1]);
        let {tabs, current} = this.state;

        tabs.splice(tabIndex, 1);
        this.gChildren.splice(tabIndex, 1);

        if (tabIndex !== this.state.current) {
            if (tabIndex < this.state.current) current--;

            this.setState({
                tabs: tabs,
                current: current
            })
        } else {
            if (tabIndex > 0) {
                current = tabIndex - 1;
            } else {
                current = 0;
            }

            this.setState({
                tabs: tabs,
                current: current
            })
        }

        return false;
    }

    render() {
        return (
            <div key="ComponentContent" className="Content">
                <div className="BoxTabs">
                    {this.state.tabs.map((item, index) => {
                        return (
                            <div key={"tab_" + index} className={index === this.state.current ? "BoxTab BoxTabCurrent" : "BoxTab"}>
                                <div key={"titleTab_" + index} id={"titleTab_" + index} className="BoxTabTitle" onClick={this.onTabTitleClicked}>{item}</div>
                                <div key={"iconTab_" + index} id={"iconTab_" + index} className="BoxTabIcon" onClick={this.onTabIconClicked}><CloseOutlined/></div>
                            </div>
                        )
                    })}
                </div>
                <div className="BoxComponent">
                    {this.gChildren.length > 0 ? (
                        this.gChildren[this.state.current]
                    ) : (<div>&nbsp;</div>)
                    }
                </div>
            </div>
        )
    }
}

export default Content
