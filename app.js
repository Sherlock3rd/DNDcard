const abilities = [
  {
    key: "STR",
    name: "力量",
    score: 17,
    mod: 3,
    skills: [{ name: "运动", value: 3 }],
  },
  {
    key: "DEX",
    name: "敏捷",
    score: 15,
    mod: 2,
    skills: [
      { name: "杂技", value: 2 },
      { name: "巧手", value: 2 },
      { name: "隐匿", value: 2 },
    ],
  },
  {
    key: "CON",
    name: "体质",
    score: 14,
    mod: 2,
    skills: [],
  },
  {
    key: "INT",
    name: "智力",
    score: 16,
    mod: 3,
    skills: [
      { name: "奥秘", value: 5, proficient: true },
      { name: "历史", value: 5, proficient: true },
      { name: "调查", value: 3 },
      { name: "自然", value: 3 },
      { name: "宗教", value: 5, proficient: true },
    ],
  },
  {
    key: "WIS",
    name: "感知",
    score: 13,
    mod: 1,
    skills: [
      { name: "驯兽", value: 1 },
      { name: "洞悉", value: 3, proficient: true },
      { name: "医药", value: 1 },
      { name: "察觉", value: 1 },
      { name: "生存", value: 1 },
    ],
  },
  {
    key: "CHA",
    name: "魅力",
    score: 6,
    mod: -2,
    skills: [
      { name: "欺瞒", value: -2 },
      { name: "威吓", value: -2 },
      { name: "表演", value: -2 },
      { name: "游说", value: -2 },
    ],
  },
];

const features = [
  {
    source: "人类 · 种族",
    name: "人类特质",
    text: "2014 版标准人类：体型中型，基础步行速度 30 尺，六项属性各提高 1（已计入当前最终属性），并额外掌握一种标准语言。",
  },
  {
    source: "法师 · 1 级",
    name: "奥术回想",
    text: "每日一次完成短休后，可恢复总环级不超过 2 的已消耗法术位；不能恢复 6 环或更高法术位。",
  },
  {
    source: "法师 · 1 级",
    name: "法术书与仪式施法",
    text: "法术书记录 10 个一环及以上法师法术。书中带仪式标签的法术无需准备即可用仪式方式施展。",
  },
  {
    source: "剑咏 · 2 级",
    name: "战法训练",
    text: "掌握轻甲与近战武器训练，并以剑势、步伐和呼吸记忆魔力运行的轨迹。",
  },
  {
    source: "剑咏 · 塔莎修订版",
    name: "剑歌",
    text: "以附赠动作开启持续 1 分钟的剑歌；可用次数等于熟练加值，长休后恢复。期间获得智力调整值提供的护甲加值，并强化速度、专注与敏捷表现。当前基础 AC 14，剑歌中 AC 17。",
  },
  {
    source: "2014 自定义背景",
    name: "赌客 · 牌桌识人",
    text: "按自定义背景规则构筑：宗教、洞悉来自背景，奥秘、历史来自法师。以牌局接近陌生人、交换消息并观察人心。",
  },
  {
    source: "易容帽 · 同调",
    name: "千面旅人",
    text: "可随意施放伪装术而不消耗法术位。最常伪装成白发、佝偻的旅行老法师，以不同身份观察世界。",
  },
];

const inventory = [
  ["魔法书", "3 磅 · 10 个法术"],
  ["父亲的旧长剑", "遗物 · 普通长剑"],
  ["母亲的旧纸牌", "遗物 · 边角磨白"],
  ["易容帽", "非普通奇物 · 需同调"],
  ["法术材料包", "施法材料"],
  ["旅行者套组", "背包、口粮、绳索与旅途用品"],
  ["长棍", "4 磅 · 1d6+3 钝击"],
  ["轻弩", "5 磅 · 1d8+2 穿刺"],
  ["弩矢", "20 支 · 轻弩弹药"],
  ["轻甲", "当前 AC 14"],
  ["旅行衣物", "老人伪装常用装束"],
];

