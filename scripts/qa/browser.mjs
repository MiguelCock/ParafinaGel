import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WEBGL_ARGS = [
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  "--enable-webgl",
  "--ignore-gpu-blocklist",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
];

const BROWSER_CANDIDATES = [
  "/opt/brave-bin/brave",
  "/usr/bin/brave",
  "/usr/bin/brave-browser",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export function resolveBrowserPath(configuredPath) {
  const candidates = configuredPath ? [configuredPath] : BROWSER_CANDIDATES;

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      "No encontré Brave/Chromium/Chrome. Define BROWSER_PATH con la ruta al ejecutable.",
    );
  }
  return found;
}

export async function launchBrowser({ browserPath, headless = true }) {
  const executablePath = resolveBrowserPath(browserPath);
  const browser = await puppeteer.launch({
    executablePath,
    headless,
    args: WEBGL_ARGS,
    protocolTimeout: 180000,
  });

  return {
    browser,
    executablePath,
    version: await browser.version(),
  };
}

export async function createPage(browser, options = {}) {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let page = null;
    try {
      page = await browser.newPage();
      await setupPage(page, options);
      return page;
    } catch (error) {
      lastError = error;
      if (page && !page.isClosed()) {
        await page.close().catch(() => {});
      }
      if (!isTransientSessionError(error) || attempt === 2) throw error;
      await wait(250);
    }
  }

  throw lastError;
}

async function setupPage(
  page,
  {
    width = 1280,
    height = 1000,
    theme = "light",
    reducedMotion = false,
    blockWebgl = false,
  } = {},
) {
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  await page.setDefaultTimeout(15000);
  await page.setDefaultNavigationTimeout(30000);
  await setMedia(page, theme, reducedMotion);

  const errors = [];
  const logs = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push({ type: "console", text: message.text() });
    }
    if (process.env.QA_VERBOSE === "1") {
      logs.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    errors.push({ type: "pageerror", text: error.message });
  });

  if (blockWebgl) {
    await page.evaluateOnNewDocument(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(
        type,
        ...args
      ) {
        if (typeof type === "string" && /webgl/i.test(type)) return null;
        return original.call(this, type, ...args);
      };
    });
  }

  page.__qa = {
    errors,
    logs,
    theme,
    width,
    height,
    blockWebgl,
    reducedMotion,
    axeInjected: false,
  };
}

function isTransientSessionError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /session closed|target closed|protocol error|connection closed/i.test(
    message,
  );
}

async function setMedia(page, theme, reduced) {
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: theme },
    {
      name: "prefers-reduced-motion",
      value: reduced ? "reduce" : "no-preference",
    },
  ]);
}

export async function gotoGame(page, baseUrl, { query = "" } = {}) {
  const url = new URL("/juego/", baseUrl);
  if (query) {
    url.search = query.startsWith("?") ? query.slice(1) : query;
  }

  await page.goto(url.href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.bringToFront();
  await page.waitForSelector('[data-testid="game2d"]', { timeout: 15000 });
  await page
    .addStyleTag({ content: "astro-dev-toolbar{display:none!important}" })
    .catch(() => {});
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  await wait(500);
  await pokeFrame(page);
}

/**
 * Brave's headless compositor can stay idle until a capture, which freezes
 * rAF and the game tick. A 1x1 screenshot starts the frame loop again.
 */
async function pokeFrame(page) {
  await page
    .screenshot({ clip: { x: 0, y: 0, width: 1, height: 1 } })
    .catch(() => {});
}

export async function click(
  page,
  testid,
  { optional = false, timeout = 15000 } = {},
) {
  const selector = `[data-testid="${testid}"]`;
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    await page.click(selector);
  } catch (error) {
    if (optional) return false;
    throw error;
  }

  await wait(160);
  return true;
}

export async function clickSelector(
  page,
  selector,
  { optional = false, timeout = 15000 } = {},
) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    await page.click(selector);
  } catch (error) {
    if (optional) return false;
    throw error;
  }

  await wait(160);
  return true;
}

export async function text(page, testid) {
  return page.$eval(`[data-testid="${testid}"]`, (element) =>
    (element.innerText || element.textContent || "").trim(),
  );
}

export async function exists(page, testid) {
  return Boolean(await page.$(`[data-testid="${testid}"]`));
}

export async function isDisabled(page, testid) {
  return page.$eval(`[data-testid="${testid}"]`, (element) => element.disabled);
}

export async function waitForStage(page, scene, { timeout = 20000 } = {}) {
  await page.waitForSelector(`[data-testid="stage-canvas-${scene}"] canvas`, {
    timeout,
  });
  await pokeFrame(page);
  await wait(700);
}

export async function stagePoint(page, scene, x, y) {
  const rect = await page.$eval(
    `[data-testid="stage-canvas-${scene}"] canvas`,
    (canvas) => {
      const box = canvas.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
      };
    },
  );

  const scale = Math.min(rect.width / 1000, rect.height / 640);
  const offsetX = (rect.width - 1000 * scale) / 2;
  const offsetY = (rect.height - 640 * scale) / 2;

  return {
    x: rect.left + offsetX + x * scale,
    y: rect.top + offsetY + y * scale,
  };
}

export async function focusCanvas(page, scene) {
  await page.evaluate((testid) => {
    document
      .querySelector(`[data-testid="${testid}"]`)
      ?.focus({ preventScroll: true });
  }, `stage-canvas-${scene}`);
  await pokeFrame(page);
  await wait(150);
}

export async function capture(page, outDir, name, report) {
  const file = path.join(outDir, "screens", `${name}.png`);
  await mkdir(path.dirname(file), { recursive: true });

  await page.evaluate(() => {
    document.querySelector('[data-testid="game2d"]')?.scrollIntoView({
      block: "start",
      behavior: "instant",
    });
  });
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  await wait(120);

  const theme = page.__qa.theme;
  await setMedia(page, theme, true);
  await wait(220);

  try {
    const game = await page.$('[data-testid="game2d"]');
    if (!game)
      throw new Error("No encontré el shell del juego para la captura.");
    await game.screenshot({
      path: file,
      captureBeyondViewport: true,
    });
    await game.dispose();
  } finally {
    await setMedia(page, theme, page.__qa.reducedMotion);
  }

  report.screenshots.push({
    name,
    file: path.relative(outDir, file),
    viewport: `${page.__qa.width}x${page.__qa.height}`,
    theme,
  });
}

export async function measureOverflow(page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(
      documentElement.scrollWidth,
      body?.scrollWidth ?? 0,
    );
    const clientWidth = documentElement.clientWidth;
    const overflow = scrollWidth > clientWidth + 1;

    let offenders = [];
    if (overflow) {
      offenders = [...document.querySelectorAll("body *")]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.right > clientWidth + 1;
        })
        .slice(0, 4)
        .map((element) => {
          const className =
            typeof element.className === "string"
              ? element.className.split(/\s+/).filter(Boolean).slice(0, 2)
              : [];
          return `${element.tagName.toLowerCase()}${className.length ? `.${className.join(".")}` : ""}`;
        });
    }

    return { scrollWidth, clientWidth, overflow, offenders };
  });
}

export async function consoleErrors(page) {
  return [...page.__qa.errors];
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) {
    throw new Error(`${message} (recibido: ${value.slice(0, 180)})`);
  }
}
