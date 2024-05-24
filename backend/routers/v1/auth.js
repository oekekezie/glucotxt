/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/10/2016
/*******************************************************/

const express = require('express');

const dependencies = {
  Event: require('./../../models/schemas/event')
};

const {
  login: loginPatient,
  logout: logoutPatient
} = require('./../../middlewares/api/access-log')(dependencies);

const {
  login: loginProvider,
  logout: logoutProvider
} = require('./../../middlewares/api/oauth')(dependencies);

const {
  requireContentType
} = require('./../../middlewares/api/security')(dependencies);

const router = express.Router();

// Patient i.e. Access Log
router.post('/access-log/login/',
  requireContentType('application/json'),
  loginPatient
);
router.get('/access-log/logout/',
  logoutPatient
);

// Provider i.e. OAuth
router.post('/oauth/login/',
  requireContentType('application/json'),
  loginProvider
);
router.get('/oauth/logout/',
  logoutProvider
);

module.exports = router;