const spells = [
  {
    level: 0,
    name: "火焰箭",
    school: "塑能戏法",
    casting: "1 动作",
    range: "120 尺",
    duration: "立即",
    components: "V、S",
    prepared: true,
  },
  {
    level: 0,
    name: "光亮术",
    school: "塑能戏法",
    casting: "1 动作",
    range: "接触",
    duration: "1 小时",
    components: "V、S",
    prepared: true,
  },
  {
    level: 0,
    name: "轰雷剑",
    school: "塑能戏法",
    casting: "1 动作",
    range: "自身（5 尺）",
    duration: "1 轮",
    components: "S、M（近战武器）",
    prepared: true,
  },
  {
    level: 1,
    name: "侦测魔法",
    school: "预言 1 环 · 仪式",
    casting: "1 动作",
    range: "自身",
    duration: "专注，10 分钟",
    components: "V、S、M",
    prepared: false,
  },
  {
    level: 1,
    name: "护盾术",
    school: "防护 1 环",
    casting: "1 反应",
    range: "自身",
    duration: "1 轮",
    components: "V、S",
    prepared: true,
  },
  {
    level: 1,
    name: "吸收元素",
    school: "防护 1 环",
    casting: "1 反应",
    range: "自身",
    duration: "1 轮",
    components: "S",
    prepared: true,
  },
  {
    level: 1,
    name: "雷鸣波",
    school: "塑能 1 环",
    casting: "1 动作",
    range: "自身（15 尺立方）",
    duration: "立即",
    components: "V、S",
    prepared: true,
  },
  {
    level: 1,
    name: "获得魔宠",
    school: "咒法 1 环 · 仪式",
    casting: "1 小时",
    range: "10 尺",
    duration: "立即",
    components: "V、S、M",
    prepared: false,
  },
  {
    level: 1,
    name: "法师护甲",
    school: "防护 1 环",
    casting: "1 动作",
    range: "接触",
    duration: "8 小时",
    components: "V、S、M",
    prepared: false,
  },
  {
    level: 1,
    name: "魔法飞弹",
    school: "塑能 1 环",
    casting: "1 动作",
    range: "120 尺",
    duration: "立即",
    components: "V、S",
    prepared: true,
  },
  {
    level: 1,
    name: "睡眠术",
    school: "惑控 1 环",
    casting: "1 动作",
    range: "90 尺",
    duration: "1 分钟",
    components: "V、S、M",
    prepared: false,
  },
  {
    level: 2,
    name: "迷踪步",
    school: "咒法 2 环",
    casting: "1 附赠动作",
    range: "自身",
    duration: "立即",
    components: "V",
    prepared: true,
  },
  {
    level: 2,
    name: "镜影术",
    school: "幻术 2 环",
    casting: "1 动作",
    range: "自身",
    duration: "1 分钟",
    components: "V、S",
    prepared: true,
  },
];

const defaults = {
  hp: 20,
  maxHp: 20,
  tempHp: 0,
  slot1: 4,
  slot2: 2,
  bladesongUses: 2,
  bladesongActive: false,
  conditions: [],
};

