/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 10/30/2015
********************************************************/
'use strict';

const MAXIMUM_NUMBER_OF_ASSIGNED_PATIENTS = 60;

const Q = require('q');
const mongoose = require('mongoose');
const twilio = require('twilio');
const { isMobilePhone, isMongoId } = require('validator');

const Schema = mongoose.Schema;
const schema = new Schema({
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
	numberAssigned: { type: Number, default: 0, min: 0, index: true },
	assigned: { type: [String], default: [] },
	description: { type: String, required: true }
}, {
	timestamps: true
});

// Get maximum number of assigned patients allowed
schema.statics.getMaximumNumberOfAssignedPatients = function() {
	return MAXIMUM_NUMBER_OF_ASSIGNED_PATIENTS;
};

// Assign patient (using his/her phone number) to an assignment
// Returns patient's phone number if assigned
schema.statics.assignPatient = function(patient, assignment, lean = true) {
	const deferred = Q.defer();

	let criteria;
	if (isMobilePhone(assignment, 'en-US')) {
		criteria = {
			phoneNumber: { $eq: assignment }
		};
	} else if (isMongoId(String(assignment))) {
		criteria = {
			_id: { $eq: new mongoose.Types.ObjectId(assignment) }
		};
	} else if (!isMobilePhone(patient, 'en-US')) {
		deferred.reject(new Error('Patient must be phone number.'));
		return deferred.promise;
	} else {
		deferred.reject(new Error('Assignment must be object ID or phone number.'));
		return deferred.promise;
	}

	this.findOneAndUpdate(criteria, {
		$inc: {
			numberAssigned: 1
		},
		$addToSet: {
			assigned: patient
		}
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

// Unassign patient (using his/her phone number) from an assignment
// Returns patient's phone number if unassigned
schema.statics.unassignPatient = function(patient, assignment, lean = true) {
	const deferred = Q.defer();

	let criteria;
	if (isMobilePhone(assignment, 'en-US')) {
		criteria = {
			phoneNumber: { $eq: assignment }
		};
	} else if (isMongoId(String(assignment))) {
		criteria = {
			_id: { $eq: new mongoose.Types.ObjectId(assignment) }
		};
	} else if (!isMobilePhone(patient, 'en-US')) {
		deferred.reject(new Error('Patient must be phone number.'));
		return deferred.promise;
	} else {
		deferred.reject(new Error('Assignment must be object ID or phone number.'));
		return deferred.promise;
	}

	this.findOneAndUpdate(criteria, {
		$inc: {
			numberAssigned: -1
		},
		$pull: {
			assigned: patient
		}
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

// Get an available service number
schema.statics.getAvailable = function(lean = true) {
	const deferred = Q.defer();

	this.findOne({
		numberAssigned: {
			$lt: MAXIMUM_NUMBER_OF_ASSIGNED_PATIENTS
		}
	})
	.lean(lean)
	.exec()
	.then((result) => {
		if (result) {
			deferred.resolve(result);
		} else {
			return Q.reject(new Error('No available service numbers.'));
		}
	}).catch((error) => {
		deferred.reject(error);
	})
	.done();

	return deferred.promise;
};

// Get all service numbers
schema.statics.getAll = function(lean = true) {
	const deferred = Q.defer();

	this.find()
	.lean(lean)
	.exec()
	.then((results) => {
		if (results) {
			deferred.resolve(results);
		} else {
			deferred.reject(new Error('Unable to get all service numbers.'));
		}
	}).catch((error) => {
		deferred.reject(error);
	})
	.done();

	return deferred.promise;
};

// Returns true if patient (his/her phone number) is assigned to a service phone number
schema.statics.validateAssignment = function(patient, assignment, lean = true) {
	const deferred = Q.defer();

	let criteria;
	if (isMobilePhone(assignment, 'en-US')) {
		criteria = {
			phoneNumber: { $eq: assignment }
		};
	} else if (isMongoId(String(assignment))) {
		criteria = {
			_id: { $eq: new mongoose.Types.ObjectId(assignment) }
		};
	} else if (!isMobilePhone(patient, 'en-US')) {
		deferred.reject(new Error('Patient must be phone number.'));
		return deferred.promise;
	} else {
		deferred.reject(new Error('Assignment must be object ID or phone number.'));
		return deferred.promise;
	}
	criteria = Object.assign({}, criteria, { assigned: patient });

	this.findOne(criteria)
	.lean(lean)
	.exec()
	.then((result) => {
		deferred.resolve(result ? true : false);
	}).catch((error) => {
		deferred.reject(error);
	})
	.done();

	return deferred.promise;
};

const model = mongoose.model('ServiceNumber', schema);

// Export
module.exports = model;
