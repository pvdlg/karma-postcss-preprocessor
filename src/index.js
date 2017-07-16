import path from 'path';
import nodeify from 'nodeify';
import postcss from 'postcss';
import {merge, clone} from 'lodash';

/**
 * Sass preprocessor factory.
 * 
 * @param {Object} args Config object of custom preprocessor.
 * @param {Object} config Config object of sassPreprocessor.
 * @param {Object} logger Karma's logger.
 * @return {Function} the function to preprocess files.
 */
function createPostcssPreprocessor(args, config, logger) {
  const log = logger.create('preprocessor.postcss');
  const options = merge({sourceMap: false}, args.options || {}, config.options || {});
  // Const transformPath =
  //   args.transformPath || config.transformPath || (filepath => filepath.replace(/\.(scss|sass)$/, '.css'));

  return (content, file, done) => {
    log.debug('Processing "%s".', file.originalPath);
    // TODO file.path = file.originalPath; ?
    // file.path = transformPath(file.originalPath);
    // Clone the options because we need to mutate them
    const opts = clone(options);

    // Add current file's directory into include paths
    // opts.includePaths = [path.dirname(file.originalPath)].concat(opts.includePaths || []);
    // Inline source maps
    if (opts.sourceMap || opts.map) {
      opts.map = {inline: true};
    }
    // Opts.indentedSyntax = file.originalPath.indexOf('.sass') !== -1;
    // opts.data = content.toString();
    // sass.render(opts, (err, result) => {
    //   if (err) {
    //     log.error('%s\n  at %s:%d', err.message, file.originalPath, err.line);
    //     return done(err, null);
    //   }
    //   return done(null, result.css);
    // });

    opts.from = file.originalPath;
    opts.to = file.originalPath;
    console.log(opts);
    nodeify(
      postcss(opts.plugins || []).process(content, opts).then(result => result.css).catch(err => {
        console.log('ERRORO');
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
const preprocessor = {
  'preprocessor:postcss': ['factory', createPostcssPreprocessor],
};

export default preprocessor;
