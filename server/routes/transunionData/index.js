const { Router } = require('express');
const { json } = require('body-parser');
const { wrapErrors } = require('../../utils/errors');
const {
  getCustomerData,
  getAccountData,
  getCustomersData,
  getAccountsData,
} = require('../../handlers');

const trackRequests = log => (req, res, next) => {
  const { headers, params, query, body } = req;
  log.trace({
    action: '/activity',
    request: {
      headers,
      params,
      query,
      body,
    },
  });
  return next();
};

const getCustomerHandler = async(req, res) => {
  const { query, headers } = req;

  const getCustomer = await getCustomerData(query, headers);
  
  return res.send(getCustomer);
};

const getAccountHandler = async(req, res) => {
  const { query, headers } = req;

  const getAccount = await getAccountData(query, headers);
  
  return res.send(getAccount);
};

const getCustomersHandler = async(req, res) => {
  const { query, headers } = req;

  const getCustomers = await getCustomersData(query, headers);
  
  return res.send(getCustomers);
};

const getAccountsHandler = async(req, res) => {
  const { query, headers } = req;

  const getAccounts = await getAccountsData(query, headers);
  
  return res.send(getAccounts);
};

// const postCreditSoftHandler = async(req, res) => {
//   //console.log('req.body', req.body.import.members);
//   const { query, body, headers } = req;

//   const postCSData = await postCreditSoftData(query, body, headers);
  
//   return res.send(postCSData);
// };

const transunionData = (log) => {
  const api = Router();
  api.use('*', json(), trackRequests(log));
  api.get('/customer', wrapErrors(getCustomerHandler));
  api.get('/account', wrapErrors(getAccountHandler));
  api.get('/customers', wrapErrors(getCustomersHandler));
  api.get('/accounts', wrapErrors(getAccountsHandler));
  return api;
}

module.exports = transunionData;
