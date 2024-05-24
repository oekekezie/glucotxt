/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/15/2015
/********************************************************/
'use strict';

const Q = require('q');
const expect = require('chai').expect;

const ServiceNumber = require('./../../models/schemas/service-number');

describe.skip('Service Number model', () => {
  const mockPatient = 'mockPatient';
  const mockAvailableAndNotAssigned = {
    phoneNumber: '+12347650987',
  	numberAssigned: 3,
  	assigned: ['a', 'b', 'c'],
  	description: 'available'
  };
  const mockFilledAndAssigned = {
    phoneNumber: '+99947230987',
  	numberAssigned: ServiceNumber.getMaximumNumberOfAssignedPatients(),
  	assigned: ['d', 'e', 'f', mockPatient],
  	description: 'filled'
  };
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

  it('should save service number with a timestamp', (done) => {
    const available = new ServiceNumber(mockAvailableAndNotAssigned);
    const filled = new ServiceNumber(mockFilledAndAssigned);
    Q.all([available.save(), filled.save()])
    .then((records) => {
      records.forEach((record) => {
        expect(record.createdAt)
          .to
          .be
          .instanceOf(Date);
      });

      // FIXME: Store ids for subsequent tests (not best practice)
      mockAvailableAndNotAssigned.id = available.id;
      mockFilledAndAssigned.id = filled.id;
    })
    .done(done);
  });

  it('should get record with phone number of available service', (done) => {
    ServiceNumber.getAvailable()
    .then((record) => {
      expect(record.phoneNumber)
        .to
        .equal(mockAvailableAndNotAssigned.phoneNumber);
    })
    .done(done);
  });

  it('should determine if patient is assigned', (done) => {
    ServiceNumber.validateAssignment(
      mockPatient,
      mockFilledAndAssigned.phoneNumber
    )
    .then((result) => {
      expect(result)
        .to
        .be
        .true;
    })
    .done(done);
  });

  it('should determine if patient is not assigned', (done) => {
    ServiceNumber.validateAssignment(
      mockPatient,
      mockAvailableAndNotAssigned.phoneNumber
    )
    .then((result) => {
      expect(result)
        .to
        .be
        .false;
    })
    .done(done);
  });

  it('should assign patient', (done) => {
    ServiceNumber.assignPatient(mockPatient, mockAvailableAndNotAssigned.id)
    .then((patient) => {
      expect(patient)
        .to
        .be
        .true;
    })
    .done(done);
  });

  it('should unassign patient', (done) => {
    ServiceNumber.unassignPatient(mockPatient, mockFilledAndAssigned.id)
    .then((patient) => {
      expect(patient)
        .to
        .be
        .true;
    })
    .done(done);
  });
});
