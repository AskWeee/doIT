import React from 'react'
import {Select} from "antd";

export default class KSelect extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      counter: 10,
      data: [],
      value: ''
    }

    this.showComponent = this.showComponent.bind(this);
  }

  componentDidUpdate() {

  }

  onChange (e) {
    this.props.onKChange(e);
  }

  showComponent(sd) {
    this.setState({
      data: sd
    })
  }

  render() {
    return <div style={{display: "inline-block"}}>
      <Select onChange = { this.onChange.bind(this) } style={{width: "100%"}} defaultValue="0">
        <Select.Option value="0">请选择</Select.Option>
        {this.state.data.map((item) => (
          <Select.Option key={item} value={item}>{item}</Select.Option>
        ))}
      </Select>
    </div>
  }
}
