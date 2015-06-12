import Reflux from 'reflux';
import QueryUtil from '../utils/query.util.js';
import queryUpdate from '../actions/QueryUpdate.action.js';

// Setup dataobject for query
// @todo We may need to initialize it with data from the URL or an global object,
// passed through the html
let _query = [];

/**
 * Store containing the current query of the page
 */
let QueryStore = Reflux.createStore({

  // Initial setup by reflux
  init() {
    // Register statusUpdate action
    this.listenTo(queryUpdate, this.update);
  },

  // update the query object and trigger an action
  update(query) {
    _query = query
    let cql = QueryUtil.objectToCql(query);
    this.trigger(_query);
  },

  // return the query store
  getQuery() {
    return _query;
  },

  // return the content of the querystore as cql
  getCql(){
    return QueryUtil.queryToCql(_query);
  }
});

export default QueryStore;