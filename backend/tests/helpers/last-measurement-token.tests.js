/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/30/2015
/********************************************************/
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const {
  generateLastMeasurementToken,
  parseLastMeasurementToken,
  lastMeasurementTokenConstants
} = require('./../../models/actions/helpers/last-measurement-token');
const BloodGlucose = require('./../../models/schemas/blood-glucose');

describe('Last measurement token helper', () => {
  const mockMeasurement = new BloodGlucose({
		value: 120,
    timestamp: new Date('4/5/1985'),
    postprandial: true,
		patient: null
	});
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(() => {
    clock.restore();
  });

  it('should generate parseable last measurement tokens', () => {
    const expected = generateLastMeasurementToken(mockMeasurement);

    expect(parseLastMeasurementToken(expected).measurementID)
      .to
      .equal(mockMeasurement.id);

    expect(parseLastMeasurementToken(expected).measurementType)
      .to
      .equal(mockMeasurement.constructor.modelName);
  });

  it('should consider expired tokens invalid', () => {
    const expected = generateLastMeasurementToken(mockMeasurement);

    clock.tick(lastMeasurementTokenConstants.LAST_MEASUREMENT_TOKEN_TTL + 1);

    expect(parseLastMeasurementToken(expected))
      .to
      .equal(null);
  });

});
