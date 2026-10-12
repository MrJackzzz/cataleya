import { chromium } from "playwright";

const BASE = process.argv[2] || "https://cataleya-aromas.vercel.app";
const OUT = process.argv[3] || "grid-antes.png";
const browser = await chromium.launch({ channel: "msedge" });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
await p.locator("#perfumes").scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
await p.locator("#perfumes").screenshot({ path: OUT });
console.log("shot ok:", OUT);
await browser.close();
