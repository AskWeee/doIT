import React from 'react';
import './Header.scss'
import GCtx from "../GCtx";

class Header extends React.Component {
    static contextType = GCtx;

    refHeader = React.createRef();

    constructor(props) {
        super(props);

        this.state = {
            jsxMenus: []
        }

        this.onClickMenu = this.onClickMenu.bind(this);
        this.onMenuMouseEnter = this.onMenuMouseEnter.bind(this);
        this.onMenuMouseOut = this.onMenuMouseOut.bind(this);
    }

    componentDidMount() {
        let jsxMenus = [];

        for (let menu of this.context.menus) {
            let refMenu = React.createRef();
            this.context.mapMenus.set(menu.id, {label: menu.label, desc: menu.desc, ref: refMenu, children: new Map()});
            jsxMenus.push(
                <div key={menu.id}
                     id={menu.id}
                     ref={refMenu}
                     className="Menu"
                     onClick={(event) => {
                         this.onClickMenu(event)
                     }}
                     onMouseEnter={this.onMenuMouseEnter}
                     onMouseOut={this.onMenuMouseOut}>{menu.label}</div>
            );
            for (let child of menu.children) {
                this.context.mapMenus.get(menu.id).children.set(child.id, {label: child.label, desc: child.desc});
            }
        }

        this.setState({jsxMenus: jsxMenus});
    }

    onMenuMouseEnter(event) {
        this.context.isSubMenuEntered = true
    }

    onMenuMouseOut(event) {
        this.context.isSubMenuEntered = false;
        this.context.onTest();
    }

    onClickMenu(event) {
        let id = event.currentTarget.id;
        let node;
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
                    <div className="Username">{this.context.user.name}</div>
                </div>
            </div>
        )
    }
}

export default Header
