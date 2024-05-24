/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/14/2016
/*******************************************************/
'use strict';

const Q = require('q');

const Patient = require('./schemas/patient');

class PatientManager {

  createPatient(profile) {
    const deferred = Q.defer();

    const patient = new Patient(profile);

    Q(patient.save())
    .then((record) => {
      deferred.resolve(record);
    })
    .catch((error) => {
      if (error.code === 11000) {
        deferred.reject(new Error('Patient already exists.'));
      } else {
        deferred.reject(error);
      }
    })
    .done();

    return deferred.promise;
  }

  getPatientByPhoneNumber(phoneNumber) {
    return Patient.findByPhoneNumber(phoneNumber);
  }

  getPatientsByGroup(group) {
    return(
      Patient.find({
        groups: { $eq: group}
      })
      .select({
        _id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthdate: true,
        assignment: true,
        statistics: true
      })
      .lean()
      .exec()
    );
  }

  removePatientsByPhoneNumbers(phoneNumbers) {
    return(
      Patient.remove({
        phoneNumber: { $in: phoneNumbers }
      })
      .lean()
    	.exec()
    );
  }

}

const sharedInstance = new PatientManager();
module.exports = sharedInstance;
