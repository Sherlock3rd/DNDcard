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

const itemTypeNames = {
  "Adventuring Gear": "冒险装备",
  Ammunition: "弹药",
  Armor: "护甲",
  "Mounts and Vehicles": "坐骑与载具",
  Potion: "药水",
  Ring: "戒指",
  Rod: "权杖",
  Scroll: "卷轴",
  Staff: "法杖",
  Tools: "工具",
  Wand: "魔杖",
  Weapon: "武器",
  "Wondrous Items": "奇物",
};

const itemRarityNames = {
  Artifact: "神器",
  Common: "普通",
  Legendary: "传说",
  Rare: "稀有",
  Uncommon: "非普通",
  Varies: "不定",
  "Very Rare": "非常稀有",
};

function displayItemType(value) {
  return itemTypeNames[value] || value || "物品";
}

function displayItemRarity(value) {
  return itemRarityNames[value] || value || "普通";
}

function displayItemDamage(value) {
  return String(value || "")
    .replaceAll("Bludgeoning", "钝击")
    .replaceAll("Piercing", "穿刺")
    .replaceAll("Slashing", "挥砍");
}

const spellAliases = {
  light: "光亮术",
  "fire-bolt": "火焰箭",
  "custom-spell-booming-blade": "轰雷剑",
  "mage-armor": "法师护甲",
  shield: "护盾术",
  "magic-missile": "魔法飞弹",
  "detect-magic": "侦测魔法",
  "find-familiar": "获得魔宠",
  sleep: "睡眠术",
  "misty-step": "迷踪步",
  thunderwave: "雷鸣波",
  "mirror-image": "镜影术",
  "custom-spell-absorb-elements": "吸收元素",
};

const initialSpellbook = [
  "light",
  "fire-bolt",
  "custom-spell-booming-blade",
  "detect-magic",
  "find-familiar",
  "shield",
  "thunderwave",
  "mage-armor",
  "custom-spell-absorb-elements",
  "magic-missile",
  "sleep",
  "mirror-image",
  "misty-step",
];

const initialPrepared = [
  "shield",
  "custom-spell-absorb-elements",
  "magic-missile",
  "thunderwave",
  "mirror-image",
  "misty-step",
];

const managerDefaults = {
  profileVersion: 10,
  level: 3,
  abilities: { STR: 16, DEX: 15, CON: 14, INT: 17, WIS: 13, CHA: 6 },
  coins: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
  spellbook: initialSpellbook,
  prepared: initialPrepared,
  customSpells: [
    {
      id: "custom-spell-booming-blade",
      name: "Booming Blade",
      nameZh: "轰雷剑",
      level: 0,
      school: "Evocation",
      classes: ["Wizard"],
      castingTimeZh: "1 动作",
      rangeZh: "自身（5 尺）",
      durationZh: "1 轮",
      componentsZh: "S、M（价值至少 1 银币的近战武器）",
      ritual: false,
      concentration: false,
      descriptionZh: "以手中武器发动一次近战攻击，并以雷鸣能量包裹目标；目标若在效果结束前主动移动，会承受额外雷鸣伤害。",
      higherLevelZh: "角色等级提升时，武器攻击与移动触发的雷鸣伤害会提高。",
      custom: true,
    },
    {
      id: "custom-spell-absorb-elements",
      name: "Absorb Elements",
      nameZh: "吸收元素",
      level: 1,
      school: "Abjuration",
      classes: ["Wizard"],
      castingTimeZh: "1 反应",
      rangeZh: "自身",
      durationZh: "1 轮",
      componentsZh: "S",
      ritual: false,
      concentration: false,
      descriptionZh: "受到酸蚀、寒冷、火焰、闪电或雷鸣伤害时吸收部分能量，获得该伤害类型的临时抗性，并强化下一次近战攻击。",
      higherLevelZh: "使用更高环法术位时，下一次近战攻击的额外元素伤害提高。",
      custom: true,
    },
  ],
  spellOverrides: {},
  customItems: [],
  itemOverrides: {},
  inventory: [
    { id: "equipment-longsword", quantity: 1, equipped: true, notes: "父亲遗物" },
    { id: "equipment-quarterstaff", quantity: 1, equipped: false, notes: "" },
    { id: "equipment-crossbow-light", quantity: 1, equipped: false, notes: "" },
    { id: "equipment-crossbow-bolt", quantity: 1, equipped: false, notes: "1 包 · 共 20 支 · 轻弩弹药" },
    { id: "equipment-studded-leather-armor", quantity: 1, equipped: true, notes: "基础 AC 14" },
    { id: "equipment-component-pouch", quantity: 1, equipped: true, notes: "" },
    { id: "equipment-spellbook", quantity: 1, equipped: true, notes: "记录 10 个一环及以上法术" },
    { id: "equipment-playing-card-set", quantity: 1, equipped: true, notes: "母亲遗物 · 边角磨白" },
    { id: "magic-hat-of-disguise", quantity: 1, equipped: true, notes: "导师赠予 · 已同调" },
  ],
  feats: [],
  levelHistory: [],
};

let managerState = loadManagerState();
let spellView = "prepared";
let spellPreparationMode = false;
let inventoryView = "carried";
let spellCatalogLimit = 48;
let itemCatalogLimit = 48;
let spellFilters = { search: "", level: "all", school: "all", className: "all" };
let itemFilters = { search: "", type: "all", rarity: "all" };

