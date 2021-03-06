'use strict';
/**
 * Calls to transformers, as well as requests to external services
 * are called through this file, which can spy on the results,
 * and optionally create unit-tests, look at timings etc.
 */
import request from 'request';
import * as BaseSoapClient from 'dbc-node-basesoap-client';
import fs from 'fs';
import {log} from '../utils';


// Flag that allows createTest endpoint parameter
let testDev = process.env.TEST_DEV; // eslint-disable-line no-process-env
let mockFileName = process.env.MOCK_FILE; // eslint-disable-line no-process-env
let mockFile;

// Load mock-data if requested via environment
if (mockFileName) {
  if (fs.existsSync(mockFileName)) {
    mockFile = JSON.parse(fs.readFileSync(mockFileName));
  } else {
    mockFile = {};
  }
}


let randomId = () => Math.random().toString(36).slice(2, 8);

// function for escaping special regex characters
let regexEscape = s => s.replace(/[\\[\](\|)*?+.^$]/g, c => '\\' + c);
// these keys in entries in config contains information that needs to be removed from the test
let blacklist = ['id', 'pin', 'ddbcmsapipassword', 'salt', 'authid', 'authpassword', 'authgroupid', 'userpin', 'userid', 'password', 'group', 'user'];
/**
 * remove sensitive data from a string.
 * The sensitive data is paswords etc. given through the context.
 */
function censor(str, context) {
  // Identify strings that needs to be redacted
  let forbidden = {};
  for (let key in context) { // eslint-disable-line guard-for-in
    for (let i = 0; i < blacklist.length; ++i) {
      let word = context[key][blacklist[i]];
      if (word) {
        forbidden[word] = true;
      }
    }
  }
  // construct regex for global replacement in string
  let re = new RegExp('(' + Object.keys(forbidden).map(regexEscape).join('|') + ')', 'g');
  str = str.replace(re, 'XXXXX');

  // remove ncipPassword in results from openagency
  str = str.replace(/,\\"ncipPassword\\":{[^}]*}/g, '');
  return str;
}


/**
 * Utility function to write a unittest to a file.
 * The unit tests are typically saved `src/provider/__tests__/autotest_*.js`
 */
function saveTest(test) {
  if (test.createTest === 'mockfile') {
    fs.writeFileSync(mockFileName, censor(JSON.stringify(mockFile, null, 2), test.context));
    return;
  }

  let cleanedContext = {};
  for (let key1 in test.context) {
    cleanedContext[key1] = Object.assign({}, test.context[key1]);
    for (let key2 in cleanedContext[key1]) {
      if (blacklist.indexOf(key2) !== -1) {
        cleanedContext[key1][key2] = 'XXXXX';
      }
    }
  }

  let source = `/* eslint-disable max-len, quotes, comma-spacing, key-spacing, quote-props */
// Request: ${test.name} ${JSON.stringify(test.params)}
'use strict';
import Provider from '../../provider/Provider.js';
import {assert, fail} from 'chai';

let context = ${JSON.stringify(cleanedContext)};`;
  source += censor(`
let provider = Provider();
let mockData = ${JSON.stringify(test.mockData)};

describe('Automated test: ${test.filename}', () => {
  it('expected response. ID:${test.requestId}, for ${JSON.stringify(test.params)}', (done) => {
    context.mockData = mockData;
    provider.execute('${test.name}', ${JSON.stringify(test.params)}, context)
      .then(result => {
        assert.deepEqual(result,
            ${JSON.stringify(test.result)});
        done();
      })
      .catch(result => {
        fail({throw: result}, ${JSON.stringify(test.result)});
        done();
      });
  });
});
`, test.context);
  fs.writeFile(`${__dirname}/../transformers/__tests__/${test.filename}.js`, source);
}




class Context {
  constructor(transformerMap, data) {
    this.data = data;
    this.transformerMap = transformerMap;
    this.callsInProgress = 0;
    this.mockData = mockFile || (data.mockData ? Object.assign({}, data.mockData) : {});
    this.externalCallsInProgress = 0;
    this.externalTiming = 0;
    this.startTime = Date.now();
    this.requestId = randomId();
  }

