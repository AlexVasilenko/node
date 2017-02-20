const request = require('superagent');
const url = 'http://localhost:5000/api/search';

function searchHistory() {
  console.log('Downloads');
  const req = `${url}/list/`;
  request.get(req).end((err, res) => {
    if (err) throw err;
    console.log(res.data);
    process.exit(0);
  });
}

function delete(req) {
  request.delete(req).end((err, res) => {
    console.log(res.text);
    process.exit(0);
  });
}

function getDomElements(req) {
  request.get(req).end((err, res) => {
    const result = JSON.parse(res.text);
    console.log('result: ', result.data);
    process.exit(0);
  });
}

module.exports = {
  searchHistory,
  delete,
  getDomElements,
  generateRequest
};
