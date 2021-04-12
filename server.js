const node_env = process.env.NODE_ENV || 'production';
if (node_env !== 'production') require('dotenv').config({ path: __dirname + '/.env', silent: false });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ApolloServer } = require('apollo-server-express');
const context = require('./server/utils/context');
const helment = require('helmet');
const logger = require('./server/utils/logger');
const creditsoft = require('./server/routes/creditsoft');
const transunionData = require('./server/routes/transunionData');
const { validateToken, findCustomer } = require('./server/utils/tokens');

// Provide schemas for apollo server
const typeDefs = require('./server/schemas/index');

// Provide resolver functions for your schema fields
const resolvers = require('./server/resolvers/index');

const log = logger('meredian-api');

(async () => {
  // initialize server
  const app = express();
  app.use(helment());
  const allowedOrigin = process.env.CORS_URL
    ? process.env.CORS_URL.split(',')
    : [''];

  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/creditsoft', creditsoft(log));
  app.use('/transunionData', transunionData(log));

  const playground = process.env.GRAPHQL_PLAYGROUND_ENABLED === 'true';
  const introspection = process.env.GRAPHQL_INTROSPECTION_ENABLED === 'true';

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection,
    playground,
    formatError: (err) => {
      console.log('graphql: error', err);
      return err;
    },
    subscriptions: {
      onConnect: async (connectionParams, webSocket) => {
        try {
          if (connectionParams['x-auth']) {
            if (connectionParams['x-auth'] === process.env.PASSTHROUGH_TOKEN)
              return { isAdmin: true };

            const decoded = await validateToken(connectionParams['x-auth']);
            const user = await findCustomer(decoded);

            return { user, isAdmin: false };
          }
          throw new Error('Missing auth token!');
        } catch (e) {
          throw e;
        }
      },
    },
  });

  server.applyMiddleware({
    app,
    cors: false,
  });

  const httpServer = http.createServer(app);

  server.installSubscriptionHandlers(httpServer);
  const ipaddr = process.env.IP || 'localhost';
  const PORT = Number(process.env.PORT) || 4001;

  httpServer.listen({ port: PORT }, async () => {
    console.log(
      `🚀 GraphQL Server ready at http://${ipaddr}:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 GraphQL Subscriptions ready at ws://${ipaddr}:${PORT}${server.subscriptionsPath}`
    );
  });
})();
