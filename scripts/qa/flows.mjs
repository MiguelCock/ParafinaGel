import {
  assert,
  assertIncludes,
  capture,
  click,
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
import { recordFps, recordOverflow, sampleFps, scanAxe } from "./checks.mjs";
import { recordCheck, recordConsoleErrors } from "./report.mjs";

const TYPES = ["clasico", "capas", "figura", "gel"];

async function startSandbox(page) {
  await click(page, "start-sandbox");
  await page.waitForSelector('[data-testid="design-panel"]', {
    timeout: 15000,
  });
  await waitForStage(page, "design");
}

async function pickMaterial(page, category, id) {
  await click(page, `material-tab-${category}`);
  await click(page, `material-${category}-${id}`);
}

async function pickLayerColor(page, layer, color) {
  await click(page, "material-tab-color");
  if (layer > 0 || (await page.$(`[data-testid="material-layer-${layer}"]`))) {
    await click(page, `material-layer-${layer}`, { optional: true });
  }
  await click(page, `material-color-${color}`);
}

async function pickFigureColor(page, part, color) {
  await click(page, "material-tab-color");
  await click(page, `material-part-${part}`);
  await click(page, `material-color-${color}`);
}

async function designFor(page, index) {
  if (index === 0) {
    await pickMaterial(page, "wax", "vaso");
    await pickMaterial(page, "vessel", "ambar");
    await pickLayerColor(page, 0, "crema");
    await pickMaterial(page, "scent", "lavanda");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "clasica");
  } else if (index === 1) {
    await pickMaterial(page, "wax", "soya-apf");
    await pickMaterial(page, "vessel", "claro");
    await pickLayerColor(page, 0, "terracota");
    await pickLayerColor(page, 1, "ambar");
    await pickLayerColor(page, 2, "crema");
    await pickMaterial(page, "scent", "vainilla");
    await pickMaterial(page, "scent", "cafe");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "regalo");
  } else if (index === 2) {
    await pickMaterial(page, "wax", "molde");
    await pickMaterial(page, "mold", "luna");
    await pickFigureColor(page, "luna", "ambar");
    await pickFigureColor(page, "estrella", "crema");
    await pickMaterial(page, "scent", "cafe");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "minimal");
  } else {
    await pickMaterial(page, "wax", "gel");
    await pickMaterial(page, "vessel", "cristal");
    await pickMaterial(page, "inclusion", "flores");
    await pickMaterial(page, "inclusion", "brillo");
    await pickMaterial(page, "scent", "rosas");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "minimal");
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

async function waitForMeltRange(page, timeout = 60000) {
  await page.waitForFunction(
    () => {
      const panel = document.querySelector('[data-testid="melt-panel"]');
      const content = panel?.textContent ?? "";
      return (
        content.includes("En rango") || content.includes("Lista para seguir")
      );
    },
    { timeout },
  );
}

