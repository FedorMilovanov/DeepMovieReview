import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { decodeEvidence, evidenceManifest } from "../scripts/lib/evidence-transfer.mjs";
import { planEvidence, publishEvidence } from "../scripts/lib/evidence-publisher.mjs";
import { appShellFailureExcerpt, iosTransportErrorExcerpt } from "../scripts/lib/ios-transport-history.mjs";

const revision = "a".repeat(40), head = "b".repeat(40);

function fakeChecks({ corruptReadBack = false } = {}) {
  const checks = new Map();
  let nextId = 100;
  async function api(path, method = "GET", body) {
    if (method === "POST" && path === "") {
      const check = { id: ++nextId, app: { slug: "github-actions" }, name: body.name,
        head_sha: body.head_sha, status: body.status, output: {}, rows: [] };
      checks.set(check.id, check);
      return { id: check.id };
    }
    const match = path.match(/^\/(\d+)(?:\/annotations\?per_page=100&page=(\d+))?$/);
    assert.ok(match, `Unexpected fake Checks API path ${path}`);
    const check = checks.get(Number(match[1]));
    assert.ok(check);
    if (method === "PATCH") {
      if (body.output) {
        if (body.output.annotations) check.rows.push(...body.output.annotations);
        for (const key of ["title", "summary", "text"]) if (body.output[key] !== undefined) check.output[key] = body.output[key];
      }
      for (const key of ["status", "conclusion"]) if (body[key] !== undefined) check[key] = body[key];
      return { id: check.id };
    }
    assert.equal(method, "GET");
    const page = Number(match[2]);
    const rows = check.rows.slice((page - 1) * 100, page * 100).map(row => ({ ...row }));
    if (corruptReadBack && check.id === 101 && page === 1 && rows.length) rows[0].message = `!${rows[0].message.slice(1)}`;
    return rows;
  }
  return { api, checks };
}

// A real gzip payload larger than the former 1,000-chunk budget. No screenshot
// is truncated, resized or dropped; the original failing verdict is retained.
const payload = { summary: { revision, phase: "measured", failures: ["native result remains a failure"] }, scans: [],
  screenshots: [{ data: randomBytes(3_100_000).toString("base64") }] };
const bytes = gzipSync(Buffer.from(JSON.stringify(payload)));

test("multipart evidence publishes and reads back a lossless receipt over 1,000 chunks", async () => {
  const { api, checks } = fakeChecks();
  const plan = planEvidence(bytes, revision);
  assert.ok(plan.chunks.length > 1000 && plan.groups.length === 2);
  assert.equal(plan.groups[0].length, 1000);
  const { manifest, checks: ids } = await publishEvidence({ bytes, revision, head, label: "ios-safari", summary: payload.summary, api });
  assert.equal(ids.length, 2);
  assert.equal(manifest.parts.length, 2);
  const root = checks.get(ids[0].id), child = checks.get(ids[1].id);
  assert.equal(root.conclusion, "success");
  assert.equal(child.conclusion, "success");
  const decoded = decodeEvidence(root, root.rows.toReversed(), revision, head, [{ check: child, rows: child.rows.toReversed() }]);
  assert.equal(decoded.payload.screenshots[0].data, payload.screenshots[0].data);
  assert.deepEqual(decoded.payload.summary.failures, ["native result remains a failure"]);
  assert.equal(decoded.manifest.sha256, manifest.sha256);

  assert.throws(() => decodeEvidence(root, root.rows, revision, head), /Missing or extra evidence parts/);
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: { ...child, head_sha: revision }, rows: child.rows }]), /part head/);
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: { ...child, name: "unrelated" }, rows: child.rows }]), /part name/);
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: { ...child, conclusion: "failure" }, rows: child.rows }]), /did not succeed/);
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: { ...child, output: { summary: "{}" } }, rows: child.rows }]), /manifest mismatch/);
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: child, rows: child.rows.slice(1) }]), /Missing or extra chunks/);
  const badChildRows = child.rows.map((row, index) => index ? row : { ...row, message: `!${row.message.slice(1)}` });
  assert.throws(() => decodeEvidence(root, root.rows, revision, head, [{ check: child, rows: badChildRows }]), /base64/);
  const duplicate = structuredClone(manifest); duplicate.parts[1].id = duplicate.parts[0].id;
  assert.throws(() => evidenceManifest({ ...root, output: { summary: JSON.stringify(duplicate) } }, revision, head), /duplicate part ID/);
  const gap = structuredClone(manifest); gap.parts[1].first++;
  assert.throws(() => evidenceManifest({ ...root, output: { summary: JSON.stringify(gap) } }, revision, head), /contiguous/);
});

