'use strict';
window.GameModules = window.GameModules || {};
window.GameModules.uniqueFx = (() => {
  // === 暗金威能 + 套装6件special 战斗实现 ===
  // 集成点：dealDamage / takePlayerDamage / skills / deaths / updateObjs

  const U = window.GameModules.affix?.UNIQUE_ASPECTS || {};

  // --- helpers ---
  function hasUnique(baseId) {
    let eq = window.Equipment?.equippedItems?.(S?.player?.cls) || [];
    return eq.some(it => it.baseId === baseId);
  }
  function hasSet(id, n) { return window.hasSet?.(id, n) || (S?.equipStats?.setPowers?.[id] || 0) >= (n || 6); }
  function eqStat(k) { return S?.equipStats?.[k] || 0; }
  function riftProgress() {
    if (!S?.endless) return 0;
    let layer = S.endlessLayer || 0, gap = window.endlessBossGap?.(layer) || 320;
    let kills = (S.kills || 0) - (S.endlessBossStartKills || 0);
    return Math.min(1, kills / gap);
  }

  // --- HOOK 1: dealDamage 伤害链 (在 setSkillDmg 之后调用) ---
  // 返回修正后的伤害 d
  function aspectDamageChain(d, id, e) {
    let p = S?.player;
    if (!p || !id) return d;

    // unique-abyss-mask: 深渊斩杀 — 低血量必杀
    if (hasUnique('unique-abyss-mask') && e.hp > 0) {
      let hpR = e.hp / e.max;
      let thresh = e.boss ? .15 : e.elite ? .20 : .30;
      if (hpR <= thresh) { d = e.hp + 1; e._abyssExecute = true; S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.6,max:.6,a:1,c:'#a78bfa',aspectRing:80}); }
    }

    // unique-elite-boots: 猎手增幅 — 秘境进度等额独立乘区
    if (hasUnique('unique-elite-boots')) {
      let prog = riftProgress();
      let mul = prog >= 1 ? 1.20 : 1 + prog;
      d *= mul;
    }

    // unique-blood-plate: 血契反击 — 生命每低10%进化技能[x]15%
    if (hasUnique('unique-blood-plate')) {
      let loss = Math.floor((1 - p.hp / p.max) * 10);
      if (loss > 0) d *= 1 + loss * .15;
    }

    // unique-demon-horn: 魔王降临 — 对Boss[x]60%
    if (hasUnique('unique-demon-horn') && e.boss) d *= 1.60;

    // unique-plague-bell: 疫病加速 — 幽魂刃舞对DoT目标暴击伤害[x]75%
    if (hasUnique('unique-plague-bell') && id === 'wraithBlade' && (e.slow > 0 || e._dotMarked)) d *= 1.75;

    // unique-golem-soul: 岩盾守护 — 荆棘150%加算到弹幕
    if (hasUnique('unique-golem-soul') && eqStat('thorns') > 0) {
      if (['missile', 'holy', 'ice', 'fire', 'wind', 'moonSlash', 'lustKiss', 'soul'].includes(id)) {
        d += eqStat('thorns') * 1.5 * 0.01;
      }
    }

    // unique-saint-nail: 天谴重击 — 秘境进度每10%连乘[x]12%
    if (hasUnique('unique-saint-nail') && id === 'garlic') {
      let stacks = Math.floor(riftProgress() * 10);
      if (stacks > 0) d *= Math.pow(1.12, stacks);
    }

    return d;
  }

  // --- HOOK 2: dealDamage 伤害后效果 (伤害结算后调用) ---
  function aspectAfterDamage(d, id, e, crit) {
    let p = S?.player;
    if (!p || !id) return;

    // unique-clock-gloves: 逆时冷却 — 暴击10%概率CD减1秒
    if (hasUnique('unique-clock-gloves') && crit && Math.random() < .10) {
      for (const k of Object.keys(S.cd || {})) {
        if (S.cd[k] > 0) S.cd[k] = Math.max(0, S.cd[k] - 1);
      }
      S.parts.push({x:e.x,y:e.y,vx:0,vy:-20,life:.5,max:.5,a:1,c:'#93c5fd',txt:'CD-1s'});
    }

    // unique-moon-crown: 寒月护盾 — 冰法球暴击+4%生命护盾
    if (hasUnique('unique-moon-crown') && id === 'iceorb' && crit) {
      let shieldGain = p.max * .04;
      p.shield = Math.min(p.max, (p.shield || 0) + shieldGain);
      S.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.55,max:.55,a:1,c:'#93c5fd',aspectRing:50});
    }

    // unique-rose-mirror: 欲念蓄池 — 攻击时释放蓄池伤害
    if (hasUnique('unique-rose-mirror') && (S._roseStored || 0) > 0) {
      let stored = S._roseStored;
      S._roseStored = 0;
      let splashDmg = stored * 3.5;
      window.burstAt?.('lustSplash', p.x, p.y, splashDmg, 180, 0, '#f472b6', 220, .52);
      S.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.65,max:.65,a:1,c:'#f472b6',aspectRing:120});
    }

    // set astral-missile 6件: 幸运内爆 — 魔法飞弹暴击25%触发内爆
    if (hasSet('astral-missile') && id === 'missile' && crit && Math.random() < .25) {
      window.burstAt?.('missile', e.x, e.y, d * 2.2, 72, 0, '#c084fc', 140, .35);
      S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.5,max:.5,a:1,c:'#c084fc',aspectRing:90});
    }

    // set moon-hunter 6件: 月牙斩暴击引发二级冰爆
    if (hasSet('moon-hunter') && id === 'moonSlash' && crit) {
      let critDmgBonus = 1 + eqStat('critDmg');
      window.burstAt?.('crystal', e.x, e.y, d * critDmgBonus * 1.5, 58, 1.2, '#93c5fd', 110, .42);
      S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.55,max:.55,a:1,c:'#93c5fd',aspectRing:75});
    }

    // set cyclone-axe 6件: 回旋飞斧飞回重置位移CD + 切割风暴
    // (handled in updateObjs for axe return)

    // set soul-shadow 6件: 幽魂刃舞击杀全技能无CD 1秒 (handled in deaths)
  }

  // --- HOOK 3: takePlayerDamage 防御 (在护甲/减伤前调用) ---
  // 返回 { dmg, prevent }
  function aspectDefend(rawDmg, source) {
    let p = S?.player;
    if (!p) return { dmg: rawDmg, prevent: false };

    // unique-rose-mirror: 欲念蓄池 — 承伤存入蓄池
    if (hasUnique('unique-rose-mirror')) {
      S._roseStored = (S._roseStored || 0) + rawDmg;
      return { dmg: 0, prevent: false };
    }

    // unique-pale-ring: 苍白相位 — 致命伤害免死2.5秒无敌
    if (hasUnique('unique-pale-ring') && p.hp - rawDmg <= 0 && !S._paleUsed) {
      S._paleUsed = true;
      S._paleTimer = 2.5;
      p.hp = 1;
      p.shield = Math.round(p.max * .25);
      window.burstAt?.('aura', p.x, p.y, 0, 200, 0, '#f0f0ff', 260, .65);
      S.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.8,max:.8,a:1,c:'#f0f0ff',aspectRing:150});
      window.showNotice?.('苍白相位：2.5秒无敌隐形！');
      return { dmg: 0, prevent: true };
    }

    // unique-golem-soul: 岩盾守护 — 站立释放时全减伤
    if (hasUnique('unique-golem-soul') && !p.moving && (p.cast || 0) > 0) {
      let stacks = Math.min(5, Math.floor(S.time * 2));
      let reduction = stacks * .12;
      rawDmg *= Math.max(.40, 1 - reduction);
    }

    return { dmg: rawDmg, prevent: false };
  }

  // --- HOOK 4: skills 技能修改 ---
  function aspectSkillMods() {
    let p = S?.player;
    if (!p) return;

    // unique-void-lantern: 虚空超载 — 秘境进度增攻速移速
    if (hasUnique('unique-void-lantern')) {
      let stacks = Math.min(5, Math.floor(riftProgress() * 10));
      S._voidBonus = stacks * .15;
    } else {
      S._voidBonus = 0;
    }
  }

  // --- HOOK 5: deaths 击杀效果 ---
  function aspectOnKill(e) {
    let p = S?.player;
    if (!p) return;

    // unique-dragon-heart: 龙心殉爆 — 击杀精英全屏殉爆 + 杂兵额外进度
    if (hasUnique('unique-dragon-heart')) {
      if (e.elite || e.boss) {
        let martyrDmg = (48 + p.max * .12) * window.dmgBase?.('bloodNova') || 60;
        window.burstAt?.('blood', e.x, e.y, martyrDmg, 240, 0, '#fde68a', 320, .55);
        S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.7,max:.7,a:1,c:'#fde68a',aspectRing:180});
        // 杂兵殉爆额外推进
        if (S.endless) {
          for (const m of S.enemies) {
            if (m !== e && !m.boss && !m.dead && Math.hypot(m.x - e.x, m.y - e.y) < 260) {
              m.hp -= m.max * .18;
            }
          }
        }
      }
      // 杂兵死亡额外1%秘境进度
      if (!e.boss && !e.elite && S.endless) {
        S.kills += Math.max(1, Math.floor(window.endlessBossGap?.(S.endlessLayer || 1) * .01));
      }
    }

    // set soul-shadow 6件: 幽魂刃舞击杀全技能无CD 1秒
    if (hasSet('soul-shadow') && e._lastHitBy === 'wraithBlade') {
      S._soulShadowCd = 1.0;
      S._soulShadowCrit += .15;
    }

    // set crimson-vessel 6件: 欲液反涌 — 控制小怪狂暴自爆冲向精英
    if (hasSet('crimson-vessel') && (e._lastHitBy === 'lustSplash' || e._lastHitBy === 'lustKiss')) {
      let elite = window.nearest?.(S.enemies.filter(m => !m.dead && (m.elite || m.boss)), e);
      if (elite) {
        let list = S.enemies.filter(m => !m.dead && !m.boss && !m.elite && Math.hypot(m.x - e.x, m.y - e.y) < 200).slice(0, 3);
        for (const m of list) {
          m._kamikaze = { target: elite, timer: 1.8, dmg: m.max * .35 };
        }
      }
    }
  }

  // --- HOOK 6: updateObjs 持续效果 ---
  function aspectUpdate(dt) {
    let p = S?.player;
    if (!p) return;

    // unique-pale-ring: 苍白相位倒计时
    if (S._paleTimer > 0) {
      S._paleTimer -= dt;
      if (S._paleTimer <= 0) { S._paleTimer = 0; }
      // 相位期间技能伤害[x]120%
    }

    // unique-void-lantern: 增益已通过 _voidBonus 作用于 movePlayer

    // set reaper-waltz 6件: 死神状态 — DoT加速 + 溢出吸血
    if (hasSet('reaper-waltz') && S._deathShieldFull) {
      S._dotSpeed = 2.5;
      // DoT伤害加速在 artFx burn/poison 中生效
    }

    // set soul-shadow 6件: 无CD倒计时
    if (S._soulShadowCd > 0) {
      S._soulShadowCd -= dt;
      if (S._soulShadowCd > 0) {
        for (const k of Object.keys(S.cd || {})) S.cd[k] = 0;
      }
    }

    // set crimson-vessel 6件: kamikaze小怪冲向精英
    for (const e of S.enemies) {
      if (e._kamikaze && !e.dead) {
        let k = e._kamikaze;
        k.timer -= dt;
        let tx = k.target.x, ty = k.target.y;
        let a = Math.atan2(ty - e.y, tx - e.x);
        e.x += Math.cos(a) * e.spd * 2.5 * dt;
        e.y += Math.sin(a) * e.spd * 2.5 * dt;
        if (Math.hypot(e.x - tx, e.y - ty) < e.r + k.target.r + 8 || k.timer <= 0) {
          // 自爆
          window.burstAt?.('lustSplash', e.x, e.y, k.dmg * window.dmgBase?.('lustSplash') || 30, 64, 0, '#fb7185', 110, .32);
          window.dealDamage?.(k.target, k.dmg * 2, true, 'lustSplash');
          e.hp = 0;
          delete e._kamikaze;
        }
      }
    }

    // set ember-meteor 6件: Boss在火海每秒DoT[x]150%
    // (在 burn tick 中叠加 — 通过 S._emberStack 标记)

    // set aureate-guardian 6件: 大蒜光环黑洞吸附
    if (hasSet('aureate-guardian') && S.skills.garlic) {
      let lv = window.skillLv?.('garlic') || 1;
      let rad = 50 + lv * 10 + 34;
      for (const e of S.enemies) {
        let d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < rad * 1.5 && d > 8) {
          let force = (1 - d / (rad * 1.5)) * 60 * dt;
          let a = Math.atan2(p.y - e.y, p.x - e.x);
          e.x += Math.cos(a) * force;
          e.y += Math.sin(a) * force;
        }
      }
    }

    // set violet-hymn 6件: 祈祷溢出治疗转化惩戒脉冲
    if (hasSet('violet-hymn') && S.skills.lustPrayer) {
      // 当玩家生命满时，lustPrayer治疗溢出转化为伤害脉冲
      // (在 prayer tick 中处理)
    }

    // set rose-mirror 6件: 镜像反弹增强 — 已有基础实现(mirrorAt volley)
    // 增强为[x]500%系数
  }

  // --- HOOK 7: artFx 持续效果修饰 ---
  function aspectArtFxTick(f, dt) {
    // set ember-meteor 6件: 火海Boss DoT叠加
    if (hasSet('ember-meteor') && f.burn && f.kind === 'meteor') {
      for (const e of S.enemies) {
        if (e.boss && Math.hypot(e.x - f.x, e.y - f.y) < f.rad + e.r) {
          e._emberBurn = (e._emberBurn || 0) + dt;
          f._emberMul = 1 + Math.min(1.5, e._emberBurn * .2);
        }
      }
      if (f._emberMul && f.dmg) {
        f.dmg *= f._emberMul;
      }
    }

    // set reaper-waltz 6件: DoT加速250%
    if (hasSet('reaper-waltz') && S._deathShieldFull && (f.burn || f.poison || f.rift)) {
      f.dmg *= S._dotSpeed || 1;
    }

    // set violet-hymn 6件: 祈祷溢出转化脉冲
    if (hasSet('violet-hymn') && f.prayer) {
      let p = S?.player;
      if (p && p.hp >= p.max) {
        // 溢出治疗 → 1:3 惩戒脉冲
        let overflowDmg = f.dmg * 3;
        let e = window.nearest?.(S.enemies, p);
        if (e) {
          window.dealDamage?.(e, overflowDmg * dt, true, 'lustPrayer');
          if (e.elite || e.boss) e._violetVuln = (e._violetVuln || 0) + dt;
        }
      }
    }
  }

  // --- HOOK 8: 投射物命中修饰 ---
  function aspectProjectileHit(m, e, dmg) {
    let p = S?.player;
    if (!p) return dmg;

    // unique-thunder-bow: 雷链分裂 — 飞斧命中20%分裂雷链
    if (hasUnique('unique-thunder-bow') && m.kind === 'axe' && Math.random() < .20) {
      let elite = window.nearest?.(S.enemies.filter(x => x !== e && (x.elite || x.boss) && Math.hypot(x.x - e.x, x.y - e.y) < 280), e);
      if (elite) {
        window.dealDamage?.(elite, dmg * .50, true, 'thunderChain');
        e._thunderVuln = 3; // 3秒易伤
        S.bolts.push({ x: elite.x, y: elite.y, x2: e.x, y2: e.y, life: .22, chain: true });
        S.parts.push({x:e.x,y:e.y,vx:0,vy:0,life:.45,max:.45,a:1,c:'#fde047',aspectRing:60});
      }
    }

    // unique-star-tome: 微型黑洞 — 飞弹穿透生成黑洞
    if (hasUnique('unique-star-tome') && m.kind === 'missile' && m.pierce) {
      if (!m._blackhole) {
        m._blackhole = true;
        S.artFx.push({
          x: e.x, y: e.y, type: 'voidRift', kind: 'missile', color: '#c084fc',
          life: 1.8, max: 1.8, size: 100, rad: 80, pull: true, dmg: dmg * .30
        });
      }
    }

    return dmg;
  }

  // --- HOOK 9: 镰刀攻击护盾 (reaper-waltz) ---
  function scytheShieldOnHit(hits) {
    if (hasSet('reaper-waltz') && hits > 0) {
      let p = S?.player;
      if (p) {
        let shieldPerHit = p.max * .01;
        p.shield = Math.min(p.max, (p.shield || 0) + shieldPerHit * hits);
        if (p.shield >= p.max) S._deathShieldFull = true;
      }
    }
  }

  // --- HOOK 10: 移速/攻速修正 ---
  function getMoveBonus() {
    return S?._voidBonus || 0;
  }
  function getAtkBonus() {
    return S?._voidBonus || 0;
  }
  function getPaleDamageMul() {
    // 苍白相位期间技能伤害[x]120%
    if (hasUnique('unique-pale-ring') && S._paleTimer > 0) return 1.20;
    return 1;
  }
  function getSoulShadowCrit() {
    return S?._soulShadowCrit || 0;
  }
  function getThunderVuln(e) {
    if (e._thunderVuln > 0) {
      e._thunderVuln -= 1/60;
      return 1.50;
    }
    return 1;
  }
  function getVioletVuln(e) {
    // 命中精英15%易伤[x]40%
    if (hasSet('violet-hymn') && (e.elite || e.boss) && (e._violetVuln || 0) > 0) {
      if (e._violetVuln >= 3) return 1.40;
      return 1 + e._violetVuln * .14;
    }
    return 1;
  }

  // --- HOOK 11: 镰刀分裂 (blood-reaping 6件) ---
  function bloodReapSplit(x, y, dmg) {
    if (!hasSet('blood-reaping')) return;
    let elites = S.enemies.filter(e => !e.dead && (e.elite || e.boss) && Math.hypot(e.x - x, e.y - y) < 220);
    for (let i = 0; i < Math.min(3, elites.length); i++) {
      let target = elites[i];
      window.burstAt?.('blood', target.x, target.y, dmg * .45, 42, 0, '#a78bfa', 80, .28);
      window.dealDamage?.(target, dmg * .45, true, 'bloodReap');
      // 暗影内爆[x]45%
      window.dealDamage?.(target, dmg * .45, true, 'bloodReap');
      S.parts.push({x:target.x,y:target.y,vx:0,vy:0,life:.45,max:.45,a:1,c:'#a78bfa',aspectRing:55});
    }
  }

  // --- HOOK 12: holy lance trail (faith-boots) ---
  function holyLanceTrail(x, y) {
    if (!hasUnique('unique-faith-boots')) return;
    S.artFx.push({
      x, y, type: 'holy', kind: 'holy', color: '#fde68a',
      life: 4, max: 4, size: 32, rad: 40, trail: true, dmg: 0
    });
  }

  // --- 初始化每局状态 ---
  function resetRunState() {
    S._roseStored = 0;
    S._paleUsed = false;
    S._paleTimer = 0;
    S._voidBonus = 0;
    S._deathShieldFull = false;
    S._dotSpeed = 1;
    S._soulShadowCd = 0;
    S._soulShadowCrit = 0;
  }

  // --- 飞斧重置 (cyclone-axe 6件) ---
  function axeReturnReset(axe) {
    if (!hasSet('cyclone-axe')) return;
    // 重置位移技能CD (foot / windCutter)
    if (S.cd.windCutter > 0) S.cd.windCutter = 0;
    // 位移路径留切割风暴
    S.artFx.push({
      x: axe.x, y: axe.y, type: 'wind', kind: 'windCutter', color: '#67e8f9',
      life: 1.2, max: 1.2, size: 80, rad: 56, dmg: axe.dmg * .28,
      spin: true
    });
    S.parts.push({x:axe.x,y:axe.y,vx:0,vy:0,life:.5,max:.5,a:1,c:'#67e8f9',aspectRing:65});
  }

  // --- daggerRain/windCutter 分裂 (hunt-quiver) ---
  function huntQuiverCount(baseCount, skillId) {
    if (!hasUnique('unique-hunt-quiver')) return baseCount;
    if (skillId !== 'daggerRain' && skillId !== 'windCutter') return baseCount;
    let extraAtk = eqStat('atkSpeed') + (S._voidBonus || 0);
    let extraCount = Math.floor(extraAtk * 10) * .20;
    return baseCount + Math.floor(extraCount * baseCount);
  }

  return {
    hasUnique, hasSet, riftProgress, resetRunState,
    aspectDamageChain, aspectAfterDamage, aspectDefend,
    aspectSkillMods, aspectOnKill, aspectUpdate,
    aspectArtFxTick, aspectProjectileHit,
    scytheShieldOnHit, bloodReapSplit, holyLanceTrail,
    axeReturnReset, huntQuiverCount,
    getMoveBonus, getAtkBonus, getPaleDamageMul,
    getSoulShadowCrit, getThunderVuln, getVioletVuln
  };
})();
window.UniqueFx = window.GameModules.uniqueFx;
