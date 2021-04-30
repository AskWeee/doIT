import React from 'react'
import './KToyDiv.scss'

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
      data: [],
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
           onMouseMove={this.onHeaderMouseMove}
      >title</div>
    </div>
  }
}
