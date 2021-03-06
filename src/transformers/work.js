'use strict';

import moreinfo21 from './moreinfo-2.1';
import moreinfo26 from './moreinfo';
import openSearchWorkTransformer from './opensearchGetObject';
import searchTransformer from './opensearchSearch';
import {requestType, makeTypeID} from '../requestTypeIdentifier';
import _ from 'lodash';
import {log} from '../utils';

let filePath = __dirname + '/../../doc/work-context.jsonld';
let typeId = makeTypeID(filePath);

let requestMethod = {
  MOREINFO: 'moreinfo',
  SEARCH: 'search',
  GETOBJECT: 'getobject'
};

function isGetObject(field) {
  return (typeId.isType(field, requestType.DKABM)
  || typeId.isType(field, requestType.BRIEFDISPLAY)
  || typeId.isType(field, requestType.RELATIONS));
}

export function workRequest(request, context) { // eslint-disable-line no-unused-vars

  let state = {};
  if (_.has(request, 'pids') && request.pids.length > 0) {
    state.pid = request.pids[0]; // saves pid for use in responder.
    state.pids = request.pids;
  }
  let transformedRequests = {};
  if (_.has(request, 'fields')) {
    // Only call clients which can contribute the given fields.
    let fields = request.fields;
    // Determine which OpenSearch-method to use:
    // If the collection-field is given, then the OpenSearch request should
    // be given to the search method. Else it should be given to the getObject method.
    if (fields.some(field => typeId.isType(field, requestType.COLLECTION))) {
      // A collection is found.
      // Restructure this request as a Search request for retrieving collection only!
      transformedRequests[requestMethod.SEARCH] = [];
      for (let i=0; i<request.pids.length; i++) {
        let searchRequest = {
          q: 'rec.id=' + request.pids[i],
          fields: ['collection'],
          offset: 0,
          limit: 1
        };
        if (_.contains(fields, 'collectionDetails')) {
          searchRequest.fields.push('collectionDetails');
        }
        transformedRequests[requestMethod.SEARCH].push(searchRequest);
      }
    }
    if (fields.some(field => isGetObject(field))) {
      // send this as a getObjectRequest
      transformedRequests[requestMethod.GETOBJECT] = request;
    }

    if (fields.some(field => typeId.isType(field, requestType.MOREINFO))) {
      // send this to the coverurl transformer.
      transformedRequests[requestMethod.MOREINFO] = {pids: request.pids};
    }
  } else { // eslint-disable-line brace-style
    // Default:
    // Return dkabm, briefdisplay and relations from getObject
    // This should be default behaviour for getObject with no fields!
    transformedRequests.getobject = request;
  }
  return {transformedRequest: transformedRequests, state: state};
}

