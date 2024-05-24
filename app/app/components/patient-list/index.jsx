/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/6/2015
/********************************************************/
import React from 'react';
import moment from 'moment';

import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Label from 'react-bootstrap/lib/Label';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import LoadingTableDataUI from './../loading-table-data-ui';

import loadingGif from './../../assets/images/loading.gif';

const TABLE_COLUMN_HEADER_LABELS = [
  { text: 'First Name', value: 'firstName' },
  { text: 'Last Name', value: 'lastName' },
  { text: 'Gender', value: 'gender' },
  { text: 'Birthdate', value: 'birthdate' },
  { text: 'Phone Number', value: 'phoneNumber' },
  { text: 'Daily Target', value: 'target' },
  // { text: 'Est. Adherence', value: 'adherence' },
  { text: 'Last Measurement', value: 'lastMeasurement' },
  { text: 'Log', value: 'viewLog'}
];

export default class PatientList extends React.Component {

  constructor() {
    super();

    this._generateTable = this._generateTable.bind(this);
  }

  _generateTableHeader() {
    let { headerColumns = [], patients = [] } = this.props;

    if (!patients.length) {
      return;
    }

    return(
      headerColumns.map((header) => {
        return(
          <th key={header.value} style={{textAlign:'center'}}>
            {header.text}
          </th>
        );
      })
    );
  }

  _generateTableCellContent(key, patient) {
    switch (key) {
      // Format first, last name, and gender
      case 'firstName':
      case 'lastName':
      case 'gender':
        let value = String(patient[key]);
        return(
          value.charAt(0).toUpperCase() + value.slice(1)
        );
      // Format dates
      case 'birthdate':
        value = patient[key];
        return(
          value
        );
      // Format phone numbers
      case 'phoneNumber':
        value = String(patient[key]);
        return(
          <Button
            title="Click to call patient."
            id={`contact:${value}`}>
            <Glyphicon glyph={'phone'} />
            {' '}
            {`${value.slice(2,5)}-${value.slice(5,8)}-${value.slice(8,12)}`}
          </Button>
        );
      // Format target value
      case 'target':
        value = Number(patient[key]);
        return(
          `${value} measurement${value === 1 ? '' : 's'}`
        );
      // Format adherence
      /* case 'adherence':
        value = Number(patient[key]);
        const style = ((adherence) => {
          if (adherence < 0.25)
            return 'danger';
          if (adherence >= 0.25 && adherence < 0.50)
            return 'warning';
          if (adherence >= 0.50 && adherence < 0.75)
            return 'default';
          if (adherence >= 0.75)
            return 'success';
        })(value);
        return(
          <Label
            bsStyle={style}>
            {String(Number(value * 100).toFixed(0)) + '%'}
          </Label>
        ); */
      // Last measurement
      case 'lastMeasurement':
        value = patient[key] ? String(moment(patient[key]).fromNow())
          : 'None';
        return(
          value
        );
      // View log button
      case 'viewLog':
        return(
          <Button
            id={patient.id}
            href={`provider/patients/${patient.cacheKey}/blood-glucose`}>
            <Glyphicon glyph={'th-list'} />
          </Button>
        );
      default:
        return(
          null
        );
    }
  }

  _generateTableRows() {
    let { patients = [], headerColumns = [] } = this.props;
    let rows = [];

    patients.forEach((patient) => {
      rows.push(
        <tr key={patient.id}>
          {headerColumns.map((header) => {
            return(
              <td
                key={`${patient.id}-${header.value}`}
                style={{textAlign:'center', verticalAlign:'middle'}}>
                {this._generateTableCellContent(header.value, patient)}
              </td>
            );
          })}
        </tr>
      );
    });

    // Add empty row if no rows
    if (!rows.length) {
      rows.push(
        <tr key={Math.random()}>
          <td
            colSpan={headerColumns.length}
            style={{textAlign:'center', color: 'rgba(0, 0, 0, 0.4)'}}>
            <strong>
              You have no patients subscribed. Go ahead and invite one now!
            </strong>
          </td>
        </tr>
      );
    }

    return rows;
  }

  _generateTable(patients = []) {
    const panelHeader = (
      <h1 style={{textAlign:'center'}}>
        {`${patients.length} Patient${patients.length === 1
          ? '' : 's'}`}
      </h1>
    );

    return(
      <Panel header={panelHeader}>
        <Table condensed responsive hover fill>
          <thead>
            <tr>
              {this._generateTableHeader()}
            </tr>
          </thead>
          <tbody>
            {this._generateTableRows()}
          </tbody>
        </Table>
      </Panel>
    );
  }

  render() {
    const { patients, errored } = this.props;

    if (patients) {
      return this._generateTable(patients);
    } else if (errored) {
      return(
        <LoadingTableDataUI errored="true" />
      );
    } else {
      return(
        <LoadingTableDataUI />
      );
    }
  }

}

PatientList.defaultProps = {
  headerColumns: TABLE_COLUMN_HEADER_LABELS
};
