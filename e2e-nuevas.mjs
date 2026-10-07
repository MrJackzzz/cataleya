import { chromium } from "playwright";

const BASE = "https://cataleya-aromas.vercel.app";
const ADMIN_PHONE = "1157069732";
const ADMIN_PASS = "CambiaEstaClave2026!";
const SUFFIX = String(Date.now() % 100000).padStart(5, "0");
const TEST_PHONE = `+54 9 11 6000-${SUFFIX}`;
const TEST_PASS = "TestE2E-123";
let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " | " + extra : ""}`);
  if (!cond) failures++;
};

const browser = await chromium.launch({ channel: "msedge" });

// ---------- Desktop: registro con contrasena propia ----------
const guest = await browser.newContext({ viewport: { width: 1440, height: 900 } });
guest.setDefaultTimeout(45000);
const g = await guest.newPage();
await g.goto(BASE + "/", { waitUntil: "networkidle" });
await g.screenshot({ path: "e2e-home-light.png" });
await g.getByRole("button", { name: /solicitar acceso/i }).first().click();
check("dialog acceso abre", await g.getByText(/solicitud de acceso/i).isVisible());
check(
  "deploy nuevo: campos contrasena existen",
  (await g.locator("#access-password").count()) > 0 &&
    (await g.locator("#access-confirm").count()) > 0
);
await g.locator("#access-name").fill("Test");
await g.locator("#access-lastname").fill("E2E");
await g.locator("#access-phone").fill(TEST_PHONE);
await g.locator("#access-password").fill(TEST_PASS);
await g.locator("#access-confirm").fill(TEST_PASS);
await g.getByRole("button", { name: /enviar solicitud/i }).click();
await g.getByText(/solicitud enviada/i).waitFor();
check("registro ok (toast)", true, TEST_PHONE);

// ---------- Login pendiente ----------
await g.goto(BASE + "/login", { waitUntil: "networkidle" });
await g.locator("#login-phone").fill(TEST_PHONE);
await g.locator("#login-password").fill(TEST_PASS);
await g.getByRole("button", { name: /ingresar/i }).click();
await g.getByText(/pendiente de aprobaci/i).waitFor();
check("login bloqueado por pendiente", true);

// ---------- Admin aprueba sin crear contrasena ----------
const actx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
actx.setDefaultTimeout(45000);
const a = await actx.newPage();
await a.goto(BASE + "/admin/login", { waitUntil: "networkidle" });
await a.locator("#login-phone").fill(ADMIN_PHONE);
await a.locator("#login-password").fill(ADMIN_PASS);
await a.getByRole("button", { name: /ingresar/i }).click();
await a.waitForURL("**/admin", { timeout: 45000 });
check("admin login", true);
await a.goto(BASE + "/admin/usuarios", { waitUntil: "networkidle" });
const card = a.locator("div.rounded-xl", { hasText: SUFFIX });
await card.first().waitFor();
check("solicitud visible en panel", true, SUFFIX);
await card.first().getByRole("button", { name: /aprobar/i }).click();
await a.getByText(/ya eligi.+su propia contrase/i).waitFor();
check("dialog aprobar sin contrasena obligatoria", true);
await a.getByRole("button", { name: /confirmar aprobaci/i }).click();
await a.getByText(/aprobado como CLIENTE/i).waitFor();
check("aprobado como CLIENTE", true);

// ---------- Cliente ingresa con su contrasena ----------
await g.goto(BASE + "/login", { waitUntil: "networkidle" });
await g.locator("#login-phone").fill(TEST_PHONE);
await g.locator("#login-password").fill(TEST_PASS);
await g.getByRole("button", { name: /ingresar/i }).click();
await g.waitForURL("**/mi-cuenta", { timeout: 45000 });
check("cliente ingresa con su contrasena", true, g.url());

// ---------- Movil: hamburguesa del panel ----------
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
mctx.setDefaultTimeout(45000);
const m = await mctx.newPage();
await m.goto(BASE + "/admin", { waitUntil: "networkidle" });
const burger = m.getByRole("button", { name: /abrir men/i });
check("hamburguesa visible en movil", await burger.isVisible());
await burger.click();
const drawerLink = m.getByRole("link", { name: /productos/i });
await drawerLink.waitFor();
check("drawer abre con links", true);
await m.screenshot({ path: "e2e-mobile-drawer.png" });
await drawerLink.click();
await m.waitForURL("**/admin/productos", { timeout: 45000 });
check("drawer navega a productos", true, m.url());
check(
  "drawer se cierra al navegar",
  (await m.getByRole("link", { name: /ganancias/i }).count()) === 0 ||
    !(await m.getByRole("link", { name: /ganancias/i }).first().isVisible())
);

console.log(`TEST_PHONE=${TEST_PHONE}`);
console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
