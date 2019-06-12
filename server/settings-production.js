import packageJson from 'packageJson';

export const settings = {
  admins: $JC_ADMINS_PRODUCTION,
  port: 443,
  http: {
    origins: ['https://jivecake.com', 'http://jivecake.com']
  },
  sentry: {
    dsn: '$JC_SENTRY_DSN',
    environment: 'production',
    debug: true,
    release: packageJson.version
  },
  digitalocean: {
    spaces: {
      key: '$JC_DIGITALOCEAN_KEY_PRODUCTION',
      secret: '$JC_DIGITALOCEAN_SECRET_KEY_PRODUCTION',
      endpoint: 'nyc3.digitaloceanspaces.com',
      region: 'nyc3',
      bucket: 'jivecake-development'
    }
  },
  sendinblue: {
    key: '$JC_SENDINBLUE_KEY_PRODUCTION'
  },
  stripe: {
    secret: '$JC_STRIPE_SECRET_PRODUCTION'
  },
  mongo: {
    url: '$JC_MONGO_URL_PRODUCTION'
  },
  web: {
    origin: 'https://jivecake.com'
  }
};
