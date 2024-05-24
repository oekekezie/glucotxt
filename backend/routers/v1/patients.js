/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/06/2015
/*******************************************************/
'use strict';

const express = require('express');

const dependencies = {
  Event: require('./../../models/schemas/event')
};

const {
  getPatientsByGroup
} = require('./../../middlewares/api/patients')(dependencies);

const {
  getBloodGlucoseMeasurements
} = require('./../../middlewares/api/measurements')(dependencies);

const {
  isAuthenticated: isPatientAuthenticated
} = require('./../../middlewares/api/access-log')(dependencies);

const {
  isAuthenticated: isProviderAuthenticated
} = require('./../../middlewares/api/oauth')(dependencies);

const router = express.Router();

router.get('/groups/', isProviderAuthenticated(), getPatientsByGroup);

router.get('/measurements/blood-glucose/',
  // Authenticate either patient or provider
  (req, res, next) => {
    if (typeof req.get('authorization') === 'string'
    && req.get('authorization').startsWith('bearer ')) {
      isProviderAuthenticated()(req, res, next);
    } else {
      isPatientAuthenticated(req, res, next);
    }
  },
  getBloodGlucoseMeasurements
);

module.exports = router;
