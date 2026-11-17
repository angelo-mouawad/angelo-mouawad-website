// Full page screenshot of a route on the dev server. Scrolls through first so in-view animations have played.
// Usage: node scripts/shot-page.mjs out.png /theme/ [width] [height] [mobile]
import { chromium } from "playwright";
const [out, url, w = "1440", h = "900", mobile = ""] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => m.type() === "error" && logs.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => logs.push("pageerror " + e.message.slice(0, 200)));
await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
await page.waitForTimeout(2200);
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += +h * 0.7) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(260); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
await page.screenshot({ path: out, fullPage: true });
console.log("height", height, logs.length ? logs.join(" | ") : "no errors");
await browser.close();
