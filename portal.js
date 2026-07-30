const portalCatalog = window.SRD_CATALOG;

const portalApp = document.querySelector("#portalApp");
const archiveApp = document.querySelector("#archiveApp");
const characterApp = document.querySelector("#characterApp");
const characterAmbient = document.querySelector("#characterAmbient");

const portalSchoolNames = {
  Abjuration: "防护",
  Conjuration: "咒法",
  Divination: "预言",
  Enchantment: "惑控",
  Evocation: "塑能",
  Illusion: "幻术",
  Necromancy: "死灵",
  Transmutation: "变化",
};

const portalClassNames = {
  Bard: "吟游诗人",
  Cleric: "牧师",
  Druid: "德鲁伊",
  Paladin: "圣武士",
  Ranger: "游侠",
  Sorcerer: "术士",
  Warlock: "邪术师",
  Wizard: "法师",
};

const classRules = [
  {
    id: "barbarian",
    name: "野蛮人",
    english: "Barbarian",
    sigil: "⚔",
    hitDie: "d12",
    primary: "力量",
    saves: "力量、体质",
    role: "高耐久近战、爆发与压制",
    summary: "以狂暴换取伤害、抗性和力量优势，适合冲入敌阵并承受攻击。",
    features: ["1级：狂暴、无甲防御", "2级：鲁莽攻击、危险感知", "3级：选择原始道途", "5级：额外攻击、快速移动"],
  },
  {
    id: "bard",
    name: "吟游诗人",
    english: "Bard",
    sigil: "♫",
    hitDie: "d8",
    primary: "魅力",
    saves: "敏捷、魅力",
    role: "支援、交涉、技能与全能施法",
    summary: "用吟游激励改变掷骰结果，同时以魅力施展控制、辅助和治疗法术。",
    features: ["1级：吟游激励、施法", "2级：万事通、休憩曲", "3级：吟游学院、专精", "5级：激励之泉"],
  },
  {
    id: "cleric",
    name: "牧师",
    english: "Cleric",
    sigil: "✦",
    hitDie: "d8",
    primary: "感知",
    saves: "感知、魅力",
    role: "神术、治疗、防护与领域能力",
    summary: "从神圣领域获得法术和独特能力，既能支援同伴，也能身披护甲作战。",
    features: ["1级：施法、神圣领域", "2级：引导神力", "5级：摧毁不死生物", "10级：神圣干预"],
  },
  {
    id: "druid",
    name: "德鲁伊",
    english: "Druid",
    sigil: "❧",
    hitDie: "d8",
    primary: "感知",
    saves: "智力、感知",
    role: "自然施法、变形、战场控制",
    summary: "驾驭自然魔法并以荒野形态变化为野兽，擅长探索和区域控制。",
    features: ["1级：德鲁伊语、施法", "2级：荒野形态、德鲁伊结社", "4级：形态强化", "18级：永恒身躯"],
  },
  {
    id: "fighter",
    name: "战士",
    english: "Fighter",
    sigil: "♜",
    hitDie: "d10",
    primary: "力量或敏捷",
    saves: "力量、体质",
    role: "武器专家、稳定输出与战术构筑",
    summary: "拥有最灵活的武器与护甲选择，依靠战斗风格和动作如潮掌握行动节奏。",
    features: ["1级：战斗风格、回气", "2级：动作如潮", "3级：武术范型", "5级：额外攻击"],
  },
  {
    id: "monk",
    name: "武僧",
    english: "Monk",
    sigil: "☯",
    hitDie: "d8",
    primary: "敏捷、感知",
    saves: "力量、敏捷",
    role: "高速机动、多段攻击与控制",
    summary: "以气驱动连续攻击、防御和移动，在战场上迅速接近关键目标。",
    features: ["1级：无甲防御、武艺", "2级：气、无甲移动", "3级：武僧宗派、拨挡飞弹", "5级：额外攻击、震慑拳"],
  },
  {
    id: "paladin",
    name: "圣武士",
    english: "Paladin",
    sigil: "♢",
    hitDie: "d10",
    primary: "力量、魅力",
    saves: "感知、魅力",
    role: "重甲前线、光环、治疗与爆发",
    summary: "以誓言获得神圣力量，通过圣疗、至圣斩和守护光环保护队伍。",
    features: ["1级：神圣感知、圣疗", "2级：战斗风格、施法、至圣斩", "3级：神圣誓言", "6级：守护光环"],
  },
  {
    id: "ranger",
    name: "游侠",
    english: "Ranger",
    sigil: "➶",
    hitDie: "d10",
    primary: "敏捷、感知",
    saves: "力量、敏捷",
    role: "追踪、远程、荒野探索与半施法",
    summary: "结合武技、追踪能力和自然法术，擅长在旅途与伏击中建立优势。",
    features: ["1级：宿敌、自然探索者", "2级：战斗风格、施法", "3级：游侠范型、原初意识", "5级：额外攻击"],
  },
  {
    id: "rogue",
    name: "游荡者",
    english: "Rogue",
    sigil: "◆",
    hitDie: "d8",
    primary: "敏捷",
    saves: "敏捷、智力",
    role: "潜行、专家技能与单次精准打击",
    summary: "利用优势或同伴牵制发动偷袭，以灵巧动作控制距离并解决机关。",
    features: ["1级：专精、偷袭、盗贼黑话", "2级：灵巧动作", "3级：游荡者范型", "5级：直觉闪避"],
  },
  {
    id: "sorcerer",
    name: "术士",
    english: "Sorcerer",
    sigil: "✺",
    hitDie: "d6",
    primary: "魅力",
    saves: "体质、魅力",
    role: "天生施法、法术塑形与爆发",
    summary: "法力源自血脉或异变，以超魔法改变法术的距离、目标、速度或威力。",
    features: ["1级：施法、术法起源", "2级：法力泉", "3级：超魔法", "20级：术法复苏"],
  },
  {
    id: "warlock",
    name: "邪术师",
    english: "Warlock",
    sigil: "◈",
    hitDie: "d8",
    primary: "魅力",
    saves: "感知、魅力",
    role: "短休施法、魔能祈唤与契约构筑",
    summary: "通过超自然契约获得少量但高环的短休法术位，并以祈唤持续定制能力。",
    features: ["1级：异界宗主、契约魔法", "2级：魔能祈唤", "3级：契约恩赐", "11级：玄奥秘法"],
  },
  {
    id: "wizard",
    name: "法师",
    english: "Wizard",
    sigil: "✧",
    hitDie: "d6",
    primary: "智力",
    saves: "智力、感知",
    role: "法术书、准备施法与广泛工具箱",
    summary: "通过抄写和准备法术建立最广泛的奥术工具箱，靠知识选择正确答案。",
    features: ["1级：施法、奥术回想", "2级：选择奥术传承", "18级：法术精通", "20级：招牌法术"],
  },
];

