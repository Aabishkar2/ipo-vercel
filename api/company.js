const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto("https://iporesult.cdsc.com.np/");
  const html = await page.evaluate(() => {
    return document.getElementById("companyShare").innerHTML;
  });
  const $ = cheerio.load(html);
  const options = [];
  await $("option").each((i, op) => {
    options.push($(op).text());
  });
  const data = await fs.readFileSync("data", "utf8").split("\n");
  const newOptions = [];
  await Promise.all(
    options.map(async (x) => {
      if (!data.includes(x)) {
        await fs.writeFileSync("data", `${x}\n`);
        newOptions.push(x);
      }
    })
  );

  res.status(200).send({ options: newOptions });
};
