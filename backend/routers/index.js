/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/31/2015
/*******************************************************/
'use strict';

const express = require('express');

const {
	generateProfilingAttributes,
	logRequestProfilingSummary
} = require('./../middlewares/profiling')();

const router = express.Router();

router.use(generateProfilingAttributes);
router.use('/api', require('./api'), logRequestProfilingSummary);
router.use('/sms', require('./handle-sms'), logRequestProfilingSummary);

router.get('/', (req, res) => {
	res.send('GlucoTxt is online...');
});

module.exports = router;
