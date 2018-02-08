import path from 'path';
import {readFile, copy, outputFile, remove} from 'fs-extra';
import test from 'ava';
import {spy, match} from 'sinon';
import tempy from 'tempy';
import cssnano from 'cssnano';
import mixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import atImport from 'postcss-import';
import {waitFor, compile} from './helpers/utils';
import {mockPreprocessor} from './helpers/mock';

test('Compile css file', async t => {
  const fixture = 'test/fixtures/basic.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile css file without plugins', async t => {
  const fixture = 'test/fixtures/basic.css';
  const {preprocessor, debug} = await mockPreprocessor();
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile css file with sourcemap (options.sourceMap)', async t => {
  const fixture = 'test/fixtures/basic.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano], sourceMap: true};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};
  const {css, map} = await compile(fixture, options);

  t.is(await preprocessor(await readFile(fixture), file), css);
  t.deepEqual(file.sourceMap, map);
  t.is(file.sourceMap.file, path.basename(fixture));
  t.truthy(file.sourceMap.mappings);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile css file with sourcemap (options.map)', async t => {
  const fixture = 'test/fixtures/basic.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano], map: true};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};
  const {css, map} = await compile(fixture, options);

  t.is(await preprocessor(await readFile(fixture), file), css);
  t.deepEqual(file.sourceMap, map);
  t.is(file.sourceMap.file, path.basename(fixture));
  t.truthy(file.sourceMap.mappings);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile scss file with sourcemap (options.sourceMap) and custom preprocessor', async t => {
  const fixture = 'test/fixtures/basic.custom.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano], sourceMap: true};
  const {preprocessor, debug} = await mockPreprocessor({options});
  const file = {originalPath: fixture};
  const {css, map} = await compile(fixture, options);

  t.is(await preprocessor(await readFile(fixture), file), css);
  t.deepEqual(file.sourceMap, map);
  t.is(file.sourceMap.file, path.basename(fixture));
  t.truthy(file.sourceMap.mappings);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.custom.css'));
});

test('Compile scss file with sourcemap (options.map) and custom preprocessor', async t => {
  const fixture = 'test/fixtures/basic.custom.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano], map: true};
  const {preprocessor, debug} = await mockPreprocessor({options});
  const file = {originalPath: fixture};
  const {css, map} = await compile(fixture, options);

  t.is(await preprocessor(await readFile(fixture), file), css);
  t.deepEqual(file.sourceMap, map);
  t.is(file.sourceMap.file, path.basename(fixture));
  t.truthy(file.sourceMap.mappings);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.custom.css'));
});

test('Compile scss file with partial import', async t => {
  const fixture = 'test/fixtures/with-partial.css';
  const options = {plugins: [atImport({path: ['test/fixtures/partials']}), mixins, simpleVars, cssnano]};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/with-partial.css'));
});

test('Compile scss file with non css extension', async t => {
  const fixture = 'test/fixtures/basic.txt';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile css file with no extension', async t => {
  const fixture = 'test/fixtures/basic';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.is(path.resolve(file.path), path.resolve('test/fixtures/basic.css'));
});

test('Compile css file with custom transformPath', async t => {
  const fixture = 'test/fixtures/basic.txt';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const transformPath = spy(filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''));
  const {preprocessor, debug} = await mockPreprocessor({}, {postcssPreprocessor: {transformPath, options}});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.true(transformPath.calledOnce);
  t.is(path.resolve(file.path), path.resolve('test/basic.css'));
});

test('Compile css file with custom transformPath and custom preprocessor', async t => {
  const fixture = 'test/fixtures/basic.custom.txt';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const transformPath = spy(filePath => filePath.replace(/\.(txt)$/, '.css').replace('fixtures/', ''));
  const {preprocessor, debug} = await mockPreprocessor({transformPath, options});
  const file = {originalPath: fixture};

  t.is(await preprocessor(await readFile(fixture), file), (await compile(fixture, options)).css);
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.true(transformPath.calledOnce);
  t.is(path.resolve(file.path), path.resolve('test/basic.custom.css'));
});

test('Log error on invalid css file', async t => {
  const fixture = 'test/fixtures/error.css';
  const options = {plugins: [atImport, mixins, simpleVars, cssnano]};
  const {preprocessor, debug, error} = await mockPreprocessor({}, {postcssPreprocessor: {options}});
  const file = {originalPath: fixture};
  const err = await t.throws(preprocessor(await readFile(fixture), file));

  t.is(err.name, 'CssSyntaxError');
  t.true(debug.firstCall.calledWith(match('Processing'), fixture));
  t.true(err.message.includes('Undefined mixin text-red'));

  // eslint-disable-next-line no-magic-numbers
  t.is(err.line, 14);
  t.is(path.resolve(err.file), path.resolve(fixture));
  // eslint-disable-next-line no-magic-numbers
  t.true(error.firstCall.calledWith(match.string, match('Undefined mixin text-red'), fixture, match(14)));
});

