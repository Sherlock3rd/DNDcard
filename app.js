const abilities = [
  {
    key: "STR",
    name: "力量",
    score: 9,
    mod: -1,
    skills: [{ name: "运动", value: -1 }],
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
      { name: "调查", value: 5, proficient: true },
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
      { name: "洞悉", value: 1 },
      { name: "医药", value: 1 },
      { name: "察觉", value: 1 },
      { name: "生存", value: 1 },
    ],
  },
  {
    key: "CHA",
    name: "魅力",
    score: 11,
    mod: 0,
    skills: [
      { name: "欺瞒", value: 0 },
      { name: "威吓", value: 0 },
      { name: "表演", value: 0 },
      { name: "游说", value: 0 },
    ],
  },
];

const features = [
  {
    source: "人类 · 种族",
    name: "人类多才",
    text: "六项属性各提高 1。体型中型，基础步行速度 30 尺，额外掌握一门语言。",
  },
  {
    source: "法师 · 1 级",
    name: "奥术回想",
    text: "每日一次完成短休后，可恢复总环级不超过 2 的已消耗法术位；不能恢复 6 环或更高法术位。",
  },
  {
    source: "法师 · 1 级",
    name: "法术书与仪式施法",
    text: "法术书记录 10 个法师法术。书中带仪式标签的法术无需准备即可用仪式方式施展。",
  },
  {
    source: "预言学派 · 2 级",
    name: "预言学者",
    text: "抄录预言学派法术所需金币与时间减半。",
  },
  {
    source: "预言学派 · 2 级",
    name: "预兆",
    text: "每次长休后掷 2 次 d20 并记录结果。你或可见生物进行攻击、豁免或属性检定前，可用一个记录值替代该次掷骰。",
  },
  {
    source: "学者 · 背景",
    name: "研究员",
    text: "当你不知道某条知识时，通常知道从何处、哪位人物或哪座图书馆能够取得它。",
  },
];

const inventory = [
  ["魔法书", "3 磅 · 10 个法术"],
  ["黄铜星盘", "奥术法器 · 导师遗物"],
  ["法术材料包", "施法材料"],
  ["学者套组", "背包、学识书、墨水、笔、羊皮纸等"],
  ["匕首", "1 磅 · 1d4 穿刺"],
  ["短棍", "4 磅 · 1d6 钝击"],
  ["普通衣物", "学者背景"],
  ["导师未写完的信", "背景纪念物"],
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
    name: "法师之手",
    school: "咒法戏法",
    casting: "1 动作",
    range: "30 尺",
    duration: "1 分钟",
    components: "V、S",
    prepared: true,
  },
  {
    level: 0,
    name: "次级幻影",
    school: "幻术戏法",
    casting: "1 动作",
    range: "30 尺",
    duration: "1 分钟",
    components: "S、M",
    prepared: true,
  },
  {
    level: 1,
    name: "法师护甲",
    school: "防护 1 环",
    casting: "1 动作",
    range: "接触",
    duration: "8 小时",
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
    name: "侦测魔法",
    school: "预言 1 环 · 仪式",
    casting: "1 动作",
    range: "自身",
    duration: "专注，10 分钟",
    components: "V、S",
    prepared: false,
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
    name: "蛛网术",
    school: "咒法 2 环",
    casting: "1 动作",
    range: "60 尺",
    duration: "专注，1 小时",
    components: "V、S、M",
    prepared: true,
  },
  {
    level: 2,
    name: "灼热射线",
    school: "塑能 2 环",
    casting: "1 动作",
    range: "120 尺",
    duration: "立即",
    components: "V、S",
    prepared: true,
  },
  {
    level: 2,
    name: "隐形术",
    school: "幻术 2 环",
    casting: "1 动作",
    range: "接触",
    duration: "专注，1 小时",
    components: "V、S、M",
    prepared: false,
  },
];

const defaults = {
  hp: 20,
  maxHp: 20,
  tempHp: 0,
  slot1: 4,
  slot2: 2,
  portentOne: 17,
  portentTwo: 6,
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
    const saved = JSON.parse(localStorage.getItem("charlie-5e-state") || "{}");
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
  localStorage.setItem("charlie-5e-state", JSON.stringify(state));
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
                      `<li class="${skill.proficient ? "proficient" : ""}">${skill.name} ${signed(skill.value)}</li>`,
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
  document.querySelector("#hpValue").value = state.hp;
  document.querySelector("#tempHpValue").value = state.tempHp;
  document.querySelector("#portentOne").value = state.portentOne;
  document.querySelector("#portentTwo").value = state.portentTwo;
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

document.querySelector("#portentOne").addEventListener("change", (event) => {
  state.portentOne = Math.max(1, Math.min(20, Number(event.target.value) || 1));
  renderState();
  saveState();
});

document.querySelector("#portentTwo").addEventListener("change", (event) => {
  state.portentTwo = Math.max(1, Math.min(20, Number(event.target.value) || 1));
  renderState();
  saveState();
});

document.querySelector("#longRest").addEventListener("click", () => {
  state.hp = state.maxHp;
  state.tempHp = 0;
  const slotMaximums = window.currentSlotMaximums || { slot1: 4, slot2: 2 };
  Object.entries(slotMaximums).forEach(([key, max]) => {
    state[key] = max;
  });
  state.conditions = [];
  renderState();
  saveState();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  if (!window.confirm("将 Charlie 的当前生命、法术位、预兆骰与状态恢复为初始值？")) return;
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
