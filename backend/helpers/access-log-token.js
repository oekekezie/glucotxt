/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/20/2015
********************************************************/

const ACCESS_LOG_TOKEN_TTL = 30 * 60 * 1000; // in milliseconds
const ACCESS_LOG_TOKEN_LENGTH = 8;
const ACCESS_LOG_TOKEN_SALT = process.env.ACCESS_LOG_TOKEN_SALT
  || 'nr3P52kHDYFDdllyPFSG';

const crypto = require('crypto');
const randToken = require('rand-token').generator({
  chars: ''
});

let generateAccessLogToken = () => {
  const raw = randToken.generate(ACCESS_LOG_TOKEN_LENGTH).toLowerCase();
  const sha256 = crypto.createHash('sha256');
  sha256.update(`${ACCESS_LOG_TOKEN_SALT}${raw}`, 'utf8');

  return({
    rawToken: raw,
    hashedTokenAndTimestamp: `${sha256.digest('base64')}:${Date.now()}`
  });
};

// Returns time to live is valid
let isAccessLogTokenValid = (raw, cachedToken) => {
  if (typeof raw !== 'string'
  || typeof cachedToken !== 'string'
  || cachedToken.split(':').length !== 2) {
    return 0;
  }

  const hashed = cachedToken.split(':')[0];
  const timestamp = Number(cachedToken.split(':')[1])
    || Number.MIN_SAFE_INTEGER;
  const ttl = ACCESS_LOG_TOKEN_TTL - (Date.now() - timestamp);

  if (ttl <= 0)
    return 0;

  const sha256 = crypto.createHash('sha256');
  sha256.update(`${ACCESS_LOG_TOKEN_SALT}${raw}`, 'utf8');

  return hashed === sha256.digest('base64') ? ttl : 0;
};

module.exports = {
  generateAccessLogToken,
  isAccessLogTokenValid,
  accessLogTokenConstants: {
    ACCESS_LOG_TOKEN_TTL
  }
};
