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
const serviceAccount = {
  "type": process.env.TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, ('\n')),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
}

if(!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });
}

const usersRef = admin.database().ref("users");
const channelsRef = admin.database().ref('channels');

const getData = (ref) => {
  return new Promise((resolve, reject) => {
    const onDataCallback = snapshot => resolve(snapshot.val())
    ref.on('value', onDataCallback)
  });
}

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

  router.get('/test2', async(req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    // res.send({value: "テスト２"});
    const users = await getData(usersRef);
    res.send(users);
  });


  router.get('/test3', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send({value: process.env.KEY1});
  });

  // チャンネル一覧の取得
  router.get('/channels', async(req, res) => {
    let channelsRef = admin.database().ref('channels');
    channelsRef.once('value', function(snapshot) {
      let items = new Array();
      snapshot.forEach(function(childSnapshot) {
        let cname = childSnapshot.key;
        items.push(cname);
      });
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.send({channels: items});
    });
  });

app.use('/.netlify/functions/express', router);

// lambda関数としてエクスポート
module.exports.handler = serverless(app);
