const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");

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
app.get("/tulip_bindok.html", async function (req, res) {
  const data = fs.readFileSync(__dirname + "/assets/tulip_bindok.html");
  const html = data.toString().replace("$$$$", "test");
  res.set("Content-Type", "text/html");
  res.send(html);
});
const tulip = require("./routes/tulip");
const strava = require("./routes/strava");
const spider = require("./routes/spider");
const wechat = require("./routes/wechat");

app.use("/api/v1/tulip", tulip);
app.use("/api/v1/strava", strava);
app.use("/api/v1/spider", spider);
app.use("/api/v1/wechat", wechat);

const server = app.listen(8081, "0.0.0.0", function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Server started, please open http://%s:%s", host, port);
});
