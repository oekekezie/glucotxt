/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/10/2016
/*******************************************************/
'use strict';

const Q = require('q');
const request = require('superagent');
const { isEmail, isMongoId, isURL } = require('validator');

class OAuthManager {

  constructor() {
    this.validate = this.validate.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    this._generateToken = this._generateToken.bind(this);
    this._getAccount = this._getAccount.bind(this);
    this._getGroups = this._getGroups.bind(this);
    this._isMemberOfGroups = this._isMemberOfGroups.bind(this);
  }

  _generateToken(email, password) {
    const deferred = Q.defer();

    if (typeof email !== 'string' || typeof password !== 'string') {
      deferred.reject(new Error('Must provide email address and password.'));
      return deferred.promise;
    }

    request
    .post(`${process.env.STORMPATH_APPLICATION_HREF}/oauth/token`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({
      grant_type: 'password',
      username: email,
      password,
      accountStore: process.env.STORMPATH_ACCOUNT_STORE_HREF
    })
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        const {
          access_token: jwt,
          expires_in: ttl
        } = response.body;

        deferred.resolve({
          jwt,
          ttl
        });
      }
    });

    return deferred.promise;
  }

  _getAccount(token) {
    const deferred = Q.defer();

    if (typeof token !== 'string') {
      deferred.reject(new Error('Must provide token.'));
      return deferred.promise;
    }

    request
    .get(`${process.env.STORMPATH_APPLICATION_HREF}/authTokens/${token}`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .query({
      expand: 'account'
    })
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        const { account } = response.body;

        if (account && isURL(account.href)
        && (isMongoId(account.username) || isEmail(account.username))
        && account.groups && isURL(account.groups.href)
        && account.accessTokens && isURL(account.accessTokens.href)) {
          deferred.resolve(account);
        } else {
          deferred.reject(new Error('Unable to get account.'));
        }
      }
    });

    return deferred.promise;
  }

  _getAccessTokens(account) {
    const deferred = Q.defer();

    const { accessTokens: { href } } = account;
    if (!isURL(href)) {
      deferred.reject(new Error('Must provide link to account.'));
      return deferred.promise;
    }

    request
    .get(`${href}`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .query({ 'application.href': process.env.STORMPATH_APPLICATION_HREF })
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        const { items } = response.body;

        deferred.resolve(items);
      }
    });

    return deferred.promise;
  }

  _revokeAccessToken(href) {
    const deferred = Q.defer();

    if (!isURL(href)) {
      deferred.reject(new Error('Must provide link to token.'));
      return deferred.promise;
    }

    request
    .del(href)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else if (response.noContent) {
        deferred.resolve(true);
      } else {
        deferred.reject(new Error('Failed to revoke token.'));
      }
    });

    return deferred.promise;
  }

  _getGroups(account) {
    const deferred = Q.defer();

    const { groups: { href } } = account;
    if (!isURL(href)) {
      deferred.reject(new Error('Must provide link to account.'));
      return deferred.promise;
    }

    request
    .get(`${href}`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        const { items } = response.body;

        deferred.resolve(items);
      }
    });

    return deferred.promise;
  }

  _isMemberOfGroups(account, groups, requireAll) {
    const deferred = Q.defer();

    this._getGroups(account)
    .then((items) => {
      items = items.filter((item) => {
        const { name } = item;
        return groups.indexOf(name) !== -1;
      });

      deferred.resolve(
        requireAll ? items.length === groups.length : items.length > 0
      );
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  validate(token, groups = [], requireAll = false) {
    const deferred = Q.defer();

    if (!token) {
      deferred.reject(new Error('Must provide a token.'));
      return deferred.promise;
    }

    let userID;
    this._getAccount(token)
    .then((account) => {
      const { username } = account;
      userID = username; // may be provider object ID or admin email
      if (groups.length > 0) {
        return this._isMemberOfGroups(account, groups, requireAll);
      } else {
        return true;
      }
    })
    .then((isValid) => {
      deferred.resolve({
        userID,
        isValid
      });
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  login(email, password) {
    const deferred = Q.defer();

    if (typeof email !== 'string' || typeof password !== 'string') {
      deferred.reject(new Error('Must provide email address and password.'));
      return deferred.promise;
    }

    let token;
    this._generateToken(email, password)
    .then((result) => {
      token = result;

      return this._getAccount(token.jwt);
    })
    .then((account) => {
      return this._getAccessTokens(account);
    })
    .then((accessTokens) => {
      let oldTokens = accessTokens.filter((accessToken) => {
        const { jwt } = accessToken;

        return jwt !== token.jwt;
      });

      let promises = oldTokens.map((oldToken) => {
        const { href } = oldToken;

        return this._revokeAccessToken(href);
      });

      return Q.all(promises);
    })
    .then(() => {
      deferred.resolve(token);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  logout(token) {
    const deferred = Q.defer();

    if (typeof token !== 'string') {
      deferred.reject(new Error('Must provide a token.'));
      return deferred.promise;
    }

    this._getAccount(token)
    .then((account) => {
      return this._getAccessTokens(account);
    })
    .then((accessTokens) => {
      let promises = accessTokens.map((accessToken) => {
        const { href } = accessToken;

        return this._revokeAccessToken(href);
      });

      return Q.all(promises);
    })
    .then(() => {
      deferred.resolve(true);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

}

const sharedInstance = new OAuthManager();
module.exports = sharedInstance;
