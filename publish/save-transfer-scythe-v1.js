window.GameModules = window.GameModules || {};
window.GameModules.saveTransfer = (() => {
  const VERSION = 1;
  const BASE_KEYS = ['arcane-meta-v3','arcane-season-state-v2','arcane-rift-v1','arcane-cosmetics-v1','arcane-redeem-v2','arcane-layout-v2'];
  const timeout = (p, ms = 1200) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

  function seasonKey(base){return window.Season?.key ? Season.key(base) : base}
  function keys(){return [...BASE_KEYS, seasonKey('arcane-save-v2'), seasonKey('arcane-equipment-v2')]}
  function localGet(k){try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):null}catch(_){return null}}
  function localPut(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
  async function kvGet(k){const local=localGet(k);if(local!==null)return local;try{return (await timeout(window.dzmm.kv.get(k)))?.value??null}catch(_){return null}}
  async function kvPut(k,v){localPut(k,v);try{await timeout(window.dzmm.kv.put(k,v))}catch(_){}}
  function enc(obj){return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))}
  function dec(text){return JSON.parse(decodeURIComponent(escape(atob(String(text).trim()))))}
  function msg(text, ok=false){const el=document.getElementById('saveTransferMsg');if(!el)return;el.textContent=text;el.classList.toggle('ok',ok)}

  async function exportText(){
    const data = {};
    for (const k of keys()) data[k] = await kvGet(k);
    return enc({ game:'arcane-survivors', version:VERSION, build:window.__ARCANE_BUILD||'', at:Date.now(), data });
  }
  async function importText(text){
    const pack = dec(text);
    if (pack?.game !== 'arcane-survivors' || !pack.data || typeof pack.data !== 'object') throw new Error('存档文本格式不正确');
    for (const [k,v] of Object.entries(pack.data)) if (keys().includes(k) && v !== null) await kvPut(k,v);
    return true;
  }
  async function doExport(){
    const box=document.getElementById('saveTransferText');
    try{box.value=await exportText();box.focus();box.select();msg('已生成存档文本，复制保存即可。',true)}
    catch(e){console.error('导出存档失败:',e.code,e.message,e.stack);msg('导出失败，请稍后重试')}
  }
  async function doImport(){
    const box=document.getElementById('saveTransferText'),text=box?.value||'';
    try{await importText(text);msg('导入成功，正在刷新存档...',true);setTimeout(()=>location.reload(),700)}
    catch(e){console.error('导入存档失败:',e.code,e.message,e.stack);msg(e.message||'导入失败，存档文本无效')}
  }
  function open(){document.getElementById('saveTransferModal')?.classList.remove('hidden');msg('')}
  function close(){document.getElementById('saveTransferModal')?.classList.add('hidden')}
  function bind(){
    document.getElementById('saveTransferBtn')?.addEventListener('click', open);
    document.getElementById('saveTransferClose')?.addEventListener('click', close);
    document.getElementById('saveExportBtn')?.addEventListener('click', doExport);
    document.getElementById('saveImportBtn')?.addEventListener('click', doImport);
  }
  return { bind, exportText, importText };
})();
window.SaveTransfer = window.GameModules.saveTransfer;
window.addEventListener('load', () => window.SaveTransfer?.bind?.());
