#!/usr/bin/env node
/**
 * Capture real screenshots from the running instrument for the README and
 * repository social preview.
 *
 * Usage:
 *   npm run capture:screenshots
 *
 * Outputs:
 *   docs/images/project-preview.png   — ribbon + drone latch, active voices
 *   docs/images/project-active.png    — theremin sweep, mid-gesture
 *   docs/images/project-detail.png    — arpeggiator full interface
 *   docs/images/github-social-preview.png — 1280x640 social banner
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "docs", "images");
const PORT = Number(process.env.CAPTURE_PORT || 4175);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server not ready yet
    }
    await sleep(500);
  }
  throw new Error(`Server did not become reachable at ${url}`);
}

async function serverIsUp(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });

  let server;
  if (!(await serverIsUp(BASE_URL))) {
    server = spawn(
      npmCommand,
      ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
      {
        cwd: ROOT,
        detached: process.platform !== "win32",
        stdio: "ignore",
      }
    );
    server.on("error", (error) => {
      throw error;
    });
    server.unref();
    console.log(`Starting dev server on ${BASE_URL}…`);
    await waitForServer(BASE_URL);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(30_000);

  try {
    console.log("Loading application…");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByText("THE EMOTION SPECTRUM").waitFor({ timeout: 30_000 });
    await page.getByRole("button", { name: /Power On/ }).waitFor({ timeout: 30_000 });

    // Audio gate: the browser requires a user gesture before AudioContext can run.
    console.log("Powering on the audio engine…");
    await page.getByRole("button", { name: /Power On/ }).click({ timeout: 30_000 });

    // Ribbon + drone latch: sustained voices make the visualizer meaningfully live.
    console.log("Capturing ribbon drone state…");
    await page.getByRole("button", { name: /Drone/ }).first().click({ timeout: 30_000 });
    for (const index of [0, 8, 12, 21]) {
      await page.locator("[data-cellkey]").nth(index).click({ timeout: 30_000 });
      await sleep(80);
    }
    await sleep(800);
    await page.screenshot({
      path: path.join(IMAGES_DIR, "project-preview.png"),
    });

    // Theremin: hold and sweep right across the spectrum to freeze a live glide.
    console.log("Capturing theremin sweep state…");
    await page.getByRole("button", { name: /Theremin/ }).click({ timeout: 30_000 });
    const ribbon = page.locator(".spectrum-scroll");
    const box = await ribbon.boundingBox();
    if (!box) throw new Error("Ribbon container not found");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + 30, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.62, y, { steps: 24 });
    await sleep(700);
    await page.screenshot({
      path: path.join(IMAGES_DIR, "project-active.png"),
    });
    await page.mouse.up();

    // Arp detail: back in ribbon mode, latch a small set and let the sequencer run.
    console.log("Capturing arpeggiator state…");
    await page.getByRole("button", { name: /Ribbon/ }).click({ timeout: 30_000 });
    await page.getByRole("button", { name: /Drone/ }).first().click({ timeout: 30_000 });
    for (const index of [3, 10, 17, 27]) {
      await page.locator("[data-cellkey]").nth(index).click({ timeout: 30_000 });
      await sleep(60);
    }
    await page.getByRole("button", { name: /Arp/ }).click({ timeout: 30_000 });
    await sleep(900);
    await page.screenshot({
      path: path.join(IMAGES_DIR, "project-detail.png"),
      fullPage: true,
    });

    // Social preview, built from the real preview screenshot.
    console.log("Rendering social preview…");
    await createSocialPreview(page);
    console.log("Screenshots complete.");
  } finally {
    await browser.close();
    if (server) {
      if (server.pid && process.platform !== "win32") {
        try {
          process.kill(-server.pid, "SIGTERM");
        } catch {
          server.kill("SIGTERM");
        }
      } else {
        server.kill("SIGTERM");
      }
    }
  }
}

async function createSocialPreview(page) {
  const screenshot = await readFile(
    path.join(IMAGES_DIR, "project-preview.png")
  );
  const imageData = `data:image/png;base64,${screenshot.toString("base64")}`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1280px; height: 640px; overflow: hidden; }
    body {
      background: #05040a url('${imageData}') center / cover no-repeat;
      color: #f0ecff;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      position: relative;
    }
    .shade {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(5,4,10,0.08) 0%, rgba(5,4,10,0.08) 42%, rgba(5,4,10,0.82) 100%);
    }
    .plate {
      position: absolute;
      left: 64px;
      right: 64px;
      bottom: 56px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 48px;
    }
    .title {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-shadow: 0 0 28px rgba(138,123,255,0.55), 0 2px 12px rgba(0,0,0,0.8);
      line-height: 1;
      max-width: 780px;
    }
    .descriptor {
      margin-top: 18px;
      font-size: 18px;
      letter-spacing: 0.04em;
      color: rgba(240,236,255,0.78);
      text-transform: uppercase;
      font-variant-numeric: tabular-nums;
    }
    .credit {
      font-size: 16px;
      color: rgba(240,236,255,0.62);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      white-space: nowrap;
      text-align: right;
    }
    .credit small {
      display: block;
      margin-top: 8px;
      color: rgba(240,236,255,0.45);
      font-size: 13px;
      letter-spacing: 0.08em;
    }
  </style>
</head>
<body>
  <div class="shade"></div>
  <div class="plate">
    <div>
      <div class="title">THE EMOTION SPECTRUM</div>
      <div class="descriptor">Electromagnetic bands as playable emotional synthesis</div>
    </div>
    <div class="credit">
      ZAZIE PRODUCTIONS
      <small>web-audio instrument · realtime canvas · React / TypeScript</small>
    </div>
  </div>
</body>
</html>`;

  await page.setViewportSize({ width: 1280, height: 640 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({
    path: path.join(IMAGES_DIR, "github-social-preview.png"),
  });
}

main()
  .then(() => {
    console.log(`Screenshots written to ${IMAGES_DIR}`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
