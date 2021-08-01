const Git = require("nodegit");
const path = require("path");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const config = require("../package.json");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");
const http = require("http");
const handler = require("serve-handler");
const chalk = require("chalk");

const tmpRepo = path.resolve(__dirname, "../tmp");
const secretFile = path.resolve(__dirname, "../src/github.secret.txt");
const screenshotDir = path.resolve(__dirname, "../screenshots");
const manifestFile = path.resolve(__dirname, "../screenshot-manifest.json");
const port = 3000;
const pageURL = `http://localhost:${port}/`;

/**
 * Ideas
 * - use diff to determine if we should install deps, build, etc. more strtegically
 * - manifest to give commit order so screenshots can be named by sha -> would allow skipping screenshots that are already present
 * - diff between commits to determine changed areas, use that for pan / zoom effects, or to skip frames with no changes?
 * - reuse page between?
 */
const server = http.createServer((req, res) => {
  return handler(req, res, {
    public: path.resolve(tmpRepo, "/build"),
  });
});

function log(message, ...others) {
  console.log(chalk.blue(message), ...others);
}

(async () => {
  if (!existsSync("tmp")) {
    log("Create tmp dir");
    await fs.mkdir("tmp");
  }

  log("Cloning repo...");
  const repo = await Git.Clone(config.repository.url, tmpRepo);

  log("Setting up github secrets...");
  const secret = await fs.readFile(secretFile);
  await fs.copyFile(secretFile, path.resolve(tmpRepo, "src/github.secret.txt"));
  await fs.writeFile(
    path.resolve(tmpRepo, "src/github.secret.json"),
    `"${secret}"`
  );

  log("Getting commits...");
  const mostRecentCommit = await repo.getMasterCommit();
  const history = mostRecentCommit.history();
  const commits = [];
  let commitShas = [];
  let nextSnapshotTimeout;

  async function snapshotNextCommit() {
    const commit = commits.pop();
    const sha = commit.sha();

    log("Checking out commit: ", commit.message());
    await Git.Checkout.tree(repo, commit, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });

    try {
      log("Installing deps...");
      execSync("yarn", { cwd: tmpRepo, stdio: "ignore" });
      log("Building...");
      execSync("yarn build", { cwd: tmpRepo, stdio: "ignore" });
      log("Starting server...");
      server.listen(port);

      log("Starting puppeteer");
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      log("Opening page");
      await page.goto(pageURL, {
        waitUntil: "networkidle2",
      });

      if (!existsSync(screenshotDir)) {
        log("Creating screenshot dir...");
        await fs.mkdir(screenshotDir);
      }

      log("📸 Taking screenshot...");
      await page.screenshot({
        path: path.resolve(screenshotDir, `${sha}.png`),
        fullPage: true,
      });

      log("Closing browser...");
      await browser.close();
      server.close();
      commitShas.push(sha);

      if (!commits.length) {
        log("Cleaning up...");
        await rm("tmp");

        log("Writing manifest");
        await fs.writeFile(
          manifestFile,
          JSON.stringify({
            orderedCommitShas: commitShas,
          })
        );
      }
    } catch (e) {
      log(`❌ Couldn't build commit ${commit.message()}: `, e);
    }

    snapshotNextCommit();
  }

  history.on("commit", function collectCommitsThenSnapshot(commit) {
    clearTimeout(nextSnapshotTimeout);
    commits.push(commit);

    nextSnapshotTimeout = setTimeout(snapshotNextCommit, 100);
  });

  await history.start();
})();

async function rm(fileOrDirectory) {
  let isDirectory = await (await fs.lstat(fileOrDirectory)).isDirectory();

  if (isDirectory) {
    let files = await fs.readdir(fileOrDirectory);
    await Promise.all(files.map((it) => rm(path.resolve(fileOrDirectory, it))));
    return await fs.rmdir(fileOrDirectory);
  }

  return await fs.rm(fileOrDirectory);
}
