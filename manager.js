const srdCatalog = window.SRD_CATALOG;

const wizardSlotTable = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

const schoolNames = {
  Abjuration: "防护",
  Conjuration: "咒法",
  Divination: "预言",
  Enchantment: "惑控",
  Evocation: "塑能",
  Illusion: "幻术",
  Necromancy: "死灵",
  Transmutation: "变化",
};

const classNames = {
  Bard: "吟游诗人",
  Cleric: "牧师",
  Druid: "德鲁伊",
  Paladin: "圣武士",
  Ranger: "游侠",
  Sorcerer: "术士",
  Warlock: "邪术师",
  Wizard: "法师",
};

const spellAliases = {
  "fire-bolt": "火焰箭",
  "mage-hand": "法师之手",
  "minor-illusion": "次级幻影",
  "mage-armor": "法师护甲",
  shield: "护盾术",
  "magic-missile": "魔法飞弹",
  "detect-magic": "侦测魔法",
  "find-familiar": "获得魔宠",
  sleep: "睡眠术",
  "misty-step": "迷踪步",
  web: "蛛网术",
  "scorching-ray": "灼热射线",
  invisibility: "隐形术",
};

const initialSpellbook = [
  "fire-bolt",
  "mage-hand",
  "minor-illusion",
  "mage-armor",
  "shield",
  "magic-missile",
  "detect-magic",
  "find-familiar",
  "sleep",
  "misty-step",
  "web",
  "scorching-ray",
  "invisibility",
];

const initialPrepared = [
  "mage-armor",
  "shield",
  "magic-missile",
  "misty-step",
  "web",
  "scorching-ray",
];

const managerDefaults = {
  level: 3,
  abilities: { STR: 9, DEX: 15, CON: 14, INT: 16, WIS: 13, CHA: 11 },
  spellbook: initialSpellbook,
  prepared: initialPrepared,
  customSpells: [],
  spellOverrides: {},
  customItems: [
    {
      id: "custom-item-astrolabe",
      name: "黄铜星盘",
      type: "奥术法器",
      category: "Wonder",
      cost: "",
      weight: 1,
      damage: "",
      armorClass: null,
      properties: ["导师遗物"],
      description: "会在特定星象下自行转动的黄铜星盘。",
      rarity: "Unique",
      magic: true,
      custom: true,
    },
    {
      id: "custom-item-letter",
      name: "导师未写完的信",
      type: "纪念物",
      category: "Document",
      cost: "",
      weight: 0,
      damage: "",
      armorClass: null,
      properties: [],
      description: "信件最后一行停在那个被星历抹去的日期之前。",
      rarity: "Story",
      magic: false,
      custom: true,
    },
  ],
  itemOverrides: {},
  inventory: [
    { id: "equipment-dagger", quantity: 1, equipped: true, notes: "" },
    { id: "equipment-quarterstaff", quantity: 1, equipped: false, notes: "" },
    { id: "equipment-component-pouch", quantity: 1, equipped: true, notes: "" },
    { id: "equipment-spellbook", quantity: 1, equipped: true, notes: "记录 10 个一环及以上法术" },
    { id: "equipment-scholars-pack", quantity: 1, equipped: false, notes: "" },
    { id: "custom-item-astrolabe", quantity: 1, equipped: true, notes: "奥术法器" },
    { id: "custom-item-letter", quantity: 1, equipped: false, notes: "" },
  ],
  levelHistory: [],
};

let managerState = loadManagerState();
let spellView = "prepared";
let inventoryView = "carried";
let spellCatalogLimit = 48;
let itemCatalogLimit = 48;
let spellFilters = { search: "", level: "all", school: "all", className: "all" };
let itemFilters = { search: "", type: "all", rarity: "all" };

function loadManagerState() {
  try {
    const saved = JSON.parse(localStorage.getItem("charlie-5e-manager") || "{}");
    return {
      ...structuredClone(managerDefaults),
      ...saved,
      abilities: { ...managerDefaults.abilities, ...(saved.abilities || {}) },
      spellOverrides: saved.spellOverrides || {},
      itemOverrides: saved.itemOverrides || {},
      customSpells: saved.customSpells || [],
      customItems: saved.customItems || managerDefaults.customItems,
      inventory: saved.inventory || managerDefaults.inventory,
    };
  } catch {
    return structuredClone(managerDefaults);
  }
}

function saveManagerState() {
  localStorage.setItem("charlie-5e-manager", JSON.stringify(managerState));
  saveState();
}

function escapeManagerHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function managerHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function iconStyle(id) {
  const hash = managerHash(id);
  const index = hash % 64;
  const col = index % 8;
  const row = Math.floor(index / 8);
  return `--icon-x:${(col * 100) / 7}%;--icon-y:${(row * 100) / 7}%;--icon-hue:${(hash >>> 6) % 120 - 60}deg`;
}

function abilityModifier(score) {
  return Math.floor((Number(score) - 10) / 2);
}

function proficiencyForLevel(level) {
  return 2 + Math.floor((level - 1) / 4);
}

function maxPreparedSpells() {
  return managerState.level + abilityModifier(managerState.abilities.INT);
}

function preparedLeveledSpellIds() {
  return managerState.prepared.filter((id) => {
    const spell = findManagerSpell(id);
    return spell && spell.level > 0 && managerState.spellbook.includes(id);
  });
}

function maxSpellLevel(level = managerState.level) {
  return Math.min(9, Math.floor((level + 1) / 2));
}

function displaySpellName(spell) {
  const alias = spell.alias || spellAliases[spell.id];
  return alias ? `${alias} · ${spell.name}` : spell.name;
}

