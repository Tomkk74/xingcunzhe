window.GameModules = window.GameModules || {};
window.GameModules.season = (() => {
  const CURRENT = 1;
  const KEY = 'arcane-season-state-v1';
  const CONFIG = {
    1: {
      name: '第一赛季',
      theme: '深渊初醒',
      levelCap: 20,
      introTitle: '第一赛季：深渊初醒',
      intro: [
        '混沌地域裂隙开启，魔王军团正式入侵。',
        '本赛季等级上限为 20，赛季等级从 1 开始。',
        '当前赛季装备仓库、穿戴与战斗存档全部从 0 开始。',
        '击败 Boss 可获得污染装备，净化后进入本赛季仓库。',
        '装备拥有佩戴等级要求，提升赛季等级后可穿戴更高阶装备。'
      ]
    }
  };
  let state = null, ready = false;
  async function kvGet(k){try{return (await window.dzmm.kv.get(k))?.value??null}catch(_){try{let r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(_){return null}}}
  async function kvPut(k,v){try{await window.dzmm.kv.put(k,v)}catch(_){try{localStorage.setItem(k,JSON.stringify(v))}catch(__){}}}
  function normalize(v){let s=v&&typeof v==='object'?v:{};s.currentSeason=CURRENT;s.started=s.started&&typeof s.started==='object'?s.started:{};s.seasons=s.seasons&&typeof s.seasons==='object'?s.seasons:{};return s}
  async function init(){if(ready)return state;state=normalize(await kvGet(KEY));ready=true;return state}
  function cfg(){return CONFIG[CURRENT]}
  function started(){return !!state?.started?.[CURRENT]}
  function season(){return state?.seasons?.[CURRENT]||{level:1,xp:0,totalXp:0}}
  function level(){return Math.min(cfg().levelCap,Math.max(1,Math.floor(season().level||1)))}
  function xp(){return Math.max(0,Math.floor(season().xp||0))}
  function cap(){return cfg().levelCap}
  function need(lv=level()){return lv>=cap()?0:Math.round(80+lv*lv*22+lv*38)}
  function key(base){return `${base}-season-${CURRENT}`}
  async function start(){await init();state.started[CURRENT]=true;state.seasons[CURRENT]={level:1,xp:0,totalXp:0,startedAt:Date.now()};await kvPut(KEY,state);return state.seasons[CURRENT]}
  async function save(){await kvPut(KEY,state)}
  async function addRunXp(run){await init();if(!started())return null;let cur=season(),gain=Math.max(10,Math.floor((run.kills||0)*1+(run.bossKills||0)*85+Math.floor((run.time||0)/10)*8+(run.win?500:0)+(run.endlessLayer||0)*180));cur.level=level();cur.xp=xp()+gain;cur.totalXp=(cur.totalXp||0)+gain;let ups=0;while(cur.level<cap()&&cur.xp>=need(cur.level)){cur.xp-=need(cur.level);cur.level++;ups++}state.seasons[CURRENT]=cur;await save();return {gain,level:cur.level,xp:cur.xp,next:need(cur.level),ups}}
  function introHtml(){let c=cfg();return `<h1 class="title">${c.introTitle}</h1><p class="sub">主题：${c.theme}</p><div class="seasonRules">${c.intro.map(x=>`<p>${x}</p>`).join('')}</div><p class="sub"><button id="seasonStartBtn" class="startBtn" type="button">开启${c.name}</button></p>`}
  return { CURRENT, CONFIG, init, started, start, cfg, season, level, xp, cap, need, key, addRunXp, introHtml };
})();
window.Season = window.GameModules.season;
