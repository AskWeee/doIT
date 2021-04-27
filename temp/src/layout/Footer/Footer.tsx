/*
Author: Eli Elad Elrom
Website: https://EliElrom.com
License: MIT License
Component: src/component/Footer/Footer.tsx
*/

import React from 'react'
import './Footer.scss'

export default class Footer extends React.PureComponent<IFooterProps, IFooterState> {

  constructor(props: IFooterProps) {
    super(props);
    this.state = {
      // TODO
    }
  }

  // If you need 'shouldComponentUpdate' -> Refactor to React.Component
  // Read more about component lifecycle in the official docs:
  // https://reactjs.org/docs/react-component.html

  /*
  public shouldComponentUpdate(nextProps: IMyPageProps, nextState: IMyPageState) {
    // invoked before rendering when new props or state are being received.
    return true // or prevent rendering: false
  } */

  static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IFooterProps, IFooterState> = (props:IFooterProps, state: IFooterState) => {
    // invoked right before calling the render method, both on the initial mount and on subsequent updates
    // return an object to update the state, or null to update nothing.
    return null
  }

  public getSnapshotBeforeUpdate(prevProps: IFooterProps, prevState: IFooterState) {
    // invoked right before the most recently rendered output is committed
    // A snapshot value (or null) should be returned.
    return null
  }

  componentDidUpdate(prevProps: IFooterProps, prevState: IFooterState, snapshot: IFooterSnapshot) {
    // invoked immediately after updating occurs. This method is not called for the initial render.
    // will not be invoked if shouldComponentUpdate() returns false.
  }

  render() {
    return (
      <div className="Footer">
        <div className={"BoxMessage"}>
          <div className={"Message"}>系统提示：</div>
        </div>
        <div></div>
        <div className={"BoxClock"}>
          <div className={"Clock"}>2021-06-01 12:12:12</div>
        </div>
      </div>)
  }
}

interface IFooterProps {
  // TODO
}

interface IFooterState {
  // TODO
}

interface IFooterSnapshot {
  // TODO
}