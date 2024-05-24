/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/7/2015
/********************************************************/
import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import NavigationBar from './../../components/navigation-bar';

import patientManager from './../../models/patient-manager';

export default class PatientContainer extends React.Component {

  constructor(props) {
    super(props);

    const patient = patientManager.getPatient() || null;
    this.state = {
      store: {
        patient
      }
    };
  }

  render() {
    const { store: { patient: { firstName, lastName } } } = this.state;

    return(
      <div>
        <NavigationBar
          firstName={firstName}
          lastName={lastName} />

        <Grid fluid style={{ 'paddingTop ': '70px' }}>
          <Row>
            <Col lg={12}>
              {this.props.children}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}
