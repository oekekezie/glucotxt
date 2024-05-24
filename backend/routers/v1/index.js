/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/06/2015
/*******************************************************/

const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));

router.use('/history', require('./history'));

router.use('/patients', require('./patients'));

router.use('/provider', require('./provider'));

router.use('/service-numbers', require('./service-numbers'));

router.use('/subscriptions', require('./subscriptions'));

module.exports = router;
