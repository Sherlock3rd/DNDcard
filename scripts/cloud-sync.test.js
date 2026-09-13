const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");
const { SyncEngine, validate, equal } = require("../cloud-sync-core");
const fixture = JSON.parse(fs.readFileSync("data/submissions/dndcard-full-2026-09-13T09-24-23-961Z-dfedf04c.json", "utf8"));
const clone = (value) => structuredClone(value);
class MemoryStorage {
  map = new Map();
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { this.map.set(key, value); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index]; }
  get length() { return this.map.size; }
}
function server() {
  const rows = new Map(), history = [], calls = [];
  let offline = false, hold;
  return {
    rows, history, calls,
    set offline(value) { offline = value; },
    holdSave(promise) { hold = promise; },
    async load(user) { if (offline) throw new Error("offline"); return clone(rows.get(user) || null); },
    async save(user, revision, snapshot) {
      calls.push({ user, revision });
      if (hold) { const pending = hold; hold = null; await pending; }
      if (offline) throw new Error("offline");
      const old = rows.get(user);
      if ((old?.revision || 0) !== revision) return { status: "conflict", row: clone(old || null) };
      if (old) history.push(clone(old));
      const row = { user_id: user, character_id: "gandalf", revision: revision + 1, snapshot: clone(snapshot), updated_at: new Date().toISOString() };
      rows.set(user, row);
      return { status: "saved", row: clone(row) };
    }
  };
}
function device(remote, storage = new MemoryStorage(), initial = fixture) {
  let current = clone(initial);
  const engine = new SyncEngine({ storage, remote, read: () => clone(current), apply: (next) => { current = clone(next); } });
  return { engine, storage, read: () => clone(current), edit(hp) { current.payload.state.hp = hp; engine.capture(); } };
}
const user = (id) => ({ id, email: `${id}@example.test` });
const waitFor = async (predicate) => {
  for (let n = 0; n < 60; n++) { if (predicate()) return; await new Promise((resolve) => setTimeout(resolve, 5)); }
  throw new Error("Timed out");
};

test("snapshot validation rejects partial, oversized and dangerous data, retains unknown character fields", () => {
  assert.deepEqual(validate(fixture), fixture);
  for (const modify of [s => { s.scope = "items"; }, s => { delete s.payload.state; }, s => { delete s.payload.manager.spellbook; }, s => { s.payload.manager.inventory = [null]; }, s => { s.payload.manager.level = 99; }, s => { s.extra = "x".repeat(2000000); }]) {
    const s = clone(fixture); modify(s); assert.throws(() => validate(s));
  }
  const injected = JSON.parse(JSON.stringify(fixture).replace('"payload":', '"__proto__": {}, "payload":'));
  assert.throws(() => validate(injected));
  const s = clone(fixture); s.payload.manager.userExtension = { keep: true };
  assert.deepEqual(validate(s).payload.manager.userExtension, { keep: true });
});

test("first login waits for explicit import; second device loads complete save without uploading its defaults", async () => {
  const remote = server(), a = device(remote), b = device(remote);
  await a.engine.setUser(user("a"));
  assert.equal(a.engine.status, "empty"); assert.equal(remote.calls.length, 0);
  await a.engine.importSnapshot(fixture);
  assert.equal(remote.rows.get("a").revision, 1);
  b.edit(1); await b.engine.setUser(user("a"));
  assert.ok(equal(b.read(), fixture)); assert.equal(remote.calls.length, 1);
  assert.equal(JSON.parse(b.storage.getItem("dndcard-cloud-v1:guest")).payload.state.hp, 1);
  a.edit(9); await a.engine.sync(); await b.engine.sync();
  assert.equal(b.read().payload.state.hp, 9);
  assert.equal(remote.history.length, 1);
});

