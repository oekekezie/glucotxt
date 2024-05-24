/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/15/2015
/********************************************************/
'use strict';

const Q = require('q');
const expect = require('chai').expect;

describe.skip('Cache manager', () => {
  let cacheManager;
  const key = 'skateboarders';
  const obj = {
    creative: 'Jerry Hsu',
    gnarly: 'Nyjah Huston',
    crazy: 'Chris Joslin'
  };
  const fieldToTest = 'crazy';

  before((done) => {
    cacheManager = require('./../models/cache-manager');
    cacheManager.connect(() => {
      cacheManager.client.flushdb(() => {
        done();
      });
    });
  });

  after((done) => {
    cacheManager.client.flushdb(() => {
      cacheManager.client.quit(done)
    });
  });

  it('should return true if hash is set', (done) => {
    cacheManager.hmset(key, obj).then((result) => {
      expect(result)
        .to
        .be
        .true;

      done();
    });
  });

  it('should return true if hash exists', (done) => {
    cacheManager.exists(key).then((result) => {
      expect(result)
        .to
        .be
        .true;

      done();
    });
  });

  it('should return true if hash field exists', (done) => {
    cacheManager.hexists(key, fieldToTest).then((result) => {
      expect(result)
        .to
        .be
        .true;

      done();
    });
  });

  it('should return a number greater than zero if deletes a hash field', (done) => {
    cacheManager.hdel(key, fieldToTest).then((result) => {
      expect(result)
        .to
        .be
        .at
        .least(1);

      done();
    });
  });

  it('should return a number greater than zero if deletes a hash', (done) => {
    cacheManager.del(key).then((result) => {
      expect(result)
        .to
        .be
        .at
        .least(1);

      done();
    });
  });
});
