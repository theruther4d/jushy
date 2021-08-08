const Git = require("nodegit");
const path = require("path");
const fs = require("fs/promises");
const { existsSync, readFileSync } = require("fs");
const config = require("../package.json");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");
const http = require("http");
const handler = require("serve-handler");
const chalk = require("chalk");
const pixelmatch = require("pixelmatch");
const { PNG } = require("pngjs");

const tmpRepo = path.resolve(__dirname, "../tmp");
const secretFile = path.resolve(__dirname, "../src/github.secret.txt");
const screenshotDir = path.resolve(__dirname, "../screenshots");
const manifestFile = path.resolve(__dirname, "../screenshot-manifest.json");
const port = 3000;
const pageURL = `http://localhost:${port}/`;

/**
 * Ideas
 * - reuse page between?
 */
const server = http.createServer((req, res) => {
  const public = path.resolve(tmpRepo, "./build");
  return handler(req, res, {
    public,
  });
});

function log(message, ...others) {
  console.log(chalk.blue(message), ...others);
}

(async () => {
  if (existsSync("tmp")) {
    log("Cleaning up tmp dir");
    await rm("tmp");
  } else {
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
  let commit;
  let size;
  let screenshot;
  let screenshotFile;

  async function snapshotNextCommit() {
    let prevCommit = commit;
    commit = commits.pop();
    const sha = commit.sha();

    log("Checking out commit: ", commit.message());
    await Git.Checkout.tree(repo, commit, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });

    let changedFiles = [];

    if (prevCommit) {
      const to = await commit.getTree();
      const from = await prevCommit.getTree();
      const diff = await to.diff(from);
      const patches = await diff.patches();
      changedFiles = patches.map((it) => it.newFile().path());
    }

    if (!prevCommit || changedFiles.includes("package.json")) {
      try {
        log("Installing deps...");
        execSync("yarn", { cwd: tmpRepo, stdio: "ignore" });
      } catch (e) {
        log(`❌ Couldn't install deps for commit ${commit.message()}: `, e);
      }
    } else {
      log(`No dependency changes, skipping`);
    }

    const changedSrcFiles = changedFiles.some((it) => it.startsWith("src/"));
    if (!prevCommit || changedSrcFiles) {
      try {
        log("Building...");
        execSync("yarn build", { cwd: tmpRepo, stdio: "ignore" });
      } catch (e) {
        log(`❌ Couldn't build commit ${commit.message()}: `, e);
      }
    } else {
      log("No changed files in src/, skipping build");
    }

    try {
      log(`Starting server on port :${port}...`);
      server.listen(port);

      log("Starting puppeteer");
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      log(`Opening page ${pageURL}`);
      await page.goto(pageURL, {
        waitUntil: "networkidle2",
      });

      if (!existsSync(screenshotDir)) {
        log("Creating screenshot dir...");
        await fs.mkdir(screenshotDir);
      }

      const prevScreenshotFile = screenshotFile;
      screenshotFile = path.resolve(screenshotDir, `${sha}.png`);
      log(`📸 Taking screenshot ${sha}.png`);
      const buffer = await page.screenshot({
        path: screenshotFile,
        fullPage: true,
      });

      // Remove screenshots with no changes from previous image:
      const prevScreenshot = screenshot;
      const prevSize = size;
      screenshot = PNG.sync.read(buffer);
      let differenceInPixels = Infinity;

      if (
        screenshot.width === prevScreenshot?.width &&
        screenshot.height === prevScreenshot?.height
      ) {
        try {
          differenceInPixels = pixelmatch(
            screenshot.data,
            prevScreenshot.data,
            null,
            screenshot.width,
            screenshot.height
          );
        } catch (e) {
          log(
            `error diffing screenshots: `,
            e,
            JSON.stringify({
              size,
              prevSize: prevSize,
            })
          );
        }
      }

      if (differenceInPixels > 50) {
        await fs.writeFile(screenshotFile, PNG.sync.write(screenshot), "utf-8");
      } else {
        log(
          `Not much changed (${differenceInPixels}px) skipping screenshot...`
        );
      }

      log("Closing browser...");
      await browser.close();
      server.close();
      commitShas.push(sha);
    } catch (e) {
      log(`❌ Couldn't snapshot commit ${commit.message()}: `, e);
    }
  }

  history.on("commit", function collectCommitsThenSnapshot(commit) {
    commits.push(commit);
  });

  await history.start();

  history.on("end", async function onHistoryCollected() {
    while (commits.length) {
      await snapshotNextCommit();
    }

    log("Cleaning up...");
    await rm("tmp");

    log("Writing manifest");
    await fs.writeFile(
      manifestFile,
      JSON.stringify({
        orderedCommitShas: commitShas,
      })
    );
  });
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
