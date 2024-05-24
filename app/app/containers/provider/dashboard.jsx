/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/6/2015
/********************************************************/
import React from 'react';

import PatientList from './../../components/patient-list';

import sessionManager from './../../models/session-manager';
import patientListManager from './../../models/patient-list-manager';

export default class Dashboard extends React.Component {

  constructor() {
    super();

    this.auth = sessionManager.getAuth();

    this.state = {
      store: {
        patients: null
      },
      error: false
    };
  }

  _getPatientList() {
    patientListManager.getPatientsByGroup(this.auth.token)
    .then((results) => {
      this.setState({
        store: {
          patients: results
        }
      });
    })
    .catch((error) => {
      console.error(error);
      this.setState({
        error: true
      });
    })
    .done();
  }

  _setDocumentTitle() {
    document.title = 'GlucoTxt: Provider Patient List';
  }

  componentWillMount() {
    this._setDocumentTitle();
    this._getPatientList();
  }

  render() {
    const {
      store: { patients },
      error
    } = this.state;

    return(
      patients ? <PatientList patients={patients} error={error} />
        : <PatientList error={error} />
    );
  }

}
