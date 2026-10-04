import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
});
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("console:", m.text());
});
page.on("requestfailed", (r) => console.log("FAILED", r.url(), r.failure()));
page.on("response", (r) => {
  if (r.url().includes("/assets/index"))
    console.log("ASSET", r.url(), r.status(), r.fromServiceWorker());
});
await page.goto("http://localhost:4175");
await page.waitForFunction(() => navigator.serviceWorker.controller, {
  timeout: 20000,
});
await context.setOffline(true);
await page.reload();
try {
  await page.waitForFunction(() => window.render_game_to_text);
} catch (e) {
  console.log(errors);
  console.log(await page.locator("body").innerText());
  console.log(
    await page.evaluate(async () => ({
      url: location.href,
      keys: await caches.keys(),
      files: await Promise.all(
        (await caches.keys()).map(async (k) =>
          (await (await caches.open(k)).keys()).map((r) => r.url),
        ),
      ),
    })),
  );
  await browser.close();
  throw e;
}
assert.equal(
  await page.evaluate(() => window.lumoTest),
  undefined,
  "Development tools must not ship",
);
const r = await page.locator("canvas").boundingBox();
await page.touchscreen.tap(r.x + r.width / 2, r.y + (r.height * 115) / 740);
await page.waitForSelector("#next", { timeout: 10000 });
assert.equal(
  JSON.parse(await page.evaluate(() => window.render_game_to_text())).rating,
  3,
);
await page.locator("#next").click();
assert.equal(
  JSON.parse(await page.evaluate(() => window.render_game_to_text())).level,
  2,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: production build loads offline, touch solves level, saves and advances; no development hooks.",
);
await browser.close();
