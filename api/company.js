const cheerio = require("cheerio");
const chromium = require("chrome-aws-lambda");
const storage = require("node-persist");

module.exports = async (req, res) => {
  await storage.init();
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
  const companies = (await storage.getItem("companies")) || [];
  const newOptions = [];
  await Promise.all(
    options.map(async (x) => {
      if (!companies.includes(x)) {
        newOptions.push(x);
      }
    })
  );
  await storage.setItem("companies", [...companies, ...newOptions]);
  res.status(200).send({ options: newOptions });
};
