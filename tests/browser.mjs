import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
});
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.addInitScript(() => {
  window.requestAnimationFrame = () => 0;
});
await page.goto("http://localhost:5173");
await page.waitForFunction(() => window.lumoTest);
await page.evaluate(() => window.advanceTime(0));
async function clickTarget(type, index = 0) {
  const t = await page.evaluate(
    ({ type, index }) =>
      window.lumoTest
        .targets()
        .find((t) => t.type === type && (t.index ?? 0) === index),
    { type, index },
  );
  assert.ok(t, `Missing target ${type}`);
  const r = await page.locator("canvas").boundingBox();
  await page.touchscreen.tap(
    r.x + (t.x * r.width) / 420,
    r.y + (t.y * r.height) / 740,
  );
}
await clickTarget("rope");
await page.evaluate(() => window.advanceTime(4000));
assert.equal(await page.evaluate(() => window.lumoTest.puzzle.status), "won");
await page.waitForSelector("#next");
await page.locator("#next").click();
assert.equal(await page.evaluate(() => window.lumoTest.puzzle.level.id), 1);
await clickTarget("rope", 0);
await page.locator("#restart").click();
assert.equal(await page.evaluate(() => window.lumoTest.puzzle.actions), 0);
await page.locator("#map").click();
for (let w = 0; w < 10; w++) {
  await page.locator(`[data-tab="${w}"]`).click();
  assert.equal(await page.locator("[data-level]").count(), 10);
}
await page.locator("#close-map").click();
await page.evaluate(() => {
  window.lumoTest.load(10);
  window.advanceTime(0);
});
await clickTarget("rotate");
await clickTarget("rope", 0);
await clickTarget("rope", 1);
await page.evaluate(() => window.advanceTime(12000));
assert.equal(await page.evaluate(() => window.lumoTest.puzzle.status), "won");
const rows = JSON.parse(fs.readFileSync("level-results.json", "utf8")).results;
for (const id of [20, 30, 40, 50, 60, 70, 80, 98]) {
  await page.evaluate((id) => {
    window.lumoTest.load(id);
    window.advanceTime(0);
  }, id);
  const l = await page.evaluate(() => window.lumoTest.puzzle.level);
  let waited = false;
  for (const a of l.solution) {
    if (a.type === "waitGate")
      await page.evaluate((y) => {
        for (
          let i = 0;
          i < 1800 && window.lumoTest.puzzle.ball.position.y < y;
          i++
        )
          window.lumoTest.puzzle.tick();
        window.advanceTime(0);
      }, a.y);
    else if (a.type === "waitMs")
      await page.evaluate((ms) => window.advanceTime(ms), a.ms);
    else {
      if (a.type === "rope" && !waited) {
        await page.evaluate(
          (ms) => window.advanceTime(ms),
          rows[id].wait * 1000,
        );
        waited = true;
      }
      await clickTarget(a.type, a.index ?? 0);
    }
  }
  await page.evaluate(() => window.advanceTime(12000));
  assert.equal(
    await page.evaluate(() => window.lumoTest.puzzle.status),
    "won",
    `Touch mechanism level ${id + 1}`,
  );
}
for (const row of rows) {
  await page.evaluate(
    ({ id, wait }) => {
      window.lumoTest.load(id - 1);
      const l = window.lumoTest.puzzle.level;
      let waited = false;
      for (const a of l.solution) {
        if (a.type === "waitGate") {
          for (
            let i = 0;
            i < 1800 && window.lumoTest.puzzle.ball.position.y < a.y;
            i++
          )
            window.lumoTest.puzzle.tick();
        } else if (a.type === "waitMs") window.advanceTime(a.ms);
        else {
          if (a.type === "rope" && !waited) {
            window.advanceTime(wait * 1000);
            waited = true;
          }
          window.lumoTest.interact(a.type, a.index);
        }
      }
      window.advanceTime(12000);
    },
    { id: row.id, wait: row.wait },
  );
  const s = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(s.status, "won", `Level ${row.id}`);
  assert.equal(s.rating, 3, `Stars level ${row.id}`);
}
await page.evaluate(() => {
  window.lumoTest.load(98);
  window.advanceTime(0);
});
await page.locator("#hint").click();
assert.match(await page.locator("#hint-text").innerText(), /מחסומים/);
await page.screenshot({ path: "output/mobile.png" });
await page.locator("#map").click();
await page.locator("#map-settings").click();
const before = await page.locator("#sound-toggle b").innerText();
await page.locator("#sound-toggle").click();
assert.notEqual(await page.locator("#sound-toggle b").innerText(), before);
await page.locator("#settings-close").click();
await page.reload();
await page.waitForFunction(() => window.lumoTest);
assert.equal(
  await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lumo-save-v1")).stars.reduce(
      (a, b) => a + b,
      0,
    ),
  ),
  300,
);
await page.setViewportSize({ width: 1365, height: 950 });
await page.evaluate(() => {
  window.lumoTest.load(10);
  window.advanceTime(0);
});
await page.screenshot({ path: "output/desktop.png" });
assert.ok(await page.locator(".intro").isVisible());
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  true,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: 100 three-star solutions in browser; touch rope and rotation; next, restart, 10 worlds, hints, settings, persistence; mobile/desktop.",
);
await browser.close();