const ruleChapters = [
  {
    id: "checks",
    image: 0,
    kicker: "THE CORE ROLL",
    title: "核心检定：d20 + 调整值",
    lead: "当结果不确定且失败有代价时，DM 会要求一次属性检定、攻击检定或豁免。",
    points: [
      "掷一枚 d20，加上对应属性调整值；若你熟练该项目，再加熟练加值。",
      "结果达到或超过难度等级 DC 即成功。常见参考：容易 10、中等 15、困难 20。",
      "优势掷两枚 d20 取高；劣势取低。多个优势不会叠加，优势与劣势同时存在时互相抵消。",
    ],
    example: "例：Charlie 用奥秘辨认符文。d20 掷出 12，智力 +3、奥秘熟练 +2，总计 17。",
  },
  {
    id: "turns",
    image: 1,
    kicker: "COMBAT ROUND",
    title: "战斗轮与行动顺序",
    lead: "所有参战者先掷先攻；从最高到最低行动。每轮约代表游戏世界中的 6 秒。",
    points: [
      "你的回合通常拥有移动、一个动作；部分能力提供一个附赠动作。",
      "每轮可使用一次反应，但必须有触发条件，例如敌人离开你的触及范围。",
      "常见动作：攻击、施法、疾走、撤离、闪避、协助、躲藏、准备、搜索和使用物件。",
    ],
    example: "建议顺序：先观察位置与威胁，再决定移动，最后选择动作；移动可拆分在动作前后。",
  },
  {
    id: "attacks",
    image: 2,
    kicker: "ATTACK & DEFENSE",
    title: "攻击、护甲等级与掩护",
    lead: "攻击检定达到目标 AC 即命中；然后掷伤害骰并加入规则指定的属性调整值。",
    points: [
      "近战武器通常使用力量；灵巧武器可用敏捷；远程武器通常使用敏捷。",
      "法术攻击使用施法属性与熟练加值。要求豁免的法术则使用法术豁免 DC。",
      "半身掩护使 AC 与敏捷豁免 +2；四分之三掩护 +5；全身掩护通常不能被直接选为目标。",
    ],
    example: "攻击总值 = d20 + 属性调整值 + 熟练加值（若熟练该武器或法术）。",
  },
  {
    id: "health",
    image: 3,
    kicker: "HIT POINTS",
    title: "伤害、治疗与濒死",
    lead: "伤害从当前 HP 扣除。降到 0 HP 时通常昏迷，并在自己的回合开始进行死亡豁免。",
    points: [
      "死亡豁免 d20 达到 10 为成功；累计 3 次成功后稳定，3 次失败则死亡。",
      "掷出自然 20 会恢复 1 HP；自然 1 计作两次失败。0 HP 时受到伤害也会累积失败。",
      "临时 HP 不与其他临时 HP 相加，只选择保留其中较高者；它不能让昏迷者恢复意识。",
    ],
    example: "治疗只要让目标恢复至少 1 HP，就能使其从 0 HP 醒来并移除死亡豁免累计。",
  },
  {
    id: "magic",
    image: 4,
    kicker: "SPELLCASTING",
    title: "施法、法术位与专注",
    lead: "法术说明决定施法时间、距离、成分、持续时间、攻击或豁免，以及升环效果。",
    points: [
      "戏法通常不消耗法术位；一环及以上法术消耗对应环级或更高环级的法术位。",
      "V、S、M 分别代表言语、姿势和材料。法器或材料包可替代无标价且不被消耗的材料。",
      "同一时间只能维持一个专注法术。受伤时进行体质豁免，DC 为 10 或所受伤害的一半，取较高者。",
    ],
    example: "法师每日从法术书准备“法师等级 + 智力调整值”个一环及以上法术；仪式规则另行适用。",
  },
  {
    id: "rests",
    image: 5,
    kicker: "REST & RECOVERY",
    title: "短休、长休与资源恢复",
    lead: "休息让冒险节奏在消耗与恢复之间形成循环，但不同职业资源的恢复方式不同。",
    points: [
      "短休至少 1 小时；角色可花费生命骰恢复 HP，并加上每枚生命骰对应的体质调整值。",
      "长休至少 8 小时；通常恢复全部 HP，并恢复已花费生命骰的一半（至少一枚）。",
      "24 小时内只能从一次长休获益，且开始长休时通常至少要有 1 HP。",
    ],
    example: "Charlie 的奥术回想可在短休后恢复部分法术位，但每日只能使用一次。",
  },
];

function portalEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function portalHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function portalIconStyle(id) {
  const hash = portalHash(id);
  const index = hash % 64;
  return `--icon-x:${((index % 8) * 100) / 7}%;--icon-y:${(Math.floor(index / 8) * 100) / 7}%;--icon-hue:${(hash >>> 6) % 120 - 60}deg`;
}

function archiveHeader(active, title, subtitle) {
  const links = [
    ["classes", "职业规则"],
    ["spell-library", "法术查询"],
    ["item-library", "道具查询"],
    ["rules", "基础规则"],
  ];
  return `
    <header class="archive-topbar">
      <button class="archive-brand" type="button" data-portal-route="portal" aria-label="返回档案入口">
        <span class="brand-mark">D</span>
        <span><strong>DND CARD</strong><small>奥术档案馆</small></span>
      </button>
      <nav aria-label="规则资料库">
        ${links.map(([route, label]) => `<button class="${active === route ? "active" : ""}" type="button" data-portal-route="${route}">${label}</button>`).join("")}
      </nav>
      <button class="ghost-button" type="button" data-portal-route="portal">返回主页</button>
    </header>
    <section class="archive-heading">
      <p>${subtitle}</p>
      <h1>${title}</h1>
    </section>`;
}

function renderPortal() {
  const currentLevel = typeof managerState === "object" ? managerState.level : 3;
  portalApp.innerHTML = `
    <div class="portal-backdrop" aria-hidden="true"></div>
    <main class="portal-shell">
      <header class="portal-heading">
        <p>ARCANE ARCHIVE · 2014 5E</p>
        <h1>DNDcard</h1>
        <span>选择角色档案，或先查阅规则资料库</span>
      </header>
      <section class="portal-character-panel" aria-labelledby="portalCharacterTitle">
        <div class="portal-portrait">
          <img src="./assets/images/charlie-wizard.png" alt="人类预言学派法师 Charlie" />
        </div>
        <div class="portal-character-copy">
          <p>AVAILABLE CHARACTER</p>
          <h2 id="portalCharacterTitle">Charlie</h2>
          <div class="portal-tags"><span>人类</span><span>法师 ${currentLevel}</span><span>预言学派</span><span>学者</span></div>
          <p class="portal-quote">“星辰从不预言未来——它们只提醒我，未来有多少种写法。”</p>
          <dl>
            <div><dt>当前生命</dt><dd>${state.hp} / ${state.maxHp}</dd></div>
            <div><dt>护甲等级</dt><dd>15</dd></div>
            <div><dt>法术书</dt><dd>${managerState.spellbook.length - managerState.spellbook.map(findManagerSpell).filter((spell) => spell?.level === 0).length}</dd></div>
          </dl>
          <button class="portal-enter" type="button" data-portal-route="character">登录此角色</button>
        </div>
      </section>
      <section class="portal-library" aria-label="规则资料库入口">
        <button class="portal-destination classes" type="button" data-portal-route="classes">
          <span>Ⅰ</span><strong>职业规则</strong><small>12 个基础职业与成长方向</small>
        </button>
        <button class="portal-destination spells" type="button" data-portal-route="spell-library">
          <span>Ⅱ</span><strong>法术查询</strong><small>${portalCatalog.spells.length} 个 SRD 法术</small>
        </button>
        <button class="portal-destination items" type="button" data-portal-route="item-library">
          <span>Ⅲ</span><strong>道具查询</strong><small>${portalCatalog.items.length} 件 SRD 物品</small>
        </button>
        <button class="portal-destination rules" type="button" data-portal-route="rules">
          <span>Ⅳ</span><strong>基础规则</strong><small>从检定到战斗与施法</small>
        </button>
      </section>
      <button class="future-character" type="button" disabled>
        <span>＋</span><strong>由 GPT 创建新角色</strong><small>角色生成入口将在后续版本开放</small>
      </button>
      <footer class="portal-footer">SRD 5.1 · CC BY 4.0 · 所有角色状态保存在当前浏览器</footer>
    </main>`;
}