test("security evidence uses a distinct check and preserves a failed source verdict", async () => {
  const { api, checks } = fakeChecks();
  const data = { summary: { revision, failures: ["Swift finding"] }, scans: [{ name: "swift.sarif", base64: "e30=" }] };
  const result = await publishEvidence({ bytes: gzipSync(Buffer.from(JSON.stringify(data))), revision, head,
    label: "swift-codeql", kind: "security", summary: data.summary, api });
  const check = checks.get(result.checks[0].id);
  assert.equal(check.name, "Security evidence (swift-codeql)");
  assert.equal(check.rows[0].path, "scripts/check-swift-codeql.mjs");
  assert.deepEqual(decodeEvidence(check, check.rows, revision, head).payload, data);
  await assert.rejects(publishEvidence({ bytes, revision, head, label: "bad", kind: "other", summary: payload.summary, api }), /Unknown evidence kind/);
});

test("a transient annotation append is reconciled before any retry, including partial or complete writes", async () => {
  for (const mode of ["before", "partial", "after"]) {
    const { api: base, checks } = fakeChecks();
    const lengths = [];
    let failed = false;
    const api = async (path, method, body) => {
      const rows = body?.output?.annotations;
      if (method === "PATCH" && rows) {
        lengths.push(rows.length);
        if (!failed) {
          failed = true;
          const accepted = mode === "after" ? rows : mode === "partial" ? rows.slice(0, 17) : [];
          if (accepted.length) await base(path, method, { ...body, output: { ...body.output, annotations: accepted } });
          throw Object.assign(new Error("temporary 500"), { status: 500 });
        }
      }
      return base(path, method, body);
    };
    const source = randomBytes(175_000);
    const result = await publishEvidence({ bytes: source, revision, head, label: "historical", summary: payload.summary, api, wait: async () => {} });
    const check = checks.get(result.checks[0].id);
    assert.equal(check.conclusion, "success");
    assert.equal(check.rows.length, result.manifest.chunks);
    assert.equal(new Set(check.rows.map(row => row.title)).size, check.rows.length);
    assert.deepEqual(lengths.slice(0, mode === "after" ? 1 : 2),
      mode === "before" ? [50, 50] : mode === "partial" ? [50, 33] : [50]);
    assert.deepEqual(Buffer.from(check.rows.map(row => row.message).join(""), "base64"), source);
  }
});

test("reconciliation covers previous pages and a transient read without duplicating a later batch", async () => {
  const { api: base, checks } = fakeChecks();
  let appends = 0, failRead = true;
  const sizes = [];
  const api = async (path, method = "GET", body) => {
    if (method === "GET" && appends >= 5 && failRead) {
      failRead = false;
      throw Object.assign(new Error("temporary read error"), { status: 503 });
    }
    if (method === "PATCH" && body?.output?.annotations) {
      const rows = body.output.annotations;
      sizes.push(rows.length);
      if (++appends === 5) {
        await base(path, method, { ...body, output: { ...body.output, annotations: rows.slice(0, 20) } });
        throw Object.assign(new Error("temporary append error"), { status: 500 });
      }
    }
    return base(path, method, body);
  };
  const source = randomBytes(700_000);
  const result = await publishEvidence({ bytes: source, revision, head, label: "historical", summary: payload.summary, api, wait: async () => {} });
  const check = checks.get(result.checks[0].id);
  assert.deepEqual(sizes.slice(0, 6), [50, 50, 50, 50, 34, 14]);
  assert.equal(check.rows.length, result.manifest.chunks);
  assert.equal(new Set(check.rows.map(row => row.title)).size, check.rows.length);
  assert.deepEqual(Buffer.from(check.rows.map(row => row.message).join(""), "base64"), source);
});

