const express = require('express');
const app = express();
const urlModule = require('url');
const swaggerTools = require('swagger-tools');
const dataModule = require('./data');
const bodyParser = require('body-parser');
const config = require('./config');
const exphbs = require('express-handlebars');
const Promise = require('bluebird');
const redis = require('redis');
const client = redis.createClient(config.redis);
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

app.engine('handlebars', exphbs({ defaultLayout: 'home' }));

app.set('view engine', 'handlebars');

app.use((req, res, next) => {
  if (!req.level) {
    req.level = 5;
  }
  next();
})

// place routes in a separate routes file
app.get('/api/search', (req, res) => {
  if (!correctData(req.query)) {
    res.status(400).send('Incorrect data');
  }
  // place the actual logic in the separate controllers
  const parseUrl = urlModule.parse(req.query.url);
  const newUrl = {
    protocol: parseUrl.protocol,
    host: parseUrl.host,
    pathname: parseUrl.pathname
  };

  const urls = [newUrl];
  const element = req.query.element;
  const level = req.query.level || 5;
  const key = `${urls[0].host}/${element}/${level}`;
  // this key is being used in several places, so its better to re-use it by placing it to a variable

  client.getAsync(key)
    .then(data => {
      if (data) {
        return client.expireAsync(key, config.app.expire)
          .then(() => res.status(200).json(data));
      }
      console.log('no saved data');
      dataModule.getUrl({
        urls,
        element,
        level,
        currentUrl: urlModule.parse(req.query.url).host,
        send: res,
        result: {
          data: [],
          currentLevel: 0,
          visited: {}
        }
      });
  });
});

app.get('/', (req, res) => {
   res.render('home');
});


app.get('/api/search/list', (req, res) => {
  // There is no code for saving that results.
  // I suggest keeping each request parameters (level, url and element) in Hash
  // and keeping IDs of that Hashes in the List with 'searchResults' id.
  // So you can get list of required hashIds by LRANGE command and then
  // get request parameters by Promise.all(hashIds.map(id => redis.hgetallAsync(id)))
  // Please read The Little Redis Book
  client.getAsync('searchResult').then((data) => {
    res.json(data);
  });
});

app.delete('/api/search', (req, res) => {
  if (!correctData(req.query)) {
    res.status(400).send('Incorrect data');
  }
  const data = req.query;
  // keep it simple and read The Little Redis Book
  const key = `${data.url}/${data.element}/${data.level}`;
  client.delAsync(key)
    .then(result => res.status(result ? 200 : 404).send(!!result));
});

function correctData (data) {
  return data.url || data.element;
}

const swaggerDoc = require('./swagger/swagger.json');

const options = {
  useStubs: process.env.NODE_ENV === 'development' ? true : false
};

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerValidator());
  app.use(middleware.swaggerRouter(options));
  app.use(middleware.swaggerUi());
});

app.listen(5000, function () {
    console.log('listening on http://localhost:5000');
});

module.exports = app;
