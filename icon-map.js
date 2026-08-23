(function createSemanticIconMap() {
  const spellOverrides = {
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
    "arcane-hand": 43,
    "mage-hand": 43,
    "dimension-door": 56,
    etherealness: 56,
    "spiritual-weapon": 42,
    hallow: 34,
    stoneskin: 37,
    contingency: 37,
    forcecage: 38,
    "wall-of-force": 38,
    "pass-without-trace": 51,
    "storm-of-vengeance": 17,
    wish: 63,
    entangle: 46,
    web: 46,
    "fog-cloud": 9,
    "stinking-cloud": 28,
    "heroes-feast": 48,
  };

  const itemOverrides = {
    "equipment-longsword": 0,
    "equipment-quarterstaff": 3,
    "equipment-crossbow-light": 2,
    "equipment-crossbow-bolt": 2,
    "equipment-studded-leather-armor": 15,
    "equipment-component-pouch": 17,
    "equipment-spellbook": 24,
    "equipment-playing-card-set": 25,
    "magic-hat-of-disguise": 16,
    "equipment-sling-bullet": 2,
    "equipment-chain-shirt": 8,
    "equipment-dice-set": 53,
    "equipment-abacus": 53,
    "magic-brooch-of-shielding": 36,
  };

  const contains = (text, words) => words.some((word) => text.includes(word));
  const normalized = (...values) => values.filter(Boolean).join(" ").toLowerCase();

  function spellIndex(spell) {
    if (Number.isInteger(spellOverrides[spell.id])) return spellOverrides[spell.id];
    const text = normalized(spell.id, spell.name, spell.nameZh, spell.damageType, spell.description, spell.descriptionZh);
    const name = normalized(spell.id, spell.name, spell.nameZh, spell.damageType);
    const damage = normalized(spell.damageType);

    if (damage.includes("acid")) return contains(name, ["arrow", "箭"]) ? 24 : 26;
    if (damage.includes("cold")) return contains(name, ["wall", "storm", "墙", "风暴"]) ? 14 : 10;
    if (damage.includes("fire")) {
      if (contains(name, ["meteor", "流星"])) return 6;
      if (contains(name, ["ball", "sphere", "orb", "球", "法球"])) return 5;
      if (contains(name, ["wall", "storm", "墙", "风暴"])) return 2;
      return 0;
    }
    if (damage.includes("force")) return 22;
    if (damage.includes("lightning")) return contains(name, ["chain", "storm", "call", "链", "风暴", "召雷"]) ? 17 : 16;
    if (damage.includes("necrotic")) return 40;
    if (damage.includes("poison")) return contains(name, ["cloud", "spray", "云", "雾", "喷溅"]) ? 28 : 27;
    if (damage.includes("psychic")) return 62;
    if (damage.includes("radiant")) return 34;
    if (damage.includes("thunder")) return 61;

    if (contains(name, ["acid", "corros", "强酸", "酸液"])) return contains(name, ["arrow", "箭"]) ? 24 : 26;
    if (contains(name, ["poison", "venom", "toxic", "毒"])) return contains(name, ["cloud", "spray", "云", "雾"]) ? 28 : 27;
    if (contains(name, ["cold", "frost", "snow", "sleet", "寒冷", "冰", "霜", "雪"]) || /\bice\b/.test(name)) return contains(name, ["wall", "storm", "墙", "风暴"]) ? 14 : 10;
    if (contains(name, ["lightning", "闪电", "电爪", "雷电"])) return contains(name, ["chain", "storm", "call", "链", "风暴", "召雷"]) ? 17 : 16;
    if (contains(name, ["thunder", "sonic", "sound", "silence", "shatter", "雷鸣", "音", "寂静", "碎裂"])) return 61;
    if (contains(name, ["fire", "flame", "burn", "scorch", "heat", "meteor", "火", "焰", "灼", "燃烧", "流星"])) {
      if (contains(name, ["wall", "storm", "墙", "风暴"])) return 2;
      if (contains(name, ["ball", "sphere", "orb", "球", "法球"])) return 5;
      if (contains(name, ["meteor", "流星"])) return 6;
      return 0;
    }
    if (contains(name, ["antimagic", "antilife", "nondetection", "resilient sphere", "tiny hut", "反魔法", "反生物", "回避侦测", "弹力法球", "小屋"])) return 38;
    if (contains(name, ["heal", "cure", "restoration", "reviv", "resurrect", "life", "治疗", "疗伤", "复原", "复活", "生命"])) return 48;
    if (contains(name, ["radiant", "holy", "sacred", "divine", "bless", "guidance", "神圣", "光耀", "祝福", "祝圣", "圣光"])) return 34;
    if (contains(name, ["dark", "shadow", "eclipse", "黑暗", "阴影", "幽影"])) return 44;
    if (contains(name, ["necrotic", "death", "dead", "undead", "zombie", "skeleton", "skull", "死亡", "死灵", "亡灵", "骷髅", "僵尸"])) return 40;
    if (contains(name, ["spirit", "ghost", "spectral", "soul", "灵体", "幽灵", "鬼魂", "灵魂"])) return 42;
    if (contains(name, ["teleport", "dimension", "portal", "gate", "plane shift", "banish", "传送", "次元", "异界之门", "位面", "放逐"])) return 56;
    if (contains(name, ["see invisibility", "识破隐形"])) return 58;
    if (contains(name, ["illusion", "image", "invisib", "disguise", "blur", "phantasm", "幻术", "幻影", "隐形", "伪装", "朦胧"])) return 57;
    if (contains(name, ["detect", "divination", "scry", "clairvoy", "identify", "true seeing", "see invisibility", "侦测", "预言", "探知", "鉴定", "真知", "识破隐形"])) return 58;
    if (contains(name, ["charm", "suggest", "dominat", "confusion", "fear", "sleep", "dream", "mind", "crown of madness", "魅惑", "暗示", "支配", "困惑", "恐惧", "睡眠", "梦境", "心灵"])) return 62;
    if (contains(name, ["time", "haste", "slow", "foresight", "时间", "加速", "缓慢", "预见"])) return 59;
    if (contains(name, ["telekinesis", "levitate", "gravity", "floating", "念动力", "浮空", "重力", "漂浮"])) return 60;
    if (contains(name, ["animal", "beast", "familiar", "动物", "野兽", "魔宠"])) return 53;
    if (contains(name, ["dragon", "draconic", "龙"])) return 55;
    if (contains(name, ["plant", "tree", "vine", "thorn", "bark", "berry", "spike growth", "植物", "树", "藤", "荆棘", "树皮", "浆果", "刺状增生"])) return contains(name, ["thorn", "spike", "荆棘", "刺状"]) ? 46 : 52;
    if (contains(name, ["shield", "ward", "protection", "armor", "resistance", "invulner", "counterspell", "dispel", "护盾", "防护", "护甲", "抗性", "无敌", "法术反制", "解除魔法"])) return 37;
    if (contains(name, ["polymorph", "shapechange", "alter self", "transform", "enlarge", "reduce", "变形", "变身", "变化", "变巨", "缩小"])) return 63;
    if (contains(name, ["sun", "daylight", "light", "太阳", "日光", "光亮"])) return 39;
    if (contains(name, ["summon", "conjure", "召唤", "咒唤"])) return 32;
    if (contains(name, ["water", "水", "波涛"])) return 13;
    if (contains(name, ["wind", "gust", "风", "气流"])) return 9;
    if (contains(name, ["earth", "stone", "rock", "土", "岩", "石墙", "塑石"])) return 60;
    if (contains(name, ["blade", "slash", "刀刃", "剑刃"])) return 29;
    if (contains(name, ["sending", "message", "传讯", "短讯"])) return 61;
    if (contains(name, ["mansion", "豪宅", "府邸"])) return 32;
    if (contains(text, ["force damage", "力场伤害", "magic missile", "魔法飞弹"])) return 22;

    return {
      Abjuration: 37,
      Conjuration: 32,
      Divination: 58,
      Enchantment: 62,
      Evocation: 33,
      Illusion: 57,
      Necromancy: 40,
      Transmutation: 63,
    }[spell.school] ?? 33;
  }

  function itemIndex(item) {
    if (Number.isInteger(itemOverrides[item.id])) return itemOverrides[item.id];
    const name = normalized(item.id, item.sourceId, item.name, item.nameZh);

    if (contains(name, ["potion", "elixir", "philter", "vial", "flask", "药水", "灵药", "药剂", "小瓶", "瓶装"]) || /\boil\b/.test(name)) return 26;
    if (contains(name, ["wand", "魔杖"])) return 40;
    if (contains(name, ["quarterstaff", "staff", "法杖", "长棍"])) return 3;
    if (contains(name, ["rod", "权杖"])) return 45;
    if (contains(name, ["ring", "戒指", "指环"])) return 32;
    if (contains(name, ["brooch", "amulet", "necklace", "periapt", "talisman", "medallion", "胸针", "护符", "项链", "坠饰", "徽章"])) return 36;
    if (contains(name, ["shield", "盾牌", "护盾"])) return 5;
    if (contains(name, ["mace", "hammer", "maul", "club", "flail", "morningstar", "锤", "硬头锤", "巨棒", "连枷", "晨星"])) return 6;
    if (contains(name, ["crossbow", "longbow", "shortbow", "arrow", "bolt", "ammunition", "弩", "弓", "箭", "弹药"]) || /\bbow\b/.test(name)) return 2;
    if (contains(name, ["greatsword", "longsword", "shortsword", "scimitar", "rapier", "sword", "blade", "大剑", "长剑", "短剑", "弯刀", "刺剑", "剑刃"])) return 0;
    if (contains(name, ["battleaxe", "greataxe", "handaxe", "halberd", "glaive", "war-pick", "war pick", "axe", "斧", "长戟", "战镐", "长柄刀"])) return 1;
    if (contains(name, ["dagger", "knife", "dart", "匕首", "小刀", "飞镖"])) return 4;
    if (contains(name, ["spear", "javelin", "trident", "lance", "pike", "长矛", "标枪", "三叉戟", "骑枪", "长枪"])) return 7;
    if (contains(name, ["helmet", "helm", "头盔", "战盔"])) return 9;
    if (contains(name, ["cloak", "cape", "robe", "斗篷", "披风", "长袍"])) return 10;
    if (contains(name, ["lantern", "lamp", "torch", "candle", "提灯", "油灯", "火把", "蜡烛"])) return 19;
    if (contains(name, ["boot", "shoe", "slipper", "靴", "鞋"])) return 11;
    if (contains(name, ["glove", "gauntlet", "手套", "臂铠"])) return 12;
    if (contains(name, ["crown", "circlet", "headband", "王冠", "头环", "发带"])) return 14;
    if (contains(name, ["leather armor", "hide armor", "皮甲", "兽皮甲"])) return 15;
    if (contains(name, ["armor", "mail", "plate", "breastplate", "chain-shirt", "chain shirt", "护甲", "链甲", "板甲", "鳞甲", "铠甲", "胸甲"])) return 8;
    if (contains(name, ["flute", "pipes", "bagpipes", "shawm", "笛", "排箫", "风笛", "唢呐"])) return 61;
    if (contains(name, ["lute", "lyre", "harp", "dulcimer", "viol", "drum", "鲁特琴", "竖琴", "扬琴", "提琴", "鼓"])) return 60;
    if (contains(name, ["horn", "号角", "角笛"])) return 62;
    if (contains(name, ["hat", "hood", "帽", "兜帽"])) return 16;
    if (contains(name, ["bag", "pouch", "sack", "quiver", "case", "袋", "包", "箭袋", "盒"])) return 17;
    if (contains(name, ["rope", "chain", "绳", "锁链"])) return 18;
    if (contains(name, ["backpack", "explorer's pack", "dungeoneer's pack", "scholar's pack", "背包", "套组"])) return 20;
    if (contains(name, ["pickaxe", "miner's pick", "鹤嘴锄", "矿镐"])) return 21;
    if (contains(name, ["shovel", "spade", "铲", "锹"])) return 22;
    if (contains(name, ["anchor", "锚"])) return 23;
    if (contains(name, ["spellbook", "book", "tome", "manual", "grimoire", "法术书", "书", "魔典", "手册"])) return 24;
    if (contains(name, ["scroll", "map", "paper", "card", "deck", "卷轴", "地图", "纸", "牌组", "纸牌"])) return 25;
    if (contains(name, ["crystal ball", "orb", "水晶球", "法球"])) return 46;
    if (contains(name, ["blue sapphire", "aquamarine", "蓝宝石", "海蓝宝石"])) return 30;
    if (contains(name, ["amber", "topaz", "黄玉", "琥珀"])) return 31;
    if (contains(name, ["gem", "crystal", "jewel", "宝石", "水晶"])) return 30;
    if (contains(name, ["chalice", "goblet", "bowl", "圣杯", "高脚杯", "碗"])) return 48;
    if (contains(name, ["hourglass", "沙漏"])) return 49;
    if (/\bkey\b/.test(name) || contains(name, ["钥匙"])) return 50;
    if (contains(name, ["token", "符记", "信物"])) return 53;
    if (contains(name, ["seal", "印章", "封印"])) return 54;
    if (/\block\b/.test(name) || contains(name, ["挂锁", "门锁"])) return 55;
    if (contains(name, ["meat", "肉", "口粮"]) || /\brations?\b/.test(name)) return 56;
    if (contains(name, ["bread", "面包"])) return 57;
    if (contains(name, ["cheese", "奶酪"])) return 58;
    if (contains(name, ["wine", "beer", "酒"]) || /\bale\b/.test(name)) return 59;
    if (contains(name, ["dice", "abacus", "骰子", "算盘"])) return 53;
    if (contains(name, ["boat", "galley", "keelboat", "rowboat", "longship", "warship", "sailing-ship", "船", "艇", "桨帆船"]) || /\bship\b/.test(name)) return 23;
    if (contains(name, ["horse", "pony", "mule", "donkey", "camel", "elephant", "mastiff", "saddle", "马", "骡", "驴", "骆驼", "象", "獒", "鞍"])) return 63;
    if (contains(name, ["figurine", "雕像", "雕像"])) return 63;
    if (contains(name, ["ioun-stone", "ioun stone", "luckstone", "艾恩石", "幸运石"])) return 30;
    if (contains(name, ["dragon scale", "dragon hide", "龙鳞", "龙皮"])) return 63;

    return {
      Weapon: 0,
      Armor: 8,
      Ammunition: 2,
      Potion: 26,
      Ring: 32,
      Rod: 45,
      Scroll: 25,
      Staff: 3,
      Wand: 40,
      Tools: 17,
      "Adventuring Gear": 20,
      "Mounts and Vehicles": 63,
      "Wondrous Items": 35,
    }[item.type] ?? (item.magic ? 35 : 20);
  }

  function styleForIndex(index) {
    const safeIndex = Math.max(0, Math.min(63, Number(index) || 0));
    const col = safeIndex % 8;
    const row = Math.floor(safeIndex / 8);
    return `--icon-x:${(col * 100) / 7}%;--icon-y:${(row * 100) / 7}%;--icon-hue:0deg`;
  }

  window.DND_ICON_MAP = {
    spellIndex,
    itemIndex,
    spellStyle: (spell) => styleForIndex(spellIndex(spell)),
    itemStyle: (item) => styleForIndex(itemIndex(item)),
    styleForIndex,
  };
})();
