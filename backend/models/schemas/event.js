/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/7/2016
/*******************************************************/

const Q = require('q');
const mongoose = require('mongoose');

const logger = require('./../../helpers/logger');
const { eventTypes } = require('./../../helpers/types');
const ENUM_EVENT_TYPE = Object.keys(eventTypes);

const Schema = mongoose.Schema;
const schema = new Schema({
  type: { type: String, enum: ENUM_EVENT_TYPE, required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, required: true }
}, {
  timestamps: true
});

schema.index({ patient: true, timestamp: -1 });
schema.index({ provider: true, timestamp: -1 });

// Add event
schema.statics.log = function({ req, details }) {
  const event = new this(details);

  Q(event.save())
  .then((record) => {
    logger.info('Logged event: ', {
      details,
      requestUUID: req.uuid
    });
  })
  .catch((error) => {
    logger.error('Failed to log event: ', {
      details,
      error: error.message,
      requestUUID: req.uuid
    });
  })
  .done();
};

const model = mongoose.model('Event', schema);

module.exports = model;