  /**
   * Private method.
   *
   * This function is responsible for dispatching to transformers,
   * and different kind of api-requests. And also optionally
   * record timings and mock-data, and replay mock-data.
   *
   * @param type transformer, soapstring or basesoap
   * @param name name of service (or url)
   * @param params parameters for service
   * @returns promise with result
   */
  _call(type, name, params) {
    log.debug(type, {name, params});
    // take information about whether to create test/timings from outer call
    if (this.callsInProgress === 0) {
      this.createTest = params.createTest;
      this.timings = params.timings;
    }
    ++this.callsInProgress;

    let promise, mockId;

    if (type === 'transformer') {
      promise = this.transformerMap[name](params, this);
    }
    else {
      let url = this.data.services[name] || name;

      if (this.externalCallsInProgress === 0) {
        this.externalTiming -= Date.now();
      }
      ++this.externalCallsInProgress;

      mockId = JSON.stringify([name, params]); // key for mock data
      if (this.mockData[mockId]) {
        promise = new Promise(resolve => resolve(this.mockData[mockId]));
      } else if (type === 'soapstring') {
        promise = new Promise((resolve, reject) =>
            request.post(url, {form: {xml: params}},
              (err, _, data) => err ? reject(err) : resolve(data)));
      } else if (type === 'request') {
        promise = new Promise((resolve, reject) =>
          request(url, params, (err, response, data) =>
              (err || response.statusCode !== 200)
              ? reject(err || response)
              : resolve(data)));
      } else if (type === 'basesoap') {
        if (this.data.services[name]) {
          url = this.data.services[name] + '/' + name + '.wsdl';
        }
        let client = BaseSoapClient.client(url, params.config, null);
        promise = client.request(params.action, params.params, params.options);
      }
    }

    let handleResult = result => {
      log.trace(type, {name, params, result});
      --this.callsInProgress;
      if (type !== 'transformer') {
        --this.externalCallsInProgress;
        if (this.externalCallsInProgress === 0) {
          this.externalTiming += Date.now();
        }
      }
      if (testDev && (this.createTest || mockFileName) && type !== 'transformer') {
        this.mockData[mockId] = result;
      }
      if (testDev && this.createTest) { // save mock-data / create text-code
        if (this.callsInProgress === 0) {
          delete params.createTest;
          delete params.access_token;

          let filename = (this.createTest === 'random')
            ? `autotest_${test.name}_${this.requestId}`
            : this.createTest;
          saveTest({
            filename: filename,
            createTest: this.createTest,
            name: name, params: params,
            context: this.data,
            mockData: this.mockData, result: result,
            requestId: this.requestId});
          result.createTest = filename;
        }
      }
      if (this.callsInProgress === 0 && params.timings) {
        result.timings = {
          total: Date.now() - this.startTime,
          external: this.externalTiming
        };
      }
      return result;
    };

    return promise.then(
        handleResult,
        result => {
          throw handleResult(result);
        });
  }

  /**
   * This is a method on the context object,
   * which allows calling other transformers, and external endpoints.
   *
   * @param this the context
   * @param name the name of the endpoint
   * @param params the parameters to pass to the endpoint
   */
  call(name, params) {
    if (this.transformerMap[name]) {
      return this.transformer(name, params);
    }
    if (typeof params === 'object') {
      return this.query(name, params);
    }
    return this.soapstring(name, params);
  }

  transformer(name, params) {
    return this._call('transformer', name, params);
  }

  basesoap(name, params) {
    return this._call('basesoap', name, params);
  }

  query(name, params) {
    return this._call('request', name, {qs: params})
          .then(s => ({data: JSON.parse(s)}));
  }
  request(name, params) {
    return this._call('request', name, params);
  }
  soapstring(name, params) {
    return this._call('soapstring', name, params);
  }

  /**
   * Wraps an object in a class that makes it easy to get a subobject, og
   * specific value.
   *
   * examples of usage:
   *
   *    let c = new Context(context);
   *    c.get('rank.url')); // return string value
   *    c.get('rank'); // returns object
   *
   * @param {object} context the context object to wrap
   */
  get(key){
    let keys = key.split('.');
    let value = keys.reduce((o, name) => 
                            { return o && o[name]; }, this.data);
    return value;
  }
}

/**
 * Add a call function to the context.
 */
export default function caller(transformerMap, contextData) {
  return new Context(transformerMap, contextData);
}