export function workResponse(response, context, state) { // eslint-disable-line no-unused-vars
  let envelope = {
    statusCode: 200
    // data: []
  };
  // loop over at most three promises (getObject, search and moreInfo):
  for (let i = 0; i < response.length; i++) {
    let resp = response[i];
    // evaluate the statusCode for getObject and moreInfo
    if (resp.statusCode && resp.statusCode !== 200) {
      // Setting error envelope if found!
      envelope = resp;
      break;
    }
    // evaluate statusCode for list of responses from search
    if (resp.length) {
      let error = false;
      for (let x=0; x<resp.length; x++) {
        if (resp[x].statusCode !== 200) {
          envelope = resp[i];
          error = true;
          break;
        }
      }
      if (error) {
        break;
      }
    }
    // Set number of data elements if not done in previous iteration
    if (!envelope.data) {
      // Damn, this feel hacked.
      // But if you just do 'let x = Array(3).fill({})', you will get an array with the same
      // object three times. So if you add to x[0], you will also add to x[1] and x[2].
      // Not exactly what I expected.
      if (resp.data || (resp.length > 0 && resp[0].data)) {
        // Length is dependent on which services were called.
        // If search were the first service, the an array is returned, else an object with arrays in data.
        let length = resp.data ? resp.data.length : resp.length;
        envelope.data = Array(length).fill(1).map(x => { // eslint-disable-line no-unused-vars
          return {};
        });
      } else {
        // Here be dragons!
        // The response does not contain any data - I don't think this is a good thing,
        // but i cant be certain. It might be that the call just returned no data - ie nothing was found.
        // To be sure, i'll return 'ok', and empty data.
        envelope.data = [];
        return envelope;
      }
    }

    // I need to collect the data from the different services.
    // I have an assumption, that there will be equally many results in each.
    switch (state.services[i]) {
      case requestMethod.MOREINFO:
        // TODO: Check that pids corresponds.
        for (let x = 0; x < resp.data.length; x++) {
          let respData = resp.data[x];
          if (respData.pid) {
            delete (respData.pid); // remove the pid.
          }
          _.extend(envelope.data[x], respData);
        }
        break;
      case requestMethod.GETOBJECT:
        for (let x = 0; x<resp.data.length; x++) {
          _.extend(envelope.data[x], resp.data[x]);
        }
        break;
      case requestMethod.SEARCH:
        for (let x = 0; x<resp.length; x++) {
          let coll = {};
          if (resp[x].data[0]) {
            coll.collection = resp[x].data[0].collection;
            if (resp[x].data[0].collectionDetails) {
              coll.collectionDetails = resp[x].data[0].collectionDetails;
            }
          }
          _.extend(envelope.data[x], coll);
        }
        break;
      default:
      // We should never get here.
    }
  }

  return envelope;
}

export default (request, context) => {
  let {transformedRequest: params, state: state} = workRequest(request, context);

  let services = []; // state-data for knowing which servies is called and in which order.
  let promises = [];
  if (_.has(params, requestMethod.MOREINFO)) {
    // query moreinfo through its transformer.

    // HACK: This is a hack to be able to switch between moreinfo 2.1 and 2.6 just by changing the url in the context.
    let moreinfoUrl = context.get('services.moreinfo');
    log.info('moreinfoUrl: ' + moreinfoUrl);
    let moreInfoPromise = moreinfoUrl.includes('2.1') ? moreinfo21(params.moreinfo, context): moreinfo26(params.moreinfo, context);

    promises.push(moreInfoPromise);
    services.push(requestMethod.MOREINFO);
  }
  if (_.has(params, requestMethod.GETOBJECT)) {
    // query opensearch through getObject method
    let getObjectPromise = openSearchWorkTransformer(params.getobject, context);
    promises.push(getObjectPromise);
    services.push(requestMethod.GETOBJECT);
  }
  if (_.has(params, requestMethod.SEARCH)) {
    // query opensearch through search method
    let searchPromises = [];
    for (let i = 0; i < params.search.length; i++) {
      let prom = searchTransformer(params.search[i], context);
      searchPromises.push(prom);
    }
    promises.push(Promise.all(searchPromises));
    services.push(requestMethod.SEARCH);
  }
  state.services = services;

  return Promise.all(promises).then(body => {
    return workResponse(body, context, state);
  }).then(result => {
    let dataUrls = (request.fields || []).filter(key => key.startsWith('coverDataUrl'));
    if (dataUrls.length === 0) {
      return result;
    }
    let requests = [];
    for (let field of dataUrls) {
      for (let i = 0; i < result.data.length; ++i) {
        let url = (result.data[i][field.replace('coverDataUrl', 'coverUrl')] || [])[0];
        if (url) {
          requests.push({url, field, i});
        }
      }
    }
    requests = requests.map(req =>
      context.request('http:' + req.url, {encoding: null}).then(o => {
        let str = `data:image/jpeg;base64,${new Buffer(o, 'binary').toString('base64')}`;
        result.data[req.i][req.field] = str;
      }));
    return Promise.all(requests).then(any => result);
  });
};
