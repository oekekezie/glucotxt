/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/15/2016
/*******************************************************/
'use strict';

const Q = require('q');

const patientManager = require('./patient-manager');
const ServiceNumber = require('./schemas/service-number');

class ServiceNumberManager {

  constructor() {
    this.constants = {
      MAXIMUM_NUMBER_OF_ASSIGNED_PATIENTS:
        ServiceNumber.getMaximumNumberOfAssignedPatients()
    };
  }

  registerPhoneNumber(service) {
    const deferred = Q.defer();

    const serviceNumber = new ServiceNumber(service);

    Q(serviceNumber.save())
    .then((record) => {
      deferred.resolve(record);
    })
    .catch((error) => {
      if (error.code === 11000) {
        deferred.reject(new Error('Service number already registered.'));
      } else {
        deferred.reject(error);
      }
    })
    .done();

    return deferred.promise;
  }

  unregisterPhoneNumber(serviceNumber, andDeleteAssigned = false) {
    const deferred = Q.defer();

    const { phoneNumber } = serviceNumber;
    ServiceNumber.findOneAndRemove({
      phoneNumber: { $eq: phoneNumber }
    })
    .lean()
    .exec()
    .then((record) => {
      if (record) {
        const { assigned } = record;
        return(
          andDeleteAssigned ?
          patientManager.removePatientsByPhoneNumbers(assigned) : true
        );
      } else {
        return Q.reject(new Error('Service number may not exist.'));
      }
    })
    .then((result) => {
      deferred.resolve(result);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  getAvailable() {
    return ServiceNumber.getAvailable();
  }

  getAll() {
    return ServiceNumber.getAll();
  }

  assignPatient(patient, assignment, lean = true) {
    return ServiceNumber.assignPatient(patient, assignment, lean);
  }

  unassignPatient(patient, assignment, lean = true) {
    return ServiceNumber.unassignPatient(patient, assignment, lean);
  }

  validateAssignment(patient, assignment, lean = true) {
    return ServiceNumber.validateAssignment(patient, assignment, lean);
  }

}

const sharedInstance = new ServiceNumberManager();
module.exports = sharedInstance;