test('Instanciate watcher only if autoWatch is true', async t => {
  let {FSWatcher} = await mockPreprocessor();

  t.true(FSWatcher.notCalled);
  ({FSWatcher} = await mockPreprocessor({}, {autoWatch: true}));

  t.true(FSWatcher.calledOnce);
});

test('Add dependency to watcher', async t => {
  const fixture = 'test/fixtures/with-partial.css';
  const partial = path.resolve('test/fixtures/partials/partial.css');
  const subPartial = path.resolve('test/fixtures/partials/sub-partial.css');
  const options = {plugins: [atImport({path: ['test/fixtures/partials']}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {files: [{pattern: fixture, watched: true}], autoWatch: true, postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await preprocessor(await readFile(fixture), file);
  t.true(debug.secondCall.calledWith(match('Watching'), partial));
  t.true(debug.thirdCall.calledWith(match('Watching'), subPartial));
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partial, subPartial])));
  t.true(watcher.add.calledOnce);
});

test('Add dependency to watcher for file added with glob', async t => {
  const fixture = 'test/fixtures/with-partial.css';
  const glob = 'test/*/+(with|nomatch)*+(partial|nomatch).css';
  const partial = path.resolve('test/fixtures/partials/partial.css');
  const subPartial = path.resolve('test/fixtures/partials/sub-partial.css');
  const options = {plugins: [atImport({path: ['test/fixtures/partials']}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {files: [{pattern: glob, watched: true}], autoWatch: true, postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await preprocessor(await readFile(fixture), file);
  t.true(debug.secondCall.calledWith(match('Watching'), partial));
  t.true(debug.thirdCall.calledWith(match('Watching'), subPartial));
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partial, subPartial])));
  t.true(watcher.add.calledOnce);
});

test('Do not add dependency to watcher if parent is not watched', async t => {
  const fixture = 'test/fixtures/with-partial.css';
  const options = {plugins: [atImport({path: ['test/fixtures/partials']}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher} = await mockPreprocessor(
    {},
    {autoWatch: true, files: [{pattern: fixture, watched: false}], postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await preprocessor(await readFile(fixture), file);
  t.true(watcher.add.notCalled);
});

test('Add dependency to watcher only once, even when its referenced multiple times', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const otherFixture = path.join(dir, 'other-with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const partialAlt = path.join(includePath, 'partial-alt.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {
      autoWatch: true,
      files: [{pattern: fixture, watched: true}, {pattern: otherFixture, watched: true}],
      postcssPreprocessor: {options},
    }
  );
  const file = {originalPath: fixture};
  const otherFile = {originalPath: otherFixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/partial.css', partialAlt),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
    copy('test/fixtures/with-partial.css', otherFixture),
  ]);
  await preprocessor(await readFile(fixture), file);
  t.true(debug.secondCall.calledWith(match('Watching'), partial));
  t.true(debug.thirdCall.calledWith(match('Watching'), subPartial));
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partial, subPartial])));
  debug.resetHistory();
  await preprocessor(await readFile(otherFixture), otherFile);
  t.true(watcher.add.calledOnce);
  t.true(debug.calledOnce);
});

test('Add dependency to watcher only once if file is overwritten', async t => {
  const fixture = 'test/fixtures/with-partial.css';
  const partial = path.resolve('test/fixtures/partials/partial.css');
  const subPartial = path.resolve('test/fixtures/partials/sub-partial.css');
  const options = {plugins: [atImport({path: ['test/fixtures/partials']}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug, refreshFiles} = await mockPreprocessor(
    {},
    {files: [{pattern: fixture, watched: true}], autoWatch: true, postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await preprocessor(await readFile(fixture), file);
  t.true(debug.thirdCall.calledWith(match('Watching'), subPartial));
  t.true(debug.secondCall.calledWith(match('Watching'), partial));
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partial, subPartial])));
  t.true(watcher.add.calledOnce);
  debug.resetHistory();
  watcher.emit('add', subPartial);
  await preprocessor(await readFile(fixture), file);
  t.true(refreshFiles.notCalled);
});

test('Remove dependency from watcher if not referenced anymore', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const partialAlt = path.join(includePath, 'partial-alt.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {autoWatch: true, files: [{pattern: fixture, watched: true}], postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/partial.css', partialAlt),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);
  await preprocessor(await readFile(fixture), file);
  watcher.add.resetHistory();
  debug.resetHistory();
  await outputFile(
    fixture,
    (await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
  );
  await preprocessor(await readFile(fixture), file);
  t.true(watcher.unwatch.firstCall.calledWith(match.array.deepEquals([partial])));
  t.true(debug.thirdCall.calledWith(match('Stop watching'), partial));
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([partialAlt])));
  t.true(debug.secondCall.calledWith(match('Watching'), partialAlt));
  t.true(watcher.unwatch.calledOnce);
  t.true(watcher.add.calledOnce);
});

