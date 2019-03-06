# metalsmith-collections-tree

create nested metadata from the metalsmith-collections global metadata

## Installation

    $ npm install metalsmith-collections-tree

or

    $ yarn add metalsmith-collections-tree

## Usage

Create collections tree after metalsmith-collections: 

```js
var collectionsTree = require('metalsmith-collections-tree');
metalsmith.use(collections());
metalsmith.use(collectionsTree({
  sortKey: 'path',
  extension: 'html'
}));
```

## Extra

1) Allows advanced custom sorting to be matched with [metalsmith-collections](https://github.com/segmentio/metalsmith-collections).

See an example [here!](https://gist.github.com/mpalpha/84885ec88fa86431bc193ce63b365e46)

2) File details are now passed through. Which works with the following PR for [metalsmith-permalinks](https://github.com/segmentio/metalsmith-permalinks/pull/90).

##### *Notes*
*collections trees are accessible via "collections-tree" metadata for each collection or ".all"*

## License

  MIT
  