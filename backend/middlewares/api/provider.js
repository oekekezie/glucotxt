/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/13/2016
/*******************************************************/
'use strict';

const providerManager = require('./../../models/provider-manager');
const logger = require('./../../helpers/logger');

class ProviderMiddleware {

  removeProvider(req, res, next) {
    const { email } = req.body;

    providerManager.removeProvider(email)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to remove provider.'
      });
    })
    .done(() => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

  createProvider(req, res, next) {
    const { email, password, firstName, lastName, credentials } = req.body;

    providerManager.createProvider({
      email,
      password,
      firstName,
      lastName,
      credentials
    })
    .then((result) => {
      const { _id: id } = result;
      res.status(201).json({
        id,
        email,
        firstName,
        lastName,
        credentials
      });
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to create provider.'
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
  const middleware = new ProviderMiddleware(dependencies);

  return({
    createProvider: middleware.createProvider,
    removeProvider: middleware.removeProvider
  });
};
