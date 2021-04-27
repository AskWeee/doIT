import React from 'react'
import './Header.scss'
import GCtx from "../../GCtx";
import {IHeaderProps, IHeaderState} from "../../GInterface";

export default class Header extends React.PureComponent<IHeaderProps, IHeaderState> {
  static contextType = GCtx;

  refHeader = React.createRef<HTMLDivElement>();
  refMenus = new Array<any>();

  constructor(props: IHeaderProps) {
    super(props);

    this.state = {
      jsxMenus: new Array<any>()
    }

    this.onClickMenu = this.onClickMenu.bind(this);
  }

  componentDidMount() {
    let jsxMenus = new Array<any>();

    for(let menu of this.context.menus) {
      let refMenu = React.createRef<HTMLDivElement>();
      this.context.mapMenus.set(menu.id, {label : menu.label, desc: menu.desc, ref: refMenu, children: new Map()});
      jsxMenus.push(
        <div key={menu.id}
             id={menu.id}
             ref={refMenu}
             className="Menu"
             onClick={(event) => {
               this.onClickMenu(event)
             }}>{menu.label}</div>
      );
      for(let child of menu.children) {
        this.context.mapMenus.get(menu.id).children.set(child.id, {label : child.label, desc: child.desc});
      }
    }

    this.setState({jsxMenus: jsxMenus});
  }

  onClickMenu(event: React.MouseEvent<HTMLDivElement>) {
    let id = event.currentTarget.id;
    let node: any;
    let ref = this.context.mapMenus.get(id).ref;
    if (ref) {
      node = ref.current;
    }

    if (node) {
      //console.log(ref, node);
      //console.log(node.getClientRects());
      let rect = node.getBoundingClientRect();
      let sender = {
        id: id,
        x: rect.left,
        y: rect.bottom,
        w: rect.width,
        h: rect.height
      }

      this.context.onMenuClicked(sender);
    }
  }

  render() {
    return (
      <div ref={this.refHeader} className="Header">
        <div className="BoxTitle">
          <div className="Title">doIT</div>
        </div>
        <div className="BoxMenus">
          {this.state.jsxMenus}
        </div>
        <div className="BoxUser">
          <div className="Username">{this.context.author}</div>
        </div>
      </div>
    )
  }
}
