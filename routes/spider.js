const express = require("express");
const router = express.Router();
const rp = require("request-promise");
const puppeteer = require("puppeteer");

router.get("/", async function (req, res) {
  const { url } = req.query;
  try {
    const html = await rp(url);
    res.send(html);
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
