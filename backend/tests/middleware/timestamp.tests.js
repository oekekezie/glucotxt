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

const { timestamp } = require('./../../middlewares/sms/timestamp')();

describe('SMS API timestamp middleware', () => {
  const res = {};
  let req, next;

  beforeEach(() => {
    req = {};
    next = sinon.spy();
  });

  it('should be a middleware', () => {
    expect(timestamp.length)
      .to
      .equal(3);
  });

  it('should append a timestamp to the request', () => {
    timestamp(req, res, next);

    expect(req.Timestamp)
      .to
      .be
      .instanceof(Date);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });
});
