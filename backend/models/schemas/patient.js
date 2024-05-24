/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/30/2015
/*******************************************************/
'use strict';

const ENUM_PROGRAM_SCHEDULE = [
	'beforebreakfast',
	'afterbreakfast',
	'beforelunch',
	'afterlunch',
	'beforedinner',
	'afterdinner',
	'beforebed'
];
const ENUM_GENDER = [
	'female',
	'male',
	'other'
];
const DEFAULT_LANGUAGE = 'eng';

const Q = require('q');
const mongoose = require('mongoose');
const { isMobilePhone, isMongoId } = require('validator');

const logger = require('./../../helpers/logger');
const { measurementTypes } = require('./../../helpers/types');

const Schema = mongoose.Schema;
const schema = new Schema({
	// General information
	phoneNumber: {
		type: String,
		index: { unique: true, sparse: true },
		required: true,
		validate: {
			validator: (v) => {
				return isMobilePhone(v, 'en-US');
			},
			message: '{VALUE} is not a valid phone number.'
		}
	},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, lowercase: true, enum: ENUM_GENDER, required: true },
	// Assignment
	assignment: {
		id: { type: Schema.Types.ObjectId, ref: 'ServiceNumber' },
		phoneNumber: { type: String },
		startDate: { type: Date },
		schedule: [{ type: String, lowercase: true, enum: ENUM_PROGRAM_SCHEDULE }],
		baseline: { type: Number, min: 0, max: 1 }
	},
	// Statistics
	statistics: {
		bloodGlucose: {
			lastUpdated: { type: Date },
			count: { type: Number, default: 0, min: 0 }
		}
	},
	// Providers
	providers: [{ type: Schema.Types.ObjectId, ref: 'Provider', index: true }],
	// Groups
	groups: {
		type: [String],
		default: ["Hasbro Children's Hospital"],
		index: true
	},
	// Custom
	preferences: {
		language: { type: String, lowercase: true, default: DEFAULT_LANGUAGE },
		timeZone: { type: String }
	}
}, {
  timestamps: true
});

// Add measurement
schema.statics.addMeasurement = function(measurement) {
	const deferred = Q.defer();

	if (typeof measurement !== 'object'
	|| !(measurement.constructor.modelName in measurementTypes)) {
		deferred.reject(new Error('Must specify a valid measurement to add.'));
		return deferred.promise;
	}

	Q(measurement.save())
	.then((record) => {
		return(this.updateStatistics(
			measurement.patient,
			measurement.constructor.modelName
		));
	})
	.then((result) => {
		deferred.resolve(result);
	})
	.catch((error) => {
		deferred.reject(error);
		logger.error(error);
		// Attempt to roll back if saved
		return(
			measurement.constructor.findByIdAndRemove(
				measurement.id
			))
			.lean()
			.exec()
			.done(() => {
				logger.debug('Rolled back adding measurement.');
			}, (error) => {
				logger.error(`Failed to roll back adding measurement: ${error}`);
			}
		);
	})
	.done();

	return deferred.promise;
};

// Remove measurement
schema.statics.removeMeasurement = function(
	measurementID,
	measurementType,
	lean = true
) {
	const deferred = Q.defer();

	if (!isMongoId(String(measurementID))
	|| !(measurementType in measurementTypes)) {
		deferred.reject(new Error('Must specify a valid measurement to remove.'));
		return deferred.promise;
	}

	if (typeof(measurementID) === 'string') {
		measurementID = new mongoose.Types.ObjectId(measurementID);
	}

	mongoose.model(measurementType).findByIdAndRemove(measurementID)
	.lean(lean)
	.exec()
	.then((record) => {
		if (!record) {
			return false;
		} else {
			return(this.updateStatistics(
				record.patient,
				measurementType,
				-1
			));
		}
	})
	.then((result) => {
		deferred.resolve(result);
	})
	.catch((error) => {
		deferred.reject(error);
		console.error(error);
	})
	.done();

	return deferred.promise;
};

// Update statistics
schema.statics.updateStatistics = function(
	patientID,
	measurementType,
	increment = 1,
	lean = true
) {
	const deferred = Q.defer();

	if (!isMongoId(String(patientID))
	|| !(measurementType in measurementTypes)) {
		deferred.reject(new Error(
			'Must specify a patient and valid measurement type to update statistics.'
		));
		return deferred.promise;
	}

	if (typeof(patientID) === 'string') {
		patientID = new mongoose.Types.ObjectId(patientID);
	}

	this.findByIdAndUpdate(patientID, {
		$inc: {
			[`statistics.${measurementTypes[measurementType]}.count`]: increment
		},
		[`statistics.${measurementTypes[measurementType]}.lastUpdated`]: new Date()
	}, {
		new: true
	})
	.lean(lean)
	.exec()
	.then((record) => {
		deferred.resolve(record ? true : false);
	})
	.catch((error) => {
		deferred.reject(error);
	})
	.done();

	return deferred.promise;
};

// Retrieve patient by phone number
schema.statics.findByPhoneNumber = function(phoneNumber, lean = true) {
	const deferred = Q.defer();

	this.findOne({
		phoneNumber: { $eq: phoneNumber }
	})
	.lean(lean)
	.exec()
	.then((record) => {
		if (!record) {
			deferred.reject(new Error('Patient not found.'));
		} else {
			deferred.resolve(record);
		}
	})
	.catch((error) => {
		deferred.reject(error);
	})
	.done();

	return deferred.promise;
};

const model = mongoose.model('Patient', schema);

module.exports = model;
