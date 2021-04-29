import React from 'react';
import './Content.scss'
import GCtx from "../GCtx";
import DatabaseImport from "./DatabaseImport";
import DatabaseExport from "./DatabaseExport";
import LowcodeSingleTable from "./LowcodeSingleTable";
import DatabaseRelation from "./DatabaseRelation";

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

  showComponentDatabaseRelation() {
    let children = [];
    children.push(<DatabaseRelation key="menu_database_relation"/>);

    this.setState({
      children: children
    })
  }

  showComponentDatabaseImport() {
    let children = [];
    children.push(<DatabaseImport key="menu_database_import"/>);

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

  showComponentLowcodeSingleTable() {
    let children = [];
    children.push(<LowcodeSingleTable key="menu_lowcode_single_table"/>);

    this.setState({
      children: children
    })
  }

  componentDidMount(){

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
