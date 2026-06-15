window.GameModules = window.GameModules || {};
window.GameModules.equipment = (() => {
  const ICON_SHEETS = {
    gold: './assets/generated/equipment-icons-gold-sheet.119ccbff.webp',
    unique: './assets/generated/equipment-icons-unique-sheet.0332595f.webp',
    setPaladin: './assets/generated/equipment-icons-set-paladin-sheet.d6ae3f39.webp',
    setMage: './assets/generated/equipment-icons-set-mage-sheet.d2792467.webp',
    setRanger: './assets/generated/equipment-icons-set-ranger-sheet.9fe29e3a.webp',
    setSaintess: './assets/generated/equipment-icons-set-saintess-sheet.908e5cd0.webp',
  };
  const SLOTS = ['weapon', 'helm', 'chest', 'amulet', 'ring', 'boots'];
  const SLOT_CN = { weapon: '武器', helm: '头盔', chest: '胸甲', amulet: '项链', ring: '戒指', boots: '靴子' };
  const RES = ['physical', 'fire', 'frost', 'arcane', 'holy', 'shadow', 'lust'];
  const GOLD = [
    ['gold-sun-blade', '耀金切割者', 'weapon', { damage: .16, atkSpeed: .04 }, { fire: .08, holy: .06 }],
    ['gold-meteor-staff', '陨星金杖', 'weapon', { damage: .14, range: .08 }, { fire: .1, arcane: .04 }],
    ['gold-hawk-bow', '猎鹰金弓', 'weapon', { atkSpeed: .1, range: .1 }, { physical: .08 }],
    ['gold-crystal-mace', '晶核权杖', 'weapon', { damage: .12, pickup: .08 }, { arcane: .08, holy: .04 }],
    ['gold-dragon-axe', '龙纹战斧', 'weapon', { damage: .2, move: -.03 }, { fire: .12 }],
    ['gold-moon-dagger', '月辉短刃', 'weapon', { atkSpeed: .14, crit: .05 }, { frost: .07, shadow: .05 }],
    ['gold-ward-crown', '守望金冠', 'helm', { hp: .1, armor: .04 }, { holy: .08, arcane: .04 }],
    ['gold-flame-visor', '烬火面甲', 'helm', { damage: .07, hp: .06 }, { fire: .12 }],
    ['gold-frost-hood', '霜纹兜帽', 'helm', { cooldown: .05, range: .04 }, { frost: .12 }],
    ['gold-stone-helm', '岩芯重盔', 'helm', { hp: .16, armor: .06 }, { physical: .12 }],
    ['gold-void-mask', '虚金假面', 'helm', { damage: .08, pickup: .06 }, { shadow: .1, arcane: .04 }],
    ['gold-rose-veil', '蔷薇金纱', 'helm', { hp: .08, regen: .04 }, { lust: .1, holy: .04 }],
    ['gold-sun-plate', '太阳镀层甲', 'chest', { hp: .18, armor: .06 }, { holy: .08, fire: .06 }],
    ['gold-ember-robe', '余烬法袍', 'chest', { damage: .09, cooldown: .04 }, { fire: .1, arcane: .04 }],
    ['gold-hunter-leather', '金线猎装', 'chest', { move: .08, atkSpeed: .06 }, { physical: .08, frost: .04 }],
    ['gold-deep-carapace', '深金壳甲', 'chest', { hp: .22, move: -.04 }, { physical: .14 }],
    ['gold-mist-robe', '迷雾长袍', 'chest', { range: .08, pickup: .1 }, { shadow: .1 }],
    ['gold-vessel-dress', '圣器礼服', 'chest', { hp: .14, regen: .06 }, { lust: .12 }],
    ['gold-dawn-amulet', '黎明护符', 'amulet', { damage: .08, cooldown: .05 }, { holy: .1 }],
    ['gold-arcane-core', '秘法金核', 'amulet', { range: .1, pickup: .12 }, { arcane: .12 }],
    ['gold-fire-heart', '熔火心坠', 'amulet', { damage: .11, hp: .05 }, { fire: .12 }],
    ['gold-ice-tear', '冰月泪滴', 'amulet', { cooldown: .06, move: .04 }, { frost: .12 }],
    ['gold-bone-charm', '骸骨金坠', 'amulet', { armor: .05, hp: .1 }, { physical: .1, shadow: .04 }],
    ['gold-rose-heart', '蔷薇心坠', 'amulet', { regen: .08, pickup: .08 }, { lust: .12 }],
    ['gold-signet-fury', '狂怒金戒', 'ring', { damage: .1, atkSpeed: .05 }, { fire: .06 }],
    ['gold-signet-focus', '专注金戒', 'ring', { cooldown: .08, range: .04 }, { arcane: .08 }],
    ['gold-signet-guard', '坚守金戒', 'ring', { hp: .1, armor: .04 }, { physical: .08, holy: .04 }],
    ['gold-signet-moon', '月影金戒', 'ring', { move: .06, crit: .04 }, { frost: .08, shadow: .04 }],
    ['gold-signet-greed', '拾荒金戒', 'ring', { pickup: .18, gold: .12 }, { shadow: .06 }],
    ['gold-signet-rose', '玫瑰金戒', 'ring', { regen: .06, hp: .08 }, { lust: .1 }],
    ['gold-sun-greaves', '日铸胫甲', 'boots', { move: .08, hp: .06 }, { holy: .06, fire: .04 }],
    ['gold-wind-boots', '疾风金靴', 'boots', { move: .14, atkSpeed: .04 }, { physical: .06 }],
    ['gold-frost-steps', '霜踏长靴', 'boots', { move: .08, cooldown: .04 }, { frost: .1 }],
    ['gold-void-steps', '虚空行靴', 'boots', { move: .1, range: .05 }, { shadow: .08, arcane: .04 }],
    ['gold-stone-sabaton', '岩金战靴', 'boots', { hp: .12, armor: .04 }, { physical: .1 }],
    ['gold-rose-slippers', '蔷薇软靴', 'boots', { move: .06, regen: .06 }, { lust: .1 }],
  ];
  const UNIQUES = [
    ['unique-void-lantern', '暗金·虚空提灯', 'amulet', { damage: .12, pickup: .18 }, { shadow: .16, arcane: .08 }, '每 18 秒吸入附近经验与金币，并使下一次升级选项品质提高。'],
    ['unique-dragon-heart', '暗金·龙心余烬', 'chest', { hp: .2, damage: .1 }, { fire: .22 }, '受到生命上限 20% 以上伤害时爆发火环，冷却 8 秒。'],
    ['unique-moon-crown', '暗金·霜月王冠', 'helm', { cooldown: .08, range: .08 }, { frost: .2 }, '冻结弹幕命中你时转化为 3 秒寒月护盾。'],
    ['unique-saint-nail', '暗金·圣钉战槌', 'weapon', { damage: .22, atkSpeed: -.04 }, { holy: .16 }, '击杀精英后 6 秒内所有光环伤害附带圣击。'],
    ['unique-thunder-bow', '暗金·雷鸣长弓', 'weapon', { atkSpeed: .16, range: .14 }, { arcane: .12, physical: .08 }, '每第 7 次远程攻击链向 4 个高威胁目标。'],
    ['unique-blood-plate', '暗金·血契重甲', 'chest', { hp: .26, armor: .08 }, { physical: .14, shadow: .1 }, '低于 35% 生命时获得吸血反击，但治疗效果降低。'],
    ['unique-clock-gloves', '暗金·逆时针环', 'ring', { cooldown: .12, atkSpeed: .08 }, { arcane: .14 }, '拾取 Boss 宝箱后随机一个技能冷却永久缩短。'],
    ['unique-greed-boots', '暗金·贪婪旅靴', 'boots', { move: .12, gold: .28 }, { shadow: .12 }, '每层无尽首个 Boss 额外掉落一次装备判定。'],
    ['unique-rose-mirror', '暗金·蔷薇镜', 'amulet', { hp: .14, regen: .1 }, { lust: .18, holy: .06 }, '承受属性伤害后把部分数值储存为下一次反击喷溅。'],
    ['unique-abyss-mask', '暗金·深渊假面', 'helm', { damage: .18, crit: .06 }, { shadow: .2 }, '自动攻击优先锁定精英，击杀精英刷新一次主技能。'],
    ['unique-golem-soul', '暗金·巨像魂核', 'ring', { hp: .2, armor: .06 }, { physical: .18 }, '站立 2 秒获得可叠加岩盾，移动后逐层衰减。'],
    ['unique-star-tome', '暗金·星陨秘典', 'weapon', { damage: .18, range: .16 }, { arcane: .18 }, '魔法飞弹每穿透 3 个目标会召下一颗小陨星。'],
    ['unique-demon-horn', '暗金·魔王断角', 'helm', { damage: .16, hp: .12 }, { fire: .12, shadow: .12 }, 'Boss 战中伤害提升翻倍，但受到普通伤害提高。'],
    ['unique-pale-ring', '暗金·苍白轮戒', 'ring', { cooldown: .1, move: .08 }, { frost: .14, shadow: .08 }, '受击后短暂相位化，期间可穿过小怪。'],
    ['unique-faith-boots', '暗金·朝圣者遗步', 'boots', { move: .08, regen: .08 }, { holy: .16 }, '每移动 600 距离留下治疗圣痕。'],
    ['unique-hunt-quiver', '暗金·无尽箭匣', 'amulet', { atkSpeed: .12, range: .1 }, { physical: .14 }, '回旋飞斧与投射物有概率复制一次。'],
    ['unique-plague-bell', '暗金·瘟疫铃', 'weapon', { range: .12, cooldown: .06 }, { shadow: .14, lust: .06 }, '被你击杀的精英留下持续腐蚀领域。'],
    ['unique-sun-shield', '暗金·太阳残盾', 'chest', { hp: .18, armor: .1 }, { holy: .18, fire: .08 }, '护盾破裂时清除周围弹幕并眩晕小怪。'],
  ];
  const SET_FAMILIES = [
    ['paladin', 'aureate-guardian', '辉金守护', 'setPaladin', { hp: .08, armor: .03, holy: .06 }, ['2件：大蒜光环范围 +22%。', '4件：光环每秒给你叠加圣盾。', '6件：圣盾满层时光环周期性释放审判波。']],
    ['paladin', 'thorn-bulwark', '荆棘壁垒', 'setPaladin', { hp: .1, physical: .06, fire: .04 }, ['2件：受到近战伤害反弹。', '4件：护盾怪造成的属性伤害降低。', '6件：反弹可触发圣骑士怒气并连锁到精英。']],
    ['paladin', 'dawn-judgment', '黎明审判', 'setPaladin', { damage: .07, range: .04, holy: .06 }, ['2件：圣矛/圣击伤害 +30%。', '4件：击杀精英后召唤黎明枪雨。', '6件：Boss 每损失 20% 生命触发一次大审判。']],
    ['mage', 'astral-missile', '星界飞弹', 'setMage', { damage: .08, arcane: .06, range: .05 }, ['2件：魔法飞弹数量 +1。', '4件：飞弹命中同一 Boss 时叠加易伤。', '6件：飞弹过量命中会生成星环爆裂。']],
    ['mage', 'ember-meteor', '余烬陨星', 'setMage', { damage: .09, fire: .07, cooldown: .03 }, ['2件：火焰/陨星技能范围 +20%。', '4件：燃烧目标死亡会分裂火花。', '6件：每 10 秒落下一颗追踪巨陨。']],
    ['mage', 'storm-sigil', '风暴符印', 'setMage', { atkSpeed: .06, arcane: .05, cooldown: .04 }, ['2件：雷系连锁目标 +2。', '4件：连锁击中精英返还冷却。', '6件：屏幕内精英越多，风暴频率越高。']],
    ['ranger', 'cyclone-axe', '旋风飞斧', 'setRanger', { atkSpeed: .07, physical: .06, range: .04 }, ['2件：回旋飞斧飞行时间 +30%。', '4件：飞斧回收时再次造成伤害。', '6件：每第三把飞斧变为大型旋风斧。']],
    ['ranger', 'moon-hunter', '月影猎手', 'setRanger', { crit: .05, frost: .06, move: .04 }, ['2件：移动后下一击暴击提高。', '4件：暴击附带月霜减速。', '6件：暴击击杀精英会召唤月刃雨。']],
    ['ranger', 'venom-shadow', '毒影伏击', 'setRanger', { atkSpeed: .05, shadow: .06, move: .05 }, ['2件：自动攻击附带毒影标记。', '4件：标记叠满时爆炸。', '6件：Boss 身上的标记会复制给周围精英。']],
    ['lewdSaintess', 'crimson-vessel', '绯红圣器', 'setSaintess', { hp: .1, lust: .07, regen: .04 }, ['2件：容器可额外储存承伤。', '4件：替血后提升反击喷溅。', '6件：属性伤害替血后释放绯红净化波。']],
    ['lewdSaintess', 'violet-hymn', '紫罗兰圣歌', 'setSaintess', { range: .06, holy: .05, lust: .05 }, ['2件：祈祷/光环范围 +24%。', '4件：范围内敌人攻击间隔变长。', '6件：圣歌周期性把小怪推离并治疗自身。']],
    ['lewdSaintess', 'rose-mirror', '蔷薇镜像', 'setSaintess', { damage: .06, lust: .06, shadow: .04 }, ['2件：反击喷溅范围 +25%。', '4件：喷溅命中精英时回复容器值。', '6件：Boss 攻击后生成镜像喷溅反击。']],
  ];
  const pieceNames = { weapon: '武器', helm: '冠冕', chest: '衣甲', amulet: '坠饰', ring: '戒环', boots: '足具' };
  const toItem = (r, sheet, i) => ({ id: r[0], name: r[1], rarity: sheet, slot: r[2], stats: r[3], resists: r[4], effect: r[5] || '', icon: { sheet: ICON_SHEETS[sheet], index: i } });
  const gold = GOLD.map((r, i) => toItem(r, 'gold', i));
  const uniques = UNIQUES.map((r, i) => toItem(r, 'unique', i));
  const sets = SET_FAMILIES.flatMap(f => SLOTS.map((slot, i) => ({
    id: `set-${f[1]}-${slot}`, name: `${f[2]}·${pieceNames[slot]}`, rarity: 'set', class: f[0], setId: f[1], setName: f[2], slot,
    stats: { ...f[4], [slot === 'weapon' ? 'damage' : slot === 'boots' ? 'move' : slot === 'ring' ? 'atkSpeed' : slot === 'amulet' ? 'range' : 'hp']: .06 },
    resists: Object.fromEntries(Object.entries(f[4]).filter(([k]) => RES.includes(k))), bonuses: { 2: f[5][0], 4: f[5][1], 6: f[5][2] }, icon: { sheet: ICON_SHEETS[f[3]], index: SET_FAMILIES.indexOf(f) % 3 * 6 + i }
  })));
  const all = [...gold, ...uniques, ...sets];
  return { ICON_SHEETS, SLOTS, SLOT_CN, gold, uniques, sets, setFamilies: SET_FAMILIES, all };
})();
