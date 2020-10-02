const express = require("express");
const { wechat, weapp } = require("../config/config");
const router = express.Router();
const rp = require("request-promise");

router.get("/", async function (req, res) {
  let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wechat.appId}&secret=${wechat.appSecret}`;
  const data = await rp(url);

  url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${
    JSON.parse(data).access_token
  }&type=jsapi`;
  const result = await rp(url);

  res.send(result);
});

module.exports = router;
