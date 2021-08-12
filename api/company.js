const cheerio = require("cheerio");
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
    const data = {
      id: $(op).val(),
      name: $(op).text(),
    };
    options.push(data);
  });
  res.status(200).send({ options });
};