test("ambiguous or persistent annotation errors fail closed and retain the original source verdict", async () => {
  for (const mode of ["unstable", "unexpected", "duplicate", "persistent", "non-transient"]) {
    const { api: base, checks } = fakeChecks();
    let reads = 0, appends = 0, firstRow;
    const api = async (path, method = "GET", body) => {
      if (method === "PATCH" && body?.output?.annotations) {
        appends++; firstRow = body.output.annotations[0];
        throw Object.assign(new Error("append failed"), { status: mode === "non-transient" ? 403 : 500 });
      }
      if (method === "GET" && mode === "unstable" && ++reads === 2)
        return [{ title: "chunk-0001", message: "unexpected" }];
      if (method === "GET" && mode === "unexpected") return [{ title: "chunk-0001", message: "unexpected" }];
      if (method === "GET" && mode === "duplicate") return [firstRow, firstRow];
      return base(path, method, body);
    };
    const failure = mode === "unstable" ? /changed during reconciliation/ : mode === "unexpected" ? /Unexpected annotation/ :
      mode === "duplicate" ? /Duplicate annotation/ : /append failed/;
    await assert.rejects(publishEvidence({ bytes: randomBytes(9000), revision, head, label: "historical",
      summary: payload.summary, api, wait: async () => {} }), failure);
    assert.equal(appends, mode === "persistent" ? 3 : 1);
    const check = [...checks.values()][0];
    assert.equal(check.conclusion, "failure");
    assert.match(check.output.text, /native result remains a failure/);
  }
});

test("corrupt multipart read-back marks every created check failed", async () => {
  const { api, checks } = fakeChecks({ corruptReadBack: true });
  await assert.rejects(publishEvidence({ bytes, revision, head, label: "ios-safari", summary: payload.summary, api }), /changed on API read-back/);
  assert.equal(checks.size, 2);
  for (const check of checks.values()) {
    assert.equal(check.status, "completed");
    assert.equal(check.conclusion, "failure");
    assert.match(check.output.text, /read-back/);
  }
});

