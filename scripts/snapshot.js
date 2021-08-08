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
  const startTime = Date.now();
  let repo;
  let commitsWithoutVisualChanges = [];
  let commitsWithoutSourceChanges = [];

  if (existsSync(manifestFile)) {
    const existingManifest = JSON.parse(readFileSync(manifestFile));
    commitsWithoutVisualChanges =
      existingManifest.commitsWithoutVisualChanges ||
      commitsWithoutVisualChanges;
    commitsWithoutSourceChanges =
      existingManifest.commitsWithoutSourceChanges ||
      commitsWithoutSourceChanges;
  }

  if (existsSync("tmp")) {
    log("Opening existing repo...");
    repo = await Git.Repository.open(tmpRepo);
  } else {
    log("Create tmp dir");
    await fs.mkdir("tmp");
    log("Cloning repo...");
    repo = await Git.Clone(config.repository.url, tmpRepo);
  }

  log("Setting up github secrets...");
  const secret = await fs.readFile(secretFile);
  const secretTxt = path.resolve(tmpRepo, "src/github.secret.txt");
  const secretJson = path.resolve(tmpRepo, "src/github.secret.json");

  if (!existsSync(secretTxt)) {
    await fs.copyFile(secretFile, secretTxt);
  }

  if (!existsSync(secretJson)) {
    await fs.writeFile(secretJson, `"${secret}"`);
  }

  log("Getting commits...");
  const mostRecentCommit = await repo.getMasterCommit();
  const history = mostRecentCommit.history();
  const commits = [];
  let commitShas = [];
  let commit;
  let size;
  let screenshot;
  let index = 0;
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  log(`Starting server on port :${port}...`);
  server.listen(port);

  let screenshots = [];
  if (!existsSync(screenshotDir)) {
    log("Creating screenshot dir...");
    await fs.mkdir(screenshotDir);
  } else {
    screenshots = await fs.readdir(screenshotDir);
  }

  async function snapshotNextCommit() {
    let prevCommit = commit;
    commit = commits.pop();
    const sha = commit.sha();
    const alreadyScreenshotted = screenshots.some((screenshot) => {
      return new RegExp(`\\d\\s-\\s${sha}\.png`).test(screenshot);
    });

    if (alreadyScreenshotted) {
      log(`Commit ${sha}.png has already been snapshotted. Skipping...`);
      index++;
      return;
    }

    if (commitsWithoutVisualChanges.includes(sha)) {
      log(
        `Commit ${sha} has previously been determined not to contain visual changes. Skipping...`
      );
      return;
    }

    if (commitsWithoutSourceChanges.includes(sha)) {
      log(
        `Commit ${sha} has previously been determined not to contain source code changes. Skipping...`
      );
      return;
    }

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

    const initialCommit = !index;
    const sourceFilesChanged = changedFiles.some((file) =>
      file.startsWith("src")
    );

    if (!sourceFilesChanged && !initialCommit) {
      log(`No source files changed, skipping commit ${sha}`);
      commitsWithoutSourceChanges.push(sha);
      return;
    }

    log("Building...");
    try {
      execSync("yarn build", {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch (e) {
      log(`Error building: `, e);
    }

    try {
      log(`Opening page ${pageURL}`);
      await page.goto(pageURL, {
        waitUntil: "networkidle2",
      });

      const screenshotFile = path.resolve(
        screenshotDir,
        `${index + 1} - ${sha}.png`
      );
      log(`📸 Taking screenshot ${sha}.png`);
      const buffer = await page.screenshot({
        fullPage: true,
      });

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
            JSON.stringify(
              {
                size,
                prevSize: prevSize,
              },
              undefined,
              2
            )
          );
        }
      }

      if (differenceInPixels > CHANGE_THRESHOLD) {
        await fs.writeFile(screenshotFile, PNG.sync.write(screenshot), "utf-8");
        index++;
      } else {
        log(
          `Not much changed (${differenceInPixels}px) skipping screenshot...`
        );
        commitsWithoutVisualChanges.push(sha);
      }
    } catch (e) {
      log(`❌ Couldn't snapshot commit ${commit.message()}: `, e);
    }
  }

  history.on("commit", function collect(commit) {
    commits.push(commit);
    commitShas.push(commit.sha());
  });

  history.on("end", async function process() {
    while (commits.length) {
      await snapshotNextCommit();
    }

    log("Closing browser...");
    await browser.close();

    log("Closing server...");
    server.close();

    log("Cleaning up tmp dir...");
    await rm("tmp");

    log("Writing manifest");
    await fs.writeFile(
      manifestFile,
      JSON.stringify(
        {
          commitsWithoutSourceChanges,
          commitsWithoutVisualChanges,
          orderedCommitShas: commitShas,
        },
        undefined,
        2
      )
    );
    const duration = Date.now() - startTime;
    log(`Snapshotting took ${duration / 1000}s`);
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

  return await fs.unlink(fileOrDirectory);
}

const CHANGE_THRESHOLD = 50;
