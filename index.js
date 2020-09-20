const express = require("express");
const ClientId = "159894829619272";
const ClientSecret = "R6wl7XZcQbNn2bsNt5FlChi61cLvXchA";
const redirectionUrl = "https://api.luwan.club";
const tulipApiUrl = "https://open.tulipsport.com";
const session = require("express-session");

const rp = require("request-promise");

//starting the express app
const app = express();

app.use(
  session({
    secret: "secret", // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
      maxAge: 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
    },
  })
);

//this is the base route
app.get("/", async function (req, res) {
  const { code, scope } = req.query;
  if (code) {
    const reqTokenUrl = getTokenUrl(code, scope);
    const token = await rp(reqTokenUrl);
    const [acess_token, token_type, expires_in, refresh_token] = Object.values(
      JSON.parse(token)
    );
    req.session.acess_token = acess_token;
    const data = await rp({
      uri: `${tulipApiUrl}/api/v1/feeds`,
      headers: {
        Authorization: acess_token,
      },
      json: true,
    });
    res.send(data);
    return;
  }
  const url = getAuthurl();
  res.send(`<a href=${url}>Login</a>`);
});
app.get("/api/v1/tulip/callback", async function (req, res) {
  const { code, scope } = req.query;
  if (code) {
    const reqTokenUrl = getTokenUrl(code, scope);
    const token = await rp(reqTokenUrl);
    const [acess_token, token_type, expires_in, refresh_token] = Object.values(
      JSON.parse(token)
    );
    req.session.acess_token = acess_token;
    const data = await rp({
      uri: `${tulipApiUrl}/api/v1/feeds`,
      headers: {
        Authorization: acess_token,
      },
      json: true,
    });
    res.send(data);
    return;
  }
});

app.get("/api/v1/user", async (req, res) => {
  const data = await rp({
    uri: `${tulipApiUrl}/api/v1/user`,
    headers: {
      Authorization: req.session.acess_token,
    },
  });
  res.send(data);
});

app.get("/api/v1/feeds", async (req, res) => {
  const { count = 20 } = req.query;
  let activities = [];
  let activity_id = null;
  while (activities.length < count) {
    const result = await fetchFeeds(activity_id);
    if (!result || result.length === 0) {
      break;
    }
    let data = JSON.parse(result).msg;
    activity_id = data[data.length - 1].activity_id;
    activities.push(...data);
  }
  res.send(activities);
});

function fetchFeeds(activity_id) {
  return new Promise((resolve, reject) => {
    try {
      const data = rp({
        uri: `${tulipApiUrl}/api/v1/feeds`,
        headers: {
          Authorization: req.session.acess_token, //"rt4pNoRHLBDrxV9FVYYwkXmyaVJuXPJxUttQtV4q", //
        },
        qs: {
          activity_id,
        },
      });
      if (data) {
        resolve(data);
      }
    } catch (err) {
      reject(err);
    }
  });
}

app.get("/api/v1/feeddetail", async (req, res) => {
  const { activity_id } = req.query;
  const data = await rp({
    uri: `${tulipApiUrl}/api/v1/feeddetail`,
    qs: {
      activity_id,
    },
    headers: {
      Authorization: req.session.acess_token,
    },
  });
  res.send(data);
});
/**
 * 生成向认证服务器申请认证的Url
 */
function getAuthurl() {
  return `${tulipApiUrl}/oauth2/authorize?scope=read_stream&redirect_uri=${redirectionUrl}&response_type=code&client_id=${ClientId}`;
}

function getTokenUrl(code, scope) {
  return `${tulipApiUrl}/oauth2/token?code=${code}&redirect_uri=${redirectionUrl}&client_id=${ClientId}&scope=${scope}&client_secret=${ClientSecret}&grant_type=authorization_code`;
}

const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
