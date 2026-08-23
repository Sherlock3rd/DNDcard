const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("data/feat-catalog.js", "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const feats = context.window.FEAT_CATALOG;
if (!Array.isArray(feats)) throw new Error("FEAT_CATALOG 未正确导出数组。");
if (feats.length !== 42) throw new Error(`预期 42 个 2014 版专长，实际为 ${feats.length} 个。`);

const requiredFields = ["id", "name", "nameZh", "category", "summary"];
for (const feat of feats) {
  for (const field of requiredFields) {
    if (!String(feat[field] || "").trim()) throw new Error(`${feat.id || "未知条目"} 缺少字段 ${field}。`);
  }
}

for (const field of ["id", "name", "nameZh"]) {
  const values = feats.map((feat) => feat[field]);
  if (new Set(values).size !== values.length) throw new Error(`专长字段 ${field} 存在重复值。`);
}

console.log(`专长目录检查通过：${feats.length} 项，ID、英文名、中文名均唯一，必填摘要完整。`);
