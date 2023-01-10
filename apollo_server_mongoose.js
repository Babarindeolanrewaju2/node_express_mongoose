const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

const User = require('./models/user');

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    addUser(name: String!, email: String!): User
  }
`;

const resolvers = {
  Query: {
    users: () => User.find(),
  },
  Mutation: {
    addUser: (_, { name, email }) => {
      const user = new User({
        name,
        email,
      });
      return user.save();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

const { request } = require('graphql-request');

const ENDPOINT = 'http://localhost:4000/graphql';

test('adds a new user', async () => {
  const mutation = `
    mutation($name: String!, $email: String!) {
      addUser(name: $name, email: $email) {
        _id
        name
        email
      }
    }
  `;
  const variables = {
    name: 'John Doe',
    email: 'john@doe.com',
  };
  const { addUser } = await request(ENDPOINT, mutation, variables);
  expect(addUser).toEqual({
    _id: expect.any(String),
    name: 'John Doe',
    email: 'john@doe.com',
  });
});
