// Express読み込み
const express = require('express');
const app = express();

// CORS許可
const cors = require('cors')({origin: true});
app.use(cors);

// serverless読み込み
const serverless = require('serverless-http');

// ルーティング
const router = express.Router();

  router.get('/', (req, res) => {
    // res.header('Content-Type', 'application/json; charset=utf-8');
    // res.send({result: 'express'});
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.status(200);
    res.send('express');
  });

  router.get('/test', (req, res) => {
    res.send('test');
  })

app.use('/.netlify/functions/express', router);

// lambda関数としてエクスポート
module.exports.handler = serverless(app);
