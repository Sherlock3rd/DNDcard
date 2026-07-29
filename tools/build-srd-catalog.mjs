import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "tmp", "5e-database", "src", "2014", "en");
const zhRoot = path.join(root, "tmp", "srd-zh", "docs");
const enWikiRoot = path.join(root, "tmp", "srd-en-wiki");

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(sourceDir, name), "utf8"));

const compactText = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join("\n\n") : value || "";

const normalizeEnglish = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\[\[|\]\]|\*|~/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "");

const cleanMarkdown = (value) =>
  String(value || "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}|_{1,3}|`/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function parseSpellTranslation(spellName) {
  const file = path.join(zhRoot, "Spells", `${spellName.replaceAll("/", "-")}.md`);
  if (!fs.existsSync(file)) return {};
  const markdown = fs.readFileSync(file, "utf8");
  const title = markdown.match(/^###\s+(.+)$/m)?.[1]?.trim() || spellName;
  const field = (label) =>
    markdown.match(new RegExp(`\\*\\*${label}：\\*\\*\\s*([^\\n]+)`))?.[1]?.trim() || "";
  const durationMatch = markdown.match(/\*\*持续时间：\*\*\s*[^\n]+\n/);
  let body = durationMatch
    ? markdown.slice(durationMatch.index + durationMatch[0].length).trim()
    : markdown.split(/\n\n/).slice(2).join("\n\n");
  const higherMarker = body.search(/\*{3}高环位施法[。.]?\*{3}/);
  const descriptionZh = cleanMarkdown(higherMarker >= 0 ? body.slice(0, higherMarker) : body);
  const higherLevelZh = cleanMarkdown(higherMarker >= 0 ? body.slice(higherMarker) : "");
  return {
    nameZh: title,
    castingTimeZh: cleanMarkdown(field("施法时间")),
    rangeZh: cleanMarkdown(field("射程")),
    componentsZh: cleanMarkdown(field("成分")),
    durationZh: cleanMarkdown(field("持续时间")),
    descriptionZh,
    higherLevelZh: higherLevelZh.replace(/^高环位施法[。.]?\s*/, ""),
  };
}

function readTableRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|") && !/^\|[- :|]+\|?$/.test(line.trim()))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((_, index) => index > 0);
}

function buildEquipmentNameMap() {
  const pairs = [
    ["Adventuring_Gear.md", "Gear.md"],
    ["Armor.md", "Armor.md"],
    ["Tools.md", "Tools.md"],
    ["Trade_Goods.md", "Trade Goods.md"],
    ["Transportation.md", "Transportation.md"],
    ["Weapons.md", "Weapons.md"],
  ];
  const names = new Map();
  for (const [englishFile, chineseFile] of pairs) {
    const englishRows = readTableRows(
      fs.readFileSync(path.join(enWikiRoot, "04_Equipment", englishFile), "utf8"),
    );
    const chineseRows = readTableRows(
      fs.readFileSync(path.join(zhRoot, "Equipment", chineseFile), "utf8"),
    );
    englishRows.forEach((row, index) => {
      if (!chineseRows[index]) return;
      const chineseName = cleanMarkdown(chineseRows[index][0].replace(/^~\s*/, ""));
      if (chineseName) names.set(normalizeEnglish(row[0]), chineseName);
    });
  }
  const aliases = {
    "Padded Armor": "布甲",
    "Leather Armor": "皮甲",
    "Studded Leather Armor": "镶钉皮甲",
    "Hide Armor": "兽皮甲",
    "Half Plate Armor": "半身板甲",
    "Splint Armor": "条板甲",
    "Plate Armor": "板甲",
    "Alms box": "施舍箱",
    Arrow: "箭矢",
    "Block of incense": "熏香块",
    "Blowgun needle": "吹箭针",
    Censer: "香炉",
    "Crossbow bolt": "弩矢",
    "Sling bullet": "投石索弹丸",
    "Little bag of sand": "小袋细沙",
    "Small knife": "小刀",
    "Spike, iron": "铁制岩钉",
    "String (10 feet)": "细绳（10 尺）",
    Vestments: "祭服",
    "Burglar's Pack": "盗贼包",
    "Diplomat's Pack": "外交官包",
    "Dungeoneer's Pack": "地下城探险者包",
    "Entertainer's Pack": "艺人包",
    "Explorer's Pack": "探险者包",
    "Priest's Pack": "祭司包",
    "Scholar's Pack": "学者包",
    Donkey: "驴",
    Mule: "骡",
    "Animal Feed (1 day)": "动物饲料（1 天）",
    "Saddle, Exotic": "异种鞍",
    "Saddle, Military": "军用鞍",
    "Saddle, Pack": "驮鞍",
    "Saddle, Riding": "骑乘鞍",
  };
  const bardingNames = {
    Padded: "布甲", Leather: "皮甲", "Studded Leather": "镶钉皮甲", Hide: "兽皮甲",
    "Chain shirt": "链甲衫", "Scale mail": "鳞甲", Breastplate: "胸甲", "Half plate": "半身板甲",
    "Ring mail": "环甲", "Chain mail": "链甲", Splint: "条板甲", Plate: "板甲",
  };
  for (const [english, chinese] of Object.entries(bardingNames)) {
    names.set(normalizeEnglish(`Barding: ${english}`), `${chinese}坐骑护甲`);
  }
  for (const [english, chinese] of Object.entries(aliases)) {
    names.set(normalizeEnglish(english), chinese);
  }
  return names;
}