async function waitForFill(page, minimum, timeout = 45000) {
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

const MIX_LAYOUTS = {
  1: [{ x: 500, y: 330 }],
  2: [
    { x: 360, y: 330 },
    { x: 640, y: 330 },
  ],
  3: [
    { x: 280, y: 330 },
    { x: 500, y: 330 },
    { x: 720, y: 330 },
  ],
  4: [
    { x: 238, y: 330 },
    { x: 413, y: 330 },
    { x: 588, y: 330 },
    { x: 762, y: 330 },
  ],
};

const MIX_KNOB = { x: 48, y: 84, drag: 90 };
const MIX_COLOR_BOTTLE = { x: -76, y: -8 };
const MIX_AROMA_BOTTLE = { x: 76, y: -8 };

async function mixBurnerCount(page) {
  return page.$$eval(
    '[data-testid^="mix-burner-"]',
    (elements) => elements.length,
  );
}

async function waitForMixRange(page, index) {
  await page.waitForFunction(
    (burner) => {
      const tab = document.querySelector(
        `[data-testid="mix-burner-${burner}"]`,
      );
      if (!tab || tab.getAttribute("aria-pressed") !== "true") return false;
      const panel = document.querySelector('[data-testid="mix-panel"]');
      return Boolean(panel) && !panel.innerText.includes("Calienta el fogón");
    },
    // SwiftShader can run the mix ticks much slower than a real GPU.
    { timeout: 30000 },
    index,
  );
}

async function readMixDose(page, testid) {
  return page.$eval(`[data-testid="${testid}"]`, (element) => ({
    current: Number(element.dataset.current ?? 0),
    target: Number(element.dataset.target ?? 0),
    min: Number(element.dataset.min ?? 0),
    max: Number(element.dataset.max ?? 0),
  }));
}

async function waitForMixStirs(page) {
  await page.waitForFunction(
    () =>
      /Revueltos:\s*3\/3/.test(
        document.querySelector('[data-testid="mix-panel"]')?.innerText ?? "",
      ),
    { timeout: 30000 },
  );
}

async function waitForAroma(page, minimum) {
  await page.waitForFunction(
    (value) => {
      const row = document.querySelector('[data-testid="mix-aroma"]');
      return Number(row?.dataset.current ?? 0) >= value;
    },
    { timeout: 30000 },
    minimum,
  );
}

async function mixWithKeyboard(page) {
  const count = await mixBurnerCount(page);

  for (let index = 0; index < count; index += 1) {
    await click(page, `mix-burner-${index}`);
    await focusCanvas(page, "mix");
    for (let step = 0; step < 10; step += 1) {
      await page.keyboard.press("=");
    }
    await waitForMixRange(page, index);

    const color = await readMixDose(page, "mix-color");
    for (let drop = 0; drop < color.target; drop += 1) {
      await page.keyboard.press("c");
    }

    const aroma = await readMixDose(page, "mix-aroma");
    if (process.env.QA_VERBOSE === "1") {
      console.log(
        `mix keyboard burner ${index}/${count} · color ${color.target} · aroma ${aroma.min}-${aroma.max}`,
      );
    }
    await page.keyboard.down("a");
    if (process.env.QA_VERBOSE === "1") {
      await wait(200);
      console.log(
        "  after A:",
        await text(page, "mix-temperature"),
        await text(page, "mix-aroma"),
      );
      console.log("  logs:", page.__qa.logs.slice(-10));
    }
    await waitForAroma(page, aroma.min);
    await page.keyboard.up("a");

    for (let step = 0; step < 32; step += 1) {
      await page.keyboard.press("ArrowRight");
    }
    await waitForMixStirs(page);
  }
}

async function heatMixWithPointer(page, index, position) {
  const knob = await stagePoint(
    page,
    "mix",
    position.x + MIX_KNOB.x,
    position.y + MIX_KNOB.y,
  );
  const full = await stagePoint(
    page,
    "mix",
    position.x + MIX_KNOB.x,
    position.y + MIX_KNOB.y - MIX_KNOB.drag,
  );
  await page.mouse.move(knob.x, knob.y);
  await page.mouse.down();
  try {
    await page.mouse.move(full.x, full.y, { steps: 12 });
    await waitForMixRange(page, index);
    // Releasing the knob must keep the level: wait until the reading is
    // comfortably inside the range before letting go.
    await wait(500);
  } finally {
    await page.mouse.up();
  }
}

async function mixWithPointer(page) {
  const count = await mixBurnerCount(page);
  const layout = MIX_LAYOUTS[count] ?? MIX_LAYOUTS[1];
  const origin = await stagePoint(page, "mix", 0, 0);
  const unitPoint = await stagePoint(page, "mix", 100, 100);
  const stageScale = (unitPoint.x - origin.x) / 100;
  const toScreen = (x, y) => ({
    x: origin.x + x * stageScale,
    y: origin.y + y * stageScale,
  });

  for (let index = 0; index < count; index += 1) {
    const position = layout[index];
    if (!position) continue;

    await click(page, `mix-burner-${index}`);
    await heatMixWithPointer(page, index, position);

    const color = await readMixDose(page, "mix-color");
    const colorBottle = await stagePoint(
      page,
      "mix",
      position.x + MIX_COLOR_BOTTLE.x,
      position.y + MIX_COLOR_BOTTLE.y,
    );
    for (let drop = 0; drop < color.target; drop += 1) {
      await page.mouse.click(colorBottle.x, colorBottle.y);
    }

    const aroma = await readMixDose(page, "mix-aroma");
    const aromaBottle = await stagePoint(
      page,
      "mix",
      position.x + MIX_AROMA_BOTTLE.x,
      position.y + MIX_AROMA_BOTTLE.y,
    );
    await page.mouse.move(aromaBottle.x, aromaBottle.y);
    await page.mouse.down();
    try {
      await waitForAroma(page, aroma.min);
    } finally {
      await page.mouse.up();
    }

    const potCenterY = position.y - 24;
    const pot = toScreen(position.x + 42, potCenterY);
    await page.mouse.move(pot.x, pot.y);
    await page.mouse.down();
    try {
      for (let circle = 0; circle < 3; circle += 1) {
        for (let step = 1; step <= 18; step += 1) {
          const angle = (step / 18) * Math.PI * 2;
          const point = toScreen(
            position.x + Math.cos(angle) * 42,
            potCenterY + Math.sin(angle) * 24,
          );
          await page.mouse.move(point.x, point.y);
          await wait(12);
        }
      }
    } finally {
      await page.mouse.up();
    }
    await waitForMixStirs(page);
  }
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

async function prepareBlockWithKeyboard(page) {
  const panel = await text(page, "melt-panel");
  if (!panel.includes("Corta el bloque")) return;

  await focusCanvas(page, "melt");
  for (let cut = 0; cut < 4; cut += 1) {
    await page.keyboard.press("c");
  }
  await page.keyboard.press("e");
  await waitForBlockReady(page);
}

async function waitForBlockReady(page) {
  await page.waitForFunction(
    () => {
      const content =
        document.querySelector('[data-testid="melt-panel"]')?.textContent ?? "";
      return (
        content.includes("4/4 cortes") && content.includes("Esteárico agregado")
      );
    },
    { timeout: 8000 },
  );
}

async function prepareBlockWithPointer(page) {
  const panel = await text(page, "melt-panel");
  if (!panel.includes("Corta el bloque")) return;

  const start = await stagePoint(page, "melt", 210, 270);
  const end = await stagePoint(page, "melt", 300, 270);
  for (let cut = 0; cut < 4; cut += 1) {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await page.mouse.up();
  }

  const jar = await stagePoint(page, "melt", 650, 344);
  await page.mouse.click(jar.x, jar.y);
  await waitForBlockReady(page);
}

async function heatWithKeyboard(page) {
  await prepareBlockWithKeyboard(page);
  await focusCanvas(page, "melt");
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press("=");
  }
  await waitForMeltRange(page);
  for (let step = 0; step < 10; step += 1) {
    await page.keyboard.press("-");
  }

  for (let step = 0; step < 32; step += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await waitForStirs(page);
}

async function heatWithPointer(page) {
  await prepareBlockWithPointer(page);
  const knob = await stagePoint(page, "melt", 742, 510);
  await page.mouse.move(knob.x, knob.y);
  await page.mouse.down();
  try {
    await page.mouse.move(knob.x, knob.y - 100, { steps: 10 });
    await waitForMeltRange(page);
    await page.mouse.move(knob.x, knob.y, { steps: 10 });
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
          document.querySelector('[data-testid="pour-panel"]')?.innerText ?? "";
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

async function pourWithPointer(page, hooks = {}) {
  const start = await stagePoint(page, "pour", 637, 150);
  const end = await stagePoint(page, "pour", 500, 150);
  const spill = await stagePoint(page, "pour", 700, 150);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 18 });
    await waitForFill(page, 20);
    await hooks.onPouring?.();
    await page.mouse.move(spill.x, spill.y, { steps: 8 });
    await wait(450);
    await hooks.onSpill?.();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await waitForFill(page, 84);
  } finally {
    await page.mouse.up();
  }

  await page.waitForSelector('[data-testid="pour-complete"]', {
    timeout: 15000,
  });
}

async function waitForWickCut(page) {
  await page.waitForFunction(
    () =>
      (
        document.querySelector('[data-testid="wick-quality"]')?.textContent ??
        ""
      ).includes("Cortada"),
    { timeout: 8000 },
  );
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

  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("ArrowUp");
  }
  await page.keyboard.press("Enter");
  await waitForWickCut(page);
}

