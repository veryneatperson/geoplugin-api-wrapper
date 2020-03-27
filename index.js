const express = require('express');
const request = require('request');
const requestIp = require('request-ip');
const cors = require('cors');

const BASE_GEOPLUGIN_URL = 'http://geoplugin.net/json.gp';

const app = express();

app.use(requestIp.mw())

app.use(function (req, res, next) {
  res.locals.userIP = requestIp.getClientIp(req);
  next();
});

app.get('/', cors(), (req, res, next) => {
  request({
    url: `${BASE_GEOPLUGIN_URL}?ip=${res.locals.userIP}`
  }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return next(new Error('Geoplugin API responded with error or statusCode !== 200'));
    }
    const data = JSON.parse(body);
    if (!(Boolean(data.geoplugin_currencyCode))) {
      return next(new Error('Geoplugin API returned unexpected data'));
    }
    return res.json(data);
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: 'error', message: err.message
  })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening for requests on ${PORT}`));
