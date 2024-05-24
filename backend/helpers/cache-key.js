/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/3/2016
********************************************************/

const CACHE_KEY_PREFIX = 'app:';
const { isMobilePhone } = require('validator');

let generateCacheKey = (phoneNumber) => {
  if (isMobilePhone(phoneNumber, 'en-US')) {
    return `${CACHE_KEY_PREFIX}:${phoneNumber}`;
  }

  return null;
}

module.exports = {
  generateCacheKey
};
