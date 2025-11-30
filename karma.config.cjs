const path = require('path');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = (config) => {
  const specs = (config.specs || '').split(',');
  const srcFiles = (config.src || '').split(',');
  const frameworks = (config.f || 'mocha').split(',');

  srcFiles.unshift(
    'node_modules/chai/chai.js',
    'node_modules/chai-spies/chai-spies.js',
    'src/test/config.ts'
  );
  specs.unshift(
    'src/test/interface_examples.ts',
    'src/test/default_suite_tracking_examples.ts'
  );

  config.set({
    frameworks,
    basePath: '.',
    reporters: ['dots'],
    autoWatch: false,
    singleRun: true,
    browsers: ['ChromeHeadless'],
    files: frameworks.includes('mocha') ? specs : srcFiles.concat(specs),
    preprocessors: {
      '**/*.ts': ['esbuild']
    },
    esbuild: {
      target: 'es2015',
      tsconfig: './tsconfig.json'
    },
    client: {
      mocha: {
        ui: config.u,
        require: srcFiles.reverse().map((filePath) => path.resolve(filePath))
      }
    }
  });
};
