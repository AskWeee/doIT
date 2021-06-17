import React from 'react';
import './Footer.scss'
import GCtx from "../GCtx";

class Footer extends React.Component {
    static contextType = GCtx;

    constructor(props) {
        super(props);

        this.state = {
            message: ""
        }

        this.showMessage = this.showMessage.bind(this);
    }

    componentDidMount() {
        this.context.showMessage = this.showMessage;
    }

    showMessage(message) {
        this.setState({
            message: message
        })
    }

    render() {
        return (
            <div className="Footer">
                <div className={"BoxMessage"}>
                    <div className={"Message"}>系统提示：{this.state.message}</div>
                </div>
                <div></div>
                <div className={"BoxClock"}>
                    <div className={"Clock"}>2021-06-01 12:12:12</div>
                </div>
            </div>
        )
    }
}

export default Footer
