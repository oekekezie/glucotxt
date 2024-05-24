/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/11/2015
/********************************************************/

import { isEmail, isMobilePhone } from 'validator';

export let isValid = (value, validationType, required = false) => {
  if (required && !isRequired(value))
    return false;

  switch (validationType) {
    case 'date':
      return isDate(value);
    case 'email':
      return isEmail(value);
    case 'phoneNumber':
      return isMobilePhone(value, 'en-US');
    default:
      return required === true ? isRequired(value) : null;
  }
}

export let isRequired = (value) => {
  if (!value) return false;

  return String(value).trim() ? true : false;
}

export let isDate = (value) => {
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
  return regex.test(value);
}