function loadManagerState() {
  try {
    const saved = JSON.parse(localStorage.getItem("gandalf-5e-manager") || "{}");
    const loaded = {
      ...structuredClone(managerDefaults),
      ...saved,
      abilities: { ...managerDefaults.abilities, ...(saved.abilities || {}) },
      coins: { ...managerDefaults.coins, ...(saved.coins || {}) },
      spellOverrides: saved.spellOverrides || {},
      itemOverrides: saved.itemOverrides || {},
      customSpells: saved.customSpells || managerDefaults.customSpells,
      customItems: saved.customItems || managerDefaults.customItems,
      inventory: saved.inventory || managerDefaults.inventory,
      feats: Array.isArray(saved.feats) ? saved.feats : [],
    };
    if (Number(saved.profileVersion || 0) < managerDefaults.profileVersion) {
      loaded.profileVersion = managerDefaults.profileVersion;
      loaded.prepared = [...initialPrepared];
      loaded.inventory = loaded.inventory.map((entry) =>
        entry.id === "equipment-longsword" ? { ...entry, notes: "父亲遗物" } : entry,
      );
      if (!loaded.inventory.some((entry) => entry.id === "equipment-crossbow-bolt")) {
        loaded.inventory.push({ id: "equipment-crossbow-bolt", quantity: 1, equipped: false, notes: "1 包 · 共 20 支 · 轻弩弹药" });
      }
    }
    Object.keys(loaded.coins).forEach((key) => {
      loaded.coins[key] = Math.max(0, Math.floor(Number(loaded.coins[key]) || 0));
    });
    loaded.customItems = loaded.customItems.map((item) => ({
      ...item,
      nameZh: item.nameZh || item.name,
      descriptionZh: item.descriptionZh || item.description || "",
    }));
    const validSpellIds = new Set([
      ...srdCatalog.spells.map((spell) => spell.id),
      ...loaded.customSpells.map((spell) => spell.id),
    ]);
    loaded.spellbook = loaded.spellbook.filter((id) => validSpellIds.has(id));
    loaded.prepared = loaded.prepared.filter((id) => validSpellIds.has(id));
    return loaded;
  } catch {
    return structuredClone(managerDefaults);
  }
}

function saveManagerState() {
  localStorage.setItem("gandalf-5e-manager", JSON.stringify(managerState));
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
  const chinese = spell.alias || spell.nameZh || spellAliases[spell.id] || spell.name;
  return chinese === spell.name ? spell.name : `${chinese}（${spell.name}）`;
}

function displayItemName(item) {
  const chinese = item.nameZh || item.alias || item.name;
  return chinese === item.name ? item.name : `${chinese}（${item.name}）`;
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
  renderState();
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
  window.renderHeroState?.();
}

window.renderDynamicSlots = renderManagerSlots;

function spellIcon(spell) {
  return `<span class="catalog-icon spell-icon" style="${window.DND_ICON_MAP.spellStyle(spell)}" aria-hidden="true"><i></i></span>`;
}

function itemIcon(item) {
  return `<span class="catalog-icon item-icon" style="${window.DND_ICON_MAP.itemStyle(item)}" aria-hidden="true"><i></i></span>`;
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
  const copyButton = document.querySelector("#copySpellButton");
  copyButton.textContent = spellView === "catalog" ? "← 返回法表" : "＋ 抄录法术";
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
  } else if (spellView === "prepared") {
    workspace.innerHTML = renderPreparedLoadout();
  } else {
    workspace.innerHTML = renderSpellbookByLevel();
  }
}

function renderPreparedLoadout() {
  const preparedIds = preparedLeveledSpellIds();
  const preparedSpells = preparedIds.map(findManagerSpell).filter(Boolean);
  const maximum = maxPreparedSpells();
  const slots = Array.from({ length: maximum }, (_, index) => {
    const spell = preparedSpells[index];
    return spell
      ? `<button class="prepared-slot filled" type="button" data-loadout-spell="${spell.id}" title="${spellPreparationMode ? "点击卸下" : "点击查看"} ${escapeManagerHtml(displaySpellName(spell))}">
          ${spellIcon(spell)}
          <span><strong>${escapeManagerHtml(spell.nameZh || spell.alias || spell.name)}</strong><small>${spell.level} 环</small></span>
          <i>${spellPreparationMode ? "×" : "⌕"}</i>
        </button>`
      : `<div class="prepared-slot empty" aria-label="空的准备法术栏位"><span>✧</span><small>空栏位</small></div>`;
  }).join("");
  const known = managerState.spellbook.map(findManagerSpell).filter(Boolean);
  const cantrips = known.filter((spell) => spell.level === 0);
  const leveled = known.filter((spell) => spell.level > 0);
  const levels = [...new Set(leveled.map((spell) => spell.level))].sort((a, b) => a - b);

  return `
    <section class="spell-loadout ${spellPreparationMode ? "preparation-mode" : ""}">
      <div class="loadout-heading">
        <div><p>PREPARED SPELLS</p><h3>今日准备法术</h3></div>
        <div class="loadout-heading-actions">
          <strong>${preparedSpells.length} / ${maximum}</strong>
          <button class="prepare-mode-toggle ${spellPreparationMode ? "active" : ""}" type="button" data-toggle-preparation-mode aria-pressed="${spellPreparationMode}">
            <span>调配模式</span><i>${spellPreparationMode ? "已开启" : "已关闭"}</i>
          </button>
        </div>
      </div>
      <p class="loadout-help">${spellPreparationMode ? "调配模式已开启：点击一环及以上法术可快捷准备或卸下；戏法始终可用，不占准备栏位。" : "点击任意法术查看详情。需要准备或卸下法术时，请先开启调配模式。"}</p>
      <div class="prepared-tray">${slots}</div>
      ${
        cantrips.length
          ? `<section class="spell-level-shelf cantrip-shelf"><header><span>戏法</span><small>始终可用</small></header><div class="loadout-grid">${cantrips.map((spell) => renderLoadoutTile(spell, true)).join("")}</div></section>`
          : ""
      }
      ${levels
        .map((level) => {
          const spellsAtLevel = leveled.filter((spell) => spell.level === level);
          return `<section class="spell-level-shelf"><header><span>${level} 环法术</span><small>${spellsAtLevel.filter((spell) => managerState.prepared.includes(spell.id)).length} 已准备 · ${spellsAtLevel.length} 已抄录</small></header><div class="loadout-grid">${spellsAtLevel.map((spell) => renderLoadoutTile(spell, false)).join("")}</div></section>`;
        })
        .join("")}
    </section>`;
}

