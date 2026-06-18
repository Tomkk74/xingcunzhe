window.GameModules = window.GameModules || {};
window.GameModules.redeem = (() => {
  let redeeming = false;

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
  async function applyReward(reward) {
    if (!reward?.id) throw new Error('奖励数据异常');
    if (reward.scytheGift) return await grantScytheGift(reward.id);
    if (reward.riftKeys) {
      if (!window.Rift?.addGrantKeys) throw new Error('秘境系统未就绪，请稍后再试');
      return await window.Rift.addGrantKeys(reward.id, reward.riftKeys);
    }
    if (!window.Progression?.addGrantCurrency) throw new Error('成长系统未就绪，请稍后再试');
    return await window.Progression.addGrantCurrency(reward.id, reward.gold || 0, reward.core || 0);
  }
  async function submit(onSuccess) {
    if (redeeming) return;
    const input = document.getElementById('redeemInput');
    const submitBtn = document.getElementById('redeemSubmit');
    const code = (input?.value || '').trim();
    if (!code) { message('请输入兑换码'); return; }
    redeeming = true;
    if (submitBtn) submitBtn.disabled = true;
    try {
      message('兑换中，请稍候…');
      const r = await dzmm.fn.invoke('redeem', { code });
      if (!r.applied) { message(r.message || '该兑换码已使用过'); return; }
      const result = await applyReward(r.reward);
      if (!result.applied) { message('该兑换码奖励已领取过'); return; }
      message(r.message || '兑换成功', true);
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
    document.getElementById('redeemSubmit').onclick = () => submit(onSuccess).catch(e => {
      console.error('兑换失败:', e.code, e.message, e.stack);
      message(e.code === 'function_not_published' ? '兑换函数还未发布，请保存游戏后上线' : e.message || '兑换失败，请稍后重试');
    });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('redeemSubmit').click(); });
  }
  return { bind };
})();
