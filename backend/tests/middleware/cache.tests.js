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

const CacheMiddleware = require('./../../middlewares/sms/cache');
const cacheManager = require('./../../models/cache-manager');
const { errorTypes } = require('./../../middlewares/sms/error-handler')();

describe('SMS API cache middleware', () => {
  const res = {};
  let getApplicationState, setApplicationState, req, next,
    existsStub, hgetallStub, hmsetExStub;

  beforeEach(() => {
    req = {
      body: {
        From: '+12224443333',
        To: '+17779998888',
        Body: 'Mock Twilio Request'
      }
    };
    next = sinon.spy();
    existsStub = sinon.stub(cacheManager, 'exists');
    hgetallStub = sinon.stub(cacheManager, 'hgetall');
    hmsetExStub = sinon.stub(cacheManager, 'hmsetEx');
    ({ getApplicationState, setApplicationState } = CacheMiddleware({
      cacheManager
    }));
  });

  afterEach(() => {
    existsStub.restore();
    hgetallStub.restore();
    hmsetExStub.restore();
  });

  it('should be a middleware', () => {
    expect(getApplicationState.length)
      .to
      .equal(3);

    expect(setApplicationState.length)
      .to
      .equal(3);
  });

  it('should skip getting state if an error type set', () => {
    req.ErrorType = errorTypes.DEFAULT_ERROR;
    getApplicationState(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(existsStub)
      .not
      .called;
  });

  it('should skip setting state if an error type set', () => {
    req.ErrorType = errorTypes.DEFAULT_ERROR;
    setApplicationState(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(hmsetExStub)
      .not
      .called;
  });

  it('should set default error if setting without state', () => {
    setApplicationState(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(hmsetExStub)
      .not
      .called;
  });

  it('should set state if provided', (done) => {
    hmsetExStub.returns(Q(true));

    req.ApplicationState = {
      test: 'hello world!'
    };

    setApplicationState(req, res, next);

    process.nextTick(() => {
      expect(hmsetExStub)
        .to
        .have
        .been
        .calledOnce;

      expect(req.ErrorType)
        .to
        .not
        .exists;

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should set default error if fails to set state', (done) => {
    hmsetExStub.returns(Q.reject(
      new Error('Failed to set state...')
    ));

    req.ApplicationState = {
      test: 'hello world!'
    };

    setApplicationState(req, res, next);

    process.nextTick(() => {
      expect(hmsetExStub)
        .to
        .have
        .been
        .calledOnce;

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

  it('should get state if it was cached', (done) => {
    const mockCachedApplicationData = {
      test: 'hello world!'
    };

    existsStub.returns(Q(true));
    hgetallStub.returns(Q(mockCachedApplicationData));

    getApplicationState(req, res, next);

    process.nextTick(() => {
      expect(existsStub)
        .to
        .have
        .been
        .calledOnce;

      expect(hgetallStub)
        .to
        .have
        .been
        .calledOnce;

      expect(req.ErrorType)
        .to
        .not
        .exists;

      expect(req.ApplicationState)
        .to
        .deep
        .equal(mockCachedApplicationData);

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should create empty state if none was cached', (done) => {
    const mockCachedApplicationData = {
      test: 'hello world!'
    };

    existsStub.returns(Q(false));
    hgetallStub.returns(Q(mockCachedApplicationData));

    getApplicationState(req, res, next);

    process.nextTick(() => {
      expect(existsStub)
        .to
        .have
        .been
        .calledOnce;

      expect(hgetallStub)
        .not
        .called;

      expect(req.ErrorType)
        .to
        .not
        .exists;

      expect(req.ApplicationState)
        .to
        .deep
        .equal({});

      expect(next)
        .to
        .have
        .been
        .calledOnce;

      done();
    });
  });

  it('should set default error if fails to get cached state', (done) => {
    const mockCachedApplicationData = {
      test: 'hello world!'
    };

    existsStub.returns(Q.reject(
      new Error('Failed to get cached state...')
    ));
    hgetallStub.returns(Q(mockCachedApplicationData));

    getApplicationState(req, res, next);

    process.nextTick(() => {
      expect(existsStub)
        .to
        .have
        .been
        .calledOnce;

      expect(hgetallStub)
        .not
        .called;

      expect(req.ErrorType)
        .to
        .equal(errorTypes.DEFAULT_ERROR);

      expect(req.ApplicationState)
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

});
