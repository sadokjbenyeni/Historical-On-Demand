const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'firefox',
  firefoxOptions: {
    args: ['--headless', '--no-sandbox']
  }
};

exports.config = config;