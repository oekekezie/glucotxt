/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/12/2016
/*******************************************************/
'use strict';

const Q = require('q');
const mongoose = require('mongoose');
const { isMongoId } = require('validator');

const BloodGlucose = require('./schemas/blood-glucose');

class MeasurementsManager {

  getBloodGlucoseMeasurements({ patientID, startDate, endDate }) {
    if (isMongoId(String(patientID))
      && startDate instanceof Date
      && endDate instanceof Date) {
      patientID = new mongoose.Types.ObjectId(patientID);
    } else {
      return Q.reject(new Error('Must provide patient ID and date range.'));
    }

    return(
      BloodGlucose.find({
        patient: patientID,
        timestamp: { $gte: startDate, $lte: endDate }
      })
      .sort({
        timestamp: -1
      })
      .select({
        value: true,
        timestamp: true,
        postprandial: true
      })
      .lean()
      .exec()
    );
  }

}

const sharedInstance = new MeasurementsManager();
module.exports = sharedInstance;
