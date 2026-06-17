window.GameModules = window.GameModules || {};
window.GameModules.redeem = (() => {
  const KEY = 'arcane-redeem-v2';
  const CODES = {
    'Tomkk白衣胜雪': { id: 'tomkk-baiyi-20260615', gold: 6666, core: 100 },
    'Tomkk666': { id: 'tomkk-rift-tickets-20260616', riftKeys: 50 },
    '琦琦专属礼包': { id: 'scythe-gift-20260617', scytheGift: true, userId: '4701f6f4-6d69-4cd8-8dbe-0f20f2668162' },
    '魔核特供': { id: 'core-grant-20260617', coreGift: true, userId: '835bd1b2-f27a-4490-aa59-f3d1dbde0d16' },
  };
  let used = null;
  let redeeming = false;

  async function kvGet(key) {
    try { return (await window.dzmm.kv.get(key))?.value ?? null; }
    catch (_) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  }
  async function kvPut(key, value) {
    try { await window.dzmm.kv.put(key, value); }
    catch (_) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  }
  async function loadUsed() {
    if (used) return used;
    const data = await kvGet(KEY);
    used = data && typeof data === 'object' ? data : {};
    return used;
  }
  function message(text, ok = false) {
    const el = document.getElementById('redeemMsg');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('ok', ok);
  }
  function scytheSetItem(slot) {
    const base = Equipment.all.find(x => x.rarity === 'set' && x.class === 'scytheMaiden' && x.setId === 'reaper-waltz' && x.slot === slot);
    if (!base) return null;
    const stats = { ...(base.stats || {}), setSkillDmg: 2 };
    const resists = { ...(base.resists || {}) };
    return { ...base, uid: `gift${Date.now().toString(36)}${slot}${Math.random().toString(36).slice(2,6)}`, baseId: base.baseId, level: 38, requiredLevel: 20, season: Season?.CURRENT || 1, source: '限定激活码', rollTier: '套装特效 200%', rollMul: 1, stats, resists, corrupted: false };
  }
  async function grantScytheGift(id) {
    if (!window.Progression?.addGrantCurrency || !window.Rift?.addGrantKeys || !window.Equipment?.addItem || !window.Season?.grantLevel) throw new Error('奖励系统未就绪');
    const cur = await Progression.addGrantCurrency(id + '-currency', 20000, 400);
    if (!cur.applied) return { applied: false };
    await Rift.addGrantKeys(id + '-keys', 40);
    await Season.grantLevel(20);
    await Equipment.init();
    const slots = ['weapon','helm','chest','amulet','ring','boots'].sort(() => Math.random() - .5).slice(0,4);
    for (const slot of slots) {
      const it = scytheSetItem(slot);
      if (it) await Equipment.addItem(it);
    }
    return { applied: true, slots };
  }
  async function submit(onSuccess) {
    if (redeeming) return;
    const input = document.getElementById('redeemInput');
    const submitBtn = document.getElementById('redeemSubmit');
    const code = (input?.value || '').trim();
    const reward = CODES[code];
    if (!reward) { message('兑换码无效'); return; }
    redeeming = true;
    if (submitBtn) submitBtn.disabled = true;
    try {
      message('兑换中，请稍候…');
      const data = await loadUsed();
      if (data[reward.id]) { message('该兑换码已使用过'); return; }
      let result;
      if (reward.scytheGift) {
        const user = await window.dzmm?.user?.info?.();
        if (user?.id !== reward.userId) { message('该兑换码仅限指定用户领取'); return; }
        result = await grantScytheGift(reward.id);
      } else if (reward.coreGift) {
        const user = await window.dzmm?.user?.info?.();
        if (user?.id !== reward.userId) { message('该兑换码仅限指定用户领取'); return; }
        if (!window.Progression?.addGrantCurrency) { message('成长系统未就绪，请稍后再试'); return; }
        result = await window.Progression.addGrantCurrency(reward.id, 0, 400);
      } else if (reward.riftKeys) {
        if (!window.Rift?.addGrantKeys) { message('秘境系统未就绪，请稍后再试'); return; }
        result = await window.Rift.addGrantKeys(reward.id, reward.riftKeys);
      } else {
        if (!window.Progression?.addGrantCurrency) { message('成长系统未就绪，请稍后再试'); return; }
        result = await window.Progression.addGrantCurrency(reward.id, reward.gold, reward.core);
      }
      data[reward.id] = true;
      await kvPut(KEY, data);
      if (!result.applied) { message('该兑换码已使用过'); return; }
      message(reward.scytheGift ? '兑换成功：琦琦冥月套装 4 件、魔核 +400、金币 +20000、门票 +40、赛季等级直升 20' : reward.coreGift ? '兑换成功：魔核 +400' : reward.riftKeys ? `兑换成功：大秘境门票 +${reward.riftKeys}` : `兑换成功：灵魂金币 +${reward.gold}，魔核 +${reward.core}`, true);
      input.value = '';
      onSuccess?.();
    } finally {
      redeeming = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  }
  function bind(onSuccess) {
    const modal = document.getElementById('redeemModal');
    const input = document.getElementById('redeemInput');
    document.getElementById('redeemBtn').onclick = () => { modal.classList.remove('hidden'); input?.focus(); message(''); };
    document.getElementById('redeemCancel').onclick = () => modal.classList.add('hidden');
    document.getElementById('redeemSubmit').onclick = () => submit(onSuccess).catch(e => { console.error('兑换失败:', e.code, e.message, e.stack); message('兑换失败，请稍后重试'); });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('redeemSubmit').click(); });
  }
  return { bind, codes: CODES };
})();