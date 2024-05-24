/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 2/11/2016
/********************************************************/

import { STORAGE_PATIENT_KEY } from './../helpers/storage-keys';

class PatientManager {

  setPatient(patient) {
    sessionStorage.setItem(STORAGE_PATIENT_KEY, JSON.stringify(patient));
  }

  getPatient() {
    return JSON.parse(sessionStorage.getItem(STORAGE_PATIENT_KEY));
  }

}

const sharedInstance = new PatientManager();
export default sharedInstance;
