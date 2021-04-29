const {
  getAccounts,
  performAccountMasking,
  createAccountsResponse,
} = require('../utils/accounts');
const {
  softVerifyCustomer,
  performAddressVerificationAndUpdateCustomerAddressFields,
} = require('../utils/customer');

const { pick } = require('lodash');

const axios = require('axios').default;
const omit = require('lodash/omit');
const { ERRORS } = require('../constants/errors');
const convertError = require('../utils/convertErrors');
const Customer = require('../models/Customer');
const Account = require('../models/Account');

const connectDatabase = require('../models/connectDatabase');

module.exports = {
  Query: {
    getAccountsForCustomer: async (parent, { customerId }, { isAdmin }) => {
      try {
        let accounts = await getAccounts({ customerId });
        if (!accounts) throw new Error(ERRORS.ACCOUNT.NOT_FOUND);
        accounts = performAccountMasking({ accounts, isAdmin });

        return createAccountsResponse({
          ok: true,
          accounts,
        });
      } catch (error) {
        return createAccountsResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
    getAccountsFromCode: async (parent, { code }, { isAdmin }) => {
      try {
        let accounts = await getAccounts({ code });
        if (!accounts) throw new Error(ERRORS.ACCOUNT.NOT_FOUND);
        accounts = performAccountMasking({ accounts, isAdmin });

        return createAccountsResponse({
          ok: true,
          accounts,
        });
      } catch (error) {
        return createAccountsResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
    getAccountInformationFromTransUnion: async (
      parent,
      { input },
      { isAdmin }
    ) => {
      try {
        await connectDatabase();

        // connecting to test transunion data
        let customer = await Customer.findById(input.customerId);

        if (!customer)
          throw new Error(ERRORS.CUSTOMER.NOT_FOUND_WITH_PROVIDED_INFO);

        const account = await Account.findOne({
          customerId: customer.id,
        });

        await softVerifyCustomer({ input, customer });
        const body = omit(input, ['customerId']);

        // check for address changes and get TAMU fields if they have changed
        customer = await performAddressVerificationAndUpdateCustomerAddressFields(
          {
            customer,
            fields: body,
          }
        );
        // save if values on customer change
        if (
          customer.ssn &&
          !body.ssn.includes(process.env.CREDIT_CARD_REPLACE_CHARACTER)
        ) {
          // save all fields including new ssn if it's not the masked version

          customer = await Customer.findOneAndUpdate(
            { _id: customer.id },
            body,
            {
              upsert: false,
              new: true,
            }
          );
        } else {
          // only save non ssn fields
          customer = await Customer.findOneAndUpdate(
            { _id: customer.id },
            omit(body, ['ssn']),
            {
              upsert: false,
              new: true,
            }
          );
        }

        let accounts;

        if (
          !account ||
          (account.tradeAccounts.length === 0 &&
            account.collectionAccounts.length === 0)
        ) {
          // Check to see if we have TransUnion specific address fields, if not go get them and add them to the body
          // const addressVerification

          // pull pertinent data from customer object
          const tuRequestBody = pick(customer, [
            'ssn',
            'addressUnit',
            'lastName',
            'addressStreet',
            'zipCode',
            'addressPreDirection',
            'addressPostDirection',
            'state',
            'firstName',
            'city',
            'addressType',
            'addressNumber',
            'middleInit',
            'dateOfBirth',
          ]);

          // call transunion to get account information for this user.
          const result = await axios.post(
            process.env.TU_API_PATH,
            tuRequestBody
          );

          console.log('TU - result.data', result.data);

          accounts = await Account.findOneAndUpdate(
            { customerId: customer.id },
            { customerId: customer.id, ...result.data },
            { new: true, upsert: true }
          );
        } else {
          // do not call transunion if we already have data
          accounts = await Account.findOne({ customerId: customer.id });
        }
        if (!accounts) throw new Error(ERRORS.ACCOUNT.NOT_FOUND);
        accounts = performAccountMasking({ accounts, isAdmin });

        return createAccountsResponse({
          ok: true,
          accounts,
        });
      } catch (error) {
        console.log('error', error);
        return createAccountsResponse({
          ok: false,
          errors: convertError(error),
        });
      }
    },
  },
};