async function placeWickWithPointer(page) {
  const start = await stagePoint(page, "wick", 483, 105);
  const end = await stagePoint(page, "wick", 468, 204);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 14 });
  } finally {
    await page.mouse.up();
  }
  await wait(400);
}

async function cutWickWithPointer(page) {
  const start = await stagePoint(page, "wick", 674, 120);
  const end = await stagePoint(page, "wick", 674, 147);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 10 });
  } finally {
    await page.mouse.up();
  }
  await waitForWickCut(page);
  await wait(300);
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

  await page.waitForFunction(
    () =>
      (
        document.querySelector('[data-testid="cool-panel"]')?.innerText ?? ""
      ).includes("Vela lista"),
    { timeout: 10000 },
  );
  await page.keyboard.press("h");
  await page.waitForFunction(
    () =>
      (
        document.querySelector('[data-testid="cool-holder"]')?.innerText ?? ""
      ).includes("retirado"),
    { timeout: 5000 },
  );
}

async function coolWithPointer(page) {
  const fan = await stagePoint(page, "cool", 760, 390);
  for (let tap = 0; tap < 9; tap += 1) {
    await page.mouse.click(fan.x, fan.y);
    await wait(160);
  }

  await page.waitForFunction(
    () =>
      (
        document.querySelector('[data-testid="cool-panel"]')?.innerText ?? ""
      ).includes("Vela lista"),
    { timeout: 10000 },
  );
  const holder = await stagePoint(page, "cool", 430, 200);
  await page.mouse.click(holder.x, holder.y);
  await page.waitForFunction(
    () =>
      (
        document.querySelector('[data-testid="cool-holder"]')?.innerText ?? ""
      ).includes("retirado"),
    { timeout: 5000 },
  );
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
  await page.keyboard.press("3");
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
  await waitForStage(page, "wick");
  await placeWickWithKeyboard(page);
  await clickEnabled(page, "wick-continue");

  await waitForStage(page, "melt");
  await heatWithKeyboard(page);
  await hooks.onMelt?.();
  await clickEnabled(page, "melt-continue");

  await waitForStage(page, "mix");
  await mixWithKeyboard(page);
  await hooks.onMix?.();
  await clickEnabled(page, "mix-continue");

  await waitForStage(page, "pour");
  await hooks.onPour?.();
  await pourWithKeyboard(page);
  await page.waitForSelector('[data-testid="pour-complete"]', {
    timeout: 15000,
  });
  await clickEnabled(page, "pour-continue");

  await waitForStage(page, "cool");
  await hooks.onCool?.();
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

    await waitForStage(page, "wick");
    await capture(page, outDir, "1280-light-clasico-wick", report);
    await placeWickWithPointer(page);
    const wickQuality = await text(page, "wick-quality");
    assertIncludes(wickQuality, "Colocada", "La mecha no quedó colocada");
    assert(
      await isDisabled(page, "wick-continue"),
      "Se puede pasar a la cera sin cortar la mecha.",
    );
    await capture(page, outDir, "1280-light-clasico-wick-placed", report);
    await cutWickWithPointer(page);
    const wickTrim = await text(page, "wick-trim");
    assertIncludes(wickTrim, "5", "El corte de mecha no quedó en 5 mm");
    await capture(page, outDir, "1280-light-clasico-wick-cut", report);
    await clickEnabled(page, "wick-continue");

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

    await waitForStage(page, "mix");
    await capture(page, outDir, "1280-light-clasico-mix", report);
    await mixWithPointer(page);
    await capture(page, outDir, "1280-light-clasico-mix-ready", report);
    await auditState(page, report, "mix");
    await clickEnabled(page, "mix-continue");

    await waitForStage(page, "pour");
    await capture(page, outDir, "1280-light-clasico-pour", report);
    await pourWithPointer(page, {
      onPouring: async () => {
        await capture(page, outDir, "1280-light-clasico-pour-stream", report);
      },
      onSpill: async () => {
        await capture(page, outDir, "1280-light-clasico-pour-spill", report);
      },
    });
    await capture(page, outDir, "1280-light-clasico-pour-filled", report);
    await clickEnabled(page, "pour-continue");

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
        onCool: async () => {
          if (index === 3) {
            await capture(page, outDir, "1280-light-gel-cool", report);
            await auditState(page, report, "gel cool");
          }
        },
        onMix: async () => {
          if (index === 1) {
            assert(
              await exists(page, "mix-scent"),
              "Capas: falta el selector de aroma por fogón.",
            );
            recordCheck(
              report,
              "aroma por fogón",
              "pass",
              "selector visible con dos aromas en el diseño",
            );
            await capture(page, outDir, "1280-light-capas-mix", report);
            await auditState(page, report, "mix capas");
          }
        },
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

    await click(page, "material-tab-wax");
    await capture(page, outDir, "1280-light-sandbox-wax-shelf", report);
    await click(page, "material-tab-vessel");
    await capture(page, outDir, "1280-light-sandbox-vessel-shelf", report);

    await click(page, "material-accessible-summary");
    await page.select('[data-testid="accessible-wax"]', "vaso");
    await page.select('[data-testid="accessible-vessel"]', "ambar");
    await page.select('[data-testid="accessible-wick"]', "pabilo-67");
    await page.click('[data-testid="accessible-scent-lavanda"]');
    await page.select('[data-testid="accessible-label"]', "clasica");
    await page.select('[data-testid="accessible-layer-color-0"]', "crema");
    await page.waitForSelector('[data-testid="design-ready"]');
    await wait(250);
    recordCheck(
      report,
      "selector accesible de materiales",
      "pass",
      "cera, envase, pabilo, aroma, etiqueta y color",
    );
    await scanAxe(page, report, {
      state: "selector accesible",
      theme: "light",
      width: 1280,
    });

    await click(page, "type-gel");
    await pickMaterial(page, "wax", "gel");
    await pickMaterial(page, "vessel", "cristal");
    await pickMaterial(page, "inclusion", "flores");
    await pickMaterial(page, "inclusion", "brillo");
    await pickMaterial(page, "inclusion", "hierbas");
    await pickMaterial(page, "scent", "rosas");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "minimal");
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
    await pickMaterial(page, "wax", "molde");
    await pickMaterial(page, "mold", "flor");
    await pickFigureColor(page, "petalos", "rosa");
    await pickFigureColor(page, "centro", "ambar");
    await pickFigureColor(page, "hoja", "salvia");
    await pickMaterial(page, "scent", "citricos");
    await pickMaterial(page, "wick", "pabilo-67");
    await pickMaterial(page, "label", "regalo");
    await page.waitForSelector('[data-testid="design-ready"]');
    await capture(page, outDir, "1280-light-sandbox-figure-design", report);

    await click(page, "sandbox-craft");
    await waitForStage(page, "wick");
    await placeWickWithKeyboard(page);
    await capture(page, outDir, "1280-light-sandbox-wick", report);
    await clickEnabled(page, "wick-continue");
    await waitForStage(page, "melt");
    await capture(page, outDir, "1280-light-sandbox-melt", report);
    await prepareBlockWithPointer(page);
    await capture(page, outDir, "1280-light-sandbox-melt-cut", report);
    await auditState(page, report, "sandbox melt cut");
    await heatWithPointer(page);
    await clickEnabled(page, "melt-continue");
    await waitForStage(page, "mix");
    await capture(page, outDir, "1280-light-sandbox-mix", report);
    await mixWithPointer(page);
    await capture(page, outDir, "1280-light-sandbox-mix-ready", report);
    await auditState(page, report, "sandbox mix");
  } finally {
    recordConsoleErrors(report, "sandbox", page.__qa.errors);
    await page.close();
  }
}

