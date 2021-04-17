require('dotenv').config();

// Express読み込み
const express = require('express');
const app = express();

// CORS許可
const cors = require('cors');
app.use(cors());

// serverless読み込み
const serverless = require('serverless-http');

// req.bodyから値を取得できるようにする
const bp = require('body-parser');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Firebase RealtimeDatabaseに接続
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
  // const channelsRef = admin.database().ref('channels');

  const getData = (ref) => {
    return new Promise((resolve, reject) => {
      const onDataCallback = snapshot => resolve(snapshot.val())
      ref.on('value', onDataCallback)
    });
  }

// ユーザー認証
  const anonymousUser = {
    id: "anon",
    name: "Anonymous",
    avatar: ""
  };

  const checkUser = (req, res, next) => {
    req.user = anonymousUser;
    if(req.query.auth_token != undefined) {
      let idToken = req.query.auth_token(idToken).then(decodedIdToken => {
        let authUser = {
          id: decodedIdToken.user_id,
          name: decodedIdToken.name,
          avatar: decodedIdToken.picture
        };
        req.user = authUser;
        next();
      }).catch(error => {
        next();
      });
    } else {
      next();
    }
  }
  app.use(checkUser);

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

  // チャンネルの作成関数
  function createChannel(cname) {
    let channelsRef = admin.database().ref('channels');
    let date1 = new Date();
    let date2 = new Date();
    date2.setSeconds(date2.getSeconds() + 1);
    const defaultData = `{
      "messages": {
        "1": {
          "body": "Welcome to #${cname} channel!",
          "date": "${date1.toJSON()}",
          "user": {
            "avatar": "",
            "id": "robot",
            "name": "Robot"
          }
        },
        "2": {
          "body": "はじめてのメッセージを投稿してみましょう。",
          "date": "${date2.toJSON()}",
          "user": {
            "avatar": "",
            "id": "robot",
            "name": "Robot"
          }
        }
      }
    }`;
    channelsRef.child(cname).set(JSON.parse(defaultData));
  }
  // チャンネルの作成
  router.post('/channels', (req, res) => {
    let cname = req.body.cname;
    createChannel(cname);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(201).json({result: 'ok' + ' ' + req.body.cname});
  });

  // メッセージ一覧の取得
  router.get('/channels/:cname/messages', (req, res) => {
    let cname = req.params.cname;
    let messagesRef = admin.database().ref(`channels/${cname}/messages`).limitToLast(20);
    messagesRef.once('value', function(snapshot) {
      let items = new Array();
      snapshot.forEach(function(childSnapshot) {
        let message = childSnapshot.val();
        message.id = childSnapshot.key;
        items.push(message);
      });
      items.reverse();
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.send({messages: items});
    });
  });

  // メッセージの追加
  router.post('/channels/:cname/messages', (req, res) => {
    let cname = req.params.cname;
    let message = {
      date: new Date().toJSON(),
      body: req.body.body,
      user: req.user
    };
    let messagesRef = admin.database().ref(`channels/${cname}/messages`);
    messagesRef.push(message);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(201).send({result: 'ok'});
    res.end();
  });

  // 初期状態に戻す（注：データが消える）
  router.post('/reset', (req, res) => {
    createChannel('general');
    createChannel('random');
    res.header('Content-Type', 'application/json; charset=utf8');
    res.status(201).send({result: 'ok'});
  });

app.use('/.netlify/functions/chat-api', router);

// lambda関数としてエクスポート
module.exports.handler = serverless(app);
