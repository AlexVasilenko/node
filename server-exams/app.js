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

app.use((req, res) => {
  if (!req.level) {
    req.level = 5;
  }
})


app.get('/api/search', (req, res) => {
  if (correctData(req.query)) {
    res.status(500).send('Incorrect data');
  }

  const parseUrl = urlModule.parse(req.query.url);
  const newUrl = {
    protocol: parseUrl.protocol,
    host: parseUrl.host,
    pathname: parseUrl.pathname
  };

  const urls = [newUrl];
  const element = req.query.element;
  const level = req.query.level || 5;

  client.getAsync(`${urls[0]}/${element}/${level}`).then((data) => {
    if (data) {
      client.expireAsync(`${urls[0]}/${element}/${level}`, config.app.expire);
      res.status(200).json(data);
      return;
    }

    const result = dataModule.getUrl({
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
  redis.getAsync('searchResult').then((data) => {
    res.json(data);
  });
});

app.delete('/api/search', (req, res) => {
  if (correctData(req.query)) {
    res.status(500).send('Incorrect data');
  }
  const data = req.query;
  redis.existsAsync(`${data.url}/${data.element}/${data.level}`).then((data) => {
    if (data) {
      res.status(404).send(false);
    } else {
      redis.delAsync(`${data.url}/${data.element}/${data.level}`);
      res.status(201).send(true);
    }
  });
});

function correctData (data) {
  return !data.url || data.element;
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
