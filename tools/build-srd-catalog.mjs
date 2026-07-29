import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "tmp", "5e-database", "src", "2014", "en");

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(sourceDir, name), "utf8"));

const compactText = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join("\n\n") : value || "";

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
}));

const equipment = read("5e-SRD-Equipment.json").map((item) => ({
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
  rarity: "Common",
  magic: false,
}));

const magicItems = read("5e-SRD-Magic-Items.json").map((item) => ({
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
  rarity: item.rarity?.name || "Varies",
  magic: true,
}));

const catalog = {
  meta: {
    ruleset: "D&D 5e SRD 5.1 (2014)",
    license: "CC BY 4.0",
    source: "5e-bits/5e-database",
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
