/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/9/2015
/*******************************************************/

const Q = require('q');

const {
  responseTypes,

  getNumberOfExpectedParametersForActionType
} = require('./../../../helpers/types');

let exec = (applicationStateManager) => {
  const deferred = Q.defer();
  const invalidActionError = new Error(
    'Invalid parameters for help information action.'
  );

  const { type, parameters } = applicationStateManager.getAction();
  if (type !== 'get-help'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)) {
    deferred.reject(invalidActionError);
    return deferred.promise;
  }

  deferred.resolve(responseTypes.HELP_INFORMATION);
  return deferred.promise;
};

module.exports = {
  exec
};
