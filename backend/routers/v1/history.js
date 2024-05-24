/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/28/2016
/*******************************************************/
'use strict';

const express = require('express');

const dependencies = {
  Event: require('./../../models/schemas/event')
};

const {
  getEventsHistory
} = require('./../../middlewares/api/history')(dependencies);

const {
  isAuthenticated: isPatientAuthenticated
} = require('./../../middlewares/api/access-log')(dependencies);

const {
  isAuthenticated: isProviderAuthenticated
} = require('./../../middlewares/api/oauth')(dependencies);

const router = express.Router();

router.get('/events',
  // Authenticate either patient or provider
  (req, res, next) => {
    if (typeof req.get('authorization') === 'string'
    && req.get('authorization').startsWith('bearer ')) {
      isProviderAuthenticated()(req, res, next);
    } else {
      isPatientAuthenticated(req, res, next);
    }
  },
  getEventsHistory
);

module.exports = router;
