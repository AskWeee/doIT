import React from 'react'
import GCtx from "../GCtx";

export default class KToySvgLine extends React.Component {
  static contextType = GCtx;

  refHeader = React.createRef();
  gPosition = {
    x: 0,
    y: 0
  }

  constructor(props) {
    super(props);

    this.state = {
      counter: 10,
      data: [],
      value: '',
      styles: {
        left: "100px",
        top: "100px",
        zIndex: 9
      },
      isMouseDown: false,
      pos: {
        x1: 0,
        y1: 0,
        x2: 600,
        y2: 100
      }
    }

    this.showComponent = this.showComponent.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);
    this.onHeaderMouseUp = this.onHeaderMouseUp.bind(this);
    this.onHeaderMouseMove = this.onHeaderMouseMove.bind(this);
    this.changePosition = this.changePosition.bind(this);
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

  changePosition(x1, y1) {
    let {pos} = this.state;
    let posNew = {
      x1: x1,
      y1: y1,
      x2: pos.x2,
      y2: pos.y2
    }
    this.setState({
      pos: posNew
      }
    )
  }

  onHeaderClick() {
    console.log(this.refHeader);
  }

  onHeaderMouseDown(e) {
    this.setState({isMouseDown: true});
    this.gPosition.x = e.clientX;
    this.gPosition.y = e.clientY;

    const {styles} = this.state;
    let s = {
      left: styles.left,
      top: styles.top,
      zIndex: 9999
    }
    this.setState({
        styles: s
    })
  }

  onHeaderMouseUp() {
    this.setState({isMouseDown: false});

    const {styles} = this.state;
    let s = {
      left: styles.left,
      top: styles.top,
      zIndex: 1
    }
    this.setState({
      styles: s
    })
  }

  onHeaderMouseMove(e) {
    if (this.state.isMouseDown) {
      const {styles} = this.state;
      let mLeft = parseInt(styles.left.split("px")[0]);
      let mTop = parseInt(styles.top.split("px")[0]);
      let stylesNew = {
        left: mLeft + e.clientX - this.gPosition.x + "px",
        top: mTop + e.clientY - this.gPosition.y + "px",
        zIndex: 9999
      };

      this.setState({
        styles: stylesNew
      })

      this.gPosition.x = e.clientX;
      this.gPosition.y = e.clientY;

    }
  }

  render() {
    return <line x1={this.state.pos.x1}
                 y1={this.state.pos.y1}
                 x2={this.state.pos.x2}
                 y2={this.state.pos.y2}
                 style={{stroke:"rgb(99,99,99)", strokeWidth:2}}/>
  }
}
