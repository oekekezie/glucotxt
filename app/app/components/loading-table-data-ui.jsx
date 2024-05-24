/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 1/31/2016
/********************************************************/
import React from 'react';

import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';

import loadingGif from './../assets/images/loading.gif';

export default class LoadingTableDataUI extends React.Component {

  constructor() {
    super();
  }

  _generateLoadingUI() {
    const panelHeader = (
      <h1 style={{textAlign:'center'}}>
        Loading...
      </h1>
    );

    return(
      <Panel header={panelHeader}>
        <Table condensed responsive hover fill>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>
                <img src={loadingGif} />
              </td>
            </tr>
          </tbody>
        </Table>
      </Panel>
    );
  }

  _generateErrorUI() {
    const panelHeader = (
      <h1 style={{textAlign:'center'}}>
        Oops something went wrong...
      </h1>
    );

    return(
      <Panel bsStyle="danger" header={panelHeader}>
        <Table condensed responsive hover fill>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>
                <p>
                  Please refresh to try again.
                </p>
              </td>
            </tr>
          </tbody>
        </Table>
      </Panel>
    );
  }

  render() {
    const { error } = this.props;

    if (error) {
      return this._generateErrorUI();
    } else {
      return this._generateLoadingUI();
    }
  }

}
