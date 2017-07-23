import path from 'path';
import {utimes, copy, readFile, outputFile} from 'fs-extra';
import test from 'ava';
import pTimeout from 'p-timeout';
import cssnano from 'cssnano';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import atImport from 'postcss-import';
import {run, watch, waitForRunComplete} from './helpers/karma';
import {tmp} from './helpers/utils';

test('Compile css file', async t => {
  const {success, error, disconnected} = await run(['test/fixtures/basic.css', 'test/fixtures/styles.test.js'], {
    options: {plugins: [atImport, mixins, simpleVars, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(success, 1, 'Expected 1 test successful');
});

test('Compile css file with custom preprocessor', async t => {
  const {success, error, disconnected} = await run(['test/fixtures/basic.custom.css', 'test/fixtures/styles.test.js'], {
    options: {plugins: [atImport, mixins, simpleVars, cssnano]},
  });

  t.ifError(error, 'Karma returned an error');
  t.ifError(disconnected, 'Karma disconnected');
  t.is(success, 1, 'Expected 1 test successful');
});

test('Log error on invalid css file', async t => {
  const {error, disconnected, exitCode} = await run('test/fixtures/error.css', {
    options: {plugins: [atImport, mixins, simpleVars, cssnano]},
  });

  t.ifError(disconnected, 'Karma disconnected');
  t.true(error, 'Expected an error to be returned');
  t.is(exitCode, 1, 'Expected non zero exit code');
});

test('Re-compile css file when dependency is modified', async t => {
  const dir = path.resolve(tmp());
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const subPartial = path.join(includePath, 'sub-partial.css');

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);

  const server = await watch([fixture, 'test/fixtures/styles.test.js'], {
    options: {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]},
  });

  try {
    let {success, error, disconnected} = await waitForRunComplete(server);

    t.ifError(error, 'Karma returned an error');
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');

    utimes(partial, Date.now() / 1000, Date.now() / 1000);
    ({success, error, disconnected} = await waitForRunComplete(server));

    t.ifError(error, 'Karma returned an error');
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');
  } finally {
    await server.emitAsync('exit');
  }
});

test('Do not recompile css file when dependency is not imported anymore', async t => {
  const dir = path.resolve(tmp());
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const partialAlt = path.join(includePath, 'partial-alt.css');
  const subPartial = path.join(includePath, 'sub-partial.css');

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/partial.css', partialAlt),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);

  const server = await watch([fixture, 'test/fixtures/styles.test.js'], {
    options: {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]},
  });

  try {
    let {success, error, disconnected} = await waitForRunComplete(server);

    t.ifError(error, 'Karma returned an error');
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');

    await outputFile(
      fixture,
      (await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
    );
    ({success, error, disconnected} = await waitForRunComplete(server));
    t.ifError(error, 'Karma returned an error');
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');

    utimes(partial, Date.now() / 1000, Date.now() / 1000);
    await t.throws(waitForRunComplete(server), pTimeout.TimeoutError);
  } finally {
    await server.emitAsync('exit');
  }
});
