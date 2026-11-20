import {
  assert,
  assertIncludes,
  capture,
  click,
  clickSelector,
  createPage,
  exists,
  focusCanvas,
  gotoGame,
  isDisabled,
  stagePoint,
  text,
  wait,
  waitForStage,
} from "./browser.mjs";
import {
  recordFps,
  recordOverflow,
  sampleFps,
  scanAxe,
} from "./checks.mjs";
import {
  recordCheck,
  recordConsoleErrors,
} from "./report.mjs";

const TYPES = ["clasico", "capas", "figura", "gel"];

async function startSandbox(page) {
  await click(page, "start-sandbox");
  await page.waitForSelector('[data-testid="design-panel"]', { timeout: 15000 });
  await waitForStage(page, "design");
}

async function designFor(page, index) {
  if (index === 0) {
    await clickSelector(
      page,
      '[aria-label="Color de la capa 1"] [aria-label="Crema"]',
    );
    await click(page, "scent-lavanda");
    await click(page, "wick-type-algodon");
    await click(page, "label-clasica");
  } else if (index === 1) {
    await click(page, "vessel-claro");
    await clickSelector(
      page,
      '[aria-label="Color de la capa 1"] [aria-label="Terracota"]',
    );
    await clickSelector(
      page,
      '[aria-label="Color de la capa 2"] [aria-label="Ámbar"]',
    );
    await clickSelector(
      page,
      '[aria-label="Color de la capa 3"] [aria-label="Crema"]',
    );
    await click(page, "scent-vainilla");
    await click(page, "wick-type-algodon");
    await click(page, "label-regalo");
  } else if (index === 2) {
    await click(page, "mold-luna");
    await clickSelector(
      page,
      '[aria-label="Color de Luna"] [aria-label="Ámbar"]',
    );
    await clickSelector(
      page,
      '[aria-label="Color de Estrella"] [aria-label="Crema"]',
    );
    await click(page, "scent-cafe");
    await click(page, "wick-type-madera");
    await click(page, "label-minimal");
  } else {
    await click(page, "inclusion-flores");
    await click(page, "inclusion-brillo");
    await click(page, "scent-rosas");
    await click(page, "wick-type-algodon");
    await click(page, "label-minimal");
  }

  await page.waitForSelector('[data-testid="design-ready"]', {
    timeout: 15000,
  });
}

async function clickEnabled(page, testid, timeout = 20000) {
  await page.waitForFunction(
    (id) => {
      const element = document.querySelector(`[data-testid="${id}"]`);
      return Boolean(element) && !element.disabled;
    },
    { timeout },
    testid,
  );
  await click(page, testid);
}

async function waitForTemperature(page, minimum, timeout = 30000) {
  await page.waitForFunction(
    (value) => {
      const content =
        document.querySelector('[data-testid="temperature"]')?.textContent ??
        "";
      const match = content.match(/(\d+)/);
      return match ? Number(match[1]) >= value : false;
    },
    { timeout },
    minimum,
  );
}

async function waitForFill(page, minimum, timeout = 25000) {
  await page.waitForFunction(
    (value) => {
      const content =
        document.querySelector('[data-testid="fill"]')?.textContent ?? "";
      const match = content.match(/(\d+)%/);
      return match ? Number(match[1]) >= value : false;
    },
    { timeout },
    minimum,
  );
}

async function waitForStirs(page) {
  await page.waitForFunction(
    () =>
      /Removidos:\s*3\/3/.test(
        document.querySelector('[data-testid="melt-panel"]')?.innerText ?? "",
      ),
    { timeout: 20000 },
  );
}

async function auditState(page, report, state) {
  const theme = page.__qa.theme;
  const width = page.__qa.width;
  await scanAxe(page, report, { state, theme, width });
  await recordOverflow(page, report, { state, theme, width });
}

async function designClassic(page) {
  await designFor(page, 0);
}

