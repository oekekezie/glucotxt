/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/12/2016
/*******************************************************/
'use strict';

const Q = require('q');
const request = require('superagent');
const { isEmail, isMongoId, isURL } = require('validator');

const Provider = require('./schemas/provider');

class ProviderManager {

  _deleteStormpathAccount(href) {
    const deferred = Q.defer();

    if (!isURL(href)) {
      deferred.reject(new Error('Must provide link to account.'));
      return deferred.promise;
    }

    request
    .del(`${href}`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(true);
      }
    });

    return deferred.promise;
  }

  _createStormpathAccount({ id, email, password, firstName, lastName }) {
    const deferred = Q.defer();

    if ((id && !isMongoId(id)) || (email && !isEmail(email))) {
      deferred.reject(new Error('Requires valid id and email address.'));
      return deferred.promise;
    }

    request
    .post(`${process.env.STORMPATH_ACCOUNT_STORE_HREF}/accounts`)
    .auth(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
    .set('content-type', 'application/json')
    .send({
      username: id,
      email,
      password,
      givenName: firstName,
      surname: lastName
    })
    .end((error, response) => {
      if (error) {
        deferred.reject(error);
      } else {
        const account = response.body;

        if (account && isURL(account.href)) {
          deferred.resolve(account);
        } else {
          deferred.reject(new Error('Unable to create Stormpath account.'));
        }
      }
    });

    return deferred.promise;
  }

  removeProvider(email) {
    const deferred = Q.defer();

    Provider.findByEmail(email)
    .then((provider) => {
      const { stormpathAccountURL } = provider;

      return this._deleteStormpathAccount(stormpathAccountURL);
    })
    .then(() => {
      return(
        Provider.findOneAndRemove({
          email: { $eq: email }
        })
        .lean()
        .exec()
      );
    })
    .then((result) => {
      deferred.resolve(result);
    })
    .catch((error) => {
      deferred.reject(error);
    })
    .done();

    return deferred.promise;
  }

  createProvider(profile) {
    const deferred = Q.defer();

    // Get Stormpath account fields; remove password from provider's profile
    const {
      email,
      password,
      firstName,
      lastName
    } = profile;
    delete profile.password;
    const provider = new Provider(profile);
    const id = String(provider.id);

    this._createStormpathAccount({
      id,
      email,
      password,
      firstName,
      lastName
    })
    .then((account) => {
      provider.set('stormpathAccountURL', account.href);

      return Q(provider.save());
    })
    .then((provider) => {
      deferred.resolve(provider);
    })
    .catch((error) => {
      if (error.code === 11000) {
        this._deleteStormpathAccount(provider.get('stormpathAccountURL'));
        deferred.reject(new Error('Provider already exists.'));
      } else {
        deferred.reject(error);
      }
    })
    .done();

    return deferred.promise;
  }

  getProvider(email) {
    return Provider.findByEmail(email);
  }

}

const sharedInstance = new ProviderManager();
module.exports = sharedInstance;
