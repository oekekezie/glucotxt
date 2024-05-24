/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/19/2015
********************************************************/
'use strict';

require('babel-register');

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const logger = require('./helpers/logger');
const dbManager = require('./models/db-manager');
const cacheManager = require('./models/cache-manager');

dbManager.connect();
cacheManager.connect();

const app = express();
app.use(
	helmet.nocache(),
	helmet.frameguard('deny'),
	helmet.hidePoweredBy(),
	helmet.noSniff(),
	helmet.hsts({
    maxAge: 7776000000, // 90 days in milliseconds
    includeSubDomains: true,
		force: true
  }),
	bodyParser.json(),
	bodyParser.urlencoded({
		extended: true
	}),
	morgan('combined', {
		stream: logger.stream
	}),
	require('./routers')
);

const server = app.listen(process.env.PORT || 3000, () => {
	const host = process.env.NODE_ENV ? server.address().address : 'localhost';
	const port = server.address().port;

	logger.info('GlucoTxt listening at http://%s:%s', host, port);
});
