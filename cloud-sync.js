(function () {
  "use strict";
  if (window.DND_CLOUD_DISABLED) return;
  const config = window.DND_CLOUD_CONFIG;
  const core = window.DND_CLOUD_CORE;
  const read = () => window.DND_ITEM_DATA.snapshot(managerState, state, "full");
  const statusText = {
    local: "未登录 · 保存在本机", connecting: "正在连接账号…", syncing: "正在同步…",
    pending: "本机已保存 · 等待上传", synced: "云端已同步", empty: "账号暂无存档 · 请选择导入来源",
    conflict: "有版本冲突 · 请选择保留版本", editing: "请先完成当前编辑，再读取云端版本", error: "同步未完成 · 本机副本已保留"
  };
  let engine, client, timer, busy = false, staged = null, authEpoch = 0;
  const accountButton = document.createElement("button");
  accountButton.type = "button";
  accountButton.className = "cloud-account-button";
  accountButton.dataset.openCloud = "";
  accountButton.innerHTML = '账号与云端存档<span data-cloud-status>未登录 · 保存在本机</span>';
  document.body.append(accountButton);
  const dialog = document.createElement("dialog");
  dialog.className = "manager-dialog cloud-dialog";
  dialog.id = "cloudDialog";
  dialog.setAttribute("aria-labelledby", "cloudTitle");
  dialog.innerHTML = `<div class="dialog-heading"><div><p>CLOUD SAVE</p><h2 id="cloudTitle">账号与云端存档</h2></div><button type="button" data-cloud-close aria-label="关闭账号面板">×</button></div>
    <p>同一账号可在多台设备读取角色。存档仅本人可读写，角色修改会自动同步。</p>
    <p id="cloudStatus" class="cloud-status" role="status" aria-live="polite">正在初始化…</p>
    <form id="cloudAuthForm"><label>邮箱<input name="email" type="email" autocomplete="email" required maxlength="254" /></label>
      <label>密码<input name="password" type="password" autocomplete="current-password" required minlength="6" maxlength="128" /></label>
      <menu><button type="submit" class="primary-button">登录</button><button type="button" class="ghost-button" id="cloudSignUp">注册账号</button></menu>
      <p>首次注册后，请先点击邮箱中的确认链接，再回来登录。</p></form>
    <section id="cloudSignedIn" hidden><p id="cloudIdentity"></p>
      <div class="cloud-actions"><button type="button" class="primary-button" id="cloudSyncNow">立即同步</button><button type="button" class="ghost-button" id="cloudSignOut">退出账号</button></div>
      <section id="cloudConflict" class="cloud-conflict" hidden><h3>两个设备保存了不同版本</h3><p id="cloudConflictSummary"></p><p>两份内容已保留为本机备份。选择后，其他设备将读取你保留的版本。</p><div class="cloud-actions"><button class="ghost-button" type="button" id="cloudUseRemote">使用云端版本</button><button class="ghost-button" type="button" id="cloudUseLocal">保留本机版本</button></div></section>
      <details id="cloudImportSection"><summary>导入已有完整存档</summary><p>导入前会保留当前内容的副本。请检查预览，再确认写入本账号。</p>
        <div class="cloud-actions"><button type="button" class="ghost-button" id="cloudImportDevice">使用当前本机存档</button><button type="button" class="ghost-button" id="cloudImportGit">读取此前 Git 备份</button></div>
        <label>或选择完整存档 JSON<input type="file" id="cloudImportFile" accept=".json,application/json" /></label></details>
      <section id="cloudImportPreview" hidden><h3>核对导入内容</h3><p id="cloudImportSummary"></p><div class="cloud-actions"><button type="button" class="ghost-button" id="cloudCancelImport">取消</button><button type="button" class="primary-button" id="cloudConfirmImport">确认导入并同步</button></div></section>
    </section>
    <p id="cloudMessage" role="status" aria-live="polite"></p>
    <menu><button type="button" class="ghost-button" id="cloudDownload">下载当前存档</button><button type="button" class="ghost-button" id="cloudDownloadBackups">下载保留的副本</button><button type="button" class="ghost-button" data-cloud-close>关闭</button></menu>`;
  document.body.append(dialog);
  const $ = (selector) => dialog.querySelector(selector);
  const message = (text) => { $("#cloudMessage").textContent = text; };
  const summary = (snapshot) => {
    const { manager: m, state: s } = snapshot.payload;
    return `${m.level} 级 · 生命 ${s.hp}/${s.maxHp} · 背包 ${m.inventory.length} 项 · 法术书 ${m.spellbook.length} 项`;
  };
  function update() {
    if (!engine) return;
    const text = statusText[engine.status] || engine.status;
    document.querySelectorAll("[data-cloud-status]").forEach((el) => { el.textContent = text; });
    $("#cloudStatus").textContent = text + (engine.entry?.revision ? ` · 版本 ${engine.entry.revision}` : "");
    $("#cloudAuthForm").hidden = !!engine.user;
    $("#cloudSignedIn").hidden = !engine.user;
    $("#cloudIdentity").textContent = engine.user ? `已登录：${engine.user.email || "当前账号"}` : "";
    $("#cloudConflict").hidden = !engine.entry?.conflict;
    if (engine.entry?.conflict) {
      const row = engine.entry.conflict.row;
      $("#cloudConflictSummary").textContent = `本机：${summary(engine.entry.snapshot)}；云端：${row ? summary(row.snapshot) + `（版本 ${row.revision}）` : "无存档"}。`;
      $("#cloudUseRemote").disabled = !row || busy;
    }
    $("#cloudImportSection").hidden = !!engine.entry?.conflict;
    if (engine.status === "empty") $("#cloudImportSection").open = true;
    if (engine.error) message(`暂时无法完成同步：${engine.error}。可检查网络后点击“立即同步”。`);
  }
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function clearStaged() { staged = null; $("#cloudImportPreview").hidden = true; $("#cloudImportFile").value = ""; }
  function stage(snapshot, source) {
    staged = { snapshot: core.validate(snapshot), userId: engine.user?.id };
    $("#cloudImportSummary").textContent = `${source}：${summary(staged.snapshot)}。确认后将替换当前角色并同步到此账号。`;
    $("#cloudImportPreview").hidden = false;
  }
  async function action(fn) {
    if (busy) return;
    busy = true;
    dialog.querySelectorAll("button:not([data-cloud-close])").forEach((button) => { button.disabled = true; });
    message("");
    try { await fn(); } catch (error) { message(error.message || "操作失败，请稍后重试。"); }
    finally {
      busy = false;
      dialog.querySelectorAll("button").forEach((button) => { button.disabled = false; });
      update();
    }
  }
  function apply(snapshot) {
    const checked = core.validate(snapshot);
    if ([...document.querySelectorAll("dialog[open]")].some((el) => el !== dialog && el.id !== "settingsDialog")) {
      throw new Error("请先完成或关闭正在编辑的面板，再同步云端存档");
    }
    const old = read();
    // Journal both keys before changing either; recover on the next load if interrupted.
    localStorage.setItem("dndcard-cloud-restore-journal", JSON.stringify(old));
    try {
      localStorage.setItem("gandalf-5e-manager", JSON.stringify(checked.payload.manager));
      localStorage.setItem("gandalf-5e-state", JSON.stringify(checked.payload.state));
    } catch (error) {
      localStorage.setItem("gandalf-5e-manager", JSON.stringify(old.payload.manager));
      localStorage.setItem("gandalf-5e-state", JSON.stringify(old.payload.state));
      throw error;
    }
    managerState = structuredClone(checked.payload.manager);
    state = structuredClone(checked.payload.state);
    localStorage.removeItem("dndcard-cloud-restore-journal");
    document.querySelectorAll("dialog[open]").forEach((el) => { if (el !== dialog && el.id !== "settingsDialog") el.close(); });
    syncCharacterSheet(); renderSpellManager(); renderInventoryManager(); renderFeatManager(); renderPortalRoute();
  }
  async function request(userId, path, body) {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session || data.session.user.id !== userId) throw new Error("登录状态已变化，请重新登录。");
    // Capture this account's token so a later account switch cannot retarget an in-flight save.
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
      method: body ? "POST" : "GET",
      headers: { apikey: config.publishableKey, Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `请求失败（${response.status}）`);
    return result;
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => engine?.sync(), 1200);
  }
  function locked() {
    const overlay = document.createElement("div"); overlay.className = "cloud-lock";
    overlay.innerHTML = "<h2>角色卡已在另一个标签页打开</h2><p>请在原标签页继续编辑。关闭原标签页后，刷新此页即可继续。</p>";
    for (const el of document.body.children) if (el.tagName !== "SCRIPT") el.inert = true;
    document.body.append(overlay);
  }
  async function start() {
    try {
      if (!config || !core || !window.DND_SUPABASE) throw new Error("云端组件未加载，请刷新网页。");
      const journal = localStorage.getItem("dndcard-cloud-restore-journal");
      if (journal) {
        const recovered = core.validate(JSON.parse(journal));
        localStorage.setItem("gandalf-5e-manager", JSON.stringify(recovered.payload.manager));
        localStorage.setItem("gandalf-5e-state", JSON.stringify(recovered.payload.state));
        managerState = structuredClone(recovered.payload.manager);
        state = structuredClone(recovered.payload.state);
        localStorage.removeItem("dndcard-cloud-restore-journal");
        syncCharacterSheet(); renderSpellManager(); renderInventoryManager(); renderFeatManager(); renderPortalRoute();
      }
      client = window.DND_SUPABASE.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        global: { fetch: (url, options) => fetch(url, { ...options, signal: options?.signal || AbortSignal.timeout(15000) }) }
      });
      engine = new core.SyncEngine({ storage: localStorage, read, apply, notify: update,
        canApply: () => ![...document.querySelectorAll("dialog[open]")].some((el) => el !== dialog && el.id !== "settingsDialog"), remote: {
        async load(userId) {
          const rows = await request(userId, `character_saves?select=*&user_id=eq.${encodeURIComponent(userId)}&character_id=eq.${encodeURIComponent(config.characterId)}`);
          return rows[0] || null;
        },
        save(userId, revision, snapshot) {
          return request(userId, "rpc/save_character", { p_character_id: config.characterId, p_expected_revision: revision, p_snapshot: snapshot });
        }
      } });
      window.addEventListener("dndcard:local-save", () => {
        try { engine.capture(); schedule(); } catch (error) { engine.report("error", error.message); }
      });
      client.auth.onAuthStateChange((_event, session) => {
        const sequence = ++authEpoch;
        // Supabase callbacks must return before any further auth/database operation.
        setTimeout(() => {
          if (sequence !== authEpoch) return;
          if (engine.user?.id !== session?.user?.id) clearStaged();
          engine.setUser(session?.user || null).catch((error) => engine.report("error", error.message));
        }, 0);
      });
      window.addEventListener("online", () => engine.sync());
      window.addEventListener("focus", () => engine.sync());
      if (!navigator.locks) window.addEventListener("storage", (event) => {
        if (!event.key?.startsWith("dndcard-cloud-v1:") || event.key.includes(":backup:")) return;
        // Fallback for browsers without Web Locks: stop when another tab changes shared state.
        engine.epoch += 1; engine.user = null;
        engine.backup(read(), "another-tab-active");
        locked();
      }, { once: true });
      setInterval(() => { if (!document.hidden && navigator.onLine) engine.sync(); }, 15000);
      update();
    } catch (error) { message(error.message); $("#cloudStatus").textContent = "云端暂不可用 · 可继续本地编辑"; }
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-cloud]")) { update(); if (!dialog.open) dialog.showModal(); }
  });
  dialog.querySelectorAll("[data-cloud-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("close", () => { $("[name=password]").value = ""; clearStaged(); });
  $("#cloudAuthForm").addEventListener("submit", (event) => {
    event.preventDefault(); action(async () => {
      if (!client) throw new Error("账号服务尚未就绪，请刷新后重试。");
      const { error } = await client.auth.signInWithPassword({ email: $("[name=email]").value.trim(), password: $("[name=password]").value });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "邮箱或密码不正确。" : error.message);
      $("[name=password]").value = "";
    });
  });
  $("#cloudSignUp").addEventListener("click", () => {
    if (!$("#cloudAuthForm").reportValidity()) return;
    action(async () => {
      if (!client) throw new Error("账号服务尚未就绪，请刷新后重试。");
      const { error } = await client.auth.signUp({ email: $("[name=email]").value.trim(), password: $("[name=password]").value,
        options: { emailRedirectTo: config.redirectUrl } });
      if (error) throw error;
      $("[name=password]").value = "";
      message("注册请求已提交。请检查邮箱中的确认邮件；若已注册，可直接登录。");
    });
  });
  $("#cloudSignOut").addEventListener("click", () => action(async () => {
    // Pending snapshots are already durable and stay scoped to the old account.
    engine.capture();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
    await engine.setUser(null); clearStaged();
  }));
  $("#cloudSyncNow").addEventListener("click", () => action(() => engine.sync()));
  $("#cloudImportDevice").addEventListener("click", () => action(() => stage(read(), "当前本机存档")));
  $("#cloudImportGit").addEventListener("click", () => action(async () => {
    const userId = engine.user?.id;
    const response = await fetch(config.seedUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("暂时无法读取 Git 备份，可改为选择 JSON 文件。");
    const snapshot = await response.json();
    if (engine.user?.id !== userId) return;
    stage(snapshot, "2026-09-13 Git 完整备份");
  }));
  $("#cloudImportFile").addEventListener("change", () => action(async () => {
    const file = $("#cloudImportFile").files[0], userId = engine.user?.id;
    if (!file) return;
    if (file.size > 1900000) throw new Error("请选择小于 1.9 MB 的完整存档。");
    const snapshot = JSON.parse(await file.text());
    if (engine.user?.id === userId) stage(snapshot, file.name);
  }));
  $("#cloudCancelImport").addEventListener("click", clearStaged);
  $("#cloudConfirmImport").addEventListener("click", () => action(async () => {
    if (!staged || staged.userId !== engine.user?.id) throw new Error("账号或预览已变化，请重新选择存档。");
    const snapshot = staged.snapshot; clearStaged(); await engine.importSnapshot(snapshot);
  }));
  $("#cloudUseRemote").addEventListener("click", () => action(() => engine.resolve("cloud")));
  $("#cloudUseLocal").addEventListener("click", () => action(() => engine.resolve("local")));
  $("#cloudDownload").addEventListener("click", () => download(read(), `dndcard-full-${Date.now()}.json`));
  $("#cloudDownloadBackups").addEventListener("click", () => action(() => {
    const backups = engine?.backups() || [];
    if (!backups.length) { message("当前账号尚无替换或冲突副本。"); return; }
    download({ format: "dndcard-backup-bundle", version: 1, backups }, `dndcard-backups-${Date.now()}.json`);
    message("副本包已下载，每条记录中的 snapshot 可另存为完整存档 JSON 后导入。");
  }));
  if (navigator.locks) navigator.locks.request("dndcard-character-editor", { ifAvailable: true }, async (lock) => {
    if (!lock) { locked(); return; }
    await start();
    await new Promise(() => {});
  }).catch((error) => message(error.message));
  else start();
})();
