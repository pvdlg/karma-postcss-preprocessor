import path from 'path';
import {merge} from 'lodash';
import {FSWatcher} from 'chokidar';
import nodeify from 'nodeify';
import postcss from 'postcss';

/**
 * Postcss preprocessor factory.
 * 
 * @param {Object} args Config object of custom preprocessor.
 * @param {Object} [config={}] KArma's config.
 * @param {Object} logger Karma's logger.
 * @param {Object} server Karma's server.
 * @return {Function} the function to preprocess files.
 */
function createPostcssPreprocessor(args, config, logger, server) {
  const preprocessorConfig = config.postcssPreprocessor || {};
  const log = logger.create('preprocessor.postcss');
  const options = merge({sourceMap: false}, args.options || {}, preprocessorConfig.options || {});
  const transformPath =
    args.transformPath ||
    preprocessorConfig.transformPath ||
    (filepath => `${path.dirname(filepath)}/${path.basename(filepath, path.extname(filepath))}.css`);
  let watcher;
  const dependencies = {};
  const unlinked = [];

  if (config.autoWatch) {
    watcher = new FSWatcher({persistent: true, disableGlobbing: true})
      .on('change', filePath => {
        log.info('Changed file "%s".', filePath);
        server.refreshFiles();
      })
      .on('add', filePath => {
        if (unlinked.indexOf(filePath) !== -1) {
          log.info('Added file "%s".', filePath);
          server.refreshFiles();
        }
      })
      .on('unlink', filePath => {
        log.info('Deleted file "%s".', filePath);
        unlinked.push(filePath);
        server.refreshFiles();
      });
  }

  return (content, file, done) => {
    log.debug('Processing "%s".', file.originalPath);
    file.path = transformPath(file.originalPath);

    // Clone the options because we need to mutate them
    const opts = Object.assign({}, options);

    // Inline source maps
    if (opts.sourceMap || opts.map) {
      opts.map = {inline: true};
    }

    opts.from = file.originalPath;
    opts.to = file.originalPath;

    nodeify(
      postcss(opts.plugins || [])
        .process(content, opts)
        .then(result => {
          if (
            config.autoWatch &&
            config.files.find(configFile => configFile.pattern === file.originalPath && configFile.watched)
          ) {
            const fullPath = path.resolve(file.originalPath);
            const includedFiles = [];
            const startWatching = [];
            const stopWatching = [];

            for (let i = 0, {length} = result.messages; i < length; i++) {
              if (result.messages[i].type === 'dependency') {
                const includedFile = path.resolve(result.messages[i].file);

                includedFiles.push(includedFile);
                if (!dependencies[includedFile]) {
                  startWatching.push(includedFile);
                  log.debug('Watching "%s"', includedFile);
                  dependencies[includedFile] = [fullPath];
                } else if (dependencies[includedFile].indexOf(fullPath) === -1) {
                  dependencies[includedFile].push(fullPath);
                }
              }
            }

            for (let i = 0, keys = Object.keys(dependencies), {length} = keys; i < length; i++) {
              if (includedFiles.indexOf(keys[i]) === -1) {
                const index = dependencies[keys[i]].indexOf(fullPath);

                if (index !== -1) {
                  dependencies[keys[i]].splice(index, 1);
                  if (!dependencies[keys[i]].length) {
                    stopWatching.push(keys[i]);
                    log.debug('Stop watching "%s"', keys[i]);
                    delete dependencies[keys[i]];
                  }
                }
              }
            }

            if (startWatching.length) {
              watcher.add(startWatching);
            }
            if (stopWatching.length) {
              watcher.unwatch(stopWatching);
            }
          }
          return result.css;
        })
        .catch(err => {
          log.error('%s\n  at %s:%d', err.message, file.originalPath, err.line);
          throw err;
        }),
      done
    );
  };
}

// Inject dependencies
createPostcssPreprocessor.$inject = ['args', 'config', 'logger', 'emitter'];

// Export preprocessor
module.exports = {
  'preprocessor:postcss': ['factory', createPostcssPreprocessor],
};
