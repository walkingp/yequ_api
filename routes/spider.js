const express = require("express");
var request = require("request");
var fs = require("fs");
var path = require("path");
const router = express.Router();
const rp = require("request-promise");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function matchPics(html) {
  const result = html.match(/data-src="(.*?)"/gi);
  var arr = [];
  result.forEach((item) => {
    if (item.indexOf("https://") >= 0) {
      arr.push(item.replace("data-src=", "").replace('"', ""));
    }
  });
  return arr;
}
var downloadPic = function (src, dest) {
  var dirPath = path.join(__dirname, "file");
  request(src)
    .pipe(fs.createWriteStream(path.join(dirPath, dest)))
    .on("close", function () {
      console.log("pic saved!");
    });
};

router.get("/", async function (req, res) {
  const { url } = req.query;
  try {
    const html = await rp(url);
    const $ = cheerio.load(html, { ignoreWhitespace: true });

    const allList = matchPics(html);
    allList.forEach((url, index) => {
      console.log("saving:", url);
      const fix = url.slice(url.lastIndexOf("=") + 1);
      downloadPic(url, new Date().getTime() + "." + fix);
    });
    let content = $("#js_content").html().trim();
    content = unescape(content.replace(/&#x/g, "%u").replace(/;/g, ""));
    res.send({
      title: $("#activity-name").text().trim(),
      publish_time: $("#publish_time").text(),
      content,
    });
  } catch (err) {
    res.status(401).send({
      msg: err,
    });
  }
});
router.get("/p", async function (req, res) {
  const { url } = req.query;
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(200);
    const result = await page.evaluate(() => {
      const title = document.querySelector("h1").innerText;
      const content = document.querySelector("article").innerText;

      return { title, content };
    });
    await page.waitFor(200);
    await browser.close();

    res.send(result);
  } catch (err) {
    res.status(401).send({
      msg: err,
    });
  }
});

module.exports = router;
