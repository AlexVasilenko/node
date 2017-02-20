const expect = require('chai').expect;
const filters = require('./../../filters');


describe('Test filters', function () {
  it('should return correct internal links', (done) => {
    expect(filters._filterHost([
      {host: 'frontend-science.com'},
      {host: '/someUrl'},
      {host: 'vk.com'},
      {host: 'youtube.com'}
    ], 'frontend-science.com')).to.equal([
      {host: 'frontend-science.com'},
      {host: '/someUrl'}
    ]);
  })


});

filterLinks,
_filterVisited,
_filterHost,
_filterMailTo,
getParts,
