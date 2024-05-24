/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/14/2016
/*******************************************************/
'use strict';

const Q = require('q');
const twilio = require('twilio');

const patientManager = require('./patient-manager');
const serviceNumberManager = require('./service-number-manager');
const LocalizationReference = require('./../localizations');

const client = new twilio.RestClient(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class SubscriptionManager {

  constructor() {
    this._sendInvitation = this._sendInvitation.bind(this);
  }

  _sendInvitation(phoneNumber, serviceNumber, language) {
    if (!serviceNumber || !phoneNumber || !language) {
      return Q.reject(new Error('Incomplete invitation.'));
    }

    const reference = LocalizationReference(language);

    return(
      Q(client.messages.create({
        to: phoneNumber,
        from: serviceNumber,
        body: reference.lookUp('INVITATION')
      }))
    );
  }

  /* Returns result contains service phone number if successful */
  // FIXME: Possible to reduce technical debt?
  subscribePatient(profile) {
    const deferred = Q.defer();

    if (!profile || !profile.assignment || !profile.preferences) {
      deferred.reject(
        new Error('Must specify profile including assignment and preferences.')
      );
      return deferred.promise;
    }

    const { phoneNumber, preferences: { language } } = profile;
    let assignment;

    serviceNumberManager.getAvailable()
    .then((result) => {
      assignment = result;
      const { phoneNumber: serviceNumber } = assignment;
      return(
        serviceNumberManager.validateAssignment(phoneNumber, serviceNumber)
      );
    })
    .then((result) => {
      if (result === true) {
        return Q.reject(new Error('Patient already assigned.'));
      } else {
        const { _id: id } = assignment;
        return serviceNumberManager.assignPatient(phoneNumber, id);
      }
    })
    .then((result) => {
      if (result !== true || !profile.assignment) {
        return Q.reject(new Error('Unable to assign patient.'));
      } else {
        const { _id: id, phoneNumber: serviceNumber } = assignment;

        profile.assignment.id = id;
        profile.assignment.phoneNumber = serviceNumber;

        return patientManager.createPatient(profile);
      }
    })
    // Rollback assignment if creating patient fails
    // Skip if already assigned or no service numbers exist
    .catch((error) => {
      const deferred = Q.defer();

      if (error.message === 'Patient already assigned.'
      || error.message === 'No available service numbers.') {
        deferred.reject(error);
        return deferred.promise;
      }

      if (error.message === 'Patient already exists.') {
        return Q(true);
      }

      const { _id: id } = assignment;
      serviceNumberManager.unassignPatient(phoneNumber, id)
      .done(() => {
        deferred.reject(error);
      });

      return deferred.promise;
    })
    .then((record) => {
      const { phoneNumber: serviceNumber } = assignment;
      return this._sendInvitation(phoneNumber, serviceNumber, language);
    })
    .then(() => {
      const { phoneNumber: serviceNumber } = assignment;
      deferred.resolve(serviceNumber);
    })
    .catch((error) => {
      console.error(error);
      console.error(error.stack);
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  unsubscribePatient(phoneNumber, serviceNumber, keepPatient = true) {
    const deferred = Q.defer();

    serviceNumberManager.unassignPatient(phoneNumber, serviceNumber)
    .then((result) => {
      if (result === true) {
        return(
          keepPatient ? true
            : patientManager.removePatientsByPhoneNumbers([phoneNumber])
        );
      } else {
        return Q.reject(new Error('Patient not assigned to service number'));
      }
    })
    .then((result) => {
      deferred.resolve(result ? true: false);
    })
    .catch((error) => {
      console.error(error);
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

}

const sharedInstance = new SubscriptionManager();
module.exports = sharedInstance;
