/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/30/2015
********************************************************/

const LAST_MEASUREMENT_TOKEN_TTL = 60 * 1000; // in milliseconds

const { isMongoId } = require('validator');

const { measurementTypes } = require('./types');

let generateLastMeasurementToken = (measurement) => {
  if (typeof measurement === 'object'
  && !(measurement.constructor.modelName in measurementTypes)) {
    return null;
  }

  return(
    `${measurement.id}:${measurement.constructor.modelName}:${Date.now()}`
  );
};

// Returns null if expired
let parseLastMeasurementToken = (cachedToken) => {
  const measurementID = cachedToken.split(':')[0] || '';
  const measurementType = cachedToken.split(':')[1] || '';
  const timestamp = Number(cachedToken.split(':')[2])
    || Number.MIN_SAFE_INTEGER;

  if (!isMongoId(String(measurementID))
  || !(measurementType in measurementTypes)
  || Date.now() - timestamp > LAST_MEASUREMENT_TOKEN_TTL) {
    return null;
  } else {
    return({
      measurementID,
      measurementType
    });
  }
};

module.exports = {
  generateLastMeasurementToken,
  parseLastMeasurementToken,
  lastMeasurementTokenConstants: {
    LAST_MEASUREMENT_TOKEN_TTL
  }
};
