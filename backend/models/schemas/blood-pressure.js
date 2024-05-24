/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/22/2015
/*******************************************************/

const mongoose = require('mongoose');

const ENUM_POSITIONS = ['sitting', 'standing'];

const Schema = mongoose.Schema;
const schema = new Schema({
	// General information
  systolic: { type: Number, min: 0 },
  diastolic: { type: Number, min: 0 },
  timestamp: Date,
  position: {
    type: String,
    default: 'sitting',
    enum: ENUM_POSITIONS,
    lowercase: true
  },
  source: { type: String, default: 'sms', lowercase: true },
	// Patient
	patient: { type: Schema.Types.ObjectId, ref: 'Patient' }
}, {
  timestamps: true
});

schema.index({ patient: true, timestamp: -1 });

const model = mongoose.model('BloodPressure', schema);

module.exports = model;
