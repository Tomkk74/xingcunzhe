'use strict';
window.GameModules = window.GameModules || {};
window.GameModules.uniqueFxShared = (() => {
  function hasUnique(baseId) {
    let eq = window.Equipment?.equippedItems?.(S?.player?.cls) || [];
    return eq.some(it => it.baseId === baseId);
  }
  function hasSet(id, n) { return window.hasSet?.(id, n) || (S?.equipStats?.setPowers?.[id] || 0) >= (n || 6); }
  function eqStat(k) { return S?.equipStats?.[k] || 0; }
  function dotFx(f) { return !!(f?.burn || f?.poison || f?.rift); }
  function isEvolvedDamageSkill(id) {
    if (typeof EVOLUTIONS === 'undefined' || !S?.evolutions) return false;
    return Object.entries(EVOLUTIONS).some(([eid, e]) => S.evolutions[eid] && e.main === id);
  }
  function riftProgress() {
    if (!S?.endless) return 0;
    let layer = S.endlessLayer || 0, gap = window.endlessBossGap?.(layer) || 320;
    let kills = (S.kills || 0) - (S.endlessBossStartKills || 0);
    return Math.min(1, kills / gap);
  }
  function aspectDamageChain(d, id, e) {
    let p = S?.player;
    if (!p || !id) return d;
    if (hasUnique('unique-abyss-mask') && e.hp > 0) {
      let hpR = e.hp / e.max, thresh = e.boss ? .15 : e.elite ? .20 : .30;
      if (hpR <= thresh) { d = e.hp + 1; e._abyssExecute = true; S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.6,max:.6,a:1,c:'#a78bfa',aspectRing:80}); }
    }
    if (hasUnique('unique-elite-boots')) {
      let prog = riftProgress(), mul = prog >= 1 ? 1.20 : 1 + prog;
      d *= mul;
    }
    if (hasUnique('unique-blood-plate') && isEvolvedDamageSkill(id)) {
      let loss = Math.floor((1 - p.hp / p.max) * 10);
      if (loss > 0) d *= 1 + loss * .15;
    }
    if (hasUnique('unique-demon-horn') && e.boss) d *= 1.60;
    if (hasUnique('unique-plague-bell') && id === 'wraithBlade' && e._nextCrit && (e.slow > 0 || e._dotMarked > 0)) d *= 1.75;
    if (hasUnique('unique-golem-soul') && eqStat('thorns') > 0 && ['missile','holy','ice','fire','wind','moonSlash','lustKiss','soulOrb'].includes(id)) d += eqStat('thorns') * 1.5 * .01;
    if (hasUnique('unique-saint-nail') && id === 'garlic') {
      let stacks = Math.floor(riftProgress() * 10);
      if (stacks > 0) d *= Math.pow(1.12, stacks);
    }
    return d;
  }
  function aspectAfterDamage(d, id, e, crit) {
    let p = S?.player;
    if (!p || !id) return;
    if (hasUnique('unique-clock-gloves') && crit && Math.random() < .10) {
      for (const k of Object.keys(S.cd || {})) if (S.cd[k] > 0) S.cd[k] = Math.max(0, S.cd[k] - 1);
      S.parts.push({x:e.x,y:e.y,vx:0,vy:-20,life:.5,max:.5,a:1,c:'#93c5fd',txt:'CD-1s'});
    }
    if (hasUnique('unique-moon-crown') && id === 'iceorb' && crit) {
      p.shield = Math.min(p.max, (p.shield || 0) + p.max * .04);
      S.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.55,max:.55,a:1,c:'#93c5fd',aspectRing:50});
    }
    if (hasUnique('unique-rose-mirror') && (S._roseStored || 0) > 0) {
      let stored = S._roseStored, dmg = stored * 3.5, rad = 180;
      S._roseStored = 0;
      for (const m of S.enemies) if (!m.dead && dist(p, m) < rad + m.r) dealDamage(m, dmg, true, 'lustSplash');
      S.artFx.push({x:p.x,y:p.y,type:'lustOverflow',kind:'lustOverflow',color:'#f472b6',life:.52,max:.52,size:220});
    }
    if (hasSet('astral-missile') && id === 'missile' && crit && Math.random() < .25) {
      window.burstAt?.('missile', e.x, e.y, d * 2.2, 72, 0, '#c084fc', 140, .35);
      S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.5,max:.5,a:1,c:'#c084fc',aspectRing:90});
    }
    if (hasSet('moon-hunter') && id === 'moonSlash' && crit) {
      window.burstAt?.('crystal', e.x, e.y, d * (1 + eqStat('critDmg')) * 1.5, 58, 1.2, '#93c5fd', 110, .42);
      S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.55,max:.55,a:1,c:'#93c5fd',aspectRing:75});
    }
    if (hasSet('dawn-judgment') && id === 'holyLance') S.artFx.push({x:e.x,y:e.y,fromX:p.x,fromY:p.y,type:'setDawnJudgment',kind:'setDawnJudgment',color:'#fde68a',life:.42,max:.42,size:150,rot:Math.atan2(e.y-p.y,e.x-p.x)});
    if (hasSet('storm-sigil') && id === 'thunderChain' && crit) S.artFx.push({x:e.x,y:e.y,fromX:p.x,fromY:p.y,type:'setStormChain',kind:'setStormChain',color:'#fde047',life:.45,max:.45,size:120,rot:Math.atan2(e.y-p.y,e.x-p.x)});
    if (hasSet('venom-shadow') && (id === 'poisonCloud' || id === 'shadowBlade') && S.time > (e._venomFxAt || 0)) {
      e._venomFxAt = S.time + .28;
      S.artFx.push({x:e.x,y:e.y,type:'setVenomBreak',kind:'setVenomBreak',color:'#86efac',life:.46,max:.46,size:132,target:e});
    }
  }
  function aspectDefend(rawDmg, source) {
    let p = S?.player;
    if (!p) return { dmg: rawDmg, prevent: false };
    if (hasUnique('unique-rose-mirror')) { S._roseStored = (S._roseStored || 0) + rawDmg; return { dmg: 0, prevent: false }; }
    if (hasUnique('unique-pale-ring') && p.hp - rawDmg <= 0 && !S._paleUsed) {
      S._paleUsed = true; S._paleTimer = 2.5; p.hp = 1; p.shield = Math.round(p.max * .25);
      window.burstAt?.('aura', p.x, p.y, 0, 200, 0, '#f0f0ff', 260, .65);
      S.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.8,max:.8,a:1,c:'#f0f0ff',aspectRing:150});
      window.showNotice?.('苍白相位：2.5秒无敌隐形！');
      return { dmg: 0, prevent: true };
    }
    if (hasUnique('unique-golem-soul') && !p.moving && (p.cast || 0) > 0) rawDmg *= Math.max(.40, 1 - Math.min(5, Math.floor(S.time * 2)) * .12);
    return { dmg: rawDmg, prevent: false };
  }
  function aspectSkillMods() {
    let p = S?.player;
    if (!p) return;
    S._voidBonus = hasUnique('unique-void-lantern') ? Math.min(5, Math.floor(riftProgress() * 10)) * .15 : 0;
  }
  function aspectOnKill(e) {
    let p = S?.player;
    if (!p) return;
    if (hasUnique('unique-plague-bell') && (e.elite || e.boss)) {
      S._plagueDotRush = 3;
      S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.55,max:.55,a:1,c:'#86efac',aspectRing:115});
    }
    if (hasUnique('unique-dragon-heart')) {
      if (e.elite || e.boss) {
        let martyrDmg = (48 + p.max * .12) * (window.dmgBase?.('bloodNova') || 1);
        window.burstAt?.('blood', e.x, e.y, martyrDmg, 240, 0, '#fde68a', 320, .55);
        S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.7,max:.7,a:1,c:'#fde68a',aspectRing:180});
        if (S.endless) for (const m of S.enemies) if (m !== e && !m.boss && !m.dead && Math.hypot(m.x - e.x, m.y - e.y) < 260) m.hp -= m.max * .18;
      }
      if (!e.boss && !e.elite && S.endless) S.kills += Math.max(1, Math.floor(window.endlessBossGap?.(S.endlessLayer || 1) * .01));
    }
    if (hasSet('soul-shadow') && e._lastHitBy === 'wraithBlade') {
      S._soulShadowCd = 1; S._soulShadowCrit = Math.min(.75, (S._soulShadowCrit || 0) + .15);
      S.artFx.push({x:e.x,y:e.y,type:'setSoulShadowBurst',kind:'setSoulShadowBurst',color:'#a78bfa',life:.58,max:.58,size:170,rot:Math.random()*Math.PI});
    }
    if (hasSet('crimson-vessel') && (e._lastHitBy === 'lustSplash' || e._lastHitBy === 'lustKiss')) {
      let elite = window.nearest?.(S.enemies.filter(m => !m.dead && (m.elite || m.boss)), e);
      if (elite) for (const m of S.enemies.filter(m => !m.dead && !m.boss && !m.elite && Math.hypot(m.x - e.x, m.y - e.y) < 200).slice(0, 3)) m._kamikaze = { target: elite, timer: 1.8, dmg: m.max * .35 };
    }
  }
  return { hasUnique, hasSet, eqStat, dotFx, isEvolvedDamageSkill, riftProgress, aspectDamageChain, aspectAfterDamage, aspectDefend, aspectSkillMods, aspectOnKill };
})();
