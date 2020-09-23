const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const rp = require("request-promise");

const { strava } = require("../config/config");

router.get("/", async function (req, res) {
  const { redirect_uri, client_id, client_secret } = strava;
  const params = {
    scope: "read_stream",
    redirect_uri,
    response_type: "code",
    client_id,
  };
  const qs = querystring.stringify(params);
  const url = `https://www.strava.com/oauth/authorize?${qs}`;
  res.send(`<a href=${url}>Authorize Strava App</a>`);
});

router.get("/callback", async function (req, res) {
  const { code } = req.query;
  const params = {
    code,
    redirect_uri,
    grant_type: "authorization_code",
    client_id,
  };
  const qs = querystring.stringify(params);
  const tokenUrl = `${strava.apiUrl}/oauth/token?${qs}`;
  res.send(tokenUrl);
  return;
  const data = await rp({
    uri: tokenUrl,
  });
  const {
    token_type,
    expires_at,
    expires_in,
    refresh_token,
    access_token,
  } = data;
  req.session.refresh_token = refresh_token;
  req.session.strava_token = access_token;
  res.send(data);
});

router.get("/refreshToken", async function (req, res) {
  const { refresh_token } = req.query;
  const { client_id, client_secret } = strava;
  const params = {
    client_id,
    client_secret,
    refresh_token,
    grant_type: "refresh_token",
  };
  const qs = querystring.stringify(params);
  const tokenUrl = `${strava.apiUr}/oauth/token?${qs}`;
  res.send(tokenUrl);
  return;
  const data = await rp({
    uri: tokenUrl,
  });
});

router.get("/activities", async function (req, res) {
  const { token } = req.query;
  const data = await rp({
    uri: `${strava.apiUr}/user`,
    headers: {
      Authorization: req.session.strava_token || token,
    },
  });
  res.send(data);
});

router.get("/getToken", async function (req, res) {
  res.send({
    strava_token: req.session.strava_token,
    refresh_token: req.session.refresh_token,
  });
});

module.exports = router;