test("offline dirty save survives refresh, reconnect uploads it, unknown fields preserved", async () => {
  const remote = server(), a = device(remote);
  const custom = clone(fixture); custom.payload.manager.userExtension = "keep";
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(custom);
  remote.offline = true; a.edit(7); await a.engine.sync(); assert.equal(a.engine.status, "error");
  const refreshed = device(remote, a.storage, a.read());
  await refreshed.engine.setUser(user("a"));
  assert.equal(refreshed.read().payload.state.hp, 7);
  remote.offline = false; await refreshed.engine.sync();
  assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 7);
  assert.equal(remote.rows.get("a").snapshot.payload.manager.userExtension, "keep");
});

test("two device conflicts preserve both versions, remote choice works and conflict metadata survives refresh", async () => {
  const remote = server(), a = device(remote), b = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture); await b.engine.setUser(user("a"));
  a.edit(6); b.edit(3); await a.engine.sync(); await b.engine.sync();
  assert.equal(b.engine.status, "conflict"); assert.equal(b.read().payload.state.hp, 3);
  assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 6);
  const refreshed = device(remote, b.storage, b.read()); await refreshed.engine.setUser(user("a"));
  assert.equal(refreshed.engine.status, "conflict");
  await refreshed.engine.resolve("cloud");
  assert.equal(refreshed.read().payload.state.hp, 6); assert.equal(refreshed.engine.entry.dirty, false);
  assert.ok(refreshed.engine.backups().some((b) => b.snapshot.payload.state.hp === 3));
});

test("keeping local uses fresh compare-and-swap and re-prompts if cloud changed again", async () => {
  const remote = server(), a = device(remote), b = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture); await b.engine.setUser(user("a"));
  a.edit(6); b.edit(3); await a.engine.sync(); await b.engine.sync();
  a.edit(8); await a.engine.sync(); await b.engine.resolve("local");
  assert.equal(b.engine.status, "conflict"); assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 8);
  await b.engine.resolve("local"); assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 3);
});

test("switching accounts never uploads the prior account data, guest state restored on signout", async () => {
  const remote = server(), a = device(remote);
  a.edit(12); await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture);
  a.edit(5); remote.offline = true; await a.engine.sync();
  await a.engine.setUser(user("b"));
  assert.equal(a.read().payload.state.hp, 12);
  remote.offline = false; await a.engine.sync();
  assert.equal(remote.rows.has("b"), false);
  await a.engine.setUser(user("a"));
  assert.equal(a.read().payload.state.hp, 5); assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 5);
  await a.engine.setUser(null); assert.equal(a.read().payload.state.hp, 12);
});

test("edits during upload remain dirty and get the next revision", async () => {
  const remote = server(), a = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture);
  let release; remote.holdSave(new Promise((resolve) => { release = resolve; }));
  a.edit(4); const syncing = a.engine.sync(); await waitFor(() => remote.calls.length === 2);
  a.edit(2); release(); await syncing;
  assert.equal(a.engine.entry.dirty, true); assert.equal(a.engine.entry.revision, 2);
  await a.engine.sync(); assert.equal(remote.rows.get("a").snapshot.payload.state.hp, 2);
  assert.equal(a.engine.entry.dirty, false);
});

test("in-flight old account response cannot update the new account or guest", async () => {
  const remote = server(), a = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture);
  let release; remote.holdSave(new Promise((resolve) => { release = resolve; }));
  a.edit(4); const syncing = a.engine.sync(); await waitFor(() => remote.calls.length === 2);
  const switching = a.engine.setUser(user("b")); release(); await syncing; await switching;
  assert.equal(a.engine.owner, "b"); assert.equal(remote.rows.has("b"), false);
  assert.equal(a.engine.status, "empty"); assert.ok(equal(a.read(), fixture));
});

test("storage quota error blocks replacement; corrupted metadata is not silently reset", async () => {
  const remote = server(), a = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture);
  const before = a.read(); a.storage.setItem = () => { throw new Error("quota"); };
  const changed = clone(fixture); changed.payload.state.hp = 0;
  await a.engine.importSnapshot(changed);
  assert.equal(a.engine.status, "error"); assert.ok(equal(a.read(), before));
  const storage = new MemoryStorage(); storage.setItem("dndcard-cloud-v1:owner", "corrupt");
  assert.throws(() => device(remote, storage));
});

