/**
 * Visual parity by computed style, not by eye.
 *
 * A CSS refactor — moving rules between files, introducing cascade layers,
 * splitting a 1800-line stylesheet — is supposed to change nothing a reader can
 * see. Computed-style fingerprints complement screenshots: a failed comparison
 * names the element and property, while screenshots cover visual composition.
 *
 * This script records the computed style of every rendered element on the key
 * routes at two viewport widths, in DOM order, and reduces it to a per-element
 * hash plus a whole-page hash. Text output, diffable, and precise: it names the
 * element path and the properties that changed.
 *
 * Determinism: motion is measured at its settled state (durations collapsed),
 * and each page is sampled until two consecutive measurements agree, so a beat
 * of post-load layout does not leak into the hash. `--write` runs the whole
 * sweep twice and refuses to store a baseline the build cannot reproduce.
 *
 *   node scripts/style-fingerprint.mjs --write     # record the baseline
 *   node scripts/style-fingerprint.mjs             # compare against it
 *   node scripts/style-fingerprint.mjs --diff a.json b.json
 *
 * Requires a Chrome/Chromium binary: `CHROME_BIN`, or one on PATH. In CI the
 * browser-audit step already provides one.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3212";
// Twelve pages of computed style are 3.4 MB of text and 113 KB gzipped, so the
// baseline is stored compressed: the detail is what makes a diff readable, the
// bytes are what would make it a nuisance in the repository.
const BASELINE = "tests/visual-fingerprint.json.gz";
const ARG_WRITE = process.argv.includes("--write");
const DIFF_INDEX = process.argv.indexOf("--diff");

const ROUTES = [
  "/",
  "/films",
  "/films/the-truman-show",
  "/films/the-truman-show?spoilers=full",
  "/films/the-fast-and-the-furious?spoilers=full",
  "/films/the-truman-show/article?spoilers=full",
  "/films/the-truman-show/making",
  "/methodology",
  "/labs/living-frame",
  "/labs/moral-lens",
  "/labs/narrative-permission",
  "/labs/relationship-observatory",
  "/labs/scene-autopsy",
  "/labs/six-lenses",
];

const VIEWPORTS = [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
];

/** Properties that carry the visual contract of a rule. */
const PROPERTIES = [
  "display",
  "position",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-align",
  "text-decoration-line",
  "color",
  "background-color",
  "background-image",
  "border-top-width",
  "border-bottom-width",
  "border-left-width",
  "border-right-width",
  "border-top-color",
  "border-left-color",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "width",
  "height",
  "max-width",
  "min-height",
  "opacity",
  "transform",
  "filter",
  "z-index",
  "flex-direction",
  "grid-template-columns",
  "gap",
  "aspect-ratio",
  "overflow-x",
  "overflow-y",
  "visibility",
];

function readFingerprint(path) {
  const raw = readFileSync(path);
  const text = path.endsWith(".gz") ? gunzipSync(raw).toString("utf8") : raw.toString("utf8");
  return JSON.parse(text);
}

