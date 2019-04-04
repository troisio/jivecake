import packageJson from 'packageJson';

export const settings = {
  port: 9000,
  http: {
    origins: ['http://127.0.0.1', 'https://jivecake.com']
  },
  sentry: {
    dsn: '',
    environment: 'development',
    debug: true,
    release: packageJson.version,
    local: true
  },
  digitalocean: {
    spaces: {
      key: '',
      secret: '',
      endpoint: 'nyc3.digitaloceanspaces.com',
      region: 'nyc3',
      bucket: 'jivecake-development'
    }
  },
  sendinblue: {
    key: ''
  },
  stripe: {
    secret: ''
  },
  mongo: {
    url: 'mongodb://mongo:27017'
  },
  web: {
    origin: 'http://127.0.0.1'
  }
};
