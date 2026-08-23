global.window = {};
require("../data/srd-catalog.js");
require("../icon-map.js");

const { spells, items } = window.SRD_CATALOG;
const iconMap = window.DND_ICON_MAP;

function audit(entries, indexFor, label) {
  const invalid = [];
  const distribution = new Map();
  entries.forEach((entry) => {
    const index = indexFor(entry);
    if (!Number.isInteger(index) || index < 0 || index > 63) invalid.push({ id: entry.id, index });
    distribution.set(index, (distribution.get(index) || 0) + 1);
  });
  if (invalid.length) throw new Error(`${label} 存在无效图标映射：${JSON.stringify(invalid.slice(0, 10))}`);
  console.log(`${label}: ${entries.length} 条，使用 ${distribution.size} 个语义图标，无越界映射。`);
  console.log([...distribution.entries()].sort((a, b) => a[0] - b[0]).map(([index, count]) => `${index}:${count}`).join(" "));
}

audit(spells, iconMap.spellIndex, "法术");
audit(items, iconMap.itemIndex, "物品");

const requiredSpellIcons = {
  light: 39,
  "fire-bolt": 0,
  "custom-spell-booming-blade": 16,
  "detect-magic": 58,
  "find-familiar": 53,
  shield: 37,
  thunderwave: 61,
  "mage-armor": 38,
  "custom-spell-absorb-elements": 37,
  "magic-missile": 22,
  sleep: 62,
  "mirror-image": 57,
  "misty-step": 56,
};
const requiredItemIcons = {
  "equipment-longsword": 0,
  "equipment-quarterstaff": 3,
  "equipment-crossbow-light": 2,
  "equipment-crossbow-bolt": 2,
  "equipment-studded-leather-armor": 15,
  "equipment-component-pouch": 17,
  "equipment-spellbook": 24,
  "equipment-playing-card-set": 25,
  "magic-hat-of-disguise": 16,
  "equipment-abacus": 53,
  "equipment-dice-set": 53,
  "equipment-donkey": 63,
  "equipment-block-of-incense": 20,
  "equipment-chain-shirt": 8,
  "magic-bowl-of-commanding-water-elementals": 48,
  "magic-ioun-stone-of-leadership": 30,
  "magic-nine-lives-stealer": 0,
};

Object.entries(requiredSpellIcons).forEach(([id, expected]) => {
  const entry = spells.find((spell) => spell.id === id) || { id };
  if (iconMap.spellIndex(entry) !== expected) throw new Error(`法术 ${id} 图标应为 ${expected}`);
});
Object.entries(requiredItemIcons).forEach(([id, expected]) => {
  const entry = items.find((item) => item.id === id) || { id };
  if (iconMap.itemIndex(entry) !== expected) throw new Error(`物品 ${id} 图标应为 ${expected}`);
});

console.log("角色核心法术与装备图标语义检查通过。");