test("remote refresh and account switch wait for open editor drafts", async () => {
  const remote = server(), a = device(remote), b = device(remote);
  await a.engine.setUser(user("a")); await a.engine.importSnapshot(fixture); await b.engine.setUser(user("a"));
  b.engine.canApply = () => false;
  a.edit(2); await a.engine.sync(); await b.engine.sync();
  assert.equal(b.engine.status, "editing"); assert.ok(equal(b.read(), fixture));
  await b.engine.setUser(user("b")); assert.equal(b.engine.owner, "a");
  b.engine.canApply = () => true; await b.engine.sync();
  assert.equal(b.engine.owner, "b"); assert.equal(b.engine.status, "empty");
  assert.equal(remote.rows.has("b"), false);
});

test("real page login/import UI is isolated, import waits for confirmation, local saves trigger upload", async () => {
  const html = fs.readFileSync("index.html", "utf8");
  const dom = new JSDOM(html, { url: "https://example.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window, errors = [], remote = server();
  let authCallback, session = null;
  Object.assign(w, { structuredClone, TextEncoder, AbortSignal });
  w.scrollTo = () => {}; w.IntersectionObserver = class { observe() {} };
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event("close")); };
  w.URL.createObjectURL = () => "blob:test"; w.URL.revokeObjectURL = () => {};
  w.addEventListener("error", (event) => errors.push(event.error));
  w.DND_SUPABASE = { createClient: () => ({ auth: {
    onAuthStateChange(cb) { authCallback = cb; cb("INITIAL_SESSION", null); },
    async getSession() { return { data: { session } }; },
    async signInWithPassword() { session = { user: user("a"), access_token: "test-a" }; authCallback("SIGNED_IN", session); return {}; },
    async signOut() { session = null; authCallback("SIGNED_OUT", null); return {}; }
  } }) };
  w.fetch = async (url, options) => {
    if (url.startsWith("./data/")) return { ok: true, json: async () => clone(fixture) };
    assert.equal(options.headers.Authorization, "Bearer test-a");
    if (url.includes("rpc/")) {
      const body = JSON.parse(options.body);
      return { ok: true, json: () => remote.save("a", body.p_expected_revision, body.p_snapshot) };
    }
    return { ok: true, json: async () => { const row = await remote.load("a"); return row ? [row] : []; } };
  };
  try {
    const scripts = [...html.matchAll(/<script src="\.\/([^"?]+)[^"]*"/g)].map((match) => match[1]);
    for (const file of scripts.filter((s) => !s.startsWith("assets/vendor/"))) vm.runInContext(fs.readFileSync(file, "utf8"), dom.getInternalVMContext(), { filename: file });
    const $ = (s) => w.document.querySelector(s);
    $("[data-open-cloud]").click(); assert.equal($("#cloudDialog").open, true);
    $("#cloudAuthForm [name=email]").value = "a@example.test"; $("#cloudAuthForm [name=password]").value = "password";
    $("#cloudAuthForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    await waitFor(() => $("#cloudStatus").textContent.includes("暂无存档"));
    $("#cloudImportGit").click(); await waitFor(() => !$("#cloudImportPreview").hidden);
    assert.equal(remote.rows.size, 0);
    $("#cloudCancelImport").click(); assert.equal(remote.rows.size, 0);
    $("#cloudImportGit").click(); await waitFor(() => !$("#cloudImportPreview").hidden);
    $("#cloudConfirmImport").click(); await waitFor(() => remote.rows.has("a"));
    assert.equal(vm.runInContext("managerState.level", dom.getInternalVMContext()), 4);
    vm.runInContext("state.hp = 3; saveState();", dom.getInternalVMContext());
    $("#cloudSyncNow").click(); await waitFor(() => remote.rows.get("a").snapshot.payload.state.hp === 3);
    assert.deepEqual(errors, []);
  } finally { w.close(); }
});
