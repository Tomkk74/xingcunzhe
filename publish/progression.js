window.GameModules = window.GameModules || {};
window.GameModules.progression = (() => {
  const KEY = 'arcane-meta-v2';
  const CLASSES = { paladin: '圣骑士', mage: '大魔法师', ranger: '游侠' };
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
      ['aura', '蒜阵圣化', '大蒜光环强化', 5, 80, 26, 82, 'damage', ['garlic']],
      ['lance', '圣枪裁决', '圣光长枪强化', 5, 90, 50, 86, 'damage', ['holyLance']],
      ['nova', '血誓新星', '血色新星强化', 5, 90, 74, 82, 'damage', ['bloodNova']],
      ['guard', '神圣壁垒', '护盾与回复提升', 4, 110, 50, 108, 'utility', []],
    ],
    mage: [
      ['missile', '飞弹增幅', '魔法飞弹强化', 5, 80, 26, 82, 'damage', ['missile']],
      ['fire', '赤焰学派', '火球陨星强化', 5, 90, 50, 86, 'damage', ['fireball', 'meteorShard']],
      ['thunder', '雷弧回路', '雷系技能强化', 5, 90, 74, 82, 'damage', ['lightning', 'thunderChain']],
      ['beam', '棱镜奥术', '奥术射线强化', 4, 110, 50, 108, 'damage', ['arcaneBeam']],
    ],
    ranger: [
      ['axe', '回旋飞斧', '飞斧强化', 5, 80, 26, 82, 'damage', ['axe']],
      ['wind', '风裂专精', '风裂刃强化', 5, 90, 50, 86, 'damage', ['windCutter']],
      ['dagger', '匕首阵列', '匕首雨强化', 5, 90, 74, 82, 'damage', ['daggerRain']],
      ['moon', '月牙猎影', '月牙斩强化', 4, 110, 50, 108, 'damage', ['moonSlash']],
    ],
  };
  const DEFAULT = { soulGold: 0, classes: Object.fromEntries(Object.keys(CLASSES).map(k => [k, { upgrades: {} }])) };
  let meta = clone(DEFAULT), ready = false;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function clsData(c) { return meta.classes[c] || (meta.classes[c] = { upgrades: {} }); }
  function nodes(c) {
    const base = BASE.map(v => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], pre: null }));
    const spec = SPEC[c].map((v, i) => ({ id: v[0], name: v[1], desc: v[2], max: v[3], base: v[4], x: v[5], y: v[6], kind: v[7], skills: v[8], pre: i === 3 ? SPEC[c][1][0] : 'damage' }));
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
    if (data.classes) for (const c of Object.keys(CLASSES)) for (const n of nodes(c)) base.classes[c].upgrades[n.id] = Math.max(0, Math.floor(Number(data.classes?.[c]?.upgrades?.[n.id]) || 0));
    if (data.upgrades) for (const c of Object.keys(CLASSES)) for (const n of BASE) base.classes[c].upgrades[n[0]] = Math.max(0, Math.floor(Number(data.upgrades[n[0]]) || 0));
    return base;
  }
  async function init() { if (ready) return meta; meta = normalize(await kvGet(KEY) || await kvGet('arcane-meta-v1')); ready = true; return meta; }
  async function save() { await kvPut(KEY, meta); }
  function level(c, id) { return clsData(c).upgrades[id] || 0; }
  function node(c, id) { return nodes(c).find(n => n.id === id); }
  function unlocked(c, n) { return !n.pre || level(c, n.pre) > 0; }
  function cost(c, id) { const n = node(c, id), lv = level(c, id); return !n || lv >= n.max ? 0 : Math.round(n.base * Math.pow(1.55, lv)); }
  async function buy(c, id) {
    const n = node(c, id); if (!n || !unlocked(c, n)) return false;
    const lv = level(c, id), price = cost(c, id); if (lv >= n.max || meta.soulGold < price) return false;
    meta.soulGold -= price; clsData(c).upgrades[id] = lv + 1; await save(); return true;
  }
  function render(container) {
    if (!container) return;
    container.innerHTML = `<div class="progressEntry"><span>灵魂金币：<b>${meta.soulGold}</b></span><button class="progressBtn" data-open-progress>永久强化</button></div>`;
  }
  function renderTree(container, onChange, active = 'paladin') {
    if (!container) return; const list = nodes(active), up = clsData(active).upgrades;
    const lines = list.filter(n => n.pre).map(n => { const p = node(active, n.pre); return `<line x1="${p.x}%" y1="${p.y}%" x2="${n.x}%" y2="${n.y}%"/>`; }).join('');
    const cards = list.map(n => { const lv = up[n.id] || 0, price = cost(active, n.id), lock = !unlocked(active, n), full = lv >= n.max, can = !lock && !full && meta.soulGold >= price; return `<button class="treeNode ${lock ? 'locked' : ''} ${full ? 'full' : ''}" style="left:${n.x}%;top:${n.y}%" data-prog-node="${n.id}" ${can ? '' : 'disabled'}><b>${n.name}</b><small>Lv.${lv}/${n.max}</small><span>${lock ? '需前置节点' : full ? '已满级' : `消耗 ${price}`}</span><em title="${n.desc}">${n.desc}</em></button>`; }).join('');
    container.innerHTML = `<div class="progressHead"><b>灵魂金币：${meta.soulGold}</b><small>当前职业：${CLASSES[active]}</small></div><div class="classTabs">${Object.entries(CLASSES).map(([id, name]) => `<button class="${id === active ? 'selected' : ''}" data-prog-class="${id}">${name}</button>`).join('')}</div><div class="treeCanvas"><svg viewBox="0 0 100 130" preserveAspectRatio="none">${lines}</svg>${cards}</div>`;
    container.querySelectorAll('[data-prog-class]').forEach(b => b.onclick = () => renderTree(container, onChange, b.dataset.progClass));
    container.querySelectorAll('[data-prog-node]').forEach(b => b.onclick = async () => { await buy(active, b.dataset.progNode); renderTree(container, onChange, active); onChange?.(); });
  }
  function applyClass(classId, baseClass) {
    const u = clsData(classId).upgrades, skillDmg = {}, skillLv = {}; let hpMul = 1 + (u.hp || 0) * 0.05, dmgMul = 1 + (u.damage || 0) * 0.04, spdMul = 1 + (u.speed || 0) * 0.03;
    for (const n of SPEC[classId]) { const lv = u[n[0]] || 0; if (!lv) continue; for (const s of n[8]) { skillDmg[s] = (skillDmg[s] || 0) + lv * 0.07; if (lv >= 4) skillLv[s] = (skillLv[s] || 0) + 1; } }
    hpMul *= 1 + (u.guard || 0) * 0.03;
    return { hp: Math.round(baseClass.hp * hpMul), spd: baseClass.spd * spdMul, dmg: baseClass.dmg * dmgMul, startXp: (u.startXp || 0) * 4, magnetBonus: (u.magnet || 0) * 0.06, goldBonus: (u.gold || 0) * 0.05, shieldStart: Math.round(baseClass.hp * (u.guard || 0) * 0.04), regenBonus: (u.guard || 0) * 0.25, skillDmg, skillLv };
  }
  function estimateRunReward(run) {
    const c = run.classId || run.cls || 'paladin', goals = Math.max(0, Number(run.goals) || 0), base = Math.floor(Number(run.gold) || 0), time = Math.floor((Number(run.time) || 0) / 30) * 10, boss = Math.max(0, Number(run.bossKills) || 0) * 80, level = run.level >= 30 ? 100 : run.level >= 20 ? 60 : run.level >= 10 ? 30 : 0;
    return base + time + boss + goals * 40 + level + Math.round((base + time + boss + goals * 40 + level) * ((clsData(c).upgrades.gold || 0) * 0.05));
  }
  async function addRunReward(run) { await init(); const reward = estimateRunReward(run); meta.soulGold += reward; await save(); return reward; }
  function data() { return meta; }
  return { init, render, renderTree, applyClass, estimateRunReward, addRunReward, data };
})();
window.Progression = window.GameModules.progression;
