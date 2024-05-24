/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/********************************************************/
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const {
  errorHandler,
  setErrorType,
  errorTypes,
  validErrorTypes
} = require('./../../middlewares/sms/error-handler')();

describe('SMS API error handling middleware', () => {
  let req, next;
  const res = {};

  beforeEach(() => {
    req = {};
    next = sinon.spy();
  });

  it('should be a middleware', () => {
    expect(errorHandler.length)
      .to
      .equal(3);
  });

  it('should set the default error and call next', () => {
    setErrorType(req, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set the specified error and call next', () => {
    const randomErrorType = Math.random() >= 0.5 ?
      errorTypes.NO_SUBSCRIPTION :
      errorTypes.UNSUPPORTED_ACTION;

    setErrorType(req, next, randomErrorType);

    expect(req.ErrorType)
      .to
      .equal(randomErrorType);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should not set an error message if no error specified', () => {
    errorHandler(req, res, next);

    expect(req)
      .to
      .not
      .have
      .property('ErrorMessage');

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set appropriate error message given an error', () => {
    const randomErrorType = validErrorTypes[
      Number(Math.random() * (validErrorTypes.length - 1)).toFixed()
    ];
    const reference = require('./../../localizations')();

    req = { ErrorType: randomErrorType };
    errorHandler(req, res, next);

    expect(req)
      .to
      .have
      .property('ErrorMessage', reference.lookUp(randomErrorType));

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set error message given an error and localizedreference', () => {
    const reference = require('./../../localizations')('esp');
    const randomErrorType = validErrorTypes[
      Number(Math.random() * (validErrorTypes.length - 1)).toFixed()
    ];

    req = { ErrorType: randomErrorType };
    errorHandler(req, res, next);

    expect(req)
      .to
      .have
      .property('ErrorMessage', reference.lookUp(randomErrorType));

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });
});
