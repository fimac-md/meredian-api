const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Customer {
    id: ID!
    code: String
    email: String
    firstName: String!
    middleInit: String
    lastName: String!
    suffix: String
    phoneNumber: String!
    dateOfBirth: String
    ssn: String
    address: String
    address2: String
    addressNumber: String
    addressType: String
    addressPostDirection: String
    addressPreDirection: String
    addressUnit: String
    addressStreet: String
    city: String
    state: String
    zipCode: String
    leadId: Int
    accountCount: Int
    accountNumber: String
    routingNumber: String
    createdAt: Date
    updatedAt: Date
  }

  type CustomerResponse {
    ok: Boolean!
    customer: Customer
    errors: [Error!]
  }

  input CreateCustomerInput {
    email: String
    firstName: String!
    middleInit: String
    lastName: String!
    suffix: String
    phoneNumber: String!
    dateOfBirth: String
    ssn: String
    address: String
    address2: String
    addressNumber: String
    addressType: String
    addressPostDirection: String
    addressPreDirection: String
    addressUnit: String
    addressStreet: String
    city: String
    state: String
    zipCode: String
    leadId: Int
    accountNumber: String
    routingNumber: String
  }

  input UpdateCustomerInput {
    customerId: String!
    email: String
    firstName: String
    middleInit: String
    lastName: String
    suffix: String
    phoneNumber: String
    dateOfBirth: String
    ssn: String
    address: String
    address2: String
    addressNumber: String
    addressType: String
    addressPostDirection: String
    addressPreDirection: String
    addressUnit: String
    addressStreet: String
    city: String
    state: String
    leadId: Int
    zipCode: String
    accountNumber: String
    routingNumber: String
  }

  type Query {
    getCustomerById(customerId: String!): CustomerResponse
  }

  type Query {
    getCustomerByLeadId(leadId: String!): CustomerResponse
  }

  type Mutation {
    createCustomer(input: CreateCustomerInput): CustomerResponse
    updateCustomer(input: UpdateCustomerInput): CustomerResponse
  }
`;

module.exports = typeDefs;