function parseGearDescriptions() {
  const markdown = fs.readFileSync(path.join(zhRoot, "Equipment", "Gear.md"), "utf8");
  const matches = [...markdown.matchAll(/\*{3}([^*]+)\*{3}。([\s\S]*?)(?=\n\n\*{3}|\n\n\*\*装备包\*\*|\n\n\*\*表格|\n\n#|$)/g)];
  const englishOrder = [
    "Acid", "Alchemist's Fire", "Antitoxin", "Arcane Focus", "Ball Bearings",
    "Block and Tackle", "Book", "Caltrops", "Candle", "Case, Crossbow Bolt",
    "Case, Map or Scroll", "Chain", "Climber's Kit", "Component Pouch", "Crowbar",
    "Druidic Focus", "Fishing Tackle", "Healer's Kit", "Holy Symbol", "Holy Water",
    "Hunting Trap", "Lamp", "Lantern, Bullseye", "Lantern, Hooded", "Lock",
    "Magnifying Glass", "Manacles", "Mess Kit", "Oil", "Poison, Basic",
    "Potion of Healing", "Pouch", "Quiver", "Ram, Portable", "Rations", "Rope",
    "Scale, Merchant's", "Spellbook", "Spyglass", "Tent", "Tinderbox", "Torch",
    "Burglar's Pack", "Diplomat's Pack", "Dungeoneer's Pack", "Entertainer's Pack",
    "Explorer's Pack", "Priest's Pack", "Scholar's Pack",
  ];
  const descriptions = new Map();
  matches.forEach((match, index) => {
    if (englishOrder[index]) descriptions.set(normalizeEnglish(englishOrder[index]), cleanMarkdown(match[2]));
  });
  return descriptions;
}

function parseMagicTranslation(fileName) {
  const file = path.join(zhRoot, "Treasure", `${fileName}.md`);
  if (!fs.existsSync(file)) return {};
  const markdown = fs.readFileSync(file, "utf8");
  const title = markdown.match(/^###\s+(.+)$/m)?.[1]?.trim() || fileName;
  const lines = markdown.split(/\r?\n/);
  const titleIndex = lines.findIndex((line) => /^###\s+/.test(line));
  let bodyIndex = titleIndex + 1;
  while (bodyIndex < lines.length && (!lines[bodyIndex].trim() || /^\*[^*].*\*$/.test(lines[bodyIndex].trim()))) {
    bodyIndex += 1;
  }
  return {
    nameZh: cleanMarkdown(title),
    descriptionZh: cleanMarkdown(lines.slice(bodyIndex).join("\n")),
  };
}

function magicTranslationSource(name) {
  if (/^Ammunition, \+\d$/.test(name)) return "Ammunition, +1, +2, or +3";
  if (/^Armor, \+\d$/.test(name)) return "Armor, +1, +2, or +3";
  if (/ Bag of Tricks$/.test(name)) return "Bag of Tricks";
  if (/^Belt of .* Giant Strength$/.test(name)) return "Belt of Giant Strength";
  if (/^Carpet of Flying /.test(name)) return "Carpet of Flying";
  if (/^Crystal Ball of /.test(name)) return "Crystal Ball";
  if (/ Dragon Scale Mail$/.test(name)) return "Dragon Scale Mail";
  if (/ Elemental Gem$/.test(name)) return "Elemental Gem";
  if (/ Feather Token$/.test(name)) return "Feather Token";
  if (/ Figurine of Wondrous Power$/.test(name)) return "Figurine of Wondrous Power";
  if (/^Glamoured Studded Leather Armor$/.test(name)) return "Glamoured Studded Leather";
  if (/ Horn of Valhalla$/.test(name)) return "Horn of Valhalla";
  if (/^Ioun Stone of /.test(name)) return "Ioun Stone";
  if (/^Manual of .* Golems$/.test(name)) return "Manual of Golems";
  if (/^Potion of .* Giant Strength$/.test(name)) return "Potion of Giant Strength";
  if (/^Potion of (Greater|Superior|Supreme) Healing$/.test(name)) return "Potion of Healing";
  if (/^Potion of .* Resistance$/.test(name)) return "Potion of Resistance";
  if (/^Ring of .* Elemental Command$/.test(name)) return "Ring of Elemental Command";
  if (/^Ring of .* Resistance$/.test(name)) return "Ring of Resistance";
  if (/^Spell Scroll /.test(name)) return "Spell Scroll";
  if (/^Wand of the War Mage, \+\d$/.test(name)) return "Wand of the War Mage, +1, +2, or +3";
  if (/^Weapon, \+\d$/.test(name)) return "Weapon, +1, +2, or +3";
  if (name === "Orb of Dragonkind") return "Orbs of Dragonkind";
  return name;
}

const giantNames = {
  Hill: "丘陵", Stone: "石", Frost: "霜", Fire: "火", Cloud: "云", Storm: "风暴",
};
const damageNames = {
  Acid: "强酸", Cold: "寒冷", Fire: "火焰", Force: "力场", Lightning: "闪电",
  Necrotic: "黯蚀", Poison: "毒素", Psychic: "心灵", Radiant: "光耀", Thunder: "雷鸣",
};
const dragonNames = {
  Black: "黑", Blue: "蓝", Brass: "黄铜", Bronze: "青铜", Copper: "赤铜",
  Gold: "金", Green: "绿", Red: "红", Silver: "银", White: "白",
};
const elementNames = { Air: "风", Earth: "土", Fire: "火", Water: "水" };
const healingNames = { Greater: "强效", Superior: "极效", Supreme: "至高" };
const ordinalNames = {
  Cantrip: "戏法", "1st": "1 环", "2nd": "2 环", "3rd": "3 环", "4th": "4 环",
  "5th": "5 环", "6th": "6 环", "7th": "7 环", "8th": "8 环", "9th": "9 环",
};

function translatedMagicVariant(name, fallback) {
  let match;
  if ((match = name.match(/^Ammunition, (\+\d)$/))) return `魔法弹药 ${match[1]}`;
  if ((match = name.match(/^Armor, (\+\d)$/))) return `魔法护甲 ${match[1]}`;
  if ((match = name.match(/^(Gray|Rust|Tan) Bag of Tricks$/))) {
    return `${{ Gray: "灰色", Rust: "铁锈色", Tan: "棕褐色" }[match[1]]}诡术袋`;
  }
  if ((match = name.match(/^Belt of (.+) Giant Strength$/))) return `${giantNames[match[1]] || match[1]}巨人力量腰带`;
  if ((match = name.match(/^Carpet of Flying \((.+)\)$/))) return `飞毯（${match[1].replaceAll("ft.", "尺")}）`;
  if ((match = name.match(/^Crystal Ball of (Mind Reading|Telepathy|True Seeing)$/))) {
    return `水晶球（${{ "Mind Reading": "读心", Telepathy: "心灵感应", "True Seeing": "真实视觉" }[match[1]]}）`;
  }
  if ((match = name.match(/^(.+) Dragon Scale Mail$/))) return `${dragonNames[match[1]] || match[1]}龙鳞甲`;
  if ((match = name.match(/^(.+) Elemental Gem$/))) return `${elementNames[match[1]] || match[1]}元素宝石`;
  if ((match = name.match(/^(.+) Feather Token$/))) {
    const token = { Anchor: "锚", Bird: "鸟", Fan: "扇", "Swan Boat": "天鹅船", Tree: "树", Whip: "鞭" }[match[1]];
    return `羽符（${token || match[1]}）`;
  }
  if ((match = name.match(/^(.+) Figurine of Wondrous Power$/))) {
    const figurine = {
      "Bronze Griffon": "青铜狮鹫", "Ebony Fly": "乌木巨蝇", "Golden Lions": "黄金雄狮",
      "Ivory Goats": "象牙山羊", "Marble Elephant": "大理石巨象", "Obsidian Steed": "黑曜石战马",
      "Onyx Dog": "缟玛瑙猎犬", "Serpentine Owl": "蛇纹石猫头鹰", "Silver Raven": "银渡鸦",
    }[match[1]];
    return `奇珍异兽雕像（${figurine || match[1]}）`;
  }
  if ((match = name.match(/^(Silver|Brass|Bronze|Iron) Horn of Valhalla$/))) {
    return `${{ Silver: "银质", Brass: "黄铜", Bronze: "青铜", Iron: "铁质" }[match[1]]}英灵号角`;
  }
  if ((match = name.match(/^Ioun Stone of (.+)$/))) return `艾恩石（${cleanMarkdown(match[1])}）`;
  if ((match = name.match(/^Manual of (Clay|Flesh|Iron|Stone) Golems$/))) {
    return `${{ Clay: "黏土", Flesh: "血肉", Iron: "铁", Stone: "石" }[match[1]]}魔像手册`;
  }
  if ((match = name.match(/^Potion of (.+) Giant Strength$/))) return `${giantNames[match[1]] || match[1]}巨人力量药水`;
  if ((match = name.match(/^Potion of (Greater|Superior|Supreme) Healing$/))) return `${healingNames[match[1]]}治疗药水`;
  if ((match = name.match(/^Potion of (.+) Resistance$/))) return `${damageNames[match[1]] || match[1]}抗性药水`;
  if ((match = name.match(/^Ring of (Air|Earth|Fire|Water) Elemental Command$/))) return `${elementNames[match[1]]}元素统御戒指`;
  if ((match = name.match(/^Ring of (.+) Resistance$/))) return `${damageNames[match[1]] || match[1]}抗性戒指`;
  if ((match = name.match(/^Spell Scroll \((.+)\)$/))) return `法术卷轴（${ordinalNames[match[1]] || match[1]}）`;
  if ((match = name.match(/^Wand of the War Mage, (\+\d)$/))) return `战法师魔杖 ${match[1]}`;
  if ((match = name.match(/^Weapon, (\+\d)$/))) return `魔法武器 ${match[1]}`;
  if (name === "Glamoured Studded Leather Armor") return "魅影镶钉皮甲";
  if (name === "Orb of Dragonkind") return "龙珠";
  return fallback;
}

const equipmentNames = buildEquipmentNameMap();
const gearDescriptions = parseGearDescriptions();
const propertyNames = {
  Light: "轻型", Finesse: "灵巧", Thrown: "投掷", "Two-Handed": "双手",
  Versatile: "多用", Ammunition: "弹药", Loading: "装填", Heavy: "重型", Reach: "触及", Special: "特殊",
};
const damageTypeNames = {
  Bludgeoning: "钝击", Piercing: "穿刺", Slashing: "挥砍",
};

function genericEquipmentDescription(item, nameZh) {
  const cost = item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "未标价";
  const weight = item.weight ? `${item.weight} 磅` : "重量可忽略";
  if (item.equipment_category?.name === "Weapon") {
    const damage = item.damage?.damage_dice
      ? `${item.damage.damage_dice} 点${damageTypeNames[item.damage.damage_type?.name] || item.damage.damage_type?.name || ""}伤害`
      : "按具体使用方式造成伤害";
    const properties = (item.properties || []).map((entry) => propertyNames[entry.name]).filter(Boolean).join("、");
    return `${nameZh}是一件${item.weapon_category === "Martial" ? "军用" : "简易"}武器。命中时造成 ${damage}${properties ? `；武器属性为${properties}` : ""}。价格 ${cost}，重量 ${weight}。`;
  }
  if (item.equipment_category?.name === "Armor") {
    const armorClass = item.armor_class?.base ? `基础护甲等级为 ${item.armor_class.base}` : "护甲等级按具体规则计算";
    const stealth = item.stealth_disadvantage ? "，穿着时进行敏捷（隐匿）检定具有劣势" : "";
    return `${nameZh}是一套防护装备，${armorClass}${stealth}。价格 ${cost}，重量 ${weight}。`;
  }
  if (item.equipment_category?.name === "Tools") {
    return `${nameZh}是一套用于相关专业工作、制作或表演的工具。角色熟练此工具时，可在适用的属性检定中加入熟练加值。价格 ${cost}，重量 ${weight}。`;
  }
  if (item.equipment_category?.name === "Mounts and Vehicles") {
    return `${nameZh}用于旅行、载运或骑乘。具体速度、载重与操控方式由其类别和场景决定。价格 ${cost}，重量 ${weight}。`;
  }
  return `${nameZh}是一件可在冒险、旅行或日常行动中使用的装备。其实际用途由物品形态、角色行动与 DM 裁定共同决定。价格 ${cost}，重量 ${weight}。`;
}

const spells = read("5e-SRD-Spells.json").map((spell) => ({
  id: spell.index,
  name: spell.name,
  level: spell.level,
  school: spell.school?.name || "",
  classes: (spell.classes || []).map((entry) => entry.name),
  castingTime: spell.casting_time || "",
  range: spell.range || "",
  duration: spell.duration || "",
  components: (spell.components || []).join(", "),
  material: spell.material || "",
  ritual: Boolean(spell.ritual),
  concentration: Boolean(spell.concentration),
  attackType: spell.attack_type || "",
  damageType: spell.damage?.damage_type?.name || "",
  description: compactText(spell.desc),
  higherLevel: compactText(spell.higher_level),
  ...parseSpellTranslation(spell.name),
}));

const equipment = read("5e-SRD-Equipment.json").map((item) => {
  const nameZh = equipmentNames.get(normalizeEnglish(item.name)) || item.name;
  return {
    id: `equipment-${item.index}`,
    sourceId: item.index,
    name: item.name,
    type: item.equipment_category?.name || "Equipment",
    category: item.category_range || item.weapon_category || "",
    cost: item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "",
    weight: Number(item.weight || 0),
    damage: item.damage?.damage_dice
      ? `${item.damage.damage_dice} ${item.damage.damage_type?.name || ""}`.trim()
      : "",
    armorClass: item.armor_class?.base || null,
    properties: (item.properties || []).map((entry) => entry.name),
    description: compactText(item.desc || item.special),
    nameZh,
    descriptionZh:
      gearDescriptions.get(normalizeEnglish(item.name)) ||
      genericEquipmentDescription(item, nameZh),
    rarity: "Common",
    magic: false,
  };
});

const magicItems = read("5e-SRD-Magic-Items.json").map((item) => {
  const translation = parseMagicTranslation(magicTranslationSource(item.name));
  return {
    id: `magic-${item.index}`,
    sourceId: item.index,
    name: item.name,
    type: item.equipment_category?.name || "Magic Item",
    category: "Magic Item",
    cost: "",
    weight: 0,
    damage: "",
    armorClass: null,
    properties: [],
    description: compactText(item.desc),
    nameZh: translatedMagicVariant(item.name, translation.nameZh || item.name),
    descriptionZh:
      translation.descriptionZh ||
      (item.name === "Orb of Dragonkind"
        ? "这枚直径约 10 寸的蚀刻水晶球封存着一条邪恶巨龙的精魂。与其同调者可尝试控制龙珠、从中施展法术，并向远方的邪恶巨龙发出心灵召唤；若意志不够坚定，反而可能受到龙珠魅惑与支配。龙珠拥有充能，具体法术、随机属性、控制检定与摧毁方式以完整 SRD 条目为准。"
        : ""),
    rarity: item.rarity?.name || "Varies",
    magic: true,
  };
});

const catalog = {
  meta: {
    ruleset: "D&D 5e SRD 5.1 (2014)",
    license: "CC BY 4.0",
    source: "5e-bits/5e-database + SagiriWWW/DND.SRD.zh-CN",
    generatedAt: new Date().toISOString(),
  },
  spells,
  items: [...equipment, ...magicItems],
};

const output = `window.SRD_CATALOG=${JSON.stringify(catalog)};\n`;
fs.writeFileSync(path.join(root, "data", "srd-catalog.js"), output, "utf8");

console.log(
  JSON.stringify({
    spells: catalog.spells.length,
    equipment: equipment.length,
    magicItems: magicItems.length,
    totalItems: catalog.items.length,
    bytes: Buffer.byteLength(output),
  }),
);
