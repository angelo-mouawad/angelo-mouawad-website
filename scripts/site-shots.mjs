// Captures the desktop and phone previews shown on /websites.
// Usage: npm run site-shots  (add a site's slug and URL below first)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const SITES = {
  "echoes-events": "https://eventswithechoes.com/",
  "samar-holidays": "https://samarholidays.com/",
  "el-samar-travel": "https://elsamartravel.com/",
  ayaverse: "https://ayaverse.be/",
};

const OUT = path.resolve(import.meta.dirname, "..", "public", "sites");
const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, width: 1440 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, width: 780 },
};

fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const browser = await chromium.launch();

for (const [slug, url] of Object.entries(SITES)) {
  if (only.length && !only.includes(slug)) continue;
  for (const [view, { width, ...options }] of Object.entries(VIEWS)) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 }).catch(() => page.waitForTimeout(4000));
      await page.waitForTimeout(3500);
      const shot = await page.screenshot({ type: "png" });
      const file = path.join(OUT, `${slug}-${view}.webp`);
      await sharp(shot).resize({ width }).webp({ quality: 82 }).toFile(file);
      console.log(`${slug} ${view}: ${(fs.statSync(file).size / 1024).toFixed(0)} KB, title "${await page.title()}"`);
    } catch (error) {
      console.log(`${slug} ${view}: failed (${error.message.split("\n")[0]})`);
    }
    await context.close();
  }
}
await browser.close();