test("publisher and reader CLIs round-trip multipart evidence through a simulated Checks API", {
  skip: process.platform === "win32" ? "This CLI fixture uses a POSIX gh shim; the transport itself is tested above" : false,
}, () => {
  const dir = mkdtempSync(join(tmpdir(), "dmr-checks-integration-"));
  try {
    const state = join(dir, "checks.json"), mock = join(dir, "mock-fetch.mjs"), fakeGh = join(dir, "gh"), output = join(dir, "receipt.json");
    const scan = { browser: "ios-safari-simulator", width: 0, route: "/", state: "native-ios-simulator", file: "scan.json" };
    writeFileSync(join(dir, "summary.json"), JSON.stringify({ ...payload.summary, results: [scan] }));
    writeFileSync(join(dir, "scan.json"), JSON.stringify({ violations: [], incomplete: [], actions: [{ label: "real failure retained" }], screenshots: payload.screenshots }));
    writeFileSync(mock, `import { writeFileSync } from 'node:fs';
      const checks = {}; let next = 700;
      globalThis.fetch = async (url, opts = {}) => {
        const method = opts.method ?? 'GET', body = opts.body ? JSON.parse(opts.body) : {};
        const parsed = new URL(url); let result;
        if (method === 'POST') {
          result = { id: ++next, app: { slug: 'github-actions' }, name: body.name, head_sha: body.head_sha, status: body.status, output: {}, rows: [] };
          checks[result.id] = result;
        } else {
          const match = parsed.pathname.match(/\\/check-runs\\/(\\d+)(?:\\/(annotations))?$/); if (!match) throw new Error('bad URL');
          const check = checks[match[1]]; if (!check) throw new Error('unknown check');
          if (method === 'PATCH') {
            if (body.output) {
              if (body.output.annotations) check.rows.push(...body.output.annotations);
              for (const key of ['title','summary','text']) if (body.output[key] !== undefined) check.output[key] = body.output[key];
            }
            for (const key of ['status','conclusion']) if (body[key] !== undefined) check[key] = body[key];
            result = { id: check.id };
          } else {
            const page = Number(parsed.searchParams.get('page')); result = check.rows.slice((page-1)*100,page*100);
          }
        }
        return new Response(JSON.stringify(result), { status: 200 });
      };
      process.on('exit', () => writeFileSync(process.env.DMR_FAKE_STATE, JSON.stringify(checks)));`);
    writeFileSync(fakeGh, `#!/usr/bin/env node
      const fs = require('node:fs'); const args = process.argv.slice(2);
      if (args[0] === 'repo') { console.log(JSON.stringify({ nameWithOwner: 'test/repo' })); process.exit(0); }
      const state = JSON.parse(fs.readFileSync(process.env.DMR_FAKE_STATE));
      const m = args[1].match(/check-runs\\/(\\d+)(?:\\/annotations\\?per_page=100&page=(\\d+))?$/);
      if (!m || !state[m[1]]) process.exit(2);
      const check = state[m[1]]; const page = Number(m[2]);
      console.log(JSON.stringify(m[2] ? check.rows.slice((page-1)*100,page*100) : check));`, { mode: 0o755 });
    const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const env = { ...process.env, GITHUB_ACTIONS: "true", GH_TOKEN: "synthetic-only", GITHUB_REPOSITORY: "test/repo",
      DMR_FAKE_STATE: state, NODE_OPTIONS: `--import=${mock}` };
    const published = execFileSync(process.execPath, ["scripts/publish-a11y-evidence.mjs", dir, "ios-safari"], { encoding: "utf8", env });
    assert.match(published, /in 2 part\(s\)/);
    const checks = JSON.parse(readFileSync(state));
    const rootId = Object.values(checks).find(check => check.name === "Accessibility evidence (ios-safari)").id;
    const readEnv = { ...process.env, DMR_FAKE_STATE: state, PATH: `${dir}:${process.env.PATH}` };
    delete readEnv.NODE_OPTIONS;
    execFileSync(process.execPath, ["scripts/read-a11y-evidence.mjs", String(rootId), output, revision, currentHead], { encoding: "utf8", env: readEnv });
    const receipt = JSON.parse(readFileSync(output));
    assert.deepEqual(receipt.summary.failures, payload.summary.failures);
    assert.equal(receipt.scans[0].assistiveEvidence.screenshots[0].data, payload.screenshots[0].data);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("historical iOS diagnostics keep only bounded transport errors from that step", () => {
  const log = [
    "Native iOS Safari\tNative iOS Safari on installed iPhone Simulator\t2026-11-01T03:00:00Z Error: unrelated native step",
    "Native iOS Safari\tPublish native iOS Safari evidence\t2026-11-01T03:02:00Z AssertionError [ERR_ASSERTION]: Evidence exceeds Checks API budget",
    "Native iOS Safari\tPublish native iOS Safari evidence\t2026-11-01T03:02:01Z Error: GH_TOKEN is secret",
    "Native iOS Safari\tUpload native iOS evidence\t2026-11-01T03:03:00Z Error: unrelated upload step",
  ].join("\n");
  assert.equal(iosTransportErrorExcerpt(log), "AssertionError [ERR_ASSERTION]: Evidence exceeds Checks API budget");
  assert.ok(iosTransportErrorExcerpt(log.repeat(1000)).length <= 3200);
});

test("historical app-shell diagnostics identify the step without copying arbitrary logs", () => {
  const log = [
    "app-shell\tRecover previous successful accessibility evidence\t2026-11-01T03:02:00Z No previous successful CI run to recover",
    "app-shell\tRecover previous successful accessibility evidence\t2026-11-01T03:02:01Z ##[error]Process completed with exit code 1.",
    "app-shell\tRecover previous successful accessibility evidence\t2026-11-01T03:02:02Z unrelated sensitive-looking text",
  ].join("\n");
  const excerpt = appShellFailureExcerpt(log);
  assert.match(excerpt, /Recover previous successful accessibility evidence: No previous successful CI run to recover/);
  assert.match(excerpt, /Process completed with exit code 1/);
  assert.doesNotMatch(excerpt, /sensitive-looking/);
});

test("optional recovery does not fail when no previous successful CI run exists", {
  skip: process.platform === "win32" ? "This CLI fixture uses a POSIX gh shim" : false,
}, () => {
  const dir = mkdtempSync(join(tmpdir(), "dmr-no-success-history-"));
  try {
    writeFileSync(join(dir, "gh"), '#!/bin/sh\nprintf "[]\\n"\n', { mode: 0o755 });
    const stdout = execFileSync("python3", ["scripts/recover-a11y-evidence.py"], { encoding: "utf8",
      env: { ...process.env, GITHUB_HEAD_REF: "new-branch", PATH: `${dir}:${process.env.PATH}` } });
    assert.match(stdout, /No previous successful CI run to recover; no historical evidence claimed/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("historical diagnostic reports only an earlier failed publication, never the current head", {
  skip: process.platform === "win32" ? "This CLI fixture uses a POSIX gh shim" : false,
}, () => {
  const dir = mkdtempSync(join(tmpdir(), "dmr-ios-history-"));
  try {
    const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    writeFileSync(join(dir, "gh"), `#!/usr/bin/env node
      const a = process.argv.slice(2);
      if (a[1] === 'list') console.log(JSON.stringify([{databaseId: 11, headSha: '${currentHead}', url: 'https://github.com/test/repo/actions/runs/11'}, {databaseId: 22, headSha: '${revision}', url: 'https://github.com/test/repo/actions/runs/22'}]));
      else if (a[2] === '11') process.exit(7);
      else if (a.includes('--json')) console.log(JSON.stringify({jobs:[{name:'Native iOS Safari',databaseId:33,steps:[
        {name:'Native iOS Safari on installed iPhone Simulator',conclusion:'success'},
        {name:'Publish native iOS Safari evidence',conclusion:'failure'}]}]}));
      else console.log('Native iOS Safari\\tPublish native iOS Safari evidence\\t2026-11-01T03:02:00Z AssertionError: Evidence exceeds Checks API budget');`, { mode: 0o755 });
    const stdout = execFileSync(process.execPath, ["scripts/recover-ios-transport-history.mjs"], { encoding: "utf8",
      env: { ...process.env, GITHUB_HEAD_REF: "test-branch", PATH: `${dir}:${process.env.PATH}` } });
    assert.match(stdout, new RegExp(`Prior SHA ${revision}`));
    assert.match(stdout, /native step passed, publication step failed/);
    assert.match(stdout, /AssertionError: Evidence exceeds Checks API budget/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("publisher errors before check creation are visible in workflow annotations", () => {
  let error;
  try {
    execFileSync(process.execPath, ["scripts/publish-a11y-evidence.mjs", "missing-evidence-directory", "ios-safari"], {
      encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "true" }, stdio: "pipe",
    });
  } catch (caught) { error = caught; }
  assert.ok(error);
  assert.match(error.stderr, /::error title=Browser audit::Evidence transport \(ios-safari\).*ENOENT/);
});
