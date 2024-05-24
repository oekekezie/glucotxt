/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/17/2015
/*******************************************************/
'use strict';

const MONGO_LOCAL = '127.0.0.1:27017';

const Q = require('q');
const mongoose = require('mongoose');

const logger = require('./../helpers/logger');

class DatabaseManager {

	constructor() {
		this.mongoose = {};
		this.connect = this.connect.bind(this);
	}

	connect(onSuccess, onError) {
		const deferred = Q.defer();

		if (this.mongoose.readyState === 1) {
			if (typeof onSuccess === 'function') {
				onSuccess();
			}
			deferred.resolve(true);
			return deferred.promise;
		}

		this.mongoose = require('mongoose');
		this.mongoose.Promise = Q.Promise;

		this.mongoose.connect(
			process.env.MONGOLAB_URI || process.env.MONGODB_URL || MONGO_LOCAL,
			(error) => {
				if (error) {
					if (typeof onError === 'function') {
						onError();
					}
					deferred.reject(error);
			    logger.error(`Error while connecting to MongoDB: ${error.errmsg}`);
			  } else {
					if (typeof onSuccess === 'function') {
						onSuccess();
					}
					deferred.resolve(true);
					logger.info('Connected to MongoDB.');
				}
			}
		);

		return deferred.promise;
	}

};

const sharedInstance = new DatabaseManager();
module.exports = sharedInstance;
