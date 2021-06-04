import React from 'react';
import './Content.scss'
import GCtx from "../GCtx";
import DatabaseImport from "./DatabaseImport";
import DatabaseMaintain from "./DatabaseMaintain";
import DatabaseCompare from "./DatabaseCompare";
import DatabaseExport from "./DatabaseExport";
import DatabaseConfig from "./DatabaseConfig";
import LowcodeSingleTable from "./LowcodeSingleTable";
import ServicePerformance from "./ServicePerformance";

class Content extends React.Component {
  static contextType = GCtx;

  constructor(props) {
    super(props);
    this.state = {
      message: "message from content",
      children: [],
    }

    this.props.onRef(this);
  }

  showComponentDatabaseImport() {
    let children = [];
    children.push(<DatabaseImport key="menu_database_import"/>);

    this.setState({
      children: children
    })
  }

  showComponentDatabaseMaintain() {
    let children = [];
    children.push(<DatabaseMaintain key="menu_database_maintain"/>);

    this.setState({
      children: children
    })
  }

  showComponentDatabaseCompare() {
    let children = [];
    children.push(<DatabaseCompare key="menu_database_compare"/>);

    this.setState({
      children: children
    })
  }

  showComponentDatabaseExport() {
    let children = [];
    children.push(<DatabaseExport key="menu_database_export"/>);

    this.setState({
      children: children
    })
  }

  showComponentDatabaseConfig() {
    let children = [];
    children.push(<DatabaseConfig key="menu_database_config"/>);

    this.setState({
      children: children
    })
  }

  showComponentLowcodeSingleTable() {
    let children = [];
    children.push(<LowcodeSingleTable key="menu_lowcode_single_table"/>);

    this.setState({
      children: children
    })
  }

  // ****************************************************************************************************
  // 装载功能模块：指标服务（性能指标相关服务）
  // ****************************************************************************************************
  showComponentServicePerformance() {
    let children = [];
    children.push(<ServicePerformance key="menu_service_performance"/>);

    this.setState({
      children: children
    })
  }

  componentDidMount(){

  }

  onContentMouseEnter(e) {
    console.log(e);
  }

  render() {
    return (
      <div className="Content">
        {this.state.children.map((item) => {
          return item
        })}
      </div>)
  }
}

export default Content
