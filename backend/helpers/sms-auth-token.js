/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/31/2015
********************************************************/

const SMS_AUTH_TOKEN_TTL = 60 * 1000; // in milliseconds
const SMS_AUTH_TOKEN_SALT = process.env.SMS_AUTH_TOKEN_SALT
  || 'auYPWLHITCnIn5oQdSx9';

const crypto = require('crypto');
const mongoose = require('mongoose');
const { isMobilePhone } = require('validator');

let generateSMSAuthenticationToken = (req) => {
  const { body: { From, To } } = req;

  if (!isMobilePhone(From, 'en-US')
  || !isMobilePhone(To, 'en-US')) {
    return null;
  }

  const raw = `${From}-${To}`;
  const sha256 = crypto.createHash('sha256');
  sha256.update(`${SMS_AUTH_TOKEN_SALT}${raw}`, 'utf8');

  const hashedToken = sha256.digest('base64');
  const timestamp = Date.now();

  return({
    hashedToken,
    hashedTokenAndTimestamp: `${hashedToken}:${timestamp}`
  });
}

let isSMSAuthenticationTokenValid = (req, cachedToken) => {
  if (typeof cachedToken !== 'string' || cachedToken.split(':').length !== 2) {
    return false;
  }

  const hashedToken = cachedToken.split(':')[0];
  const timestamp = Number(cachedToken.split(':')[1])
    || Number.MIN_SAFE_INTEGER;

  if (Date.now() - timestamp <= SMS_AUTH_TOKEN_TTL
  && hashedToken === generateSMSAuthenticationToken(req).hashedToken) {
    return true;
  }

  return false;
}

module.exports = {
  generateSMSAuthenticationToken,
  isSMSAuthenticationTokenValid,
  smsAuthTokenConstants: {
    SMS_AUTH_TOKEN_TTL
  }
};
