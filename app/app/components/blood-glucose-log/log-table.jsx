/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
********************************************************/
import React from 'react';

import Table from 'react-bootstrap/lib/Table';

import Header from './header';
import Row from './row';

export default class LogTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  _updateHighlightedColumn(newColumn) {
    const { highlightedColumn } = this.state;

    if (highlightedColumn !== newColumn) {
      this.setState({
        highlightedColumn: newColumn
      });
    }
  }

  _generateRows() {
    let rows = [];
    const { headerColumns, tableData } = this.props;
    const { highlightedColumn } = this.state;

    tableData.forEach((columns, dayIndex, mapObj) => {
      rows.push(
        <Row
          key={dayIndex}
          headerColumns={headerColumns}
          highlightedColumn={highlightedColumn}
          updateHighlightedColumn={(col) => this._updateHighlightedColumn(col)}
          dayIndex={dayIndex}
          rowData={columns} />
      );
    });

    // Add empty row if no rows
    if (!rows.length) {
      rows.push(
        <tr key={Math.random()}>
          <td
            colSpan={headerColumns.length}
            style={{textAlign:'center', color: 'rgba(0, 0, 0, 0.4)'}}>
            <strong>
              No measurements found
            </strong>
          </td>
        </tr>
      );
    }

    return rows;
  }

  _generateHeader() {
    const { headerColumns } = this.props;
    const { highlightedColumn } = this.state;

    return(
      <Header
        headerColumns={headerColumns}
        highlightedColumn={highlightedColumn}
        updateHighlightedColumn={(col) => this._updateHighlightedColumn(col)} />
    );
  }

  render() {
    return(
      <Table
        onMouseLeave={(e) => this._updateHighlightedColumn(null)}
        bordered
        responsive
        hover
        fill>
        {this._generateHeader()}
        <tbody>
          {this._generateRows()}
        </tbody>
      </Table>
    );
  }

}
