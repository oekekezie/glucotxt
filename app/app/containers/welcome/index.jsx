/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/8/2015
/********************************************************/
import React from 'react';

import sessionManager from './../../models/session-manager';

import { Link } from 'react-router';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Panel from 'react-bootstrap/lib/Panel';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import Input from 'react-bootstrap/lib/Input';

import AsyncButton from './../../components/async-button';
import CustomAlert from './../../components/custom-alert';
import CustomInput from './../../components/custom-input';

export default class Welcome extends React.Component {

  constructor(props) {
    super(props);

    this._generateLoginForm = this._generateLoginForm.bind(this);
  }

  componentWillMount() {
    this._setDocumentTitle();

    // Redirect if logged in
    const { history } = this.props;
    const auth = sessionManager.getAuth();
    if (auth && auth.userType === 'provider') {
      history.replaceState(null, '/provider');
    } else if (auth && auth.userType === 'patient') {
      history.replaceState(null, '/patient');
    }

    this.state = {
      userType: 'patient'
    };
  }

  _setDocumentTitle() {
    document.title = 'GlucoTxt: Welcome';
  }

  _submitLoginRequest(isProvider) {
    // Task for Async Button
    if (this.inputID.state.valid && this.inputPassword.state.valid) {
      return(
        sessionManager.init({
          userType: this.state.userType,
          userID: isProvider ? this.inputID.state.value
              : `+1${this.inputID.state.value}`,
          password: this.inputPassword.state.value
        })
        .then(() => {
          const { history, location: { state } } = this.props;

          if (state && state.nextPathname) {
            history.replaceState(null, state.nextPathname);
          } else {
            history.replaceState(null, isProvider ? '/provider' : '/patient');
          }
        })
        .catch((error) => {
          console.error(error);

          this.alert.show(
            'Oops!',
            `Wrong ${isProvider ? 'email' : 'phone number'} and/or password.`,
            'danger'
          );
        })
      );
    } else {
      this.alert.show(
        'Oops!',
        `${isProvider ? 'Email' : 'Phone number'} and password are required.`,
        'danger'
      );
    }
  }

  _handleSelect(selectedKey) {
    this.setState({
      userType: selectedKey
    });
  }

  _handleKeyPress(e, isProvider) {
    // Enter key
    if (e.key === 'Enter') {
      // FIXME: Bad practice? How to fix?
      this.loginButton._onClick();
    }
  }

  _loginButtonClick(e, isProvider) {
    // Async button should return promise
    return this._submitLoginRequest(isProvider);
  }

  _generateLoginForm(userType) {
    const isProvider = userType === 'provider' ? true : false;

    const labelID =
      `Your ${isProvider ? 'work email address' : 'personal phone number'}`;
    const helpID = isProvider ?
      'Example: jen.karsin@organization.edu.' :
      'Example: 123-123-1234.';
    const labelPassword =
      `Your ${isProvider ? 'password' : 'temporary access code'}`;
    const helpPassword = isProvider ?
      'See below if you have forgotten it.' :
      'All lowercase and should be 8 characters long.';
    const linkForgot = isProvider ? (
      <p>
        <a href="mailto:support@glucotxt.com">
          Forgot password?
        </a>
      </p>
    ) : null;

    return(
      <div>
        <br />
        <CustomInput
          type={isProvider ? 'email' : 'text'}
          validationType={isProvider ? 'email' : 'phoneNumber'}
          ref={(node) => this.inputID = node}
          onKeyPress={(e) => this._handleKeyPress(e, isProvider)}
          label={labelID} placeholder={labelID}
          help={helpID} />
        <CustomInput
          type={isProvider ? 'password' : 'text'}
          ref={(node) => this.inputPassword = node}
          onKeyPress={(e) => this._handleKeyPress(e, isProvider)}
          label={labelPassword}
          placeholder={labelPassword}
          help={helpPassword}
          required />
        <CustomAlert
          ref={(node) => this.alert = node} />
        {linkForgot}
        <div style={{textAlign:'right'}}>
          <AsyncButton
            bsStyle="primary"
            ref={(node) => this.loginButton = node}
            onClick={(e) => this._loginButtonClick(e, isProvider)}
            block>
            {isProvider ? `See My Patients` : 'Access My Log'}
          </AsyncButton>
        </div>
      </div>
    );
  }

  render() {
    const { userType } = this.state;

    return(
      <Grid>
        <Row style={{verticalAlign:'middle'}}>
          <Col lg={4} />
          <Col lg={4}>
            <br />
            <h1>
              GlucoTxt
            </h1>
            <Panel>
              <Tabs
                activeKey={userType}
                bsStyle="pills"
                ref={(node) => this.userTypeTabs = node}
                onSelect={(selectedKey) => this._handleSelect(selectedKey)}>
                <Tab eventKey={'patient'} title="I am a Patient">
                  {userType === 'patient' ? this._generateLoginForm(userType)
                    : null}
                </Tab>
                <Tab eventKey={'provider'} title="I am a Provider">
                  {userType === 'provider' ? this._generateLoginForm(userType)
                    : null}
                </Tab>
              </Tabs>
            </Panel>
          </Col>
          <Col lg={4} />
        </Row>
      </Grid>
    );
  }

}
