// Screenshots the running dev server. Usage:
//   (--world n scrolls n viewports past the end of the room)
//   node scripts/shot.mjs out.png [--w 1440 --h 900] [--p 0.5] [--mobile] [--url /] [--hover x,y] [--click x,y] [--wait ms]
import { chromium } from "playwright";

const args = process.argv.slice(2);
const out = args[0];
const opt = (name, fallback) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback);
const width = +opt("w", 1440);
const height = +opt("h", 900);
const progress = +opt("p", 0);
const mobile = args.includes("--mobile");
const base = opt("base", "http://localhost:3000");

const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"] });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: mobile ? 2 : 1,
  hasTouch: mobile,
  isMobile: mobile,
  reducedMotion: args.includes("--reduced") ? "reduce" : "no-preference",
});
const page = await context.newPage();
const logs = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message.slice(0, 400)}`));

const started = Date.now();
await page.goto(base + opt("url", "/"), { waitUntil: "domcontentloaded" });
if (opt("url", "/") === "/") {
  await page.waitForSelector('[role="status"]', { state: "detached", timeout: 90000 }).catch(() => logs.push("loader never left"));
  console.log(`loader gone after ${Date.now() - started} ms`);
  await page.waitForTimeout(3200);
  if (progress > 0) {
    await page.evaluate((p) => {
      const spacer = document.querySelector(".room-scroll");
      const probe = document.querySelector(".lvh-probe");
      window.scrollTo(0, (spacer.offsetHeight - probe.offsetHeight) * p);
    }, progress);
    await page.waitForTimeout(2600);
  }
}
if (args.includes("--world")) {
  await page.evaluate((n) => {
    const spacer = document.querySelector(".room-scroll");
    const probe = document.querySelector(".lvh-probe");
    window.scrollTo(0, spacer.offsetHeight - probe.offsetHeight + n * probe.offsetHeight);
  }, +opt("world"));
  await page.waitForTimeout(+opt("settle", 3200));
}
// --at "#about:0.5" scrolls halfway through that element's pinned travel.
if (args.includes("--at")) {
  const at = opt("at");
  const selector = at.slice(0, at.lastIndexOf(":"));
  const fraction = at.slice(at.lastIndexOf(":") + 1);
  await page.evaluate(([selector, fraction]) => {
    const element = document.querySelector(selector);
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (element.offsetHeight - window.innerHeight) * fraction);
  }, [selector, +fraction]);
  await page.waitForTimeout(+opt("settle", 3200));
}
const point = (value) => value.split(",").map(Number);
if (args.includes("--hover")) {
  const [x, y] = point(opt("hover"));
  await page.mouse.move(x - 5, y - 5);
  await page.mouse.move(x, y, { steps: 4 });
  await page.waitForTimeout(900);
}
if (args.includes("--tap")) {
  const [x, y] = point(opt("tap"));
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(900);
}
if (args.includes("--click")) {
  const [x, y] = point(opt("click"));
  await page.mouse.click(x, y);
}
await page.waitForTimeout(+opt("wait", 400));
const clip = args.includes("--clip") ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(point(opt("clip"))) : undefined;
await page.screenshot({ path: out, clip });
console.log(`url now ${page.url()}`);
if (args.includes("--fps")) {
  const fps = await page.evaluate(() => new Promise((resolve) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else resolve(n / 2); }; requestAnimationFrame(f); }));
  console.log(`fps ${fps}`);
}
console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
