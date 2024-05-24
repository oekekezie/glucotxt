/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/30/2016
/*******************************************************/
'use strict';

const { isDate, isMongoId } = require('validator');

const measurementsManager = require('./../../models/measurements-manager');
const logger = require('./../../helpers/logger');
const { eventTypes } = require('./../../helpers/types');

class MeasurementsMiddleware {

  constructor({ Event }) {
    this.models = {
      Event
    };

    this.getBloodGlucoseMeasurements =
      this.getBloodGlucoseMeasurements.bind(this);
  }

  getBloodGlucoseMeasurements(req, res, next) {
    const {
      patientID,
      startDate = '1/1/1900',
      endDate = '1/1/2100'
    } = req.query;

    if (!(typeof patientID === 'string' && isMongoId(patientID))
    || !(typeof startDate === 'string' && isDate(startDate))
    || !(typeof endDate === 'string' && isDate(endDate))
    // ACL check
    || (!req.providerID && req.patientID && req.patientID !== patientID)) {
      const error = new Error('ACL error or invalid id and/or date range.');
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get blood glucose measurements.'
      });
      return;
    }

    measurementsManager.getBloodGlucoseMeasurements({
      patientID,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })
    .then((results) => {
      results = results.map((result) => {
        delete result._id;

        return result;
      });
      res.status(200).json({
        results
      });

      return true;
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get blood glucose measurements.'
      });

      return false;
    })
    .done((result) => {
      this.models.Event.log({
        req,
        details: {
          type: eventTypes.ACCESSED_BLOOD_GLUCOSE_LOG,
          patient: patientID && String(patientID) || null,
          provider: req.providerID && String(req.providerID) || null,
          metadata: {
            result,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          }
        }
      });
      if (typeof next === 'function') {
        next();
      }
    });
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new MeasurementsMiddleware(dependencies);

  return({
    getBloodGlucoseMeasurements: middleware.getBloodGlucoseMeasurements
  });
};
