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

import providerManager from './../../models/provider-manager';

export default class ProviderContainer extends React.Component {

  constructor(props) {
    super(props);

    const store = {
      provider: providerManager.getProvider() || {
        firstName: 'N/A',
        lastName: 'N/A',
        credentials: []
      }
    };
    this.state = {
      store
    };
  }

  render() {
    const {
      store: { provider: { firstName, lastName, credentials } }
    } = this.state;

    return(
      <div>
        <NavigationBar
          firstName={firstName}
          lastName={lastName}
          credentials={credentials}
          isProvider />

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
