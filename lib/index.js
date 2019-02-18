'use strict';

const path = require("path");
const permalinks = require("permalinks");
const debug = require('debug')('metalsmith-collections-tree');
const error = debug.extend('error');

/**
 * Generate a nested array of file/folder data by parsing an array of paths
 *
 * @param {Array} array array of paths
 * @param {Object} options options object
 * @return {Array} array nested array of files/folders
 */
const arrangeIntoTree = (paths, options = options, files = files) => {
  const tree = [];

  // iterate each file path
  paths.forEach(filePath => {
    // split path parts
    const pathParts = filePath && filePath.split('/');
    if (pathParts && filePath) {
      /**
       * Remove first blank element from the parts array.
       */
      if (pathParts[0] == undefined) pathParts.shift();

      let currentLevel = tree;
      /**
       * initialize currentLevel to root
       */
      // iterate each path part
      pathParts.forEach(part => {
        /**
         * check to see if the path already exists.
         */
        const existingPath = currentLevel.find(o => o.base == part);

        if (existingPath) {
          /**
           * The path to this item was already in the tree, so don't add it again.
           * Set the current level to this path's children
           */
          currentLevel = existingPath.children;
        } else {
          // // build path part data
          let newPart = path.parse(part);
          // parse file or folder data when an extension is deteced.
          if (path.parse(part).ext) {
            newPart.type = 'file';
            newPart.path = filePath;
          } else {
            newPart.type = 'folder';
            newPart.path = filePath.substring(0, filePath.lastIndexOf('/'));
          }
          if (options.permalinks) {
            newPart.path = permalinks(options.pattern, newPart.path);
          }
          newPart.root = path.relative(newPart.path, part).replace(part, '');

          // set basename and name
          newPart.basename = part.split('.')[0] || newPart.basename;

          // set title - capitalize the first letter of each work with spaces between.
          newPart.title = newPart.basename
            .replace(/^_/, '')
            .replace(/^([a-zA-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => (((p2 && ' ') + p2) || p1).toUpperCase())

          // set children
          newPart.children = [];
          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      });
    }
  });

  return tree;
};

/**
 * This method is recursively flattens mapped results.
 *
 * @static
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee] The function invoked per iteration.
 * @returns {Array} Returns the new flattened array.
 * @example
*/
const flatMapDeep = (value, mapper = n => n) => {
  return Array.isArray(value) ?
    [].concat(...value.map(x => flatMapDeep(x, mapper))) :
    mapper(value);
}

const replaceExtension = (ext) =>
  x => x.replace(
    x.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim),
    '.' + ext
  );

const plugin = options => (files, metalsmith, done) => {
  /*
   * Set the next function to run once we are done
   */
  setImmediate(done);

  /*
   * Merge default options
   */
  options = {
    ...{
      sortKey: 'path',
      extension: 'html',
      permalinks: false,
      pattern: ':dirname/:stem'
    }, ...options
  };
  Object.entries(options).forEach(([key, value]) => debug(`option ${key}: %O`, value));

  /*
   * Get metadata from metalsmith
   */
  const metadata = metalsmith.metadata();

  if (!metadata.collections) {
    return error('metalsmith-collections metadata is missing!');
  }

  Object.entries(metadata.collections).forEach(([key, value]) => {
    debug('building collection tree : %O', key);

    /*
    * Flatten and sync sort order with the metalsmith-collections order.
    */
    let paths = flatMapDeep([...new Set(value)])

    paths = paths.map(n => n[options.sortKey])
      .filter(o => o)

    /**
     * rename file type extension if option.filetype and option.extension are provided
     */
    if (options.extension) paths = paths.map(replaceExtension(options.extension));

    /**
     * call arrangeIntoTree for this collection
     */
    const tree = arrangeIntoTree(paths, options, files);
    metadata['collections-tree'] = { ...metadata['collections-tree'], ...{ [key]: tree } };
  });


  debug('builing collection tree : %O', 'all');
  /*
   * Flatten and sync sort order with the metalsmith-collections order.
   */
  let allpaths = [...new Set(flatMapDeep(Object.values(metadata.collections))
    .map(n => n[options.sortKey])
  )]
    .filter(o => o)

  /**
   * call arrangeIntoTree for all collections
   */
  const alltree = arrangeIntoTree(allpaths, options, files);
  metadata['collections-tree'] = { ...metadata['collections-tree'], ...{ ['all']: alltree } };
};

module.exports = plugin;
