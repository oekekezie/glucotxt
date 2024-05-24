/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/********************************************************/
'use strict';

class TimestampMiddleware {

	constructor({ applicationStateManager }) {
		this.applicationStateManager = applicationStateManager;

		this.timestamp = this.timestamp.bind(this);
	}

	timestamp(req, res, next) {
		this.applicationStateManager.setTimestamp();
		return next();
	}

};

module.exports = (dependencies = {}) => {
	const middleware = new TimestampMiddleware(dependencies);

	return({
		timestamp: middleware.timestamp
	});
};
