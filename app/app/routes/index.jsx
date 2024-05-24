/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/7/2015
/********************************************************/
import React from 'react';
import {
  Route,
  IndexRoute
} from 'react-router';

import App from './../containers/app';
import DefaultError from './../containers/default-error';
import Welcome from './../containers/welcome';
import Logout from './../containers/logout';

import ProviderContainer from './../containers/provider';
import Dashboard from './../containers/provider/dashboard';

import PatientContainer from './../containers/patient';

import BloodGlucose from './../containers/log/blood-glucose';

import sessionManager from './../models/session-manager';

let isProviderAuthenticated = (nextState, replaceState) => {
  const auth = sessionManager.getAuth();

  if (!auth || auth.userType !== 'provider') {
    replaceState({
      nextPathname: nextState.location.pathname
    }, '/');
  }
};

let isPatientAuthenticated = (nextState, replaceState) => {
  const auth = sessionManager.getAuth();

  if (!auth || auth.userType !== 'patient') {
    replaceState({
      nextPathname: nextState.location.pathname
    }, '/');
  }
};

const Routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Welcome} />

    <Route
      path="provider"
      component={ProviderContainer}
      onEnter={isProviderAuthenticated}>
      <IndexRoute component={Dashboard} />
      <Route
        path="patients/:patientID/blood-glucose"
        component={BloodGlucose} />
    </Route>

    <Route
      path="patient"
      component={PatientContainer}
      onEnter={isPatientAuthenticated}>
      <IndexRoute component={BloodGlucose} />
    </Route>

    <Route
      path="logout"
      component={Logout} />

    <Route path="*" component={DefaultError} />
  </Route>
);

export default Routes;
