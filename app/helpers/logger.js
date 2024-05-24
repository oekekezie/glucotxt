/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/23/2016
/*******************************************************/
'use strict';

const winston = require('winston');

const transportLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			level: 'debug'
		})
	]
});

// For streaming morgan to winston
logger.stream.write = (message, encoding) => {
	logger.info(message);
};

module.exports = logger;
