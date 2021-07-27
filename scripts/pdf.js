const puppeteer = require("puppeteer");
const { execSync } = require("child_process");
const http = require("http");
const handler = require("serve-handler");

const server = http.createServer((req, res) => {
  return handler(req, res, {
    public: "build",
  });
});

(async () => {
  server.listen(3000);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle2",
  });

  await page.pdf({
    path: "build/josh-rutherford-resume.pdf",
    format: "a4",
  });

  await browser.close();
  server.close();
})();