function renderLoadoutTile(spell, alwaysAvailable) {
  const prepared = alwaysAvailable || managerState.prepared.includes(spell.id);
  if (alwaysAvailable) {
    return `<button class="loadout-spell always-prepared" type="button" data-loadout-spell="${spell.id}" title="点击查看 ${escapeManagerHtml(displaySpellName(spell))}">${spellIcon(spell)}<span><strong>${escapeManagerHtml(spell.nameZh || spell.alias || spell.name)}</strong><small>${escapeManagerHtml(spell.name)}</small></span><i>${spellPreparationMode ? "∞" : "⌕"}</i></button>`;
  }
  return `<button class="loadout-spell ${prepared ? "active" : ""}" type="button" data-loadout-spell="${spell.id}" aria-label="${spellPreparationMode ? (prepared ? "卸下" : "准备") : "查看"} ${escapeManagerHtml(displaySpellName(spell))}">
    ${spellIcon(spell)}
    <span><strong>${escapeManagerHtml(spell.nameZh || spell.alias || spell.name)}</strong><small>${escapeManagerHtml(spell.name)}</small></span>
    <i>${spellPreparationMode ? (prepared ? "×" : "+") : "⌕"}</i>
  </button>`;
}

function openSpellDetail(id) {
  const spell = findManagerSpell(id);
  if (!spell) return;
  const dialog = document.querySelector("#spellDetailDialog");
  const school = schoolNames[spell.school] || spell.school || "自定义";
  const classes = (spell.classes || []).map((name) => classNames[name] || name).join("、") || "法术列表";
  dialog.innerHTML = `
    <form method="dialog">
      <div class="dialog-heading">
        <div><p>${spell.level === 0 ? "戏法" : `${spell.level} 环`} · ${escapeManagerHtml(school)}</p><h2>${escapeManagerHtml(displaySpellName(spell))}</h2></div>
        <button value="cancel" aria-label="关闭法术详情">×</button>
      </div>
      <div class="spell-detail-tags">
        ${spell.ritual ? "<span>仪式</span>" : ""}
        ${spell.concentration ? "<span>专注</span>" : ""}
        <span>${escapeManagerHtml(classes)}</span>
      </div>
      <div class="spell-detail-copy">
        <p>${escapeManagerHtml(spell.descriptionZh || "暂无中文说明").replaceAll("\n", "<br>")}</p>
        ${spell.higherLevelZh ? `<p><strong>升环：</strong>${escapeManagerHtml(spell.higherLevelZh)}</p>` : ""}
      </div>
      <dl class="spell-detail-stats">
        <div><dt>施法时间</dt><dd>${escapeManagerHtml(spell.castingTimeZh || spell.castingTime || "—")}</dd></div>
        <div><dt>距离</dt><dd>${escapeManagerHtml(spell.rangeZh || spell.range || "—")}</dd></div>
        <div><dt>持续时间</dt><dd>${escapeManagerHtml(spell.durationZh || spell.duration || "—")}</dd></div>
        <div><dt>成分</dt><dd>${escapeManagerHtml(spell.componentsZh || spell.components || "—")}</dd></div>
      </dl>
      <menu><span></span><button value="cancel" class="primary-button">关闭</button></menu>
    </form>`;
  dialog.showModal();
}