function findChrome() {
  const configured = process.env.CHROME_BIN?.trim();
  if (configured) return configured;
  const candidates = [
    "/tmp/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("No Chrome/Chromium binary: set CHROME_BIN.");
  return found;
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function openSocket(url) {
  const socket = new WebSocket(url);
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;
    const { resolve: resolvePending, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolvePending(message.result ?? {});
  });
  return {
    send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolvePending, reject) => {
        pending.set(id, { resolve: resolvePending, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close: () => socket.close(),
  };
}

async function waitForEndpoint(url, attempts = 120) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error("DevTools endpoint never became ready");
}

/** The in-page half of the measurement. Kept as a string for Runtime.evaluate. */
const MEASURE = `(() => {
  const PROPERTIES = ${JSON.stringify(PROPERTIES)};
  // Margins are deliberately not part of PROPERTIES. Chromium sometimes
  // reports the *used* value of an auto margin and sometimes 0 for the very
  // same layout (measured: rect.left 43 px in both runs, margin-left 43.2 px
  // in one and 0 px in the other), which made the fingerprint flip on its own.
  // The geometry below covers the same ground and does not lie.
  // Motion is measured at its settled state, not at a frame. Pinning every
  // animation at t=0 was the first idea and it does not work: a finished CSS
  // animation drops out of getAnimations(), so the hero entrance reads
  // opacity 0 on a slow run and 1 on a fast one. Collapsing duration and delay
  // makes both runs land on the same end state, which is also the state a
  // reader keeps looking at.
  if (!document.getElementById("dmr-fingerprint-freeze")) {
    const freeze = document.createElement("style");
    freeze.id = "dmr-fingerprint-freeze";
    freeze.textContent =
      "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;" +
      "animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important}";
    document.head.appendChild(freeze);
  }
  for (const animation of document.getAnimations()) {
    try { animation.finish(); } catch {
      try { animation.pause(); animation.currentTime = animation.effect.getComputedTiming().endTime; } catch {}
    }
  }
  const root = document.querySelector("main") ?? document.body;
  const scope = [document.querySelector(".siteHeader"), root, document.querySelector(".siteFooter")].filter(Boolean);
  const elements = [];
  const walk = (node, path) => {
    const children = [...node.children];
    children.forEach((child, index) => {
      const childPath = path ? path + "/" + index : String(index);
      elements.push({ path: childPath, element: child });
      walk(child, childPath);
    });
  };
  scope.forEach((node, index) => {
    elements.push({ path: "root" + index, element: node });
    walk(node, "root" + index);
  });
  return elements.map(({ path, element }) => {
    const style = getComputedStyle(element);
    const values = PROPERTIES.map((property) => {
      const raw = style.getPropertyValue(property);
      // Lengths are captured in whole pixels: a sub-pixel difference is font
      // hinting, not a rule.
      return /^-?[0-9.]+px$/.test(raw) ? Math.round(parseFloat(raw)) + "px" : raw;
    });
    const rect = element.getBoundingClientRect();
    return {
      path,
      tag: element.tagName.toLowerCase(),
      cls: String(element.className ?? "").slice(0, 80),
      box: [Math.round(rect.width), Math.round(rect.height)],
      // Where the box sits, in document coordinates. This is what carries
      // margins and gaps into the fingerprint: the computed value of an auto
      // margin is not usable for that (see the note above).
      at: [Math.round(rect.left + scrollX), Math.round(rect.top + scrollY)],
      style: values,
    };
  });
})()`;

/** Cheap "the page is really styled and rendered" probe, polled before measuring. */
const READY = `(() => {
  const root = getComputedStyle(document.documentElement);
  const gutter = root.getPropertyValue("--gutter").trim();
  const container = root.getPropertyValue("--container-max").trim();
  const main = document.querySelector("main");
  // The footer's quality summary changes width after capability detection.
  // Styled SSR is not hydrated readiness: do not fingerprint "MEDIUM / unknown".
  const backend = document.documentElement.dataset.graphicsBackend;
  return Boolean(gutter && container && main && main.children.length && backend && backend !== "unknown") && document.fonts.status === "loaded";
})()`;

// Generated CSS Module names can change with the bundler while the rendered
// styles stay identical. Keep cls for diagnostics, not visual identity.
function visualDigest(elements) {
  return hash(elements.map(({ path, tag, box, at, style }) => JSON.stringify({ path, tag, box, at, style })).join("\n"));
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

/**
 * Chromium keeps writing to its profile after SIGKILL (crash-pad, shader cache),
 * so an immediate rmdir races the dying process: ENOTEMPTY. Wait for the exit
 * first, then let rm retry over the last few file handles.
 */
async function stopChrome(child, profile) {
  const exited = new Promise((done) => {
    if (child.exitCode !== null) return done();
    child.once("exit", done);
  });
  child.kill("SIGKILL");
  await Promise.race([exited, sleep(5000)]);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 120 });
      return;
    } catch (error) {
      if (attempt === 4) console.warn(`Профиль Chromium не удалён: ${profile} (${error.code})`);
      await sleep(250);
    }
  }
}

async function capture(binary, viewport, route) {
  const profile = mkdtempSync(join(tmpdir(), "dmr-fingerprint-"));
  const child = spawn(
    binary,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--disable-background-networking",
      "--remote-debugging-port=0",
      "--user-data-dir=" + profile,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const port = await new Promise((done, fail) => {
    let buffer = "";
    const timer = setTimeout(() => fail(new Error("Chrome did not report a DevTools port")), 30000);
    child.stderr.on("data", (chunk) => {
      buffer += String(chunk);
      const match = buffer.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timer);
        done(Number(match[1]));
      }
    });
  });

  const targets = await waitForEndpoint(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find((target) => target.type === "page") ?? targets[0];
  const socket = await openSocket(page.webSocketDebuggerUrl);

  await socket.send("Page.enable");
  await socket.send("Runtime.enable");
  await socket.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 600,
  });
  await socket.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await socket.send("Page.navigate", { url: BASE_URL + route });
  // Full module pages and labs contain JS-driven ambient loops. Their
  // snapshots explicitly cover the reader's static/reduced-motion mode;
  // the browser audit, not this fingerprint, verifies live motion behavior.
  if (route.startsWith("/labs/") || /^\/films\/[^/?]+\?spoilers=full$/.test(route)) {
    await socket.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  }

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await socket.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (state.result?.value === "complete") break;
    await sleep(150);
  }
  await sleep(400);

  // Wait for the token layer and document fonts before measuring anything.
  let styled = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await socket.send("Runtime.evaluate", {
      expression: READY,
      returnByValue: true,
    });
    if (ready.result?.value === true) { styled = true; break; }
    await sleep(150);
  }

  if (!styled) {
    socket.close();
    await stopChrome(child, profile);
    throw new Error(`${route}: CSS/fonts never became ready; refusing an unstyled fingerprint`);
  }

  // Some layout settles a beat after load (a client component measuring, an
  // intersection observer firing). Measure until three samples in a row agree,
  // then keep the last one.
  let elements = null;
  let previous = null;
  let agreement = 0;
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const measured = await socket.send("Runtime.evaluate", {
      expression: MEASURE,
      returnByValue: true,
    });
    elements = measured.result.value;
    const signature = hash(JSON.stringify(elements));
    agreement = signature === previous ? agreement + 1 : 0;
    previous = signature;
    if (agreement >= 2) break;
    await sleep(200);
  }
  socket.close();
  await stopChrome(child, profile);

  if (agreement < 2) throw new Error(`${route}: layout did not stabilize; refusing a racy fingerprint`);
  const digest = visualDigest(elements);
  return { route, width: viewport.width, digest, elements };
}

