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

const AuthenticationMiddleware =
  require('./../../middlewares/sms/authentication');
const ServiceNumber = require('./../../models/schemas/service-number');
const { errorTypes } = require('./../../middlewares/sms/error-handler')();

describe('SMS API authentication middleware', () => {
  const res = {};
  const mockValidToken = '+12224443333:+17779998888';
  let authenticate, req, next, validateAssignmentStub;

  beforeEach(() => {
    req = {
      body: {
        From: '+12224443333',
        To: '+17779998888',
        Body: 'Mock Twilio Request'
      }
    };
    next = sinon.spy();
    validateAssignmentStub = sinon.stub(ServiceNumber, 'validateAssignment');
    ({ authenticate } = AuthenticationMiddleware({
      ServiceNumber
    }));
  });

  afterEach(() => {
    validateAssignmentStub.restore();
  });

  it('should be a middleware function', () => {
    expect(authenticate.length)
      .to
      .equal(3);
  });

  it('should be skipped if error type is set', () => {
    req.ErrorType = errorTypes.DEFAULT_ERROR;
    authenticate(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(validateAssignmentStub)
      .not
      .called;
  });

  it('should set error type if application state not set', () => {
    authenticate(req, res, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(validateAssignmentStub)
      .not
      .called;
  });

  it('should skip validation if valid token is cached', () => {
    req.ApplicationState = {
      Auth: mockValidToken
    };

    authenticate(req, res, next);

    expect(req.ErrorType)
      .to
      .not
      .exist;

    expect(validateAssignmentStub)
      .not
      .called;

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should validate if no valid token is cached', (done) => {
    validateAssignmentStub.returns(Q(true));

    req.ApplicationState = {};

    authenticate(req, res, next);

    process.nextTick(() => {
      expect(validateAssignmentStub)
        .calledWith(
          req.body.From,
          req.body.To
        );

      expect(req.ErrorType)
        .to
        .not
        .exist;

      expect(req.ApplicationState.Auth)
        .to
        .equal(mockValidToken);

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should be no subscription error if validation fails', (done) => {
    validateAssignmentStub.returns(Q(false));

    req.ApplicationState = {};

    authenticate(req, res, next);

    process.nextTick(() => {
      expect(validateAssignmentStub)
        .calledWith(
          req.body.From,
          req.body.To
        );

      expect(req.ErrorType)
        .to
        .equal(errorTypes.NO_SUBSCRIPTION);

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('Auth');

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should be default error if error while validating', (done) => {
    validateAssignmentStub.returns(
      Q.reject(new Error('Testing validation error...'))
    );

    req.ApplicationState = {};

    authenticate(req, res, next);

    process.nextTick(() => {
      expect(validateAssignmentStub)
        .calledWith(
          req.body.From,
          req.body.To
        );

      expect(req.ErrorType)
        .to
        .equal(errorTypes.DEFAULT_ERROR);

      expect(req.ApplicationState)
        .to
        .not
        .have
        .property('Auth');

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

});
