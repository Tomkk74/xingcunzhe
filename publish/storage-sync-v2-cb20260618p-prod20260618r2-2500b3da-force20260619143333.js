window.GameModules = window.GameModules || {};
window.GameModules.storageSync = (() => {
  const warned = {};
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
  function withTimeout(task, ms = 2800) {
    if (!task || typeof task.then !== 'function') return Promise.resolve(task);
    return Promise.race([
      task,
      new Promise((_, reject) => setTimeout(() => {
        const e = new Error('云端请求超时，已使用本地数据');
        e.code = 'CLOUD_TIMEOUT';
        reject(e);
      }, ms))
    ]);
  }
  async function get(key) {
    const local = localGet(key);
    let cloud = null;
    try { cloud = (await withTimeout(window.dzmm?.kv?.get?.(key)))?.value ?? null; }
    catch (e) { if (!local) console.warn('云端读取失败:', e.code, e.message); }
    const best = newer(local, cloud);
    if (best && best !== local) localPut(key, best);
    return best;
  }
  async function put(key, value, label = '数据') {
    const data = stamp(value);
    localPut(key, data);
    try { await withTimeout(window.dzmm?.kv?.put?.(key, data)); }
    catch (e) { warn(key, `${label}云端保存失败，已暂存本机`, e); }
    return data;
  }
  async function remove(key, label = '数据') {
    localRemove(key);
    try { await withTimeout(window.dzmm?.kv?.delete?.(key)); }
    catch (e) { warn(key + ':delete', `${label}云端删除失败`, e); }
  }
  return { get, put, remove, localGet, localPut, newer, stamp };
})();
window.StorageSync = window.GameModules.storageSync;
