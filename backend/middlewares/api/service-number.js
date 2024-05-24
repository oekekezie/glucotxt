/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/13/2016
/*******************************************************/
'use strict';

const serviceNumberManager = require('./../../models/service-number-manager');
const logger = require('./../../helpers/logger');

class ServiceNumberMiddleware {

  getAll(req, res, next) {
    serviceNumberManager.getAll()
    .then((results) => {
      // NOTE: Benefit of mapping vs. array?
      let mapped = {};
			results.forEach((result) => {
				const { _id: id, phoneNumber, description, numberAssigned } = result;
				mapped = Object.assign(mapped, {
					id: {
						phoneNumber,
						description,
						numberAssigned
					}
				});
			});
      res.status(200).json({
        results: mapped
      });
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get service phone numbers.'
      });
    })
    .done(() => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

  registerPhoneNumber(req, res, next) {
    const {
      phoneNumber,
      description
    } = req.body;

    serviceNumberManager.registerPhoneNumber({
      phoneNumber,
      description
    })
    .then((result) => {
      const { _id: id } = result;
      res.status(201).json({
        id,
        phoneNumber,
        description
      });
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to register service phone number.'
      });
    })
    .done(() => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

  unregisterPhoneNumber(req, res, next) {
    const {
      phoneNumber
    } = req.body;

    serviceNumberManager.unregisterPhoneNumber({
      phoneNumber
    })
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to unregister service phone number.'
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
  const middleware = new ServiceNumberMiddleware(dependencies);

  return({
    getAll: middleware.getAll,
    registerPhoneNumber: middleware.registerPhoneNumber,
    unregisterPhoneNumber: middleware.unregisterPhoneNumber
  });
};