function allManagerSpells() {
  const catalog = srdCatalog.spells.map((spell) => ({
    ...spell,
    ...(managerState.spellOverrides[spell.id] || {}),
    custom: false,
  }));
  return [...catalog, ...managerState.customSpells.map((spell) => ({ ...spell, custom: true }))];
}

function allManagerItems() {
  const catalog = srdCatalog.items.map((item) => ({
    ...item,
    ...(managerState.itemOverrides[item.id] || {}),
    custom: false,
  }));
  return [...catalog, ...managerState.customItems.map((item) => ({ ...item, custom: true }))];
}

function findManagerSpell(id) {
  return allManagerSpells().find((spell) => spell.id === id);
}

function findManagerItem(id) {
  return allManagerItems().find((item) => item.id === id);
}

function syncCharacterSheet() {
  const level = managerState.level;
  const proficiency = proficiencyForLevel(level);
  const intMod = abilityModifier(managerState.abilities.INT);
  const wisMod = abilityModifier(managerState.abilities.WIS);

  document.querySelector("#levelLabel").textContent = `法师 ${level}`;
  document.querySelector("#proficiencyValue").textContent = `+${proficiency}`;
  document.querySelector("#proficiencyLevel").textContent = `${level} 级`;
  document.querySelector("#spellAttackValue").textContent = `+${proficiency + intMod}`;
  document.querySelector("#spellDcValue").textContent = 8 + proficiency + intMod;
  document.querySelector("#hpMeta").textContent = `最大 ${state.maxHp} · 生命骰 ${level}d6`;
  document.querySelector("#savingThrowLine").textContent =
    `智力 +${intMod + proficiency}、感知 +${wisMod + proficiency}`;

  abilities.forEach((ability) => {
    const score = managerState.abilities[ability.key];
    const mod = abilityModifier(score);
    ability.score = score;
    ability.mod = mod;
    ability.skills.forEach((skill) => {
      skill.value = mod + (skill.proficient ? proficiency : 0);
    });
  });
  renderAbilities();
  renderManagerSlots();
}

function renderManagerSlots() {
  const slots = wizardSlotTable[managerState.level];
  const maximums = {};
  slots.forEach((max, index) => {
    const key = `slot${index + 1}`;
    maximums[key] = max;
    if (typeof state[key] !== "number") state[key] = max;
    state[key] = Math.min(state[key], max);
  });
  window.currentSlotMaximums = maximums;

  const tracker = document.querySelector("#spellSlotTracker");
  tracker.innerHTML = slots
    .map((max, index) => {
      const level = index + 1;
      const key = `slot${level}`;
      const available = state[key];
      const pips = Array.from(
        { length: max },
        (_, pipIndex) =>
          `<button class="slot-pip ${pipIndex < available ? "" : "spent"}" type="button" data-slot="${key}" data-index="${pipIndex}" aria-label="${pipIndex < available ? "消耗" : "恢复"}一个 ${level} 环法术位"></button>`,
      ).join("");
      return `
        <div class="slot-group">
          <div class="slot-title"><span>${level} 环法术位</span><small>${available} / ${max}</small></div>
          <div class="slot-pips" data-resource="${key}">${pips}</div>
        </div>`;
    })
    .join("");
}

window.renderDynamicSlots = renderManagerSlots;

function spellIcon(spell) {
  return `<span class="catalog-icon spell-icon" style="${iconStyle(spell.id)}" aria-hidden="true"><i></i></span>`;
}

function itemIcon(item) {
  return `<span class="catalog-icon item-icon" style="${iconStyle(item.id)}" aria-hidden="true"><i></i></span>`;
}

function renderSpellSummary() {
  const known = managerState.spellbook.map(findManagerSpell).filter(Boolean);
  const cantrips = known.filter((spell) => spell.level === 0).length;
  const bookSpells = known.length - cantrips;
  const prepared = preparedLeveledSpellIds().length;
  document.querySelector("#spellSummary").innerHTML = `
    <div><span>角色等级</span><strong>${managerState.level}</strong></div>
    <div><span>已知戏法</span><strong>${cantrips}</strong></div>
    <div><span>法术书</span><strong>${bookSpells}</strong></div>
    <div><span>已准备</span><strong>${prepared} / ${maxPreparedSpells()}</strong></div>
  `;
}

function renderSpellManager() {
  document.querySelectorAll("[data-spell-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.spellView === spellView);
  });
  renderSpellSummary();
  const workspace = document.querySelector("#spellWorkspace");
  if (spellView === "catalog") {
    workspace.innerHTML = `
      <div class="catalog-controls">
        <label class="search-field"><span>搜索</span><input id="spellSearch" value="${escapeManagerHtml(spellFilters.search)}" placeholder="法术名称、学派或说明" /></label>
        <label><span>环级</span><select id="spellLevelFilter">
          <option value="all">全部</option>
          ${Array.from({ length: 10 }, (_, level) => `<option value="${level}" ${spellFilters.level === `${level}` ? "selected" : ""}>${level === 0 ? "戏法" : `${level} 环`}</option>`).join("")}
        </select></label>
        <label><span>学派</span><select id="spellSchoolFilter">
          <option value="all">全部</option>
          ${Object.entries(schoolNames).map(([value, label]) => `<option value="${value}" ${spellFilters.school === value ? "selected" : ""}>${label}</option>`).join("")}
        </select></label>
        <label><span>职业</span><select id="spellClassFilter">
          <option value="all">全部</option>
          ${Object.entries(classNames).map(([value, label]) => `<option value="${value}" ${spellFilters.className === value ? "selected" : ""}>${label}</option>`).join("")}
        </select></label>
      </div>
      <div class="catalog-status" id="spellCatalogStatus"></div>
      <div class="catalog-grid spell-catalog-grid" id="spellResults"></div>
      <button class="load-more" id="spellLoadMore" type="button">显示更多</button>
    `;
    renderSpellResults();
    bindSpellFilters();
  } else {
    const ids =
      spellView === "prepared"
        ? managerState.spellbook.filter((id) => {
            const spell = findManagerSpell(id);
            return spell && (spell.level === 0 || managerState.prepared.includes(id));
          })
        : managerState.spellbook;
    const cards = ids
      .map(findManagerSpell)
      .filter(Boolean)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
      .map((spell) => renderSpellCard(spell, spellView))
      .join("");
    workspace.innerHTML = cards
      ? `<div class="catalog-grid spell-catalog-grid">${cards}</div>`
      : `<div class="empty-state"><strong>这里还没有法术</strong><p>前往“全部法术”添加，或创建一个自定义法术。</p></div>`;
  }
}