function renderClasses() {
  archiveApp.innerHTML = `
    <div class="archive-backdrop" aria-hidden="true"></div>
    <div class="archive-shell">
      ${archiveHeader("classes", "职业规则大厅", "HALL OF CALLINGS · 12 BASIC CLASSES")}
      <div class="archive-intro">
        <p>职业决定生命骰、主要能力、熟练项和核心成长方式。展开任意职业查看早期能力；具体角色仍需结合种族、背景、属性和子职共同构筑。</p>
        <label class="archive-search"><span>搜索职业</span><input id="classSearch" placeholder="名称、定位或主要属性" /></label>
      </div>
      <section class="class-rule-grid" id="classRuleGrid">
        ${classRules.map(renderClassCard).join("")}
      </section>
      <footer class="archive-footer">职业摘要依据 2014 版 SRD 5.1；升级时以具体职业表和能力正文为准。</footer>
    </div>`;
  archiveApp.querySelector("#classSearch").addEventListener("input", renderClassSearch);
}

function renderClassCard(item) {
  return `
    <article class="class-rule-card" data-class-search="${portalEscape(`${item.name} ${item.english} ${item.primary} ${item.role} ${item.summary}`.toLowerCase())}">
      <div class="class-sigil" aria-hidden="true">${item.sigil}</div>
      <div class="class-card-title"><p>${item.english}</p><h2>${item.name}</h2></div>
      <p>${item.summary}</p>
      <dl>
        <div><dt>生命骰</dt><dd>${item.hitDie}</dd></div>
        <div><dt>主要属性</dt><dd>${item.primary}</dd></div>
        <div><dt>豁免熟练</dt><dd>${item.saves}</dd></div>
        <div><dt>队伍定位</dt><dd>${item.role}</dd></div>
      </dl>
      <details>
        <summary>查看核心成长</summary>
        <ul>${item.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>
      </details>
    </article>`;
}

