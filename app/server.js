/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
/*******************************************************/

// Require
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const webpack = require('webpack');

const logger = require('./helpers/logger');

// Configure
const app = express();

const __staticPath = path.resolve(__dirname, 'public');
const isDevelopment = (process.env.NODE_ENV !== 'production');
const defaultPort = 3000;

// Set default response headers
app.use(
  helmet.nocache(),
	helmet.frameguard('deny'),
	helmet.hidePoweredBy(),
	helmet.noSniff(),
  helmet.xssFilter(),
  helmet.hsts({
    maxAge: 7776000000, // 90 days in milliseconds
    includeSubDomains: true,
    force: true
  }),
  helmet.csp({
    directives: {
      default: [
        `'self'`
      ],
      connectSrc: [
        `'self'`,
        'https://app-2483.on-aptible.com',
        'https://glucotxt-api-development.herokuapp.com'
      ],
      scriptSrc: [
        `'self'`,
        'https://code.jquery.com',
        'https://maxcdn.bootstrapcdn.com'
      ],
      styleSrc: [
        // `'self'`,
        // FIXME
        `'unsafe-inline'`,
        'https://maxcdn.bootstrapcdn.com'
      ]
    }
  }),
	morgan('combined', {
		stream: logger.stream
	})
);

// Static content
app.use(express.static(__staticPath));

if (isDevelopment) {
  const config = require('./webpack.development.config');
  const compiler = webpack(config);

  app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: false, publicPath: config.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}

app.get('*', function (req, res) {
  const options = {
    root: __staticPath
  };

  if (req.path.match(/^(\/build\/bundle.js)$/)) {
    res.sendFile('build/bundle.js', options, function(error) {
      if (error) {
        logger.error(error);
        res.status(err.status).end();
      }
    });
    return;
  }

  res.sendFile('index.html', options, function(error) {
    if (error) {
      logger.error(error);
      res.status(err.status).end();
    }
  });
});

app.listen(process.env.PORT || defaultPort, function(error) {
  if (error) { logger.error(error); }
	logger.info('GlucoTxt App listening at port %s...', defaultPort);
});
