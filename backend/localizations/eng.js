/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/2/2015
********************************************************/
'use strict';

const app = 'GlucoTxt';
const website = process.env.GLUCOTXT_WEBSITE || 'www.glucotxt.com';
const contact = process.env.GLUCOTXT_CONTACT || 'support@glucotxt.com';
const portal = process.env.GLUCOTXT_PORTAL || 'my.glucotxt.com';

// Scripted responses for the English language
const Reference = {
  localizationType: 'eng',

  // Unsupported action
  unsupportedaction: 'Oops! This action is not supported. Please try again or reply "?" for more information.',
  // No subscription
  nosubscription: `Oops! You currently do not have a subscription. If you want to use ${app}, you will need an invitation from your provider. Please try again or contact us at ${contact}.`,
  // Default
  defaulterror: `Oops! Something went wrong. Please try again or contact us at ${contact}.`,

  // Sent to new patients
  invitation: `Welcome to ${app}! (Para Espanol responda "Esp" ahora.) (1) To log a blood sugar measurement just send us the numeric value, for example "120", and we will do the rest. (2) To view or share your log at any time, reply "Log" and we will send you an access code with instructions. (3) Reply “Stop” to quit using our service at anytime or "?" for more information.`,

  // Set language to English
  setlanguagepreferencesuccess: `Your language was set to English. (Para Espanol responda "Esp" ahora.) Thanks for using ${app}!`,
  setlanguagepreferenceunnecessary: `Your language is already set to English. (Para Espanol responda "Esp" ahora.) Thanks for using ${app}!`,

  // Help information
  helpinformation: `INFO: (1) Text us your blood glucose measurement anytime, anywhere and we will log it for you. (2) If you would like to see your log, reply us “Access” and we will give you instructions. (3) Reply “Stop” to quit using our service at anytime. (4) For more information, visit our website ${website} or contact us at ${contact}.`,

  // Updated blood glucose log
  updatebloodglucoselogsuccess: `Updated your log! Reply “Post” if you ate two hours before taking this measurement or “Undo” if you would like to undo this update. Thanks for using ${app}!`,
  updateandmarkbloodglucoselogsuccess: `Updated your log! Reply “Undo” if you would like to undo this update. Thanks for using ${app}!`,
  updatebloodglucoselogfailure: 'Oops! We were unable to update your log. Please try again or reply "?" for more information.',

  // Mark postprandial
  markpostprandialsuccess: `Marked this measurement as postprandial! Thanks for using ${app}!`,
  markpostprandialnone: `There are no recent measurements to mark as postprandial. Thanks for using ${app}!`,
  markpostprandialfailure: 'Oops! We were unable to mark your last logged measurement. Please try again or reply “?” for more information.',

  // Undo update log
  undoupdatelogsuccess: `Fixed your log! Thanks for using ${app}!`,
  undoupdatelognone: `There are no recent measurements to undo. Thanks for using ${app}!`,
  undoupdatelogfailure: 'Oops! We were unable to remove this measurement. Please try again or reply “?” for more information.',

  // Get access token
  accesstokensuccess: (token) => {
    if (Array.isArray(token))
      token = token.shift();
    return `To access your log, go to ${portal} and log on using your phone number and this temporary access code: ${token}. This access code will expire in 30 minutes.`;
  },
  accesstokenfailure: 'Oops! We’re unable to access your logs right now. Please try again or reply "?" for more information.'
};

module.exports = Reference;
