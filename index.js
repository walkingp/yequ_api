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

const tulip = require("./routes/tulip");
const strava = require("./routes/strava");

app.use("/api/v1/tulip", tulip);
app.use("/api/v1/strava", strava);
const server = app.listen(8081, "0.0.0.0", function () {
  console.log(server);
  const host = server.address().address;
  const port = server.address().port;

  console.log("Server started, please open http://%s:%s", host, port);
});
