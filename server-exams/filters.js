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
  const uniqueUrls = [];

  data.map((item) => {
    const isFind = uniqueUrls.find((itemUnique) => item.pathname === itemUnique.pathname);

    if (!isFind) {
      uniqueUrls.push(item);
    }
  });
  return uniqueUrls;
}

function getParts (data) {
  return data.map((item) => {
    const url = urlModule.parse(item);
    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname
    };
  });
}

function _filterMailTo(data) {
  return data.filter((item) => !(item.protocol && item.protocol.indexOf('http') === -1));
}

function _filterHost(data, currentUrl) {
  return data.filter((item) => !(item.host && item.host !== currentUrl));
}

function _filterVisited(data, visited) {
  return data.filter((item) => !visited[item.pathname]);
}

function filterLinks (visited, data, currentUrl) {

  const allData = _resultUrls(data);
  const getAllParts = getParts(allData);
  const justUrl = _filterMailTo(getAllParts);
  const internalLinks = _filterHost(justUrl, currentUrl);
  const uniqueUrls = _filterUnique(internalLinks);
  return _filterVisited(uniqueUrls, visited);
}

module.exports = {
  filterLinks,
  _filterVisited,
  _filterHost,
  _filterMailTo,
  getParts,
};