async function heatWithKeyboard(page) {
  await focusCanvas(page, "melt");
  await page.keyboard.down(" ");
  try {
    await waitForTemperature(page, 66);
  } finally {
    await page.keyboard.up(" ");
  }

  for (let step = 0; step < 32; step += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await waitForStirs(page);
}

async function heatWithPointer(page) {
  const lever = await stagePoint(page, "melt", 745, 500);
  await page.mouse.move(lever.x, lever.y);
  await page.mouse.down();
  try {
    await waitForTemperature(page, 66);
  } finally {
    await page.mouse.up();
  }

  const pot = await stagePoint(page, "melt", 400, 360);
  await page.mouse.move(pot.x + 110, pot.y);
  await page.mouse.down();
  try {
    for (let circle = 0; circle < 3; circle += 1) {
      for (let step = 1; step <= 18; step += 1) {
        const angle = (step / 18) * Math.PI * 2;
        await page.mouse.move(
          pot.x + Math.cos(angle) * 110,
          pot.y + Math.sin(angle) * 110 * 0.45,
        );
        await wait(12);
      }
    }
  } finally {
    await page.mouse.up();
  }

  await waitForStirs(page);
}

async function pourWithKeyboard(page) {
  for (let unit = 0; unit < 4; unit += 1) {
    if (await exists(page, "pour-complete")) return;

    const panel = await text(page, "pour-panel");
    if (panel.includes("Cuajando")) {
      await page.waitForFunction(
        () =>
          !(
            document.querySelector('[data-testid="pour-panel"]')?.innerText ??
            ""
          ).includes("Cuajando"),
        { timeout: 45000 },
      );
    }
    if (await exists(page, "pour-complete")) return;

    await focusCanvas(page, "pour");
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press(" ");
    await waitForFill(page, 84);
    await page.keyboard.press(" ");
    await page.waitForFunction(
      () => {
        const content =
          document.querySelector('[data-testid="pour-panel"]')?.innerText ??
          "";
        return (
          content.includes("Cuajando") ||
          content.includes("Vertido completo") ||
          !content.includes("Vertido manual")
        );
      },
      { timeout: 15000 },
    );
  }
}

async function pourWithPointer(page) {
  const start = await stagePoint(page, "pour", 637, 150);
  const end = await stagePoint(page, "pour", 500, 150);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 18 });
    await waitForFill(page, 84);
  } finally {
    await page.mouse.up();
  }

  await page.waitForSelector('[data-testid="pour-complete"]', {
    timeout: 15000,
  });
}

async function placeWickWithKeyboard(page) {
  await focusCanvas(page, "wick");
  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press("ArrowLeft");
  }
  for (let step = 0; step < 3; step += 1) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Enter");
  await wait(300);
}

async function placeWickWithPointer(page) {
  const start = await stagePoint(page, "wick", 574.7, 284);
  const end = await stagePoint(page, "wick", 500, 340);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 14 });
  } finally {
    await page.mouse.up();
  }
  await wait(400);
}

async function coolWithKeyboard(page, typeIndex) {
  await focusCanvas(page, "cool");
  if (typeIndex === 3) {
    for (let bubble = 0; bubble < 5; bubble += 1) {
      await page.keyboard.press("b");
      await wait(120);
    }
  }

  for (let fan = 0; fan < 9; fan += 1) {
    await page.keyboard.press(" ");
    await wait(120);
  }
}

async function coolWithPointer(page) {
  const fan = await stagePoint(page, "cool", 760, 390);
  for (let tap = 0; tap < 9; tap += 1) {
    await page.mouse.click(fan.x, fan.y);
    await wait(160);
  }
}

async function finishWithKeyboard(page) {
  await page.evaluate(() =>
    document.querySelector('[data-testid="stage-canvas-finish"]')?.focus(),
  );

  await page.keyboard.press("1");
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("ArrowLeft");
  }
  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.down("Shift");
  for (let step = 0; step < 9; step += 1) {
    await page.keyboard.press("ArrowLeft");
  }
  await page.keyboard.up("Shift");
  await page.keyboard.press("Enter");
  await wait(300);

  await page.keyboard.press("2");
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("ArrowUp");
  }
  await page.keyboard.press("Enter");
  await wait(300);

  await page.keyboard.press("3");
  await page.keyboard.press("4");
  await wait(500);
}

