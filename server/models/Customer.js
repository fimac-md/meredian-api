const { encrypt } = require('../utils/encryption');

const mongoose = require('mongoose');
const { default: validatorF } = require('validator');

const CustomerSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: (v) => validatorF.isEmail(v),
      message: 'Email validation failed',
    },
    unique: true,
  },
  phoneNumber: { type: String, required: true, unique: true },
  ssn: { type: String, required: false, unique: true },
  firstName: { type: String, required: true },
  middleInit: { type: String, required: false },
  lastName: { type: String, required: true },
  suffix: { type: String, required: false },
  addressNumber: { type: String, required: false },
  addressType: { type: String, required: false },
  addressPostDirection: { type: String, required: false },
  addressPreDirection: { type: String, required: false },
  addressUnit: { type: String, required: false },
  addressStreet: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  zipCode: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// TODO: encrypt ssn in database;
CustomerSchema.pre('save', async function () {
  const customer = this;
  if (customer.isModified('ssn')) {
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);
