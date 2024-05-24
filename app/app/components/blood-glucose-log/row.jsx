/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/1/2015
********************************************************/
import React from 'react';

import RowLabel from './row-label';
import Cell from './cell';

// Constants
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ROW_LABEL = 'rowLabel';

export default class Row extends React.Component {

  constructor(props) {
    super(props);
  }

  _generateRowLabel(props) {
    return(
      <RowLabel {...props} />
    );
  }

  _generateCell(props) {
    return(
      <Cell {...props} />
    );
  }

  _generateRowColumns() {
    let columns = [];
    const {
      headerColumns,
      highlightedColumn,
      updateHighlightedColumn,
      dayIndex,
      rowData
    } = this.props;

    headerColumns.forEach((header) => {
      // Check if row label or cell that may have data
      if (header.value === ROW_LABEL) {
        // Row label
        columns.push(
          this._generateRowLabel({
            key: dayIndex,
            text: dayIndex
          })
        );
      } else {
        const cellData = rowData && rowData.has(header.value) ?
          rowData.get(header.value) : null;
        columns.push(
          this._generateCell({
            key: `${dayIndex}-${header.value}`,
            cellData: cellData,
            hoursIndex: header.value,
            highlightedColumn,
            updateHighlightedColumn
          })
        );
      }
    });

    return columns;
  }

  render() {
    const { dayIndex } = this.props;
    const now = new Date();
    const rowDate = new Date(dayIndex);
    const isToday = now - rowDate < DAY_IN_MILLISECONDS
      && now >= rowDate;

    return(
      <tr className={isToday ? 'info' : ''}>
        {this._generateRowColumns()}
      </tr>
    );
  }

}
