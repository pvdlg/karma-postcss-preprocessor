import path from 'path';
import {copy} from 'fs-extra';
import test from 'ava';
import {stub} from 'sinon';
import tempy from 'tempy';
import cssnano from 'cssnano';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import atImport from 'postcss-import';
import {run, watch, waitForRunComplete} from './helpers/karma';

let stubWrite;

test.before(() => {
  stubWrite = stub(process.stdout, 'write');
});

test.after(() => {
  stubWrite.restore();
});

test('Compile css file', async t => {
  const {success, error, disconnected, errMsg} = await run(
    ['test/fixtures/basic.css', 'test/fixtures/styles.test.js'],
    {
      options: {plugins: [atImport, mixins, simpleVars, cssnano]},
    }
  );

  t.ifError(error, `Karma returned the error: ${errMsg}`);
  t.ifError(disconnected, 'Karma disconnected');
  t.is(success, 1, 'Expected 1 test successful');
});

test('Compile css file with custom preprocessor', async t => {
  const {success, error, disconnected, errMsg} = await run(
    ['test/fixtures/basic.custom.css', 'test/fixtures/styles.test.js'],
    {
      options: {plugins: [atImport, mixins, simpleVars, cssnano]},
    }
  );

  t.ifError(error, `Karma returned the error: ${errMsg}`);
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
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const subPartial = path.join(includePath, 'sub-partial.css');

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);

  console.log(fixture.replace('fixtures', '*').replace('with', '+(with|nomatch)'), 'test/fixtures/styles.test.js');
  const {server, watcher} = await watch(
    [fixture.replace('fixtures', '*').replace('with', '+(with|nomatch)'), 'test/fixtures/styles.test.js'],
    {options: {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]}}
  );

  try {
    let {success, error, disconnected, errMsg} = await waitForRunComplete(server);

    t.ifError(error, `Karma returned the error: ${errMsg}`);
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');

    watcher.emit('change', partial);
    ({success, error, disconnected, errMsg} = await waitForRunComplete(server));

    t.ifError(error, `Karma returned the error: ${errMsg}`);
    t.ifError(disconnected, 'Karma disconnected');
    t.is(success, 1, 'Expected 1 test successful');
  } finally {
    await server.emitAsync('exit');
  }
});
