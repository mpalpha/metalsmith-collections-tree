'use strict';

const path = require("path");
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
  paths.forEach((filePath = Object.keys(files).filter(x => x.includes(filePath + '/index.') || x.includes(filePath))[0]) => {

    // split path parts and filter any empty values
    const pathParts = (filePath ? filePath.split('/') : [filePath]).filter(n => n != null);
    if (pathParts && filePath) {

      let currentLevel = tree;
      var relativePath = '';
      /**
       * initialize currentLevel to root
       */
      // iterate each path part
      pathParts.forEach((part, partIndex) => {
        relativePath += relativePath ? '/' + part : part;
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
          // build path part data
          let newPart = path.parse(relativePath);

          // find file collection
          let file = files[Object.keys(files).filter(key => key.includes(filePath + '/index.') && key)[0]]

          // combine file properties
          newPart = {...file, ...newPart};

          // set path type to file or folder.
          newPart.type = newPart.ext || part == [...pathParts].pop() ? 'file': 'folder';

          /**
           * set the relative path and rename file type extension if option.extension is provided
           */
          newPart.path = replaceExtension(relativePath, options.extension) + `${(!path.extname(relativePath) && '/')}`;

          // set basename
          newPart.basename = path.basename(newPart.name, path.extname(newPart.name));

          // set title - capitalize the first letter of each work with spaces between.
          if (!newPart.title) {
            newPart.title = newPart.basename
              .replace(/^_/, '')
              .replace(/^([a-zA-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => (((p2 && ' ') + p2) || p1).toUpperCase())
          }

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
const replaceExtension = (x, ext) => 
  (typeof x !== 'string' || x.length === 0 || !path.extname(x)) ? x : path.join(path.dirname(x), path.basename(x, path.extname(x)) + `.${ext}`);

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
      extension: false
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
      .map(n => n[options.sortKey])
      .filter(o => o)

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
  let allpaths = flatMapDeep(Object.values(metadata.collections))
  .map(n => n[options.sortKey])
  .filter(o => o)

  /**
   * call arrangeIntoTree for all collections
   */
  const alltree = arrangeIntoTree(allpaths, options, files);
  metadata['collections-tree'] = { ...metadata['collections-tree'], ...{ ['all']: alltree } };
};

module.exports = plugin;
