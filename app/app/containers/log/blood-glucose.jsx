/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/10/2015
/********************************************************/
import React from 'react';
import moment from 'moment';

import BloodGlucoseLog from './../../components/blood-glucose-log';
import LoadingTableDataUI from './../../components/loading-table-data-ui';

import sessionManager from './../../models/session-manager';
import measurementsManager from './../../models/measurements-manager';
import patientManager from './../../models/patient-manager';
import patientListManager from './../../models/patient-list-manager';

const TIME_INTERVAL_TYPE = 'weeks';
const TIME_INTERVAL_DURATION = '2';

const NO_FILTER = {
  gte: Number.MIN_SAFE_INTEGER,
  lte: Number.MAX_SAFE_INTEGER
};

export default class BloodGlucose extends React.Component {

  constructor(props) {
    super(props);

    let patient = null, isPatientView = false;
    this.auth = sessionManager.getAuth();
    if (this.auth && this.auth.userType === 'provider') {
      const { params: { patientID } } = this.props;
      patient = patientListManager.getPatientInfo(patientID) || null;
    } else if (this.auth && this.auth.userType === 'patient') {
      patient = patientManager.getPatient() || null;
      isPatientView = true;
    }

    if (patient === null) {
      const { history } = this.props;
      history.replaceState(null, '/');
    }

    this.state = {
      patient,
      isPatientView,
      store: {
        records: null
      },
      startDate: moment()
        .endOf(TIME_INTERVAL_TYPE)
        .subtract(TIME_INTERVAL_DURATION, TIME_INTERVAL_TYPE),
      endDate: moment()
        .endOf(TIME_INTERVAL_TYPE),
      filter: NO_FILTER,
      status: 'waiting'
    }
  }

  componentWillMount() {
    const { startDate, endDate } = this.state;

    this._setDocumentTitle();
    this._fetchRecords(startDate, endDate);
  }

  _setDocumentTitle() {
    document.title = 'GlucoTxt: Patient Blood Glucose Log';
  }

  // Records
  _fetchRecords(startDate, endDate) {
    const { patient: { id: patientID, phoneNumber } } = this.state;

    this.setState({
      startDate,
      endDate,
      status: 'waiting'
    });

    measurementsManager.getBloodGlucoseMeasurements({
      token: this.auth.token,
      phoneNumber: this.auth.userType === 'patient' ? phoneNumber : null,
      patientID,
      startDate,
      endDate
    })
    .then((results) => {
      this.setState({
        store: {
          records: results
        },
        filter: NO_FILTER,
        status: 'ready'
      });
    })
    .catch((error) => {
      console.error(error);
      this.setState({
        store: {
          records: null
        },
        filter: NO_FILTER,
        status: 'error'
      });
    })
    .done();
  }

  _fetchPrevious() {
    const { startDate, endDate } = this.state;
    const clonedStartDate = startDate.clone();
    const clonedEndDate = endDate.clone();

    clonedStartDate
      .subtract(TIME_INTERVAL_DURATION, TIME_INTERVAL_TYPE);
    clonedEndDate
      .subtract(TIME_INTERVAL_DURATION, TIME_INTERVAL_TYPE);

    this._fetchRecords(clonedStartDate, clonedEndDate);
  }

  _fetchNext() {
    const { startDate, endDate } = this.state;
    const clonedStartDate = startDate.clone();
    const clonedEndDate = endDate.clone();

    clonedStartDate
      .add(TIME_INTERVAL_DURATION, TIME_INTERVAL_TYPE);
    clonedEndDate
      .add(TIME_INTERVAL_DURATION, TIME_INTERVAL_TYPE);

    this._fetchRecords(clonedStartDate, clonedEndDate);
  }

  // Filter
  _updateFilter(filter) {
    const { store: { records } } = this.state;

    filter = filter || NO_FILTER;

    this.setState({
      filter
    });
  }

  _applyFilter(record) {
    const { filter: { gte, lte } } = this.state;

    // Include
    if (record && record.value >= gte && record.value <= lte) {
      this.numberOfRecordsIncluded++;
      return true;
    }

    // Exclude
    return false;
  }

  // Structure and apply filter
  _prepareTableData(records) {
    const rows = new Map();
    const { startDate, endDate } = this.state;

    const daysBetween = endDate.diff(startDate, 'days');
    const clonedStartDate = startDate.clone();
    for (let i = 0; i < daysBetween; i++) {
      const dayIndex = clonedStartDate.add(1, 'days')
        .format('ddd MMM DD YYYY');
      rows.set(dayIndex, null);
    }

    this.numberOfRecordsIncluded = 0;
    records.forEach((record) => {
      if (!this._applyFilter(record)) return;

      const timestamp = new Date(record.timestamp);
      const dayIndex = timestamp.toDateString();
      const hourIndex = timestamp.getHours();

      const rowColumns = rows.get(dayIndex) || new Map();

      if (!rowColumns.has(hourIndex)) {
        // Add column
        rowColumns.set(hourIndex, [record]);
      } else {
        // Update column
        let columnRecords = rowColumns.get(hourIndex);
        columnRecords = [...columnRecords, record];
        rowColumns.set(hourIndex, columnRecords);
      }

      rows.set(dayIndex, rowColumns);
    });

    return rows;
  };

  render() {
    const {
      status,
      patient,
      isPatientView,
      store: {
        records
      }
    } = this.state;

    // Patient must exist
    if (!patient) {
      return null;
    }

    switch (status) {
      case 'ready':
        return(
          <BloodGlucoseLog
            records={this._prepareTableData(records)}
            numberOfRecords={this.numberOfRecordsIncluded}
            maxNumberOfRecords={records.length}
            patient={patient}
            isPatientView={isPatientView}
            fetchPrevious={() => this._fetchPrevious()}
            fetchNext={() => this._fetchNext()}
            updateFilter={(filter) => this._updateFilter(filter)} />
        );
      case 'error':
        return(
          <LoadingTableDataUI error="true" />
        );
      case 'waiting':
      default:
        return(
          <LoadingTableDataUI />
        );
    }
  }

}