function renderSpellbookByLevel() {
  const known = managerState.spellbook
    .map(findManagerSpell)
    .filter(Boolean)
    .sort((a, b) => a.level - b.level || (a.nameZh || a.name).localeCompare(b.nameZh || b.name, "zh-CN"));
  const levels = [...new Set(known.map((spell) => spell.level))].sort((a, b) => a - b);
  if (!levels.length) {
    return `<div class="empty-state"><strong>法术书尚未记录法术</strong><p>点击“抄录法术”前往法术目录。</p></div>`;
  }
  return `<div class="spellbook-level-list">${levels
    .map((level) => {
      const cards = known.filter((spell) => spell.level === level).map((spell) => renderSpellCard(spell, "spellbook")).join("");
      return `<section class="spellbook-level"><header><span>${level === 0 ? "戏法" : `${level} 环`}</span><small>${known.filter((spell) => spell.level === level).length} 个法术</small></header><div class="catalog-grid spell-catalog-grid">${cards}</div></section>`;
    })
    .join("")}</div>`;
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
      const haystack = `${spell.name} ${spell.nameZh || ""} ${spell.alias || ""} ${spell.school} ${spell.descriptionZh || ""}`.toLowerCase();
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
    `共 ${matches.length} 个法术 · 当前显示 ${visible.length} 个 · SRD 5.1`;
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
    const canCopy = spell.classes?.includes("Wizard");
    primaryAction = known
      ? `<button class="text-button" type="button" disabled>已抄录</button>`
      : canCopy
        ? `<button class="text-button" type="button" data-add-spell="${spell.id}">抄录法术</button>`
        : `<button class="text-button" type="button" disabled>非本职业法术</button>`;
  }

  return `
    <article class="catalog-card spell-entry ${prepared ? "is-prepared" : ""}">
      <header>
        ${spellIcon(spell)}
        <div class="catalog-title">
          <span>${spell.level === 0 ? "戏法" : `${spell.level} 环`} · ${escapeManagerHtml(school)}</span>
          <h3>${escapeManagerHtml(displaySpellName(spell))}</h3>
          <small>${escapeManagerHtml(classes || "法术列表")}</small>
        </div>
      </header>
      <div class="catalog-tags">
        ${spell.ritual ? "<span>仪式</span>" : ""}
        ${spell.concentration ? "<span>专注</span>" : ""}
        <span>${escapeManagerHtml(spell.castingTimeZh || spell.castingTime || "—")}</span>
        <span>${escapeManagerHtml(spell.rangeZh || spell.range || "—")}</span>
      </div>
      <details>
        <summary>法术详情</summary>
        <p>${escapeManagerHtml(spell.descriptionZh || "暂无中文说明").replaceAll("\n", "<br>")}</p>
        ${spell.higherLevelZh ? `<p><strong>升环：</strong>${escapeManagerHtml(spell.higherLevelZh)}</p>` : ""}
        <dl>
          <div><dt>持续</dt><dd>${escapeManagerHtml(spell.durationZh || spell.duration || "—")}</dd></div>
          <div><dt>成分</dt><dd>${escapeManagerHtml(spell.componentsZh || spell.components || "—")}</dd></div>
        </dl>
        ${context === "spellbook" ? `<div class="detail-danger-zone"><button class="text-button danger" type="button" data-remove-spell="${spell.id}">从法术书移除</button></div>` : ""}
      </details>
      ${primaryAction ? `<footer class="catalog-actions">${primaryAction}</footer>` : ""}
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
  const spell = findManagerSpell(id);
  if (
    !window.confirm(
      `确定要将“${spell ? displaySpellName(spell) : "该法术"}”从甘阿·道夫的法术书中移除吗？\n\n已准备状态也会一并清除。`,
    )
  ) {
    return;
  }
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
  if (id && !spell) return;
  const isCustom = Boolean(spell?.custom);
  dialog.innerHTML = `
    <form method="dialog" id="spellEditorForm">
      <div class="dialog-heading">
        <div><p>ARCANE INDEX ENTRY</p><h2>${spell ? "编辑法术总览资料" : "添加自定义法术"}</h2></div>
        <button value="cancel" aria-label="关闭">×</button>
      </div>
      <div class="editor-grid">
        <label class="wide">中文名称<input name="nameZh" required value="${escapeManagerHtml(spell?.nameZh || spell?.alias || (spell ? spellAliases[spell.id] : "") || "")}" /></label>
        <label class="wide">英文名称<input name="name" required value="${escapeManagerHtml(spell?.name || "")}" /></label>
        <label>环级<select name="level">${Array.from({ length: 10 }, (_, level) => `<option value="${level}" ${spell?.level === level ? "selected" : ""}>${level === 0 ? "戏法" : `${level} 环`}</option>`).join("")}</select></label>
        <label>学派<select name="school">${Object.entries(schoolNames).map(([value, label]) => `<option value="${value}" ${spell?.school === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label>施法时间<input name="castingTimeZh" value="${escapeManagerHtml(spell?.castingTimeZh || spell?.castingTime || "")}" /></label>
        <label>距离<input name="rangeZh" value="${escapeManagerHtml(spell?.rangeZh || spell?.range || "")}" /></label>
        <label>持续时间<input name="durationZh" value="${escapeManagerHtml(spell?.durationZh || spell?.duration || "")}" /></label>
        <label>成分<input name="componentsZh" value="${escapeManagerHtml(spell?.componentsZh || spell?.components || "")}" /></label>
        <label class="wide">职业列表<input name="classes" value="${escapeManagerHtml((spell?.classes || ["Wizard"]).join(", "))}" placeholder="Wizard, Sorcerer" /></label>
        <label class="check-label"><input type="checkbox" name="ritual" ${spell?.ritual ? "checked" : ""} /> 仪式</label>
        <label class="check-label"><input type="checkbox" name="concentration" ${spell?.concentration ? "checked" : ""} /> 专注</label>
        <label class="wide">中文说明<textarea name="descriptionZh" rows="7">${escapeManagerHtml(spell?.descriptionZh || "")}</textarea></label>
        <label class="wide">中文升环效果<textarea name="higherLevelZh" rows="3">${escapeManagerHtml(spell?.higherLevelZh || "")}</textarea></label>
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
      nameZh: form.get("nameZh").trim(),
      alias: "",
      level: Number(form.get("level")),
      school: form.get("school"),
      classes: form
        .get("classes")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      castingTimeZh: form.get("castingTimeZh").trim(),
      rangeZh: form.get("rangeZh").trim(),
      durationZh: form.get("durationZh").trim(),
      componentsZh: form.get("componentsZh").trim(),
      ritual: form.get("ritual") === "on",
      concentration: form.get("concentration") === "on",
      descriptionZh: form.get("descriptionZh").trim(),
      higherLevelZh: form.get("higherLevelZh").trim(),
      custom: spell ? Boolean(spell.custom) : true,
    };
    if (entry.custom) {
      const index = managerState.customSpells.findIndex((candidate) => candidate.id === entry.id);
      if (index >= 0) managerState.customSpells[index] = entry;
      else managerState.customSpells.push(entry);
    } else {
      managerState.spellOverrides[entry.id] = entry;
    }
    saveManagerState();
    renderSpellManager();
    if (location.hash === "#spell-library" && typeof renderSpellLibrary === "function") renderSpellLibrary();
    dialog.close();
  });
  dialog.showModal();
}

function deleteCustomSpell(id) {
  const spell = findManagerSpell(id);
  if (!spell?.custom) return;
  if (!window.confirm(`确定要永久删除自定义法术“${displaySpellName(spell)}”吗？\n\n若甘阿·道夫已抄录该法术，也会一并移除。`)) {
    return;
  }
  managerState.customSpells = managerState.customSpells.filter((entry) => entry.id !== id);
  managerState.spellbook = managerState.spellbook.filter((spellId) => spellId !== id);
  managerState.prepared = managerState.prepared.filter((spellId) => spellId !== id);
  saveManagerState();
  renderSpellManager();
  document.querySelector("#spellEditorDialog").close();
  if (location.hash === "#spell-library" && typeof renderSpellLibrary === "function") renderSpellLibrary();
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
    ${renderCoinLedger()}
    <div class="inventory-overview">
      <div><span>条目</span><strong>${entries.length}</strong></div>
      <div><span>总重量</span><strong>${totalWeight.toFixed(1)} 磅</strong></div>
      <div><span>已装备</span><strong>${entries.filter((entry) => entry.equipped).length}</strong></div>
      <div><span>负重上限</span><strong>${managerState.abilities.STR * 15} 磅</strong></div>
    </div>`;
}

const coinDefinitions = [
  { key: "cp", short: "CP", name: "铜币", copper: 1, tone: "copper" },
  { key: "sp", short: "SP", name: "银币", copper: 10, tone: "silver" },
  { key: "ep", short: "EP", name: "琥珀金币", copper: 50, tone: "electrum" },
  { key: "gp", short: "GP", name: "金币", copper: 100, tone: "gold" },
  { key: "pp", short: "PP", name: "铂金币", copper: 1000, tone: "platinum" },
];

function totalCoinCopper() {
  return coinDefinitions.reduce(
    (total, coin) => total + Math.max(0, Number(managerState.coins[coin.key]) || 0) * coin.copper,
    0,
  );
}

function formattedGoldValue() {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(totalCoinCopper() / 100);
}

function updateCoinTotalDisplay() {
  const total = document.querySelector(".coin-total strong");
  if (total) total.textContent = `${formattedGoldValue()} GP`;
}

function renderCoinLedger() {
  return `
    <section class="coin-ledger" aria-labelledby="coinLedgerTitle">
      <header>
        <div class="coin-ledger-title">
          <span class="coin-purse-sigil" aria-hidden="true">◇</span>
          <div><p>COIN PURSE</p><h3 id="coinLedgerTitle">钱袋账本</h3></div>
        </div>
        <div class="coin-total"><span>折合金币</span><strong>${formattedGoldValue()} GP</strong></div>
      </header>
      <div class="coin-controls">
        ${coinDefinitions
          .map((coin) => {
            const amount = managerState.coins[coin.key];
            return `<div class="coin-control ${coin.tone}">
              <span class="coin-medallion" aria-hidden="true">${coin.short}</span>
              <label for="coin-${coin.key}"><strong>${coin.name}</strong><small>${coin.short}</small></label>
              <div class="coin-stepper">
                <button type="button" data-coin-step="${coin.key}" data-delta="-1" aria-label="${coin.name}减一">−</button>
                <input id="coin-${coin.key}" data-coin-input="${coin.key}" type="number" min="0" step="1" inputmode="numeric" value="${amount}" aria-label="${coin.name}数量" />
                <button type="button" data-coin-step="${coin.key}" data-delta="1" aria-label="${coin.name}加一">＋</button>
              </div>
            </div>`;
          })
          .join("")}
      </div>
      <p class="coin-exchange-note">1 PP = 10 GP · 1 GP = 2 EP = 10 SP = 100 CP</p>
    </section>`;
}

function renderInventoryManager() {
  const addItemButton = document.querySelector("#addItemButton");
  addItemButton.textContent = inventoryView === "catalog" ? "← 返回背包" : "＋ 添加物品";
  renderInventorySummary();
  const workspace = document.querySelector("#inventoryWorkspace");
  if (inventoryView === "catalog") {
    const itemTypes = [...new Set(allManagerItems().map((item) => item.type).filter(Boolean))].sort();
    const rarities = [...new Set(allManagerItems().map((item) => item.rarity).filter(Boolean))].sort();
    workspace.innerHTML = `
      <div class="catalog-controls item-controls">
        <label class="search-field"><span>搜索</span><input id="itemSearch" value="${escapeManagerHtml(itemFilters.search)}" placeholder="名称、类别或说明" /></label>
        <label><span>类别</span><select id="itemTypeFilter"><option value="all">全部</option>${itemTypes.map((value) => `<option value="${escapeManagerHtml(value)}" ${itemFilters.type === value ? "selected" : ""}>${escapeManagerHtml(displayItemType(value))}</option>`).join("")}</select></label>
        <label><span>稀有度</span><select id="itemRarityFilter"><option value="all">全部</option>${rarities.map((value) => `<option value="${escapeManagerHtml(value)}" ${itemFilters.rarity === value ? "selected" : ""}>${escapeManagerHtml(displayItemRarity(value))}</option>`).join("")}</select></label>
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
      : `<div class="empty-state"><strong>背包是空的</strong><p>点击“添加物品”前往全物品目录。</p></div>`;
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
      const haystack = `${item.name} ${item.nameZh || ""} ${item.type} ${item.category} ${item.descriptionZh || ""}`.toLowerCase();
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
    `共 ${matches.length} 件物品 · 当前显示 ${visible.length} 件 · SRD 5.1 + 角色自有物品`;
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
          <span>${escapeManagerHtml(displayItemRarity(item.rarity))} · ${escapeManagerHtml(displayItemType(item.type))}</span>
          <h3>${escapeManagerHtml(displayItemName(item))}</h3>
          <small>${escapeManagerHtml(item.category || "Equipment")}</small>
        </div>
      </header>
      <div class="catalog-tags">
        ${item.cost ? `<span>${escapeManagerHtml(item.cost)}</span>` : ""}
        ${item.weight ? `<span>${item.weight} 磅</span>` : ""}
        ${item.damage ? `<span>${escapeManagerHtml(displayItemDamage(item.damage))}</span>` : ""}
        ${item.armorClass ? `<span>AC ${item.armorClass}</span>` : ""}
      </div>
      <details><summary>物品说明</summary><p>${escapeManagerHtml(item.descriptionZh || "暂无中文说明").replaceAll("\n", "<br>")}</p></details>
      <footer class="catalog-actions">
        <button class="text-button" type="button" data-add-item="${item.id}">${inventoryEntry ? `增加数量（${inventoryEntry.quantity}）` : "加入背包"}</button>
      </footer>
    </article>`;
}

function renderInventoryCard(item, entry) {
  return `
    <article class="catalog-card item-entry ${entry.equipped ? "is-equipped" : ""}">
      <header>
        ${itemIcon(item)}
        <div class="catalog-title">
          <span>${entry.equipped ? "已装备" : escapeManagerHtml(displayItemRarity(item.rarity))}</span>
          <h3>${escapeManagerHtml(displayItemName(item))}</h3>
          <small>${escapeManagerHtml(displayItemType(item.type))}${entry.notes ? ` · ${escapeManagerHtml(entry.notes)}` : ""}</small>
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
      <details>
        <summary>物品说明</summary>
        <p>${escapeManagerHtml(item.descriptionZh || item.description || "暂无说明").replaceAll("\n", "<br>")}</p>
        <div class="detail-danger-zone"><button class="text-button danger" type="button" data-remove-item="${item.id}">从背包移除</button></div>
      </details>
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
  const item = findManagerItem(id);
  const entry = managerState.inventory.find((candidate) => candidate.id === id);
  if (
    !window.confirm(
      `确定要将“${item ? displayItemName(item) : "该物品"}”从甘阿·道夫的背包中移除吗？\n\n当前持有的 ${entry?.quantity || 1} 件会一并移除。`,
    )
  ) {
    return;
  }
  managerState.inventory = managerState.inventory.filter((entry) => entry.id !== id);
  saveManagerState();
  renderInventoryManager();
}

function updateItemQuantity(id, delta) {
  const entry = managerState.inventory.find((item) => item.id === id);
  if (!entry) return;
  const nextQuantity = Math.max(0, entry.quantity + delta);
  if (nextQuantity === 0) removeItemFromInventory(id);
  else {
    entry.quantity = nextQuantity;
    saveManagerState();
    renderInventoryManager();
  }
}

function openItemEditor(id = null) {
  const dialog = document.querySelector("#itemEditorDialog");
  const item = id ? findManagerItem(id) : null;
  const isCustom = item?.custom;
  dialog.innerHTML = `
    <form method="dialog" id="itemEditorForm">
      <div class="dialog-heading">
        <div><p>RELIQUARY INDEX ENTRY</p><h2>${item ? "编辑道具总览资料" : "添加自定义物品"}</h2></div>
        <button value="cancel" aria-label="关闭">×</button>
      </div>
      <div class="editor-grid">
        <label class="wide">中文名称<input name="nameZh" required value="${escapeManagerHtml(item?.nameZh || (item?.custom ? item?.name : "") || "")}" /></label>
        <label class="wide">英文名称<input name="name" required value="${escapeManagerHtml(item?.name || "")}" /></label>
        <label>类别<input name="type" value="${escapeManagerHtml(item?.type || "Adventuring Gear")}" /></label>
        <label>子类别<input name="category" value="${escapeManagerHtml(item?.category || "")}" /></label>
        <label>稀有度<input name="rarity" value="${escapeManagerHtml(item?.rarity || "Common")}" /></label>
        <label>价值<input name="cost" value="${escapeManagerHtml(item?.cost || "")}" /></label>
        <label>重量（磅）<input name="weight" type="number" min="0" step="0.1" value="${Number(item?.weight || 0)}" /></label>
        <label>伤害<input name="damage" value="${escapeManagerHtml(item?.damage || "")}" /></label>
        <label>护甲等级<input name="armorClass" type="number" min="0" value="${item?.armorClass || ""}" /></label>
        <label class="wide">属性标签<input name="properties" value="${escapeManagerHtml((item?.properties || []).join(", "))}" placeholder="Light, Finesse, Story" /></label>
        <label class="wide">中文说明<textarea name="descriptionZh" rows="6">${escapeManagerHtml(item?.descriptionZh || item?.description || "")}</textarea></label>
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
      nameZh: form.get("nameZh").trim(),
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
      descriptionZh: form.get("descriptionZh").trim(),
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
    saveManagerState();
    renderInventoryManager();
    if (location.hash === "#item-library" && typeof renderItemLibrary === "function") renderItemLibrary();
    dialog.close();
  });
  dialog.showModal();
}

