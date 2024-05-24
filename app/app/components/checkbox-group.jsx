/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/9/2015
/********************************************************/
import React from 'react';

import Input from 'react-bootstrap/lib/Input';

export default class CheckboxGroup extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: [],
      hasChanged: false
    };
  }

  _onClick(e) {
    const { value: checkboxValue, checked } = e.target;
    const { value } = this.state;
    const set = new Set(value);

    if (checked) {
      set.add(checkboxValue);
    } else {
      set.delete(checkboxValue);
    }

    this.setState({
      value: [...set],
      valid: set.size > 0 ? true : false,
      hasChanged: true
    });

    const { name, passValueToParent } = this.props;
    if(typeof passValueToParent === 'function') {
      passValueToParent(name, [...set], set.size > 0 ? true : false);
    }
  }

  _validationStateStyle() {
    const { value, valid } = this.state;

    if (valid) {
      return 'success';
    } else {
      return 'error';
    }
  }

  render() {
    const { checkboxes = [] } = this.props;
    const { hasChanged } = this.state;

    return(
      <Input
        {...this.props}
        bsStyle={hasChanged ? (() => this._validationStateStyle())() : null}>
        {checkboxes.map((checkbox, index) => {
          return(
            <Input
              type="checkbox"
              value={checkbox.replace(' ', '').toLowerCase()}
              key={`${checkbox}:${index}`}
              onClick={(e) => this._onClick(e)}
              label={checkbox} />
          );
        })}
      </Input>
    );
  }

}
