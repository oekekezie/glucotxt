/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/11/2016
/*******************************************************/
'use strict';

const Q = require('q');
const { isEmail, isMongoId } = require('validator');

const oAuthManager = require('./../../models/oauth-manager');
const providerManager = require('./../../models/provider-manager');
const logger = require('./../../helpers/logger');
const { eventTypes } = require('./../../helpers/types');

class OAuthMiddleware {

  constructor({ Event }) {
    this.models = {
      Event
    };

    this.login = this.login.bind(this);
  }

  isAuthenticated(groups = [], requireAll = false) {

    return(
      (req, res, next) => {
        const authHeader = req.get('authorization') || '';
        const token = authHeader.replace('bearer ', '');

        oAuthManager.validate(token, groups, requireAll)
        .then((result) => {
          const { isValid, userID } = result;
          if (isValid
            && (isMongoId(userID) || isEmail(userID))
            && typeof next === 'function') {
            req[isMongoId(userID) ? 'providerID' : 'adminID'] = userID;
            return next();
          } else {
            return Q.reject(new Error('Authentication failed.'));
          }
        })
        .catch((error) => {
          logger.error(error, {
            requestUUID: req.uuid
          });
          res.status(401).json({
            error: 'Authentication failed.'
          });
        })
        .done();
      }
    );

  }

  login(req, res, next) {
    const { email, password } = req.body;
    let provider;

    providerManager.getProvider(email)
    .then((record) => {
      const { _id, firstName, lastName, credentials } = record;
      provider = {
        id: _id,
        email,
        firstName,
        lastName,
        credentials
      };
      return oAuthManager.login(email, password);
    })
    .then((token) => {
      res.status(200).json({
        token,
        provider
      });
      return true;
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(401).json({
        error: 'Invalid email address and/or password.'
      });
      return false;
    })
    .done((result) => {
      this.models.Event.log({
        req,
        details: {
          type: eventTypes.LOGIN_ATTEMPT,
          provider: provider && String(provider.id) || null,
          metadata: {
            result
          }
        }
      });
      if (typeof next === 'function') {
        next();
      }
    });
  }

  logout(req, res, next) {
    const authHeader = req.get('authorization') || '';
    const token = authHeader.replace('bearer ', '');

    oAuthManager.logout(token)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(401).json({
        error: 'Error while logging out.'
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
  const middleware = new OAuthMiddleware(dependencies);

  return({
    isAuthenticated: middleware.isAuthenticated,
    login: middleware.login,
    logout: middleware.logout
  });
};
