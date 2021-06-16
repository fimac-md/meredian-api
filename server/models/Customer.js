const mongoose = require('mongoose');
const { default: validatorF } = require('validator');

const CustomerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  ssn: { type: String, required: false },
  firstName: { type: String, required: true },
  middleInit: { type: String, required: false },
  lastName: { type: String, required: true },
  suffix: { type: String, required: false },
  dateOfBirth: { type: String, required: false },
  address: { type: String, required: false },
  address2: { type: String, required: false },
  addressNumber: { type: String, required: false },
  addressType: { type: String, required: false },
  addressPostDirection: { type: String, required: false },
  addressPreDirection: { type: String, required: false },
  addressUnit: { type: String, required: false },
  addressUnitType: { type: String, required: false },
  addressStreet: { type: String, required: false },
  zip: { type: String, required: false },
  zipPlus4: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  zipCode: { type: String, required: false },
  accountNumber: { type: String, required: false },
  routingNumber: { type: String, required: false },
  leadId: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CustomerSchema.index({ leadId: -1 });

// TODO: encrypt ssn in database;
CustomerSchema.pre('save', async function () {
  const customer = this;
  if (customer.isModified('ssn')) {
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);