function renderClassSearch(event) {
  const query = event.target.value.trim().toLowerCase();
  archiveApp.querySelectorAll(".class-rule-card").forEach((card) => {
    card.hidden = query && !card.dataset.classSearch.includes(query);
  });
}

function renderSpellLibrary() {
  const spellCount = allManagerSpells().length;
  archiveApp.innerHTML = `
    <div class="archive-backdrop" aria-hidden="true"></div>
    <div class="archive-shell">
      ${archiveHeader("spell-library", "法术总目录", `ARCANE INDEX · ${spellCount} SPELLS`)}
      <div class="archive-catalog-actions">
        <button class="archive-create-button" id="createCustomSpellButton" type="button">
          <span aria-hidden="true">＋</span>
          <span><strong>添加自定义法术</strong><small>建立新的全局法术资料</small></span>
        </button>
      </div>
      <div class="archive-filterbar">
        <label class="archive-search"><span>搜索</span><input id="librarySpellSearch" placeholder="法术名、描述或伤害类型" /></label>
        <label><span>环级</span><select id="librarySpellLevel"><option value="all">全部</option>${Array.from({ length: 10 }, (_, level) => `<option value="${level}">${level ? `${level} 环` : "戏法"}</option>`).join("")}</select></label>
        <label><span>学派</span><select id="librarySpellSchool"><option value="all">全部</option>${Object.entries(portalSchoolNames).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label>
        <label><span>职业</span><select id="librarySpellClass"><option value="all">全部</option>${Object.entries(portalClassNames).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label>
      </div>
      <p class="archive-count" id="librarySpellCount"></p>
      <section class="library-grid" id="librarySpellGrid"></section>
      <button class="library-more" id="librarySpellMore" type="button">显示更多法术</button>
      <footer class="archive-footer">查询目录不会改变 Charlie 的法术书；要配置角色，请登录角色后进入“法术”章节。</footer>
    </div>`;
  archiveApp.querySelector("#createCustomSpellButton").addEventListener("click", () => openSpellEditor());
  archiveApp.querySelectorAll("#librarySpellSearch, #librarySpellLevel, #librarySpellSchool, #librarySpellClass").forEach((control) => {
    control.addEventListener("input", () => {
      archiveApp.dataset.limit = "48";
      renderSpellLibraryResults();
    });
  });
  archiveApp.querySelector("#librarySpellMore").addEventListener("click", () => {
    archiveApp.dataset.limit = `${Number(archiveApp.dataset.limit || 48) + 48}`;
    renderSpellLibraryResults();
  });
  archiveApp.dataset.limit = "48";
  renderSpellLibraryResults();
}

