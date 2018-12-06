import packageJson from 'packageJson';

export const settings = {
  port: 9000,
  sentry: {
    dsn: '',
    environment: 'development',
    debug: true,
    release: packageJson.version,
    local: true
  },
  digitalocean: {
    spaces: {
      endpoint: 'nyc3.digitaloceanspaces.com',
      key: '',
      secret: '',
      bucket: 'jivecake-development',
      region: 'nyc3'
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
}
