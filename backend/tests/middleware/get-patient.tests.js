/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/********************************************************/
'use strict';

const Q = require('q');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const Patient = require('./../../models/schemas/patient');
const GetPatientMiddleware = require('./../../middlewares/sms/get-patient');
const { errorTypes } = require('./../../middlewares/sms/error-handler')();

describe('SMS API get patient middleware', () => {
  const res = {};
  const engReference = require('./../../localizations/eng');
  const espReference = require('./../../localizations/esp');
  let req, next, getPatient, findByPhoneNumberStub;

  beforeEach(() => {
    req = {
      body: {
        From: '+12224443333',
        To: '+17779998888',
        Body: 'Mock Twilio Request'
      }
    };
    next = sinon.spy();
    findByPhoneNumberStub = sinon.stub(Patient, 'findByPhoneNumber');
    ({ getPatient } = GetPatientMiddleware({
      Patient
    }));
  });

  afterEach(() => {
    findByPhoneNumberStub.restore();
  });

  it('should be a middleware', () => {
    expect(getPatient.length)
      .to
      .equal(3);
  });

  it('should be skipped if error type is set', () => {
    req.ErrorType = errorTypes.DEFAULT_ERROR;
    getPatient(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(findByPhoneNumberStub)
      .not
      .called;
  });

  it('should set error type if application state not set', () => {
    getPatient(req, res, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(findByPhoneNumberStub)
      .not
      .called;
  });

  it('should set reference if application state set', () => {
    const randomLanguagePreference = Math.random() > 0.5 ? 'eng' : 'esp';
    const expectedReference = randomLanguagePreference === 'eng' ?
      engReference : espReference;

    req.ApplicationState = {
      PatientID: 'test',
      LanguagePreference: randomLanguagePreference
    };

    getPatient(req, res, next);

    expect(req.Reference.reference)
      .to
      .deep
      .equal(expectedReference);

    expect(req.ErrorType)
      .to
      .not
      .exist;

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should get patient then set state and reference', (done) => {
    const randomLanguagePreference = Math.random() > 0.5 ? 'eng' : 'esp';
    const expectedReference = randomLanguagePreference === 'eng' ?
      engReference : espReference;
    const mockPatient = {
      id: 'Mr. Cool',
      preferences: {
        language: randomLanguagePreference
      }
    };

    findByPhoneNumberStub.returns(Q(mockPatient));

    req.ApplicationState = {};

    getPatient(req, res, next);

    process.nextTick(() => {
      expect(findByPhoneNumberStub)
        .calledWith(req.body.From);

      expect(req.ApplicationState)
        .to
        .have
        .property('PatientID', mockPatient.id);

      expect(req.ApplicationState)
        .to
        .have
        .property('LanguagePreference', mockPatient.preferences.language);

      expect(req.Reference.reference)
        .to
        .deep
        .equal(expectedReference);

      expect(req.ErrorType)
        .to
        .not
        .exist;

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should set no subscription error if no patient found', (done) => {
    findByPhoneNumberStub.returns(Q(null));

    req.ApplicationState = {};

    getPatient(req, res, next);

    process.nextTick(() => {
      expect(findByPhoneNumberStub)
        .calledWith(req.body.From);

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('PatientID');

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('LanguagePreference');

      expect(req)
        .to
        .not
        .have
        .property('Reference');

      expect(req.ErrorType)
        .to
        .equal(errorTypes.NO_SUBSCRIPTION);

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should set default error if get patients errors', (done) => {
    findByPhoneNumberStub.returns(Q.reject(
      new Error('Failed while getting patient...')
    ));

    req.ApplicationState = {};

    getPatient(req, res, next);

    process.nextTick(() => {
      expect(findByPhoneNumberStub)
        .calledWith(req.body.From);

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('PatientID');

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('LanguagePreference');

      expect(req)
        .to
        .not
        .have
        .property('Reference');

      expect(req.ErrorType)
        .to
        .equal(errorTypes.DEFAULT_ERROR);

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

});
