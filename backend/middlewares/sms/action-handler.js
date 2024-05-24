/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/30/2015
/*******************************************************/
'use strict';

const logger = require('./../../helpers/logger');
const { loadActionModule } = require('./actions');
const {
  actionTypes,
  errorTypes,
  eventTypes,
  responseTypes
} = require('./../../helpers/types');
const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class ActionHandlerMiddleware {

  constructor({ applicationStateManager }) {
    this.applicationStateManager = applicationStateManager;

    this.actionHandler = this.actionHandler.bind(this);
  }

  actionHandler(req, res, next) {
    if (!this.applicationStateManager.isRequestAuthenticated(req)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    const action = this.applicationStateManager.getAction();
    if (!action) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference(),
        errorTypes.UNSUPPORTED_ACTION
      );
    }

    const exec = loadActionModule(action.type);
    if (!exec) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference(),
        errorTypes.UNSUPPORTED_ACTION
      );
    }

    exec(this.applicationStateManager)
    .then((message) => {
      const reference = this.applicationStateManager.getReference();
      if (typeof message === 'string') {
        res.Response = reference.lookUp(message);
        return message;
      } else if (typeof message === 'object'
      && message.hasOwnProperty('key')
      && message.hasOwnProperty('parameters')) {
        res.Response = reference.lookUp(message.key, message.parameters);
        return message.key;
      } else {
        throw new Error('Action did not return a valid response.');
      }
    })
    .then((responseType) => {
      // Log specific events
      switch (responseType) {
        case responseTypes.ACCESS_TOKEN_SUCCESS:
          this.applicationStateManager.models.Event.log({
            req,
            details: {
              type: eventTypes.REQUESTED_ACCESS_LOG_TOKEN,
              patient: String(this.applicationStateManager.getPatientID()),
              metadata: {
                result: true
              }
            }
          });
          break;
        default:
          return;
      }
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

}

module.exports = (dependencies = {}) => {
  const middleware = new ActionHandlerMiddleware(dependencies)

  return({
    actionHandler: middleware.actionHandler
  });
};
