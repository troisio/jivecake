export default {
  api: {
    url: 'https://api.jivecake.com'
  },
  sentry: {
    dsn: '$JC_SENTRY_DSN',
  },
  digitalocean: {
    spaces: {
      imageBucket: 'jivecake.nyc3',
      bucket: 'jivecake'
    }
  },
  stripe: {
    clientId: '$JC_STRIPE_LIVE_CLIENT_ID'
  }
};
