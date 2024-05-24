/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/28/2016
/*******************************************************/
'use strict';

const Q = require('q');
const mongoose = require('mongoose');
const { isMongoId } = require('validator');

const Event = require('./schemas/event');

class HistoryManager {

  getEvents({ userType, userID, startDate, endDate }) {
    if (isMongoId(String(userID))
      && typeof userType === 'string' && userType.match(/^(patient|provider)$/)
      && startDate instanceof Date
      && endDate instanceof Date) {
      userID = new mongoose.Types.ObjectId(userID);
    } else {
      return Q.reject(new Error('Must provide type, ID, and date range.'));
    }

    return(
      Event.find({
        [userType]: userID,
        timestamp: { $gte: startDate, $lte: endDate }
      })
      .sort({
        timestamp: -1
      })
      .select({
        type: true,
        patient: true,
        provider: true,
        metadata: true,
        timestamp: true
      })
      .populate({
        path: 'provider',
        select: '_id firstName lastName credentials'
      })
      .populate({
        path: 'patient',
        select: '_id firstName lastName'
      })
      .lean()
      .exec()
    );
  }

}

const sharedInstance = new HistoryManager();
module.exports = sharedInstance;
