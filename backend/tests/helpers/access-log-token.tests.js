/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/28/2015
/********************************************************/
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const {
  generateAccessLogToken,
  isAccessLogTokenValid,
  accessLogTokenConstants
} = require('./../../models/actions/helpers/access-log-token');

describe('Access log token helper', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(() => {
    clock.restore();
  });

  it('should generate valid access log tokens', () => {
    const expected = generateAccessLogToken();

    expect(isAccessLogTokenValid(expected.raw, expected.toCache))
      .to
      .be
      .true;
  });

  it('should consider expired tokens invalid', () => {
    const expected = generateAccessLogToken();
    
    clock.tick(accessLogTokenConstants.ACCESS_LOG_TOKEN_TTL + 1);

    expect(isAccessLogTokenValid(expected.raw, expected.toCache))
      .to
      .be
      .false;
  });

});
