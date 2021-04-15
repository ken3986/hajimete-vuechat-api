require('dotenv').config();

// Express読み込み
const express = require('express');
const app = express();

// CORS許可
const cors = require('cors');
app.use(cors());

// serverless読み込み
const serverless = require('serverless-http');

const admin = require('firebase-admin');

// ルーティング
const router = express.Router();

  router.get('/', (req, res) => {
    res.header('Content-Type', 'text/html');
    res.send('<h1>default page</h1>');
  });

  router.get('/test', (req, res) => {

    res.header('Content-Type', 'text/plain');
    res.send('test1 plain');
  });

  router.get('/test2', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send({value: "テスト２"});
  });

  router.get('/test2', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send({value: process.env.KEY1});
  });

app.use('/.netlify/functions/express', router);

// lambda関数としてエクスポート
module.exports.handler = serverless(app);
