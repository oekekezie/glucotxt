/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/13/2016
/********************************************************/
import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Panel from 'react-bootstrap/lib/Panel';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';
import Button from 'react-bootstrap/lib/Button';

import sessionManager from './../models/session-manager';

export default class Logout extends React.Component {

  constructor() {
    super();

    this._setDocumentTitle();

    this.state = {
      error: false
    };
  }

  _setDocumentTitle() {
    document.title = 'GlucoTxt: Goodbye';
  }

  _logoutCurrentUser() {
    sessionManager.deinit()
    .then((result) => {
      const { history, location: { state } } = this.props;
      if (state && state.nextPathname) {
        // Propagate state if it exists
        history.replaceState(state, '/');
      } else {
        history.replaceState(null, '/');
      }
    })
    .catch((error) => {
      console.error(error);

      this.setState({
        error: true
      });
    })
    .done()
  }

  componentDidMount() {
    this._logoutCurrentUser();
  }

  render() {
    const { error } = this.state;

    return(
      <Grid>
        <Row style={{verticalAlign:'middle'}}>
          <Col lg={2} />
          <Col lg={8}>
            <br />
            <Jumbotron>
              <h1>
                GlucoTxt
                <br />
                <small>
                  {`${error ? 'Oops!' : 'Logging you out...'}`}
                </small>
              </h1>
              <br />
              <p>
                {`${error ? 'Something went wrong. Please try again.'
                  : 'You will be redirected shortly...'}`}
              </p>
            </Jumbotron>
          </Col>
          <Col lg={2} />
        </Row>
      </Grid>
    );
  }

}
