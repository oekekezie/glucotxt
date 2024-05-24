/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/22/2015
/********************************************************/
'use strict';

const twilio = require('twilio');

class ValidateTwilioRequestsMiddleware {

  constructor() {
    this.acceptRequestsOnlyFromTwilio = twilio.webhook({
      'validate': true,
      'url': process.env.TWILIO_REQUEST_URL
    });
  }

}

module.exports = () => {
  const middleware = new ValidateTwilioRequestsMiddleware();

  return({
    acceptRequestsOnlyFromTwilio: middleware.acceptRequestsOnlyFromTwilio
  });
};
