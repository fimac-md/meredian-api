const mongoose = require('mongoose');

module.exports.addressSchema = new mongoose.Schema({
  status: { type: String },
  qualifier: { type: String },
  street: {
    number: { type: String },
    name: { type: String },
    preDirectional: { type: String },
    type: { type: String },
    unit: {
      number: { type: String },
    },
  },
  location: {
    city: { type: String },
    state: { type: String },
    zipCode: { type: Number },
  },
  dateReported: { type: String },
});

module.exports.accountsSchema = new mongoose.Schema({
  subscriber: {
    industryCode: { type: String },
    memberCode: { type: String },
    name: {
      unparsed: { type: String },
    },
  },
  portfolioType: { type: String },
  accountNumber: { type: String },
  ECOADesignator: { type: String },
  account: {
    type: { type: String },
  },
  dateOpened: { type: String },
  dateEffective: { type: String },
  currentBalance: { type: Number },
  original: {
    creditGrantor: {
      unparsed: { type: String },
    },
    creditorClassification: { type: String },
    balance: { type: Number },
  },
  highCredit: { type: Number },
  creditLimit: { type: Number },
  pastDue: { type: Number },
  accountRating: { type: String },
  remark: {
    code: { type: String },
    type: { type: String },
  },
  terms: {
    paymentFrequency: { type: String },
    paymentScheduleMonthCount: { type: String },
    scheduledMonthlyPayment: { type: Number },
  },
  paymentHistory: {
    paymentPattern: {
      startDate: { type: String },
      text: { type: String },
    },
    historicalCounters: {
      monthsReviewedCount: { type: Number },
      late30DaysTotal: { type: Number },
      late60DaysTotal: { type: Number },
      late90DaysTotal: { type: Number },
    },
  },
  mostRecentPayment: {
    date: { type: String },
  },
  updateMethod: { type: String },
});
module.exports.creditSummarySchema = new mongoose.Schema({
  revolvingAmount: {
    percentAvailableCredit: { type: Number },
    highCredit: { type: Number },
    creditLimit: { type: Number },
    currentBalance: { type: Number },
    pastDue: { type: Number },
    monthlyPayment: { type: Number },
  },
  closedWithBalanceAmount: {
    currentBalance: { type: Number },
    pastDue: { type: Number },
    monthlyPayment: { type: Number },
  },
  totalAmount: {
    highCredit: { type: Number },
    creditLimit: { type: Number },
    currentBalance: { type: Number },
    pastDue: { type: Number },
    monthlyPayment: { type: Number },
  },
  recordCounts: {
    publicRecordCount: { type: Number },
    collectionCount: { type: Number },
    totalTradeCount: { type: Number },
    negativeTradeCount: { type: Number },
    historicalNegativeTradeCount: { type: Number },
    historicalNegativeOccurrencesCount: { type: Number },
    revolvingTradeCount: { type: Number },
    installmentTradeCount: { type: Number },
    mortgageTradeCount: { type: Number },
    openTradeCount: { type: Number },
    unspecifiedTradeCount: { type: Number },
    totalInquiryCount: { type: Number },
  },
});
module.exports.indicativeSchema = new mongoose.Schema({
  name: [
    {
      person: {
        first: { type: String },
        middle: { type: String },
        last: { type: String },
        generationalSuffix: { type: String },
      },
    },
    {
      qualifier: { type: String },
      person: {
        unparsed: { type: String },
      },
    },
  ],
  address: [this.addressSchema],
  socialSecurity: {
    number: { type: String },
  },
  dateOfBirth: { type: String },
  employment: {
    employer: {
      unparsed: { type: String },
    },
    dateOnFileSince: { type: String },
  },
});

module.exports.addOnProductSchema = new mongoose.Schema({
  code: { type: String },
  status: { type: String },
  scoreModel: {
    score: {
      results: { type: String },
      derogatoryAlert: { type: Boolean },
      fileInquiriesImpactedScore: { type: Boolean },
      factors: {
        factor: [
          {
            rank: { type: Number },
            code: { type: Number },
          },
        ],
      },
    },
  },
});
