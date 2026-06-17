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
    'unique-saint-nail': {id:'aspect_saint_nail',name:'天谴重击',desc:'大蒜光环转为每秒强制引爆；秘境进度每10%伤害永久连乘[x]12%。',tag:'UNIQUE_ASPECT'},
    'unique-thunder-bow': {id:'aspect_thunder_bow',name:'高压雷链',desc:'回旋飞斧命中20%分裂雷链锁定精英/Boss，并施加易伤[x]50%。',tag:'UNIQUE_ASPECT'},
    'unique-star-tome': {id:'aspect_star_tome',name:'星界黑洞',desc:'魔法飞弹穿透生成可重叠黑洞，目标承受[x]30%奥术独立伤害。',tag:'UNIQUE_ASPECT'},
    'unique-plague-bell': {id:'aspect_plague_bell',name:'疫病加速',desc:'幽魂刃舞对DoT目标暴击伤害[x]75%，击杀精英加快全屏DoT跳字。',tag:'UNIQUE_ASPECT'},
    'unique-blaze-core': {id:'aspect_blaze_core',name:'无限火海',desc:'陨星火海无上限重叠，Boss停留每秒火焰伤害[x]20%叠加。',tag:'UNIQUE_ASPECT'},
    'unique-void-lantern': {id:'aspect_void_lantern',name:'虚空超载',desc:'秘境进度每10%获得[x]15%独立攻速与移速，最高5层。',tag:'UNIQUE_ASPECT'},
    'unique-dragon-heart': {id:'aspect_dragon_heart',name:'龙心殉爆',desc:'击杀精英时在死亡点引发全屏殉爆，连锁小怪额外推进秘境进度。',tag:'UNIQUE_ASPECT'},
    'unique-elite-boots': {id:'aspect_elite_boots',name:'猎手进度',desc:'全伤害获得当前秘境进度等额独立放大，满进度锁定[x]120%。',tag:'UNIQUE_ASPECT'},
    'unique-moon-crown': {id:'aspect_moon_crown',name:'寒月护盾',desc:'冰霜法球暴击转化生命护盾，护盾存在时免疫控制并提升飞行速度。',tag:'UNIQUE_ASPECT'},
    'unique-blood-plate': {id:'aspect_blood_plate',name:'血契反击',desc:'生命每降低10%进化技能全伤害[x]15%，低血触发真实吸血。',tag:'UNIQUE_ASPECT'},
    'unique-clock-gloves': {id:'aspect_clock_gloves',name:'逆时冷却',desc:'满屏弹幕暴击有10%概率使冷却中核心大招CD减少1秒。',tag:'UNIQUE_ASPECT'},
    'unique-rose-mirror': {id:'aspect_rose_mirror',name:'欲念蓄池',desc:'承伤储存在欲念池，下一次攻击以[x]350%全屏喷溅。',tag:'UNIQUE_ASPECT'},
    'unique-abyss-mask': {id:'aspect_abyss_mask',name:'深渊斩杀',desc:'普通怪<30%、精英<20%、Boss<15%时触发致命暴击斩杀。',tag:'UNIQUE_ASPECT'},
    'unique-golem-soul': {id:'aspect_golem_soul',name:'岩盾守护',desc:'站立释放技能获得独立全减伤，并将荆棘按150%加入弹幕。',tag:'UNIQUE_ASPECT'},
    'unique-demon-horn': {id:'aspect_demon_horn',name:'魔王降临',desc:'最终Boss激活时弹幕数量与核心伤害翻倍，对Boss[x]60%。',tag:'UNIQUE_ASPECT'},
    'unique-pale-ring': {id:'aspect_pale_ring',name:'苍白相位',desc:'致命伤免死进入2.5秒相位，期间技能独立伤害[x]120%。',tag:'UNIQUE_ASPECT'},
    'unique-faith-boots': {id:'aspect_faith_boots',name:'黎明道路',desc:'圣光长枪留下圣痕道路，踩上后施法频率独立连乘[x]30%。',tag:'UNIQUE_ASPECT'},
    'unique-hunt-quiver': {id:'aspect_hunt_quiver',name:'无尽箭匣',desc:'匕首雨/风裂刃按额外攻速乘算分裂，每10%攻速弹幕+20%。',tag:'UNIQUE_ASPECT'},
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