function spellLibraryMatches(spell) {
  const query = archiveApp.querySelector("#librarySpellSearch").value.trim().toLowerCase();
  const level = archiveApp.querySelector("#librarySpellLevel").value;
  const school = archiveApp.querySelector("#librarySpellSchool").value;
  const className = archiveApp.querySelector("#librarySpellClass").value;
  const haystack = `${spell.name} ${spell.nameZh || ""} ${spell.descriptionZh || ""} ${spell.damageType} ${spell.school}`.toLowerCase();
  return (
    (!query || haystack.includes(query)) &&
    (level === "all" || `${spell.level}` === level) &&
    (school === "all" || spell.school === school) &&
    (className === "all" || (spell.classes || []).includes(className))
  );
}

function renderSpellLibraryResults() {
  const matches = allManagerSpells().filter(spellLibraryMatches);
  const limit = Number(archiveApp.dataset.limit || 48);
  archiveApp.querySelector("#librarySpellCount").textContent = `找到 ${matches.length} 个法术 · 当前显示 ${Math.min(limit, matches.length)} 个`;
  archiveApp.querySelector("#librarySpellGrid").innerHTML = matches.slice(0, limit).map((spell) => `
    <article class="library-card spell">
      <span class="catalog-icon spell-icon" style="${portalIconStyle(spell.id)}" aria-hidden="true"><i></i></span>
      <div class="library-card-heading"><p>${spell.level ? `${spell.level} 环` : "戏法"} · ${portalEscape(portalSchoolNames[spell.school] || spell.school)}</p><h2>${portalEscape(displaySpellName(spell))}</h2></div>
      <div class="library-badges">${spell.ritual ? "<span>仪式</span>" : ""}${spell.concentration ? "<span>专注</span>" : ""}<span>${portalEscape((spell.classes || []).map((name) => portalClassNames[name] || name).join("、") || "自定义")}</span></div>
      <dl><div><dt>施法</dt><dd>${portalEscape(spell.castingTimeZh || spell.castingTime)}</dd></div><div><dt>距离</dt><dd>${portalEscape(spell.rangeZh || spell.range)}</dd></div><div><dt>持续</dt><dd>${portalEscape(spell.durationZh || spell.duration)}</dd></div><div><dt>成分</dt><dd>${portalEscape(spell.componentsZh || spell.components)}</dd></div></dl>
      <details><summary>阅读法术说明</summary><p>${portalEscape(spell.descriptionZh || "暂无中文说明")}</p>${spell.higherLevelZh ? `<p><strong>升环：</strong>${portalEscape(spell.higherLevelZh)}</p>` : ""}<div class="library-detail-actions"><button class="text-button" type="button" data-edit-spell="${spell.id}">编辑总览资料</button></div></details>
    </article>`).join("") || `<div class="archive-empty">没有符合条件的法术。</div>`;
  archiveApp.querySelector("#librarySpellMore").hidden = limit >= matches.length;
}

function renderItemLibrary() {
  const items = allManagerItems();
  const types = [...new Set(items.map((item) => item.type).filter(Boolean))].sort();
  const rarities = [...new Set(items.map((item) => item.rarity).filter(Boolean))].sort();
  archiveApp.innerHTML = `
    <div class="archive-backdrop" aria-hidden="true"></div>
    <div class="archive-shell">
      ${archiveHeader("item-library", "道具与魔法物品", `RELIQUARY INDEX · ${items.length} ITEMS`)}
      <div class="archive-catalog-actions">
        <button class="archive-create-button" id="createCustomItemButton" type="button">
          <span aria-hidden="true">＋</span>
          <span><strong>添加自定义物品</strong><small>建立新的全局道具资料</small></span>
        </button>
      </div>
      <div class="archive-filterbar item">
        <label class="archive-search"><span>搜索</span><input id="libraryItemSearch" placeholder="名称、类型、属性或说明" /></label>
        <label><span>类别</span><select id="libraryItemType"><option value="all">全部</option>${types.map((type) => `<option value="${portalEscape(type)}">${portalEscape(displayItemType(type))}</option>`).join("")}</select></label>
        <label><span>稀有度</span><select id="libraryItemRarity"><option value="all">全部</option>${rarities.map((rarity) => `<option value="${portalEscape(rarity)}">${portalEscape(displayItemRarity(rarity))}</option>`).join("")}</select></label>
      </div>
      <p class="archive-count" id="libraryItemCount"></p>
      <section class="library-grid item" id="libraryItemGrid"></section>
      <button class="library-more" id="libraryItemMore" type="button">显示更多物品</button>
      <footer class="archive-footer">查询目录不会改变 Charlie 的背包；新建资料后，可在角色“装备”章节通过“添加物品”加入背包。</footer>
    </div>`;
  archiveApp.querySelector("#createCustomItemButton").addEventListener("click", () => openItemEditor());
  archiveApp.querySelectorAll("#libraryItemSearch, #libraryItemType, #libraryItemRarity").forEach((control) => {
    control.addEventListener("input", () => {
      archiveApp.dataset.limit = "48";
      renderItemLibraryResults();
    });
  });
  archiveApp.querySelector("#libraryItemMore").addEventListener("click", () => {
    archiveApp.dataset.limit = `${Number(archiveApp.dataset.limit || 48) + 48}`;
    renderItemLibraryResults();
  });
  archiveApp.dataset.limit = "48";
  renderItemLibraryResults();
}

