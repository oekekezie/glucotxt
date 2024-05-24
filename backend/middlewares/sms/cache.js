/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/*******************************************************/
'use strict';

const APPLICATION_STATE_TTL = 180 * 60; // in seconds

const logger = require('./../../helpers/logger');
const { errorTypes } = require('./../../helpers/types');
const { generateCacheKey } = require('./../../helpers/cache-key');
const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class CacheMiddleware {

  constructor({ applicationStateManager, cacheManager }) {
    this.applicationStateManager = applicationStateManager;
    this.cacheManager = cacheManager;

    this.getApplicationState = this.getApplicationState.bind(this);
    this.setApplicationState = this.setApplicationState.bind(this);
  }

  getApplicationState(req, res, next) {
    const { body: { From } } = req;
    const key = generateCacheKey(From);

    if (!key) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    this.cacheManager.exists(key)
    .then((isCached) => {
      if (isCached) {
        return(this.cacheManager.hgetall(key));
      } else {
        return({});
      }
    })
    .then((state) => {
      this.applicationStateManager.fromSnapshot(state);
    })
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    })
    .done(() => {
      if (!res.headersSent) {
        next();
      }
    });
  }

  setApplicationState(req, res, next) {
    const { body: { From } } = req;
    const key = generateCacheKey(From);

    if (!key) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    if (!this.applicationStateManager.isRequestAuthenticated(req)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference(),
        errorTypes.NO_SUBSCRIPTION
      );
    }

    const snapshot = this.applicationStateManager.getSnapshot();
    this.cacheManager.hmsetEx(key, snapshot, APPLICATION_STATE_TTL)
    .catch((error) => {
      logger.error(error, {
        requestUUID: req.uuid
      });
      sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    })
    .done(() => {
      if (!res.headersSent) {
        next();
      }
    });
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new CacheMiddleware(dependencies);

  return({
    getApplicationState: middleware.getApplicationState,
    setApplicationState: middleware.setApplicationState
  });
};
