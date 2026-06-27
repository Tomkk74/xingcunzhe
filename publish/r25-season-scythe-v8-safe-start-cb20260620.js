window.GameModules = window.GameModules || {};
window.GameModules.season = (() => {
  const CURRENT = 1;
  const KEY = 'arcane-season-state-v2';
  const CONFIG = {
    1: {
      name: '第一赛季',
      theme: '深渊初醒',
      levelCap: 20,
      introTitle: '第一赛季：深渊初醒',
      promo: './assets/generated/season-1-promo.cbf7c517-cb20260618a.webp?v=20260627-cache-refresh-r25i',
      story: [
        '王城的第一口钟是在午夜自己响起来的。钟声落下时，地面裂开，紫黑色的火从井口、墓穴和旧矿道里一起冒出。',
        '第二天清晨，巡逻队只带回一副盔甲。盔甲还在动，里面却没有人，胸口嵌着一块会呼吸的深渊结晶。',
        '从那以后，遗迹里的剑会低声说话，霜原上的靴印会自己延伸，荒野的宝箱里爬出带血的王冠。每一件装备都更强，也更危险。',
        '你要从零开始，把这些诅咒一件件抢回来、净化、穿上，然后在深渊彻底醒来之前，把裂隙另一头的魔王拖出来。'
      ],
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
  async function kvGet(k){return await StorageSync.get(k)}
  async function kvPut(k,v){await StorageSync.put(k,v,'赛季')}
  function normalize(v){let s=v&&typeof v==='object'?v:{};s.currentSeason=CURRENT;s.started=s.started&&typeof s.started==='object'?s.started:{};s.seasons=s.seasons&&typeof s.seasons==='object'?s.seasons:{};return s}
  async function init(){if(ready)return state;state=normalize(await kvGet(KEY));ready=true;return state}
  async function reload(){ready=false;state=null;return await init()}
  function cfg(){return CONFIG[CURRENT]}
  function started(){return !!state?.started?.[CURRENT]}
  function season(){return state?.seasons?.[CURRENT]||{level:1,xp:0,totalXp:0}}
  function level(){return Math.min(cfg().levelCap,Math.max(1,Math.floor(season().level||1)))}
  function xp(){return Math.max(0,Math.floor(season().xp||0))}
  function cap(){return cfg().levelCap}
  function need(lv=level()){return lv>=cap()?0:Math.round(80+lv*lv*22+lv*38)}
  function key(base){return `${base}-season-${CURRENT}`}
  async function start(){await init();state.started[CURRENT]=true;let cur=state.seasons[CURRENT];if(cur&&typeof cur==='object'){cur.level=Math.min(cfg().levelCap,Math.max(1,Math.floor(Number(cur.level)||1)));cur.xp=Math.max(0,Math.floor(Number(cur.xp)||0));cur.totalXp=Math.max(0,Math.floor(Number(cur.totalXp)||0));cur.startedAt=cur.startedAt||Date.now()}else cur={level:1,xp:0,totalXp:0,startedAt:Date.now()};state.seasons[CURRENT]=cur;await kvPut(KEY,state);return cur}
  async function save(){await kvPut(KEY,state)}
  async function addRunXp(run){await init();if(!started())return null;let cur=season(),gain=Math.max(10,Math.floor((run.kills||0)*1+(run.bossKills||0)*85+Math.floor((run.time||0)/10)*8+(run.win?500:0)+(run.endlessLayer||0)*180));cur.level=level();cur.xp=xp()+gain;cur.totalXp=(cur.totalXp||0)+gain;let ups=0;while(cur.level<cap()&&cur.xp>=need(cur.level)){cur.xp-=need(cur.level);cur.level++;ups++}state.seasons[CURRENT]=cur;await save();return {gain,level:cur.level,xp:cur.xp,next:need(cur.level),ups}}
  async function grantLevel(target){await init();if(!started())await start();let cur=season(),old=level(),to=Math.min(cap(),Math.max(old,Math.floor(Number(target)||old)));cur.level=to;cur.xp=0;cur.totalXp=Math.max(cur.totalXp||0,0);state.seasons[CURRENT]=cur;await save();return{level:cur.level,ups:Math.max(0,to-old)}}
  function introHtml(){let c=cfg(),story=(c.story||[]).map((x,i)=>`<p class="seasonStoryLine" style="--i:${i}">${x}</p>`).join(''),rules=(c.intro||[]).map(x=>`<p>${x}</p>`).join(''),bg=c.promo?` style="--season-bg:url('${c.promo}')"`:'';return `<div class="seasonBg"${bg}></div><div class="seasonIntroHead"><h1 class="title">${c.introTitle}</h1><p class="sub">主题：${c.theme}</p></div><div class="seasonStoryBox"><b>赛季背景播放中</b>${story}</div><div class="seasonRules">${rules}</div><div class="seasonStartBar"><button id="seasonStartBtn" class="startBtn" type="button">开启${c.name}</button></div>`}
  return { CURRENT, CONFIG, init, reload, started, start, cfg, season, level, xp, cap, need, key, addRunXp, grantLevel, introHtml };
})();
window.Season = window.GameModules.season;
