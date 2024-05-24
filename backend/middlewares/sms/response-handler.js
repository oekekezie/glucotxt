/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/23/2015
/********************************************************/
'use strict';

const twilio = require('twilio');

const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class ResponseHandlerMiddleware {

  constructor({ applicationStateManager }) {
    this.applicationStateManager = applicationStateManager;

    this.responseHandler = this.responseHandler.bind(this);
  }

  responseHandler(req, res, next) {
    const { Response } = res;

    if (!Response
    || !this.applicationStateManager.isRequestAuthenticated(req)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    const response = new twilio.TwimlResponse();
    response.message(Response, {
      statusCallback: '/sms/status/'
    });

    res.set('Content-Type', 'text/xml');
    res.send(response.toString());

  	return next();
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new ResponseHandlerMiddleware(dependencies)

  return({
    responseHandler: middleware.responseHandler
  });
};
