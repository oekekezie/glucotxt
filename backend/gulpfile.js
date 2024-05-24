/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/13/2015
/********************************************************/
'use strict';

require('babel-register');

const MOCHA_TIMEOUT = 15000;

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  return gulp.src(['**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
  return(
    // FIXME
    gulp.src('tests/**/last-measurement-token.tests.js')
    .pipe(mocha({
      timeout: MOCHA_TIMEOUT
    }))
    .once('error', (error) => {
      console.error(`Force quitting after error: ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    })
  );
});

gulp.task('default', [
    'lint',
    'test'
  ],
  () => {
    console.log('Big Gulps.') ;
  }
);
