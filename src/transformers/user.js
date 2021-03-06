'use strict';
/**
 * @file
 * User transformer.
 *
 * Wraps userstatus backend.
 */
import {pbkdf2} from 'crypto';

/**
 * Maps loan item from backend response to serviceprovider api
 * @param {Object} obj openuserstatus loans response
 * @returns response with mapped keys
 */
function loan(loanItem) {

  let result = {loanId: loanItem.loanId.$,
                dueDate: loanItem.dateDue.$,
               title: loanItem.title.$};
  if (loanItem.author) {
    result.author = loanItem.author.$;
  }
  return result;
}


/**
 * Maps order item from backend response to serviceprovider api
 * @param {Object} obj openuserstatus orders response
 * @returns response with mapped keys
 */
function order(orderItem) {
  let result = {title: orderItem.title.$,
                orderId: `${orderItem.orderType.$}:${orderItem.orderId.$}`,
                orderDate: orderItem.orderDate.$,
                status: orderItem.orderStatus.$,
                library: orderItem.pickUpAgency.$
               };
  if (orderItem.holdQueuePosition) {
    result.holdQueuePosition = orderItem.holdQueuePosition.$;
  }
  if (orderItem.author) {
    result.author = orderItem.author.$;
  }
  return result;
}

/**
 * Default transformer.
 * Wraps openuserstatus backend and returns user info
 *
 * @param {Object} params parameters from the user (no entries from this object is used)
 * @param {Object} context The context object fetched from smaug
 * @returns promise with result
 * @api public
 */
export default (request, context) => {

  if (!(context.get('user.id') && context.get('user.pin'))) {
    return {statusCode: 300, error: 'not logged in'};
  }
  let params = {
    agencyId: context.get('user.agency'),
    userId: context.get('user.id'),
    userPincode: context.get('user.pin'),
    'authentication.groupIdAut': context.get('netpunkt.group'),
    'authentication.passwordAut': context.get('netpunkt.password'),
    'authentication.userIdAut': context.get('netpunkt.user'),
    action: 'getUserStatus',
    outputType: 'json'
  };

  let idPromise = new Promise((resolve, reject) =>
    pbkdf2(context.get('user.agency').replace(/^DK-/, '') + ' ' + context.get('user.id'),
      context.get('user.salt'), 100000, 24, 'sha512', (err, key) => err ? reject(err) : resolve(key)));

  return context.call('openuserstatus', params).then(body => idPromise.then(id => {

    let loans = [];
    if (body.data.getUserStatusResponse.userStatus.loanedItems.loan) {
      loans = body.data.getUserStatusResponse.userStatus.loanedItems.loan;
    }
    let orders = [];
    if (body.data.getUserStatusResponse.userStatus.orderedItems.order) {
      orders = body.data.getUserStatusResponse.userStatus.orderedItems.order;
    }

    let data = {id: id.toString('base64'),
                loans: loans.map(loan),
                orders: orders.map(order)
               };
    if (context.get('services.ddbcmsapi')) {
      data.ddbcmsapi = context.get('services.ddbcmsapi');
    }

    return {statusCode: 200, data: data};
  }));
};
