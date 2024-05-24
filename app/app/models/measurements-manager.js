/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/30/2016
/********************************************************/

import Q from 'q';
import request from 'superagent';
import { isMobilePhone } from 'validator';

import loadAPIEndpoints from './../helpers/api-endpoints';

class MeasurementsManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();
  }

  getBloodGlucoseMeasurements({
    token,
    phoneNumber,
    patientID,
    startDate,
    endDate
  }) {
    const deferred = Q.defer();

    const auth = phoneNumber && isMobilePhone(phoneNumber, 'en-US')
      ? `${phoneNumber} ${token}` : `bearer ${token}`;
    request
    .get(this.apiEndpoints.getBloodGlucoseMeasurements)
    .set('authorization', auth)
    .query({
      patientID,
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

const sharedInstance = new MeasurementsManager();
export default sharedInstance;
