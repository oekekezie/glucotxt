/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/1/2015
********************************************************/
import React from 'react';

// Constants
const MISSING_LABEL_TEXT = 'N/A';

export default class RowLabel extends React.Component {

  constructor(props) {
    super(props);
  }

  // Assumes western date string
  _formatRowLabel() {
    const { text } = this.props;

    // Handle empty text
    if (!text) return MISSING_LABEL_TEXT;

    // Handle not a date
    const dateComponents = text.split(' ');
    if (dateComponents.length !== 4) return MISSING_LABEL_TEXT;

    // Formate date
    const date = new Date(text);

    return(
      `${dateComponents[0]} ${date.getMonth() + 1}/${date.getDate()}`
    );
  }

  _generateStyle() {
    let style = {
      textAlign: 'right'
    };

    return style;
  }

  render() {
    return(
      <td style={this._generateStyle()}>
        {this._formatRowLabel()}
      </td>
    );
  }

}
