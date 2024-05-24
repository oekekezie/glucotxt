/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/29/2015
/*******************************************************/
'use strict';

const { actionTypes, errorTypes } = require('./../../helpers/types');
const { sendErrorResponseMessage } = require('./../../helpers/error-response');

class ActionParserMiddleware {

  constructor({ applicationStateManager }) {
    this.applicationStateManager = applicationStateManager;

    this._parse = this._parse.bind(this);
    this.actionParser = this.actionParser.bind(this);
  }

  _parse(raw, actionTypes) {
    let action = null;

    if (typeof raw !== 'string' || !actionTypes) {
      return null;
    }
    raw = raw.toLowerCase().trim();

    for (let actionType in actionTypes) {
      if (actionTypes.hasOwnProperty(actionType)) {
        const regexp = actionTypes[actionType];
        const actionParameters = regexp.exec(raw);

        if (regexp.test(raw)) {
          action = {
            type: actionType,
            parameters: actionParameters && actionParameters.slice(1)
          };

          break;
        }
      }
    }

    return action;
  }

  actionParser(req, res, next) {
    const { ApplicationState, body: { Body } } = req;

    if (typeof Body !== 'string'
    || !this.applicationStateManager.isRequestAuthenticated(req)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference()
      );
    }

    const action = this._parse(Body, actionTypes);
    if (!action || !this.applicationStateManager.setAction(action)) {
      return sendErrorResponseMessage(
        req,
        res,
        this.applicationStateManager.getReference(),
        errorTypes.UNSUPPORTED_ACTION
      );
    }

    if (!res.headersSent) {
      next();
    }
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new ActionParserMiddleware(dependencies)

  return({
    actionParser: middleware.actionParser
  });
};
