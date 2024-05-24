/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/1/2016
/********************************************************/
'use strict';

let loadActionModule = (actionType) => {
  const modulePath = `./${actionType}`;
  const { exec } = require(modulePath);
	return exec || null;
};

module.exports = {
  loadActionModule
};
