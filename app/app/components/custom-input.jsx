/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/9/2015
/********************************************************/
import React from 'react';

import Input from 'react-bootstrap/lib/Input';

import { isValid } from './../helpers/validate';

export default class CustomInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      displayValue: '',
      value: '',
      hasChanged: false
    };
  }

  forceValidation() {
    const {
      type,
      validationType,
      required,
      name,
      passValueToParent
    } = this.props;
    const currentValue = this.input.getValue().split('-').join('');
    let nextState;

    if (type.match(/(text|email)/)) {
      const { displayValue: previousDisplayValue = '' } = this.state;
      const displayValue = this._formatValue(
        previousDisplayValue,
        this.input.getValue(),
        validationType
      );
      nextState = {
        displayValue
      };
    }

    const valid = isValid(
      currentValue,
      validationType,
      required
    );
    nextState = Object.assign({}, nextState, {
      value: currentValue,
      valid: valid,
      hasChanged: true
    });
    this.setState(nextState);

    if(typeof passValueToParent === 'function') {
      passValueToParent(name, currentValue, valid);
    }
  }

  _formatValue(previous, current, validationType) {
    const { value } = this.state;
    console.log(
      `Previous = ${previous}, Current = ${current}, Value = ${value}`
    );

    switch (validationType) {
      case 'date':
        if ((current.length === 2 || current.length === 5)
        && current.length > previous.length) {
          return `${current}/`;
        } else if ((current.length === 3 || current.length === 6)
          && current.length > previous.length) {
          return `${current.slice(0, current.length - 1)}/${current.slice(-1)}`;
        } else if ((current.length === 3 || current.length === 6)
        && current.length < previous.length) {
          return current.slice(0, current.length - 1);
        } else {
          return current;
        }
      case 'phoneNumber':
        if ((current.length === 3 || current.length === 7)
          && current.length > previous.length) {
          return `${current}-`;
        } else if ((current.length === 4 || current.length === 8)
          && current.length > previous.length) {
          return `${current.slice(0, current.length - 1)}-${current.slice(-1)}`;
        } else if ((current.length === 4 || current.length === 8)
          && current.length < previous.length) {
          return current.slice(0, current.length - 1);
        } else {
          return current;
        }
      default:
        return current;
    }
  }

  _onChange() {
    this.forceValidation();
  }

  _onKeyPress(e) {
    const { validationType } = this.props;
    let regex, maxLength, currentLength;

    switch (validationType) {
      case 'phoneNumber':
        regex = /[0-9]/;
        maxLength = 12;
        currentLength = String(e.target.value).length;
        break;
      case 'date':
        regex = /[0-9]/;
        maxLength = 10;
        currentLength = String(e.target.value).length;
        break;
      default:
        // return;
    }

    // Prevent key press if necessary
    if ((regex && !regex.test(e.key)) || currentLength >= maxLength) {
      e.preventDefault();
    }

    // Propagate action
    if (typeof this.propagateOnKeyPress === 'function') {
      this.propagateOnKeyPress(e);
    }
  }

  _validationStateStyle() {
    const { value, valid, hasChanged } = this.state;

    if (hasChanged === false)
      return null;

    if (valid) {
      return 'success';
    } else {
      return 'error';
    }
  }

  render() {
    const { type, onKeyPress } = this.props;
    this.propagateOnKeyPress = onKeyPress;

    if (type.match(/^(text|email)$/)) {
      const { displayValue } = this.state;

      return(
        <Input
          {...this.props}
          bsStyle={(() => this._validationStateStyle())()}
          value={displayValue}
          ref={(node) => this.input = node}
          onChange={(e) => this._onChange(e)}
          onKeyPress={(e) => this._onKeyPress(e)} />
      );
    } else {
      return(
        <Input
          {...this.props}
          bsStyle={(() => this._validationStateStyle())()}
          ref={(node) => this.input = node}
          onChange={(e) => this._onChange(e)}
          onKeyPress={(e) => this._onKeyPress(e)} />
      );
    }
  }

}
