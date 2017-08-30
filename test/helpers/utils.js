import path from 'path';
import {readFile} from 'fs-extra';
import pEvent from 'p-event';
import sourceMappingURL from 'source-map-url';
import postcss from 'postcss';

/* eslint-disable no-magic-numbers */
/**
 * Return a Promise that resolve when an event is emitted and reject after a timeout expire if the event is not emitted.
 *
 * @method waitFor
 * @param {Object} emitter object that emit events.
 * @param {string} event event to listen to.
 * @param {Number} [timeout=30000] maximum time to wait for the event to be emitted.
 * @return {Promise} Promise tht resolve when the event is emitted.
 */
export function waitFor(emitter, event, timeout = 30000) {
  return pEvent(emitter, event, {timeout});
}

/**
 * @typedef {Object} Compiled
 * @property {string} css the compiled css code.
 * @property {Object} map the sourcemap resulting from the compilation.
 */

/* eslint-enable no-magic-numbers */
/**
 * Compile a css file and return the result as a `string`.
 *  
 * @method compile
 * @param {string} file path of the file to compile.
 * @param {Object} [options={}] postcss options.
 * @return {Compiled} compiled code and source map.
 */
export async function compile(file, options = {}) {
  if (options.sourceMap || options.map) {
    options.map = {inline: false};
  }
  options.from = path.resolve(file);
  options.to = path.resolve(file);
  const {css, map} = await postcss(options.plugins || []).process(await readFile(path.resolve(file)), options);

  return {
    css: map
      ? `${sourceMappingURL.removeFrom(
          css
        )}\n//# source${''}MappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(
          JSON.stringify(JSON.parse(map.toString()))
        ).toString('base64')}\n`
      : css,
    map: map ? JSON.parse(map.toString()) : undefined,
  };
}
