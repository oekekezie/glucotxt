/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
********************************************************/

const MockBloodGlucoseData = [{
    value: 100,
    postprandial: false,
    timestamp: new Date('2/2/2015 20:30:00 +0000')
  }, {
    value: 87,
    postprandial: false,
    timestamp: new Date('2/2/2015 12:30:00 +0000')
  }, {
    value: 200,
    postprandial: true,
    timestamp: new Date('2/2/2015 7:30:00 +0000')
  }, {
    value: 78,
    postprandial: true,
    timestamp: new Date('1/20/2015 22:30:00 +0000')
  }, {
    value: 120,
    postprandial: false,
    timestamp: new Date('1/20/2015 15:30:00 +0000')
  }, {
    value: 146,
    postprandial: false,
    timestamp: new Date('1/20/2015 8:31:00 +0000')
  }, {
    value: 99,
    postprandial: true,
    timestamp: new Date('1/15/2015 22:22:00 +0000')
  }, {
    value: 145,
    postprandial: false,
    timestamp: new Date('1/15/2015 14:29:00 +0000')
  }, {
    value: 67,
    postprandial: true,
    timestamp: new Date('1/15/2015 4:30:00 +0000')
  }, {
    value: 199,
    postprandial: true,
    timestamp: new Date('1/14/2015 17:45:00 +0000')
  }, {
    value: 45,
    postprandial: true,
    timestamp: new Date('1/14/2015 17:30:00 +0000')
  }, {
    value: 78,
    postprandial: true,
    timestamp: new Date('1/3/2015 12:30:00 +0000')
}, {
    value: 107,
    postprandial: true,
    timestamp: new Date('12/31/2014 1:30:00 +0000')
}];

export default MockBloodGlucoseData.reverse();
