/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/29/2016
/********************************************************/

import Q from 'q';
import request from 'superagent';
import { isMobilePhone } from 'validator';

import loadAPIEndpoints from './../helpers/api-endpoints';

class HistoryManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();
  }

  getEventsHistory({
    phoneNumber,
    token,
    startDate,
    endDate
  }) {
    const deferred = Q.defer();

    const auth = phoneNumber && isMobilePhone(phoneNumber, 'en-US')
      ? `${phoneNumber} ${token}` : `bearer ${token}`;
    request
    .get(this.apiEndpoints.getEventsHistory)
    .set('authorization', auth)
    .query({
      startDate,
      endDate
    })
    .end((error, response) => {
      if (error) {
        deferred.reject(response.body.error || error);
      } else {
        const { results } = response.body;

        deferred.resolve(results);
      }
    });

    return deferred.promise;
  }

}

const sharedInstance = new HistoryManager();
export default sharedInstance;
