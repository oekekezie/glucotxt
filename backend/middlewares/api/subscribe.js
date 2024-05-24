/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/13/2016
/*******************************************************/
'use strict';

const subscriptionManager = require('./../../models/subscription-manager');
const logger = require('./../../helpers/logger');

class SubscribeMiddleware {

  subscribePatient(req, res, next) {
    const {
      phoneNumber,
      firstName,
      lastName,
      birthdate,
      gender,
      providers,
      assignment,
      preferences
    } = req.body;

    subscriptionManager.subscribePatient({
      phoneNumber,
      firstName,
      lastName,
      birthdate,
      gender,
      providers,
      assignment,
      preferences
    })
    .then((result) => {
      res.status(201).json({
        result
      });
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to subscribe patient.'
      });
    })
    .done(() => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

  unsubscribePatient(req, res, next) {
    const { phoneNumber, serviceNumber } = req.body;

    subscriptionManager.unsubscribePatient(phoneNumber, serviceNumber)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to unsubscribe patient.'
      });
    })
    .done(() => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new SubscribeMiddleware(dependencies);

  return({
    subscribePatient: middleware.subscribePatient,
    unsubscribePatient: middleware.unsubscribePatient
  });
};
