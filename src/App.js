import 'antd/dist/antd.css'
import './App.scss'
import React from 'react'
import GCtx from "./GCtx";
import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";

class App extends React.Component {
    static contextType = GCtx;

    isSubMenuEntered = false;

    constructor(props) {
        super(props);
        this.state = {
            changeData: () => {
                this.setState({});
            },
            sender: {id: '', x: 0, y: 0, w: 0, h: 0},
            isShownSubMenu: false,
            subMenus: [],
            event: {target: undefined, x: 0, y: 0, w: 0, h: 0},
            changeSubMenus: (event, items) => {
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
            jsxSubMenu: []
        }

        this.onRefContent = this.onRefContent.bind(this);
        this.onMenuClicked = this.onMenuClicked.bind(this);
        this.onSubMenuClicked = this.onSubMenuClicked.bind(this);
        this.onSubMenuMouseEnter = this.onSubMenuMouseEnter.bind(this);
        this.onSubMenuMouseOut = this.onSubMenuMouseOut.bind(this);
        this.onBoxSubMenuMouseOut = this.onBoxSubMenuMouseOut.bind(this);
        this.onTest = this.onTest.bind(this);
        this.log = this.log.bind(this);
    }

    componentDidMount() {
        this.setState({
            subMenus: this.context.subMenus
        });
        this.context.onMenuClicked = this.onMenuClicked;
        this.context.onTest = this.onTest;

    }

    onTest() {
        setTimeout(() => {
            this.setState({
                isShownSubMenu: this.context.isSubMenuEntered ? true : false
            })
        }, 100);
    }

    log(info) {
        this.context.logs.push(info);
    }

    componentDidUpdate() {
        //!!!do not set state again.
        this.context.log = this.log;
    }


    onRefContent(ref) {
        this.ComContent = ref;
    }

    onMenuClicked(sender) {
        let s = {
            id: sender.id,
            x: Math.ceil(sender.x),
            y: Math.ceil(sender.y) + 2,
            w: Math.ceil(sender.w),
            h: Math.ceil(sender.h)
        }

        let isShown = !this.state.isShownSubMenu;
        let jsxSubMenu = [];

        let subMenus = [];
        let children = this.context.mapMenus.get(s.id).children;

        for (let [key, value] of children) {
            subMenus.push({id: key, label: value.label, desc: value.desc});
        }

        for (let item of subMenus) {
            let nDivider = 0;
            if (item.id === "menu_divider") {
                nDivider++;
                jsxSubMenu.push(<div className={"clsMenuDivider"}
                                     key={"menu_divider+" + nDivider}
                                     onMouseEnter={this.onSubMenuMouseEnter}
                                     onMouseOut={this.onSubMenuMouseOut}>&nbsp;</div>)
            } else {
                jsxSubMenu.push(
                    <div key={item.id}
                         className={"SubMenu"}
                         onClick={(e) => {
                             this.onSubMenuClicked(e, item.id)
                         }}
                         onMouseEnter={this.onSubMenuMouseEnter}
                         onMouseOut={this.onSubMenuMouseOut}>{item.label}</div>);
            }
        }

        this.setState({
            jsxSubMenu: jsxSubMenu,
            sender: s,
            isShownSubMenu: isShown
        });
    }

    // ****************************************************************************************************
    // 点击子菜单项，调用相应功能模块
    // ****************************************************************************************************
    onSubMenuClicked(e, s) {
        switch (s) {
            case 'menu_lowcode_single_table':
                this.ComContent.showComponentLowcodeSingleTable();
                break
            case 'menu_database_import':
                this.ComContent.showComponentDatabaseImport();
                break
            case 'menu_database_maintain':
                this.ComContent.showComponentDatabaseMaintain();
                break
            case 'menu_database_compare':
                this.ComContent.showComponentDatabaseCompare();
                break
            case 'menu_database_export':
                this.ComContent.showComponentDatabaseExport();
                break
            case 'menu_database_config':
                this.ComContent.showComponentDatabaseConfig();
                break
            case 'menu_service_performance':
                this.ComContent.showComponentServicePerformance();
                break
            case 'menu_service_project':
                this.ComContent.showComponentServiceProject();
                break
            default:
                break
        }

        this.setState({isShownSubMenu: !this.state.isShownSubMenu});
    }

    onSubMenuMouseEnter(event) {
        this.context.isSubMenuEntered = true
    }

    onSubMenuMouseOut(event) {
        this.context.isSubMenuEntered = false
    }

    onBoxSubMenuMouseOut(event) {

        setTimeout(() => {
            this.setState({
                isShownSubMenu: this.context.isSubMenuEntered ? true : false
            })
        }, 100);
    }

    render() {
        return (
            <GCtx.Provider value={this.context}>
                <div className="App">
                    <Header/>
                    <Content onRef={(ref) => this.onRefContent(ref)}/>
                    <Footer/>
                    <div id="boxSubMenu"
                         className={this.state.isShownSubMenu ? "BoxSubMenu Show" : "BoxSubMenu Hide"}
                         style={{left: this.state.sender.x, top: this.state.sender.y}}
                         onMouseOut={this.onBoxSubMenuMouseOut}>
                        {this.state.jsxSubMenu.map((item) => {
                            return item
                        })}
                    </div>
                </div>
            </GCtx.Provider>
        );
    }
}

export default App;
