const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type TuAccount {
    id: ID!
    subscriber: TuSubscriber
    portfolioType: String
    accountNumber: String
    ECOADesignator: String
    account: TuAccountType
    dateOpened: String
    dateEffective: String
    currentBalance: Int
    original: TuOriginal
    highCredit: Int
    creditLimit: Int
    pastDue: Int
    accountRating: String
    remark: TuRemark
    terms: TuTerms
    paymentHistory: TuPaymentHistory
    mostRecentPayment: TuMostRecentPayment
    updateMethod: String
  }
  type TuCreditSummary {
    id: ID!
    revolvingAmount: TuRevolvingAmount
    closedWithBalanceAmount: TuClosedWithBalanceAmount
    totalAmount: TuTotalAmount
    recordCounts: TuRecordCounts
  }

  type TuIndicative {
    id: ID!
    name: [TuName]
    address: [TuAddress]
    socialSecurity: TuSocialSecurity
    dateOfBirth: String
    employment: TuEmployment
  }
  type TuAddOnProduct {
    id: ID!
    code: String
    status: String
    scoreModel: TuScoreModel
  }

  type TuRecordCounts {
    id: ID!
    publicRecordCount: Int
    collectionCount: Int
    totalTradeCount: Int
    negativeTradeCount: Int
    historicalNegativeTradeCount: Int
    historicalNegativeOccurrencesCount: Int
    revolvingTradeCount: Int
    installmentTradeCount: Int
    mortgageTradeCount: Int
    openTradeCount: Int
    unspecifiedTradeCount: Int
    totalInquiryCount: Int
  }

  type TuTotalAmount {
    id: ID!
    highCredit: Int
    creditLimit: Int
    currentBalance: Int
    pastDue: Int
    monthlyPayment: Int
  }
  type TuClosedWithBalanceAmount {
    id: ID!
    currentBalance: Int
    pastDue: Int
    monthlyPayment: Int
  }
  type TuRevolvingAmount {
    id: ID!
    percentAvailableCredit: Int
    highCredit: Int
    creditLimit: Int
    currentBalance: Int
    pastDue: Int
    monthlyPayment: Int
  }
  type TuSubscriberName {
    id: ID!
    unparsed: String
  }

  type TuSubscriber {
    id: ID!
    industryCode: String
    memberCode: String
    name: TuSubscriberName
  }
  type TuAccountType {
    id: ID!
    type: String
  }

  type TuCreditGrantor {
    id: ID!
    unparsed: String
  }

  type TuOriginal {
    id: ID!
    creditGrantor: TuCreditGrantor
    creditorClassification: String
    balance: Int
  }

  type TuRemark {
    id: ID!
    code: String
    type: String
  }

  type TuTerms {
    id: ID!
    paymentScheduleMonthCount: String
    scheduledMonthlyPayment: Int
  }

  type TuPaymentPatterns {
    id: ID!
    startDate: String
    text: String
  }

  type TuPaymentHistoricalCounters {
    id: ID!
    monthsReviewedCount: Int
    late30DaysTotal: Int
    late60DaysTotal: Int
    late90DaysTotal: Int
  }

  type TuPaymentHistory {
    id: ID!
    paymentPattern: TuPaymentPatterns
    historicalCounters: TuPaymentHistoricalCounters
  }

  type TuMostRecentPayment {
    id: ID!
    date: String
  }

  type TuPerson {
    id: ID!
    first: String
    middle: String
    last: String
    generationalSuffix: String
  }
  type TuName {
    id: ID!
    qualifier: String
    person: TuPerson
  }
  type TuSocialSecurity {
    id: ID!
    number: String
  }

  type TuUnit {
    id: ID!
    number: String
  }
  type TuStreet {
    id: ID!
    number: String
    name: String
    preDirectional: String
    type: String
    unit: TuUnit
  }
  type TuLocation {
    id: ID!
    city: String
    state: String
    zipCode: Int
  }

  type TuEmployer {
    id: ID!
    unparsed: String
  }
  type TuEmployment {
    id: ID!
    employer: TuEmployer
    dateOnFileSince: String
  }
  type TuAddress {
    id: ID!
    status: String
    qualifier: String
    street: TuStreet
    location: TuLocation
    dateReported: String
  }

  type TuFactor {
    id: ID!
    rank: Int
    code: Int
  }
  type TuFactors {
    id: ID!
    factor: [TuFactor]
  }
  type TuScore {
    id: ID!
    results: String
    derogatoryAlert: Boolean
    fileInquiriesImpactedScore: Boolean
    factors: TuFactors
  }
  type TuScoreModel {
    id: ID!
    score: TuScore
  }
`;

module.exports = typeDefs;
