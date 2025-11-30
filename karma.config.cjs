const path = require('path');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = (config) => {
  const specs = (config.specs || '').split(',');
  const srcFiles = (config.src || '').split(',').filter(Boolean);
  const frameworks = (config.f || 'mocha').split(',');

  srcFiles.unshift(
    'node_modules/chai/chai.js',
    'node_modules/chai-spies/chai-spies.js',
    'src/test/config.ts'
  );
  
  // Add activation script if using mocha
  if (frameworks.includes('mocha')) {
    srcFiles.push('src/test/activate_mocha_ui.js');
  }

  specs.unshift(
    'src/test/interface_examples.ts',
    'src/test/default_suite_tracking_examples.ts'
  );

  const files = srcFiles.filter(f => !f.includes('dist/mocha.js')).concat(specs);
  
  const processedFiles = files.map(file => {
    if (typeof file === 'string' && !file.includes('node_modules/') && !file.includes('dist/')) {
      return { pattern: file, type: 'module' };
    }
    return file;
  });

  config.set({
    frameworks,
    basePath: '.',
    reporters: ['dots'],
    autoWatch: false,
    singleRun: true,
    browsers: ['ChromeHeadless'],
    files: processedFiles,
    preprocessors: {
      '**/*.ts': ['esbuild'],
      'src/**/*.js': ['esbuild'],
      'dist/**/*.js': ['esbuild']
    },
    esbuild: {
      target: 'es2015',
      tsconfig: './tsconfig.json'
    },
    client: {
      mocha: {
        ui: 'bdd' // Start with bdd, switch to bdd-lazy-var-next later
      }
    }
  });
};
