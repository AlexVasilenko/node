const redis = require('redis');
const config = require('./config');
const Promise = require('bluebird');
const filterLinks = require('./filters');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const client = redis.createClient(config.redis);
const cheerio = require('cheerio');
const got = require('got');
const Q = require('q');


// It didnt even start out of the box - missing dependencies, using wrong variables, missing steps etc.
// Too much refactoring needed just to make it return any results.
// Please use linter and write tests that really test the result, not just statusCode.
function getNewData(results, values) {
  const nowVisited = resultToVisit(values.urls);
  Object.assign(values.result.visited, nowVisited);
  values.result.urls = (values.result.urls || []).concat(values.urls);
  values.urls = [];
  results.filter(item => item.value)
    .forEach(data => {
      values.result.data = values.result.data.concat(resultData(data.value.body, values.element))
        .filter((item, i, self) => self.indexOf(item) == i);
      values.urls = values.urls.concat(filterLinks.filterLinks(values.result.visited, data.value.body, values.currentUrl));
    });
  values.result.currentLevel++;
  getUrl(values);
}

function getUrl(params) {
  if (params.level === params.result.currentLevel || !params.urls.length) {
    const key = `${params.result.urls[0].host}/${params.element}/${params.level}`;
    const value = JSON.stringify(params.result.data);
    return client.setAsync(key, value, 'EX', config.app.expire)
      .then(() => params.send.send(value))
      .catch(err => params.send.status(500).send(err));
  }

  const allUrls = params.urls
    .map(item => `${item.protocol}//${item.host || params.currentUrl}${item.pathname}`)
    .map(url => got(url));

  Q.allSettled(allUrls).then((data) => {
    getNewData(data, params);
  });
}

function resultToVisit (data) {
  return data.reduce((result, item) => {
    result[item.pathname] = true;
    return result;
  }, {});
}

function resultData (data, element) {
    let $ = cheerio.load(data, config.cheerioLoad);
    const result = [];
    $('body').find(element).each((item, el) => {
      result.push($(el).html());
    });
   return result;
}

module.exports = {
  resultData,
  resultToVisit,
  getUrl,
  getNewData
};