function itemLibraryMatches(item) {
  const query = archiveApp.querySelector("#libraryItemSearch").value.trim().toLowerCase();
  const type = archiveApp.querySelector("#libraryItemType").value;
  const rarity = archiveApp.querySelector("#libraryItemRarity").value;
  const haystack = `${item.name} ${item.nameZh || ""} ${item.type} ${item.category} ${item.rarity} ${item.descriptionZh || ""} ${(item.properties || []).join(" ")}`.toLowerCase();
  return (!query || haystack.includes(query)) && (type === "all" || item.type === type) && (rarity === "all" || item.rarity === rarity);
}

function renderItemLibraryResults() {
  const matches = allManagerItems().filter(itemLibraryMatches);
  const limit = Number(archiveApp.dataset.limit || 48);
  archiveApp.querySelector("#libraryItemCount").textContent = `找到 ${matches.length} 件物品 · 当前显示 ${Math.min(limit, matches.length)} 件`;
  archiveApp.querySelector("#libraryItemGrid").innerHTML = matches.slice(0, limit).map((item) => `
    <article class="library-card item">
      <span class="catalog-icon item-icon" style="${portalIconStyle(item.id)}" aria-hidden="true"><i></i></span>
      <div class="library-card-heading"><p>${portalEscape(displayItemRarity(item.rarity))} · ${portalEscape(displayItemType(item.type || item.category))}</p><h2>${portalEscape(item.nameZh ? `${item.nameZh}（${item.name}）` : item.name)}</h2></div>
      <div class="library-badges">${item.magic ? "<span>魔法</span>" : "<span>普通</span>"}${item.cost ? `<span>${portalEscape(item.cost)}</span>` : ""}${item.weight ? `<span>${portalEscape(item.weight)} 磅</span>` : ""}</div>
      ${(item.damage || item.armorClass) ? `<dl>${item.damage ? `<div><dt>伤害</dt><dd>${portalEscape(displayItemDamage(item.damage))}</dd></div>` : ""}${item.armorClass ? `<div><dt>AC</dt><dd>${portalEscape(item.armorClass)}</dd></div>` : ""}</dl>` : ""}
      <details><summary>阅读物品说明</summary><p>${portalEscape(item.descriptionZh || "该物品暂无中文规则说明。")}</p><div class="library-detail-actions"><button class="text-button" type="button" data-edit-item="${item.id}">编辑总览资料</button></div></details>
    </article>`).join("") || `<div class="archive-empty">没有符合条件的物品。</div>`;
  archiveApp.querySelector("#libraryItemMore").hidden = limit >= matches.length;
}

