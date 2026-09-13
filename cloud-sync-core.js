(function (root) {
  "use strict";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  function validate(snapshot) {
    if (!object(snapshot) || snapshot.format !== "dndcard-snapshot" || snapshot.version !== 1 || snapshot.scope !== "full"
      || !object(snapshot.payload) || !object(snapshot.payload.manager) || !object(snapshot.payload.state)) {
      throw new Error("请选择版本 1 的完整角色存档 JSON（不是物品导出）。");
    }
    const { manager: m, state: s } = snapshot.payload;
    if (!Number.isInteger(m.level) || m.level < 1 || m.level > 20 || !object(m.abilities) || !object(m.coins)
      || !object(m.spellOverrides) || !object(m.itemOverrides)
      || !["spellbook", "prepared", "inventory", "feats", "customSpells", "customItems", "levelHistory"].every((key) => Array.isArray(m[key]))
      || !Array.isArray(s.conditions) || ![s.hp, s.maxHp, s.tempHp, s.slot1, s.slot2, s.bladesongUses].every(Number.isFinite)
      || !m.inventory.every((item) => object(item) && typeof item.id === "string" && Number.isFinite(item.quantity))
      || !m.feats.every(object) || !m.customItems.every(object) || !m.customSpells.every(object)
      || !m.spellbook.every((id) => typeof id === "string") || !m.prepared.every((id) => typeof id === "string")
      || !["STR", "DEX", "CON", "INT", "WIS", "CHA"].every((key) => Number.isFinite(m.abilities[key]))) {
      throw new Error("存档缺少完整的角色或战斗字段，已停止导入。");
    }
    const json = JSON.stringify(snapshot);
    if (new TextEncoder().encode(json).length > 1900000) throw new Error("存档过大，请先下载备份并精简自定义资料。");
    JSON.parse(json, (key, value) => {
      if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("存档包含不安全的字段。");
      return value;
    });
    return clone(snapshot);
  }
  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!object(value)) return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  const equal = (a, b) => JSON.stringify(stable(a?.payload)) === JSON.stringify(stable(b?.payload));
  const prefix = "dndcard-cloud-v1:";

  class SyncEngine {
    constructor({ storage, read, apply, remote, notify = () => {}, canApply = () => true }) {
      Object.assign(this, { storage, read, apply, remote, notify, canApply });
      this.user = null;
      this.owner = this.load("owner", null);
      this.entry = this.owner ? this.load(`account:${this.owner}`, null) : null;
      this.epoch = 0;
      this.queue = Promise.resolve();
      this.status = "local";
      this.capture();
    }
    load(key, fallback) {
      const raw = this.storage.getItem(prefix + key);
      if (raw === null) return fallback;
      // Never silently overwrite malformed local backup metadata.
      return JSON.parse(raw);
    }
    store(key, value) { this.storage.setItem(prefix + key, JSON.stringify(value)); }
    persist() { if (this.owner && this.entry) this.store(`account:${this.owner}`, this.entry); }
    report(status, error = null) { this.status = status; this.error = error; this.notify(this); }
    backup(snapshot, reason) {
      this.store(`backup:${this.owner || "guest"}:${Date.now()}:${Math.random().toString(36).slice(2)}`, {
        reason, snapshot: validate(snapshot), createdAt: new Date().toISOString()
      });
    }
    capture() {
      const snapshot = validate(this.read());
      if (!this.owner) this.store("guest", snapshot);
      else if (this.entry && !equal(snapshot, this.entry.snapshot)) {
        this.entry.snapshot = snapshot;
        if (!this.entry.awaiting) this.entry.dirty = true;
        this.persist();
      }
      if (this.entry?.dirty && !this.entry.conflict) this.report("pending");
    }
    enqueue(task) {
      const epoch = this.epoch;
      const run = this.queue.then(async () => {
        if (epoch !== this.epoch) return;
        try { await task(epoch); }
        catch (error) { if (epoch === this.epoch) this.report("error", error.message); }
      });
      this.queue = run;
      return run;
    }
    setUser(user) {
      if ((this.user?.id || null) === (user?.id || null) && this.owner === (user?.id || null)) return this.sync();
      this.capture();
      this.epoch += 1;
      this.user = user;
      this.report("connecting");
      return this.enqueue(async (epoch) => {
        if (!this.canApply()) { this.report("editing"); return; }
        const guest = this.load("guest", null);
        if (!user) {
          if (guest) this.apply(validate(guest));
          this.owner = null;
          this.entry = null;
          this.store("owner", null);
          this.report("local");
          return;
        }
        const entry = this.load(`account:${user.id}`, null);
        // Keep the pre-login device save separate from every account.
        if (!guest && !this.owner) this.store("guest", validate(this.read()));
        this.owner = user.id;
        this.entry = entry || { revision: 0, dirty: false, awaiting: true, snapshot: guest || validate(this.read()) };
        this.persist();
        this.store("owner", user.id);
        this.apply(validate(this.entry.snapshot));
        await this.reconcile(epoch);
      });
    }
    sync() {
      if (this.owner !== (this.user?.id || null)) return this.setUser(this.user);
      return this.enqueue(async (epoch) => {
        if (!this.user || this.owner !== this.user.id) return;
        await this.reconcile(epoch);
      });
    }
    async reconcile(epoch) {
      const userId = this.user.id;
      this.report("syncing");
      const row = await this.remote.load(userId);
      if (epoch !== this.epoch) return;
      if (row) validate(row.snapshot);
      if (this.entry.conflict) { this.report("conflict"); return; }
      if (this.entry.awaiting) {
        if (row) this.accept(row);
        else this.report("empty");
        return;
      }
      if (this.entry.dirty) {
        if (row && equal(row.snapshot, this.entry.snapshot)) {
          this.entry.revision = row.revision;
          this.entry.dirty = false;
          this.persist();
          this.report("synced");
        } else if ((row?.revision || 0) !== this.entry.revision) this.conflict(row);
        else await this.push(epoch);
      } else if (row) {
        if (row.revision !== this.entry.revision || !equal(row.snapshot, this.entry.snapshot)) this.accept(row);
        else this.report("synced");
      } else if (this.entry.revision > 0) this.conflict(null);
      else this.report("empty");
    }
    accept(row) {
      if (!this.canApply()) { this.report("editing"); return; }
      const snapshot = validate(row.snapshot);
      this.backup(this.read(), "before-cloud-load");
      this.apply(snapshot);
      this.entry = { snapshot, revision: row.revision, dirty: false, awaiting: false, updatedAt: row.updated_at };
      this.persist();
      this.report("synced");
    }
    conflict(row) {
      this.backup(this.entry.snapshot, "local-conflict");
      if (row) this.backup(row.snapshot, "cloud-conflict");
      this.entry.conflict = { row };
      this.persist();
      this.report("conflict");
    }
    async push(epoch) {
      const sent = clone(this.entry.snapshot);
      const userId = this.user.id;
      const result = await this.remote.save(userId, this.entry.revision, sent);
      if (epoch !== this.epoch) return;
      if (result.status === "conflict") { this.conflict(result.row); return; }
      if (result.status !== "saved" || !result.row) throw new Error("云端返回了未知保存结果，保留本地待同步副本。");
      this.entry.revision = result.row.revision;
      this.entry.updatedAt = result.row.updated_at;
      this.entry.dirty = !equal(sent, this.entry.snapshot);
      this.persist();
      this.report(this.entry.dirty ? "pending" : "synced");
    }
    importSnapshot(snapshot) {
      const checked = validate(snapshot);
      return this.enqueue(async (epoch) => {
        if (!this.user || this.owner !== this.user.id) throw new Error("请先登录账号。");
        if (this.entry.conflict) throw new Error("请先处理版本冲突。");
        this.backup(this.read(), "before-import");
        this.apply(checked);
        this.entry.snapshot = checked;
        this.entry.awaiting = false;
        this.entry.dirty = true;
        this.persist();
        await this.reconcile(epoch);
      });
    }
    resolve(choice) {
      return this.enqueue(async (epoch) => {
        if (!this.user || !this.entry?.conflict) return;
        // Re-read: another device may have saved since the conflict dialog opened.
        const row = await this.remote.load(this.user.id);
        if (epoch !== this.epoch) return;
        if (row) validate(row.snapshot);
        const prior = this.entry.conflict.row;
        if ((row?.revision || 0) !== (prior?.revision || 0)) { this.conflict(row); return; }
        this.backup(this.entry.snapshot, "before-conflict-resolution");
        if (row) this.backup(row.snapshot, "before-conflict-resolution-cloud");
        if (choice === "cloud") {
          if (!row) throw new Error("云端存档已不存在，请保留本机版本。");
          this.accept(row);
        } else if (choice === "local") {
          delete this.entry.conflict;
          this.entry.revision = row?.revision || 0;
          this.entry.dirty = true;
          this.entry.awaiting = false;
          this.persist();
          await this.push(epoch);
        }
      });
    }
    backups() {
      const results = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key.startsWith(`${prefix}backup:${this.owner || "guest"}:`)) results.push(JSON.parse(this.storage.getItem(key)));
      }
      return results;
    }
  }
  const api = { SyncEngine, validate, equal };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DND_CLOUD_CORE = api;
})(typeof window === "undefined" ? globalThis : window);
