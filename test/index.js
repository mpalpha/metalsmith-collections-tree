var assert = require('assert');
var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var collectionsTree = require('..');

describe('metalsmith-collections', function() {
  it('should add collections-tree to metadata', function(done) {
    var metalsmith = Metalsmith('test/fixtures/basic');
    metalsmith
      .use(collections({ articles: {} }))
      .use(collectionsTree())
      .build(function(err) {
        if (err) return done(err);
        var m = metalsmith.metadata();
        assert.equal(2, m.articles.length);
        assert.equal(m.collections.articles, m.articles);
        assert.equal(
          m['collections-tree'][0].children[0].path.split('.')[0],
          m.collections.articles[0].path.split('.')[0]
        );
        done();
      });
  });
});
