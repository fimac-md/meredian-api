const fetch = require('node-fetch');
const createParamString = require('./createParamString');
const { isJsonResponse, nonJsonErrorMsg } = require('../utils/responseValidation');
const { noticeError, errorObject } = require('../utils/errors');
const Customer = require('../models/Customer');
const Account = require('../models/Account');

const connectDatabase = require('../models/connectDatabase');

const getCustomerData = async (queryString) => {
  await connectDatabase();

  const { leadId } = queryString;
  const query = { leadId };
  const customer = await Customer.find(query).lean();
  return customer;
}

const getAccountData = async (queryString) => {
  await connectDatabase();

  const { customerId } = queryString;
  const query = { customerId };
  const account = await Account.find(query).lean();
  return account;
}

const getCustomersData = async (queryString) => {
  await connectDatabase();

  const { limit, skip, sort='_id' } = queryString;
  const limitInt = parseInt(limit, 10);
  const skipInt = parseInt(skip, 10);
  const customers = await Customer.find({ "leadId": { $exists: true } })
    .skip(skipInt)
    .limit(limitInt)
    .sort(sort)
    .lean();
  return customers;
}

const getAccountsData = async (queryString) => {
  await connectDatabase();

  const { limit, skip, sort='_id' } = queryString;
  const limitInt = parseInt(limit, 10);
  const skipInt = parseInt(skip, 10);
  const accounts = await Account.find({ "customerId": { $exists: true } })
    .skip(skipInt)
    .limit(limitInt)
    .sort(sort)
    .lean();

    const accountsResponse = accounts.map(account => {
      if (!account.createdAt) {
        account.createdAt = account._id.getTimestamp().toISOString()
      }
      if (!account.updatedAt) {
        account.updatedAt = account._id.getTimestamp().toISOString()
      }
      return account;
    });
  return accountsResponse;
}

const postCreditSoftData = async (query, body, headers) => {

  const { path } = query;
  const { authorization } = headers;

  const pathToUse = (path && path.indexOf('/') > -1) ? path : '';

  const url = `${process.env.CSOFT_API_BASE}${pathToUse}`;
  
  const options = {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      authorization,
      'content-type': 'application/json',
    },
  };

  const response = await fetch(url, options);
  const validResponse = isJsonResponse(response);
  const responseBody = validResponse ? await response.json() : await response.text();
  if (validResponse && response.status < 300) {
    return responseBody;
  }

  const errorStatus = response.status >= 300 ? response.status : 500;
  const errorBody = validResponse ? JSON.stringify(responseBody) : nonJsonErrorMsg(responseBody);
  const errMsgAdd = !validResponse ? 'Invalid JSON' : '';
  const errMsg = `postCreditSoftData backend error ${errMsgAdd}`;
  const errObj = errorObject(errMsg, errorBody, errorStatus);
  noticeError(errObj);
  return errObj;
};

const getCreditSoftData = async (query, headers) => {
  const { path, LeadID, Token } = query;
  const params = { LeadID, Token };
  const { authorization } = headers;

  const pathToUse = (path && path.indexOf('/') > -1) ? path : '';
  const url = `${process.env.CSOFT_API_BASE}${pathToUse}?${createParamString(params)}`;
  
  console.log('url', url);

  const options = {
    method: 'get',
    headers: {
      authorization,
    },
  };

  const response = await fetch(url, options);
  console.log('response GET', response);

  const validResponse = isJsonResponse(response);
  const responseBody = validResponse ? await response.json() : await response.text();
  console.log('response body GET', responseBody);
  if (validResponse && response.status < 300) {
    return responseBody;
  }

  const errorStatus = response.status >= 300 ? response.status : 500;
  const errorBody = validResponse ? JSON.stringify(responseBody) : nonJsonErrorMsg(responseBody);
  const errMsgAdd = !validResponse ? 'Invalid JSON' : '';
  const errMsg = `getCreditSoftData backend error ${errMsgAdd}`;
  const errObj = errorObject(errMsg, errorBody, errorStatus);
  noticeError(errObj);
  return errObj;

};

module.exports = {
  getCustomerData,
  getAccountData,
  getCustomersData,
  getAccountsData,
  postCreditSoftData,
  getCreditSoftData,
};
