/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/20/2016
/********************************************************/

import Q from 'q';
import request from 'superagent';

import loadAPIEndpoints from './../helpers/api-endpoints';
import { STORAGE_OAUTH_KEY } from './../helpers/storage-keys';

class OAuthManager {

  constructor() {
    this.apiEndpoints = loadAPIEndpoints();

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getToken = this.getToken.bind(this);

    this._storeToken = this._storeToken.bind(this);
    this._isTokenValid = this._isTokenValid.bind(this);
  }

  _storeToken(token) {
    const { jwt, ttl } = token;

    sessionStorage.setItem(STORAGE_OAUTH_KEY, JSON.stringify({
      jwt,
      expirationDate: Date.now() + ttl * 1000
    }));
  }

  _isTokenValid(token) {
    if (token && Date.now() < token.expirationDate) {
      return true;
    } else {
      sessionStorage.removeItem(STORAGE_OAUTH_KEY);
      return false;
    }
  }

  logout(token) {
    const deferred = Q.defer();

    if (!token) {
      deferred.resolve(true);
      return deferred.promise;
    }

    request
    .get(this.apiEndpoints.logoutProvider)
    .set('authorization', `bearer ${token}`)
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

  login(email, password) {
    const deferred = Q.defer();

    request
    .post(this.apiEndpoints.loginProvider)
    .set('content-type', 'application/json')
    .send({
      email,
      password
    })
    .end((error, response) => {
      if (error) {
        console.error(error.stack);
        deferred.reject(response.body.error || error);
      } else {
        const { token, provider } = response.body;
        this._storeToken(token);

        deferred.resolve(provider);
      }
    });

    return deferred.promise;
  }

  getToken() {
    const token = JSON.parse(sessionStorage.getItem(
      STORAGE_OAUTH_KEY
    ));

    if (this._isTokenValid(token)) {
      return token.jwt;
    } else {
      return null;
    }
  }

}

const sharedInstance = new OAuthManager();
export default sharedInstance;
