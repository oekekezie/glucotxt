/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/3/2015
********************************************************/
import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

export default class Footer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { colSpan } = this.props;

    return(
      <tfoot>
        <tr>
          <td colSpan={colSpan}>
            <Button block>
              <Glyphicon glyph={'option-horizontal'} />
            </Button>
          </td>
        </tr>
      </tfoot>
    );
  }

}
