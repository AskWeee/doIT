import React from 'react';
import './Content.scss'
import GCtx from "../GCtx";
import DatabaseImport from "./DatabaseImport";
import LowcodeSingleTable from "./LowcodeSingleTable";

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