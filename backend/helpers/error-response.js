/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/30/2015
/********************************************************/
'use strict';

const twilio = require('twilio');

const logger = require('./../helpers/logger');
const LocalizationReference = require('./../localizations');

const { errorTypes } = require('./types');

let sendErrorResponseMessage = (
  req,
  res,
  reference,
  errorType = errorTypes.DEFAULT_ERROR
) => {
  const response = new twilio.TwimlResponse();

  reference = reference || LocalizationReference();
  errorType = (errorType in errorTypes) ?
     errorType : errorTypes.DEFAULT_ERROR;

  const errorMessage = `Twilio SMS request failed with ${errorType}.`;
  logger.error(errorMessage, {
    requestUUID: req.uuid,
    requestDurationInMS: Date.now() - req.startTime
  });

  response.message(reference.lookUp(errorType), {
    statusCallback: `${process.env.TWILIO_REQUEST_URL}status/`
  });

  res.set('Content-Type', 'text/xml');
  return res.send(response.toString());
};

module.exports = {
	sendErrorResponseMessage
};