async function assertRecipe(page, label) {
  const scoreText = await text(page, "score-panel");
  assertIncludes(scoreText, "Receta e insumos", `${label}: falta la receta`);
  assertIncludes(
    scoreText,
    "Pedir insumos por WhatsApp",
    `${label}: falta el CTA de WhatsApp`,
  );
  assert(await exists(page, "shopping-list"), `${label}: falta la lista`);

  if (scoreText.includes("/100")) {
    const href = await page.$eval(
      '[data-testid="order-supplies"]',
      (element) => element.getAttribute("href") ?? "",
    );
    assert(
      href.startsWith("https://wa.me/"),
      `${label}: el CTA no apunta a WhatsApp (${href})`,
    );
  }

  return scoreText;
}

async function playKeyboardStations(page, typeIndex, hooks = {}) {
  await waitForStage(page, "melt");
  await heatWithKeyboard(page);
  await hooks.onMelt?.();
  await clickEnabled(page, "melt-continue");

  await waitForStage(page, "pour");
  await pourWithKeyboard(page);
  await page.waitForSelector('[data-testid="pour-complete"]', {
    timeout: 15000,
  });
  await clickEnabled(page, "pour-continue");

  await waitForStage(page, "wick");
  await placeWickWithKeyboard(page);
  await clickEnabled(page, "wick-continue");

  await waitForStage(page, "cool");
  await coolWithKeyboard(page, typeIndex);
  await clickEnabled(page, "cool-continue");

  await waitForStage(page, "finish");
  await finishWithKeyboard(page);
  assert(
    !(await isDisabled(page, "serve")),
    "El botón de servir sigue deshabilitado.",
  );
  await click(page, "serve");
  await page.waitForSelector('[data-testid="score-panel"]', { timeout: 15000 });
  await wait(400);

  const scoreText = await assertRecipe(page, "score");
  assert(/\d+\/100/.test(scoreText), "El score no muestra puntaje.");
  await hooks.onScore?.(scoreText);
  return scoreText;
}

export async function flowPointerClassic({ browser, baseUrl, outDir, report }) {
  const page = await createPage(browser, {
    width: 1280,
    height: 1000,
    theme: "light",
  });

  try {
    await gotoGame(page, baseUrl);
    await capture(page, outDir, "1280-light-intro", report);
    await auditState(page, report, "intro");

    await click(page, "start-game");
    await click(page, "reveal-all");
    await capture(page, outDir, "1280-light-brief", report);
    await auditState(page, report, "brief");

    await click(page, "create-note");
    await page.waitForSelector('[data-testid="design-panel"]');
    await waitForStage(page, "design");

    await designClassic(page);
    await capture(page, outDir, "1280-light-clasico-design", report);
    await auditState(page, report, "design");
    await click(page, "design-continue");

    await waitForStage(page, "melt");
    const fps = await sampleFps(page, 2200);
    recordFps(report, "melt 1280 claro", fps, {
      width: 1280,
      theme: "light",
    });
    await capture(page, outDir, "1280-light-clasico-melt", report);
    await auditState(page, report, "melt");
    await heatWithPointer(page);
    await capture(page, outDir, "1280-light-clasico-melt-ready", report);
    await clickEnabled(page, "melt-continue");

    await waitForStage(page, "pour");
    await capture(page, outDir, "1280-light-clasico-pour", report);
    await pourWithPointer(page);
    await capture(page, outDir, "1280-light-clasico-pour-filled", report);
    await clickEnabled(page, "pour-continue");

    await waitForStage(page, "wick");
    await capture(page, outDir, "1280-light-clasico-wick", report);
    await placeWickWithPointer(page);
    const wickQuality = await text(page, "wick-quality");
    assertIncludes(wickQuality, "Colocada", "La mecha no quedó colocada");
    await capture(page, outDir, "1280-light-clasico-wick-placed", report);
    await clickEnabled(page, "wick-continue");

    await waitForStage(page, "cool");
    await capture(page, outDir, "1280-light-clasico-cool", report);
    await coolWithPointer(page);
    await capture(page, outDir, "1280-light-clasico-cooled", report);
    await clickEnabled(page, "cool-continue");

    await waitForStage(page, "finish");
    await capture(page, outDir, "1280-light-clasico-finish", report);
    await finishWithKeyboard(page);
    assert(
      !(await isDisabled(page, "serve")),
      "No se puede servir la vela clásica.",
    );
    await capture(page, outDir, "1280-light-clasico-finish-ready", report);
    await click(page, "serve");
    await page.waitForSelector('[data-testid="score-panel"]');
    await wait(400);

    const scoreText = await assertRecipe(page, "clásica");
    assert(/\d+\/100/.test(scoreText), "El score clásico no muestra puntaje.");
    await capture(page, outDir, "1280-light-clasico-score", report);
    await auditState(page, report, "score");
  } finally {
    recordConsoleErrors(report, "pointer-classic", page.__qa.errors);
    await page.close();
  }
}

