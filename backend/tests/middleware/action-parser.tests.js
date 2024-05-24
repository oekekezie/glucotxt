/********************************************************
* Project Name: GlucoTxt API
* By: Obi Ekekezie
* Date Created: 12/29/2015
/********************************************************/
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const ActionParserMiddleware = require('./../../middlewares/sms/action-parser');
const { errorTypes } = require('./../../middlewares/sms/error-handler')();

describe('SMS API action parser middleware', () => {
  const defaultReference = require('./../../localizations/')();
  const res = {};
  let actionParser, req, next;

  beforeEach(() => {
    req = {
      body: {
        From: '+12224443333',
        To: '+17779998888',
        Body: 'Unsupported Action'
      }
    };
    next = sinon.spy();
    ({ actionParser } = ActionParserMiddleware());
  });

  it('should be a middleware', () => {
    expect(actionParser.length)
      .to
      .equal(3);
  });

  it('should be skipped if error type is set', () => {
    req.ErrorType = errorTypes.DEFAULT_ERROR;
    actionParser(req, res, next);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set default error if no reference', () => {
    req.ApplicationState = {};

    actionParser(req, res, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set default error if no application state', () => {
    req.Reference = defaultReference;

    actionParser(req, res, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.DEFAULT_ERROR);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  it('should set unsupported action error if invalid action', () => {
    req.ApplicationState = {};
    req.Reference = defaultReference;

    actionParser(req, res, next);

    expect(req.ErrorType)
      .to
      .equal(errorTypes.UNSUPPORTED_ACTION);

    expect(next)
      .to
      .have
      .been
      .calledOnce;
  });

  describe('Test parsing of each supported actions', () => {
    const examples = [
      {
        input: ['?'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            (type === 'get-help' && parameters.length === 2) ? true : false
          );
        }
      },
      {
        input: ['log'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            type === 'access-log' && parameters.length === 2  ? true : false
          );
        }
      },
      {
        input: ['100', '110p', '120 post'],
        didParseCorrectly: (type, parameters, example = 0) => {
          const expectedParameterCountByexample = [3, 3, 3];
          return(
            type === 'log-blood-glucose'
              && parameters.length === expectedParameterCountByexample[example]
              ? true : false
          );
        }
      },
      {
        input: ['post'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            type === 'mark-postprandial'
              && parameters.length === 2 ? true : false
          );
        }
      },
      // TODO: 'log-blood-pressure': ,
      {
        input: ['undo'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            type === 'undo-update-log'
              && parameters.length === 2 ? true : false
          );
        }
      },
      {
        input: ['stop'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            type === 'stop-subscription'
              && parameters.length === 2 ? true : false
          );
        }
      },
      {
        input: ['eng', 'esp'],
        didParseCorrectly: (type, parameters, example = 0) => {
          return(
            type === 'set-language' && parameters.length === 2 ? true : false
          );
        }
      }
    ];

    it('should parse all examples correctly', () => {
      let expectedNextCallCount = 0;
      req.ApplicationState = {};
      req.Reference = defaultReference;

      const expected = examples.filter((example) => {
        const incorrect = example.input.filter((input, exampleIndex) => {
          req.body.Body = input;
          actionParser(req, res, next);

          expect(req.Action)
            .to
            .have
            .all
            .keys(['Type', 'Parameters']);

          const isCorrect = example.didParseCorrectly(
            req.Action.Type,
            req.Action.Parameters,
            exampleIndex
          );

          if (!isCorrect) {
            console.log(
              `Parsed ${req.Action.Type} incorrectly.`
            );
          }

          return(!isCorrect);
        });
        expectedNextCallCount += example.input.length;

        return incorrect.length > 0 ? true : false;
      }).length;

      expect(expected)
        .to
        .equal(0);

      expect(next)
        .to
        .have
        .callCount(expectedNextCallCount);
    });
  });

});
