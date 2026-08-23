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
    source: "龙裔 · 种族",
    name: "龙裔血脉",
    text: "体型中型，基础步行速度 30 尺；继承龙族血脉带来的吐息武器与对应伤害抗性。具体龙族祖先可在后续档案中补记。",
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
    source: "剑咏 · 2 级",
    name: "剑歌",
    text: "以附赠动作开启持续 1 分钟的剑歌；期间获得智力调整值提供的护甲加值，并强化速度、专注与敏捷表现。当前基础 AC 14，剑歌中 AC 17。",
  },
  {
    source: "赌客 · 背景",
    name: "牌桌识人",
    text: "以牌局接近陌生人、交换消息并观察人心；从下注方式、输牌反应和说谎时的停顿判断对方性格。",
  },
  {
    source: "易容帽 · 同调",
    name: "千面旅人",
    text: "可随意施放伪装术而不消耗法术位。最常伪装成白发、佝偻的旅行老法师，以不同身份观察世界。",
  },
];

const inventory = [
  ["魔法书", "3 磅 · 10 个法术"],
  ["父亲的旧长剑", "遗物 · 剑咏施法媒介"],
  ["母亲的旧纸牌", "遗物 · 边角磨白"],
  ["易容帽", "非普通奇物 · 需同调"],
  ["法术材料包", "施法材料"],
  ["旅行者套组", "背包、口粮、绳索与旅途用品"],
  ["长棍", "4 磅 · 1d6+3 钝击"],
  ["轻弩", "5 磅 · 1d8+2 穿刺"],
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
    prepared: true,
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

const commonConditions = [
  "专注", "目盲", "魅惑", "耳聋", "恐慌", "擒抱", "失能",
  "隐形", "麻痹", "石化", "中毒", "倒地", "束缚", "震慑", "昏迷",
];

let state = loadState();

function signed(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("gandalf-5e-state") || "{}");
    return {
      ...defaults,
      ...saved,
      conditions: Array.isArray(saved.conditions)
        ? [...new Set(saved.conditions.map((condition) => String(condition).trim()).filter(Boolean))]
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
                    (skill) =>
                      `<li class="${skill.proficient ? "proficient" : ""}" ${skill.name === "杂技" ? 'id="acrobaticsSkill"' : ""}>${skill.name} ${signed(skill.value)}${skill.name === "杂技" && state.bladesongActive ? " · 优势" : ""}</li>`,
                  )
                  .join("")}</ul>`
              : `<ul><li>体质检定 ${signed(ability.mod)}</li></ul>`
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
  const armorClass = 14 + (state.bladesongActive ? intMod : 0);
  const speed = 30 + (state.bladesongActive ? 10 : 0);
  const concentrationSave = conMod + (state.bladesongActive ? intMod : 0);
  document.querySelector("#hpValue").value = state.hp;
  document.querySelector("#tempHpValue").value = state.tempHp;
  document.querySelector("#bladesongUses").value = state.bladesongUses;
  document.querySelector("#armorClassValue").textContent = armorClass;
  document.querySelector("#armorClassMeta").textContent = state.bladesongActive ? `剑歌中 · 智力 +${intMod}` : `轻甲 · 剑歌 ${14 + intMod}`;
  document.querySelector("#speedValue").textContent = speed;
  document.querySelector("#speedMeta").textContent = state.bladesongActive ? "尺 · 剑歌 +10" : "尺";
  document.querySelector("#bladesongStatus").textContent = state.bladesongActive ? `剑歌进行中 · AC ${armorClass}` : "未开启 · 基础 AC 14";
  document.querySelector("#bladesongAcEffect").textContent = `AC ${armorClass}`;
  document.querySelector("#bladesongSpeedEffect").textContent = `速度 ${speed} 尺`;
  document.querySelector("#bladesongAcrobaticsEffect").textContent = state.bladesongActive ? "杂技检定优势" : "杂技正常";
  document.querySelector("#bladesongConcentrationEffect").textContent = `专注豁免 ${signed(concentrationSave)}${state.bladesongActive ? `（剑歌 +${intMod}）` : ""}`;
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
      const escaped = String(condition)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
      return `<button class="condition-chip" type="button" data-condition-index="${index}" title="点击移除 ${escaped}">${escaped} ×</button>`;
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

function renderConditionPresets() {
  const container = document.querySelector("#conditionPresets");
  if (!container) return;
  container.innerHTML = commonConditions
    .map(
      (condition) =>
        `<button class="${state.conditions.includes(condition) ? "active" : ""}" type="button" data-condition-preset="${condition}">${condition}</button>`,
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
    renderConditions();
    saveState();
  }

  const preset = event.target.closest("[data-condition-preset]");
  if (preset) {
    const value = preset.dataset.conditionPreset;
    if (state.conditions.includes(value)) {
      state.conditions = state.conditions.filter((conditionName) => conditionName !== value);
    } else {
      state.conditions.push(value);
    }
    renderConditions();
    saveState();
  }
});

document.querySelector("#toggleBladesong").addEventListener("click", () => {
  if (!state.bladesongActive && state.bladesongUses <= 0) return;
  if (!state.bladesongActive) state.bladesongUses -= 1;
  state.bladesongActive = !state.bladesongActive;
  renderState();
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
  renderState();
  saveState();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  if (!window.confirm("将甘阿·道夫的当前生命、法术位、剑歌次数与状态恢复为初始值？")) return;
  const maxHp = state.maxHp;
  state = { ...defaults, maxHp, hp: maxHp, conditions: [] };
  Object.entries(window.currentSlotMaximums || { slot1: 4, slot2: 2 }).forEach(([key, max]) => {
    state[key] = max;
  });
  renderState();
  saveState();
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
  if (!state.conditions.includes(value)) state.conditions.push(value);
  renderConditions();
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
