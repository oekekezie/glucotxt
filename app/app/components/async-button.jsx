/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/26/2016
/********************************************************/
import Q from 'q';
import React from 'react';

import Button from 'react-bootstrap/lib/Button';

export default class AsyncButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isBusy: false
    };
  }

  _onClick(e) {
    if (typeof this.task !== 'function') {
      return;
    }
    
    const { isBusy } = this.state;

    this.setState({
      isBusy: true
    });

    Q(this.task())
    .done(() => {
      if (this) {
        if (!this.didUnmount) {
          this.setState({
            isBusy: false
          });
        }
      }
    });
  }

  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    const { isBusy } = this.state;
    const { style, onClick: task } = this.props;
    this.task = task;

    return(
      <Button
        {...this.props}
        ref={(node) => this.button = node}
        onClick={(e) => this._onClick(e)}
        disabled={isBusy}
        style={!isBusy ? style
          : Object.assign({}, style, { cursor: ' progress' })}>
        {this.props.children}
      </Button>
    );
  }

}