function deleteCustomItem(id) {
  const item = findManagerItem(id);
  if (!item?.custom) return;
  if (!window.confirm(`确定要永久删除自定义物品“${displayItemName(item)}”吗？\n\n若甘阿·道夫已持有该物品，也会一并移除。`)) {
    return;
  }
  managerState.customItems = managerState.customItems.filter((item) => item.id !== id);
  managerState.inventory = managerState.inventory.filter((entry) => entry.id !== id);
  saveManagerState();
  renderInventoryManager();
  document.querySelector("#itemEditorDialog").close();
  if (location.hash === "#item-library" && typeof renderItemLibrary === "function") renderItemLibrary();
}

function renderFeatManager() {
  const list = document.querySelector("#featList");
  if (!managerState.feats.length) {
    list.innerHTML = `<div class="feat-empty"><strong>暂无专长</strong><p>甘阿·道夫目前为 3 级；2014 版专长属于可选规则，通常在属性值提升等级经 DM 允许后选择。</p></div>`;
    return;
  }
  list.innerHTML = managerState.feats
    .map(
      (feat) => `
        <article class="feat-card">
          <div class="feat-card-heading"><span>${escapeManagerHtml(feat.source || "自定义专长")}</span><small>${Number(feat.acquiredAtLevel) ? `${Number(feat.acquiredAtLevel)} 级获得` : "手动设置"}</small></div>
          <h4>${escapeManagerHtml(feat.name)}</h4>
          ${feat.prerequisite ? `<p class="feat-prerequisite"><strong>先决条件：</strong>${escapeManagerHtml(feat.prerequisite)}</p>` : ""}
          <p>${escapeManagerHtml(feat.description || "暂无效果说明").replaceAll("\n", "<br>")}</p>
        </article>`,
    )
    .join("");
}

