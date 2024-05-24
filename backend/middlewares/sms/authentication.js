/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/*******************************************************/
'use strict';

const { isMobilePhone } = require('validator');

const logger = require('./../../helpers/logger');
const { errorTypes } = require('./../../helpers/types');
const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class AuthenticationMiddleware {

  constructor({ applicationStateManager }) {
    this.applicationStateManager = applicationStateManager;

    this.authenticate = this.authenticate.bind(this);
  }

  authenticate(req, res, next) {
    const { From, To } = req.body;

    if (!isMobilePhone(From, 'en-US')
    || !isMobilePhone(To, 'en-US')) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    // Attempt authentication using cached
    if (this.applicationStateManager.isRequestAuthenticated(req)) {
      return next();
    }

    this.applicationStateManager.models.ServiceNumber.validateAssignment(
      From,
      To
    )
    .then((result) => {
      if (!result || !this.applicationStateManager.setAuthToken(req)) {
        sendErrorResponseMessage(
          req,
          res,
          this.applicationStateManager.getReference(),
          errorTypes.NO_SUBSCRIPTION
        );
      }
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    })
    .done(() => {
      if (!res.headersSent) {
        next();
      }
    });
  };

};


module.exports = (dependencies = {}) => {
  const middleware = new AuthenticationMiddleware(dependencies);

	return({
		authenticate: middleware.authenticate
	});
};
