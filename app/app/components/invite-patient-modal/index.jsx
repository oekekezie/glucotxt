/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/10/2015
/********************************************************/
import Q from 'q';
import React from 'react';
import moment from 'moment-timezone';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Modal from 'react-bootstrap/lib/Modal';
import Input from 'react-bootstrap/lib/Input';
import Button from 'react-bootstrap/lib/Button';

import AsyncButton from './../async-button';
import CustomAlert from './../custom-alert';
import CustomInput from './../custom-input';
import CheckboxGroup from './../checkbox-group';

import oAuthManager from './../../models/oauth-manager';
import providerManager from './../../models/provider-manager';

import {
  ENUM_PROGRAM_SCHEDULE,
  ENUM_GENDER,
  ENUM_ADHERENCE
} from './../../helpers/enums';

export default class InvitePatientModal extends React.Component {

  constructor() {
    super();

    this._updateInvitationRequest = this._updateInvitationRequest.bind(this);

    this.state = {
      request: {}
    }
  }

  _updateInvitationRequest(key, value, isValid) {
    const { request } = this.state;

    this.setState({
      request: Object.assign({}, request, {
        [key]: { value, isValid }
      })
    });
  }

  _getInvitationRequest() {
    const { request } = this.state;
    const expected = [
      'phoneNumber',
      'firstName',
      'lastName',
      'birthdate',
      'gender',
      'schedule',
      'baseline'
    ];

    const errors = expected.filter((param) => {
      if (Object.keys(request).indexOf(param) === -1
        || request[param].isValid === false) {
        return true;
      }
    });

    if (errors.length > 0) {
      return null;
    } else {
      const { id: providerID } = providerManager.getProvider();

      const invitation = expected.reduce((previous, current) => {
        if (current.match(/^(schedule|baseline)$/)) {
          return previous;
        } else {
          return Object.assign({}, previous, {
            [current]: request[current].value
          });
        }
      }, {});

      invitation.phoneNumber = `+1${invitation.phoneNumber}`;
      invitation.providers = [providerID];
      invitation.assignment = {
        startDate: new Date(),
        schedule: request.schedule.value,
        baseline: request.baseline.value
      };
      invitation.preferences = {
        language: 'eng',
        timeZone: moment.tz.guess()
      };

      return invitation;
    }
  }

  _submitButtonClick() {
    const token = oAuthManager.getToken();
    const invitation = this._getInvitationRequest();

    if (!invitation) {
      this.alert.show(
        `Oops! Your's patient's invitation is incomplete.`,
        `Please make sure you have filled out the form correctly.`,
        'danger'
      );
    } else {
      return(
        providerManager.invitePatient(token, invitation)
        .then((result) => {
          console.log(JSON.stringify(result, null, 2));
          result =
            `${result.slice(2,5)}-${result.slice(5,8)}-${result.slice(8,12)}`;

          this.alert.show(
            `Success! Your patient will receive a text from us shortly.`,
            `Tell your patient to text ${result} to log their blood glucose
 measurements. Also, be sure to share a physical copy of the instructions
 with them.`,
            'success'
          );
        })
        .catch((error) => {
          console.error(error);
          let alert = 'Please make sure the information below is valid.';

          if (error === 'Patient already assigned.') {
            alert = 'This patient has already been invited to GlucoTxt.'
          }

          this.alert.show(
            'Oops! Unable to invite this patient.',
            alert,
            'danger'
          );
        })
      );
    }
  }

  render() {
    const { shouldShow, onClose } = this.props;

    return(
      <Modal show={shouldShow} onHide={onClose}>
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title>
            Complete This Form To Invite Your Patient
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Input>
              <CustomInput
                type="text"
                name="phoneNumber"
                validationType="phoneNumber"
                label="Patient's Mobile Phone Number"
                placeholder="XXX-XXX-XXXX"
                help="Required. Should be patient's main mobile phone number."
                passValueToParent={this._updateInvitationRequest}
                required />
            </Input>
            <Input>
              <Row>
                <Col xs={6}>
                  <CustomInput
                    type="text"
                    name="firstName"
                    label="Patient's First Name"
                    help="Required."
                    placeholder="First Name"
                    passValueToParent={this._updateInvitationRequest}
                    required />
                </Col>
                <Col xs={6}>
                  <CustomInput
                    type="text"
                    name="lastName"
                    label="Patient's Last Name"
                    help="Required."
                    placeholder="Last Name"
                    passValueToParent={this._updateInvitationRequest}
                    required />
                </Col>
              </Row>
            </Input>
            <Input>
              <Row>
                <Col xs={6}>
                  <CustomInput
                    type="text"
                    name="birthdate"
                    validationType="date"
                    label="Patient's Birthdate"
                    placeholder="MM/DD/YYYY"
                    help="Required. Use MM/DD/YYYY format."
                    passValueToParent={this._updateInvitationRequest}
                    required />
                </Col>
                <Col xs={6}>
                  <CustomInput
                    type="select"
                    name="gender"
                    label="Patient's Gender"
                    placeholder=""
                    help="Required."
                    passValueToParent={this._updateInvitationRequest}
                    required>
                    <option value="" hidden>
                      Select...
                    </option>
                    {ENUM_GENDER.map((gender, index) => {
                      return(
                        <option
                          value={gender.toLowerCase()}
                          key={`gender:${index}`}>
                          {gender}
                        </option>
                      );
                    })}
                  </CustomInput>
                </Col>
              </Row>
            </Input>
            <Input>
              <Row>
                <Col xs={6}>
                  <CheckboxGroup
                    name="schedule"
                    label="Recommended Daily BG Measurements"
                    help={`Required. Must check at least one.`}
                    passValueToParent={this._updateInvitationRequest}
                    checkboxes={ENUM_PROGRAM_SCHEDULE} />
                </Col>
                <Col xs={6}>
                  <CustomInput
                    type="select"
                    name="baseline"
                    placeholder=""
                    label="Est. Past Daily BG Logging Adherence"
                    help="Required."
                    passValueToParent={this._updateInvitationRequest}
                    required>
                    <option value="" hidden>
                      Select...
                    </option>
                    {ENUM_ADHERENCE.map((adherence) => {
                      return(
                        <option
                          key={`adherence:${adherence}`}
                          value={adherence}>
                          {
                            `${Number(adherence * 100).toFixed()}%
                            ${adherence === 0.0 ? '(Never logs BG measurements)'
                            : adherence === 1.0 ? '(Always logs BG measurements)'
                            : ''}`
                          }
                        </option>
                      );
                    })}
                  </CustomInput>
                </Col>
              </Row>
            </Input>
            <CustomAlert
              ref={(node) => this.alert = node} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <AsyncButton
            bsStyle="primary" onClick={(e) => this._submitButtonClick(e)}>
            Send Invitation
          </AsyncButton>
        </Modal.Footer>
      </Modal>
    );
  }

}
