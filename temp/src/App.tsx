import React from 'react'
import 'antd/dist/antd.css'
import './App.scss'
import Header from "./layout/Header/Header";
import Content from "./layout/Content/Content";
import Footer from "./layout/Footer/Footer";
import GCtx from "./GCtx";
import {IAppProps, IAppState, ISender} from "./GInterface";

class App extends React.PureComponent<IAppProps, IAppState> {
  static contextType = GCtx;

  ComContent: any;

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      child: null,
      changeData: () => {
        this.setState({});
      },
      sender: {id: '', x: 0, y: 0, w: 0, h: 0},
      isShownSubMenu: false,
      subMenus: [],
      event: {target: undefined, x: 0, y: 0, w: 0, h: 0},
      changeSubMenus: (event: React.MouseEvent<HTMLDivElement>, items: []) => {
        console.log(event);

        let e = {
          target: event.target,
          x: event.clientX,
          y: event.clientY,
          w: 0,
          h: 0
        };
        let menus = JSON.parse(JSON.stringify(items));
        let isShown = !this.state.isShownSubMenu;
        this.setState({isShownSubMenu: isShown, subMenus: menus, event: e});
      },
      contentChildren: [<Footer/>, <Footer/>],
      changeContentChildren: () => {
      },
      jsxSubMenu: new Array<any>()
    }

    this.onRefContent = this.onRefContent.bind(this);
    this.onMenuClicked = this.onMenuClicked.bind(this);
    this.onSubMenuClicked = this.onSubMenuClicked.bind(this);
  }

  componentDidMount() {
    this.setState({
      subMenus: this.context.subMenus
    });
    this.context.onMenuClicked = this.onMenuClicked;
  }

  componentDidUpdate() {
    //!!!do not set state again.
  }

  onRefContent(ref: any) {
    this.ComContent = ref;
  }

  onMenuClicked(sender: ISender) {
    let s = {
      id: sender.id,
      x: Math.ceil(sender.x),
      y: Math.ceil(sender.y) + 2,
      w: Math.ceil(sender.w),
      h: Math.ceil(sender.h)
    }

    let isShown = !this.state.isShownSubMenu;
    let jsxSubMenu = [];

    let subMenus:any = [];
    let children = this.context.mapMenus.get(s.id).children;

    for(let [key, value] of children){
      subMenus.push({id: key, label: value.label, desc: value.desc});
    }

    for (let item of subMenus) {
      jsxSubMenu.push(
        <div key={item.id}
             className={"SubMenu"}
             onClick={(e) => {
               this.onSubMenuClicked(e)
             }}>{item.label}</div>);
      }

    this.setState({
      jsxSubMenu: jsxSubMenu,
      sender: s,
      isShownSubMenu: isShown
    });
  }

  onSubMenuClicked(event: any) {
    this.ComContent.showComponent();
    this.setState({isShownSubMenu: !this.state.isShownSubMenu});
  }

  render() {
    return (
      <GCtx.Provider value={this.context}>
        <div className="App">
          <Header/>
          <Content onRef={(ref: any) => this.onRefContent(ref)}/>
          <Footer/>
          <div id="boxSubMenu"
               className={this.state.isShownSubMenu ? "BoxSubMenu Show" : "BoxSubMenu Hide"}
               style={{left: this.state.sender.x, top: this.state.sender.y}}
          >
            {this.state.jsxSubMenu.map((item) => {
              return item
            })}
          </div>
        </div>
      </GCtx.Provider>
    )
  }
}

export default App
