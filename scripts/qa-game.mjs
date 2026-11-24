import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { analyzeBundle } from "./qa/checks.mjs";
import {
  ensureDist,
  findFreePort,
  readConfig,
  ROOT,
  runBuild,
  startPreview,
  stopPreview,
} from "./qa/env.mjs";
import {
  flowDark,
  flowFallback,
  flowKeyboardFourOrders,
  flowMobile,
  flowMobileGel,
  flowMotionOverrides,
  flowOverflowMatrix,
  flowPointerClassic,
  flowSandbox,
  recordBundle,
} from "./qa/flows.mjs";
import {
  createReport,
  isSuccessful,
  printSummary,
  recordCheck,
  writeReports,
} from "./qa/report.mjs";
import { launchBrowser } from "./qa/browser.mjs";

function log(message) {
  console.log(`▶ ${message}`);
}

async function runFlow(report, name, fn) {
  try {
    await fn();
    report.checks.push({
      name,
      status: "pass",
      detail: "",
      at: new Date().toISOString(),
    });
    console.log(`✓ ${name}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    report.checks.push({
      name,
      status: "fail",
      detail,
      at: new Date().toISOString(),
    });
    console.error(`✗ ${name}: ${detail}`);
  }
}

async function main() {
  const config = readConfig();
  const report = createReport(config);
  const started = Date.now();

  let preview = null;
  let browser = null;

  await rm(path.join(config.outDir, "screens"), {
    recursive: true,
    force: true,
  });
  await mkdir(path.join(config.outDir, "screens"), { recursive: true });

  try {
    if (!config.baseUrl) {
      if (!config.skipBuild) {
        log("build");
        await runBuild();
      }
      ensureDist();
      const port = await findFreePort(config.port);
      log(`preview en http://127.0.0.1:${port}`);
      preview = await startPreview(port);
    }

    const baseUrl = config.baseUrl ?? preview.url;
    report.baseUrl = baseUrl;

    log("navegador");
    const launched = await launchBrowser({
      browserPath: config.browserPath,
      headless: config.headless,
    });
    browser = launched.browser;
    report.browser = `${launched.version} · ${launched.executablePath}`;

    const context = {
      browser,
      baseUrl,
      outDir: config.outDir,
      report,
    };

    await runFlow(report, "pointer-classic", () => flowPointerClassic(context));

    if (!config.quick) {
      await runFlow(report, "keyboard-four-orders", () =>
        flowKeyboardFourOrders(context),
      );
      await runFlow(report, "mobile-390", () => flowMobile(context));
      await runFlow(report, "mobile-gel-390", () => flowMobileGel(context));
      await runFlow(report, "dark-1280-390", () => flowDark(context));
    }

    await runFlow(report, "sandbox", () => flowSandbox(context));
    await runFlow(report, "fallback", () => flowFallback(context));
    await runFlow(report, "overflow-matrix", () => flowOverflowMatrix(context));
    await runFlow(report, "motion-overrides", () =>
      flowMotionOverrides(context),
    );

    log("bundle");
    const distEntry = path.join(ROOT, "dist/juego/index.html");
    if (!existsSync(distEntry)) {
      recordCheck(report, "bundle", "skip", "dist/ no está disponible");
    } else {
      try {
        recordBundle(report, analyzeBundle(path.join(ROOT, "dist")));
      } catch (error) {
        recordCheck(
          report,
          "bundle",
          "fail",
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    recordCheck(report, "setup", "fail", detail);
    console.error(`✗ setup: ${detail}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopPreview(preview);
    report.durationMs = Date.now() - started;

    const paths = await writeReports(report, config.outDir);
    printSummary(report, paths);

    if (!isSuccessful(report)) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