test('Do not remove dependency from watcher when unreferenced, if another file still depends on it', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const otherFixture = path.join(dir, 'other-with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const partialAlt = path.join(includePath, 'partial-alt.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {
      autoWatch: true,
      files: [{pattern: fixture, watched: true}, {pattern: otherFixture, watched: true}],
      postcssPreprocessor: {options},
    }
  );
  const file = {originalPath: fixture};
  const otherFile = {originalPath: otherFixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/partial.css', partialAlt),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
    copy('test/fixtures/with-partial.css', otherFixture),
  ]);
  await preprocessor(await readFile(fixture), file);
  await preprocessor(await readFile(otherFixture), otherFile);
  watcher.add.resetHistory();
  debug.resetHistory();
  await outputFile(
    fixture,
    (await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
  );
  await preprocessor(await readFile(fixture), file);
  t.true(watcher.add.firstCall.calledWith(match.array.deepEquals([path.resolve(partialAlt)])));
  t.true(watcher.unwatch.notCalled);
  t.true(debug.calledTwice);
});

test('Do not remove dependency from watcher when different files have differents childs', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const otherFixture = path.join(dir, 'other-with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const partialAlt = path.join(includePath, 'partial-alt.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, debug} = await mockPreprocessor(
    {},
    {
      autoWatch: true,
      files: [{pattern: fixture, watched: true}, {pattern: otherFixture, watched: true}],
      postcssPreprocessor: {options},
    }
  );
  const file = {originalPath: fixture};
  const otherFile = {originalPath: otherFixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/partial.css', partialAlt),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
    copy('test/fixtures/with-partial.css', otherFixture),
  ]);
  await outputFile(
    fixture,
    (await readFile(fixture)).toString().replace(`@import 'partial';`, `@import 'partial-alt';`)
  );
  await preprocessor(await readFile(fixture), file);
  watcher.add.resetHistory();
  debug.resetHistory();
  await preprocessor(await readFile(otherFixture), otherFile);
  t.true(watcher.add.calledOnce);
  t.true(watcher.unwatch.notCalled);
  t.true(debug.calledTwice);
});

test('Call refreshFiles when dependency is modified', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, info, refreshFiles} = await mockPreprocessor(
    {},
    {autoWatch: true, files: [{pattern: fixture, watched: true}], postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);
  await preprocessor(await readFile(fixture), file);
  const change = waitFor(watcher, 'change');

  watcher.emit('change', partial);
  t.is(path.resolve(partial), await change);
  t.true(info.firstCall.calledWith(match('Changed file'), path.resolve(partial)));
  t.true(info.calledOnce);
  t.true(refreshFiles.calledOnce);
});

test('Call refreshFiles when dependency is deleted and added', async t => {
  const dir = tempy.directory();
  const fixture = path.join(dir, 'with-partial.css');
  const includePath = path.join(dir, 'partials');
  const partial = path.join(includePath, 'partial.css');
  const subPartial = path.join(includePath, 'sub-partial.css');
  const options = {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]};
  const {preprocessor, watcher, info, refreshFiles} = await mockPreprocessor(
    {},
    {autoWatch: true, files: [{pattern: fixture, watched: true}], postcssPreprocessor: {options}}
  );
  const file = {originalPath: fixture};

  await Promise.all([
    copy('test/fixtures/partials/partial.css', partial),
    copy('test/fixtures/partials/sub-partial.css', subPartial),
    copy('test/fixtures/with-partial.css', fixture),
  ]);
  await preprocessor(await readFile(fixture), file);
  const del = waitFor(watcher, 'unlink');

  watcher.emit('unlink', partial);
  remove(partial);
  t.is(path.resolve(partial), await del);
  t.true(info.firstCall.calledWith(match('Deleted file'), path.resolve(partial)));
  t.true(info.calledOnce);
  t.true(refreshFiles.calledOnce);
  info.resetHistory();
  refreshFiles.resetHistory();
  await t.throws(preprocessor(await readFile(fixture), file), Error);
  const cpy = waitFor(watcher, 'add');

  await copy('test/fixtures/partials/partial.css', partial);
  watcher.emit('add', partial);
  t.is(path.resolve(partial), await cpy);
  t.true(info.firstCall.calledWith(match('Added file'), path.resolve(partial)));
  t.true(info.calledOnce);
  t.true(refreshFiles.calledOnce);
  await preprocessor(await readFile(fixture), file);
});
