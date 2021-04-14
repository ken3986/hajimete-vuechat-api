// Express読み込み
const express = require('express');
const app = express();

// CORS許可
const cors = require('cors');
app.use(cors());

// serverless読み込み
const serverless = require('serverless-http');

// const bodyParser = require('body-parser');
// app.use(bodyParser);

// const allowCrossDomain = (req, res, next) => {
//   res.writeHead(200, {
//     'Content-Type': 'text/html',
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'Content-Type',
//     'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE'
//   });
//   next();
// }

// app.use(allowCrossDomain);
// const allowCORS = {
//   'Content-Type': 'text/html',
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'Content-Type',
//   'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE'
// }

// ルーティング
const router = express.Router();

  router.get('/', (req, res) => {
    // res.writeHead(200, allowCORS);
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.write('<h1>Hello from Express.js!!!!!!</h1>');
    res.end();
  });

  router.get('/test', (req, res) => {
    // res.writeHead(200, {
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Headers': 'Content-Type',
    //   'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE'
    // });
    res.header('Access-Control-Allow-Origin', '*');

    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json({value: "valval"});
    res.end();
    // res.send({"value": "val"});
  });

  router.get('/test2', (req, res) => {
    res.send('test2');
  });

app.use('/.netlify/functions/express', router);

// lambda関数としてエクスポート
module.exports.handler = serverless(app);
