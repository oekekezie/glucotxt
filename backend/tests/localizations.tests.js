/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/14/2015
/********************************************************/
'use strict';

const expect = require('chai').expect;

describe('Loading localizations', () => {
  const engReference = require('./../localizations/eng');
  const espReference = require('./../localizations/esp');

  it('should load localization reference', () => {
    const current = require('./../localizations')();

    expect(current.reference)
      .to
      .exist;
  });

  it('should load English reference by default', () => {
    const current = require('./../localizations')();

    expect(current.reference)
      .to
      .deep
      .equal(engReference);
  });

  it('should load Spanish reference when specified', () => {
    const current = require('./../localizations')('esp');

    expect(current.reference)
      .to
      .deep
      .equal(espReference);
  });

  it('should ensure localizations have same keys', () => {
    const engKeys = Object.keys(engReference);
    const espKeys = Object.keys(espReference);

    expect(engKeys)
      .to
      .deep
      .equal(espKeys);
  });

  it('should format keys before looking up', () => {
    const current = require('./../localizations')();
    const testKey = 'NO_SUBSCRIPTION';

    expect(current.lookUp(testKey))
      .to
      .deep
      .equal(engReference['errornosubscription']);
  });

  it('should ensure look up key gets correct value', () => {
    const current = require('./../localizations')();
    const keys = Object.keys(current.reference);
    const randomKey = keys[
      Number(Math.random() * (keys.length - 1)).toFixed()
    ];

    expect(current.lookUp(randomKey))
      .to
      .deep
      .equal(engReference[randomKey]);
  });

  it('should ensure look up key passes params and gets correct value', () => {
    const current = require('./../localizations')();
    const key = 'accesstokensuccess';

    expect(current.lookUp(key, 'ABC', 'DEF', 'HIJ'))
      .to
      .deep
      .equal(engReference[key]('ABC', 'DEF', 'HIJ'));
  });
});
