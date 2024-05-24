/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 11/25/2015
********************************************************/
import React from 'react';

import Container from './container';
import LogTable from './log-table';

const ROW_LABEL = 'rowLabel';
const MILLISECONDS_TO_DAYS = 24 * 60 * 60 * 1000;
const MILLISECONDS_TO_HOURS = 60 * 60 * 1000;
const TABLE_COLUMN_HEADER_LABELS = [
  { text: 'Day', value: ROW_LABEL, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '12am', value: 0, color: 'rgba(0, 0, 0, 1)' },
  { text: '1am', value: 1, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '2am', value: 2, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '3am', value: 3, color: 'rgba(0, 0, 0, 1)' } ,
  { text: '4am', value: 4, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '5am', value: 5, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '6am', value: 6, color: 'rgba(0, 0, 0, 1)' },
  { text: '7am', value: 7, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '8am', value: 8, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '9am', value: 9, color: 'rgba(0, 0, 0, 1)' },
  { text: '10am', value: 10, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '11am', value: 11, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '12pm', value: 12, color: 'rgba(0, 0, 0, 1)' },
  { text: '1pm', value: 13, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '2pm', value: 14, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '3pm', value: 15, color: 'rgba(0, 0, 0, 1)' },
  { text: '4pm', value: 16, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '5pm', value: 17, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '6pm', value: 18, color: 'rgba(0, 0, 0, 1)' },
  { text: '7pm', value: 19, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '8pm', value: 20, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '9pm', value: 21, color: 'rgba(0, 0, 0, 1)' },
  { text: '10pm', value: 22, color: 'rgba(0, 0, 0, 0.4)' },
  { text: '11pm', value: 23, color: 'rgba(0, 0, 0, 0.4)' }
];

export default class BloodGlucoseLog extends React.Component {

  render() {
    const {
      records,
      numberOfRecords,
      maxNumberOfRecords,
      patient,
      isPatientView,
      fetchPrevious,
      fetchNext,
      updateFilter,
      headerColumns = TABLE_COLUMN_HEADER_LABELS
    } = this.props;

    return(
      <Container
        dates={Array.from(records.keys())}
        numberOfRecords={numberOfRecords}
        maxNumberOfRecords={maxNumberOfRecords}
        patient={patient}
        isPatientView={isPatientView}
        fetchPrevious={fetchPrevious}
        fetchNext={fetchNext}
        onApplyFilter={updateFilter}>
        <LogTable
          tableData={records}
          headerColumns={headerColumns} />
      </Container>
    );
  }

}