const conditionCatalog = [
  { id: "concentrating", name: "专注", category: "通用", effect: "正在维持一个专注法术" },
  { id: "bless", name: "祝福术", category: "法术增益", effect: "攻击检定与豁免 +1d4", modifiers: { attackDice: ["1d4"], saveDice: ["1d4"] } },
  { id: "guidance", name: "神导术", category: "法术增益", effect: "一次属性检定 +1d4", modifiers: { checkDice: ["1d4"] } },
  { id: "resistance", name: "抗力术", category: "法术增益", effect: "一次豁免 +1d4", modifiers: { saveDice: ["1d4"] } },
  { id: "mage-armor", name: "法师护甲", category: "防护法术", effect: "未穿护甲时基础 AC = 13 + 敏捷", modifiers: { unarmoredBaseAc: 13 } },
  { id: "shield", name: "护盾术", category: "防护法术", effect: "AC +5，持续至下回合开始", modifiers: { acBonus: 5 } },
  { id: "mirror-image", name: "镜影术", category: "防护法术", effect: "三道镜像转移攻击，不直接改变 AC" },
  { id: "shield-of-faith", name: "虔诚护盾", category: "防护法术", effect: "AC +2（专注）", modifiers: { acBonus: 2 } },
  { id: "haste", name: "加速术", category: "法术增益", effect: "AC +2、速度翻倍、敏捷豁免优势", modifiers: { acBonus: 2, speedMultiplier: 2, advantages: ["敏捷豁免"] } },
  { id: "longstrider", name: "大步奔行", category: "法术增益", effect: "速度 +10 尺", modifiers: { speedBonus: 10 } },
  { id: "aid", name: "援助术", category: "法术增益", effect: "生命上限与当前生命提高，数值按施法环位记录" },
  { id: "heroism", name: "英雄气概", category: "法术增益", effect: "免疫恐慌，并在每回合获得临时生命（专注）" },
  { id: "protection-evil-good", name: "防护善恶", category: "防护法术", effect: "指定生物类型攻击劣势，且更难魅惑、恐慌或附身" },
  { id: "invisibility", name: "隐形术", category: "法术增益", effect: "隐形；攻击或施法后通常结束（专注）" },
  { id: "greater-invisibility", name: "高等隐形术", category: "法术增益", effect: "隐形且攻击、施法不结束（专注）" },
  { id: "fly", name: "飞行术", category: "移动法术", effect: "获得 60 尺飞行速度（专注）" },
  { id: "darkvision", name: "黑暗视觉", category: "感官法术", effect: "获得 60 尺黑暗视觉" },
  { id: "see-invisibility", name: "识破隐形", category: "感官法术", effect: "看见隐形生物及以太位面" },
  { id: "death-ward", name: "防死结界", category: "防护法术", effect: "首次降至 0 生命时改为 1，或抵消一次即死效果" },
  { id: "freedom-of-movement", name: "行动自如", category: "移动法术", effect: "忽略困难地形及多种束缚移动的效果" },
  { id: "pass-without-trace", name: "行踪无迹", category: "法术增益", effect: "隐匿检定 +10（专注）", modifiers: { skillBonuses: { 隐匿: 10 } } },
  { id: "enhance-ability", name: "强化属性", category: "法术增益", effect: "所选属性检定具有优势（专注）" },
  { id: "bardic-inspiration", name: "吟游激励 d6", category: "其他增益", effect: "一次属性检定、攻击或豁免可追加 1d6" },
  { id: "blinded", name: "目盲", category: "不利状态", effect: "攻击具有劣势；针对你的攻击具有优势" },
  { id: "charmed", name: "魅惑", category: "不利状态", effect: "不能攻击魅惑者，魅惑者对你的社交检定具有优势" },
  { id: "deafened", name: "耳聋", category: "不利状态", effect: "自动失败依赖听觉的检定" },
  { id: "frightened", name: "恐慌", category: "不利状态", effect: "看见恐惧源时检定与攻击劣势，且不能主动接近" },
  { id: "grappled", name: "擒抱", category: "不利状态", effect: "速度变为 0" },
  { id: "incapacitated", name: "失能", category: "不利状态", effect: "不能执行动作或反应" },
  { id: "paralyzed", name: "麻痹", category: "不利状态", effect: "失能、不能移动；力量与敏捷豁免自动失败" },
  { id: "petrified", name: "石化", category: "不利状态", effect: "失能、不能移动，并获得多项抗性与豁免变化" },
  { id: "poisoned", name: "中毒", category: "不利状态", effect: "攻击检定与属性检定具有劣势" },
  { id: "prone", name: "倒地", category: "不利状态", effect: "移动需爬行；攻击劣势，近战攻击者通常具有优势" },
  { id: "restrained", name: "束缚", category: "不利状态", effect: "速度为 0；攻击劣势，针对你的攻击具有优势" },
  { id: "stunned", name: "震慑", category: "不利状态", effect: "失能；力量与敏捷豁免自动失败" },
  { id: "unconscious", name: "昏迷", category: "不利状态", effect: "失能、倒地且无法感知周围" },
];

const conditionById = new Map(conditionCatalog.map((condition) => [condition.id, condition]));
const conditionByName = new Map(conditionCatalog.map((condition) => [condition.name, condition]));

