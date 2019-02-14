'use strict';

/**
 * Generate a nested array of file/folder data by parsing an array of paths
 *
 * @param {Array} array array of paths
 * @param {Object} options options object
 * @return {Array} array nested array of files/folders
 */
const arrangeIntoTree = paths => {
  const tree = [];

  // iterate each path
  paths.forEach(path => {
    // split path parts
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
      // iterate each path part
      pathParts.forEach(part => {
        /**
         * check to see if the path already exists.
         */
        const existingPath = currentLevel.find(o => o.basename == part);

        if (existingPath) {
          /**
           * The path to this item was already in the tree, so don't add it again.
           * Set the current level to this path's children
           */
          currentLevel = existingPath.children;
        } else {
          // build path part data
          const newPart = {};
          // parse file or folder data when an extension is deteced.
          if (part.split('.')[1]) {
            newPart.extname = part.split('.')[1];
            newPart.type = 'file';
            newPart.path = path;
          } else {
            newPart.type = 'folder';
            newPart.path = path.substring(0, path.lastIndexOf('/'));
          }
          // set basename and name
          newPart.basename = newPart.name = part.split('.')[0] || newPart.basename;

          // set title - capitalize the first letter of each work with spaces between.
          newPart.title = newPart.basename
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

const plugin = function plugin(
  options = { sortKey: 'path', extension: 'html' }
) {
  return function(files, metalsmith, done) {
    /*
     * Set the next function to run once we are done
     */
    setImmediate(done);

    const metadata = metalsmith.metadata();
    let paths = Object.keys(files);

    /**
     * rename file type extension if option.filetype and option.extension are provided
     */
    if (options.extension)
      paths = paths.map(x =>
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
