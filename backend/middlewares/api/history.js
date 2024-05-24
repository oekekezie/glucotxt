/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/30/2016
/*******************************************************/
'use strict';

const { isDate, isMongoId } = require('validator');

const historyManager = require('./../../models/history-manager');
const logger = require('./../../helpers/logger');

class HistoryMiddleware {

  getEventsHistory(req, res, next) {
    const {
      startDate = '1/1/1900',
      endDate = '1/1/2100'
    } = req.query;

    const userType = req.patientID ? 'patient' : req.providerID ? 'provider'
      : null;
    let userID = req.patientID || req.providerID || null;

    if (!(userType && userID && isMongoId(userID))
    || !(typeof startDate === 'string' && isDate(startDate))
    || !(typeof endDate === 'string' && isDate(endDate))) {
      const error = new Error('Invalid id, type, and/or date range.');
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get events history.'
      });
      return;
    }

    historyManager.getEvents({
      userType,
      userID,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })
    .then((results) => {
      results = results.map((result) => {
        delete result._id;

        if (result.patient && result.patient._id) {
          result.patient.id = result.patient._id;
          delete result.patient._id;
        }

        if (result.provider && result.provider._id) {
          result.provider.id = result.provider._id;
          delete result.provider._id;
        }

        return result;
      });
      res.status(200).json({
        results
      });
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get events history.'
      });
    })
    .done((result) => {
      if (typeof next === 'function') {
        next();
      }
    });
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new HistoryMiddleware(dependencies);

  return({
    getEventsHistory: middleware.getEventsHistory
  });
};
