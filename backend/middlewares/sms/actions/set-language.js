/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/1/2015
/*******************************************************/

const Q = require('q');

const logger = require('./../../../helpers/logger');
const {
  errorTypes,
  responseTypes,
  localizationTypes,

  getNumberOfExpectedParametersForActionType
} = require('./../../../helpers/types');

let exec = (applicationStateManager) => {
  const deferred = Q.defer();

  const { type, parameters } = applicationStateManager.getAction();
  if (type !== 'set-language'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)
  || !(parameters[0] in localizationTypes)) {
    deferred.reject(new Error('Incorrect parameters for set language action.'));
    return deferred.promise;
  }

  if (applicationStateManager.getLanguage() === parameters[0]) {
    deferred.resolve(
      responseTypes.SET_LANGUAGE_PREFERENCE_UNNECESSARY
    );
    return deferred.promise;
  }

  const Patient = applicationStateManager.models.Patient;
  Patient.findByIdAndUpdate(applicationStateManager.getPatientID(), {
    'preferences.language': parameters[0]
  })
  .then((result) => {
    if (result && applicationStateManager.setLanguage(parameters[0])) {
      deferred.resolve(responseTypes.SET_LANGUAGE_PREFERENCE_SUCCESS);
    } else {
      deferred.resolve(errorTypes.DEFAULT_ERROR);
    }
  })
  .catch((error) => {
    logger.error(error);
    deferred.resolve(errorTypes.DEFAULT_ERROR);
  })
  .done();

  return deferred.promise;
};

module.exports = {
  exec
};
