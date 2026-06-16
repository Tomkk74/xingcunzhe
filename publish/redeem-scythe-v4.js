window.GameModules = window.GameModules || {};
window.GameModules.redeem = (() => {
  const KEY = 'arcane-redeem-v2';
  const CODES = {
    'Tomkk白衣胜雪': { id: 'tomkk-baiyi-20260615', gold: 6666, core: 100 },
    'Tomkk666': { id: 'tomkk-rift-tickets-20260616', riftKeys: 50 },
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
      if (reward.riftKeys) {
        if (!window.Rift?.addGrantKeys) { message('秘境系统未就绪，请稍后再试'); return; }
        result = await window.Rift.addGrantKeys(reward.id, reward.riftKeys);
      } else {
        if (!window.Progression?.addGrantCurrency) { message('成长系统未就绪，请稍后再试'); return; }
        result = await window.Progression.addGrantCurrency(reward.id, reward.gold, reward.core);
      }
      data[reward.id] = true;
      await kvPut(KEY, data);
      if (!result.applied) { message('该兑换码已使用过'); return; }
      message(reward.riftKeys ? `兑换成功：大秘境门票 +${reward.riftKeys}` : `兑换成功：灵魂金币 +${reward.gold}，魔核 +${reward.core}`, true);
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