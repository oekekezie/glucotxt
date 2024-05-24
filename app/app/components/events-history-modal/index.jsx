/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/29/2016
/********************************************************/
import Q from 'q';
import React from 'react';
import moment from 'moment-timezone';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import loadingGif from './../../assets/images/loading.gif';

import sessionManager from './../../models/session-manager';
import historyManager from './../../models/history-manager';
import patientManager from './../../models/patient-manager';
import providerManager from './../../models/provider-manager';

import {
  EVENTS_HISTORY_TYPES
} from './../../helpers/types';

export default class EventsHistoryModal extends React.Component {

  constructor() {
    super();

    let user = null;
    this.auth = sessionManager.getAuth();
    if (this.auth && this.auth.userType === 'provider') {
      user = providerManager.getProvider() || null;
    } else if (this.auth && this.auth.userType === 'patient') {
      user = patientManager.getPatient() || null;
    }

    if (user === null) {
      const { onClose } = this.props;
      onClose();
    }

    this.state = {
      user,
      store: {
        records: null
      },
      status: 'waiting'
    }
  }

  _onEnter() {
    this._fetchRecords();
  }

  // Records
  _fetchRecords() {
    const { user: { phoneNumber } } = this.state;
    const startDate = moment().startOf('week');

    this.setState({
      status: 'waiting'
    });

    historyManager.getEventsHistory({
      startDate,
      token: this.auth.token,
      phoneNumber: this.auth.userType === 'patient' ? phoneNumber : null
    })
    .then((results) => {
      this.setState({
        store: {
          records: results
        },
        status: 'ready'
      });
    })
    .catch((error) => {
      console.error(error);
      this.setState({
        store: {
          records: null
        },
        status: 'error'
      });
    })
    .done();
  }

  _generateEventsHistoryListGroupItem(item, index) {
    const { userType } = this.auth;
    const { user: { id } } = this.state;
    const {
      type,
      patient = null,
      provider = null,
      metadata = {}
    } = item;
    let {
      timestamp
    } = item;
    let result, header, detail, bsStyle;

    timestamp = moment(timestamp).format('MMMM Do, YYYY [at] h:mma');

    switch (type) {
      case EVENTS_HISTORY_TYPES.REQUESTED_ACCESS_LOG_TOKEN:
        ({ result } = metadata);
        header = `You requested an access log token.`;
        detail = `Attempt ${result ? 'succeeded' : 'failed'}. ${timestamp}`;
        bsStyle = `${result ? 'success' : 'danger'}`;
        break;
      case EVENTS_HISTORY_TYPES.LOGIN_ATTEMPT:
        ({ result } = metadata);
        header = `You logged in.`;
        detail = `Attempt ${result ? 'succeeded' : 'failed'}. ${timestamp}`;
        bsStyle = `${result ? 'success' : 'danger'}`;
        break;
      case EVENTS_HISTORY_TYPES.ACCESSED_BLOOD_GLUCOSE_LOG:
        let viewer = 'N/A', owner = 'N/A';
        ({ result } = metadata);
        if (userType === 'patient' && !provider) {
          viewer = 'You';
          owner = 'your';
        } else if (userType === 'patient' && provider) {
          const { firstName, lastName } = provider;
          viewer = `${firstName} ${lastName}`;
          owner = 'your';
        } else if (userType === 'provider' && patient) {
          const { firstName, lastName } = patient;
          viewer = 'You';
          owner = `${firstName} ${lastName}`;
          owner = owner + `${lastName.slice(-1) !== 's' ? `'s` : ''}`;
        }
        header = `${viewer} accessed ${owner} blood glucose log.`;
        detail = `Attempt ${result ? 'succeeded' : 'failed'}. ${timestamp}`;
        bsStyle = `${result ? 'success' : 'danger'}`;
        break;
      default:
        return(
          null
        );
    }

    return(
      <ListGroupItem
        header={header}
        bsStyle={bsStyle}
        key={`event-${index}`}>
        {detail}
      </ListGroupItem>
    );
  }

  _generateEventsHistoryListGroup(records) {
    if (!records.length) {
      return(
        <ListGroup>
          <ListGroupItem
            header="You have not performed any actions."
            style={{ textAlign: 'center' }}>
            This will show a history of actions you have performed.
          </ListGroupItem>
        </ListGroup>
      );
    }

    return(
      <ListGroup>
        {records.map((record, index) => {
          return this._generateEventsHistoryListGroupItem(record, index)
        })}
      </ListGroup>
    );
  }

  _generateModalBody() {
    const {
      status,
      store: {
        records
      }
    } = this.state;

    switch (status) {
      case 'ready':
        return(
          this._generateEventsHistoryListGroup(records)
        );
      case 'error':
        return(
          <ListGroup>
            <ListGroupItem
              header="Oops something went wrong..."
              bsStyle="danger"
              style={{ textAlign: 'center' }}>
              Please close and re-open to try again.
            </ListGroupItem>
          </ListGroup>
        );
      case 'waiting':
      default:
        return(
          <ListGroup>
            <ListGroupItem
              header="Loading..."
              style={{ textAlign: 'center' }}>
              <img src={loadingGif} />
            </ListGroupItem>
          </ListGroup>
        );
    }
  }

  render() {
    const { shouldShow, onClose } = this.props;

    return(
      <Modal
        onEnter={() => this._onEnter()}
        show={shouldShow}
        onHide={onClose}>
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title>
            Your Activity History This Week
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {this._generateModalBody()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
