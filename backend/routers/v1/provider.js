/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/10/2016
/*******************************************************/
'use strict';

const express = require('express');

const dependencies = {
  Event: require('./../../models/schemas/event')
};

const {
  isAuthenticated: isProviderAuthenticated
} = require('./../../middlewares/api/oauth')(dependencies);

const {
  createProvider,
  removeProvider
} = require('./../../middlewares/api/provider')(dependencies);

const {
  requireContentType
} = require('./../../middlewares/api/security')(dependencies);

const router = express.Router();

router.post('/',
  requireContentType('application/json'),
  isProviderAuthenticated(['admin']),
  createProvider
);

router.delete('/',
  requireContentType('application/json'),
  isProviderAuthenticated(['admin']),
  removeProvider
);

module.exports = router;
