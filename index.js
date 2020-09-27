const express = require("express");
const session = require("express-session");
const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30,
    },
  })
);

app.use(express.static(__dirname));

//this is the base route
app.get("/", async function (req, res) {
  const url = getAuthurl();
  res.send(`<a href=${url}>Login</a>`);
});
app.get("/api/v1/tulip/callback", async function (req, res) {
  const { code, scope } = req.query;
  if (code) {
    const reqTokenUrl = getTokenUrl(code, scope);
    const token = await rp(reqTokenUrl);
    req.session.token = token;
    global.token = token;
    // res.sendFile(__dirname + "/bindok.html");
    const data = fs.readFileSync(__dirname + "/bindok.html");
    const html = data
      .toString()
      .replace("$$$$", JSON.stringify(token).replace(/"/g, "'"));
    res.set("Content-Type", "text/html");
    res.send(html);
  }
});

app.get("/api/v1/tulip/getToken", async function (req, res) {
  res.send(global.token);
});

app.get("/api/v1/user", async (req, res) => {
  const { token } = req.query;
  const data = await rp({
    uri: `${tulipApiUrl}/api/v1/user`,
    headers: {
      Authorization: req.session.acess_token || token,
    },
  });
  res.send(data);
});

app.get("/api/v1/feeds", async (req, res) => {
  let { token } = req.query;
  token = token || req.session.acess_token;
  const result = await fetchFeeds(token);
  if (!result || result.length === 0) {
    return;
  }
  const activities = JSON.parse(result).msg;
  res.send(activities);
});
const tulip = require("./routes/tulip");
const strava = require("./routes/strava");
const spider = require("./routes/spider");

app.use("/api/v1/tulip", tulip);
app.use("/api/v1/strava", strava);
app.use("/api/v1/spider", spider);

const server = app.listen(8081, "0.0.0.0", function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Server started, please open http://%s:%s", host, port);
});
