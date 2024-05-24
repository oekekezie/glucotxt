/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/30/2015
/********************************************************/
'use strict';

const actionTypes = {
  'get-help': /^[.\s]*(\?)*[.\s]*$/i,
  'access-log': /^[.\s]*(log)*[.\s]*$/i,
  'log-blood-glucose': /^[.\s]*([0-9]{2,4})[.\s]*(p|post)*[.\s]*$/i,
  'mark-postprandial': /^[.\s]*(post)[.\s]*$/i,
  // 'log-blood-pressure': /^[.\s]*([0-9]{2,3})\s*[\/]\s*([0-9]{2,3})[.\s]*$/i,
  'undo-update-log': /^[.\s]*(undo)*[.\s]*$/i,
  'stop-subscription': /^[.\s]*(stop)*[.\s]*$/i,
  'set-language': /^[.\s]*(eng|esp)*[.\s]*$/i
};
let getNumberOfExpectedParametersForActionType = (actionType) => {
  const regexp = actionTypes[actionType];
  return (new RegExp(`${regexp.toString()}|`)).exec('').length - 1;
};

const errorTypes = {
  DEFAULT_ERROR: 'DEFAULT_ERROR',
  NO_SUBSCRIPTION: 'NO_SUBSCRIPTION',
	UNSUPPORTED_ACTION: 'UNSUPPORTED_ACTION'
};

const eventTypes = {
  REQUESTED_ACCESS_LOG_TOKEN: 'REQUESTED_ACCESS_LOG_TOKEN',
	LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
  ACCESSED_BLOOD_GLUCOSE_LOG: 'ACCESSED_BLOOD_GLUCOSE_LOG'
};

const localizationTypes = {
  eng: 'eng',
  esp: 'esp'
};

const measurementTypes = {
	BloodGlucose: 'bloodGlucose'
};

const responseTypes = {
  INVITATION: 'INVITATION',
  SET_LANGUAGE_PREFERENCE_SUCCESS: 'SET_LANGUAGE_PREFERENCE_SUCCESS',
  SET_LANGUAGE_PREFERENCE_UNNECESSARY: 'SET_LANGUAGE_PREFERENCE_UNNECESSARY',
  HELP_INFORMATION: 'HELP_INFORMATION',
  UPDATE_BLOOD_GLUCOSE_LOG_SUCCESS: 'UPDATE_BLOOD_GLUCOSE_LOG_SUCCESS',
  UPDATE_AND_MARK_BLOOD_GLUCOSE_LOG_SUCCESS: 'UPDATE_AND_MARK_BLOOD_GLUCOSE_LOG_SUCCESS',
  UPDATE_BLOOD_GLUCOSE_LOG_FAILURE: 'UPDATE_BLOOD_GLUCOSE_LOG_FAILURE',
  MARK_POSTPRANDIAL_SUCCESS: 'MARK_POSTPRANDIAL_SUCCESS',
  MARK_POSTPRANDIAL_NONE: 'MARK_POSTPRANDIAL_NONE',
  MARK_POSTPRANDIAL_FAILURE: 'MARK_POSTPRANDIAL_FAILURE',
  UNDO_UPDATE_LOG_SUCCESS: 'UNDO_UPDATE_LOG_SUCCESS',
  UNDO_UPDATE_LOG_NONE: 'UNDO_UPDATE_LOG_NONE',
  UNDO_UPDATE_LOG_FAILURE: 'UNDO_UPDATE_LOG_FAILURE',
  ACCESS_TOKEN_SUCCESS: 'ACCESS_TOKEN_SUCCESS',
  ACCESS_TOKEN_FAILURE: 'ACCESS_TOKEN_FAILURE'
};

module.exports = {
  actionTypes,
  errorTypes,
  eventTypes,
  localizationTypes,
  measurementTypes,
  responseTypes,

  getNumberOfExpectedParametersForActionType
};
