import { chromium } from "playwright";

const BASE = "https://cataleya-aromas.vercel.app";
const browser = await chromium.launch({ channel: "msedge" });
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const r = await p.request.get(`${BASE}/icon.svg`);
console.log("icon.svg:", r.status());
const f = await p.request.get(`${BASE}/favicon.ico`);
console.log("favicon.ico:", f.status());
await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
console.log("icon-link:", await p.locator('link[rel="icon"]').count());
console.log("cards:", await p.locator("article").count());
const hs = await p.locator("article button img").evaluateAll((els) =>
  els.map((el) => {
    const r2 = el.getBoundingClientRect();
    return `${Math.round(r2.height)}px@${Math.round(r2.width)}px/${getComputedStyle(el).objectFit}`;
  })
);
console.log("img-h:", JSON.stringify(hs));
const names = await p.locator("article h3").evaluateAll((els) => els.map((el) => el.innerText().slice(0, 40)));
console.log("names:", JSON.stringify(names));
await browser.close();
