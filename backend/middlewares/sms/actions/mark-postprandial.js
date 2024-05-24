/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/9/2015
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
    'Invalid parameters for mark postprandial action.'
  );

  const { type, parameters } = applicationStateManager.getAction();
  const BloodGlucose = applicationStateManager.models.BloodGlucose;
  const lastMeasurement = applicationStateManager.getLastMeasurement();

  if (type !== 'mark-postprandial'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)) {
    deferred.reject(invalidActionError);
    return deferred.promise;
  }

  if (!lastMeasurement) {
    deferred.resolve(responseTypes.MARK_POSTPRANDIAL_NONE);
    return deferred.promise;
  }

  const { measurementID } = lastMeasurement;
  BloodGlucose.markAsPostprandial(measurementID)
  .then((result) => {
    if (!result) {
      deferred.resolve(responseTypes.MARK_POSTPRANDIAL_NONE);
    } else {
      deferred.resolve(responseTypes.MARK_POSTPRANDIAL_SUCCESS);
    }
  })
  .catch((error) => {
    logger.error(error);
    deferred.resolve(responseTypes.MARK_POSTPRANDIAL_FAILURE);
  })
  .done();

  return deferred.promise;
};

module.exports = {
  exec
};
