import React from 'react'
import './Content.scss'
import GCtx from "../../GCtx";
import OperationProduct from "../../components/OperationProduct/OperationProduct";

export default class Content extends React.PureComponent<IContentProps, IContentState> {
  static contextType = GCtx;

  constructor(props: IContentProps) {
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
    let children:any[] = [];
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

interface IContentProps {
  onRef?: any
}

interface IContentState {
  // TODO
  message: String,
  children: Array<any>
}

interface IContentSnapshot {
  // TODO
}