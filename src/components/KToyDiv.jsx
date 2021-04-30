import React from 'react'
import './KToyDiv.scss'
import {Button, Tree} from 'antd'
import {CaretDownOutlined, MoreOutlined} from '@ant-design/icons';

export default class KToyDiv extends React.Component {

  refHeader = React.createRef();
  gPosition = {
    x: 0,
    y: 0
  }

  constructor(props) {
    super(props);

    this.state = {
      counter: 10,
      data: [{
        title: "test-01",
        key: "test-01",
        children: [{
          title: "test-01-01",
          key: "test-01-01",
          children: []},
          {
            title: "test-01-02",
            key: "test-01-02",
            children: []}]
      },
        {
          title: "test-02",
          key: "test-02",
          children: [{
            title: "test-02-01",
            key: "test-02-01",
            children: []},
            {
              title: "test-02-02",
              key: "test-02-02",
              children: []}]
        },
        {
          title: "test-03",
          key: "test-03",
          children: [{
            title: "test-03-01",
            key: "test-03-01",
            children: []},
            {
              title: "test-03-02",
              key: "test-03-02",
              children: []}]
        }
      ],
      value: '',
      styles: {
        left: "100px",
        top: "100px"
      },
      isMouseDown: false
    }

    this.showComponent = this.showComponent.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);
    this.onHeaderMouseUp = this.onHeaderMouseUp.bind(this);
    this.onHeaderMouseMove = this.onHeaderMouseMove.bind(this);
  }

  componentDidUpdate() {

  }

  componentDidMount() {

  }

  onChange (e) {
    this.props.onKChange(e);
  }

  showComponent(sd) {
    this.setState({
      data: sd
    })
  }

  onHeaderClick() {
    console.log(this.refHeader);
  }

  onHeaderMouseDown(e) {
    this.setState({isMouseDown: true});
    this.gPosition.x = e.clientX;
    this.gPosition.y = e.clientY;
  }

  onHeaderMouseUp() {
    this.setState({isMouseDown: false});
  }

  onHeaderMouseMove(e) {
    if (this.state.isMouseDown) {
      const {styles} = this.state;
      let mLeft = parseInt(styles.left.split("px")[0]);
      let mTop = parseInt(styles.top.split("px")[0]);
      let stylesNew = {
        left: mLeft + e.clientX - this.gPosition.x + "px",
        top: mTop + e.clientY - this.gPosition.y + "px",
      };

      this.setState({
        styles: stylesNew
      })

      this.gPosition.x = e.clientX;
      this.gPosition.y = e.clientY;

    }
  }

  render() {
    return <div className={"KToyDiv"} style={this.state.styles}>
      <div ref={this.refHeader} className={"BoxHeader"}
           onClick={this.onHeaderClick}
           onMouseDown={this.onHeaderMouseDown}
           onMouseUp={this.onHeaderMouseUp}
           onMouseMove={this.onHeaderMouseMove}>
        <div className={"BoxTitle"}>Title</div>
        <div className={"BoxToolbar"}>
          <Button type="primary" icon={<MoreOutlined />} size={"small"}/>
        </div>
      </div>
      <div className={"BoxTree"}>
        <Tree
          blockNode={true}
          showLine={true}
          showIcon={true}
          switcherIcon={<CaretDownOutlined/>}
        treeData={this.state.data}
        />
      </div>
    </div>
  }
}
