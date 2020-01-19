const path = require('path');
const {copy} = require('fs-extra');
const test = require('ava');
const {stub} = require('sinon');
const tempy = require('tempy');
const cssnano = require('cssnano');
const mixins = require('postcss-mixins');
const simpleVars = require('postcss-simple-vars');
const atImport = require('postcss-import');
const {run, watch, waitForRunComplete} = require('./helpers/karma');

let stubWrite;

test.before(() => {
	stubWrite = stub(process.stdout, 'write');
});

test.after(() => {
	stubWrite.restore();
});

test.serial('Compile css file', async t => {
	const {success, error, disconnected, errMsg} = await run(
		['test/fixtures/basic.css', 'test/fixtures/styles.test.js'],
		{options: {plugins: [atImport, mixins, simpleVars, cssnano]}}
	);

	t.falsy(error, `Karma returned the error: ${errMsg}`);
	t.falsy(disconnected, 'Karma disconnected');
	t.is(success, 1, 'Expected 1 test successful');
});

test.serial('Compile css file with custom preprocessor', async t => {
	const {success, error, disconnected, errMsg} = await run(
		['test/fixtures/basic.custom.css', 'test/fixtures/styles.test.js'],
		{options: {plugins: [atImport, mixins, simpleVars, cssnano]}}
	);

	t.falsy(error, `Karma returned the error: ${errMsg}`);
	t.falsy(disconnected, 'Karma disconnected');
	t.is(success, 1, 'Expected 1 test successful');
});

test.serial('Log error on invalid css file', async t => {
	const {error, disconnected, exitCode} = await run('test/fixtures/error.css', {
		options: {plugins: [atImport, mixins, simpleVars, cssnano]},
	});

	t.falsy(disconnected, 'Karma disconnected');
	t.true(error, 'Expected an error to be returned');
	t.is(exitCode, 1, 'Expected non zero exit code');
});

test.serial('Re-compile css file when dependency is modified', async t => {
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

	const {server, watcher} = await watch(
		[fixture.replace('fixtures', '*').replace('with', '+(with|nomatch)'), 'test/fixtures/styles.test.js'],
		{options: {plugins: [atImport({path: [includePath]}), mixins, simpleVars, cssnano]}}
	);

	try {
		let {success, error, disconnected, errMsg} = await waitForRunComplete(server);

		t.falsy(error, `Karma returned the error: ${errMsg}`);
		t.falsy(disconnected, 'Karma disconnected');
		t.is(success, 1, 'Expected 1 test successful');

		watcher.emit('change', partial);
		({success, error, disconnected, errMsg} = await waitForRunComplete(server));

		t.falsy(error, `Karma returned the error: ${errMsg}`);
		t.falsy(disconnected, 'Karma disconnected');
		t.is(success, 1, 'Expected 1 test successful');
	} finally {
		await server.emitAsync('exit');
	}
});
