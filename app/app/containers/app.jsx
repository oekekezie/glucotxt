/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
/********************************************************/
import React from 'react';

import IdleTimer from 'react-idle-timer';

import InactivityModal from './../components/inactivity-modal';

import sessionManager from './../models/session-manager';

const INACTIVITY_TIMEOUT_INTERVAL = 10000 // 9 * 60 * 1000; // in milliseconds
const WAIT_TO_LOGOUT_INTERVAL = 10000 // 1 * 60 * 1000; // in milliseconds

export default class App extends React.Component {

  constructor() {
    super();

    this.state = {
      isShowingInactivityModal: false
    };
  }

  _logoutInactiveUser() {
    const auth = sessionManager.getAuth();

    if (auth) {
      this.setState({
        isShowingInactivityModal: false
      });
      
      const { history } = this.props;
      history.replaceState(null, '/logout');
    }
  };

  _becameInactive() {
    const auth = sessionManager.getAuth();

    if (auth) {
      this.setState({
        isShowingInactivityModal: true
      });

      this.logoutInactiveUserTimer = setTimeout(
        () => this._logoutInactiveUser(),
        WAIT_TO_LOGOUT_INTERVAL
      );
    }
  }

  _becameActive() {
    const auth = sessionManager.getAuth();

    if (auth) {
      this.setState({
        isShowingInactivityModal: false
      });

      clearTimeout(this.logoutInactiveUserTimer);
    }
  }

  render() {
    const { isShowingInactivityModal } = this.state;

    return(
      <IdleTimer
        element={document}
        activeAction={() => this._becameActive()}
        idleAction={() => this._becameInactive()}
        timeout={INACTIVITY_TIMEOUT_INTERVAL}
        ref={(node) => this.idleTimer = node}>
        {this.props.children}
        <InactivityModal shouldShow={isShowingInactivityModal} />
      </IdleTimer>
    );
  }

}
