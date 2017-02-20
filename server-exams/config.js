const config = {
  app: {
    expire: 24 * 60 * 60
  },
  cheerioLoad: {
    normalizeWhitespace: true,
    xmlMode: false,
    decodeEntities: false,
    withDomLvl1: false
  },
  redis: {
      host: 'localhost',
      port: '6379'
  }
};

module.exports = config;
