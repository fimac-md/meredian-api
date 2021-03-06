const moment = require('moment');

const CustomerCode = require('../models/CustomerCode');
const { ERRORS } = require('../constants/errors');
const convertError = require('../utils/convertErrors');
const { generateToken } = require('../utils/tokens');
const Customer = require('../models/Customer');

const connectDatabase = require('../models/connectDatabase');

const createTokenResponse = ({ ok, token = null, errors = null }) => ({
  ok,
  token,
  errors,
});

const getCustomer = ({
  code = null,
  phoneNumber = null,
  customerId = null,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let customer;
      if (code && phoneNumber) {
        const customerCode = await CustomerCode.findOne({ code });
        if (!customerCode) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);
        const expiry = moment(customerCode.expiry).utc();

        const now = moment().utc();

        if (expiry.isBefore(now)) throw new Error(ERRORS.CODE.EXPIRED);

        // TODO: check for accounts in db for this user/code
        const customer = await Customer.findOne({
          phoneNumber,
          _id: customerCode.customerId,
        });
        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);

        customer.code = customerCode.code;
        resolve(customer);
      } else if (customerId) {
        const customer = await Customer.findById(customerId);
        resolve(customer);
      } else {
        throw new Error(ERRORS.CUSTOMER.NOT_FOUND);
      }
    } catch (error) {
      console.log('error', error);
      reject(error);
    }
  });
};
module.exports = {
  Query: {
    getTokenByCodeAndPhoneNumber: async (
      parent,
      { code, phoneNumber },
      context
    ) => {
      try {
        await connectDatabase();

        const customer = await getCustomer({ code, phoneNumber });

        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);

        const token = await generateToken({
          user: {
            displayName: `${customer.firstName} ${customer.lastName}`,
            code: customer.code,
            id: customer.id,
          },
          type: 'Customer',
        });

        return createTokenResponse({
          ok: true,
          token,
        });
      } catch (error) {
        console.log('error', error);
        return createTokenResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
    getTokenByCustomerId: async (parent, { customerId }, context) => {
      try {
        await connectDatabase();

        const customer = await getCustomer({ customerId });

        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);

        const token = await generateToken({
          user: {
            displayName: `${customer.firstName} ${customer.lastName}`,
            code: customer.code,
            id: customer.id,
          },
          type: 'Customer',
        });

        return createTokenResponse({
          ok: true,
          token,
        });
      } catch (error) {
        console.log('error', error);
        return createTokenResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
  },
};
