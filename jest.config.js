module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: [
     '/node_modules/'
  ],
  moduleNameMapper: {
    server: '<rootDir>/server',
    web: '<rootDir>/web'
  },
};
