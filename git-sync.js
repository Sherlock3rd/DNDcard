(function () {
  const uploadUrl = "https://github.com/Sherlock3rd/DNDcard/upload/main/data/submissions";
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-git-sync]")) openGitSync();
  });
  function openGitSync() {
    if(window.ADVENTURE_ARCHIVE){window.ADVENTURE_ARCHIVE.open();return;}
    const dialog = document.querySelector("#gitSyncDialog");
    dialog.innerHTML = `<form method="dialog">
      <div class="dialog-heading"><div><p>GIT SNAPSHOT</p><h2>同步回填到 Git</h2></div><button type="button" data-close-sync aria-label="关闭">×</button></div>
      <p>先导出本浏览器的数据副本，再前往 GitHub 上传并提交。这里不会清空存档，也不会自动覆盖角色默认数据。</p>
      <div class="editor-grid"><label class="wide">导出范围<select id="gitSyncScope"><option value="items">物品资料与背包（含图片类型、说明、备注、数量、装备状态）</option><option value="full">完整角色存档（含等级、专长、法术、物品与战斗状态）</option></select></label></div>
      <p class="item-form-hint">目标：Sherlock3rd/DNDcard · main · data/submissions<br>这是公开仓库。提交后所选数据可被公开查看；请勿写入账号、密码或私人信息。</p>
      <p id="gitSyncSummary"></p>
      <details><summary>预览即将导出的 JSON</summary><pre class="git-snapshot-preview" id="gitSyncPreview"></pre></details>
      <label class="git-sync-consent"><input id="gitSyncConsent" type="checkbox" /> 我已检查内容，同意将所选数据提交到公开仓库</label>
      <p>在 GitHub 登录有写入权限的账号，选择下载的 JSON 文件，再点 Commit changes。完成前，这里不会显示“上传成功”。存入仓库的是备份 / 回填材料，不会自动导入到其他设备。</p>
      <p id="gitSyncStatus" role="status"></p>
      <menu><button class="ghost-button" type="button" data-close-sync>关闭</button><button class="ghost-button" id="downloadGitSnapshot" type="button">仅下载备份</button><button class="primary-button" id="startGitUpload" type="button" disabled>发起上传</button></menu>
      <a id="gitUploadFallback" href="${uploadUrl}" target="_blank" rel="noopener noreferrer" hidden>重新打开 GitHub 上传页</a>
    </form>`;
    let objectUrl;
    let filename;
    const consent = dialog.querySelector("#gitSyncConsent");
    const upload = dialog.querySelector("#startGitUpload");
    const refresh = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const scope = dialog.querySelector("#gitSyncScope").value;
      const snapshot = window.DND_ITEM_DATA.snapshot(managerState, state, scope);
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      objectUrl = URL.createObjectURL(blob);
      filename = `dndcard-${scope}-${snapshot.exportedAt.replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}.json`;
      dialog.querySelector("#gitSyncPreview").textContent = json;
      dialog.querySelector("#gitSyncSummary").textContent = `${filename} · ${(blob.size / 1024).toFixed(1)} KB · 自定义物品 ${managerState.customItems.length} 件，资料修改 ${Object.keys(managerState.itemOverrides).length} 件，背包 ${managerState.inventory.length} 项`;
      consent.checked = false;
      upload.disabled = true;
      consent.disabled = blob.size > 25 * 1024 * 1024;
      dialog.querySelector("#gitSyncStatus").textContent = consent.disabled ? "文件超过 GitHub 网页上传的 25 MiB 上限；请下载后使用 Git 客户端提交。" : "尚未上传。";
      dialog.querySelector("#gitUploadFallback").hidden = true;
    };
    const download = () => {
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    };
    dialog.querySelector("#gitSyncScope").addEventListener("change", refresh);
    consent.addEventListener("change", () => { upload.disabled = !consent.checked || consent.disabled; });
    dialog.querySelector("#downloadGitSnapshot").addEventListener("click", () => {
      download();
      dialog.querySelector("#gitSyncStatus").textContent = "已发起备份下载，请检查下载列表。未上传到 GitHub，本地存档未改变。";
    });
    upload.addEventListener("click", () => {
      if (!consent.checked || consent.disabled) return;
      window.open(uploadUrl, "_blank", "noopener,noreferrer");
      download();
      dialog.querySelector("#gitUploadFallback").hidden = false;
      dialog.querySelector("#gitSyncStatus").textContent = "已发起下载并请求打开 GitHub。请在上传页选中刚下载的 JSON 并提交；若新标签被拦截，请点击下方链接。尚未确认上传完成。";
    });
    dialog.querySelectorAll("[data-close-sync]").forEach((button) => button.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("close", () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, { once: true });
    refresh();
    dialog.showModal();
  }
})();
