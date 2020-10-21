const moment = require('moment');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId; 

const {
  maskSensitiveCustomerData,
  removeSensitiveFields,
  performAddressVerificationAndUpdateCustomerAddressFields,
} = require('../utils/customer');
const { generateCode } = require('../utils/customerCodes');

const { ERRORS } = require('../constants/errors');
const convertError = require('../utils/convertErrors');

const Customer = require('../models/Customer');
const Account = require('../models/Account');
const CustomerCode = require('../models/CustomerCode');

const connectDatabase = require('../models/connectDatabase');

const createCustomerResponse = ({ ok, customer = null, errors = null }) => ({
  ok,
  customer,
  errors,
});

module.exports = {
  Query: {
    getCustomerById: async (parent, { customerId }, { isAdmin }) => {
      try {
        await connectDatabase();
        // TODO: check for accounts in db for this user/code

        // const query = { _id: new ObjectId(customerId) };
        let customer = await Customer.findOne({ _id: ObjectId("5f905a2d02d3650017e0a898") });
        console.log('customer', customer);
  
        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);
        // TODO: use https://docs.mongodb.com/manual/reference/operator/aggregation/size/#exp._S_size
        // to get the count here.

        const accountCount = await Account.countDocuments({
          customerId: customer.id,
        });

        if (!customer)
          throw new Error(ERRORS.CUSTOMER.NOT_FOUND_WITH_PROVIDED_INFO);

        if (!isAdmin) {
          customer = maskSensitiveCustomerData(customer);
        }
        customer.accountCount = accountCount;
        console.log('customer.accountCount', customer.accountCount);
        return createCustomerResponse({
          ok: true,
          customer,
        });
      } catch (error) {
        console.log('error', error);
        return createCustomerResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
    getCustomerByLeadId: async (parent, { leadId }, { isAdmin }) => {
      try {
        await connectDatabase();
        // TODO: check for accounts in db for this user/code

        // const query = { _id: new ObjectId(customerId) };
        let customer = await Customer.findOne({ leadId: leadId });
        console.log('customer', customer);
  
        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);
        // TODO: use https://docs.mongodb.com/manual/reference/operator/aggregation/size/#exp._S_size
        // to get the count here.

        const accountCount = await Account.countDocuments({
          customerId: customer.id,
        });

        if (!customer)
          throw new Error(ERRORS.CUSTOMER.NOT_FOUND_WITH_PROVIDED_INFO);

        if (!isAdmin) {
          customer = maskSensitiveCustomerData(customer);
        }
        customer.accountCount = accountCount;
        console.log('customer.accountCount', customer.accountCount);
        return createCustomerResponse({
          ok: true,
          customer,
        });
      } catch (error) {
        console.log('error', error);
        return createCustomerResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
  },  
  Mutation: {
    createCustomer: async (parent, { input }, { isAdmin }) => {
      try {
        const code = generateCode(Number(process.env.CODE_LENGTH || '6'));

        await connectDatabase();

        let customer = await Customer.create({
          ...input,
        });

        const customerCode = await CustomerCode.create({
          customerId: customer.id,
          code,
          expiry: moment()
            .utc()
            .add(Number(process.env.CODE_EXPIRY_IN_MINUTES), 'minutes'),
        });

        if (!isAdmin) {
          customer = maskSensitiveCustomerData(customer);
        } else {
          customer = customer.toObject();
          customer.id = customer._id;
        }

        const response = createCustomerResponse({
          ok: true,
          customer: {
            ...customer,
            code: customerCode.code,
          },
        });

        return response;
      } catch (error) {
        return createCustomerResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
    updateCustomer: async (parent, { input }, { isAdmin }) => {
      try {
        const { customerId } = input;
        console.log('updateCustomer - customerId', customerId);
        if (!customerId) throw new Error(ERRORS.CUSTOMER.ID_REQUIRED);
        let updateValues = removeSensitiveFields(input);
        await connectDatabase();
        //const query = { _id: new ObjectId(customerId) };
        let customer = await Customer.findById(customerId);

        if (!customer) throw new Error(ERRORS.CUSTOMER.NOT_FOUND);

        // perform address verification and  addresses information
        customer = await performAddressVerificationAndUpdateCustomerAddressFields(
          {
            customer,
            fields: input,
          }
        );

        // update all other information
        customer = await Customer.findOneAndUpdate(
          { _id: customerId },
          updateValues,
          {
            upsert: false,
          }
        );

        if (!isAdmin) {
          customer = maskSensitiveCustomerData(customer);
        } else {
          customer = customer.toObject();
          customer.id = customer._id;
        }

        return createCustomerResponse({
          ok: true,
          customer,
        });
      } catch (error) {
        console.log('error', error);
        return createCustomerResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
  },
};
