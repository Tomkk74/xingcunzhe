'use strict';
window.GameModules = window.GameModules || {};
window.GameModules.affix = (() => {
  // 词条底层统一使用扁平 key，避免 attrDmg:{fire:x} 这类嵌套在装备挂载时漏读。
  const RES = ['physical','fire','frost','arcane','holy','shadow','poison','lust'];
  const RES_CN = { physical:'物理', fire:'火焰', frost:'霜寒', arcane:'奥术', holy:'神圣', shadow:'暗影', poison:'毒素', lust:'欲望' };

  const SURVIVAL_AFFIXES = [
    {id:'hp',stat:'hp',name:'生命',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'armor',stat:'armor',name:'护甲',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'regen',stat:'regen',name:'回复',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'move',stat:'move',name:'移速',range:[.04,.14],tag:'ADDITIVE_POOL'},
  ];
  const ADDITIVE_AFFIXES = [
    {id:'damage',stat:'damage',name:'伤害',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'cooldown',stat:'cooldown',name:'冷却',range:[.04,.12],tag:'ADDITIVE_POOL'},
    {id:'atkSpeed',stat:'atkSpeed',name:'攻速',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'range',stat:'range',name:'范围',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'crit',stat:'crit',name:'暴击',range:[.04,.14],tag:'ADDITIVE_POOL'},
    {id:'pickup',stat:'pickup',name:'拾取',range:[.06,.18],tag:'ADDITIVE_POOL'},
    {id:'gold',stat:'gold',name:'金币',range:[.06,.18],tag:'ADDITIVE_POOL'},
  ];
  const MULTIPLICATIVE_AFFIXES = RES.map(r => ({
    id:'attrDmg_'+r,
    stat:'attrDmg_'+r,
    attr:r,
    name:RES_CN[r]+'属性伤害',
    range:[.12,.24],
    tag:'SUB_BUCKET_TYPE'
  }));
  const RESIST_AFFIXES = RES.map(r => ({id:'res_'+r,stat:'resist_'+r,attr:r,name:RES_CN[r]+'抗性',range:[.06,.14],tag:'ADDITIVE_POOL'}));

  function pickRandom(pool) { return pool[Math.floor(Math.random()*pool.length)]; }
  function affixKey(a) { return a.id || a.stat; }
  function available(pool, used) { return pool.filter(a => !used.has(affixKey(a)) && !used.has(a.stat)); }
  function powerScale(itemPower=1) {
    let ip = Math.max(1, Math.min(120, Number(itemPower)||1)), x = ip / 120;
    return .6 + Math.pow(x, 2.15) * 24;
  }
  function powerTier(itemPower=1) {
    let ip = Math.max(1, Math.min(120, Number(itemPower)||1));
    return ip>=110?'神铸':ip>=90?'远古':ip>=70?'卓越':ip>=50?'精良':ip>=30?'普通':'残破';
  }
  function scaleValue(range, level, mul, itemPower=level) {
    let base = range[0] + Math.random()*(range[1]-range[0]);
    return Math.round(base * powerScale(itemPower) * mul * 1000) / 1000;
  }
  function addFlat(stats, resists, tags, used, a, level, mul) {
    if (!a) return false;
    let key = affixKey(a), val = scaleValue(a.range, level, mul, level);
    used.add(key); used.add(a.stat);
    if (a.attr && a.stat.startsWith('resist_')) resists[a.attr] = Math.round(((resists[a.attr]||0)+val)*1000)/1000;
    else stats[a.stat] = Math.round(((stats[a.stat]||0)+val)*1000)/1000;
    tags[key] = a.tag;
    return a.tag && a.tag.startsWith('SUB_BUCKET');
  }
  function rollFrom(pool, used, stats, resists, tags, level, mul) {
    let p = available(pool, used);
    if (!p.length) return false;
    return addFlat(stats, resists, tags, used, pickRandom(p), level, mul);
  }

  function rollGoldAffixes(level, mul, slot, cls) {
    let stats = {}, resists = {}, tags = {}, used = new Set(), lucky = false, hasExtra = false;
    let offensePool = slot==='weapon'||slot==='amulet'||slot==='ring' ? ADDITIVE_AFFIXES : ADDITIVE_AFFIXES.concat(SURVIVAL_AFFIXES);
    lucky = rollFrom(SURVIVAL_AFFIXES, used, stats, resists, tags, level, mul) || lucky;
    lucky = rollFrom(offensePool, used, stats, resists, tags, level, mul) || lucky;
    lucky = rollFrom(ADDITIVE_AFFIXES.concat(SURVIVAL_AFFIXES), used, stats, resists, tags, level, mul) || lucky;
    let fourthPool = Math.random() < .2 ? MULTIPLICATIVE_AFFIXES : ADDITIVE_AFFIXES.concat(SURVIVAL_AFFIXES);
    lucky = rollFrom(fourthPool, used, stats, resists, tags, level, mul) || lucky;
    if (Math.random() < .2) {
      hasExtra = true;
      let fifthPool = Math.random() < .25 ? MULTIPLICATIVE_AFFIXES : ADDITIVE_AFFIXES.concat(SURVIVAL_AFFIXES, MULTIPLICATIVE_AFFIXES);
      lucky = rollFrom(fifthPool, used, stats, resists, tags, level, mul) || lucky;
    }
    if (slot !== 'weapon' && Math.random() < .45) rollFrom(RESIST_AFFIXES, used, stats, resists, tags, level, mul);
    return { stats, resists, tags, isLucky:lucky, hasExtra };
  }

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

  function tagLabel(tag) {
    if (tag === 'ADDITIVE_POOL') return '[+]';
    if (tag && tag.startsWith('SUB_BUCKET')) return '[x]';
    if (tag && tag.startsWith('UNIQUE_ASPECT')) return '[x]';
    return '';
  }
  function uniqueAspectDesc(baseId) { return UNIQUE_ASPECTS[baseId] || null; }

  return {
    SURVIVAL_AFFIXES, ADDITIVE_AFFIXES, MULTIPLICATIVE_AFFIXES, RESIST_AFFIXES,
    UNIQUE_ASPECTS, RES, RES_CN,
    rollGoldAffixes, tagLabel, uniqueAspectDesc, scaleValue, powerScale, powerTier, pickRandom
  };
})();
