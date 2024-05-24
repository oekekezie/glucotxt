/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/1/2015
********************************************************/
import React from 'react';

// Constants
const ROW_LABEL = 'rowLabel';

export default class Header extends React.Component {

  constructor(props) {
    super(props);
  }

  _generateHeaderColumns() {
    const {
      headerColumns,
      highlightedColumn,
      updateHighlightedColumn
    } = this.props;
    if (!headerColumns) return(null);

    return(
      headerColumns.map(header => {
        if (header.value === ROW_LABEL) {
          const style = {
            color: `${header.color}`,
            textAlign: 'center'
          };

          return(
            <th
              key={header.value}
              style={style}>
              {header.text}
            </th>
          );
        } else {
          const style = {
            color: `${header.color}`,
            textAlign: 'center'
          };
          const isHeaderOfHighlightedColumn = header.value ===
            highlightedColumn;
          return(
            <th
              className={isHeaderOfHighlightedColumn ? 'active' : ''}
              key={header.value}
              onMouseEnter={() => updateHighlightedColumn(header.value)}
              style={style}>
              {header.text}
            </th>
          );
        }
      })
    );
  }

  render() {
    return(
      <thead>
        <tr>
          {this._generateHeaderColumns()}
        </tr>
      </thead>
    );
  }

}
