/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/7/2015
/********************************************************/
import React from 'react';
import { Link } from 'react-router';

import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import InvitePatientModal from './../invite-patient-modal';
import EventsHistoryModal from './../events-history-modal';

export default class NavigationBar extends React.Component {

  constructor() {
    super();

    this._onInviteButtonClick = this._onInviteButtonClick.bind(this);
    this._didCloseInvitePatientModal =
      this._didCloseInvitePatientModal.bind(this);

    this._onEventsHistoryMenuItemClick =
      this._onEventsHistoryMenuItemClick.bind(this);
    this._didCloseEventsHistoryModal =
      this._didCloseEventsHistoryModal.bind(this);

    this.state = {
      isShowingInviteModal: false,
      isShowingEventsHistoryModal: false
    };
  }

  _generateNavDropdown() {
    const { firstName, lastName, credentials = [] } = this.props;
    const summaryCredentials = credentials.reduce((previous, current) => {
      if (previous === '') {
        return(current);
      } else {
        return(`${previous}, ${current}`);
      }
    }, '');
    const title = credentials.length === 0 ? `${firstName} ${lastName}`
      : `${firstName} ${lastName}, ${summaryCredentials}`;
    return(
      <Nav pullRight>
        <NavDropdown
          eventKey={1}
          title={title}
          id={'Activity History, Logout'}>
          <MenuItem
            title="Click to see your past actions."
            onSelect={this._onEventsHistoryMenuItemClick}
            eventKey={1.1}>
            Activity History
          </MenuItem>
          <MenuItem divider />
          <MenuItem eventKey={1.2} href="/logout">
            Logout
          </MenuItem>
        </NavDropdown>
      </Nav>
    );
  }

  _generateInviteButton() {
    const { isProvider } = this.props;

    if (!isProvider) {
      return null;
    }

    return(
      <Navbar.Form pullRight>
        <Button
          bsStyle="primary"
          onClick={this._onInviteButtonClick}>
          <Glyphicon glyph="plus" />
          {' '}
          Invite Patient
        </Button>
      </Navbar.Form>
    );
  }

  _generateInviteModal() {
    const { isProvider } = this.props;

    if (!isProvider) {
      return null;
    }

    const { isShowingInviteModal } = this.state;
    return(
      <InvitePatientModal
        shouldShow={isShowingInviteModal}
        onClose={this._didCloseInvitePatientModal} />
    );
  }

  _generateEventsHistoryModal() {

    const { isShowingEventsHistoryModal } = this.state;
    return(
      <EventsHistoryModal
        shouldShow={isShowingEventsHistoryModal}
        onClose={this._didCloseEventsHistoryModal} />
    );
  }

  _onInviteButtonClick() {
    this.setState({
      isShowingInviteModal: true
    });
  }

  _didCloseInvitePatientModal() {
    this.setState({
      isShowingInviteModal: false
    });
  }

  _onEventsHistoryMenuItemClick() {
    this.setState({
      isShowingEventsHistoryModal: true
    });
  }

  _didCloseEventsHistoryModal() {
    this.setState({
      isShowingEventsHistoryModal: false
    });
  }

  render() {
    return(
      <Navbar fluid fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <strong>
                GlucoTxt
              </strong>
            </Link>
          </Navbar.Brand>
           <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          {this._generateNavDropdown()}
          {this._generateInviteButton()}
        </Navbar.Collapse>

        {this._generateInviteModal()}
        {this._generateEventsHistoryModal()}
      </Navbar>
    );
  }

}