export async function flowKeyboardFourOrders({
  browser,
  baseUrl,
  outDir,
  report,
}) {
  const page = await createPage(browser, {
    width: 1280,
    height: 1000,
    theme: "light",
  });

  try {
    await gotoGame(page, baseUrl);
    await click(page, "start-game");

    for (let index = 0; index < TYPES.length; index += 1) {
      await click(page, "reveal-all");
      await wait(120);
      await click(page, "create-note");
      await page.waitForSelector('[data-testid="design-panel"]');
      await waitForStage(page, "design");
      await designFor(page, index);

      if (index > 0) {
        await capture(
          page,
          outDir,
          `1280-light-${TYPES[index]}-design`,
          report,
        );
        await auditState(page, report, `design ${TYPES[index]}`);
      }
      await click(page, "design-continue");

      await playKeyboardStations(page, index, {
        onScore: async () => {
          if (index > 0) {
            await capture(
              page,
              outDir,
              `1280-light-${TYPES[index]}-score`,
              report,
            );
            await auditState(page, report, `score ${TYPES[index]}`);
          }
        },
      });

      await click(page, "next-customer");
      if (index < TYPES.length - 1) {
        await page.waitForSelector('[data-testid="brief-ticket"]', {
          timeout: 15000,
        });
      }
    }

    await page.waitForSelector('[data-testid="day-end-panel"]', {
      timeout: 15000,
    });
    await capture(page, outDir, "1280-light-day-end", report);
    const dayEnd = await text(page, "day-end-panel");
    assertIncludes(
      dayEnd,
      "El taller cerró por hoy",
      "No se alcanzó el cierre del día",
    );
    assertIncludes(
      dayEnd,
      "Atendiste 4 pedidos",
      "El cierre del día no registró los 4 pedidos",
    );
  } finally {
    recordConsoleErrors(report, "keyboard-four-orders", page.__qa.errors);
    await page.close();
  }
}

