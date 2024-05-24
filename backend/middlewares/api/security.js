/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/18/2016
/********************************************************/
'use strict';

const logger = require('./../../helpers/logger');

class SecurityMiddleware {

  requireContentType(type) {
    return(
      (req, res, next) => {
        if (req.is(type)) {
          return next();
        } else {
          const error = new Error(`Expected content type ${type} but
received ${req.get('content-type')}`);
          logger.error(error, {
            requestUUID: req.uuid
          });
          return res.status(400).end();
        }
      }
    );
  }

}

module.exports = (dependencies = {}) => {
  const middleware = new SecurityMiddleware(dependencies);

  return({
    requireContentType: middleware.requireContentType
  });
};
