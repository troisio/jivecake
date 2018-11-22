import packageJson from 'packageJson';

export const settings = {
  port: 9000,
  sentry: {
    dsn: '',
    environment: 'development',
    debug: true,
    release: packageJson.version
  },
  mongo: {
    url: 'mongodb://mongo:27017'
  },
  web: {
    origin: 'http://127.0.0.1'
  }
}
