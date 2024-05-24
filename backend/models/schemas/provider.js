/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/11/2015
********************************************************/

const Q = require('q');
const mongoose = require('mongoose');
const { isEmail, isURL } = require('validator');

const Schema = mongoose.Schema;
const schema = new Schema({
	// General information
	email: {
		type: String,
		index: { unique: true, sparse: true },
		required: true,
		validate: {
			validator: isEmail,
			message: '{VALUE} is not a valid email.'
		}
	},
	firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  credentials: { type: [String], default: [] },
	// Stormpath
	stormpathAccountURL: {
		type: String,
		required: true,
		validate: {
			validator: isURL,
			message: '{VALUE} is not a valid URL.'
		}
	}
}, {
  timestamps: true
});

// Retrieve provider by email
schema.statics.findByEmail = function(email, lean = true) {
	const deferred = Q.defer();

	this.findOne({
		email: { $eq: email }
	})
	.lean(lean)
	.exec()
	.then((record) => {
		if (!record) {
			deferred.reject(new Error('Provider not found.'));
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

const model = mongoose.model('Provider', schema);

module.exports = model;
