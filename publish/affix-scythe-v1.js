'use strict';
window.GameModules = window.GameModules || {};
window.GameModules.affix = (() => {
  // === 暗黑4乘区词条系统 ===
  // [+] ADDITIVE_POOL — 加算大池子，所有同标签数值直接累加
  // [x] SUB_BUCKET_[Name] — 子乘区桶，相同Name桶内加算，不同Name连乘
  // [x] UNIQUE_ASPECT_[ID] — 独立连乘链，每个ID完全独立

  const RES = ['physical','fire','frost','arcane','holy','shadow','poison','lust'];
  const RES_CN = { physical:'物理', fire:'火焰', frost:'霜寒', arcane:'奥术', holy:'神圣', shadow:'暗影', poison:'毒素', lust:'欲望' };

  // 词缀池定义：每条词缀有 tag (ADDITIVE_POOL / SUB_BUCKET / UNIQUE_ASPECT)
  // 黄金装备掉落时：3条[+]常规 + 1条(20%[x] / 80%[+])
  const SURVIVAL_AFFIXES = [ // 生存类 [+]
    {id:'hp',stat:'hp',name:'生命',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'armor',stat:'armor',name:'护甲',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'regen',stat:'regen',name:'回复',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'move',stat:'move',name:'移速',range:[.04,.14],tag:'ADDITIVE_POOL'},
  ];
  const ADDITIVE_AFFIXES = [ // 进攻类 [+] — 进加算大池子
    {id:'damage',stat:'damage',name:'伤害',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'cooldown',stat:'cooldown',name:'冷却',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'atkSpeed',stat:'atkSpeed',name:'攻速',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'range',stat:'range',name:'范围',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'crit',stat:'crit',name:'暴击',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'pickup',stat:'pickup',name:'拾取',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'gold',stat:'gold',name:'金币',range:[.06,.18],tag:'ADDITIVE_POOL'},
  ];
  const MULTIPLICATIVE_AFFIXES = [ // [x] 子乘区词条 — 20%概率出现在黄金第4条
    {id:'attrDmg_physical',stat:'attrDmg',attr:'physical',name:'物理属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_fire',stat:'attrDmg',attr:'fire',name:'火焰属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_frost',stat:'attrDmg',attr:'frost',name:'霜寒属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_arcane',stat:'attrDmg',attr:'arcane',name:'奥术属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_holy',stat:'attrDmg',attr:'holy',name:'神圣属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_shadow',stat:'attrDmg',attr:'shadow',name:'暗影属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_poison',stat:'attrDmg',attr:'poison',name:'毒素属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
    {id:'attrDmg_lust',stat:'attrDmg',attr:'lust',name:'欲望属性伤害',range:[.12,.24],tag:'SUB_BUCKET_TYPE'},
  ];
  const RESIST_AFFIXES = RES.map(r => ({id:'res_'+r,stat:'resist',attr:r,name:RES_CN[r]+'抗性',range:[.06,.14],tag:'ADDITIVE_POOL'}));

  // 随机取一条
  function pickRandom(pool) { return pool[Math.floor(Math.random()*pool.length)]; }

  // 词缀值缩放 (随等级)
  function scaleValue(range, level, mul) {
    let base = range[0] + Math.random()*(range[1]-range[0]);
    return Math.round(base * (1 + Math.max(0,level-1)*.024) * mul * 1000) / 1000;
  }

  // 生成黄金装备4条词缀
  // 返回 { stats:{}, resists:{}, tags:{key:tag} }
  function rollGoldAffixes(level, mul, slot, cls) {
    let stats = {}, resists = {}, tags = {};
    let addScaled = (k,v,tag) => {
      if (k === 'attrDmg') { /* handled below */ return; }
      stats[k] = Math.round(((stats[k]||0) + v)*1000)/1000;
      tags[k] = tag;
    };

    // 词缀1: 生存 [+]
    let a1 = pickRandom(SURVIVAL_AFFIXES);
    addScaled(a1.stat, scaleValue(a1.range, level, mul), a1.tag);

    // 词缀2: 进攻 [+]
    let a2 = pickRandom(slot==='weapon'||slot==='amulet'||slot==='ring' ? ADDITIVE_AFFIXES : [...ADDITIVE_AFFIXES,...SURVIVAL_AFFIXES]);
    addScaled(a2.stat, scaleValue(a2.range, level, mul), a2.tag);

    // 词缀3: 机制 [+]
    let mechPool = ADDITIVE_AFFIXES.filter(a => a.stat !== a2.stat && a.stat !== a1.stat);
    if (!mechPool.length) mechPool = ADDITIVE_AFFIXES;
    let a3 = pickRandom(mechPool);
    addScaled(a3.stat, scaleValue(a3.range, level, mul), a3.tag);

    // 词缀4: 20%概率[x]独立乘区, 80%继续[+]
    let isLucky = Math.random() < .2;
    if (isLucky) {
      let a4 = pickRandom(MULTIPLICATIVE_AFFIXES);
      let val = scaleValue(a4.range, level, mul);
      if (!stats.attrDmg) stats.attrDmg = {};
      stats.attrDmg[a4.attr] = (stats.attrDmg[a4.attr]||0) + val;
      tags['attrDmg_'+a4.attr] = a4.tag;
    } else {
      let a4 = pickRandom(ADDITIVE_AFFIXES);
      addScaled(a4.stat, scaleValue(a4.range, level, mul), a4.tag);
    }

    // 额外：45%概率出一条抗性
    if (slot !== 'weapon' && Math.random() < .45) {
      let ra = pickRandom(RESIST_AFFIXES);
      resists[ra.attr] = Math.round(((resists[ra.attr]||0) + scaleValue(ra.range, level, mul))*1000)/1000;
    }

    return { stats, resists, tags, isLucky };
  }

  // 暗金独有威能 [x] 定义 — 每个暗金自带1条UNIQUE_ASPECT
  const UNIQUE_ASPECTS = {
    'unique-void-lantern': {id:'aspect_void_lantern',name:'虚空牵引',desc:'每18秒吸入附近经验与金币',tag:'UNIQUE_ASPECT'},
    'unique-dragon-heart': {id:'aspect_dragon_heart',name:'龙心爆炎',desc:'受大量伤害时爆发火环',tag:'UNIQUE_ASPECT'},
    'unique-moon-crown': {id:'aspect_moon_crown',name:'寒月护盾',desc:'冻结弹幕转化为护盾',tag:'UNIQUE_ASPECT'},
    'unique-saint-nail': {id:'aspect_saint_nail',name:'圣钉裁决',desc:'击杀精英后强化光环伤害',tag:'UNIQUE_ASPECT'},
    'unique-thunder-bow': {id:'aspect_thunder_bow',name:'雷鸣链射',desc:'远程攻击周期性链向高威胁目标',tag:'UNIQUE_ASPECT'},
    'unique-blood-plate': {id:'aspect_blood_plate',name:'血契反击',desc:'低血时获得吸血反击',tag:'UNIQUE_ASPECT'},
    'unique-clock-gloves': {id:'aspect_clock_gloves',name:'逆时冷却',desc:'拾取Boss宝箱后强化冷却',tag:'UNIQUE_ASPECT'},
    'unique-greed-boots': {id:'aspect_greed_boots',name:'贪婪旅途',desc:'无尽首个Boss额外掉落',tag:'UNIQUE_ASPECT'},
    'unique-rose-mirror': {id:'aspect_rose_mirror',name:'蔷薇反射',desc:'承伤后储存为反击喷溅',tag:'UNIQUE_ASPECT'},
    'unique-abyss-mask': {id:'aspect_abyss_mask',name:'深渊锁定',desc:'自动攻击优先锁定精英',tag:'UNIQUE_ASPECT'},
    'unique-golem-soul': {id:'aspect_golem_soul',name:'岩盾守护',desc:'站立时获得岩盾',tag:'UNIQUE_ASPECT'},
    'unique-star-tome': {id:'aspect_star_tome',name:'星陨穿透',desc:'飞弹穿透后召唤小陨星',tag:'UNIQUE_ASPECT'},
    'unique-demon-horn': {id:'aspect_demon_horn',name:'魔王之力',desc:'Boss战中伤害提升',tag:'UNIQUE_ASPECT'},
    'unique-pale-ring': {id:'aspect_pale_ring',name:'苍白相位',desc:'受击后短暂相位化',tag:'UNIQUE_ASPECT'},
    'unique-faith-boots': {id:'aspect_faith_boots',name:'朝圣遗迹',desc:'移动留下治疗圣痕',tag:'UNIQUE_ASPECT'},
    'unique-hunt-quiver': {id:'aspect_hunt_quiver',name:'无尽箭雨',desc:'投射物概率复制',tag:'UNIQUE_ASPECT'},
    'unique-plague-bell': {id:'aspect_plague_bell',name:'瘟疫腐蚀',desc:'精英死亡留下腐蚀领域',tag:'UNIQUE_ASPECT'},
    'unique-sun-shield': {id:'aspect_sun_shield',name:'太阳残光',desc:'护盾破裂清除弹幕',tag:'UNIQUE_ASPECT'},
  };

  // 词缀标签前端显示
  function tagLabel(tag) {
    if (tag === 'ADDITIVE_POOL') return '[+]';
    if (tag.startsWith('SUB_BUCKET')) return '[x]';
    if (tag.startsWith('UNIQUE_ASPECT')) return '[x]';
    return '';
  }

  // 暗金威能描述
  function uniqueAspectDesc(baseId) { return UNIQUE_ASPECTS[baseId] || null; }

  return {
    SURVIVAL_AFFIXES, ADDITIVE_AFFIXES, MULTIPLICATIVE_AFFIXES, RESIST_AFFIXES,
    UNIQUE_ASPECTS, RES, RES_CN,
    rollGoldAffixes, tagLabel, uniqueAspectDesc, scaleValue, pickRandom
  };
})();
