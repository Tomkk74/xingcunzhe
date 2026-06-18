window.GameModules = window.GameModules || {};
window.GameModules.progression = (() => {
  const KEY = 'arcane-meta-v3';
  const CLASSES = { paladin: '圣骑士', mage: '大魔法师', ranger: '游侠', lewdSaintess: '淫靡圣女', scytheMaiden: '琦琦' };
  const BASE = [
    ['hp', '秘境体魄', '最大生命 +5%，提高高层秘境容错', 10, 30, 50, 16],
    ['damage', '深渊战意', '全技能伤害 +4%，与套装核心技能增伤叠加', 10, 50, 28, 38],
    ['speed', '裂隙步伐', '移动速度 +3%，更适合秘境拉怪与躲弹幕', 8, 45, 72, 38],
    ['magnet', '魂晶牵引', '拾取范围 +6%，加快秘境升级和流派成型', 8, 40, 18, 60],
    ['startXp', '秘境筹备', '普通局开局经验 +4；每 2 级额外 +1 重选，每 3 级额外 +1 排除', 5, 55, 50, 60],
    ['gold', '净化掠金', '金币收益 +5%，结算灵魂金币同步提升', 10, 45, 82, 60],
  ];
  const SPEC = {
    paladin: [
      ['aura', '辉金圣域', '大蒜光环每级范围 +5、伤害 +5%，Lv.4 后 +1 技能等级，契合辉金守护套', 5, 80, 22, 82, 'damage', ['garlic'], 24],
      ['lance', '黎明枪阵', '圣光长枪每级冷却 -5%、命中溅射范围 +3，Lv.2/Lv.4 各 +1 发，强化黎明审判套', 5, 90, 50, 86, 'damage', ['holyLance'], 24],
      ['nova', '荆棘血誓', '血色新星每级范围 +7、冷却 -6%、伤害 +5%，Lv.4 后 +1 技能等级，契合荆棘壁垒套', 5, 90, 78, 82, 'damage', ['bloodNova'], 24],
      ['guard', '秘境壁垒', '每级生命 +3%、开局护盾 +5% 基础生命、每秒回复 +0.3，高层秘境更稳', 4, 110, 50, 108, 'utility', [], 24, 'lance'],
      ['seal', '守卫破誓', '大蒜、血环、圣枪对 Boss、精英与护盾敌人更强，血色新星命中 Boss 回复生命', 4, 135, 50, 126, 'damage', ['garlic', 'bloodNova', 'holyLance'], 28, 'aura'],
    ],
    mage: [
      ['missile', '星界飞弹', '魔法飞弹每级冷却 -4.5%、爆炸范围 +4，Lv.2/Lv.4 各 +1 发，契合星界飞弹套', 5, 80, 22, 82, 'damage', ['missile'], 24],
      ['fire', '余烬陨星', '陨星碎片每级爆炸范围 +6、冷却 -5%、伤害 +5%，Lv.4 后 +1 颗陨星，强化余烬陨星套', 5, 90, 50, 86, 'damage', ['meteorShard'], 24],
      ['thunder', '风暴符印', '连锁雷弧每级 +1 跳、范围 +3、冷却 -5%，强化风暴符印套', 5, 90, 78, 82, 'damage', ['thunderChain'], 24],
      ['beam', '奥术回响', '魔法飞弹与奥术射线每级射程/范围提升并缩短冷却，补强雷弧奥术流', 4, 110, 50, 108, 'damage', ['missile', 'arcaneBeam'], 24, 'fire'],
      ['overload', '秘境超载', '飞弹、陨星、雷链对 Boss、精英与护盾敌人更强，并略微缩短冷却', 4, 135, 50, 126, 'damage', ['missile', 'meteorShard', 'thunderChain'], 28, 'thunder'],
    ],
    ranger: [
      ['axe', '旋风飞斧', '飞斧每级持续 +0.18 秒、冷却 -4.5%，Lv.2/Lv.4 各 +1 把，契合旋风飞斧套', 5, 80, 22, 82, 'damage', ['axe'], 24],
      ['wind', '毒影伏击', '毒雾爆裂每级范围 +5、冷却 -5%、暗影伏击伤害提升，强化毒影伏击套', 5, 90, 50, 86, 'damage', ['poisonCloud'], 24],
      ['dagger', '月影猎手', '月牙斩每级减速 +0.16、弧刃范围 +4、冷却 -5%，Lv.4 后 +1 道，契合月影猎手套', 5, 90, 78, 82, 'damage', ['moonSlash'], 24],
      ['moon', '鹰眼机动', '每级移动速度 +2%、飞斧持续与月牙范围提升，秘境走位更稳', 4, 110, 50, 108, 'utility', ['axe', 'moonSlash'], 24, 'wind'],
      ['mark', '猎王标记', '飞斧、月牙、毒雾对 Boss、精英与护盾敌人更强，毒雾标记伏击更凶', 4, 135, 50, 126, 'damage', ['axe', 'moonSlash', 'poisonCloud'], 28, 'wind'],
    ],
    lewdSaintess: [
      ['splash', '绯红圣器', '欲液反涌每级范围 +6、伤害 +5%，Lv.4 后 +1 技能等级，契合绯红圣器套', 5, 90, 22, 82, 'damage', ['lustSplash'], 24],
      ['kiss', '蔷薇镜像', '飞吻每级冷却 -4.5%、爆炸范围 +4，Lv.2/Lv.4 各 +1 发，契合蔷薇镜像套', 5, 90, 50, 86, 'damage', ['lustKiss'], 24],
      ['prayer', '紫罗兰圣歌', '献媚祈祷每级范围 +5、冷却 -5%、淫荡值回复提升，契合紫罗兰圣歌套', 5, 95, 78, 82, 'utility', ['lustPrayer'], 24],
      ['desire', '欲望容器', '每级生命 +4%、淫荡值上限 +14、受击转化更稳定，高层秘境更能抗', 4, 120, 50, 108, 'utility', [], 26, 'prayer'],
      ['overflow', '欲潮审判', '反涌、飞吻、祈祷、溢流对 Boss 与精英更强，淫荡值高时爆发更频繁', 4, 145, 50, 126, 'damage', ['lustSplash', 'lustKiss', 'lustPrayer', 'lustOverflow'], 30, 'splash'],
    ],
    scytheMaiden: [
      ['arc', '冥月圆舞', '残月镰舞每级范围 +5、伤害 +5%，Lv.4 后 +1 技能等级，契合冥月圆舞套', 5, 90, 22, 82, 'damage', ['scytheArc'], 24],
      ['reaper', '断魂影镰', '幽魂刃舞每级冷却 -4.5%、落地区域 +4，对残血敌人处决更强，契合断魂影镰套', 5, 90, 50, 86, 'damage', ['wraithBlade'], 24],
      ['soul', '血镰誓约', '血镰回旋每级范围 +5、回复提升，命中会强化下一次追魂镰链，契合血镰誓约套', 5, 95, 78, 82, 'utility', ['bloodReap', 'reaperChain'], 24],
      ['dance', '幽魂步伐', '每级移动速度 +3%，移动时积累冥契更快，并强化冥月圆舞机动收益', 4, 120, 50, 108, 'utility', [], 26, 'reaper'],
      ['execute', '终末收割', '镰刀系技能对 Boss、精英与护盾敌人更强，残血敌人受到额外处决伤害', 4, 145, 50, 126, 'damage', ['scytheArc', 'bloodReap', 'wraithBlade', 'reaperChain'], 30, 'arc'],
    ],
  };
  const COST_GROWTH = 1.72;
  const DEFAULT = { soulGold: 0, soulCore: 0, grants: {}, classes: Object.fromEntries(Object.keys(CLASSES).map(k => [k, { upgrades: {}, unlocks: {} }])) };
  const ADMIN_GRANTS = { '03b30ae3-a2da-440b-9333-58dd490507ea': { id: 'admin-core-20260615', soulCore: 200 } };
  let meta = clone(DEFAULT), ready = false, cloudWarned = false;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function clsData(c) { return meta.classes[c] || (meta.classes[c] = { upgrades: {}, unlocks: {} }); }
  function nodes(c) {
    const base = BASE.map(v => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], pre: null, core: 0 }));
    const spec = SPEC[c].map((v, i) => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], kind: v[7], skills: v[8], core: v[9] || 0, pre: v[10] || (i === 3 ? SPEC[c][1][0] : 'damage') }));
    return base.concat(spec);
  }
  const timeout = (p, ms = 1200) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
  function localGet(key) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  function localPut(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  async function kvGet(key) {
    const local = localGet(key);
    if (local) return local;
    try { return (await timeout(window.dzmm.kv.get(key)))?.value ?? null; }
    catch (_) { return null; }
  }
  async function kvPut(key, value) {
    localPut(key, value);
    try { await timeout(window.dzmm.kv.put(key, value)); }
    catch (e) { if (!cloudWarned) { cloudWarned = true; window.dzmm?.toast?.warning?.('永久强化云端保存失败，已暂存本机'); console.warn('永久强化云端保存失败:', e.code, e.message); } }
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
  function tone(n) { const d = n.desc || ''; if (/生命|护盾|回复|淫荡值/.test(d)) return 'life'; if (/金币|拾取|经验/.test(d)) return 'wealth'; if (/冷却|移动速度|飞行速度|速度/.test(d)) return 'speed'; if (/Boss|护盾敌人|破盾|处决/.test(d)) return 'boss'; return n.kind === 'utility' ? 'utility' : 'damage'; }
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
      return `<button class="treeNode ${tone(n)} ${!pre || !core ? 'locked' : ''} ${full ? 'full' : ''}" style="left:${n.x}%;top:${posY(n.y)}" data-prog-node="${n.id}" data-tip="${esc(tip)}" ${can ? '' : 'disabled'}><b>${n.name}</b><small>Lv.${lv}/${n.max}</small><span>${state}</span><em>${n.desc}</em></button>`;
    }).join('');
    container.innerHTML = `<div class="progressHead"><b>灵魂金币：${meta.soulGold}　魔核：${meta.soulCore}</b><small>当前职业：${CLASSES[active]} / Boss 固定掉落魔核，通关额外 +2</small></div><div class="classTabs">${Object.entries(CLASSES).map(([id, name]) => `<button class="${id === active ? 'selected' : ''}" data-prog-class="${id}">${name}</button>`).join('')}</div><div class="treeLegend"><span class="life">生存</span><span class="damage">伤害</span><span class="speed">速度/冷却</span><span class="boss">首领</span><span class="wealth">收益</span><span class="utility">机制</span></div><div class="treeCanvas"><svg viewBox="0 0 100 132" preserveAspectRatio="none">${lines}</svg>${cards}<div class="treeTip" id="treeTip"></div></div>`;
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
    if (aura) { dmg('garlic', aura * 0.05); add('garlic', { radius: aura * 5 }); if (aura >= 4) skillLv.garlic = 1; }
    if (lance) add('holyLance', { cd: lance * 0.05, width: lance * 3, count: Math.floor(lance / 2) });
    if (nova) { dmg('bloodNova', nova * 0.05); add('bloodNova', { radius: nova * 7, cd: nova * 0.06 }); if (nova >= 4) skillLv.bloodNova = 1; }
    if (seal) { for (const s of ['garlic', 'bloodNova', 'holyLance']) add(s, { bossDmg: seal * 0.06, shieldBreak: seal * 0.12 }); add('bloodNova', { bossHeal: seal * 0.012, cd: seal * 0.03 }); }
    if (missile) add('missile', { cd: missile * 0.045, aoe: missile * 4, count: Math.floor(missile / 2) });
    if (fire) { dmg('meteorShard', fire * 0.05); add('meteorShard', { radius: fire * 6, cd: fire * 0.05, count: fire >= 4 ? 1 : 0 }); add('fireball', { radius: fire * 3, cd: fire * 0.025 }); }
    if (thunder) add('thunderChain', { jumps: thunder, radius: thunder * 3, cd: thunder * 0.05 });
    if (beam) { add('missile', { aoe: beam * 3, cd: beam * 0.025 }); add('arcaneBeam', { width: beam * 3, range: beam * 45, cd: beam * 0.06, count: beam >= 4 ? 1 : 0 }); }
    if (overload) for (const s of ['missile', 'meteorShard', 'thunderChain', 'arcaneBeam']) add(s, { bossDmg: overload * 0.055, shieldBreak: overload * 0.06, cd: overload * 0.025 });
    if (axe) add('axe', { life: axe * 0.18, cd: axe * 0.045, count: Math.floor(axe / 2) });
    if (wind) { dmg('poisonCloud', wind * 0.04); add('poisonCloud', { radius: wind * 5, cd: wind * 0.05 }); add('shadowBlade', { cd: wind * 0.025, execute: wind * 0.025 }); }
    if (dagger) add('moonSlash', { slow: dagger * 0.16, radius: dagger * 4, cd: dagger * 0.05, count: dagger >= 4 ? 1 : 0 });
    if (moon) { add('axe', { life: moon * 0.1 }); add('moonSlash', { radius: moon * 3 }); spdMul *= 1 + moon * 0.02; }
    if (mark) for (const s of ['axe', 'moonSlash', 'poisonCloud', 'shadowBlade']) add(s, { bossDmg: mark * 0.06, shieldBreak: mark * 0.08, execute: mark * 0.03 });
    if (splash) { dmg('lustSplash', splash * 0.05); add('lustSplash', { radius: splash * 6 }); if (splash >= 4) skillLv.lustSplash = 1; }
    if (kiss) add('lustKiss', { cd: kiss * 0.045, aoe: kiss * 4, count: Math.floor(kiss / 2) });
    if (prayer) add('lustPrayer', { radius: prayer * 5, cd: prayer * 0.05, lustRegen: prayer * 0.35 });
    if (overflow) for (const s of ['lustSplash', 'lustKiss', 'lustPrayer', 'lustOverflow']) add(s, { bossDmg: overflow * 0.06, cd: overflow * 0.025 });
    if (arc) { dmg('scytheArc', arc * 0.05); add('scytheArc', { radius: arc * 5, arc: arc * 0.04 }); if (arc >= 4) skillLv.scytheArc = 1; }
    if (reaper) add('wraithBlade', { cd: reaper * 0.045, radius: reaper * 4, execute: reaper * 0.045 });
    if (soul) { add('bloodReap', { radius: soul * 5 }); add('reaperChain', { radius: soul * 3, cd: soul * 0.025 }); }
    if (execute) for (const s of ['scytheArc', 'bloodReap', 'wraithBlade', 'reaperChain', 'graveRift']) add(s, { bossDmg: execute * 0.05, shieldBreak: execute * 0.08, execute: execute * 0.05 });
    hpMul *= 1 + guard * 0.03 + desire * 0.04;
    spdMul *= 1 + dance * 0.03;
    return { hp: Math.round(baseClass.hp * hpMul), spd: baseClass.spd * spdMul, dmg: baseClass.dmg * dmgMul, startXp: (u.startXp || 0) * 4, magnetBonus: (u.magnet || 0) * 0.06, goldBonus: (u.gold || 0) * 0.05, shieldStart: Math.round(baseClass.hp * guard * 0.05), regenBonus: guard * 0.3, lustMaxBonus: desire * 14, lustGainBonus: desire * 0.08 + prayer * 0.04, rerollBonus: Math.floor((u.startXp || 0) / 2), banishBonus: Math.floor((u.startXp || 0) / 3), skillDmg, skillLv, skillMods };
  }
  function estimateRunReward(run) {
    const c = run.classId || run.cls || 'paladin', goals = Math.max(0, Number(run.goals) || 0), base = Math.floor(Number(run.gold) || 0), time = Math.floor((Number(run.time) || 0) / 30) * 10, boss = Math.max(0, Number(run.bossKills) || 0) * 80, level = run.level >= 30 ? 100 : run.level >= 20 ? 60 : run.level >= 10 ? 30 : 0;
    return base + time + boss + goals * 40 + level + Math.round((base + time + boss + goals * 40 + level) * ((clsData(c).upgrades.gold || 0) * 0.05));
  }
  function estimateCoreReward(run) { return Math.max(0, Math.floor(Number(run.bossKills) || 0)) + (run.win ? 2 : 0); }
  async function addRunReward(run) { await init(); const gold = estimateRunReward(run), core = estimateCoreReward(run); meta.soulGold += gold; meta.soulCore += core; await save(); return { gold, core }; }
  async function addCurrency(gold, core) { await init(); meta.soulGold += Math.max(0, Math.floor(Number(gold) || 0)); meta.soulCore += Math.max(0, Math.floor(Number(core) || 0)); await save(); return { gold: meta.soulGold, core: meta.soulCore }; }
  async function spendGold(amount) { await init(); amount = Math.max(0, Math.floor(Number(amount) || 0)); if (meta.soulGold < amount) return false; meta.soulGold -= amount; await save(); return true; }
  async function spendCore(amount) { await init(); amount = Math.max(0, Math.floor(Number(amount) || 0)); if (meta.soulCore < amount) return false; meta.soulCore -= amount; await save(); return true; }
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
  return { init, render, renderTree, applyClass, estimateRunReward, estimateCoreReward, addRunReward, addCurrency, spendGold, spendCore, addGrantCurrency, data, dlcOwned, buyDlc };
})();
window.Progression = window.GameModules.progression;
