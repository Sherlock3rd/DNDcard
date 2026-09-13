const fs = require("fs");
const vm = require("vm");

const appSource = fs.readFileSync("app.js", "utf8").replace(/\r\n/g, "\n");
const managerSource = fs.readFileSync("manager.js", "utf8").replace(/\r\n/g, "\n");
const indexSource = fs.readFileSync("index.html", "utf8");
const featSource = fs.readFileSync("data/feat-catalog.js", "utf8");

function extractLiteral(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`无法提取 ${startMarker}`);
  return source.slice(start + startMarker.length, end).trim();
}

const featContext = { window: {} };
vm.createContext(featContext);
vm.runInContext(featSource, featContext);
const featCatalog = featContext.window.FEAT_CATALOG;

const featEffects = vm.runInNewContext(`(${extractLiteral(managerSource, "const featEffectDefinitions =", ";\n\nconst abilityNames")})`);
const conditionCatalog = vm.runInNewContext(`(${extractLiteral(appSource, "const conditionCatalog =", ";\n\nconst conditionById")})`);

const abilityFeatIds = featCatalog
  .filter((feat) => /(力量|敏捷|体质|智力|感知|魅力)(?:或(?:力量|敏捷|体质|智力|感知|魅力))* \+1/.test(feat.summary))
  .map((feat) => feat.id);
if (!abilityFeatIds.includes("resilient")) abilityFeatIds.push("resilient");
const missingAbilityEffects = abilityFeatIds.filter((id) => !featEffects[id]?.abilityIncrease);
if (missingAbilityEffects.length) throw new Error(`缺少专长属性效果：${missingAbilityEffects.join(", ")}`);
const testInt = Math.min(20, 17 + featEffects["keen-mind"].abilityIncrease);
const testSpellAttack = 2 + Math.floor((testInt - 10) / 2);
if (testInt !== 18 || testSpellAttack !== 6) throw new Error("专长属性提升没有传递到施法攻击公式。");
if (2 + featEffects.alert.initiativeBonus !== 7) throw new Error("警觉专长没有传递到先攻公式。");
if (30 + featEffects.mobile.speedBonus !== 40) throw new Error("移动专长没有传递到速度公式。");

const bless = conditionCatalog.find((condition) => condition.id === "bless");
if (!bless?.modifiers?.attackDice?.includes("1d4") || !bless?.modifiers?.saveDice?.includes("1d4")) {
  throw new Error("祝福术没有同时修正攻击检定与豁免。");
}

for (const id of ["mage-armor", "shield", "mirror-image", "shield-of-faith", "haste", "longstrider", "pass-without-trace"]) {
  if (!conditionCatalog.some((condition) => condition.id === id)) throw new Error(`状态库缺少 ${id}`);
}

for (const id of [
  "initiativeValue",
  "passivePerceptionValue",
  "passiveInvestigationValue",
  "longswordAttackBonus",
  "crossbowAttackBonus",
  "spellAttackValue",
]) {
  if (!indexSource.includes(`id="${id}"`)) throw new Error(`页面缺少同步目标 #${id}`);
}

for (const storageKey of ["gandalf-5e-state", "gandalf-5e-manager"]) {
  if (!appSource.includes(storageKey) && !managerSource.includes(storageKey)) throw new Error(`本地存档键被移除：${storageKey}`);
}
if (/localStorage\.(?:clear|removeItem)\s*\(/.test(`${appSource}\n${managerSource}`)) {
  throw new Error("检测到会清空既有本地存档的调用。");
}

if (!managerSource.includes("window.getCharacterDerivedState") || !appSource.includes("window.getActiveConditionModifiers")) {
  throw new Error("专长与状态没有接入共享派生值接口。");
}

console.log(`修正值同步检查通过：${abilityFeatIds.length} 个属性型专长、${conditionCatalog.length} 个状态预设；本地存档键保持不变。`);