function renderRules() {
  archiveApp.innerHTML = `
    <div class="archive-backdrop" aria-hidden="true"></div>
    <div class="archive-shell rules-shell">
      ${archiveHeader("rules", "D&D 5e 基础玩法", "PLAYER'S PRIMER · FROM DICE TO ADVENTURE")}
      <section class="rules-start">
        <div><p>一场 D&D 游戏由玩家描述行动、DM 描述世界与后果、骰子裁定不确定结果。规则服务于共同叙事：先说“我想做什么”，再决定是否需要掷骰。</p></div>
        <nav aria-label="基础规则章节">${ruleChapters.map((chapter, index) => `<button type="button" data-rule-target="rule-${chapter.id}"><span>0${index + 1}</span>${chapter.title}</button>`).join("")}</nav>
      </section>
      <section class="rule-chapter-list">
        ${ruleChapters.map((chapter, index) => `
          <article class="rule-chapter" id="rule-${chapter.id}">
            <div class="rule-illustration rule-illustration-${chapter.image}" role="img" aria-label="${portalEscape(chapter.title)}插图"></div>
            <div class="rule-copy">
              <p>${chapter.kicker} · 0${index + 1}</p>
              <h2>${chapter.title}</h2>
              <strong>${chapter.lead}</strong>
              <ul>${chapter.points.map((point) => `<li>${point}</li>`).join("")}</ul>
              <aside>${chapter.example}</aside>
            </div>
          </article>`).join("")}
      </section>
      <section class="rules-reference">
        <article><p>属性调整值</p><h2>从属性值到加值</h2><div class="mini-table"><span>8–9：−1</span><span>10–11：+0</span><span>12–13：+1</span><span>14–15：+2</span><span>16–17：+3</span><span>18–19：+4</span><span>20：+5</span></div></article>
        <article><p>常见状态</p><h2>别忘记状态影响</h2><div class="condition-cloud"><span>目盲</span><span>魅惑</span><span>耳聋</span><span>恐慌</span><span>擒抱</span><span>失能</span><span>隐形</span><span>麻痹</span><span>石化</span><span>中毒</span><span>倒地</span><span>束缚</span><span>震慑</span><span>昏迷</span></div></article>
        <article><p>游戏循环</p><h2>探索 · 互动 · 遭遇</h2><ol><li>DM 描述环境。</li><li>玩家说明角色的行动与目标。</li><li>必要时掷骰并应用规则。</li><li>DM 描述结果，世界发生变化。</li></ol></article>
      </section>
      <footer class="archive-footer">这是 2014 版 SRD 5.1 的入门摘要，不替代完整规则正文；桌面与团务裁定以 DM 为准。</footer>
    </div>`;
}

function routeFromHash() {
  const hash = location.hash.slice(1);
  if (!hash || hash === "portal") return "portal";
  if (["classes", "spell-library", "item-library", "rules"].includes(hash)) return hash;
  return "character";
}

function navigatePortal(route) {
  const target = route === "character" ? "overview" : route;
  if (location.hash === `#${target}`) renderPortalRoute();
  else location.hash = target;
}

function renderPortalRoute() {
  const route = routeFromHash();
  const isPortal = route === "portal";
  const isCharacter = route === "character";
  portalApp.hidden = !isPortal;
  archiveApp.hidden = isPortal || isCharacter;
  characterApp.hidden = !isCharacter;
  characterAmbient.hidden = !isCharacter;
  document.body.dataset.route = route;

  if (isPortal) {
    renderPortal();
    document.title = "DNDcard · 选择角色";
  } else if (isCharacter) {
    document.title = `Charlie · ${managerState.level}级人类法师`;
  } else if (route === "classes") {
    renderClasses();
    document.title = "职业规则 · DNDcard";
  } else if (route === "spell-library") {
    renderSpellLibrary();
    document.title = "法术查询 · DNDcard";
  } else if (route === "item-library") {
    renderItemLibrary();
    document.title = "道具查询 · DNDcard";
  } else if (route === "rules") {
    renderRules();
    document.title = "基础规则 · DNDcard";
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-portal-route]");
  if (routeButton) navigatePortal(routeButton.dataset.portalRoute);
  const ruleButton = event.target.closest("[data-rule-target]");
  if (ruleButton) {
    document.querySelector(`#${ruleButton.dataset.ruleTarget}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

window.addEventListener("hashchange", renderPortalRoute);
renderPortalRoute();
