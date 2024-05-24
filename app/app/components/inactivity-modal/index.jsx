/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 3/13/2016
/********************************************************/
import Q from 'q';
import React from 'react';

import Modal from 'react-bootstrap/lib/Modal';

export default class InactivityModal extends React.Component {

  render() {
    const { shouldShow } = this.props;

    return(
      <Modal show={shouldShow} bsSize="large">
        <Modal.Body>
          <h1>
            Looks like you have stepped away...
            <br />
            <small>
              You will be automatically logged out in one minute
            </small>
            <br />
            <small>
              Move your mouse if you would like to stay logged in
            </small>
          </h1>
        </Modal.Body>
      </Modal>
    );
  }

}
