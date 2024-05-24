/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/30/2015
/*******************************************************/
'use strict';

const express = require('express');
const twilio = require('twilio');

const router = express.Router();
const client = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const logger = require('./../helpers/logger');
const dependencies = {
	applicationStateManager: require('./../models/application-state-manager'),
	cacheManager: require('./../models/cache-manager')
};

const {
	acceptRequestsOnlyFromTwilio
} = require('./../middlewares/sms/validate-twilio-request')();
const {
	timestamp
} = require('./../middlewares/sms/timestamp')(dependencies);
const {
	getApplicationState,
	setApplicationState
} = require('./../middlewares/sms/cache')(dependencies);
const {
	authenticate
} = require('./../middlewares/sms/authentication')(dependencies);
const {
	getPatient
} = require('./../middlewares/sms/get-patient')(dependencies);
const {
	actionParser
} = require('./../middlewares/sms/action-parser')(dependencies);
const {
	actionHandler
} = require('./../middlewares/sms/action-handler')(dependencies);
const {
	responseHandler
} = require('./../middlewares/sms/response-handler')(dependencies);


router.post('/',
	acceptRequestsOnlyFromTwilio,
	timestamp,
	getApplicationState,
	authenticate,
	getPatient,
	actionParser,
	actionHandler,
	setApplicationState,
	responseHandler
);

router.post('/status', (req, res, next) => {
	logger.info('Received status callback from Twilio.');
	next();
});

module.exports = router;
