/********************************************************
* Project Name: GlucoText API
* By: Obi Ekekezie
* Date Created: 10/30/2015
/*******************************************************/

const Q = require('q');

const logger = require('./../../../helpers/logger');
const {
  responseTypes,

  getNumberOfExpectedParametersForActionType
} = require('./../../../helpers/types');

let exec = (applicationStateManager) => {
  const deferred = Q.defer();
  const invalidActionError = new Error(
    'Invalid parameters for log blood glucose action.'
  );

  const { type, parameters } = applicationStateManager.getAction();
  if (type !== 'log-blood-glucose'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)) {
    deferred.reject(invalidActionError);
    return deferred.promise;
  }

  const measurement = new applicationStateManager.models.BloodGlucose({
    value: parameters[0],
    postprandial: parameters[1] ? true : false,
    timestamp: applicationStateManager.getTimestamp(),
    patient: applicationStateManager.getPatientID()
  });

  applicationStateManager.models.Patient.addMeasurement(measurement)
  .then((result) => {
    if (result && applicationStateManager.setLastMeasurement(measurement)) {
      if (parameters[1]) {
        deferred.resolve(
          responseTypes.UPDATE_AND_MARK_BLOOD_GLUCOSE_LOG_SUCCESS
        );
      } else {
        deferred.resolve(responseTypes.UPDATE_BLOOD_GLUCOSE_LOG_SUCCESS);
      }
    } else {
      deferred.resolve(responseTypes.UPDATE_BLOOD_GLUCOSE_LOG_FAILURE);
    }
  })
  .catch((error) => {
    logger.error(error);
    deferred.resolve(responseTypes.UPDATE_BLOOD_GLUCOSE_LOG_FAILURE);
  })
  .done();

  return deferred.promise;
};

module.exports = {
  exec
};
