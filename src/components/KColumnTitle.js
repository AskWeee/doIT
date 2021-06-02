import React from 'react'

export default class KColumnTitle extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { content, className } = this.props;
        return (
            <div className={className}>{content}</div>
        );
    }
}
