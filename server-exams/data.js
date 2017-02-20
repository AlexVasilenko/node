const redis = require('redis');
const config = require('./config');
const client = redis.createClient(config.redis);
const Promise = require('bluebird');
const filterLinks = require('./filters');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const cheerio = require('cheerio');
const got = require('got');
const Q = require('q');



function getNewData(results, values) {
  values.result.visited = Object.assign({}, values.result.visited, resultToVisit(values.urls));
  let newUrls = [];

  const partResult = results.filter((item) => item.value).reduce((part, data) => {
     part.data = [...part.data, ...resultData(data.value.body, values.element)];
     part.urls = [...newUrls, ...filterLinks.filterLinks(values.result.visited, data.value.body, values.result.currentUrl)];
     return part;
  }, values.result);
  partResult.currentLevel++;
  values.urls = newUrls;
  values.result.data = [...values.result.data, ...partResult.data];
  values.result.currentLevel++;

  console.log(values);
  getUrl(values);
}

function getUrl(params) {
  console.log('res');
  if (params.level === params.result.currentLevel || !params.urls.length) {
    //client.set(`${params.currentUrl}/${params.element}/${params.level}`, JSON.stringify(result.data));
    //client.expireAsync(`${urls[0]}/${element}/${level}`, config.app.expire);
    params.send.json(params.result.data);
  }

  const allUrls = params.urls.map((item) => got(`${item.protocol}//${item.host || params.currentUrl}${item.pathname}`));

  Q.allSettled(allUrls).then((data) => {
    getNewData(data, params);
  });
}

function resultToVisit (data) {
  const result = {};
  data.map((item) => {
    result[item.pathname] = true;
  });
  return result;
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
