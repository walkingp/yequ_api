var express = require("express");
var Session = require("express-session");
const ClientId = "159894829619272";
const ClientSecret = "R6wl7XZcQbNn2bsNt5FlChi61cLvXchA";
const redirectionUrl = "https://api.luwan.club";

//starting the express app
var app = express();

//using session in express
app.use(
  Session({
    secret: "your-random-secret-19890913007",
    resave: true,
    saveUninitialized: true,
  })
);

//this is the base route
app.get("/", function (req, res) {
  var url = getAuthurl();
  res.send(
    `<h1>Authentication using google oAuth</h1><a href=${url}>Login</a>`
  );
});

// GET /oauthcallback?code={authorizationCode}
app.get("/oauthCallback", function (req, res) {
  // 获取url中code的值
  var code = req.query.code;
  var session = req.session;
  // 使用授权码code，向认证服务器申请令牌
  var oauth2Client = getOAuthClient();
  oauth2Client.getToken(code, function (err, tokens) {
    // tokens包含一个access_token和一个可选的refresh_token
    if (!err) {
      oauth2Client.setCredentials(tokens);
      session["tokens"] = tokens;
      res.send(
        `<h3>Login successful!</h3><a href="/details">Go to details page</a>`
      );
    } else {
      res.send(`<h3>Login failed!!</h3>`);
    }
  });
});

/**
 * 创建OAuth客户端
 */
function getOAuthClient() {
  return new OAuth2(ClientId, ClientSecret, RedirectUrl);
}
/**
 * 生成向认证服务器申请认证的Url
 */
function getAuthurl() {
  return `http://open.tulipsport.com/oauth2/authorize?scope=read_stream&redirect_uri=${redirectionUrl}&response_type=code&client_id=${ClientId}`;
}

function getTokenUrl(code) {
  return `http://open.tulipsport.com/oauth2/token?code=${code}&redirect_uri=${redirectionUrl}&client_id=${ClientId}&scope=read_stream&client_secret=${ClientSecret}&grant_type=authorization_code`;
}

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
