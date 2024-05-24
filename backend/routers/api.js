/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/31/2015
/*******************************************************/

const express = require('express');
const cors = require('cors');

const router = express.Router();

const { corsOptions } = require('./../helpers/cors');

router.options('*', cors(corsOptions));
router.use('/v1', cors(corsOptions), require('./v1'));

module.exports = router;
