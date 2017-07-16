import test from 'ava';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import scssSyntax from 'postcss-scss';
import run from './helpers/run';

test('Compile css file', async t => {
  const fixture = 'test/fixtures/basic.css';
  const {success, failed, error, disconnected, exitCode} = await run('Basic css', fixture, {
    plugins: [mixins, simpleVars, autoprefixer, cssnano],
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with custom preprocessor', async t => {
  const fixture = 'test/fixtures/basic.custom.css';
  const {success, failed, error, disconnected, exitCode} = await run('Css file with custom preprocessor', fixture, {
    plugins: [mixins, simpleVars, autoprefixer, cssnano],
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with sourcemap', async t => {
  const fixture = 'test/fixtures/basic.css';
  const {success, failed, error, disconnected, exitCode} = await run('Scss file with sourcemap', fixture, {
    sourceMap: true,
    plugins: [mixins, simpleVars, autoprefixer, cssnano],
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

// Test('Compile scss file with partial import', async t => {
//   const fixture = 'test/fixtures/with-partial.scss';
//   const sassOpts = {
//     includePaths: ['test/fixtures/partials'],
//   };
//   const {success, failed, error, disconnected, exitCode} = await run(
//     'Scss file with partial import',
//     fixture,
//     sassOpts
//   );
//
//   t.ifError(error, 'Karma returned an error');
//   t.ifError(disconnected, 'Karma disconnected');
//   t.is(exitCode, 0, 'Expected zero exit code');
//   t.is(success, 1, 'Expected 1 test successful');
//   t.is(failed, 0, 'Expected no failed test');
// });

test.only('Parse scss file with syntax options', async t => {
  const fixture = 'test/fixtures/basic.scss';
  const {success, failed, error, disconnected, exitCode} = await run('Scss file with options', fixture, {
    parser: require('postcss-scss'),
    plugins: [autoprefixer],
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Preserve css file if no plugin is defined', async t => {
  const fixture = 'test/fixtures/basic.css';
  const {success, failed, error, disconnected, exitCode} = await run('Basic css', fixture, {});

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Log error on invalid css file', async t => {
  const fixture = 'test/fixtures/error.css';
  const {success, failed, error, disconnected, exitCode} = await run(
    'Invalid css file',
    fixture,
    {
      plugins: [mixins, simpleVars, autoprefixer, cssnano],
    },
    true
  );

  t.ifError(disconnected, 'Karma disconnected');
  t.true(error, 'Expected an error to be returned');
  t.is(exitCode, 1, 'Expected non zero exit code');
  t.is(success, 0, 'Expected no test successful');
  t.is(failed, 0, 'Expected no failed test');
});
