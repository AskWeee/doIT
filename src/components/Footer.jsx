import React from 'react';
import './Footer.scss'

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="Footer">
        <div className={"BoxMessage"}>
          <div className={"Message"}>系统提示：</div>
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