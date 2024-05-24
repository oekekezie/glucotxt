/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/3/2015
********************************************************/
import React from 'react';

import Navbar from 'react-bootstrap/lib/Navbar';
import Label from 'react-bootstrap/lib/Label';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Input from 'react-bootstrap/lib/Input';

export default class ContainerHeader extends React.Component {

  constructor(props) {
    super(props);
  }

  _handleFilterButtonClicked(e) {
    const gte = this.inputGTE.getValue()
      || Number.MIN_SAFE_INTEGER;
    const lte = this.inputLTE.getValue()
      || Number.MAX_SAFE_INTEGER;

    const filter = {
      gte,
      lte
    };
    this.props.onApplyFilter(filter);
  }

  _generateNavBarHeader() {
    const { isPatientView } = this.props;
    return(
      <Navbar.Header>
        <Navbar.Brand>
          <Label bsStyle={'primary'}>
            {isPatientView ? 'Before Eating' : 'Preprandial'}
          </Label>
          {' '}
          <Label bsStyle={'warning'}>
            {isPatientView ? 'After Eating' : 'Postprandial'}            
          </Label>
        </Navbar.Brand>
      </Navbar.Header>
    );
  }

  _generateNavBarFilterInputs() {
    return(
      <Navbar.Form pullRight>
        <Input
          type={'number'}
          min="0"
          step="5"
          ref={(node) => this.inputGTE = node}
          placeholder={'Greater than...'}/>
        {' '}
        <Input
          type={'number'}
          min="0"
          step="5"
          ref={(node) => this.inputLTE = node}
          placeholder={'Less than...'}/>
        {' '}
        <Button onClick={(e) => this._handleFilterButtonClicked(e)}>
          <Glyphicon glyph={'filter'} />
          {' '}
          {'Filter Measurements'}
        </Button>
      </Navbar.Form>
    );
  }

  render() {
    return(
      <Navbar fluid>
        {this._generateNavBarHeader()}
        {this._generateNavBarFilterInputs()}
      </Navbar>
    );
  }

}
