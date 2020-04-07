// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// require('ts-node').register({
//   compilerOptions: {
//     module: 'commonjs'
//   }
// });
// require('./karma.conf.ts');

const process = require('process');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-firefox-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma")
    ],
    client: {
      clearContext: false,
      runInParent: true,
      captureConsole: false
    },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "coverage"),
      reports: ["html", "lcovonly"],
      fixWebpackSourcePaths: true
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    autoWatchBatchDelay: 1000,
    browsers: ["Firefox"],
    customLaunchers: {
      FirefoxHeadlessCI: {
        base: "FirefoxHeadless",
        flags: ["--no-sandbox"]
      }
    },
    singleRun: false
  });
};
