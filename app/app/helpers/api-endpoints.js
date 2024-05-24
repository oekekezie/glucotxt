/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/20/2016
/********************************************************/

let _generateEndpointsReference = (prefix) => {
  return({
    loginPatient: `${prefix}/auth/access-log/login`,
    logoutPatient: `${prefix}/auth/access-log/logout`,

    loginProvider: `${prefix}/auth/oauth/login`,
    logoutProvider: `${prefix}/auth/oauth/logout`,

    getBloodGlucoseMeasurements: `${prefix}/patients/measurements
/blood-glucose`,

    getEventsHistory: `${prefix}/history/events`,

    getPatientsByGroup: `${prefix}/patients/groups`,

    invitePatient: `${prefix}/subscriptions`
  });
};

export default function loadAPIEndpoints() {
  const env = window.location.hostname;

  switch (env) {
    // Production
    case 'app-2484.on-aptible.com':
      return _generateEndpointsReference(
        'https://app-2483.on-aptible.com/api/v1'
      );
    // Development
    case 'localhost':
    case 'glucotxt-development.herokuapp.com':
    default:
      return _generateEndpointsReference(
        'https://glucotxt-api-development.herokuapp.com/api/v1'
      );
  }
};
