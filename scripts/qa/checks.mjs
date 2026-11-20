import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import axe from "axe-core";
import { measureOverflow } from "./browser.mjs";
import { recordCheck } from "./report.mjs";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const CHUNK_BUDGET_KB = 130;
const TOTAL_JS_BUDGET_KB = 260;

export async function scanAxe(page, report, { state, theme, width }) {
  if (!page.__qa.axeInjected) {
    await page.addScriptTag({ content: axe.source });
    page.__qa.axeInjected = true;
  }

  const violations = await page.evaluate(async (tags) => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: tags },
    });

    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      targets: violation.nodes
        .slice(0, 4)
        .map((node) => node.target.join(" ")),
    }));
  }, AXE_TAGS);

  report.axe.push({
    state,
    viewport: `${width}`,
    theme,
    violations,
  });

  const detail = violations.length
    ? violations
        .map(
          (violation) =>
            `${violation.impact ?? "?"} ${violation.id} (${violation.nodes})`,
        )
        .join(" | ")
    : "0 violaciones";

  recordCheck(
    report,
    `axe ${state} ${width} ${theme}`,
    violations.length ? "fail" : "pass",
    detail,
  );

  return violations;
}

export async function recordOverflow(page, report, { state, theme, width }) {
  const measurement = await measureOverflow(page);
  report.overflow.push({
    state,
    viewport: `${width}`,
    theme,
    ...measurement,
  });

  recordCheck(
    report,
    `overflow ${state} ${width} ${theme}`,
    measurement.overflow ? "fail" : "pass",
    measurement.overflow
      ? `${measurement.scrollWidth}/${measurement.clientWidth} px · ${measurement.offenders.join(", ")}`
      : `${measurement.scrollWidth}/${measurement.clientWidth} px`,
  );

  return measurement;
}

export function analyzeBundle(distDir) {
  const astroDir = path.join(distDir, "_astro");
  const chunkFiles = walk(astroDir).filter((file) => file.endsWith(".js"));

  const chunks = chunkFiles
    .map((file) => {
      const absolute = path.join(astroDir, file);
      const raw = statSync(absolute).size;
      const gzip = gzipSync(readFileSync(absolute)).length;
      return {
        file: `_astro/${file.split(path.sep).join("/")}`,
        rawKb: raw / 1024,
        gzipKb: gzip / 1024,
      };
    })
    .sort((a, b) => b.gzipKb - a.gzipKb);

  const largestChunk = chunks[0] ?? {
    file: "sin chunks",
    rawKb: 0,
    gzipKb: 0,
  };

  const gameScripts = scriptsFor(path.join(distDir, "juego/index.html"));
  const gameChunks = resolveScripts(gameScripts, chunks);
  const gameInitialJsKb = sumKb(gameChunks);
  const totalJsKb = sumKb(chunks);

  const nonGamePages = [
    "index.html",
    "productos/index.html",
    "nosotros/index.html",
    "contacto/index.html",
    "404.html",
  ];
  const nonGameScripts = new Set();
  for (const page of nonGamePages) {
    for (const script of scriptsFor(path.join(distDir, page))) {
      nonGameScripts.add(script);
    }
  }
  const nonGameChunks = resolveScripts([...nonGameScripts], chunks);
  const nonGameJsKb = sumKb(nonGameChunks);
  const largestChunkLeak = nonGameChunks.some(
    (chunk) => chunk.file === largestChunk.file,
  );

  const warnings = [];
  if (largestChunk.gzipKb > CHUNK_BUDGET_KB) {
    warnings.push(
      `chunk ${largestChunk.file} (${largestChunk.gzipKb.toFixed(1)} KB) supera ${CHUNK_BUDGET_KB} KB`,
    );
  }
  if (totalJsKb > TOTAL_JS_BUDGET_KB) {
    warnings.push(
      `JS total (${totalJsKb.toFixed(1)} KB) supera ${TOTAL_JS_BUDGET_KB} KB`,
    );
  }

  return {
    largestChunk,
    gameInitialJsKb,
    totalJsKb,
    nonGameJsKb,
    largestChunkLeak,
    topChunks: chunks.slice(0, 8),
    warnings,
    budgetKb: CHUNK_BUDGET_KB,
    totalBudgetKb: TOTAL_JS_BUDGET_KB,
  };
}

export async function sampleFps(page, durationMs = 2200) {
  return page.evaluate(async (duration) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const frames = [];
    let last = performance.now();
    const start = last;

    await new Promise((resolve) => {
      const tick = (now) => {
        frames.push(now - last);
        last = now;
        if (now - start < duration) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

    for (let index = 0; index < 5 && frames.length > 0; index += 1) {
      frames.shift();
    }
    const sorted = [...frames].sort((a, b) => a - b);
    const total = frames.reduce((sum, value) => sum + value, 0);
    const average = frames.length > 0 ? total / frames.length : 0;

    return {
      frames: frames.length,
      avgFps: average > 0 ? 1000 / average : 0,
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      durationMs: performance.now() - start,
    };
  }, durationMs);
}

export function recordFps(report, label, sample, { width, theme }) {
  report.fps.push({ label, width, theme, ...sample });

  const status = sample.avgFps >= 30 ? "pass" : "warn";
  recordCheck(
    report,
    `fps ${label}`,
    status,
    `${sample.avgFps.toFixed(1)} fps · p95 ${sample.p95FrameMs.toFixed(1)} ms · ${sample.frames} frames`,
  );
}

function walk(directory) {
  let results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(absolute));
    else results.push(path.relative(directory, absolute));
  }
  return results;
}

function scriptsFor(htmlPath) {
  let html;
  try {
    html = readFileSync(htmlPath, "utf8");
  } catch {
    return [];
  }

  const scripts = [];
  const pattern = /["']([^"']+\.js)(?:\?[^"']*)?["']/g;
  for (const match of html.matchAll(pattern)) {
    const url = match[1];
    if (/^https?:\/\//.test(url)) continue;
    if (!url.startsWith("/")) continue;
    scripts.push(url);
  }
  return [...new Set(scripts)];
}

function resolveScripts(urls, chunks) {
  return urls
    .map((url) => {
      const normalized = url.replace(/^\/+/, "").replaceAll("\\", "/");
      return chunks.find(
        (chunk) => chunk.file === normalized || chunk.file.endsWith(`/${normalized}`),
      );
    })
    .filter(Boolean);
}

function sumKb(items) {
  return items.reduce((sum, item) => sum + item.gzipKb, 0);
}
