// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// require('ts-node').register({
//   compilerOptions: {
//     module: 'commonjs'
//   }
// });
// require('./karma.conf.ts');
const process = require('process');

module.exports = function (config) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
      require('karma-junit-reporter')
    ],
    client: {
      clearContext: false,
      runInParent: true,
      captureConsole: false
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/histodata-web'),
      reports: ['html', 'lcovonly', 'text-summary', 'cobertura'],
      fixWebpackSourcePaths: true
    },
    reporters: ["progress", "kjhtml", "junit"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    autoWatchBatchDelay: 1000,
    browsers: ["ChromeHeadless"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"]
      }
    },
    singleRun: false
  });
};
