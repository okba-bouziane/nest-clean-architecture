export const appSettings = {
  // Requests to /api are proxied to the NestJS API (see proxy.conf.json)
  apiUrl: '/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'clean-tasks',
    clientId: 'clean-tasks-web',
  },
};