function resolveCondition(value) {
  const raw = typeof value === "object" && value ? value.id || value.name : value;
  const key = String(raw || "").replace(/^preset:/, "").trim();
  return conditionById.get(key) || conditionByName.get(key) || { id: `custom:${key}`, name: key, category: "自定义", effect: "自定义状态，未设置自动修正" };
}

function activeConditionModifiers() {
  const combined = {
    acBonus: 0,
    speedBonus: 0,
    speedMultiplier: 1,
    unarmoredBaseAc: null,
    attackDice: [],
    saveDice: [],
    checkDice: [],
    skillBonuses: {},
    advantages: [],
  };
  state.conditions.map(resolveCondition).forEach((condition) => {
    const modifiers = condition.modifiers || {};
    combined.acBonus += Number(modifiers.acBonus || 0);
    combined.speedBonus += Number(modifiers.speedBonus || 0);
    combined.speedMultiplier *= Number(modifiers.speedMultiplier || 1);
    if (Number.isFinite(modifiers.unarmoredBaseAc)) combined.unarmoredBaseAc = Math.max(combined.unarmoredBaseAc || 0, modifiers.unarmoredBaseAc);
    combined.attackDice.push(...(modifiers.attackDice || []));
    combined.saveDice.push(...(modifiers.saveDice || []));
    combined.checkDice.push(...(modifiers.checkDice || []));
    combined.advantages.push(...(modifiers.advantages || []));
    Object.entries(modifiers.skillBonuses || {}).forEach(([skill, bonus]) => {
      combined.skillBonuses[skill] = (combined.skillBonuses[skill] || 0) + Number(bonus || 0);
    });
  });
  return combined;
}

window.getActiveConditionModifiers = activeConditionModifiers;

let state = loadState();

function signed(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function diceSuffix(dice) {
  return dice?.length ? ` ${dice.map((value) => `+${value}`).join(" ")}` : "";
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("gandalf-5e-state") || "{}");
    return {
      ...defaults,
      ...saved,
      conditions: Array.isArray(saved.conditions)
        ? saved.conditions
            .map((condition) => (typeof condition === "object" && condition ? condition.id || condition.name : condition))
            .map((condition) => String(condition || "").trim())
            .filter(Boolean)
            .filter((condition, index, entries) => entries.findIndex((entry) => resolveCondition(entry).id === resolveCondition(condition).id) === index)
        : [],
    };
  } catch {
    return { ...defaults };
  }
}

function saveState() {
  localStorage.setItem("gandalf-5e-state", JSON.stringify(state));
  const el = document.querySelector("#saveState");
  el.textContent = "状态已保存";
  window.clearTimeout(saveState.timer);
  saveState.timer = window.setTimeout(() => {
    el.textContent = "本地档案已同步";
  }, 1400);
}

function renderAbilities() {
  const conditionModifiers = activeConditionModifiers();
  document.querySelector("#abilityGrid").innerHTML = abilities
    .map(
      (ability) => `
        <article class="ability-card">
          <span class="ability-name">${ability.name} · ${ability.key}</span>
          <strong class="ability-mod">${signed(ability.mod)}</strong>
          <span class="ability-score">${ability.score}</span>
          ${
            ability.skills.length
              ? `<ul>${ability.skills
                  .map(
                    (skill) => {
                      const statusBonus = Number(conditionModifiers.skillBonuses[skill.name] || 0);
                      return `<li class="${skill.proficient ? "proficient" : ""}" ${skill.name === "杂技" ? 'id="acrobaticsSkill"' : ""}>${skill.name} ${signed(skill.value + statusBonus)}${diceSuffix(conditionModifiers.checkDice)}${skill.name === "杂技" && state.bladesongActive ? " · 优势" : ""}</li>`;
                    },
                  )
                  .join("")}</ul>`
              : `<ul><li>体质检定 ${signed(ability.mod)}${diceSuffix(conditionModifiers.checkDice)}</li></ul>`
          }
        </article>
      `,
    )
    .join("");
}

