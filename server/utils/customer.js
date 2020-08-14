const Customer = require('../models/Customer');

const { pick } = require('lodash');
const axios = require('axios').default;
const { ERRORS } = require('../constants/errors');
const addressFields = ['address', 'address2', 'city', 'state', 'zipCode'];

module.exports.addressFieldsChanged = ({ customer, fields }) =>
  customer.address !== fields.address ||
  customer.address2 !== fields.address2 ||
  customer.city !== fields.city ||
  customer.state !== fields.state ||
  customer.zipCode !== fields.zipCode;

module.exports.tamuAddressFieldsFound = (customer) =>
  customer.addressStreet ||
  customer.addressPreDirection ||
  customer.addressPostDirection ||
  customer.addressType ||
  customer.addressNumber ||
  customer.addressUnit ||
  customer.addressUnitType ||
  customer.zip ||
  customer.zipPlus4;

module.exports.softVerifyCustomer = ({ input, customer }) => {
  console.log('softVerifyCustomer - input', input);
  console.log('softVerifyCustomer - customer', customer);
  return new Promise((resolve, reject) => {
    try {
      const customerVerified =
        input.firstName.toUpperCase() === customer.firstName.toUpperCase() &&
        input.lastName.toUpperCase() === customer.lastName.toUpperCase();
      if (!customerVerified)
        throw new Error(ERRORS.CUSTOMER.NOT_FOUND_WITH_PROVIDED_INFO);

      resolve(customerVerified);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.getTamuAddressInformation = ({ customer }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `${process.env.GEO_ADDRESS_API_URL}?apiKey=${
        process.env.GEO_ADDRESS_API_KEY
      }&version=${
        process.env.GEO_ADDRESS_API_VERSION
      }&responseFormat=json&nonParsedStreetAddress=${`${customer.address}${
        customer.address2 ? ', ' + customer.address2 : ''
      }`}&nonParsedCity=${customer.city}&nonParsedState=${
        customer.state
      }&nonParsedZIP=${customer.zipCode}`;

      const { data } = await axios.get(url);

      if (data.QueryStatusCode !== 'Success') {
        console.log('customer input', customer);
        console.log('data', data);
        throw new Error(ERRORS.TAMU.UNKNOWN);
      }

      // return first street address

      resolve(data.StreetAddresses[0]);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

// function isn't pure it will change customer data.
module.exports.performAddressVerificationAndUpdateCustomerAddressFields = ({
  customer,
  fields,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // when submitting check if address matches previously stored address.
      const areAddressFieldChanged = this.addressFieldsChanged({
        customer,
        fields,
      });

      // if yes = check tamu address values exist in db
      const areTamuFieldsFound = this.tamuAddressFieldsFound(customer);

      // no changes were made and we have tamufields just return
      if (!areAddressFieldChanged && areTamuFieldsFound) resolve(customer);

      // if address fields changed let's update them and do a lookup;
      let updatedCustomer;
      let addressInformation;

      // if address fields changed or if we don't have tamufields go get them.
      if (areAddressFieldChanged || !areTamuFieldsFound) {
        // update if address changed otherwise just get the
        const updateCustomerFields = this.getAddressFields(fields);
        updatedCustomer = await Customer.findOneAndUpdate(
          { _id: customer.id },
          updateCustomerFields,
          {
            upsert: false,
            new: true,
          }
        );

        // get tamu information
        addressInformation = await this.getTamuAddressInformation({
          customer: updatedCustomer,
        });

        const addressBody = pick(addressInformation, [
          'Number',
          'PreDirectional',
          'StreetName',
          'Suffix',
          'SuiteNumber',
          'PostDirectional',
          'ZIP',
          'ZIPPlus4',
        ]);

        // store tamu fields in database
        updatedCustomer = await Customer.findOneAndUpdate(
          { _id: customer.id },
          {
            addressStreet: addressBody.StreetName,
            addressPreDirection: addressBody.PreDirectional,
            addressPostDirection: addressBody.PostDirectional,
            addressType: addressBody.Suffix,
            addressNumber: addressBody.Number,
            addressUnit: addressBody.SuiteNumber,
            zip: addressBody.ZIP,
            zipPlus4: addressBody.ZIPPlus4,
          },
          {
            upsert: false,
            new: true,
          }
        );

        resolve(updatedCustomer);
      } else {
        resolve(customer);
      }
    } catch (error) {
      console.log('error', error);
      reject(error);
    }
  });
};

module.exports.removeSensitiveFields = (input) => {
  const updateValues = { ...input };
  const sensitiveFields = ['ssn', 'accountNumber', 'routingNumber'];
  sensitiveFields.map((field) => {
    if (
      updateValues[field] &&
      updateValues[field].includes(process.env.CREDIT_CARD_REPLACE_CHARACTER)
    )
      delete updateValues[field];
  });
  return updateValues;
};

module.exports.getAddressFields = (input) => {
  return pick(input, addressFields);
};
module.exports.maskSensitiveCustomerData = (c) => {
  const ssn = c.ssn
    ? `${process.env.CREDIT_CARD_REPLACE_CHARACTER.repeat(5)}${c.ssn.slice(-4)}`
    : null;
  const accountNumber = c.accountNumber
    ? `${process.env.CREDIT_CARD_REPLACE_CHARACTER.repeat(
        5
      )}${c.accountNumber.slice(-4)}`
    : null;
  const routingNumber = c.routingNumber
    ? `${process.env.CREDIT_CARD_REPLACE_CHARACTER.repeat(
        5
      )}${c.routingNumber.slice(-4)}`
    : null;

  return {
    ...c.toObject(),
    id: c.id,
    ssn,
    routingNumber,
    accountNumber,
  };
};
