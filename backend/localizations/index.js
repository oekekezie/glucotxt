/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/2/2015
/*******************************************************/
'use strict';

const { localizationTypes } = require('./../helpers/types');

class LocalizationReference {

  constructor() {
    this.reference = require('./eng');
    this.lookUp = this.lookUp.bind(this);
  }

  lookUp(key = '', ...params) {
    key = key.toLowerCase();
    key = key.replace(/_/g, '');

    if (!params.length) {
      // Key should return a value
      return this.reference[key] || this.reference['errordefault'];
    } else {
      // Key returns a function, use params to evaluate and return a value
      return this.reference[key](params) || this.reference['errordefault'];
    }
  }

}

const sharedInstance = new LocalizationReference();
module.exports = (preference) => {
  if (!(preference in localizationTypes)) preference = 'eng';

  if (preference
  && sharedInstance.reference
  && sharedInstance.reference.localizationType !== preference) {
    sharedInstance.reference = require(`./${preference.toLowerCase()}`);
  }

  return sharedInstance;
};
