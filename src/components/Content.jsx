import React from 'react';
import './Content.scss'
import GCtx from "../GCtx";
import OperationProduct from "./OperationProduct";

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

  testFun(){
    this.setState({message: this.context.message + " - sub menu is clicked."});
  }

  showComponent() {
    let children = [];
    children.push(<OperationProduct key="menu_operation_product"/>);

    this.setState({
      children: children
    })
  }

  componentDidMount(){

  }

  render() {
    return (
      <div className="Content">
        {this.state.children.map((item, index) => {
          return item
        })}
      </div>)
  }
}

export default Content