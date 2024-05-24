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
  getAll,
  registerPhoneNumber,
  unregisterPhoneNumber
} = require('./../../middlewares/api/service-number')(dependencies);

const {
  isAuthenticated: isProviderAuthenticated
} = require('./../../middlewares/api/oauth')(dependencies);

const {
  requireContentType
} = require('./../../middlewares/api/security')(dependencies);

const router = express.Router();

router.get('/',
  isProviderAuthenticated(['admin']),
  getAll
);
router.post('/',
  requireContentType('application/json'),
  isProviderAuthenticated(['admin']),
  registerPhoneNumber
);
router.delete('/',
  requireContentType('application/json'),
  isProviderAuthenticated(['admin']),
  unregisterPhoneNumber
);

module.exports = router;
