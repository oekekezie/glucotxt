/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/31/2015
/*******************************************************/

const mongoose = require('mongoose');
const { isMongoId } = require('validator');

const Event = require('./schemas/event');
const Patient = require('./schemas/patient');
const BloodGlucose = require('./schemas/blood-glucose');
const ServiceNumber = require('./schemas/service-number');
const LocalizationReference = require('./../localizations');
const {
  generateLastMeasurementToken,
  parseLastMeasurementToken
} = require('./../helpers/last-measurement-token');
const {
  generateSMSAuthenticationToken,
  isSMSAuthenticationTokenValid
} = require('./../helpers/sms-auth-token');
const {
  generateAccessLogToken,
  isAccessLogTokenValid
} = require('./../helpers/access-log-token');
const {
  actionTypes,
  localizationTypes,
  measurementTypes,

  getNumberOfExpectedParametersForActionType
} = require('./../helpers/types');

class ApplicationStateManager {

  constructor() {
    this.state = {};
    this.reference = LocalizationReference();
    this.models = {
      Event,
      Patient,
      BloodGlucose,
      ServiceNumber
    };

    this.setAccessLogToken = this.setAccessLogToken.bind(this);
    this.setAction = this.setAction.bind(this);
    this.setAuthToken = this.setAuthToken.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setLastMeasurement = this.setLastMeasurement.bind(this);
    this.setPatientID = this.setPatientID.bind(this);
    this.setTimestamp = this.setTimestamp.bind(this);

    this.getAction = this.getAction.bind(this);
    this.getLanguage = this.getLanguage.bind(this);
    this.getLastMeasurement = this.getLastMeasurement.bind(this);
    this.getReference = this.getReference.bind(this);
    this.getPatientID = this.getPatientID.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getTimestamp = this.getTimestamp.bind(this);

    this.isLogAccessAuthenticated = this.isLogAccessAuthenticated.bind(this);
    this.isRequestAuthenticated = this.isRequestAuthenticated.bind(this);
    this.fromSnapshot = this.fromSnapshot.bind(this);
    this.loadReference = this.loadReference.bind(this);
  }

  // Setters
  setAccessLogToken() {
    const token = generateAccessLogToken();
    if (token) {
      this.state.access = token.hashedTokenAndTimestamp;
      return token.rawToken;
    }

    return false;
  }

  setAction({ type, parameters }) {
    if ((type in actionTypes)
    && parameters.length === getNumberOfExpectedParametersForActionType(type)) {
      this.state.action = {
        type,
        parameters
      };
      return true;
    }

    return false;
  }

  setAuthToken(req) {
    const token = generateSMSAuthenticationToken(req);
    if (token) {
      this.state.auth = token.hashedTokenAndTimestamp;
      return true;
    }

    return false;
  }

  setLanguage(language) {
    if (language in localizationTypes) {
      this.state.language = language;
      return this.loadReference();
    }

    return false;
  }

  setLastMeasurement(measurement) {
    const token = generateLastMeasurementToken(measurement);
    if (token) {
      this.state.last = token;
      return true;
    }

    return false;
  }

  setPatientID(patientID) {
    if (isMongoId(String(patientID))) {
      this.state.patientID = patientID;
      return true;
    }

    return false;
  }

  setTimestamp(timestamp) {
    if (timestamp instanceof Date) {
      this.state.timestamp = timestamp;
    } else {
      this.state.timestamp = new Date();
    }
  }

  // Getters
  getAction() {
    const { action: { type, parameters } } = this.state;

    if ((type in actionTypes)
    && parameters.length === getNumberOfExpectedParametersForActionType(type)) {
      return {
        type,
        parameters
      };
    }

    return null;
  }

  getLanguage() {
    const { language } = this.state;

    if ((language in localizationTypes)) {
      return language;
    }

    return null;
  }

  getLastMeasurement() {
    const { last } = this.state;

    if (last) {
      return parseLastMeasurementToken(last);
    }

    return null;
  }

  getPatientID() {
    const { patientID } = this.state;

    if (isMongoId(String(patientID))) {
      return new mongoose.Types.ObjectId(patientID);
    }

    return null;
  }

  getReference() {
    return this.reference || LocalizationReference();
  }

  getSnapshot() {
    const {
      access = '',
      auth = '',
      language = '',
      last = '',
      patientID = ''
    } = this.state;

    return({
      access,
      auth,
      language,
      last,
      patientID
    });
  }

  getTimestamp() {
    const { timestamp } = this.state;

    if (timestamp instanceof Date) {
      return timestamp;
    }

    return null;
  }

  // Utility
  isLogAccessAuthenticated(rawToken) {
    const { access: cachedToken } = this.state;

    return isAccessLogTokenValid(rawToken, cachedToken);
  }

  isRequestAuthenticated(req) {
    const { auth } = this.state;

    return isSMSAuthenticationTokenValid(req, auth);
  }

  fromSnapshot(snapshot, overwrite = false) {
    if (overwrite) {
      this.state = snapshot;
    } else {
      this.state = Object.assign({}, this.state, snapshot);
    }
    this.loadReference();
  }

  loadReference() {
    const { language } = this.state;

    if ((language in localizationTypes)) {
      this.reference = LocalizationReference(language);
      return true;
    }

    return false;
  }

}

const sharedInstance = new ApplicationStateManager();
module.exports = sharedInstance;