function renderFeatures() {
  document.querySelector("#featureGrid").innerHTML = features
    .map(
      (feature) => `
        <article class="ornate-card feature-card">
          <span class="tag">${feature.source}</span>
          <h3>${feature.name}</h3>
          <p>${feature.text}</p>
        </article>
      `,
    )
    .join("");
}

function renderInventory() {
  document.querySelector("#inventoryList").innerHTML = inventory
    .map(([name, note]) => `<li><span>${name}</span><small>${note}</small></li>`)
    .join("");
}

function renderSpells(filter = "all") {
  const visible = filter === "all" ? spells : spells.filter((spell) => `${spell.level}` === filter);
  document.querySelector("#spellGrid").innerHTML = visible
    .map(
      (spell) => `
        <article class="spell-card">
          <header>
            <div>
              <h3>${spell.name}</h3>
              <span class="spell-school">${spell.school}</span>
            </div>
            ${spell.prepared ? `<span class="prepared-badge">已准备</span>` : ""}
          </header>
          <dl>
            <div><dt>施法时间</dt><dd>${spell.casting}</dd></div>
            <div><dt>距离</dt><dd>${spell.range}</dd></div>
            <div><dt>持续时间</dt><dd>${spell.duration}</dd></div>
            <div><dt>成分</dt><dd>${spell.components}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderState() {
  const intMod = abilities.find((ability) => ability.key === "INT")?.mod ?? 0;
  const conMod = abilities.find((ability) => ability.key === "CON")?.mod ?? 0;
  const dexMod = abilities.find((ability) => ability.key === "DEX")?.mod ?? 0;
  const derived = window.getCharacterDerivedState?.() || { baseArmorClass: 14, baseSpeed: 30, wearingArmor: true, initiativeBonus: dexMod };
  const conditionModifiers = activeConditionModifiers();
  const mageArmorClass = conditionModifiers.unarmoredBaseAc && !derived.wearingArmor
    ? conditionModifiers.unarmoredBaseAc + dexMod
    : 0;
  const baseArmorClass = Math.max(Number(derived.baseArmorClass || 10 + dexMod), mageArmorClass);
  const armorClass = baseArmorClass + conditionModifiers.acBonus + (state.bladesongActive ? intMod : 0);
  const speed = (Number(derived.baseSpeed || 30) + conditionModifiers.speedBonus + (state.bladesongActive ? 10 : 0)) * conditionModifiers.speedMultiplier;
  const concentrationSave = conMod + (state.bladesongActive ? intMod : 0);
  document.querySelector("#hpValue").value = state.hp;
  document.querySelector("#tempHpValue").value = state.tempHp;
  document.querySelector("#bladesongUses").value = state.bladesongUses;
  document.querySelector("#armorClassValue").textContent = armorClass;
  const armorSources = [];
  if (conditionModifiers.unarmoredBaseAc) armorSources.push(derived.wearingArmor ? "法师护甲未生效（正穿护甲）" : "法师护甲");
  if (conditionModifiers.acBonus) armorSources.push(`状态 +${conditionModifiers.acBonus}`);
  if (state.bladesongActive) armorSources.push(`剑歌 +${intMod}`);
  document.querySelector("#armorClassMeta").textContent = armorSources.join(" · ") || `${derived.wearingArmor ? "轻甲" : "基础防护"} · 剑歌 ${baseArmorClass + intMod}`;
  const initiativeValue = document.querySelector("#initiativeValue");
  if (initiativeValue) initiativeValue.textContent = signed(Number(derived.initiativeBonus ?? dexMod));
  document.querySelector("#speedValue").textContent = speed;
  document.querySelector("#speedMeta").textContent = state.bladesongActive ? "尺 · 剑歌 +10" : "尺";
  document.querySelector("#bladesongStatus").textContent = state.bladesongActive ? `剑歌进行中 · AC ${armorClass}` : `未开启 · 当前 AC ${armorClass}`;
  document.querySelector("#bladesongAcEffect").textContent = `AC ${armorClass}`;
  document.querySelector("#bladesongSpeedEffect").textContent = `速度 ${speed} 尺`;
  document.querySelector("#bladesongAcrobaticsEffect").textContent = state.bladesongActive ? "杂技检定优势" : "杂技正常";
  document.querySelector("#bladesongConcentrationEffect").textContent = `专注豁免 ${signed(concentrationSave)}${diceSuffix(conditionModifiers.saveDice)}${state.bladesongActive ? `（剑歌 +${intMod}）` : ""}`;
  const bladesongButton = document.querySelector("#toggleBladesong");
  bladesongButton.textContent = state.bladesongActive ? "结束剑歌" : "开启剑歌";
  bladesongButton.setAttribute("aria-pressed", String(state.bladesongActive));
  bladesongButton.disabled = !state.bladesongActive && state.bladesongUses <= 0;
  document.body.classList.toggle("bladesong-active", state.bladesongActive);
  renderAbilities();
  renderSlots("slot1", 4);
  renderSlots("slot2", 2);
  window.renderDynamicSlots?.();
  renderConditions();
  renderHeroState();
}

function renderSlots(key, max) {
  const container = document.querySelector(`[data-resource="${key}"]`);
  container.innerHTML = Array.from({ length: max }, (_, index) => {
    const available = index < state[key];
    return `<button class="slot-pip ${available ? "" : "spent"}" type="button" data-slot="${key}" data-index="${index}" aria-label="${available ? "消耗" : "恢复"}一个法术位"></button>`;
  }).join("");
  container.previousElementSibling.querySelector("small").textContent = `${state[key]} / ${max}`;
}

function renderConditions() {
  const conditionMarkup = state.conditions
    .map((condition, index) => {
      const resolved = resolveCondition(condition);
      const escaped = String(resolved.name)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
      const effect = String(resolved.effect || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
      return `<button class="condition-chip" type="button" data-condition-index="${index}" title="${effect || `点击移除 ${escaped}`}"><strong>${escaped}</strong>${effect ? `<small>${effect}</small>` : ""}<em>×</em></button>`;
    })
    .join("");
  document.querySelector("#conditionList").innerHTML = conditionMarkup;
  const heroList = document.querySelector("#heroConditionList");
  if (heroList) {
    heroList.innerHTML = conditionMarkup || `<span class="hero-condition-empty">状态正常</span>`;
  }
  renderConditionPresets();
}

function renderHeroState() {
  const summary = document.querySelector("#heroSpellSlotSummary");
  if (!summary) return;
  const maximums = window.currentSlotMaximums || { slot1: 4, slot2: 2 };
  summary.innerHTML = Object.entries(maximums)
    .map(([key, max]) => {
      const level = Number(key.replace("slot", ""));
      const available = Math.max(0, Math.min(max, Number(state[key] ?? max)));
      return `<span><b>${level} 环</b><strong>${available} / ${max}</strong></span>`;
    })
    .join("");
}

window.renderHeroState = renderHeroState;

function refreshCharacterSheet() {
  if (typeof window.syncCharacterSheet === "function") window.syncCharacterSheet();
  else renderState();
}

function renderConditionPresets() {
  const container = document.querySelector("#conditionPresets");
  if (!container) return;
  container.innerHTML = conditionCatalog
    .map(
      (condition) =>
        `<button class="${state.conditions.some((entry) => resolveCondition(entry).id === condition.id) ? "active" : ""}" type="button" data-condition-preset="${condition.id}" title="${condition.effect}"><strong>${condition.name}</strong><small>${condition.category}</small></button>`,
    )
    .join("");
}

document.addEventListener("click", (event) => {
  const step = event.target.closest("[data-step]");
  if (step) {
    const key = step.dataset.step;
    const max = key === "hp" ? state.maxHp : 99;
    state[key] = Math.max(0, Math.min(max, state[key] + Number(step.dataset.delta)));
    renderState();
    saveState();
  }

  const slot = event.target.closest("[data-slot]");
  if (slot) {
    const key = slot.dataset.slot;
    const max = window.currentSlotMaximums?.[key] ?? (key === "slot1" ? 4 : 2);
    const index = Number(slot.dataset.index);
    state[key] = index < state[key] ? index : Math.min(max, index + 1);
    renderState();
    saveState();
  }

  const condition = event.target.closest("[data-condition-index]");
  if (condition) {
    state.conditions.splice(Number(condition.dataset.conditionIndex), 1);
    refreshCharacterSheet();
    saveState();
  }

  const preset = event.target.closest("[data-condition-preset]");
  if (preset) {
    const id = preset.dataset.conditionPreset;
    if (state.conditions.some((entry) => resolveCondition(entry).id === id)) {
      state.conditions = state.conditions.filter((entry) => resolveCondition(entry).id !== id);
    } else {
      state.conditions.push(`preset:${id}`);
    }
    refreshCharacterSheet();
    saveState();
  }
});

document.querySelector("#toggleBladesong").addEventListener("click", () => {
  if (!state.bladesongActive && state.bladesongUses <= 0) return;
  if (!state.bladesongActive) state.bladesongUses -= 1;
  state.bladesongActive = !state.bladesongActive;
  refreshCharacterSheet();
  saveState();
});

document.querySelector("#longRest").addEventListener("click", () => {
  state.hp = state.maxHp;
  state.tempHp = 0;
  state.bladesongUses = 2;
  state.bladesongActive = false;
  const slotMaximums = window.currentSlotMaximums || { slot1: 4, slot2: 2 };
  Object.entries(slotMaximums).forEach(([key, max]) => {
    state[key] = max;
  });
  state.conditions = [];
  refreshCharacterSheet();
  saveState();
});

const resetStateDialog = document.querySelector("#resetStateDialog");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsButton = document.querySelector("#settingsButton");
settingsButton.addEventListener("click", () => {
  if (!settingsDialog.open) settingsDialog.showModal();
  settingsButton.setAttribute("aria-expanded", "true");
});
settingsDialog.querySelectorAll("[data-close-settings]").forEach((button) => {
  button.addEventListener("click", () => settingsDialog.close());
});
settingsDialog.addEventListener("close", () => settingsButton.setAttribute("aria-expanded", "false"));
document.querySelector("#resetButton").addEventListener("click", () => {
  if (!resetStateDialog.open) resetStateDialog.showModal();
  document.querySelector("#cancelResetButton").focus();
});
resetStateDialog.querySelectorAll("[data-cancel-reset]").forEach((button) => {
  button.addEventListener("click", () => resetStateDialog.close());
});
document.querySelector("#confirmResetButton").addEventListener("click", () => {
  if (!resetStateDialog.open) return;
  const maxHp = state.maxHp;
  state = { ...defaults, maxHp, hp: maxHp, conditions: [] };
  Object.entries(window.currentSlotMaximums || { slot1: 4, slot2: 2 }).forEach(([key, max]) => {
    state[key] = max;
  });
  refreshCharacterSheet();
  saveState();
  resetStateDialog.close();
});

const conditionDialog = document.querySelector("#conditionDialog");
function openConditionDialog() {
  document.querySelector("#conditionInput").value = "";
  renderConditionPresets();
  conditionDialog.showModal();
  window.setTimeout(() => document.querySelector("#conditionInput").focus(), 0);
}

document.querySelectorAll("[data-open-condition-dialog]").forEach((button) => {
  button.addEventListener("click", openConditionDialog);
});

document.querySelector("#addCondition").addEventListener("click", (event) => {
  const input = document.querySelector("#conditionInput");
  const value = input.value.trim();
  if (!value) {
    event.preventDefault();
    input.focus();
    return;
  }
  const preset = conditionByName.get(value);
  const storedValue = preset ? `preset:${preset.id}` : value;
  if (!state.conditions.some((entry) => resolveCondition(entry).id === resolveCondition(storedValue).id)) state.conditions.push(storedValue);
  refreshCharacterSheet();
  saveState();
});

const navLinks = [...document.querySelectorAll(".section-nav a")];
const observedSections = navLinks.map((link) => document.querySelector(link.getAttribute("href")));
const observer = new IntersectionObserver(
  (entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`);
    });
  },
  { rootMargin: "-28% 0px -55% 0px", threshold: [0.01, 0.2] },
);
observedSections.forEach((section) => observer.observe(section));

renderAbilities();
renderFeatures();
renderState();