export async function flowMobileGel({ browser, baseUrl, outDir, report }) {
  const page = await createPage(browser, {
    width: 390,
    height: 844,
    theme: "light",
  });

  try {
    await gotoGame(page, baseUrl);
    await startSandbox(page);
    await click(page, "type-gel");
    await designFor(page, 3);
    await capture(page, outDir, "390-light-gel-design", report);
    await auditState(page, report, "gel design");
    await click(page, "sandbox-craft");
    await playKeyboardStations(page, 3, {
      onMix: async () => {
        await capture(page, outDir, "390-light-gel-mix", report);
        await auditState(page, report, "gel mix");
      },
      onPour: async () => {
        await capture(page, outDir, "390-light-gel-pour", report);
        await auditState(page, report, "gel pour");
      },
      onCool: async () => {
        await capture(page, outDir, "390-light-gel-cool", report);
        await auditState(page, report, "gel cool");
      },
      onScore: async () => {
        await capture(page, outDir, "390-light-gel-score", report);
        await auditState(page, report, "gel score");
      },
    });
  } finally {
    recordConsoleErrors(report, "mobile-gel-390", page.__qa.errors);
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

    await playKeyboardStations(page, 0, {
      onMelt: async () => {
        const fps = await sampleFps(page, 2200);
        recordFps(report, "melt 390 claro", fps, {
          width: 390,
          theme: "light",
        });
        await capture(page, outDir, "390-light-clasico-melt", report);
        await auditState(page, report, "melt");
      },
      onMix: async () => {
        await capture(page, outDir, "390-light-clasico-mix", report);
        await auditState(page, report, "mix");
      },
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

export async function flowOverflowMatrix({ browser, baseUrl, report }) {
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

  const page = await createPage(browser, {
    width: 1280,
    height: 1000,
    theme: "light",
  });

  try {
    for (const testCase of cases) {
      await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: "light" },
        {
          name: "prefers-reduced-motion",
          value: testCase.reducedMotion ? "reduce" : "no-preference",
        },
      ]);

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
    }
  } finally {
    recordConsoleErrors(report, "motion-overrides", page.__qa.errors);
    await page.close();
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
