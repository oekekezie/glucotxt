/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/17/2016
/********************************************************/
'use strict';

const whitelist = [
  'http://localhost:3000',
  'https://glucotxt-development.herokuapp.com',
  'https://app-2484.on-aptible.com'
];

const corsOptions = {
  origin: (origin, cb) => {
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    cb(null, originIsWhitelisted);
  }
};

module.exports = {
  corsOptions
};
