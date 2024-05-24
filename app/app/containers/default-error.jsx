/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/10/2015
/********************************************************/
import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Panel from 'react-bootstrap/lib/Panel';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';
import Button from 'react-bootstrap/lib/Button';

export default class DefaultError extends React.Component {

  constructor() {
    super();
  }

  _handleGoBackButtonClick() {
    const { history } = this.props;
    history.go(-1);
  }

  render() {
    return(
      <Grid>
        <Row style={{verticalAlign:'middle'}}>
          <Col lg={2} />
          <Col lg={8}>
            <br />
            <Jumbotron>
              <h1>
                Oops!
                <br />
                <small>
                  Something went wrong.
                </small>
              </h1>
              <br />
              <p>
                Please go back and try again.
              </p>
              <Button
                bsStyle="primary"
                onClick={this._handleGoBackButtonClick} block>
                Go Back
              </Button>
            </Jumbotron>
          </Col>
          <Col lg={2} />
        </Row>
      </Grid>
    );
  }

}
