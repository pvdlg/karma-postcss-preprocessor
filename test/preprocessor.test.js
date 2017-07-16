import test from 'ava';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import run from './helpers/run';

// eslint-disable-next-line no-magic-numbers
process.setMaxListeners(15);

test('Compile css file', async t => {
  const {success, failed, error, disconnected, exitCode} = await run('Basic css', 'test/fixtures/basic.css', {
    options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with custom preprocessor', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Css file with custom preprocessor', 'test/fixtures/basic.custom.css', {
    options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with sourcemap (options.sourceMap)', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Css file with sourcemap (options.sourceMap)', 'test/fixtures/basic.css', {
    options: {sourceMap: true, plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with sourcemap (options.map)', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Css file with sourcemap (options.map)', 'test/fixtures/basic.css', {
    options: {map: true, plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with non css extension', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Basic css with non css extension', 'test/fixtures/basic.txt', {
    options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with non css extension and custom transformPath', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Basic css with non css extension and custom transformPath', 'test/fixtures/basic.txt', {
    options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
    transformPath: filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''),
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with non css extension, custom transformPath and custom preprocessor', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run(
    'Basic css with non css extension, custom transformPath and custom preprocessor',
    'test/fixtures/basic.custom.txt',
    {
      options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
      transformPath: filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''),
    }
  );

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Compile css file with no extension', async t => {
  const {
    success,
    failed,
    error,
    disconnected,
    exitCode,
  } = await run('Basic css with no extension', 'test/fixtures/basic', {
    options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Preserve css file if no option defined', async t => {
  const {success, failed, error, disconnected, exitCode} = await run(
    'Basic css with no plugin is defined',
    'test/fixtures/basic.css'
  );

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(exitCode, 0, 'Expected zero exit code');
  t.is(success, 1, 'Expected 1 test successful');
  t.is(failed, 0, 'Expected no failed test');
});

test('Log error on invalid css file', async t => {
  const {success, failed, error, disconnected, exitCode} = await run(
    'Invalid css file',
    'test/fixtures/error.css',
    {options: {plugins: [mixins, simpleVars, autoprefixer, cssnano]}},
    true
  );

  t.ifError(disconnected, 'Karma disconnected');
  t.true(error, 'Expected an error to be returned');
  t.is(exitCode, 1, 'Expected non zero exit code');
  t.is(success, 0, 'Expected no test successful');
  t.is(failed, 0, 'Expected no failed test');
});