function bindSpellFilters() {
  document.querySelector("#spellSearch").addEventListener("input", (event) => {
    spellFilters.search = event.target.value;
    spellCatalogLimit = 48;
    renderSpellResults();
  });
  document.querySelector("#spellLevelFilter").addEventListener("change", (event) => {
    spellFilters.level = event.target.value;
    spellCatalogLimit = 48;
    renderSpellResults();
  });
  document.querySelector("#spellSchoolFilter").addEventListener("change", (event) => {
    spellFilters.school = event.target.value;
    spellCatalogLimit = 48;
    renderSpellResults();
  });
  document.querySelector("#spellClassFilter").addEventListener("change", (event) => {
    spellFilters.className = event.target.value;
    spellCatalogLimit = 48;
    renderSpellResults();
  });
}

function filteredCatalogSpells() {
  const query = spellFilters.search.trim().toLowerCase();
  return allManagerSpells()
    .filter((spell) => {
      const haystack = `${spell.name} ${spell.alias || ""} ${spell.school} ${spell.description}`.toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (spellFilters.level === "all" || `${spell.level}` === spellFilters.level) &&
        (spellFilters.school === "all" || spell.school === spellFilters.school) &&
        (spellFilters.className === "all" || spell.classes?.includes(spellFilters.className))
      );
    })
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

function renderSpellResults() {
  const matches = filteredCatalogSpells();
  const visible = matches.slice(0, spellCatalogLimit);
  document.querySelector("#spellCatalogStatus").textContent =
    `共 ${matches.length} 个法术 · 当前显示 ${visible.length} 个 · SRD 5.1 + 自定义`;
  document.querySelector("#spellResults").innerHTML = visible
    .map((spell) => renderSpellCard(spell, "catalog"))
    .join("");
  const more = document.querySelector("#spellLoadMore");
  more.hidden = visible.length >= matches.length;
}

function renderSpellCard(spell, context) {
  const known = managerState.spellbook.includes(spell.id);
  const prepared = spell.level === 0 ? known : managerState.prepared.includes(spell.id);
  const school = schoolNames[spell.school] || spell.school || "自定义";
  const classes = (spell.classes || []).map((name) => classNames[name] || name).join("、");
  let primaryAction = "";
  if (context === "catalog") {
    primaryAction = known
      ? `<button class="text-button danger" type="button" data-remove-spell="${spell.id}">移出法术书</button>`
      : `<button class="text-button" type="button" data-add-spell="${spell.id}">加入法术书</button>`;
  } else if (spell.level > 0) {
    primaryAction = `<button class="prepare-toggle ${prepared ? "active" : ""}" type="button" data-prepare-spell="${spell.id}" aria-pressed="${prepared}">${prepared ? "已准备" : "准备"}</button>`;
  }

  return `
    <article class="catalog-card spell-entry ${prepared ? "is-prepared" : ""}">
      <header>
        ${spellIcon(spell)}
        <div class="catalog-title">
          <span>${spell.level === 0 ? "戏法" : `${spell.level} 环`} · ${escapeManagerHtml(school)}</span>
          <h3>${escapeManagerHtml(displaySpellName(spell))}</h3>
          <small>${escapeManagerHtml(classes || "自定义列表")}</small>
        </div>
      </header>
      <div class="catalog-tags">
        ${spell.ritual ? "<span>仪式</span>" : ""}
        ${spell.concentration ? "<span>专注</span>" : ""}
        <span>${escapeManagerHtml(spell.castingTime || "自定义")}</span>
        <span>${escapeManagerHtml(spell.range || "自定义")}</span>
      </div>
      <details>
        <summary>法术详情</summary>
        <p>${escapeManagerHtml(spell.description || "暂无说明").replaceAll("\n", "<br>")}</p>
        ${spell.higherLevel ? `<p><strong>升环：</strong>${escapeManagerHtml(spell.higherLevel)}</p>` : ""}
        <dl>
          <div><dt>持续</dt><dd>${escapeManagerHtml(spell.duration || "—")}</dd></div>
          <div><dt>成分</dt><dd>${escapeManagerHtml(spell.components || "—")}</dd></div>
        </dl>
      </details>
      <footer class="catalog-actions">
        ${primaryAction}
        <button class="text-button" type="button" data-edit-spell="${spell.id}">编辑</button>
        ${context !== "catalog" ? `<button class="text-button danger" type="button" data-remove-spell="${spell.id}">移除</button>` : ""}
      </footer>
    </article>`;
}

function addSpellToBook(id) {
  if (!managerState.spellbook.includes(id)) managerState.spellbook.push(id);
  const spell = findManagerSpell(id);
  if (spell?.level === 0 && !managerState.prepared.includes(id)) managerState.prepared.push(id);
  saveManagerState();
  renderSpellManager();
}

function removeSpellFromBook(id) {
  managerState.spellbook = managerState.spellbook.filter((spellId) => spellId !== id);
  managerState.prepared = managerState.prepared.filter((spellId) => spellId !== id);
  saveManagerState();
  renderSpellManager();
}

