const mongoose = require('mongoose');
const {
  accountsSchema,
  creditSummarySchema,
  indicativeSchema,
  addOnProductSchema,
} = require('./subDocuments');

const AccountSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  tradeAccounts: [accountsSchema],
  collectionAccounts: [accountsSchema],
  creditSummary: { type: creditSummarySchema, required: false },
  indicative: indicativeSchema,
  addOnProduct: [addOnProductSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AccountSchema.index({ customerId: -1 });

// TODO: encrypt credit card number in database;
AccountSchema.pre('save', async function () {
  const account = this;
  if (account.isModified('accountNumber')) {
  }
});

module.exports = mongoose.model('Account', AccountSchema);
