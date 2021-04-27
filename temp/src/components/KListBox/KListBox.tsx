import React from 'react'
import ReactDOM from 'react-dom';
import './KListBox.scss'
import {contextApp} from "../../ContextApp";

export default class KListBox extends React.PureComponent<IHeaderProps, IHeaderState> {

  constructor(props: IHeaderProps) {
    super(props);
    this.state = {
      counter: 0,
      menuSelected: '',
      msg: '',
      e: undefined
    }

    this.onMenuClickHandler = this.onMenuClickHandler.bind(this);
  }

  static defaultProps = {
    title: 'doIT'
  }

  onMenuClickHandler(event: React.MouseEvent<HTMLElement>) {
    console.log(event.target);
    let rect = (ReactDOM as any).findDOMNode(event.target).getBoundingClientRect()

    console.log(rect);
    let x = Math.floor(rect.x) + 15 + 'px';
    let y = Math.ceil(rect.y + rect.height) + 1 + 'px';
    let items = [
      {id: 'menuHelpGuide', name: '系统使用指南'},
      {id: 'menuHelpGuide', name: '系统使用指南'},
      {id: 'menuHelpAbout', name: '关于'}
    ];
    this.context.changeData(x, y, items);
  }

  static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IHeaderProps, IHeaderState> = (props: IHeaderProps, state: IHeaderState) => {

    return null
  }

  public getSnapshotBeforeUpdate(prevProps: IHeaderProps, prevState: IHeaderState) {

    return null
  }

  componentDidUpdate(prevProps: IHeaderProps, prevState: IHeaderState, snapshot: IHeaderSnapshot) {

  }

  render() {
    return (
      <div className="KListBox">
      </div>)
  }

}

interface IHeaderProps {
  title: string
}

interface IHeaderState {
  counter: number,
  menuSelected: string,
  msg: string,
  e: any
}

interface IHeaderSnapshot {
  // TODO
}

KListBox.contextType = contextApp;