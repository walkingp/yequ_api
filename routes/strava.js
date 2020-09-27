const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const rp = require("request-promise");

const { strava } = require("../config/config");

router.get("/", async function (req, res) {
  const { redirect_uri, client_id, client_secret } = strava;
  const params = {
    client_id,
    response_type: "code",
    redirect_uri,
    approval_prompt: "force",
    scope: "read",
  };
  const qs = querystring.stringify(params);
  const url = `https://www.strava.com/oauth/authorize?${qs}`;
  res.send(`<a href=${url}>Authorize Strava App</a>`);
});

router.get("/callback", async function (req, res) {
  const { code } = req.query;
  const { redirect_uri, client_id, client_secret } = strava;
  const params = {
    client_id,
    client_secret,
    code,
    grant_type: "authorization_code",
  };
  const data = await rp({
    method: "POST",
    uri: `${strava.apiUrl}/oauth/token`,
    body: params,
    json: true,
  });
  const {
    token_type,
    expires_at,
    expires_in,
    refresh_token,
    access_token,
  } = data;
  req.session.strava_token = {
    token_type,
    expires_at,
    expires_in,
    refresh_token,
    access_token,
  };
  res.send(data);
});

router.get("/getToken", async function (req, res) {
  res.send(req.session.strava_token);
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

  const data = await rp({
    method: "POST",
    uri: `${strava.apiUrl}/oauth/token`,
    body: params,
    json: true,
  });
  res.send(data);
});

router.get("/athlete", async function (req, res) {
  const { token } = req.query;
  const { access_token, token_type } = req.session.strava_token;

  const data = await rp({
    uri: `${strava.apiUrl}/athlete`,
    headers: {
      Authorization: token_type + " " + access_token || token,
    },
    json: true,
  });
  res.send(data);
});
// https://api.luwan.club/api/v1/strava/clubs/127675/activities
// https://api.luwan.club/api/v1/strava/clubs/127675/activities?page=1&per_page=100
router.get("/clubs/:id/activities", async function (req, res) {
  const { token } = req.query;
  const { access_token, token_type } = req.session.strava_token;

  const { id } = req.params;
  const { page, per_page } = req.query;

  const data = await rp({
    uri: `${strava.apiUrl}/clubs/${id}/activities`,
    headers: {
      Authorization: token_type + " " + access_token || token,
    },
    qs: {
      page,
      per_page,
    },
    json: true,
  });
  res.send(data);
});

module.exports = router;
