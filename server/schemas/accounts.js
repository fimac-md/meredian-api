const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar Date
  type Account {
    id: ID!
    customerId: String!
    tradeAccounts: [TuAccount]
    collectionAccounts: [TuAccount]
    creditSummary: TuCreditSummary
    indicative: TuIndicative
    addOnProduct: [TuAddOnProduct]
    createdAt: Date
    updatedAt: Date
  }

  input TransUnionInput {
    customerId: String!
    ssn: String
    dateOfBirth: String
    firstName: String
    middleInit: String
    lastName: String
    suffix: String
    address: String
    address2: String
    city: String
    state: String
    zipCode: String
  }

  type AccountsResponse {
    ok: Boolean!
    accounts: Account
    errors: [Error!]
  }

  type Query {
    getAccountsForCustomer(customerId: String!): AccountsResponse
    getAccountsFromCode(code: String!): AccountsResponse
    getAccountInformationFromTransUnion(
      input: TransUnionInput!
    ): AccountsResponse
  }
`;

module.exports = typeDefs;
