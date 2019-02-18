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
  extension: 'html',
  permalinks: true,
  pattern: ':dirname/:stem'
}));
```

## Extra's

Allows advanced custom sorting to be matched with [metalsmith-collections](https://github.com/segmentio/metalsmith-collections).

see an example [here!](https://gist.github.com/mpalpha/84885ec88fa86431bc193ce63b365e46)

##### *Notes*
*collections trees are accessible via "collections-tree" metadata for each collection or ".all"*

## License

  MIT
  