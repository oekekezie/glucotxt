/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/12/2016
/*******************************************************/
'use strict';

const Q = require('q');

const cacheManager = require('./cache-manager');
const applicationStateManager = require('./application-state-manager');
const { generateCacheKey } = require('./../helpers/cache-key');

class AccessLogManager {

  forgetAccessLogToken(phoneNumber) {
    const deferred = Q.defer();

    const key = generateCacheKey(phoneNumber);
    cacheManager.exists(key)
    .then((isCached) => {
      if (!isCached) {
        return Q.reject(new Error('Access log token does not exist.'));
      } else {
        return cacheManager.hgetall(key);
      }
    })
    .then((state) => {
      state.access = '';
      return cacheManager.hmset(key, state);
    })
    .then((result) => {
      deferred.resolve(result);
    })
    .catch((error) => {
      console.error(error);
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  validateAccessLogToken(phoneNumber, rawToken) {
    const deferred = Q.defer();

    const key = generateCacheKey(phoneNumber);
    cacheManager.exists(key)
    .then((isCached) => {
      if (!isCached) {
        return Q.reject(new Error('Access log token does not exist.'));
      } else {
        return cacheManager.hgetall(key);
      }
    })
    .then((state) => {
      applicationStateManager.fromSnapshot(state);
      deferred.resolve(
        applicationStateManager.isLogAccessAuthenticated(rawToken)
      );
    })
    .catch((error) => {
      console.error(error);
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

}

const sharedInstance = new AccessLogManager();
module.exports = sharedInstance;
