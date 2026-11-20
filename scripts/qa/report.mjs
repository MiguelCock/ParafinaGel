import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function createReport(config) {
  return {
    startedAt: new Date().toISOString(),
    mode: config.quick ? "quick" : "full",
    baseUrl: config.baseUrl,
    browser: null,
    durationMs: 0,
    checks: [],
    screenshots: [],
    axe: [],
    overflow: [],
    fps: [],
    consoleErrors: [],
    bundle: null,
  };
}

export function recordCheck(report, name, status, detail = "") {
  report.checks.push({
    name,
    status,
    detail,
    at: new Date().toISOString(),
  });
}

export function recordScreenshot(report, screenshot) {
  report.screenshots.push(screenshot);
}

export function recordConsoleErrors(report, flow, errors) {
  if (errors.length === 0) {
    recordCheck(report, `consola ${flow}`, "pass", "sin errores");
    return;
  }

  report.consoleErrors.push({ flow, errors });
  recordCheck(
    report,
    `consola ${flow}`,
    "fail",
    errors.map((error) => `${error.type}: ${error.text}`).join(" | "),
  );
}

export function counts(report) {
  const result = { pass: 0, fail: 0, warn: 0, skip: 0 };
  for (const check of report.checks) {
    result[check.status] = (result[check.status] ?? 0) + 1;
  }
  return result;
}

export function isSuccessful(report) {
  return counts(report).fail === 0;
}

export async function writeReports(report, outDir) {
  await mkdir(path.join(outDir, "screens"), { recursive: true });

  const jsonPath = path.join(outDir, "report.json");
  const markdownPath = path.join(outDir, "report.md");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, renderMarkdown(report), "utf8");

  return { jsonPath, markdownPath };
}

export function printSummary(report, paths) {
  const totals = counts(report);
  const status = isSuccessful(report) ? "PASS" : "FAIL";
  const duration = (report.durationMs / 1000).toFixed(1);

  console.log("");
  console.log(
    `QA ${status} · ${totals.pass} ok · ${totals.fail} fail · ${totals.warn} warn · ${duration} s`,
  );

  for (const check of report.checks.filter((item) => item.status === "fail")) {
    console.log(`  ✗ ${check.name}: ${check.detail}`);
  }

  for (const check of report.checks.filter((item) => item.status === "warn")) {
    console.log(`  ! ${check.name}: ${check.detail}`);
  }

  console.log(`  capturas: ${report.screenshots.length}`);
  console.log(`  reporte: ${paths.markdownPath}`);
  console.log(`  json:    ${paths.jsonPath}`);
}

function renderMarkdown(report) {
  const totals = counts(report);
  const status = isSuccessful(report) ? "PASS" : "FAIL";
  const lines = [
    "# QA del juego",
    "",
    `- **Resultado:** ${status}`,
    `- **Modo:** ${report.mode}`,
    `- **Inicio:** ${report.startedAt}`,
    `- **Duración:** ${(report.durationMs / 1000).toFixed(1)} s`,
    `- **Navegador:** ${report.browser ?? "no disponible"}`,
    `- **Base:** ${report.baseUrl ?? "preview local"}`,
    `- **Checks:** ${totals.pass} ok, ${totals.fail} fail, ${totals.warn} warn, ${totals.skip} skip`,
    "",
    "## Checks",
    "",
    "| Check | Estado | Detalle |",
    "| --- | --- | --- |",
    ...report.checks.map(
      (check) =>
        `| ${escapeCell(check.name)} | ${check.status} | ${escapeCell(check.detail)} |`,
    ),
    "",
    "## Capturas",
    "",
    ...(report.screenshots.length
      ? report.screenshots.map(
          (shot) =>
            `- [${shot.name}](screens/${path.basename(shot.file)}) · ${shot.viewport} · ${shot.theme}`,
        )
      : ["Sin capturas."]),
    "",
    "## axe",
    "",
    ...(report.axe.length
      ? report.axe.map(
          (scan) =>
            `- ${scan.state} · ${scan.viewport} · ${scan.theme}: ${scan.violations.length} violaciones`,
        )
      : ["Sin escaneos."]),
    "",
    "## Overflow",
    "",
    ...(report.overflow.length
      ? report.overflow.map(
          (item) =>
            `- ${item.state} · ${item.viewport} · ${item.theme}: ${item.overflow ? "overflow" : "ok"} (${item.scrollWidth}/${item.clientWidth})`,
        )
      : ["Sin mediciones."]),
    "",
    "## FPS",
    "",
    ...(report.fps.length
      ? report.fps.map(
          (sample) =>
            `- ${sample.label}: ${sample.avgFps.toFixed(1)} fps · p95 ${sample.p95FrameMs.toFixed(1)} ms · ${sample.frames} frames`,
        )
      : ["Sin muestras."]),
    "",
    "## Bundle",
    "",
    ...(report.bundle
      ? [
          `- Chunk más grande: ${report.bundle.largestChunk.file} · ${report.bundle.largestChunk.gzipKb.toFixed(1)} KB gzip`,
          `- JS inicial de /juego: ${report.bundle.gameInitialJsKb.toFixed(1)} KB gzip`,
          `- JS total del build: ${report.bundle.totalJsKb.toFixed(1)} KB gzip`,
          `- JS fuera de /juego: ${report.bundle.nonGameJsKb.toFixed(1)} KB gzip`,
          `- Fuga de chunk grande: ${report.bundle.largestChunkLeak ? "sí" : "no"}`,
          ...report.bundle.topChunks
            .slice(0, 5)
            .map(
              (chunk) =>
                `  - ${chunk.file}: ${chunk.gzipKb.toFixed(1)} KB gzip`,
            ),
        ]
      : ["Sin análisis."]),
    "",
  ];

  if (report.consoleErrors.length) {
    lines.push("## Errores de consola", "");
    for (const entry of report.consoleErrors) {
      lines.push(`### ${entry.flow}`, "");
      for (const error of entry.errors) {
        lines.push(`- ${error.type}: ${error.text}`);
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}
