/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/18/2016
/*******************************************************/
'use strict';

const Q = require('q');

const accessLogManager = require('./../../models/access-log-manager');
const patientManager = require('./../../models/patient-manager');
const logger = require('./../../helpers/logger');
const { eventTypes } = require('./../../helpers/types');

class AccessLogMiddleware {

  constructor({ Event }) {
    this.models = {
      Event
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  _parseAuthorizationHeaderOrBody(req) {
    let phoneNumber = '', rawToken = '';

    switch (req.method) {
      case 'GET':
        const auth = req.get('authorization') || null;
        phoneNumber = auth && auth.split(' ')[0] || '';
        rawToken = auth && auth.split(' ')[1] || '';
        break;
      case 'POST':
        phoneNumber = req.body.phoneNumber || '';
        rawToken = req.body.rawToken || '';
        break;
      default:
        break;
    }

    return { phoneNumber, rawToken };
  }

  isAuthenticated(req, res, next) {
    const { phoneNumber, rawToken } = this._parseAuthorizationHeaderOrBody(req);

    let patientID;
    patientManager.getPatientByPhoneNumber(phoneNumber)
    .then((record) => {
      const { _id } = record;
      patientID = String(_id);
      return accessLogManager.validateAccessLogToken(phoneNumber, rawToken);
    })
    .then((result) => {
      if (result && typeof next === 'function') {
        req.patientID = patientID;
        return next();
      } else {
        return Q.reject(new Error('Access log token validation failed.'));
      }
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(401).json({
        error: 'Incorrect phone number and/or access code.'
      });
    })
    .done();
  }

  login(req, res, next) {
    const { phoneNumber, rawToken } = this._parseAuthorizationHeaderOrBody(req);
    let patient;

    patientManager.getPatientByPhoneNumber(phoneNumber)
    .then((record) => {
      const { _id, firstName, lastName } = record;
      patient = {
        id: _id,
        phoneNumber,
        firstName,
        lastName
      };

      return accessLogManager.validateAccessLogToken(phoneNumber, rawToken);
    })
    .then((result) => {
      if (!result) {
        return Q.reject(new Error('Access log token validation failed.'));
      } else {
        res.status(200).json({
          token: {
            ttl: result || 0,
            raw: rawToken
          },
          patient
        });

        return true;
      }
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(401).json({
        error: 'Incorrect phone number and/or access code.'
      });

      return false;
    })
    .done((result) => {
      this.models.Event.log({
        req,
        details: {
          type: eventTypes.LOGIN_ATTEMPT,
          patient: patient && String(patient.id) || null,
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
    const { phoneNumber } = this._parseAuthorizationHeaderOrBody(req);
    accessLogManager.forgetAccessLogToken(phoneNumber)
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
  const middleware = new AccessLogMiddleware(dependencies);

  return({
    isAuthenticated: middleware.isAuthenticated,
    login: middleware.login,
    logout: middleware.logout
  });
};
