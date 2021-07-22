const { run } = require("react-snap");

run({
  puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
});