export async function flowSandbox({ browser, baseUrl, outDir, report }) {
  const page = await createPage(browser, {
    width: 1280,
    height: 1000,
    theme: "light",
  });

  try {
    await gotoGame(page, baseUrl);
    await startSandbox(page);

    await click(page, "type-gel");
    await click(page, "inclusion-flores");
    await click(page, "inclusion-brillo");
    await click(page, "inclusion-hierbas");
    await click(page, "scent-rosas");
    await click(page, "wick-type-algodon");
    await click(page, "label-minimal");
    await page.waitForSelector('[data-testid="design-ready"]');
    await capture(page, outDir, "1280-light-sandbox-gel-design", report);
    await auditState(page, report, "sandbox design");

    await click(page, "sandbox-recipe");
    await page.waitForSelector('[data-testid="score-panel"]');
    await capture(page, outDir, "1280-light-sandbox-gel-recipe", report);
    await assertRecipe(page, "sandbox gel");
    await auditState(page, report, "sandbox recipe");

    await click(page, "back-to-design");
    await page.waitForSelector('[data-testid="design-panel"]');
    await click(page, "type-figura");
    await click(page, "mold-flor");
    await clickSelector(
      page,
      '[aria-label="Color de Pétalos"] [aria-label="Rosa"]',
    );
    await clickSelector(
      page,
      '[aria-label="Color de Centro"] [aria-label="Ámbar"]',
    );
    await clickSelector(
      page,
      '[aria-label="Color de Hoja"] [aria-label="Salvia"]',
    );
    await click(page, "scent-citricos");
    await click(page, "wick-type-doble");
    await click(page, "label-regalo");
    await page.waitForSelector('[data-testid="design-ready"]');
    await capture(page, outDir, "1280-light-sandbox-figure-design", report);

    await click(page, "sandbox-craft");
    await waitForStage(page, "melt");
    await capture(page, outDir, "1280-light-sandbox-melt", report);
  } finally {
    recordConsoleErrors(report, "sandbox", page.__qa.errors);
    await page.close();
  }
}

export async function flowFallback({ browser, baseUrl, outDir, report }) {
  const page = await createPage(browser, {
    width: 1280,
    height: 1000,
    theme: "light",
    blockWebgl: true,
  });

  try {
    await gotoGame(page, baseUrl);
    await click(page, "start-game");
    await click(page, "reveal-all");
    await click(page, "create-note");
    await page.waitForSelector('[data-testid="design-panel"]');
    await designClassic(page);
    await page.waitForSelector('[data-testid="stage-fallback"]', {
      timeout: 20000,
    });

    const fallbackText = await text(page, "stage-fallback");
    assertIncludes(
      fallbackText.toUpperCase(),
      "SIN WEBGL",
      "No apareció el fallback",
    );
    await capture(page, outDir, "1280-light-fallback-design", report);
    await auditState(page, report, "fallback design");

    await click(page, "fallback-recipe");
    await page.waitForSelector('[data-testid="score-panel"]');
    await capture(page, outDir, "1280-light-fallback-recipe", report);
    await assertRecipe(page, "fallback");
    await auditState(page, report, "fallback recipe");
  } finally {
    recordConsoleErrors(report, "fallback", page.__qa.errors);
    await page.close();
  }
}

export async function flowMobile({ browser, baseUrl, outDir, report }) {
  const page = await createPage(browser, {
    width: 390,
    height: 844,
    theme: "light",
  });

  try {
    await gotoGame(page, baseUrl);
    await capture(page, outDir, "390-light-intro", report);
    await auditState(page, report, "intro");

    await click(page, "start-game");
    await click(page, "reveal-all");
    await capture(page, outDir, "390-light-brief", report);
    await auditState(page, report, "brief");

    await click(page, "create-note");
    await page.waitForSelector('[data-testid="design-panel"]');
    await waitForStage(page, "design");
    await designClassic(page);
    await capture(page, outDir, "390-light-clasico-design", report);
    await auditState(page, report, "design");
    await click(page, "design-continue");

    await waitForStage(page, "melt");
    const fps = await sampleFps(page, 2200);
    recordFps(report, "melt 390 claro", fps, { width: 390, theme: "light" });
    await capture(page, outDir, "390-light-clasico-melt", report);
    await auditState(page, report, "melt");

    await playKeyboardStations(page, 0, {
      onScore: async () => {
        await capture(page, outDir, "390-light-clasico-score", report);
        await auditState(page, report, "score");
      },
    });
  } finally {
    recordConsoleErrors(report, "mobile-390", page.__qa.errors);
    await page.close();
  }
}

