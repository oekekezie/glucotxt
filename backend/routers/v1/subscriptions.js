/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/15/2016
/*******************************************************/
'use strict';

const express = require('express');

const dependencies = {
  Event: require('./../../models/schemas/event')
};

const {
  subscribePatient,
  unsubscribePatient
} = require('./../../middlewares/api/subscribe')(dependencies);

const {
  isAuthenticated: isProviderAuthenticated
} = require('./../../middlewares/api/oauth')(dependencies);

const {
  requireContentType
} = require('./../../middlewares/api/security')(dependencies);

const router = express.Router();

router.post('/', isProviderAuthenticated(),
  requireContentType('application/json'),
  subscribePatient
);
router.delete('/',
  requireContentType('application/json'),
  isProviderAuthenticated(),
  unsubscribePatient
);

module.exports = router;
