/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/16/2015
/*******************************************************/

const Q = require('q');
const mongoose = require('mongoose');
const { isMongoId } = require('validator');

const Schema = mongoose.Schema;
const schema = new Schema({
	// General information
  value: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  postprandial: { type: Boolean, default: false, required: true },
	// Patient
	patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true }
}, {
  timestamps: true
});

schema.index({ patient: true, timestamp: -1 });

// Mark as postprandial
schema.statics.markAsPostprandial = function(
  measurementID,
  postprandial = true,
  lean = true
) {
  const deferred = Q.defer();

  if (!isMongoId(String(measurementID))) {
    deferred.reject(new Error('Must specify a valid measurement to update.'));
		return deferred.promise;
  }

  if (typeof(measurementID) === 'string') {
		measurementID = new mongoose.Types.ObjectId(measurementID);
	}

  this.findByIdAndUpdate(measurementID, {
    postprandial: { $eq: postprandial }
  })
  .lean(lean)
  .exec()
  .then(function(record) {
    if (!record) {
      deferred.resolve(false);
    } else {
      deferred.resolve(true);
    }
  });

  return deferred.promise;
};

const model = mongoose.model('BloodGlucose', schema);

module.exports = model;
