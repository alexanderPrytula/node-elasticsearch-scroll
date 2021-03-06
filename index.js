'use strict';

const curry = require('lodash.curry');

module.exports = (client, {scrollTimeout = '30s'}) => {
  const scrollToEnd = curry((resultTransform, results, res) => {
    results = results.concat(resultTransform(res.hits.hits));

    if (results.length < res.hits.total) {
      return client.scroll({
        /* eslint-disable no-underscore-dangle */
        scrollId: res._scroll_id,
        scroll: scrollTimeout
        /* eslint-enable no-underscore-dangle */
      })
        .then(scrollToEnd(resultTransform, results));
    } else {
      return new Promise((resolve, reject) => {
        client.clearScroll({
          scrollId: [res._scroll_id]
        })
          .then(() => {
            resolve({data: results, total: res.hits.total});
          })
          .catch(reject);
      });
    }
  });

  return scrollToEnd;
};
