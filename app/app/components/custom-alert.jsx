/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/26/2016
/********************************************************/
import React from 'react';

import Alert from 'react-bootstrap/lib/Alert';

export default class CustomAlert extends React.Component {

  constructor(props) {
    super(props);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this._display = this._display.bind(this);

    this.state = {
      isVisible: false
    };
  }

  show(title, message, style) {
    this.setState({
      title,
      message,
      style,
      isVisible: true
    });
  }

  hide() {
    this.setState({
      isVisible: false
    });
  }

  _display() {
    const { title, message, style } = this.state;

    return(
      <Alert {...this.props} bsStyle={style} onDismiss={this.hide}>
        <h4>
          {`${title}`}
        </h4>
        <p>
          {`${message}`}
        </p>
      </Alert>
    );
  }

  render() {
    const { isVisible } = this.state;

    return(
      isVisible && this._display()
    );
  }

}
