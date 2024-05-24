/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/28/2016
/*******************************************************/
'use strict';

const patientManager = require('./../../models/patient-manager');
const logger = require('./../../helpers/logger');

class PatientMiddleware {

  getPatientsByGroup(req, res, next) {
    const { group = "Hasbro Children's Hospital" } = req.query;

    if (typeof group !== 'string') {
      const error = new Error('Must include valid group.');
      logger.error(error, {
        requestUUID: req.uuid
      });
      res.status(400).json({
        error: 'Unable to get patients by group.'
      });
      return;
    }

    patientManager.getPatientsByGroup(group)
    .then((results) => {
      results = results.map((result) => {
        result.id = result._id;
        delete result._id;

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
        error: 'Unable to get patients by group.'
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
  const middleware = new PatientMiddleware(dependencies);

  return({
    getPatientsByGroup: middleware.getPatientsByGroup
  });
};