function compare(baseline, current) {
  const problems = [];
  for (const page of baseline.pages) {
    const fresh = current.pages.find(
      (candidate) => candidate.route === page.route && candidate.width === page.width,
    );
    const label = `${page.route} @${page.width}`;
    if (!fresh) {
      problems.push(`${label}: страница исчезла из отпечатка`);
      continue;
    }
    if (visualDigest(fresh.elements) === visualDigest(page.elements)) continue;
    if (fresh.elements.length !== page.elements.length) {
      problems.push(`${label}: element count ${page.elements.length} → ${fresh.elements.length}`);
    }
    const before = new Map(page.elements.map((entry) => [entry.path, entry]));
    const after = new Map(fresh.elements.map((entry) => [entry.path, entry]));
    let reported = 0;
    for (const [path, entry] of before) {
      if (reported >= 6) break;
      const next = after.get(path);
      if (!next) {
        problems.push(`${label}: элемент ${path} (${entry.tag}.${entry.cls}) исчез`);
        reported += 1;
        continue;
      }
      const changed = PROPERTIES.filter(
        (property, index) => entry.style[index] !== next.style[index],
      );
      const resized =
        entry.box[0] !== next.box[0] ||
        entry.box[1] !== next.box[1] ||
        entry.at[0] !== next.at[0] ||
        entry.at[1] !== next.at[1];
      if (entry.tag !== next.tag) {
        problems.push(`${label}: ${path} tag ${entry.tag} → ${next.tag}`);
        reported += 1;
      }
      if (changed.length || resized) {
        problems.push(
          `${label}: ${entry.tag}.${entry.cls} — ${changed
            .map(
              (property) =>
                `${property}: ${entry.style[PROPERTIES.indexOf(property)]} → ${next.style[PROPERTIES.indexOf(property)]}`,
            )
            .join("; ")}${resized ? `; box ${entry.box.join("×")}@${entry.at.join(",")} → ${next.box.join("×")}@${next.at.join(",")}` : ""}`,
        );
        reported += 1;
      }
    }
    if (!reported) problems.push(`${label}: отпечаток изменился без видимых расхождений в элементах`);
  }
  return problems;
}

if (DIFF_INDEX !== -1) {
  const left = readFingerprint(process.argv[DIFF_INDEX + 1]);
  const right = readFingerprint(process.argv[DIFF_INDEX + 2]);
  const problems = compare(left, right);
  for (const problem of problems) console.error("• " + problem);
  console.log(problems.length === 0 ? "Отпечатки совпадают" : `${problems.length} расхождений`);
  process.exit(problems.length === 0 ? 0 : 1);
}

const binary = findChrome();
const pages = [];
for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    const page = await capture(binary, viewport, route);
    pages.push(page);
    console.log(`${route} @${viewport.width}: ${page.digest} (${page.elements.length} элементов)`);
  }
}
const payload = { baseUrl: BASE_URL, chromeEnvNote: "chrome:" + binary, pages };

if (ARG_WRITE) {
  // A baseline is only worth having if the same build produces it twice. Run
  // the whole sweep a second time and refuse to write a racy baseline.
  const replay = [];
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) replay.push(await capture(binary, viewport, route));
  }
  const unstable = compare(payload, { pages: replay });
  if (unstable.length) {
    for (const problem of unstable) console.error("• " + problem);
    console.error("Отпечаток недетерминирован — базовая линия не записана.");
    process.exit(1);
  }
  console.log("Двойной прогон совпал: отпечаток детерминирован.");
  mkdirSync(resolve(dirname(BASELINE)), { recursive: true });
  writeFileSync(BASELINE, gzipSync(JSON.stringify(payload) + "\n", { level: 9 }));
  console.log(`Базовая линия записана: ${BASELINE}`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error("Нет базовой линии: запустите с --write.");
  process.exit(2);
}
const baseline = readFingerprint(BASELINE);
const problems = compare(baseline, payload);
for (const problem of problems) console.error("• " + problem);
console.log(
  problems.length === 0
    ? `Отпечаток совпадает с базовой линией: ${pages.length} страниц`
    : `${problems.length} расхождений с базовой линией`,
);
process.exit(problems.length === 0 ? 0 : 1);

function dirname(path) {
  return path.split("/").slice(0, -1).join("/") || ".";
}
