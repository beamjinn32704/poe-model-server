import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { DeviceMonitor } from './components/DeviceMonitor.js';

const isDev = window.location.port === '3000';
const backendHost = isDev ? `${window.location.hostname}:5000` : window.location.host;
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const httpProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

const httpLink = new HttpLink({
  uri: `${httpProtocol}//${backendHost}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${wsProtocol}//${backendHost}/`,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default function App() {
  const deviceCount = 4;
  const deviceIds = Array.from({ length: deviceCount }, (_, idx) => idx);

  return (
    <ApolloProvider client={client}>
      <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1 style={{ marginBottom: '24px' }}>Emergency Monitoring System</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {deviceIds.map((id) => (
            <DeviceMonitor key={id} deviceId={id} />
          ))}
        </div>
      </main>
    </ApolloProvider>
  );
}
