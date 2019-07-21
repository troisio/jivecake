export default {
  api: {
    url: 'http://127.0.0.1:9000'
  },
  sentry: {
    dsn: '',
    debug: true,
    environment: 'development'
  },
  digitalocean: {
    spaces: {
      imageBucket: 'jivecake.nyc3',
      bucket: 'jivecake-development'
    }
  },
  stripe: {
    clientId: '',
    publishable_api_key: ''
  }
};
