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

## License

  MIT
