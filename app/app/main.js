/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
/********************************************************/
import React from 'react';
import { render } from 'react-dom';
import {
  Router,
} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import Routes from './routes';

const history = createBrowserHistory();

render((
  <Router history={history} routes={Routes} />
), document.getElementById('mount-node'));