function togglePreparedSpell(id) {
  const spell = findManagerSpell(id);
  if (!spell || spell.level === 0) return;
  if (managerState.prepared.includes(id)) {
    managerState.prepared = managerState.prepared.filter((spellId) => spellId !== id);
  } else {
    if (preparedLeveledSpellIds().length >= maxPreparedSpells()) {
      window.alert(`当前最多准备 ${maxPreparedSpells()} 个一环及以上法术。请先卸下一个已准备法术。`);
      return;
    }
    managerState.prepared.push(id);
  }
  saveManagerState();
  renderSpellManager();
}

function openSpellEditor(id = null) {
  const dialog = document.querySelector("#spellEditorDialog");
  const spell = id ? findManagerSpell(id) : null;
  const isCustom = spell?.custom;
  dialog.innerHTML = `
    <form method="dialog" id="spellEditorForm">
      <div class="dialog-heading">
        <div><p>ARCANE ENTRY</p><h2>${spell ? "编辑法术" : "创建自定义法术"}</h2></div>
        <button value="cancel" aria-label="关闭">×</button>
      </div>
      <div class="editor-grid">
        <label class="wide">显示名称<input name="alias" value="${escapeManagerHtml(spell?.alias || spellAliases[spell?.id] || "")}" placeholder="例如：霜火箭" /></label>
        <label class="wide">英文 / 原始名称<input name="name" required value="${escapeManagerHtml(spell?.name || "")}" placeholder="Spell name" /></label>
        <label>环级<select name="level">${Array.from({ length: 10 }, (_, level) => `<option value="${level}" ${spell?.level === level ? "selected" : ""}>${level === 0 ? "戏法" : `${level} 环`}</option>`).join("")}</select></label>
        <label>学派<select name="school">${Object.entries(schoolNames).map(([value, label]) => `<option value="${value}" ${spell?.school === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label>施法时间<input name="castingTime" value="${escapeManagerHtml(spell?.castingTime || "1 action")}" /></label>
        <label>距离<input name="range" value="${escapeManagerHtml(spell?.range || "")}" /></label>
        <label>持续时间<input name="duration" value="${escapeManagerHtml(spell?.duration || "")}" /></label>
        <label>成分<input name="components" value="${escapeManagerHtml(spell?.components || "V, S")}" /></label>
        <label class="wide">职业列表<input name="classes" value="${escapeManagerHtml((spell?.classes || ["Wizard"]).join(", "))}" placeholder="Wizard, Sorcerer" /></label>
        <label class="check-label"><input type="checkbox" name="ritual" ${spell?.ritual ? "checked" : ""} /> 仪式</label>
        <label class="check-label"><input type="checkbox" name="concentration" ${spell?.concentration ? "checked" : ""} /> 专注</label>
        <label class="wide">说明<textarea name="description" rows="6">${escapeManagerHtml(spell?.description || "")}</textarea></label>
        <label class="wide">升环效果<textarea name="higherLevel" rows="3">${escapeManagerHtml(spell?.higherLevel || "")}</textarea></label>
      </div>
      <menu>
        ${isCustom ? `<button type="button" class="ghost-button danger" data-delete-custom-spell="${spell.id}">删除条目</button>` : ""}
        <span></span>
        <button value="cancel" class="ghost-button">取消</button>
        <button value="default" class="primary-button">保存</button>
      </menu>
    </form>`;
  dialog.querySelectorAll('[value="cancel"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.close();
    });
  });
  dialog.querySelector("#spellEditorForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      dialog.close();
      return;
    }
    const form = new FormData(event.currentTarget);
    const entry = {
      ...(spell || {}),
      id: spell?.id || `custom-spell-${Date.now()}`,
      name: form.get("name").trim(),
      alias: form.get("alias").trim(),
      level: Number(form.get("level")),
      school: form.get("school"),
      classes: form
        .get("classes")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      castingTime: form.get("castingTime").trim(),
      range: form.get("range").trim(),
      duration: form.get("duration").trim(),
      components: form.get("components").trim(),
      ritual: form.get("ritual") === "on",
      concentration: form.get("concentration") === "on",
      description: form.get("description").trim(),
      higherLevel: form.get("higherLevel").trim(),
      custom: spell ? Boolean(spell.custom) : true,
    };
    if (entry.custom) {
      const index = managerState.customSpells.findIndex((item) => item.id === entry.id);
      if (index >= 0) managerState.customSpells[index] = entry;
      else managerState.customSpells.push(entry);
      if (!managerState.spellbook.includes(entry.id)) managerState.spellbook.push(entry.id);
    } else {
      managerState.spellOverrides[entry.id] = entry;
    }
    saveManagerState();
    renderSpellManager();
    dialog.close();
  });
  dialog.showModal();
}

function deleteCustomSpell(id) {
  managerState.customSpells = managerState.customSpells.filter((spell) => spell.id !== id);
  removeSpellFromBook(id);
  document.querySelector("#spellEditorDialog").close();
}

function renderInventorySummary() {
  const entries = managerState.inventory
    .map((entry) => ({ ...entry, item: findManagerItem(entry.id) }))
    .filter((entry) => entry.item);
  const totalWeight = entries.reduce(
    (sum, entry) => sum + Number(entry.item.weight || 0) * Number(entry.quantity || 1),
    0,
  );
  document.querySelector("#inventorySummary").innerHTML = `
    <div class="inventory-overview">
      <div><span>条目</span><strong>${entries.length}</strong></div>
      <div><span>总重量</span><strong>${totalWeight.toFixed(1)} 磅</strong></div>
      <div><span>已装备</span><strong>${entries.filter((entry) => entry.equipped).length}</strong></div>
      <div><span>负重上限</span><strong>${managerState.abilities.STR * 15} 磅</strong></div>
    </div>`;
}

function renderInventoryManager() {
  document.querySelectorAll("[data-inventory-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.inventoryView === inventoryView);
  });
  renderInventorySummary();
  const workspace = document.querySelector("#inventoryWorkspace");
  if (inventoryView === "catalog") {
    const itemTypes = [...new Set(allManagerItems().map((item) => item.type).filter(Boolean))].sort();
    const rarities = [...new Set(allManagerItems().map((item) => item.rarity).filter(Boolean))].sort();
    workspace.innerHTML = `
      <div class="catalog-controls item-controls">
        <label class="search-field"><span>搜索</span><input id="itemSearch" value="${escapeManagerHtml(itemFilters.search)}" placeholder="名称、类别或说明" /></label>
        <label><span>类别</span><select id="itemTypeFilter"><option value="all">全部</option>${itemTypes.map((value) => `<option value="${escapeManagerHtml(value)}" ${itemFilters.type === value ? "selected" : ""}>${escapeManagerHtml(value)}</option>`).join("")}</select></label>
        <label><span>稀有度</span><select id="itemRarityFilter"><option value="all">全部</option>${rarities.map((value) => `<option value="${escapeManagerHtml(value)}" ${itemFilters.rarity === value ? "selected" : ""}>${escapeManagerHtml(value)}</option>`).join("")}</select></label>
      </div>
      <div class="catalog-status" id="itemCatalogStatus"></div>
      <div class="catalog-grid item-catalog-grid" id="itemResults"></div>
      <button class="load-more" id="itemLoadMore" type="button">显示更多</button>`;
    renderItemResults();
    bindItemFilters();
  } else {
    const cards = managerState.inventory
      .map((entry) => {
        const item = findManagerItem(entry.id);
        return item ? renderInventoryCard(item, entry) : "";
      })
      .join("");
    workspace.innerHTML = cards
      ? `<div class="catalog-grid item-catalog-grid">${cards}</div>`
      : `<div class="empty-state"><strong>背包是空的</strong><p>前往“全部物品”添加，或创建自定义物品。</p></div>`;
  }
}

function bindItemFilters() {
  document.querySelector("#itemSearch").addEventListener("input", (event) => {
    itemFilters.search = event.target.value;
    itemCatalogLimit = 48;
    renderItemResults();
  });
  document.querySelector("#itemTypeFilter").addEventListener("change", (event) => {
    itemFilters.type = event.target.value;
    itemCatalogLimit = 48;
    renderItemResults();
  });
  document.querySelector("#itemRarityFilter").addEventListener("change", (event) => {
    itemFilters.rarity = event.target.value;
    itemCatalogLimit = 48;
    renderItemResults();
  });
}

function filteredCatalogItems() {
  const query = itemFilters.search.trim().toLowerCase();
  return allManagerItems()
    .filter((item) => {
      const haystack = `${item.name} ${item.type} ${item.category} ${item.description}`.toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (itemFilters.type === "all" || item.type === itemFilters.type) &&
        (itemFilters.rarity === "all" || item.rarity === itemFilters.rarity)
      );
    })
    .sort((a, b) => Number(b.magic) - Number(a.magic) || a.name.localeCompare(b.name));
}

function renderItemResults() {
  const matches = filteredCatalogItems();
  const visible = matches.slice(0, itemCatalogLimit);
  document.querySelector("#itemCatalogStatus").textContent =
    `共 ${matches.length} 件物品 · 当前显示 ${visible.length} 件 · SRD 5.1 + 自定义`;
  document.querySelector("#itemResults").innerHTML = visible.map(renderCatalogItemCard).join("");
  document.querySelector("#itemLoadMore").hidden = visible.length >= matches.length;
}

function renderCatalogItemCard(item) {
  const inventoryEntry = managerState.inventory.find((entry) => entry.id === item.id);
  return `
    <article class="catalog-card item-entry">
      <header>
        ${itemIcon(item)}
        <div class="catalog-title">
          <span>${escapeManagerHtml(item.rarity || "Common")} · ${escapeManagerHtml(item.type)}</span>
          <h3>${escapeManagerHtml(item.name)}</h3>
          <small>${escapeManagerHtml(item.category || "Equipment")}</small>
        </div>
      </header>
      <div class="catalog-tags">
        ${item.cost ? `<span>${escapeManagerHtml(item.cost)}</span>` : ""}
        ${item.weight ? `<span>${item.weight} 磅</span>` : ""}
        ${item.damage ? `<span>${escapeManagerHtml(item.damage)}</span>` : ""}
        ${item.armorClass ? `<span>AC ${item.armorClass}</span>` : ""}
      </div>
      <details><summary>物品详情</summary><p>${escapeManagerHtml(item.description || "暂无说明").replaceAll("\n", "<br>")}</p></details>
      <footer class="catalog-actions">
        <button class="text-button" type="button" data-add-item="${item.id}">${inventoryEntry ? `增加数量（${inventoryEntry.quantity}）` : "加入背包"}</button>
        <button class="text-button" type="button" data-edit-item="${item.id}">编辑</button>
      </footer>
    </article>`;
}

function renderInventoryCard(item, entry) {
  return `
    <article class="catalog-card item-entry ${entry.equipped ? "is-equipped" : ""}">
      <header>
        ${itemIcon(item)}
        <div class="catalog-title">
          <span>${entry.equipped ? "已装备" : escapeManagerHtml(item.rarity || "Common")}</span>
          <h3>${escapeManagerHtml(item.name)}</h3>
          <small>${escapeManagerHtml(item.type)}${entry.notes ? ` · ${escapeManagerHtml(entry.notes)}` : ""}</small>
        </div>
      </header>
      <div class="inventory-actions">
        <div class="quantity-stepper">
          <button type="button" data-item-quantity="${item.id}" data-delta="-1">−</button>
          <strong>${entry.quantity}</strong>
          <button type="button" data-item-quantity="${item.id}" data-delta="1">＋</button>
        </div>
        <button class="equip-toggle ${entry.equipped ? "active" : ""}" type="button" data-equip-item="${item.id}">${entry.equipped ? "卸下" : "装备"}</button>
      </div>
      <footer class="catalog-actions">
        <button class="text-button" type="button" data-edit-item="${item.id}">编辑</button>
        <button class="text-button danger" type="button" data-remove-item="${item.id}">移除</button>
      </footer>
    </article>`;
}

function addItemToInventory(id) {
  const entry = managerState.inventory.find((item) => item.id === id);
  if (entry) entry.quantity += 1;
  else managerState.inventory.push({ id, quantity: 1, equipped: false, notes: "" });
  saveManagerState();
  renderInventoryManager();
}

function removeItemFromInventory(id) {
  managerState.inventory = managerState.inventory.filter((entry) => entry.id !== id);
  saveManagerState();
  renderInventoryManager();
}

function updateItemQuantity(id, delta) {
  const entry = managerState.inventory.find((item) => item.id === id);
  if (!entry) return;
  entry.quantity = Math.max(0, entry.quantity + delta);
  if (entry.quantity === 0) removeItemFromInventory(id);
  else {
    saveManagerState();
    renderInventoryManager();
  }
}

function openItemEditor(id = null) {
  const dialog = document.querySelector("#itemEditorDialog");
  const item = id ? findManagerItem(id) : null;
  const isCustom = item?.custom;
  const inventoryEntry = item ? managerState.inventory.find((entry) => entry.id === item.id) : null;
  dialog.innerHTML = `
    <form method="dialog" id="itemEditorForm">
      <div class="dialog-heading">
        <div><p>INVENTORY ENTRY</p><h2>${item ? "编辑物品" : "创建自定义物品"}</h2></div>
        <button value="cancel" aria-label="关闭">×</button>
      </div>
      <div class="editor-grid">
        <label class="wide">名称<input name="name" required value="${escapeManagerHtml(item?.name || "")}" /></label>
        <label>类别<input name="type" value="${escapeManagerHtml(item?.type || "Adventuring Gear")}" /></label>
        <label>子类别<input name="category" value="${escapeManagerHtml(item?.category || "")}" /></label>
        <label>稀有度<input name="rarity" value="${escapeManagerHtml(item?.rarity || "Common")}" /></label>
        <label>价值<input name="cost" value="${escapeManagerHtml(item?.cost || "")}" /></label>
        <label>重量（磅）<input name="weight" type="number" min="0" step="0.1" value="${Number(item?.weight || 0)}" /></label>
        <label>伤害<input name="damage" value="${escapeManagerHtml(item?.damage || "")}" /></label>
        <label>护甲等级<input name="armorClass" type="number" min="0" value="${item?.armorClass || ""}" /></label>
        <label class="wide">属性标签<input name="properties" value="${escapeManagerHtml((item?.properties || []).join(", "))}" placeholder="Light, Finesse, Story" /></label>
        <label class="wide">背包备注<input name="notes" value="${escapeManagerHtml(inventoryEntry?.notes || "")}" /></label>
        <label class="wide">说明<textarea name="description" rows="6">${escapeManagerHtml(item?.description || "")}</textarea></label>
        <label class="check-label"><input type="checkbox" name="magic" ${item?.magic ? "checked" : ""} /> 魔法物品</label>
      </div>
      <menu>
        ${isCustom ? `<button type="button" class="ghost-button danger" data-delete-custom-item="${item.id}">删除条目</button>` : ""}
        <span></span>
        <button value="cancel" class="ghost-button">取消</button>
        <button value="default" class="primary-button">保存</button>
      </menu>
    </form>`;
  dialog.querySelectorAll('[value="cancel"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.close();
    });
  });
  dialog.querySelector("#itemEditorForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      dialog.close();
      return;
    }
    const form = new FormData(event.currentTarget);
    const entry = {
      ...(item || {}),
      id: item?.id || `custom-item-${Date.now()}`,
      name: form.get("name").trim(),
      type: form.get("type").trim(),
      category: form.get("category").trim(),
      rarity: form.get("rarity").trim(),
      cost: form.get("cost").trim(),
      weight: Number(form.get("weight") || 0),
      damage: form.get("damage").trim(),
      armorClass: form.get("armorClass") ? Number(form.get("armorClass")) : null,
      properties: form
        .get("properties")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      description: form.get("description").trim(),
      magic: form.get("magic") === "on",
      custom: item ? Boolean(item.custom) : true,
    };
    if (entry.custom) {
      const index = managerState.customItems.findIndex((candidate) => candidate.id === entry.id);
      if (index >= 0) managerState.customItems[index] = entry;
      else managerState.customItems.push(entry);
    } else {
      managerState.itemOverrides[entry.id] = entry;
    }
    let inventoryEntry = managerState.inventory.find((candidate) => candidate.id === entry.id);
    if (!inventoryEntry) {
      inventoryEntry = { id: entry.id, quantity: 1, equipped: false, notes: "" };
      managerState.inventory.push(inventoryEntry);
    }
    inventoryEntry.notes = form.get("notes").trim();
    saveManagerState();
    renderInventoryManager();
    dialog.close();
  });
  dialog.showModal();
}

function deleteCustomItem(id) {
  managerState.customItems = managerState.customItems.filter((item) => item.id !== id);
  removeItemFromInventory(id);
  document.querySelector("#itemEditorDialog").close();
}

function levelFeatureSummary(level) {
  const messages = [];
  if ([4, 8, 12, 16, 19].includes(level)) messages.push("获得属性值提升：选择两次 +1，可叠加到同一属性。");
  if ([4, 10].includes(level)) messages.push("额外学会 1 个法师戏法。");
  if (level === 6) messages.push("预言学派：专家预言。");
  if (level === 10) messages.push("预言学派：第三只眼。");
  if (level === 14) messages.push("预言学派：高等预兆（预兆骰增至 3 个）。");
  if (level === 18) messages.push("法师：法术精通。");
  if (level === 20) messages.push("法师：招牌法术。");
  return messages;
}

function openLevelUpDialog() {
  if (managerState.level >= 20) {
    window.alert("Charlie 已达到 20 级。");
    return;
  }
  const dialog = document.querySelector("#levelUpDialog");
  const nextLevel = managerState.level + 1;
  const conMod = abilityModifier(managerState.abilities.CON);
  const averageGain = 4 + conMod;
  const newMaxSpellLevel = maxSpellLevel(nextLevel);
  const eligibleSpells = allManagerSpells()
    .filter(
      (spell) =>
        spell.level > 0 &&
        spell.level <= newMaxSpellLevel &&
        spell.classes?.includes("Wizard") &&
        !managerState.spellbook.includes(spell.id),
    )
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  const eligibleCantrips = allManagerSpells()
    .filter(
      (spell) =>
        spell.level === 0 &&
        spell.classes?.includes("Wizard") &&
        !managerState.spellbook.includes(spell.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const gainsCantrip = [4, 10].includes(nextLevel);
  const gainsAsi = [4, 8, 12, 16, 19].includes(nextLevel);
  const featureMessages = levelFeatureSummary(nextLevel);

  dialog.innerHTML = `
    <form method="dialog" id="levelUpForm">
      <div class="dialog-heading">
        <div><p>LEVEL ADVANCEMENT</p><h2>法师 ${managerState.level} → ${nextLevel}</h2></div>
        <button value="cancel" aria-label="关闭">×</button>
      </div>
      <div class="level-summary-banner">
        <span>熟练 +${proficiencyForLevel(nextLevel)}</span>
        <span>最高 ${newMaxSpellLevel} 环</span>
        <span>准备上限 ${nextLevel + abilityModifier(managerState.abilities.INT)}</span>
      </div>
      <fieldset>
        <legend>生命值成长</legend>
        <label class="radio-row"><input type="radio" name="hpMode" value="average" checked /> 采用平均值：增加 ${averageGain} HP（4 + 体质调整值）</label>
        <label class="radio-row"><input type="radio" name="hpMode" value="roll" /> 使用掷骰结果：<input class="inline-number" name="hpRoll" type="number" min="1" max="6" value="4" /> + ${conMod}</label>
      </fieldset>
      <fieldset>
        <legend>抄入法术书 · 必须选择 2 个</legend>
        <div class="level-spell-picker" id="levelSpellPicker">
          ${eligibleSpells
            .map(
              (spell) => `
                <label class="picker-card">
                  <input type="checkbox" name="learnedSpells" value="${spell.id}" />
                  ${spellIcon(spell)}
                  <span><strong>${escapeManagerHtml(displaySpellName(spell))}</strong><small>${spell.level} 环 · ${escapeManagerHtml(schoolNames[spell.school] || spell.school)}</small></span>
                </label>`,
            )
            .join("")}
        </div>
        <p class="selection-count" id="levelSpellCount">已选择 0 / 2</p>
      </fieldset>
      ${
        gainsCantrip
          ? `<fieldset><legend>新增戏法 · 选择 1 个</legend><select name="newCantrip" required><option value="">请选择</option>${eligibleCantrips.map((spell) => `<option value="${spell.id}">${escapeManagerHtml(displaySpellName(spell))}</option>`).join("")}</select></fieldset>`
          : ""
      }
      ${
        gainsAsi
          ? `<fieldset><legend>属性值提升</legend><p class="field-help">选择两次 +1；选择同一属性即为该属性 +2，单项不能超过 20。</p><div class="asi-grid">${["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((key) => `<label>${key}<select name="asi${key}"><option value="0">+0</option><option value="1">+1</option><option value="2">+2</option></select></label>`).join("")}</div><p class="selection-count" id="asiCount">已分配 0 / 2</p></fieldset>`
          : ""
      }
      ${
        featureMessages.length
          ? `<fieldset><legend>本级新增特性</legend><ul class="level-feature-list">${featureMessages.map((message) => `<li>${escapeManagerHtml(message)}</li>`).join("")}</ul></fieldset>`
          : ""
      }
      <menu>
        <button value="cancel" class="ghost-button">取消</button>
        <button value="default" class="primary-button">确认升级到 ${nextLevel} 级</button>
      </menu>
    </form>`;

  const form = dialog.querySelector("#levelUpForm");
  dialog.querySelectorAll('[value="cancel"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.close();
    });
  });
  const updateSpellCount = () => {
    const checked = form.querySelectorAll('[name="learnedSpells"]:checked');
    dialog.querySelector("#levelSpellCount").textContent = `已选择 ${checked.length} / 2`;
  };
  form.querySelectorAll('[name="learnedSpells"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const checked = form.querySelectorAll('[name="learnedSpells"]:checked');
      if (checked.length > 2) event.target.checked = false;
      updateSpellCount();
    });
  });

  if (gainsAsi) {
    const updateAsiCount = () => {
      const total = [...form.querySelectorAll('[name^="asi"]')].reduce(
        (sum, select) => sum + Number(select.value),
        0,
      );
      dialog.querySelector("#asiCount").textContent = `已分配 ${total} / 2`;
    };
    form.querySelectorAll('[name^="asi"]').forEach((select) => select.addEventListener("change", updateAsiCount));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      dialog.close();
      return;
    }
    const formData = new FormData(form);
    const learned = formData.getAll("learnedSpells");
    if (learned.length !== 2) {
      window.alert("升级时必须选择 2 个新法术抄入法术书。");
      return;
    }

    const oldAbilities = { ...managerState.abilities };
    if (gainsAsi) {
      const total = ["STR", "DEX", "CON", "INT", "WIS", "CHA"].reduce(
        (sum, key) => sum + Number(formData.get(`asi${key}`) || 0),
        0,
      );
      if (total !== 2) {
        window.alert("请正好分配 2 点属性值。");
        return;
      }
      for (const key of ["STR", "DEX", "CON", "INT", "WIS", "CHA"]) {
        const nextScore = managerState.abilities[key] + Number(formData.get(`asi${key}`) || 0);
        if (nextScore > 20) {
          window.alert(`${key} 不能超过 20。`);
          return;
        }
        managerState.abilities[key] = nextScore;
      }
    }

    const hpMode = formData.get("hpMode");
    const rolled = Math.max(1, Math.min(6, Number(formData.get("hpRoll") || 4)));
    const baseGain = (hpMode === "roll" ? rolled : 4) + abilityModifier(oldAbilities.CON);
    const conRetroactive =
      (abilityModifier(managerState.abilities.CON) - abilityModifier(oldAbilities.CON)) * nextLevel;
    const hpGain = baseGain + conRetroactive;

    const oldSlots = wizardSlotTable[managerState.level];
    const newSlots = wizardSlotTable[nextLevel];
    newSlots.forEach((max, index) => {
      const key = `slot${index + 1}`;
      const oldMax = oldSlots[index] || 0;
      state[key] = Math.min(max, (state[key] || 0) + (max - oldMax));
    });

    managerState.level = nextLevel;
    managerState.spellbook.push(...learned);
    if (gainsCantrip) managerState.spellbook.push(formData.get("newCantrip"));
    managerState.levelHistory.push({
      level: nextLevel,
      hpGain,
      spells: learned,
      cantrip: gainsCantrip ? formData.get("newCantrip") : null,
      abilities: { ...managerState.abilities },
      at: new Date().toISOString(),
    });
    state.maxHp += hpGain;
    state.hp += hpGain;
    saveManagerState();
    renderState();
    syncCharacterSheet();
    renderSpellManager();
    renderInventoryManager();
    dialog.close();
  });
  dialog.showModal();
}

document.addEventListener("click", (event) => {
  const spellViewButton = event.target.closest("[data-spell-view]");
  if (spellViewButton) {
    spellView = spellViewButton.dataset.spellView;
    renderSpellManager();
  }

  const inventoryViewButton = event.target.closest("[data-inventory-view]");
  if (inventoryViewButton) {
    inventoryView = inventoryViewButton.dataset.inventoryView;
    renderInventoryManager();
  }

  const addSpellButton = event.target.closest("[data-add-spell]");
  if (addSpellButton) addSpellToBook(addSpellButton.dataset.addSpell);

  const removeSpellButton = event.target.closest("[data-remove-spell]");
  if (removeSpellButton) removeSpellFromBook(removeSpellButton.dataset.removeSpell);

  const prepareButton = event.target.closest("[data-prepare-spell]");
  if (prepareButton) togglePreparedSpell(prepareButton.dataset.prepareSpell);

  const editSpellButton = event.target.closest("[data-edit-spell]");
  if (editSpellButton) openSpellEditor(editSpellButton.dataset.editSpell);

  const deleteSpellButton = event.target.closest("[data-delete-custom-spell]");
  if (deleteSpellButton) deleteCustomSpell(deleteSpellButton.dataset.deleteCustomSpell);

  const addItemButton = event.target.closest("[data-add-item]");
  if (addItemButton) addItemToInventory(addItemButton.dataset.addItem);

  const removeItemButton = event.target.closest("[data-remove-item]");
  if (removeItemButton) removeItemFromInventory(removeItemButton.dataset.removeItem);

  const quantityButton = event.target.closest("[data-item-quantity]");
  if (quantityButton) {
    updateItemQuantity(quantityButton.dataset.itemQuantity, Number(quantityButton.dataset.delta));
  }

  const equipButton = event.target.closest("[data-equip-item]");
  if (equipButton) {
    const entry = managerState.inventory.find((item) => item.id === equipButton.dataset.equipItem);
    if (entry) {
      entry.equipped = !entry.equipped;
      saveManagerState();
      renderInventoryManager();
    }
  }

  const editItemButton = event.target.closest("[data-edit-item]");
  if (editItemButton) openItemEditor(editItemButton.dataset.editItem);

  const deleteItemButton = event.target.closest("[data-delete-custom-item]");
  if (deleteItemButton) deleteCustomItem(deleteItemButton.dataset.deleteCustomItem);
});

document.querySelector("#newSpellButton").addEventListener("click", () => openSpellEditor());
document.querySelector("#newItemButton").addEventListener("click", () => openItemEditor());
document.querySelector("#levelUpButton").addEventListener("click", openLevelUpDialog);

document.querySelector("#spellWorkspace").addEventListener("click", (event) => {
  if (event.target.closest("#spellLoadMore")) {
    spellCatalogLimit += 48;
    renderSpellResults();
  }
});

document.querySelector("#inventoryWorkspace").addEventListener("click", (event) => {
  if (event.target.closest("#itemLoadMore")) {
    itemCatalogLimit += 48;
    renderItemResults();
  }
});

syncCharacterSheet();
renderSpellManager();
renderInventoryManager();
