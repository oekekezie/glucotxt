/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/19/2015
/*******************************************************/
'use strict';

const { isMobilePhone } = require('validator');

const logger = require('./../../helpers/logger');
const { errorTypes } = require('./../../helpers/types');
const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class GetPatientMiddleware {

  constructor({ applicationStateManager }) {
    this.applicationStateManager = applicationStateManager;

    this.getPatient = this.getPatient.bind(this);
  }

  getPatient(req, res, next) {
    const { From } = req.body;

    if (!isMobilePhone(From, 'en-US')
    || !this.applicationStateManager.isRequestAuthenticated(req)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    this.applicationStateManager.models.Patient.findByPhoneNumber(From)
    .then((patient) => {
      const { _id: id, preferences: { language } } = patient;
      if (!this.applicationStateManager.setPatientID(id)
      || !this.applicationStateManager.setLanguage(language)) {
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
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new GetPatientMiddleware(dependencies);

  return({
    getPatient: middleware.getPatient
  });
};
