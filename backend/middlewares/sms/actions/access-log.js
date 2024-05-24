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
    'Invalid parameters for access log action.'
  );

  const { type, parameters } = applicationStateManager.getAction();
  if (type !== 'access-log'
  || parameters.length !== getNumberOfExpectedParametersForActionType(type)) {
    deferred.reject(invalidActionError);
    return deferred.promise;
  }

  const rawToken = applicationStateManager.setAccessLogToken();
  if (typeof rawToken === 'string') {
    deferred.resolve({
      key: responseTypes.ACCESS_TOKEN_SUCCESS,
      parameters: rawToken
    });
  } else {
    logger.error('Failed to generate new access log token.');
    deferred.resolve(responseTypes.ACCESS_TOKEN_FAILURE);
  }

  return deferred.promise;
};

module.exports = {
  exec
};
