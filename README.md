# **karma-postcss-preprocessor**

Karma preprocessor to compile postcss and scss files with [Postcss](https://github.com/postcss/postcss).

[![Travis](https://img.shields.io/travis/vanduynslagerp/karma-postcss-preprocessor.svg)](https://travis-ci.org/vanduynslagerp/karma-postcss-preprocessor)
[![AppVeyor](https://img.shields.io/appveyor/ci/vanduynslagerp/karma-postcss-preprocessor.svg)](https://ci.appveyor.com/project/vanduynslagerp/karma-postcss-preprocessor)
[![Code Climate](https://img.shields.io/codeclimate/github/vanduynslagerp/karma-postcss-preprocessor.svg)](https://codeclimate.com/github/vanduynslagerp/karma-postcss-preprocessor)
[![Code Climate](https://img.shields.io/codeclimate/issues/github/vanduynslagerp/karma-postcss-preprocessor.svg)](https://codeclimate.com/github/vanduynslagerp/karma-postcss-preprocessor/issues)
[![Codecov](https://img.shields.io/codecov/c/github/vanduynslagerp/karma-postcss-preprocessor.svg)](https://codecov.io/gh/vanduynslagerp/karma-postcss-preprocessor)

[![npm](https://img.shields.io/npm/v/@metahub/karma-postcss-preprocessor.svg)](https://www.npmjs.com/package/@metahub/karma-postcss-preprocessor)
[![npm](https://img.shields.io/npm/dt/@metahub/karma-postcss-preprocessor.svg)](https://www.npmjs.com/package/@metahub/karma-postcss-preprocessor)
[![Greenkeeper badge](https://badges.greenkeeper.io/vanduynslagerp/karma-postcss-preprocessor.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/vanduynslagerp/karma-postcss-preprocessor.svg)](https://github.com/vanduynslagerp/karma-postcss-preprocessor/blob/master/LICENSE)

## Installation

```bash
npm install postcss @metahub/karma-postcss-preprocessor --save-dev
```

[Postcss plugins](https://www.postcss.parts) have to be installed individually. For example:

```bash
npm install autoprefixer cssnano --save-dev
```

## Configuration

All the [postcss](http://api.postcss.org/global.html#processOptions) options can be passed to `postcssPreprocessor.options`.

In addition the preprocessor accept a `transformPath` function, to rewrite the path on which the files are deployed on the Karma webserver. If not specified, the processed files will be accessible with the same paths as the originals. For example `test/fixtures/myStyle.css` will be deployed as `base/test/fixtures/myStyle.css`.

### Standard

```js
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = function(config) {
  config.set({
    files: ['src/**/*.css', 'test/fixtures/**/*.css'],

    plugins: ['@metahub/karma-postcss-preprocessor', 'karma-*'],
    preprocessors: {
      'src/**/*.css': ['postcss'],
      'test/fixtures/**/*.css': ['postcss'],
    },

    postcssPreprocessor: {
      options: {
        // To include inlined sourcemaps as data URIs
        map: true,
        plugins: [autoprefixer, cssnano],
      },
      // File test/fixtures/myStyle.ccs will be accessible in the unit test on path base/styles/myStyle.css
      transformPath: filePath => filePath.replace('test/fixtures/', 'styles/')
    },
  });
};
```
**_Note: Karma can auto-load plugins named `karma-*` (see [plugins](http://karma-runner.github.io/1.0/config/plugins.html)). Unfortunatly it doesn't work with [scoped packages](https://docs.npmjs.com/misc/scope), therefore `@metahub/karma-postcss-preprocessor` has to be explicitly added to the `plugins` configuration. In order to continue to automatically load other plugins you can add `karma-*` to the `plugins` configuration._**

### Configured Preprocessors
See [configured preprocessors](http://karma-runner.github.io/1.0/config/preprocessors.html).

```js
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = function(config) {  
  config.set({
    files: ['src/**/*.css', 'test/fixtures/**/*.css'],

    plugins: ['@metahub/karma-postcss-preprocessor', 'karma-*'],
    preprocessors: {
      'src/**/*.css': ['postcss_1'],
      'test/fixtures/**/*.css': ['postcss_2'],
    },

    customPreprocessors: {
      postcss_1: {
        base: 'postcss',
        options: {
          plugins: [autoprefixer, cssnano]
          map: true,
        },
        // File test/fixtures/myStyle.ccs will be accessible in the unit test on path test/fixtures/myStyle.min.ccs
        transformPath: filePath => filePath.replace(/\.css$/, '.min.css')
      },
      postcss_2: {
        base: 'postcss',
        options: {
          plugins: [autoprefixer],
        },
      },
    },
  });
};
```

### With karma-sass-preprocessor

To compile sass/scss files with [node-sass](https://github.com/sass/node-sass) then process them with [Postcss](https://github.com/postcss/postcss) you can use [@metahub/karma-sass-preprocessor](https://github.com/vanduynslagerp/karma-sass-preprocessor).

```bash
npm install node-sass @metahub/karma-sass-preprocessor --save-dev
```

```js
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = function(config) {
  config.set({
    files: ['src/**/*.+(scss|sass)', 'test/fixtures/**/*.+(scss|sass)'],

    plugins: ['@metahub/karma-sass-preprocessor', '@metahub/karma-postcss-preprocessor', 'karma-*'],
    preprocessors: {
      'src/**/*.+(scss|sass)': ['sass', 'postcss'],
      'test/fixtures/**/*.+(scss|sass)': ['sass', 'postcss'],
    },

    sassPreprocessor: {
      options: {
        sourceMap: true,
      },
    },
    postcssPreprocessor: {
      options: {
        map: true,
        plugins: [autoprefixer, cssnano],
      },
    },
  });
};
```
