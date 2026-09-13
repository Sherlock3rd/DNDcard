(function () {
  const typeFields = {
    Weapon: ["damage", "properties"],
    Armor: ["armorClass", "properties"],
    Ammunition: ["damage", "properties"],
    Tools: ["properties"],
    Staff: ["damage", "properties"],
  };
  const fieldsFor = (type) => typeFields[type] || [];
  function readItem(form, original = null) {
    const text = (name) => String(form.get(name) || "").trim();
    const type = text("type") || "Adventuring Gear";
    const entry = {
      ...(original || {}),
      id: original?.id || `custom-item-${crypto.randomUUID()}`,
      nameZh: text("nameZh"),
      name: text("name") || text("nameZh"),
      type, iconType: text("iconType"),
      category: text("category"), rarity: text("rarity") || "Common",
      cost: text("cost"), weight: Number(text("weight") || 0),
      descriptionZh: text("descriptionZh"), magic: form.get("magic") === "on",
      custom: original ? Boolean(original.custom) : true,
    };
    for (const key of ["damage", "armorClass", "properties"]) {
      if (fieldsFor(type).includes(key)) {
        entry[key] = key === "properties" ? text(key).split(/[,，]/).map((x) => x.trim()).filter(Boolean)
          : key === "armorClass" ? (text(key) ? Number(text(key)) : null) : text(key);
      } else if (!original || original.type !== type) {
        entry[key] = key === "properties" ? [] : key === "armorClass" ? null : "";
      }
    }
    return entry;
  }
  function snapshot(manager, combat, scope, now = new Date()) {
    if (!["items", "full"].includes(scope)) throw new Error("未知导出范围");
    const payload = scope === "items"
      ? { customItems: manager.customItems || [], itemOverrides: manager.itemOverrides || {}, inventory: manager.inventory || [] }
      : { manager, state: combat };
    // Clone only application data; never enumerate browser storage or include credentials.
    return JSON.parse(JSON.stringify({ format: "dndcard-snapshot", version: 1, scope, exportedAt: now.toISOString(), payload }));
  }
  window.DND_ITEM_DATA = { fieldsFor, readItem, snapshot };
})();
