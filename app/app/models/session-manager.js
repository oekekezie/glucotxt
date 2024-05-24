/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/11/2016
/********************************************************/

import Q from 'q';

import { STORAGE_USER_TYPE_KEY } from './../helpers/storage-keys';

import accessLogManager from './access-log-manager';
import oAuthManager from './oauth-manager';

import patientManager from './patient-manager';
import providerManager from './provider-manager';

class SessionManager {

  _clearSessionStorage() {
    Object.keys(sessionStorage).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }

  _setUserType(userType) {
    sessionStorage.setItem(STORAGE_USER_TYPE_KEY, userType);
  }

  getUserType() {
    return sessionStorage.getItem(STORAGE_USER_TYPE_KEY);
  }

  getAuth() {
    const userType = this.getUserType();

    let auth;
    switch (userType) {
      case 'patient':
        auth = accessLogManager;
        break;
      case 'provider':
        auth = oAuthManager;
        break;
      default:
        return null;
    }

    if (auth && typeof auth.getToken === 'function') {
      const token = auth.getToken();
      if (!token) {
        return null;
      } else {
        return {
          userType,
          token: auth.getToken()
        };
      }
    } else {
      return null;
    }
  }

  sessionExists() {
    return this.getAuth() || this.getUserType() ? true : false;
  }

  init({ userType, userID, password }) {
    const deferred = Q.defer();

    let login, setUser;
    switch (userType) {
      case 'patient':
        login = accessLogManager.login;
        setUser = patientManager.setPatient;
        break;
      case 'provider':
        login = oAuthManager.login;
        setUser = providerManager.setProvider;
        break;
      default:
        deferred.reject('Must specify patient or provider.');
        return deferred.promise;
    }

    this._clearSessionStorage();
    login(userID, password)
    .then((user) => {
      this._setUserType(userType);
      setUser(user);
      deferred.resolve(true);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  deinit() {
    const deferred = Q.defer();

    const auth = this.getAuth();
    if (!auth) {
      deferred.reject(new Error('No authenticated user to logout.'));
      return deferred.promise;
    }

    let logout, phoneNumber;
    switch (auth.userType) {
      case 'patient':
        ({ phoneNumber } = patientManager.getPatient());
        logout = accessLogManager.logout;
        break;
      case 'provider':
        logout = oAuthManager.logout;
        break;
      default:
        deferred.reject('Must specify patient or provider.');
        return deferred.promise;
    }

    logout(auth.token, phoneNumber)
    .then((result) => {
      this._clearSessionStorage();
      deferred.resolve(result);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

}

const sharedInstance = new SessionManager();
export default sharedInstance;