function openFeatDialog() {
  const dialog = document.querySelector("#featDialog");
  dialog.innerHTML = `
    <form method="dialog" id="featForm">
      <div class="dialog-heading">
        <div><p>OPTIONAL CHARACTER RULE</p><h2>专长设置</h2></div>
        <button value="cancel" aria-label="关闭专长设置">×</button>
      </div>
      <p class="dialog-note">2014 版专长属于可选规则，是否可用及具体来源由 DM 决定。此处只保存角色已获得的专长，不会自动修改属性或战斗数值。</p>
      <div class="feat-dialog-list">
        ${
          managerState.feats.length
            ? managerState.feats
                .map(
                  (feat) => `<article><div><strong>${escapeManagerHtml(feat.name)}</strong><small>${escapeManagerHtml(feat.source || "自定义专长")} · ${Number(feat.acquiredAtLevel) || managerState.level} 级</small></div><button class="text-button danger" type="button" data-remove-feat="${feat.id}">移除</button></article>`,
                )
                .join("")
            : `<div class="feat-dialog-empty">当前没有已记录的专长。</div>`
        }
      </div>
      <fieldset>
        <legend>添加已获得专长</legend>
        <div class="editor-grid">
          <label>专长名称<input name="name" required maxlength="60" /></label>
          <label>获得等级<input name="acquiredAtLevel" type="number" min="1" max="20" value="${managerState.level}" /></label>
          <label class="wide">规则来源<input name="source" value="2014 可选专长 · DM 许可" maxlength="100" /></label>
          <label class="wide">先决条件<input name="prerequisite" placeholder="没有则留空" maxlength="160" /></label>
          <label class="wide">效果说明<textarea name="description" rows="5" required placeholder="记录该专长对角色产生的规则效果"></textarea></label>
        </div>
      </fieldset>
      <menu><button value="cancel" class="ghost-button">关闭</button><button value="default" class="primary-button">保存专长</button></menu>
    </form>`;

  dialog.querySelectorAll('[value="cancel"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.close();
    });
  });
  dialog.querySelectorAll("[data-remove-feat]").forEach((button) => {
    button.addEventListener("click", () => {
      const feat = managerState.feats.find((entry) => entry.id === button.dataset.removeFeat);
      if (!feat || !window.confirm(`确定移除专长“${feat.name}”吗？`)) return;
      managerState.feats = managerState.feats.filter((entry) => entry.id !== feat.id);
      saveManagerState();
      renderFeatManager();
      dialog.close();
      openFeatDialog();
    });
  });
  dialog.querySelector("#featForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") return;
    const formData = new FormData(event.currentTarget);
    managerState.feats.push({
      id: `feat-${Date.now()}`,
      name: String(formData.get("name") || "").trim(),
      source: String(formData.get("source") || "").trim(),
      prerequisite: String(formData.get("prerequisite") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      acquiredAtLevel: Math.max(1, Math.min(20, Number(formData.get("acquiredAtLevel")) || managerState.level)),
    });
    saveManagerState();
    renderFeatManager();
    dialog.close();
  });
  dialog.showModal();
}

