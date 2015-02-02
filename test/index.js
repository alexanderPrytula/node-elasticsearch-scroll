'use strict';

var elasticsearch = require('elasticsearch'),
  client = new elasticsearch.Client(),
  BPromise = require('bluebird'),
  range = require('lodash.range'),
  identity = require('lodash.identity'),
  scrollToEnd = require('../index')(client);

describe('When 20 things are indexed', function () {
  beforeEach(function () {
    this.timeout(4000);
    return BPromise.map(range(0, 20), function (number) {
      return client.index({
        index: 'elasticsearch-scroll-test',
        type: 'foo',
        id: number,
        body: { baz: 'bam' }
      });
    })
      .delay(1000); // Wait for everything to be indexed
  });

  afterEach(function () {
    return client.indices.delete({
      index: 'elasticsearch-scroll-test'
    });
  });

  it('should return all the things', function () {
    return client.search({
      index: 'elasticsearch-scroll-test',
      type: 'foo',
      scroll: '30s'
    })
      .then(scrollToEnd(identity, []))
      .then(function (results) {
        results.length.should.equal(20);
      });
  });

});
