const cheerio = require('cheerio');
const urlModule = require('url');

function _resultUrls (data) {
  let $ = cheerio.load(data);
  const allLinks = [];
  const res = $('a').each((i, elem) => {
    allLinks.push($(elem).attr('href'));
  });
  return allLinks.filter(item => item);
}

function _filterUnique(data) {
  const uniqueArr = [];
  data.forEach(item => {
    if (!uniqueArr.find(itemUnique => item.pathname === itemUnique.pathname)) {
      uniqueArr.push(item);
    }
  });
  return uniqueArr;
}

function getParts (data) {
  return data.reduce((arr, item) => {
    const url = urlModule.parse(item);
    if (url.pathname) {
      arr.push({
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname
      });
    }
    return arr;
  }, []);
}

function _filterMailTo(data) {
  return data.filter(item => !String(item.protocol).includes('mailto:'));
}

function _filterHost(data, currentUrl) {
  return data.filter(item => item.host === currentUrl);
}

function _enrichMissingData(data, host, protocol){
  return data.map(item => {
    if (!item.protocol && !item.host) {
      item.host = host;
      item.protocol = protocol;
    }
    return item;
  });
}

function _filterVisited(data, visited) {
  return data.filter(item => !visited[item.pathname]);
}

function filterLinks (visited, data, currentUrl) {
  const allData = _resultUrls(data);
  const getAllParts = getParts(allData);
  const justUrl = _filterMailTo(getAllParts);
  const enriched = _enrichMissingData(justUrl, justUrl[0].host, justUrl[0].protocol);
  const internalLinks = _filterHost(enriched, currentUrl);
  const uniqueUrls = _filterUnique(internalLinks);
  const notVisited = _filterVisited(uniqueUrls, visited);
  return notVisited;
}

module.exports = {
  filterLinks,
  _filterVisited,
  _filterHost,
  _filterMailTo,
  getParts,
};