function levelFeatureSummary(level) {
  const messages = [];
  if ([4, 8, 12, 16, 19].includes(level)) messages.push("获得属性值提升；若 DM 允许可选专长规则，也可改为选择一个专长。");
  if ([4, 10].includes(level)) messages.push("额外学会 1 个法师戏法。");
  if (level === 6) messages.push("剑咏：额外攻击。");
  if (level === 10) messages.push("剑咏：防御之歌。");
  if (level === 14) messages.push("剑咏：胜利之歌。");
  if (level === 18) messages.push("法师：法术精通。");
  if (level === 20) messages.push("法师：招牌法术。");
  return messages;
}

function openLevelUpDialog() {
  if (managerState.level >= 20) {
    window.alert("甘阿·道夫已达到 20 级。");
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
          ? `<fieldset class="advancement-choice"><legend>属性值提升或专长</legend>
              <p class="field-help">2014 版可选规则：选择属性值提升，或经 DM 允许后改为获得一个专长。</p>
              <div class="advancement-mode" role="radiogroup" aria-label="成长方式">
                <label><input type="radio" name="advancementMode" value="asi" checked /> 属性值提升</label>
                <label><input type="radio" name="advancementMode" value="feat" /> 选择专长</label>
              </div>
              <div id="asiAdvancementFields"><p class="field-help">选择两次 +1；选择同一属性即为该属性 +2，单项不能超过 20。</p><div class="asi-grid">${["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((key) => `<label>${key}<select name="asi${key}"><option value="0">+0</option><option value="1">+1</option><option value="2">+2</option></select></label>`).join("")}</div><p class="selection-count" id="asiCount">已分配 0 / 2</p></div>
              <div class="level-feat-fields" id="featAdvancementFields" hidden>
                <div class="editor-grid">
                  <label>专长名称<input name="featName" maxlength="60" /></label>
                  <label>规则来源<input name="featSource" value="2014 可选专长 · DM 许可" maxlength="100" /></label>
                  <label class="wide">先决条件<input name="featPrerequisite" placeholder="没有则留空" maxlength="160" /></label>
                  <label class="wide">效果说明<textarea name="featDescription" rows="4" placeholder="记录专长产生的规则效果"></textarea></label>
                </div>
              </div>
            </fieldset>`
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
    const syncAdvancementMode = () => {
      const mode = form.querySelector('[name="advancementMode"]:checked').value;
      dialog.querySelector("#asiAdvancementFields").hidden = mode !== "asi";
      dialog.querySelector("#featAdvancementFields").hidden = mode !== "feat";
    };
    form.querySelectorAll('[name="advancementMode"]').forEach((input) => input.addEventListener("change", syncAdvancementMode));
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
    let gainedFeat = null;
    if (gainsAsi) {
      const advancementMode = formData.get("advancementMode") || "asi";
      if (advancementMode === "feat") {
        const featName = String(formData.get("featName") || "").trim();
        const featDescription = String(formData.get("featDescription") || "").trim();
        if (!featName || !featDescription) {
          window.alert("选择专长时必须填写专长名称和效果说明。");
          return;
        }
        gainedFeat = {
          id: `feat-${Date.now()}`,
          name: featName,
          source: String(formData.get("featSource") || "").trim(),
          prerequisite: String(formData.get("featPrerequisite") || "").trim(),
          description: featDescription,
          acquiredAtLevel: nextLevel,
        };
      } else {
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
    if (gainedFeat) managerState.feats.push(gainedFeat);
    managerState.levelHistory.push({
      level: nextLevel,
      hpGain,
      spells: learned,
      cantrip: gainsCantrip ? formData.get("newCantrip") : null,
      feat: gainedFeat,
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
    renderFeatManager();
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

  const addSpellButton = event.target.closest("[data-add-spell]");
  if (addSpellButton) addSpellToBook(addSpellButton.dataset.addSpell);

  const removeSpellButton = event.target.closest("[data-remove-spell]");
  if (removeSpellButton) removeSpellFromBook(removeSpellButton.dataset.removeSpell);

  const preparationModeButton = event.target.closest("[data-toggle-preparation-mode]");
  if (preparationModeButton) {
    spellPreparationMode = !spellPreparationMode;
    renderSpellManager();
  }

  const loadoutSpellButton = event.target.closest("[data-loadout-spell]");
  if (loadoutSpellButton) {
    const spell = findManagerSpell(loadoutSpellButton.dataset.loadoutSpell);
    if (spellPreparationMode && spell?.level > 0) {
      togglePreparedSpell(spell.id);
    } else {
      openSpellDetail(spell?.id);
    }
  }

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

  const coinStepButton = event.target.closest("[data-coin-step]");
  if (coinStepButton) {
    const key = coinStepButton.dataset.coinStep;
    const delta = Number(coinStepButton.dataset.delta);
    managerState.coins[key] = Math.max(0, Math.min(9999999, managerState.coins[key] + delta));
    saveManagerState();
    renderInventorySummary();
  }

  const editItemButton = event.target.closest("[data-edit-item]");
  if (editItemButton) openItemEditor(editItemButton.dataset.editItem);

  const deleteItemButton = event.target.closest("[data-delete-custom-item]");
  if (deleteItemButton) deleteCustomItem(deleteItemButton.dataset.deleteCustomItem);
});

document.querySelector("#copySpellButton").addEventListener("click", () => {
  spellView = spellView === "catalog" ? "prepared" : "catalog";
  renderSpellManager();
});
document.querySelector("#addItemButton").addEventListener("click", () => {
  inventoryView = inventoryView === "catalog" ? "carried" : "catalog";
  renderInventoryManager();
});
document.querySelector("#levelUpButton").addEventListener("click", openLevelUpDialog);
document.querySelector("#manageFeatButton").addEventListener("click", openFeatDialog);

document.querySelector("#inventorySummary").addEventListener("change", (event) => {
  const input = event.target.closest("[data-coin-input]");
  if (!input) return;
  const key = input.dataset.coinInput;
  managerState.coins[key] = Math.max(0, Math.min(9999999, Math.floor(Number(input.value) || 0)));
  saveManagerState();
  renderInventorySummary();
});

document.querySelector("#inventorySummary").addEventListener("input", (event) => {
  const input = event.target.closest("[data-coin-input]");
  if (!input) return;
  const key = input.dataset.coinInput;
  managerState.coins[key] = Math.max(0, Math.min(9999999, Math.floor(Number(input.value) || 0)));
  saveManagerState();
  updateCoinTotalDisplay();
});

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

const characterMain = document.querySelector("#characterApp main");
const spellSection = document.querySelector("#spells");
const equipmentSection = document.querySelector("#equipment");
const featureSection = document.querySelector("#features");
characterMain.insertBefore(spellSection, featureSection);
characterMain.insertBefore(equipmentSection, featureSection);

syncCharacterSheet();
renderSpellManager();
renderInventoryManager();
renderFeatManager();
