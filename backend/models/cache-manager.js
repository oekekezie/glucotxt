/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/17/2015
/*******************************************************/
'use strict';

const Q = require('q');
const redis = require('redis');

const logger = require('./../helpers/logger');

class CacheManager {

	constructor() {
		this.client = {};
		this.connect = this.connect.bind(this);
	}

	connect(onSuccess, onError) {
		const deferred = Q.defer();

		if (this.client.connected) {
			if (typeof onSuccess === 'function') {
				onSuccess();
			}
			deferred.resolve(true);
			return deferred.promise;
		}

		this.client = redis.createClient(process.env.REDIS_URL);

		this.client.on('ready', () => {
			if (typeof onSuccess === 'function') {
				onSuccess();
			}
			deferred.resolve(true);
			logger.info('Connected to Redis.');
		});

		this.client.on('error', (error) => {
			if (typeof onError === 'function') {
				onError();
			}
			deferred.reject(error);
			logger.error(
				`Error connecting to Redis (${process.env.REDIS_URL}):  + ${error}`
			);
		});

		return deferred.promise;
	}

	exists(key) {
		const deferred = Q.defer();

	  this.client.exists(key, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(res === 1 ? true : false);
	    }
	  });

	  return deferred.promise;
	};

	expire(key, ttl) {
		const deferred = Q.defer();

	  this.client.expire(key, ttl, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(res === 1 ? true : false);
	    }
	  });

	  return deferred.promise;
	};

	del(key) {
		const deferred = Q.defer();

	  this.client.del(key, (err, count) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(count);
	    }
	  });

	  return deferred.promise;
	}

	hexists(key, field) {
		const deferred = Q.defer();

	  this.client.hexists(key, field, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(res === 1 ? true : false);
	    }
	  });

	  return deferred.promise;
	};

	hdel(key, field) {
		const deferred = Q.defer();

	  this.client.hdel(key, field, (err, count) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(count);
	    }
	  });

	  return deferred.promise;
	}

	hmset(key, obj) {
		const deferred = Q.defer();

	  this.client.hmset(key, obj, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
	      deferred.resolve(true);
	    }
	  });

	  return deferred.promise;
	};

	hmsetEx(key, obj, ttl) {
		const deferred = Q.defer();

	  this.client.hmset(key, obj, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
			  this.client.expire(key, ttl, (err, res) => {
			    if (err) {
			      deferred.reject(err);
			    } else {
			      deferred.resolve(res === 1 ? true : false);
			    }
			  });
	    }
	  });

	  return deferred.promise;
	};

	hgetall(key) {
		const deferred = Q.defer();

	  this.client.hgetall(key, (err, res) => {
	    if (err) {
	      deferred.reject(err);
	    } else {
				res === {} ? null : res;
	      deferred.resolve(res);
	    }
	  });

	  return deferred.promise;
	};

};

// Exports
const sharedInstance = new CacheManager();
module.exports = sharedInstance;
