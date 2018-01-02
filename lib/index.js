const _ = require('lodash');

/**
 * create nested collection tree
 */
const arrangeIntoTree = paths => {
  const tree = [];

  /**
   * This example uses the underscore.js library.
   */
  _.each(paths, path => {
    const pathParts = path && path.split('/');
    if (pathParts) {
      /**
       * Remove first blank element from the parts array.
       */
      if (pathParts[0] == undefined) pathParts.shift();

      let currentLevel = tree;
      /**
       * initialize currentLevel to root
       */

      _.each(pathParts, part => {
        /**
         * check to see if the path already exists.
         */
        const existingPath = _.find(currentLevel, { name: part });

        if (existingPath) {
          /**
           * The path to this item was already in the tree, so don't add it again.
           * Set the current level to this path's children
           */
          currentLevel = existingPath.children;
        } else {
          const newPart = {};
          newPart.type = part.indexOf('.') !== -1 ? 'file' : 'folder';
          newPart.name = part.split('.')[0];
          if (part.indexOf('.') !== -1) {
            newPart.ext = part.split('.')[1];
          }
          newPart.path = path;
          newPart.children = [];
          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      });
    }
  });
  return tree;
};

const plugin = function plugin(
  options = { sortKey: 'path', extension: 'html' }
) {
  return function(files, metalsmith, done) {
    /*
     * Set the next function to run once we are done
     */
    setImmediate(done);

    const metadata = metalsmith.metadata();
    let paths = _(metadata.collections)
      .flatMapDeep(_.values)
      .map(options.sortKey)
      .compact(_.values)
      .value();

    /**
     * rename file type extension if option.filetype and option.extension are provided
     */
    if (options.extension)
      paths = _.map(paths, x =>
        x.replace(
          x.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim),
          '.' + options.extension
        )
      );

    /**
     * call arrangeIntoTree
     */
    const tree = arrangeIntoTree(paths);
    metadata['collections-tree'] = tree;
  };
};

module.exports = plugin;
