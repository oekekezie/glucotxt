/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/1/2015
********************************************************/
import React from 'react';
import moment from 'moment';

import Button from 'react-bootstrap/lib/Button';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

// Constants
const DEFAULT_UNITS = 'mg/dl';
const EMPTY_CELL_TEXT = '   ';
const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export default class Cell extends React.Component {

  constructor(props) {
    super(props);
  }

  _generateStyle() {
    let style = {
      textAlign: 'center',
      verticalAlign: 'middle'
    };
    const { cellData } = this.props;

    return style;
  }

  _generateButton() {
    const { cellData } = this.props;

    // Return empty cell if no data
    if (!cellData) return EMPTY_CELL_TEXT;

    // Calculate average
    const average = Math.round(cellData.reduce((sum, record) => {
      return (sum + record.value)
    }, 0) / cellData.length);

    // Style button
    const buttonStyle = cellData.filter((record) => {
      return record.postprandial
    }).length > 0 ? 'warning' : 'primary';

    const button = (
      <OverlayTrigger
        trigger={'click'}
        placement={'top'}
        overlay={this._generateButtonPopover(cellData)} rootClose>
        <OverlayTrigger
          placement={'top'}
          overlay={this._generateButtonTooltip(cellData)}>
          <Button
            bsSize={'xsmall'}
            bsStyle={buttonStyle}>
            {average}
            {cellData.length > 1 ? ` (${cellData.length})` : ''}
          </Button>
        </OverlayTrigger>
      </OverlayTrigger>
    );

    return(
      button
    );
  }

  _generateButtonTooltip(cellData) {
    // Tooltip (show time for single; count for multiple)
    const text = cellData.length > 1 ?
      `${cellData.length} measurements` :
      `Logged at ${moment(cellData[0].timestamp).format('h:mma')}`;
    return(
      <Tooltip id={text}>{text}</Tooltip>
    );
  }

  _generateButtonPopover(cellData) {
    // Popover with details
    let accessibilitySummary = '';
    const items = cellData.map((record) => {
      const summary = `${record.value} ${DEFAULT_UNITS}
        (${record.postprandial ? 'postprandial' : 'preprandial'})
on ${moment(record.timestamp).format('dddd, MMMM Do, YYYY [at] h:mma')}`;
      accessibilitySummary = `${accessibilitySummary} ${summary}`;
      return(
        <li key={Math.random()}>
          {summary}
        </li>
      );
    });

    return(
      <Popover
        title={'Measurement details'}
        id={accessibilitySummary.trim()}>
        <ul>
          {items}
        </ul>
      </Popover>
    );
  }

  _onMouseEnter(e) {
    const { hoursIndex, updateHighlightedColumn } = this.props;

    updateHighlightedColumn(hoursIndex);
  }

  render() {
    const {
      hoursIndex,
      highlightedColumn,
      updateHighlightedColumn
    } = this.props;
    const isCellOfHighlightedColumn = hoursIndex === highlightedColumn;

    return(
      <td
        className={isCellOfHighlightedColumn ? 'active' : ''}
        onMouseEnter={(e) => this._onMouseEnter(e)}
        style={this._generateStyle()}>
        {this._generateButton()}
      </td>
    );
  }

}
