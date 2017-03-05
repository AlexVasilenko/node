const expect = require('chai').expect;
const fs = require('fs');
const app = require('./../../app');
const config = require('./test_config');
const request = require('supertest')(app);

// please write tests that really test the result, not just statusCode
describe('Search', () => {
  it('post should return 200 if ok', done => {
    request
      .get('http://localhost:5000/api/search?url=http://frontend-science.com&element=h2&level=3')
      .expect(200, done);
  });

  it('delete should return 200 if ok', done => {
    request
      .delete('http://localhost:5000/api/search')
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal(true);
        done();
      });
  });

  it('delete should return 404 if seach request is already deleted', done => {
    request
      .delete('http://localhost:5000/api/search')
      .expect(404)
      .end((err, res) => {
        if (res.error) {
          done();
        }
      });
  });

  it('/api/search/list/ shows search history', done => {
    request
      .get('/api/search/list/')
      .expect(200)
      .end((err, res) => {
        if (res.body) {
          done();
        }
      });
  });

  it('/ sends search form', done => {
    request
      .get('localhost:5000')
      .expect(200)
      .end((err, res) => {
        if (res.body) {
          done();
        }
      });
  });

});
