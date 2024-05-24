/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/21/2016
/*******************************************************/

import Q from 'q';
import request from 'superagent';

import loadAPIEndpoints from './../helpers/api-endpoints';
import { STORAGE_TOKEN_KEY } from './../helpers/storage-keys';

class AccessLogManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getToken = this.getToken.bind(this);

    this._storeToken = this._storeToken.bind(this);
    this._isTokenValid = this._isTokenValid.bind(this);
  }

  _storeToken(token) {
    const { raw, ttl } = token;

    sessionStorage.setItem(STORAGE_TOKEN_KEY, JSON.stringify({
      raw,
      expirationDate: Date.now() + ttl
    }));
  }

  _isTokenValid(token) {
    if (token && Date.now() < token.expirationDate) {
      return true;
    } else {
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      return false;
    }
  }

  logout(token, phoneNumber) {
    const deferred = Q.defer();

    if (!token) {
      deferred.resolve(true);
      return deferred.promise;
    }

    request
    .get(this.apiEndpoints.logoutPatient)
    .set('authorization', `${phoneNumber} ${token}`)
    .end((error, response) => {
      if (error) {
        console.error(error.stack);
        deferred.reject(error);
      } else {
        deferred.resolve(true);
      }
    });

    return deferred.promise;
  }

  login(phoneNumber, rawToken) {
    const deferred = Q.defer();

    request
    .post(this.apiEndpoints.loginPatient)
    .set('content-type', 'application/json')
    .send({
      phoneNumber,
      rawToken
    })
    .end((error, response) => {
      if (error) {
        console.error(error.stack);
        deferred.reject(response.body.error || error);
      } else {
        const { token, patient } = response.body;
        this._storeToken(token);

        deferred.resolve(patient);
      }
    });

    return deferred.promise;
  }

  getToken() {
    const token = JSON.parse(sessionStorage.getItem(
      STORAGE_TOKEN_KEY
    ));

    if (this._isTokenValid(token)) {
      return token.raw;
    } else {
      return null;
    }
  }

}

const sharedInstance = new AccessLogManager();
export default sharedInstance;
