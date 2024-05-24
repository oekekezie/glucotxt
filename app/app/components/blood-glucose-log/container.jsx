/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/3/2015
********************************************************/
import React from 'react';
import moment from 'moment';

import Panel from 'react-bootstrap/lib/Panel';
import Well from 'react-bootstrap/lib/Well';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import ContainerHeader from './container-header';

export default class Container extends React.Component {

  constructor(props) {
    super(props);
  }

  _generateHeader() {
    const {
      dates,
      patient: {
        firstName = '',
        lastName = ''
      },
      fetchPrevious,
      fetchNext
    } = this.props;
    const startDate = new Date(dates.shift()) || new Date();
    const endDate = new Date(dates.pop()) || new Date();

    return(
      <h1 style={{textAlign:'center'}}>
        <Button
          bsStyle="link"
          onClick={fetchPrevious}
          style={{verticalAlign:'inherit'}}>
          <Glyphicon glyph="chevron-left" />
        </Button>
        {' '}
        <strong>
          | {`${firstName[0].toUpperCase()}. ${lastName}`} |
          {' '}
          {`${moment(startDate).format("MMMM Do, YYYY")}
            to ${moment(endDate).format("MMMM Do, YYYY")} |`}
        </strong>
        {' '}
        <Button
          bsStyle="link"
          onClick={fetchNext}
          style={{verticalAlign:'inherit'}}>
          <Glyphicon glyph="chevron-right" />
        </Button>
      </h1>
    );
  }

  _generateNavBarViewSummary() {
    let summarize = (current, max) => {
      const unit = max > 1 ? 'measurements' : 'measurement';
      return `Displaying ${current} out of ${max} ${unit}`;
    }

    const { numberOfRecords, maxNumberOfRecords } = this.props;
    return(
      <Well
        bsSize="small"
        style={{ textAlign: "center", color: 'rgba(0, 0, 0, 0.7)' }}>
        <strong>
          {summarize(numberOfRecords, maxNumberOfRecords)}
        </strong>
      </Well>
    );
  }

  render() {
    const {
      onApplyFilter,
      numberOfRecords,
      maxNumberOfRecords,
      isPatientView
    } = this.props;

    return(
      <Panel header={this._generateHeader()}>
        <ContainerHeader
          isPatientView={isPatientView}
          onApplyFilter={onApplyFilter} />
        {this._generateNavBarViewSummary()}
        {this.props.children}
      </Panel>
    );
  }

}
