/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/28/2016
/********************************************************/

import Q from 'q';
import moment from 'moment';
import request from 'superagent';

import loadAPIEndpoints from './../helpers/api-endpoints';
import { STORAGE_PATIENT_LIST_KEY } from './../helpers/storage-keys';

class PatientListManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();
  }

  _cachePatientInfo(results) {
    results.forEach((result) => {
      const { cacheKey, id, firstName, lastName } = result;

      sessionStorage.setItem(`${STORAGE_PATIENT_LIST_KEY}:${cacheKey}`,
        JSON.stringify({
          id,
          firstName,
          lastName
        })
      );
    });
  }

  _processResults(results) {
    return(
      results.map((result) => {
        const assignment = result.assignment;
        const statistics = result.statistics;

        // Cache key - 16 random characters
        result.cacheKey = (Math.random().toString(36)+'00000000000000000')
          .slice(2, 18);

        // Birthdate
        result.birthdate = moment.utc(result.birthdate).format('M/D/YYYY');

        // Target
        result.target = assignment.schedule.length;

        // Adherence
        const startDate = moment(new Date(assignment.startDate));
        const currentDate = moment();
        const duration = Math.ceil(currentDate.diff(startDate, 'days', true));
        const expected = result.target * duration;
        const actual = statistics.bloodGlucose.count;

        result.adherence = actual / expected;

        // Last Measurement
        const lastUpdated = statistics.bloodGlucose.lastUpdated || null;
        result.lastMeasurement = lastUpdated ? new Date(lastUpdated) : null;

        // Cleanup
        delete result.assignment;
        delete result.statistics;

        return result;
      })
    );
  }

  _cleanupCachedPatientInfo() {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PATIENT_LIST_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  getPatientInfo(suffix) {
    return JSON.parse(
      sessionStorage.getItem(`${STORAGE_PATIENT_LIST_KEY}:${suffix}`)
    );
  }

  getPatientsByGroup(token) {
    const deferred = Q.defer();

    request
    .get(this.apiEndpoints.getPatientsByGroup)
    .set('authorization', `bearer ${token}`)
    .end((error, response) => {
      if (error) {
        console.error(error.stack);
        deferred.reject(response.body.error || error);
      } else {
        let { results } = response.body;
        results = this._processResults(results);
        this._cleanupCachedPatientInfo();
        this._cachePatientInfo(results);
        deferred.resolve(results);
      }
    });

    return deferred.promise;
  }

}

const sharedInstance = new PatientListManager();
export default sharedInstance;
