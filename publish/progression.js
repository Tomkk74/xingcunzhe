window.GameModules = window.GameModules || {};
window.GameModules.progression = (() => {
  const KEY = 'arcane-meta-v2';
  const CLASSES = { paladin: '圣骑士', mage: '大魔法师', ranger: '游侠', lewdSaintess: '淫靡圣女', scytheMaiden: '琦琦' };
  const BASE = [
    ['hp', '生命根基', '最大生命 +5%', 10, 30, 50, 16],
    ['damage', '战斗本能', '全技能伤害 +4%', 10, 50, 28, 38],
    ['speed', '疾行训练', '移动速度 +3%', 8, 45, 72, 38],
    ['magnet', '灵魂牵引', '拾取范围 +6%', 8, 40, 18, 60],
    ['startXp', '启程经验', '开局经验 +4', 5, 55, 50, 60],
    ['gold', '掠金术', '金币收益 +5%', 10, 45, 82, 60],
  ];
  const SPEC = {
    paladin: [
      ['aura', '蒜阵圣化', '大蒜光环每级范围 +5、伤害 +4%，Lv.4 后额外 +1 技能等级', 5, 80, 22, 82, 'damage', ['garlic'], 24],
      ['lance', '圣枪裁决', '圣光长枪每级冷却 -5%、枪阵宽度 +3，Lv.2/Lv.4 各 +1 发', 5, 90, 50, 86, 'damage', ['holyLance'], 24],
      ['nova', '血誓新星', '血色新星每级范围 +7、冷却 -6%、伤害 +4%，Lv.4 后额外 +1 技能等级', 5, 90, 78, 82, 'damage', ['bloodNova'], 24],
      ['guard', '神圣壁垒', '每级生命 +3%、开局护盾 +4% 基础生命、每秒回复 +0.25', 4, 110, 50, 108, 'utility', [], 24, 'lance'],
      ['seal', '圣印破盾', '近战圣光对 Boss 与护盾敌人更强，血色新星命中 Boss 回复生命', 4, 135, 50, 126, 'damage', ['garlic', 'bloodNova', 'flameWheel'], 28, 'aura'],
    ],
    mage: [
      ['missile', '飞弹增幅', '魔法飞弹每级冷却 -4.5%、爆炸范围 +4，Lv.2/Lv.4 各 +1 发', 5, 80, 22, 82, 'damage', ['missile'], 24],
      ['fire', '赤焰学派', '火球与陨星每级爆炸范围 +6、冷却 -4.5%，Lv.4 后额外 +1 发', 5, 90, 50, 86, 'damage', ['fireball', 'meteorShard'], 24],
      ['thunder', '雷弧回路', '闪电每级额外落雷，连锁雷弧每级 +1 跳，冷却 -4.5%', 5, 90, 78, 82, 'damage', ['lightning', 'thunderChain'], 24],
      ['beam', '棱镜奥术', '奥术射线每级宽度 +3、射程 +45、冷却 -6%，Lv.4 后 +1 道射线', 4, 110, 50, 108, 'damage', ['arcaneBeam'], 24, 'fire'],
      ['overload', '奥能超载', '火焰、雷电、奥术技能对 Boss 与护盾敌人更强，并略微缩短冷却', 4, 135, 50, 126, 'damage', ['fireball', 'lightning', 'arcaneBeam'], 28, 'thunder'],
    ],
    ranger: [
      ['axe', '回旋飞斧', '飞斧每级持续 +0.18 秒、冷却 -4.5%，Lv.2/Lv.4 各 +1 把', 5, 80, 22, 82, 'damage', ['axe'], 24],
      ['wind', '风裂专精', '风裂刃每级飞行速度 +20、冷却 -4.5%，Lv.2/Lv.4 各 +1 道', 5, 90, 50, 86, 'damage', ['windCutter'], 24],
      ['dagger', '匕首阵列', '匕首雨每级目标 +1、落点范围 +4、冷却 -5%', 5, 90, 78, 82, 'damage', ['daggerRain'], 24],
      ['moon', '月牙猎影', '月牙斩每级减速 +0.18、弧刃范围 +4、冷却 -5%，Lv.4 后 +1 道', 4, 110, 50, 108, 'damage', ['moonSlash'], 24, 'wind'],
      ['mark', '猎王标记', '物理猎杀技能对 Boss 与护盾敌人更强，匕首雨目标数提升', 4, 135, 50, 126, 'damage', ['axe', 'windCutter', 'daggerRain'], 28, 'wind'],
    ],
    lewdSaintess: [
      ['splash', '欲液反涌', '受击反击范围 +6、伤害 +5%，Lv.4 后额外 +1 技能等级', 5, 90, 22, 82, 'damage', ['lustSplash'], 24],
      ['kiss', '媚心飞吻', '飞吻每级冷却 -4%、爆炸范围 +4，Lv.2/Lv.4 各 +1 发', 5, 90, 50, 86, 'damage', ['lustKiss'], 24],
      ['prayer', '献媚祈祷', '祈祷场每级范围 +5、冷却 -5%、淫荡值回复提升', 5, 95, 78, 82, 'utility', ['lustPrayer'], 24],
      ['desire', '淫荡值容器', '每级生命 +4%、淫荡值上限 +12、受击转化更稳定', 4, 120, 50, 108, 'utility', [], 26, 'prayer'],
      ['overflow', '欲潮溢流', '反伤、飞吻、祈祷场对 Boss 更强，淫荡值高时爆发更频繁', 4, 145, 50, 126, 'damage', ['lustSplash', 'lustKiss', 'lustOverflow'], 30, 'splash'],
    ],
    scytheMaiden: [
      ['arc', '镰舞精通', '残月镰舞每级范围 +5、伤害 +5%，Lv.4 后额外 +1 技能等级', 5, 90, 22, 82, 'damage', ['scytheArc'], 24],
      ['reaper', '收割本能', '幽魂刃舞、追魂镰链每级冷却 -4.5%，对残血敌人伤害提升', 5, 90, 50, 86, 'damage', ['wraithBlade', 'reaperChain'], 24],
      ['soul', '吸魂回路', '血镰回旋与墓月裂隙每级范围 +4，血镰命中会强化下一次追魂镰链', 5, 95, 78, 82, 'utility', ['bloodReap', 'graveRift'], 24],
      ['dance', '死舞步伐', '每级移动速度 +3%，移动时积累冥契更快', 4, 120, 50, 108, 'utility', [], 26, 'reaper'],
      ['execute', '终末处决', '镰刀系技能对 Boss 与护盾敌人更强，残血敌人受到额外处决伤害', 4, 145, 50, 126, 'damage', ['scytheArc', 'bloodReap', 'wraithBlade', 'reaperChain'], 30, 'arc'],
    ],
  };
  const COST_GROWTH = 1.72;
  const DEFAULT = { soulGold: 0, soulCore: 0, grants: {}, classes: Object.fromEntries(Object.keys(CLASSES).map(k => [k, { upgrades: {}, unlocks: {} }])) };
  const ADMIN_GRANTS = { '03b30ae3-a2da-440b-9333-58dd490507ea': { id: 'admin-core-20260615', soulCore: 200 } };
  let meta = clone(DEFAULT), ready = false;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function clsData(c) { return meta.classes[c] || (meta.classes[c] = { upgrades: {}, unlocks: {} }); }
  function nodes(c) {
    const base = BASE.map(v => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], pre: null, core: 0 }));
    const spec = SPEC[c].map((v, i) => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], kind: v[7], skills: v[8], core: v[9] || 0, pre: v[10] || (i === 3 ? SPEC[c][1][0] : 'damage') }));
    return base.concat(spec);
  }
  async function kvGet(key) {
    try { return (await window.dzmm.kv.get(key))?.value ?? null; }
    catch (_) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  }
  async function kvPut(key, value) {
    try { await window.dzmm.kv.put(key, value); }
    catch (_) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  }
  function normalize(data) {
    const base = clone(DEFAULT); if (!data || typeof data !== 'object') return base;
    base.soulGold = Math.max(0, Math.floor(Number(data.soulGold) || 0));
    base.soulCore = Math.max(0, Math.floor(Number(data.soulCore) || 0));
    base.grants = data.grants && typeof data.grants === 'object' ? data.grants : {};
    if (data.classes) for (const c of Object.keys(CLASSES)) for (const n of nodes(c)) {
      const lv = Math.max(0, Math.floor(Number(data.classes?.[c]?.upgrades?.[n.id]) || 0));
      base.classes[c].upgrades[n.id] = lv;
      base.classes[c].unlocks[n.id] = !!data.classes?.[c]?.unlocks?.[n.id] || lv > 0 || !n.core;
    }
    for (const c of Object.keys(CLASSES)) base.classes[c].unlocks.dlc = !!data.classes?.[c]?.unlocks?.dlc;
    if (data.upgrades) for (const c of Object.keys(CLASSES)) for (const n of BASE) base.classes[c].upgrades[n[0]] = Math.max(0, Math.floor(Number(data.upgrades[n[0]]) || 0));
    return base;
  }
  async function applyAdminGrant() {
    try {
      const uid = (await window.dzmm.user.info())?.id;
      const grant = ADMIN_GRANTS[uid];
      if (!grant || meta.grants?.[grant.id]) return;
      meta.soulCore += grant.soulCore || 0;
      meta.grants = meta.grants || {};
      meta.grants[grant.id] = true;
      await save();
    } catch (_) {}
  }
  async function init() { if (ready) return meta; meta = normalize(await kvGet(KEY) || await kvGet('arcane-meta-v1')); ready = true; await applyAdminGrant(); return meta; }
  async function save() { await kvPut(KEY, meta); }
  function dlcOwned(c) { return c !== 'lewdSaintess' || !!clsData(c).unlocks.dlc; }
  async function buyDlc(c) { if (c !== 'lewdSaintess' || dlcOwned(c)) return dlcOwned(c); if (meta.soulCore < 200) return false; meta.soulCore -= 200; clsData(c).unlocks.dlc = true; await save(); return true; }
  function level(c, id) { return clsData(c).upgrades[id] || 0; }
  function node(c, id) { return nodes(c).find(n => n.id === id); }
  function preOk(c, n) { return !n.pre || level(c, n.pre) > 0; }
  function coreUnlocked(c, n) { return !n.core || clsData(c).unlocks[n.id] || level(c, n.id) > 0; }
  function cost(c, id) { const n = node(c, id), lv = level(c, id); return !n || lv >= n.max ? 0 : Math.round(n.base * Math.pow(COST_GROWTH, lv)); }
  function esc(v) { return String(v).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  async function buy(c, id) {
    const n = node(c, id), data = clsData(c); if (!n || !preOk(c, n)) return false;
    if (!coreUnlocked(c, n)) { if (meta.soulCore < n.core) return false; meta.soulCore -= n.core; data.unlocks[n.id] = true; await save(); return true; }
    const lv = level(c, id), price = cost(c, id); if (lv >= n.max || meta.soulGold < price) return false;
    meta.soulGold -= price; data.upgrades[id] = lv + 1; data.unlocks[id] = true; await save(); return true;
  }
  function render(container) {
    if (!container) return;
    container.innerHTML = `<div class="progressEntry"><span>灵魂金币：<b>${meta.soulGold}</b>　魔核：<b>${meta.soulCore}</b></span><button class="progressBtn" data-open-progress>永久强化</button></div>`;
  }
  function renderTree(container, onChange, active = 'paladin') {
    if (!container) return; const list = nodes(active), up = clsData(active).upgrades;
    const posY = y => `${Math.round(y / 1.42 * 100) / 100}%`;
    const lines = list.filter(n => n.pre).map(n => { const p = node(active, n.pre); return `<line x1="${p.x}%" y1="${posY(p.y)}" x2="${n.x}%" y2="${posY(n.y)}"/>`; }).join('');
    const cards = list.map(n => {
      const lv = up[n.id] || 0, price = cost(active, n.id), pre = preOk(active, n), core = coreUnlocked(active, n), full = lv >= n.max;
      const can = pre && !full && (core ? meta.soulGold >= price : meta.soulCore >= n.core);
      const state = !pre ? '需前置节点' : !core ? `解锁 ${n.core} 魔核` : full ? '已满级' : `消耗 ${price}`;
      const tip = `${n.name} Lv.${lv}/${n.max}\n${n.desc}\n${!pre ? '需要先升级前置节点' : !core ? `需要 ${n.core} 魔核解锁，之后用金币升级` : full ? '已满级' : `下一次升级消耗 ${price} 灵魂金币`}`;
      return `<button class="treeNode ${!pre || !core ? 'locked' : ''} ${full ? 'full' : ''}" style="left:${n.x}%;top:${posY(n.y)}" data-prog-node="${n.id}" data-tip="${esc(tip)}" ${can ? '' : 'disabled'}><b>${n.name}</b><small>Lv.${lv}/${n.max}</small><span>${state}</span><em>${n.desc}</em></button>`;
    }).join('');
    container.innerHTML = `<div class="progressHead"><b>灵魂金币：${meta.soulGold}　魔核：${meta.soulCore}</b><small>当前职业：${CLASSES[active]} / Boss 固定掉落魔核，通关额外 +2</small></div><div class="classTabs">${Object.entries(CLASSES).map(([id, name]) => `<button class="${id === active ? 'selected' : ''}" data-prog-class="${id}">${name}</button>`).join('')}</div><div class="treeCanvas"><svg viewBox="0 0 100 132" preserveAspectRatio="none">${lines}</svg>${cards}<div class="treeTip" id="treeTip"></div></div>`;
    container.querySelectorAll('[data-prog-class]').forEach(b => b.onclick = () => renderTree(container, onChange, b.dataset.progClass));
    const tip = container.querySelector('#treeTip');
    function showTip(btn) { if (!tip) return; tip.textContent = btn.dataset.tip || ''; tip.style.left = btn.style.left; tip.style.top = `calc(${btn.style.top} - 54px)`; tip.classList.add('show'); }
    function hideTip() { tip?.classList.remove('show'); }
    container.querySelectorAll('[data-prog-node]').forEach(b => { b.onpointerenter = () => showTip(b); b.onpointerleave = hideTip; b.onpointerdown = () => showTip(b); b.onpointerup = () => setTimeout(hideTip, 900); b.onclick = async () => { await buy(active, b.dataset.progNode); renderTree(container, onChange, active); onChange?.(); }; });
  }
  function applyClass(classId, baseClass) {
    const u = clsData(classId).upgrades, skillDmg = {}, skillLv = {}, skillMods = {};
    let hpMul = 1 + (u.hp || 0) * 0.05, dmgMul = 1 + (u.damage || 0) * 0.04, spdMul = 1 + (u.speed || 0) * 0.03;
    function add(skill, mod) { skillMods[skill] = skillMods[skill] || {}; for (const [k, v] of Object.entries(mod)) skillMods[skill][k] = (skillMods[skill][k] || 0) + v; }
    function dmg(skill, v) { skillDmg[skill] = (skillDmg[skill] || 0) + v; }
    const aura = u.aura || 0, lance = u.lance || 0, nova = u.nova || 0, guard = u.guard || 0, seal = u.seal || 0;
    const missile = u.missile || 0, fire = u.fire || 0, thunder = u.thunder || 0, beam = u.beam || 0, overload = u.overload || 0;
    const axe = u.axe || 0, wind = u.wind || 0, dagger = u.dagger || 0, moon = u.moon || 0, mark = u.mark || 0;
    const splash = u.splash || 0, kiss = u.kiss || 0, prayer = u.prayer || 0, desire = u.desire || 0, overflow = u.overflow || 0;
    const arc = u.arc || 0, reaper = u.reaper || 0, soul = u.soul || 0, dance = u.dance || 0, execute = u.execute || 0;
    if (aura) { dmg('garlic', aura * 0.04); add('garlic', { radius: aura * 5 }); if (aura >= 4) skillLv.garlic = 1; }
    if (lance) add('holyLance', { cd: lance * 0.05, width: lance * 3, count: Math.floor(lance / 2) });
    if (nova) { dmg('bloodNova', nova * 0.04); add('bloodNova', { radius: nova * 7, cd: nova * 0.06 }); if (nova >= 4) skillLv.bloodNova = 1; }
    if (seal) { for (const s of ['garlic', 'bloodNova', 'flameWheel', 'orbit']) add(s, { bossDmg: seal * 0.06, shieldBreak: seal * 0.12 }); add('bloodNova', { bossHeal: seal * 0.012, cd: seal * 0.03 }); }
    if (missile) add('missile', { cd: missile * 0.045, aoe: missile * 4, count: Math.floor(missile / 2) });
    if (fire) for (const s of ['fireball', 'meteorShard']) add(s, { radius: fire * 6, cd: fire * 0.045, count: fire >= 4 ? 1 : 0 });
    if (thunder) { add('lightning', { count: thunder, radius: thunder * 3, cd: thunder * 0.045 }); add('thunderChain', { jumps: thunder, cd: thunder * 0.045 }); }
    if (beam) add('arcaneBeam', { width: beam * 3, range: beam * 45, cd: beam * 0.06, count: beam >= 4 ? 1 : 0 });
    if (overload) for (const s of ['fireball', 'meteorShard', 'lightning', 'thunderChain', 'arcaneBeam']) add(s, { bossDmg: overload * 0.05, shieldBreak: overload * 0.05, cd: overload * 0.025 });
    if (axe) add('axe', { life: axe * 0.18, cd: axe * 0.045, count: Math.floor(axe / 2) });
    if (wind) add('windCutter', { speed: wind * 20, cd: wind * 0.045, count: Math.floor(wind / 2) });
    if (dagger) add('daggerRain', { targets: dagger, radius: dagger * 4, cd: dagger * 0.05 });
    if (moon) add('moonSlash', { slow: moon * 0.18, radius: moon * 4, cd: moon * 0.05, count: moon >= 4 ? 1 : 0 });
    if (mark) { for (const s of ['axe', 'windCutter', 'daggerRain', 'moonSlash', 'shadowBlade']) add(s, { bossDmg: mark * 0.06, shieldBreak: mark * 0.08 }); add('daggerRain', { targets: mark }); }
    if (splash) { dmg('lustSplash', splash * 0.05); add('lustSplash', { radius: splash * 6 }); if (splash >= 4) skillLv.lustSplash = 1; }
    if (kiss) add('lustKiss', { cd: kiss * 0.04, aoe: kiss * 4, count: Math.floor(kiss / 2) });
    if (prayer) add('lustPrayer', { radius: prayer * 5, cd: prayer * 0.05, lustRegen: prayer * 0.35 });
    if (overflow) for (const s of ['lustSplash', 'lustKiss', 'lustPrayer', 'lustOverflow']) add(s, { bossDmg: overflow * 0.06, cd: overflow * 0.025 });
    if (arc) { dmg('scytheArc', arc * 0.05); add('scytheArc', { radius: arc * 5, arc: arc * 0.04 }); if (arc >= 4) skillLv.scytheArc = 1; }
    if (reaper) for (const s of ['wraithBlade', 'reaperChain']) add(s, { cd: reaper * 0.045, execute: reaper * 0.04 });
    if (soul) { add('bloodReap', { radius: soul * 4 }); add('graveRift', { radius: soul * 4 }); }
    if (execute) for (const s of ['scytheArc', 'bloodReap', 'wraithBlade', 'reaperChain']) add(s, { bossDmg: execute * 0.05, shieldBreak: execute * 0.08, execute: execute * 0.05 });
    hpMul *= 1 + guard * 0.03 + desire * 0.04;
    spdMul *= 1 + dance * 0.03;
    return { hp: Math.round(baseClass.hp * hpMul), spd: baseClass.spd * spdMul, dmg: baseClass.dmg * dmgMul, startXp: (u.startXp || 0) * 4, magnetBonus: (u.magnet || 0) * 0.06, goldBonus: (u.gold || 0) * 0.05, shieldStart: Math.round(baseClass.hp * guard * 0.04), regenBonus: guard * 0.25, lustMaxBonus: desire * 12, lustGainBonus: desire * 0.08 + prayer * 0.04, skillDmg, skillLv, skillMods };
  }
  function estimateRunReward(run) {
    const c = run.classId || run.cls || 'paladin', goals = Math.max(0, Number(run.goals) || 0), base = Math.floor(Number(run.gold) || 0), time = Math.floor((Number(run.time) || 0) / 30) * 10, boss = Math.max(0, Number(run.bossKills) || 0) * 80, level = run.level >= 30 ? 100 : run.level >= 20 ? 60 : run.level >= 10 ? 30 : 0;
    return base + time + boss + goals * 40 + level + Math.round((base + time + boss + goals * 40 + level) * ((clsData(c).upgrades.gold || 0) * 0.05));
  }
  function estimateCoreReward(run) { return Math.max(0, Math.floor(Number(run.bossKills) || 0)) + (run.win ? 2 : 0); }
  async function addRunReward(run) { await init(); const gold = estimateRunReward(run), core = estimateCoreReward(run); meta.soulGold += gold; meta.soulCore += core; await save(); return { gold, core }; }
  async function addCurrency(gold, core) { await init(); meta.soulGold += Math.max(0, Math.floor(Number(gold) || 0)); meta.soulCore += Math.max(0, Math.floor(Number(core) || 0)); await save(); return { gold: meta.soulGold, core: meta.soulCore }; }
  async function addGrantCurrency(id, gold, core) {
    await init();
    meta.grants = meta.grants || {};
    if (meta.grants[id]) return { gold: meta.soulGold, core: meta.soulCore, applied: false };
    meta.grants[id] = true;
    meta.soulGold += Math.max(0, Math.floor(Number(gold) || 0));
    meta.soulCore += Math.max(0, Math.floor(Number(core) || 0));
    await save();
    return { gold: meta.soulGold, core: meta.soulCore, applied: true };
  }
  function data() { return meta; }
  return { init, render, renderTree, applyClass, estimateRunReward, estimateCoreReward, addRunReward, addCurrency, addGrantCurrency, data, dlcOwned, buyDlc };
})();
window.Progression = window.GameModules.progression;
