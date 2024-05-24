/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/20/2015
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
    'Invalid parameters for undo update log action.'
  );

  const { type, parameters } = applicationStateManager.getAction();
  const Patient = applicationStateManager.models.Patient;
  const lastMeasurement = applicationStateManager.getLastMeasurement();

  if (type !== 'undo-update-log'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)) {
    deferred.reject(invalidActionError);
    return deferred.promise;
  }

  if (!lastMeasurement) {
    deferred.resolve(responseTypes.UNDO_UPDATE_LOG_NONE);
    return deferred.promise;
  }

  const { measurementID, measurementType } = lastMeasurement;
  Patient.removeMeasurement(measurementID, measurementType)
  .then((result) => {
    if (!result) {
      deferred.resolve(responseTypes.UNDO_UPDATE_LOG_NONE);
    } else {
      deferred.resolve(responseTypes.UNDO_UPDATE_LOG_SUCCESS);
    }
  })
  .catch((error) => {
    logger.error(error);
		deferred.resolve(responseTypes.UNDO_UPDATE_LOG_FAILURE);
  })
  .done();

  return deferred.promise;
};

module.exports = {
  exec
};
