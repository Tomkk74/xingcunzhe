window.GameModules = window.GameModules || {};
window.GameModules.storageSync = (() => {
  const warned = {}, pendingCloud = new Set();
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function now() { return Date.now(); }
  function stamp(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    return { ...value, updatedAt: now() };
  }
  function timeOf(value) {
    const t = Number(value?.updatedAt || value?.savedAt || value?.at || 0);
    return Number.isFinite(t) ? t : 0;
  }
  function newer(a, b) {
    if (a == null) return b ?? null;
    if (b == null) return a;
    return timeOf(b) > timeOf(a) ? b : a;
  }
  function localGet(key) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  function localPut(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function localRemove(key) { try { localStorage.removeItem(key); } catch (_) {} }
  function warn(scope, text, e) {
    if (!warned[scope]) {
      warned[scope] = true;
      window.dzmm?.toast?.warning?.(text);
    }
    if (e) console.warn(text + ':', e.code, e.message);
  }
  function err(code, message) { const e = new Error(message); e.code = code; return e; }
  function withTimeout(task, ms = 2800) {
    if (!task || typeof task.then !== 'function') return Promise.reject(err('CLOUD_UNAVAILABLE', '云端存档接口尚未就绪'));
    return Promise.race([
      task,
      new Promise((_, reject) => setTimeout(() => reject(err('CLOUD_TIMEOUT', '云端请求超时')), ms))
    ]);
  }
  async function cloudApi(ms = 3200) {
    const end = now() + ms;
    while (now() < end) {
      const kv = window.dzmm?.kv;
      if (kv?.get && kv?.put) return kv;
      await wait(120);
    }
    throw err('CLOUD_UNAVAILABLE', '云端存档接口尚未就绪');
  }
  async function cloudGet(key, timeout) {
    const kv = await cloudApi(timeout);
    return (await withTimeout(kv.get(key), timeout))?.value ?? null;
  }
  function markPending(key) { pendingCloud.add(key); }
  function clearPending(key) { pendingCloud.delete(key); }
  async function get(key) {
    const local = localGet(key);
    let cloud = null, cloudOk = false, last = null;
    const tries = local ? 1 : 2;
    for (let i = 0; i < tries; i++) {
      try {
        cloud = await cloudGet(key, local ? 1600 : 2200);
        cloudOk = true;
        break;
      } catch (e) {
        last = e;
        if (local || i === tries - 1) break;
        await wait(260 * (i + 1));
      }
    }
    if (!cloudOk) {
      markPending(key);
      if (local) {
        console.warn('云端读取失败，使用本机缓存:', last?.code, last?.message);
        return local;
      }
      console.warn('云端读取超时，先使用临时空数据:', key, last?.code, last?.message);
      return null;
    }
    clearPending(key);
    const best = newer(local, cloud);
    if (best && best !== local) localPut(key, best);
    return best;
  }
  async function put(key, value, label = '数据') {
    const data = stamp(value);
    if (pendingCloud.has(key)) {
      try {
        const existing = await cloudGet(key, 1800);
        clearPending(key);
        const best = newer(existing, data);
        if (best && best !== data) {
          localPut(key, best);
          return best;
        }
      } catch (e) {
        localPut(key, data);
        warn(key + ':pending', `${label}云端尚未确认，已先暂存本机`, e);
        return data;
      }
    }
    try {
      const kv = await cloudApi(1800);
      await withTimeout(kv.put(key, data), 3200);
      clearPending(key);
      localPut(key, data);
    } catch (e) {
      localPut(key, data);
      warn(key, `${label}云端保存失败，已暂存本机`, e);
    }
    return data;
  }
  async function remove(key, label = '数据') {
    localRemove(key);
    try {
      const kv = await cloudApi(1800);
      await withTimeout(kv.delete?.(key), 3200);
    } catch (e) { warn(key + ':delete', `${label}云端删除失败`, e); }
  }
  return { get, put, remove, localGet, localPut, newer, stamp };
})();
window.StorageSync = window.GameModules.storageSync;