async function darkSandbox({ browser, baseUrl, outDir, report, width, label }) {
  const page = await createPage(browser, {
    width,
    height: width < 600 ? 844 : 1000,
    theme: "dark",
  });

  try {
    await gotoGame(page, baseUrl);
    await capture(page, outDir, `${label}-intro`, report);
    await auditState(page, report, "intro");

    await startSandbox(page);
    await designClassic(page);
    await capture(page, outDir, `${label}-clasico-design`, report);
    await auditState(page, report, "design");

    await click(page, "sandbox-recipe");
    await page.waitForSelector('[data-testid="score-panel"]');
    await capture(page, outDir, `${label}-clasico-recipe`, report);
    await assertRecipe(page, `${label} sandbox`);
    await auditState(page, report, "recipe");
  } finally {
    recordConsoleErrors(report, `dark-${label}`, page.__qa.errors);
    await page.close();
  }
}

export async function flowDark({ browser, baseUrl, outDir, report }) {
  await darkSandbox({
    browser,
    baseUrl,
    outDir,
    report,
    width: 1280,
    label: "1280-dark",
  });
  await darkSandbox({
    browser,
    baseUrl,
    outDir,
    report,
    width: 390,
    label: "390-dark",
  });
}

export async function flowOverflowMatrix({
  browser,
  baseUrl,
  report,
}) {
  const widths = [360, 390, 768, 1280];
  const errors = [];

  for (const width of widths) {
    const page = await createPage(browser, {
      width,
      height: width < 600 ? 844 : 1000,
      theme: "light",
    });

    try {
      await gotoGame(page, baseUrl);
      await recordOverflow(page, report, {
        state: "intro",
        theme: "light",
        width,
      });
      await click(page, "start-game");
      await click(page, "reveal-all");
      await click(page, "create-note");
      await page.waitForSelector('[data-testid="design-panel"]');
      await recordOverflow(page, report, {
        state: "design",
        theme: "light",
        width,
      });
    } finally {
      errors.push(...page.__qa.errors);
      await page.close();
    }
  }

  recordConsoleErrors(report, "overflow-matrix", errors);
}

export async function flowMotionOverrides({ browser, baseUrl, report }) {
  const cases = [
    {
      name: "override off",
      query: "?motion=off",
      reducedMotion: false,
      expected: "reduced",
    },
    {
      name: "override full con OS reduce",
      query: "?motion=full",
      reducedMotion: true,
      expected: "full",
    },
    {
      name: "OS reduce sin override",
      query: "",
      reducedMotion: true,
      expected: "reduced",
    },
  ];

  for (const testCase of cases) {
    const page = await createPage(browser, {
      width: 1280,
      height: 1000,
      theme: "light",
      reducedMotion: testCase.reducedMotion,
    });

    try {
      await gotoGame(page, baseUrl, { query: testCase.query });
      await click(page, "start-game");
      const actual = await page.$eval(
        '[data-testid="game2d"]',
        (element) => element.dataset.motion,
      );
      recordCheck(
        report,
        `motion ${testCase.name}`,
        actual === testCase.expected ? "pass" : "fail",
        `esperado ${testCase.expected}, recibido ${actual}`,
      );
    } finally {
      recordConsoleErrors(
        report,
        `motion ${testCase.name}`,
        page.__qa.errors,
      );
      await page.close();
    }
  }
}

export function recordBundle(report, bundle) {
  report.bundle = bundle;

  recordCheck(
    report,
    "bundle",
    bundle.largestChunkLeak ? "fail" : "pass",
    `chunk grande ${bundle.largestChunk.gzipKb.toFixed(1)} KB gzip · inicial ${bundle.gameInitialJsKb.toFixed(1)} KB · total ${bundle.totalJsKb.toFixed(1)} KB · fuera ${bundle.nonGameJsKb.toFixed(1)} KB`,
  );

  if (bundle.largestChunkLeak) {
    recordCheck(
      report,
      "bundle fuga",
      "fail",
      "Una página fuera de /juego carga el chunk más grande.",
    );
  }

  for (const warning of bundle.warnings) {
    recordCheck(report, "bundle presupuesto", "warn", warning);
  }
}
