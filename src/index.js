import path from 'path';
import nodeify from 'nodeify';
import postcss from 'postcss';
import {merge, clone} from 'lodash';

/**
 * Postcss preprocessor factory.
 * 
 * @param {Object} args Config object of custom preprocessor.
 * @param {Object} [config={}] Config object of postcssPreprocessor.
 * @param {Object} logger Karma's logger.
 * @return {Function} the function to preprocess files.
 */
function createPostcssPreprocessor(args, config = {}, logger) {
  const log = logger.create('preprocessor.postcss');
  const options = merge({sourceMap: false}, args.options || {}, config.options || {});
  const transformPath =
    args.transformPath ||
    config.transformPath ||
    (filepath => `${path.dirname(filepath)}/${path.basename(filepath, path.extname(filepath))}.css`);

  return (content, file, done) => {
    log.debug('Processing "%s".', file.originalPath);
    file.path = transformPath(file.originalPath);

    // Clone the options because we need to mutate them
    const opts = clone(options);

    // Inline source maps
    if (opts.sourceMap || opts.map) {
      opts.map = {inline: true};
    }

    opts.from = file.originalPath;
    opts.to = file.originalPath;

    nodeify(
      postcss(opts.plugins || []).process(content, opts).then(result => result.css).catch(err => {
        log.error('%s\n  at %s:%d', err.message, file.originalPath, err.line);
        throw err;
      }),
      done
    );
  };
}

// Inject dependencies
createPostcssPreprocessor.$inject = ['args', 'config.postcssPreprocessor', 'logger'];

// Export preprocessor
module.exports = {
  'preprocessor:postcss': ['factory', createPostcssPreprocessor],
};
