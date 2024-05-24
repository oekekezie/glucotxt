/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/20/2016
/********************************************************/

import Q from 'q';
import request from 'superagent';

import loadAPIEndpoints from './../helpers/api-endpoints';

import { STORAGE_PROVIDER_KEY } from './../helpers/storage-keys';

class ProviderManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();
  }

  setProvider(provider) {
    sessionStorage.setItem(STORAGE_PROVIDER_KEY, JSON.stringify(provider));
  }

  getProvider() {
    return JSON.parse(sessionStorage.getItem(STORAGE_PROVIDER_KEY));
  }

  invitePatient(token, invitation) {
    const deferred = Q.defer();

    console.log(JSON.stringify(invitation, null, 2));

    request
    .post(this.apiEndpoints.invitePatient)
    .set('authorization', `bearer ${token}`)
    .set('content-type', 'application/json')
    .send(JSON.stringify(invitation))
    .end((error, response) => {
      if (error) {
        console.error(error.stack);
        deferred.reject(response.body.error || error);
      } else {
        const { result } = response.body;

        console.log(JSON.stringify(response.body, null, 2));

        deferred.resolve(result);
      }
    });

    return deferred.promise;
  }

}

const sharedInstance = new ProviderManager();
export default sharedInstance;
