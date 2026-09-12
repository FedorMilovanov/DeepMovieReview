import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3212";
const outDir = resolve(process.env.BROWSER_AUDIT_DIR ?? "browser-audit");
const debuggingPort = 9222;
const debuggingBase = "http://127.0.0.1:" + debuggingPort;
const profileDir = "/tmp/dmr-chrome-profile";

mkdirSync(outDir, { recursive: true });
rmSync(profileDir, { recursive: true, force: true });

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function findChrome() {
  for (const binary of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const lookup = spawnSync("which", [binary], { encoding: "utf8" });
    if (lookup.status === 0 && lookup.stdout.trim()) return lookup.stdout.trim();
  }
  throw new Error("No Chrome/Chromium binary is available on the runner.");
}

async function waitForJson(url, attempts = 160) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint did not become ready: " + url);
}

const chromeBinary = findChrome();
const chrome = spawn(
  chromeBinary,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=" + debuggingPort,
    "--user-data-dir=" + profileDir,
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

let chromeStderr = "";
chrome.stderr.on("data", (chunk) => {
  chromeStderr += String(chunk);
});

const checks = [];
const browserErrors = [];
const networkErrors = [];
const livingFrameMeasurements = {};
let socket;

function record(name, passed, details = undefined) {
  checks.push({ name, passed, details });
}

function assertCheck(name, condition, details = undefined) {
  record(name, Boolean(condition), details);
}

try {
  await waitForJson(debuggingBase + "/json/version");
  const targetResponse = await fetch(debuggingBase + "/json/new?about:blank", { method: "PUT" });
  if (!targetResponse.ok) throw new Error("Could not create a browser target.");
  const target = await targetResponse.json();

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolvePromise, rejectPromise) => {
    socket.addEventListener("open", resolvePromise, { once: true });
    socket.addEventListener("error", rejectPromise, { once: true });
  });

  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      const { resolve: resolvePending, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message ?? "CDP command failed"));
      else resolvePending(message.result ?? {});
      return;
    }

    if (message.method === "Network.responseReceived" && message.params?.response?.status >= 400) {
      networkErrors.push({
        status: message.params.response.status,
        url: message.params.response.url,
        type: message.params.type,
      });
    }

    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params?.exceptionDetails;
      browserErrors.push({
        type: "exception",
        text: details?.exception?.description ?? details?.text ?? "Runtime exception",
        url: details?.url,
        lineNumber: details?.lineNumber,
        columnNumber: details?.columnNumber,
        stack: details?.stackTrace?.callFrames?.map((frame) => ({
          functionName: frame.functionName,
          url: frame.url,
          lineNumber: frame.lineNumber,
          columnNumber: frame.columnNumber,
        })),
      });
    }
    if (message.method === "Log.entryAdded" && message.params?.entry?.level === "error") {
      browserErrors.push({
        type: "log",
        text: message.params.entry.text ?? "Browser log error",
      });
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params?.type === "error") {
      browserErrors.push({
        type: "console",
        text: (message.params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" "),
      });
    }
  });

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolvePending, reject) => {
      pending.set(id, { resolve: resolvePending, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function pressEnter() {
    const keyEvent = {
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    };
    await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...keyEvent });
    await send("Input.dispatchKeyEvent", {
      type: "char",
      text: "\r",
      unmodifiedText: "\r",
      ...keyEvent,
    });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...keyEvent });
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Runtime.evaluate failed"
      );
    }
    return result.result?.value;
  }

  async function waitForDocumentReady() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const ready = await evaluate("document.readyState === 'complete'");
      if (ready) {
        await sleep(500);
        return;
      }
      await sleep(100);
    }
    throw new Error("Document did not reach readyState=complete.");
  }

  async function waitForPath(pathname) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const currentPath = await evaluate("window.location.pathname");
      if (currentPath === pathname) {
        await sleep(250);
        return;
      }
      await sleep(50);
    }
    throw new Error("Navigation did not reach " + pathname + ".");
  }

  async function waitForSelector(selector, attempts = 100) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const found = await evaluate("Boolean(document.querySelector(" + JSON.stringify(selector) + "))");
      if (found) {
        await sleep(120);
        return;
      }
      await sleep(50);
    }
    throw new Error("Selector did not become ready: " + selector);
  }

  async function waitForExpression(expression, attempts = 120, delayMs = 50) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const value = await evaluate(expression);
      if (value) return value;
      await sleep(delayMs);
    }
    throw new Error("Expression did not become truthy: " + expression);
  }

  async function navigate(
    pathname,
    width,
    height,
    reducedMotion = false,
    forcedColors = false,
    deviceScaleFactor = 1,
  ) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor,
      mobile: width < 600,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [
        {
          name: "prefers-reduced-motion",
          value: reducedMotion ? "reduce" : "no-preference",
        },
        {
          name: "forced-colors",
          value: forcedColors ? "active" : "none",
        },
      ],
    });
    await send("Page.navigate", { url: baseUrl + pathname });
    await waitForDocumentReady();
  }

  async function capture(name, fullPage = false) {
    let params = { format: "png", fromSurface: true };
    if (fullPage) {
      const metrics = await send("Page.getLayoutMetrics");
      const size = metrics.cssContentSize ?? metrics.contentSize;
      if (size?.width && size?.height) {
        params = {
          ...params,
          captureBeyondViewport: true,
          clip: {
            x: 0,
            y: 0,
            width: Math.min(size.width, 1800),
            height: Math.min(size.height, 14000),
            scale: 1,
          },
        };
      }
    }
    const screenshot = await send("Page.captureScreenshot", params);
    writeFileSync(resolve(outDir, name + ".png"), Buffer.from(screenshot.data, "base64"));
  }

  async function inspectNoHorizontalOverflow(label) {
    const geometry = JSON.parse(await evaluate(
      "JSON.stringify({" +
        "scrollWidth: document.documentElement.scrollWidth," +
        "clientWidth: document.documentElement.clientWidth" +
      "})"
    ));
    assertCheck(
      label + ": no horizontal overflow",
      geometry.scrollWidth <= geometry.clientWidth + 1,
      geometry,
    );
  }

  async function inspectMinimumTargetSize(label, selector, minimum = 24) {
    const result = JSON.parse(await evaluate(
      "JSON.stringify((() => {" +
        "const minimum=" + JSON.stringify(minimum) + ";" +
        "const nodes=[...document.querySelectorAll(" + JSON.stringify(selector) + ")];" +
        "const visible=nodes.filter((node) => { const s=getComputedStyle(node); const r=node.getBoundingClientRect(); return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0; });" +
        "const undersized=visible.map((node) => { const r=node.getBoundingClientRect(); return {text:(node.textContent||'').trim().slice(0,80),width:r.width,height:r.height}; }).filter((r) => r.width < minimum || r.height < minimum);" +
        "return {count: visible.length, undersized};" +
      "})())"
    ));
    assertCheck(label + ": controls meet 24px minimum target size", result.count > 0 && result.undersized.length === 0, result);
  }

  async function inspectBasic(label) {
    const summary = JSON.parse(await evaluate(
      "JSON.stringify({" +
        "title: document.title," +
        "lang: document.documentElement.lang," +
        "bodyLength: document.body.innerText.trim().length," +
        "h1Count: document.querySelectorAll('h1').length," +
        "duplicateIds: (() => { const ids=[...document.querySelectorAll('[id]')].map(n=>n.id); return ids.filter((id,i)=>ids.indexOf(id)!==i); })()," +
        "hiddenInteractive: document.querySelectorAll('[aria-hidden=\"true\"] a, [aria-hidden=\"true\"] button, [aria-hidden=\"true\"] input, [aria-hidden=\"true\"] select, [aria-hidden=\"true\"] textarea, [aria-hidden=\"true\"] [tabindex]').length," +
        "errorOverlay: Boolean(document.querySelector('[data-nextjs-dialog], nextjs-portal [data-nextjs-dialog]'))" +
      "})"
    ));

    assertCheck(label + ": meaningful content", summary.bodyLength > 300, summary.bodyLength);
    assertCheck(label + ": exactly one H1", summary.h1Count === 1, summary.h1Count);
    assertCheck(label + ": html lang", summary.lang === "ru", summary.lang);
    assertCheck(label + ": no duplicate IDs", summary.duplicateIds.length === 0, summary.duplicateIds);
    assertCheck(label + ": no interactive descendants hidden from AT", summary.hiddenInteractive === 0, summary.hiddenInteractive);
    assertCheck(label + ": no Next error overlay", !summary.errorOverlay, summary.errorOverlay);

    const ax = await send("Accessibility.getFullAXTree");
    const roles = (ax.nodes ?? []).map((node) => node.role?.value).filter(Boolean);
    assertCheck(label + ": accessibility tree root", roles.includes("RootWebArea"));
    assertCheck(label + ": accessibility headings", roles.includes("heading"));
    assertCheck(label + ": accessibility links", roles.includes("link"));
    return { summary, roles };
  }

  await send("Page.enable");
  await send("Network.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Accessibility.enable");

  await navigate("/", 1440, 1000);
  await inspectBasic("home desktop");
  await capture("home-desktop", true);

  await navigate("/", 390, 844);
  await inspectBasic("home mobile");
  await inspectNoHorizontalOverflow("home mobile");
  const autopsyDefinitionOverlap = await evaluate(
    "[...document.querySelectorAll('.autopsyGrid > div')].some((row) => {" +
      "const term=row.querySelector('dt'); const value=row.querySelector('dd');" +
      "if(!term||!value) return false;" +
      "const a=term.getBoundingClientRect(); const b=value.getBoundingClientRect();" +
      "return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;" +
    "})"
  );
  assertCheck("home mobile: autopsy labels do not overlap values", !autopsyDefinitionOverlap);
  await capture("home-mobile", true);

  await navigate("/", 1280, 900, false, true);
  await inspectBasic("home forced colors");
  const forcedColorsActive = await evaluate("matchMedia('(forced-colors: active)').matches");
  assertCheck("forced colors: browser media emulation active", forcedColorsActive);
  await capture("home-forced-colors", false);

  // A 1440px-wide display at 200% browser zoom exposes roughly a 720 CSS-pixel
  // layout viewport while device pixels double. This catches zoom/reflow failures
  // without relying on browser UI automation outside the DevTools protocol.
  await navigate("/", 720, 500, false, false, 2);
  await inspectBasic("home zoom 200");
  await inspectNoHorizontalOverflow("home zoom 200");
  await capture("home-zoom-200", true);

  await navigate("/labs/living-frame", 1280, 900);
  await inspectBasic("living frame desktop");
  const livingVariantCount = await evaluate("document.querySelectorAll('[data-living-frame-variant]').length");
  assertCheck("living frame: three comparison variants exist", livingVariantCount === 3, livingVariantCount);
  const livingDefaultVariant = await evaluate("document.querySelector('[data-living-frame-rd]')?.dataset.effectiveVariant");
  assertCheck("living frame: segmented planes are the default comparison path", livingDefaultVariant === "B", livingDefaultVariant);

  await evaluate("document.querySelector('[data-living-frame-rd] [data-variant]')?.scrollIntoView({block:'center'})");
  await sleep(200);
  const livingFrameBounds = JSON.parse(await evaluate(
    "JSON.stringify((() => {" +
      "const r=document.querySelector('[data-living-frame-rd] [data-variant]')?.getBoundingClientRect();" +
      "return r ? {left:r.left,top:r.top,width:r.width,height:r.height} : null;" +
    "})())"
  ));
  assertCheck("living frame: comparison frame has measurable geometry", Boolean(livingFrameBounds?.width && livingFrameBounds?.height), livingFrameBounds);

  if (livingFrameBounds) {
    for (let index = 0; index < 8; index += 1) {
      const x = livingFrameBounds.left + livingFrameBounds.width * (0.25 + (index % 4) * 0.16);
      const y = livingFrameBounds.top + livingFrameBounds.height * (0.34 + (index % 3) * 0.12);
      await evaluate(
        "(() => {" +
          "const n=document.querySelector('[data-living-frame-rd] [data-variant]');" +
          "if(!n) return false;" +
          "n.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:" + x + ",clientY:" + y + "}));" +
          "return true;" +
        "})()"
      );
      await sleep(35);
    }
  }

  await evaluate("document.querySelector('[data-run-living-frame-benchmark]')?.click()");
  await waitForExpression("document.querySelector('[data-living-frame-metric=\"B\"]')?.dataset.frameP95 !== ''");
  const livingB = JSON.parse(await evaluate(
    "JSON.stringify((() => { const n=document.querySelector('[data-living-frame-metric=\"B\"]'); return n ? {" +
      "frameP95:Number(n.dataset.frameP95),pointerP95:Number(n.dataset.pointerP95),textureBytes:Number(n.dataset.textureBytes)" +
    "} : null; })())"
  ));
  livingFrameMeasurements.B = livingB;
  assertCheck("living frame B: active benchmark produced frame samples", livingB?.frameP95 > 0, livingB);
  assertCheck("living frame B: pointer-to-render latency was measured", livingB?.pointerP95 > 0, livingB);
  assertCheck("living frame B: segmented planes require no GPU texture working set", livingB?.textureBytes === 0, livingB);
  await capture("living-frame-b-planes", true);

  await evaluate("document.querySelector('[data-living-frame-variant=\"A\"]')?.click()");
  await waitForExpression("document.querySelector('[data-living-frame-rd]')?.dataset.effectiveVariant === 'A'");
  await waitForExpression("document.querySelector('[data-gpu-status]')?.dataset.gpuStatus !== 'detecting'", 160, 100);
  const livingGpuStatus = await evaluate("document.querySelector('[data-gpu-status]')?.dataset.gpuStatus");
  assertCheck("living frame A: GPU depth-mesh path initializes in audit Chrome", livingGpuStatus === "active", livingGpuStatus);

  await evaluate("document.querySelector('[data-gpu-status]')?.scrollIntoView({block:'center'})");
  await sleep(200);
  const gpuFrameBounds = JSON.parse(await evaluate(
    "JSON.stringify((() => {" +
      "const r=document.querySelector('[data-gpu-status]')?.getBoundingClientRect();" +
      "return r ? {left:r.left,top:r.top,width:r.width,height:r.height} : null;" +
    "})())"
  ));
  if (gpuFrameBounds && livingGpuStatus === "active") {
    for (let index = 0; index < 8; index += 1) {
      const x = gpuFrameBounds.left + gpuFrameBounds.width * (0.28 + (index % 4) * 0.14);
      const y = gpuFrameBounds.top + gpuFrameBounds.height * (0.36 + (index % 3) * 0.1);
      await evaluate(
        "(() => {" +
          "const n=document.querySelector('[data-gpu-status]');" +
          "if(!n) return false;" +
          "n.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:" + x + ",clientY:" + y + "}));" +
          "return true;" +
        "})()"
      );
      await sleep(45);
    }

    await evaluate("document.querySelector('[data-run-living-frame-benchmark]')?.click()");
    await waitForExpression("document.querySelector('[data-living-frame-metric=\"A\"]')?.dataset.frameP95 !== ''", 180, 100);
  }

  const livingA = JSON.parse(await evaluate(
    "JSON.stringify((() => { const n=document.querySelector('[data-living-frame-metric=\"A\"]'); return n ? {" +
      "frameP95:n.dataset.frameP95===''?null:Number(n.dataset.frameP95)," +
      "pointerP95:n.dataset.pointerP95===''?null:Number(n.dataset.pointerP95)," +
      "textureBytes:Number(n.dataset.textureBytes)" +
    "} : null; })())"
  ));
  livingFrameMeasurements.A = livingA;
  assertCheck("living frame A: active benchmark produced frame samples", livingA?.frameP95 > 0, livingA);
  assertCheck("living frame A: pointer-to-render latency was measured", livingA?.pointerP95 > 0, livingA);
  assertCheck("living frame A: modeled procedural texture working set is bounded", livingA?.textureBytes === 465664, livingA);

  await capture("living-frame-a-normal", true);
  await evaluate("document.querySelector('[aria-pressed=\"false\"]." + "depthToggle" + "')");
  const depthButtonClicked = await evaluate(
    "(() => { const buttons=[...document.querySelectorAll('button')]; const b=buttons.find(x=>x.textContent?.includes('Inspect depth')); if(!b) return false; b.click(); return true; })()"
  );
  assertCheck("living frame A: depth inspection control is available", depthButtonClicked);
  await sleep(300);
  await capture("living-frame-a-depth-mesh", true);

  await evaluate("document.querySelector('[data-living-frame-variant=\"C\"]')?.click()");
  await waitForExpression("document.querySelector('[data-living-frame-rd]')?.dataset.effectiveVariant === 'C'");
  const liteHasCanvas = await evaluate("Boolean(document.querySelector('[data-living-frame-rd] canvas'))");
  assertCheck("living frame C: Lite path has no canvas", !liteHasCanvas);
  await evaluate("document.querySelector('[data-run-living-frame-benchmark]')?.click()");
  await sleep(100);
  const livingC = JSON.parse(await evaluate(
    "JSON.stringify((() => { const n=document.querySelector('[data-living-frame-metric=\"C\"]'); return n ? {" +
      "frameP95:Number(n.dataset.frameP95),pointerP95:Number(n.dataset.pointerP95),textureBytes:Number(n.dataset.textureBytes)" +
    "} : null; })())"
  ));
  livingFrameMeasurements.C = livingC;
  assertCheck("living frame C: static path reports zero animation frame cost", livingC?.frameP95 === 0, livingC);
  assertCheck("living frame C: static path reports zero pointer animation latency", livingC?.pointerP95 === 0, livingC);
  await capture("living-frame-c-lite", true);

  await navigate("/labs/living-frame", 390, 844);
  await inspectBasic("living frame mobile");
  const livingMobileOverflow = await evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth");
  assertCheck("living frame mobile: no horizontal overflow", livingMobileOverflow);
  const livingMobileGeometry = JSON.parse(await evaluate(
    "JSON.stringify((() => { const r=document.querySelector('[data-living-frame-rd] [data-variant]')?.getBoundingClientRect(); return r ? {width:r.width,height:r.height} : null; })())"
  ));
  assertCheck("living frame mobile: frame recomposes taller than desktop cinema ratio", livingMobileGeometry?.height / livingMobileGeometry?.width > 0.6, livingMobileGeometry);
  await capture("living-frame-mobile", true);

  await navigate("/labs/living-frame", 1280, 900, true);
  await evaluate("document.querySelector('[data-living-frame-variant=\"A\"]')?.click()");
  await sleep(250);
  const reducedLivingState = JSON.parse(await evaluate(
    "JSON.stringify((() => { const n=document.querySelector('[data-living-frame-rd]'); return n ? {" +
      "selected:n.dataset.selectedVariant,effective:n.dataset.effectiveVariant,reduced:n.dataset.reducedMotion,canvas:Boolean(n.querySelector('canvas'))" +
    "} : null; })())"
  ));
  assertCheck("living frame reduced motion: A may remain selected but effective path is C", reducedLivingState?.selected === "A" && reducedLivingState?.effective === "C", reducedLivingState);
  assertCheck("living frame reduced motion: no GPU canvas remains active", reducedLivingState?.canvas === false, reducedLivingState);
  await capture("living-frame-reduced-motion", false);

  await navigate("/films", 1280, 900);
  await inspectBasic("film index");
  const transitionSource = await evaluate("Boolean(document.querySelector('[data-film-transition-media=\"pilot-film\"]'))");
  const nativeViewTransitionSupported = await evaluate("typeof document.startViewTransition === 'function'");
  assertCheck("film navigation: shared media source exists", transitionSource);
  assertCheck("film navigation: native View Transition API is available in audit Chrome", nativeViewTransitionSupported);
  await evaluate("document.querySelector('.filmRow')?.click()");
  await sleep(80);
  const routeTransitionActive = await evaluate("document.documentElement.dataset.routeTransition === 'active'");
  assertCheck("film navigation: transition lifecycle activates", routeTransitionActive);
  await waitForPath("/films/pilot-film");
  await waitForSelector('[data-film-transition-media="pilot-film"].filmMediaFrameHero');
  const transitionTarget = await evaluate("Boolean(document.querySelector('[data-film-transition-media=\"pilot-film\"].filmMediaFrameHero'))");
  assertCheck("film navigation: shared media target exists after route commit", transitionTarget);
  await inspectBasic("film shared transition target");
  await capture("film-shared-transition-target", false);
  await sleep(600);
  const routeTransitionSettled = await evaluate("document.documentElement.dataset.routeTransition !== 'active'");
  assertCheck("film navigation: transition lifecycle settles", routeTransitionSettled);

  await navigate("/films", 1280, 900, true);
  await sleep(300);
  const reducedIndexState = await evaluate("document.documentElement.dataset.reducedMotion");
  assertCheck("film navigation reduced motion: system preference is active", reducedIndexState === "true", reducedIndexState);
  await evaluate("document.querySelector('.filmRow')?.click()");
  await sleep(80);
  const reducedTransitionActive = await evaluate("document.documentElement.dataset.routeTransition === 'active'");
  assertCheck("film navigation reduced motion: shared transition is bypassed", !reducedTransitionActive);
  await waitForPath("/films/pilot-film");
  await waitForSelector('[data-film-transition-media="pilot-film"].filmMediaFrameHero');

  await navigate("/labs/six-lenses", 1280, 900);
  const six = await inspectBasic("six lenses");
  const tabState = JSON.parse(await evaluate(
    "JSON.stringify({" +
      "tablists: document.querySelectorAll('[role=tablist]').length," +
      "tabs: document.querySelectorAll('[role=tab]').length," +
      "selected: document.querySelectorAll('[role=tab][aria-selected=\"true\"]').length," +
      "roving: [...document.querySelectorAll('[role=tab]')].filter(t => t.tabIndex === 0).length," +
      "panelLabelled: (() => { const p=document.querySelector('[role=tabpanel]'); const t=document.querySelector('[role=tab][aria-selected=\"true\"]'); return Boolean(p && t && p.getAttribute('aria-labelledby') === t.id); })()" +
    "})"
  ));
  assertCheck("six lenses: one tablist", tabState.tablists === 1, tabState);
  assertCheck("six lenses: six tabs", tabState.tabs === 6, tabState);
  assertCheck("six lenses: one selected tab", tabState.selected === 1, tabState);
  assertCheck("six lenses: roving tabindex", tabState.roving === 1, tabState);
  assertCheck("six lenses: tabpanel labelled by selected tab", tabState.panelLabelled, tabState);
  assertCheck("six lenses: tabs in AX tree", six.roles.filter((role) => role === "tab").length >= 6);
  await inspectMinimumTargetSize("six lenses", "[role=tab]");
  await evaluate("document.querySelectorAll('[role=tab]')[0].focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight" });
  await sleep(250);
  const keyboardAdvanced = await evaluate(
    "document.querySelectorAll('[role=tab]')[1].getAttribute('aria-selected') === 'true' && document.activeElement === document.querySelectorAll('[role=tab]')[1]"
  );
  assertCheck("six lenses: ArrowRight activates and focuses next tab", keyboardAdvanced);
  await capture("six-lenses", true);

  await navigate("/labs/scene-autopsy", 1280, 900);
  await inspectBasic("scene autopsy");
  const autopsyState = JSON.parse(await evaluate(
    "JSON.stringify({" +
      "buttons: document.querySelectorAll('[aria-label=\"Scene evidence anchors\"] button').length," +
      "pressed: document.querySelectorAll('[aria-label=\"Scene evidence anchors\"] button[aria-pressed=\"true\"]').length," +
      "visualButtons: document.querySelectorAll('[aria-hidden=\"true\"] button').length" +
    "})"
  ));
  assertCheck("scene autopsy: canonical evidence buttons present", autopsyState.buttons === 4, autopsyState);
  assertCheck("scene autopsy: one pressed evidence control", autopsyState.pressed === 1, autopsyState);
  assertCheck("scene autopsy: no hidden duplicate buttons", autopsyState.visualButtons === 0, autopsyState);
  await inspectMinimumTargetSize("scene autopsy", "[aria-label=\"Scene evidence anchors\"] button");
  await evaluate("document.querySelectorAll('[aria-label=\"Scene evidence anchors\"] button')[1]?.focus()");
  await pressEnter();
  await sleep(150);
  const autopsyKeyboardActivated = await evaluate(
    "document.querySelectorAll('[aria-label=\"Scene evidence anchors\"] button')[1]?.getAttribute('aria-pressed') === 'true' && document.activeElement === document.querySelectorAll('[aria-label=\"Scene evidence anchors\"] button')[1]"
  );
  assertCheck("scene autopsy: keyboard activates and preserves focus", autopsyKeyboardActivated);
  await capture("scene-autopsy", true);

  await navigate("/films/pilot-film?spoilers=NONE", 1280, 900);
  await inspectBasic("film NONE");
  const noneLeaksMajor = await evaluate("document.body.innerText.includes('Evidence before conclusion.')");
  assertCheck("film NONE: MAJOR autopsy stays projected out", !noneLeaksMajor);

  await navigate("/films/pilot-film?spoilers=FULL", 1280, 900);
  await inspectBasic("film FULL");
  const fullHasMajor = await evaluate("document.body.innerText.includes('Evidence before conclusion.')");
  assertCheck("film FULL: MAJOR autopsy is visible", fullHasMajor);
  await capture("film-full", true);

  await navigate("/films/pilot-film?spoilers=FULL", 640, 450, false, false, 2);
  await inspectBasic("film zoom 200");
  await inspectNoHorizontalOverflow("film zoom 200");
  await capture("film-zoom-200", true);

  await navigate("/films/pilot-film?spoilers=FULL", 1280, 900, true);
  await sleep(500);
  const reducedMotionState = JSON.parse(await evaluate(
    "JSON.stringify({" +
      "media: matchMedia('(prefers-reduced-motion: reduce)').matches," +
      "dataset: document.documentElement.dataset.reducedMotion," +
      "mode: document.documentElement.dataset.motionPreference" +
    "})"
  ));
  assertCheck("reduced motion: browser media emulation active", reducedMotionState.media, reducedMotionState);
  assertCheck("reduced motion: experience runtime reflects system preference", reducedMotionState.dataset === "true", reducedMotionState);
  await capture("film-reduced-motion", false);

  assertCheck("browser network: no failed HTTP resources", networkErrors.length === 0, networkErrors);
  assertCheck("browser console/runtime: no errors", browserErrors.length === 0, browserErrors);
} catch (error) {
  record("browser audit execution", false, error instanceof Error ? error.stack ?? error.message : String(error));
} finally {
  const report = {
    baseUrl,
    chromeBinary,
    passed: checks.every((check) => check.passed),
    checks,
    browserErrors,
    networkErrors,
    livingFrameMeasurements,
    chromeStderr: chromeStderr.slice(-12000),
  };
  writeFileSync(resolve(outDir, "report.json"), JSON.stringify(report, null, 2));

  try {
    socket?.close();
  } catch {
    // Ignore close errors.
  }
  chrome.kill("SIGTERM");
  await sleep(200);
  if (!chrome.killed) chrome.kill("SIGKILL");

  const failed = checks.filter((check) => !check.passed);
  for (const check of checks) {
    console.log((check.passed ? "PASS " : "FAIL ") + check.name);
  }
  if (failed.length > 0) {
    console.error("Browser audit failed with " + failed.length + " check(s).");
    process.exitCode = 1;
  }
}
