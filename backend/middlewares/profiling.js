/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/24/2016
/********************************************************/
'use strict';

const uuid = require('node-uuid');

const logger = require('./../helpers/logger');

class ProfilingMiddleware {

	generateProfilingAttributes(req, res, next) {
		req.uuid = uuid.v1();
		req.startTime = Date.now();
		return next();
	}

	logRequestProfilingSummary(req, res, next) {
		logger.info(`Profiling summary for request ${req.uuid}`, {
			requestDurationInMS: Date.now() - req.startTime,
			requestURL: req.originalUrl
		});
		if (typeof next === 'function') {
			next();
		}
	}

};

module.exports = (dependencies = {}) => {
	const middleware = new ProfilingMiddleware(dependencies);

	return({
		generateProfilingAttributes: middleware.generateProfilingAttributes,
		logRequestProfilingSummary: middleware.logRequestProfilingSummary
	});
};
