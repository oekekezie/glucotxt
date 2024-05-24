/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/29/2015
/********************************************************/
'use strict';

const Q = require('q');
const expect = require('chai').expect;

const Patient = require('./../../models/schemas/patient');
const BloodGlucose = require('./../../models/schemas/blood-glucose');

describe.skip('Patient model', () => {
  const mockPatient = new Patient({
    firstName: 'Fredo',
    lastName: 'Santana',
    phoneNumber: '+12347650987'
  });
  const mockMeasurement = new BloodGlucose({
		value: 120,
    timestamp: new Date('4/5/1985'),
    postprandial: true,
		patient: mockPatient.id
	});
  let dbManager;

  before((done) => {
    dbManager = require('./../../models/db-manager');
    dbManager.connect(() => {
      dbManager.mongoose.connection.db.dropDatabase(done);
    });
  });

  after((done) => {
    dbManager.mongoose.connection.db.dropDatabase(() => {
      dbManager.mongoose.connection.close(done);
    });
  });

  it('should save patient with a timestamp', () => {
    return(
      mockPatient.save()
      .then((record) => {
        expect(record.createdAt)
          .to
          .be
          .instanceOf(Date);
      })
    );
  });

  it('should find patient by phone number', () => {
    return(
      Patient.findByPhoneNumber(mockPatient.phoneNumber)
      .then((record) => {
        expect(record.firstName)
          .to
          .equal(mockPatient.firstName);
      })
    );
  });

  it('should add blood glucose measurement', () => {
    return(
      Patient.addMeasurement(mockMeasurement)
      .then((result) => {
        expect(result)
          .to
          .equal(true);
      })
    );
  });

  it('should remove blood glucose measurement', () => {
    return(
      Patient.removeMeasurement(
        mockMeasurement.id,
        mockMeasurement.constructor.modelName)
      .then((result) => {
        expect(result)
          .to
          .equal(true);
      })
    );
  });

});
